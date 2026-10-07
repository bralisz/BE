-- Service-only cache and bounded durable jobs; no per-visitor content translation.
create schema if not exists private;
create extension if not exists pg_cron with schema pg_catalog;
create table if not exists public.ui_translation_cache (
  id text primary key, locale text not null check (locale in ('en-us','es','fr','it')),
  source text not null check (length(source) between 1 and 1800),
  translated text not null check (length(translated) between 1 and 12000),
  created_at timestamptz not null default now()
);
alter table public.ui_translation_cache enable row level security;
revoke all on public.ui_translation_cache from public, anon, authenticated;
grant select,insert,update on public.ui_translation_cache to service_role;
create index if not exists ui_translation_cache_expiry on public.ui_translation_cache(created_at);

create table if not exists private.translation_jobs (
  collection text not null, record_id text not null,
  locale text not null check(locale in ('en-us','es','fr','it')),
  attempts integer not null default 0, request_id bigint,
  next_attempt_at timestamptz not null default now(),
  queued_at timestamptz not null default now(),
  primary key(collection,record_id,locale)
);
alter table private.translation_jobs enable row level security;
revoke all on private.translation_jobs from public,anon,authenticated;
create index if not exists translation_jobs_due on private.translation_jobs(next_attempt_at) where attempts<5;

create or replace function private.merge_content_translation(p_collection text,p_id text,p_source jsonb,p_translations jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare changed integer;
begin
  if p_collection='settings' then
    update public.site_settings set data=jsonb_set(data,'{translations}',coalesce(data->'translations','{}'::jsonb)||p_translations,true)
      where id=p_id and (data-'translations')=p_source;
  else
    update public.content_items set data=jsonb_set(data,'{translations}',coalesce(data->'translations','{}'::jsonb)||p_translations,true)
      where id::text=p_id and collection=p_collection and (data-'translations')=p_source;
  end if;
  get diagnostics changed=row_count;
  return changed=1;
end; $$;
create or replace function public.merge_content_translation(p_collection text,p_id text,p_source jsonb,p_translations jsonb)
returns boolean language sql security invoker set search_path='' as $$
  select private.merge_content_translation(p_collection,p_id,p_source,p_translations);
$$;
revoke all on function private.merge_content_translation(text,text,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.merge_content_translation(text,text,jsonb,jsonb) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.merge_content_translation(text,text,jsonb,jsonb) to service_role;
grant execute on function public.merge_content_translation(text,text,jsonb,jsonb) to service_role;

create or replace function private.dispatch_betv_translations()
returns void language plpgsql security definer set search_path='' as $$
declare job record; response record; request bigint;
begin
  -- Cron and content writes cannot dispatch the same job concurrently.
  if not pg_catalog.pg_try_advisory_xact_lock(719243871) then return; end if;
  for job in select * from private.translation_jobs where request_id is not null for update skip locked loop
    select status_code into response from net._http_response where id=job.request_id;
    if found then
      if response.status_code=200 then
        delete from private.translation_jobs where collection=job.collection and record_id=job.record_id and locale=job.locale;
      else
        update private.translation_jobs set request_id=null,
          next_attempt_at=now()+make_interval(mins=>least(60,power(3,attempts)::integer))
          where collection=job.collection and record_id=job.record_id and locale=job.locale;
      end if;
    elsif job.next_attempt_at<now()-interval '3 minutes' then
      update private.translation_jobs set request_id=null,next_attempt_at=now()+interval '5 minutes'
        where collection=job.collection and record_id=job.record_id and locale=job.locale;
    end if;
  end loop;
  for job in select * from private.translation_jobs where request_id is null and attempts<5 and next_attempt_at<=now()
    order by next_attempt_at limit 4 for update skip locked loop
    select net.http_post(
      url:='https://cxkevnnxibhezvospkce.supabase.co/functions/v1/translate-content-record',
      headers:=jsonb_build_object('Content-Type','application/json'),
      body:=jsonb_build_object('collection',job.collection,'ids',jsonb_build_array(job.record_id),'locales',jsonb_build_array(job.locale)),
      timeout_milliseconds:=60000) into request;
    update private.translation_jobs set request_id=request,attempts=attempts+1,next_attempt_at=now()
      where collection=job.collection and record_id=job.record_id and locale=job.locale;
  end loop;
  delete from private.translation_jobs where queued_at<now()-interval '7 days';
end; $$;
revoke all on function private.dispatch_betv_translations() from public,anon,authenticated;

create or replace function private.enqueue_betv_translation()
returns trigger language plpgsql security definer set search_path='' as $$
declare coll text;
begin
  if tg_op='UPDATE' and (new.data-'translations') is not distinct from (old.data-'translations') then return new; end if;
  if tg_table_name='content_items' then
    coll:=new.collection;
    if coll not in ('contents','featured','gallery','movies','news','notifications','ongs','sections','series','videos') then return new; end if;
  elsif tg_table_name='site_settings' then
    coll:='settings';
    if new.id not in ('site','billie-eilish','ong') then return new; end if;
  else return new; end if;
  insert into private.translation_jobs(collection,record_id,locale)
    select coll,new.id::text,l from unnest(array['en-us','es','fr','it']) l
    on conflict(collection,record_id,locale) do update set attempts=0,request_id=null,next_attempt_at=now(),queued_at=now();
  return new;
exception when others then
  raise warning 'BETV translation enqueue failed: %',sqlerrm;
  return new;
end; $$;
revoke all on function private.enqueue_betv_translation() from public,anon,authenticated;

-- At most four new translation requests per minute, with five bounded attempts.
select cron.schedule('betv-translation-retries','* * * * *','select private.dispatch_betv_translations()');
select cron.schedule('betv-translation-cache-cleanup','17 3 * * *',
  $job$delete from public.ui_translation_cache where created_at<now()-interval '60 days' or id in
  (select id from public.ui_translation_cache order by created_at desc offset 10000)$job$);

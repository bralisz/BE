-- A single last-watched item per member. Private by RLS; owner controls public visibility.
create table if not exists public.profile_watch_activity(
 user_id uuid primary key references auth.users(id) on delete cascade,
 content_id text not null default '',
 title text not null default '',
 collection text not null default 'videos',
 image_url text not null default '',
 watched_at timestamptz,
 public_visible boolean not null default true
);
alter table public.profile_watch_activity enable row level security;
revoke all on public.profile_watch_activity from public,anon;
grant select,insert,update on public.profile_watch_activity to authenticated;
drop policy if exists "profile_activity_owner_select" on public.profile_watch_activity;
drop policy if exists "profile_activity_owner_insert" on public.profile_watch_activity;
drop policy if exists "profile_activity_owner_update" on public.profile_watch_activity;
create policy "profile_activity_owner_select" on public.profile_watch_activity for select to authenticated using (user_id=(select auth.uid()));
create policy "profile_activity_owner_insert" on public.profile_watch_activity for insert to authenticated with check (user_id=(select auth.uid()));
create policy "profile_activity_owner_update" on public.profile_watch_activity for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

create or replace function public.record_profile_watch(p_content_id text,p_title text,p_collection text,p_image_url text)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or length(btrim(coalesce(p_content_id,''))) not between 1 and 128
 or length(btrim(coalesce(p_title,''))) not between 1 and 180 then return false; end if;
 insert into public.profile_watch_activity(user_id,content_id,title,collection,image_url,watched_at)
 values(auth.uid(),left(btrim(p_content_id),128),left(btrim(p_title),180),
  case when p_collection in ('movies','series') then p_collection else 'videos' end,
  left(coalesce(p_image_url,''),2048),now())
 on conflict(user_id) do update set content_id=excluded.content_id,title=excluded.title,
 collection=excluded.collection,image_url=excluded.image_url,watched_at=excluded.watched_at;
 return true;
end;
$$;
revoke all on function public.record_profile_watch(text,text,text,text) from public,anon;
grant execute on function public.record_profile_watch(text,text,text,text) to authenticated;

create or replace function public.set_profile_watch_visibility(p_visible boolean)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or p_visible is null then return false; end if;
 insert into public.profile_watch_activity(user_id,public_visible) values(auth.uid(),p_visible)
 on conflict(user_id) do update set public_visible=excluded.public_visible;
 return true;
end;
$$;
revoke all on function public.set_profile_watch_visibility(boolean) from public,anon;
grant execute on function public.set_profile_watch_visibility(boolean) to authenticated;

-- Only explicitly public activity leaves RLS through this narrow public read function.
create or replace function public.get_public_last_watch(p_username text)
returns table(content_id text,title text,collection text,image_url text,watched_at timestamptz)
language sql stable security definer set search_path='' as $$
 select a.content_id,a.title,a.collection,a.image_url,a.watched_at
 from public.profiles p join public.profile_watch_activity a on a.user_id=p.id
 where lower(p.username::text)=lower(regexp_replace(btrim(coalesce(p_username,'')),'^@+',''))
  and p.banned is false and a.public_visible is true and a.watched_at is not null
 limit 1
$$;
revoke all on function public.get_public_last_watch(text) from public,anon,authenticated;
grant execute on function public.get_public_last_watch(text) to anon,authenticated;

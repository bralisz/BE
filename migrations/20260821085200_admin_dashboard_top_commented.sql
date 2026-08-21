create or replace function public.get_admin_dashboard_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (timezone('America/Sao_Paulo', now()))::date;
  v_weekly jsonb;
  v_today_users integer := 0;
  v_top_saved jsonb := '{}'::jsonb;
  v_top_viewed jsonb := '{}'::jsonb;
  v_top_commented jsonb := '{}'::jsonb;
  v_approved_donations integer := 0;
begin
  if v_uid is null or not exists(select 1 from public.profiles where id=v_uid and role='admin') then
    raise exception 'admin_only';
  end if;

  select count(*)::int into v_today_users
  from public.profiles
  where (timezone('America/Sao_Paulo', created_at))::date = v_today;

  select coalesce(
    jsonb_agg(jsonb_build_object('date', d.day_date, 'users', coalesce(a.cnt, 0)) order by d.day_date),
    '[]'::jsonb
  )
  into v_weekly
  from (select generate_series(v_today - 6, v_today, interval '1 day')::date as day_date) d
  left join (
    select (timezone('America/Sao_Paulo', created_at))::date as created_day, count(*)::int as cnt
    from public.profiles
    where (timezone('America/Sao_Paulo', created_at))::date between v_today - 6 and v_today
    group by (timezone('America/Sao_Paulo', created_at))::date
  ) a on a.created_day = d.day_date;

  select jsonb_build_object(
    'id', ci.content_id,
    'collection', ci.collection,
    'title', coalesce(nullif(trim(c.data->>'title'),''),'Sem título'),
    'imageUrl', coalesce(nullif(trim(c.data->>'imageUrl'),''), nullif(trim(c.data->>'bannerUrl'),''), ''),
    'value', ci.saves
  )
  into v_top_saved
  from public.content_insights ci
  join public.content_items c on c.id=ci.content_id
  where ci.collection in ('videos','movies','series')
  order by ci.saves desc, ci.views desc, ci.content_id
  limit 1;

  select jsonb_build_object(
    'id', ci.content_id,
    'collection', ci.collection,
    'title', coalesce(nullif(trim(c.data->>'title'),''),'Sem título'),
    'imageUrl', coalesce(nullif(trim(c.data->>'imageUrl'),''), nullif(trim(c.data->>'bannerUrl'),''), ''),
    'value', ci.views
  )
  into v_top_viewed
  from public.content_insights ci
  join public.content_items c on c.id=ci.content_id
  where ci.collection in ('videos','movies','series')
  order by ci.views desc, ci.saves desc, ci.content_id
  limit 1;

  select jsonb_build_object(
    'id', c.id,
    'collection', c.collection,
    'title', coalesce(nullif(trim(c.data->>'title'),''),'Sem título'),
    'imageUrl', coalesce(nullif(trim(c.data->>'imageUrl'),''), nullif(trim(c.data->>'bannerUrl'),''), ''),
    'value', count(vc.id)::int
  )
  into v_top_commented
  from public.video_comments vc
  join public.content_items c
    on c.collection = 'videos'
   and vc.video_key = 'videos:' || c.id::text
  group by c.id, c.collection, c.data
  order by count(vc.id) desc, c.id
  limit 1;

  select count(*)::int into v_approved_donations
  from public.donation_checkout_requests
  where status='paid';

  return jsonb_build_object(
    'todayUsers', v_today_users,
    'weeklyUsers', v_weekly,
    'topSaved', coalesce(v_top_saved,'{}'::jsonb),
    'topViewed', coalesce(v_top_viewed,'{}'::jsonb),
    'topCommented', coalesce(v_top_commented,'{}'::jsonb),
    'approvedDonations', v_approved_donations
  );
end;
$$;

grant execute on function public.get_admin_dashboard_metrics() to authenticated;

select pg_notify('pgrst', 'reload schema');

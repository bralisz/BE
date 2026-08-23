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
  v_top_saved jsonb;
  v_top_viewed jsonb;
  v_today_users integer := 0;
  v_total_views bigint := 0;
  v_total_saves bigint := 0;
begin
  if v_uid is null or not exists(select 1 from public.profiles where id=v_uid and role='admin') then
    raise exception 'admin_only';
  end if;

  select count(*)::int into v_today_users
  from public.user_daily_activity where visit_date=v_today;

  select coalesce(jsonb_agg(jsonb_build_object('date',d.day_date,'users',coalesce(a.cnt,0)) order by d.day_date),'[]'::jsonb)
  into v_weekly
  from (select generate_series(v_today - 6, v_today, interval '1 day')::date as day_date) d
  left join (
    select visit_date,count(*)::int cnt from public.user_daily_activity
    where visit_date between v_today-6 and v_today group by visit_date
  ) a on a.visit_date=d.day_date;

  select coalesce(jsonb_object_agg(collection,item),'{}'::jsonb) into v_top_saved
  from (
    select distinct on (ci.collection) ci.collection,
      jsonb_build_object('id',ci.content_id,'title',coalesce(nullif(trim(c.data->>'title'),''),'Sem título'),'value',ci.saves) item
    from public.content_insights ci join public.content_items c on c.id=ci.content_id
    where ci.collection in ('videos','movies','series')
    order by ci.collection,ci.saves desc,ci.views desc,ci.content_id
  ) ranked;

  select coalesce(jsonb_object_agg(collection,item),'{}'::jsonb) into v_top_viewed
  from (
    select distinct on (ci.collection) ci.collection,
      jsonb_build_object('id',ci.content_id,'title',coalesce(nullif(trim(c.data->>'title'),''),'Sem título'),'value',ci.views) item
    from public.content_insights ci join public.content_items c on c.id=ci.content_id
    where ci.collection in ('videos','movies','series')
    order by ci.collection,ci.views desc,ci.saves desc,ci.content_id
  ) ranked;

  select coalesce(sum(views),0),coalesce(sum(saves),0)
  into v_total_views,v_total_saves
  from public.content_insights where collection in ('videos','movies','series');

  return jsonb_build_object(
    'todayUsers',v_today_users,'weeklyUsers',v_weekly,'topSaved',v_top_saved,'topViewed',v_top_viewed,
    'insight',jsonb_build_object('label','Taxa de salvamento','value',
      case when v_total_views>0 then round((v_total_saves::numeric/v_total_views::numeric)*100,1) else 0 end,
      'views',v_total_views,'saves',v_total_saves)
  );
end;
$$;

grant execute on function public.get_admin_dashboard_metrics() to authenticated;

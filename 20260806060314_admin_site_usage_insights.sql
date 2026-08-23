begin;

create or replace function public.get_admin_site_usage_insights()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_result jsonb;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  with days as (
    select generate_series(v_today - 13, v_today, interval '1 day')::date as day
  ), daily_users as (
    select (p.created_at at time zone 'America/Sao_Paulo')::date as day, count(*)::integer as total
    from public.profiles p
    where p.created_at >= ((v_today - 13)::timestamp at time zone 'America/Sao_Paulo')
    group by 1
  ), growth as (
    select d.day, coalesce(u.total,0)::integer as total
    from days d left join daily_users u on u.day=d.day order by d.day
  ), content as (
    select item.id,item.collection,item.data,
      coalesce(insight.clicks,0)::bigint as clicks,
      coalesce(insight.views,0)::bigint as views,
      coalesce(insight.saves,0)::bigint as saves,
      coalesce(insight.updated_at,item.updated_at) as metric_updated_at
    from public.content_items item
    left join public.content_insights insight on insight.content_id=item.id
    where item.collection in ('videos','movies','series','shows','news')
      and coalesce(lower(item.data->>'active'),'true') <> 'false'
  ), top_viewed_video as (
    select jsonb_build_object('id',id,'collection',collection,'title',coalesce(nullif(data->>'title',''),'Vídeo sem título'),'imageUrl',coalesce(nullif(data->>'thumbnailUrl',''),nullif(data->>'imageUrl',''),nullif(data->>'bannerUrl',''),''),'value',views) payload
    from content where collection='videos' and views>0 order by views desc,metric_updated_at desc limit 1
  ), top_clicked as (
    select jsonb_build_object('id',id,'collection',collection,'title',coalesce(nullif(data->>'title',''),'Conteúdo sem título'),'imageUrl',coalesce(nullif(data->>'thumbnailUrl',''),nullif(data->>'imageUrl',''),nullif(data->>'bannerUrl',''),''),'value',clicks) payload
    from content where clicks>0 order by clicks desc,metric_updated_at desc limit 1
  ), top_saved as (
    select jsonb_build_object('id',id,'collection',collection,'title',coalesce(nullif(data->>'title',''),'Conteúdo sem título'),'imageUrl',coalesce(nullif(data->>'thumbnailUrl',''),nullif(data->>'imageUrl',''),nullif(data->>'bannerUrl',''),''),'value',saves) payload
    from content where saves>0 order by saves desc,metric_updated_at desc limit 1
  ), busiest_signup_day as (
    select jsonb_build_object('date',day::text,'count',total) payload from growth where total>0 order by total desc,day desc limit 1
  )
  select jsonb_build_object(
    'totalUsers',(select count(*) from public.profiles),
    'newUsersToday',(select count(*) from public.profiles p where (p.created_at at time zone 'America/Sao_Paulo')::date=v_today),
    'newUsersLast7Days',(select count(*) from public.profiles p where (p.created_at at time zone 'America/Sao_Paulo')::date>=v_today-6),
    'loggedInToday',(select count(*) from public.profiles p where p.last_login_at is not null and (p.last_login_at at time zone 'America/Sao_Paulo')::date=v_today),
    'userGrowth',coalesce((select jsonb_agg(jsonb_build_object('date',day::text,'label',to_char(day,'DD/MM'),'count',total) order by day) from growth),'[]'::jsonb),
    'busiestSignupDay',(select payload from busiest_signup_day),
    'topViewedVideo',(select payload from top_viewed_video),
    'topClickedContent',(select payload from top_clicked),
    'topSavedContent',(select payload from top_saved),
    'totalViews',(select coalesce(sum(views),0) from content),
    'totalClicks',(select coalesce(sum(clicks),0) from content),
    'totalSaves',(select coalesce(sum(saves),0) from content),
    'totalInteractions',(select coalesce(sum(views+clicks+saves),0) from content)
  ) into v_result;
  return coalesce(v_result,'{}'::jsonb);
end;
$$;

revoke all on function public.get_admin_site_usage_insights() from public, anon;
grant execute on function public.get_admin_site_usage_insights() to authenticated;
notify pgrst, 'reload schema';
commit;

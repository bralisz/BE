begin;

-- Atividade privada usada para "Continue assistindo" e para o ranking agregado.
-- A tabela não é exposta diretamente ao cliente; toda leitura/escrita passa pelas RPCs abaixo.
create schema if not exists private;

create table if not exists private.community_watch_daily (
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_id uuid not null references public.content_items(id) on delete cascade,
  watched_on date not null default current_date,
  watch_seconds integer not null default 0 check (watch_seconds between 0 and 21600),
  last_watched_at timestamptz not null default now(),
  primary key (user_id, content_id, watched_on)
);

create index if not exists community_watch_daily_recent_idx
  on private.community_watch_daily(user_id, last_watched_at desc);

create index if not exists community_watch_daily_rank_idx
  on private.community_watch_daily(watched_on, user_id);

alter table private.community_watch_daily enable row level security;
revoke all on table private.community_watch_daily from public, anon, authenticated;

create or replace function private.community_duration_seconds(p_duration text)
returns integer
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  v text := lower(trim(coalesce(p_duration, '')));
  v_hours integer := 0;
  v_minutes integer := 0;
  v_seconds integer := 0;
  v_parts text[];
  v_match text;
begin
  if v = '' then return 0; end if;

  if v ~ '^\d{1,3}:\d{2}(:\d{2})?$' then
    v_parts := string_to_array(v, ':');
    if array_length(v_parts, 1) = 3 then
      v_hours := greatest(0, coalesce(v_parts[1]::integer, 0));
      v_minutes := greatest(0, coalesce(v_parts[2]::integer, 0));
      v_seconds := greatest(0, coalesce(v_parts[3]::integer, 0));
    else
      v_minutes := greatest(0, coalesce(v_parts[1]::integer, 0));
      v_seconds := greatest(0, coalesce(v_parts[2]::integer, 0));
    end if;
  else
    v_match := substring(v from '([0-9]+)\s*h');
    if v_match is not null then v_hours := v_match::integer; end if;

    v_match := substring(v from '([0-9]+)\s*min');
    if v_match is not null then v_minutes := v_match::integer; end if;

    v_match := substring(v from '([0-9]+)\s*s(ec)?');
    if v_match is not null then v_seconds := v_match::integer; end if;
  end if;

  return least(21600, greatest(0, (v_hours * 3600) + (v_minutes * 60) + v_seconds));
exception when others then
  return 0;
end;
$$;

alter function private.community_duration_seconds(text) owner to postgres;
revoke all on function private.community_duration_seconds(text) from public, anon, authenticated;

create or replace function public.record_community_watch(p_content_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_duration integer := 0;
begin
  if v_user is null or p_content_id is null then
    return false;
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_user and p.banned is false
  ) then
    return false;
  end if;

  select private.community_duration_seconds(
    coalesce(
      nullif(item.data ->> 'duration', ''),
      nullif(item.data ->> 'videoDuration', ''),
      nullif(item.data ->> 'runtime', ''),
      ''
    )
  )
  into v_duration
  from public.content_items item
  where item.id = p_content_id
    and item.collection in ('videos', 'movies', 'series')
    and coalesce(lower(item.data ->> 'active'), 'true') <> 'false'
  limit 1;

  if not found then
    return false;
  end if;

  insert into private.community_watch_daily as activity (
    user_id,
    content_id,
    watched_on,
    watch_seconds,
    last_watched_at
  ) values (
    v_user,
    p_content_id,
    current_date,
    coalesce(v_duration, 0),
    now()
  )
  on conflict (user_id, content_id, watched_on) do update set
    watch_seconds = greatest(activity.watch_seconds, excluded.watch_seconds),
    last_watched_at = excluded.last_watched_at;

  return true;
end;
$$;

alter function public.record_community_watch(uuid) owner to postgres;
revoke all on function public.record_community_watch(uuid) from public, anon;
grant execute on function public.record_community_watch(uuid) to authenticated;

create or replace function public.get_community_overview(
  p_watch_period text default 'month',
  p_profile_limit integer default 5,
  p_watch_limit integer default 5
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_period text := case when lower(trim(coalesce(p_watch_period, 'month'))) = 'all' then 'all' else 'month' end;
  v_profile_limit integer := least(5000, greatest(5, coalesce(p_profile_limit, 5)));
  v_watch_limit integer := least(100, greatest(5, coalesce(p_watch_limit, 5)));
  v_result jsonb;
begin
  with eligible_profiles as (
    select
      p.id,
      p.display_name,
      p.username::text as username,
      p.avatar_url,
      p.created_at
    from public.profiles p
    left join public.user_preferences up on up.user_id = p.id
    where p.banned is false
      and nullif(trim(p.username::text), '') is not null
      and coalesce(up.data -> 'communityRankingsPublic', 'true'::jsonb) <> 'false'::jsonb
  ),
  profile_scores as (
    select
      ep.id,
      ep.display_name,
      ep.username,
      ep.avatar_url,
      ep.created_at,
      count(pl.profile_id)::bigint as likes
    from eligible_profiles ep
    left join public.profile_likes pl on pl.profile_id = ep.id
    group by ep.id, ep.display_name, ep.username, ep.avatar_url, ep.created_at
  ),
  profile_ranked as (
    select
      ps.*,
      row_number() over(order by ps.likes desc, ps.created_at asc, ps.id) as position
    from profile_scores ps
  ),
  watch_scores as (
    select
      ep.id,
      ep.display_name,
      ep.username,
      ep.avatar_url,
      coalesce(sum(activity.watch_seconds), 0)::bigint as watch_seconds
    from eligible_profiles ep
    join private.community_watch_daily activity on activity.user_id = ep.id
    where v_period = 'all'
       or date_trunc('month', activity.watched_on::timestamp) = date_trunc('month', current_date::timestamp)
    group by ep.id, ep.display_name, ep.username, ep.avatar_url
    having coalesce(sum(activity.watch_seconds), 0) > 0
  ),
  watch_ranked as (
    select
      ws.*,
      row_number() over(order by ws.watch_seconds desc, ws.username asc, ws.id) as position
    from watch_scores ws
  ),
  recent_content as (
    select
      activity.content_id,
      max(activity.last_watched_at) as last_watched_at
    from private.community_watch_daily activity
    where v_user is not null and activity.user_id = v_user
    group by activity.content_id
    order by max(activity.last_watched_at) desc
    limit 12
  ),
  favorite_content as (
    select
      item.id,
      item.collection,
      item.data,
      insight.saves,
      insight.updated_at
    from public.content_insights insight
    join public.content_items item on item.id = insight.content_id
    where insight.saves > 0
      and item.collection in ('videos', 'movies', 'series')
      and coalesce(lower(item.data ->> 'active'), 'true') <> 'false'
    order by insight.saves desc, insight.updated_at desc, item.id
    limit 12
  )
  select jsonb_build_object(
    'rankingVisibility', case
      when v_user is null then null
      else coalesce((select up.data -> 'communityRankingsPublic' from public.user_preferences up where up.user_id = v_user), 'true'::jsonb)
    end,
    'recent', coalesce((
      select jsonb_agg(jsonb_build_object(
        'contentId', item.id,
        'collection', item.collection,
        'data', item.data,
        'lastWatchedAt', rc.last_watched_at
      ) order by rc.last_watched_at desc)
      from recent_content rc
      join public.content_items item on item.id = rc.content_id
    ), '[]'::jsonb),
    'fanFavorites', coalesce((
      select jsonb_agg(jsonb_build_object(
        'contentId', fc.id,
        'collection', fc.collection,
        'data', fc.data,
        'saves', fc.saves
      ) order by fc.saves desc, fc.updated_at desc)
      from favorite_content fc
    ), '[]'::jsonb),
    'profileRanking', coalesce((
      select jsonb_agg(jsonb_build_object(
        'position', pr.position,
        'displayName', pr.display_name,
        'username', pr.username,
        'avatarUrl', pr.avatar_url,
        'likes', pr.likes
      ) order by pr.position)
      from profile_ranked pr
      where pr.position <= v_profile_limit
    ), '[]'::jsonb),
    'watchRanking', coalesce((
      select jsonb_agg(jsonb_build_object(
        'position', wr.position,
        'displayName', wr.display_name,
        'username', wr.username,
        'avatarUrl', wr.avatar_url,
        'watchSeconds', wr.watch_seconds
      ) order by wr.position)
      from watch_ranked wr
      where wr.position <= v_watch_limit
    ), '[]'::jsonb),
    'myWatchPosition', (
      select jsonb_build_object(
        'position', wr.position,
        'watchSeconds', wr.watch_seconds
      )
      from watch_ranked wr
      where wr.id = v_user
      limit 1
    )
  ) into v_result;

  return coalesce(v_result, '{}'::jsonb);
end;
$$;

alter function public.get_community_overview(text, integer, integer) owner to postgres;
revoke all on function public.get_community_overview(text, integer, integer) from public;
grant execute on function public.get_community_overview(text, integer, integer) to anon, authenticated;

comment on table private.community_watch_daily
is 'Private per-user/day content activity used only for recent-watch history and aggregate community watch rankings.';

comment on function public.record_community_watch(uuid)
is 'Records a signed-in user starting a content item. Uses catalog duration and stores no public per-video history.';

comment on function public.get_community_overview(text, integer, integer)
is 'Returns community aggregates and the signed-in user own recent-watch/position data while respecting ranking opt-out preferences.';

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

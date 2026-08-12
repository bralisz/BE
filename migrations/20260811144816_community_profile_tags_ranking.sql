begin;

create or replace function public.get_community_overview(
  p_watch_period text default 'month',
  p_profile_limit integer default 15,
  p_watch_limit integer default 15
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_profile_limit integer := least(30, greatest(5, coalesce(p_profile_limit, 15)));
  v_result jsonb;
begin
  with eligible_profiles as (
    select p.id, p.display_name, p.username::text as username, p.avatar_url, p.community_tag, p.created_at
    from public.profiles p
    left join public.user_preferences up on up.user_id = p.id
    where p.banned is false
      and nullif(trim(p.username::text), '') is not null
      and coalesce(up.data -> 'communityRankingsPublic', 'true'::jsonb) <> 'false'::jsonb
  ),
  profile_scores as (
    select ep.id, ep.display_name, ep.username, ep.avatar_url, ep.community_tag, ep.created_at,
      count(pl.profile_id)::bigint as likes
    from eligible_profiles ep
    left join public.profile_likes pl on pl.profile_id = ep.id
    group by ep.id, ep.display_name, ep.username, ep.avatar_url, ep.community_tag, ep.created_at
  ),
  profile_ranked as (
    select ps.*, row_number() over(order by ps.likes desc, ps.created_at asc, ps.id) as position
    from profile_scores ps
  ),
  recent_content as (
    select activity.content_id, max(activity.last_watched_at) as last_watched_at
    from private.community_watch_daily activity
    where v_user is not null and activity.user_id = v_user
    group by activity.content_id
    order by max(activity.last_watched_at) desc
    limit 12
  ),
  favorite_content as (
    select item.id, item.collection, item.data, insight.saves, insight.updated_at
    from public.content_insights insight
    join public.content_items item on item.id = insight.content_id
    where insight.saves > 0
      and item.collection in ('videos', 'movies', 'series')
      and coalesce(lower(item.data ->> 'active'), 'true') <> 'false'
    order by insight.saves desc, insight.updated_at desc, item.id
    limit 12
  )
  select jsonb_build_object(
    'rankingVisibility', case when v_user is null then null else coalesce((
      select up.data -> 'communityRankingsPublic' from public.user_preferences up where up.user_id = v_user
    ), 'true'::jsonb) end,
    'recent', coalesce((
      select jsonb_agg(jsonb_build_object(
        'contentId', item.id, 'collection', item.collection, 'data', item.data, 'lastWatchedAt', rc.last_watched_at
      ) order by rc.last_watched_at desc)
      from recent_content rc join public.content_items item on item.id = rc.content_id
    ), '[]'::jsonb),
    'fanFavorites', coalesce((
      select jsonb_agg(jsonb_build_object(
        'contentId', fc.id,
        'collection', fc.collection,
        'data', fc.data,
        'saves', fc.saves,
        'fanAvatars', coalesce((
          select jsonb_agg(jsonb_build_object(
            'displayName', face.display_name, 'username', face.username, 'avatarUrl', face.avatar_url
          ) order by face.updated_at desc)
          from (
            select p.display_name, p.username::text as username, p.avatar_url, state.updated_at
            from private.content_save_states state
            join public.profiles p on state.actor_key = p.id::text
            where state.content_id = fc.id
              and state.active is true
              and p.banned is false
              and nullif(trim(p.username::text), '') is not null
            order by state.updated_at desc, p.id
            limit 3
          ) face
        ), '[]'::jsonb)
      ) order by fc.saves desc, fc.updated_at desc)
      from favorite_content fc
    ), '[]'::jsonb),
    'profileRanking', coalesce((
      select jsonb_agg(jsonb_build_object(
        'position', pr.position,
        'displayName', pr.display_name,
        'username', pr.username,
        'avatarUrl', pr.avatar_url,
        'communityTag', pr.community_tag,
        'likes', pr.likes
      ) order by pr.position)
      from profile_ranked pr
      where pr.position <= v_profile_limit
    ), '[]'::jsonb),
    'myProfilePosition', (
      select jsonb_build_object(
        'position', pr.position,
        'displayName', pr.display_name,
        'username', pr.username,
        'avatarUrl', pr.avatar_url,
        'communityTag', pr.community_tag,
        'likes', pr.likes
      )
      from profile_ranked pr
      where pr.id = v_user
      limit 1
    )
  ) into v_result;

  return coalesce(v_result, '{}'::jsonb);
end;
$$;

alter function public.get_community_overview(text, integer, integer) owner to postgres;
revoke all on function public.get_community_overview(text, integer, integer) from public;
grant execute on function public.get_community_overview(text, integer, integer) to anon, authenticated;

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

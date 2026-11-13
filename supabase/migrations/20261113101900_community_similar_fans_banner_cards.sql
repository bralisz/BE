-- Upgrade the existing fan matching RPC for banner cards and shared content thumbnails.
-- This endpoint intentionally returns only the same public display and favorite
-- information exposed on fan profiles, never email or private preferences.
create or replace function public.get_similar_fans(p_limit integer default 8)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
with selected_items as (
  select
    prefs.user_id,
    lower(trim(coalesce(
      nullif(favorite.value->>'favoriteId', ''),
      case when nullif(favorite.value->>'collection', '') is not null then
        concat(favorite.value->>'collection', ':', coalesce(nullif(favorite.value->>'recordId', ''), favorite.value->>'itemId'))
      end
    ))) as match_key,
    left(trim(coalesce(favorite.value->>'title', '')), 100) as title,
    left(trim(coalesce(
      nullif(favorite.value->>'imageUrl', ''),
      nullif(favorite.value->>'bannerUrl', '')
    )), 1200) as image_url
  from public.user_preferences prefs
  cross join lateral pg_catalog.jsonb_array_elements(
    (case when pg_catalog.jsonb_typeof(prefs.data->'profileTopFavorites') = 'array' then prefs.data->'profileTopFavorites' else '[]'::jsonb end) ||
    (case when pg_catalog.jsonb_typeof(prefs.data->'profileLovedAlbums') = 'array' then prefs.data->'profileLovedAlbums' else '[]'::jsonb end) ||
    (case when pg_catalog.jsonb_typeof(prefs.data->'savedContents') = 'array' then prefs.data->'savedContents' else '[]'::jsonb end)
  ) as favorite(value)
  where pg_catalog.jsonb_typeof(favorite.value) = 'object'
),
my_items as (
  select match_key, max(title) as title, max(image_url) as image_url
  from selected_items
  where user_id = (select auth.uid()) and nullif(match_key, '') is not null
  group by match_key
),
eligible_fans as (
  select
    p.id,
    p.username::text as username,
    p.display_name,
    p.avatar_url,
    p.banner_url,
    p.created_at,
    case when coalesce(up.data->>'profileAvatarBorderColor', '') ~ '^#[0-9A-Fa-f]{6}$'
      then upper(up.data->>'profileAvatarBorderColor') else '' end as avatar_border_color
  from public.profiles p
  left join public.user_preferences up on up.user_id = p.id
  where p.banned is false
    and nullif(trim(p.username::text), '') is not null
    and p.id <> (select auth.uid())
    and coalesce(up.data->'communityRankingsPublic', 'true'::jsonb) <> 'false'::jsonb
),
shared as (
  select
    eligible.id,
    candidate.match_key,
    max(coalesce(nullif(candidate.title,''), nullif(mine.title,''), '')) as title,
    max(coalesce(nullif(candidate.image_url,''), nullif(mine.image_url,''), '')) as image_url
  from eligible_fans eligible
  join selected_items candidate on candidate.user_id = eligible.id
  join my_items mine on mine.match_key = candidate.match_key
  group by eligible.id, candidate.match_key
),
counts as (
  select id, count(*)::integer shared_count
  from shared
  group by id
),
top_fans as (
  select eligible.*, counts.shared_count
  from eligible_fans eligible
  join counts on counts.id = eligible.id
  order by counts.shared_count desc, eligible.created_at desc, eligible.username
  limit least(12, greatest(1, coalesce(p_limit,8)))
)
select case when (select auth.uid()) is null then
  '{"matches":[],"hasFavorites":false}'::jsonb
else jsonb_build_object(
  'hasFavorites', exists (select 1 from my_items),
  'matches', coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'username', fan.username,
        'displayName', fan.display_name,
        'avatarUrl', fan.avatar_url,
        'bannerUrl', fan.banner_url,
        'avatarBorderColor', fan.avatar_border_color,
        'sharedCount', fan.shared_count,
        'sharedContentsCount', fan.shared_count,
        'sharedContents', coalesce((
          select jsonb_agg(jsonb_build_object('title', thumb.title, 'imageUrl', thumb.image_url) order by thumb.title)
          from (
            select shared.title, shared.image_url
            from shared
            where shared.id = fan.id
              and nullif(shared.image_url, '') is not null
            order by shared.title, shared.match_key
            limit 3
          ) as thumb
        ), '[]'::jsonb)
      ) order by fan.shared_count desc, fan.created_at desc, fan.username
    ) from top_fans fan
  ), '[]'::jsonb)
) end;
$function$;
revoke all on function public.get_similar_fans(integer) from public, anon;
grant execute on function public.get_similar_fans(integer) to authenticated;
comment on function public.get_similar_fans(integer) is
  'Matches public fan favorite videos, albums and saved content; returns display banner/avatar and up to three thumbnail images without private user data.';

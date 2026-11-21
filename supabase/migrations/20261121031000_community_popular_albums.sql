-- Popular albums selected by fans in public profile preferences.
-- This RPC exposes only aggregate totals and up to three public avatar previews.
create or replace function public.get_community_popular_albums(p_limit integer default 12)
returns jsonb
language sql stable security definer
set search_path = ''
as $function$
with selected as materialized (
  select distinct
    p.id as fan_id,
    p.display_name,
    p.username::text as username,
    p.avatar_url,
    up.updated_at,
    album.id as album_id
  from public.user_preferences up
  join public.profiles p on p.id = up.user_id
  cross join lateral pg_catalog.jsonb_array_elements(
    case when pg_catalog.jsonb_typeof(up.data->'profileLovedAlbums') = 'array'
      then up.data->'profileLovedAlbums'
      else '[]'::jsonb end
  ) as favorite(item)
  join public.content_items album on album.id = case
    when coalesce(favorite.item->>'recordId','') ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$'
      then (favorite.item->>'recordId')::uuid
    else null end
  where p.banned is false
    and nullif(pg_catalog.trim(p.username::text),'') is not null
    and coalesce(up.data->'communityRankingsPublic','true'::jsonb) <> 'false'::jsonb
    and album.collection = 'news'
    and coalesce(pg_catalog.lower(album.data->>'active'),'true') <> 'false'
),
scores as (
  select album_id, count(*)::bigint as saves
  from selected group by album_id
),
top_albums as (
  select score.album_id, score.saves, album.data
  from scores score
  join public.content_items album on album.id = score.album_id
  order by score.saves desc,score.album_id
  limit least(18,greatest(1,coalesce(p_limit,12)))
)
select coalesce(pg_catalog.jsonb_agg(
  pg_catalog.jsonb_build_object(
    'recordId', top_albums.album_id,
    'title', pg_catalog.left(coalesce(top_albums.data->>'title','Álbum'),180),
    'imageUrl', coalesce(nullif(top_albums.data->>'imageUrl',''),
      nullif(top_albums.data->>'thumbnailUrl',''),
      nullif(top_albums.data->>'bannerUrl',''),''),
    'saves', top_albums.saves,
    'fanAvatars', coalesce((
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'displayName', face.display_name,
          'username', face.username,
          'avatarUrl', face.avatar_url
        ) order by face.updated_at desc,face.fan_id
      )
      from (
        select fan_id,display_name,username,avatar_url,updated_at
        from selected
        where album_id = top_albums.album_id
        order by updated_at desc,fan_id
        limit 3
      ) face
    ),'[]'::jsonb)
  ) order by top_albums.saves desc,top_albums.album_id
),'[]'::jsonb)
from top_albums;
$function$;

revoke all on function public.get_community_popular_albums(integer) from public,anon,authenticated;
grant execute on function public.get_community_popular_albums(integer) to anon,authenticated,service_role;
comment on function public.get_community_popular_albums(integer) is
  'Most selected public albums, counting each eligible fan only once per album; returns public avatar previews without private profile data.';
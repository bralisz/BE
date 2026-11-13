-- Recomendações de fãs calculadas apenas a partir dos favoritos públicos do perfil.
-- A autenticação é obrigatória; perfis banidos e usuários fora de rankings públicos não aparecem.
create or replace function public.get_similar_fans(p_limit integer default 8)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
with selections as (
  select
    prefs.user_id,
    lower(trim(coalesce(
      nullif(favorite.value->>'favoriteId', ''),
      case when coalesce(favorite.value->>'collection','') <> ''
        then concat(favorite.value->>'collection', ':', coalesce(nullif(favorite.value->>'recordId',''), favorite.value->>'itemId'))
      end
    ))) as match_key,
    left(trim(coalesce(favorite.value->>'title', '')), 90) as title
  from public.user_preferences prefs
  cross join lateral pg_catalog.jsonb_array_elements(
    (case when pg_catalog.jsonb_typeof(prefs.data->'profileTopFavorites') = 'array'
      then prefs.data->'profileTopFavorites' else '[]'::jsonb end) ||
    (case when pg_catalog.jsonb_typeof(prefs.data->'profileLovedAlbums') = 'array'
      then prefs.data->'profileLovedAlbums' else '[]'::jsonb end)
  ) as favorite(value)
),
mine as (
  select distinct match_key
  from selections
  where user_id = (select auth.uid())
    and nullif(match_key, '') is not null
),
candidates as (
  select
    profile.id,
    profile.username::text as username,
    profile.display_name,
    profile.avatar_url,
    profile.created_at,
    case
      when coalesce(prefs.data->>'profileAvatarBorderColor', '') ~ '^#[0-9A-Fa-f]{6}$'
      then upper(prefs.data->>'profileAvatarBorderColor')
      else ''
    end as avatar_border_color
  from public.profiles profile
  left join public.user_preferences prefs on prefs.user_id = profile.id
  where profile.banned is false
    and nullif(trim(profile.username::text), '') is not null
    and profile.id <> (select auth.uid())
    and coalesce(prefs.data->'communityRankingsPublic', 'true'::jsonb) <> 'false'::jsonb
),
scored as (
  select
    candidate.username,
    candidate.display_name,
    candidate.avatar_url,
    candidate.avatar_border_color,
    candidate.created_at,
    count(distinct chosen.match_key)::integer as shared_count,
    coalesce(jsonb_agg(distinct chosen.title) filter (where chosen.title <> ''), '[]'::jsonb) as shared_favorites
  from candidates candidate
  join selections chosen on chosen.user_id = candidate.id
  join mine on mine.match_key = chosen.match_key
  group by candidate.id, candidate.username, candidate.display_name, candidate.avatar_url,
    candidate.avatar_border_color, candidate.created_at
),
recommended as (
  select * from scored
  order by shared_count desc, created_at desc, username
  limit least(12, greatest(1, coalesce(p_limit, 8)))
)
select
  case when (select auth.uid()) is null then
    '{"matches":[],"hasFavorites":false}'::jsonb
  else
    jsonb_build_object(
      'hasFavorites', exists (select 1 from mine),
      'matches', coalesce(
        (select jsonb_agg(
          jsonb_build_object(
            'username', username,
            'displayName', display_name,
            'avatarUrl', avatar_url,
            'avatarBorderColor', avatar_border_color,
            'sharedCount', shared_count,
            'sharedFavorites', shared_favorites
          ) order by shared_count desc, created_at desc, username
        ) from recommended),
        '[]'::jsonb
      )
    )
  end;
$function$;

revoke all on function public.get_similar_fans(integer) from public, anon;
grant execute on function public.get_similar_fans(integer) to authenticated;
comment on function public.get_similar_fans(integer) is
  'Sugere fãs por favoritos públicos em comum; sem acesso ao email, às preferências privadas ou aos usuários que desativaram participação pública.';
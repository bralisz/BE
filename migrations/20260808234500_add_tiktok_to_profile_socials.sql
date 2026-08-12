-- Adiciona TikTok às redes sociais públicas do perfil.
drop function if exists public.get_public_profile(text);

create function public.get_public_profile(p_username text)
returns table (
  display_name text,
  username text,
  avatar_url text,
  banner_url text,
  created_at timestamptz,
  social_links jsonb,
  favorites jsonb,
  loved_albums jsonb,
  saved_contents jsonb
)
language sql
stable
security definer
set search_path = ''
rows 1
as $$
  with input as (
    select lower(trim(leading '@' from trim(coalesce(p_username, '')))) as username
  ), selected_profile as (
    select
      p.id,
      p.display_name,
      p.username::text as username,
      case when nullif(trim(coalesce(p.avatar_url, '')), '') is not null then p.avatar_url else '' end as avatar_url,
      case when nullif(trim(p.banner_id), '') is not null then p.banner_url else '' end as banner_url,
      p.created_at,
      coalesce(up.data, '{}'::jsonb) as preferences
    from public.profiles p
    cross join input i
    left join public.user_preferences up on up.user_id = p.id
    where p.username = i.username::public.citext
      and p.banned is false
      and length(i.username) between 3 and 20
      and i.username ~ '^[a-z0-9][a-z0-9._]{1,18}[a-z0-9]$'
    limit 1
  )
  select
    sp.display_name,
    sp.username,
    sp.avatar_url,
    sp.banner_url,
    sp.created_at,
    case
      when jsonb_typeof(sp.preferences -> 'profileSocialLinks') = 'object' then jsonb_build_object(
        'x', left(coalesce(sp.preferences #>> '{profileSocialLinks,x}', ''), 80),
        'instagram', left(coalesce(sp.preferences #>> '{profileSocialLinks,instagram}', ''), 100),
        'tiktok', left(coalesce(sp.preferences #>> '{profileSocialLinks,tiktok}', ''), 80)
      )
      else '{}'::jsonb
    end as social_links,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'itemId', left(coalesce(entry.item ->> 'itemId', ''), 120),
          'recordId', left(coalesce(entry.item ->> 'recordId', ''), 120),
          'favoriteId', left(coalesce(entry.item ->> 'favoriteId', ''), 180),
          'title', left(coalesce(entry.item ->> 'title', 'Conteúdo'), 160),
          'year', left(coalesce(entry.item ->> 'year', ''), 20),
          'duration', left(coalesce(entry.item ->> 'duration', ''), 40),
          'imageUrl', left(coalesce(entry.item ->> 'imageUrl', ''), 1200),
          'bannerUrl', left(coalesce(entry.item ->> 'bannerUrl', ''), 1200),
          'logoUrl', left(coalesce(entry.item ->> 'logoUrl', ''), 1200),
          'collection', left(coalesce(entry.item ->> 'collection', 'videos'), 20)
        ) order by entry.position
      )
      from jsonb_array_elements(
        case
          when jsonb_typeof(sp.preferences -> 'profileTopFavorites') = 'array'
            then sp.preferences -> 'profileTopFavorites'
          else '[]'::jsonb
        end
      ) with ordinality as entry(item, position)
      where entry.position <= 4 and jsonb_typeof(entry.item) = 'object'
    ), '[]'::jsonb) as favorites,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'itemId', left(coalesce(entry.item ->> 'itemId', ''), 120),
          'recordId', left(coalesce(entry.item ->> 'recordId', ''), 120),
          'favoriteId', left(coalesce(entry.item ->> 'favoriteId', ''), 180),
          'title', left(coalesce(entry.item ->> 'title', 'Álbum'), 160),
          'year', left(coalesce(entry.item ->> 'year', ''), 20),
          'duration', left(coalesce(entry.item ->> 'duration', ''), 40),
          'imageUrl', left(coalesce(entry.item ->> 'imageUrl', ''), 1200),
          'bannerUrl', left(coalesce(entry.item ->> 'bannerUrl', ''), 1200),
          'logoUrl', left(coalesce(entry.item ->> 'logoUrl', ''), 1200),
          'collection', left(coalesce(entry.item ->> 'collection', 'albums'), 20)
        ) order by entry.position
      )
      from jsonb_array_elements(
        case
          when jsonb_typeof(sp.preferences -> 'profileLovedAlbums') = 'array'
            then sp.preferences -> 'profileLovedAlbums'
          else '[]'::jsonb
        end
      ) with ordinality as entry(item, position)
      where entry.position <= 3 and jsonb_typeof(entry.item) = 'object'
    ), '[]'::jsonb) as loved_albums,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'itemId', left(coalesce(entry.item ->> 'itemId', ''), 120),
          'recordId', left(coalesce(entry.item ->> 'recordId', ''), 120),
          'favoriteId', left(coalesce(entry.item ->> 'favoriteId', ''), 180),
          'title', left(coalesce(entry.item ->> 'title', 'Conteúdo'), 160),
          'year', left(coalesce(entry.item ->> 'year', ''), 20),
          'duration', left(coalesce(entry.item ->> 'duration', ''), 40),
          'imageUrl', left(coalesce(entry.item ->> 'imageUrl', ''), 1200),
          'bannerUrl', left(coalesce(entry.item ->> 'bannerUrl', ''), 1200),
          'logoUrl', left(coalesce(entry.item ->> 'logoUrl', ''), 1200),
          'collection', left(coalesce(entry.item ->> 'collection', 'videos'), 20)
        ) order by entry.position
      )
      from jsonb_array_elements(
        case
          when jsonb_typeof(sp.preferences -> 'savedContents') = 'array'
            then sp.preferences -> 'savedContents'
          else '[]'::jsonb
        end
      ) with ordinality as entry(item, position)
      where entry.position <= 20 and jsonb_typeof(entry.item) = 'object'
    ), '[]'::jsonb) as saved_contents
  from selected_profile sp;
$$;

alter function public.get_public_profile(text) owner to postgres;
revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;

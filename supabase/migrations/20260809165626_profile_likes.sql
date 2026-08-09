-- Curtidas em perfis públicos.
create table if not exists public.profile_likes (
  liker_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint profile_likes_pkey primary key (liker_id, profile_id),
  constraint profile_likes_not_self check (liker_id <> profile_id)
);

create index if not exists profile_likes_profile_id_created_at_idx
  on public.profile_likes(profile_id, created_at desc);

alter table public.profile_likes enable row level security;
revoke all on table public.profile_likes from public, anon, authenticated;
grant all on table public.profile_likes to service_role;

create or replace function public.get_profile_like_state(p_username text)
returns table (
  liked boolean,
  like_count bigint
)
language sql
stable
security definer
set search_path = ''
rows 1
as $$
  with target as (
    select p.id
    from public.profiles p
    where p.username = lower(trim(leading '@' from trim(coalesce(p_username, ''))))::public.citext
      and p.banned is false
    limit 1
  )
  select
    case
      when auth.uid() is null then false
      else exists (
        select 1
        from public.profile_likes pl
        where pl.liker_id = auth.uid()
          and pl.profile_id = t.id
      )
    end as liked,
    (select count(*) from public.profile_likes pl where pl.profile_id = t.id)::bigint as like_count
  from target t;
$$;

alter function public.get_profile_like_state(text) owner to postgres;
revoke all on function public.get_profile_like_state(text) from public, anon;
grant execute on function public.get_profile_like_state(text) to authenticated;

create or replace function public.toggle_profile_like(p_username text)
returns table (
  liked boolean,
  like_count bigint
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_viewer uuid := auth.uid();
  v_target uuid;
  v_liked boolean := false;
begin
  if v_viewer is null then
    raise exception 'authentication_required';
  end if;

  select p.id
    into v_target
  from public.profiles p
  where p.username = lower(trim(leading '@' from trim(coalesce(p_username, ''))))::public.citext
    and p.banned is false
  limit 1;

  if v_target is null then
    raise exception 'profile_not_found';
  end if;

  if v_target = v_viewer then
    raise exception 'cannot_like_own_profile';
  end if;

  delete from public.profile_likes
  where liker_id = v_viewer
    and profile_id = v_target;

  if found then
    v_liked := false;
  else
    insert into public.profile_likes(liker_id, profile_id)
    values (v_viewer, v_target)
    on conflict (liker_id, profile_id) do nothing;
    v_liked := true;
  end if;

  return query
    select
      v_liked,
      (select count(*) from public.profile_likes pl where pl.profile_id = v_target)::bigint;
end;
$$;

alter function public.toggle_profile_like(text) owner to postgres;
revoke all on function public.toggle_profile_like(text) from public, anon;
grant execute on function public.toggle_profile_like(text) to authenticated;

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
  saved_contents jsonb,
  likes_received bigint
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
    ), '[]'::jsonb) as saved_contents,
    coalesce((select count(*) from public.profile_likes pl where pl.profile_id = sp.id), 0)::bigint as likes_received
  from selected_profile sp;
$$;

alter function public.get_public_profile(text) owner to postgres;
revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;

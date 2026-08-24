-- Follow-up kept in source control because production received the initial
-- migration before the fully-qualified citext cast was validated.
create or replace function public.get_public_profile(p_username text)
returns table(
  display_name text,
  username public.citext,
  avatar_url text,
  banner_url text,
  community_tag text,
  profile_color text,
  avatar_border_color text,
  created_at timestamptz,
  social_links jsonb,
  favorites jsonb,
  loved_albums jsonb,
  saved_contents jsonb,
  likes_received bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_normalized text := lower(trim(coalesce(p_username, '')));
begin
  if v_normalized = '' then return; end if;
  return query
  select
    p.display_name,
    p.username,
    p.avatar_url,
    p.banner_url,
    p.community_tag,
    case
      when coalesce(up.data ->> 'profileColor', '') ~ '^#[0-9A-Fa-f]{6}$'
        then upper(up.data ->> 'profileColor')
      else ''
    end,
    case
      when coalesce(up.data ->> 'profileAvatarBorderColor', '') ~ '^#[0-9A-Fa-f]{6}$'
        then upper(up.data ->> 'profileAvatarBorderColor')
      else ''
    end,
    p.created_at,
    coalesce(up.data -> 'profileSocialLinks', '{}'::jsonb),
    coalesce(up.data -> 'profileTopFavorites', '[]'::jsonb),
    coalesce(up.data -> 'profileLovedAlbums', '[]'::jsonb),
    coalesce(up.data -> 'savedContents', '[]'::jsonb),
    (select count(*)::bigint from public.profile_likes pl where pl.profile_id = p.id)
  from public.profiles p
  left join public.user_preferences up on up.user_id = p.id
  where p.username = v_normalized::public.citext
    and p.banned is false
    and nullif(trim(p.username::text), '') is not null
  limit 1;
end;
$$;

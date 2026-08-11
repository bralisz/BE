begin;

drop function if exists public.get_public_profile(text);

create function public.get_public_profile(p_username text)
returns table (
  display_name text,
  username citext,
  avatar_url text,
  banner_url text,
  community_tag text,
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
    p.created_at,
    coalesce(up.data -> 'profileSocialLinks', '{}'::jsonb),
    coalesce(up.data -> 'profileTopFavorites', '[]'::jsonb),
    coalesce(up.data -> 'profileLovedAlbums', '[]'::jsonb),
    coalesce(up.data -> 'savedContents', '[]'::jsonb),
    (select count(*)::bigint from public.profile_likes pl where pl.profile_id = p.id)
  from public.profiles p
  left join public.user_preferences up on up.user_id = p.id
  where lower(trim(p.username::text)) = v_normalized
    and p.banned is false
    and nullif(trim(p.username::text), '') is not null
  limit 1;
end;
$$;

alter function public.get_public_profile(text) owner to postgres;
revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

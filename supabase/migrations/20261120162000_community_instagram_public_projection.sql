-- Public projection for the community feed. The full settings table stays private.
create or replace function public.get_community_instagram_posts(p_cover text default null)
returns table (id text, permalink text, updated_at timestamptz, thumbnail text)
language sql stable security definer set search_path = ''
as $$
  select s.id, s.data->>'permalink', s.updated_at,
         case when p_cover is not null then s.data->>'thumbnail' end
  from public.site_settings as s
  where (s.id = 'community-instagram-reel' or s.id ~ '^ig-post-[A-Za-z0-9_-]+$')
    and (p_cover is null or s.id = p_cover)
    and s.data->>'permalink' ~ '^https://www[.]instagram[.]com/(reels?|p)/[A-Za-z0-9_-]+/$'
    and s.data->>'thumbnail' like 'data:image/jpeg;base64,%'
  order by s.created_at desc, s.id desc
  limit 30;
$$;
revoke all on function public.get_community_instagram_posts(text) from public;
grant execute on function public.get_community_instagram_posts(text) to anon, authenticated, service_role;

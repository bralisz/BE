-- Backfill one last-watched item per existing account from the original watch events.
-- This only reconstructs activity that was actually recorded. Users without
-- a watch event are deliberately left unchanged.
--
-- Match the site's numericPublicId (FNV-1a over the content's public ID / UUID)
-- so the restored profile card links to the same 8-digit detail route.
-- Keep each user's existing public_visible choice and never replace a newer watch.
with recursive
latest as (
  select distinct on (user_id) user_id, content_id, last_watched_at
  from private.community_watch_daily
  where last_watched_at is not null
  order by user_id, last_watched_at desc, content_id
),
catalog as (
  select distinct c.id, c.collection, c.data,
    coalesce(nullif(btrim(c.data->>'publicId'), ''), c.id::text) as route_key
  from latest l
  join public.content_items c on c.id = l.content_id
  where c.collection in ('movies', 'series', 'videos')
    and nullif(btrim(c.data->>'title'), '') is not null
),
hash_steps as (
  select id, route_key, 0 as pos, 2166136261::bigint as hash
  from catalog
  where route_key !~ '^[0-9]{8}$'
  union all
  select id, route_key, pos + 1,
    (((hash # ascii(substr(route_key, pos + 1, 1))::bigint) * 16777619) % 4294967296)::bigint
  from hash_steps
  where pos < length(route_key)
),
route_ids as (
  select id, (10000000 + (hash % 90000000))::text as public_id
  from hash_steps
  where pos = length(route_key)
  union all
  select id, route_key
  from catalog
  where route_key ~ '^[0-9]{8}$'
),
recovered as (
  select l.user_id,
    r.public_id as content_id,
    left(btrim(c.data->>'title'), 180) as title,
    c.collection,
    left(coalesce(
      nullif(c.data->>'imageUrl', ''),
      nullif(c.data->>'thumbnailUrl', ''),
      c.data->>'bannerUrl',
      ''
    ), 2048) as image_url,
    l.last_watched_at as watched_at
  from latest l
  join catalog c on c.id = l.content_id
  join route_ids r on r.id = c.id
)
insert into public.profile_watch_activity as existing (
  user_id, content_id, title, collection, image_url, watched_at
)
select user_id, content_id, title, collection, image_url, watched_at
from recovered
on conflict (user_id) do update
set content_id = excluded.content_id,
    title = excluded.title,
    collection = excluded.collection,
    image_url = excluded.image_url,
    watched_at = excluded.watched_at
where existing.watched_at is null
   or excluded.watched_at > existing.watched_at;

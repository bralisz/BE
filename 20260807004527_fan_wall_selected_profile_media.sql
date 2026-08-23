create or replace function public.get_public_fan_wall(
  p_limit integer default 48,
  p_offset integer default 0
)
returns table (
  entry_type text,
  entry_id text,
  display_name text,
  username text,
  avatar_url text,
  banner_url text,
  target_url text,
  supported_at timestamptz,
  sort_order integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with support_events as (
    select d.user_id, coalesce(d.paid_at, d.created_at) as supported_at
    from public.donation_checkout_requests d
    where d.status = 'paid'
    union all
    select f.user_id, f.featured_at as supported_at
    from public.featured_fans f
  ),
  latest_users as (
    select se.user_id, max(se.supported_at) as supported_at
    from support_events se
    group by se.user_id
  ),
  user_entries as (
    select
      'user'::text as entry_type,
      p.id::text as entry_id,
      coalesce(nullif(btrim(p.display_name), ''), 'Fã') as display_name,
      p.username::text as username,
      case when nullif(btrim(coalesce(p.avatar_id, '')), '') is not null then coalesce(p.avatar_url, '') else '' end as avatar_url,
      case when nullif(btrim(coalesce(p.banner_id, '')), '') is not null then coalesce(p.banner_url, '') else '' end as banner_url,
      '/@' || p.username::text as target_url,
      lu.supported_at,
      0::integer as sort_order
    from latest_users lu
    join public.profiles p on p.id = lu.user_id
    where p.banned = false
      and p.profile_complete = true
      and p.username is not null
      and btrim(p.username::text) <> ''
  ),
  community_entries as (
    select
      'community'::text as entry_type,
      c.id::text as entry_id,
      btrim(c.name) as display_name,
      null::text as username,
      c.icon_url as avatar_url,
      c.banner_url,
      c.link_url as target_url,
      c.updated_at as supported_at,
      c.sort_order
    from public.fan_communities c
    where c.active = true
  ),
  combined as (
    select * from user_entries
    union all
    select * from community_entries
  )
  select c.entry_type, c.entry_id, c.display_name, c.username, c.avatar_url, c.banner_url, c.target_url, c.supported_at, c.sort_order
  from combined c
  order by c.sort_order desc, c.supported_at desc, c.entry_type, c.entry_id
  limit greatest(1, least(coalesce(p_limit, 48), 100))
  offset greatest(0, least(coalesce(p_offset, 0), 1000000));
$$;

revoke all on function public.get_public_fan_wall(integer, integer) from public;
grant execute on function public.get_public_fan_wall(integer, integer) to anon, authenticated;

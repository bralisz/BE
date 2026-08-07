-- Permite escolher uma única tag para cada comunidade: Community ou Criador de conteúdo.

alter table public.fan_communities
  add column if not exists tag_type text not null default 'community';

update public.fan_communities
set tag_type = 'community'
where tag_type is null or tag_type not in ('community', 'creator');

alter table public.fan_communities
  drop constraint if exists fan_communities_tag_type_check;

alter table public.fan_communities
  add constraint fan_communities_tag_type_check
  check (tag_type in ('community', 'creator'));

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
      case when c.tag_type = 'creator' then 'creator' else 'community' end::text as entry_type,
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

create or replace function public.get_admin_fan_communities_v2()
returns table (
  id uuid,
  name text,
  icon_url text,
  banner_url text,
  link_url text,
  tag_type text,
  active boolean,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;
  return query
  select c.id, c.name, c.icon_url, c.banner_url, c.link_url, c.tag_type,
         c.active, c.sort_order, c.created_at, c.updated_at
  from public.fan_communities c
  order by c.sort_order desc, c.updated_at desc;
end;
$$;

create or replace function public.admin_upsert_fan_community_v2(
  p_id uuid,
  p_name text,
  p_icon_url text,
  p_banner_url text,
  p_link_url text,
  p_tag_type text default 'community',
  p_active boolean default true,
  p_sort_order integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := coalesce(p_id, gen_random_uuid());
  v_name text := btrim(coalesce(p_name, ''));
  v_icon text := btrim(coalesce(p_icon_url, ''));
  v_banner text := btrim(coalesce(p_banner_url, ''));
  v_link text := btrim(coalesce(p_link_url, ''));
  v_tag_type text := lower(btrim(coalesce(p_tag_type, 'community')));
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 120 then raise exception 'invalid community name' using errcode = '22023'; end if;
  if v_link !~* '^https://[^[:space:]]+$' then raise exception 'community link must use https' using errcode = '22023'; end if;
  if v_icon <> '' and v_icon !~* '^(https://[^[:space:]]+|/assets/[^[:space:]]+)$' then raise exception 'invalid community icon URL' using errcode = '22023'; end if;
  if v_banner <> '' and v_banner !~* '^(https://[^[:space:]]+|/assets/[^[:space:]]+)$' then raise exception 'invalid community banner URL' using errcode = '22023'; end if;
  if v_tag_type not in ('community', 'creator') then raise exception 'invalid community tag type' using errcode = '22023'; end if;

  insert into public.fan_communities (
    id, name, icon_url, banner_url, link_url, tag_type, active, sort_order, created_by, created_at, updated_at
  ) values (
    v_id, v_name, v_icon, v_banner, v_link, v_tag_type, coalesce(p_active, true),
    greatest(-10000, least(coalesce(p_sort_order, 0), 10000)), auth.uid(), now(), now()
  )
  on conflict (id) do update
    set name = excluded.name,
        icon_url = excluded.icon_url,
        banner_url = excluded.banner_url,
        link_url = excluded.link_url,
        tag_type = excluded.tag_type,
        active = excluded.active,
        sort_order = excluded.sort_order,
        updated_at = now();
  return v_id;
end;
$$;

revoke all on function public.get_admin_fan_communities_v2() from public, anon;
revoke all on function public.admin_upsert_fan_community_v2(uuid, text, text, text, text, text, boolean, integer) from public, anon;
grant execute on function public.get_admin_fan_communities_v2() to authenticated;
grant execute on function public.admin_upsert_fan_community_v2(uuid, text, text, text, text, text, boolean, integer) to authenticated;
revoke all on function public.get_public_fan_wall(integer, integer) from public;
grant execute on function public.get_public_fan_wall(integer, integer) to anon, authenticated;

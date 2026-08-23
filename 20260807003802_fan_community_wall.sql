-- Fãs destacados e comunidades exibidas na página pública /fãs.
-- O acesso direto às tabelas fica bloqueado; leitura e administração ocorrem por RPCs.

create table if not exists public.featured_fans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  featured_at timestamptz not null default now(),
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fan_communities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  icon_url text not null default '',
  banner_url text not null default '',
  link_url text not null,
  active boolean not null default true,
  sort_order integer not null default 0 check (sort_order between -10000 and 10000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.featured_fans enable row level security;
alter table public.fan_communities enable row level security;

revoke all on table public.featured_fans from public, anon, authenticated;
revoke all on table public.fan_communities from public, anon, authenticated;
grant all on table public.featured_fans to service_role;
grant all on table public.fan_communities to service_role;

create index if not exists featured_fans_featured_at_idx
  on public.featured_fans (featured_at desc);
create index if not exists fan_communities_public_order_idx
  on public.fan_communities (active, sort_order desc, updated_at desc);

-- Preserva o apoiador manual que já existia na função pública anterior.
insert into public.featured_fans (user_id, featured_at, added_by, created_at, updated_at)
select p.id, timestamptz '2026-08-06 07:29:00+00', null, now(), now()
from public.profiles p
where lower(btrim(p.username::text)) = 'bralis'
on conflict (user_id) do nothing;

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
    select
      d.user_id,
      coalesce(d.paid_at, d.created_at) as supported_at
    from public.donation_checkout_requests d
    where d.status = 'paid'

    union all

    select
      f.user_id,
      f.featured_at as supported_at
    from public.featured_fans f
  ),
  latest_users as (
    select
      se.user_id,
      max(se.supported_at) as supported_at
    from support_events se
    group by se.user_id
  ),
  user_entries as (
    select
      'user'::text as entry_type,
      p.id::text as entry_id,
      coalesce(nullif(btrim(p.display_name), ''), 'Fã') as display_name,
      p.username::text as username,
      coalesce(p.avatar_url, '') as avatar_url,
      coalesce(p.banner_url, '') as banner_url,
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
  select
    c.entry_type,
    c.entry_id,
    c.display_name,
    c.username,
    c.avatar_url,
    c.banner_url,
    c.target_url,
    c.supported_at,
    c.sort_order
  from combined c
  order by c.sort_order desc, c.supported_at desc, c.entry_type, c.entry_id
  limit greatest(1, least(coalesce(p_limit, 48), 100))
  offset greatest(0, least(coalesce(p_offset, 0), 1000000));
$$;

create or replace function public.get_admin_featured_fans()
returns table (user_id uuid, featured_at timestamptz)
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
  select f.user_id, f.featured_at
  from public.featured_fans f
  order by f.featured_at desc;
end;
$$;

create or replace function public.admin_set_featured_fan(
  p_user_id uuid,
  p_featured boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  select * into v_profile
  from public.profiles
  where id = p_user_id;

  if not found then
    raise exception 'user not found' using errcode = 'P0002';
  end if;

  if p_featured then
    if v_profile.banned or not v_profile.profile_complete or v_profile.username is null or btrim(v_profile.username::text) = '' then
      raise exception 'profile is not eligible for the fan page' using errcode = '22023';
    end if;

    insert into public.featured_fans (user_id, featured_at, added_by, created_at, updated_at)
    values (p_user_id, now(), auth.uid(), now(), now())
    on conflict (user_id) do update
      set featured_at = excluded.featured_at,
          added_by = excluded.added_by,
          updated_at = now();
  else
    delete from public.featured_fans where user_id = p_user_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'userId', p_user_id,
    'featured', coalesce(p_featured, false)
  );
end;
$$;

create or replace function public.get_admin_fan_communities()
returns table (
  id uuid,
  name text,
  icon_url text,
  banner_url text,
  link_url text,
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
  select
    c.id,
    c.name,
    c.icon_url,
    c.banner_url,
    c.link_url,
    c.active,
    c.sort_order,
    c.created_at,
    c.updated_at
  from public.fan_communities c
  order by c.sort_order desc, c.updated_at desc;
end;
$$;

create or replace function public.admin_upsert_fan_community(
  p_id uuid,
  p_name text,
  p_icon_url text,
  p_banner_url text,
  p_link_url text,
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
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if char_length(v_name) < 1 or char_length(v_name) > 120 then
    raise exception 'invalid community name' using errcode = '22023';
  end if;
  if v_link !~* '^https://[^[:space:]]+$' then
    raise exception 'community link must use https' using errcode = '22023';
  end if;
  if v_icon <> '' and v_icon !~* '^(https://[^[:space:]]+|/assets/[^[:space:]]+)$' then
    raise exception 'invalid community icon URL' using errcode = '22023';
  end if;
  if v_banner <> '' and v_banner !~* '^(https://[^[:space:]]+|/assets/[^[:space:]]+)$' then
    raise exception 'invalid community banner URL' using errcode = '22023';
  end if;

  insert into public.fan_communities (
    id, name, icon_url, banner_url, link_url, active, sort_order, created_by, created_at, updated_at
  ) values (
    v_id,
    v_name,
    v_icon,
    v_banner,
    v_link,
    coalesce(p_active, true),
    greatest(-10000, least(coalesce(p_sort_order, 0), 10000)),
    auth.uid(),
    now(),
    now()
  )
  on conflict (id) do update
    set name = excluded.name,
        icon_url = excluded.icon_url,
        banner_url = excluded.banner_url,
        link_url = excluded.link_url,
        active = excluded.active,
        sort_order = excluded.sort_order,
        updated_at = now();

  return v_id;
end;
$$;

create or replace function public.admin_delete_fan_community(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted boolean;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  delete from public.fan_communities where id = p_id;
  v_deleted := found;
  return v_deleted;
end;
$$;

revoke all on function public.get_public_fan_wall(integer, integer) from public;
revoke all on function public.get_admin_featured_fans() from public;
revoke all on function public.admin_set_featured_fan(uuid, boolean) from public;
revoke all on function public.get_admin_fan_communities() from public;
revoke all on function public.admin_upsert_fan_community(uuid, text, text, text, text, boolean, integer) from public;
revoke all on function public.admin_delete_fan_community(uuid) from public;

grant execute on function public.get_public_fan_wall(integer, integer) to anon, authenticated;
grant execute on function public.get_admin_featured_fans() to authenticated;
grant execute on function public.admin_set_featured_fan(uuid, boolean) to authenticated;
grant execute on function public.get_admin_fan_communities() to authenticated;
grant execute on function public.admin_upsert_fan_community(uuid, text, text, text, text, boolean, integer) to authenticated;
grant execute on function public.admin_delete_fan_community(uuid) to authenticated;

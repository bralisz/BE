create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'bralisofc@gmail.com';
$$;

grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  username citext unique,
  bio text not null default '',
  avatar_url text not null default '',
  avatar_id text not null default '',
  role text not null default 'member' check (role in ('member', 'admin')),
  profile_complete boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  collection text not null,
  data jsonb not null default '{}'::jsonb,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_collection_idx on public.content_items(collection);
create index if not exists content_items_order_idx on public.content_items(collection, ((data ->> 'order')::numeric));
create index if not exists content_items_active_idx on public.content_items(collection, (data ->> 'active'));

create table if not exists public.site_settings (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null default '',
  type text not null default '',
  item_id text not null default '',
  summary text not null default '',
  admin_uid uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    display_name,
    username,
    role,
    profile_complete
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', ''),
    nullif(lower(coalesce(new.raw_user_meta_data ->> 'username', '')), ''),
    case when lower(coalesce(new.email, '')) = 'bralisofc@gmail.com' then 'admin' else 'member' end,
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_logs enable row level security;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin"
on public.profiles for select
to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles insert own or admin" on public.profiles;
create policy "profiles insert own or admin"
on public.profiles for insert
to authenticated
with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles update own or admin" on public.profiles;
create policy "profiles update own or admin"
on public.profiles for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "content read published" on public.content_items;
create policy "content read published"
on public.content_items for select
to anon, authenticated
using (
  public.is_admin()
  or coalesce(lower(data ->> 'active'), 'true') = 'true'
);

drop policy if exists "content admin insert" on public.content_items;
create policy "content admin insert"
on public.content_items for insert
to authenticated
with check (public.is_admin());

drop policy if exists "content admin update" on public.content_items;
create policy "content admin update"
on public.content_items for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "content admin delete" on public.content_items;
create policy "content admin delete"
on public.content_items for delete
to authenticated
using (public.is_admin());

drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "settings admin insert" on public.site_settings;
create policy "settings admin insert"
on public.site_settings for insert
to authenticated
with check (public.is_admin());

drop policy if exists "settings admin update" on public.site_settings;
create policy "settings admin update"
on public.site_settings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "settings admin delete" on public.site_settings;
create policy "settings admin delete"
on public.site_settings for delete
to authenticated
using (public.is_admin());

drop policy if exists "logs admin read" on public.admin_logs;
create policy "logs admin read"
on public.admin_logs for select
to authenticated
using (public.is_admin());

drop policy if exists "logs admin insert" on public.admin_logs;
create policy "logs admin insert"
on public.admin_logs for insert
to authenticated
with check (public.is_admin());

grant select on public.content_items, public.site_settings to anon, authenticated;
grant insert, update, delete on public.content_items, public.site_settings to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.admin_logs to authenticated;

insert into public.site_settings (id, data)
values ('site', '{"siteName":"BE","primaryColor":"#2D7FF9"}'::jsonb)
on conflict (id) do nothing;

insert into public.content_items (id, collection, data)
values
('00000000-0000-0000-0000-000000000001', 'gallery', '{"title":"Avatar 1","category":"Padrão","imageUrl":"/assets/avatars/avatar-01.webp","order":1,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000002', 'gallery', '{"title":"Avatar 2","category":"Padrão","imageUrl":"/assets/avatars/avatar-02.webp","order":2,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000003', 'gallery', '{"title":"Avatar 3","category":"Padrão","imageUrl":"/assets/avatars/avatar-03.webp","order":3,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000004', 'gallery', '{"title":"Avatar 4","category":"Padrão","imageUrl":"/assets/avatars/avatar-04.webp","order":4,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000005', 'gallery', '{"title":"Avatar 5","category":"Padrão","imageUrl":"/assets/avatars/avatar-05.webp","order":5,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000006', 'gallery', '{"title":"Avatar 6","category":"Padrão","imageUrl":"/assets/avatars/avatar-06.webp","order":6,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000007', 'gallery', '{"title":"Avatar 7","category":"Padrão","imageUrl":"/assets/avatars/avatar-07.webp","order":7,"active":true}'::jsonb)
on conflict (id) do nothing;

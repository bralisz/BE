begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  username citext unique,
  bio text not null default '',
  avatar_url text not null default '',
  avatar_id text not null default '',
  banner_url text not null default '',
  banner_id text not null default '',
  banned boolean not null default false,
  banned_at timestamptz,
  ban_reason text not null default '',
  role text not null default 'member' check (role in ('member', 'admin')),
  profile_complete boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

alter table public.profiles add column if not exists banner_url text not null default '';
alter table public.profiles add column if not exists banner_id text not null default '';
alter table public.profiles add column if not exists banned boolean not null default false;
alter table public.profiles add column if not exists banned_at timestamptz;
alter table public.profiles add column if not exists ban_reason text not null default '';

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

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'bralisofc@gmail.com';
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- Permite ao primeiro passo da tela de acesso decidir entre entrar e criar
-- conta. O retorno contém somente verdadeiro/falso e nunca expõe dados do
-- usuário. Para reduzir abuso em produção, aplique rate limiting na borda.
create or replace function public.account_exists(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where lower(u.email) = lower(trim(coalesce(p_email, '')))
  );
$$;

alter function public.account_exists(text) owner to postgres;
revoke all on function public.account_exists(text) from public;
grant execute on function public.account_exists(text) to anon, authenticated;

-- Informa somente se um nome de usuário pode ser usado, sem expor perfis.
create or replace function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1
    from public.profiles p
    where p.username = nullif(lower(trim(coalesce(p_username, ''))), '')::public.citext
  );
$$;

alter function public.username_available(text) owner to postgres;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- Cria/atualiza o perfil sempre que um usuário nasce no Supabase Auth.
-- SECURITY DEFINER permite que o gatilho grave em public.profiles sem ser
-- bloqueado pela RLS, mas os valores usados vêm somente do próprio auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username public.citext;
begin
  v_username := nullif(lower(trim(coalesce(new.raw_user_meta_data ->> 'username', ''))), '')::public.citext;

  if v_username is not null and exists (
    select 1 from public.profiles p where p.username = v_username and p.id <> new.id
  ) then
    v_username := null;
  end if;

  insert into public.profiles as p (
    id, email, display_name, username, avatar_url, avatar_id, role,
    profile_complete, created_at, updated_at, last_login_at
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', ''),
    v_username,
    case when nullif(new.raw_user_meta_data ->> 'profile_avatar_id', '') is not null then coalesce(new.raw_user_meta_data ->> 'profile_avatar_url', '') else '' end,
    coalesce(new.raw_user_meta_data ->> 'profile_avatar_id', ''),
    case when lower(coalesce(new.email, '')) = 'bralisofc@gmail.com' then 'admin' else 'member' end,
    true,
    coalesce(new.created_at, now()),
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = case
      when nullif(excluded.display_name, '') is not null then excluded.display_name
      else p.display_name
    end,
    username = coalesce(excluded.username, p.username),
    avatar_url = case
      when nullif(new.raw_user_meta_data ->> 'profile_avatar_id', '') is not null
       and nullif(new.raw_user_meta_data ->> 'profile_avatar_url', '') is not null
        then new.raw_user_meta_data ->> 'profile_avatar_url'
      when nullif(p.avatar_id, '') is not null then p.avatar_url
      else ''
    end,
    avatar_id = case
      when nullif(new.raw_user_meta_data ->> 'profile_avatar_id', '') is not null
        then new.raw_user_meta_data ->> 'profile_avatar_id'
      when nullif(p.avatar_id, '') is not null then p.avatar_id
      else ''
    end,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute function public.handle_new_user();

-- Função segura usada pelo navegador depois do login. Ela sempre usa auth.uid()
-- e nunca aceita um id de usuário enviado pelo cliente.
create or replace function public.ensure_my_profile(
  p_display_name text default null,
  p_username text default null,
  p_avatar_url text default null
)
returns setof public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_username public.citext := nullif(lower(trim(coalesce(p_username, ''))), '')::public.citext;
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if v_username is not null and exists (
    select 1 from public.profiles p where p.username = v_username and p.id <> v_uid
  ) then
    -- Metadados antigos podem apontar para um @ que já foi usado por outra
    -- conta. Ignorar esse valor mantém o login funcionando sem sobrescrever o
    -- perfil existente.
    v_username := null;
  end if;

  return query
  insert into public.profiles as p (
    id, email, display_name, username, avatar_url, role,
    profile_complete, created_at, updated_at, last_login_at
  ) values (
    v_uid,
    v_email,
    coalesce(trim(p_display_name), ''),
    v_username,
    coalesce(trim(p_avatar_url), ''),
    case when v_email = 'bralisofc@gmail.com' then 'admin' else 'member' end,
    true,
    now(),
    now(),
    now()
  )
  on conflict (id) do update set
    email = v_email,
    display_name = case
      when nullif(trim(coalesce(p_display_name, '')), '') is not null then trim(p_display_name)
      else p.display_name
    end,
    username = coalesce(v_username, p.username),
    avatar_url = case
      when nullif(trim(coalesce(p.avatar_id, '')), '') is not null then p.avatar_url
      when nullif(trim(coalesce(p_avatar_url, '')), '') is not null then trim(p_avatar_url)
      else ''
    end,
    role = case when v_email = 'bralisofc@gmail.com' then 'admin' else 'member' end,
    profile_complete = true,
    updated_at = now(),
    last_login_at = now()
  returning *;
end;
$$;

alter function public.ensure_my_profile(text, text, text) owner to postgres;
revoke all on function public.ensure_my_profile(text, text, text) from public, anon;
grant execute on function public.ensure_my_profile(text, text, text) to authenticated;

-- Usuários que já existiam antes do gatilho recebem um perfil agora.
insert into public.profiles as p (
  id, email, display_name, avatar_url, avatar_id, role,
  profile_complete, created_at, updated_at
)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'display_name', u.raw_user_meta_data ->> 'full_name', ''),
  case when nullif(u.raw_user_meta_data ->> 'profile_avatar_id', '') is not null then coalesce(u.raw_user_meta_data ->> 'profile_avatar_url', '') else '' end,
  coalesce(u.raw_user_meta_data ->> 'profile_avatar_id', ''),
  case when lower(coalesce(u.email, '')) = 'bralisofc@gmail.com' then 'admin' else 'member' end,
  true,
  coalesce(u.created_at, now()),
  now()
from auth.users u
on conflict (id) do update set
  email = excluded.email,
  display_name = case
    when nullif(excluded.display_name, '') is not null then excluded.display_name
    else p.display_name
  end,
  avatar_url = case
    when nullif(p.avatar_id, '') is not null then p.avatar_url
    when nullif(excluded.avatar_id, '') is not null then excluded.avatar_url
    else ''
  end,
  avatar_id = case
    when nullif(p.avatar_id, '') is not null then p.avatar_id
    when nullif(excluded.avatar_id, '') is not null then excluded.avatar_id
    else ''
  end,
  role = excluded.role,
  updated_at = now();

alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_logs enable row level security;

-- Apaga qualquer política antiga/conflitante somente da tabela profiles.
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', p.policyname);
  end loop;
end $$;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id or public.is_admin());

drop policy if exists "profiles insert own or admin" on public.profiles;
create policy "profiles insert own or admin"
on public.profiles for insert
to authenticated
with check (
  public.is_admin()
  or (
    (select auth.uid()) = id
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and role = case
      when lower(coalesce(auth.jwt() ->> 'email', '')) = 'bralisofc@gmail.com' then 'admin'
      else 'member'
    end
  )
);

drop policy if exists "profiles update own or admin" on public.profiles;
create policy "profiles update own or admin"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id or public.is_admin())
with check (
  public.is_admin()
  or (
    (select auth.uid()) = id
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and role = case
      when lower(coalesce(auth.jwt() ->> 'email', '')) = 'bralisofc@gmail.com' then 'admin'
      else 'member'
    end
  )
);

-- Recria as políticas das outras tabelas sem alterar seus dados.
drop policy if exists "content read published" on public.content_items;
create policy "content read published"
on public.content_items for select
to anon, authenticated
using (public.is_admin() or coalesce(lower(data ->> 'active'), 'true') = 'true');

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

-- Permite que o usuário autenticado exclua somente a própria conta.
-- A remoção em auth.users apaga o perfil automaticamente por ON DELETE CASCADE.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Usuário não autenticado';
  end if;

  delete from auth.users where id = v_uid;
end;
$$;

alter function public.delete_my_account() owner to postgres;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.admin_logs to authenticated;

insert into public.site_settings (id, data)
values ('site', '{"siteName":"BE","primaryColor":"#2D7FF9"}'::jsonb)
on conflict (id) do nothing;

insert into public.content_items (id, collection, data)
values
('00000000-0000-0000-0000-000000000001', 'gallery', '{"title":"Avatar 1","category":"Padrão","imageUrl":"/assets/images/avatars/avatar-01.webp","order":1,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000002', 'gallery', '{"title":"Avatar 2","category":"Padrão","imageUrl":"/assets/images/avatars/avatar-02.webp","order":2,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000003', 'gallery', '{"title":"Avatar 3","category":"Padrão","imageUrl":"/assets/images/avatars/avatar-03.webp","order":3,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000004', 'gallery', '{"title":"Avatar 4","category":"Padrão","imageUrl":"/assets/images/avatars/avatar-04.webp","order":4,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000005', 'gallery', '{"title":"Avatar 5","category":"Padrão","imageUrl":"/assets/images/avatars/avatar-05.webp","order":5,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000006', 'gallery', '{"title":"Avatar 6","category":"Padrão","imageUrl":"/assets/images/avatars/avatar-06.webp","order":6,"active":true}'::jsonb),
('00000000-0000-0000-0000-000000000007', 'gallery', '{"title":"Avatar 7","category":"Padrão","imageUrl":"/assets/images/avatars/avatar-07.webp","order":7,"active":true}'::jsonb)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
commit;

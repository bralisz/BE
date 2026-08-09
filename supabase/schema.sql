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

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_likes (
  liker_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (liker_id, profile_id),
  constraint profile_likes_not_self check (liker_id <> profile_id)
);

create index if not exists profile_likes_profile_id_created_at_idx
  on public.profile_likes(profile_id, created_at desc);

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

update public.content_items
set data = jsonb_set(
  data,
  '{minimumDonationCents}',
  to_jsonb(
    case
      when coalesce(data ->> 'minimumDonationCents', '') ~ '^[0-9]+$'
       and (data ->> 'minimumDonationCents')::numeric between 100 and 100000000
        then (data ->> 'minimumDonationCents')::integer
      else 500
    end
  ),
  true
),
updated_at = now()
where collection = 'ongs';

update public.content_items
set data = jsonb_set(
  data,
  '{minimumDonationUsdCents}',
  to_jsonb(
    case
      when coalesce(data ->> 'minimumDonationUsdCents', '') ~ '^[0-9]+$'
       and (data ->> 'minimumDonationUsdCents')::numeric between 100 and 100000000
        then (data ->> 'minimumDonationUsdCents')::integer
      else 100
    end
  ),
  true
),
updated_at = now()
where collection = 'ongs';

alter table public.content_items
  drop constraint if exists content_items_ong_minimum_donation_check;
alter table public.content_items
  add constraint content_items_ong_minimum_donation_check
  check (
    collection <> 'ongs'
    or (
      data ? 'minimumDonationCents'
      and jsonb_typeof(data -> 'minimumDonationCents') = 'number'
      and coalesce(data ->> 'minimumDonationCents', '') ~ '^[0-9]+$'
      and (data ->> 'minimumDonationCents')::numeric between 100 and 100000000
      and data ? 'minimumDonationUsdCents'
      and jsonb_typeof(data -> 'minimumDonationUsdCents') = 'number'
      and coalesce(data ->> 'minimumDonationUsdCents', '') ~ '^[0-9]+$'
      and (data ->> 'minimumDonationUsdCents')::numeric between 100 and 100000000
    )
  );

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

create table if not exists public.donation_checkout_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ngo_id text not null,
  amount_cents integer not null check (amount_cents between 100 and 100000000),
  minimum_cents integer not null check (minimum_cents between 100 and 100000000),
  currency text not null default 'brl' check (currency in ('brl','usd')),
  stripe_session_id text unique,
  request_id uuid not null,
  user_display_name text not null default '',
  user_username text not null default '',
  ngo_title text not null default '',
  status text not null default 'checkout_created'
    check (status in ('checkout_created','paid','canceled','expired','payment_failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, request_id)
);

create index if not exists donation_checkout_requests_user_created_idx
  on public.donation_checkout_requests(user_id, created_at desc);
create index if not exists donation_checkout_requests_ngo_created_idx
  on public.donation_checkout_requests(ngo_id, created_at desc);
create index if not exists donation_checkout_requests_created_idx
  on public.donation_checkout_requests(created_at desc);
create index if not exists donation_checkout_requests_status_created_idx
  on public.donation_checkout_requests(status, created_at desc);
create index if not exists donation_checkout_requests_currency_created_idx
  on public.donation_checkout_requests(currency, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;


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
  v_avatar_url text;
  v_avatar_id text;
begin
  v_avatar_url := trim(coalesce(new.raw_user_meta_data ->> 'profile_avatar_url', ''));
  v_avatar_id := trim(coalesce(new.raw_user_meta_data ->> 'profile_avatar_id', ''));
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
    case when v_avatar_url <> '' then v_avatar_url else '' end,
    case when v_avatar_url <> '' then coalesce(nullif(v_avatar_id, ''), 'saved-selection') else '' end,
    case when lower(coalesce(new.raw_app_meta_data ->> 'role', '')) = 'admin' then 'admin' else 'member' end,
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
      when v_avatar_url <> '' then v_avatar_url
      when nullif(trim(coalesce(p.avatar_url, '')), '') is not null then p.avatar_url
      else ''
    end,
    avatar_id = case
      when v_avatar_url <> '' then coalesce(nullif(v_avatar_id, ''), 'saved-selection')
      when nullif(trim(coalesce(p.avatar_id, '')), '') is not null then p.avatar_id
      when nullif(trim(coalesce(p.avatar_url, '')), '') is not null then 'saved-selection'
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
  v_metadata_avatar_url text := '';
  v_metadata_avatar_id text := '';
  v_avatar_url text := '';
  v_avatar_id text := '';
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select
    trim(coalesce(u.raw_user_meta_data ->> 'profile_avatar_url', '')),
    trim(coalesce(u.raw_user_meta_data ->> 'profile_avatar_id', ''))
  into v_metadata_avatar_url, v_metadata_avatar_id
  from auth.users as u
  where u.id = v_uid;

  v_avatar_url := coalesce(nullif(trim(coalesce(p_avatar_url, '')), ''), nullif(v_metadata_avatar_url, ''), '');
  v_avatar_id := case
    when v_avatar_url <> '' then coalesce(nullif(v_metadata_avatar_id, ''), 'saved-selection')
    else ''
  end;

  if v_username is not null and exists (
    select 1 from public.profiles p where p.username = v_username and p.id <> v_uid
  ) then
    v_username := null;
  end if;

  return query
  insert into public.profiles as p (
    id, email, display_name, username, avatar_url, avatar_id, role,
    profile_complete, created_at, updated_at, last_login_at
  ) values (
    v_uid,
    v_email,
    coalesce(trim(p_display_name), ''),
    v_username,
    v_avatar_url,
    v_avatar_id,
    case when lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin' then 'admin' else 'member' end,
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
      when nullif(trim(coalesce(p.avatar_url, '')), '') is not null then p.avatar_url
      when v_avatar_url <> '' then v_avatar_url
      else ''
    end,
    avatar_id = case
      when nullif(trim(coalesce(p.avatar_id, '')), '') is not null then p.avatar_id
      when nullif(trim(coalesce(p.avatar_url, '')), '') is not null then 'saved-selection'
      when v_avatar_url <> '' then v_avatar_id
      else ''
    end,
    role = case when lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin' then 'admin' else 'member' end,
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
  case when lower(coalesce(u.raw_app_meta_data ->> 'role', '')) = 'admin' then 'admin' else 'member' end,
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
    when nullif(trim(coalesce(p.avatar_url, '')), '') is not null then p.avatar_url
    when nullif(excluded.avatar_id, '') is not null then excluded.avatar_url
    else ''
  end,
  avatar_id = case
    when nullif(p.avatar_id, '') is not null then p.avatar_id
    when nullif(trim(coalesce(p.avatar_url, '')), '') is not null then 'saved-selection'
    when nullif(excluded.avatar_id, '') is not null then excluded.avatar_id
    else ''
  end,
  role = excluded.role,
  updated_at = now();

-- Repara instalações atualizadas nas quais a escolha do avatar ficou sem id.
update public.profiles as p
set
  avatar_url = trim(u.raw_user_meta_data ->> 'profile_avatar_url'),
  avatar_id = coalesce(nullif(trim(u.raw_user_meta_data ->> 'profile_avatar_id'), ''), 'saved-selection'),
  updated_at = now()
from auth.users as u
where u.id = p.id
  and nullif(trim(coalesce(p.avatar_url, '')), '') is null
  and nullif(trim(coalesce(u.raw_user_meta_data ->> 'profile_avatar_url', '')), '') is not null;

update public.profiles as p
set
  avatar_id = coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'profile_avatar_id'), ''),
    (
      select ci.id::text
      from public.content_items as ci
      where ci.collection = 'gallery'
        and nullif(trim(coalesce(ci.data ->> 'imageUrl', '')), '') = trim(p.avatar_url)
      limit 1
    ),
    'saved-selection'
  ),
  updated_at = now()
from auth.users as u
where u.id = p.id
  and nullif(trim(coalesce(p.avatar_url, '')), '') is not null
  and nullif(trim(coalesce(p.avatar_id, '')), '') is null;

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

-- Retorna somente os campos que fazem parte do perfil público. A função não
-- expõe e-mail, UUID, papel da conta, estado de moderação, datas de login ou o
-- restante das preferências sincronizadas.
create or replace function public.get_public_profile(p_username text)
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

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.profile_likes enable row level security;
alter table public.content_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_logs enable row level security;
alter table public.donation_checkout_requests enable row level security;
revoke all on table public.profile_likes from public, anon, authenticated;
grant all on table public.profile_likes to service_role;

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
      when lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin' then 'admin'
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
      when lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin' then 'admin'
      else 'member'
    end
  )
);

-- Cada usuário acessa somente suas próprias preferências sincronizadas.
drop policy if exists "user preferences read own" on public.user_preferences;
create policy "user preferences read own"
on public.user_preferences for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user preferences insert own" on public.user_preferences;
create policy "user preferences insert own"
on public.user_preferences for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user preferences update own" on public.user_preferences;
create policy "user preferences update own"
on public.user_preferences for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "user preferences delete own" on public.user_preferences;
create policy "user preferences delete own"
on public.user_preferences for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Recria as políticas das outras tabelas sem alterar seus dados.
drop policy if exists "content read published" on public.content_items;
drop policy if exists "content admin read" on public.content_items;
create policy "content admin read"
on public.content_items for select
to authenticated
using (public.is_admin());

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
drop policy if exists "settings admin read" on public.site_settings;
create policy "settings admin read"
on public.site_settings for select
to authenticated
using (public.is_admin());

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

revoke select on public.content_items, public.site_settings from anon;
create or replace function public.get_public_site_setting(p_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case s.id
    when 'site' then jsonb_strip_nulls(jsonb_build_object(
      'siteName', s.data -> 'siteName',
      'description', s.data -> 'description',
      'primaryColor', s.data -> 'primaryColor',
      'footerText', s.data -> 'footerText',
      'instagram', s.data -> 'instagram',
      'xUrl', s.data -> 'xUrl',
      'youtube', s.data -> 'youtube',
      'website', s.data -> 'website',
      'discordUrl', s.data -> 'discordUrl',
      'shareImage', s.data -> 'shareImage',
      'updateReleaseEnabled', s.data -> 'updateReleaseEnabled',
      'releasedDeploymentVersion', s.data -> 'releasedDeploymentVersion',
      'translations', s.data -> 'translations'
    ))
    when 'ong' then jsonb_strip_nulls(jsonb_build_object(
      'bannerUrl', s.data -> 'bannerUrl'
    ))
    when 'billie-eilish' then jsonb_strip_nulls(jsonb_build_object(
      'sourceMode', s.data -> 'sourceMode',
      'title', s.data -> 'title',
      'kicker', s.data -> 'kicker',
      'portraitUrl', s.data -> 'portraitUrl',
      'bannerUrl', s.data -> 'bannerUrl',
      'manualBio', s.data -> 'manualBio',
      'includeReferences', s.data -> 'includeReferences',
      'instagram', s.data -> 'instagram',
      'xUrl', s.data -> 'xUrl',
      'youtube', s.data -> 'youtube',
      'spotify', s.data -> 'spotify',
      'website', s.data -> 'website',
      'translations', s.data -> 'translations'
    ))
    else null
  end
  from public.site_settings s
  where s.id = p_id
    and s.id in ('site', 'billie-eilish', 'ong')
  limit 1;
$$;

revoke all on function public.get_public_site_setting(text) from public;
grant execute on function public.get_public_site_setting(text) to anon, authenticated;

-- O catálogo público passa por uma função com lista explícita de campos.
create or replace function public.get_public_content_items(p_collection text, p_id text default null)
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', c.id::text,
    'data', jsonb_strip_nulls(jsonb_build_object(
      'active', c.data -> 'active',
      'bannerUrl', c.data -> 'bannerUrl',
      'category', c.data -> 'category',
      'contentCollection', c.data -> 'contentCollection',
      'contentId', c.data -> 'contentId',
      'contentUrl', c.data -> 'contentUrl',
      'description', c.data -> 'description',
      'duration', c.data -> 'duration',
      'imageUrl', c.data -> 'imageUrl',
      'itemLimit', c.data -> 'itemLimit',
      'itemType', c.data -> 'itemType',
      'link', c.data -> 'link',
      'logoUrl', c.data -> 'logoUrl',
      'mediaType', c.data -> 'mediaType',
      'minimumDonationCents', case when c.collection = 'ongs' then c.data -> 'minimumDonationCents' else null end,
      'order', c.data -> 'order',
      'publicId', c.data -> 'publicId',
      'runtime', c.data -> 'runtime',
      'sectionId', c.data -> 'sectionId',
      'sectionName', c.data -> 'sectionName',
      'slug', c.data -> 'slug',
      'sourceCollection', c.data -> 'sourceCollection',
      'thumbnailUrl', c.data -> 'thumbnailUrl',
      'title', c.data -> 'title',
      'translations', c.data -> 'translations',
      'type', c.data -> 'type',
      'videoDuration', c.data -> 'videoDuration',
      'videoId', c.data -> 'videoId',
      'videoUrl', c.data -> 'videoUrl',
      'year', c.data -> 'year'
    )),
    'created_at', c.created_at,
    'updated_at', c.updated_at
  )
  from public.content_items c
  where c.collection = lower(trim(p_collection))
    and c.collection in ('contents','featured','gallery','movies','notifications','ongs','sections','series','videos')
    and coalesce(lower(c.data ->> 'active'), 'true') = 'true'
    and (p_id is null or c.id::text = p_id)
  order by
    case when coalesce(c.data ->> 'order', '') ~ '^-?[0-9]+(?:\.[0-9]+)?$' then (c.data ->> 'order')::numeric else 0 end,
    c.created_at;
$$;

revoke all on function public.get_public_content_items(text, text) from public;
grant execute on function public.get_public_content_items(text, text) to anon, authenticated;

update public.content_items
set data = data - 'createdBy' - 'updatedBy' - 'adminEmail' - 'email',
    created_by = null,
    updated_by = null
where data ?| array['createdBy','updatedBy','adminEmail','email']
   or created_by is not null
   or updated_by is not null;

update public.site_settings
set data = data - 'createdBy' - 'updatedBy' - 'adminEmail' - 'email'
where data ?| array['createdBy','updatedBy','adminEmail','email'];

grant select on public.content_items, public.site_settings to authenticated;
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
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert on public.admin_logs to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles') then
    alter publication supabase_realtime add table public.profiles;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_preferences') then
    alter publication supabase_realtime add table public.user_preferences;
  end if;
end $$;

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



-- Apoiadores públicos: somente usuários com doação confirmada, sem valores ou dados privados.
create or replace function public.get_public_donation_supporters(
  p_limit integer default 48,
  p_offset integer default 0
)
returns table (
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  banner_url text,
  supported_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with manual_supporters(username, supported_at) as (
    values ('bralis'::text, timestamptz '2026-08-06 07:29:00+00')
  ),
  support_events as (
    select
      d.user_id,
      coalesce(d.paid_at, d.created_at) as supported_at
    from public.donation_checkout_requests d
    where d.status = 'paid'

    union all

    select
      p.id as user_id,
      ms.supported_at
    from manual_supporters ms
    join public.profiles p
      on lower(trim(p.username::text)) = lower(ms.username)
  ),
  latest_support as (
    select
      se.user_id,
      max(se.supported_at) as supported_at
    from support_events se
    group by se.user_id
  )
  select
    p.id as user_id,
    coalesce(nullif(trim(p.display_name), ''), 'Apoiador') as display_name,
    p.username::text as username,
    p.avatar_url,
    p.banner_url,
    ls.supported_at
  from latest_support ls
  join public.profiles p on p.id = ls.user_id
  where p.banned = false
    and p.profile_complete = true
    and p.username is not null
    and trim(p.username::text) <> ''
  order by ls.supported_at desc, p.id
  limit greatest(1, least(coalesce(p_limit, 48), 100))
  offset greatest(0, least(coalesce(p_offset, 0), 1000000));
$$;

revoke all on function public.get_public_donation_supporters(integer, integer) from public;
grant execute on function public.get_public_donation_supporters(integer, integer) to anon, authenticated;


notify pgrst, 'reload schema';
revoke all on table public.donation_checkout_requests from public, anon, authenticated;

commit;

-- Scale concurrent users: private Broadcast per account instead of Postgres Changes.
drop policy if exists "users receive own sync broadcasts" on realtime.messages;
create policy "users receive own sync broadcasts"
on realtime.messages for select to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and (select realtime.topic()) = ('user-sync:' || (select auth.uid())::text)
);

create or replace function private.broadcast_profile_sync()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid := coalesce(new.id, old.id);
begin
  perform realtime.broadcast_changes('user-sync:' || v_user_id::text, tg_op, tg_op, tg_table_name, tg_table_schema, new, old);
  return null;
end;
$$;
revoke all on function private.broadcast_profile_sync() from public, anon, authenticated;

create or replace function private.broadcast_user_preferences_sync()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid := coalesce(new.user_id, old.user_id);
begin
  perform realtime.broadcast_changes('user-sync:' || v_user_id::text, tg_op, tg_op, tg_table_name, tg_table_schema, new, old);
  return null;
end;
$$;
revoke all on function private.broadcast_user_preferences_sync() from public, anon, authenticated;

drop trigger if exists broadcast_profile_sync_trigger on public.profiles;
create trigger broadcast_profile_sync_trigger after insert or update or delete on public.profiles
for each row execute function private.broadcast_profile_sync();

drop trigger if exists broadcast_user_preferences_sync_trigger on public.user_preferences;
create trigger broadcast_user_preferences_sync_trigger after insert or update or delete on public.user_preferences
for each row execute function private.broadcast_user_preferences_sync();


-- Histórico privado de checkouts e insights de apoio para administradores.
alter table public.donation_checkout_requests
  add column if not exists user_display_name text not null default '',
  add column if not exists user_username text not null default '',
  add column if not exists ngo_title text not null default '',
  add column if not exists status text not null default 'checkout_created',
  add column if not exists paid_at timestamptz;

update public.donation_checkout_requests d
set
  user_display_name = coalesce(
    nullif(d.user_display_name, ''),
    (select nullif(p.display_name, '') from public.profiles p where p.id = d.user_id),
    'Usuário'
  ),
  user_username = coalesce(
    nullif(d.user_username, ''),
    (select p.username::text from public.profiles p where p.id = d.user_id),
    ''
  ),
  ngo_title = coalesce(
    nullif(d.ngo_title, ''),
    (
      select nullif(c.data ->> 'title', '')
      from public.content_items c
      where c.collection = 'ongs'
        and c.id::text = d.ngo_id
      limit 1
    ),
    'ONG'
  )
where d.user_display_name = ''
   or d.user_username = ''
   or d.ngo_title = '';

alter table public.donation_checkout_requests
  drop constraint if exists donation_checkout_requests_status_check;

alter table public.donation_checkout_requests
  add constraint donation_checkout_requests_status_check
  check (status in ('checkout_created','paid','canceled','expired','payment_failed'));

create index if not exists donation_checkout_requests_created_idx
  on public.donation_checkout_requests(created_at desc);
create index if not exists donation_checkout_requests_status_created_idx
  on public.donation_checkout_requests(status, created_at desc);

create or replace function public.get_admin_donation_overview(
  p_search text default null,
  p_limit integer default 250
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_search text := lower(trim(coalesce(p_search, '')));
  v_limit integer := greatest(1, least(coalesce(p_limit, 250), 500));
  v_result jsonb;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  with enriched as (
    select
      d.id,
      d.user_id,
      d.ngo_id,
      d.amount_cents,
      d.minimum_cents,
      d.status,
      d.stripe_session_id,
      d.created_at,
      d.paid_at,
      coalesce(nullif(d.user_display_name, ''), nullif(p.display_name, ''), 'Usuário') as user_display_name,
      coalesce(nullif(d.user_username, ''), p.username::text, '') as user_username,
      coalesce(nullif(d.ngo_title, ''), nullif(c.data ->> 'title', ''), 'ONG removida') as ngo_title
    from public.donation_checkout_requests d
    left join public.profiles p on p.id = d.user_id
    left join public.content_items c
      on c.collection = 'ongs'
     and c.id::text = d.ngo_id
  ),
  filtered as (
    select *
    from enriched
    where v_search = ''
       or lower(user_display_name) like '%' || v_search || '%'
       or lower(user_username) like '%' || v_search || '%'
       or lower(ngo_title) like '%' || v_search || '%'
       or lower(status) like '%' || v_search || '%'
       or (
         regexp_replace(v_search, '[^0-9]', '', 'g') <> ''
         and amount_cents::text like '%' || regexp_replace(v_search, '[^0-9]', '', 'g') || '%'
       )
    order by created_at desc
    limit v_limit
  ),
  top_ngo as (
    select jsonb_build_object(
      'ngoId', ngo_id,
      'title', max(ngo_title),
      'checkoutCount', count(*),
      'amountCents', coalesce(sum(amount_cents), 0)
    ) as payload
    from enriched
    group by ngo_id
    order by count(*) desc, sum(amount_cents) desc, max(ngo_title)
    limit 1
  ),
  highest as (
    select jsonb_build_object(
      'amountCents', amount_cents,
      'userDisplayName', user_display_name,
      'username', user_username,
      'ngoTitle', ngo_title,
      'createdAt', created_at
    ) as payload
    from enriched
    order by amount_cents desc, created_at desc
    limit 1
  )
  select jsonb_build_object(
    'rows',
      coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', id,
          'userId', user_id,
          'userDisplayName', user_display_name,
          'username', user_username,
          'ngoId', ngo_id,
          'ngoTitle', ngo_title,
          'amountCents', amount_cents,
          'minimumCents', minimum_cents,
          'status', status,
          'stripeSessionId', stripe_session_id,
          'createdAt', created_at,
          'paidAt', paid_at
        ) order by created_at desc)
        from filtered
      ), '[]'::jsonb),
    'insights', jsonb_build_object(
      'totalCheckouts', (select count(*) from enriched),
      'totalAmountCents', (select coalesce(sum(amount_cents), 0) from enriched),
      'averageAmountCents', (select coalesce(round(avg(amount_cents)), 0) from enriched),
      'uniqueSupporters', (select count(distinct user_id) from enriched),
      'last7Days', (select count(*) from enriched where created_at >= now() - interval '7 days'),
      'topNgo', (select payload from top_ngo),
      'highestDonation', (select payload from highest)
    )
  )
  into v_result;

  return coalesce(v_result, jsonb_build_object('rows', '[]'::jsonb, 'insights', '{}'::jsonb));
end;
$$;

revoke all on function public.get_admin_donation_overview(text, integer) from public, anon;
grant execute on function public.get_admin_donation_overview(text, integer) to authenticated;

notify pgrst, 'reload schema';


-- Definição final com valores administrativos separados por moeda.
create or replace function public.get_admin_donation_overview(
  p_search text default null,
  p_limit integer default 250
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_search text := lower(trim(coalesce(p_search, '')));
  v_limit integer := greatest(1, least(coalesce(p_limit, 250), 500));
  v_result jsonb;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  with enriched as (
    select
      d.id,
      d.user_id,
      d.ngo_id,
      d.amount_cents,
      d.minimum_cents,
      upper(coalesce(nullif(d.currency, ''), 'brl')) as currency,
      d.status,
      d.stripe_session_id,
      d.created_at,
      d.paid_at,
      coalesce(nullif(d.user_display_name, ''), nullif(p.display_name, ''), 'Usuário') as user_display_name,
      coalesce(nullif(d.user_username, ''), p.username::text, '') as user_username,
      coalesce(nullif(d.ngo_title, ''), nullif(c.data ->> 'title', ''), 'ONG removida') as ngo_title
    from public.donation_checkout_requests d
    left join public.profiles p on p.id = d.user_id
    left join public.content_items c
      on c.collection = 'ongs'
     and c.id::text = d.ngo_id
  ),
  filtered as (
    select *
    from enriched
    where v_search = ''
       or lower(user_display_name) like '%' || v_search || '%'
       or lower(user_username) like '%' || v_search || '%'
       or lower(ngo_title) like '%' || v_search || '%'
       or lower(status) like '%' || v_search || '%'
       or lower(currency) like '%' || v_search || '%'
       or (
         regexp_replace(v_search, '[^0-9]', '', 'g') <> ''
         and amount_cents::text like '%' || regexp_replace(v_search, '[^0-9]', '', 'g') || '%'
       )
    order by created_at desc
    limit v_limit
  ),
  currency_totals as (
    select
      currency,
      count(*) as checkout_count,
      coalesce(sum(amount_cents), 0) as total_amount_cents,
      coalesce(round(avg(amount_cents)), 0) as average_amount_cents
    from enriched
    group by currency
  ),
  top_ngo as (
    select jsonb_build_object(
      'ngoId', ngo_id,
      'title', max(ngo_title),
      'checkoutCount', count(*)
    ) as payload
    from enriched
    group by ngo_id
    order by count(*) desc, max(ngo_title)
    limit 1
  ),
  highest as (
    select jsonb_build_object(
      'amountCents', amount_cents,
      'currency', currency,
      'userDisplayName', user_display_name,
      'username', user_username,
      'ngoTitle', ngo_title,
      'createdAt', created_at
    ) as payload
    from enriched
    order by amount_cents desc, created_at desc
    limit 1
  )
  select jsonb_build_object(
    'rows',
      coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', id,
          'userId', user_id,
          'userDisplayName', user_display_name,
          'username', user_username,
          'ngoId', ngo_id,
          'ngoTitle', ngo_title,
          'amountCents', amount_cents,
          'minimumCents', minimum_cents,
          'currency', currency,
          'status', status,
          'stripeSessionId', stripe_session_id,
          'createdAt', created_at,
          'paidAt', paid_at
        ) order by created_at desc)
        from filtered
      ), '[]'::jsonb),
    'insights', jsonb_build_object(
      'totalCheckouts', (select count(*) from enriched),
      'uniqueSupporters', (select count(distinct user_id) from enriched),
      'last7Days', (select count(*) from enriched where created_at >= now() - interval '7 days'),
      'byCurrency', coalesce((
        select jsonb_object_agg(currency, jsonb_build_object(
          'totalCheckouts', checkout_count,
          'totalAmountCents', total_amount_cents,
          'averageAmountCents', average_amount_cents
        )) from currency_totals
      ), '{}'::jsonb),
      'topNgo', (select payload from top_ngo),
      'highestDonation', (select payload from highest)
    )
  )
  into v_result;

  return coalesce(v_result, jsonb_build_object('rows', '[]'::jsonb, 'insights', '{}'::jsonb));
end;
$$;

revoke all on function public.get_admin_donation_overview(text, integer) from public, anon;
grant execute on function public.get_admin_donation_overview(text, integer) to authenticated;

notify pgrst, 'reload schema';


-- Acesso interno da Edge Function de tradução automática.
grant select, update on public.content_items, public.site_settings to service_role;

-- Automatic public-content translation queue (2026-08-06)
create extension if not exists pg_net with schema extensions;

grant select, update on public.content_items, public.site_settings to service_role;

create or replace function private.enqueue_betv_translation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_collection text;
  v_id text;
begin
  if tg_op = 'UPDATE'
     and (new.data - 'translations') is not distinct from (old.data - 'translations') then
    return new;
  end if;

  if tg_table_name = 'content_items' then
    v_collection := new.collection;
    if v_collection not in ('contents','featured','movies','notifications','ongs','sections','series','videos') then
      return new;
    end if;
  elsif tg_table_name = 'site_settings' then
    v_collection := 'settings';
    if new.id not in ('site','billie-eilish','ong') then
      return new;
    end if;
  else
    return new;
  end if;

  v_id := new.id::text;
  perform net.http_post(
    url := 'https://cxkevnnxibhezvospkce.supabase.co/functions/v1/translate-content-record',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := jsonb_build_object(
      'collection',v_collection,
      'ids',jsonb_build_array(v_id),
      'locales',jsonb_build_array('en-us','es')
    ),
    timeout_milliseconds := 30000
  );
  return new;
exception when others then
  raise warning 'BETV translation job could not be queued: %',sqlerrm;
  return new;
end;
$$;

revoke all on function private.enqueue_betv_translation() from public;

drop trigger if exists content_items_auto_translate on public.content_items;
create trigger content_items_auto_translate
after insert or update of data on public.content_items
for each row execute function private.enqueue_betv_translation();

drop trigger if exists site_settings_auto_translate on public.site_settings;
create trigger site_settings_auto_translate
after insert or update of data on public.site_settings
for each row execute function private.enqueue_betv_translation();


-- Snapshot final: insights de ONG contabilizam somente pagamentos confirmados.
-- Mantém o histórico completo no dashboard, mas calcula os insights apenas
-- com pagamentos confirmados pela Stripe (status = 'paid').
create or replace function public.get_admin_donation_overview(
  p_search text default null,
  p_limit integer default 250
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_search text := lower(trim(coalesce(p_search, '')));
  v_limit integer := greatest(1, least(coalesce(p_limit, 250), 500));
  v_result jsonb;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  with enriched as (
    select
      d.id,
      d.user_id,
      d.ngo_id,
      d.amount_cents,
      d.minimum_cents,
      upper(coalesce(nullif(d.currency, ''), 'brl')) as currency,
      d.status,
      d.stripe_session_id,
      d.created_at,
      d.paid_at,
      coalesce(nullif(d.user_display_name, ''), nullif(p.display_name, ''), 'Usuário') as user_display_name,
      coalesce(nullif(d.user_username, ''), p.username::text, '') as user_username,
      coalesce(nullif(d.ngo_title, ''), nullif(c.data ->> 'title', ''), 'ONG removida') as ngo_title
    from public.donation_checkout_requests d
    left join public.profiles p on p.id = d.user_id
    left join public.content_items c
      on c.collection = 'ongs'
     and c.id::text = d.ngo_id
  ),
  filtered as (
    select *
    from enriched
    where v_search = ''
       or lower(user_display_name) like '%' || v_search || '%'
       or lower(user_username) like '%' || v_search || '%'
       or lower(ngo_title) like '%' || v_search || '%'
       or lower(status) like '%' || v_search || '%'
       or lower(currency) like '%' || v_search || '%'
       or (
         regexp_replace(v_search, '[^0-9]', '', 'g') <> ''
         and amount_cents::text like '%' || regexp_replace(v_search, '[^0-9]', '', 'g') || '%'
       )
    order by created_at desc
    limit v_limit
  ),
  paid as (
    select *
    from enriched
    where status = 'paid'
  ),
  currency_totals as (
    select
      currency,
      count(*) as donation_count,
      coalesce(sum(amount_cents), 0) as total_amount_cents,
      coalesce(round(avg(amount_cents)), 0) as average_amount_cents
    from paid
    group by currency
  ),
  top_ngo as (
    select jsonb_build_object(
      'ngoId', ngo_id,
      'title', max(ngo_title),
      'checkoutCount', count(*)
    ) as payload
    from paid
    group by ngo_id
    order by count(*) desc, max(ngo_title)
    limit 1
  ),
  highest as (
    select jsonb_build_object(
      'amountCents', amount_cents,
      'currency', currency,
      'userDisplayName', user_display_name,
      'username', user_username,
      'ngoTitle', ngo_title,
      'createdAt', created_at,
      'paidAt', paid_at
    ) as payload
    from paid
    order by amount_cents desc, coalesce(paid_at, created_at) desc
    limit 1
  )
  select jsonb_build_object(
    'rows',
      coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', id,
          'userId', user_id,
          'userDisplayName', user_display_name,
          'username', user_username,
          'ngoId', ngo_id,
          'ngoTitle', ngo_title,
          'amountCents', amount_cents,
          'minimumCents', minimum_cents,
          'currency', currency,
          'status', status,
          'stripeSessionId', stripe_session_id,
          'createdAt', created_at,
          'paidAt', paid_at
        ) order by created_at desc)
        from filtered
      ), '[]'::jsonb),
    'insights', jsonb_build_object(
      'totalCheckouts', (select count(*) from paid),
      'uniqueSupporters', (select count(distinct user_id) from paid),
      'last7Days', (
        select count(*)
        from paid
        where coalesce(paid_at, created_at) >= now() - interval '7 days'
      ),
      'byCurrency', coalesce((
        select jsonb_object_agg(currency, jsonb_build_object(
          'totalCheckouts', donation_count,
          'totalAmountCents', total_amount_cents,
          'averageAmountCents', average_amount_cents
        )) from currency_totals
      ), '{}'::jsonb),
      'topNgo', (select payload from top_ngo),
      'highestDonation', (select payload from highest)
    )
  )
  into v_result;

  return coalesce(v_result, jsonb_build_object('rows', '[]'::jsonb, 'insights', '{}'::jsonb));
end;
$$;

revoke all on function public.get_admin_donation_overview(text, integer) from public, anon;
grant execute on function public.get_admin_donation_overview(text, integer) to authenticated;

notify pgrst, 'reload schema';

-- Comentários de vídeos (sincronizado pela migration 20260809170757).
-- Comentários públicos nos detalhes de vídeos.
create table if not exists public.video_comments (
  id uuid primary key default gen_random_uuid(),
  video_key text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  constraint video_comments_video_key_length check (char_length(btrim(video_key)) between 3 and 220),
  constraint video_comments_message_length check (char_length(btrim(message)) between 1 and 500)
);

create index if not exists video_comments_video_created_at_idx
  on public.video_comments(video_key, created_at desc);
create index if not exists video_comments_user_created_at_idx
  on public.video_comments(user_id, created_at desc);

alter table public.video_comments enable row level security;
revoke all on table public.video_comments from public, anon, authenticated;
grant all on table public.video_comments to service_role;

create or replace function public.get_video_comments(
  p_video_key text,
  p_limit integer default 60
)
returns table (
  comment_id uuid,
  username text,
  avatar_url text,
  message text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
rows 60
as $$
  select
    vc.id as comment_id,
    p.username::text as username,
    coalesce(p.avatar_url, '') as avatar_url,
    vc.message,
    vc.created_at
  from public.video_comments vc
  join public.profiles p on p.id = vc.user_id
  where vc.video_key = btrim(coalesce(p_video_key, ''))
    and char_length(btrim(coalesce(p_video_key, ''))) between 3 and 220
    and p.banned is false
    and p.username is not null
    and btrim(p.username::text) <> ''
  order by vc.created_at desc
  limit least(greatest(coalesce(p_limit, 60), 1), 100);
$$;

alter function public.get_video_comments(text, integer) owner to postgres;
revoke all on function public.get_video_comments(text, integer) from public;
grant execute on function public.get_video_comments(text, integer) to anon, authenticated;

create or replace function public.post_video_comment(
  p_video_key text,
  p_message text
)
returns table (
  comment_id uuid,
  username text,
  avatar_url text,
  message text,
  created_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
rows 1
as $$
declare
  v_user uuid := auth.uid();
  v_key text := btrim(coalesce(p_video_key, ''));
  v_message text := btrim(coalesce(p_message, ''));
  v_comment_id uuid;
begin
  if v_user is null then
    raise exception 'authentication_required';
  end if;

  if char_length(v_key) < 3 or char_length(v_key) > 220 then
    raise exception 'invalid_video_key';
  end if;

  if char_length(v_message) < 1 then
    raise exception 'comment_empty';
  end if;

  if char_length(v_message) > 500 then
    raise exception 'comment_too_long';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_user
      and p.banned is false
      and p.username is not null
      and btrim(p.username::text) <> ''
  ) then
    raise exception 'profile_not_ready';
  end if;

  if exists (
    select 1
    from public.video_comments vc
    where vc.user_id = v_user
      and vc.created_at > now() - interval '3 seconds'
  ) then
    raise exception 'comment_too_fast';
  end if;

  insert into public.video_comments(video_key, user_id, message)
  values (v_key, v_user, v_message)
  returning id into v_comment_id;

  return query
    select
      vc.id,
      p.username::text,
      coalesce(p.avatar_url, ''),
      vc.message,
      vc.created_at
    from public.video_comments vc
    join public.profiles p on p.id = vc.user_id
    where vc.id = v_comment_id;
end;
$$;

alter function public.post_video_comment(text, text) owner to postgres;
revoke all on function public.post_video_comment(text, text) from public, anon;
grant execute on function public.post_video_comment(text, text) to authenticated;

notify pgrst, 'reload schema';

-- Public profile search used by the global @ search field.
create index if not exists profiles_username_search_idx
  on public.profiles (lower(username::text) text_pattern_ops)
  where username is not null and banned is false;

create or replace function public.search_public_profiles(
  p_query text,
  p_limit integer default 8
)
returns table (
  username text,
  avatar_url text
)
language sql
stable
security definer
set search_path = ''
rows 8
as $$
  with params as (
    select
      lower(regexp_replace(btrim(coalesce(p_query, '')), '^@+', '')) as query,
      least(greatest(coalesce(p_limit, 8), 1), 8) as result_limit
  )
  select
    p.username::text as username,
    coalesce(p.avatar_url, '') as avatar_url
  from public.profiles p
  cross join params x
  where x.query <> ''
    and p.banned is false
    and p.username is not null
    and btrim(p.username::text) <> ''
    and lower(p.username::text) like x.query || '%'
  order by
    case when lower(p.username::text) = x.query then 0 else 1 end,
    lower(p.username::text)
  limit (select result_limit from params);
$$;

alter function public.search_public_profiles(text, integer) owner to postgres;
revoke all on function public.search_public_profiles(text, integer) from public;
grant execute on function public.search_public_profiles(text, integer) to anon, authenticated;

notify pgrst, 'reload schema';

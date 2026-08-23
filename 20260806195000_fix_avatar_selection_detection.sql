begin;

-- Recupera escolhas antigas que ficaram com avatar_url salvo, mas sem avatar_id.
-- Primeiro usa os metadados explícitos do avatar escolhido; depois tenta localizar
-- o item da galeria. O valor de compatibilidade nunca usa a foto do provedor.
update public.profiles as p
set
  avatar_url = trim(u.raw_user_meta_data ->> 'profile_avatar_url'),
  avatar_id = coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'profile_avatar_id'), ''),
    'saved-selection'
  ),
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

-- Preserva a escolha existente durante atualizações do Supabase Auth. Somente
-- profile_avatar_url/profile_avatar_id representam um avatar escolhido no site.
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

-- A função de login agora grava também avatar_id e nunca apaga uma URL já salva
-- só porque uma conta antiga ainda não possuía o identificador.
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


-- O perfil público também passa a confiar em avatar_url quando a seleção antiga
-- perdeu somente o avatar_id. A imagem padrão continua sendo usada se a URL estiver vazia.
create or replace function public.get_public_profile(p_username text)
returns table (
  display_name text,
  username text,
  avatar_url text,
  banner_url text,
  created_at timestamptz,
  favorites jsonb,
  saved_contents jsonb
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
    ), '[]'::jsonb) as saved_contents
  from selected_profile sp;
$$;

alter function public.get_public_profile(text) owner to postgres;
revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;

commit;

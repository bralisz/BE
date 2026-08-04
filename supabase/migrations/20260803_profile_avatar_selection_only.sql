begin;

-- Somente avatares escolhidos na galeria do site possuem avatar_id.
-- Fotos recebidas automaticamente de Google/Discord deixam de ser usadas.
update public.profiles
set avatar_url = '', updated_at = now()
where coalesce(avatar_id, '') = '' and coalesce(avatar_url, '') <> '';

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
    display_name = case when nullif(excluded.display_name, '') is not null then excluded.display_name else p.display_name end,
    username = coalesce(excluded.username, p.username),
    avatar_url = case
      when nullif(new.raw_user_meta_data ->> 'profile_avatar_id', '') is not null
       and nullif(new.raw_user_meta_data ->> 'profile_avatar_url', '') is not null
        then new.raw_user_meta_data ->> 'profile_avatar_url'
      when nullif(p.avatar_id, '') is not null then p.avatar_url
      else ''
    end,
    avatar_id = case
      when nullif(new.raw_user_meta_data ->> 'profile_avatar_id', '') is not null then new.raw_user_meta_data ->> 'profile_avatar_id'
      when nullif(p.avatar_id, '') is not null then p.avatar_id
      else ''
    end,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;

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
    v_username := null;
  end if;

  return query
  insert into public.profiles as p (
    id, email, display_name, username, avatar_url, role,
    profile_complete, created_at, updated_at, last_login_at
  ) values (
    v_uid, v_email, coalesce(trim(p_display_name), ''), v_username,
    coalesce(trim(p_avatar_url), ''),
    case when v_email = 'bralisofc@gmail.com' then 'admin' else 'member' end,
    true, now(), now(), now()
  )
  on conflict (id) do update set
    email = v_email,
    display_name = case when nullif(trim(coalesce(p_display_name, '')), '') is not null then trim(p_display_name) else p.display_name end,
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

commit;

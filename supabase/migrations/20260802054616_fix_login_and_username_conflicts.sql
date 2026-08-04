create extension if not exists citext;

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
      when nullif(trim(coalesce(p_avatar_url, '')), '') is not null then trim(p_avatar_url)
      else p.avatar_url
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

notify pgrst, 'reload schema';

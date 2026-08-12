create or replace function public.ensure_my_profile(
  p_display_name text default null::text,
  p_username text default null::text,
  p_avatar_url text default null::text
)
returns setof public.profiles
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_username public.citext := nullif(lower(trim(coalesce(p_username, ''))), '')::public.citext;
  v_metadata_avatar_url text := '';
  v_metadata_avatar_id text := '';
  v_avatar_url text := '';
  v_avatar_id text := '';
  v_role text := case when lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin' then 'admin' else 'member' end;
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

  insert into public.profiles as p (
    id, email, display_name, username, avatar_url, avatar_id, role,
    profile_complete, created_at, updated_at, last_login_at
  ) values (
    v_uid, v_email, coalesce(trim(p_display_name), ''), v_username, v_avatar_url, v_avatar_id,
    v_role, true, now(), now(), now()
  )
  on conflict (id) do nothing;

  update public.profiles as p
  set
    email = v_email,
    display_name = case when nullif(trim(coalesce(p_display_name, '')), '') is not null then trim(p_display_name) else p.display_name end,
    username = coalesce(v_username, p.username),
    avatar_url = case when nullif(trim(coalesce(p.avatar_url, '')), '') is not null then p.avatar_url when v_avatar_url <> '' then v_avatar_url else '' end,
    avatar_id = case when nullif(trim(coalesce(p.avatar_id, '')), '') is not null then p.avatar_id when nullif(trim(coalesce(p.avatar_url, '')), '') is not null then 'saved-selection' when v_avatar_url <> '' then v_avatar_id else '' end,
    role = v_role,
    profile_complete = true,
    updated_at = case
      when p.email is distinct from v_email
        or p.display_name is distinct from case when nullif(trim(coalesce(p_display_name, '')), '') is not null then trim(p_display_name) else p.display_name end
        or p.username is distinct from coalesce(v_username, p.username)
        or p.role is distinct from v_role
        or p.profile_complete is distinct from true
        or (nullif(trim(coalesce(p.avatar_id, '')), '') is null and nullif(trim(coalesce(p.avatar_url, '')), '') is not null)
      then now() else p.updated_at end,
    last_login_at = case when p.last_login_at is null or p.last_login_at < now() - interval '6 hours' then now() else p.last_login_at end
  where p.id = v_uid
    and (
      p.email is distinct from v_email
      or p.display_name is distinct from case when nullif(trim(coalesce(p_display_name, '')), '') is not null then trim(p_display_name) else p.display_name end
      or p.username is distinct from coalesce(v_username, p.username)
      or p.role is distinct from v_role
      or p.profile_complete is distinct from true
      or (nullif(trim(coalesce(p.avatar_id, '')), '') is null and nullif(trim(coalesce(p.avatar_url, '')), '') is not null)
      or p.last_login_at is null
      or p.last_login_at < now() - interval '6 hours'
    );

  return query select p.* from public.profiles p where p.id = v_uid;
end;
$function$;

alter function public.ensure_my_profile(text,text,text) owner to postgres;
revoke all on function public.ensure_my_profile(text,text,text) from public;
grant execute on function public.ensure_my_profile(text,text,text) to authenticated;

comment on function public.ensure_my_profile(text,text,text)
is 'Ensures the authenticated profile exists while avoiding redundant writes; last_login_at is refreshed at most once every 6 hours unless profile data changes.';

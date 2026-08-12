begin;

alter table public.profiles
  add column if not exists community_tags text[] not null default '{}'::text[];

update public.profiles
set community_tags = case
  when coalesce(trim(community_tag), '') = '' then coalesce(community_tags, '{}'::text[])
  when lower(trim(community_tag)) = any(coalesce(community_tags, '{}'::text[])) then coalesce(community_tags, '{}'::text[])
  else array_append(coalesce(community_tags, '{}'::text[]), lower(trim(community_tag)))
end;

alter table public.profiles
  drop constraint if exists profiles_community_tags_check;

alter table public.profiles
  add constraint profiles_community_tags_check
  check (
    community_tags <@ array['avocado','eyelash','blohsh','billie_fan']::text[]
    and array_position(community_tags, '') is null
  );

create or replace function public.admin_set_community_tag(p_user_id uuid, p_tag text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_tag text := lower(trim(coalesce(p_tag, '')));
begin
  if auth.uid() is null or not (select private.is_admin()) then
    raise exception 'admin_required' using errcode = '42501';
  end if;
  if p_user_id is null then
    raise exception 'invalid_user' using errcode = '22023';
  end if;
  if v_tag not in ('', 'avocado', 'eyelash', 'blohsh', 'billie_fan') then
    raise exception 'invalid_community_tag' using errcode = '22023';
  end if;

  update public.profiles
  set community_tag = v_tag,
      community_tags = case
        when v_tag = '' or v_tag = any(coalesce(community_tags, '{}'::text[])) then coalesce(community_tags, '{}'::text[])
        else array_append(coalesce(community_tags, '{}'::text[]), v_tag)
      end,
      updated_at = clock_timestamp()
  where id = p_user_id;

  if not found then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;
  return v_tag;
end;
$$;

alter function public.admin_set_community_tag(uuid, text) owner to postgres;
revoke all on function public.admin_set_community_tag(uuid, text) from public, anon;
grant execute on function public.admin_set_community_tag(uuid, text) to authenticated;

create or replace function public.claim_billie_fan_tag()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  update public.profiles
  set community_tag = 'billie_fan',
      community_tags = case
        when 'billie_fan' = any(coalesce(community_tags, '{}'::text[])) then coalesce(community_tags, '{}'::text[])
        else array_append(coalesce(community_tags, '{}'::text[]), 'billie_fan')
      end,
      updated_at = clock_timestamp()
  where id = v_uid;

  if not found then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;

  return 'billie_fan';
end;
$$;

alter function public.claim_billie_fan_tag() owner to postgres;
revoke all on function public.claim_billie_fan_tag() from public, anon;
grant execute on function public.claim_billie_fan_tag() to authenticated;

create or replace function public.set_my_community_tag(p_tag text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_tag text := lower(trim(coalesce(p_tag, '')));
  v_owned text[];
begin
  if v_uid is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;
  if v_tag not in ('', 'avocado', 'eyelash', 'blohsh', 'billie_fan') then
    raise exception 'invalid_community_tag' using errcode = '22023';
  end if;

  select coalesce(community_tags, '{}'::text[])
  into v_owned
  from public.profiles
  where id = v_uid;

  if not found then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;

  if v_tag <> '' and not (v_tag = any(v_owned)) then
    raise exception 'tag_not_owned' using errcode = '42501';
  end if;

  update public.profiles
  set community_tag = v_tag,
      updated_at = clock_timestamp()
  where id = v_uid;

  return v_tag;
end;
$$;

alter function public.set_my_community_tag(text) owner to postgres;
revoke all on function public.set_my_community_tag(text) from public, anon;
grant execute on function public.set_my_community_tag(text) to authenticated;

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

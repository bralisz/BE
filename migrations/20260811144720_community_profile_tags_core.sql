begin;

alter table public.profiles
  add column if not exists community_tag text not null default '';

alter table public.profiles
  drop constraint if exists profiles_community_tag_check;

alter table public.profiles
  add constraint profiles_community_tag_check
  check (community_tag in ('', 'avocado', 'eyelash', 'blohsh'));

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
  if v_tag not in ('', 'avocado', 'eyelash', 'blohsh') then
    raise exception 'invalid_community_tag' using errcode = '22023';
  end if;

  update public.profiles
  set community_tag = v_tag,
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

commit;

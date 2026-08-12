begin;

create schema if not exists private;

create or replace function private.admin_manage_user_impl(
  p_action text,
  p_user_id uuid,
  p_reason text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_requester uuid := auth.uid();
  v_action text := lower(trim(coalesce(p_action, '')));
  v_banned boolean;
  v_now timestamptz := now();
  v_reason text := left(trim(coalesce(p_reason, '')), 500);
begin
  if v_requester is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_requester
      and p.role = 'admin'
  ) then
    raise exception 'admin required' using errcode = '42501';
  end if;

  if p_user_id is null or p_user_id = v_requester then
    raise exception 'protected account' using errcode = '42501';
  end if;

  if v_action not in ('ban', 'unban') then
    raise exception 'invalid action' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.role = 'admin'
  ) then
    raise exception 'protected account' using errcode = '42501';
  end if;

  v_banned := v_action = 'ban';

  update public.profiles
  set banned = v_banned,
      banned_at = case when v_banned then v_now else null end,
      ban_reason = case when v_banned then v_reason else '' end,
      updated_at = v_now
  where id = p_user_id;

  if not found then
    raise exception 'user not found' using errcode = 'P0002';
  end if;

  update auth.users
  set banned_until = case when v_banned then v_now + interval '100 years' else null end,
      raw_app_meta_data = (
        coalesce(raw_app_meta_data, '{}'::jsonb)
        - 'banned_at'
        - 'ban_reason'
      ) || jsonb_build_object('banned', v_banned)
        || case
             when v_banned then jsonb_build_object('banned_at', v_now, 'ban_reason', v_reason)
             else '{}'::jsonb
           end,
      updated_at = v_now
  where id = p_user_id;

  return jsonb_build_object(
    'ok', true,
    'banned', v_banned,
    'bannedAt', case when v_banned then v_now else null end,
    'reason', case when v_banned then v_reason else '' end
  );
end;
$$;

alter function private.admin_manage_user_impl(text, uuid, text) owner to postgres;
revoke all on function private.admin_manage_user_impl(text, uuid, text) from public, anon;
grant execute on function private.admin_manage_user_impl(text, uuid, text) to authenticated;

create or replace function public.admin_manage_user(
  p_action text,
  p_user_id uuid,
  p_reason text default ''
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.admin_manage_user_impl(p_action, p_user_id, p_reason);
$$;

alter function public.admin_manage_user(text, uuid, text) owner to postgres;
revoke all on function public.admin_manage_user(text, uuid, text) from public, anon;
grant execute on function public.admin_manage_user(text, uuid, text) to authenticated;

update public.profiles p
set banned = true,
    banned_at = coalesce(p.banned_at, u.updated_at, now()),
    ban_reason = case
      when nullif(p.ban_reason, '') is not null then p.ban_reason
      else coalesce(u.raw_app_meta_data ->> 'ban_reason', '')
    end,
    updated_at = now()
from auth.users u
where u.id = p.id
  and (
    coalesce((u.raw_app_meta_data ->> 'banned')::boolean, false)
    or u.banned_until > now()
  )
  and p.banned is not true;

select pg_notify('pgrst', 'reload schema');

commit;

begin;

-- Expose the stable author id with each public comment so the client can show
-- owner-only actions without relying on a mutable username.
drop function if exists public.get_video_comments(text, integer);
create function public.get_video_comments(
  p_video_key text,
  p_limit integer default 60
)
returns table (
  comment_id uuid,
  author_user_id uuid,
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
    vc.user_id as author_user_id,
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

create table if not exists public.video_comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.video_comments(id) on delete cascade,
  reporter_user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint video_comment_reports_status_check check (status in ('pending', 'resolved')),
  constraint video_comment_reports_reason_check check (
    reason in (
      'spam_abuse',
      'impersonation',
      'harassment',
      'hate_discrimination',
      'illegal_activity',
      'malicious_link',
      'privacy_rights',
      'harmful_other'
    )
  ),
  constraint video_comment_reports_one_per_user unique (comment_id, reporter_user_id)
);

create index if not exists video_comment_reports_pending_created_idx
  on public.video_comment_reports(status, created_at desc);
create index if not exists video_comment_reports_comment_idx
  on public.video_comment_reports(comment_id);
create index if not exists video_comment_reports_reporter_idx
  on public.video_comment_reports(reporter_user_id, created_at desc);

alter table public.video_comment_reports enable row level security;
revoke all on table public.video_comment_reports from public, anon, authenticated;
grant all on table public.video_comment_reports to service_role;

create schema if not exists private;

create or replace function private.delete_my_video_comment_impl(p_comment_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  delete from public.video_comments
  where id = p_comment_id
    and user_id = v_user;

  if not found then
    raise exception 'comment_not_found_or_not_owned' using errcode = '42501';
  end if;

  return true;
end;
$$;

alter function private.delete_my_video_comment_impl(uuid) owner to postgres;
revoke all on function private.delete_my_video_comment_impl(uuid) from public, anon;
grant execute on function private.delete_my_video_comment_impl(uuid) to authenticated;

create or replace function public.delete_my_video_comment(p_comment_id uuid)
returns boolean
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.delete_my_video_comment_impl(p_comment_id);
$$;

alter function public.delete_my_video_comment(uuid) owner to postgres;
revoke all on function public.delete_my_video_comment(uuid) from public, anon;
grant execute on function public.delete_my_video_comment(uuid) to authenticated;

create or replace function private.report_video_comment_impl(
  p_comment_id uuid,
  p_reason text
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_reason text := lower(btrim(coalesce(p_reason, '')));
  v_comment_owner uuid;
  v_report_id uuid;
begin
  if v_user is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if v_reason not in (
    'spam_abuse',
    'impersonation',
    'harassment',
    'hate_discrimination',
    'illegal_activity',
    'malicious_link',
    'privacy_rights',
    'harmful_other'
  ) then
    raise exception 'invalid_report_reason' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = v_user and p.banned is false
  ) then
    raise exception 'reporter_not_allowed' using errcode = '42501';
  end if;

  select vc.user_id into v_comment_owner
  from public.video_comments vc
  join public.profiles p on p.id = vc.user_id
  where vc.id = p_comment_id
    and p.banned is false;

  if v_comment_owner is null then
    raise exception 'comment_not_found' using errcode = 'P0002';
  end if;

  if v_comment_owner = v_user then
    raise exception 'cannot_report_own_comment' using errcode = '42501';
  end if;

  insert into public.video_comment_reports(comment_id, reporter_user_id, reason, status, created_at, resolved_at)
  values (p_comment_id, v_user, v_reason, 'pending', now(), null)
  on conflict (comment_id, reporter_user_id)
  do update set
    reason = excluded.reason,
    status = 'pending',
    created_at = now(),
    resolved_at = null
  returning id into v_report_id;

  return v_report_id;
end;
$$;

alter function private.report_video_comment_impl(uuid, text) owner to postgres;
revoke all on function private.report_video_comment_impl(uuid, text) from public, anon;
grant execute on function private.report_video_comment_impl(uuid, text) to authenticated;

create or replace function public.report_video_comment(
  p_comment_id uuid,
  p_reason text
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.report_video_comment_impl(p_comment_id, p_reason);
$$;

alter function public.report_video_comment(uuid, text) owner to postgres;
revoke all on function public.report_video_comment(uuid, text) from public, anon;
grant execute on function public.report_video_comment(uuid, text) to authenticated;

create or replace function private.get_admin_comment_reports_impl(p_limit integer default 200)
returns table (
  report_id uuid,
  comment_id uuid,
  reported_user_id uuid,
  username text,
  avatar_url text,
  message text,
  reason text,
  created_at timestamptz,
  user_banned boolean,
  ban_reason text
)
language plpgsql
stable
security definer
set search_path = ''
rows 200
as $$
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  return query
    select
      r.id as report_id,
      vc.id as comment_id,
      vc.user_id as reported_user_id,
      p.username::text as username,
      coalesce(p.avatar_url, '') as avatar_url,
      vc.message,
      r.reason,
      r.created_at,
      coalesce(p.banned, false) as user_banned,
      coalesce(p.ban_reason, '') as ban_reason
    from public.video_comment_reports r
    join public.video_comments vc on vc.id = r.comment_id
    join public.profiles p on p.id = vc.user_id
    where r.status = 'pending'
    order by r.created_at desc
    limit least(greatest(coalesce(p_limit, 200), 1), 500);
end;
$$;

alter function private.get_admin_comment_reports_impl(integer) owner to postgres;
revoke all on function private.get_admin_comment_reports_impl(integer) from public, anon;
grant execute on function private.get_admin_comment_reports_impl(integer) to authenticated;

create or replace function public.get_admin_comment_reports(p_limit integer default 200)
returns table (
  report_id uuid,
  comment_id uuid,
  reported_user_id uuid,
  username text,
  avatar_url text,
  message text,
  reason text,
  created_at timestamptz,
  user_banned boolean,
  ban_reason text
)
language sql
stable
security invoker
set search_path = ''
rows 200
as $$
  select * from private.get_admin_comment_reports_impl(p_limit);
$$;

alter function public.get_admin_comment_reports(integer) owner to postgres;
revoke all on function public.get_admin_comment_reports(integer) from public, anon;
grant execute on function public.get_admin_comment_reports(integer) to authenticated;

create or replace function private.admin_delete_video_comment_impl(p_comment_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  delete from public.video_comments where id = p_comment_id;
  if not found then
    raise exception 'comment_not_found' using errcode = 'P0002';
  end if;

  return true;
end;
$$;

alter function private.admin_delete_video_comment_impl(uuid) owner to postgres;
revoke all on function private.admin_delete_video_comment_impl(uuid) from public, anon;
grant execute on function private.admin_delete_video_comment_impl(uuid) to authenticated;

create or replace function public.admin_delete_video_comment(p_comment_id uuid)
returns boolean
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.admin_delete_video_comment_impl(p_comment_id);
$$;

alter function public.admin_delete_video_comment(uuid) owner to postgres;
revoke all on function public.admin_delete_video_comment(uuid) from public, anon;
grant execute on function public.admin_delete_video_comment(uuid) to authenticated;

create or replace function private.admin_resolve_comment_reports_for_user_impl(p_user_id uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_count integer := 0;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  update public.video_comment_reports r
  set status = 'resolved', resolved_at = now()
  where r.status = 'pending'
    and exists (
      select 1 from public.video_comments vc
      where vc.id = r.comment_id and vc.user_id = p_user_id
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

alter function private.admin_resolve_comment_reports_for_user_impl(uuid) owner to postgres;
revoke all on function private.admin_resolve_comment_reports_for_user_impl(uuid) from public, anon;
grant execute on function private.admin_resolve_comment_reports_for_user_impl(uuid) to authenticated;

create or replace function public.admin_resolve_comment_reports_for_user(p_user_id uuid)
returns integer
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.admin_resolve_comment_reports_for_user_impl(p_user_id);
$$;

alter function public.admin_resolve_comment_reports_for_user(uuid) owner to postgres;
revoke all on function public.admin_resolve_comment_reports_for_user(uuid) from public, anon;
grant execute on function public.admin_resolve_comment_reports_for_user(uuid) to authenticated;

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

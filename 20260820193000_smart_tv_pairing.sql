begin;

create table if not exists public.tv_pair_sessions (
  id uuid primary key default gen_random_uuid(),
  pairing_code text not null unique,
  device_token text not null,
  owner_id uuid references auth.users(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting','paired','disconnected')),
  current_media jsonb not null default '{}'::jsonb,
  media_version bigint not null default 0,
  created_at timestamptz not null default now(),
  paired_at timestamptz,
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '5 minutes')
);

create index if not exists tv_pair_sessions_owner_idx
  on public.tv_pair_sessions (owner_id, updated_at desc);
create index if not exists tv_pair_sessions_expiry_idx
  on public.tv_pair_sessions (expires_at);

alter table public.tv_pair_sessions enable row level security;
revoke all on table public.tv_pair_sessions from anon, authenticated;

create or replace function public.tv_create_session(p_device_token text)
returns table(session_id uuid, pairing_code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := trim(coalesce(p_device_token, ''));
  v_code text;
  v_id uuid;
  v_expires timestamptz;
begin
  if length(v_token) < 24 or length(v_token) > 160 then
    raise exception 'invalid_device_token' using errcode = '22023';
  end if;

  delete from public.tv_pair_sessions
  where expires_at < now() - interval '1 day';

  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1 from public.tv_pair_sessions s where s.pairing_code = v_code
    );
  end loop;

  insert into public.tv_pair_sessions (pairing_code, device_token)
  values (v_code, v_token)
  returning id, public.tv_pair_sessions.expires_at into v_id, v_expires;

  return query select v_id, v_code, v_expires;
end;
$$;

alter function public.tv_create_session(text) owner to postgres;
revoke all on function public.tv_create_session(text) from public;
grant execute on function public.tv_create_session(text) to anon, authenticated;

create or replace function public.tv_receiver_state(p_session_id uuid, p_device_token text)
returns table(
  status text,
  owner_display_name text,
  current_media jsonb,
  media_version bigint,
  expires_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := trim(coalesce(p_device_token, ''));
begin
  if p_session_id is null or length(v_token) < 24 then
    return;
  end if;

  update public.tv_pair_sessions s
  set last_seen_at = now(),
      updated_at = case when s.updated_at > now() then s.updated_at else s.updated_at end
  where s.id = p_session_id
    and s.device_token = v_token
    and s.expires_at > now();

  return query
  select
    s.status,
    coalesce(nullif(p.display_name, ''), nullif(p.username::text, ''), 'Conta conectada') as owner_display_name,
    s.current_media,
    s.media_version,
    s.expires_at,
    s.updated_at
  from public.tv_pair_sessions s
  left join public.profiles p on p.id = s.owner_id
  where s.id = p_session_id
    and s.device_token = v_token
    and s.expires_at > now();
end;
$$;

alter function public.tv_receiver_state(uuid, text) owner to postgres;
revoke all on function public.tv_receiver_state(uuid, text) from public;
grant execute on function public.tv_receiver_state(uuid, text) to anon, authenticated;

create or replace function public.tv_claim_session(p_pairing_code text)
returns table(session_id uuid, status text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_code text := upper(regexp_replace(coalesce(p_pairing_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_row public.tv_pair_sessions%rowtype;
begin
  if v_uid is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;
  if length(v_code) <> 8 then
    raise exception 'invalid_pairing_code' using errcode = '22023';
  end if;

  select * into v_row
  from public.tv_pair_sessions s
  where s.pairing_code = v_code
  for update;

  if not found or v_row.expires_at <= now() or v_row.status = 'disconnected' then
    raise exception 'pairing_code_expired' using errcode = 'P0002';
  end if;
  if v_row.owner_id is not null and v_row.owner_id <> v_uid then
    raise exception 'pairing_code_already_used' using errcode = '42501';
  end if;

  update public.tv_pair_sessions s
  set owner_id = v_uid,
      status = 'paired',
      paired_at = coalesce(s.paired_at, now()),
      updated_at = now(),
      expires_at = now() + interval '30 days'
  where s.id = v_row.id
  returning s.id, s.status, s.expires_at into v_row.id, v_row.status, v_row.expires_at;

  return query select v_row.id, v_row.status, v_row.expires_at;
end;
$$;

alter function public.tv_claim_session(text) owner to postgres;
revoke all on function public.tv_claim_session(text) from public;
grant execute on function public.tv_claim_session(text) to authenticated;

create or replace function public.tv_my_sessions()
returns table(
  session_id uuid,
  pairing_code text,
  status text,
  current_media jsonb,
  media_version bigint,
  last_seen_at timestamptz,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.id,
    s.pairing_code,
    s.status,
    s.current_media,
    s.media_version,
    s.last_seen_at,
    s.expires_at
  from public.tv_pair_sessions s
  where s.owner_id = auth.uid()
    and s.status = 'paired'
    and s.expires_at > now()
  order by s.last_seen_at desc, s.updated_at desc
  limit 8;
$$;

alter function public.tv_my_sessions() owner to postgres;
revoke all on function public.tv_my_sessions() from public;
grant execute on function public.tv_my_sessions() to authenticated;

create or replace function public.tv_send_media(p_session_id uuid, p_media jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_version bigint;
  v_media jsonb := coalesce(p_media, '{}'::jsonb);
begin
  if v_uid is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;
  if jsonb_typeof(v_media) <> 'object' then
    raise exception 'invalid_media_payload' using errcode = '22023';
  end if;
  if length(v_media::text) > 24000 then
    raise exception 'media_payload_too_large' using errcode = '22023';
  end if;

  update public.tv_pair_sessions s
  set current_media = v_media,
      media_version = s.media_version + 1,
      updated_at = now(),
      expires_at = greatest(s.expires_at, now() + interval '30 days')
  where s.id = p_session_id
    and s.owner_id = v_uid
    and s.status = 'paired'
    and s.expires_at > now()
  returning s.media_version into v_version;

  if v_version is null then
    raise exception 'tv_session_not_available' using errcode = 'P0002';
  end if;

  return v_version;
end;
$$;

alter function public.tv_send_media(uuid, jsonb) owner to postgres;
revoke all on function public.tv_send_media(uuid, jsonb) from public;
grant execute on function public.tv_send_media(uuid, jsonb) to authenticated;

create or replace function public.tv_disconnect_session(p_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  update public.tv_pair_sessions s
  set status = 'disconnected',
      updated_at = now(),
      expires_at = least(s.expires_at, now() + interval '2 minutes')
  where s.id = p_session_id
    and s.owner_id = v_uid
    and s.status = 'paired';

  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

alter function public.tv_disconnect_session(uuid) owner to postgres;
revoke all on function public.tv_disconnect_session(uuid) from public;
grant execute on function public.tv_disconnect_session(uuid) to authenticated;

commit;

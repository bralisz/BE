-- BETV Watch Party: private invitations; no chat or persistent playback data.
-- This migration is additive and does not alter existing profiles or content.
create table if not exists public.watch_party_invites (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  host_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid not null references auth.users(id) on delete cascade,
  host_label text not null default 'Fã',
  video_id text not null,
  video_title text not null default 'Vídeo',
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  expires_at timestamptz not null default (now() + interval '45 minutes'),
  constraint watch_party_distinct_users check (host_id <> invitee_id),
  constraint watch_party_video_length check (length(video_id) between 6 and 64),
  constraint watch_party_title_length check (length(video_title) between 1 and 180)
);
create index if not exists watch_party_invites_recipient_idx
  on public.watch_party_invites (invitee_id, created_at desc)
  where status = 'pending';
create index if not exists watch_party_invites_host_idx
  on public.watch_party_invites (host_id, created_at desc);
alter table public.watch_party_invites enable row level security;

drop policy if exists "Watch Party invitations visible to participants" on public.watch_party_invites;
create policy "Watch Party invitations visible to participants"
on public.watch_party_invites for select to authenticated
using (host_id = (select auth.uid()) or invitee_id = (select auth.uid()));

revoke all on public.watch_party_invites from public, anon;
grant select on public.watch_party_invites to authenticated;

-- A server-side RPC resolves usernames: user IDs and email addresses are not
-- enumerated by the browser. Only authenticated, non-banned accounts may invite.
create or replace function public.send_watch_party_invite(
  p_username text, p_room_id uuid, p_video_id text, p_video_title text
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_host uuid := auth.uid();
  v_invitee uuid;
  v_host_label text;
  v_id uuid;
begin
  if v_host is null then raise exception 'sign_in_required'; end if;
  if p_room_id is null or p_video_id !~ '^[0-9]{6,12}$'
     or length(btrim(coalesce(p_video_title,''))) not between 1 and 180
     or length(coalesce(p_username,'')) > 40 then
    raise exception 'invalid_watch_party_invite';
  end if;
  select coalesce(nullif(btrim(display_name), ''), nullif(username::text,''), 'Fã')
    into v_host_label from public.profiles where id = v_host and banned is false;
  if v_host_label is null then raise exception 'profile_unavailable'; end if;
  select id into v_invitee from public.profiles
   where lower(username::text) = lower(regexp_replace(btrim(p_username), '^@+', ''))
     and banned is false and id <> v_host limit 1;
  if v_invitee is null then raise exception 'fan_not_found'; end if;
  if (select count(*) from public.watch_party_invites
       where host_id = v_host and created_at > now() - interval '1 minute') >= 5 then
    raise exception 'invite_rate_limit';
  end if;
  -- Avoid duplicate active invitations to the same fan for the same room.
  select id into v_id from public.watch_party_invites
    where host_id = v_host and invitee_id = v_invitee and room_id = p_room_id
      and status = 'pending' and expires_at > now()
    order by created_at desc limit 1;
  if v_id is not null then return v_id; end if;
  insert into public.watch_party_invites
    (room_id,host_id,invitee_id,host_label,video_id,video_title)
  values (p_room_id,v_host,v_invitee,left(v_host_label,64),p_video_id,btrim(p_video_title))
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.send_watch_party_invite(text,uuid,text,text) from public, anon;
grant execute on function public.send_watch_party_invite(text,uuid,text,text) to authenticated;

-- The recipient alone can accept or decline. Expired / handled invites cannot
-- be reused; the returned content ID is a local BETV route, never an external URL.
create or replace function public.respond_watch_party_invite(
  p_invite_id uuid, p_accept boolean
) returns table(room_id uuid, video_id text, video_title text)
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'sign_in_required'; end if;
  return query
    update public.watch_party_invites i
      set status = case when p_accept then 'accepted' else 'declined' end,
          responded_at = now()
      where i.id = p_invite_id
        and i.invitee_id = auth.uid()
        and i.status = 'pending'
        and i.expires_at > now()
      returning i.room_id, i.video_id, i.video_title;
  if not found then raise exception 'invite_no_longer_available'; end if;
end;
$$;
revoke all on function public.respond_watch_party_invite(uuid,boolean) from public, anon;
grant execute on function public.respond_watch_party_invite(uuid,boolean) to authenticated;

-- Realtime Postgres Changes notifies only rows permitted by the table RLS.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public'
      and tablename = 'watch_party_invites'
  ) then
    alter publication supabase_realtime add table public.watch_party_invites;
  end if;
end $$;

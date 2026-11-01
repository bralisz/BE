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
  if not exists (select 1 from public.watch_party_unlocks where user_id = v_host) then
    raise exception 'watch_party_payment_required';
  end if;
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

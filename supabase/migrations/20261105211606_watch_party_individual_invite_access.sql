-- A room invitation does not grant a permanent Watch Together entitlement.
-- Keep unpaid invitations pending so the recipient can purchase and accept later.
create or replace function public.respond_watch_party_invite(
  p_invite_id uuid, p_accept boolean
) returns table(room_id uuid, video_id text, video_title text)
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'sign_in_required'; end if;
  if p_accept is null then raise exception 'invalid_answer'; end if;
  if p_accept and not public.has_watch_party_access() then
    raise exception 'watch_party_access_required';
  end if;
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


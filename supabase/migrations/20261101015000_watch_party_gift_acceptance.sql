-- Watch Party gifts now require explicit recipient acceptance.
-- Historic gifts are already accepted and remain valid.
create table if not exists public.watch_party_gift_requests (
 id uuid primary key default gen_random_uuid(),
 purchaser_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','accepted','declined')),
 created_at timestamptz not null default now(),
 responded_at timestamptz,
 check (purchaser_id<>recipient_id)
);
create unique index if not exists wp_gift_sender_pending on public.watch_party_gift_requests(purchaser_id) where status='pending';
create unique index if not exists wp_gift_recipient_pending on public.watch_party_gift_requests(recipient_id) where status='pending';
create index if not exists wp_gift_recipient_recent on public.watch_party_gift_requests(recipient_id,created_at desc);
alter table public.watch_party_gift_requests enable row level security;
revoke all on public.watch_party_gift_requests from public,anon;
grant select on public.watch_party_gift_requests to authenticated;
drop policy if exists wp_gift_request_participant_read on public.watch_party_gift_requests;
create policy wp_gift_request_participant_read on public.watch_party_gift_requests
for select to authenticated using (purchaser_id=(select auth.uid()) or recipient_id=(select auth.uid()));

create or replace function public.watch_party_recipient_available(p_username text)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null
  and exists(select 1 from public.watch_party_unlocks payer where payer.user_id=auth.uid())
  and not exists(select 1 from public.watch_party_gifts g where g.purchaser_id=auth.uid())
  and not exists(select 1 from public.watch_party_gift_requests r where r.purchaser_id=auth.uid() and r.status='pending')
  and exists(select 1 from public.profiles p
   where lower(p.username::text)=lower(regexp_replace(btrim(coalesce(p_username,'')),'^@+',''))
   and p.banned=false and p.id<>auth.uid()
   and not exists(select 1 from public.watch_party_unlocks u where u.user_id=p.id)
   and not exists(select 1 from public.watch_party_grants g where g.user_id=p.id)
   and not exists(select 1 from public.watch_party_gifts g where g.recipient_id=p.id)
   and not exists(select 1 from public.watch_party_gift_requests r where r.recipient_id=p.id and r.status='pending')
  );
$$;
revoke all on function public.watch_party_recipient_available(text) from public,anon;
grant execute on function public.watch_party_recipient_available(text) to authenticated;

create or replace function public.gift_watch_party_access(p_username text)
returns text language plpgsql security definer set search_path='' as $$
declare
 v_sender uuid:=auth.uid();
 v_recipient uuid;
begin
 if v_sender is null then raise exception 'sign_in_required'; end if;
 if not exists(select 1 from public.watch_party_unlocks u where u.user_id=v_sender) then raise exception 'paid_unlock_required_to_gift'; end if;
 if length(btrim(coalesce(p_username,''))) not between 2 and 40 then raise exception 'invalid_username'; end if;
 -- Serialize simultaneous sends by this payer; uniqueness also protects concurrent recipient requests.
 perform pg_advisory_xact_lock(hashtextextended(v_sender::text,42));
 if exists(select 1 from public.watch_party_gifts where purchaser_id=v_sender)
 or exists(select 1 from public.watch_party_gift_requests where purchaser_id=v_sender and status='pending')
 then raise exception 'gift_already_used'; end if;
 select p.id into v_recipient from public.profiles p
 where lower(p.username::text)=lower(regexp_replace(btrim(p_username),'^@+',''))
 and p.banned=false and p.id<>v_sender limit 1;
 if v_recipient is null then raise exception 'fan_not_found'; end if;
 if exists(select 1 from public.watch_party_unlocks where user_id=v_recipient)
 or exists(select 1 from public.watch_party_grants where user_id=v_recipient)
 or exists(select 1 from public.watch_party_gifts where recipient_id=v_recipient)
 or exists(select 1 from public.watch_party_gift_requests where recipient_id=v_recipient and status='pending')
 then raise exception 'fan_already_unlocked'; end if;
 insert into public.watch_party_gift_requests(purchaser_id,recipient_id)
 values(v_sender,v_recipient);
 return 'gift_pending';
end;
$$;
revoke all on function public.gift_watch_party_access(text) from public,anon;
grant execute on function public.gift_watch_party_access(text) to authenticated;

create or replace function public.respond_watch_party_gift(p_request_id uuid,p_accept boolean)
returns text language plpgsql security definer set search_path='' as $$
declare
 v_req public.watch_party_gift_requests%rowtype;
begin
 if auth.uid() is null then raise exception 'sign_in_required'; end if;
 if p_accept is null then raise exception 'invalid_answer'; end if;
 select * into v_req from public.watch_party_gift_requests
 where id=p_request_id and recipient_id=auth.uid() and status='pending' for update;
 if not found then raise exception 'gift_no_longer_available'; end if;
 if p_accept then
  if not exists(select 1 from public.watch_party_unlocks where user_id=v_req.purchaser_id) then raise exception 'payer_not_eligible'; end if;
  if exists(select 1 from public.watch_party_unlocks where user_id=v_req.recipient_id)
  or exists(select 1 from public.watch_party_grants where user_id=v_req.recipient_id)
  or exists(select 1 from public.watch_party_gifts where recipient_id=v_req.recipient_id)
  then raise exception 'fan_already_unlocked'; end if;
  insert into public.watch_party_gifts(purchaser_id,recipient_id)
  values(v_req.purchaser_id,v_req.recipient_id);
  update public.profiles set
   community_tags=array(select distinct x from unnest(array_append(coalesce(community_tags,'{}'::text[]),'happier_than_ever')) x where x<>''),
   community_tag=case when community_tag='' then 'happier_than_ever' else community_tag end
  where id=v_req.recipient_id;
 end if;
 update public.watch_party_gift_requests set status=case when p_accept then 'accepted' else 'declined' end,
 responded_at=now() where id=v_req.id;
 return case when p_accept then 'gift_accepted' else 'gift_declined' end;
end;
$$;
revoke all on function public.respond_watch_party_gift(uuid,boolean) from public,anon;
grant execute on function public.respond_watch_party_gift(uuid,boolean) to authenticated;

create or replace function public.my_watch_party_gift_status()
returns table(eligible boolean,gifted_to text,recipient_avatar text)
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.watch_party_unlocks where user_id=auth.uid()),
 coalesce(
  (select p.username::text from public.watch_party_gifts g join public.profiles p on p.id=g.recipient_id where g.purchaser_id=auth.uid()),
  (select p.username::text from public.watch_party_gift_requests r join public.profiles p on p.id=r.recipient_id where r.purchaser_id=auth.uid() and r.status='pending' order by r.created_at desc limit 1),''),
 coalesce(
  (select p.avatar_url from public.watch_party_gifts g join public.profiles p on p.id=g.recipient_id where g.purchaser_id=auth.uid()),
  (select p.avatar_url from public.watch_party_gift_requests r join public.profiles p on p.id=r.recipient_id where r.purchaser_id=auth.uid() and r.status='pending' order by r.created_at desc limit 1),'');
$$;
revoke all on function public.my_watch_party_gift_status() from public,anon;
grant execute on function public.my_watch_party_gift_status() to authenticated;

do $$
begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime')
 and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='watch_party_gift_requests')
 then alter publication supabase_realtime add table public.watch_party_gift_requests; end if;
end $$;

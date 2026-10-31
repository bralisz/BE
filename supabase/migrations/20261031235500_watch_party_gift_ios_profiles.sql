-- Premium Watch Party: one permanent gift per paying customer, manual owner grants,
-- profile visual identity for invited fans, and checked gold-tag ownership.

create table if not exists public.watch_party_gifts (
  purchaser_id uuid primary key references auth.users(id) on delete cascade,
  recipient_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint different_watch_party_gift_accounts check (purchaser_id <> recipient_id)
);
alter table public.watch_party_gifts enable row level security;
revoke all on public.watch_party_gifts from public,anon;
grant select on public.watch_party_gifts to authenticated;
drop policy if exists "watch_party_gift_owners_read" on public.watch_party_gifts;
create policy "watch_party_gift_owners_read" on public.watch_party_gifts
for select to authenticated using
 (purchaser_id = (select auth.uid()) or recipient_id = (select auth.uid()));

create table if not exists public.watch_party_grants (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reason text not null default 'admin',
  created_at timestamptz not null default now()
);
alter table public.watch_party_grants enable row level security;
revoke all on public.watch_party_grants from public,anon;
grant select on public.watch_party_grants to authenticated;
drop policy if exists "watch_party_grant_owner_read" on public.watch_party_grants;
create policy "watch_party_grant_owner_read" on public.watch_party_grants for select
to authenticated using (user_id=(select auth.uid()));

create or replace function public.has_watch_party_access()
returns boolean language sql stable security invoker set search_path='' as $$
select auth.uid() is not null
and (
  exists(select 1 from public.watch_party_unlocks u where u.user_id=auth.uid())
  or exists(select 1 from public.watch_party_gifts g where g.recipient_id=auth.uid())
  or exists(select 1 from public.watch_party_grants g where g.user_id=auth.uid())
)
$$;
revoke all on function public.has_watch_party_access() from public,anon;
grant execute on function public.has_watch_party_access() to authenticated;

-- Only actual Stripe purchasers can give the single complementary permanent access.
-- SECURITY DEFINER is tightly scoped: no arbitrary user ID, user auth from auth.uid(),
-- fixed award and one-to-one unique keys on gifts.
create or replace function public.gift_watch_party_access(p_username text)
returns text language plpgsql security definer set search_path='' as $$
declare
 v_sender uuid := auth.uid();
 v_recipient uuid;
begin
 if v_sender is null then raise exception 'sign_in_required'; end if;
 if not exists(select 1 from public.watch_party_unlocks u where u.user_id=v_sender)
    then raise exception 'paid_unlock_required_to_gift'; end if;
 if exists(select 1 from public.watch_party_gifts where purchaser_id=v_sender)
    then raise exception 'gift_already_used'; end if;
 if length(coalesce(p_username,'')) not between 2 and 40
    then raise exception 'invalid_username'; end if;
 select p.id into v_recipient from public.profiles p
 where lower(p.username::text)=lower(regexp_replace(btrim(p_username),'^@+',''))
   and p.banned=false and p.id <> v_sender limit 1;
 if v_recipient is null then raise exception 'fan_not_found'; end if;
 if exists(select 1 from public.watch_party_unlocks where user_id=v_recipient)
    or exists(select 1 from public.watch_party_grants where user_id=v_recipient)
    or exists(select 1 from public.watch_party_gifts where recipient_id=v_recipient)
   then raise exception 'fan_already_unlocked'; end if;
 insert into public.watch_party_gifts(purchaser_id,recipient_id)
 values(v_sender,v_recipient);
 update public.profiles
 set community_tags=array(select distinct tag from unnest(
   array_append(coalesce(community_tags,'{}'::text[]),'happier_than_ever')
 ) as tag where tag<>''),
     community_tag=case when community_tag='' then 'happier_than_ever' else community_tag end
 where id=v_recipient;
 return 'gift_granted';
end;
$$;
revoke all on function public.gift_watch_party_access(text) from public,anon;
grant execute on function public.gift_watch_party_access(text) to authenticated;

-- Expose gift quota/status to the paying user only.
create or replace function public.my_watch_party_gift_status()
returns table(eligible boolean, gifted_to text, recipient_avatar text)
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.watch_party_unlocks u where u.user_id=auth.uid()) as eligible,
  coalesce((select p.username::text from public.watch_party_gifts g
    join public.profiles p on p.id=g.recipient_id where g.purchaser_id=auth.uid()),'') as gifted_to,
  coalesce((select p.avatar_url from public.watch_party_gifts g
    join public.profiles p on p.id=g.recipient_id where g.purchaser_id=auth.uid()),'') as recipient_avatar
$$;
revoke all on function public.my_watch_party_gift_status() from public,anon;
grant execute on function public.my_watch_party_gift_status() to authenticated;

-- Host's public profile visuals are captured at invitation time, not user-supplied.
alter table public.watch_party_invites
 add column if not exists host_username text not null default '',
 add column if not exists host_avatar_url text not null default '',
 add column if not exists host_banner_url text not null default '';

create or replace function public.send_watch_party_invite(
 p_username text,p_room_id uuid,p_video_id text,p_video_title text
) returns uuid
language plpgsql security definer set search_path='' as $$
declare
 v_host uuid := auth.uid();
 v_invitee uuid;
 v_host_label text;
 v_host_username text;
 v_host_avatar text;
 v_host_banner text;
 v_id uuid;
begin
 if v_host is null then raise exception 'sign_in_required'; end if;
 if not (
   exists(select 1 from public.watch_party_unlocks where user_id=v_host)
   or exists(select 1 from public.watch_party_gifts where recipient_id=v_host)
   or exists(select 1 from public.watch_party_grants where user_id=v_host)
 ) then raise exception 'watch_party_access_required'; end if;
 if p_room_id is null or p_video_id !~ '^[0-9]{6,12}$'
    or length(btrim(coalesce(p_video_title,''))) not between 1 and 180
    or length(coalesce(p_username,''))>40 then
  raise exception 'invalid_watch_party_invite';
 end if;
 select coalesce(nullif(btrim(display_name),''),nullif(username::text,''),'Fã'),
   coalesce(username::text,''),coalesce(avatar_url,''),coalesce(banner_url,'')
  into v_host_label,v_host_username,v_host_avatar,v_host_banner
  from public.profiles where id=v_host and banned is false;
 if v_host_label is null then raise exception 'profile_unavailable'; end if;
 select id into v_invitee from public.profiles
 where lower(username::text)=lower(regexp_replace(btrim(p_username),'^@+',''))
 and banned is false and id <> v_host limit 1;
 if v_invitee is null then raise exception 'fan_not_found'; end if;
 if (select count(*) from public.watch_party_invites
    where host_id=v_host and created_at>now()-interval '1 minute')>=5
    then raise exception 'invite_rate_limit'; end if;
 select id into v_id from public.watch_party_invites
  where host_id=v_host and invitee_id=v_invitee and room_id=p_room_id
    and status='pending' and expires_at>now() order by created_at desc limit 1;
 if v_id is not null then return v_id; end if;
 insert into public.watch_party_invites
   (room_id,host_id,invitee_id,host_label,host_username,host_avatar_url,host_banner_url,video_id,video_title)
 values(p_room_id,v_host,v_invitee,left(v_host_label,64),left(v_host_username,60),
        left(v_host_avatar,2048),left(v_host_banner,2048),p_video_id,btrim(p_video_title))
 returning id into v_id;
 return v_id;
end;
$$;
revoke all on function public.send_watch_party_invite(text,uuid,text,text) from public,anon;
grant execute on function public.send_watch_party_invite(text,uuid,text,text) to authenticated;

-- Existing profile editor must not self-award a paid-only tag without entitlement.
create or replace function public.validate_watch_party_reward()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (
   new.community_tag='happier_than_ever' or
   'happier_than_ever'=any(coalesce(new.community_tags,'{}'::text[]))
 ) and not (
   exists(select 1 from public.watch_party_unlocks where user_id=new.id)
   or exists(select 1 from public.watch_party_gifts where recipient_id=new.id)
   or exists(select 1 from public.watch_party_grants where user_id=new.id)
 ) then
   raise exception 'watch_party_reward_requires_unlock';
 end if;
 return new;
end;
$$;
drop trigger if exists validate_watch_party_reward_trigger on public.profiles;
create trigger validate_watch_party_reward_trigger
before insert or update of community_tag,community_tags on public.profiles
for each row execute function public.validate_watch_party_reward();

-- Authorized account receives access without fabricated payment or Stripe session.
insert into public.watch_party_grants (user_id,reason)
select id,'BETV owner' from public.profiles
where lower(username::text)='bralis' and banned=false
on conflict(user_id) do nothing;
update public.profiles set community_tags=(
 select array(select distinct tag from unnest(
 array_append(coalesce(community_tags,'{}'::text[]),'happier_than_ever')
 ) as tag where tag<>'')
)
where lower(username::text)='bralis' and banned=false
and exists(select 1 from public.watch_party_grants where user_id=profiles.id);

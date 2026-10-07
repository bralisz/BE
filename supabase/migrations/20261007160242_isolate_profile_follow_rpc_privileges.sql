-- Private implementations retain access to private profiles. Exposed RPC wrappers
-- run as the caller; only minimal public identity and aggregate counts are returned.
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;
create or replace function private.get_profile_follow_state(p_username text)
returns table(target_id uuid, following boolean, followers_count bigint, following_count bigint)
language sql stable security definer set search_path = '' as $$
  select p.id,
    exists(select 1 from public.profile_follows f where f.follower_id=(select auth.uid()) and f.following_id=p.id),
    (select count(*) from public.profile_follows f where f.following_id=p.id),
    (select count(*) from public.profile_follows f where f.follower_id=p.id)
  from public.profiles p where lower(p.username::text)=lower(trim(leading '@' from p_username))
    and not coalesce(p.banned,false) limit 1;
$$;

create or replace function private.set_profile_follow(p_username text, p_following boolean)
returns table(target_id uuid, following boolean, followers_count bigint, following_count bigint)
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); target uuid;
begin
  if me is null then raise exception 'not_authenticated' using errcode='28000'; end if;
  if not exists(select 1 from public.profiles p where p.id=me and not coalesce(p.banned,false)) then
    raise exception 'not_allowed' using errcode='42501';
  end if;
  if p_following is null then raise exception 'following_required'; end if;
  select p.id into target from public.profiles p
    where lower(p.username::text)=lower(trim(leading '@' from p_username)) and not coalesce(p.banned,false) limit 1;
  if target is null then raise exception 'profile_not_found'; end if;
  if target=me then raise exception 'cannot_follow_self'; end if;
  -- Serialize this user's writes, including retries and concurrent tabs.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(me::text, 0));
  if p_following then
    insert into public.profile_follows(follower_id,following_id) values(me,target) on conflict do nothing;
  else
    delete from public.profile_follows f where f.follower_id=me and f.following_id=target;
  end if;
  return query select * from private.get_profile_follow_state(p_username);
end;
$$;

create or replace function private.get_profile_relationships(p_profile text, p_type text default 'followers', p_search text default '', p_offset integer default 0, p_limit integer default 50)
returns table(id uuid, username text, display_name text, avatar_url text, community_tag text, total_count bigint)
language sql stable security definer set search_path = '' as $$
  with target as (
    select p.id from public.profiles p where lower(p.username::text)=lower(trim(leading '@' from p_profile))
      and not coalesce(p.banned,false) limit 1
  ), edges as (
    select f.following_id as id, f.created_at from public.profile_follows f join target t on t.id=f.follower_id where p_type='following'
    union all
    select f.follower_id as id, f.created_at from public.profile_follows f join target t on t.id=f.following_id where p_type is distinct from 'following'
  )
  select p.id,p.username::text,p.display_name,p.avatar_url,p.community_tag,count(*) over()
  from edges e join public.profiles p on p.id=e.id
  where not coalesce(p.banned,false) and (coalesce(trim(p_search),'')=''
    or strpos(lower(p.username::text),lower(left(trim(p_search),80)))>0
    or strpos(lower(p.display_name),lower(left(trim(p_search),80)))>0)
  order by e.created_at desc,p.id
  offset greatest(coalesce(p_offset,0),0) limit least(greatest(coalesce(p_limit,20),1),50);
$$;

create or replace function public.get_profile_follow_state(p_username text)
returns table(target_id uuid, following boolean, followers_count bigint, following_count bigint)
language sql stable security invoker set search_path = '' as $$ select * from private.get_profile_follow_state(p_username); $$;
create or replace function public.set_profile_follow(p_username text,p_following boolean)
returns table(target_id uuid, following boolean, followers_count bigint, following_count bigint)
language sql security invoker set search_path = '' as $$ select * from private.set_profile_follow(p_username,p_following); $$;
create or replace function public.get_profile_relationships(p_profile text,p_type text default 'followers',p_search text default '',p_offset integer default 0,p_limit integer default 50)
returns table(id uuid,username text,display_name text,avatar_url text,community_tag text,total_count bigint)
language sql stable security invoker set search_path = '' as $$ select * from private.get_profile_relationships(p_profile,p_type,p_search,p_offset,p_limit); $$;
revoke all on function private.get_profile_follow_state(text) from public;
grant execute on function private.get_profile_follow_state(text) to anon, authenticated, service_role;
revoke all on function private.set_profile_follow(text,boolean) from public, anon;
grant execute on function private.set_profile_follow(text,boolean) to authenticated, service_role;
revoke all on function private.get_profile_relationships(text,text,text,integer,integer) from public;
grant execute on function private.get_profile_relationships(text,text,text,integer,integer) to anon, authenticated, service_role;
-- Old backup toggle is no longer used. Remove its client-facing write privileges.
revoke execute on function public.toggle_profile_follow(text) from public, anon, authenticated;
revoke execute on function public.sync_legacy_following_users() from public, anon, authenticated;
revoke execute on function public.sync_legacy_following_users_delete() from public, anon, authenticated;
revoke execute on function public.sync_profile_follow_legacy() from public, anon, authenticated;

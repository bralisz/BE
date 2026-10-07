-- Restore backup RPCs with minimal public payloads. Profiles have private RLS;
-- these scoped definer RPCs expose only public identity fields, never profile rows.
create table if not exists public.profile_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
alter table public.profile_follows enable row level security;
create index if not exists profile_follows_following_id_idx on public.profile_follows(following_id);
create index if not exists profile_follows_followers_page_idx on public.profile_follows(following_id, created_at desc, follower_id);
create index if not exists profile_follows_following_page_idx on public.profile_follows(follower_id, created_at desc, following_id);

drop policy if exists profile_follows_select_public on public.profile_follows;
create policy profile_follows_select_public on public.profile_follows for select to anon, authenticated using (true);
drop policy if exists profile_follows_insert_own on public.profile_follows;
create policy profile_follows_insert_own on public.profile_follows for insert to authenticated
  with check ((select auth.uid()) = follower_id and follower_id <> following_id
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and not coalesce(p.banned,false)));
drop policy if exists profile_follows_delete_own on public.profile_follows;
create policy profile_follows_delete_own on public.profile_follows for delete to authenticated using ((select auth.uid()) = follower_id);
revoke all on public.profile_follows from anon, authenticated;
grant select on public.profile_follows to anon, authenticated;
grant insert, delete on public.profile_follows to authenticated;

-- One-time recovery; no trigger rewrites preference JSON or broadcasts on each follow.
insert into public.profile_follows(follower_id, following_id)
select distinct u.user_id, p.id
from public.user_preferences u
cross join lateral jsonb_array_elements_text(case when jsonb_typeof(u.data->'followingUsers')='array' then u.data->'followingUsers' else '[]'::jsonb end) e(value)
join public.profiles p on lower(p.username::text)=lower(trim(leading '@' from e.value))
join public.profiles actor on actor.id=u.user_id
where p.id<>u.user_id and not coalesce(p.banned,false) and not coalesce(actor.banned,false)
on conflict (follower_id, following_id) do nothing;

create or replace function public.get_profile_follow_state(p_username text)
returns table(target_id uuid, following boolean, followers_count bigint, following_count bigint)
language sql stable security definer set search_path = '' as $$
  select p.id,
    exists(select 1 from public.profile_follows f where f.follower_id=(select auth.uid()) and f.following_id=p.id),
    (select count(*) from public.profile_follows f where f.following_id=p.id),
    (select count(*) from public.profile_follows f where f.follower_id=p.id)
  from public.profiles p where lower(p.username::text)=lower(trim(leading '@' from p_username))
    and not coalesce(p.banned,false) limit 1;
$$;

create or replace function public.set_profile_follow(p_username text, p_following boolean)
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
  return query select * from public.get_profile_follow_state(p_username);
end;
$$;

create or replace function public.get_profile_relationships(p_profile text, p_type text default 'followers', p_search text default '', p_offset integer default 0, p_limit integer default 50)
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
revoke all on function public.get_profile_follow_state(text) from public;
grant execute on function public.get_profile_follow_state(text) to anon, authenticated, service_role;
revoke all on function public.set_profile_follow(text,boolean) from public, anon;
grant execute on function public.set_profile_follow(text,boolean) to authenticated, service_role;
revoke all on function public.get_profile_relationships(text,text,text,integer,integer) from public;
grant execute on function public.get_profile_relationships(text,text,text,integer,integer) to anon, authenticated, service_role;

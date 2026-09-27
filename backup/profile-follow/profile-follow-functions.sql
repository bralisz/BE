CREATE OR REPLACE FUNCTION public.get_profile_follow_state(p_username text)
 RETURNS TABLE(target_id uuid, following boolean, followers_count bigint, following_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select p.id, exists(select 1 from public.profile_follows pf where pf.follower_id = auth.uid() and pf.following_id = p.id), (select count(*) from public.profile_follows pf where pf.following_id = p.id), (select count(*) from public.profile_follows pf where pf.follower_id = p.id) from public.profiles p where lower(p.username)=lower(trim(leading '@' from p_username)) and coalesce(p.banned,false)=false limit 1 $function$;

CREATE OR REPLACE FUNCTION public.set_profile_follow(p_username text, p_following boolean)
 RETURNS TABLE(target_id uuid, following boolean, followers_count bigint, following_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ declare me uuid := auth.uid(); target uuid; result_following boolean; begin if me is null then raise exception 'not_authenticated'; end if; select p.id into target from public.profiles p where (lower(p.username)=lower(trim(leading '@' from p_username)) or p.id::text=trim(p_username)) and coalesce(p.banned,false)=false limit 1; if target is null then raise exception 'profile_not_found'; end if; if me=target then raise exception 'cannot_follow_self'; end if; if p_following then insert into public.profile_follows(follower_id,following_id) values(me,target) on conflict (follower_id,following_id) do nothing; result_following:=true; else delete from public.profile_follows where follower_id=me and following_id=target; result_following:=false; end if; return query select target,result_following,(select count(*) from public.profile_follows where following_id=target),(select count(*) from public.profile_follows where follower_id=target); end $function$;

CREATE OR REPLACE FUNCTION public.toggle_profile_follow(p_username text)
 RETURNS TABLE(target_id uuid, following boolean, followers_count bigint, following_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ declare me uuid := auth.uid(); target uuid; now_following boolean; begin if me is null then raise exception 'not_authenticated'; end if; select p.id into target from public.profiles p where lower(p.username)=lower(trim(leading '@' from p_username)) and coalesce(p.banned,false)=false limit 1; if target is null then raise exception 'profile_not_found'; end if; if me = target then raise exception 'cannot_follow_self'; end if; if exists(select 1 from public.profile_follows where follower_id=me and following_id=target) then delete from public.profile_follows where follower_id=me and following_id=target; now_following := false; else insert into public.profile_follows(follower_id,following_id) values(me,target); now_following := true; end if; return query select target, now_following, (select count(*) from public.profile_follows where following_id=target), (select count(*) from public.profile_follows where follower_id=target); end $function$;
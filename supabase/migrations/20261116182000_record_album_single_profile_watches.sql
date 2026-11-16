-- Add albums and singles to the existing one-row-per-user watch history.
-- Preserve owner-only RLS, privacy preferences and security invoker.
create or replace function public.record_profile_watch(p_content_id text,p_title text,p_collection text,p_image_url text)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or length(btrim(coalesce(p_content_id,''))) not between 1 and 128
 or length(btrim(coalesce(p_title,''))) not between 1 and 180 then return false; end if;
 insert into public.profile_watch_activity(user_id,content_id,title,collection,image_url,watched_at)
 values(auth.uid(),left(btrim(p_content_id),128),left(btrim(p_title),180),
  case when p_collection in ('movies','series','albums','singles') then p_collection else 'videos' end,
  left(coalesce(p_image_url,''),2048),now())
 on conflict(user_id) do update set content_id=excluded.content_id,title=excluded.title,
 collection=excluded.collection,image_url=excluded.image_url,watched_at=excluded.watched_at;
 return true;
end;
$$;
revoke all on function public.record_profile_watch(text,text,text,text) from public,anon;
grant execute on function public.record_profile_watch(text,text,text,text) to authenticated;

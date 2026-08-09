create or replace function private.broadcast_video_comment_refresh()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
begin
  if tg_op = 'DELETE' then
    v_key := old.video_key;
  else
    v_key := new.video_key;
  end if;

  if v_key is not null and btrim(v_key) <> '' then
    perform realtime.send(
      jsonb_build_object('action', lower(tg_op)),
      'refresh',
      'comment-sync:' || v_key,
      true
    );
  end if;

  return null;
end;
$$;

drop trigger if exists broadcast_video_comment_refresh_trigger on public.video_comments;
create trigger broadcast_video_comment_refresh_trigger
after insert or update or delete on public.video_comments
for each row execute function private.broadcast_video_comment_refresh();

create or replace function private.broadcast_video_comment_like_refresh()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_comment_id uuid;
  v_key text;
begin
  if tg_op = 'DELETE' then
    v_comment_id := old.comment_id;
  else
    v_comment_id := new.comment_id;
  end if;

  select vc.video_key
    into v_key
  from public.video_comments vc
  where vc.id = v_comment_id;

  if v_key is not null and btrim(v_key) <> '' then
    perform realtime.send(
      jsonb_build_object('action', lower(tg_op)),
      'refresh',
      'comment-sync:' || v_key,
      true
    );
  end if;

  return null;
end;
$$;

drop trigger if exists broadcast_video_comment_like_refresh_trigger on public.video_comment_likes;
create trigger broadcast_video_comment_like_refresh_trigger
after insert or delete on public.video_comment_likes
for each row execute function private.broadcast_video_comment_like_refresh();

drop policy if exists "public can receive comment sync broadcasts" on realtime.messages;
create policy "public can receive comment sync broadcasts"
on realtime.messages
for select
to anon, authenticated
using (
  extension = 'broadcast'
  and (select realtime.topic()) like 'comment-sync:%'
);

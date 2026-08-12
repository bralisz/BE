begin;

drop function if exists public.get_video_comments(text, integer);
create function public.get_video_comments(p_video_key text, p_limit integer default 60)
returns table(
  comment_id uuid,
  author_user_id uuid,
  username text,
  avatar_url text,
  community_tag text,
  message text,
  created_at timestamptz,
  likes_count bigint,
  liked_by_me boolean
)
language sql
stable
security definer
rows 60
set search_path = ''
as $$
  select
    vc.id,
    vc.user_id,
    p.username::text,
    coalesce(p.avatar_url, ''),
    coalesce(p.community_tag, ''),
    vc.message,
    vc.created_at,
    coalesce((select count(*) from public.video_comment_likes vcl where vcl.comment_id = vc.id), 0)::bigint as likes_count,
    case
      when auth.uid() is null then false
      else exists(
        select 1
        from public.video_comment_likes mine
        where mine.comment_id = vc.id and mine.user_id = auth.uid()
      )
    end as liked_by_me
  from public.video_comments vc
  join public.profiles p on p.id = vc.user_id
  where vc.video_key = btrim(coalesce(p_video_key, ''))
    and char_length(btrim(coalesce(p_video_key, ''))) between 3 and 220
    and p.banned is false
    and p.username is not null
    and btrim(p.username::text) <> ''
  order by vc.created_at desc
  limit least(greatest(coalesce(p_limit, 60), 1), 100);
$$;

alter function public.get_video_comments(text, integer) owner to postgres;
revoke all on function public.get_video_comments(text, integer) from public;
grant execute on function public.get_video_comments(text, integer) to anon, authenticated;

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

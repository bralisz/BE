-- Infinite scrolling for BETV video comments: read 15 at a time, with one extra row to detect more.
-- Retains the public-only author fields and moderation checks of get_video_comments_v2.
create or replace function public.get_video_comments_page(
  p_video_key text,
  p_limit integer default 16,
  p_offset integer default 0
)
returns table (
  comment_id uuid,
  author_user_id uuid,
  username text,
  avatar_url text,
  avatar_border_color text,
  community_tag text,
  message text,
  created_at timestamptz,
  likes_count bigint,
  liked_by_me boolean
)
language sql
stable
security definer
set search_path = ''
rows 16
as $$
  with base as materialized (
    select
      vc.id as comment_id,
      vc.user_id as author_user_id,
      p.username::text as username,
      coalesce(p.avatar_url, '') as avatar_url,
      case
        when coalesce(up.data ->> 'profileAvatarBorderColor', '') ~ '^#[0-9A-Fa-f]{6}$'
          then upper(up.data ->> 'profileAvatarBorderColor')
        else ''
      end as avatar_border_color,
      coalesce(p.community_tag, '') as community_tag,
      vc.message,
      vc.created_at
    from public.video_comments vc
    join public.profiles p on p.id = vc.user_id
    left join public.user_preferences up on up.user_id = p.id
    where vc.video_key = btrim(coalesce(p_video_key, ''))
      and char_length(btrim(coalesce(p_video_key, ''))) between 3 and 220
      and p.banned is false
      and p.username is not null
      and btrim(p.username::text) <> ''
    order by vc.created_at desc, vc.id desc
    limit least(greatest(coalesce(p_limit, 16), 1), 30)
    offset least(greatest(coalesce(p_offset, 0), 0), 100000)
  ), likes as (
    select
      vcl.comment_id,
      count(*)::bigint as likes_count,
      coalesce(bool_or(vcl.user_id = auth.uid()), false) as liked_by_me
    from public.video_comment_likes vcl
    join base b on b.comment_id = vcl.comment_id
    group by vcl.comment_id
  )
  select
    b.comment_id,
    b.author_user_id,
    b.username,
    b.avatar_url,
    b.avatar_border_color,
    b.community_tag,
    b.message,
    b.created_at,
    coalesce(l.likes_count, 0)::bigint,
    coalesce(l.liked_by_me, false)
  from base b
  left join likes l on l.comment_id = b.comment_id
  order by b.created_at desc, b.comment_id desc;
$$;

alter function public.get_video_comments_page(text, integer, integer) owner to postgres;
revoke all on function public.get_video_comments_page(text, integer, integer) from public;
grant execute on function public.get_video_comments_page(text, integer, integer) to anon, authenticated;
notify pgrst, 'reload schema';

-- Curtidas nos comentários de vídeo e estado da curtida no carregamento público.
create table if not exists public.video_comment_likes (
  comment_id uuid not null references public.video_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create index if not exists video_comment_likes_user_id_idx
  on public.video_comment_likes(user_id);

alter table public.video_comment_likes enable row level security;
revoke all on table public.video_comment_likes from public, anon, authenticated;

drop function if exists public.get_video_comments(text, integer);
create function public.get_video_comments(p_video_key text, p_limit integer default 60)
returns table(
  comment_id uuid,
  author_user_id uuid,
  username text,
  avatar_url text,
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
    vc.message,
    vc.created_at,
    coalesce((select count(*) from public.video_comment_likes vcl where vcl.comment_id = vc.id), 0)::bigint,
    case
      when auth.uid() is null then false
      else exists(
        select 1 from public.video_comment_likes mine
        where mine.comment_id = vc.id and mine.user_id = auth.uid()
      )
    end
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

create or replace function public.toggle_video_comment_like(p_comment_id uuid)
returns table(liked boolean, likes_count bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_liked boolean := false;
  v_comment_exists boolean := false;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;
  if p_comment_id is null then
    raise exception 'comment_required' using errcode = '22023';
  end if;

  select exists(
    select 1
    from public.video_comments vc
    join public.profiles p on p.id = vc.user_id
    where vc.id = p_comment_id and p.banned is false
  ) into v_comment_exists;

  if not v_comment_exists then
    raise exception 'comment_not_found' using errcode = 'P0002';
  end if;

  if exists(
    select 1 from public.video_comment_likes
    where comment_id = p_comment_id and user_id = v_user_id
  ) then
    delete from public.video_comment_likes
    where comment_id = p_comment_id and user_id = v_user_id;
    v_liked := false;
  else
    insert into public.video_comment_likes(comment_id, user_id)
    values (p_comment_id, v_user_id)
    on conflict (comment_id, user_id) do nothing;
    v_liked := true;
  end if;

  return query
  select v_liked,
    (select count(*)::bigint from public.video_comment_likes where comment_id = p_comment_id);
end;
$$;

alter function public.toggle_video_comment_like(uuid) owner to postgres;
revoke all on function public.toggle_video_comment_like(uuid) from public, anon;
grant execute on function public.toggle_video_comment_like(uuid) to authenticated;

notify pgrst, 'reload schema';

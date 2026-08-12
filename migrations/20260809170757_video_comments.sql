-- Comentários públicos nos detalhes de vídeos.
create table if not exists public.video_comments (
  id uuid primary key default gen_random_uuid(),
  video_key text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  constraint video_comments_video_key_length check (char_length(btrim(video_key)) between 3 and 220),
  constraint video_comments_message_length check (char_length(btrim(message)) between 1 and 500)
);

create index if not exists video_comments_video_created_at_idx
  on public.video_comments(video_key, created_at desc);
create index if not exists video_comments_user_created_at_idx
  on public.video_comments(user_id, created_at desc);

alter table public.video_comments enable row level security;
revoke all on table public.video_comments from public, anon, authenticated;
grant all on table public.video_comments to service_role;

create or replace function public.get_video_comments(
  p_video_key text,
  p_limit integer default 60
)
returns table (
  comment_id uuid,
  username text,
  avatar_url text,
  message text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
rows 60
as $$
  select
    vc.id as comment_id,
    p.username::text as username,
    coalesce(p.avatar_url, '') as avatar_url,
    vc.message,
    vc.created_at
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

create or replace function public.post_video_comment(
  p_video_key text,
  p_message text
)
returns table (
  comment_id uuid,
  username text,
  avatar_url text,
  message text,
  created_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
rows 1
as $$
declare
  v_user uuid := auth.uid();
  v_key text := btrim(coalesce(p_video_key, ''));
  v_message text := btrim(coalesce(p_message, ''));
  v_comment_id uuid;
begin
  if v_user is null then
    raise exception 'authentication_required';
  end if;

  if char_length(v_key) < 3 or char_length(v_key) > 220 then
    raise exception 'invalid_video_key';
  end if;

  if char_length(v_message) < 1 then
    raise exception 'comment_empty';
  end if;

  if char_length(v_message) > 500 then
    raise exception 'comment_too_long';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_user
      and p.banned is false
      and p.username is not null
      and btrim(p.username::text) <> ''
  ) then
    raise exception 'profile_not_ready';
  end if;

  if exists (
    select 1
    from public.video_comments vc
    where vc.user_id = v_user
      and vc.created_at > now() - interval '3 seconds'
  ) then
    raise exception 'comment_too_fast';
  end if;

  insert into public.video_comments(video_key, user_id, message)
  values (v_key, v_user, v_message)
  returning id into v_comment_id;

  return query
    select
      vc.id,
      p.username::text,
      coalesce(p.avatar_url, ''),
      vc.message,
      vc.created_at
    from public.video_comments vc
    join public.profiles p on p.id = vc.user_id
    where vc.id = v_comment_id;
end;
$$;

alter function public.post_video_comment(text, text) owner to postgres;
revoke all on function public.post_video_comment(text, text) from public, anon;
grant execute on function public.post_video_comment(text, text) to authenticated;

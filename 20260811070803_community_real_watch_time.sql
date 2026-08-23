-- O ranking antigo creditava a duração completa ao clicar em Assistir.
-- Zera somente esse total para que, a partir desta migration, o ranking use tempo real.
update private.community_watch_daily
set watch_seconds = 0;

create table if not exists private.community_watch_sessions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid not null,
  content_id uuid not null references public.content_items(id) on delete cascade,
  watched_on date not null default current_date,
  last_heartbeat_at timestamptz not null default now(),
  closed_at timestamptz,
  primary key (user_id, session_id)
);

create index if not exists community_watch_sessions_content_idx
  on private.community_watch_sessions(content_id);

create index if not exists community_watch_sessions_recent_idx
  on private.community_watch_sessions(user_id, last_heartbeat_at desc);

alter table private.community_watch_sessions enable row level security;
revoke all on table private.community_watch_sessions from public, anon, authenticated;

create or replace function public.record_community_watch(p_content_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := clock_timestamp();
begin
  if v_user is null or p_content_id is null then
    return false;
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_user and p.banned is false
  ) then
    return false;
  end if;

  if not exists (
    select 1
    from public.content_items item
    where item.id = p_content_id
      and item.collection in ('videos', 'movies', 'series')
      and coalesce(lower(item.data ->> 'active'), 'true') <> 'false'
  ) then
    return false;
  end if;

  insert into private.community_watch_daily as activity (
    user_id,
    content_id,
    watched_on,
    watch_seconds,
    last_watched_at
  ) values (
    v_user,
    p_content_id,
    current_date,
    0,
    v_now
  )
  on conflict (user_id, content_id, watched_on) do update set
    last_watched_at = excluded.last_watched_at;

  return true;
end;
$$;

alter function public.record_community_watch(uuid) owner to postgres;
revoke all on function public.record_community_watch(uuid) from public, anon;
grant execute on function public.record_community_watch(uuid) to authenticated;

create or replace function public.heartbeat_community_watch(
  p_content_id uuid,
  p_session_id uuid,
  p_finish boolean default false
)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := clock_timestamp();
  v_duration integer := 0;
  v_previous timestamptz;
  v_session_day date;
  v_closed timestamptz;
  v_delta integer := 0;
  v_total integer := 0;
begin
  if v_user is null or p_content_id is null or p_session_id is null then
    return 0;
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_user and p.banned is false
  ) then
    return 0;
  end if;

  select private.community_duration_seconds(
    coalesce(
      nullif(item.data ->> 'duration', ''),
      nullif(item.data ->> 'videoDuration', ''),
      nullif(item.data ->> 'runtime', ''),
      ''
    )
  )
  into v_duration
  from public.content_items item
  where item.id = p_content_id
    and item.collection in ('videos', 'movies', 'series')
    and coalesce(lower(item.data ->> 'active'), 'true') <> 'false'
  limit 1;

  if not found then
    return 0;
  end if;

  -- Só existe tempo para somar depois que o usuário clicou em Assistir.
  select activity.watch_seconds
    into v_total
  from private.community_watch_daily activity
  where activity.user_id = v_user
    and activity.content_id = p_content_id
    and activity.watched_on = current_date;

  if not found then
    return 0;
  end if;

  -- Sem duração cadastrada, conta o tempo real com teto técnico de 6h.
  if coalesce(v_duration, 0) <= 0 then
    v_duration := 21600;
  end if;

  select s.last_heartbeat_at, s.watched_on, s.closed_at
    into v_previous, v_session_day, v_closed
  from private.community_watch_sessions s
  where s.user_id = v_user and s.session_id = p_session_id
  for update;

  if not found then
    insert into private.community_watch_sessions (
      user_id,
      session_id,
      content_id,
      watched_on,
      last_heartbeat_at,
      closed_at
    ) values (
      v_user,
      p_session_id,
      p_content_id,
      current_date,
      v_now,
      case when p_finish then v_now else null end
    );
    return least(v_duration, coalesce(v_total, 0));
  end if;

  if v_closed is not null then
    return least(v_duration, coalesce(v_total, 0));
  end if;

  if v_session_day <> current_date then
    update private.community_watch_sessions
    set watched_on = current_date,
        content_id = p_content_id,
        last_heartbeat_at = v_now,
        closed_at = case when p_finish then v_now else null end
    where user_id = v_user and session_id = p_session_id;
    return 0;
  end if;

  -- O front envia heartbeat a cada 5s. O servidor usa seu próprio relógio e
  -- aceita no máximo 30s entre heartbeats para evitar crédito artificial grande.
  v_delta := greatest(0, least(30, floor(extract(epoch from (v_now - v_previous)))::integer));

  update private.community_watch_sessions
  set content_id = p_content_id,
      last_heartbeat_at = v_now,
      closed_at = case when p_finish then v_now else null end
  where user_id = v_user and session_id = p_session_id;

  update private.community_watch_daily as activity
  set watch_seconds = least(v_duration, activity.watch_seconds + v_delta)
  where activity.user_id = v_user
    and activity.content_id = p_content_id
    and activity.watched_on = current_date
  returning watch_seconds into v_total;

  return coalesce(v_total, 0);
end;
$$;

alter function public.heartbeat_community_watch(uuid, uuid, boolean) owner to postgres;
revoke all on function public.heartbeat_community_watch(uuid, uuid, boolean) from public, anon;
grant execute on function public.heartbeat_community_watch(uuid, uuid, boolean) to authenticated;

comment on function public.record_community_watch(uuid)
is 'Marks an Assistir click for Continue assistindo without crediting the full content duration.';

comment on function public.heartbeat_community_watch(uuid, uuid, boolean)
is 'Credits real visible detail-page time after Assistir was clicked, capped to the content duration per user/content/day.';

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

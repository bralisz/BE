begin;

-- Quota protection -----------------------------------------------------------
-- Internal only. These rows never need to be exposed through PostgREST.
create table if not exists private.action_rate_limits (
  actor_id uuid not null,
  action text not null,
  window_started timestamptz not null default now(),
  hits integer not null default 1,
  primary key (actor_id, action)
);

create table if not exists private.maintenance_state (
  task text primary key,
  last_run timestamptz not null default now()
);

revoke all on table private.action_rate_limits from public, anon, authenticated;
revoke all on table private.maintenance_state from public, anon, authenticated;

create or replace function private.consume_user_rate_limit(
  p_action text,
  p_window interval,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_allowed boolean := false;
  v_action text := left(lower(trim(coalesce(p_action, ''))), 80);
  v_limit integer := greatest(1, least(coalesce(p_limit, 1), 500));
begin
  if v_user is null or v_action = '' then
    return false;
  end if;

  insert into private.action_rate_limits as rate(actor_id, action, window_started, hits)
  values (v_user, v_action, now(), 1)
  on conflict (actor_id, action) do update set
    window_started = case
      when rate.window_started <= now() - p_window then now()
      else rate.window_started
    end,
    hits = case
      when rate.window_started <= now() - p_window then 1
      else rate.hits + 1
    end
  returning hits <= v_limit into v_allowed;

  return coalesce(v_allowed, false);
end;
$$;

revoke all on function private.consume_user_rate_limit(text, interval, integer) from public, anon, authenticated;

create or replace function private.run_usage_maintenance()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run boolean := false;
begin
  insert into private.maintenance_state as state(task, last_run)
  values ('usage_cleanup', now())
  on conflict (task) do update
    set last_run = excluded.last_run
    where state.last_run < now() - interval '24 hours'
  returning true into v_run;

  if coalesce(v_run, false) then
    delete from private.content_interaction_dedupe
    where event_day < current_date - 14;

    delete from public.tv_pair_sessions
    where expires_at < now() - interval '1 day';

    delete from private.action_rate_limits
    where window_started < now() - interval '1 day';
  end if;
end;
$$;

revoke all on function private.run_usage_maintenance() from public, anon, authenticated;

-- Batch click/view analytics. Saves still use the immediate state-changing RPC.
create or replace function public.track_content_interactions_batch(
  p_events jsonb,
  p_session_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event jsonb;
  v_content_id uuid;
  v_type text;
  v_accepted integer := 0;
begin
  if p_session_id is null or jsonb_typeof(p_events) <> 'array' then
    return 0;
  end if;

  perform private.run_usage_maintenance();

  for v_event in
    select value
    from jsonb_array_elements(p_events)
    limit 25
  loop
    begin
      v_content_id := nullif(trim(v_event ->> 'contentId'), '')::uuid;
    exception when invalid_text_representation then
      v_content_id := null;
    end;
    v_type := lower(trim(coalesce(v_event ->> 'eventType', '')));

    if v_content_id is not null and v_type in ('click', 'view') then
      if public.track_content_interaction(v_content_id, v_type, p_session_id, null) then
        v_accepted := v_accepted + 1;
      end if;
    end if;
  end loop;

  return v_accepted;
end;
$$;

revoke all on function public.track_content_interactions_batch(jsonb, uuid) from public;
grant execute on function public.track_content_interactions_batch(jsonb, uuid) to anon, authenticated;

-- Likes remain responsive but a single signed-in account cannot hammer writes.
create or replace function public.toggle_profile_like(p_username text)
returns table(liked boolean, like_count bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_viewer uuid := auth.uid();
  v_target uuid;
  v_liked boolean := false;
begin
  if v_viewer is null then
    raise exception 'authentication_required';
  end if;
  if not private.consume_user_rate_limit('profile_like', interval '1 minute', 30) then
    raise exception 'rate_limited';
  end if;

  select p.id into v_target
  from public.profiles p
  where p.username = lower(trim(leading '@' from trim(coalesce(p_username, ''))))::public.citext
    and p.banned is false
  limit 1;

  if v_target is null then raise exception 'profile_not_found'; end if;
  if v_target = v_viewer then raise exception 'cannot_like_own_profile'; end if;

  delete from public.profile_likes
  where liker_id = v_viewer and profile_id = v_target;

  if found then
    v_liked := false;
  else
    insert into public.profile_likes(liker_id, profile_id)
    values (v_viewer, v_target)
    on conflict (liker_id, profile_id) do nothing;
    v_liked := true;
  end if;

  return query
  select v_liked,
    (select count(*) from public.profile_likes pl where pl.profile_id = v_target)::bigint;
end;
$$;

revoke all on function public.toggle_profile_like(text) from public;
grant execute on function public.toggle_profile_like(text) to authenticated;

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
  if not private.consume_user_rate_limit('comment_like', interval '1 minute', 45) then
    raise exception 'rate_limited';
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

revoke all on function public.toggle_video_comment_like(uuid) from public;
grant execute on function public.toggle_video_comment_like(uuid) to authenticated;

-- The client also has a 2-minute cooldown. This WHERE protects old clients and
-- multiple tabs from rewriting the same daily watch row every few seconds.
create or replace function public.record_community_watch(p_content_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := clock_timestamp();
begin
  if v_user is null or p_content_id is null then return false; end if;
  if not exists (select 1 from public.profiles p where p.id = v_user and p.banned is false) then return false; end if;
  if not exists (
    select 1 from public.content_items item
    where item.id = p_content_id
      and item.collection in ('videos', 'movies', 'series')
      and coalesce(lower(item.data ->> 'active'), 'true') <> 'false'
  ) then return false; end if;

  insert into private.community_watch_daily as activity(user_id, content_id, watched_on, last_watched_at)
  values (v_user, p_content_id, current_date, v_now)
  on conflict (user_id, content_id, watched_on) do update
    set last_watched_at = excluded.last_watched_at
    where activity.last_watched_at < excluded.last_watched_at - interval '2 minutes';

  return true;
end;
$$;

revoke all on function public.record_community_watch(uuid) from public;
grant execute on function public.record_community_watch(uuid) to authenticated;

-- TV pairing ---------------------------------------------------------------
-- Reuse a valid waiting session for the same device token instead of creating
-- orphan sessions when an old TV loses only one cookie or reloads repeatedly.
create or replace function public.tv_create_session(p_device_token text)
returns table(session_id uuid, pairing_code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := trim(coalesce(p_device_token, ''));
  v_code text;
  v_id uuid;
  v_expires timestamptz;
begin
  if length(v_token) < 24 or length(v_token) > 160 then
    raise exception 'invalid_device_token' using errcode = '22023';
  end if;

  perform private.run_usage_maintenance();

  select s.id, s.pairing_code, s.expires_at
    into v_id, v_code, v_expires
  from public.tv_pair_sessions s
  where s.device_token = v_token
    and s.status = 'waiting'
    and s.owner_id is null
    and s.expires_at > now() + interval '30 seconds'
  order by s.created_at desc
  limit 1;

  if found then
    return query select v_id, v_code, v_expires;
    return;
  end if;

  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1 from public.tv_pair_sessions s where s.pairing_code = v_code
    );
  end loop;

  v_expires := now() + interval '10 minutes';
  insert into public.tv_pair_sessions as s(pairing_code, device_token, expires_at)
  values (v_code, v_token, v_expires)
  returning s.id, s.expires_at into v_id, v_expires;

  return query select v_id, v_code, v_expires;
end;
$$;

revoke all on function public.tv_create_session(text) from public;
grant execute on function public.tv_create_session(text) to anon, authenticated;

-- TV polling still reads current state, but last_seen_at is written at most once
-- every 30 seconds instead of on every poll.
create or replace function public.tv_receiver_state(p_session_id uuid, p_device_token text)
returns table(status text, owner_display_name text, current_media jsonb, media_version bigint, expires_at timestamptz, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := trim(coalesce(p_device_token, ''));
begin
  if p_session_id is null or length(v_token) < 24 then return; end if;

  update public.tv_pair_sessions s
  set last_seen_at = now()
  where s.id = p_session_id
    and s.device_token = v_token
    and s.expires_at > now()
    and s.last_seen_at < now() - interval '30 seconds';

  return query
  select
    s.status,
    coalesce(nullif(p.display_name, ''), nullif(p.username::text, ''), 'Conta conectada') as owner_display_name,
    s.current_media,
    s.media_version,
    s.expires_at,
    s.updated_at
  from public.tv_pair_sessions s
  left join public.profiles p on p.id = s.owner_id
  where s.id = p_session_id
    and s.device_token = v_token
    and s.expires_at > now();
end;
$$;

revoke all on function public.tv_receiver_state(uuid, text) from public;
grant execute on function public.tv_receiver_state(uuid, text) to anon, authenticated;

-- Community overview: preserve the sanitized content payload from the latest
-- hardening migration, but include the already-public avatar ring in the same
-- response so the ranking does not need one get_public_profile RPC per avatar.
create or replace function public.get_community_overview(
  p_watch_period text default 'month',
  p_profile_limit integer default 15,
  p_watch_limit integer default 15
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_profile_limit integer := least(30, greatest(5, coalesce(p_profile_limit, 15)));
  v_result jsonb;
begin
  with eligible_profiles as (
    select
      p.id,p.display_name,p.username::text username,p.avatar_url,p.community_tag,p.created_at,
      case
        when coalesce(up.data->>'profileAvatarBorderColor','') ~ '^#[0-9A-Fa-f]{6}$'
          then upper(up.data->>'profileAvatarBorderColor')
        else ''
      end avatar_border_color
    from public.profiles p
    left join public.user_preferences up on up.user_id=p.id
    where p.banned is false
      and nullif(trim(p.username::text),'') is not null
      and coalesce(up.data->'communityRankingsPublic','true'::jsonb)<>'false'::jsonb
  ), profile_scores as (
    select ep.id,ep.display_name,ep.username,ep.avatar_url,ep.avatar_border_color,ep.community_tag,ep.created_at,count(pl.profile_id)::bigint likes
    from eligible_profiles ep
    left join public.profile_likes pl on pl.profile_id=ep.id
    group by ep.id,ep.display_name,ep.username,ep.avatar_url,ep.avatar_border_color,ep.community_tag,ep.created_at
  ), profile_ranked as (
    select ps.*,row_number() over(order by ps.likes desc,ps.created_at asc,ps.id) position
    from profile_scores ps
  ), recent_content as (
    select activity.content_id,max(activity.last_watched_at) last_watched_at
    from private.community_watch_daily activity
    where v_user is not null and activity.user_id=v_user
    group by activity.content_id
    order by max(activity.last_watched_at) desc
    limit 12
  ), favorite_content as (
    select item.id,item.collection,item.data,insight.saves,insight.updated_at
    from public.content_insights insight
    join public.content_items item on item.id=insight.content_id
    where insight.saves>0
      and item.collection in ('videos','movies','series')
      and coalesce(lower(item.data->>'active'),'true')<>'false'
    order by insight.saves desc,insight.updated_at desc,item.id
    limit 12
  )
  select jsonb_build_object(
    'rankingVisibility',case when v_user is null then null else coalesce((select up.data->'communityRankingsPublic' from public.user_preferences up where up.user_id=v_user),'true'::jsonb) end,
    'recent',coalesce((
      select jsonb_agg(jsonb_build_object(
        'contentId',item.id,
        'collection',item.collection,
        'data',jsonb_strip_nulls(jsonb_build_object(
          'publicId',item.data->'publicId','title',item.data->'title','description',item.data->'description',
          'year',item.data->'year','duration',item.data->'duration','runtime',item.data->'runtime','videoDuration',item.data->'videoDuration',
          'imageUrl',item.data->'imageUrl','thumbnailUrl',item.data->'thumbnailUrl','bannerUrl',item.data->'bannerUrl','logoUrl',item.data->'logoUrl',
          'showCardLogo',item.data->'showCardLogo','sectionId',item.data->'sectionId','sectionName',item.data->'sectionName',
          'category',item.data->'category','type',item.data->'type','mediaType',item.data->'mediaType',
          'streamingAvailability',item.data->'streamingAvailability','streamingLinks',item.data->'streamingLinks',
          'videoUrl',item.data->'videoUrl','contentUrl',item.data->'contentUrl','link',item.data->'link','preserveTitle',item.data->'preserveTitle'
        )),
        'lastWatchedAt',rc.last_watched_at
      ) order by rc.last_watched_at desc)
      from recent_content rc join public.content_items item on item.id=rc.content_id
    ),'[]'::jsonb),
    'fanFavorites',coalesce((
      select jsonb_agg(jsonb_build_object(
        'contentId',fc.id,'collection',fc.collection,
        'data',jsonb_strip_nulls(jsonb_build_object(
          'publicId',fc.data->'publicId','title',fc.data->'title','description',fc.data->'description',
          'year',fc.data->'year','duration',fc.data->'duration','runtime',fc.data->'runtime','videoDuration',fc.data->'videoDuration',
          'imageUrl',fc.data->'imageUrl','thumbnailUrl',fc.data->'thumbnailUrl','bannerUrl',fc.data->'bannerUrl','logoUrl',fc.data->'logoUrl',
          'showCardLogo',fc.data->'showCardLogo','sectionId',fc.data->'sectionId','sectionName',fc.data->'sectionName',
          'category',fc.data->'category','type',fc.data->'type','mediaType',fc.data->'mediaType',
          'streamingAvailability',fc.data->'streamingAvailability','streamingLinks',fc.data->'streamingLinks',
          'videoUrl',fc.data->'videoUrl','contentUrl',fc.data->'contentUrl','link',fc.data->'link','preserveTitle',fc.data->'preserveTitle'
        )),
        'saves',fc.saves,
        'fanAvatars',coalesce((
          select jsonb_agg(jsonb_build_object('displayName',face.display_name,'username',face.username,'avatarUrl',face.avatar_url) order by face.updated_at desc)
          from (
            select p.display_name,p.username::text username,p.avatar_url,state.updated_at
            from private.content_save_states state
            join public.profiles p on state.actor_key=p.id::text
            where state.content_id=fc.id and state.active is true and p.banned is false and nullif(trim(p.username::text),'') is not null
            order by state.updated_at desc,p.id limit 3
          ) face
        ),'[]'::jsonb)
      ) order by fc.saves desc,fc.updated_at desc)
      from favorite_content fc
    ),'[]'::jsonb),
    'profileRanking',coalesce((
      select jsonb_agg(jsonb_build_object(
        'position',pr.position,'displayName',pr.display_name,'username',pr.username,'avatarUrl',pr.avatar_url,
        'avatarBorderColor',pr.avatar_border_color,'communityTag',pr.community_tag,'likes',pr.likes
      ) order by pr.position)
      from profile_ranked pr where pr.position<=v_profile_limit
    ),'[]'::jsonb),
    'myProfilePosition',(
      select jsonb_build_object(
        'position',pr.position,'displayName',pr.display_name,'username',pr.username,'avatarUrl',pr.avatar_url,
        'avatarBorderColor',pr.avatar_border_color,'communityTag',pr.community_tag,'likes',pr.likes
      )
      from profile_ranked pr where pr.id=v_user limit 1
    )
  ) into v_result;

  return coalesce(v_result,'{}'::jsonb);
end;
$$;

revoke all on function public.get_community_overview(text, integer, integer) from public;
grant execute on function public.get_community_overview(text, integer, integer) to anon, authenticated;

-- Trim historical dedupe rows immediately; future cleanup runs at most daily.
delete from private.content_interaction_dedupe
where event_day < current_date - 14;

select pg_notify('pgrst','reload schema');
notify pgrst, 'reload schema';

commit;

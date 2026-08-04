begin;

create table if not exists public.content_insights (
  content_id uuid primary key references public.content_items(id) on delete cascade,
  collection text not null,
  clicks bigint not null default 0 check (clicks >= 0),
  views bigint not null default 0 check (views >= 0),
  saves bigint not null default 0 check (saves >= 0),
  updated_at timestamptz not null default now()
);

alter table public.content_insights enable row level security;
revoke all on table public.content_insights from public, anon, authenticated;
grant all on table public.content_insights to service_role;

create table if not exists private.content_interaction_dedupe (
  actor_key text not null,
  content_id uuid not null references public.content_items(id) on delete cascade,
  event_type text not null check (event_type in ('click', 'view')),
  event_day date not null default current_date,
  created_at timestamptz not null default now(),
  primary key (actor_key, content_id, event_type, event_day)
);

create table if not exists private.content_save_states (
  actor_key text not null,
  content_id uuid not null references public.content_items(id) on delete cascade,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (actor_key, content_id)
);

revoke all on table private.content_interaction_dedupe from public, anon, authenticated;
revoke all on table private.content_save_states from public, anon, authenticated;

create or replace function public.track_content_interaction(
  p_content_id uuid,
  p_event_type text,
  p_session_id uuid,
  p_active boolean default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event text := lower(trim(coalesce(p_event_type, '')));
  v_collection text;
  v_actor_key text;
  v_rows integer := 0;
  v_previous boolean;
  v_delta integer := 0;
begin
  if p_content_id is null or p_session_id is null then
    return false;
  end if;

  if v_event not in ('click', 'view', 'save') then
    return false;
  end if;

  select item.collection
    into v_collection
  from public.content_items as item
  where item.id = p_content_id
    and item.collection in ('videos', 'movies', 'series')
    and coalesce(lower(item.data ->> 'active'), 'true') <> 'false';

  if v_collection is null then
    return false;
  end if;

  v_actor_key := coalesce(auth.uid()::text, p_session_id::text);

  if v_event in ('click', 'view') then
    insert into private.content_interaction_dedupe (
      actor_key, content_id, event_type, event_day
    ) values (
      v_actor_key, p_content_id, v_event, current_date
    )
    on conflict do nothing;

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      return false;
    end if;

    insert into public.content_insights as insight (
      content_id, collection, clicks, views, saves, updated_at
    ) values (
      p_content_id,
      v_collection,
      case when v_event = 'click' then 1 else 0 end,
      case when v_event = 'view' then 1 else 0 end,
      0,
      now()
    )
    on conflict (content_id) do update set
      collection = excluded.collection,
      clicks = insight.clicks + excluded.clicks,
      views = insight.views + excluded.views,
      updated_at = now();

    return true;
  end if;

  if p_active is null then
    return false;
  end if;

  select state.active
    into v_previous
  from private.content_save_states as state
  where state.actor_key = v_actor_key
    and state.content_id = p_content_id;

  if not found then
    insert into private.content_save_states (actor_key, content_id, active, updated_at)
    values (v_actor_key, p_content_id, p_active, now());

    if not p_active then
      return false;
    end if;
    v_delta := 1;
  elsif v_previous = p_active then
    return false;
  else
    update private.content_save_states
    set active = p_active,
        updated_at = now()
    where actor_key = v_actor_key
      and content_id = p_content_id;

    v_delta := case when p_active then 1 else -1 end;
  end if;

  insert into public.content_insights as insight (
    content_id, collection, clicks, views, saves, updated_at
  ) values (
    p_content_id,
    v_collection,
    0,
    0,
    greatest(v_delta, 0),
    now()
  )
  on conflict (content_id) do update set
    collection = excluded.collection,
    saves = greatest(0, insight.saves + v_delta),
    updated_at = now();

  return true;
end;
$$;

alter function public.track_content_interaction(uuid, text, uuid, boolean) owner to postgres;
revoke all on function public.track_content_interaction(uuid, text, uuid, boolean) from public;
grant execute on function public.track_content_interaction(uuid, text, uuid, boolean) to anon, authenticated;

create or replace function public.get_admin_content_insights()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  with content as (
    select
      item.id,
      item.collection,
      item.data,
      coalesce(insight.clicks, 0) as clicks,
      coalesce(insight.views, 0) as views,
      coalesce(insight.saves, 0) as saves,
      coalesce(insight.updated_at, item.updated_at) as metric_updated_at
    from public.content_items as item
    left join public.content_insights as insight on insight.content_id = item.id
    where item.collection in ('videos', 'movies', 'series')
      and coalesce(lower(item.data ->> 'active'), 'true') <> 'false'
  ),
  clicked_leader as (
    select jsonb_build_object(
      'id', id,
      'collection', collection,
      'title', coalesce(nullif(data ->> 'title', ''), 'Conteúdo sem título'),
      'imageUrl', coalesce(nullif(data ->> 'thumbnailUrl', ''), nullif(data ->> 'imageUrl', ''), nullif(data ->> 'bannerUrl', ''), ''),
      'value', clicks
    ) as payload
    from content
    where clicks > 0
    order by clicks desc, metric_updated_at desc
    limit 1
  ),
  saved_leader as (
    select jsonb_build_object(
      'id', id,
      'collection', collection,
      'title', coalesce(nullif(data ->> 'title', ''), 'Conteúdo sem título'),
      'imageUrl', coalesce(nullif(data ->> 'thumbnailUrl', ''), nullif(data ->> 'imageUrl', ''), nullif(data ->> 'bannerUrl', ''), ''),
      'value', saves
    ) as payload
    from content
    where saves > 0
    order by saves desc, metric_updated_at desc
    limit 1
  ),
  viewed_leader as (
    select jsonb_build_object(
      'id', id,
      'collection', collection,
      'title', coalesce(nullif(data ->> 'title', ''), 'Conteúdo sem título'),
      'imageUrl', coalesce(nullif(data ->> 'thumbnailUrl', ''), nullif(data ->> 'imageUrl', ''), nullif(data ->> 'bannerUrl', ''), ''),
      'value', views
    ) as payload
    from content
    where views > 0
    order by views desc, metric_updated_at desc
    limit 1
  )
  select jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'totalContent', (select count(*) from content),
    'totalInteractions', (select coalesce(sum(clicks + views + saves), 0) from content),
    'clicked', (select payload from clicked_leader),
    'saved', (select payload from saved_leader),
    'viewed', (select payload from viewed_leader)
  )
  into v_result;

  return coalesce(v_result, '{}'::jsonb);
end;
$$;

alter function public.get_admin_content_insights() owner to postgres;
revoke all on function public.get_admin_content_insights() from public, anon;
grant execute on function public.get_admin_content_insights() to authenticated;

comment on function public.track_content_interaction(uuid, text, uuid, boolean)
is 'Records privacy-preserving aggregate content interactions without storing email, IP address, or browser details.';

comment on function public.get_admin_content_insights()
is 'Returns aggregate content insights only to authenticated administrators.';

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

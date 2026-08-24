-- BETV: reduce Supabase request volume/CPU while preserving current behavior.

create or replace function public.get_public_home_versions_v1()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with catalog as (
    select
      coalesce(max(c.updated_at), 'epoch'::timestamptz) as updated_at,
      count(*) filter (
        where coalesce(lower(c.data ->> 'active'), 'true') <> 'false'
      )::bigint as item_count
    from public.content_items c
    where c.collection in ('sections','videos','movies','series','featured','news')
  ), site as (
    select coalesce(max(s.updated_at), 'epoch'::timestamptz) as updated_at
    from public.site_settings s
    where s.id = 'site'
  )
  select jsonb_build_object(
    'catalogVersion', concat(
      floor(extract(epoch from catalog.updated_at) * 1000000)::bigint,
      '-',
      catalog.item_count
    ),
    'settingsVersion', floor(extract(epoch from site.updated_at) * 1000000)::bigint::text
  )
  from catalog cross join site;
$$;

revoke all on function public.get_public_home_versions_v1() from public;
grant execute on function public.get_public_home_versions_v1() to anon, authenticated;

create or replace function public.get_public_home_bootstrap_v2(p_locale text default 'pt-br')
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.get_public_home_bootstrap_v1(p_locale)
    || jsonb_build_object('__versions', public.get_public_home_versions_v1());
$$;

revoke all on function public.get_public_home_bootstrap_v2(text) from public;
grant execute on function public.get_public_home_bootstrap_v2(text) to anon, authenticated;

-- Same public contract as before, but uses the citext unique index directly.
create or replace function public.get_public_profile(p_username text)
returns table(
  display_name text,
  username public.citext,
  avatar_url text,
  banner_url text,
  community_tag text,
  profile_color text,
  avatar_border_color text,
  created_at timestamptz,
  social_links jsonb,
  favorites jsonb,
  loved_albums jsonb,
  saved_contents jsonb,
  likes_received bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_normalized text := lower(trim(coalesce(p_username, '')));
begin
  if v_normalized = '' then return; end if;
  return query
  select
    p.display_name,
    p.username,
    p.avatar_url,
    p.banner_url,
    p.community_tag,
    case
      when coalesce(up.data ->> 'profileColor', '') ~ '^#[0-9A-Fa-f]{6}$'
        then upper(up.data ->> 'profileColor')
      else ''
    end,
    case
      when coalesce(up.data ->> 'profileAvatarBorderColor', '') ~ '^#[0-9A-Fa-f]{6}$'
        then upper(up.data ->> 'profileAvatarBorderColor')
      else ''
    end,
    p.created_at,
    coalesce(up.data -> 'profileSocialLinks', '{}'::jsonb),
    coalesce(up.data -> 'profileTopFavorites', '[]'::jsonb),
    coalesce(up.data -> 'profileLovedAlbums', '[]'::jsonb),
    coalesce(up.data -> 'savedContents', '[]'::jsonb),
    (select count(*)::bigint from public.profile_likes pl where pl.profile_id = p.id)
  from public.profiles p
  left join public.user_preferences up on up.user_id = p.id
  where p.username = v_normalized::public.citext
    and p.banned is false
    and nullif(trim(p.username::text), '') is not null
  limit 1;
end;
$$;

-- Comments v2 includes avatar ring data and aggregates likes once, avoiding the
-- frontend N+1 get_public_profile calls for every visible commenter.
create or replace function public.get_video_comments_v2(p_video_key text, p_limit integer default 60)
returns table(
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
rows 60
set search_path = ''
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
    order by vc.created_at desc
    limit least(greatest(coalesce(p_limit, 60), 1), 100)
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
  order by b.created_at desc;
$$;

revoke all on function public.get_video_comments_v2(text, integer) from public;
grant execute on function public.get_video_comments_v2(text, integer) to anon, authenticated;

-- Existing batch RPC now supports save/un-save too, so the browser can send a
-- small queue instead of one network request for every click/view/save event.
create or replace function public.track_content_interactions_batch(p_events jsonb, p_session_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event jsonb;
  v_content_id uuid;
  v_type text;
  v_active boolean;
  v_accepted integer := 0;
begin
  if p_session_id is null or jsonb_typeof(p_events) <> 'array' then return 0; end if;
  perform private.run_usage_maintenance();

  for v_event in select value from jsonb_array_elements(p_events) limit 25 loop
    begin
      v_content_id := nullif(trim(v_event ->> 'contentId'), '')::uuid;
    exception when invalid_text_representation then
      v_content_id := null;
    end;

    v_type := lower(trim(coalesce(v_event ->> 'eventType', '')));
    v_active := case lower(trim(coalesce(v_event ->> 'active', '')))
      when 'true' then true
      when 'false' then false
      else null
    end;

    if v_content_id is not null and v_type in ('click','view','save') then
      if public.track_content_interaction(
        v_content_id,
        v_type,
        p_session_id,
        case when v_type = 'save' then v_active else null end
      ) then
        v_accepted := v_accepted + 1;
      end if;
    end if;
  end loop;

  return v_accepted;
end;
$$;

revoke all on function public.track_content_interactions_batch(jsonb, uuid) from public;
grant execute on function public.track_content_interactions_batch(jsonb, uuid) to anon, authenticated;

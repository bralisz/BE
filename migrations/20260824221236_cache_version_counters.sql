-- Make the lightweight cache-version check O(1): content edits bump two tiny
-- counters instead of scanning content_items every time a browser validates.

create table if not exists private.public_cache_versions (
  scope text primary key,
  version bigint not null,
  updated_at timestamptz not null default now(),
  constraint public_cache_versions_scope_check check (scope in ('catalog','settings'))
);

insert into private.public_cache_versions(scope, version, updated_at)
values
  ('catalog', floor(extract(epoch from clock_timestamp()) * 1000000)::bigint, now()),
  ('settings', floor(extract(epoch from clock_timestamp()) * 1000000)::bigint, now())
on conflict (scope) do nothing;

create or replace function private.bump_public_cache_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scope text := '';
  v_catalog_collections constant text[] := array['sections','videos','movies','series','featured','news'];
begin
  if tg_table_schema = 'public' and tg_table_name = 'content_items' then
    if (tg_op <> 'DELETE' and new.collection = any(v_catalog_collections))
      or (tg_op <> 'INSERT' and old.collection = any(v_catalog_collections)) then
      v_scope := 'catalog';
    end if;
  elsif tg_table_schema = 'public' and tg_table_name = 'site_settings' then
    if (tg_op <> 'DELETE' and new.id = 'site')
      or (tg_op <> 'INSERT' and old.id = 'site') then
      v_scope := 'settings';
    end if;
  end if;

  if v_scope <> '' then
    insert into private.public_cache_versions as current(scope, version, updated_at)
    values (v_scope, floor(extract(epoch from clock_timestamp()) * 1000000)::bigint, now())
    on conflict (scope) do update set
      version = greatest(current.version + 1, excluded.version),
      updated_at = excluded.updated_at;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists content_items_public_cache_version_trigger on public.content_items;
create trigger content_items_public_cache_version_trigger
after insert or update or delete on public.content_items
for each row execute function private.bump_public_cache_version();

drop trigger if exists site_settings_public_cache_version_trigger on public.site_settings;
create trigger site_settings_public_cache_version_trigger
after insert or update or delete on public.site_settings
for each row execute function private.bump_public_cache_version();

create or replace function public.get_public_home_versions_v1()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'catalogVersion', coalesce((select v.version::text from private.public_cache_versions v where v.scope = 'catalog'), '0'),
    'settingsVersion', coalesce((select v.version::text from private.public_cache_versions v where v.scope = 'settings'), '0')
  );
$$;

revoke all on function public.get_public_home_versions_v1() from public;
grant execute on function public.get_public_home_versions_v1() to anon, authenticated;

begin;

create or replace function private.skip_identical_row_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new is not distinct from old then
    return null;
  end if;
  return new;
end;
$$;

alter function private.skip_identical_row_update() owner to postgres;
revoke all on function private.skip_identical_row_update() from public, anon, authenticated;

drop trigger if exists content_items_skip_identical_update on public.content_items;
create trigger content_items_skip_identical_update
before update on public.content_items
for each row
execute function private.skip_identical_row_update();

drop trigger if exists site_settings_skip_identical_update on public.site_settings;
create trigger site_settings_skip_identical_update
before update on public.site_settings
for each row
execute function private.skip_identical_row_update();

create or replace function private.broadcast_user_preferences_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := coalesce(new.user_id, old.user_id);
begin
  if tg_op = 'UPDATE' and new.data is not distinct from old.data then
    return null;
  end if;

  perform realtime.broadcast_changes(
    'user-sync:' || v_user_id::text,
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );
  return null;
end;
$$;

alter function private.broadcast_user_preferences_sync() owner to postgres;

comment on function private.skip_identical_row_update()
is 'Skips exact no-op UPDATEs to avoid unnecessary WAL, dead tuples, trigger work and Disk IO.';

comment on function private.broadcast_user_preferences_sync()
is 'Broadcasts user preference changes, but skips UPDATE broadcasts when preference JSON is unchanged.';

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

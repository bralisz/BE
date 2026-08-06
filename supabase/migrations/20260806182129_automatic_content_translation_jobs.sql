-- Traduz automaticamente conteúdo público novo ou editado para inglês e espanhol.
-- A Edge Function ignora alterações que modificam somente o objeto `translations`,
-- impedindo recursão entre o trigger e o salvamento da tradução.

create extension if not exists pg_net with schema extensions;

grant select, update on public.content_items, public.site_settings to service_role;

create or replace function private.enqueue_betv_translation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_collection text;
  v_id text;
begin
  if tg_op = 'UPDATE'
     and (new.data - 'translations') is not distinct from (old.data - 'translations') then
    return new;
  end if;

  if tg_table_name = 'content_items' then
    v_collection := new.collection;
    if v_collection not in (
      'contents', 'featured', 'movies', 'notifications',
      'ongs', 'sections', 'series', 'videos'
    ) then
      return new;
    end if;
  elsif tg_table_name = 'site_settings' then
    v_collection := 'settings';
    if new.id not in ('site', 'billie-eilish', 'ong') then
      return new;
    end if;
  else
    return new;
  end if;

  v_id := new.id::text;

  perform net.http_post(
    url := 'https://cxkevnnxibhezvospkce.supabase.co/functions/v1/translate-content-record',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'collection', v_collection,
      'ids', jsonb_build_array(v_id),
      'locales', jsonb_build_array('en-us', 'es')
    ),
    timeout_milliseconds := 30000
  );

  return new;
exception when others then
  raise warning 'BETV translation job could not be queued: %', sqlerrm;
  return new;
end;
$$;

revoke all on function private.enqueue_betv_translation() from public;

drop trigger if exists content_items_auto_translate on public.content_items;
create trigger content_items_auto_translate
after insert or update of data on public.content_items
for each row execute function private.enqueue_betv_translation();

drop trigger if exists site_settings_auto_translate on public.site_settings;
create trigger site_settings_auto_translate
after insert or update of data on public.site_settings
for each row execute function private.enqueue_betv_translation();

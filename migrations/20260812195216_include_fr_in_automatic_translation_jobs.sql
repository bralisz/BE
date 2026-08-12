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
  if tg_op = 'UPDATE' and (new.data - 'translations') is not distinct from (old.data - 'translations') then
    return new;
  end if;

  if tg_table_name = 'content_items' then
    v_collection := new.collection;
    if v_collection not in ('contents','featured','movies','notifications','ongs','sections','series','videos') then return new; end if;
  elsif tg_table_name = 'site_settings' then
    v_collection := 'settings';
    if new.id not in ('site','billie-eilish','ong') then return new; end if;
  else
    return new;
  end if;

  v_id := new.id::text;
  perform net.http_post(
    url := 'https://cxkevnnxibhezvospkce.supabase.co/functions/v1/translate-content-record',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := jsonb_build_object(
      'collection',v_collection,
      'ids',jsonb_build_array(v_id),
      'locales',jsonb_build_array('en-us','es','fr')
    ),
    timeout_milliseconds := 30000
  );
  return new;
exception when others then
  raise warning 'BETV translation job could not be queued: %',sqlerrm;
  return new;
end;
$$;

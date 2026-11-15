-- Public catalog exposes series episodes without disclosing unpublished episode entries.
-- The definitions keep their existing SECURITY DEFINER and search_path settings.
do $migration$
declare
  fn record;
  definition text;
  before_fragment text := '''duration'', c.data -> ''duration'',';
  after_fragment text := '''duration'', c.data -> ''duration'',
      ''episodes'', case
        when c.collection = ''series'' and jsonb_typeof(c.data -> ''episodes'') = ''array''
        then (
          select coalesce(jsonb_agg(ep.value), ''[]''::jsonb)
          from jsonb_array_elements(c.data -> ''episodes'') as ep(value)
          where coalesce(lower(ep.value ->> ''active''), ''true'') = ''true''
        )
        else null
      end,';
begin
  for fn in
    select p.oid, p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('get_public_content_items', 'get_public_content_items_v2')
  loop
    definition := pg_get_functiondef(fn.oid);
    if position('''episodes'', case' in definition) > 0 then
      continue;
    end if;
    if position(before_fragment in definition) = 0 then
      raise exception 'Expected duration entry not found in function %', fn.proname;
    end if;
    definition := replace(definition, before_fragment, after_fragment);
    execute definition;
  end loop;
end
$migration$;

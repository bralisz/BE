begin;

-- Nomes de músicas permanecem no idioma original nas seções de videoclipes
-- e apresentações ao vivo. As descrições e os demais campos continuam traduzidos.
update public.content_items
set data = jsonb_set(
  data,
  '{translations}',
  jsonb_strip_nulls(
    jsonb_build_object(
      'en-us', case
        when jsonb_typeof(data -> 'translations' -> 'en-us') = 'object'
          then (data -> 'translations' -> 'en-us') - 'title' - 'name'
        else null
      end,
      'es', case
        when jsonb_typeof(data -> 'translations' -> 'es') = 'object'
          then (data -> 'translations' -> 'es') - 'title' - 'name'
        else null
      end
    )
  ),
  true
)
where collection = 'videos'
  and lower(coalesce(data ->> 'sectionName', '')) in (
    'videoclipes',
    'live performances & tv'
  );

commit;

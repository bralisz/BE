-- Mantém nomes oficiais de filmes, músicas, álbuns e a seção Vanity Fair em espanhol.
update public.content_items
set data = jsonb_set(
  data,
  '{translations,es}',
  (coalesce(data #> '{translations,es}', '{}'::jsonb) - 'title' - 'name'),
  true
)
where jsonb_typeof(data #> '{translations,es}') = 'object'
  and (
    collection in ('movies', 'news')
    or (
      collection = 'sections'
      and lower(trim(coalesce(data->>'title', data->>'name', ''))) = 'vanity fair'
    )
    or (
      collection = 'videos'
      and (
        coalesce(data->>'sectionId', '') in (
          '14386598-4978-403a-8548-db0ee582e291',
          '18db9515-179c-4bad-9646-1fcda63df14a'
        )
        or lower(trim(coalesce(data->>'sectionName', data->>'sourceSectionTitle', ''))) in (
          'live performances & tv',
          'videoclipes'
        )
        or lower(concat_ws(' ', data->>'sectionName', data->>'sourceSectionTitle', data->>'category', data->>'type', data->>'contentType'))
          ~ '(^|[[:space:]])(music|musica|música|song|faixa|track|album|álbum|videoclipe|live performances)([[:space:]]|$)'
      )
    )
  );

-- Corrige traduções espanholas que ficaram sem `title`/`name`.
-- O catálogo pode depender dessas chaves, então mantemos o valor oficial
-- original dentro de translations.es em vez de apagar as propriedades.
update public.content_items
set data = jsonb_set(
  data,
  '{translations,es}',
  (data #> '{translations,es}')
    || case
         when nullif(btrim(coalesce(data->>'title', '')), '') is not null
           then jsonb_build_object('title', data->>'title')
         else '{}'::jsonb
       end
    || case
         when nullif(btrim(coalesce(data->>'name', '')), '') is not null
           then jsonb_build_object('name', data->>'name')
         else '{}'::jsonb
       end,
  false
)
where jsonb_typeof(data #> '{translations,es}') = 'object'
  and (
    collection = 'news'
    or (
      collection in ('videos', 'contents', 'featured')
      and (
        coalesce(data->>'sectionId', '') in (
          '14386598-4978-403a-8548-db0ee582e291',
          '18db9515-179c-4bad-9646-1fcda63df14a'
        )
        or lower(trim(coalesce(data->>'sectionName', data->>'sourceSectionTitle', ''))) in (
          'live performances & tv',
          'videoclipes'
        )
        or lower(concat_ws(
          ' ',
          data->>'sectionName',
          data->>'sourceSectionTitle',
          data->>'category',
          data->>'type',
          data->>'contentType',
          data->>'itemType'
        )) ~ '(^|[[:space:]._/?:=&-])(music|musica|música|song|faixa|track|album|álbum|videoclipe|live performances)($|[[:space:]._/?:=&-])'
      )
    )
  );

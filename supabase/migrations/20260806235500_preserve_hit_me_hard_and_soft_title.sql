-- Mantém o nome oficial do álbum em inglês em todas as traduções espanholas.
update public.content_items
set data = replace(
  replace(
    replace(
      replace(
        replace(data::text, 'Pégame fuerte y suave', 'Hit Me Hard and Soft'),
        'PÉGAME FUERTE Y SUAVE', 'Hit Me Hard and Soft'
      ),
      'Pégame duro y suave', 'Hit Me Hard and Soft'
    ),
    'PÉGAME DURO Y SUAVE', 'Hit Me Hard and Soft'
  ),
  'GÉLAME DURO Y SUAVE', 'Hit Me Hard and Soft'
)::jsonb
where data::text ilike '%pégame%fuerte%suave%'
   or data::text ilike '%pégame%duro%suave%'
   or data::text ilike '%gélame%duro%suave%';

-- Títulos oficiais completos também não devem ficar parcialmente traduzidos.
update public.content_items
set data = jsonb_set(
  data,
  '{translations,es,title}',
  to_jsonb(data->>'title'),
  true
)
where lower(btrim(coalesce(data->>'title',''))) = 'hit me hard and soft: the tour'
  and jsonb_typeof(data #> '{translations,es}') = 'object';

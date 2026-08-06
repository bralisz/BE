-- Mantém os títulos originais dos vídeos de Concert e Behind The Scenes no catálogo em espanhol.
-- As descrições e os demais campos continuam usando a tradução automática.
update public.content_items
set data = jsonb_set(
  data,
  '{translations,es}',
  (data #> '{translations,es}') - 'title' - 'name',
  false
)
where collection = 'videos'
  and jsonb_typeof(data #> '{translations,es}') = 'object'
  and (
    coalesce(data->>'sectionId', '') in (
      'e995b960-503c-4d67-8d7c-87cbd6eda6a2',
      '76295393-0c1d-483f-a48c-eea38f1057df'
    )
    or lower(trim(coalesce(data->>'sectionName', data->>'sourceSectionTitle', ''))) in (
      'concert',
      'concierto',
      'behind the scenes',
      'detrás de escena',
      'detras de escena'
    )
  );

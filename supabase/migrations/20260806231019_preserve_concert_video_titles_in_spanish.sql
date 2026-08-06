with target as (
  select
    id,
    data,
    case
      when jsonb_typeof(data->'translations') = 'object' then data->'translations'
      else '{}'::jsonb
    end as translations,
    case
      when jsonb_typeof(data->'translations'->'es') = 'object' then data->'translations'->'es'
      else '{}'::jsonb
    end as spanish
  from public.content_items
  where collection = 'videos'
    and (
      data->>'sectionId' in (
        '14386598-4978-403a-8548-db0ee582e291',
        '18db9515-179c-4bad-9646-1fcda63df14a',
        'e995b960-503c-4d67-8d7c-87cbd6eda6a2'
      )
      or lower(btrim(coalesce(data->>'sectionName', data->>'sourceSectionTitle', ''))) in (
        'live performances & tv',
        'videoclipes',
        'concert',
        'concierto'
      )
      or lower(btrim(coalesce(data->>'category', ''))) in ('concert', 'concierto')
    )
    and nullif(btrim(coalesce(data->>'title', data->>'name', '')), '') is not null
)
update public.content_items as item
set data = item.data || jsonb_build_object(
  'translations',
  target.translations || jsonb_build_object(
    'es',
    target.spanish || jsonb_strip_nulls(jsonb_build_object(
      'title', nullif(btrim(target.data->>'title'), ''),
      'name', nullif(btrim(target.data->>'name'), '')
    ))
  )
)
from target
where item.id = target.id;

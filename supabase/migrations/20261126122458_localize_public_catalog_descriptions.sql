CREATE OR REPLACE FUNCTION public.get_public_content_items_v2(p_collection text, p_id text DEFAULT NULL::text, p_locale text DEFAULT 'pt-br'::text)
 RETURNS SETOF jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  with params as (
    select case lower(trim(coalesce(p_locale, 'pt-br')))
      when 'en' then 'en-us'
      when 'en-us' then 'en-us'
      when 'es' then 'es'
      when 'es-419' then 'es'
      when 'fr' then 'fr'
      when 'it' then 'it'
      else 'pt-br'
    end as locale
  )
  select jsonb_build_object(
    'id', c.id::text,
    'data', jsonb_strip_nulls(jsonb_build_object(
      'active', c.data -> 'active',
      'bannerUrl', c.data -> 'bannerUrl',
      'category', c.data -> 'category',
      'contentCollection', c.data -> 'contentCollection',
      'contentId', c.data -> 'contentId',
      'contentUrl', c.data -> 'contentUrl',
      'description', case when c.collection in ('videos','movies','series') and p.locale <> 'pt-br' then
        coalesce(nullif(btrim(c.data #>> array['translations', p.locale, 'description']), ''),
                 case when p.locale = 'en-us' then nullif(btrim(c.data #>> '{translations,en,description}'), '') end,
                 c.data ->> 'description')
        else c.data ->> 'description' end,
      'duration', c.data -> 'duration',
      'episodes', case
        when c.collection = 'series' and jsonb_typeof(c.data -> 'episodes') = 'array'
        then (
          select coalesce(jsonb_agg(ep.value), '[]'::jsonb)
          from jsonb_array_elements(c.data -> 'episodes') as ep(value)
          where coalesce(lower(ep.value ->> 'active'), 'true') = 'true'
        )
        else null
      end,
      'imageUrl', c.data -> 'imageUrl',
      'itemLimit', c.data -> 'itemLimit',
      'itemType', c.data -> 'itemType',
      'link', c.data -> 'link',
      'logoUrl', c.data -> 'logoUrl',
      'mediaType', c.data -> 'mediaType',
      'mobileAppDriveUrl', c.data -> 'mobileAppDriveUrl',
      'minimumDonationCents', c.data -> 'minimumDonationCents',
      'minimumDonationUsdCents', c.data -> 'minimumDonationUsdCents',
      'order', c.data -> 'order',
      'publicId', c.data -> 'publicId',
      'runtime', c.data -> 'runtime',
      'sectionId', c.data -> 'sectionId',
      'sectionName', c.data -> 'sectionName',
      'showCardLogo', c.data -> 'showCardLogo',
      'slug', c.data -> 'slug',
      'sourceCollection', c.data -> 'sourceCollection',
      'streamingAvailability', c.data -> 'streamingAvailability',
      'streamingLinks', c.data -> 'streamingLinks',
      'subtitleUrl', case p.locale
        when 'pt-br' then coalesce(
          nullif(c.data #>> '{subtitleTracks,pt-br}', ''),
          nullif(c.data #>> '{subtitleTracks,pt}', ''),
          nullif(c.data ->> 'subtitleUrl', '')
        )
        when 'en-us' then coalesce(
          nullif(c.data #>> '{subtitleTracks,en-us}', ''),
          nullif(c.data #>> '{subtitleTracks,en}', '')
        )
        when 'es' then nullif(c.data #>> '{subtitleTracks,es}', '')
        when 'fr' then nullif(c.data #>> '{subtitleTracks,fr}', '')
        when 'it' then nullif(c.data #>> '{subtitleTracks,it}', '')
        else null
      end,
      'thumbnailUrl', c.data -> 'thumbnailUrl',
      'title', c.data -> 'title',
      'tracks', c.data -> 'tracks',
      'translations', case
        when p.locale = 'pt-br' then null
        when p.locale = 'en-us' and coalesce(c.data -> 'translations' -> 'en-us', c.data -> 'translations' -> 'en') is not null
          then jsonb_build_object('en-us', coalesce(c.data -> 'translations' -> 'en-us', c.data -> 'translations' -> 'en'))
        when p.locale in ('es','fr','it') and c.data -> 'translations' -> p.locale is not null
          then jsonb_build_object(p.locale, c.data -> 'translations' -> p.locale)
        else null
      end,
      'type', c.data -> 'type',
      'videoDuration', c.data -> 'videoDuration',
      'videoId', c.data -> 'videoId',
      'videoUrl', c.data -> 'videoUrl',
      'year', c.data -> 'year'
    )),
    'created_at', c.created_at,
    'updated_at', c.updated_at
  )
  from public.content_items c
  cross join params p
  where c.collection = lower(trim(p_collection))
    and c.collection in ('contents','featured','gallery','movies','news','notifications','ongs','sections','series','videos')
    and coalesce(lower(c.data ->> 'active'), 'true') = 'true'
    and (p_id is null or c.id::text = p_id)
  order by
    case when coalesce(c.data ->> 'order', '') ~ '^-?[0-9]+(?:\.[0-9]+)?$' then (c.data ->> 'order')::numeric else 0 end,
    c.created_at;
$function$;

-- Invalidate catalog snapshots produced before descriptions were localized.
update private.public_cache_versions
set version = greatest(version + 1, floor(extract(epoch from clock_timestamp()) * 1000000)::bigint),
    updated_at = now()
where scope = 'catalog';

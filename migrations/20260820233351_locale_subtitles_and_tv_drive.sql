begin;

-- Lê as faixas já salvas pelo Dashboard e entrega apenas a legenda do idioma
-- solicitado. Português mantém o campo legado como compatibilidade; os outros
-- idiomas nunca recebem fallback em PT.
create or replace function public.get_public_content_items_v2(
  p_collection text,
  p_id text default null,
  p_locale text default 'pt-br'
)
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $function$
  with params as (
    select case lower(trim(coalesce(p_locale, 'pt-br')))
      when 'en' then 'en-us'
      when 'en-us' then 'en-us'
      when 'es' then 'es'
      when 'fr' then 'fr'
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
      'description', c.data -> 'description',
      'duration', c.data -> 'duration',
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
        else null
      end,
      'thumbnailUrl', c.data -> 'thumbnailUrl',
      'title', c.data -> 'title',
      'tracks', c.data -> 'tracks',
      'translations', case
        when p.locale = 'pt-br' then null
        when p.locale = 'en-us' and coalesce(c.data -> 'translations' -> 'en-us', c.data -> 'translations' -> 'en') is not null
          then jsonb_build_object('en-us', coalesce(c.data -> 'translations' -> 'en-us', c.data -> 'translations' -> 'en'))
        when p.locale in ('es','fr') and c.data -> 'translations' -> p.locale is not null
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

-- Mantém o RPC antigo seguro para clientes PT-BR e inclui o link alternativo
-- do Drive utilizado pela transmissão para Smart TV.
create or replace function public.get_public_content_items(p_collection text, p_id text default null::text)
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $function$
  select jsonb_build_object(
    'id', c.id::text,
    'data', jsonb_strip_nulls(jsonb_build_object(
      'active', c.data -> 'active',
      'bannerUrl', c.data -> 'bannerUrl',
      'category', c.data -> 'category',
      'contentCollection', c.data -> 'contentCollection',
      'contentId', c.data -> 'contentId',
      'contentUrl', c.data -> 'contentUrl',
      'description', c.data -> 'description',
      'duration', c.data -> 'duration',
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
      'slug', c.data -> 'slug',
      'sourceCollection', c.data -> 'sourceCollection',
      'streamingAvailability', c.data -> 'streamingAvailability',
      'streamingLinks', c.data -> 'streamingLinks',
      'subtitleUrl', coalesce(
        nullif(c.data #>> '{subtitleTracks,pt-br}', ''),
        nullif(c.data #>> '{subtitleTracks,pt}', ''),
        nullif(c.data ->> 'subtitleUrl', '')
      ),
      'thumbnailUrl', c.data -> 'thumbnailUrl',
      'title', c.data -> 'title',
      'tracks', c.data -> 'tracks',
      'translations', c.data -> 'translations',
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
  where c.collection = lower(trim(p_collection))
    and c.collection in ('contents','featured','gallery','movies','news','notifications','ongs','sections','series','videos')
    and coalesce(lower(c.data ->> 'active'), 'true') = 'true'
    and (p_id is null or c.id::text = p_id)
  order by
    case when coalesce(c.data ->> 'order', '') ~ '^-?[0-9]+(?:\.[0-9]+)?$' then (c.data ->> 'order')::numeric else 0 end,
    c.created_at;
$function$;

alter function public.get_public_content_items_v2(text,text,text) owner to postgres;
revoke all on function public.get_public_content_items_v2(text,text,text) from public;
grant execute on function public.get_public_content_items_v2(text,text,text) to anon, authenticated;

alter function public.get_public_content_items(text,text) owner to postgres;
revoke all on function public.get_public_content_items(text,text) from public;
grant execute on function public.get_public_content_items(text,text) to anon, authenticated;

comment on function public.get_public_content_items_v2(text,text,text)
is 'Locale-aware public content payload using existing movie and series subtitle tracks plus Smart TV Drive fallback.';

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

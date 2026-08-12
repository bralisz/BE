begin;

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

alter function public.get_public_content_items_v2(text,text,text) owner to postgres;
revoke all on function public.get_public_content_items_v2(text,text,text) from public;
grant execute on function public.get_public_content_items_v2(text,text,text) to anon, authenticated;

create or replace function public.get_public_site_setting_v2(
  p_id text,
  p_locale text default 'pt-br'
)
returns jsonb
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
  ), src as (
    select s.*, p.locale,
      case
        when p.locale = 'pt-br' then null
        when p.locale = 'en-us' and coalesce(s.data -> 'translations' -> 'en-us', s.data -> 'translations' -> 'en') is not null
          then jsonb_build_object('en-us', coalesce(s.data -> 'translations' -> 'en-us', s.data -> 'translations' -> 'en'))
        when p.locale in ('es','fr') and s.data -> 'translations' -> p.locale is not null
          then jsonb_build_object(p.locale, s.data -> 'translations' -> p.locale)
        else null
      end as selected_translations
    from public.site_settings s
    cross join params p
    where s.id = p_id and s.id in ('site','billie-eilish','ong')
    limit 1
  )
  select case src.id
    when 'site' then jsonb_strip_nulls(jsonb_build_object(
      'siteName', src.data -> 'siteName',
      'description', src.data -> 'description',
      'primaryColor', src.data -> 'primaryColor',
      'footerText', src.data -> 'footerText',
      'instagram', src.data -> 'instagram',
      'xUrl', src.data -> 'xUrl',
      'youtube', src.data -> 'youtube',
      'website', src.data -> 'website',
      'discordUrl', src.data -> 'discordUrl',
      'shareImage', src.data -> 'shareImage',
      'updateReleaseEnabled', src.data -> 'updateReleaseEnabled',
      'releasedDeploymentVersion', src.data -> 'releasedDeploymentVersion',
      'translations', src.selected_translations
    ))
    when 'billie-eilish' then jsonb_strip_nulls(jsonb_build_object(
      'sourceMode', src.data -> 'sourceMode',
      'title', src.data -> 'title',
      'kicker', src.data -> 'kicker',
      'portraitUrl', src.data -> 'portraitUrl',
      'bannerUrl', src.data -> 'bannerUrl',
      'manualBio', src.data -> 'manualBio',
      'includeReferences', src.data -> 'includeReferences',
      'instagram', src.data -> 'instagram',
      'xUrl', src.data -> 'xUrl',
      'youtube', src.data -> 'youtube',
      'spotify', src.data -> 'spotify',
      'website', src.data -> 'website',
      'translations', src.selected_translations
    ))
    when 'ong' then jsonb_strip_nulls(jsonb_build_object(
      'bannerUrl', src.data -> 'bannerUrl',
      'translations', src.selected_translations
    ))
    else null
  end
  from src;
$function$;

alter function public.get_public_site_setting_v2(text,text) owner to postgres;
revoke all on function public.get_public_site_setting_v2(text,text) from public;
grant execute on function public.get_public_site_setting_v2(text,text) to anon, authenticated;

comment on function public.get_public_content_items_v2(text,text,text)
is 'Locale-aware public content payload that returns only the requested translation to reduce database egress.';

comment on function public.get_public_site_setting_v2(text,text)
is 'Locale-aware public site setting payload that returns only the requested translation to reduce database egress.';

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

-- Expõe o bundle compartilhado de traduções da interface apenas para /it.
-- Isso evita que cada navegador novo precise reconstruir centenas de textos
-- via Edge Function e mantém o payload dos outros idiomas inalterado.
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
      when 'it' then 'it'
      else 'pt-br'
    end as locale
  ), src as (
    select s.*, p.locale,
      case
        when p.locale = 'pt-br' then null
        when p.locale = 'en-us' and coalesce(s.data -> 'translations' -> 'en-us', s.data -> 'translations' -> 'en') is not null
          then jsonb_build_object('en-us', coalesce(s.data -> 'translations' -> 'en-us', s.data -> 'translations' -> 'en'))
        when p.locale in ('es','fr','it') and s.data -> 'translations' -> p.locale is not null
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
      'italianUiTranslations', case when src.locale = 'it' then src.data -> 'italianUiTranslations' else null end,
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

revoke all on function public.get_public_site_setting_v2(text,text) from public;
grant execute on function public.get_public_site_setting_v2(text,text) to anon, authenticated;

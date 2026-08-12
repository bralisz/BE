-- Liberação manual de avisos de atualização do site pelo painel administrativo.
create or replace function public.get_public_site_setting(p_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case s.id
    when 'site' then jsonb_strip_nulls(jsonb_build_object(
      'siteName', s.data -> 'siteName',
      'description', s.data -> 'description',
      'primaryColor', s.data -> 'primaryColor',
      'footerText', s.data -> 'footerText',
      'instagram', s.data -> 'instagram',
      'xUrl', s.data -> 'xUrl',
      'youtube', s.data -> 'youtube',
      'website', s.data -> 'website',
      'discordUrl', s.data -> 'discordUrl',
      'shareImage', s.data -> 'shareImage',
      'updateReleaseEnabled', s.data -> 'updateReleaseEnabled',
      'releasedDeploymentVersion', s.data -> 'releasedDeploymentVersion',
      'translations', s.data -> 'translations'
    ))
    when 'billie-eilish' then jsonb_strip_nulls(jsonb_build_object(
      'sourceMode', s.data -> 'sourceMode',
      'title', s.data -> 'title',
      'kicker', s.data -> 'kicker',
      'portraitUrl', s.data -> 'portraitUrl',
      'bannerUrl', s.data -> 'bannerUrl',
      'manualBio', s.data -> 'manualBio',
      'includeReferences', s.data -> 'includeReferences',
      'instagram', s.data -> 'instagram',
      'xUrl', s.data -> 'xUrl',
      'youtube', s.data -> 'youtube',
      'spotify', s.data -> 'spotify',
      'website', s.data -> 'website',
      'translations', s.data -> 'translations'
    ))
    when 'ong' then jsonb_strip_nulls(jsonb_build_object(
      'bannerUrl', s.data -> 'bannerUrl',
      'translations', s.data -> 'translations'
    ))
    else null
  end
  from public.site_settings s
  where s.id = p_id
    and s.id in ('site', 'billie-eilish', 'ong')
  limit 1;
$$;

revoke all on function public.get_public_site_setting(text) from public;
grant execute on function public.get_public_site_setting(text) to anon, authenticated;

notify pgrst, 'reload schema';

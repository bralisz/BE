-- Reduz o bootstrap público da Home para uma única chamada RPC ao Supabase.
-- As funções internas já aplicam o payload público/locale e as respectivas regras de segurança.
create or replace function public.get_public_home_bootstrap_v1(p_locale text default 'pt-br')
returns jsonb
language sql
stable
set search_path = ''
as $function$
  select jsonb_build_object(
    'sections', coalesce((select jsonb_agg(t.item) from public.get_public_content_items_v2('sections', null, p_locale) as t(item)), '[]'::jsonb),
    'videos', coalesce((select jsonb_agg(t.item) from public.get_public_content_items_v2('videos', null, p_locale) as t(item)), '[]'::jsonb),
    'movies', coalesce((select jsonb_agg(t.item) from public.get_public_content_items_v2('movies', null, p_locale) as t(item)), '[]'::jsonb),
    'series', coalesce((select jsonb_agg(t.item) from public.get_public_content_items_v2('series', null, p_locale) as t(item)), '[]'::jsonb),
    'featured', coalesce((select jsonb_agg(t.item) from public.get_public_content_items_v2('featured', null, p_locale) as t(item)), '[]'::jsonb),
    'news', coalesce((select jsonb_agg(t.item) from public.get_public_content_items_v2('news', null, p_locale) as t(item)), '[]'::jsonb),
    'settings', jsonb_build_object('site', public.get_public_site_setting_v2('site', p_locale))
  );
$function$;

revoke all on function public.get_public_home_bootstrap_v1(text) from public;
grant execute on function public.get_public_home_bootstrap_v1(text) to anon, authenticated;

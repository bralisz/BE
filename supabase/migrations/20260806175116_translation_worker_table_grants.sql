-- Permite que a Edge Function de tradução leia e salve somente nas tabelas necessárias.
grant select, update on public.content_items, public.site_settings to service_role;

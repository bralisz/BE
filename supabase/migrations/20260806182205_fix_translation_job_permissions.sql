begin;
grant usage on schema public to service_role;
grant select, update on public.content_items to service_role;
grant select, update on public.site_settings to service_role;
commit;

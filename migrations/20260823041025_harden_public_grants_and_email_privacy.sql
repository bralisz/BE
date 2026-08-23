begin;

-- Prevent public account enumeration.
revoke all on function public.account_exists(text) from public, anon, authenticated;
grant execute on function public.account_exists(text) to service_role;

-- Sensitive account/admin actions must not be anonymous.
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated, service_role;
revoke all on function public.get_admin_dashboard_metrics() from public, anon;
grant execute on function public.get_admin_dashboard_metrics() to authenticated, service_role;

-- Remove historical excessive table grants; RLS remains the authorization layer.
revoke all on table public.admin_logs from anon;
revoke all on table public.content_items from anon;
revoke all on table public.site_settings from anon;
revoke references, trigger, truncate on table public.admin_logs from authenticated;
revoke references, trigger, truncate on table public.content_items from authenticated;
revoke references, trigger, truncate on table public.site_settings from authenticated;
revoke references, trigger, truncate on table public.profiles from authenticated;

grant select, insert, update, delete on table public.admin_logs to authenticated;
grant select, insert, update, delete on table public.content_items to authenticated;
grant select, insert, update, delete on table public.site_settings to authenticated;
grant select on table public.profiles to authenticated;

select pg_notify('pgrst', 'reload schema');
commit;

revoke all on function public.get_admin_featured_fans() from public, anon;
revoke all on function public.admin_set_featured_fan(uuid, boolean) from public, anon;
revoke all on function public.get_admin_fan_communities() from public, anon;
revoke all on function public.admin_upsert_fan_community(uuid, text, text, text, text, boolean, integer) from public, anon;
revoke all on function public.admin_delete_fan_community(uuid) from public, anon;

grant execute on function public.get_admin_featured_fans() to authenticated;
grant execute on function public.admin_set_featured_fan(uuid, boolean) to authenticated;
grant execute on function public.get_admin_fan_communities() to authenticated;
grant execute on function public.admin_upsert_fan_community(uuid, text, text, text, text, boolean, integer) to authenticated;
grant execute on function public.admin_delete_fan_community(uuid) to authenticated;

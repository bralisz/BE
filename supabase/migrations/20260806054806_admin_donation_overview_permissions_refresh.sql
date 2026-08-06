begin;
revoke all on function public.get_admin_donation_overview(text, integer) from public, anon;
grant execute on function public.get_admin_donation_overview(text, integer) to authenticated;
notify pgrst, 'reload schema';
commit;

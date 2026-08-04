grant execute on function public.account_exists(text) to anon, authenticated;
comment on function public.account_exists(text) is 'Used by the BETV login screen to choose between sign-in and account creation.';

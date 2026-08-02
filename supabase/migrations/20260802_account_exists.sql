-- Execute uma vez no SQL Editor do Supabase para ativar a identificação
-- automática entre contas existentes e novos cadastros.
create or replace function public.account_exists(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where lower(u.email) = lower(trim(coalesce(p_email, '')))
  );
$$;

alter function public.account_exists(text) owner to postgres;
revoke all on function public.account_exists(text) from public;
grant execute on function public.account_exists(text) to anon, authenticated;

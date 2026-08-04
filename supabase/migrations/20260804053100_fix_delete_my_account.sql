-- Recria a função de exclusão da própria conta e força o PostgREST a atualizar o cache.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Usuário não autenticado';
  end if;

  delete from auth.users where id = v_uid;
end;
$$;

alter function public.delete_my_account() owner to postgres;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

select pg_notify('pgrst', 'reload schema');

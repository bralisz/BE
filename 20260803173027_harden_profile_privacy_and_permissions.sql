begin;

alter table public.profiles
  add column if not exists banner_url text not null default '',
  add column if not exists banner_id text not null default '';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

alter function public.is_admin() owner to postgres;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

revoke all on function public.account_exists(text) from public, anon, authenticated;

alter table public.profiles enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', policy_row.policyname);
  end loop;
end $$;

create policy "profiles private read"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles private update"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (
  display_name, username, bio,
  avatar_url, avatar_id, banner_url, banner_id,
  profile_complete, updated_at, last_login_at
) on public.profiles to authenticated;

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

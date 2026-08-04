begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
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

alter function private.is_admin() owner to postgres;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

drop policy if exists "profiles private read" on public.profiles;
create policy "profiles private read"
on public.profiles for select
to authenticated
using (id = auth.uid() or private.is_admin());

drop policy if exists "profiles private update" on public.profiles;
create policy "profiles private update"
on public.profiles for update
to authenticated
using (id = auth.uid() or private.is_admin())
with check (id = auth.uid() or private.is_admin());

drop policy if exists "content admin delete" on public.content_items;
create policy "content admin delete"
on public.content_items for delete
to authenticated
using (private.is_admin());

drop policy if exists "content admin insert" on public.content_items;
create policy "content admin insert"
on public.content_items for insert
to authenticated
with check (private.is_admin());

drop policy if exists "content admin update" on public.content_items;
create policy "content admin update"
on public.content_items for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "content read published" on public.content_items;
create policy "content read published"
on public.content_items for select
to anon, authenticated
using (
  private.is_admin()
  or coalesce(lower(data ->> 'active'), 'true') = 'true'
);

drop policy if exists "settings admin delete" on public.site_settings;
create policy "settings admin delete"
on public.site_settings for delete
to authenticated
using (private.is_admin());

drop policy if exists "settings admin insert" on public.site_settings;
create policy "settings admin insert"
on public.site_settings for insert
to authenticated
with check (private.is_admin());

drop policy if exists "settings admin update" on public.site_settings;
create policy "settings admin update"
on public.site_settings for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "logs admin insert" on public.admin_logs;
create policy "logs admin insert"
on public.admin_logs for insert
to authenticated
with check (private.is_admin());

drop policy if exists "logs admin read" on public.admin_logs;
create policy "logs admin read"
on public.admin_logs for select
to authenticated
using (private.is_admin());

drop function if exists public.is_admin();

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

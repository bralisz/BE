begin;

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

revoke all on table public.user_preferences from public, anon, authenticated;
grant select, insert, update, delete on table public.user_preferences to authenticated;

drop policy if exists "user preferences read own" on public.user_preferences;
create policy "user preferences read own"
on public.user_preferences for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user preferences insert own" on public.user_preferences;
create policy "user preferences insert own"
on public.user_preferences for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user preferences update own" on public.user_preferences;
create policy "user preferences update own"
on public.user_preferences for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "user preferences delete own" on public.user_preferences;
create policy "user preferences delete own"
on public.user_preferences for delete
to authenticated
using ((select auth.uid()) = user_id);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_preferences'
  ) then
    alter publication supabase_realtime add table public.user_preferences;
  end if;
end $$;

comment on table public.user_preferences
is 'Stores each authenticated user personal settings and saved-content state for cross-device synchronization.';

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

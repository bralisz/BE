create table if not exists public.watch_party_unlocks (
 user_id uuid primary key references auth.users(id) on delete cascade,
 stripe_session_id text not null unique,
 amount_cents integer not null check (amount_cents = 500),
 currency text not null check (currency = 'usd'),
 created_at timestamptz not null default now()
);
alter table public.watch_party_unlocks enable row level security;
drop policy if exists "watch party owner read" on public.watch_party_unlocks;
create policy "watch party owner read" on public.watch_party_unlocks for select to authenticated using (user_id=(select auth.uid()));
revoke all on public.watch_party_unlocks from anon,public;
grant select on public.watch_party_unlocks to authenticated;
-- Server-owned unlock + award: never grant browser write access.
create or replace function public.has_watch_party_access()
returns boolean language sql stable security invoker set search_path='' as $$
select auth.uid() is not null and exists(select 1 from public.watch_party_unlocks where user_id=auth.uid())
$$;
revoke all on function public.has_watch_party_access() from public,anon;
grant execute on function public.has_watch_party_access() to authenticated;

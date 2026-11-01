create table if not exists public.watch_party_pix_orders (
 request_id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 payment_id text unique,
 amount_cents integer not null default 2719 check(amount_cents=2719),
 status text not null default 'creating' check(status in ('creating','pending','approved','failed')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists watch_party_pix_orders_user_idx on public.watch_party_pix_orders(user_id,created_at desc);
alter table public.watch_party_pix_orders enable row level security;
revoke all on public.watch_party_pix_orders from public,anon;
grant select on public.watch_party_pix_orders to authenticated;
drop policy if exists wp_pix_owner_read on public.watch_party_pix_orders;
create policy wp_pix_owner_read on public.watch_party_pix_orders for select to authenticated
using(user_id=(select auth.uid()));

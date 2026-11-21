-- Keep notification read receipts across devices for each authenticated BETV account.
-- One row per user+notification; no shared/local read status is exposed to other accounts.
create table if not exists public.notification_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_id uuid not null references public.content_items(id) on delete cascade,
  read_through bigint not null check (read_through >= 0),
  read_at timestamptz not null default now(),
  primary key (user_id,notification_id)
);

alter table public.notification_reads enable row level security;

create policy notification_reads_select_own
  on public.notification_reads for select to authenticated
  using (user_id = (select auth.uid()));

create policy notification_reads_insert_own
  on public.notification_reads for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy notification_reads_update_own
  on public.notification_reads for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.notification_reads from anon;
grant select, insert, update on public.notification_reads to authenticated;

-- Atomic, monotonic upsert prevents an older device from undoing a newer read.
-- The caller's user ID is checked against the JWT to guard against account switches.
create or replace function public.mark_my_notifications_read(
  p_expected_user_id uuid,
  p_receipts jsonb
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer := 0;
begin
  if p_expected_user_id is null
      or auth.uid() is distinct from p_expected_user_id then
    raise exception 'Notification account does not match authenticated session'
      using errcode = '42501';
  end if;
  if pg_catalog.jsonb_typeof(p_receipts) <> 'array'
      or pg_catalog.jsonb_array_length(p_receipts) > 100 then
    raise exception 'Invalid notification read batch' using errcode = '22023';
  end if;

  insert into public.notification_reads (user_id,notification_id,read_through)
  select p_expected_user_id, (receipt.value->>'id')::uuid, pg_catalog.max(
    case when receipt.value->>'through' ~ '^[0-9]{1,13}$'
      then (receipt.value->>'through')::bigint else 0 end
  )
  from pg_catalog.jsonb_array_elements(p_receipts) as receipt(value)
  where receipt.value->>'id' ~*
    '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}
  on conflict (user_id,notification_id) do update
    set read_through = greatest(
      public.notification_reads.read_through,excluded.read_through),
        read_at = now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.mark_my_notifications_read(uuid,jsonb)
  from public,anon;
grant execute on function public.mark_my_notifications_read(uuid,jsonb)
  to authenticated;

comment on table public.notification_reads is
  'Per-user notification read receipts, synchronized across BETV devices and protected by RLS.';

  group by (receipt.value->>'id')::uuid
  on conflict (user_id,notification_id) do update
    set read_through = greatest(
      public.notification_reads.read_through,excluded.read_through),
        read_at = now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.mark_my_notifications_read(uuid,jsonb)
  from public,anon;
grant execute on function public.mark_my_notifications_read(uuid,jsonb)
  to authenticated;

comment on table public.notification_reads is
  'Per-user notification read receipts, synchronized across BETV devices and protected by RLS.';

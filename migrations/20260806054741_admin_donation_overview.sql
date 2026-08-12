begin;

alter table public.donation_checkout_requests
  add column if not exists user_display_name text not null default '',
  add column if not exists user_username text not null default '',
  add column if not exists ngo_title text not null default '',
  add column if not exists status text not null default 'checkout_created',
  add column if not exists paid_at timestamptz;

update public.donation_checkout_requests d
set
  user_display_name = coalesce(
    nullif(d.user_display_name, ''),
    (select nullif(p.display_name, '') from public.profiles p where p.id = d.user_id),
    'Usuário'
  ),
  user_username = coalesce(
    nullif(d.user_username, ''),
    (select p.username::text from public.profiles p where p.id = d.user_id),
    ''
  ),
  ngo_title = coalesce(
    nullif(d.ngo_title, ''),
    (
      select nullif(c.data ->> 'title', '')
      from public.content_items c
      where c.collection = 'ongs'
        and c.id::text = d.ngo_id
      limit 1
    ),
    'ONG'
  )
where d.user_display_name = ''
   or d.user_username = ''
   or d.ngo_title = '';

alter table public.donation_checkout_requests
  drop constraint if exists donation_checkout_requests_status_check;

alter table public.donation_checkout_requests
  add constraint donation_checkout_requests_status_check
  check (status in ('checkout_created','paid','canceled','expired','payment_failed'));

create index if not exists donation_checkout_requests_created_idx
  on public.donation_checkout_requests(created_at desc);
create index if not exists donation_checkout_requests_status_created_idx
  on public.donation_checkout_requests(status, created_at desc);

create or replace function public.get_admin_donation_overview(
  p_search text default null,
  p_limit integer default 250
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_search text := lower(trim(coalesce(p_search, '')));
  v_limit integer := greatest(1, least(coalesce(p_limit, 250), 500));
  v_result jsonb;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  with enriched as (
    select
      d.id,
      d.user_id,
      d.ngo_id,
      d.amount_cents,
      d.minimum_cents,
      d.status,
      d.stripe_session_id,
      d.created_at,
      d.paid_at,
      coalesce(nullif(d.user_display_name, ''), nullif(p.display_name, ''), 'Usuário') as user_display_name,
      coalesce(nullif(d.user_username, ''), p.username::text, '') as user_username,
      coalesce(nullif(d.ngo_title, ''), nullif(c.data ->> 'title', ''), 'ONG removida') as ngo_title
    from public.donation_checkout_requests d
    left join public.profiles p on p.id = d.user_id
    left join public.content_items c
      on c.collection = 'ongs'
     and c.id::text = d.ngo_id
  ),
  filtered as (
    select *
    from enriched
    where v_search = ''
       or lower(user_display_name) like '%' || v_search || '%'
       or lower(user_username) like '%' || v_search || '%'
       or lower(ngo_title) like '%' || v_search || '%'
       or lower(status) like '%' || v_search || '%'
       or (
         regexp_replace(v_search, '[^0-9]', '', 'g') <> ''
         and amount_cents::text like '%' || regexp_replace(v_search, '[^0-9]', '', 'g') || '%'
       )
    order by created_at desc
    limit v_limit
  ),
  top_ngo as (
    select jsonb_build_object(
      'ngoId', ngo_id,
      'title', max(ngo_title),
      'checkoutCount', count(*),
      'amountCents', coalesce(sum(amount_cents), 0)
    ) as payload
    from enriched
    group by ngo_id
    order by count(*) desc, sum(amount_cents) desc, max(ngo_title)
    limit 1
  ),
  highest as (
    select jsonb_build_object(
      'amountCents', amount_cents,
      'userDisplayName', user_display_name,
      'username', user_username,
      'ngoTitle', ngo_title,
      'createdAt', created_at
    ) as payload
    from enriched
    order by amount_cents desc, created_at desc
    limit 1
  )
  select jsonb_build_object(
    'rows',
      coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', id,
          'userId', user_id,
          'userDisplayName', user_display_name,
          'username', user_username,
          'ngoId', ngo_id,
          'ngoTitle', ngo_title,
          'amountCents', amount_cents,
          'minimumCents', minimum_cents,
          'status', status,
          'stripeSessionId', stripe_session_id,
          'createdAt', created_at,
          'paidAt', paid_at
        ) order by created_at desc)
        from filtered
      ), '[]'::jsonb),
    'insights', jsonb_build_object(
      'totalCheckouts', (select count(*) from enriched),
      'totalAmountCents', (select coalesce(sum(amount_cents), 0) from enriched),
      'averageAmountCents', (select coalesce(round(avg(amount_cents)), 0) from enriched),
      'uniqueSupporters', (select count(distinct user_id) from enriched),
      'last7Days', (select count(*) from enriched where created_at >= now() - interval '7 days'),
      'topNgo', (select payload from top_ngo),
      'highestDonation', (select payload from highest)
    )
  )
  into v_result;

  return coalesce(v_result, jsonb_build_object('rows', '[]'::jsonb, 'insights', '{}'::jsonb));
end;
$$;

revoke all on function public.get_admin_donation_overview(text, integer) from public, anon;
grant execute on function public.get_admin_donation_overview(text, integer) to authenticated;

notify pgrst, 'reload schema';

commit;

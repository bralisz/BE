-- Mantém o histórico completo no dashboard, mas calcula os insights apenas
-- com pagamentos confirmados pela Stripe (status = 'paid').
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
      upper(coalesce(nullif(d.currency, ''), 'brl')) as currency,
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
       or lower(currency) like '%' || v_search || '%'
       or (
         regexp_replace(v_search, '[^0-9]', '', 'g') <> ''
         and amount_cents::text like '%' || regexp_replace(v_search, '[^0-9]', '', 'g') || '%'
       )
    order by created_at desc
    limit v_limit
  ),
  paid as (
    select *
    from enriched
    where status = 'paid'
  ),
  currency_totals as (
    select
      currency,
      count(*) as donation_count,
      coalesce(sum(amount_cents), 0) as total_amount_cents,
      coalesce(round(avg(amount_cents)), 0) as average_amount_cents
    from paid
    group by currency
  ),
  top_ngo as (
    select jsonb_build_object(
      'ngoId', ngo_id,
      'title', max(ngo_title),
      'checkoutCount', count(*)
    ) as payload
    from paid
    group by ngo_id
    order by count(*) desc, max(ngo_title)
    limit 1
  ),
  highest as (
    select jsonb_build_object(
      'amountCents', amount_cents,
      'currency', currency,
      'userDisplayName', user_display_name,
      'username', user_username,
      'ngoTitle', ngo_title,
      'createdAt', created_at,
      'paidAt', paid_at
    ) as payload
    from paid
    order by amount_cents desc, coalesce(paid_at, created_at) desc
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
          'currency', currency,
          'status', status,
          'stripeSessionId', stripe_session_id,
          'createdAt', created_at,
          'paidAt', paid_at
        ) order by created_at desc)
        from filtered
      ), '[]'::jsonb),
    'insights', jsonb_build_object(
      'totalCheckouts', (select count(*) from paid),
      'uniqueSupporters', (select count(distinct user_id) from paid),
      'last7Days', (
        select count(*)
        from paid
        where coalesce(paid_at, created_at) >= now() - interval '7 days'
      ),
      'byCurrency', coalesce((
        select jsonb_object_agg(currency, jsonb_build_object(
          'totalCheckouts', donation_count,
          'totalAmountCents', total_amount_cents,
          'averageAmountCents', average_amount_cents
        )) from currency_totals
      ), '{}'::jsonb),
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

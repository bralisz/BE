begin;

-- Expõe apenas a apresentação pública de apoiadores com pagamento confirmado.
-- Valores, e-mail, identificadores da Stripe e histórico de doações continuam privados.
create or replace function public.get_public_donation_supporters(
  p_limit integer default 48
)
returns table (
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  banner_url text,
  supported_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with latest_paid as (
    select
      d.user_id,
      max(coalesce(d.paid_at, d.created_at)) as supported_at
    from public.donation_checkout_requests d
    where d.status = 'paid'
    group by d.user_id
  )
  select
    p.id as user_id,
    coalesce(nullif(trim(p.display_name), ''), 'Apoiador') as display_name,
    p.username::text as username,
    p.avatar_url,
    p.banner_url,
    lp.supported_at
  from latest_paid lp
  join public.profiles p on p.id = lp.user_id
  where p.banned = false
    and p.profile_complete = true
    and p.username is not null
    and trim(p.username::text) <> ''
  order by lp.supported_at desc, p.id
  limit greatest(1, least(coalesce(p_limit, 48), 100));
$$;

revoke all on function public.get_public_donation_supporters(integer) from public;
grant execute on function public.get_public_donation_supporters(integer) to anon, authenticated;

notify pgrst, 'reload schema';

commit;

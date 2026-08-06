begin;

-- Mantém os 48 primeiros apoiadores e permite carregar páginas adicionais
-- de 10 registros no scroll, sempre do apoio mais recente para o mais antigo.
drop function if exists public.get_public_donation_supporters(integer);

create function public.get_public_donation_supporters(
  p_limit integer default 48,
  p_offset integer default 0
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
  with manual_supporters(username, supported_at) as (
    values ('bralis'::text, timestamptz '2026-08-06 07:29:00+00')
  ),
  support_events as (
    select
      d.user_id,
      coalesce(d.paid_at, d.created_at) as supported_at
    from public.donation_checkout_requests d
    where d.status = 'paid'

    union all

    select
      p.id as user_id,
      ms.supported_at
    from manual_supporters ms
    join public.profiles p
      on lower(trim(p.username::text)) = lower(ms.username)
  ),
  latest_support as (
    select
      se.user_id,
      max(se.supported_at) as supported_at
    from support_events se
    group by se.user_id
  )
  select
    p.id as user_id,
    coalesce(nullif(trim(p.display_name), ''), 'Apoiador') as display_name,
    p.username::text as username,
    p.avatar_url,
    p.banner_url,
    ls.supported_at
  from latest_support ls
  join public.profiles p on p.id = ls.user_id
  where p.banned = false
    and p.profile_complete = true
    and p.username is not null
    and trim(p.username::text) <> ''
  order by ls.supported_at desc, p.id
  limit greatest(1, least(coalesce(p_limit, 48), 100))
  offset greatest(0, least(coalesce(p_offset, 0), 1000000));
$$;

revoke all on function public.get_public_donation_supporters(integer, integer) from public;
grant execute on function public.get_public_donation_supporters(integer, integer) to anon, authenticated;

notify pgrst, 'reload schema';

commit;

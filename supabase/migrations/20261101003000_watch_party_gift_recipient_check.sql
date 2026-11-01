-- Gift eligibility is checked before rendering results. The atomic gift RPC remains authoritative.
create or replace function public.watch_party_recipient_available(p_username text)
returns boolean language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null
  and exists(select 1 from public.watch_party_unlocks payer where payer.user_id=auth.uid())
  and exists(
   select 1 from public.profiles p
   where lower(p.username::text)=lower(regexp_replace(btrim(coalesce(p_username,'')),'^@+',''))
    and p.banned is false and p.id<>auth.uid()
    and not exists(select 1 from public.watch_party_unlocks u where u.user_id=p.id)
    and not exists(select 1 from public.watch_party_grants g where g.user_id=p.id)
    and not exists(select 1 from public.watch_party_gifts gift where gift.recipient_id=p.id)
  );
$$;
revoke all on function public.watch_party_recipient_available(text) from public,anon;
grant execute on function public.watch_party_recipient_available(text) to authenticated;

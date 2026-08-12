create index if not exists profiles_username_search_idx
  on public.profiles (lower(username::text) text_pattern_ops)
  where username is not null and banned is false;

create or replace function public.search_public_profiles(
  p_query text,
  p_limit integer default 8
)
returns table (
  username text,
  avatar_url text
)
language sql
stable
security definer
set search_path = ''
rows 8
as $$
  with params as (
    select
      lower(regexp_replace(btrim(coalesce(p_query, '')), '^@+', '')) as query,
      least(greatest(coalesce(p_limit, 8), 1), 8) as result_limit
  )
  select
    p.username::text as username,
    coalesce(p.avatar_url, '') as avatar_url
  from public.profiles p
  cross join params x
  where x.query <> ''
    and p.banned is false
    and p.username is not null
    and btrim(p.username::text) <> ''
    and lower(p.username::text) like x.query || '%'
  order by
    case when lower(p.username::text) = x.query then 0 else 1 end,
    lower(p.username::text)
  limit (select result_limit from params);
$$;

alter function public.search_public_profiles(text, integer) owner to postgres;
revoke all on function public.search_public_profiles(text, integer) from public;
grant execute on function public.search_public_profiles(text, integer) to anon, authenticated;

notify pgrst, 'reload schema';

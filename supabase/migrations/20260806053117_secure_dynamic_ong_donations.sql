begin;

-- Cada ONG passa a possuir seu próprio valor mínimo, armazenado em centavos.
update public.content_items
set data = jsonb_set(
  data,
  '{minimumDonationCents}',
  to_jsonb(
    case
      when coalesce(data ->> 'minimumDonationCents', '') ~ '^[0-9]+$'
       and (data ->> 'minimumDonationCents')::numeric between 100 and 100000000
        then (data ->> 'minimumDonationCents')::integer
      else 500
    end
  ),
  true
),
updated_at = now()
where collection = 'ongs';

alter table public.content_items
  drop constraint if exists content_items_ong_minimum_donation_check;

alter table public.content_items
  add constraint content_items_ong_minimum_donation_check
  check (
    collection <> 'ongs'
    or (
      data ? 'minimumDonationCents'
      and jsonb_typeof(data -> 'minimumDonationCents') = 'number'
      and coalesce(data ->> 'minimumDonationCents', '') ~ '^[0-9]+$'
      and (data ->> 'minimumDonationCents')::numeric between 100 and 100000000
    )
  );

-- Registro privado usado pela Edge Function para limitar tentativas repetidas
-- e auditar as sessões de checkout criadas. Nenhum cliente acessa esta tabela.
create table if not exists public.donation_checkout_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ngo_id text not null,
  amount_cents integer not null check (amount_cents between 100 and 100000000),
  minimum_cents integer not null check (minimum_cents between 100 and 100000000),
  stripe_session_id text unique,
  request_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, request_id)
);

create index if not exists donation_checkout_requests_user_created_idx
  on public.donation_checkout_requests(user_id, created_at desc);
create index if not exists donation_checkout_requests_ngo_created_idx
  on public.donation_checkout_requests(ngo_id, created_at desc);

alter table public.donation_checkout_requests enable row level security;
revoke all on table public.donation_checkout_requests from public, anon, authenticated;

-- Expõe somente o mínimo necessário para montar a interface. A validação
-- definitiva continua sendo feita no servidor pela Edge Function.
create or replace function public.get_public_content_items(p_collection text, p_id text default null)
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', c.id::text,
    'data', jsonb_strip_nulls(jsonb_build_object(
      'active', c.data -> 'active',
      'bannerUrl', c.data -> 'bannerUrl',
      'category', c.data -> 'category',
      'contentCollection', c.data -> 'contentCollection',
      'contentId', c.data -> 'contentId',
      'contentUrl', c.data -> 'contentUrl',
      'description', c.data -> 'description',
      'duration', c.data -> 'duration',
      'imageUrl', c.data -> 'imageUrl',
      'itemLimit', c.data -> 'itemLimit',
      'itemType', c.data -> 'itemType',
      'link', c.data -> 'link',
      'logoUrl', c.data -> 'logoUrl',
      'mediaType', c.data -> 'mediaType',
      'minimumDonationCents', case when c.collection = 'ongs' then c.data -> 'minimumDonationCents' else null end,
      'order', c.data -> 'order',
      'publicId', c.data -> 'publicId',
      'runtime', c.data -> 'runtime',
      'sectionId', c.data -> 'sectionId',
      'sectionName', c.data -> 'sectionName',
      'slug', c.data -> 'slug',
      'sourceCollection', c.data -> 'sourceCollection',
      'thumbnailUrl', c.data -> 'thumbnailUrl',
      'title', c.data -> 'title',
      'type', c.data -> 'type',
      'videoDuration', c.data -> 'videoDuration',
      'videoId', c.data -> 'videoId',
      'videoUrl', c.data -> 'videoUrl',
      'year', c.data -> 'year'
    )),
    'created_at', c.created_at,
    'updated_at', c.updated_at
  )
  from public.content_items c
  where c.collection = lower(trim(p_collection))
    and c.collection in ('contents','featured','gallery','movies','notifications','ongs','sections','series','videos')
    and coalesce(lower(c.data ->> 'active'), 'true') = 'true'
    and (p_id is null or c.id::text = p_id)
  order by
    case when coalesce(c.data ->> 'order', '') ~ '^-?[0-9]+(?:\.[0-9]+)?$' then (c.data ->> 'order')::numeric else 0 end,
    c.created_at;
$$;

revoke all on function public.get_public_content_items(text, text) from public;
grant execute on function public.get_public_content_items(text, text) to anon, authenticated;

commit;

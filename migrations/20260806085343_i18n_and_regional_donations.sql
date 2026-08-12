begin;

-- As ONGs passam a ter mínimos independentes para pagamentos em real e dólar.
update public.content_items
set data = jsonb_set(
  jsonb_set(
    data,
    '{minimumDonationCents}',
    to_jsonb(case
      when coalesce(data ->> 'minimumDonationCents', '') ~ '^[0-9]+$'
       and (data ->> 'minimumDonationCents')::numeric between 100 and 100000000
        then (data ->> 'minimumDonationCents')::integer
      else 500
    end),
    true
  ),
  '{minimumDonationUsdCents}',
  to_jsonb(case
    when coalesce(data ->> 'minimumDonationUsdCents', '') ~ '^[0-9]+$'
     and (data ->> 'minimumDonationUsdCents')::numeric between 100 and 100000000
      then (data ->> 'minimumDonationUsdCents')::integer
    else 100
  end),
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
      and data ? 'minimumDonationUsdCents'
      and jsonb_typeof(data -> 'minimumDonationUsdCents') = 'number'
      and coalesce(data ->> 'minimumDonationUsdCents', '') ~ '^[0-9]+$'
      and (data ->> 'minimumDonationUsdCents')::numeric between 100 and 100000000
    )
  );

alter table public.donation_checkout_requests
  add column if not exists currency text not null default 'brl';

update public.donation_checkout_requests
set currency = 'brl'
where currency is null or lower(currency) not in ('brl','usd');

alter table public.donation_checkout_requests
  drop constraint if exists donation_checkout_requests_currency_check;

alter table public.donation_checkout_requests
  add constraint donation_checkout_requests_currency_check
  check (currency in ('brl','usd'));

create index if not exists donation_checkout_requests_currency_created_idx
  on public.donation_checkout_requests(currency, created_at desc);

-- O catálogo público expõe somente os campos permitidos, inclusive as
-- traduções geradas e os dois mínimos regionais de doação.
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
      'minimumDonationCents', c.data -> 'minimumDonationCents',
      'minimumDonationUsdCents', c.data -> 'minimumDonationUsdCents',
      'order', c.data -> 'order',
      'publicId', c.data -> 'publicId',
      'runtime', c.data -> 'runtime',
      'sectionId', c.data -> 'sectionId',
      'sectionName', c.data -> 'sectionName',
      'slug', c.data -> 'slug',
      'sourceCollection', c.data -> 'sourceCollection',
      'thumbnailUrl', c.data -> 'thumbnailUrl',
      'title', c.data -> 'title',
      'translations', c.data -> 'translations',
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


-- Configurações públicas também podem carregar as traduções persistidas.
create or replace function public.get_public_site_setting(p_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case s.id
    when 'site' then jsonb_strip_nulls(jsonb_build_object(
      'siteName', s.data -> 'siteName',
      'description', s.data -> 'description',
      'primaryColor', s.data -> 'primaryColor',
      'footerText', s.data -> 'footerText',
      'instagram', s.data -> 'instagram',
      'xUrl', s.data -> 'xUrl',
      'youtube', s.data -> 'youtube',
      'website', s.data -> 'website',
      'discordUrl', s.data -> 'discordUrl',
      'shareImage', s.data -> 'shareImage',
      'translations', s.data -> 'translations'
    ))
    when 'billie-eilish' then jsonb_strip_nulls(jsonb_build_object(
      'sourceMode', s.data -> 'sourceMode',
      'title', s.data -> 'title',
      'kicker', s.data -> 'kicker',
      'portraitUrl', s.data -> 'portraitUrl',
      'bannerUrl', s.data -> 'bannerUrl',
      'manualBio', s.data -> 'manualBio',
      'includeReferences', s.data -> 'includeReferences',
      'instagram', s.data -> 'instagram',
      'xUrl', s.data -> 'xUrl',
      'youtube', s.data -> 'youtube',
      'spotify', s.data -> 'spotify',
      'website', s.data -> 'website',
      'translations', s.data -> 'translations'
    ))
    when 'ong' then jsonb_strip_nulls(jsonb_build_object(
      'bannerUrl', s.data -> 'bannerUrl',
      'translations', s.data -> 'translations'
    ))
    else null
  end
  from public.site_settings s
  where s.id = p_id
    and s.id in ('site', 'billie-eilish', 'ong')
  limit 1;
$$;

revoke all on function public.get_public_site_setting(text) from public;
grant execute on function public.get_public_site_setting(text) to anon, authenticated;

notify pgrst, 'reload schema';
commit;

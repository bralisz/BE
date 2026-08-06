begin;

-- Função administrativa autônoma e sem permissão para visitantes anônimos.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Exponha somente os campos públicos de configurações; o JSON bruto fica restrito ao admin.
drop policy if exists "settings public read" on public.site_settings;
drop policy if exists "settings admin read" on public.site_settings;
create policy "settings admin read"
on public.site_settings for select
to authenticated
using (public.is_admin());

revoke select on public.site_settings from anon;
grant select on public.site_settings to authenticated;

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
      'shareImage', s.data -> 'shareImage'
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
      'website', s.data -> 'website'
    ))
    else null
  end
  from public.site_settings s
  where s.id = p_id
    and s.id in ('site', 'billie-eilish')
  limit 1;
$$;

revoke all on function public.get_public_site_setting(text) from public;
grant execute on function public.get_public_site_setting(text) to anon, authenticated;

-- O catálogo público passa por uma função com lista explícita de campos.
drop policy if exists "content read published" on public.content_items;
drop policy if exists "content admin read" on public.content_items;
create policy "content admin read"
on public.content_items for select
to authenticated
using (public.is_admin());

revoke select on public.content_items from anon;
grant select on public.content_items to authenticated;

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
    and c.collection in ('contents','featured','gallery','movies','notifications','sections','series','videos')
    and coalesce(lower(c.data ->> 'active'), 'true') = 'true'
    and (p_id is null or c.id::text = p_id)
  order by
    case when coalesce(c.data ->> 'order', '') ~ '^-?[0-9]+(?:\.[0-9]+)?$' then (c.data ->> 'order')::numeric else 0 end,
    c.created_at;
$$;

revoke all on function public.get_public_content_items(text, text) from public;
grant execute on function public.get_public_content_items(text, text) to anon, authenticated;

-- Remova e-mails administrativos gravados por versões antigas; os logs administrativos continuam separados.
update public.content_items
set data = data - 'createdBy' - 'updatedBy' - 'adminEmail' - 'email'
where data ?| array['createdBy','updatedBy','adminEmail','email'];

-- As colunas antigas também deixam de conservar autoria em texto livre.
update public.content_items
set created_by = null,
    updated_by = null
where created_by is not null or updated_by is not null;

update public.site_settings
set data = data - 'createdBy' - 'updatedBy' - 'adminEmail' - 'email'
where data ?| array['createdBy','updatedBy','adminEmail','email'];

commit;

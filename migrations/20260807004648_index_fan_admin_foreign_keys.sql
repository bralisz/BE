create index if not exists featured_fans_added_by_idx
  on public.featured_fans (added_by)
  where added_by is not null;

create index if not exists fan_communities_created_by_idx
  on public.fan_communities (created_by)
  where created_by is not null;

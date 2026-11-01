alter table public.profiles drop constraint if exists profiles_community_tag_check;
alter table public.profiles add constraint profiles_community_tag_check check (
  community_tag = any(array['','avocado','eyelash','blohsh','billie_fan','boaf','happier_than_ever']::text[])
);
alter table public.profiles drop constraint if exists profiles_community_tags_check;
alter table public.profiles add constraint profiles_community_tags_check check (
 community_tags <@ array['avocado','eyelash','blohsh','billie_fan','boaf','happier_than_ever']::text[]
 and array_position(community_tags,''::text) is null
);
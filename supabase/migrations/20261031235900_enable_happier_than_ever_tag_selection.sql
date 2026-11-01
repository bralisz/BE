create or replace function public.set_my_community_tag(p_tag text)
returns text language plpgsql security definer set search_path='' as $$
declare
  v_uid uuid := auth.uid();
  v_tag text := lower(trim(coalesce(p_tag,'')));
  v_owned text[];
begin
  if v_uid is null then
    raise exception 'authentication_required' using errcode='42501';
  end if;
  if v_tag not in ('','avocado','eyelash','blohsh','billie_fan','boaf','happier_than_ever') then
    raise exception 'invalid_community_tag' using errcode='22023';
  end if;
  select coalesce(community_tags,'{}'::text[]) into v_owned
    from public.profiles where id=v_uid;
  if not found then raise exception 'profile_not_found' using errcode='P0002'; end if;
  if v_tag<>'' and not (v_tag=any(v_owned)) then
    raise exception 'tag_not_owned' using errcode='42501';
  end if;
  update public.profiles set community_tag=v_tag,updated_at=clock_timestamp()
    where id=v_uid;
  return v_tag;
end;
$$;
revoke all on function public.set_my_community_tag(text) from public,anon;
grant execute on function public.set_my_community_tag(text) to authenticated;
create or replace function public.tv_set_subtitles(p_session_id uuid, p_enabled boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  update public.tv_pair_sessions s
  set current_media = jsonb_set(coalesce(s.current_media, '{}'::jsonb), '{subtitleEnabled}', to_jsonb(coalesce(p_enabled, false)), true),
      updated_at = now()
  where s.id = p_session_id
    and s.owner_id = v_uid
    and s.status = 'paired'
    and s.expires_at > now()
    and coalesce(s.current_media ->> 'subtitleUrl', '') <> '';

  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

alter function public.tv_set_subtitles(uuid, boolean) owner to postgres;
revoke all on function public.tv_set_subtitles(uuid, boolean) from public;
grant execute on function public.tv_set_subtitles(uuid, boolean) to authenticated;

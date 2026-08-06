begin;

-- Broadcast é recomendado pelo Supabase para muitos assinantes porque cada
-- alteração é autorizada uma vez no ingresso do canal e distribuída ao tópico,
-- em vez de executar uma checagem de RLS para cada assinante e cada mudança.
drop policy if exists "users receive own sync broadcasts" on realtime.messages;
create policy "users receive own sync broadcasts"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and (select realtime.topic()) = ('user-sync:' || (select auth.uid())::text)
);

create or replace function private.broadcast_profile_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := coalesce(new.id, old.id);
begin
  perform realtime.broadcast_changes(
    'user-sync:' || v_user_id::text,
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );
  return null;
end;
$$;

alter function private.broadcast_profile_sync() owner to postgres;
revoke all on function private.broadcast_profile_sync() from public, anon, authenticated;

create or replace function private.broadcast_user_preferences_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := coalesce(new.user_id, old.user_id);
begin
  perform realtime.broadcast_changes(
    'user-sync:' || v_user_id::text,
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );
  return null;
end;
$$;

alter function private.broadcast_user_preferences_sync() owner to postgres;
revoke all on function private.broadcast_user_preferences_sync() from public, anon, authenticated;

drop trigger if exists broadcast_profile_sync_trigger on public.profiles;
create trigger broadcast_profile_sync_trigger
after insert or update or delete on public.profiles
for each row execute function private.broadcast_profile_sync();

drop trigger if exists broadcast_user_preferences_sync_trigger on public.user_preferences;
create trigger broadcast_user_preferences_sync_trigger
after insert or update or delete on public.user_preferences
for each row execute function private.broadcast_user_preferences_sync();

-- As duas tabelas deixam de usar Postgres Changes. Isso elimina a autorização
-- por evento e por assinante, mantendo a sincronização pelo Broadcast privado.
do $$
begin
  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime drop table public.profiles;
  end if;

  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_preferences'
  ) then
    alter publication supabase_realtime drop table public.user_preferences;
  end if;
end $$;

-- Evita reavaliar auth.uid() e a função administrativa para cada linha.
drop policy if exists "profiles private read" on public.profiles;
create policy "profiles private read"
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
);

drop policy if exists "profiles private update" on public.profiles;
create policy "profiles private update"
on public.profiles for update
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
)
with check (
  id = (select auth.uid())
  or (select private.is_admin())
);

select pg_notify('pgrst', 'reload schema');
notify pgrst, 'reload schema';

commit;

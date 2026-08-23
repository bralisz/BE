-- Índices indicados pelo advisor de performance do Supabase.
create index if not exists content_interaction_dedupe_content_id_idx
  on private.content_interaction_dedupe(content_id);

create index if not exists admin_logs_admin_uid_idx
  on public.admin_logs(admin_uid);

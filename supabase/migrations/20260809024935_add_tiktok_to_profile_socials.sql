-- Sincroniza o histórico local com a migration remota criada ao habilitar TikTok.
-- A alteração de schema já está definida em 20260808234500_add_tiktok_to_profile_socials.sql.
-- Este arquivo é intencionalmente no-op para evitar:
-- Remote migration versions not found in local migrations directory.
select 1;

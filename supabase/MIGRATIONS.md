# Migrações do Supabase

Este diretório está sincronizado com o histórico remoto do projeto `be-tv`.
As versões abaixo devem permanecer no repositório para evitar o aviso **Remote migration versions not found in local migrations directory**.

## Histórico local sincronizado

- `20260802000000` — `account_exists`
- `20260802054616` — `fix_login_and_username_conflicts`
- `20260803173027` — `harden_profile_privacy_and_permissions`
- `20260803173157` — `move_admin_check_to_private_schema`
- `20260803174956` — `restore_safe_admin_check_for_authenticated_sessions`
- `20260803202554` — `restore_account_lookup_for_login_flow`
- `20260804053000` — `profile_banner_settings`
- `20260804053100` — `fix_delete_my_account`
- `20260804053200` — `profile_avatar_selection_only`
- `20260804053300` — `user_moderation`
- `20260804143250` — `persist_admin_user_bans`
- `20260804160752` — `content_insights_tracking`
- `20260804164611` — `cross_device_user_preferences`
- `20260804170608` — `scale_concurrent_users`
- `20260804182716` — `public_profile_view`
- `20260805213000` — `harden_public_content_and_billie_settings`
- `20260806024500` — `enable_public_ongs`
- `20260806033000` — `enable_public_ong_page_banner`
- `20260806053117` — `secure_dynamic_ong_donations`
- `20260806054741` — `admin_donation_overview`
- `20260806054755` — `noop_ignore`
- `20260806054800` — `remove_noop_ignore_marker`
- `20260806054806` — `admin_donation_overview_permissions_refresh`
- `20260806060314` — `admin_site_usage_insights`
- `20260806074042` — `add_bralis_as_supporter`
- `20260806075217` — `paginate_public_donation_supporters`
- `20260806085343` — `i18n_and_regional_donations`
- `20260806090235` — `admin_donation_currency`
- `20260806174305` — `noop_preserve_music_titles`
- `20260806174315` — `remove_noop_preserve_music_titles`
- `20260806174326` — `noop_cleanup_marker`
- `20260806174524` — `preserve_music_video_titles`
- `20260806175116` — `translation_worker_table_grants`
- `20260806182129` — `automatic_content_translation_jobs`
- `20260806182205` — `fix_translation_job_permissions`
- `20260806195000` — `fix_avatar_selection_detection`
- `20260806202546` — `preserve_spanish_official_titles`

Não renomeie, remova ou reutilize versões que já foram aplicadas no projeto remoto.
As migrations marcadas como `noop` são registros históricos intencionais e precisam continuar no diretório local.

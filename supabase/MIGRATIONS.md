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
- `20260806223500` — `keep_album_song_titles_original_in_spanish`
- `20260806225000` — `restore_original_titles_in_spanish_translation`
- `20260806225316` — `restore_original_titles_in_spanish_translation`
- `20260806231019` — `preserve_concert_video_titles_in_spanish`
- `20260806232521` — `sync_uploaded_snapshot_translation_rules`
- `20260806233240` — `preserve_concert_and_behind_the_scenes_titles`
- `20260806234000` — `preserve_concert_and_behind_the_scenes_titles`
- `20260806234218` — `preserve_hit_me_hard_and_soft_title`
- `20260806235500` — `preserve_hit_me_hard_and_soft_title`
- `20260807003802` — `fan_community_wall`
- `20260807004527` — `fan_wall_selected_profile_media`
- `20260807004619` — `harden_fan_admin_rpc_grants`
- `20260807004648` — `index_fan_admin_foreign_keys`
- `20260807011544` — `count_only_paid_donations_in_admin_insights`

Não renomeie, remova ou reutilize versões que já foram aplicadas no projeto remoto.
As migrations marcadas como `noop` são registros históricos intencionais e precisam continuar no diretório local.

- `20260809024935` — `add_tiktok_to_profile_socials` (registro remoto sincronizado; no-op local)

- `20260809165626_profile_likes.sql`: adiciona curtidas entre perfis, contagem pública e RPCs autenticadas para consultar/alternar a curtida.

- `20260809170757_video_comments.sql`: adiciona comentários públicos nos vídeos com leitura pública, envio autenticado, avatar/@ do autor, limite de 500 caracteres e proteção simples contra spam.

- `20260809172456_public_profile_search.sql`: adiciona pesquisa pública de perfis por prefixo de `@`, retornando somente avatar e nome de usuário, com limite de 8 resultados e índice para manter a busca rápida.

- `20260809173734_video_comment_moderation.sql` — adiciona exclusão do próprio comentário, denúncias de comentários e moderação administrativa de denúncias.

- `20260809181425_video_comment_likes.sql` — adiciona curtidas nos comentários, contador público e estado de curtida do usuário autenticado.
- `20260811031200_community_hub.sql` — adiciona a aba Comunidade: histórico privado de conteúdos iniciados, favoritos agregados, rankings públicos com opt-out e RPCs seguras para leitura/gravação.


- `20260821080000_public_avatar_rings_comments_rankings.sql` — publica somente a cor do aro do avatar nos comentários e no ranking da comunidade.

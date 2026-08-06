'use strict';

const fs = require('fs');
const path = require('path');

const migrationsDirectory = path.join(__dirname, '..', 'supabase', 'migrations');
const expected = new Set([
  '20260802000000_account_exists.sql',
  '20260802054616_fix_login_and_username_conflicts.sql',
  '20260803173027_harden_profile_privacy_and_permissions.sql',
  '20260803173157_move_admin_check_to_private_schema.sql',
  '20260803174956_restore_safe_admin_check_for_authenticated_sessions.sql',
  '20260803202554_restore_account_lookup_for_login_flow.sql',
  '20260804053000_profile_banner_settings.sql',
  '20260804053100_fix_delete_my_account.sql',
  '20260804053200_profile_avatar_selection_only.sql',
  '20260804053300_user_moderation.sql',
  '20260804143250_persist_admin_user_bans.sql',
  '20260804160752_content_insights_tracking.sql',
  '20260804164611_cross_device_user_preferences.sql',
  '20260804170608_scale_concurrent_users.sql',
  '20260804182716_public_profile_view.sql',
  '20260805213000_harden_public_content_and_billie_settings.sql',
  '20260806024500_enable_public_ongs.sql',
  '20260806033000_enable_public_ong_page_banner.sql',
  '20260806053117_secure_dynamic_ong_donations.sql',
  '20260806054741_admin_donation_overview.sql',
  '20260806054755_noop_ignore.sql',
  '20260806054800_remove_noop_ignore_marker.sql',
  '20260806054806_admin_donation_overview_permissions_refresh.sql',
  '20260806060314_admin_site_usage_insights.sql',
  '20260806074042_add_bralis_as_supporter.sql',
  '20260806075217_paginate_public_donation_supporters.sql',
  '20260806085343_i18n_and_regional_donations.sql',
  '20260806090235_admin_donation_currency.sql',
  '20260806174305_noop_preserve_music_titles.sql',
  '20260806174315_remove_noop_preserve_music_titles.sql',
  '20260806174326_noop_cleanup_marker.sql',
  '20260806174524_preserve_music_video_titles.sql',
  '20260806175116_translation_worker_table_grants.sql',
  '20260806182129_automatic_content_translation_jobs.sql',
  '20260806182205_fix_translation_job_permissions.sql'
]);

if (!fs.existsSync(migrationsDirectory)) {
  throw new Error(`Diretório não encontrado: ${migrationsDirectory}`);
}

const removed = [];
for (const file of fs.readdirSync(migrationsDirectory)) {
  if (!file.endsWith('.sql') || expected.has(file)) continue;
  fs.rmSync(path.join(migrationsDirectory, file));
  removed.push(file);
}

const missing = [...expected].filter(file => !fs.existsSync(path.join(migrationsDirectory, file)));
if (missing.length) {
  console.error('Arquivos de migration ausentes:');
  missing.forEach(file => console.error(`- ${file}`));
  process.exitCode = 1;
} else {
  console.log(`Histórico local sincronizado: ${expected.size} migrations.`);
  if (removed.length) {
    console.log('Versões locais obsoletas removidas:');
    removed.forEach(file => console.log(`- ${file}`));
  }
}

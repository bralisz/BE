// Configuração pública do Billie Eilish TV.
// Nunca coloque service_role, sb_secret ou qualquer segredo neste arquivo.
window.BE_SITE_CONFIG = Object.freeze({
  siteUrl: 'https://billieilishtv.site',
  supabaseUrl: 'https://cxkevnnxibhezvospkce.supabase.co',
  supabasePublishableKey: 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX',
  requireEmailConfirmation: true,
  oauthAuthorizationPath: '/oauth/consent'
});

window.BE_SUPABASE_CONFIG = Object.freeze({
  siteUrl: window.BE_SITE_CONFIG.siteUrl,
  url: window.BE_SITE_CONFIG.supabaseUrl,
  publishableKey: window.BE_SITE_CONFIG.supabasePublishableKey,
  requireEmailConfirmation: window.BE_SITE_CONFIG.requireEmailConfirmation,
  oauthAuthorizationPath: window.BE_SITE_CONFIG.oauthAuthorizationPath,
  oauthAuthorizeEndpoint: window.BE_SITE_CONFIG.supabaseUrl + '/auth/v1/oauth/authorize'
});

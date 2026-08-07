'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const LEGAL_TRANSLATIONS = require('../config/legal-translations');
const PUBLIC_PROFILE_API = require('./public-profile');

const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const FIXED_SHARE_IMAGE_URL = 'https://i.imgur.com/tnBMpHr.png';
const OFFICIAL_SITE_ORIGIN = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://billieilishtv.site').replace(/\/$/, '');
const SETTINGS_CACHE_TTL_MS = 60000;
const I18N_REV = '20260806-password-avatar-v1';
const LOCALE_PREFIXES = Object.freeze({
  'pt-br': { locale: 'pt-BR', ogLocale: 'pt_BR', slug: 'pt-br' },
  'en-us': { locale: 'en-US', ogLocale: 'en_US', slug: 'en-us' },
  'us': { locale: 'en-US', ogLocale: 'en_US', slug: 'en-us' },
  'es': { locale: 'es', ogLocale: 'es_ES', slug: 'es' }
});
let cachedTemplate = '';
let settingsCache = { value: {}, expiresAt: 0, promise: null };

function supabaseConfig() {
  return {
    url: String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cxkevnnxibhezvospkce.supabase.co').replace(/\/$/, ''),
    publishableKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_PUBLISHABLE_KEY
  };
}

function readTemplate() {
  if (cachedTemplate) return cachedTemplate;
  const candidates = [
    path.join(process.cwd(), 'index.html'),
    path.join(__dirname, '..', 'index.html')
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        cachedTemplate = fs.readFileSync(file, 'utf8');
        return cachedTemplate;
      }
    } catch (_) {}
  }
  throw new Error('index.html não encontrado');
}


function deploymentVersion() {
  const commit = String(process.env.VERCEL_GIT_COMMIT_SHA || '').trim();
  const deploymentUrl = String(process.env.VERCEL_URL || '').trim();
  const environment = String(process.env.VERCEL_ENV || process.env.NODE_ENV || 'development').trim();
  if (!commit && !deploymentUrl) return `local:${environment}`;
  const fingerprint = crypto.createHash('sha256').update(`${commit}:${deploymentUrl}`).digest('hex').slice(0, 24);
  return `v:${fingerprint}`;
}

function injectDeploymentVersion(html) {
  const serialized = JSON.stringify(deploymentVersion()).replace(/</g, '\\u003c');
  const script = `<script>window.__BETV_DEPLOYMENT_VERSION__=${serialized};<\/script>`;
  return html.replace('</head>', `${script}
</head>`);
}

function attr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function publicOrigin(req) {
  const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  const host = forwardedHost || String(req.headers.host || new URL(OFFICIAL_SITE_ORIGIN).host);
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto || (/^(localhost|127\.)/.test(host) ? 'http' : 'https');
  return `${protocol}://${host}`;
}

function absoluteHttpUrl(value, origin) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw, origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch (_) {
    return '';
  }
}

function proxiedMediaUrl(value, origin) {
  const absolute = absoluteHttpUrl(value, origin);
  if (!absolute) return FIXED_SHARE_IMAGE_URL;
  try {
    const parsed = new URL(absolute);
    if (parsed.origin === origin) return parsed.href;
  } catch (_) {}
  const token = Buffer.from(absolute, 'utf8').toString('base64url');
  return `${origin}/api/media?u=${token}`;
}

async function loadSettings() {
  const currentTime = Date.now();
  if (settingsCache.expiresAt > currentTime) return settingsCache.value;
  if (settingsCache.promise) return settingsCache.promise;

  const { url, publishableKey } = supabaseConfig();
  settingsCache.promise = (async () => {
    try {
      const response = await fetch(`${url}/rest/v1/site_settings?id=eq.site&select=data,updated_at&limit=1`, {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
          Accept: 'application/json'
        }
      });
      if (!response.ok) return settingsCache.value || {};
      const rows = await response.json();
      const row = Array.isArray(rows) ? rows[0] : null;
      settingsCache.value = row ? { ...(row.data || {}), _updatedAt: row.updated_at || '' } : {};
      settingsCache.expiresAt = Date.now() + SETTINGS_CACHE_TTL_MS;
      return settingsCache.value;
    } catch (_) {
      settingsCache.expiresAt = Date.now() + 10000;
      return settingsCache.value || {};
    } finally {
      settingsCache.promise = null;
    }
  })();

  return settingsCache.promise;
}

function normalizedRequestPath(req) {
  const candidates = [
    req && req.headers && req.headers['x-vercel-original-path'],
    req && req.headers && req.headers['x-original-url'],
    req && req.headers && req.headers['x-rewrite-url'],
    req && req.url
  ];
  for (const candidate of candidates) {
    const raw = String(candidate || '').split('?')[0].trim();
    if (!raw || raw.startsWith('/api/site-page')) continue;
    try {
      const parsed = new URL(raw, OFFICIAL_SITE_ORIGIN);
      return parsed.pathname || '/';
    } catch (_) {}
  }
  return '/';
}

function routeLocaleInfo(req) {
  const requestPath = normalizedRequestPath(req).replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
  const first = String(requestPath.split('/')[1] || '').toLowerCase();
  const config = LOCALE_PREFIXES[first] || LOCALE_PREFIXES['pt-br'];
  const hasPrefix = Boolean(LOCALE_PREFIXES[first]);
  const logicalPath = hasPrefix
    ? (requestPath.replace(new RegExp(`^/${first}(?=/|$)`, 'i'), '') || '/')
    : requestPath;
  const prefix = hasPrefix ? `/${config.slug}` : '';
  const publicPath = prefix + (logicalPath === '/' ? '' : logicalPath);
  return {
    locale: config.locale,
    ogLocale: config.ogLocale,
    prefix,
    logicalPath: logicalPath || '/',
    publicPath: publicPath || '/',
    slug: config.slug
  };
}

function injectLocaleDocument(html, routeInfo) {
  return html.replace(/<html\s+lang=["'][^"']+["']/i, `<html lang="${attr(routeInfo.locale)}"`);
}

function decodeHtmlText(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');
}

function escapeHtmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function localizeStaticText(html, routeInfo) {
  const translations = LEGAL_TRANSLATIONS[routeInfo.slug];
  if (!translations) return html;
  return html.replace(/>([^<>]+)</g, (match, rawText) => {
    const leading = (rawText.match(/^\s*/) || [''])[0];
    const trailing = (rawText.match(/\s*$/) || [''])[0];
    const normalized = decodeHtmlText(rawText).replace(/\s+/g, ' ').trim();
    const translated = translations[normalized];
    if (!translated || translated === normalized) return match;
    return `>${leading}${escapeHtmlText(translated)}${trailing}<`;
  });
}

function injectLocalePreload(html, routeInfo) {
  if (routeInfo.slug === 'pt-br') return html;
  const href = `/assets/i18n/${routeInfo.slug}.json?rev=${I18N_REV}`;
  const preload = `<link rel="preload" href="${attr(href)}" as="fetch" fetchpriority="high" data-betv-i18n-preload="${attr(routeInfo.slug)}">`;
  return html.replace('</head>', `${preload}
</head>`);
}

function isLegalRouteInfo(routeInfo) {
  const logical = String(routeInfo && routeInfo.logicalPath || '').replace(/\/+$/, '') || '/';
  return ['/terms', '/privacy', '/cookies', '/dmca'].includes(logical);
}

function profileUsernameFromRoute(routeInfo) {
  const logicalPath = String(routeInfo && routeInfo.logicalPath || '').replace(/\/+$/, '') || '/';
  const match = logicalPath.match(/^\/@([^/]+)$/i);
  if (!match) return '';
  const username = PUBLIC_PROFILE_API.normalizeUsername(match[1]);
  return PUBLIC_PROFILE_API.validUsername(username) ? username : '';
}

function profileShareVersion(profile) {
  if (!profile) return '';
  const source = JSON.stringify({
    previewLayoutVersion: 2,
    displayName: profile.displayName || '',
    username: profile.username || '',
    avatarUrl: profile.avatarUrl || '',
    bannerUrl: profile.bannerUrl || '',
    favorites: Array.isArray(profile.favorites)
      ? profile.favorites.slice(0, 4).map(item => ({
        title: item && item.title || '',
        imageUrl: item && (item.imageUrl || item.bannerUrl) || '',
        collection: item && item.collection || ''
      }))
      : []
  });
  return crypto.createHash('sha256').update(source).digest('hex').slice(0, 16);
}

function injectSocialMetadata(html, settings, origin, routeInfo, publicProfile) {
  const siteTitle = 'Billie Eilish TV';
  const defaults = {
    'pt-br': {
      description: 'Todo o conteúdo da Billie Eilish em um só lugar.',
      imageAlt: 'Billie Eilish TV — todo o conteúdo da Billie Eilish em um só lugar',
      profileDescription: name => `Veja os quatro conteúdos favoritos de ${name} na Billie Eilish TV.`,
      profileImageAlt: name => `Perfil de ${name} com seus quatro conteúdos favoritos na Billie Eilish TV`
    },
    'en-us': {
      description: 'All Billie Eilish content in one place.',
      imageAlt: 'Billie Eilish TV — all Billie Eilish content in one place',
      profileDescription: name => `See ${name}'s four favorite picks on Billie Eilish TV.`,
      profileImageAlt: name => `${name}'s profile with four favorite picks on Billie Eilish TV`
    },
    es: {
      description: 'Todo el contenido de Billie Eilish en un solo lugar.',
      imageAlt: 'Billie Eilish TV — todo el contenido de Billie Eilish en un solo lugar',
      profileDescription: name => `Mira los cuatro contenidos favoritos de ${name} en Billie Eilish TV.`,
      profileImageAlt: name => `Perfil de ${name} con sus cuatro contenidos favoritos en Billie Eilish TV`
    }
  };
  const fallback = defaults[routeInfo.slug] || defaults['pt-br'];
  const localizedSettings = settings.translations && typeof settings.translations === 'object'
    ? settings.translations[routeInfo.slug]
    : null;
  const defaultDescription = String(
    (localizedSettings && localizedSettings.description) ||
    (routeInfo.slug === 'pt-br' && settings.description) ||
    fallback.description
  ).trim();
  const canonical = `${origin}${routeInfo.publicPath === '/' ? '/' : routeInfo.publicPath}`;

  let documentTitle = siteTitle;
  let socialTitle = siteTitle;
  let socialDescription = defaultDescription;
  let image = FIXED_SHARE_IMAGE_URL;
  let imageAlt = fallback.imageAlt;
  let ogType = 'website';

  if (publicProfile && publicProfile.username) {
    const displayName = String(publicProfile.displayName || publicProfile.username).trim().slice(0, 80);
    const username = PUBLIC_PROFILE_API.normalizeUsername(publicProfile.username);
    const version = profileShareVersion(publicProfile);
    documentTitle = `${displayName} — ${siteTitle}`;
    socialTitle = `${displayName} (@${username})`;
    socialDescription = fallback.profileDescription(displayName);
    imageAlt = fallback.profileImageAlt(displayName);
    image = `${origin}/api/profile-share-image?username=${encodeURIComponent(username)}&v=${encodeURIComponent(version)}`;
    ogType = 'profile';
  }

  html = html
    .replace(/<title>[^<]*<\/title>/i, `<title>${attr(documentTitle)}</title>`)
    .replace(/\s*<meta\s+(?:property=["']og:[^>]+|name=["']twitter:[^>]+)[^>]*>/gi, '')
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, '');

  const metadata = `
<meta name="description" content="${attr(socialDescription)}">
<meta property="og:type" content="${attr(ogType)}">
<meta property="og:locale" content="${attr(routeInfo.ogLocale)}">
<meta property="og:site_name" content="${attr(siteTitle)}">
<meta property="og:title" content="${attr(socialTitle)}">
<meta property="og:description" content="${attr(socialDescription)}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:image" content="${attr(image)}">
<meta property="og:image:secure_url" content="${attr(image)}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${attr(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(socialTitle)}">
<meta name="twitter:description" content="${attr(socialDescription)}">
<meta name="twitter:image" content="${attr(image)}">
<meta name="twitter:image:alt" content="${attr(imageAlt)}">
<link rel="canonical" href="${attr(canonical)}">`;

  return html.replace('</title>', `</title>${metadata}`);
}

module.exports = async function sitePage(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  try {
    const origin = publicOrigin(req);
    const routeInfo = routeLocaleInfo(req);
    const profileUsername = profileUsernameFromRoute(routeInfo);
    const legalRequest = isLegalRouteInfo(routeInfo);
    const recoveryRequest = routeInfo.logicalPath === '/reset-password' || routeInfo.logicalPath === '/reset-password/';
    // Páginas legais são totalmente estáticas e localizadas no servidor.
    // Não aguardam o Supabase, reduzindo o tempo de resposta em cache frio.
    const settings = (legalRequest || recoveryRequest || profileUsername) ? (settingsCache.value || {}) : await loadSettings();
    let publicProfile = null;
    if (profileUsername) {
      try {
        publicProfile = await PUBLIC_PROFILE_API.fetchPublicProfile(profileUsername);
      } catch (_) {}
    }
    const html = injectDeploymentVersion(
      injectLocalePreload(
        localizeStaticText(
          injectSocialMetadata(injectLocaleDocument(readTemplate(), routeInfo), settings, origin, routeInfo, publicProfile),
          routeInfo
        ),
        routeInfo
      )
    );
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      recoveryRequest
        ? 'no-store, max-age=0'
        : legalRequest
          ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
          : profileUsername
            ? 'public, max-age=0, s-maxage=30, stale-while-revalidate=300'
            : 'public, max-age=0, s-maxage=60, stale-while-revalidate=600'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const requestPath = routeInfo.logicalPath;
    if (requestPath === '/login' || requestPath === '/login/' || requestPath === '/reset-password' || requestPath === '/reset-password/' || requestPath.startsWith('/oauth/consent')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(html);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).send('Não foi possível carregar o site.');
  }
};

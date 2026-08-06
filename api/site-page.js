'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const FIXED_SHARE_IMAGE_URL = 'https://i.imgur.com/tnBMpHr.png';
const OFFICIAL_SITE_ORIGIN = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://billieilishtv.site').replace(/\/$/, '');
const SETTINGS_CACHE_TTL_MS = 60000;
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

function injectSocialMetadata(html, settings, origin, routeInfo) {
  const title = 'Billie Eilish TV';
  const defaults = {
    'pt-br': {
      description: 'Todo o conteúdo da Billie Eilish em um só lugar.',
      imageAlt: 'Billie Eilish TV — todo o conteúdo da Billie Eilish em um só lugar'
    },
    'en-us': {
      description: 'All Billie Eilish content in one place.',
      imageAlt: 'Billie Eilish TV — all Billie Eilish content in one place'
    },
    es: {
      description: 'Todo el contenido de Billie Eilish en un solo lugar.',
      imageAlt: 'Billie Eilish TV — todo el contenido de Billie Eilish en un solo lugar'
    }
  };
  const fallback = defaults[routeInfo.slug] || defaults['pt-br'];
  const localizedSettings = settings.translations && typeof settings.translations === 'object'
    ? settings.translations[routeInfo.slug]
    : null;
  const description = String(
    (localizedSettings && localizedSettings.description) ||
    (routeInfo.slug === 'pt-br' && settings.description) ||
    fallback.description
  ).trim();
  const socialDescription = description;
  // O preview social do site é fixo e não pode ser substituído pelas configurações do painel.
  const image = FIXED_SHARE_IMAGE_URL;
  const canonical = `${origin}${routeInfo.publicPath === '/' ? '/' : routeInfo.publicPath}`;
  const imageAlt = fallback.imageAlt;

  html = html
    .replace(/\s*<meta\s+(?:property=["']og:[^>]+|name=["']twitter:[^>]+)[^>]*>/gi, '')
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, '');

  const metadata = `
<meta name="description" content="${attr(description)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${attr(routeInfo.ogLocale)}">
<meta property="og:site_name" content="${attr(title)}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(socialDescription)}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:image" content="${attr(image)}">
<meta property="og:image:secure_url" content="${attr(image)}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${attr(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(title)}">
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
    const settings = await loadSettings();
    const routeInfo = routeLocaleInfo(req);
    const html = injectDeploymentVersion(
      injectSocialMetadata(injectLocaleDocument(readTemplate(), routeInfo), settings, origin, routeInfo)
    );
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const requestPath = routeInfo.logicalPath;
    if (requestPath === '/login' || requestPath === '/login/' || requestPath.startsWith('/oauth/consent')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(html);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).send('Não foi possível carregar o site.');
  }
};

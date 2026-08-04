'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const FIXED_SHARE_IMAGE_PATH = '/assets/images/social/share-preview.jpg?v=20260804';
const OFFICIAL_SITE_ORIGIN = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://billieilishtv.site').replace(/\/$/, '');
const SETTINGS_CACHE_TTL_MS = 60000;
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
  if (!absolute) return absoluteHttpUrl(FIXED_SHARE_IMAGE_PATH, origin);
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

function injectSocialMetadata(html, settings, origin) {
  const title = 'Billie Eilish TV';
  const description = String(
    settings.description ||
    'Filmes, entrevistas, shows e vídeos da Billie Eilish em um só lugar — uma plataforma feita por fãs, para fãs.'
  ).trim();
  const socialDescription = 'Filmes, entrevistas, shows e vídeos em um só lugar. Feito por fãs, para fãs.';
  // O preview social do site é fixo e não pode ser substituído pelas configurações do painel.
  const image = absoluteHttpUrl(FIXED_SHARE_IMAGE_PATH, origin);
  const canonical = `${origin}/`;
  const imageAlt = 'Billie Eilish TV — filmes, entrevistas, shows e vídeos em um só lugar';

  html = html
    .replace(/\s*<meta\s+(?:property=["']og:[^>]+|name=["']twitter:[^>]+)[^>]*>/gi, '')
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, '');

  const metadata = `
<meta name="description" content="${attr(description)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${attr(title)}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(socialDescription)}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:image" content="${attr(image)}">
<meta property="og:image:secure_url" content="${attr(image)}">
<meta property="og:image:type" content="image/jpeg">
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
    const html = injectDeploymentVersion(injectSocialMetadata(readTemplate(), settings, origin));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const requestPath = String(req.url || '').split('?')[0];
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

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const LEGAL_TRANSLATIONS = require('../config/legal-translations');
const PUBLIC_PROFILE_API = require('./public-profile');

const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const FIXED_SHARE_IMAGE_URL = 'https://i.imgur.com/tnBMpHr.png';
const OFFICIAL_SITE_ORIGIN = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://billieilishtv.site').replace(/\/$/, '');
const SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000;
const SEO_CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;
const SEO_CONTENT_COLLECTIONS = Object.freeze(['videos', 'movies', 'series', 'contents', 'news']);
const I18N_REV = '20260810-original-titles-v3';
const LOCALIZED_ROUTE_SLUGS = Object.freeze({
  'pt-br': Object.freeze({ '/comunidade': '/comunidade', '/fãs': '/fãs' }),
  'en-us': Object.freeze({ '/comunidade': '/community', '/fãs': '/fans' }),
  es: Object.freeze({ '/comunidade': '/comunidad', '/fãs': '/fans' }),
  fr: Object.freeze({ '/comunidade': '/communaute', '/fãs': '/fans' }),
  it: Object.freeze({ '/comunidade': '/comunita', '/fãs': '/fans' })
});
const LOCALIZED_ROUTE_ALIASES = Object.freeze({
  '/comunidade': '/comunidade', '/community': '/comunidade', '/comunidad': '/comunidade', '/communaute': '/comunidade', '/communauté': '/comunidade', '/comunita': '/comunidade', '/comunità': '/comunidade',
  '/fãs': '/fãs', '/fas': '/fãs', '/fans': '/fãs'
});
const LOCALE_PREFIXES = Object.freeze({
  'pt-br': { locale: 'pt-BR', ogLocale: 'pt_BR', slug: 'pt-br' },
  'en-us': { locale: 'en-US', ogLocale: 'en_US', slug: 'en-us' },
  'us': { locale: 'en-US', ogLocale: 'en_US', slug: 'en-us' },
  'es': { locale: 'es', ogLocale: 'es_ES', slug: 'es' },
  'fr': { locale: 'fr-FR', ogLocale: 'fr_FR', slug: 'fr' },
  'it': { locale: 'it-IT', ogLocale: 'it_IT', slug: 'it' }
});
let cachedTemplate = '';
let settingsCache = { value: {}, expiresAt: 0, promise: null };
let seoCatalogCache = { value: [], expiresAt: 0, promise: null };

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
  const version = deploymentVersion();
  const serialized = JSON.stringify(version).replace(/</g, '\u003c');
  const buildToken = encodeURIComponent(version);
  const withFreshCriticalAssets = String(html || '').replace(
    /((?:src|href)=["']\/assets\/(?:js|css)\/[^"']+\?[^"']*)(["'])/gi,
    `$1&build=${buildToken}$2`
  );
  const script = `<script>(function(){window.__BETV_DEPLOYMENT_VERSION__=${serialized};try{var u=new URL(window.location.href);if(!u.searchParams.has('__betv_update'))return;var localKeys=[];for(var i=0;i<localStorage.length;i+=1){var k=String(localStorage.key(i)||'');if(k.indexOf('betvDynamicI18n:')===0||k.indexOf('betvHomeBootstrap')===0||k.indexOf('betvDeploymentVersionCheck')===0||k.indexOf('betvObservedReleaseState')===0||k==='betvUpdateAssetCache'||k==='betvUpdateVersion'||k==='beContentAnalyticsSession')localKeys.push(k);}localKeys.forEach(function(k){try{localStorage.removeItem(k);}catch(_){}});var sessionKeys=[];for(var j=0;j<sessionStorage.length;j+=1){var sk=String(sessionStorage.key(j)||'');if(sk.indexOf('betvHomeBootstrap')===0)sessionKeys.push(sk);}sessionKeys.forEach(function(k){try{sessionStorage.removeItem(k);}catch(_){}});var jobs=[];if('caches'in window)jobs.push(caches.keys().then(function(keys){return Promise.all(keys.map(function(key){return caches.delete(key);}));}));if('serviceWorker'in navigator)jobs.push(navigator.serviceWorker.getRegistrations().then(function(regs){return Promise.all(regs.map(function(reg){return reg.unregister();}));}));window.__BETV_UPDATE_CACHE_CLEANUP__=Promise.allSettled(jobs);}catch(_){window.__BETV_UPDATE_CACHE_CLEANUP__=Promise.resolve();}})();<\/script>`;
  return withFreshCriticalAssets.replace('</head>', `${script}
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

function canonicalLocalizedRoutePath(value) {
  let raw = String(value || '/');
  try { raw = decodeURIComponent(raw); } catch (_) {}
  raw = raw.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
  const key = raw.toLowerCase();
  return LOCALIZED_ROUTE_ALIASES[key] || raw;
}

function localizedLogicalRoutePath(value, slug) {
  const canonical = canonicalLocalizedRoutePath(value);
  const routes = LOCALIZED_ROUTE_SLUGS[String(slug || 'pt-br').toLowerCase()] || LOCALIZED_ROUTE_SLUGS['pt-br'];
  return routes[canonical] || canonical;
}

function routeLocaleInfo(req) {
  const requestPath = normalizedRequestPath(req).replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
  const first = String(requestPath.split('/')[1] || '').toLowerCase();
  const config = LOCALE_PREFIXES[first] || LOCALE_PREFIXES['pt-br'];
  const hasPrefix = Boolean(LOCALE_PREFIXES[first]);
  const rawLogicalPath = hasPrefix
    ? (requestPath.replace(new RegExp(`^/${first}(?=/|$)`, 'i'), '') || '/')
    : requestPath;
  const logicalPath = canonicalLocalizedRoutePath(rawLogicalPath);
  const localizedLogicalPath = localizedLogicalRoutePath(logicalPath, config.slug);
  const prefix = hasPrefix ? `/${config.slug}` : '';
  const publicPath = prefix + (localizedLogicalPath === '/' ? '' : localizedLogicalPath);
  return {
    locale: config.locale,
    ogLocale: config.ogLocale,
    prefix,
    logicalPath: logicalPath || '/',
    localizedLogicalPath: localizedLogicalPath || '/',
    publicPath: publicPath || '/',
    slug: config.slug,
    hasPrefix
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

function injectLocalePreload(html) {
  return html;
}

function isLegalRouteInfo(routeInfo) {
  const logical = String(routeInfo && routeInfo.logicalPath || '').replace(/\/+$/, '') || '/';
  return ['/terms', '/comunidade', '/privacy', '/cookies', '/dmca'].includes(logical);
}

function profileUsernameFromRoute(routeInfo) {
  const logicalPath = String(routeInfo && routeInfo.logicalPath || '').replace(/\/+$/, '') || '/';
  const match = logicalPath.match(/^\/@([^/]+)$/i);
  if (!match) return '';
  const username = PUBLIC_PROFILE_API.normalizeUsername(match[1]);
  return PUBLIC_PROFILE_API.validUsername(username) ? username : '';
}


function numericPublicId(value) {
  const text = String(value || 'video').trim();
  if (/^\d{8}$/.test(text)) return text;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return String(10000000 + ((hash >>> 0) % 90000000));
}

function unwrapSeoRow(collection, row) {
  const wrapped = row && typeof row === 'object'
    ? (row.get_public_content_items || row.item || row)
    : null;
  if (!wrapped || typeof wrapped !== 'object') return null;
  const data = wrapped.data && typeof wrapped.data === 'object' ? wrapped.data : {};
  const active = data.active !== false && String(data.active).toLowerCase() !== 'false';
  if (!active) return null;
  const id = String(wrapped.id || data.id || '').trim();
  if (!id && !String(data.title || '').trim()) return null;
  return {
    collection,
    id,
    data,
    updatedAt: String(wrapped.updated_at || wrapped.updatedAt || wrapped.created_at || wrapped.createdAt || '').trim()
  };
}

async function fetchSeoCollection(collection) {
  const { url, publishableKey } = supabaseConfig();
  const headers = {
    apikey: publishableKey,
    Authorization: `Bearer ${publishableKey}`,
    Accept: 'application/json'
  };
  try {
    const response = await fetch(`${url}/rest/v1/rpc/get_public_content_items`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_collection: collection, p_id: null }),
      cache: 'no-store'
    });
    if (response.ok) {
      const payload = await response.json();
      return (Array.isArray(payload) ? payload : [])
        .map(row => unwrapSeoRow(collection, row))
        .filter(Boolean);
    }
  } catch (_) {}

  // Compatibilidade com ambientes em que a RPC pública ainda não foi aplicada.
  const params = new URLSearchParams({ select: 'id,data,created_at,updated_at', collection: `eq.${collection}` });
  const legacy = await fetch(`${url}/rest/v1/content_items?${params.toString()}`, { headers, cache: 'no-store' });
  if (!legacy.ok) throw new Error(`seo_${collection}_unavailable`);
  const payload = await legacy.json();
  return (Array.isArray(payload) ? payload : [])
    .map(row => unwrapSeoRow(collection, row))
    .filter(Boolean);
}

async function loadSeoCatalog() {
  const now = Date.now();
  if (seoCatalogCache.expiresAt > now) return seoCatalogCache.value;
  if (seoCatalogCache.promise) return seoCatalogCache.promise;

  seoCatalogCache.promise = (async () => {
    try {
      const settled = await Promise.allSettled(SEO_CONTENT_COLLECTIONS.map(fetchSeoCollection));
      const values = settled.flatMap(result => result.status === 'fulfilled' ? result.value : []);
      if (values.length) seoCatalogCache.value = values;
      seoCatalogCache.expiresAt = Date.now() + SEO_CATALOG_CACHE_TTL_MS;
      return seoCatalogCache.value;
    } catch (_) {
      seoCatalogCache.expiresAt = Date.now() + 10000;
      return seoCatalogCache.value;
    } finally {
      seoCatalogCache.promise = null;
    }
  })();

  return seoCatalogCache.promise;
}

function seoRecordFromRoute(routeInfo, catalog) {
  const logical = String(routeInfo && routeInfo.logicalPath || '').replace(/\/+$/, '') || '/';
  const contentMatch = logical.match(/^\/(\d{6,12})$/);
  if (contentMatch) {
    const itemId = contentMatch[1];
    return (catalog || []).find(record => {
      if (record.collection === 'news') return false;
      const data = record.data || {};
      const publicId = numericPublicId(data.publicId || record.id || data.title);
      return record.id === itemId || publicId === itemId;
    }) || null;
  }

  const albumMatch = logical.match(/^\/(?:albuns|álbuns|albums)\/([^/]+)$/i);
  if (albumMatch) {
    let albumId = albumMatch[1];
    try { albumId = decodeURIComponent(albumId); } catch (_) {}
    return (catalog || []).find(record => record.collection === 'news' && record.id === albumId) || null;
  }
  return null;
}

const ORIGINAL_TITLE_COLLECTIONS = new Set(['contents', 'featured', 'movies', 'series', 'videos', 'ongs', 'news']);

function localizedRecord(record, slug) {
  if (!record) return null;
  const base = record.data && typeof record.data === 'object' ? record.data : {};
  const translations = base.translations && typeof base.translations === 'object' ? base.translations : {};
  const translated = translations[slug] && typeof translations[slug] === 'object' ? translations[slug] : null;
  const data = translated ? { ...base, ...translated } : { ...base };
  const collection = String(record.collection || base.collection || '').toLowerCase();
  const keepTitle = base.preserveTitle === true || String(base.preserveTitle || '').toLowerCase() === 'true' || ORIGINAL_TITLE_COLLECTIONS.has(collection);
  if (keepTitle) {
    if (Object.prototype.hasOwnProperty.call(base, 'title')) data.title = base.title;
    if (Object.prototype.hasOwnProperty.call(base, 'name')) data.name = base.name;
  }
  return { ...record, data };
}

function canonicalPathForRoute(routeInfo) {
  const logical = String(routeInfo.logicalPath || '/').replace(/\/+$/, '') || '/';
  if (routeInfo.hasPrefix) return routeInfo.publicPath === '/' ? `/${routeInfo.slug}` : routeInfo.publicPath;
  return `/${routeInfo.slug}${logical === '/' ? '' : logical}`;
}

function localizedRouteUrl(origin, slug, logicalPath) {
  const logical = canonicalLocalizedRoutePath(String(logicalPath || '/').replace(/\/+$/, '') || '/');
  const localized = localizedLogicalRoutePath(logical, slug);
  return `${origin}/${slug}${localized === '/' ? '' : localized}`;
}

function xDefaultRouteUrl(origin, logicalPath) {
  const logical = String(logicalPath || '/').replace(/\/+$/, '') || '/';
  return `${origin}${logical === '/' ? '/' : logical}`;
}

function isNoindexRoute(routeInfo) {
  const logical = String(routeInfo && routeInfo.logicalPath || '').replace(/\/+$/, '') || '/';
  return logical === '/login' ||
    logical === '/reset-password' ||
    logical === '/config' ||
    logical === '/auth/callback' ||
    logical.startsWith('/oauth/consent');
}

function pageCopy(routeInfo, settings, seoRecord) {
  const siteTitle = 'Billie Eilish TV';
  const copies = {
    'pt-br': {
      homeTitle: 'Billie Eilish TV',
      homeDescription: 'Explore vídeos, shows, filmes, séries, álbuns e outros conteúdos sobre Billie Eilish em um projeto de fãs reunido em um só lugar.',
      billieTitle: `Billie Eilish — Biografia e informações | ${siteTitle}`,
      billieDescription: 'Conheça Billie Eilish, sua trajetória, informações e redes sociais reunidas pela Billie Eilish TV, um projeto de fãs.',
      albumsTitle: `Álbuns e singles de Billie Eilish | ${siteTitle}`,
      albumsDescription: 'Explore álbuns, singles e faixas de Billie Eilish reunidos pela Billie Eilish TV.',
      ongTitle: `Apoie ONGs | ${siteTitle}`,
      ongDescription: 'Conheça as ONGs apresentadas pela Billie Eilish TV e veja formas de apoiar iniciativas selecionadas no site.',
      supportTitle: `Suporte | ${siteTitle}`,
      supportDescription: 'Central de suporte da Billie Eilish TV com respostas para dúvidas frequentes e formas de contato.',
      updatesTitle: `Atualizações | ${siteTitle}`,
      updatesDescription: 'Acompanhe novidades e atualizações publicadas pela Billie Eilish TV.',
      termsTitle: `Termos e Condições | ${siteTitle}`,
      privacyTitle: `Política de Privacidade | ${siteTitle}`,
      cookiesTitle: `Política de Cookies | ${siteTitle}`,
      dmcaTitle: `DMCA e direitos autorais | ${siteTitle}`,
      communityTitle: `Diretrizes da Comunidade | ${siteTitle}`,
      communityDescription: 'Confira as diretrizes da página de fãs da Billie Eilish TV, como perfis e comunidades podem aparecer, quais informações públicas podem ser exibidas e como solicitar remoção.',
      fansTitle: `Fãs que ajudaram o site | ${siteTitle}`,
      fansDescription: 'Conheça fãs e comunidades que ajudam a Billie Eilish TV divulgando e apoiando o projeto.',
      fanProject: 'Projeto de fãs não oficial dedicado a organizar conteúdo e informações sobre Billie Eilish.'
    },
    'en-us': {
      homeTitle: 'Billie Eilish TV',
      homeDescription: 'Explore videos, performances, films, series, albums and more Billie Eilish content in one fan-made project.',
      billieTitle: `Billie Eilish — Biography and information | ${siteTitle}`,
      billieDescription: 'Learn about Billie Eilish, her journey, information and social links gathered by Billie Eilish TV, a fan-made project.',
      albumsTitle: `Billie Eilish albums and singles | ${siteTitle}`,
      albumsDescription: 'Explore Billie Eilish albums, singles and tracks gathered by Billie Eilish TV.',
      ongTitle: `Support nonprofits | ${siteTitle}`,
      ongDescription: 'Discover nonprofits featured by Billie Eilish TV and ways to support initiatives selected on the site.',
      supportTitle: `Support | ${siteTitle}`,
      supportDescription: 'Billie Eilish TV support center with answers to common questions and contact options.',
      updatesTitle: `Updates | ${siteTitle}`,
      updatesDescription: 'Follow news and updates published by Billie Eilish TV.',
      termsTitle: `Terms & Conditions | ${siteTitle}`,
      privacyTitle: `Privacy Policy | ${siteTitle}`,
      cookiesTitle: `Cookie Policy | ${siteTitle}`,
      dmcaTitle: `DMCA and copyright | ${siteTitle}`,
      communityTitle: `Community Guidelines | ${siteTitle}`,
      communityDescription: 'Read the Billie Eilish TV fan page guidelines, including how profiles and communities may be featured, what public information may be shown, and how to request removal.',
      fansTitle: `Fans who helped the site | ${siteTitle}`,
      fansDescription: 'Meet fans and communities that help Billie Eilish TV by sharing and supporting the project.',
      fanProject: 'Unofficial fan-made project dedicated to organizing content and information about Billie Eilish.'
    },
    fr: {
      homeTitle: 'Billie Eilish TV',
      homeDescription: 'Explore des vidéos, concerts, films, séries, albums et d’autres contenus sur Billie Eilish dans un projet créé par des fans.',
      billieTitle: `Billie Eilish — Biographie et informations | ${siteTitle}`,
      billieDescription: 'Découvre Billie Eilish, son parcours, ses informations et ses réseaux sociaux réunis par Billie Eilish TV, un projet de fans.',
      albumsTitle: `Albums et singles de Billie Eilish | ${siteTitle}`,
      albumsDescription: 'Explore les albums, singles et titres de Billie Eilish réunis par Billie Eilish TV.',
      ongTitle: `Soutenir des associations | ${siteTitle}`,
      ongDescription: 'Découvre les associations présentées par Billie Eilish TV et les moyens de soutenir les initiatives sélectionnées sur le site.',
      supportTitle: `Assistance | ${siteTitle}`,
      supportDescription: 'Centre d’assistance de Billie Eilish TV avec des réponses aux questions fréquentes et des moyens de contact.',
      updatesTitle: `Mises à jour | ${siteTitle}`,
      updatesDescription: 'Suis les nouveautés et mises à jour publiées par Billie Eilish TV.',
      termsTitle: `Conditions générales | ${siteTitle}`,
      privacyTitle: `Politique de confidentialité | ${siteTitle}`,
      cookiesTitle: `Politique relative aux cookies | ${siteTitle}`,
      dmcaTitle: `DMCA et droits d’auteur | ${siteTitle}`,
      communityTitle: `Règles de la communauté | ${siteTitle}`,
      communityDescription: 'Consulte les règles de la page des fans de Billie Eilish TV, la manière dont les profils et communautés peuvent apparaître, les informations publiques qui peuvent être affichées et la procédure de retrait.',
      fansTitle: `Fans qui ont aidé le site | ${siteTitle}`,
      fansDescription: 'Découvre les fans et communautés qui aident Billie Eilish TV en partageant et en soutenant le projet.',
      fanProject: 'Projet non officiel créé par des fans pour organiser du contenu et des informations sur Billie Eilish.'
    },
    es: {
      homeTitle: 'Billie Eilish TV',
      homeDescription: 'Explora videos, conciertos, películas, series, álbumes y más contenido de Billie Eilish en un proyecto creado por fans.',
      billieTitle: `Billie Eilish — Biografía e información | ${siteTitle}`,
      billieDescription: 'Conoce a Billie Eilish, su trayectoria, información y redes sociales reunidas por Billie Eilish TV, un proyecto de fans.',
      albumsTitle: `Álbumes y singles de Billie Eilish | ${siteTitle}`,
      albumsDescription: 'Explora álbumes, singles y canciones de Billie Eilish reunidos por Billie Eilish TV.',
      ongTitle: `Apoya a una ONG | ${siteTitle}`,
      ongDescription: 'Conoce las ONG presentadas por Billie Eilish TV y formas de apoyar iniciativas seleccionadas en el sitio.',
      supportTitle: `Soporte | ${siteTitle}`,
      supportDescription: 'Centro de soporte de Billie Eilish TV con respuestas a preguntas frecuentes y opciones de contacto.',
      updatesTitle: `Actualizaciones | ${siteTitle}`,
      updatesDescription: 'Sigue las novedades y actualizaciones publicadas por Billie Eilish TV.',
      termsTitle: `Términos y condiciones | ${siteTitle}`,
      privacyTitle: `Política de privacidad | ${siteTitle}`,
      cookiesTitle: `Política de cookies | ${siteTitle}`,
      dmcaTitle: `DMCA y derechos de autor | ${siteTitle}`,
      communityTitle: `Directrices de la comunidad | ${siteTitle}`,
      communityDescription: 'Consulta las directrices de la página de fans de Billie Eilish TV, cómo pueden aparecer perfiles y comunidades, qué información pública puede mostrarse y cómo solicitar su eliminación.',
      fansTitle: `Fans que ayudaron al sitio | ${siteTitle}`,
      fansDescription: 'Conoce a fans y comunidades que ayudan a Billie Eilish TV compartiendo y apoyando el proyecto.',
      fanProject: 'Proyecto no oficial creado por fans para organizar contenido e información sobre Billie Eilish.'
    },
    it: {
      homeTitle: 'Billie Eilish TV',
      homeDescription: 'Esplora video, concerti, film, serie, album e altri contenuti su Billie Eilish in un progetto creato dai fan.',
      billieTitle: `Billie Eilish — Biografia e informazioni | ${siteTitle}`,
      billieDescription: 'Scopri Billie Eilish, il suo percorso, le informazioni e i social raccolti da Billie Eilish TV, un progetto creato dai fan.',
      albumsTitle: `Album e singoli di Billie Eilish | ${siteTitle}`,
      albumsDescription: 'Esplora album, singoli e brani di Billie Eilish raccolti da Billie Eilish TV.',
      ongTitle: `Sostieni le organizzazioni | ${siteTitle}`,
      ongDescription: 'Scopri le organizzazioni presentate da Billie Eilish TV e i modi per sostenere le iniziative selezionate sul sito.',
      supportTitle: `Assistenza | ${siteTitle}`,
      supportDescription: 'Centro assistenza di Billie Eilish TV con risposte alle domande frequenti e opzioni di contatto.',
      updatesTitle: `Aggiornamenti | ${siteTitle}`,
      updatesDescription: 'Segui le novità e gli aggiornamenti pubblicati da Billie Eilish TV.',
      termsTitle: `Termini e condizioni | ${siteTitle}`,
      privacyTitle: `Informativa sulla privacy | ${siteTitle}`,
      cookiesTitle: `Informativa sui cookie | ${siteTitle}`,
      dmcaTitle: `DMCA e diritti d’autore | ${siteTitle}`,
      communityTitle: `Linee guida della community | ${siteTitle}`,
      communityDescription: 'Consulta le linee guida della pagina fan di Billie Eilish TV, come possono apparire profili e community, quali informazioni pubbliche possono essere mostrate e come richiedere la rimozione.',
      fansTitle: `Fan che hanno aiutato il sito | ${siteTitle}`,
      fansDescription: 'Scopri i fan e le community che aiutano Billie Eilish TV condividendo e sostenendo il progetto.',
      fanProject: 'Progetto non ufficiale creato dai fan per organizzare contenuti e informazioni su Billie Eilish.'
    }
  };
  const copy = copies[routeInfo.slug] || copies['pt-br'];
  const localizedSettings = settings.translations && typeof settings.translations === 'object'
    ? settings.translations[routeInfo.slug]
    : null;
  const configuredDescription = String(
    (localizedSettings && localizedSettings.description) ||
    (routeInfo.slug === 'pt-br' && settings.description) ||
    ''
  ).trim();
  const logical = String(routeInfo.logicalPath || '/').replace(/\/+$/, '') || '/';
  let title = copy.homeTitle;
  let description = configuredDescription || copy.homeDescription;
  let pageType = 'WebPage';

  if (logical === '/billie-eilish') {
    title = copy.billieTitle;
    description = copy.billieDescription;
    pageType = 'ProfilePage';
  } else if (/^\/(?:albuns|álbuns|albums)(?:\/|$)/i.test(logical)) {
    title = copy.albumsTitle;
    description = copy.albumsDescription;
    pageType = 'CollectionPage';
  } else if (logical === '/ong') {
    title = copy.ongTitle;
    description = copy.ongDescription;
    pageType = 'CollectionPage';
  } else if (logical === '/suporte') {
    title = copy.supportTitle;
    description = copy.supportDescription;
  } else if (logical === '/atualizacoes' || logical === '/notificacoes' || logical.startsWith('/atualizacoes/') || logical.startsWith('/notificacoes/')) {
    title = copy.updatesTitle;
    description = copy.updatesDescription;
    pageType = 'CollectionPage';
  } else if (logical === '/terms') {
    title = copy.termsTitle;
    description = copy.fanProject;
  } else if (logical === '/privacy') {
    title = copy.privacyTitle;
    description = copy.fanProject;
  } else if (logical === '/cookies') {
    title = copy.cookiesTitle;
    description = copy.fanProject;
  } else if (logical === '/dmca') {
    title = copy.dmcaTitle;
    description = copy.fanProject;
  } else if (logical === '/comunidade') {
    title = copy.communityTitle;
    description = copy.communityDescription;
  } else if (/^\/(?:fãs|fas|fans)$/i.test(logical)) {
    title = copy.fansTitle;
    description = copy.fansDescription;
    pageType = 'CollectionPage';
  }

  if (seoRecord) {
    const localized = localizedRecord(seoRecord, routeInfo.slug);
    const data = localized.data || {};
    const recordTitle = String(data.title || '').trim();
    const recordDescription = String(data.description || '').replace(/\s+/g, ' ').trim();
    if (recordTitle) title = `${recordTitle} | ${siteTitle}`;
    if (recordDescription) description = recordDescription.slice(0, 300);
    else if (recordTitle) {
      description = routeInfo.slug === 'en-us'
        ? `Explore ${recordTitle} and more Billie Eilish content on Billie Eilish TV.`
        : routeInfo.slug === 'es'
          ? `Explora ${recordTitle} y más contenido de Billie Eilish en Billie Eilish TV.`
          : routeInfo.slug === 'fr'
            ? `Explore ${recordTitle} et d’autres contenus sur Billie Eilish sur Billie Eilish TV.`
            : routeInfo.slug === 'it'
              ? `Esplora ${recordTitle} e altri contenuti su Billie Eilish su Billie Eilish TV.`
              : `Explore ${recordTitle} e outros conteúdos de Billie Eilish na Billie Eilish TV.`;
    }
    pageType = 'ItemPage';
  }

  return { title, description, pageType, fanProject: copy.fanProject };
}

function injectStructuredData(html, origin, canonical, routeInfo, copy, seoRecord, publicProfile) {
  const graph = [];
  graph.push({
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: 'Billie Eilish TV',
    alternateName: 'BETV',
    description: copy.fanProject,
    inLanguage: ['pt-BR', 'en-US', 'es', 'fr-FR', 'it-IT']
  });

  const page = {
    '@type': copy.pageType,
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: copy.title,
    description: copy.description,
    isPartOf: { '@id': `${origin}/#website` },
    inLanguage: routeInfo.locale,
    about: { '@type': 'Person', name: 'Billie Eilish' }
  };

  if (seoRecord) {
    const localized = localizedRecord(seoRecord, routeInfo.slug);
    const data = localized.data || {};
    const mainEntity = {
      '@type': 'CreativeWork',
      name: String(data.title || '').trim() || copy.title,
      about: { '@type': 'Person', name: 'Billie Eilish' }
    };
    if (String(data.description || '').trim()) mainEntity.description = String(data.description).replace(/\s+/g, ' ').trim().slice(0, 1000);
    if (String(data.year || '').trim()) mainEntity.datePublished = String(data.year).trim();
    page.mainEntity = mainEntity;
  } else if (routeInfo.logicalPath === '/billie-eilish') {
    page.mainEntity = { '@type': 'Person', name: 'Billie Eilish' };
  } else if (publicProfile && publicProfile.username) {
    page.about = undefined;
  }

  graph.push(page);
  const payload = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  const script = `<script type="application/ld+json" data-betv-seo="true">${payload}<\/script>`;
  return html.replace('</head>', `${script}\n</head>`);
}

function profileShareVersion(profile) {
  if (!profile) return '';
  const source = JSON.stringify({
    previewLayoutVersion: 3,
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

function injectSocialMetadata(html, settings, origin, routeInfo, publicProfile, seoRecord) {
  const siteTitle = 'Billie Eilish TV';
  const fallbackImageAlt = {
    'pt-br': 'Billie Eilish TV — projeto de fãs sobre Billie Eilish',
    'en-us': 'Billie Eilish TV — a fan-made Billie Eilish project',
    es: 'Billie Eilish TV — proyecto de fans sobre Billie Eilish',
    fr: 'Billie Eilish TV — projet de fans consacré à Billie Eilish',
    it: 'Billie Eilish TV — progetto fan dedicato a Billie Eilish'
  }[routeInfo.slug] || 'Billie Eilish TV';
  const profileDescription = {
    'pt-br': name => `Veja os quatro conteúdos favoritos de ${name} na Billie Eilish TV.`,
    'en-us': name => `See ${name}'s four favorite picks on Billie Eilish TV.`,
    es: name => `Mira los cuatro contenidos favoritos de ${name} en Billie Eilish TV.`,
    fr: name => `Découvre les quatre contenus préférés de ${name} sur Billie Eilish TV.`,
    it: name => `Scopri i quattro contenuti preferiti di ${name} su Billie Eilish TV.`
  }[routeInfo.slug] || (name => `Perfil de ${name} na Billie Eilish TV.`);
  const profileImageAlt = {
    'pt-br': name => `Perfil de ${name} com seus conteúdos favoritos na Billie Eilish TV`,
    'en-us': name => `${name}'s profile with favorite picks on Billie Eilish TV`,
    es: name => `Perfil de ${name} con sus contenidos favoritos en Billie Eilish TV`,
    fr: name => `Profil de ${name} avec ses contenus préférés sur Billie Eilish TV`,
    it: name => `Profilo di ${name} con i suoi contenuti preferiti su Billie Eilish TV`
  }[routeInfo.slug] || (name => `Perfil de ${name}`);

  const copy = pageCopy(routeInfo, settings, seoRecord);
  const canonicalPath = canonicalPathForRoute(routeInfo);
  const canonical = `${origin}${canonicalPath}`;
  const noindex = isNoindexRoute(routeInfo);

  const logicalPath = String(routeInfo.logicalPath || '/').replace(/\/+$/, '') || '/';
  let documentTitle = logicalPath === '/' ? siteTitle : copy.title;
  let socialTitle = copy.title;
  let socialDescription = copy.description;
  let image = FIXED_SHARE_IMAGE_URL;
  let imageAlt = fallbackImageAlt;
  let ogType = 'website';

  if (publicProfile && publicProfile.username) {
    const displayName = String(publicProfile.displayName || publicProfile.username).trim().slice(0, 80);
    const username = PUBLIC_PROFILE_API.normalizeUsername(publicProfile.username);
    socialTitle = `${displayName} (@${username})`;
    documentTitle = `${displayName} (@${username}) | ${siteTitle}`;
    socialDescription = profileDescription(displayName);
    imageAlt = profileImageAlt(displayName);
    image = `${origin}/api/profile-share-image?username=${encodeURIComponent(username)}`;
    ogType = 'profile';
  }

  html = html
    .replace(/<title>[^<]*<\/title>/i, `<title>${attr(documentTitle)}</title>`)
    .replace(/\s*<meta\s+(?:property=["']og:[^>]+|name=["']twitter:[^>]+)[^>]*>/gi, '')
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/\s*<link\s+rel=["']alternate["'][^>]*hreflang=["'][^>]*>/gi, '')
    .replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/\s*<meta\s+name=["']robots["'][^>]*>/gi, '')
    .replace(/\s*<script\s+type=["']application\/ld\+json["'][^>]*data-betv-seo=["']true["'][^>]*>[\s\S]*?<\/script>/gi, '');

  const logical = routeInfo.logicalPath || '/';
  const alternates = [
    `<link rel="alternate" hreflang="pt-BR" href="${attr(localizedRouteUrl(origin, 'pt-br', logical))}">`,
    `<link rel="alternate" hreflang="en-US" href="${attr(localizedRouteUrl(origin, 'en-us', logical))}">`,
    `<link rel="alternate" hreflang="es" href="${attr(localizedRouteUrl(origin, 'es', logical))}">`,
    `<link rel="alternate" hreflang="fr" href="${attr(localizedRouteUrl(origin, 'fr', logical))}">`,
    `<link rel="alternate" hreflang="it" href="${attr(localizedRouteUrl(origin, 'it', logical))}">`,
    `<link rel="alternate" hreflang="x-default" href="${attr(xDefaultRouteUrl(origin, logical))}">`
  ].join('\n');

  const metadata = `
<meta name="description" content="${attr(socialDescription)}">
<meta name="robots" content="${noindex ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">
${process.env.GOOGLE_SITE_VERIFICATION ? `<meta name="google-site-verification" content="${attr(process.env.GOOGLE_SITE_VERIFICATION)}">` : ''}
<meta property="og:type" content="${attr(ogType)}">
<meta property="og:locale" content="${attr(routeInfo.ogLocale)}">
${Object.values(LOCALE_PREFIXES).filter((value, index, list) => !value.alias && value.ogLocale !== routeInfo.ogLocale && list.findIndex(item => item.ogLocale === value.ogLocale) === index).map(value => `<meta property="og:locale:alternate" content="${attr(value.ogLocale)}">`).join('\n')}
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
<link rel="canonical" href="${attr(canonical)}">
${alternates}`;

  html = html.replace('</title>', `</title>${metadata}`);
  return injectStructuredData(html, origin, canonical, routeInfo, { ...copy, title: socialTitle, description: socialDescription }, seoRecord, publicProfile);
}

module.exports = async function sitePage(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  try {
    const requestOrigin = publicOrigin(req);
    const origin = /^https?:\/\/(?:localhost|127\.)/i.test(requestOrigin) ? requestOrigin : OFFICIAL_SITE_ORIGIN;
    const routeInfo = routeLocaleInfo(req);
    const profileUsername = profileUsernameFromRoute(routeInfo);
    const legalRequest = isLegalRouteInfo(routeInfo);
    const recoveryRequest = routeInfo.logicalPath === '/reset-password' || routeInfo.logicalPath === '/reset-password/';
    const needsSeoCatalog = /^\/\d{6,12}$/.test(routeInfo.logicalPath) || /^\/(?:albuns|álbuns|albums)\/[^/]+$/i.test(routeInfo.logicalPath);
    // Páginas legais são totalmente estáticas e localizadas no servidor.
    // Não aguardam o Supabase, reduzindo o tempo de resposta em cache frio.
    const [settings, seoCatalog] = await Promise.all([
      (legalRequest || recoveryRequest || profileUsername) ? Promise.resolve(settingsCache.value || {}) : loadSettings(),
      needsSeoCatalog ? loadSeoCatalog() : Promise.resolve([])
    ]);
    const seoRecord = needsSeoCatalog ? seoRecordFromRoute(routeInfo, seoCatalog) : null;
    let publicProfile = null;
    if (profileUsername) {
      try {
        publicProfile = await PUBLIC_PROFILE_API.fetchPublicProfile(profileUsername);
      } catch (_) {}
    }
    const html = injectDeploymentVersion(
      injectLocalePreload(
        localizeStaticText(
          injectSocialMetadata(injectLocaleDocument(readTemplate(), routeInfo), settings, origin, routeInfo, publicProfile, seoRecord),
          routeInfo
        ),
        routeInfo
      )
    );
    const updateCandidates = [
      req.query && req.query.__betv_update,
      req && req.url,
      req && req.headers && req.headers['x-vercel-original-path'],
      req && req.headers && req.headers['x-original-url'],
      req && req.headers && req.headers['x-rewrite-url']
    ];
    const updateRequest = updateCandidates.some((candidate, index) => {
      if (index === 0) return Boolean(String(candidate || '').trim());
      try { return Boolean(new URL(String(candidate || ''), OFFICIAL_SITE_ORIGIN).searchParams.get('__betv_update')); }
      catch (_) { return false; }
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      (recoveryRequest || updateRequest)
        ? 'private, no-store, max-age=0, must-revalidate'
        : legalRequest
          ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
          : profileUsername
            ? 'public, max-age=60, s-maxage=120, stale-while-revalidate=600'
            : seoRecord
              ? 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600'
              : 'public, max-age=60, s-maxage=300, stale-while-revalidate=1800'
    );
    if (updateRequest) {
      res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const requestPath = routeInfo.logicalPath;
    if (isNoindexRoute(routeInfo)) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(html);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).send('Não foi possível carregar o site.');
  }
};

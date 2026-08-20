'use strict';

const DEFAULT_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const DEFAULT_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const ALLOWED_COLLECTIONS = new Set([
  'contents', 'featured', 'gallery', 'movies', 'news', 'notifications', 'ongs', 'sections', 'series', 'videos'
]);
const HOME_BOOTSTRAP_COLLECTIONS = Object.freeze(['sections', 'videos', 'movies', 'series', 'featured', 'news']);
const PUBLIC_ITEM_FIELDS = new Set([
  'active', 'bannerUrl', 'category', 'contentCollection', 'contentId', 'contentUrl',
  'description', 'duration', 'imageUrl', 'itemLimit', 'itemType', 'link', 'logoUrl',
  'mediaType', 'mobileAppDriveUrl', 'minimumDonationCents', 'minimumDonationUsdCents', 'order', 'publicId', 'runtime', 'sectionId', 'sectionName', 'slug',
  'sourceCollection', 'streamingAvailability', 'streamingLinks', 'subtitleUrl', 'thumbnailUrl', 'title', 'tracks', 'translations', 'type', 'videoDuration', 'videoId',
  'videoUrl', 'year'
]);
const MEDIA_FIELDS = new Set(['imageUrl', 'thumbnailUrl', 'bannerUrl', 'logoUrl']);
const SITE_SETTING_FIELDS = new Set([
  'description', 'discordUrl', 'footerText', 'instagram', 'primaryColor',
  'translations',
  'shareImage', 'siteName', 'website', 'xUrl', 'youtube',
  'updateReleaseEnabled', 'releasedDeploymentVersion'
]);
const ONG_SETTING_FIELDS = new Set(['bannerUrl', 'translations']);
const BILLIE_SETTING_FIELDS = new Set([
  'bannerUrl', 'includeReferences', 'instagram', 'kicker', 'manualBio', 'portraitUrl',
  'sourceMode', 'spotify', 'title', 'translations', 'website', 'xUrl', 'youtube'
]);

const upstreamResponseCache = new Map();
const FEATURED_CACHE_TAG = 'betv-featured';
const NOTIFICATIONS_CACHE_TAG = 'betv-notifications';

function normalizeLocale(value) {
  const locale = String(value || 'pt-br').trim().toLowerCase();
  if (locale === 'en' || locale === 'en-us') return 'en-us';
  if (locale === 'es') return 'es';
  if (locale === 'fr') return 'fr';
  return 'pt-br';
}

function upstreamTtl(name, id) {
  if (name === 'settings' && id === 'site') return 10 * 60 * 1000;
  // A borda da Vercel já segura o tráfego de notificações. Não mantenha uma
  // segunda cópia em memória na Function, pois ela pode sobreviver a uma
  // invalidação por tag e reconstruir o CDN com uma lista antiga.
  if (name === 'notifications') return 0;
  if (name === 'featured') return 0;
  if (name === 'movies') return 30 * 60 * 1000;
  return 30 * 60 * 1000;
}

async function cachedUpstream(key, ttl, loader) {
  const now = Date.now();
  const cached = upstreamResponseCache.get(key);
  if (cached && cached.expiresAt > now) return cached.promise;
  const promise = Promise.resolve().then(loader).catch(error => {
    upstreamResponseCache.delete(key);
    throw error;
  });
  upstreamResponseCache.set(key, { promise, expiresAt: now + ttl });
  return promise;
}

function config() {
  return {
    url: String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL).replace(/\/$/, ''),
    key: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY
  };
}

function serviceRoleKey() {
  return String(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SB_SERVICE_ROLE_KEY ||
    ''
  ).trim();
}

async function fetchPrivateSettingWithServiceRole(id) {
  const key = serviceRoleKey();
  if (!key) return null;
  const { url } = config();
  const params = new URLSearchParams({ select: 'id,data,created_at,updated_at', id: `eq.${id}`, limit: '1' });
  const response = await fetch(`${url}/rest/v1/site_settings?${params.toString()}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
    cache: 'no-store'
  });
  if (!response.ok) return null;
  const rows = await response.json().catch(() => []);
  const row = Array.isArray(rows) ? rows[0] : null;
  return row && row.data && typeof row.data === 'object' ? row.data : null;
}

function isLocalAsset(value) {
  return /^\/(?!\/)/.test(String(value || '').trim());
}

function mediaReference(collection, id, field, value) {
  const raw = String(value || '').trim();
  if (!raw || isLocalAsset(raw)) return raw;
  if (!/^https:\/\//i.test(raw)) return '';
  // Entrega a URL original ao navegador. O frontend tenta a origem diretamente
  // e recorre a /api/media apenas se a imagem falhar, evitando uma Function por
  // imagem em cada visita ao catálogo/perfil.
  return raw.slice(0, 6000);
}

function safeText(value, maxLength = 20000) {
  return String(value ?? '').slice(0, maxLength);
}

function safeLink(value, allowLocal = true) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (allowLocal && /^\/(?!\/)/.test(raw)) return raw.slice(0, 2000);
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.href.slice(0, 2000) : '';
  } catch (_) {
    return '';
  }
}


function sanitizeTranslations(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const allowedFields = new Set(['title','name','description','subtitle','body','summary','buttonLabel','buttonText','actionLabel','ctaLabel','label','text','manualBio','kicker','footerText','sectionName','siteName','duration','runtime','videoDuration','sourceUpdatedAt','translatedAt','provider','revision','style']);
  const result = {};
  for (const locale of ['en-us','es','fr']) {
    const source = value[locale];
    if (!source || typeof source !== 'object' || Array.isArray(source)) continue;
    const translation = {};
    for (const field of allowedFields) {
      if (!Object.prototype.hasOwnProperty.call(source, field)) continue;
      translation[field] = safeText(source[field], ['description','body','manualBio'].includes(field) ? 20000 : 1000);
    }
    result[locale] = translation;
  }
  return result;
}

function sanitizeItem(collection, row) {
  const wrapped = row && typeof row === 'object'
    ? (row.get_public_content_items || row.item || row)
    : null;
  if (!wrapped || typeof wrapped !== 'object') return null;
  row = wrapped;
  const raw = row.data && typeof row.data === 'object' ? row.data : {};
  const source = {};
  for (const field of PUBLIC_ITEM_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(raw, field)) continue;
    source[field] = raw[field];
  }
  for (const field of MEDIA_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      source[field] = mediaReference(collection, row.id, field, source[field]);
    }
  }
  for (const field of ['contentUrl', 'videoUrl', 'link', 'subtitleUrl', 'mobileAppDriveUrl']) {
    if (Object.prototype.hasOwnProperty.call(source, field)) source[field] = safeLink(source[field], true);
  }
  for (const field of ['title', 'type', 'category', 'description', 'duration', 'runtime', 'videoDuration', 'year', 'sectionName', 'slug']) {
    if (Object.prototype.hasOwnProperty.call(source, field)) source[field] = safeText(source[field], field === 'description' ? 4000 : 500);
  }
  if (Object.prototype.hasOwnProperty.call(source, 'streamingAvailability')) {
    const allowedStreamingServices = new Set(['apple-tv', 'prime-video', 'paramount-plus', 'disney-plus']);
    const rawStreaming = Array.isArray(source.streamingAvailability)
      ? source.streamingAvailability
      : String(source.streamingAvailability || '').split(',');
    source.streamingAvailability = Array.from(new Set(rawStreaming
      .map(value => String(value || '').trim().toLowerCase())
      .filter(value => allowedStreamingServices.has(value))));
  }
  if (Object.prototype.hasOwnProperty.call(source, 'streamingLinks')) {
    const allowedStreamingServices = new Set(['apple-tv', 'prime-video', 'paramount-plus', 'disney-plus']);
    const rawLinks = source.streamingLinks && typeof source.streamingLinks === 'object' && !Array.isArray(source.streamingLinks)
      ? source.streamingLinks
      : {};
    source.streamingLinks = Object.fromEntries(Object.entries(rawLinks)
      .filter(([serviceId]) => allowedStreamingServices.has(String(serviceId || '').trim().toLowerCase()))
      .map(([serviceId, value]) => [String(serviceId).trim().toLowerCase(), safeLink(value, false)])
      .filter(([, value]) => Boolean(value)));
  }
  if (Object.prototype.hasOwnProperty.call(source, 'tracks')) {
    source.tracks = (Array.isArray(source.tracks) ? source.tracks : [])
      .slice(0, 100)
      .map((track, index) => ({
        title: safeText(track && (track.title || track.name) || '', 200).trim(),
        duration: safeText(track && (track.duration || track.time) || '', 30).trim(),
        order: Number.isFinite(Number(track && track.order)) ? Number(track.order) : index
      }))
      .filter(track => track.title);
  }
  if (Object.prototype.hasOwnProperty.call(source, 'translations')) source.translations = sanitizeTranslations(source.translations);
  source.active = source.active !== false && String(source.active).toLowerCase() !== 'false';
  if (collection === 'ongs') {
    const minimumDonationCents = Number(source.minimumDonationCents);
    source.minimumDonationCents = Number.isInteger(minimumDonationCents) && minimumDonationCents >= 100 && minimumDonationCents <= 100000000
      ? minimumDonationCents
      : 500;
    const minimumDonationUsdCents = Number(source.minimumDonationUsdCents);
    source.minimumDonationUsdCents = Number.isInteger(minimumDonationUsdCents) && minimumDonationUsdCents >= 100 && minimumDonationUsdCents <= 100000000
      ? minimumDonationUsdCents
      : 100;
  }
  return {
    id: safeText(row.id, 100),
    ...source,
    createdAt: safeText(row.created_at || row.createdAt || '', 80),
    updatedAt: safeText(row.updated_at || row.updatedAt || '', 80)
  };
}

function sanitizeSettings(id, raw) {
  if (!raw || typeof raw !== 'object') return null;
  const allowed = id === 'billie-eilish' ? BILLIE_SETTING_FIELDS : id === 'site' ? SITE_SETTING_FIELDS : id === 'ong' ? ONG_SETTING_FIELDS : null;
  if (!allowed) return null;
  const source = { id };
  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(raw, field)) source[field] = raw[field];
  }
  if (Object.prototype.hasOwnProperty.call(source, 'translations')) source.translations = sanitizeTranslations(source.translations);
  if (id === 'ong') {
    source.bannerUrl = mediaReference('settings', id, 'bannerUrl', source.bannerUrl);
  } else if (id === 'billie-eilish') {
    source.sourceMode = source.sourceMode === 'wikipedia' ? 'wikipedia' : 'manual';
    source.includeReferences = source.includeReferences === true || String(source.includeReferences) === 'true';
    source.title = safeText(source.title, 100);
    source.kicker = safeText(source.kicker, 80);
    source.manualBio = safeText(source.manualBio, 20000);
    for (const field of ['instagram', 'xUrl', 'youtube', 'spotify', 'website']) source[field] = safeLink(source[field], false);
    for (const field of ['portraitUrl', 'bannerUrl']) {
      source[field] = mediaReference('settings', id, field, source[field]);
    }
  } else {
    for (const field of ['instagram', 'xUrl', 'youtube', 'website', 'discordUrl']) source[field] = safeLink(source[field], false);
    if (Object.prototype.hasOwnProperty.call(source, 'shareImage')) {
      source.shareImage = mediaReference('settings', id, 'shareImage', source.shareImage);
    }
    source.siteName = safeText(source.siteName, 100);
    source.description = safeText(source.description, 500);
    source.footerText = safeText(source.footerText, 500);
    source.primaryColor = safeText(source.primaryColor, 32);
    source.updateReleaseEnabled = source.updateReleaseEnabled === true || String(source.updateReleaseEnabled || '').toLowerCase() === 'true';
    source.releasedDeploymentVersion = safeText(source.releasedDeploymentVersion, 100).trim();
  }
  return source;
}

async function callRpc(functionName, body) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('public_data_unavailable');
  return response.json();
}

async function fetchLegacyRows(name, id) {
  const { url, key } = config();
  const headers = { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' };
  if (name === 'settings') {
    const params = new URLSearchParams({ select: 'id,data,created_at,updated_at', id: `eq.${id}`, limit: '1' });
    const response = await fetch(`${url}/rest/v1/site_settings?${params.toString()}`, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('settings_unavailable');
    const rows = await response.json();
    return Array.isArray(rows) ? rows : [];
  }
  const params = new URLSearchParams({ select: 'id,data,created_at,updated_at', collection: `eq.${name}` });
  if (id) params.set('id', `eq.${id}`);
  const response = await fetch(`${url}/rest/v1/content_items?${params.toString()}`, { headers, cache: 'no-store' });
  if (!response.ok) throw new Error('content_unavailable');
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

async function fetchRowsUncached(name, id, locale) {
  if (name === 'settings') {
    if (!id || !['site', 'billie-eilish', 'ong'].includes(id)) throw new Error('invalid_setting');
    try {
      const payload = await callRpc('get_public_site_setting_v2', { p_id: id, p_locale: locale });
      const value = Array.isArray(payload) ? payload[0] : payload;
      const sanitized = sanitizeSettings(id, value);
      return sanitized ? [sanitized] : [];
    } catch (_) {
      try {
        const payload = await callRpc('get_public_site_setting', { p_id: id });
        const value = Array.isArray(payload) ? payload[0] : payload;
        const sanitized = sanitizeSettings(id, value);
        return sanitized ? [sanitized] : [];
      } catch (_) {
        const rows = await fetchLegacyRows(name, id);
        const value = rows[0]?.data || null;
        const sanitized = sanitizeSettings(id, value);
        return sanitized ? [sanitized] : [];
      }
    }
  }
  if (!ALLOWED_COLLECTIONS.has(name)) throw new Error('invalid_collection');
  try {
    const payload = await callRpc('get_public_content_items_v2', {
      p_collection: name,
      p_id: id || null,
      p_locale: locale
    });
    const rows = Array.isArray(payload) ? payload : [];
    return rows.map(row => sanitizeItem(name, row)).filter(Boolean);
  } catch (_) {
    try {
      const payload = await callRpc('get_public_content_items', { p_collection: name, p_id: id || null });
      const rows = Array.isArray(payload) ? payload : [];
      return rows.map(row => sanitizeItem(name, row)).filter(Boolean);
    } catch (_) {
      const rows = await fetchLegacyRows(name, id);
      return rows.map(row => sanitizeItem(name, row)).filter(Boolean);
    }
  }
}

async function fetchRows(name, id, locale) {
  const key = `${name}:${id || ''}:${locale}`;
  return cachedUpstream(key, upstreamTtl(name, id), () => fetchRowsUncached(name, id, locale));
}

async function fetchHomeBootstrap(locale) {
  const entries = await Promise.all(HOME_BOOTSTRAP_COLLECTIONS.map(async name => [name, await fetchRows(name, '', locale)]));
  const settingsRows = await fetchRows('settings', 'site', locale);
  return {
    ...Object.fromEntries(entries),
    settings: { site: settingsRows[0] || null },
    // Permite ao navegador detectar quando recebeu um bootstrap antigo do CDN
    // e refazer somente a leitura de Destaques, sem invalidar o catálogo todo.
    __generatedAt: Date.now()
  };
}

function setPublicCacheHeaders(res, name, id, hasData) {
  if (!hasData) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    return;
  }

  let browserSeconds = 300;
  let edgeSeconds = 900;
  let staleSeconds = 7200;

  if (name === 'home-bootstrap') {
    // O navegador já mantém o bundle da Home por 30 minutos. Mantemos a borda
    // pelo mesmo período para que visitantes novos compartilhem a mesma resposta
    // sem aumentar o prazo máximo aceitável para um vídeo novo aparecer.
    browserSeconds = 1800;
    edgeSeconds = 1800;
    staleSeconds = 1800;
  } else if (name === 'settings' && id === 'site') {
    browserSeconds = 300;
    edgeSeconds = 600;
    staleSeconds = 3600;
  } else if (name === 'notifications') {
    // O navegador sempre revalida o sino; a resposta continua barata porque a
    // Vercel mantém a cópia compartilhada na borda. Assim um PT-BR que já havia
    // aberto o site não fica preso por minutos numa lista antiga do browser.
    browserSeconds = 0;
    edgeSeconds = 300;
    staleSeconds = 1800;
  } else if (name === 'featured') {
    browserSeconds = 60;
    edgeSeconds = 60;
    staleSeconds = 60;
  } else if (name === 'movies') {
    browserSeconds = 300;
    edgeSeconds = 1800;
    staleSeconds = 10800;
  }

  // O cache de Destaques recebe uma tag própria. O Admin invalida somente essa
  // tag ao salvar/excluir um destaque, sem derrubar o cache do catálogo inteiro.
  if (name === 'featured' || name === 'home-bootstrap') {
    res.setHeader('Vercel-Cache-Tag', FEATURED_CACHE_TAG);
  } else if (name === 'notifications') {
    res.setHeader('Vercel-Cache-Tag', NOTIFICATIONS_CACHE_TAG);
  }

  // O navegador evita repetir a mesma leitura durante navegação/reloads curtos.
  // A Vercel mantém uma cópia compartilhada por mais tempo para que milhares de
  // visitantes não transformem o mesmo conteúdo público em milhares de Functions.
  if (name === 'notifications') {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  } else {
    res.setHeader('Cache-Control', `public, max-age=${browserSeconds}, stale-while-revalidate=${Math.min(staleSeconds, 3600)}`);
  }
  res.setHeader('Vercel-CDN-Cache-Control', `public, max-age=${edgeSeconds}, stale-while-revalidate=${staleSeconds}`);
}

module.exports = async function publicData(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  try {
    const name = String(Array.isArray(req.query?.name) ? req.query.name[0] : req.query?.name || '').trim().toLowerCase();
    const id = String(Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id || '').trim();
    const locale = normalizeLocale(Array.isArray(req.query?.locale) ? req.query.locale[0] : req.query?.locale);
    if (!name || name.length > 40 || id.length > 100) return res.status(400).end();

    let payload;
    let hasData = false;
    if (name === 'home-bootstrap') {
      if (id) return res.status(400).end();
      payload = await fetchHomeBootstrap(locale);
      hasData = HOME_BOOTSTRAP_COLLECTIONS.some(collection => Array.isArray(payload?.[collection]) && payload[collection].length > 0);
    } else {
      const rows = await fetchRows(name, id, locale);
      payload = id ? (rows[0] || null) : rows;
      hasData = rows.length > 0;
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    // Nunca mantém uma resposta vazia em cache: um vazio transitório fazia a Home
    // interpretar que não existiam seções e ocultar todo o catálogo.
    setPublicCacheHeaders(res, name, id, hasData);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(JSON.stringify(payload));
  } catch (_) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(404).end();
  }
};

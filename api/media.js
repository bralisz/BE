'use strict';

const MAX_BYTES = 12 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 12000;
const DEFAULT_SUPABASE_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const ALLOWED_COLLECTIONS = new Set(['contents', 'featured', 'gallery', 'movies', 'notifications', 'ongs', 'sections', 'series', 'videos']);
const ALLOWED_MEDIA_FIELDS = new Set(['imageUrl', 'thumbnailUrl', 'bannerUrl', 'logoUrl', 'shareImage', 'portraitUrl']);

const SUPABASE_RUNTIME_SOURCES = [
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.0/dist/umd/supabase.min.js',
  'https://unpkg.com/@supabase/supabase-js@2.112.0/dist/umd/supabase.js'
];

const ALLOWED_HOSTS = new Set([
  'cdn.discordapp.com',
  'cdn.theplaylist.net',
  'disney.images.edge.bamgrid.com',
  'dwgyu36up6iuz.cloudfront.net',
  'dx35vtwkllhj9.cloudfront.net',
  'encrypted-tbn0.gstatic.com',
  'fycextras.com',
  'i.imgur.com',
  'i.pinimg.com',
  'i.ytimg.com',
  'i0.wp.com',
  'image.tmdb.org',
  'images.ctfassets.net',
  'img10.hotstar.com',
  'lh3.googleusercontent.com',
  'm.media-amazon.com',
  'media.themoviedb.org',
  'occ-0-3934-3933.1.nflxso.net',
  'upload.wikimedia.org',
  'variety.com',
  'www.billboard.com',
  'www.hollywoodreporter.com'
]);

const ALLOWED_SUFFIXES = [
  '.bamgrid.com', '.billboard.com', '.cloudfront.net', '.ctfassets.net',
  '.discordapp.com', '.googleusercontent.com', '.gstatic.com', '.hollywoodreporter.com',
  '.hotstar.com', '.imgur.com', '.media-amazon.com', '.nflxso.net',
  '.pinimg.com', '.themoviedb.org', '.theplaylist.net', '.tmdb.org',
  '.wikimedia.org', '.wp.com', '.ytimg.com'
];

async function serveSupabaseRuntime(req, res) {
  for (const url of SUPABASE_RUNTIME_SOURCES) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'BETV/1.0' } });
      if (!response.ok) continue;
      const body = await response.text();
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (req.method === 'HEAD') return res.status(200).end();
      return res.status(200).send(body);
    } catch (_) {
      // Tenta a próxima origem.
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  return res.status(502).send("console.error('Não foi possível carregar a biblioteca de autenticação.');");
}

function decodeBase64Url(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 ? '='.repeat(4 - (normalized.length % 4)) : '';
  return Buffer.from(normalized + padding, 'base64').toString('utf8');
}

function supabaseConfig() {
  return {
    url: String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, ''),
    key: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY
  };
}

async function storedMediaSource(collection, id, field) {
  const name = String(collection || '').trim().toLowerCase();
  const itemId = String(id || '').trim();
  const mediaField = String(field || '').trim();
  if (!itemId || itemId.length > 100 || !ALLOWED_MEDIA_FIELDS.has(mediaField)) throw new Error('invalid_reference');
  const { url, key } = supabaseConfig();
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
  let endpoint = '';
  let body = null;
  if (name === 'settings') {
    if (!['site', 'billie-eilish', 'ong'].includes(itemId)) throw new Error('invalid_reference');
    endpoint = `${url}/rest/v1/rpc/get_public_site_setting`;
    body = { p_id: itemId };
  } else {
    if (!ALLOWED_COLLECTIONS.has(name)) throw new Error('invalid_reference');
    endpoint = `${url}/rest/v1/rpc/get_public_content_items`;
    body = { p_collection: name, p_id: itemId };
  }
  let source = '';
  try {
    const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body), cache: 'no-store' });
    if (!response.ok) throw new Error('rpc_unavailable');
    const payload = await response.json();
    const record = Array.isArray(payload) ? payload[0] : payload;
    source = name === 'settings' ? record?.[mediaField] : record?.data?.[mediaField];
  } catch (_) {
    // Compatibilidade temporária para publicar o código antes da migration de segurança.
    let legacyEndpoint = '';
    if (name === 'settings') {
      const params = new URLSearchParams({ select: 'data', id: `eq.${itemId}`, limit: '1' });
      legacyEndpoint = `${url}/rest/v1/site_settings?${params.toString()}`;
    } else {
      const params = new URLSearchParams({ select: 'data', collection: `eq.${name}`, id: `eq.${itemId}`, limit: '1' });
      legacyEndpoint = `${url}/rest/v1/content_items?${params.toString()}`;
    }
    const legacyResponse = await fetch(legacyEndpoint, { headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' }, cache: 'no-store' });
    if (!legacyResponse.ok) throw new Error('source_unavailable');
    const rows = await legacyResponse.json();
    source = Array.isArray(rows) ? rows[0]?.data?.[mediaField] : '';
  }
  if (!source) throw new Error('source_unavailable');
  return String(source);
}

function isIpLiteral(hostname) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(':');
}

function isAllowedHost(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/\.$/, '');
  if (!host || host === 'localhost' || host.endsWith('.localhost') || isIpLiteral(host)) return false;
  return ALLOWED_HOSTS.has(host) || ALLOWED_SUFFIXES.some(suffix => host.endsWith(suffix));
}

function validateTarget(raw) {
  let url;
  try { url = new URL(String(raw || '').trim()); }
  catch (_) { throw new Error('invalid_url'); }
  if (url.protocol !== 'https:' || !isAllowedHost(url.hostname)) throw new Error('blocked_host');
  url.username = '';
  url.password = '';
  url.hash = '';
  return url;
}

function upstreamHeaders(url) {
  const host = String(url.hostname || '').toLowerCase();
  const headers = {
    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
  };
  if (host.endsWith('.pinimg.com')) headers.Referer = 'https://www.pinterest.com/';
  else if (host.endsWith('.ytimg.com')) headers.Referer = 'https://www.youtube.com/';
  else if (host.endsWith('.nflxso.net')) headers.Referer = 'https://www.netflix.com/';
  else if (host.endsWith('.bamgrid.com') || host.endsWith('.hotstar.com')) headers.Referer = 'https://www.disneyplus.com/';
  else if (host.endsWith('.billboard.com')) headers.Referer = 'https://www.billboard.com/';
  else if (host.endsWith('.hollywoodreporter.com')) headers.Referer = 'https://www.hollywoodreporter.com/';
  return headers;
}

async function fetchImage(initialUrl) {
  let current = validateTarget(initialUrl);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(current, {
        method: 'GET', redirect: 'manual', signal: controller.signal,
        headers: upstreamHeaders(current)
      });
    } finally { clearTimeout(timer); }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location || redirects === MAX_REDIRECTS) throw new Error('redirect_failed');
      current = validateTarget(new URL(location, current).href);
      continue;
    }

    if (!response.ok) throw new Error('upstream_failed');
    const contentType = String(response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!contentType.startsWith('image/') && contentType !== 'application/octet-stream') throw new Error('not_image');
    const declaredSize = Number(response.headers.get('content-length') || 0);
    if (declaredSize > MAX_BYTES) throw new Error('too_large');
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > MAX_BYTES) throw new Error('too_large');
    return { bytes, contentType: contentType.startsWith('image/') ? contentType : 'image/jpeg' };
  }
  throw new Error('redirect_failed');
}

module.exports = async function mediaProxy(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  const mode = Array.isArray(req.query?.mode) ? req.query.mode[0] : req.query?.mode;
  if (mode === 'supabase-runtime') return serveSupabaseRuntime(req, res);
  try {
    const token = Array.isArray(req.query?.u) ? req.query.u[0] : req.query?.u;
    const collection = Array.isArray(req.query?.c) ? req.query.c[0] : req.query?.c;
    const id = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;
    const field = Array.isArray(req.query?.f) ? req.query.f[0] : req.query?.f;
    let source = '';
    if (token) {
      if (String(token).length > 6000) return res.status(400).end();
      source = decodeBase64Url(token);
    } else if (collection && id && field) {
      source = await storedMediaSource(collection, id, field);
    } else {
      return res.status(400).end();
    }
    const { bytes, contentType } = await fetchImage(source);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Vary', 'Accept');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(bytes);
  } catch (_) {
    const placeholder = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9" viewBox="0 0 16 9"><rect width="16" height="9" fill="#142238"/><path d="M2 7l3-3 2 2 2-2 5 3" fill="none" stroke="#31527d" stroke-width=".6"/></svg>');
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(placeholder);
  }
};

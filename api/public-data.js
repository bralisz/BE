'use strict';

const DEFAULT_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const DEFAULT_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const ALLOWED_COLLECTIONS = new Set([
  'contents', 'featured', 'gallery', 'movies', 'notifications', 'sections', 'series', 'videos'
]);
const MEDIA_FIELDS = new Set(['imageUrl', 'thumbnailUrl', 'bannerUrl', 'logoUrl']);
const PUBLIC_SETTINGS_FIELDS = new Set([
  'description', 'discordUrl', 'footerText', 'instagram', 'primaryColor',
  'shareImage', 'siteName', 'website', 'xUrl', 'youtube'
]);

function config() {
  return {
    url: String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL).replace(/\/$/, ''),
    key: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY
  };
}

function isLocalAsset(value) {
  return /^(?:\/|data:|blob:)/i.test(String(value || '').trim());
}

function mediaReference(collection, id, field, value) {
  const raw = String(value || '').trim();
  if (!raw || isLocalAsset(raw)) return raw;
  if (!/^https:\/\//i.test(raw)) return '';
  const params = new URLSearchParams({ c: collection, id: String(id), f: field });
  return `/api/media?${params.toString()}`;
}

function sanitizeItem(collection, row) {
  if (!row) return null;
  const source = { ...(row.data || {}) };
  for (const field of MEDIA_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      source[field] = mediaReference(collection, row.id, field, source[field]);
    }
  }
  return {
    id: row.id,
    ...source,
    createdAt: source.createdAt || row.created_at || '',
    updatedAt: source.updatedAt || row.updated_at || ''
  };
}

function sanitizeSettings(row) {
  if (!row) return null;
  const raw = row.data && typeof row.data === 'object' ? row.data : {};
  const source = {};
  for (const field of PUBLIC_SETTINGS_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(raw, field)) source[field] = raw[field];
  }
  if (Object.prototype.hasOwnProperty.call(source, 'shareImage')) {
    source.shareImage = mediaReference('settings', row.id, 'shareImage', source.shareImage);
  }
  return { id: row.id, ...source, createdAt: row.created_at || '', updatedAt: row.updated_at || '' };
}

async function fetchRows(name, id) {
  const { url, key } = config();
  const headers = { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' };
  if (name === 'settings') {
    const params = new URLSearchParams({ select: 'id,data,created_at,updated_at' });
    if (id) params.set('id', `eq.${id}`);
    const response = await fetch(`${url}/rest/v1/site_settings?${params.toString()}`, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('settings_unavailable');
    const rows = await response.json();
    return (Array.isArray(rows) ? rows : []).map(sanitizeSettings);
  }
  if (!ALLOWED_COLLECTIONS.has(name)) throw new Error('invalid_collection');
  const params = new URLSearchParams({ select: 'id,data,created_at,updated_at', collection: `eq.${name}` });
  if (id) params.set('id', `eq.${id}`);
  const response = await fetch(`${url}/rest/v1/content_items?${params.toString()}`, { headers, cache: 'no-store' });
  if (!response.ok) throw new Error('content_unavailable');
  const rows = await response.json();
  return (Array.isArray(rows) ? rows : []).map(row => sanitizeItem(name, row));
}

module.exports = async function publicData(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  try {
    const name = String(Array.isArray(req.query?.name) ? req.query.name[0] : req.query?.name || '').trim().toLowerCase();
    const id = String(Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id || '').trim();
    if (!name || name.length > 40 || id.length > 100) return res.status(400).end();
    const rows = await fetchRows(name, id);
    const payload = id ? (rows[0] || null) : rows;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(JSON.stringify(payload));
  } catch (_) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(404).end();
  }
};

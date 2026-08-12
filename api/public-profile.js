'use strict';

const DEFAULT_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const DEFAULT_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const ALLOWED_COLLECTIONS = new Set(['videos', 'movies', 'series', 'albums']);

function config() {
  return {
    url: String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL).replace(/\/$/, ''),
    key: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY
  };
}

function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase().replace(/^@+/, '');
}

function validUsername(value) {
  return /^[a-z0-9](?:[a-z0-9._]{1,18}[a-z0-9])?$/.test(value) &&
    value.length >= 3 && value.length <= 20 &&
    !value.includes('..') && !value.includes('__') &&
    !value.includes('._') && !value.includes('_.');
}

function safeText(value, maxLength) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength);
}

function safeColor(value) {
  const normalized = String(value || '').trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : '';
}

function safeAsset(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.includes('\\') || /[\u0000-\u001f\u007f]/.test(raw)) return '';
  try {
    const url = new URL(raw, 'https://billieilishtv.site');
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    if (url.hostname !== 'billieilishtv.site' && url.hostname !== 'www.billieilishtv.site') return '';
    return `${url.pathname}${url.search}`.slice(0, 1200);
  } catch (_) {}
  return '';
}

function sanitizeContent(item) {
  const source = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
  const collection = ALLOWED_COLLECTIONS.has(String(source.collection || '').toLowerCase())
    ? String(source.collection).toLowerCase()
    : 'videos';
  return {
    itemId: safeText(source.itemId, 120),
    recordId: safeText(source.recordId, 120),
    favoriteId: safeText(source.favoriteId, 180),
    title: safeText(source.title || 'Conteúdo', 160),
    year: safeText(source.year, 20),
    duration: safeText(source.duration, 40),
    imageUrl: safeAsset(source.imageUrl || source.bannerUrl),
    bannerUrl: safeAsset(source.bannerUrl || source.imageUrl),
    logoUrl: safeAsset(source.logoUrl),
    collection
  };
}

function sanitizeList(value, limit) {
  if (!Array.isArray(value)) return [];
  const result = [];
  for (const entry of value) {
    const item = sanitizeContent(entry);
    const identity = item.favoriteId || item.itemId || (item.recordId ? `${item.collection}:${item.recordId}` : '') || item.title;
    if (!identity || result.some(current => (current.favoriteId || current.itemId || `${current.collection}:${current.recordId}` || current.title) === identity)) continue;
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}

function sanitizeSocialLinks(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    x: safeText(source.x || source.twitter, 80),
    instagram: safeText(source.instagram, 100),
    tiktok: safeText(source.tiktok, 80)
  };
}

function sanitizeProfile(row) {
  if (!row || typeof row !== 'object') return null;
  const username = normalizeUsername(row.username);
  if (!validUsername(username)) return null;
  return {
    displayName: safeText(row.display_name || row.displayName || 'Usuário', 80),
    username,
    avatarUrl: safeAsset(row.avatar_url || row.avatarUrl),
    bannerUrl: safeAsset(row.banner_url || row.bannerUrl),
    communityTag: safeText(row.community_tag || row.communityTag, 20).toLowerCase(),
    profileColor: safeColor(row.profile_color || row.profileColor),
    avatarBorderColor: safeColor(row.avatar_border_color || row.avatarBorderColor),
    createdAt: safeText(row.created_at || row.createdAt, 40),
    socialLinks: sanitizeSocialLinks(row.social_links || row.socialLinks),
    favorites: sanitizeList(row.favorites, 4),
    lovedAlbums: sanitizeList(row.loved_albums || row.lovedAlbums, 3),
    savedContents: sanitizeList(row.saved_contents || row.savedContents, 20),
    likesReceived: Math.max(0, Math.floor(Number(row.likes_received ?? row.likesReceived ?? 0) || 0))
  };
}

async function fetchPublicProfile(username) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/rpc/get_public_profile`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ p_username: username }),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('public_profile_unavailable');
  const payload = await response.json();
  const row = Array.isArray(payload) ? payload[0] : payload;
  return sanitizeProfile(row);
}

async function publicProfile(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const username = normalizeUsername(Array.isArray(req.query?.username) ? req.query.username[0] : req.query?.username);
  if (!validUsername(username)) return res.status(400).end();

  try {
    const profile = await fetchPublicProfile(username);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!profile) {
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=20, stale-while-revalidate=60');
      return res.status(404).end();
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=120');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(JSON.stringify(profile));
  } catch (_) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).end();
  }
};

module.exports = publicProfile;
module.exports.fetchPublicProfile = fetchPublicProfile;
module.exports.normalizeUsername = normalizeUsername;
module.exports.validUsername = validUsername;

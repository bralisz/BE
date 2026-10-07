'use strict';

const DEFAULT_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const DEFAULT_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const ALLOWED_COLLECTIONS = new Set(['videos', 'movies', 'series', 'albums']);
const SAFE_MEDIA_HOSTS = new Set([
  'cdn.discordapp.com', 'media.discordapp.net', 'images-ext-1.discordapp.net', 'images-ext-2.discordapp.net',
  'cdn.theplaylist.net', 'disney.images.edge.bamgrid.com', 'dwgyu36up6iuz.cloudfront.net',
  'dx35vtwkllhj9.cloudfront.net', 'encrypted-tbn0.gstatic.com', 'fycextras.com', 'i.imgur.com',
  'i.scdn.co', 'i.pinimg.com', 'i.ytimg.com', 'i0.wp.com', 'image.tmdb.org', 'images.ctfassets.net',
  'img10.hotstar.com', 'lh3.googleusercontent.com', 'm.media-amazon.com', 'media.themoviedb.org',
  'occ-0-3934-3933.1.nflxso.net', 'pbs.twimg.com', 'upload.wikimedia.org', 'variety.com',
  'www.billboard.com', 'www.hollywoodreporter.com'
]);
const SAFE_MEDIA_SUFFIXES = [
  '.bamgrid.com', '.billboard.com', '.cloudfront.net', '.ctfassets.net', '.discordapp.com', '.discordapp.net',
  '.googleusercontent.com', '.gstatic.com', '.hollywoodreporter.com', '.hotstar.com', '.imgur.com',
  '.media-amazon.com', '.nflxso.net', '.pinimg.com', '.scdn.co', '.spotifycdn.com', '.themoviedb.org',
  '.theplaylist.net', '.tmdb.org', '.twimg.com', '.wikimedia.org', '.wp.com', '.ytimg.com'
];

function config() {
  return {
    url: String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL).replace(/\/$/, ''),
    key: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY,
    serviceKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SB_SERVICE_ROLE_KEY ||
      ''
  };
}

function adminKey() {
  const cfg = config();
  return cfg.serviceKey || cfg.key;
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
    url.hash = '';
    const host = String(url.hostname || '').toLowerCase().replace(/\.$/, '');
    if (host === 'billieilishtv.site' || host === 'www.billieilishtv.site') {
      return `${url.pathname}${url.search}`.slice(0, 2000);
    }
    const trustedExternal = SAFE_MEDIA_HOSTS.has(host) || SAFE_MEDIA_SUFFIXES.some(suffix => host.endsWith(suffix));
    if (!trustedExternal) return '';
    return url.href.slice(0, 2000);
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
    id: safeText(row.id || row.user_id, 80),
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
    likesReceived: Math.max(0, Math.floor(Number(row.likes_received ?? row.likesReceived ?? 0) || 0)),
    followersCount: Math.max(0, Math.floor(Number(row.followers_count ?? row.followersCount ?? 0) || 0)),
    followingCount: Math.max(0, Math.floor(Number(row.following_count ?? row.followingCount ?? 0) || 0))
  };
}

async function restFetch(path, options = {}) {
  const { url } = config();
  const key = options.key || adminKey();
  const response = await fetch(`${url}${path}`, {
    method: options.method || 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store'
  });
  if (!response.ok) {
    const error = new Error(`supabase_${response.status}`);
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

async function restFetchWithCount(path, offset = 0, limit = 1) {
  const { url } = config();
  const key = adminKey();
  const start = Math.max(0, Math.floor(Number(offset) || 0));
  const size = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 1)));
  const response = await fetch(`${url}${path}`, {
    method: 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Prefer: 'count=exact',
      Range: `${start}-${start + size - 1}`
    },
    cache: 'no-store'
  });
  if (!response.ok) {
    const error = new Error(`supabase_${response.status}`);
    error.status = response.status;
    throw error;
  }
  const contentRange = String(response.headers.get('content-range') || '');
  const match = contentRange.match(/\/(\d+|\*)$/);
  const total = match && match[1] !== '*' ? Math.max(0, Number(match[1]) || 0) : 0;
  const rows = await response.json();
  return { rows: Array.isArray(rows) ? rows : [], total };
}

async function fetchPublicProfile(username) {
  const payload = await restFetch('/rest/v1/rpc/get_public_profile', {
    method: 'POST',
    key: config().key,
    body: { p_username: username }
  });
  const row = Array.isArray(payload) ? payload[0] : payload;
  return sanitizeProfile(row);
}

async function fetchFollowStats(username) {
  const rows = await restFetch('/rest/v1/rpc/get_profile_follow_state', {
    method: 'POST', key: config().key, body: { p_username: username }
  });
  const row = Array.isArray(rows) ? rows[0] : rows;
  return { followersCount: Math.max(0, Number(row?.followers_count) || 0), followingCount: Math.max(0, Number(row?.following_count) || 0) };
}

async function fetchRelationshipList(username, type, offset, limit, search) {
  const safeOffset = Math.max(0, Math.floor(Number(offset) || 0));
  const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit) || 20)));
  const rows = await restFetch('/rest/v1/rpc/get_profile_relationships', {
    method: 'POST', key: config().key,
    body: { p_profile: username, p_type: type === 'following' ? 'following' : 'followers',
      p_search: safeText(search, 80), p_offset: safeOffset, p_limit: safeLimit }
  });
  const items = (Array.isArray(rows) ? rows : []).map(row => ({
    id: safeText(row.id, 80), username: normalizeUsername(row.username),
    displayName: safeText(row.display_name || 'Usuário', 80),
    avatarUrl: safeAsset(row.avatar_url), communityTag: safeText(row.community_tag, 20).toLowerCase()
  })).filter(row => row.id && validUsername(row.username));
  const total = rows?.length ? Math.max(0, Number(rows[0].total_count) || 0) : 0;
  return { items, total, offset: safeOffset, limit: safeLimit, hasMore: safeOffset + items.length < total };
}

async function publicProfile(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const username = normalizeUsername(Array.isArray(req.query?.username) ? req.query.username[0] : req.query?.username);
  if (!validUsername(username)) return res.status(400).end();
  const view = String(Array.isArray(req.query?.view) ? req.query.view[0] : req.query?.view || '').trim().toLowerCase();

  try {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (view === 'relationships') {
      const type = String(Array.isArray(req.query?.type) ? req.query.type[0] : req.query?.type || 'followers').trim().toLowerCase();
      const offset = Array.isArray(req.query?.offset) ? req.query.offset[0] : req.query?.offset;
      const limit = Array.isArray(req.query?.limit) ? req.query.limit[0] : req.query?.limit;
      const search = Array.isArray(req.query?.q) ? req.query.q[0] : req.query?.q || '';
      const payload = await fetchRelationshipList(username, type, offset, limit, search);
      res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60');
      if (req.method === 'HEAD') return res.status(200).end();
      return res.status(200).send(JSON.stringify(payload));
    }

    const profile = await fetchPublicProfile(username);
    if (!profile) {
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300');
      return res.status(404).end();
    }
    const stats = await fetchFollowStats(username).catch(() => ({ followersCount: 0, followingCount: 0 }));
    const payload = { ...profile, followersCount: stats.followersCount, followingCount: stats.followingCount };
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(JSON.stringify(payload));
  } catch (_) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).end();
  }
}

module.exports = publicProfile;
module.exports.fetchPublicProfile = fetchPublicProfile;
module.exports.fetchFollowStats = fetchFollowStats;
module.exports.fetchRelationshipList = fetchRelationshipList;
module.exports.normalizeUsername = normalizeUsername;
module.exports.validUsername = validUsername;

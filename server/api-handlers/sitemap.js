'use strict';

const SITE_ORIGIN = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://billieilishtv.site').replace(/\/$/, '');
const DEFAULT_SUPABASE_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const LOCALES = ['pt-br', 'en-us', 'es', 'fr'];
const CONTENT_COLLECTIONS = ['videos', 'movies', 'series', 'contents'];
const STATIC_PATHS = ['/', '/billie-eilish', '/albuns', '/ong', '/suporte', '/comunidade', '/fãs'];
const LOCALIZED_ROUTE_SLUGS = Object.freeze({
  'pt-br': Object.freeze({ '/comunidade': '/comunidade', '/fãs': '/fãs' }),
  'en-us': Object.freeze({ '/comunidade': '/community', '/fãs': '/fans' }),
  es: Object.freeze({ '/comunidade': '/comunidad', '/fãs': '/fans' }),
  fr: Object.freeze({ '/comunidade': '/communaute', '/fãs': '/fans' })
});

function supabaseConfig() {
  return {
    url: String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, ''),
    key: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_PUBLISHABLE_KEY
  };
}

function xml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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

function normalizeDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const date = new Date(raw);
  return Number.isFinite(date.getTime()) ? date.toISOString() : '';
}

function unwrapRow(row) {
  const wrapped = row && typeof row === 'object'
    ? (row.get_public_content_items || row.item || row)
    : null;
  if (!wrapped || typeof wrapped !== 'object') return null;
  const data = wrapped.data && typeof wrapped.data === 'object' ? wrapped.data : {};
  const active = data.active !== false && String(data.active).toLowerCase() !== 'false';
  if (!active) return null;
  return {
    id: String(wrapped.id || data.id || '').trim(),
    data,
    updatedAt: normalizeDate(wrapped.updated_at || wrapped.updatedAt || wrapped.created_at || wrapped.createdAt || '')
  };
}

async function fetchCollection(collection) {
  const { url, key } = supabaseConfig();
  const headers = { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' };
  try {
    const response = await fetch(`${url}/rest/v1/rpc/get_public_content_items`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_collection: collection, p_id: null }),
      cache: 'no-store'
    });
    if (response.ok) {
      const payload = await response.json();
      return (Array.isArray(payload) ? payload : []).map(unwrapRow).filter(Boolean);
    }
  } catch (_) {}

  const params = new URLSearchParams({ select: 'id,data,created_at,updated_at', collection: `eq.${collection}` });
  const legacy = await fetch(`${url}/rest/v1/content_items?${params.toString()}`, { headers, cache: 'no-store' });
  if (!legacy.ok) throw new Error(`sitemap_${collection}_unavailable`);
  const payload = await legacy.json();
  return (Array.isArray(payload) ? payload : []).map(unwrapRow).filter(Boolean);
}

function addLocalizedUrls(entries, logicalPath, lastmod = '') {
  for (const locale of LOCALES) {
    const localizedPath = (LOCALIZED_ROUTE_SLUGS[locale] && LOCALIZED_ROUTE_SLUGS[locale][logicalPath]) || logicalPath;
    const cleanPath = localizedPath === '/' ? '' : localizedPath;
    entries.push({ loc: `${SITE_ORIGIN}/${locale}${cleanPath}`, lastmod });
  }
}

async function collectEntries() {
  const entries = [];
  for (const path of STATIC_PATHS) addLocalizedUrls(entries, path);

  const results = await Promise.allSettled([
    ...CONTENT_COLLECTIONS.map(fetchCollection),
    fetchCollection('news')
  ]);

  const seenContentIds = new Set();
  results.slice(0, CONTENT_COLLECTIONS.length).forEach(result => {
    if (result.status !== 'fulfilled') return;
    result.value.forEach(row => {
      const data = row.data || {};
      const id = numericPublicId(data.publicId || row.id || data.title);
      if (!/^\d{8}$/.test(id) || seenContentIds.has(id)) return;
      seenContentIds.add(id);
      addLocalizedUrls(entries, `/${id}`, row.updatedAt);
    });
  });

  const albumResult = results[CONTENT_COLLECTIONS.length];
  if (albumResult && albumResult.status === 'fulfilled') {
    const seenAlbums = new Set();
    albumResult.value.forEach(row => {
      if (!row.id || seenAlbums.has(row.id) || !String(row.data?.title || '').trim()) return;
      seenAlbums.add(row.id);
      addLocalizedUrls(entries, `/albuns/${encodeURIComponent(row.id)}`, row.updatedAt);
    });
  }

  const unique = new Map();
  entries.forEach(entry => unique.set(entry.loc, entry));
  return Array.from(unique.values());
}

module.exports = async function sitemap(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  try {
    const entries = await collectEntries();
    const urls = entries.map(entry => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${xml(entry.lastmod)}</lastmod>` : '';
      return `  <url>\n    <loc>${xml(entry.loc)}</loc>${lastmod}\n  </url>`;
    }).join('\n');
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(body);
  } catch (_) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
};

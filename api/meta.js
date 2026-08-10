'use strict';

// Consolidates small public/meta endpoints into a single Vercel Serverless Function.
// Public URLs remain unchanged through rewrites in vercel.json.

const crypto = require('crypto');
const accountStatus = require('../server/api-handlers/account-status');

const PAGE_TITLE = 'Billie_Eilish';
const USER_AGENT = 'BETV/1.1 (+https://billieilishtv.site; contato: billieilishtv@gmail.com)';
const WIKIPEDIA_SITES = Object.freeze({
  'pt-br': Object.freeze({
    slug: 'pt-br',
    language: 'pt-BR',
    origin: 'https://pt.wikipedia.org',
    sourceLabel: 'Wikipédia em português'
  }),
  'en-us': Object.freeze({
    slug: 'en-us',
    language: 'en-US',
    origin: 'https://en.wikipedia.org',
    sourceLabel: 'English Wikipedia'
  }),
  es: Object.freeze({
    slug: 'es',
    language: 'es',
    origin: 'https://es.wikipedia.org',
    sourceLabel: 'Wikipedia en español'
  })
});

function safeJson(response) {
  return response.text().then(text => {
    if (!text) return null;
    try { return JSON.parse(text); } catch (_) { return null; }
  });
}

function requestedLocale(req) {
  let value = '';
  try {
    value = String(req.query && req.query.lang || new URL(req.url || '/', 'https://billieilishtv.site').searchParams.get('lang') || '');
  } catch (_) {}
  value = value.trim().toLowerCase().replace('_', '-');
  if (value === 'en' || value === 'en-us' || value === 'us') return WIKIPEDIA_SITES['en-us'];
  if (value === 'es' || value.startsWith('es-')) return WIKIPEDIA_SITES.es;
  return WIKIPEDIA_SITES['pt-br'];
}

function apiUrl(origin, parameters) {
  const url = new URL('/w/api.php', origin);
  Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
  return url;
}

function pageFromQuery(payload) {
  const pages = payload && payload.query && payload.query.pages;
  if (Array.isArray(pages)) return pages[0] || null;
  if (pages && typeof pages === 'object') return Object.values(pages)[0] || null;
  return null;
}

function cleanHtml(value) {
  return String(value || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|iframe|object|embed|form)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');
}

function localizedError(locale) {
  if (locale.slug === 'en-us') return 'Wikipedia did not return the requested article.';
  if (locale.slug === 'es') return 'Wikipedia no devolvió el artículo solicitado.';
  return 'A Wikipédia não retornou o artigo solicitado.';
}

async function billieWikipedia(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const locale = requestedLocale(req);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Language', locale.language);
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    const requestHeaders = {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
      'Accept-Language': locale.language
    };
    const parseRequest = fetch(apiUrl(locale.origin, {
      action: 'parse',
      page: PAGE_TITLE,
      prop: 'text|sections|displaytitle|revid',
      redirects: '1',
      format: 'json',
      formatversion: '2',
      uselang: locale.language.split('-')[0]
    }), { headers: requestHeaders });

    const infoRequest = fetch(apiUrl(locale.origin, {
      action: 'query',
      titles: PAGE_TITLE,
      prop: 'pageimages|revisions|info',
      piprop: 'original',
      rvprop: 'ids|timestamp',
      inprop: 'url',
      redirects: '1',
      format: 'json',
      formatversion: '2',
      uselang: locale.language.split('-')[0]
    }), { headers: requestHeaders });

    const [parseResponse, infoResponse] = await Promise.all([parseRequest, infoRequest]);
    const [parsePayload, infoPayload] = await Promise.all([safeJson(parseResponse), safeJson(infoResponse)]);
    if (!parseResponse.ok || !parsePayload || !parsePayload.parse || !parsePayload.parse.text) {
      throw new Error(localizedError(locale));
    }

    const article = parsePayload.parse;
    const page = pageFromQuery(infoPayload) || {};
    const revision = Array.isArray(page.revisions) ? page.revisions[0] || {} : {};
    const sourceUrl = page.fullurl || `${locale.origin}/wiki/Billie_Eilish`;
    const payload = {
      title: String(article.title || 'Billie Eilish'),
      displayTitle: String(article.displaytitle || article.title || 'Billie Eilish'),
      html: cleanHtml(article.text),
      sections: Array.isArray(article.sections) ? article.sections.map(section => ({
        index: String(section.index || ''),
        level: Number(section.level || 2),
        line: String(section.line || ''),
        anchor: String(section.anchor || '')
      })) : [],
      imageUrl: String(page.original && page.original.source || ''),
      revisionId: Number(revision.revid || article.revid || 0) || null,
      revisionTimestamp: String(revision.timestamp || ''),
      sourceUrl,
      sourceLabel: locale.sourceLabel,
      wikipediaOrigin: locale.origin,
      locale: locale.slug,
      language: locale.language,
      license: 'CC BY-SA 4.0',
      fetchedAt: new Date().toISOString()
    };

    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).json(payload);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: error && error.message ? error.message : localizedError(locale) });
  }
};

function deploymentVersion() {
  const commit = String(process.env.VERCEL_GIT_COMMIT_SHA || '').trim();
  const deploymentUrl = String(process.env.VERCEL_URL || '').trim();
  const environment = String(process.env.VERCEL_ENV || process.env.NODE_ENV || 'development').trim();

  if (!commit && !deploymentUrl) return `local:${environment}`;
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${commit}:${deploymentUrl}`)
    .digest('hex')
    .slice(0, 24);
  return `v:${fingerprint}`;
}

function deploymentVersionHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).json({ version: deploymentVersion() });
};

const ROBOTS_SITE_ORIGIN = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://billieilishtv.site').replace(/\/$/, '');

function robots(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    '# Permite que o conteúdo público seja usado nos recursos compatíveis do Gemini.',
    'User-agent: Google-Extended',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${ROBOTS_SITE_ORIGIN}/sitemap.xml`,
    ''
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).send(body);
};

const SITEMAP_SITE_ORIGIN = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://billieilishtv.site').replace(/\/$/, '');
const DEFAULT_SUPABASE_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const LOCALES = ['pt-br', 'en-us', 'es'];
const CONTENT_COLLECTIONS = ['videos', 'movies', 'series', 'contents'];
const STATIC_PATHS = ['/', '/billie-eilish', '/albuns', '/ong', '/suporte', '/comunidade', '/fãs'];
const LOCALIZED_ROUTE_SLUGS = Object.freeze({
  'pt-br': Object.freeze({ '/comunidade': '/comunidade', '/fãs': '/fãs' }),
  'en-us': Object.freeze({ '/comunidade': '/community', '/fãs': '/fans' }),
  es: Object.freeze({ '/comunidade': '/comunidad', '/fãs': '/fans' })
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
    entries.push({ loc: `${SITEMAP_SITE_ORIGIN}/${locale}${cleanPath}`, lastmod });
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

async function sitemap(req, res) {
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

const handlers = Object.freeze({
  'account-status': accountStatus,
  'deployment-version': deploymentVersionHandler,
  robots: robots,
  sitemap: sitemap,
  'billie-wikipedia': billieWikipedia
});

module.exports = async function metaRouter(req, res) {
  const route = String(req.query && req.query.handler || '').trim().toLowerCase();
  const handler = handlers[route];

  if (!handler) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(404).json({ error: 'Endpoint não encontrado.' });
  }

  return handler(req, res);
};

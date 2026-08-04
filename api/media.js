'use strict';

const MAX_BYTES = 12 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 12000;

const ALLOWED_HOSTS = new Set([
  'disney.images.edge.bamgrid.com',
  'encrypted-tbn0.gstatic.com',
  'i.imgur.com',
  'imgur.com',
  'i.pinimg.com',
  'i.ytimg.com',
  'image.tmdb.org',
  'media.themoviedb.org',
  'images.ctfassets.net',
  'upload.wikimedia.org',
  'www.billboard.com',
  'www.hollywoodreporter.com',
  'variety.com',
  'i0.wp.com',
  'm.media-amazon.com',
  'img10.hotstar.com'
]);

const ALLOWED_SUFFIXES = [
  '.cloudfront.net', '.gstatic.com', '.googleusercontent.com', '.imgur.com',
  '.pinimg.com', '.ytimg.com', '.tmdb.org', '.themoviedb.org',
  '.ctfassets.net', '.nflxso.net', '.wikimedia.org', '.billboard.com',
  '.hollywoodreporter.com', '.bamgrid.com', '.hotstar.com',
  '.theplaylist.net', '.mzstatic.com', '.amazon.com', '.media-amazon.com'
];

function decodeBase64Url(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 ? '='.repeat(4 - (normalized.length % 4)) : '';
  return Buffer.from(normalized + padding, 'base64').toString('utf8');
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

async function fetchImage(initialUrl) {
  let current = validateTarget(initialUrl);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(current, {
        method: 'GET', redirect: 'manual', signal: controller.signal,
        headers: {
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; BETV-Media-Proxy/1.0)'
        }
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
  try {
    const token = Array.isArray(req.query?.u) ? req.query.u[0] : req.query?.u;
    if (!token || String(token).length > 6000) return res.status(400).end();
    const { bytes, contentType } = await fetchImage(decodeBase64Url(token));
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Vary', 'Accept');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(bytes);
  } catch (_) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.status(404).end();
  }
};

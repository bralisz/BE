'use strict';

const { once } = require('events');

const REQUEST_TIMEOUT_MS = 15000;
const FILE_ID_PATTERN = /^[a-z0-9_-]{10,}$/i;
const RESOURCE_KEY_PATTERN = /^[a-z0-9_-]+$/i;

const MIME_BY_EXTENSION = Object.freeze({
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  opus: 'audio/ogg',
  flac: 'audio/flac',
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  vtt: 'text/vtt',
  srt: 'application/x-subrip'
});

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function safeFileId(value) {
  const normalized = String(firstQueryValue(value) || '').trim();
  return FILE_ID_PATTERN.test(normalized) ? normalized : '';
}

function safeResourceKey(value) {
  const normalized = String(firstQueryValue(value) || '').trim();
  return !normalized || RESOURCE_KEY_PATTERN.test(normalized) ? normalized : '';
}

function wantsMetadata(req) {
  const value = String(firstQueryValue(req.query?.metadata ?? req.query?.meta) || '').trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
}

function sourceUrls(fileId, resourceKey) {
  const makeUrl = base => {
    const url = new URL(base);
    url.searchParams.set('id', fileId);
    url.searchParams.set('export', 'download');
    url.searchParams.set('confirm', 't');
    url.searchParams.set('authuser', '0');
    if (resourceKey) url.searchParams.set('resourcekey', resourceKey);
    return url;
  };
  return [
    makeUrl('https://drive.usercontent.google.com/download'),
    makeUrl('https://drive.google.com/uc')
  ];
}

function previewUrl(fileId, resourceKey) {
  const url = new URL(`https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`);
  url.searchParams.set('usp', 'sharing');
  if (resourceKey) url.searchParams.set('resourcekey', resourceKey);
  return url;
}

function filenameFromDisposition(value) {
  const header = String(value || '');
  const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) {
    try { return decodeURIComponent(utf8[1].replace(/^"|"$/g, '')); }
    catch (_) { return utf8[1].replace(/^"|"$/g, ''); }
  }
  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain?.[1] ? plain[1].trim() : '';
}

function extensionFromFilename(filename) {
  const match = String(filename || '').toLowerCase().match(/\.([a-z0-9]{2,5})(?:$|[?#])/);
  return match?.[1] || '';
}

function mimeFromFilename(filename) {
  return MIME_BY_EXTENSION[extensionFromFilename(filename)] || '';
}

function normalizedContentType(response) {
  const raw = String(response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const filename = filenameFromDisposition(response.headers.get('content-disposition'));
  const guessed = mimeFromFilename(filename);
  if (!raw || raw === 'application/octet-stream' || raw === 'binary/octet-stream') return guessed || 'application/octet-stream';
  return raw;
}

function mediaKind(contentType, disposition = '', filename = '') {
  const type = String(contentType || '').toLowerCase();
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('video/')) return 'video';
  const guessed = mimeFromFilename(filename || filenameFromDisposition(disposition));
  if (guessed.startsWith('audio/')) return 'audio';
  if (guessed.startsWith('video/')) return 'video';
  return '';
}

function looksLikeDriveError(response, contentType) {
  if ([401, 403, 404].includes(response.status)) return true;
  const type = String(contentType || '').toLowerCase();
  return type.startsWith('text/html') || type.startsWith('application/json');
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code) || 0));
}

function filenameFromPreviewHtml(html) {
  const source = String(html || '');
  const patterns = [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<meta[^>]+itemprop=["']name["'][^>]+content=["']([^"']+)["']/i,
    /<title>([^<]+)<\/title>/i,
    /["']([^"']+\.(?:mp3|m4a|aac|wav|ogg|oga|opus|flac|mp4|m4v|webm|mov|mkv|vtt|srt))["']/i
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (!match?.[1]) continue;
    const value = decodeHtmlEntities(match[1]).replace(/\s+-\s+Google Drive\s*$/i, '').trim();
    if (value) return value;
  }
  return '';
}

function mimeFromPreviewHtml(html) {
  const source = String(html || '').toLowerCase();
  const knownTypes = [
    'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/wav', 'audio/ogg', 'audio/flac',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'
  ];
  return knownTypes.find(type => source.includes(type)) || '';
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function decodeGoogleEscapes(value) {
  return decodeHtmlEntities(String(value || ''))
    .replace(/\\u003d/gi, '=')
    .replace(/\\u0026/gi, '&')
    .replace(/\\u003f/gi, '?')
    .replace(/\\\//g, '/');
}

function responseCookies(response) {
  try {
    const values = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [response.headers.get('set-cookie')].filter(Boolean);
    return values
      .flatMap(value => String(value || '').split(/,(?=[^;,]+=)/))
      .map(value => value.split(';')[0].trim())
      .filter(Boolean)
      .join('; ');
  } catch (_) {
    return '';
  }
}

function confirmedDownloadUrl(html, baseUrl) {
  const source = String(html || '');
  const directPatterns = [
    /["']downloadUrl["']\s*:\s*["']([^"']+)["']/i,
    /["']download_url["']\s*:\s*["']([^"']+)["']/i,
    /href=["']([^"']*(?:drive\.usercontent\.google\.com|drive\.google\.com)[^"']*(?:confirm|export=download)[^"']*)["']/i
  ];

  for (const pattern of directPatterns) {
    const match = source.match(pattern);
    if (!match?.[1]) continue;
    try {
      const candidate = new URL(decodeGoogleEscapes(match[1]), baseUrl);
      if (['drive.google.com', 'drive.usercontent.google.com'].includes(candidate.hostname.toLowerCase())) return candidate;
    } catch (_) { /* tenta o formulário abaixo */ }
  }

  const formMatch = source.match(/<form[^>]+(?:id=["']download-form["'][^>]*|action=["'][^"']*(?:drive\.usercontent\.google\.com|drive\.google\.com)[^"']*["'][^>]*)>/i);
  if (!formMatch?.[0]) return null;
  const actionMatch = formMatch[0].match(/action=["']([^"']+)["']/i);
  if (!actionMatch?.[1]) return null;

  try {
    const candidate = new URL(decodeGoogleEscapes(actionMatch[1]), baseUrl);
    const inputs = source.matchAll(/<input[^>]+name=["']([^"']+)["'][^>]+value=["']([^"']*)["'][^>]*>/gi);
    for (const input of inputs) candidate.searchParams.set(decodeGoogleEscapes(input[1]), decodeGoogleEscapes(input[2]));
    if (!candidate.searchParams.has('confirm')) candidate.searchParams.set('confirm', 't');
    if (['drive.google.com', 'drive.usercontent.google.com'].includes(candidate.hostname.toLowerCase())) return candidate;
  } catch (_) { /* URL inválida */ }
  return null;
}

async function fetchDriveSource(url, req, probeOnly = false) {
  const clientRange = String(req.headers.range || '').trim();
  const requestedRange = probeOnly && !clientRange ? 'bytes=0-0' : clientRange;
  const headers = {
    Accept: '*/*',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
  };
  if (requestedRange) headers.Range = requestedRange;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    redirect: 'follow',
    headers
  });

  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  if (!contentType.startsWith('text/html')) return response;

  const html = await response.text();
  const confirmedUrl = confirmedDownloadUrl(html, response.url || url);
  if (!confirmedUrl) return response;

  const cookie = responseCookies(response);
  const confirmedHeaders = { ...headers };
  if (cookie) confirmedHeaders.Cookie = cookie;
  return fetchWithTimeout(confirmedUrl, {
    method: 'GET',
    redirect: 'follow',
    headers: confirmedHeaders
  });
}

async function fetchPreviewMetadata(fileId, resourceKey) {
  try {
    const response = await fetchWithTimeout(previewUrl(fileId, resourceKey), {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) return null;
    const html = await response.text();
    const filename = filenameFromPreviewHtml(html);
    const contentType = mimeFromPreviewHtml(html) || mimeFromFilename(filename) || 'application/octet-stream';
    return {
      filename,
      contentType,
      kind: mediaKind(contentType, '', filename)
    };
  } catch (_) {
    return null;
  }
}

function copyHeader(upstream, res, name) {
  const value = upstream.headers.get(name);
  if (value) res.setHeader(name, value);
}

async function pipeBody(upstream, req, res) {
  if (!upstream.body) return res.end();
  let disconnected = false;
  const onClose = () => { disconnected = !res.writableEnded; };
  res.once('close', onClose);
  try {
    for await (const chunk of upstream.body) {
      if (disconnected || res.destroyed) break;
      if (!res.write(Buffer.from(chunk))) await once(res, 'drain');
    }
    if (!res.writableEnded && !res.destroyed) res.end();
  } finally {
    res.removeListener('close', onClose);
  }
}

function sendMetadata(res, metadata) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.end(JSON.stringify({
    kind: metadata?.kind || '',
    contentType: metadata?.contentType || 'application/octet-stream',
    filename: metadata?.filename || ''
  }));
}

function rejectExplicitCrossSite(req, res) {
  const fetchSite = String(req && req.headers && req.headers['sec-fetch-site'] || '').trim().toLowerCase();
  if (fetchSite !== 'cross-site') return false;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.status(403).end();
  return true;
}

module.exports = async function driveMediaProxy(req, res) {
  if (rejectExplicitCrossSite(req, res)) return;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const fileId = safeFileId(req.query?.id);
  const rawResourceKey = firstQueryValue(req.query?.resourcekey);
  const resourceKey = safeResourceKey(rawResourceKey);
  if (!fileId || (rawResourceKey && !resourceKey)) return res.status(400).end();

  const metadataRequest = wantsMetadata(req);

  try {
    let upstream = null;
    let contentType = '';
    let filename = '';

    for (const url of sourceUrls(fileId, resourceKey)) {
      const candidate = await fetchDriveSource(url, req, metadataRequest || req.method === 'HEAD');
      const candidateType = normalizedContentType(candidate);
      if (!looksLikeDriveError(candidate, candidateType)) {
        upstream = candidate;
        contentType = candidateType;
        filename = filenameFromDisposition(candidate.headers.get('content-disposition'));
        break;
      }
      try { await candidate.body?.cancel(); } catch (_) { /* sem ação */ }
    }

    if (metadataRequest) {
      if (upstream) {
        const metadata = {
          filename,
          contentType,
          kind: mediaKind(contentType, upstream.headers.get('content-disposition'), filename)
        };
        try { await upstream.body?.cancel(); } catch (_) { /* sem ação */ }
        if (metadata.kind) return sendMetadata(res, metadata);
      }

      const previewMetadata = await fetchPreviewMetadata(fileId, resourceKey);
      if (previewMetadata) return sendMetadata(res, previewMetadata);
      return sendMetadata(res, { filename, contentType, kind: mediaKind(contentType, '', filename) });
    }

    if (!upstream) return res.status(502).end();

    const kind = mediaKind(contentType, upstream.headers.get('content-disposition'), filename);

    // Nunca retransmite arquivos de vídeo pela Function da Vercel. Mesmo se
    // algum código antigo chamar /api/drive-media sem ?metadata=1, devolvemos
    // um redirect para a origem final do Google Drive e encerramos o body aqui.
    // Isso protege Fast Origin Transfer, Fast Data Transfer e CPU/Functions.
    if (kind === 'video' && upstream.url) {
      try { await upstream.body?.cancel(); } catch (_) { /* sem ação */ }
      res.statusCode = 307;
      res.setHeader('Location', upstream.url);
      res.setHeader('Cache-Control', 'private, no-store, max-age=0');
      res.setHeader('X-BETV-Media-Kind', 'video');
      return res.end();
    }

    res.statusCode = upstream.status;
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes');

    if (kind) res.setHeader('X-BETV-Media-Kind', kind);

    copyHeader(upstream, res, 'content-length');
    copyHeader(upstream, res, 'content-range');
    copyHeader(upstream, res, 'etag');
    copyHeader(upstream, res, 'last-modified');

    if (req.method === 'HEAD') {
      try { await upstream.body?.cancel(); } catch (_) { /* sem ação */ }
      return res.end();
    }

    return pipeBody(upstream, req, res);
  } catch (error) {
    if (!res.headersSent) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(error?.name === 'AbortError' ? 504 : 502).end();
    }
    if (!res.writableEnded) res.end();
  }
};

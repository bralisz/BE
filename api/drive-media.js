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
  mkv: 'video/x-matroska'
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

function sourceUrls(fileId, resourceKey) {
  const makeUrl = base => {
    const url = new URL(base);
    url.searchParams.set('id', fileId);
    url.searchParams.set('export', 'download');
    url.searchParams.set('confirm', 't');
    if (resourceKey) url.searchParams.set('resourcekey', resourceKey);
    return url;
  };
  return [
    makeUrl('https://drive.usercontent.google.com/download'),
    makeUrl('https://drive.google.com/uc')
  ];
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
  const match = String(filename || '').toLowerCase().match(/\.([a-z0-9]{2,5})$/);
  return match?.[1] || '';
}

function normalizedContentType(response) {
  const raw = String(response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const filename = filenameFromDisposition(response.headers.get('content-disposition'));
  const guessed = MIME_BY_EXTENSION[extensionFromFilename(filename)] || '';
  if (!raw || raw === 'application/octet-stream' || raw === 'binary/octet-stream') return guessed || 'application/octet-stream';
  return raw;
}

function mediaKind(contentType, disposition) {
  const type = String(contentType || '').toLowerCase();
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('video/')) return 'video';
  const guessed = MIME_BY_EXTENSION[extensionFromFilename(filenameFromDisposition(disposition))] || '';
  if (guessed.startsWith('audio/')) return 'audio';
  if (guessed.startsWith('video/')) return 'video';
  return '';
}

function looksLikeDriveError(response, contentType) {
  if ([401, 403, 404].includes(response.status)) return true;
  const type = String(contentType || '').toLowerCase();
  return type.startsWith('text/html') || type.startsWith('application/json');
}

async function fetchDriveSource(url, req) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const clientRange = String(req.headers.range || '').trim();
  const probeRange = req.method === 'HEAD' && !clientRange ? 'bytes=0-0' : clientRange;
  const headers = {
    Accept: '*/*',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
  };
  if (probeRange) headers.Range = probeRange;

  try {
    return await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
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

module.exports = async function driveMediaProxy(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const fileId = safeFileId(req.query?.id);
  const rawResourceKey = firstQueryValue(req.query?.resourcekey);
  const resourceKey = safeResourceKey(rawResourceKey);
  if (!fileId || (rawResourceKey && !resourceKey)) return res.status(400).end();

  try {
    let upstream = null;
    let contentType = '';
    for (const url of sourceUrls(fileId, resourceKey)) {
      const candidate = await fetchDriveSource(url, req);
      const candidateType = normalizedContentType(candidate);
      if (!looksLikeDriveError(candidate, candidateType)) {
        upstream = candidate;
        contentType = candidateType;
        break;
      }
      try { await candidate.body?.cancel(); } catch (_) { /* sem ação */ }
    }

    if (!upstream) return res.status(502).end();

    res.statusCode = upstream.status;
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes');

    const kind = mediaKind(contentType, upstream.headers.get('content-disposition'));
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

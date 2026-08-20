'use strict';

const ALLOWED_HOST = 'cxkevnnxibhezvospkce.supabase.co';
const ALLOWED_PREFIX = '/storage/v1/object/public/movie-subtitles/';
const MAX_BYTES = 5 * 1024 * 1024;

function allowedSubtitleUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return null;
    if (url.hostname.toLowerCase() !== ALLOWED_HOST) return null;
    if (!url.pathname.startsWith(ALLOWED_PREFIX)) return null;
    if (!/\.(?:srt|vtt)$/i.test(url.pathname)) return null;
    return url;
  } catch (_) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const raw = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url;
  const target = allowedSubtitleUrl(raw);
  if (!target) return res.status(400).end();

  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 12000) : null;
  try {
    const upstream = await fetch(target.href, {
      headers: { Accept: 'text/vtt,text/plain,application/x-subrip,*/*;q=0.5' },
      redirect: 'follow',
      cache: 'no-store',
      signal: controller?.signal
    });
    if (!upstream.ok) return res.status(upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502).end();

    const contentLength = Number(upstream.headers.get('content-length') || 0);
    if (contentLength > MAX_BYTES) return res.status(413).end();
    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (buffer.length > MAX_BYTES) return res.status(413).end();

    const isVtt = /\.vtt$/i.test(target.pathname);
    res.setHeader('Content-Type', isVtt ? 'text/vtt; charset=utf-8' : 'text/plain; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('TV subtitle proxy failed:', error);
    return res.status(502).end();
  } finally {
    if (timer) clearTimeout(timer);
  }
};

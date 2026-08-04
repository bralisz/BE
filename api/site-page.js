'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';

function supabaseConfig() {
  return {
    url: String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cxkevnnxibhezvospkce.supabase.co').replace(/\/$/, ''),
    publishableKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_PUBLISHABLE_KEY
  };
}

function readTemplate() {
  const candidates = [
    path.join(process.cwd(), 'index.html'),
    path.join(__dirname, '..', 'index.html')
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
    } catch (_) {}
  }
  throw new Error('index.html não encontrado');
}

function attr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function publicOrigin(req) {
  const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  const host = forwardedHost || String(req.headers.host || 'billieilish-tv.vercel.app');
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto || (/^(localhost|127\.)/.test(host) ? 'http' : 'https');
  return `${protocol}://${host}`;
}

function absoluteHttpUrl(value, origin) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw, origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch (_) {
    return '';
  }
}

async function loadSettings() {
  const { url, publishableKey } = supabaseConfig();
  try {
    const response = await fetch(`${url}/rest/v1/site_settings?id=eq.site&select=data,updated_at&limit=1`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        Accept: 'application/json'
      }
    });
    if (!response.ok) return {};
    const rows = await response.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    return row ? { ...(row.data || {}), _updatedAt: row.updated_at || '' } : {};
  } catch (_) {
    return {};
  }
}

function injectSocialMetadata(html, settings, origin) {
  const title = 'Billie Eilish TV';
  const description = String(settings.description || 'Filmes, vídeos, entrevistas e atualizações em um só lugar.').trim();
  const selectedImage = absoluteHttpUrl(settings.shareImage, origin);
  const image = selectedImage || `${origin}/assets/login-admin-banner.jpg`;
  const canonical = `${origin}/`;

  html = html
    .replace(/\s*<meta\s+(?:property=["']og:[^>]+|name=["']twitter:[^>]+)[^>]*>/gi, '')
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, '');

  const metadata = `
<meta name="description" content="${attr(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${attr(title)}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:image" content="${attr(image)}">
<meta property="og:image:secure_url" content="${attr(image)}">
<meta property="og:image:alt" content="${attr(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(title)}">
<meta name="twitter:description" content="${attr(description)}">
<meta name="twitter:image" content="${attr(image)}">
<link rel="canonical" href="${attr(canonical)}">`;

  return html.replace('</title>', `</title>${metadata}`);
}

module.exports = async function sitePage(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  try {
    const origin = publicOrigin(req);
    const settings = await loadSettings();
    const html = injectSocialMetadata(readTemplate(), settings, origin);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(html);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).send('Não foi possível carregar o site.');
  }
};

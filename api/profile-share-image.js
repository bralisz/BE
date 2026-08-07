'use strict';

const sharp = require('sharp');
const publicProfileApi = require('./public-profile');

const WIDTH = 1200;
const HEIGHT = 630;
const CARD_WIDTH = 248;
const CARD_HEIGHT = 224;
const CARD_GAP = 22;
const CARD_START_X = 71;
const CARD_Y = 326;
const DEFAULT_ORIGIN = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://billieilishtv.site').replace(/\/$/, '');

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(1, maxLength - 1)).trim()}…`;
}

function originFromRequest(req) {
  const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  const host = forwardedHost || String(req.headers.host || new URL(DEFAULT_ORIGIN).host);
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto || (/^(localhost|127\.)/.test(host) ? 'http' : 'https');
  return `${protocol}://${host}`;
}

function absoluteAssetUrl(value, origin) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw, origin);
    if (!['http:', 'https:', 'data:'].includes(parsed.protocol)) return '';
    return parsed.href;
  } catch (_) {
    return '';
  }
}

async function fetchImageBuffer(value, origin, maxBytes = 10 * 1024 * 1024) {
  const url = absoluteAssetUrl(value, origin);
  if (!url) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8' },
      signal: controller.signal,
      cache: 'force-cache'
    });
    if (!response.ok) return null;
    const declaredLength = Number(response.headers.get('content-length') || 0);
    if (declaredLength && declaredLength > maxBytes) return null;
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (contentType && !contentType.startsWith('image/')) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length || buffer.length > maxBytes) return null;
    return buffer;
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function roundedMask(width, height, radius) {
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" rx="${radius}" fill="#fff"/></svg>`);
}

async function makeAvatar(buffer) {
  if (!buffer) {
    return sharp({
      create: { width: 138, height: 138, channels: 4, background: { r: 32, g: 37, b: 48, alpha: 1 } }
    })
      .composite([{ input: Buffer.from('<svg width="138" height="138" xmlns="http://www.w3.org/2000/svg"><circle cx="69" cy="69" r="67" fill="#222a39"/><circle cx="69" cy="56" r="25" fill="#7f8ba0"/><path d="M25 122c8-27 25-40 44-40s36 13 44 40" fill="#7f8ba0"/></svg>') }])
      .png()
      .toBuffer();
  }

  return sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize(138, 138, { fit: 'cover', position: 'centre' })
    .composite([{ input: roundedMask(138, 138, 69), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function cardLabel(collection) {
  const key = String(collection || '').toLowerCase();
  if (key === 'movies') return 'FILME';
  if (key === 'series') return 'SÉRIE';
  return 'VÍDEO';
}

async function makeFavoriteCard(item, index, imageBuffer) {
  const title = truncate(item && item.title ? item.title : `Favorito ${index + 1}`, 22);
  const label = cardLabel(item && item.collection);
  const base = imageBuffer
    ? sharp(imageBuffer, { failOn: 'none' }).rotate().resize(CARD_WIDTH, CARD_HEIGHT, { fit: 'cover', position: 'centre' })
    : sharp({
      create: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        channels: 4,
        background: { r: 23 + index * 5, g: 28, b: 42 + index * 8, alpha: 1 }
      }
    });

  const overlay = Buffer.from(`
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#03060b" stop-opacity="0.02"/>
          <stop offset="0.52" stop-color="#03060b" stop-opacity="0.08"/>
          <stop offset="1" stop-color="#03060b" stop-opacity="0.96"/>
        </linearGradient>
      </defs>
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#shade)"/>
      <rect x="${CARD_WIDTH - 72}" y="14" width="58" height="25" rx="7" fill="#f6f7fb" fill-opacity="0.94"/>
      <text x="${CARD_WIDTH - 43}" y="31" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="800" fill="#090b10">${escapeXml(label)}</text>
      <text x="18" y="195" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="800" fill="#fff">${escapeXml(title)}</text>
      <text x="18" y="215" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" fill="#b6bdca">FAVORITO ${index + 1}</text>
    </svg>`);

  return base
    .composite([
      { input: overlay },
      { input: roundedMask(CARD_WIDTH, CARD_HEIGHT, 18), blend: 'dest-in' }
    ])
    .png()
    .toBuffer();
}

async function makeBackground(bannerBuffer) {
  if (!bannerBuffer) {
    return sharp({
      create: { width: WIDTH, height: HEIGHT, channels: 4, background: { r: 7, g: 10, b: 16, alpha: 1 } }
    }).png().toBuffer();
  }

  return sharp(bannerBuffer, { failOn: 'none' })
    .rotate()
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
    .blur(3.5)
    .modulate({ brightness: 0.55, saturation: 0.75 })
    .png()
    .toBuffer();
}

async function renderProfileImage(profile, origin) {
  const favorites = Array.isArray(profile && profile.favorites) ? profile.favorites.slice(0, 4) : [];
  while (favorites.length < 4) favorites.push({ title: `Favorito ${favorites.length + 1}`, collection: 'videos' });

  const avatarUrl = profile && profile.avatarUrl ? profile.avatarUrl : '/assets/images/profile/default-avatar.png';
  const bannerUrl = profile && profile.bannerUrl ? profile.bannerUrl : '';
  const assetRequests = [
    fetchImageBuffer(avatarUrl, origin),
    fetchImageBuffer(bannerUrl, origin),
    ...favorites.map(item => fetchImageBuffer(item.imageUrl || item.bannerUrl, origin))
  ];
  const [avatarSource, bannerSource, ...favoriteSources] = await Promise.all(assetRequests);

  const [background, avatar, ...cards] = await Promise.all([
    makeBackground(bannerSource),
    makeAvatar(avatarSource),
    ...favorites.map((item, index) => makeFavoriteCard(item, index, favoriteSources[index]))
  ]);

  const displayName = truncate(profile && profile.displayName ? profile.displayName : 'Usuário', 32);
  const username = truncate(profile && profile.username ? profile.username : 'usuario', 20);
  const foreground = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pageShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#05070c" stop-opacity="0.54"/>
          <stop offset="0.46" stop-color="#060910" stop-opacity="0.82"/>
          <stop offset="1" stop-color="#06080d" stop-opacity="0.99"/>
        </linearGradient>
        <radialGradient id="glow" cx="18%" cy="4%" r="75%">
          <stop offset="0" stop-color="#315ea8" stop-opacity="0.22"/>
          <stop offset="1" stop-color="#0a0d14" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#pageShade)"/>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
      <circle cx="140" cy="160" r="73" fill="#fff" fill-opacity="0.96"/>
      <circle cx="140" cy="160" r="69" fill="#070a10"/>
      <text x="235" y="145" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="800" fill="#fff">${escapeXml(displayName)}</text>
      <text x="237" y="185" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="600" fill="#a6adba">@${escapeXml(username)}</text>
      <rect x="1035" y="70" width="94" height="50" rx="16" fill="#ffffff" fill-opacity="0.09" stroke="#ffffff" stroke-opacity="0.15"/>
      <text x="1082" y="104" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" fill="#fff">BE</text>
      <text x="71" y="288" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" letter-spacing="4" fill="#9098a8">FAVORITOS</text>
      <text x="1129" y="594" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="600" letter-spacing="1" fill="#8b93a2">BILLIEILISHTV.SITE</text>
    </svg>`);

  const composites = [
    { input: foreground, top: 0, left: 0 },
    { input: avatar, top: 91, left: 71 },
    ...cards.map((card, index) => ({ input: card, top: CARD_Y, left: CARD_START_X + index * (CARD_WIDTH + CARD_GAP) }))
  ];

  return sharp(background)
    .composite(composites)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function profileShareImage(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const username = publicProfileApi.normalizeUsername(
    Array.isArray(req.query && req.query.username) ? req.query.username[0] : req.query && req.query.username
  );
  if (!publicProfileApi.validUsername(username)) return res.status(400).end();

  try {
    const profile = await publicProfileApi.fetchPublicProfile(username);
    if (!profile) return res.status(404).end();
    const image = await renderProfileImage(profile, originFromRequest(req));
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', String(image.length));
    res.setHeader('Content-Disposition', `inline; filename="${username}-favoritos.png"`);
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(image);
  } catch (_) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).end();
  }
}

module.exports = profileShareImage;
module.exports.renderProfileImage = renderProfileImage;

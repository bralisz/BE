'use strict';

const REQUEST_TIMEOUT_MS = 9000;

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function safeOwner(value) {
  const raw = String(firstQueryValue(value) || '').trim();
  return /^-?\d{1,20}$/.test(raw) ? raw : '';
}

function safeId(value) {
  const raw = String(firstQueryValue(value) || '').trim();
  return /^\d{1,20}$/.test(raw) ? raw : '';
}

function safeHash(value) {
  const raw = String(firstQueryValue(value) || '').trim();
  if (!raw) return '';
  return /^[a-z0-9_-]{4,160}$/i.test(raw) ? raw : '';
}

function safeQuality(value) {
  const raw = Number(firstQueryValue(value));
  if (raw >= 1080) return 1080;
  if (raw >= 720) return 720;
  if (raw >= 480) return 480;
  if (raw >= 360) return 360;
  return 240;
}

function qs(items) {
  return Object.keys(items)
    .filter(key => items[key] !== '' && items[key] != null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(items[key]))}`)
    .join('&');
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&#38;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#34;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function decodeJsEscapes(value) {
  return decodeHtml(String(value || ''))
    .replace(/\\u0026/gi, '&')
    .replace(/\\u003d/gi, '=')
    .replace(/\\u003f/gi, '?')
    .replace(/\\u002f/gi, '/')
    .replace(/\\\//g, '/')
    .replace(/\\x26/gi, '&')
    .replace(/\\x3d/gi, '=');
}

function normalizeVkMediaUrl(value) {
  const raw = decodeJsEscapes(value).trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    const host = url.hostname.toLowerCase();
    // Restringe redirecionamentos aos CDNs do VK.
    if (!/(^|\.)(?:vk\.com|vkvideo\.ru|vk-cdn\.com|vk-cdn\.net|vkcdn\.net|vkuseraudio\.(?:net|ru)|vkuserlive\.net|vkuservideo\.net|vkuser\.net|userapi\.com|mycdn\.me|vk\.me)$/i.test(host)) return '';
    return url.href;
  } catch (_) {
    return '';
  }
}

function qualityCandidates(maxQuality) {
  const all = [1080, 720, 480, 360, 240, 144];
  return all.filter(value => value <= maxQuality);
}

function collectCandidate(map, quality, value) {
  const url = normalizeVkMediaUrl(value);
  if (!url) return;
  if (!map[quality]) map[quality] = url;
}

function extractVkMediaUrl(html, maxQuality) {
  const source = decodeHtml(String(html || ''));
  const found = Object.create(null);
  const qualities = [1080, 720, 480, 360, 240, 144];

  for (const quality of qualities) {
    const patterns = [
      new RegExp('["\\\'](?:url|mp4_|cache|src)' + quality + '["\\\']\\s*[:=]\\s*["\\\']([^"\\\']+)["\\\']', 'i'),
      new RegExp('(?:^|[?&])url' + quality + '=([^&"\\\']+)', 'i'),
      new RegExp('["\\\']mp4_' + quality + '["\\\']\\s*:\\s*["\\\']([^"\\\']+)["\\\']', 'i')
    ];
    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match && match[1]) collectCandidate(found, quality, match[1]);
    }
  }

  // Lê fontes alternativas do player do VK.
  const sourceRegex = /<(?:source|video)[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi;
  let sourceMatch;
  while ((sourceMatch = sourceRegex.exec(source))) {
    const candidate = decodeJsEscapes(sourceMatch[1]);
    const q = candidate.match(/(?:[._-]|quality=)(1080|720|480|360|240|144)(?:p)?(?:\D|$)/i);
    collectCandidate(found, q ? Number(q[1]) : 360, candidate);
  }

  // JSON may be escaped inside another JSON string. A broad pass catches URLs
  // such as \"url720\":\"https:\/\/...\".
  const escaped = decodeJsEscapes(source);
  for (const quality of qualities) {
    if (found[quality]) continue;
    const match = escaped.match(new RegExp('(?:url|mp4_|cache)' + quality + '[^a-z0-9]{1,12}(https?:[^"\\\'<>\\s]+)', 'i'));
    if (match && match[1]) collectCandidate(found, quality, match[1]);
  }

  for (const quality of qualityCandidates(maxQuality)) {
    if (found[quality]) return found[quality];
  }

  const mp4 = escaped.match(/https?:\\?\/\\?\/[^"'<>\s]+\.mp4(?:\?[^"'<>\s]*)?/i);
  if (mp4 && mp4[0]) {
    const normalized = normalizeVkMediaUrl(mp4[0]);
    if (normalized) return normalized;
  }

  // Alguns players do VK entregam somente HLS. Muitas Smart TVs antigas têm
  // suporte HLS nativo mesmo quando o iframe moderno do VK não funciona.
  const hlsPatterns = [
    /["'](?:hls|hls_url|hls_m3u8|manifest)["']\s*[:=]\s*["']([^"']+\.m3u8[^"']*)["']/i,
    /(https?:\\?\/\\?\/[^"'<>\s]+\.m3u8(?:\?[^"'<>\s]*)?)/i
  ];
  for (const pattern of hlsPatterns) {
    const match = escaped.match(pattern);
    if (!match || !match[1]) continue;
    const normalized = normalizeVkMediaUrl(match[1]);
    if (normalized) return normalized;
  }
  return '';
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function vkMediaResolver(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const owner = safeOwner(req.query?.oid);
  const id = safeId(req.query?.id);
  const rawHash = String(firstQueryValue(req.query?.hash) || '').trim();
  const hash = safeHash(rawHash);
  const quality = safeQuality(req.query?.quality);
  if (!owner || !id || (rawHash && !hash)) return res.status(400).end();

  const embeds = [
    `https://vk.com/video_ext.php?${qs({ oid: owner, id, hash, hd: quality >= 720 ? '2' : '1', autoplay: '0', js_api: '1' })}`,
    `https://vkvideo.ru/video_ext.php?${qs({ oid: owner, id, hash, hd: quality >= 720 ? '2' : '1', autoplay: '0', js_api: '1' })}`
  ];

  try {
    let mediaUrl = '';
    let sawNotFound = false;
    for (const embed of embeds) {
      let response = null;
      try {
        response = await fetchWithTimeout(embed, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            Accept: 'text/html,application/xhtml+xml',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            Referer: 'https://vk.com/',
            Origin: 'https://vk.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
          }
        });
      } catch (error) {
        continue;
      }
      if (!response || !response.ok) {
        if (response && response.status === 404) sawNotFound = true;
        continue;
      }
      const html = await response.text();
      mediaUrl = extractVkMediaUrl(html, quality);
      if (mediaUrl) break;
    }
    if (!mediaUrl) return res.status(sawNotFound ? 404 : 502).end();

    // O endpoint descobre a URL temporária do CDN do VK e redireciona a TV.
    // O arquivo longo não passa pela Function da Vercel.
    res.statusCode = 302;
    res.setHeader('Location', mediaUrl);
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.setHeader('Accept-Ranges', 'bytes');
    return res.end();
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(error && error.name === 'AbortError' ? 504 : 502).end();
  }
};

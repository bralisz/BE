'use strict';

// Cache apenas assets estáticos. HTML, APIs, autenticação e dados do catálogo
// continuam sempre fora do Service Worker para não prender versões antigas.
const BUILD_TOKEN = (() => {
  try {
    return String(new URL(self.location.href).searchParams.get('build') || 'quota-v1')
      .replace(/[^a-zA-Z0-9._:-]/g, '')
      .slice(0, 80) || 'quota-v1';
  } catch (_) {
    return 'quota-v1';
  }
})();
const STATIC_CACHE = `betv-static-${BUILD_TOKEN}`;
const MEDIA_CACHE = 'betv-media-v1';
const BETV_CACHE_PREFIXES = ['betv-static-', 'betv-media-'];

async function deleteOldStaticCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.map(key => {
    if (key.startsWith('betv-static-') && key !== STATIC_CACHE) return caches.delete(key);
    return Promise.resolve(false);
  }));
}

async function clearBetvCaches() {
  const keys = await caches.keys();
  await Promise.all(keys
    .filter(key => BETV_CACHE_PREFIXES.some(prefix => key.startsWith(prefix)))
    .map(key => caches.delete(key)));
}

async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= maxEntries) return;
    await Promise.all(keys.slice(0, keys.length - maxEntries).map(key => cache.delete(key)));
  } catch (_) {}
}

function cacheableResponse(response) {
  return Boolean(response && response.ok && response.type === 'basic');
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (cacheableResponse(response)) {
    cache.put(request, response.clone()).then(() => trimCache(cacheName, maxEntries)).catch(() => {});
  }
  return response;
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await deleteOldStaticCaches();
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (!request || request.method !== 'GET' || request.headers.has('range')) return;

  let url;
  try { url = new URL(request.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  if (path.startsWith('/_static/media/')) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE, 500));
    return;
  }
  if (path.startsWith('/_static/chunks/') || path.startsWith('/_static/styles/') || path.startsWith('/_static/locales/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 100));
  }
});

self.addEventListener('message', event => {
  const data = event.data;
  if (data === 'SKIP_WAITING' || (data && data.type === 'SKIP_WAITING')) self.skipWaiting();
  if (data && data.type === 'BETV_CLEAR_CACHES') {
    event.waitUntil(clearBetvCaches());
  }
});

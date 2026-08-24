                                                                             
const SW_VERSION = '20260823-account-mfa-v1';

async function clearBetvCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.map(key => caches.delete(key)));
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await clearBetvCaches();
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  const data = event.data;
  if (data === 'SKIP_WAITING' || (data && data.type === 'SKIP_WAITING')) self.skipWaiting();
  if (data && data.type === 'BETV_CLEAR_CACHES') {
    event.waitUntil(clearBetvCaches());
  }
});

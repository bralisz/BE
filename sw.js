/* Billie Eilish TV — service worker mínimo para instalação como app.
   O site continua sempre buscando os arquivos pela rede; nenhum conteúdo
   de vídeo, conta ou preferências é armazenado pelo service worker. */
const SW_VERSION = '20260821-netflix-webp-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

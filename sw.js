/* Billie Eilish TV — service worker mínimo para instalação como app.
   O site continua sempre buscando os arquivos pela rede; nenhum conteúdo
   de vídeo, conta ou preferências é armazenado pelo service worker. */
const SW_VERSION = '20260821-vk-fullscreen-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Mantém o comportamento normal da rede e ainda permite que o navegador
// reconheça o site como uma experiência instalável completa.
self.addEventListener('fetch', () => {});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

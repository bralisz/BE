'use strict';

// Mantém o cold start menor: cada request carrega somente o handler necessário.
const loaders = Object.freeze({
  default: () => require('../handlers/media'),
  'drive-media': () => require('../handlers/drive-media'),
  'vk-media': () => require('../handlers/vk-media')
});

module.exports = async function mediaRouter(req, res) {
  const raw = Array.isArray(req.query?.handler) ? req.query.handler[0] : req.query?.handler;
  const handler = String(raw || '').trim().toLowerCase();
  const load = loaders[handler] || loaders.default;
  return load()(req, res);
};

'use strict';

const handlers = Object.freeze({
  'deployment-release': require('../server/handlers/admin-deployment-release'),
  'public-cache': require('../server/handlers/admin-public-cache'),
  runtime: require('../server/handlers/admin-runtime'),
  user: require('../server/handlers/admin-user')
});

module.exports = async function adminRouter(req, res) {
  const raw = Array.isArray(req.query?.handler) ? req.query.handler[0] : req.query?.handler;
  const handler = handlers[String(raw || '').trim().toLowerCase()];
  if (!handler) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return res.status(404).json({ ok: false });
  }
  return handler(req, res);
};

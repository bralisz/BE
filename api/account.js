'use strict';

const handlers = Object.freeze({
  'delete-account': require('../server/handlers/delete-account'),
  'export-account': require('../server/handlers/export-account')
});

module.exports = async function accountRouter(req, res) {
  const raw = Array.isArray(req.query?.handler) ? req.query.handler[0] : req.query?.handler;
  const handler = handlers[String(raw || '').trim().toLowerCase()];
  if (!handler) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return res.status(404).json({ ok: false });
  }
  return handler(req, res);
};

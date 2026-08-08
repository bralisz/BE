'use strict';

// Consolidates small public/meta endpoints into a single Vercel Serverless Function.
// Public URLs remain unchanged through rewrites in vercel.json.
const handlers = Object.freeze({
  'deployment-version': require('../server/api-handlers/deployment-version'),
  robots: require('../server/api-handlers/robots'),
  sitemap: require('../server/api-handlers/sitemap'),
  'billie-wikipedia': require('../server/api-handlers/billie-wikipedia')
});

module.exports = async function metaRouter(req, res) {
  const route = String(req.query && req.query.handler || '').trim().toLowerCase();
  const handler = handlers[route];

  if (!handler) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(404).json({ error: 'Endpoint não encontrado.' });
  }

  return handler(req, res);
};

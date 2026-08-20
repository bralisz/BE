'use strict';

// All public API endpoints are routed through this one Vercel Serverless Function.
// Handlers live outside /api so Vercel does not count each one as a separate function.
const loaders = Object.freeze({
  account: () => require('../server/api-routes/account'),
  admin: () => require('../server/api-routes/admin'),
  media: () => require('../server/api-routes/media'),
  meta: () => require('../server/api-routes/meta'),
  'profile-share-image': () => require('../server/api-routes/profile-share-image'),
  'public-data': () => require('../server/api-routes/public-data'),
  'public-profile': () => require('../server/api-routes/public-profile'),
  'site-page': () => require('../server/api-routes/site-page'),
  'tv-page-state': () => require('../server/api-routes/tv-page-state'),
  'tv-page': () => require('../server/api-routes/tv-page'),
  'tv-qr': () => require('../server/api-routes/tv-qr'),
  'tv-subtitle': () => require('../server/api-routes/tv-subtitle'),
  tv: () => require('../server/api-routes/tv')
});

module.exports = async function apiRouter(req, res) {
  const raw = Array.isArray(req.query?.route) ? req.query.route[0] : req.query?.route;
  const route = String(raw || '').trim().toLowerCase();
  const load = loaders[route];

  if (!load) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return res.status(404).json({ error: 'endpoint_not_found' });
  }

  try {
    return await load()(req, res);
  } catch (error) {
    console.error(`API route failed (${route}):`, error);
    if (res.headersSent) return;
    return res.status(500).json({ error: 'internal_server_error' });
  }
};

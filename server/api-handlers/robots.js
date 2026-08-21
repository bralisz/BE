'use strict';

const SITE_ORIGIN = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://billieilishtv.site').replace(/\/$/, '');

module.exports = function robots(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    ''
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).send(body);
};

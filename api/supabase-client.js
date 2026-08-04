'use strict';

const SOURCES = [
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.0/dist/umd/supabase.min.js',
  'https://unpkg.com/@supabase/supabase-js@2.112.0/dist/umd/supabase.js'
];

module.exports = async function supabaseClientProxy(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  for (const url of SOURCES) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'BETV/1.0' } });
      if (!response.ok) continue;
      const body = await response.text();
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (req.method === 'HEAD') return res.status(200).end();
      return res.status(200).send(body);
    } catch (_) {
      // Tenta a próxima origem.
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(502).send("console.error('Não foi possível carregar a biblioteca de autenticação.');");
};

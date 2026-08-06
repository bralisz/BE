
'use strict';

const PAGE_TITLE = 'Billie_Eilish';
const WIKIPEDIA_ORIGIN = 'https://pt.wikipedia.org';
const USER_AGENT = 'BETV/1.1 (+https://billieilishtv.site; contato: billieilishtv@gmail.com)';

function safeJson(response) {
  return response.text().then(text => {
    if (!text) return null;
    try { return JSON.parse(text); } catch (_) { return null; }
  });
}

function apiUrl(parameters) {
  const url = new URL('/w/api.php', WIKIPEDIA_ORIGIN);
  Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
  return url;
}

function pageFromQuery(payload) {
  const pages = payload && payload.query && payload.query.pages;
  if (Array.isArray(pages)) return pages[0] || null;
  if (pages && typeof pages === 'object') return Object.values(pages)[0] || null;
  return null;
}

function cleanHtml(value) {
  return String(value || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|iframe|object|embed|form)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');
}

module.exports = async function billieWikipedia(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    const parseRequest = fetch(apiUrl({
      action: 'parse',
      page: PAGE_TITLE,
      prop: 'text|sections|displaytitle|revid',
      redirects: '1',
      format: 'json',
      formatversion: '2'
    }), { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });

    const infoRequest = fetch(apiUrl({
      action: 'query',
      titles: PAGE_TITLE,
      prop: 'pageimages|revisions|info',
      piprop: 'original',
      rvprop: 'ids|timestamp',
      inprop: 'url',
      redirects: '1',
      format: 'json',
      formatversion: '2'
    }), { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });

    const [parseResponse, infoResponse] = await Promise.all([parseRequest, infoRequest]);
    const [parsePayload, infoPayload] = await Promise.all([safeJson(parseResponse), safeJson(infoResponse)]);
    if (!parseResponse.ok || !parsePayload || !parsePayload.parse || !parsePayload.parse.text) {
      throw new Error('A Wikipédia não retornou o artigo solicitado.');
    }

    const article = parsePayload.parse;
    const page = pageFromQuery(infoPayload) || {};
    const revision = Array.isArray(page.revisions) ? page.revisions[0] || {} : {};
    const sourceUrl = page.fullurl || `${WIKIPEDIA_ORIGIN}/wiki/Billie_Eilish`;
    const payload = {
      title: String(article.title || 'Billie Eilish'),
      displayTitle: String(article.displaytitle || article.title || 'Billie Eilish'),
      html: cleanHtml(article.text),
      sections: Array.isArray(article.sections) ? article.sections.map(section => ({
        index: String(section.index || ''),
        level: Number(section.level || 2),
        line: String(section.line || ''),
        anchor: String(section.anchor || '')
      })) : [],
      imageUrl: String(page.original && page.original.source || ''),
      revisionId: Number(revision.revid || article.revid || 0) || null,
      revisionTimestamp: String(revision.timestamp || ''),
      sourceUrl,
      license: 'CC BY-SA 4.0',
      fetchedAt: new Date().toISOString()
    };

    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).json(payload);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: error && error.message ? error.message : 'Não foi possível consultar a Wikipédia.' });
  }
};

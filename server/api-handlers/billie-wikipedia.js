'use strict';

const PAGE_TITLE = 'Billie_Eilish';
const USER_AGENT = 'BETV/1.2 (+https://billieilishtv.site)';
const WIKIPEDIA_SITES = Object.freeze({
  'pt-br': Object.freeze({
    slug: 'pt-br',
    language: 'pt-BR',
    origin: 'https://pt.wikipedia.org',
    sourceLabel: 'Wikipédia em português'
  }),
  'en-us': Object.freeze({
    slug: 'en-us',
    language: 'en-US',
    origin: 'https://en.wikipedia.org',
    sourceLabel: 'English Wikipedia'
  }),
  es: Object.freeze({
    slug: 'es',
    language: 'es',
    origin: 'https://es.wikipedia.org',
    sourceLabel: 'Wikipedia en español'
  }),
  fr: Object.freeze({
    slug: 'fr',
    language: 'fr',
    origin: 'https://fr.wikipedia.org',
    sourceLabel: 'Wikipédia en français'
  }),
  it: Object.freeze({
    slug: 'it',
    language: 'it',
    origin: 'https://it.wikipedia.org',
    sourceLabel: 'Wikipedia in italiano'
  })
});

function safeJson(response) {
  return response.text().then(text => {
    if (!text) return null;
    try { return JSON.parse(text); } catch (_) { return null; }
  });
}

function requestedLocale(req) {
  let value = '';
  try {
    value = String(req.query && req.query.lang || new URL(req.url || '/', 'https://billieilishtv.site').searchParams.get('lang') || '');
  } catch (_) {}
  value = value.trim().toLowerCase().replace('_', '-');
  if (value === 'en' || value === 'en-us' || value === 'us') return WIKIPEDIA_SITES['en-us'];
  if (value === 'es' || value.startsWith('es-')) return WIKIPEDIA_SITES.es;
  if (value === 'fr' || value.startsWith('fr-')) return WIKIPEDIA_SITES.fr;
  if (value === 'it' || value.startsWith('it-')) return WIKIPEDIA_SITES.it;
  return WIKIPEDIA_SITES['pt-br'];
}

function apiUrl(origin, parameters) {
  const url = new URL('/w/api.php', origin);
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

function localizedError(locale) {
  if (locale.slug === 'en-us') return 'Wikipedia did not return the requested article.';
  if (locale.slug === 'es') return 'Wikipedia no devolvió el artículo solicitado.';
  if (locale.slug === 'fr') return 'Wikipédia n’a pas renvoyé l’article demandé.';
  if (locale.slug === 'it') return 'Wikipedia non ha restituito l’articolo richiesto.';
  return 'A Wikipédia não retornou o artigo solicitado.';
}

module.exports = async function billieWikipedia(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const locale = requestedLocale(req);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Language', locale.language);
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    const requestHeaders = {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
      'Accept-Language': locale.language
    };
    const parseRequest = fetch(apiUrl(locale.origin, {
      action: 'parse',
      page: PAGE_TITLE,
      prop: 'text|sections|displaytitle|revid',
      redirects: '1',
      format: 'json',
      formatversion: '2',
      uselang: locale.language.split('-')[0]
    }), { headers: requestHeaders });

    const infoRequest = fetch(apiUrl(locale.origin, {
      action: 'query',
      titles: PAGE_TITLE,
      prop: 'pageimages|revisions|info',
      piprop: 'original',
      rvprop: 'ids|timestamp',
      inprop: 'url',
      redirects: '1',
      format: 'json',
      formatversion: '2',
      uselang: locale.language.split('-')[0]
    }), { headers: requestHeaders });

    const [parseResponse, infoResponse] = await Promise.all([parseRequest, infoRequest]);
    const [parsePayload, infoPayload] = await Promise.all([safeJson(parseResponse), safeJson(infoResponse)]);
    if (!parseResponse.ok || !parsePayload || !parsePayload.parse || !parsePayload.parse.text) {
      throw new Error(localizedError(locale));
    }

    const article = parsePayload.parse;
    const page = pageFromQuery(infoPayload) || {};
    const revision = Array.isArray(page.revisions) ? page.revisions[0] || {} : {};
    const sourceUrl = page.fullurl || `${locale.origin}/wiki/Billie_Eilish`;
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
      sourceLabel: locale.sourceLabel,
      wikipediaOrigin: locale.origin,
      locale: locale.slug,
      language: locale.language,
      license: 'CC BY-SA 4.0',
      fetchedAt: new Date().toISOString()
    };

    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).json(payload);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: error && error.message ? error.message : localizedError(locale) });
  }
};

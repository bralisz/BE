'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = require('../vercel.json');
const handlerPath = require.resolve('../server/api-routes/site-page');
const originalFetch = global.fetch;
const originalEnv = process.env.VERCEL_ENV;
const title = 'Birds <of> a Feather </script><script>alert(1)</script>';
const collections = {
  videos: [
    { id: 'video-one', updated_at: '2026-10-20T12:00:00Z', data: { publicId: '12345678', title, description: 'A live performance & interview.', translations: { es: { description: 'Una actuación en directo.' } } } },
    { id: 'interview', data: { publicId: '87654321', title: 'Entrevista com Billie Eilish', description: '**Conversa** sobre [música](https://example.test).', thumbnailUrl: 'https://example.test/interview.webp', translations: {
      en: { title: 'Billie Eilish interview', description: 'Interview in English.' },
      es: { title: 'Entrevista con Billie Eilish', description: 'Entrevista en español.' },
      fr: { title: 'Entretien avec Billie Eilish', description: 'Entretien en français.' },
      it: { title: 'Intervista con Billie Eilish', description: 'Intervista in italiano.' }
    } } },
    { id: 'song', data: { publicId: '23456789', title: 'WILDFLOWER', sectionName: 'Music videos', translations: { es: { title: 'Título que não deve substituir o nome da música', description: 'Una actuación musical.' } } } },
    { id: 'literal-title', data: { publicId: '34567890', title: "Título $& $' $$", description: 'Descrição do vídeo correto.' } },
    { id: 'private', data: { title: 'Unpublished video', active: false } }
  ],
  movies: [{ id: 'film', data: { publicId: '45678901', title: 'Filme cadastrado', description: 'Sinopse do filme correspondente.' } }],
  news: [{ id: 'album-one', data: { title: 'HIT ME HARD AND SOFT' } }]
};
const requestedCollections = [];
global.fetch = async (url, options = {}) => {
  assert(options.signal, 'SEO data requests must have a deadline');
  if (String(url).includes('site_settings')) return { ok: true, json: async () => [] };
  const collection = JSON.parse(options.body).p_collection;
  requestedCollections.push(collection);
  return { ok: true, json: async () => collections[collection] || [] };
};

async function render(path, method = 'GET', extraHeaders = {}, query = {}) {
  const response = {
    headers: {}, code: null, body: '',
    setHeader(key, value) { this.headers[key.toLowerCase()] = value; },
    status(code) { this.code = code; return this; },
    send(body) { this.body = body; return this; },
    end() { return this; }
  };
  await require(handlerPath)({ method, url: path, headers: { host: 'billieilishtv.site', ...extraHeaders }, query }, response);
  return response;
}
function documentOf(response) {
  assert.equal(response.code, 200);
  return new JSDOM(response.body).window.document;
}

(async () => {
  delete process.env.VERCEL_ENV;
  for (const locale of ['pt-br', 'en-us', 'es', 'fr', 'it']) {
    const result = await render(`/${locale}`);
    const doc = documentOf(result);
    assert.equal(doc.querySelector('link[rel="canonical"]').href, `https://billieilishtv.site/${locale}`);
    assert.equal(doc.querySelectorAll('link[hreflang]').length, 6);
    assert.match(doc.title, /Billie Eilish TV \|/);
    assert.equal(doc.querySelector('#catalogOverview'), null, 'SEO must not add a duplicate catalog to the visible layout');
    assert(!result.body.includes('sinopse placeholder'));
    assert(!result.body.includes('Destaque 01'));
    // Inserting HTML must never corrupt the inline boot/recovery scripts.
    for (const script of doc.querySelectorAll('script:not([src]):not([type="application/ld+json"])')) {
      new Function(script.textContent);
    }
    for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(script.textContent);
  }

  const video = await render('/es/12345678');
  const videoDoc = documentOf(video);
  assert.equal(videoDoc.title, `${title} | Billie Eilish TV`);
  assert.equal(videoDoc.querySelector('meta[name="description"]').content, 'Una actuación en directo.');
  assert.equal(videoDoc.querySelector('#catalogOverview'), null);
  const graph = JSON.parse(videoDoc.querySelector('[data-betv-seo]').textContent)['@graph'];
  assert.equal(graph.find(item => item['@type'] === 'ItemPage').mainEntity.name, title);
  assert.equal(graph.find(item => item['@type'] === 'BreadcrumbList').itemListElement[1].item, 'https://billieilishtv.site/es/12345678');
  assert.equal(videoDoc.querySelectorAll('script').length, documentOf(await render('/es')).querySelectorAll('script').length, 'record text cannot inject scripts');

  const expected = {
    'pt-br': ['Entrevista com Billie Eilish', 'Conversa sobre música.'],
    'en-us': ['Billie Eilish interview', 'Interview in English.'],
    es: ['Entrevista con Billie Eilish', 'Entrevista en español.'],
    fr: ['Entretien avec Billie Eilish', 'Entretien en français.'],
    it: ['Intervista con Billie Eilish', 'Intervista in italiano.']
  };
  for (const [slug, [name, description]] of Object.entries(expected)) {
    const path = `/${slug}/87654321`;
    const doc = documentOf(await render(path));
    assert.equal(doc.title, `${name} | Billie Eilish TV`);
    assert.equal(doc.querySelector('meta[name="description"]').content, description);
    assert.equal(doc.querySelector('meta[property="og:image"]').content, 'https://example.test/interview.webp');
    assert.equal(doc.querySelector('meta[property="og:image:width"]'), null, 'do not claim dimensions of an unrelated banner');
    assert.equal(doc.querySelector('meta[property="og:title"]').content, doc.title);
    assert.equal(doc.querySelector('meta[name="twitter:title"]').content, doc.title);
    assert.equal(doc.querySelector('title').getAttribute('translate'), 'no');
    const response = await render('/api/site-page', 'GET', {}, { format: 'seo', path });
    assert.equal(response.code, 200);
    assert.match(response.headers['content-type'], /application\/json/);
    const metadata = JSON.parse(response.body);
    assert.equal(metadata.title, doc.title, 'SPA and direct visits use the same content/locale');
    assert.equal(metadata.meta.find(item => item.key === 'description').content, description);
    assert.equal(metadata.links.find(item => item.rel === 'canonical').href, `https://billieilishtv.site${path}`);
    assert.equal(metadata.links.filter(item => item.rel === 'alternate').length, 6);
    assert.equal(metadata.structuredData['@graph'].find(item => item['@type'] === 'ItemPage').mainEntity.name, name);
  }
  assert.equal(documentOf(await render('/es/23456789')).title, 'WILDFLOWER | Billie Eilish TV', 'original music names stay intact');
  assert.equal(documentOf(await render('/pt-br/34567890')).title, "Título $& $' $$ | Billie Eilish TV", 'replacement tokens must remain literal title text');
  assert(requestedCollections.every(name => name === 'videos'), 'video metadata does not wait for unrelated collections');
  const missing = await render('/es/99999999');
  assert.equal(missing.code, 404);
  assert.match(missing.headers['cache-control'], /no-store/);
  assert(!missing.body.includes('<title>Billie Eilish TV</title>'));
  assert.equal(documentOf(await render('/pt-br/45678901')).title, 'Filme cadastrado | Billie Eilish TV', 'movie URLs still resolve the corresponding collection');
  assert.equal((await render('/api/site-page', 'GET', {}, { format: 'seo', path: '//example.test' })).code, 400);

  const albums = documentOf(await render('/en-us/albums'));
  assert.equal(albums.querySelector('link[rel="canonical"]').href, 'https://billieilishtv.site/en-us/albuns');
  assert.equal(albums.querySelector('#catalogOverview'), null);
  assert.equal(documentOf(await render('/billie')).querySelector('link[rel="canonical"]').href, 'https://billieilishtv.site/pt-br/billie-eilish');
  assert.equal(documentOf(await render('/fr/community')).querySelector('link[rel="canonical"]').href, 'https://billieilishtv.site/fr/communaute');
  const rewritten = documentOf(await render('/api?route=site-page', 'GET', { 'x-vercel-original-path': '/it/albuns/album-one' }));
  assert.equal(rewritten.title, 'HIT ME HARD AND SOFT | Billie Eilish TV');

  for (const path of ['/login', '/pt-br/config', '/en-us/admin', '/perfil', '/notificacoes', '/es/unknown']) {
    const result = await render(path);
    assert.match(result.headers['x-robots-tag'], /noindex/);
    assert.match(documentOf(result).querySelector('meta[name="robots"]').content, /noindex/);
    assert(!result.body.includes('id="catalogOverview"'));
  }
  process.env.VERCEL_ENV = 'preview';
  assert.match((await render('/')).headers['x-robots-tag'], /noindex/);
  delete process.env.VERCEL_ENV;
  const head = await render('/es/12345678', 'HEAD');
  assert.equal(head.code, 200); assert.equal(head.body, '');
  assert.equal((await render('/', 'POST')).code, 405);

  for (const path of ['/', '/pt-br', '/en-us', '/es', '/fr', '/it', '/billie-eilish', '/albuns', '/suporte', '/terms']) {
    assert.equal(config.rewrites.find(route => route.source === path).destination, '/api?route=site-page', `${path} must receive server SEO`);
  }
  assert.equal(config.rewrites.find(route => route.source === '/admin').destination, '/index.html');
  assert.equal(config.rewrites.find(route => route.source === '/robots.txt').destination, '/api?route=meta&handler=robots');
  assert.equal(config.rewrites.find(route => route.source === '/sitemap.xml').destination, '/api?route=meta&handler=sitemap');

  const dom = new JSDOM(video.body, { url: 'https://billieilishtv.site/es/12345678', runScripts: 'outside-only' });
  dom.window.eval(fs.readFileSync('assets/js/locale-routing.js', 'utf8'));
  assert.equal(dom.window.BETVPageTitle(), `${title} | Billie Eilish TV`);
  dom.window.history.pushState({}, '', '/albuns');
  assert.equal(dom.window.BETVPageTitle(), 'Billie Eilish TV');

  dom.window.close();

  // A data outage must still deliver the regular page and SEO metadata.
  delete require.cache[handlerPath];
  global.fetch = async () => { throw new Error('upstream unavailable'); };
  const fallback = documentOf(await render('/pt-br'));
  assert.equal(fallback.querySelector('#catalogOverview'), null);
  assert(fallback.querySelector('meta[name="description"]').content);
  assert.match(fallback.title, /Billie Eilish TV/);
  const unavailable = await render('/fr/87654321');
  assert.equal(unavailable.code, 503, 'temporary catalog outages must not serve unrelated home SEO as a success');
  console.log('SEO checks passed: localized HTML, unchanged public layout, escaping, canonicals, robots, routing, titles and upstream fallback.');
})().finally(() => {
  global.fetch = originalFetch;
  if (originalEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalEnv;
}).catch(error => { console.error(error); process.exitCode = 1; });

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
    { id: 'private', data: { title: 'Unpublished video', active: false } }
  ],
  news: [{ id: 'album-one', data: { title: 'HIT ME HARD AND SOFT' } }]
};
global.fetch = async (url, options = {}) => {
  assert(options.signal, 'SEO data requests must have a deadline');
  if (String(url).includes('site_settings')) return { ok: true, json: async () => [] };
  const collection = JSON.parse(options.body).p_collection;
  return { ok: true, json: async () => collections[collection] || [] };
};

async function render(path, method = 'GET', extraHeaders = {}) {
  const response = {
    headers: {}, code: null, body: '',
    setHeader(key, value) { this.headers[key.toLowerCase()] = value; },
    status(code) { this.code = code; return this; },
    send(body) { this.body = body; return this; },
    end() { return this; }
  };
  await require(handlerPath)({ method, url: path, headers: { host: 'billieilishtv.site', ...extraHeaders }, query: {} }, response);
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
    assert(doc.querySelector('main #catalogOverview h1'));
    assert(doc.querySelector(`#catalogOverview a[href="/${locale}/12345678"]`));
    assert(doc.querySelector(`#catalogOverview a[href="/${locale}/albuns/album-one"]`));
    assert(!doc.querySelector('#catalogOverview').textContent.includes('Unpublished video'));
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
  assert.equal(videoDoc.querySelector('#catalogOverview h1').textContent, `${title} | Billie Eilish TV`);
  const graph = JSON.parse(videoDoc.querySelector('[data-betv-seo]').textContent)['@graph'];
  assert.equal(graph.find(item => item['@type'] === 'ItemPage').mainEntity.name, title);
  assert.equal(graph.find(item => item['@type'] === 'BreadcrumbList').itemListElement[1].item, 'https://billieilishtv.site/es/12345678');
  assert.equal(videoDoc.querySelectorAll('script').length, documentOf(await render('/es')).querySelectorAll('script').length, 'record text cannot inject scripts');

  const albums = documentOf(await render('/en-us/albums'));
  assert.equal(albums.querySelector('link[rel="canonical"]').href, 'https://billieilishtv.site/en-us/albuns');
  assert(!albums.querySelector('#catalogOverview a[href="/en-us/12345678"]'));
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
  assert.equal(dom.window.document.getElementById('catalogOverview').hidden, true);
  dom.window.close();

  // A data outage must still deliver a useful page and static discovery links.
  delete require.cache[handlerPath];
  global.fetch = async () => { throw new Error('upstream unavailable'); };
  const fallback = documentOf(await render('/pt-br'));
  assert(fallback.querySelector('#catalogOverview a[href="/pt-br/albuns"]'));
  assert.match(fallback.title, /Billie Eilish TV/);
  console.log('SEO checks passed: localized HTML, crawlable catalog, escaping, canonicals, robots, routing, titles and upstream fallback.');
})().finally(() => {
  global.fetch = originalFetch;
  if (originalEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalEnv;
}).catch(error => { console.error(error); process.exitCode = 1; });

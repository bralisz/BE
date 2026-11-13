'use strict';
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const handler = require('../server/api-handlers/sitemap');
const originalFetch = global.fetch;
let failing = false;
let malformed = false;
let useLegacy = false;
const rows = {
  videos: [
    { id: 'one', updated_at: '2026-10-20T12:00:00Z', data: { publicId: '12345678', title: 'Video & title', thumbnailUrl: 'https://example.test/a.jpg?a=1&b=2' } },
    { id: 'hidden', data: { publicId: '11111111', active: false } },
    { id: 'bad-image', data: { publicId: '22222222', thumbnailUrl: 'javascript:alert(1)' } }
  ],
  movies: [{ id: 'duplicate', data: { publicId: '12345678', title: 'Duplicate' } }],
  news: [{ id: 'album & one', data: { title: 'Album', imageUrl: '/cover.jpg' } }]
};
global.fetch = async (url, options) => {
  assert(options.signal instanceof AbortSignal, 'Catalog queries must be bounded');
  const rpc = String(url).includes('/rpc/');
  const collection = rpc ? JSON.parse(options.body).p_collection : new URL(url).searchParams.get('collection').slice(3);
  if (failing && collection === 'movies') throw new Error('unavailable');
  if (useLegacy && rpc) return { ok: false };
  return { ok: true, json: async () => malformed ? { error: 'not a catalog' } : rows[collection] || [] };
};
async function request(method = 'GET') {
  const response = {
    headers: {}, body: '', code: 0,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    status(code) { this.code = code; return this; },
    send(body) { this.body = body; return this; },
    end() { return this; }
  };
  await handler({ method }, response);
  return response;
}
(async () => {
  const result = await request();
  assert.equal(result.code, 200);
  const doc = new JSDOM(result.body, { contentType: 'application/xml' }).window.document;
  const entries = [...doc.getElementsByTagName('url')];
  const videoEntries = entries.filter(el => el.querySelector('loc').textContent.endsWith('/12345678'));
  assert.equal(videoEntries.length, 5, 'One canonical URL per supported language, no duplicate IDs');
  for (const entry of videoEntries) {
    assert.equal(entry.getElementsByTagNameNS('http://www.google.com/schemas/sitemap-image/1.1', 'loc')[0].textContent, 'https://example.test/a.jpg?a=1&b=2');
    assert.equal(entry.querySelector('lastmod').textContent, '2026-10-20T12:00:00.000Z');
    assert.equal(entry.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'link').length, 6);
  }
  assert(!result.body.includes('11111111'));
  assert(!result.body.includes('javascript:'));
  assert(result.body.includes('https://billieilishtv.site/cover.jpg'));
  assert(result.body.includes('/albuns/album%20%26%20one'));
  assert.equal((await request('HEAD')).body, '');
  assert.equal((await request('POST')).code, 405);
  useLegacy = true;
  assert.equal((await request()).body, result.body, 'Legacy response produces the same sitemap');
  useLegacy = false;
  failing = true;
  const partial = await request();
  assert.equal(partial.code, 503, 'A failed collection must not silently remove URLs from a successful sitemap');
  assert.equal(partial.headers['cache-control'], 'no-store');
  assert.equal(partial.headers['retry-after'], '300');
  assert(!partial.body.includes('12345678'));
  const failedHead = await request('HEAD');
  assert.equal(failedHead.code, 503);
  assert.equal(failedHead.body, '');
  failing = false;
  malformed = true;
  assert.equal((await request()).code, 503, 'Malformed catalog is not an empty catalog');
  malformed = false;
  assert.equal((await request()).code, 200, 'Recovery restores the complete sitemap');
  console.log('Sitemap checks passed: images, XML escaping, locales, deduplication, inactive content, deadlines, fallback and outage recovery.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { global.fetch = originalFetch; });

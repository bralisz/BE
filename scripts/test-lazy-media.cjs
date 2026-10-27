'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const source = fs.readFileSync('assets/js/lazy-loading.js', 'utf8');
const published = fs.readFileSync('_static/chunks/lazy.js', 'utf8');
const css = fs.readFileSync('assets/css/site.css', 'utf8');
const asset = fs.readFileSync('assets/images/loading/media-placeholder.svg', 'utf8');

assert.equal(source, published, 'published loader must match source');
assert.match(html, /chunks\/lazy\.js\?rev=/, 'main route must load lazy script');
assert.doesNotMatch(html, /rel="preload" href="\/assets\/images\/community\/boaf-stream-4bi\.webp"/);
assert.match(css, /Unified BETV media loading visual/);
assert.match(asset, /<svg[\s>]/);

const dom = new JSDOM('<!doctype html><html><body><div class="f-slide active"><div class="f-media"><img src="/featured.webp"></div></div><div class="video-card"><img src="/poster.webp"></div></body></html>', {
  url: 'https://betv.example/', runScripts: 'outside-only', pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;
const observed = new Set();
let ioCallback;
window.IntersectionObserver = class {
  constructor(callback) { ioCallback = callback; }
  observe(node) { observed.add(node); }
  unobserve(node) { observed.delete(node); }
};
window.requestAnimationFrame = callback => { callback(); return 1; };
window.eval(source);
document.dispatchEvent(new window.Event('DOMContentLoaded'));

const hero = document.querySelector('.f-media img');
const poster = document.querySelector('.video-card img');
assert.equal(hero.loading, 'eager', 'visible featured image should load eagerly');
assert.equal(hero.getAttribute('fetchpriority'), 'high');
assert.equal(poster.loading, 'lazy', 'catalog poster should load lazily');
assert.equal(poster.getAttribute('fetchpriority'), 'low');
assert(poster.classList.contains('betv-image-pending'));

(async () => {
  const dynamic = document.createElement('img');
  dynamic.src = '/new-poster.webp';
  document.body.appendChild(dynamic);
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(dynamic.loading, 'lazy');
  assert(dynamic.classList.contains('betv-image-pending'));

  const deferred = document.createElement('img');
  deferred.setAttribute('data-src', '/later.webp');
  document.body.appendChild(deferred);
  await new Promise(resolve => setTimeout(resolve, 5));
  assert(observed.has(deferred));
  assert.equal(deferred.hasAttribute('src'), false);
  ioCallback([{ isIntersecting: true, target: deferred }]);
  assert.equal(deferred.getAttribute('src'), '/later.webp');
  assert.equal(observed.has(deferred), false);
  window.close();
  console.log('PASS BETV lazy loading: hero priority, deferred posters, new media, shared SVG');
})().catch(error => { console.error(error); process.exitCode = 1; window.close(); });

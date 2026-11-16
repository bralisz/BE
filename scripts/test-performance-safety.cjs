'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const read = path => fs.readFileSync(path, 'utf8');
const html = read('index.html');
const css = read('assets/css/site.css');
const worker = read('sw.js');

for (const [source, served] of [
  ['assets/js/site.js', '_static/chunks/site.js'],
  ['assets/js/watch-party.js', '_static/chunks/watch-party.js'],
  ['assets/js/watch-party-gift.js', '_static/chunks/watch-party-gift.js'],
  ['assets/js/mobile-bottom-nav.js', '_static/chunks/mobile-bottom-nav.js'],
]) {
  assert.equal(read(source), read(served), source + ' must match the deployed static chunk');
  new vm.Script(read(served), {filename: served});
}

new vm.Script(worker, {filename: 'sw.js'});
assert.match(html, /media="print" onload="this\.media='all'"/, 'secondary CSS must be nonblocking');
assert.match(html, /<noscript><link rel="stylesheet" href="\/_static\/styles\/watch-party\.css/, 'keep stylesheet fallback');
assert.doesNotMatch(html, /c\[name\]\s*=\s*noop/, 'do not mask all console errors');
assert.match(html, /existing\.update\(\)/, 'installed app must check for updates');
assert.match(worker, /event\.waitUntil\(persist\)/, 'cache writes must survive service-worker request lifetime');
assert.match(worker, /inFlightRequests\.has\(key\)/, 'duplicate asset downloads must share a request');
assert.match(worker, /writesSinceTrim/, 'limit expensive CacheStorage scans');
assert.match(read('assets/js/watch-party.js'), /if\(document\.hidden\)return;/, 'pause Watch Party while hidden');
assert.match(read('assets/js/watch-party-gift.js'), /},6000\);/, 'reduce idle gift polling');
assert.match(read('scripts/build-static.mjs'), /mobile-bottom-nav\.js/, 'optimized builds must preserve app navigation');
assert.match(css, /body\.profile-page-active\.profile-color-customized > footer/, 'keep profile color customization');

console.log('BETV performance and build regression checks passed.');

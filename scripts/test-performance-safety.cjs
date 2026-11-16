'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const read = path => fs.readFileSync(path, 'utf8');
const html = read('index.html');
const css = read('assets/css/site.css');
const worker = read('sw.js');

const config = JSON.parse(read('vercel.json'));
const runtime = config.rewrites.find(item => item.source === '/api/runtime');
assert.equal(runtime.destination, 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.0/dist/umd/supabase.js', 'SDK URL must target the actual UMD artifact');
assert.match(html, /<script defer src="\/api\/runtime\?v=2\.112\.0-validated-restore-v18"/, 'restore deterministic SDK-before-app order');
assert.match(html, /site\.js\?rev=20261116-early-data-v19/, 'invalidate previous startup chunks');
assert.doesNotMatch(html, /__BETVSupabaseReady/, 'remove speculative dynamic auth boot that followed the app update');
const site = read('assets/js/site.js');
assert.match(site, /window\.supabase &&\s*typeof window\.supabase\.createClient === 'function'/, 'restore original startup mode detection');
assert.match(site, /function releaseSiteSkeleton\(/, 'restore original skeleton release function');
assert.match(site, /setStatus\('A conexão está demorando\./, 'retain login fallback when authentication stalls');
assert.match(html, /__betv_update/, 'browser retry must request fresh HTML');
const htmlHandler = read('server/api-routes/site-page.js');
assert.match(htmlHandler, /res\.setHeader\('Cache-Control', 'private, no-store, max-age=0, must-revalidate'\)/, 'HTML must not pin a stale loader');


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

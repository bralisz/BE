'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const read = path => fs.readFileSync(path, 'utf8');
const html = read('index.html');
const css = read('assets/css/site.css');
const worker = read('sw.js');

const siteBundle = read('assets/js/site.js');
const runtimeScript = html.match(/<script>[\s\S]*?__BETVSupabaseReady[\s\S]*?<\/script>/);
assert.ok(runtimeScript, 'SDK loader must be independent from deferred scripts');
assert.match(runtimeScript[0], /unpkg\.com/, 'SDK loader must have a second host');
assert.match(runtimeScript[0], /6500/, 'SDK loader must have a finite timeout');
assert.doesNotMatch(html, /<script defer src="\/api\/runtime/, 'blocking deferred SDK dependency must be removed');
assert.match(html, /site\.js\?rev=20261116-browser-startup-v17/, 'old browser scripts must be cache-busted');
assert.match(siteBundle, /await window\.__BETVSupabaseReady/, 'backend must await SDK before creating client');
assert.match(siteBundle, /Promise\.race\(\[\s*initialization/, 'initial auth must not permanently block the UI');
assert.match(siteBundle, /7500/, 'initial auth has a finite soft deadline');

assert.match(siteBundle, /if\(document\.readyState==='loading'\)document\.addEventListener\('DOMContentLoaded',startPublicInterface/, 'only use DOMContentLoaded while markup is still parsing');
assert.match(siteBundle, /else startPublicInterface\(\);/, 'start immediately when deferred main script executes');
assert.match(html, /__betv_update/, 'recovery forces fresh HTML from server');
const sitePage = read('server/api-routes/site-page.js');
assert.match(sitePage, /res\.setHeader\('Vercel-CDN-Cache-Control', 'no-store'\)/, 'dynamic HTML must not be stale');
assert.match(sitePage, /private, no-store, max-age=0, must-revalidate/, 'HTML response must be fresh');


const vercelConfig = JSON.parse(read('vercel.json'));
const runtime = vercelConfig.rewrites.find(rule => rule.source === '/api/runtime');
assert.ok(runtime, 'the Supabase browser SDK must have a route');
assert.equal(
  runtime.destination,
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.0/dist/umd/supabase.js',
  'load the real UMD artifact, not nonexistent supabase.min.js'
);
const runtimeCache = vercelConfig.headers.find(rule => rule.source === '/api/runtime');
assert.ok(runtimeCache, 'Supabase runtime must have a caching policy');
assert.doesNotMatch(JSON.stringify(runtimeCache), /max-age=31536000|immutable/, 'avoid pinning a broken SDK URL for one year');
assert.match(html, /\/api\/runtime\?v=2\.112\.0-umd-fix1/, 'bust cached responses for the fixed SDK URL');
assert.match(html, /betvBootRecovery/, 'show a usable retry screen if a deferred dependency stalls');


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

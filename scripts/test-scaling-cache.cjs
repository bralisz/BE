'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('server/api-routes/public-data.js', 'utf8');
const begin = source.indexOf('const upstreamResponseCache = new Map();');
const end = source.indexOf('function config() {', begin);
assert(begin >= 0 && end > begin, 'Public cache implementation must be available');
const context = vm.createContext({ Date, Promise, URL, Map, String, Number, Math });
vm.runInContext(source.slice(begin, end) + '\nthis.testCache = { cachedUpstream, upstreamResponseCache };', context);
const { cachedUpstream, upstreamResponseCache } = context.testCache;

(async () => {
  let calls = 0;
  const shared = await Promise.all(Array.from({ length: 50 }, () =>
    cachedUpstream('home:pt', 3000, async () => { calls += 1; return { ok: true }; })
  ));
  assert.equal(calls, 1, 'Concurrent Home queries should share one upstream request');
  assert(shared.every(item => item.ok), 'Shared callers all receive a payload');

  let release;
  const gate = new Promise(resolve => { release = resolve; });
  calls = 0;
  const inFlight = Array.from({ length: 20 }, () =>
    cachedUpstream('news:pt', 0, () => { calls += 1; return gate; })
  );
  await Promise.resolve();
  assert.equal(calls, 1, 'Zero-TTL live requests must also coalesce');
  release('fresh');
  assert((await Promise.all(inFlight)).every(value => value === 'fresh'));
  await cachedUpstream('news:pt', 0, () => { calls += 1; return 'again'; });
  assert.equal(calls, 2, 'Zero-TTL results must not become stale cache entries');

  let failures = 0;
  await assert.rejects(cachedUpstream('failed', 3000, () => {
    failures += 1;
    throw new Error('temporary_upstream_failure');
  }));
  assert.equal(await cachedUpstream('failed', 3000, () => {
    failures += 1;
    return 'recovered';
  }), 'recovered', 'Errors must not poison the cache');
  assert.equal(failures, 2);

  for (let i = 0; i < 350; i += 1) {
    await cachedUpstream('arbitrary-revision:' + i, 60000, () => i);
  }
  assert(upstreamResponseCache.size <= 128, 'Revisioned URLs must not grow unbounded memory');

  const media = fs.readFileSync('server/handlers/media.js', 'utf8');
  assert.match(media, /if \(token\) \{[\s\S]*?max-age=86400/, 'URL-token images should be edge cacheable');
  assert.match(media, /max-age=120, s-maxage=600/, 'Editable record-based images must refresh quickly');
  assert.doesNotMatch(media.slice(media.indexOf("res.setHeader('Content-Type', outputType)")), /max-age=31536000/, 'Editable images must not be immutable for a year');

  const community = fs.readFileSync('assets/js/community.js', 'utf8');
  assert.match(community, /get_similar_fans_page.*p_limit:8/, 'Fan discovery must use small paged RPC calls');
  assert.match(community, /state\.similarLoadingMore/, 'Repeated pagination requests should be guarded');

  console.log('BETV scaling cache and pagination regression checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });

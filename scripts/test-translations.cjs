'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/site.js', 'utf8');
let now = 0, requests = 0, applied = 0, delay = 0, fail = true;
const context = {
  Set, Map, Math, Number, String, Error, Promise,
  Date: { now: () => now },
  window: {}, document: { documentElement: {} },
  slug: 'es', translationBusy: false, retryAfter: 0, translateTimer: 0,
  missingTexts: new Set(['Mensagem de teste']), translatedThisSession: new Set(),
  translationAttempts: new Map(), map: Object.create(null),
  isAdmin: () => false, publishableKey: () => '', translationEndpoint: () => '/translate',
  normalize: value => String(value).trim(), eligibleText: () => true,
  normalizeImportedTranslation: (_source, value) => value,
  clearTimeout() {}, setTimeout: (_callback, ms) => { delay = ms; return 1; },
  saveDynamicCache() {}, apply: () => applied++,
  fetch: async () => { requests++; return { ok: !fail, headers: { get: () => '30' }, json: async () => fail ? {error:'temporary'} : {translations:['Mensaje de prueba']} }; }
};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('  function takeBatch(){'), source.indexOf('  async function translateTexts(')), context);
vm.runInContext(source.slice(source.indexOf('  function scheduleMissingTranslation('), source.indexOf('  function italianHomeRoute(')), context);
vm.runInContext(source.slice(source.indexOf('  function rememberMissing('), source.indexOf('  function translateTextNode(')), context);
(async () => {
  await context.translateMissingNow();
  assert.equal(requests, 1);
  assert(context.missingTexts.has('Mensagem de teste'), 'a transient failure requeues its source');
  assert(!context.translatedThisSession.has('Mensagem de teste'), 'failure is never cached as success');
  assert(delay >= 30000, 'the provider retry interval is respected');
  await context.translateMissingNow(); assert.equal(requests, 1, 'cooldown prevents repeated requests');
  now = 30001; fail = false; await context.translateMissingNow();
  assert.equal(context.map['Mensagem de teste'], 'Mensaje de prueba');
  assert.equal(applied, 1, 'the recovered translation is applied');
  fail = true; context.missingTexts.add('Outra mensagem');
  for (let i = 0; i < 3; i++) { now += 30001; await context.translateMissingNow(); }
  context.rememberMissing('Outra mensagem');
  assert(!context.missingTexts.has('Outra mensagem'), 'three failures stop the retry loop');
  console.log('PASS UI: transient recovery, Retry-After, successful cache and bounded attempts');
  const api = require('../server/api-routes/public-data.js');
  const longDescription = 'Uma descrição longa. '.repeat(300);
  global.fetch = async url => ({ ok: !url.endsWith('get_public_content_items_v2'), json: async () => [{ id:'notification', collection:'notifications', data:{ title:'Título original', description:'Original', translations:{fr:{title:'Titre traduit',description:longDescription}} } }] });
  const response = { code:0, body:'', setHeader() {}, status(code) { this.code=code; return this; }, send(body) { this.body=body; }, end() {} };
  await api({method:'GET',query:{name:'notifications',locale:'fr'}}, response);
  assert.equal(response.code,200);
  const payload=JSON.parse(response.body);
  assert.equal(payload[0].title,'Titre traduit','fallback RPC still returns the requested locale');
  assert.equal(payload[0].description,longDescription,'long notifications are not cut at 4000 characters');
  console.log('PASS API: localized legacy fallback and complete notification descriptions');
})().catch(error => { console.error(error); process.exitCode=1; });

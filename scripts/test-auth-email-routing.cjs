'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const dns = require('node:dns').promises;
const originalFetch = global.fetch;
const originalResolveMx = dns.resolveMx;
const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const originalBuckets = globalThis.__betvEmailLookupBuckets;
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
dns.resolveMx = async () => [{ exchange: 'mx.example.com', priority: 10 }];

function response(value, ok = true) {
  return { ok, text: async () => JSON.stringify(value) };
}
function request(email, headers = {}) {
  return {
    method: 'POST',
    query: { action: 'status' },
    headers: { host: 'billieilishtv.site', origin: 'https://billieilishtv.site', ...headers },
    body: { email },
    socket: { remoteAddress: '127.0.0.1' }
  };
}
function result() {
  return {
    statusCode: 200, headers: {}, payload: undefined,
    setHeader(key, value) { this.headers[key.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.payload = body; return this; }
  };
}

(async () => {
  const handler = require('../server/handlers/delete-account');
  const rpcCalls = [];
  let rpcResult = true;
  let rpcOk = true;
  let profilesResult = [];
  global.fetch = async (url, options) => {
    if (String(url).includes('/rpc/account_exists')) {
      rpcCalls.push(JSON.parse(options.body).p_email);
      return response(rpcResult, rpcOk);
    }
    if (String(url).includes('/rest/v1/profiles')) return response(profilesResult);
    throw new Error('Unexpected request: ' + url);
  };

  const existing = result();
  await handler(request('EXISTING@example.com'), existing);
  assert.equal(existing.statusCode, 200);
  assert.equal(existing.payload.exists, true);
  assert.equal(existing.payload.checkAvailable, true);
  assert.equal(rpcCalls[0], 'existing@example.com');

  rpcResult = false;
  const newAccount = result();
  await handler(request('new@example.com'), newAccount);
  assert.equal(newAccount.payload.exists, false);
  assert.equal(newAccount.payload.checkAvailable, true);

  // Profiles can lag behind auth.users. Never classify an unknown as a new account.
  rpcOk = false;
  profilesResult = [];
  const unknown = result();
  await handler(request('unconfirmed@example.com'), unknown);
  assert.equal(unknown.payload.exists, null);
  assert.equal(unknown.payload.checkAvailable, false);

  profilesResult = [{ id: 'known-id' }];
  const profileFound = result();
  await handler(request('profile@example.com'), profileFound);
  assert.equal(profileFound.payload.exists, true);

  const invalidOrigin = result();
  await handler(request('a@example.com', { origin: 'https://foreign.example' }), invalidOrigin);
  assert.equal(invalidOrigin.statusCode, 403);

  const limitedEmail = 'rate-limited@example.com';
  let last;
  for (let i = 0; i < 9; i++) {
    last = result();
    await handler(request(limitedEmail), last);
  }
  assert.equal(last.statusCode, 429);
  assert.equal(last.headers['retry-after'], '600');

  for (const path of ['assets/js/site.js', '_static/chunks/site.js']) {
    const script = fs.readFileSync(path, 'utf8');
    assert.match(script, /setMode\(accountExists===false\?'signup':'password',email\)/);
    assert.match(script, /response\.status === 429/);
    assert.match(script, /if\(accountExists===null\)setStatus/);
  }
  for (const path of ['assets/css/site.css', '_static/styles/site.css']) {
    const css = fs.readFileSync(path, 'utf8');
    assert.match(css, /#emailStepTitle\.auth-step-title\{[^}]*text-align:center;/);
  }
  console.log('BETV email onboarding: account routing, safe fallback, rate limits, and centered copy passed.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => {
  global.fetch = originalFetch;
  dns.resolveMx = originalResolveMx;
  if (originalServiceKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
  if (originalBuckets === undefined) delete globalThis.__betvEmailLookupBuckets;
  else globalThis.__betvEmailLookupBuckets = originalBuckets;
});

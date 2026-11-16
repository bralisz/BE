'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync('assets/js/mobile-bottom-nav.js', 'utf8');

async function check({ mobile, installed }) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'https://billieilishtv.site/', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  let callbacks = 0;
  const observers = [];
  const NativeObserver = w.MutationObserver;
  w.matchMedia = () => ({ matches: mobile });
  w.beBackend = { auth: { currentUser: { uid: 'test-user' } } };
  if (installed) w.document.documentElement.classList.add('betv-installed-app');
  // Bound the regression so a broken microtask loop fails instead of hanging CI.
  w.MutationObserver = class extends NativeObserver {
    constructor(callback) {
      super((records, observer) => {
        callbacks++;
        if (callbacks >= 30) { observers.forEach(item => item.disconnect()); return; }
        callback(records, observer);
      });
      observers.push(this);
    }
  };
  const flush = () => new Promise(resolve => setTimeout(resolve, 40));
  try {
    w.eval(source);
    w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
    w.document.body.classList.add('login-mode');
    await flush();
    assert(callbacks < 30, 'navigation must settle and let startup timers run');
    const settled = callbacks;
    await flush();
    assert.equal(callbacks, settled, 'idle navigation must not keep mutating body.class');
    assert.equal(w.document.getElementById('betvMobileBottomNav').hidden, true);
    w.document.body.classList.remove('login-mode');
    await flush();
    if (mobile && installed) {
      w.BETVMobileBottomNav.openSaved();
      await flush();
      assert(w.document.body.classList.contains('betv-app-saved-active'));
      assert.equal(w.document.getElementById('betvAppSavedPage').hidden, false);
      w.document.documentElement.classList.remove('betv-installed-app');
      await flush();
      assert(!w.document.body.classList.contains('betv-app-saved-active'));
      assert.equal(w.document.getElementById('betvAppSavedPage').hidden, true);
    }
    assert(callbacks < 30, 'leaving installed mode must also settle');
  } finally { w.close(); }
}
(async () => {
  for (const config of [{mobile:false,installed:false},{mobile:true,installed:false},{mobile:true,installed:true}]) await check(config);
  console.log('Mobile navigation loading regression passed (desktop, mobile browser, installed app).');
})().catch(error => { console.error(error); process.exitCode = 1; });

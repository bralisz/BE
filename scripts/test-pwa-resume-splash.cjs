'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const script = html.match(/<script id="betv-pwa-resume-script">([\s\S]*?)<\/script>/);
assert.ok(script, 'installed-app resume handler must be present');
assert.match(html, /class="betv-pwa-resume-splash"[^>]*hidden/, 'resume wallpaper must be hidden by default');
assert.match(html, /betv-launch-fullres-20261116\.webp\?v=20261116-lossless/, 'original full-quality wallpaper must remain');
assert.match(html, /\.betv-pwa-resume-splash\[hidden\]\{display:none!important\}/, 'hidden wallpaper must never block interactions');

function createApp(installed = true, mobile = true) {
  let clock = 10000;
  let pendingTimer = null;
  let timerId = 0;
  const docListeners = {};
  const winListeners = {};
  const bodyClasses = new Set();
  const rootClasses = new Set();
  const picture = {complete: true, naturalWidth: 1080};
  const splash = {hidden: true, querySelector: () => picture};
  const document = {
    hidden: false,
    body: {classList: {contains: name => bodyClasses.has(name)}},
    documentElement: {classList: {contains: name => rootClasses.has(name)}},
    getElementById: id => id === 'betvPwaResumeSplash' ? splash : null,
    addEventListener(name, callback) {docListeners[name] = callback;}
  };
  const window = {
    __BETVInstalledAppLaunch: installed,
    matchMedia: () => ({matches: mobile}),
    addEventListener(name, callback) {winListeners[name] = callback;},
    setTimeout(callback, delay) {
      assert.equal(delay, 800, 'wallpaper must clear promptly');
      pendingTimer = callback;
      return ++timerId;
    },
    clearTimeout() {pendingTimer = null;}
  };
  vm.runInNewContext(script[1], {document, window, Date: {now: () => clock}}, {filename: 'pwa-resume-script'});
  return {
    splash, document, picture, bodyClasses, rootClasses, docListeners, winListeners,
    advance(ms) {clock += ms;},
    hide() {document.hidden = true; docListeners.visibilitychange?.();},
    resume() {document.hidden = false; docListeners.visibilitychange?.();},
    dismiss() {if(pendingTimer)pendingTimer();}
  };
}

const app = createApp();
assert.equal(app.splash.hidden, true, 'first boot must use the existing loading wallpaper, not the resume overlay');
app.hide();
app.advance(1200);
app.resume();
assert.equal(app.splash.hidden, false, 'returning to installed mobile app shows original wallpaper');
app.dismiss();
assert.equal(app.splash.hidden, true, 'wallpaper disappears without reloading site');
app.hide();
app.advance(200);
app.resume();
assert.equal(app.splash.hidden, true, 'brief visibility changes do not cause flashes');
app.hide();
app.advance(1200);
app.bodyClasses.add('site-loading-active');
app.resume();
assert.equal(app.splash.hidden, true, 'normal boot loading is not obscured');
app.bodyClasses.clear();
app.hide();
app.advance(1200);
app.picture.naturalWidth = 0;
app.resume();
assert.equal(app.splash.hidden, true, 'unavailable image cannot trap user behind an empty overlay');
assert.equal(createApp(false).docListeners.visibilitychange, undefined, 'browser tab must not receive installed-app wallpaper');
assert.equal(createApp(true, false).docListeners.visibilitychange, undefined, 'desktop app must not receive mobile wallpaper');
console.log('PASS mobile PWA wallpaper repeats on app resume without affecting browser navigation.');

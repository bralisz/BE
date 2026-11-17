'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('assets/js/site.js', 'utf8');
const staticSource = fs.readFileSync('_static/chunks/site.js', 'utf8');
assert.equal(staticSource, source, 'The public site bundle must match its source');

const from = source.indexOf('  window.BETVGuestAccess=window.BETVGuestAccess||{');
const to = source.indexOf('  function cleanPath(value)', from);
assert(from >= 0 && to > from, 'Expected public guest access module');
const saved = new Map();
const localStorage = {
  getItem(key) { return saved.has(key) ? saved.get(key) : null; },
  setItem(key,value) { saved.set(key, String(value)); },
  removeItem(key) { saved.delete(key); }
};
const window = {};
vm.runInNewContext(source.slice(from, to), { window, localStorage });
const guest = window.BETVGuestAccess;
assert(guest && guest.isActive(), 'First-time visitors should browse freely');

guest.setActive(false);
assert(guest.isActive(), 'A previous guest choice must not force login for an unsigned visitor');
localStorage.setItem('beAuthExpected', '1');
localStorage.setItem('beSessionUid', 'saved-user');
assert.equal(guest.isActive(), false, 'Keep a remembered user session protected during restoration');
localStorage.removeItem('beSessionUid');
localStorage.removeItem('beAuthExpected');
window.beBackend = { auth: { currentUser: { uid: 'signed-in' } } };
assert.equal(guest.isActive(), false, 'Signed-in sessions must not be considered visitors');
window.beBackend.auth.currentUser = null;
assert.equal(guest.isActive(), true, 'Signed-out users can return to public browsing');

assert(source.includes('if(isLoginRoute()){if(auth.currentUser)enterHome();else showLogin();return;}'), 'The /login route must still show the login page');
const account = fs.readFileSync('assets/js/account.js', 'utf8');
assert(account.includes("window.BETVPublicRoutes.go('/login')"), 'The account action must lead to /login');
const html = fs.readFileSync('index.html', 'utf8');
assert(html.includes('id="guestAccessButton"'), 'The optional guest login-page control remains available');
console.log('Guest browsing checks passed: public default, explicit login and authenticated sessions.');

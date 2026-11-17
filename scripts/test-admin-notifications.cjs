'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync('development/source/admin/admin.js', 'utf8');
const handler = fs.readFileSync('server/handlers/admin-runtime.js', 'utf8');
const runtime = Buffer.from(handler.match(/const ADMIN_BUNDLE_BASE64 = '([^']+)'/)[1], 'base64').toString('utf8');
async function check(code, label) {
  const start = code.indexOf('  async function notificationsPage() {');
  const end = code.indexOf('  async function billieSettingsPage()', start);
  assert.ok(start >= 0 && end > start);
  const dom = new JSDOM('<section id="adminContent"></section>', { runScripts: 'outside-only', url: 'https://betv.test/#/admin/notifications' });
  const w = dom.window, d = w.document;
  const pending = [];
  const rows = [{ id: 'notice', title: 'Teste', description: 'Descrição', active: true }];
  w.$ = (selector, root = d) => root.querySelector(selector);
  w.db = { list: () => new Promise(resolve => pending.push(resolve)) };
  w.esc = value => String(value);
  w.formatDateTime = () => '';
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.eval(code.slice(start, end) + '\nwindow.openNotifications = notificationsPage;');
  try {
    // Session restoration replaces the shell while its first request is pending.
    const stale = w.openNotifications();
    d.body.innerHTML = '<section id="adminContent"></section>';
    const current = w.openNotifications();
    pending.shift()(rows);
    await stale;
    assert.equal(d.querySelector('#notificationAdminForm'), null, 'stale request must not render into the new shell');
    pending.shift()(rows);
    await current;
    assert.ok(d.querySelector('#notificationAdminForm'));
    d.querySelector('[data-notification-edit]').click();
    assert.equal(d.querySelector('#notificationAdminForm').elements.namedItem('id').value, 'notice');
    assert.equal(d.querySelector('#notificationCancelEdit').hidden, false);
    d.querySelector('#notificationCancelEdit').click();
    assert.equal(d.querySelector('#notificationAdminForm').elements.namedItem('id').value, '');
    assert.equal(d.querySelector('#notificationCancelEdit').hidden, true);
    // Navigating away during a request must not fail or replace the next page.
    const leaving = w.openNotifications();
    d.body.innerHTML = '<section id="adminContent">Usuários</section>';
    pending.shift()(rows);
    await leaving;
    assert.equal(d.querySelector('#adminContent').textContent, 'Usuários');
    console.log('PASS ' + label + ': overlapping loads, edit/cancel, navigation during loading');
  } finally { w.close(); }
}
(async () => { await check(source, 'source'); await check(runtime, 'authenticated runtime'); })().catch(error => { console.error(error); process.exitCode = 1; });

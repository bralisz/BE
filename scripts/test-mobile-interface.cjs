const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {JSDOM, VirtualConsole} = require('jsdom');
const mobileUI = require('../development/source/admin/mobile');
const adminRuntime = require('../server/handlers/admin-runtime');

const quiet = new VirtualConsole();
function mediaMatches(query, width) {
  return query.split(',').some(part => {
    if (/prefers-reduced-motion|print/.test(part)) return false;
    const bounds = [...part.matchAll(/(min|max)-width:\s*(\d+)px/g)];
    return bounds.every(([, bound, size]) => bound === 'max' ? width <= +size : width >= +size);
  });
}
function activeRules(rules, width, selector) {
  return Array.from(rules).flatMap(rule => {
    if (rule.selectorText) return selector(rule.selectorText) ? [rule.cssText] : [];
    if (rule.media && !mediaMatches(rule.media.mediaText, width)) return [];
    return rule.cssRules ? activeRules(rule.cssRules, width, selector) : [];
  });
}

function checkPublicHeader(file) {
  const parser = new JSDOM('<style></style>', {virtualConsole:quiet});
  parser.window.document.querySelector('style').textContent = fs.readFileSync(file, 'utf8');
  const rules = parser.window.document.styleSheets[0].cssRules;
  for (const width of [320, 390, 760]) {
    const css = activeRules(rules, width, text => /mobileAppBar|mobile-app-bar/.test(text)).join('\n');
    for (const extra of ['', 'profile-view-own', 'profile-viewer-guest', 'profile-color-customized']) {
      const dom = new JSDOM('<style></style><body class="mobile-home-layout"><header id="mobileAppBar" class="mobile-app-bar"></header>', {virtualConsole:quiet});
      const {document} = dom.window;
      document.querySelector('style').textContent = css;
      const header = document.querySelector('header');
      assert.equal(dom.window.getComputedStyle(header).position, 'fixed', 'home navigation stays fixed');
      document.body.className += ' profile-page-active ' + extra;
      assert.equal(dom.window.getComputedStyle(header).position, 'absolute', `profile header scrolls at ${width}px (${extra || 'visitor'})`);
      document.body.className = 'mobile-home-layout';
      assert.equal(dom.window.getComputedStyle(header).position, 'fixed', 'returning home restores fixed navigation');
      dom.window.close();
    }
  }
  parser.window.close();
}

async function checkAdminDOM() {
  const dom = new JSDOM(`<body class="admin-mode"><header class="admin-topbar"><nav class="admin-nav">
    <button class="active" data-route="dashboard">Início</button><button data-route="users">Pessoas</button>
    </nav></header><main><div class="table-wrap"><table class="a-table"><thead><tr><th>Usuário</th><th>Acesso</th><th>Ações</th></tr></thead>
    <tbody><tr><td>Miguel</td><td>Admin</td><td><button id="edit">Editar</button></td></tr></tbody></table></div></main>`, {runScripts:'outside-only', virtualConsole:quiet});
  const {document} = dom.window;
  let clicks = 0;
  document.getElementById('edit').onclick = () => clicks++;
  dom.window.eval(mobileUI);
  const settle = () => new Promise(resolve => dom.window.setTimeout(resolve, 0));
  assert(document.querySelector('.admin-mobile-tabs'));
  assert.equal(document.querySelector('[aria-current="page"]').dataset.route, 'dashboard');
  assert.equal(document.querySelector('.admin-nav button').type, 'button');
  assert.equal(document.querySelector('table').getAttribute('role'), 'table');
  assert.deepEqual(Array.from(document.querySelectorAll('td'), cell => cell.dataset.mobileLabel), ['Usuário','Acesso','Ações']);
  assert.deepEqual(Array.from(document.querySelectorAll('td'), cell => cell.textContent), ['Miguel','Admin','Editar']);
  document.getElementById('edit').click();
  assert.equal(clicks, 1, 'table actions retain their original click handlers');

  document.querySelector('tbody').innerHTML = '<tr><td>Outro fã</td><td>Editor</td><td>Editar</td></tr>';
  await settle();
  assert.equal(document.querySelector('tbody td').dataset.mobileLabel, 'Usuário', 'async rows receive labels');
  document.querySelector('.admin-topbar').innerHTML = '<nav class="admin-nav"><button data-route="users" class="active">Pessoas</button></nav>';
  await settle();
  assert(document.querySelector('.admin-mobile-tabs'));
  assert.equal(document.querySelector('[aria-current="page"]').dataset.route, 'users', 'replacement shell is enhanced');

  document.querySelector('tbody').innerHTML = '<tr><td colspan="3">Nenhum usuário</td></tr>';
  await settle();
  assert(!document.querySelector('table').classList.contains('admin-mobile-cards'), 'spanning cells retain their table layout');
  dom.window.eval(mobileUI);
  assert.equal(document.querySelectorAll('#be-admin-mobile-ui').length, 1, 'reloading the runtime is idempotent');

  const sheet = document.getElementById('be-admin-mobile-ui').sheet;
  assert(sheet && sheet.cssRules.length > 0, 'mobile stylesheet parses');
  assert.equal(activeRules(sheet.cssRules, 1024, () => true).length, 0, 'desktop has no new layout rules');
  const mobileRules = activeRules(sheet.cssRules, 390, () => true).join('\n');
  assert(mobileRules.includes('safe-area-inset-bottom'), 'dock reserves the iPhone safe area');
  dom.window.close();
}

async function checkProtectedRuntime() {
  const savedFetch = global.fetch;
  let calls = 0;
  const request = {method:'GET', headers:{host:'betv.test', authorization:'Bearer test-token'}};
  function response() {
    return {statusCode:0, body:'', headers:{}, setHeader(name,value){this.headers[name]=value;}, status(code){this.statusCode=code;return this;}, end(){return this;}, send(body){this.body=body;return this;}};
  }
  try {
    global.fetch = async url => {
      calls++;
      return {ok:true, text:async () => JSON.stringify(url.endsWith('/auth/v1/user') ? {id:'admin'} : true)};
    };
    const allowed = response();
    await adminRuntime(request, allowed);
    assert.equal(allowed.statusCode, 200);
    assert(allowed.body.endsWith(mobileUI), 'authenticated response includes the actual mobile source');
    new vm.Script(allowed.body);
    assert.equal(allowed.headers['Cache-Control'], 'private, no-store, max-age=0');
    const missing = response();
    calls = 0;
    await adminRuntime({method:'GET',headers:{host:'betv.test'}}, missing);
    assert.equal(missing.statusCode, 404);
    assert.equal(calls, 0);
    global.fetch = async url => ({ok:true, text:async () => JSON.stringify(url.endsWith('/auth/v1/user') ? {id:'viewer'} : false)});
    const denied = response();
    await adminRuntime(request, denied);
    assert.equal(denied.statusCode, 404);
    assert.equal(denied.body, '', 'non-admins cannot receive the runtime');
  } finally {
    global.fetch = savedFetch;
  }
}

(async () => {
  checkPublicHeader('assets/css/site.css');
  checkPublicHeader('_static/styles/site.css');
  await checkAdminDOM();
  await checkProtectedRuntime();
  console.log('PASS mobile interface: profile/header cascade, route restoration, dynamic admin lists/navigation, preserved actions and authenticated delivery');
})().catch(error => {console.error(error);process.exitCode = 1;});

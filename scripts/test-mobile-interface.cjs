const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {JSDOM, VirtualConsole} = require('jsdom');
const mobileUI = require('../development/source/admin/mobile');
const adminRuntime = require('../server/handlers/admin-runtime');
const workspaceUI = require('../development/source/admin/workspace');
const studioUI = require('../development/source/admin/studio');
const mediaUI = require('../development/source/admin/media');

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

function checkSettingsLayout(file) {
  const parser = new JSDOM('<style></style>', {virtualConsole:quiet});
  parser.window.document.querySelector('style').textContent = fs.readFileSync(file, 'utf8');
  for (const width of [320,390,760]) {
    const css = activeRules(parser.window.document.styleSheets[0].cssRules, width,
      text => /mobileAppBar|mobile-app-bar|settings|legal-page|legal-article/.test(text)).join('\n');
    const dom = new JSDOM(`<style></style><body class="settings-page-active mobile-secondary-page">
      <header id="mobileAppBar" class="mobile-app-bar"></header>
      <section id="settingsPage" class="settings-page-shell"><div class="settings-wrap"><div class="settings-header"></div>
      <div id="settingsPageBody"><div class="settings-legal-layout"><nav class="settings-page-nav"><button>Perfil</button></nav></div></div></div></section>
      <section id="legalPage" class="legal-page-shell"><header class="legal-page-header"></header><div class="legal-page-wrap"><nav class="legal-page-nav"><a>Termos</a></nav></div></section>`, {virtualConsole:quiet});
    const d = dom.window.document;
    d.querySelector('style').textContent = css;
    const computed = selector => dom.window.getComputedStyle(d.querySelector(selector));
    assert.equal(computed('#mobileAppBar').position, 'fixed');
    assert.equal(computed('#mobileAppBar').backgroundColor, 'rgb(5, 6, 7)', 'settings controls have an opaque header');
    assert.equal(computed('#settingsPage').position, 'relative', 'settings scroll in document flow');
    assert.equal(computed('#settingsPage').overflow, 'visible');
    assert.equal(computed('.settings-header').display, 'none', 'one header instead of overlapping headers');
    const settingsNav = computed('.settings-page-nav');
    const settingsBody = computed('#settingsPageBody');
    assert.equal(settingsNav.position, 'static', 'settings tabs do not float over the form');
    const spacing = [settingsNav.padding,settingsNav.borderRadius,settingsNav.marginBottom,settingsBody.width,settingsBody.paddingTop];
    d.body.className = 'legal-page-active mobile-secondary-page';
    const legalNav = computed('.legal-page-nav');
    const legalBody = computed('.legal-page-wrap');
    assert.deepEqual([legalNav.padding,legalNav.borderRadius,legalNav.marginBottom,legalBody.width,legalBody.paddingTop], spacing, 'settings use the legal-page layout');
    dom.window.close();
  }
  parser.window.close();
}

function checkHomeVisibility() {
  const source = fs.readFileSync('assets/js/site.js','utf8');
  const start = source.indexOf('  function syncActiveFromPublicView() {');
  const end = source.indexOf('  function start() {',start);
  const dom = new JSDOM('<body><button id="mobileHomeButton" hidden>Home</button></body>', {runScripts:'outside-only'});
  dom.window.isMobile = () => true;
  dom.window.setActiveDestination = () => {};
  dom.window.eval(source.slice(start,end) + '\nwindow.syncHome=syncActiveFromPublicView;');
  const d = dom.window.document, button = d.getElementById('mobileHomeButton');
  dom.window.syncHome();
  assert(button.hidden);
  for (const route of ['profile','settings','notification','detail','album','support','donate','billie','fans','legal','community']) {
    d.body.className=route+'-page-active';
    dom.window.syncHome();
    assert.equal(button.hidden,false,route+' has Home');
  }
  for (const view of ['films','videos','movies','series']) {
    d.body.className='';d.body.dataset.homeView=view;
    dom.window.syncHome();assert.equal(button.hidden,false,view+' has Home');
  }
  d.body.className='section-catalog-active';dom.window.syncHome();assert.equal(button.hidden,false);
  d.body.dataset.homeView='home';d.body.className='';dom.window.syncHome();assert(button.hidden);
  d.body.className='settings-page-active';dom.window.isMobile=()=>false;dom.window.syncHome();assert(button.hidden,'desktop is unchanged');
  dom.window.close();
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
    assert(allowed.body.includes(mobileUI), 'authenticated response includes the actual mobile source');
    assert(allowed.body.includes(workspaceUI), 'authenticated response includes the admin workspace');
    assert(allowed.body.includes(studioUI), 'authenticated response includes the studio dashboard');
    assert(allowed.body.endsWith(mediaUI), 'authenticated response includes gallery and mobile redesign');
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
  checkSettingsLayout('assets/css/site.css');
  checkSettingsLayout('_static/styles/site.css');
  checkHomeVisibility();
  await checkAdminDOM();
  await checkProtectedRuntime();
  console.log('PASS mobile interface: profile/header cascade, settings/legal layout, Home visibility, dynamic admin lists/navigation, preserved actions and authenticated delivery');
})().catch(error => {console.error(error);process.exitCode = 1;});

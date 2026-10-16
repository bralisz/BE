'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM,VirtualConsole} = require('jsdom');
const adminRuntime = require('../server/handlers/admin-runtime');
const interfaceSource = require('../development/source/admin/interface');

function mediaMatches(query,width) {
  return query.split(',').some(part => !/prefers-reduced-motion|print/.test(part) &&
    [...part.matchAll(/(min|max)-width:\s*(\d+)px/g)].every(([,bound,size]) => bound === 'max' ? width <= +size : width >= +size));
}
function flatten(rules,width) {
  return Array.from(rules).flatMap(rule => {
    if (rule.selectorText) return [rule.cssText];
    if (rule.media && !mediaMatches(rule.media.mediaText,width)) return [];
    return rule.cssRules ? flatten(rule.cssRules,width) : [];
  });
}
async function authenticatedSource() {
  const savedFetch = global.fetch;
  global.fetch = async url => ({ok:true,text:async () => JSON.stringify(url.endsWith('/auth/v1/user') ? {id:'admin'} : true)});
  const res = {statusCode:0,setHeader(){},status(code){this.statusCode=code;return this;},send(body){this.body=body;return this;},end(){return this;}};
  try {
    await adminRuntime({method:'GET',headers:{host:'betv.test',authorization:'Bearer fixture'}},res);
    assert.equal(res.statusCode,200);
    assert(res.body.endsWith(interfaceSource));
    return res.body;
  } finally {global.fetch=savedFetch;}
}
async function exerciseRuntime(source,width) {
  const errors=[];
  let loadingPublicStyles=true;
  const console = new VirtualConsole();
  console.on('jsdomError',error => {
    // The existing public CSS has a malformed multi-gradient declaration. Keep
    // its browser recovery behavior, and report new admin parsing/runtime errors.
    if(loadingPublicStyles && error.type==='css-parsing') return;
    if (!error.message.includes('Not implemented')) errors.push(error.cause || error);
  });
  console.on('error',error => errors.push(error));
  const dom = new JSDOM(fs.readFileSync('index.html','utf8'),{
    url:'https://betv.test/#/admin/dashboard',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console
  });
  const w=dom.window,d=w.document;
  // The public bootstrap releases its loading curtain before loading the admin.
  // Retain the actual HTML/CSS while simulating that completed startup step.
  d.documentElement.classList.remove('site-loading-active');
  d.body.classList.remove('site-loading-active');
  if(width<=800){d.documentElement.classList.add('mobile-lite','performance-lite');d.body.classList.add('mobile-home-layout');}
  const publicStyle=d.createElement('style');
  publicStyle.textContent=fs.readFileSync('_static/styles/site.css','utf8');
  d.head.append(publicStyle);
  loadingPublicStyles=false;
  w.innerWidth=width;
  w.matchMedia=query => ({matches:mediaMatches(query,width),addEventListener(){},addListener(){}});
  w.scrollTo=() => {};
  w.HTMLElement.prototype.scrollTo=function() {};
  w.HTMLElement.prototype.scrollIntoView=function() {};
  w.confirm=() => false;
  w.fetch=async () => ({ok:true,json:async () => ({version:'fixture-v1'}),text:async () => '{}',headers:{get:()=>''}});
  const account={uid:'admin',id:'admin',email:'admin@fixture.test',displayName:'Admin',role:'admin'};
  const records={
    sections:[{id:'section-1',title:'Live Sessions',slug:'live-sessions',category:'videos',active:true,order:1}],
    videos:[{id:'video-1',title:'Ocean Eyes live',sectionId:'section-1',sectionSearch:'Live Sessions',active:true,publicId:'12345678',imageUrl:'https://images.test/video.jpg',contentUrl:'https://player.test/video'}],
    movies:[{id:'movie-1',title:'Tour film',active:true,imageUrl:'https://images.test/movie.jpg',contentUrl:'https://player.test/film'}],
    series:[{id:'series-1',title:'Sessions',active:true}],
    news:[{id:'album-1',title:'Happier Than Ever',active:true,type:'Álbum',year:'2021',imageUrl:'https://images.test/album.jpg',contentUrl:'https://player.test/album',tracks:[{title:'Getting Older',duration:'4:04'}]}],
    featured:[{id:'featured-1',title:'Tour film',contentId:'movie-1',contentCollection:'movies',active:true}],
    gallery:[{id:'avatar-1',itemType:'avatar',category:'Avocados',imageUrl:'https://images.test/avatar.jpg',active:true}],
    ongs:[{id:'ong-1',title:'Apoio',name:'Apoio',active:true}],
    users:[account,{id:'fan-1',uid:'fan-1',displayName:'Fã',username:'fan',email:'fan@fixture.test',role:'user',createdAt:'2026-10-01T12:00:00Z'}],
    notifications:[{id:'notice-1',title:'Novos filmes',description:'Atualização de teste',active:true,createdAt:'2026-10-01T12:00:00Z'}],
    admin_logs:[]
  };
  const writes=[],rpcs=[];
  const settings={};
  let query;
  query=new Proxy({}, {get:(_,name) => name==='then' ? resolve => resolve({data:[],count:2,error:null}) : () => query});
  w.beBackend={
    ready:Promise.resolve(),mode:'local',now:()=>new Date().toISOString(),isAdmin:()=>true,normalizeUsername:value=>value.toLowerCase(),
    profiles:{ensure:async ()=>({username:'admin',displayName:'Admin',role:'admin'})},
    auth:{currentUser:account,onChange:callback=>{callback(account);return ()=>{};}},
    data:{
      list:async name=>(records[name] || []).map(item=>({...item})),
      count:async name=>(records[name] || []).length,
      get:async (name,id)=>name==='settings' ? settings[id] || {} : records[name]?.find(item=>item.id===id) || null,
      add:async (name,data)=>{const item={...data,id:'saved-'+writes.length};writes.push({name,data,item});(records[name] ||= []).push(item);return item;},
      set:async (name,id,data)=>{writes.push({name,id,data});if(name==='settings')settings[id]={...settings[id],...data};else Object.assign(records[name]?.find(item=>item.id===id)||{},data);return {id,...data};},
      remove:async (name,id)=>{writes.push({name,id,remove:true});records[name]=records[name].filter(item=>item.id!==id);}
    },
    client:{from:()=>query,rpc:async (name,args)=>{rpcs.push({name,args});return {data:name==='get_admin_dashboard_metrics' ? {todayUsers:7,approvedDonations:2} : name==='get_admin_donation_overview' ? {rows:[],insights:{}} : [],error:null};}}
  };
  const tick = () => new Promise(resolve=>w.setTimeout(resolve,0));
  const until = async (test,label) => {for(let i=0;i<80;i++){if(test()){await tick();return;}await new Promise(resolve=>w.setTimeout(resolve,10));}throw new Error('Admin did not settle ('+width+'px): '+label+'; '+d.querySelector('#adminContent')?.textContent.slice(0,200));};
  const click = selector => {const node=d.querySelector(selector);assert(node,'missing '+selector);node.click();};
  const route = async (value,selector) => {
    const link=d.querySelector('[data-admin-page="'+value+'"]');
    assert(link,'all admin pages are reachable: '+value);
    link.click();
    await until(()=>w.location.hash==='#/admin/'+value && d.querySelector(selector),value);
    assert.equal(d.querySelectorAll('.admin-ui-sidebar').length,1);
    assert.equal(d.querySelectorAll('.admin-ui-dock').length,1);
    assert.equal(d.querySelector('[data-admin-page][aria-current="page"]').dataset.adminPage,value);
  };

  try {
    w.eval(source);
    await until(()=>d.querySelector('.dashboard-metric-big-number'),'dashboard');
    const viewportStyle=d.createElement('style');
    viewportStyle.id='fixtureViewportStyles';
    viewportStyle.textContent=Array.from(d.styleSheets).flatMap(sheet=>flatten(sheet.cssRules,width)).join('\n');
    d.head.append(viewportStyle);
    assert.equal(d.querySelectorAll('.admin-ui-nav-link[data-admin-page]').length,14,'every area has a direct destination');
    assert(d.querySelector('.dashboard-metric-big-number').textContent.includes('7'),'actual backend metrics are retained');
    assert.equal(d.querySelectorAll('#be-admin-interface').length,1);
    assert(d.querySelector('#dashboardNewContent').onclick,'original create-content handler is retained');

    if(width<=800){
      d.querySelector('.admin-ui-menu-toggle').focus();
      click('.admin-ui-menu-toggle');
      assert(d.body.classList.contains('admin-ui-menu-open'));
      assert.equal(d.querySelector('.admin-ui-sidebar').getAttribute('aria-modal'),'true');
      assert.equal(d.querySelector('.admin-main').inert,true);
      d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
      assert(!d.body.classList.contains('admin-ui-menu-open'));
      assert.equal(d.activeElement,d.querySelector('.admin-ui-menu-toggle'));
      assert.equal(d.querySelector('.admin-main').inert,false);
      assert.notEqual(d.body.style.overflowY,'hidden');
    }

    const searchTrigger=d.querySelector('[data-admin-action="search"]');
    searchTrigger.focus();
    searchTrigger.click();
    let paletteInput=d.getElementById('adminPageSearch');
    paletteInput.value='página inexistente';paletteInput.dispatchEvent(new w.Event('input',{bubbles:true}));
    assert.equal(d.getElementById('adminPageEmpty').hidden,false);
    paletteInput.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    assert.equal(d.activeElement,searchTrigger,'closing search restores focus');
    d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true}));
    const search=d.getElementById('adminPageSearch');
    assert.equal(d.activeElement,search);
    search.value='album';search.dispatchEvent(new w.Event('input',{bubbles:true}));
    assert.equal(d.querySelectorAll('.admin-ui-palette-result').length,1,'navigation search ignores accents');
    search.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    await until(()=>d.querySelector('[data-content-category="news"].active'),'palette navigates to albums');
    assert.equal(d.querySelector('.admin-ui-palette'),null);
    assert.notEqual(d.querySelector('.admin-shell').inert,true);
    assert.notEqual(d.body.style.overflowY,'hidden');

    // The modern editor runs unchanged: stepper, previews, validation, cancel,
    // draft handling and album tracks use the original handlers and form.
    click('#newContent');
    await until(()=>d.getElementById('editorForm'),'album editor');
    assert(d.querySelector('#footerCancelButton').onclick);
    assert.equal(d.querySelector('[data-editor-submit]').form,d.getElementById('editorForm'));
    const steps=d.querySelectorAll('[data-editor-step]');
    assert(steps.length>=2);
    steps[1].click();
    assert.equal(d.querySelectorAll('.editor-field-group:not([hidden])').length,1);
    assert.equal(d.querySelector('[data-editor-step="1"]').getAttribute('aria-current'),'page');
    assert(d.querySelector('[data-preview-toggle]'),'preview action is retained');
    const editorCSS=Array.from(d.styleSheets).flatMap(sheet=>flatten(sheet.cssRules,width)).join('\n');
    const editorCascade=new JSDOM('<style></style>'+d.body.outerHTML,{virtualConsole:new VirtualConsole()});
    editorCascade.window.document.documentElement.className=d.documentElement.className;
    editorCascade.window.document.querySelector('style').textContent=editorCSS;
    const editorComputed=selector=>editorCascade.window.getComputedStyle(editorCascade.window.document.querySelector(selector));
    assert.equal(editorComputed('.content-editor-modal.inline').height,'auto','editor is not locked to viewport height');
    assert.equal(editorComputed('.content-editor-fields').overflow,'visible','fields use document scrolling');
    assert.equal(editorComputed('.content-editor-actions').display,'flex','save and cancel toolbar is visible');
    assert.notEqual(editorComputed('[data-editor-submit]').display,'none');
    assert.notEqual(editorComputed('#footerCancelButton').display,'none');
    editorCascade.window.close();
    click('[data-preview-toggle]');
    assert(d.querySelector('#adminContent').classList.contains('content-preview-open'));
    click('[data-preview-toggle]');
    click('#footerCancelButton');
    await until(()=>d.querySelector('#newContent')&&!d.getElementById('editorForm'),'cancel returns to collection');
    click('[data-edit="album-1"]');
    await until(()=>d.getElementById('editorForm'),'edit existing album');
    const albumForm=d.getElementById('editorForm');
    albumForm.elements.namedItem('title').value='Happier Than Ever · editado';
    albumForm.dispatchEvent(new w.SubmitEvent('submit',{bubbles:true,cancelable:true,submitter:d.querySelector('[data-editor-submit]')}));
    await until(()=>writes.some(write=>write.name==='news'&&write.id==='album-1'),'album saved');
    await until(()=>!d.getElementById('editorForm'),'saved album returns to collection');

    await route('users','.users-table');
    const table=d.querySelector('.users-table');
    assert(table.classList.contains('admin-mobile-cards'));
    assert.equal(table.getAttribute('role'),'table');
    const headings=Array.from(table.querySelectorAll('thead th'),th=>th.textContent.trim());
    assert.deepEqual(Array.from(table.querySelector('tbody tr').cells,cell=>cell.dataset.mobileLabel),headings);
    assert(d.querySelector('[data-user-export]').onclick,'user actions retain their handlers');
    const body=table.querySelector('tbody');
    const added=body.querySelector('tr').cloneNode(true);
    added.querySelectorAll('td').forEach(cell=>cell.removeAttribute('data-mobile-label'));
    body.append(added);await tick();
    assert.deepEqual(Array.from(added.cells,cell=>cell.dataset.mobileLabel),headings,'new rows receive mobile labels');
    added.remove();
    click('#openUsersModeration');
    await until(()=>d.querySelector('.users-moderation-panel'),'moderation');
    click('[data-moderation-tab="bans"]');
    assert(d.querySelector('[data-moderation-tab="bans"]').classList.contains('active'));
    click('#usersModerationBack');
    await until(()=>d.querySelector('.users-table'),'back from moderation');

    await route('notifications','#notificationAdminForm');
    click('[data-notification-edit="notice-1"]');
    assert.equal(d.getElementById('notificationAdminForm').elements.namedItem('title').value,'Novos filmes');
    click('#notificationCancelEdit');
    const form=d.getElementById('notificationAdminForm');
    form.elements.namedItem('title').value='Novo visual';
    form.elements.namedItem('description').value='Interface de teste';
    form.dispatchEvent(new w.SubmitEvent('submit',{bubbles:true,cancelable:true,submitter:d.getElementById('notificationSaveButton')}));
    await until(()=>d.querySelector('.admin-notification-item h3')?.textContent==='Novo visual','notification saved');
    assert(writes.some(write=>write.name==='notifications'&&write.data.title==='Novo visual'),'notification submit reaches the existing data adapter');

    await route('gallery','#galleryAdminBoard .gallery-avatar-card');
    click('[data-gallery-create="avatar"]');
    await until(()=>d.querySelector('.modal #editorForm'),'gallery editor');
    click('#cancelModal');
    assert.equal(d.querySelector('.modal-backdrop'),null);

    for(const [value,selector] of [['contents/videos','#newContent'],['contents/unlinked','#newContent'],['contents/movies','#newContent'],['contents/series','#newContent'],['contents/featured','#newContent'],['billie','#adminContent form'],['sections','#newItem'],['ongs','#ongPageSettingsForm'],['settings','#communityForm']]) {
      await route(value,selector);
    }
    const community=d.getElementById('communityForm');
    assert(community.onsubmit);
    for(const label of d.querySelectorAll('.field label[for]')) assert(d.getElementById(label.htmlFor),'generated labels point to real fields');

    // Flatten media queries for the real runtime DOM and all legacy styles;
    // JSDOM does not perform viewport layout or evaluate @media on its own.
    viewportStyle.remove();
    const css=Array.from(d.styleSheets).flatMap(sheet=>flatten(sheet.cssRules,width)).join('\n');
    const cascade=new JSDOM('<style></style>'+d.documentElement.outerHTML,{virtualConsole:new VirtualConsole()});
    cascade.window.document.querySelectorAll('style').forEach((node,index)=>{if(index)node.remove();});
    cascade.window.document.querySelector('style').textContent=css;
    const computed=selector=>cascade.window.getComputedStyle(cascade.window.document.querySelector(selector));
    assert.equal(computed('.admin-topbar').position,'relative','header scrolls in document flow');
    assert.equal(computed('.admin-topbar').backgroundColor,'rgba(0, 0, 0, 0)','admin header is transparent');
    assert.equal(computed('.admin-topbar').boxShadow,'none');
    assert.equal(computed('.admin-ui-dock').display,width<=800?'grid':'none');
    assert.equal(computed('.admin-ui-sidebar').position,'fixed');
    assert.equal(computed('.form-grid').gridTemplateColumns,width<=800?'minmax(0,1fr)':'repeat(2,minmax(0,1fr))');
    cascade.window.close();
    w.eval(interfaceSource);
    assert.equal(d.querySelectorAll('#be-admin-interface').length,1,'runtime reload is idempotent');
    assert.equal(d.querySelectorAll('.admin-ui-sidebar').length,1);
    assert.deepEqual(errors.map(error=>error.message || String(error)),[],'real admin runtime has no unexpected errors');
    process.stdout.write('PASS admin '+width+'px: real routes, navigation search, album save, editor actions, moderation, notification save, gallery, async labels and CSS cascade\n');
  } finally {dom.window.close();}
}

(async()=>{
  const source=await authenticatedSource();
  for(const width of [390,1440]) await exerciseRuntime(source,width);
})().catch(error=>{console.error(error);process.exitCode=1;});

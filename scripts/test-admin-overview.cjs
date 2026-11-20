'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');
const overview = require('../development/source/admin/overview');
const source = fs.readFileSync('development/source/admin/admin.js','utf8');
const served = fs.readFileSync('server/handlers/admin-runtime.js','utf8');
const bundle = Buffer.from(served.match(/const ADMIN_BUNDLE_BASE64 = '([^']+)'/)[1],'base64').toString();
for (const runtime of [source,bundle]) {
  new Function(runtime);
  assert(runtime.includes("current === 'statistics'"));
  assert(runtime.includes("if (current === 'operations') return dashboard()"));
  assert(runtime.includes("['posts', 'Posts', current === 'posts']"));
}
const dom = new JSDOM('<main><section id="adminContent"></section></main>', {runScripts:'outside-only',url:'https://betv.test/admin#/admin/dashboard'});
const w = dom.window, d = w.document;
const delay = () => new Promise(r=>setTimeout(r,5));
(async()=>{
  w.eval(overview);
  let created=0, edited='',filter='all',fail=false;
  const rows=[{id:'vid',collection:'videos',title:'Show',active:'true'},{id:'film',collection:'movies',title:'Filme',active:'false'}];
  const client={
    async rpc(){return {data:{weeklyUsers:[{date:'2026-11-19',users:2},{date:'2026-11-20',users:4}],todayUsers:4,topViewed:{title:'Show',value:12}}};},
    from(){filter='all';return {select(){return this;},in(){return this;},or(){filter='live';return this;},eq(){filter='hidden';return this;},order(){return this;},async limit(){return fail?{error:true}:{data:rows.filter(r=>filter==='all'||(r.active==='false')===(filter==='hidden'))};}};}
  };
  w.BETVRenderOverview({host:d.querySelector('section'),user:{displayName:'Miguel'},client,
    db:{get:async(type,id)=>({id})},edit:(type,item)=>{edited=item.id;},create:()=>created++,resume(){},logout(){}});
  await delay();
  assert.equal(d.querySelector('h1').textContent,'Olá, Miguel!');
  assert.equal(d.querySelectorAll('.panel').length,5);
  assert.equal(d.querySelector('.ov-stat strong').textContent,'6');
  const select=d.querySelector('select'); select.value='1';select.dispatchEvent(new w.Event('change'));
  assert.equal(d.querySelector('.ov-stat strong').textContent,'4');
  d.querySelector('[data-filter=hidden]').click();await delay();
  assert.equal(d.querySelectorAll('.tile').length,1);
  d.querySelector('.tile').click();await delay();assert.equal(edited,'film');
  d.querySelector('.add').click();assert.equal(created,1);
  fail=true;d.querySelector('[data-filter=all]').click();await delay();assert.match(d.querySelector('.items').textContent,/Tentar novamente/);
  fail=false;d.querySelector('.items button').click();await delay();assert.equal(d.querySelectorAll('.tile').length,2);
  d.querySelector('.menu').click();assert.equal(d.querySelector('.menu').getAttribute('aria-expanded'),'true');
  assert.equal(d.querySelector('[aria-current=date]').textContent,String(new Date().getDate()));
  dom.window.close();console.log('OK: admin overview routing, real periods, filters, editor, retry, mobile navigation.');
})().catch(e=>{console.error(e);process.exitCode=1;});

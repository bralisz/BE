'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('assets/js/site.js','utf8');
const normalize=value=>String(value||'').trim().toLowerCase().replace(/^@+/,'');
const valid=value=>/^[a-z0-9][a-z0-9._]{1,18}[a-z0-9]$/.test(value);
function navigation(label,ensure){
  const timers=new Map();let counter=0;
  const nodes={ddUsername:{textContent:label},userDropdown:{classList:{add(){}},appendChild(node){nodes[node.id]=node;}},userChip:{setAttribute(){}}};
  const routes=[],events=[];
  const ctx={window:{beBackend:{normalizeUsername:normalize,validUsername:valid,profiles:{ensure}},BETVLocaleURL:path=>'/en'+path,setTimeout:fn=>{timers.set(++counter,fn);return counter;},clearTimeout:id=>timers.delete(id),dispatchEvent:event=>events.push(event)},document:{getElementById:id=>nodes[id]||null,createElement:()=>({setAttribute(){},style:{}}),body:{classList:{contains:()=>true}}},history:{pushState:(state,title,path)=>routes.push(path)},location:{search:'?test=1'},CustomEvent:class{constructor(type){this.type=type;}},closeSearchOverlays(){}};
  vm.createContext(ctx);
  const handle=source.slice(source.indexOf('  async function profileHandle(account){'),source.indexOf('  function activateSettings(){'));
  const activation=source.slice(source.indexOf('  var profileNavigationInFlight=null;'),source.indexOf("  document.addEventListener('click'",source.indexOf('  var profileNavigationInFlight=null;')));
  vm.runInContext(handle+activation+'\nthis.handle=profileHandle;this.open=activateProfile;',ctx);
  return {ctx,timers,routes,events,nodes};
}
(async()=>{
  let calls=0;
  const named=navigation('Miguel Rodrigues',async()=>{calls++;return {username:'bralis'};});
  await named.ctx.open({uid:'u1'});assert.deepEqual(named.routes,['/en/@bralis?test=1']);assert.equal(calls,1);assert.equal(named.events[0].type,'be:open-profile-route');
  const known=navigation('Miguel',()=>{throw new Error('network should not run');});
  await known.ctx.open({uid:'u1',profile:{username:'bralis'}});assert.equal(known.routes[0],'/en/@bralis?test=1');
  const label=navigation('@bralis',()=>{throw new Error('network should not run');});assert.equal(await label.ctx.handle({uid:'u1'}),'bralis');
  let resolve;
  const pending=navigation('Usuário',()=>new Promise(done=>resolve=done));
  const first=pending.ctx.open({uid:'u1'}),second=pending.ctx.open({uid:'u1'});assert.equal(first,second);resolve({username:'bralis'});await first;assert.equal(pending.routes.length,1);
  const stalled=navigation('Usuário',()=>new Promise(()=>{}));const wait=stalled.ctx.open({uid:'u1'});stalled.timers.values().next().value();await wait;
  assert.equal(stalled.routes.length,0,'never navigate to a fabricated @perfil');assert.match(stalled.nodes.profileNavigationError.textContent,/Tente novamente/);assert.equal(stalled.timers.size,0);
  const missing=navigation('Miguel',async()=>({username:''}));await missing.ctx.open({uid:'u1'});assert.equal(missing.routes.length,0);assert(missing.nodes.profileNavigationError);

  const timers=new Map();let next=0;let response={status:404,ok:false};
  const cached=new Map(),inFlight=new Map();
  const ctx={window:{setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id)},fetch:async()=>response,AbortController,normalizeUsername:normalize,validUsername:valid,MODE:'supabase',readCachedPublicProfile:name=>cached.get(name),publicProfilePromises:inFlight,clone:value=>value,cachePublicProfile:(name,value)=>cached.set(name,value),backendError:(code,message)=>Object.assign(new Error(message),{code})};
  vm.createContext(ctx);
  const fetcher=source.slice(source.indexOf('  async function fetchPublicJson('),source.indexOf('  async function fetchHomeVersions('));
  const publicMethod=source.slice(source.indexOf('    async getPublic(username) {'),source.indexOf('    async ensure(user) {'));
  vm.runInContext(fetcher+'\nthis.profiles={'+publicMethod+'};',ctx);
  assert.equal(await ctx.profiles.getPublic('missing'),null);
  response={ok:true,json:async()=>({username:'bralis'})};assert.equal((await ctx.profiles.getPublic('bralis')).username,'bralis');
  ctx.fetch=()=>new Promise(()=>{});
  const timeout=ctx.profiles.getPublic('other');const rejected=assert.rejects(timeout,error=>error.code==='profile/public-unavailable');timers.values().next().value();await rejected;
  assert.equal(inFlight.size,0,'timeout releases the pending lookup so retry can run');
  ctx.fetch=async()=>({ok:true,json:async()=>({username:'other'})});assert.equal((await ctx.profiles.getPublic('other')).username,'other');
  console.log('PASS profile navigation: real handles, locale, cached account, concurrent clicks, stalled lookup, missing username, 404, timeout cleanup and retry');
})().catch(error=>{console.error(error);process.exit(1);});

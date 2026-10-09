'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
if(!process.argv[2]){
  for(const scenario of ['profile','mobile-profile','guest-profile','community','chunk-retry','history','images','settings','search']){
    process.stdout.write(execFileSync(process.execPath,[__filename,scenario],{timeout:10000,encoding:'utf8'}));
  }
  process.exit();
}
const {JSDOM,VirtualConsole}=require('jsdom');
const scenario=process.argv[2];
const errors=[];
const vc=new VirtualConsole();vc.on('jsdomError',error=>{if(!error.message.includes('Not implemented'))errors.push(error.cause||error);});
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://billieilishtv.site/'+(scenario==='guest-profile'?'@other':''),runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
const w=dom.window;
if(scenario==='mobile-profile')w.innerWidth=390;
w.matchMedia=query=>({matches:scenario==='mobile-profile'&&query.includes('max-width'),addEventListener(){},addListener(){}});
w.scrollTo=options=>{w.scrollY=Number(options.top)||0;w.scrollX=Number(options.left)||0;};
w.fetch=async()=>({ok:true,json:async()=>({}),text:async()=>'',headers:{get:()=>''}});
w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};w.ResizeObserver=class{observe(){}disconnect(){}};w.CSS={escape:x=>x};w.navigator.sendBeacon=()=>true;
const user={uid:'u1',id:'u1',username:'bralis',displayName:'Miguel',email:'test@example.com'};
if(scenario!=='guest-profile')w.localStorage.setItem('be_local_session_v2',JSON.stringify({email:user.email}));
w.localStorage.setItem('be_local_database_v2',JSON.stringify({version:2,accounts:{[user.email]:user},collections:{users:{u1:user,other:{uid:'other',username:'other',displayName:'Outro perfil'}}}}));
const original=w.document.head.appendChild.bind(w.document.head);const loaded=[];let failChunk=scenario==='chunk-retry';
w.document.head.appendChild=node=>{
  if(node.tagName==='SCRIPT'&&/chunks\/(account|community)\.js/.test(node.src)){
    const name=node.src.match(/chunks\/(\w+)\.js/)[1];loaded.push(name);
    setTimeout(()=>{
      if(failChunk){failChunk=false;node.onerror?.();return;}
      try{w.eval(fs.readFileSync('_static/chunks/'+name+'.js','utf8'));node.onload?.();}catch(error){errors.push(error);node.onerror?.();}
    },0);return node;
  }
  return original(node);
};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(test){for(let i=0;i<100;i++){if(test())return;await delay(20);}throw new Error('UI did not settle: '+scenario+' '+w.document.body.className);}
(async()=>{
  for(const name of ['locale','performance','features','site'])w.eval(fs.readFileSync('_static/chunks/'+name+'.js','utf8'));
  await delay(150);
  if(scenario!=='guest-profile')assert.deepEqual(loaded,[],'home must not download area code before interaction/idle sync');
  if(['profile','mobile-profile','chunk-retry','history'].includes(scenario)){
    if(scenario==='history'){w.scrollY=680;w.document.getElementById('homeSearchInput').value='ocean';}
    w.document.querySelector('[data-public-action="profile"]').click();
    if(scenario==='chunk-retry'){
      await until(()=>w.document.getElementById('featureLoadStatus')?.textContent.includes('Tentar novamente'));
      w.document.querySelector('#featureLoadStatus button').click();
    }
    await until(()=>w.document.getElementById('profilePageName').textContent==='Miguel');
    assert.equal(w.document.getElementById('profilePage').hidden,false);
    assert.equal(w.location.pathname,'/@bralis');
    assert.equal(loaded.filter(x=>x==='account').length,scenario==='chunk-retry'?2:1);
    let mutations=0;const observer=new w.MutationObserver(records=>{mutations+=records.length;});observer.observe(w.document.body,{attributes:true,attributeFilter:['class']});
    await delay(180);assert(mutations<30,'profile must not continuously mutate body classes');observer.disconnect();
    if(scenario==='history'){
      w.history.back();await until(()=>w.location.pathname==='/');await delay(400);
      assert.equal(w.scrollY,680);assert.equal(w.document.getElementById('homeSearchInput').value,'ocean');
    }
  }
  if(scenario==='guest-profile'){
    await until(()=>w.document.getElementById('profilePageName').textContent==='Outro perfil');
    assert(w.document.body.classList.contains('profile-viewer-guest'));
    assert.equal(w.document.getElementById('profilePage').hidden,false);
  }
  if(scenario==='community'){
    let fail=true,calls=0;
    Object.defineProperty(w.beBackend,'client',{get:()=>({rpc:async()=>{calls++;if(fail)throw new Error('offline');return {data:{}};}})});
    w.dispatchEvent(new w.CustomEvent('be:open-community'));
    await until(()=>w.document.getElementById('communityLoadError'));
    fail=false;w.document.getElementById('communityLoadError').click();
    await until(()=>!w.document.getElementById('communityLoadError'));await delay(30);
    assert.equal(calls,2);assert(w.document.body.classList.contains('community-page-active'));assert(loaded.includes('community'));
  }
  if(scenario==='settings'){
    w.document.querySelector('[data-public-action="settings"]').click();
    await until(()=>w.document.getElementById('settingsPage').dataset.renderReady==='true');
    assert.equal(w.document.getElementById('settingsPage').hidden,false);
    assert(loaded.includes('account'));assert(loaded.includes('community'));
  }
  if(scenario==='search'){
    let calls=0;
    Object.defineProperty(w.beBackend,'client',{get:()=>({rpc:async()=>{calls++;return {data:[{username:'bralis'}]};}})});
    const input=w.document.getElementById('homeSearchInput');
    function query(value){input.value=value;input.dispatchEvent(new w.Event('input',{bubbles:true}));}
    query('@b');query('@br');query('@bralis');await delay(380);assert.equal(calls,1);
    query('@other');await delay(380);assert.equal(calls,2);
    query('@bralis');await delay(380);assert.equal(calls,2,'repeat search must use the cache');
  }
  if(scenario==='images'){
    w.devicePixelRatio=3;w.innerWidth=390;
    w.document.documentElement.classList.add('performance-lite');
    assert.equal(new URL(w.beMediaUrl('/api/media?c=videos&id=abc&f=imageUrl',320),w.location.origin).searchParams.get('w'),'320');
    w.document.documentElement.classList.remove('performance-lite');
    assert.equal(new URL(w.beMediaUrl('/api/media?c=videos&id=abc&f=imageUrl',320),w.location.origin).searchParams.get('w'),'640');
    assert.equal(w.beMediaUrl('/_static/media/logo.svg'), '/_static/media/logo.svg');
  }
  assert.deepEqual(errors,[]);console.log('PASS real DOM: '+scenario);dom.window.close();
})().catch(error=>{console.error(error);dom.window.close();process.exitCode=1;});

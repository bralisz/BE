'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const site=fs.readFileSync('assets/js/site.js','utf8');
const server=fs.readFileSync('server/api-routes/public-data.js','utf8');
const analytics=html.match(/<script>\s*(\(function\(\)\{\s*window\.va=[\s\S]*?)<\/script>/)[1];
for(const idle of [false,true]){
 const events={},scheduled=[],scripts=[];
 const window={setTimeout:fn=>scheduled.push(fn)};
 if(idle)window.requestIdleCallback=(fn,options)=>{assert.equal(options.timeout,2000);scheduled.push(fn)};
 const document={readyState:'loading',addEventListener:(name,fn)=>events[name]=fn,createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}};
 vm.runInNewContext(analytics,{window,document});
 assert.equal(scripts.length,0);assert.equal(typeof window.va,'function');
 window.va('test');assert.equal(window.vaq.length,1);
 events.DOMContentLoaded();scheduled[0]();scheduled[0]();
 assert.equal(scripts.length,1);assert.equal(scripts[0].async,true);assert.equal(scripts[0].src,'/_vercel/insights/script.js');
}
const early=site.slice(site.indexOf('  // Start the shared public request'),site.indexOf('})();',site.indexOf('  // Start the shared public request')));
for(const [mode,hash,expected] of [['supabase','',1],['supabase','#/admin',0],['local','',0]]){
 let calls=0;vm.runInNewContext(early,{MODE:mode,location:{hash},preloadPublicHomeData:()=>{calls++;return Promise.resolve()}});assert.equal(calls,expected);
}
(async()=>{
 const start=server.indexOf('  const [entries, settingsRows, versions] = await Promise.all(');
 const end=server.indexOf('\nasync function fetchHomeBootstrap(',start);
 const calls=[],pending=[];
 const ctx={HOME_BOOTSTRAP_COLLECTIONS:['videos','movies'],fetchRows:(name)=>{calls.push(name);return new Promise(resolve=>pending.push(()=>resolve([{id:name}])));},fetchHomeVersions:()=>{calls.push('versions');return Promise.resolve({catalogVersion:'v1'})}};
 vm.createContext(ctx);vm.runInContext('async function run(locale){'+server.slice(start,end),ctx);
 const result=ctx.run('pt-br');
 assert.deepEqual(calls,['videos','movies','settings','versions'],'all independent fallback reads start before waiting');
 pending.forEach(resolve=>resolve());const data=await result;
 assert.equal(data.settings.site.id,'settings');assert.equal(data.videos[0].id,'videos');assert.equal(data.__versions.catalogVersion,'v1');
 console.log('PASS early data start, concurrent fallback, nonblocking Analytics and single script injection');
})().catch(error=>{console.error(error);process.exitCode=1});

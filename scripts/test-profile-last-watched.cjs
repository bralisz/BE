'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('assets/js/profile-activity.js','utf8');
let owner={uid:'u1',username:'miguel'},calls=[],pending=[],refreshes=0;
const cache=new Map([['miguel|u1',{}],['other|u1',{}]]);
const context={URL,location:{origin:'https://billieilishtv.site'},user:()=>owner,cleanUrl:v=>v,
 lastPlay:null,profileState:()=>({key:'other|u1'}),remember:(key,value)=>cache.set(key,{value,time:Date.now()}),window:{beBackend:{ready:Promise.resolve()}},cache,request:0,watchWrites:Promise.resolve(),
 client:()=>({rpc:(name,args)=>{calls.push(args);return new Promise(resolve=>pending.push(resolve));}}),
 scheduleRefresh:()=>refreshes++};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf(' function recordFromPlay('),source.indexOf(' function boot(){')),context);
const flush=()=>new Promise(setImmediate);
function click(title,extra={},href='https://video.example/watch'){
 const dataset={title,itemId:title,collection:'videos',...extra};
 context.recordFromPlay({target:{closest:()=>({dataset,getAttribute:name=>name==='href'?href:null})}});
 return dataset;
}
(async()=>{
 click('not-played',{seriesEpisodeMode:'episodes'});
 click('placeholder',{},'#');
 await flush();assert.equal(calls.length,0,'opening episode list or placeholder is not playback');
 const first=click('First episode',{collection:'series'});
 first.title='Restored series title';first.collection='movies';
 click('Latest video');
 await flush();assert.equal(calls.length,1,'writes must execute in playback order');
 assert.equal(calls[0].p_title,'First episode');assert.equal(calls[0].p_collection,'series');
 pending.shift()({data:true,error:null});await flush();
 assert.equal(calls.length,2);assert.equal(calls[1].p_title,'Latest video');
 pending.shift()({data:true,error:null});await context.watchWrites;
 assert.equal(cache.get('miguel|u1').value.title,'Latest video','update owner activity even while viewing another profile');
 assert(cache.has('other|u1'),'retain unrelated profile cache');assert.equal(refreshes,2);
 click('Failed video');await flush();pending.shift()({data:false,error:null});await context.watchWrites;
 assert(!cache.has('miguel|u1'),'failed recording must not stay cached as confirmed');
 click('Next video');await flush();pending.shift()({data:true,error:null});await context.watchWrites;
 assert.equal(calls.at(-1).p_title,'Next video','queue recovers after failed recording');
 click('Happier Than Ever',{itemId:'album:album-123',collection:'albums',imageUrl:'https://example.org/album.jpg'});
 await flush();pending.shift()({data:true});await context.watchWrites;
 assert.equal(calls.at(-1).p_content_id,'album:album-123');
 assert.equal(calls.at(-1).p_collection,'albums','album is not mistaken for video');
 click('Guess featuring Billie Eilish',{itemId:'album:single-456',collection:'singles'});
 await flush();pending.shift()({data:true});await context.watchWrites;
 assert.equal(calls.at(-1).p_collection,'singles');
 console.log('PASS last watched: playback filtering, episode snapshots, ordered saves, owner cache and failures');
})().catch(error=>{console.error(error);process.exitCode=1});

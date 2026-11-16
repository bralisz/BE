'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('assets/js/profile-activity.js','utf8');
const item={title:'Swarm',content_id:'12345678',watched_at:'2026-11-15'};
let state={handle:'miguel',active:true,key:'miguel|guest'},resolve;
const card={hidden:false};
const cache=new Map();
const context={cache,TTL:0,cacheKey:state=>state.key,remember:(key,value)=>cache.set(key,{value,time:Date.now()}),watchWrites:Promise.resolve(),card,displayed:item,displayedKey:state.key,renderedKey:'loaded',request:0,
 attach(){},close(){card.hidden=true;},renderCard(){},profileState:()=>state,user:()=>null,
 client:()=>({rpc:()=>new Promise(r=>{resolve=r;})}),window:{beBackend:{ready:Promise.resolve()}}};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf(' async function refreshProfile(){'),source.indexOf(' function scheduleRefresh(){')),context);
(async()=>{
 let pending=context.refreshProfile();await new Promise(setImmediate);
 assert.equal(card.hidden,false,'same-profile refresh must not hide loaded content');
 resolve({error:{message:'offline'}});await pending;assert.equal(card.hidden,false);
 state={...state,active:false};await context.refreshProfile();assert(card.hidden);
 state={...state,active:true};pending=context.refreshProfile();await new Promise(setImmediate);assert.equal(card.hidden,false,'Back restores the existing card immediately');
 resolve({data:item});await pending;
 pending=context.refreshProfile();await new Promise(setImmediate);const oldResolve=resolve;
 state={handle:'other',active:true,key:'other|guest'};const other=context.refreshProfile();await new Promise(setImmediate);assert(card.hidden,'never display another profile activity');
 oldResolve({data:item});await pending;assert(card.hidden,'late prior response must be ignored');
 resolve({data:{...item,title:'Other'}});await other;assert.equal(card.hidden,false);
 pending=context.refreshProfile();await new Promise(setImmediate);resolve({data:null});await pending;assert(card.hidden,'privacy/null response removes old activity');
 let observer;let scheduled=0;
 const observerContext={JSON,profileState:()=>state,scheduleRefresh:()=>scheduled++,document:{body:{}},$:()=>null,window:{addEventListener(){}},MutationObserver:class{constructor(fn){observer=fn}observe(){}}};
 vm.createContext(observerContext);
 vm.runInContext(source.slice(source.indexOf('  let previousState='),source.indexOf('  window.beBackend?.auth?.onChange')),observerContext);
 observer();observer();assert.equal(scheduled,0,'unrelated scroll classes must not refetch');
 state={...state,active:false};observer();assert.equal(scheduled,1);
 console.log('PASS profile activity: scroll filtering, stable refresh, Back, errors, privacy and stale responses');
})().catch(error=>{console.error(error);process.exitCode=1;});

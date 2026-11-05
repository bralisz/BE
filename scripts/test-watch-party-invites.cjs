'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function scenario({access=false,accept=true,failed=false}={}){
 const dom=new JSDOM('<body><button id="contentDetailPlay" data-media-player-trigger="true" data-item-id="123456"></button><div id="notificationList"></div></body>',{url:'https://billieilishtv.site/pt-br/123456'});
 const w=dom.window,d=w.document;d.body.classList.add('detail-page-active');
 let checks=0,responses=0,opened=0,redirect='';
 const invite={id:'invite-1',room_id:'12345678-1234-4234-8234-123456789abc',video_id:'123456',host_label:'Host',video_title:'Video'};
 const query={select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return Promise.resolve({data:[],error:null});}};
 const ch={on(){return this;},subscribe(){},presenceState(){return {};}};
 w.beBackend={ready:Promise.resolve(),auth:{currentUser:{uid:'guest'},onChange(){}},client:{from(){return query;},channel(){return ch;},async rpc(name){
  if(name==='has_watch_party_access'){checks++;return {data:access,error:failed?{message:'offline'}:null};}
  if(name==='respond_watch_party_invite'){responses++;return {data:[invite],error:null};}
  throw Error(name);
 }}};
 w.BETVWatchPartyPaywall={async refresh(){return access;},open(){opened++;},isUnlocked(){return access;}};
 const source=fs.readFileSync('assets/js/watch-party.js','utf8').replace('Object.freeze({open:showPanel})','Object.freeze({open:showPanel,respond,updateUi,setHost:()=>{joined=true;isHost=true;room="12345678-1234-4234-8234-123456789abc";}})');
 vm.runInNewContext(source,{window:w,document:d,URL,location:{href:w.location.href,origin:w.location.origin,assign(url){redirect=url;}},history:{replaceState(){}},MutationObserver:w.MutationObserver,CustomEvent:w.CustomEvent,setInterval(){},setTimeout(){},clearInterval(){},clearTimeout(){},queueMicrotask,navigator:{}});
 d.dispatchEvent(new w.Event('DOMContentLoaded'));await flush();
 assert.equal(d.getElementById('watchPartyRoomCodeBox'),null);
 assert.equal(d.getElementById('watchPartyGiftOpen'),null);
 w.BETVWatchParty.setHost();w.BETVWatchParty.updateUi();
 assert.equal(d.getElementById('watchPartyInviteToggle').hidden,false);
 assert.equal(d.getElementById('watchPartyInviteToggle').textContent,'Convide um amigo');
 const actions=d.createElement('div');actions.innerHTML='<button>Accept</button><button>Decline</button>';
 await w.BETVWatchParty.respond(invite,accept,actions);
 assert.equal(responses,accept&&(!access||failed)?0:1);
 assert.equal(opened,accept&&!access&&!failed?1:0);
 assert.equal(checks,accept?1:0);
 if(accept&&access&&!failed)assert.match(redirect,/watchParty=12345678/);
 if(accept&&(!access||failed))assert.ok([...actions.children].every(b=>!b.disabled));
 dom.window.close();
}
(async()=>{
 await scenario();await scenario({access:true});await scenario({accept:false});await scenario({failed:true});
 for(const locale of ['pt-br','en-us','es','fr','it']){
  const dom=new JSDOM('<body></body>',{url:'https://billieilishtv.site/'}),w=dom.window;
  w.BETVLocale={slug:locale};w.beBackend={auth:{currentUser:{uid:'guest'}}};
  const source=fs.readFileSync('assets/js/watch-party-paywall.js','utf8');
  vm.runInNewContext(source,{window:w,document:w.document,URL,Intl,location:w.location,localStorage:w.localStorage,MutationObserver:w.MutationObserver,clearTimeout(){},clearInterval(){},setInterval(){},setTimeout(){},queueMicrotask});
  w.BETVWatchPartyPaywall.open();
  assert.equal(w.document.getElementById('watchPartyGiftSection').hidden,true);
  assert.ok(w.document.getElementById('watchPartyPlusTitle').textContent);
  if(locale==='pt-br')assert.equal(w.document.getElementById('watchPartyPlusTitle').textContent,'Assista em conjunto');
  assert.doesNotMatch(w.document.getElementById('watchPartyPlusInfo').textContent,/sem pagar|at no extra cost|gratis|gratuitement/i);
  dom.window.close();
 }
 console.log('Watch Together: paid/unpaid acceptance, decline, network failure, invitation CTA and five purchase locales passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});

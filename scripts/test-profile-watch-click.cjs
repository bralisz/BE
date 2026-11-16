'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const source=fs.readFileSync('assets/js/profile-activity.js','utf8');
(async()=>{
 const dom=new JSDOM('<body class="profile-page-active"><section id="profilePage"><span id="profilePageHandle">@miguel</span><div class="profile-page-hero"></div><div id="profileFavoritesSection"></div></section><a id="contentDetailPlay" href="https://drive.google.com/file/d/test/view" data-title="New film" data-item-id="12345678" data-collection="movies" data-image-url="https://example.org/cover.jpg">Assistir</a></body>',{url:'https://billieilishtv.site',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.matchMedia=()=>({matches:true});let writes=0,reads=0,complete,playerClicks=0;
 w.beBackend={ready:Promise.resolve(),auth:{currentUser:{uid:'u1',username:'miguel'}},client:{
  from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>{reads++;return {data:{content_id:'old',title:'Swarm',collection:'series',watched_at:'2026-01-01'}};}})})}),
  rpc:()=>{writes++;return new Promise(resolve=>complete=resolve)}
 }};
 // Match the existing Drive/YouTube handlers registered before activity boot.
 w.document.addEventListener('click',event=>{playerClicks++;event.preventDefault();event.stopImmediatePropagation();},true);
 try{
  w.eval(source);w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  await new Promise(setImmediate);
  assert.equal(w.document.querySelector('.profile-recent-watch-title').textContent,'Swarm');
  const initialReads=reads;
  w.document.getElementById('contentDetailPlay').click();
  w.document.getElementById('contentDetailPlay').click();
  await new Promise(setImmediate);
  assert.equal(playerClicks,2);assert.equal(writes,1,'duplicate click must not duplicate writes');
  assert.equal(reads,initialReads,'no read after playback');
  const card=w.document.getElementById('profileRecentWatchCard');
  assert.equal(card.querySelector('.profile-recent-watch-title').textContent,'New film','update before server resolves');
  assert.equal(card.querySelector('.profile-recent-watch-tag').textContent,'Filme');
  assert(card.querySelector('img'));assert(!card.querySelector('.profile-recent-watch-head'));
  complete({data:true});await new Promise(setImmediate);
  w.BETVProfileActivity.refresh();await new Promise(setImmediate);
  assert.equal(reads,initialReads,'confirmed entry should stay cached');
  console.log('PASS real click propagation, instant card, minimal content and duplicate-write prevention');
 }finally{w.close()}
})().catch(error=>{console.error(error);process.exitCode=1});

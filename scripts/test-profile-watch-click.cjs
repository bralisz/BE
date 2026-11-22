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
  w.eval(fs.readFileSync('assets/js/album-routes.js','utf8'));
  const albums=[{id:'abc-123',title:'HIT ME HARD AND SOFT'},{id:'xyz',title:'Hit Me Hard & Soft'}];
  w.BETVAlbumRoutes.update(albums);
  assert.equal(w.BETVAlbumRoutes.resolve('abc-123',albums),albums[0]);
  assert.equal(w.BETVAlbumRoutes.resolve('hit-me-hard-and-soft',albums),albums[0]);
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
  for(const [slug,label] of [['pt-br','Assistiu por último'],['en-us','Last watched'],['es','Último contenido visto'],['fr','Dernier visionnage'],['it','Ultimo contenuto visto']]){
   w.BETVLocale={slug};w.dispatchEvent(new w.Event('be:i18n-ready'));
   assert.equal(card.firstElementChild.textContent,label);
   assert.equal(card.firstElementChild.tagName,'H2');
  }
  complete({data:true});await new Promise(setImmediate);
  w.BETVProfileActivity.refresh();await new Promise(setImmediate);
  assert.equal(reads,initialReads,'confirmed entry should stay cached');
  const album=w.document.createElement('a');
  album.id='albumDetailPlayer';
  album.href='https://example.org/listen';
  album.dataset.itemId='album:abc-123';
  album.dataset.title='HIT ME HARD AND SOFT';
  album.dataset.collection='albums';
  album.dataset.imageUrl='https://example.org/cover-album.jpg';
  w.document.body.append(album);
  album.click();await new Promise(setImmediate);
  assert.equal(writes,2,'album Play triggers history');
  assert.equal(card.querySelector('.profile-recent-watch-tag').textContent,'Album');
  assert.equal(card.querySelector('.profile-recent-watch-title').textContent,'HIT ME HARD AND SOFT');
  assert(card.querySelector('.profile-recent-watch-media').href.endsWith('/albuns/hit-me-hard-and-soft'));
  complete({data:true});await new Promise(setImmediate);
  console.log('PASS video and album Play, last-watched cover/tag/route, duplicate prevention');
 }finally{w.close()}
})().catch(error=>{console.error(error);process.exitCode=1});

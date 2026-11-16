/* BETV profile watch activity: server-backed, opt-out and public-view privacy. */
(()=>{
 'use strict';
 if(window.BETVProfileActivity)return;
 const $=id=>document.getElementById(id);
 const client=()=>window.beBackend?.client;
 const user=()=>window.beBackend?.auth?.currentUser;
 const locale=()=>String(window.BETVLocale?.slug||'pt-br').toLowerCase();
 const words={
  'pt-br':['Último conteúdo assistido','Privacidade','Mostrar meu último filme ou vídeo assistido','Outras pessoas poderão ver seu último conteúdo assistido no perfil. Desative para manter isso privado.','Salvando…','Preferência salva.','Não foi possível salvar sua preferência.','Filme','Série','Vídeo','Assistiu por último'],
  'en-us':['Last watched','Privacy','Show my last watched movie or video','Others can see your last watched content on your profile. Turn this off to keep it private.','Saving…','Preference saved.','Could not save your preference.','Movie','Series','Video','Last watched'],
  es:['Último contenido visto','Privacidad','Mostrar mi última película o vídeo visto','Otras personas podrán ver el último contenido que viste en tu perfil. Desactívalo para mantenerlo privado.','Guardando…','Preferencia guardada.','No se pudo guardar.','Película','Serie','Vídeo','Último contenido visto'],
  fr:['Dernier contenu regardé','Confidentialité','Afficher mon dernier film ou ma dernière vidéo','Les autres peuvent voir le dernier contenu regardé sur votre profil. Désactivez pour garder cette activité privée.','Enregistrement…','Préférence enregistrée.','Enregistrement impossible.','Film','Série','Vidéo','Dernier visionnage'],
  it:['Ultimo contenuto visto','Privacy','Mostra il mio ultimo film o video visto','Gli altri possono vedere il tuo ultimo contenuto visto sul profilo. Disattiva per mantenere privata l’attività.','Salvataggio…','Preferenza salvata.','Impossibile salvare.','Film','Serie','Video','Ultimo contenuto visto']
 };
 const t=i=>(words[locale()]||words['pt-br'])[i];
 let card=null,displayed=null,request=0,queued=false,settingsRequest=0,displayedKey='',renderedKey='';
 const cache=new Map(),TTL=90000;
 let watchWrites=Promise.resolve();
 let lastPlay=null;
 const cacheKey=state=>state.key;
 function remember(key,value){cache.delete(key);cache.set(key,{value,time:Date.now()});if(cache.size>80)cache.delete(cache.keys().next().value);}
 const cleanUrl=value=>{try{const url=new URL(String(value||''),location.origin);return url.protocol==='https:'&&url.origin===location.origin||url.protocol==='https:'&&!url.username&&!url.password?url.href:'';}catch(_){return '';}};
 function close(){if(card)card.hidden=true;}
 function attach(){
  const favorites=$('profileFavoritesSection');
  const hero=document.querySelector('#profilePage .profile-page-hero');
  if(!favorites)return;
  const desktop=window.matchMedia('(min-width:761px)').matches&&Boolean(hero);
  const parent=desktop?hero:favorites.parentElement;
  if(!card||!card.isConnected){
   card=document.createElement('section');card.id='profileRecentWatchCard';card.className='profile-recent-watch-card';
   card.hidden=true;renderedKey='';card.setAttribute('aria-label',t(0));
  }
  card.setAttribute('aria-label',t(0));
  if(desktop){
   if(card.parentElement!==parent)parent.appendChild(card);
  }else if(card.nextElementSibling!==favorites||card.parentElement!==parent){
   favorites.before(card);
  }
 }
 function renderCard(item){
  if(!card)return;
  const signature=JSON.stringify([locale(),item.content_id,item.title,item.collection,item.image_url]);
  if(renderedKey===signature)return;
  renderedKey=signature;
  card.replaceChildren();
  const heading=document.createElement('h2');heading.className='profile-recent-watch-heading';heading.textContent=t(10);
  const body=document.createElement('div');body.className='profile-recent-watch-body';
  const id=String(item.content_id||'').trim();
  const media=document.createElement(id?'a':'div');media.className='profile-recent-watch-media';
  if(id){
   media.href=/^\d{6,12}$/.test(id)?'/'+locale()+'/'+encodeURIComponent(id):'/'+locale()+'/#/video/'+encodeURIComponent(id);
   media.setAttribute('aria-label',String(item.title||'').slice(0,180));
  }
  const image=cleanUrl(item.image_url);
  if(image){
   const cover=document.createElement('img');cover.className='profile-recent-watch-cover';
   cover.src=image;cover.loading='lazy';cover.alt='';cover.referrerPolicy='no-referrer';
   media.append(cover);
  }
  const info=document.createElement('div');info.className='profile-recent-watch-info';
  const title=document.createElement('strong');title.className='profile-recent-watch-title notranslate';title.setAttribute('translate','no');title.textContent=String(item.title||'').slice(0,180);
  const tag=document.createElement('span');tag.className='profile-recent-watch-tag';tag.textContent=item.collection==='movies'?t(7):item.collection==='series'?t(8):t(9);
  info.append(title,tag);body.append(media,info);card.append(heading,body);
 }
 function profileState(){
  const handle=String($('profilePageHandle')?.textContent||'').trim().replace(/^@/,'');
  const active=Boolean(document.body.classList.contains('profile-page-active')&&handle&&$('profilePage')?.hidden===false);
  return {handle,active,key:handle.toLowerCase()+'|'+String(user()?.uid||'guest')};
 }
 async function refreshProfile(){
  attach();
  const state=profileState(),serial=++request;
  if(state.key!==displayedKey){displayedKey=state.key;displayed=cache.get(cacheKey(state))?.value||null;renderedKey='';if(!displayed)close();}
  if(!state.active){close();return;}
  // Keep the current profile visible while revalidating, including Back navigation.
  if(displayed&&card){renderCard(displayed);card.hidden=false;}
  const saved=cache.get(cacheKey(state));
  if(saved&&Date.now()-saved.time<TTL)return;
  try{
   await Promise.resolve(window.beBackend?.ready);
   if(serial!==request||profileState().key!==state.key)return;
   const owner=user(),own=Boolean(owner&&String(owner.username||'').toLowerCase()===state.handle.toLowerCase());
   let result;
   if(own){
    await watchWrites;
    if(serial!==request||user()?.uid!==owner.uid)return;
    result=await client()?.from('profile_watch_activity').select('content_id,title,collection,image_url,watched_at').eq('user_id',owner.uid).maybeSingle();
   }
   else result=await client()?.rpc('get_public_last_watch',{p_username:state.handle});
   const current=profileState();
   if(serial!==request||current.key!==state.key||!current.active)return;
   // A transient network error must not collapse an already loaded card.
   if(!result||result.error)return;
   const value=Array.isArray(result.data)?result.data[0]:result.data;
   displayed=value?.watched_at&&value?.title?value:null;
   remember(cacheKey(state),displayed);
   if(displayed&&card){renderCard(displayed);card.hidden=false;}
   else{renderedKey='';close();}
  }catch(_){/* Retain only the current profile's previously loaded activity. */}
 }
 function scheduleRefresh(){
  if(queued)return;queued=true;
  queueMicrotask(()=>{queued=false;refreshProfile();});
 }
 function injectSettings(){
  const panel=document.querySelector('#settingsPageBody [data-settings-panel="data"]');
  if(!panel||!user()?.uid||panel.querySelector('#profileWatchPrivacy'))return;
  const section=document.createElement('section');
  section.id='profileWatchPrivacy';section.className='settings-panel-card profile-watch-privacy';
  section.innerHTML='<h2></h2><label class="profile-watch-privacy-row"><span class="profile-watch-privacy-copy"><strong></strong><small></small></span><span class="community-privacy-switch"><input type="checkbox" id="profileWatchVisibility" checked><i aria-hidden="true"></i></span></label><p class="profile-watch-privacy-feedback" role="status" aria-live="polite"></p>';
  section.querySelector('h2').textContent=t(1);
  section.querySelector('strong').textContent=t(2);
  section.querySelector('small').textContent=t(3);
  const input=section.querySelector('input'),notice=section.querySelector('.profile-watch-privacy-feedback');
  const exportControls=panel.querySelector('.settings-data-status')||panel.querySelector('.settings-data-actions');
  if(exportControls)exportControls.insertAdjacentElement('afterend',section);
  else panel.insertBefore(section,panel.querySelector('.community-privacy-card'));

  const current=user().uid,serial=++settingsRequest;
  Promise.resolve(window.beBackend?.ready).then(async()=>{
   const result=await client()?.from('profile_watch_activity').select('public_visible').eq('user_id',current).maybeSingle();
   if(serial!==settingsRequest||!section.isConnected)return;
   if(!result?.error)input.checked=result?.data?.public_visible!==false;
  }).catch(()=>{});
  input.addEventListener('change',async()=>{
   const enabled=input.checked;input.disabled=true;notice.textContent=t(4);
   try{
    const {data,error}=await client().rpc('set_profile_watch_visibility',{p_visible:enabled});
    if(error||data!==true)throw Error('privacy_save_failed');
    notice.textContent=t(5);
    cache.delete(profileState().key);scheduleRefresh();
   }catch(_){input.checked=!enabled;notice.textContent=t(6);}
   finally{input.disabled=false;}
  });
 }
 function recordFromPlay(event){
  const play=event.target?.closest?.('#contentDetailPlay');
  if(!play||!user()?.uid||play.getAttribute('aria-disabled')==='true'||!play.getAttribute('href'))return;
  // Snapshot the clicked content: episode playback temporarily changes this dataset.
  const d={...play.dataset};
  const href=String(play.getAttribute('href')||'').trim();
  if(d.seriesEpisodeMode||!href||href.startsWith('#'))return;
  try{if(!['http:','https:'].includes(new URL(href,location.origin).protocol))return;}catch(_){return;}
  const title=String(d.title||'').trim(),contentId=String(d.itemId||d.recordId||'').trim();
  if(!title||!contentId)return;
  const img=cleanUrl(d.imageUrl||d.bannerUrl||'');
  const current=user()?.uid;
  const ownerKey=String(user()?.username||'').toLowerCase()+'|'+current;
  const now=Date.now();
  const signature=JSON.stringify([current,contentId,title,d.collection,href]);
  if(lastPlay?.signature===signature&&now-lastPlay.time<1500)return;
  const activity={content_id:contentId,title,collection:String(d.collection||'videos'),image_url:img,watched_at:new Date(now).toISOString()};
  lastPlay={signature,time:now};
  // Update the owner's card immediately without reading the database again.
  remember(ownerKey,activity);
  request++;
  if(profileState().key===ownerKey){displayed=activity;displayedKey=ownerKey;}
  scheduleRefresh();
  // Preserve playback order even when an earlier network write is slow.
  watchWrites=watchWrites.catch(()=>{}).then(async()=>{
   await Promise.resolve(window.beBackend?.ready);
   if(!client()||user()?.uid!==current)return;
   const {data,error}=await client().rpc('record_profile_watch',{
    p_content_id:contentId.slice(0,128),p_title:title.slice(0,180),
    p_collection:String(d.collection||'videos'),p_image_url:img
   });
   if(error||data!==true)throw Error('watch_save_failed');
  }).catch(()=>{
   // Do not treat an unsaved optimistic entry as a confirmed server result.
   if(cache.get(ownerKey)?.value===activity)cache.delete(ownerKey);
  });
 }
 function boot(){
  attach();injectSettings();
  // Window capture runs before document player handlers stop propagation.
  window.addEventListener('click',recordFromPlay,true);
  window.addEventListener('be:open-profile-route',scheduleRefresh);
  window.addEventListener('be:route-change',scheduleRefresh);
  window.addEventListener('be:profile-refreshed',()=>{cache.delete(profileState().key);scheduleRefresh();});
  window.addEventListener('be:i18n-ready',()=>{attach();if(displayed)renderCard(displayed);injectSettings();});
  const handle=$('profilePageHandle');if(handle)new MutationObserver(scheduleRefresh).observe(handle,{childList:true,characterData:true,subtree:true});
  new MutationObserver(()=>{injectSettings();}).observe($('settingsPageBody')||document.body,{childList:true,subtree:false});
  let previousState=JSON.stringify(profileState());
  const refreshWhenProfileChanges=()=>{
   const nextState=JSON.stringify(profileState());
   if(nextState===previousState)return;
   previousState=nextState;scheduleRefresh();
  };
  new MutationObserver(refreshWhenProfileChanges).observe(document.body,{attributes:true,attributeFilter:['class']});
  const profile=$('profilePage');
  if(profile)new MutationObserver(refreshWhenProfileChanges).observe(profile,{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('pageshow',scheduleRefresh);
  window.addEventListener('resize',scheduleRefresh);
  window.beBackend?.auth?.onChange?.(()=>{settingsRequest++;lastPlay=null;cache.clear();scheduleRefresh();injectSettings();});
  scheduleRefresh();
 }
 window.BETVProfileActivity=Object.freeze({refresh:scheduleRefresh});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

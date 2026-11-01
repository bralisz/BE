/* BETV profile watch activity: server-backed, opt-out and public-view privacy. */
(()=>{
 'use strict';
 if(window.BETVProfileActivity)return;
 const $=id=>document.getElementById(id);
 const client=()=>window.beBackend?.client;
 const user=()=>window.beBackend?.auth?.currentUser;
 const locale=()=>String(window.BETVLocale?.slug||'pt-br').toLowerCase();
 const words={
  'pt-br':['Último conteúdo assistido','Privacidade','Mostrar meu último filme ou vídeo assistido','Outras pessoas poderão abrir um card discreto no seu perfil. Desative para manter isso privado.','Salvando…','Preferência salva.','Não foi possível salvar sua preferência.','Filme','Série','Vídeo','Assistiu por último'],
  'en-us':['Last watched','Privacy','Show my last watched movie or video','Others can open a small card on your profile. Turn this off to keep it private.','Saving…','Preference saved.','Could not save your preference.','Movie','Series','Video','Last watched'],
  es:['Último contenido visto','Privacidad','Mostrar mi última película o vídeo visto','Otras personas podrán abrir una tarjeta discreta en tu perfil. Desactívalo para mantenerlo privado.','Guardando…','Preferencia guardada.','No se pudo guardar.','Película','Serie','Vídeo','Visto por última vez'],
  fr:['Dernier contenu regardé','Confidentialité','Afficher mon dernier film ou ma dernière vidéo','Les autres peuvent ouvrir une petite carte sur votre profil. Désactivez pour garder cette activité privée.','Enregistrement…','Préférence enregistrée.','Enregistrement impossible.','Film','Série','Vidéo','Dernier visionnage'],
  it:['Ultimo contenuto visto','Privacy','Mostra il mio ultimo film o video visto','Gli altri possono aprire una scheda sul tuo profilo. Disattiva per mantenere privata l’attività.','Salvataggio…','Preferenza salvata.','Impossibile salvare.','Film','Serie','Video','Ultima visualizzazione']
 };
 const t=i=>(words[locale()]||words['pt-br'])[i];
 let trigger=null,card=null,displayed=null,request=0,queued=false,settingsRequest=0;
 const cleanUrl=value=>{try{const url=new URL(String(value||''),location.origin);return url.protocol==='https:'&&url.origin===location.origin||url.protocol==='https:'&&!url.username&&!url.password?url.href:'';}catch(_){return '';}};
 function close(){
  if(!card)return;
  card.hidden=true;
  if(trigger)trigger.setAttribute('aria-expanded','false');
 }
 function attach(){
  const row=$('profilePageName')?.closest('.profile-page-name-row');
  if(!row)return;
  if(!trigger||!row.contains(trigger)){
   trigger=document.createElement('button');
   trigger.type='button';trigger.id='profileRecentWatchButton';trigger.className='profile-recent-watch-trigger';
   trigger.hidden=true;trigger.setAttribute('aria-expanded','false');
   trigger.setAttribute('aria-label',t(0));trigger.setAttribute('title',t(0));
   trigger.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>';
   row.append(trigger);
   trigger.addEventListener('click',event=>{
    event.stopPropagation();
    if(!displayed)return;
    const willOpen=card.hidden;
    close();
    if(willOpen){renderCard(displayed);card.hidden=false;trigger.setAttribute('aria-expanded','true');}
   });
  }
  if(!card||!row.contains(card)){
   card=document.createElement('div');card.id='profileRecentWatchCard';card.className='profile-recent-watch-card';
   card.hidden=true;card.setAttribute('role','group');row.append(card);
   trigger.setAttribute('aria-controls',card.id);
  }
  trigger.setAttribute('aria-label',t(0));trigger.title=t(0);
 }
 function renderCard(item){
  if(!card)return;
  card.replaceChildren();
  const top=document.createElement('div');top.className='profile-recent-watch-head';
  const eyebrow=document.createElement('span');eyebrow.textContent=t(10);
  const tag=document.createElement('span');tag.textContent=item.collection==='movies'?t(7):item.collection==='series'?t(8):t(9);
  top.append(eyebrow,tag);
  const image=cleanUrl(item.image_url);
  if(image){
   const cover=document.createElement('img');cover.className='profile-recent-watch-cover';
   cover.src=image;cover.loading='lazy';cover.alt='';cover.referrerPolicy='no-referrer';
   card.append(cover);
  }
  const title=document.createElement('strong');title.className='profile-recent-watch-title notranslate';title.setAttribute('translate','no');title.textContent=String(item.title||'').slice(0,180);
  card.append(top,title);
 }
 async function refreshProfile(){
  attach();
  const handle=String($('profilePageHandle')?.textContent||'').trim().replace(/^@/,'');
  const active=document.body.classList.contains('profile-page-active')&&handle&&$ ('profilePage')?.hidden===false;
  const serial=++request;
  if(!active){displayed=null;if(trigger)trigger.hidden=true;close();return;}
  close();
  if(trigger)trigger.hidden=true;
  try{
   await Promise.resolve(window.beBackend?.ready);
   const owner=user(),own=Boolean(owner&&String(owner.username||'').toLowerCase()===handle.toLowerCase());
   let result;
   if(own){result=await client()?.from('profile_watch_activity').select('content_id,title,collection,image_url,watched_at').eq('user_id',owner.uid).maybeSingle();}
   else result=await client()?.rpc('get_public_last_watch',{p_username:handle});
   const value=Array.isArray(result?.data)?result.data[0]:result?.data;
   if(serial!==request||String($('profilePageHandle')?.textContent||'').trim().replace(/^@/,'')!==handle)return;
   displayed=!result?.error&&value?.watched_at&&value?.title?value:null;
   if(trigger)trigger.hidden=!displayed;
  }catch(_){if(serial===request){displayed=null;if(trigger)trigger.hidden=true;}}
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
  panel.insertBefore(section,panel.querySelector('.settings-data-actions'));
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
    scheduleRefresh();
   }catch(_){input.checked=!enabled;notice.textContent=t(6);}
   finally{input.disabled=false;}
  });
 }
 function recordFromPlay(event){
  const play=event.target?.closest?.('#contentDetailPlay');
  if(!play||!user()?.uid||play.getAttribute('aria-disabled')==='true'||!play.getAttribute('href'))return;
  const d=play.dataset;
  const title=String(d.title||'').trim(),contentId=String(d.itemId||d.recordId||'').trim();
  if(!title||!contentId)return;
  const img=cleanUrl(d.imageUrl||d.bannerUrl||'');
  const current=user()?.uid;
  Promise.resolve(window.beBackend?.ready).then(async()=>{
   if(!client()||user()?.uid!==current)return;
   const {error}=await client().rpc('record_profile_watch',{
    p_content_id:contentId.slice(0,128),p_title:title.slice(0,180),
    p_collection:String(d.collection||'videos'),p_image_url:img
   });
   if(!error)scheduleRefresh();
  }).catch(()=>{});
 }
 function boot(){
  attach();injectSettings();
  document.addEventListener('click',recordFromPlay,true);
  document.addEventListener('pointerdown',event=>{if(card&&!card.hidden&&!event.target.closest?.('#profileRecentWatchButton,#profileRecentWatchCard'))close();},true);
  window.addEventListener('scroll',close,true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  window.addEventListener('be:open-profile-route',scheduleRefresh);
  window.addEventListener('be:route-change',scheduleRefresh);
  window.addEventListener('be:profile-refreshed',scheduleRefresh);
  window.addEventListener('be:i18n-ready',()=>{attach();injectSettings();});
  const handle=$('profilePageHandle');if(handle)new MutationObserver(scheduleRefresh).observe(handle,{childList:true,characterData:true,subtree:true});
  new MutationObserver(()=>{injectSettings();}).observe($('settingsPageBody')||document.body,{childList:true,subtree:false});
  new MutationObserver(scheduleRefresh).observe(document.body,{attributes:true,attributeFilter:['class']});
  window.beBackend?.auth?.onChange?.(()=>{settingsRequest++;scheduleRefresh();injectSettings();});
  scheduleRefresh();
 }
 window.BETVProfileActivity=Object.freeze({refresh:scheduleRefresh});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

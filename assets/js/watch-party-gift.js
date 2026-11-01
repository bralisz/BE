/* BETV: dedicated, server-authorized gift sheet with one irrevocable +1 per payer. */
(() => {
 'use strict';
 if(window.BETVWatchPartyGift)return;
 const $=id=>document.getElementById(id);
 const messages={
  'pt-br':['Presentear +1 acesso','Escolha quem receberá Watch Party e a tag dourada Happier Than Ever.','Buscar @usuário','Digite pelo menos 2 letras do @usuário.','Nenhum fã encontrado.','Confirma o presente para @','Este presente permanente só pode ser enviado uma vez.','Confirmar envio','Cancelar','Acesso e tag enviados para @','Você já enviou o presente para @','Apenas quem comprou a Watch Party pode usar o benefício +1.','Não foi possível confirmar o presente.','Esta conta já tem acesso. Escolha outra.','Você já utilizou o presente +1.','Fechar','Presente enviado','Enviando…','Pesquisar fãs'],
  'en-us':['Gift +1 access','Choose who receives Watch Party and the gold Happier Than Ever badge.','Search @username','Type at least 2 characters of the @username.','No fans found.','Gift access to @','This permanent gift can only be sent once.','Confirm gift','Cancel','Access and badge sent to @','You already gifted access to @','Only paying Watch Party members can use the +1 gift.','Could not send the gift.','This account already has access. Choose another.','You have already used your +1 gift.','Close','Gift sent','Sending…','Find fans'],
  es:['Regalar +1 acceso','Elige quién recibirá Watch Party y la insignia dorada Happier Than Ever.','Buscar @usuario','Escribe al menos 2 letras del @usuario.','No se encontraron fans.','Regalar acceso a @','Este regalo permanente solo puede enviarse una vez.','Confirmar regalo','Cancelar','Acceso e insignia enviados a @','Ya regalaste el acceso a @','Solo quienes compraron Watch Party pueden regalar el acceso +1.','No se pudo enviar el regalo.','Esta cuenta ya tiene acceso. Elige otra.','Ya utilizaste el regalo +1.','Cerrar','Regalo enviado','Enviando…','Buscar fans'],
  fr:['Offrir +1 accès','Choisissez qui recevra Watch Party et le badge doré Happier Than Ever.','Chercher @pseudo','Saisissez au moins 2 caractères du @pseudo.','Aucun fan trouvé.','Offrir l’accès à @','Ce cadeau permanent ne peut être envoyé qu’une seule fois.','Confirmer le cadeau','Annuler','Accès et badge offerts à @','Vous avez déjà offert l’accès à @','Seuls les membres ayant acheté Watch Party peuvent offrir +1 accès.','Impossible d’envoyer le cadeau.','Ce compte a déjà accès. Choisissez-en un autre.','Vous avez déjà utilisé votre cadeau +1.','Fermer','Cadeau envoyé','Envoi…','Chercher des fans'],
  it:['Regala +1 accesso','Scegli chi riceverà Watch Party e il badge dorato Happier Than Ever.','Cerca @utente','Scrivi almeno 2 caratteri del nome @utente.','Nessun fan trovato.','Regala accesso a @','Questo regalo permanente può essere inviato una sola volta.','Conferma regalo','Annulla','Accesso e badge regalati a @','Hai già regalato accesso a @','Solo chi acquista Watch Party può regalare il +1.','Impossibile inviare il regalo.','Questo account ha già accesso. Scegline un altro.','Hai già usato il regalo +1.','Chiudi','Regalo inviato','Invio…','Cerca fan']
 };
 const txt=i=>(messages[String(window.BETVLocale?.slug||'pt-br').toLowerCase()]||messages['pt-br'])[i];
 const client=()=>window.beBackend?.client;
 const userid=()=>window.beBackend?.auth?.currentUser?.uid;
 const safeUrl=v=>{try{const u=new URL(String(v||'').trim());return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}};
 let modal=null, selected=null, searching=0, debounce=0, sending=false, currentStatus=null;
 function picture(src,cls){
  const img=document.createElement('img');img.className=cls;img.loading='lazy';img.decoding='async';img.alt='';img.referrerPolicy='no-referrer';
  const uri=safeUrl(src);if(uri)img.src=uri;else img.hidden=true;return img;
 }
 function card(profile,asRecipient=false){
  const outer=document.createElement('article');outer.className='watch-party-gift-profile';
  const cover=document.createElement('div');cover.className='watch-party-gift-cover';
  const banner=picture(profile.banner_url,'watch-party-gift-cover-image');if(!banner.hidden)cover.append(banner);
  const row=document.createElement('div');row.className='watch-party-gift-profile-row';
  const avatar=document.createElement('span');avatar.className='watch-party-gift-profile-avatar';
  const photo=picture(profile.avatar_url,'watch-party-gift-avatar-image');
  if(photo.hidden)avatar.textContent=String(profile.display_name||profile.username||'?').slice(0,1).toUpperCase();
  else avatar.append(photo);
  const copy=document.createElement('div');copy.className='watch-party-gift-profile-name';
  const title=document.createElement('strong');title.textContent=String(profile.display_name||profile.username||'');
  const handle=document.createElement('small');handle.textContent='@'+String(profile.username||'');
  copy.append(title,handle);row.append(avatar,copy);
  const gift=document.createElement('button');gift.type='button';gift.className='watch-party-gift-profile-send';
  gift.setAttribute('aria-label',txt(5)+profile.username);
  gift.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9C7 9 6 7 7 5c1-3 5-1 5 4Zm0 0c5 0 6-2 5-4-1-3-5-1-5 4Z"/></svg>';
  gift.disabled=asRecipient;gift.title=asRecipient?txt(16):txt(5)+profile.username;
  if(asRecipient)gift.classList.add('is-sent');
  else gift.addEventListener('click',()=>choose(profile,outer));
  row.append(gift);outer.append(cover,row);return outer;
 }
 function init(){
  if(modal)return;
  modal=document.createElement('div');modal.className='watch-party-gift-modal';modal.id='watchPartyGiftModal';modal.hidden=true;
  modal.innerHTML='<div class="watch-party-gift-backdrop"></div><section class="watch-party-gift-dialog" role="dialog" aria-modal="true" aria-labelledby="watchPartyGiftTitle">'+
   '<div class="watch-party-ios-handle"></div><header class="watch-party-gift-heading"><div><h2 id="watchPartyGiftTitle"></h2><p id="watchPartyGiftSubtitle"></p></div><button id="watchPartyGiftClose" type="button" aria-label="Close"><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></header>'+
   '<input type="search" id="watchPartyGiftQuery" maxlength="40" autocomplete="off" spellcheck="false">'+
   '<p class="watch-party-gift-info" id="watchPartyGiftInfoLine"></p><div id="watchPartyGiftMatches" class="watch-party-gift-matches"></div>'+
   '<p id="watchPartyGiftFeedback" class="watch-party-gift-feedback" aria-live="polite"></p></section>';
  document.body.append(modal);
  modal.querySelector('.watch-party-gift-backdrop').addEventListener('click',close);
  $('watchPartyGiftClose').addEventListener('click',close);
  $('watchPartyGiftQuery').addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(search,260);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal&&!modal.hidden)close();});
 }
 function feedback(message){$('watchPartyGiftFeedback').textContent=message||'';}
 function close(){if(modal)modal.hidden=true;selected=null;}
 async function open(){
  init();
  const paywall=window.BETVWatchPartyPaywall;
  if(!paywall?.isUnlocked?.())await paywall?.refresh?.();
  if(!paywall?.isUnlocked?.()){paywall?.open?.();return;}
  if(!client()||!userid())return;
  const {data:quota,error:quotaError}=await client().rpc('my_watch_party_gift_status');
  const available=Array.isArray(quota)?quota[0]:quota;
  // Grants and received gifts have no paid +1 quota. Never display an empty sheet.
  if(quotaError||!available?.eligible||available?.gifted_to){refreshShortcut();return;}
  modal.hidden=false;
  $('watchPartyGiftTitle').textContent=txt(0);$('watchPartyGiftSubtitle').textContent=txt(1);
  $('watchPartyGiftClose').setAttribute('aria-label',txt(15));
  $('watchPartyGiftQuery').placeholder=txt(2);$('watchPartyGiftQuery').value='';
  $('watchPartyGiftInfoLine').textContent=txt(3);
  $('watchPartyGiftMatches').replaceChildren();feedback('');selected=null;currentStatus=null;
  await refresh();
  if(currentStatus?.eligible && !currentStatus?.gifted_to)$('watchPartyGiftQuery').focus();
 }
 async function refresh(){
  if(!userid()||!client())return;
  const {data,error}=await client().rpc('my_watch_party_gift_status');
  if(error){feedback(txt(12));return;}
  currentStatus=Array.isArray(data)?data[0]:data;
  if(!currentStatus?.eligible){
    $('watchPartyGiftQuery').hidden=true;$('watchPartyGiftInfoLine').textContent=txt(11);return;
  }
  if(currentStatus.gifted_to){
    $('watchPartyGiftQuery').hidden=true;$('watchPartyGiftInfoLine').textContent=txt(10)+currentStatus.gifted_to;
    const rows=$('watchPartyGiftMatches');rows.replaceChildren();
    const p=await lookup(currentStatus.gifted_to,{username:currentStatus.gifted_to,avatar_url:currentStatus.recipient_avatar});
    rows.append(card(p,true));return;
  }
  $('watchPartyGiftQuery').hidden=false;
 }
 async function lookup(username,fallback={}){
  try{
    const {data,error}=await client().rpc('get_public_profile',{p_username:username});
    if(!error){
      const p=Array.isArray(data)?data[0]:data;
      if(p)return {username:String(p.username||username),display_name:p.display_name||username,avatar_url:p.avatar_url||fallback.avatar_url,banner_url:p.banner_url||''};
    }
  }catch(_){}
  return {username,display_name:username,avatar_url:fallback.avatar_url||'',banner_url:''};
 }
 async function search(){
  if(!currentStatus?.eligible||currentStatus.gifted_to||!client())return;
  const query=$('watchPartyGiftQuery').value.trim().replace(/^@+/,'').slice(0,30),serial=++searching;
  const matches=$('watchPartyGiftMatches');matches.replaceChildren();feedback('');
  if(query.length<2){$('watchPartyGiftInfoLine').textContent=txt(3);return;}
  $('watchPartyGiftInfoLine').textContent=txt(18);
  const {data,error}=await client().rpc('search_public_profiles',{p_query:query,p_limit:8});
  if(serial!==searching)return;
  const fans=Array.isArray(data)?data:[];
  if(error||!fans.length){$('watchPartyGiftInfoLine').textContent=txt(4);return;}
  const infos=await Promise.all(fans.filter(f=>String(f.username||'').toLowerCase()!==String(window.beBackend?.auth?.currentUser?.username||'').toLowerCase()).map(async f=>{
    const {data:available,error:accessError}=await client().rpc('watch_party_recipient_available',{p_username:f.username});
    if(accessError||available!==true)return null;
    return lookup(f.username,f);
  }));
  if(serial!==searching)return;
  $('watchPartyGiftInfoLine').textContent=txt(1);
  for(const info of infos.filter(Boolean))matches.append(card(info));
  if(!matches.childElementCount)$('watchPartyGiftInfoLine').textContent=txt(13);
 }
 function choose(profile,outer){
  if(sending||!currentStatus?.eligible||currentStatus.gifted_to)return;
  selected=profile;
  for(const e of $('watchPartyGiftMatches').querySelectorAll('.watch-party-gift-confirm'))e.remove();
  for(const e of $('watchPartyGiftMatches').querySelectorAll('.is-selected'))e.classList.remove('is-selected');
  outer.classList.add('is-selected');
  const check=document.createElement('div');check.className='watch-party-gift-confirm';
  const question=document.createElement('strong');question.textContent=txt(5)+profile.username+'?';
  const detail=document.createElement('p');detail.textContent=txt(6);
  const buttons=document.createElement('div');buttons.className='watch-party-gift-confirm-actions';
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent=txt(8);
  cancel.addEventListener('click',()=>{selected=null;check.remove();outer.classList.remove('is-selected');});
  const send=document.createElement('button');send.type='button';send.className='is-confirm';send.textContent=txt(7);
  send.addEventListener('click',()=>sendGift(profile,send));
  buttons.append(cancel,send);check.append(question,detail,buttons);outer.append(check);
 }
 async function sendGift(profile,button){
  if(sending||!selected||selected.username!==profile.username||!currentStatus?.eligible||currentStatus.gifted_to)return;
  sending=true;button.disabled=true;button.textContent=txt(17);
  try{
    // Status refresh is advisory; the SQL function also enforces a unique,
    // atomic one-time gift and rejects users with any existing entitlement.
    const {data:latest,error:stateError}=await client().rpc('my_watch_party_gift_status');
    const now=Array.isArray(latest)?latest[0]:latest;
    if(stateError||!now?.eligible||now.gifted_to)throw Error(txt(14));
    const {data,error}=await client().rpc('gift_watch_party_access',{p_username:profile.username});
    if(error){
      const msg=String(error.message||'');
      if(msg.includes('gift_already_used'))throw Error(txt(14));
      if(msg.includes('fan_already_unlocked'))throw Error(txt(13));
      throw Error(txt(12));
    }
    if(data!=='gift_pending')throw Error(txt(12));
    feedback(String(window.BETVLocale?.slug||'pt-br').toLowerCase()==='pt-br'?'Presente enviado! O fã poderá aceitar ou recusar na notificação.':'Gift sent! The fan can accept or decline in notifications.');
    $('watchPartyGiftMatches').replaceChildren();selected=null;
    await refresh();
    await window.BETVWatchPartyPaywall?.refresh?.();
    window.dispatchEvent(new Event('be:watch-party-gift-status'));
    close();
  }catch(e){feedback(e.message||txt(12));button.disabled=false;button.textContent=txt(7);}
  finally{sending=false;}
 }
 function attachToPaywall(){
  const paywall=$('watchPartyPaywall');if(!paywall||paywall.querySelector('#watchPartyGiftShortcut'))return;
  const shortcut=document.createElement('button');shortcut.type='button';shortcut.id='watchPartyGiftShortcut';
  shortcut.className='watch-party-unlock-checkout watch-party-gift-shortcut';shortcut.textContent=txt(0);
  paywall.querySelector('.watch-party-unlock-card')?.insertBefore(shortcut,$('watchPartyUnlockStatus'));
  shortcut.addEventListener('click',open);
 }
 function refreshShortcut(){
  const shortcut=$('watchPartyGiftShortcut');
  if(shortcut){shortcut.hidden=!window.BETVWatchPartyPaywall?.canGift?.();shortcut.textContent=txt(0);}
 }
 function start(){
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('#watchPartyGiftOpen');
    if(button){event.preventDefault();event.stopImmediatePropagation();open();}
  },true);
  const watcher=new MutationObserver(()=>{attachToPaywall();refreshShortcut();});
  watcher.observe(document.body,{childList:true,subtree:false});
  attachToPaywall();
  window.addEventListener('be:watch-party-gift-status',refreshShortcut);
  window.addEventListener('be:community-tag-updated',refreshShortcut);
  window.addEventListener('be:i18n-ready',refreshShortcut);
  window.setInterval(refreshShortcut,1400);
 }
 window.BETVWatchPartyGift=Object.freeze({open});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
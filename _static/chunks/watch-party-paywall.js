/* BETV Watch Party — Stripe verified paid unlock + community promotion. */
(() => {
 'use strict';
 if(window.BETVWatchPartyPaywall)return;
 const $=id=>document.getElementById(id);
 const money='US$ 5,00';
 const estimate='≈ R$ 27,19 · € 4,49';
 let unlocked=false,checked=false,pending=false,modal=null;
 const client=()=>window.beBackend?.client;
 const user=()=>window.beBackend?.auth?.currentUser;
 function local(s){return String(window.BETVLocale?.slug||'pt-br').toLowerCase()==='pt-br'?s:s;}
 function createModal(){
  if(modal)return modal;
  modal=document.createElement('div');modal.className='watch-party-paywall';modal.id='watchPartyPaywall';modal.hidden=true;
  modal.innerHTML='<div class="watch-party-paywall-overlay"></div><section class="watch-party-unlock-card" role="dialog" aria-modal="true" aria-labelledby="watchPartyUnlockTitle">'+
   '<button type="button" class="watch-party-unlock-close" aria-label="Fechar">×</button>'+
   '<span class="watch-party-unlock-icon" aria-hidden="true">◉</span>'+
   '<h2 id="watchPartyUnlockTitle">Watch Party</h2>'+
   '<p>Assista junto com seus amigos, convide fãs e sincronize os vídeos em uma sala exclusiva.</p>'+
   '<div class="watch-party-unlock-price"><strong>US$ 5,00</strong><span>≈ R$ 27,19 · € 4,49</span><small>Pagamento único · Conversões estimadas. O valor final é exibido na Stripe.</small></div>'+
   '<div class="watch-party-unlock-reward"><span class="watch-party-gold-tag">Happier Than Ever</span><span>Desbloqueie e receba automaticamente esta tag dourada no seu perfil após a confirmação do pagamento.</span></div>'+
   '<button type="button" class="watch-party-unlock-checkout" id="watchPartyUnlockCheckout">Desbloquear com Stripe</button>'+
   '<p id="watchPartyUnlockStatus" class="watch-party-unlock-status" role="status"></p>'+
   '</section>';
  document.body.append(modal);
  modal.querySelector('.watch-party-unlock-close').addEventListener('click',hide);
  modal.querySelector('.watch-party-paywall-overlay').addEventListener('click',hide);
  $('watchPartyUnlockCheckout').addEventListener('click',checkout);
  return modal;
 }
 function open(){createModal();modal.hidden=false;}
 function hide(){if(modal)modal.hidden=true;}
 function message(s){if($('watchPartyUnlockStatus'))$('watchPartyUnlockStatus').textContent=s;}
 async function invoke(body){
  if(!client()||!user())throw Error('Entre na sua conta para desbloquear.');
  const {data,error}=await client().functions.invoke('watch-party-checkout',{body});
  if(error||data?.error)throw Error(data?.error||'Falha ao verificar pagamento.');
  return data;
 }
 async function refresh(){
  if(!client()||!user()){checked=true;unlocked=false;render();return false;}
  try{
   const {data,error}=await client().rpc('has_watch_party_access');
   if(error)throw error;
   unlocked=data===true;checked=true;render();return unlocked;
  }catch(_){checked=false;return false;}
 }
 async function checkout(){
  if(pending)return;
  pending=true;const button=$('watchPartyUnlockCheckout');button.disabled=true;
  message('Conectando à Stripe…');
  try{
   const data=await invoke({action:'create'});
   if(data?.unlocked){unlocked=true;checked=true;hide();render();return;}
   const url=new URL(String(data?.url||''));
   if(url.protocol!=='https:'||!/(^|\.)stripe\.com$/.test(url.hostname))throw Error('Link de pagamento inválido.');
   location.assign(url.href);
  }catch(err){message(err.message||'Não foi possível abrir o checkout.');}
  finally{pending=false;button.disabled=false;}
 }
 async function verifyReturn(){
  const params=new URLSearchParams(location.search);
  const kind=params.get('watch_party_checkout');
  const session=params.get('session_id');
  if(kind!=='success'||!session)return;
  open();message('Verificando o pagamento diretamente com a Stripe…');
  try{
   const result=await invoke({action:'verify',session_id:session});
   if(!result?.unlocked)throw Error('Pagamento ainda não confirmado.');
   unlocked=true;checked=true;message('Acesso desbloqueado! A tag Happier Than Ever foi concedida.');
   render();
   try{window.dispatchEvent(new CustomEvent('be:community-tag-updated',{detail:{tag:'happier_than_ever',userId:user()?.uid}}));}catch(_){}
   window.setTimeout(hide,2600);
  }catch(err){message(err.message||'Pagamento ainda não confirmado.');}
  finally{
   const url=new URL(location.href);url.searchParams.delete('watch_party_checkout');url.searchParams.delete('session_id');
   history.replaceState(history.state,'',url.pathname+url.search+url.hash);
  }
 }
 function promote(){
  const parent=$('communityFavoritesContent')?.closest('.community-section');
  const head=parent?.querySelector('.community-section-head');
  if(!head||head.querySelector('.watch-party-community-widget'))return;
  const card=document.createElement('button');card.type='button';card.className='watch-party-community-widget';
  card.innerHTML='<span class="watch-party-community-symbol">◉</span><span class="watch-party-community-copy"><strong>Watch Party</strong><small>Assista junto com seu amigo</small></span><span class="watch-party-community-price">US$ 5</span>';
  head.append(card);card.addEventListener('click',()=>{if(unlocked){$('contentDetailWatchParty')?.scrollIntoView?.({block:'center'});open();}else open();});
 }
 function render(){
  const btn=$('contentDetailWatchParty');
  if(btn){
   const play=$('contentDetailPlay');
   if(play&&btn.previousElementSibling!==play)play.insertAdjacentElement('afterend',btn);
   btn.classList.add('watch-party-main-cta');
   btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 19v-2a6 6 0 0 1 12 0v2M17 9h5M19.5 6.5v5M17 15a4 4 0 0 1 4 4"/></svg><span>Watch Party</span>';
   btn.dataset.watchPartyUnlock=unlocked?'true':'false';
  }
  promote();
 }
 function guard(event){
  const target=event.target.closest?.('#contentDetailWatchParty,.watch-party-player-button');
  if(!target||unlocked)return;
  event.preventDefault();event.stopImmediatePropagation();
  open();
  if(!user())message('Faça login para desbloquear a Watch Party.');
 }
 function start(){
  document.addEventListener('click',guard,true);
  let last=false;
  new MutationObserver(()=>{const active=document.body.classList.contains('community-page-active');if(active&&!last)promote();last=active;}).observe(document.body,{attributes:true,attributeFilter:['class']});
  window.addEventListener('be:content-ready',render);
  window.addEventListener('be:community-tag-updated',render);
  render();
  Promise.resolve(window.beBackend?.ready).then(async()=>{await refresh();await verifyReturn();}).catch(()=>{});
  window.beBackend?.auth?.onChange?.(()=>refresh());
 }
 window.BETVWatchPartyPaywall=Object.freeze({open,isUnlocked:()=>unlocked,refresh});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
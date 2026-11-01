/* BETV Watch Party — iOS-style unlock, localized Checkout and one permanent +1 gift. */
(() => {
  'use strict';
  if (window.BETVWatchPartyPaywall) return;
  const $ = id => document.getElementById(id);
  const keys=['description','oneTime','exchange','reward','rewardInfo','plus','plusInfo','checkout','close','login','connecting','verifying','confirmed','notConfirmed','unlocked','unlockedInfo','giftTitle','giftInfo','giftSearch','giftPlaceholder','giftEmpty','giftConfirm','giftChange','giftDone','giftUsed','onlyPaid','alreadyUnlocked','error','community','choose','sentTo','profile'];
  const dict={
    'pt-br':['Assista ao mesmo filme ou vídeo com seus amigos em uma sala sincronizada.','Pagamento único · acesso permanente','≈ R$ 27,19 · € 4,49 (estimativas; valor final na Stripe)','Sua tag exclusiva','Receba a tag dourada Happier Than Ever após a confirmação do pagamento.','Inclui +1 acesso para presentear','Depois de pagar, escolha um amigo pelo @usuário. Ele recebe acesso permanente e a mesma tag dourada, sem pagar nada.','Desbloquear com Stripe','Fechar','Entre na sua conta BETV para continuar.','Conectando à Stripe…','Verificando pagamento na Stripe…','Pagamento confirmado! Sua Watch Party está ativa.','Pagamento ainda não confirmado.','Acesso ativado','Você já tem acesso à Watch Party.','Seu presente +1','Escolha um fã para dar acesso permanente e a tag Happier Than Ever.','Pesquisar @usuário','Digite pelo menos duas letras para encontrar um fã.','Nenhum fã encontrado.','Presentear este fã','Escolher outro fã','Presente enviado! Seu amigo já tem acesso e a tag dourada.','Você já presenteou','O presente +1 é exclusivo de quem comprou o desbloqueio.','Esse fã já tem acesso. Escolha outro.','Não foi possível concluir. Tente novamente.','Assista junto com seu amigo','Selecionar','Acesso concedido a','Seu perfil BETV'],
    'en-us':['Watch the same movie or video with friends in a synchronized room.','One-time payment · lifetime access','≈ R$27.19 · €4.49 (estimates; final amount at Stripe)','Your exclusive badge','Get the gold Happier Than Ever badge after payment is confirmed.','Includes one free access to gift','After paying, choose a friend by @username. They get lifetime access and the same gold badge at no extra cost.','Unlock with Stripe','Close','Sign in to your BETV account to continue.','Connecting to Stripe…','Verifying payment with Stripe…','Payment confirmed! Watch Party is active.','Payment not yet confirmed.','Access unlocked','You already have Watch Party access.','Your +1 gift','Choose a fan to give lifetime access and the Happier Than Ever badge.','Search @username','Type at least two characters to find a fan.','No fans found.','Gift access to this fan','Choose another fan','Gift sent! Your friend now has access and the gold badge.','You have already gifted access to','The +1 gift is only for members who purchased access.','This fan already has access. Choose someone else.','Could not complete the request. Please try again.','Watch together with a friend','Select','Access granted to','Your BETV profile'],
    es:['Mira la misma película o vídeo con amigos en una sala sincronizada.','Pago único · acceso permanente','≈ 27,19 R$ · 4,49 € (estimaciones; importe final en Stripe)','Tu insignia exclusiva','Recibe la insignia dorada Happier Than Ever tras confirmar el pago.','Incluye 1 acceso para regalar','Después de pagar, elige a un amigo por su @usuario. Recibirá acceso permanente y la misma insignia dorada gratis.','Desbloquear con Stripe','Cerrar','Inicia sesión en BETV para continuar.','Conectando con Stripe…','Verificando el pago en Stripe…','¡Pago confirmado! Watch Party está activa.','Pago aún no confirmado.','Acceso activado','Ya tienes acceso a Watch Party.','Tu regalo +1','Elige a un fan para regalar acceso permanente y la insignia Happier Than Ever.','Buscar @usuario','Escribe al menos dos letras para encontrar un fan.','No se encontraron fans.','Regalar acceso a este fan','Elegir otro fan','¡Regalo enviado! Tu amigo ya tiene acceso y la insignia dorada.','Ya regalaste acceso a','El regalo +1 es exclusivo de quienes compran el acceso.','Este fan ya tiene acceso. Elige a otro.','No se pudo completar. Inténtalo de nuevo.','Mira contenido con un amigo','Seleccionar','Acceso concedido a','Tu perfil BETV'],
    fr:['Regardez le même film ou la même vidéo avec vos amis dans un salon synchronisé.','Paiement unique · accès à vie','≈ 27,19 R$ · 4,49 € (estimations ; montant final sur Stripe)','Votre badge exclusif','Recevez le badge doré Happier Than Ever après confirmation du paiement.','Inclut un accès à offrir','Après paiement, choisissez un ami par son @pseudo. Il recevra gratuitement un accès à vie et le même badge doré.','Débloquer avec Stripe','Fermer','Connectez-vous à votre compte BETV pour continuer.','Connexion à Stripe…','Vérification du paiement auprès de Stripe…','Paiement confirmé ! Watch Party est active.','Paiement pas encore confirmé.','Accès activé','Vous avez déjà accès à Watch Party.','Votre cadeau +1','Choisissez un fan qui recevra un accès à vie et le badge Happier Than Ever.','Chercher un @pseudo','Saisissez au moins deux caractères pour trouver un fan.','Aucun fan trouvé.','Offrir cet accès','Choisir un autre fan','Cadeau envoyé ! Votre ami a désormais accès et le badge doré.','Vous avez déjà offert l’accès à','Le cadeau +1 est réservé aux personnes ayant acheté l’accès.','Ce fan a déjà accès. Choisissez quelqu’un d’autre.','Impossible de terminer. Veuillez réessayer.','Regardez ensemble avec un ami','Sélectionner','Accès accordé à','Votre profil BETV'],
    it:['Guarda lo stesso film o video con gli amici in una stanza sincronizzata.','Pagamento una tantum · accesso permanente','≈ 27,19 R$ · 4,49 € (stime; importo finale su Stripe)','Il tuo badge esclusivo','Ricevi il badge dorato Happier Than Ever dopo la conferma del pagamento.','Include 1 accesso da regalare','Dopo il pagamento, scegli un amico tramite @utente. Riceverà gratis accesso permanente e lo stesso badge dorato.','Sblocca con Stripe','Chiudi','Accedi al tuo account BETV per continuare.','Connessione a Stripe…','Verifica del pagamento con Stripe…','Pagamento confermato! Watch Party è attiva.','Pagamento non ancora confermato.','Accesso attivato','Hai già accesso a Watch Party.','Il tuo regalo +1','Scegli un fan a cui regalare accesso permanente e il badge Happier Than Ever.','Cerca @utente','Digita almeno due caratteri per trovare un fan.','Nessun fan trovato.','Regala accesso a questo fan','Scegli un altro fan','Regalo inviato! Il tuo amico ha già accesso e il badge dorato.','Hai già regalato l’accesso a','Il regalo +1 è riservato a chi ha acquistato l’accesso.','Questo fan ha già accesso. Scegline un altro.','Impossibile completare. Riprova.','Guarda insieme a un amico','Seleziona','Accesso concesso a','Il tuo profilo BETV']
  };
  const t = key => {
    const index=keys.indexOf(key),locale=String(window.BETVLocale?.slug||'pt-br').toLowerCase();
    return (dict[locale]||dict['pt-br'])[index] || dict['pt-br'][index] || key;
  };
  const CURRENCY_PRICE = Object.freeze({brl:2719,usd:500,eur:449});
  function priceForLocale(){
    const locale=String(window.BETVLocale?.slug||'pt-br').toLowerCase();
    const currency=locale==='pt-br'?'brl':locale==='en-us'?'usd':'eur';
    const fmt=locale==='pt-br'?'pt-BR':locale==='en-us'?'en-US':locale==='fr'?'fr-FR':locale==='it'?'it-IT':'es-ES';
    return {currency,cents:CURRENCY_PRICE[currency],text:new Intl.NumberFormat(fmt,{style:'currency',currency:currency.toUpperCase()}).format(CURRENCY_PRICE[currency]/100)};
  }
  const client=()=>window.beBackend?.client;
  const user=()=>window.beBackend?.auth?.currentUser;
  const safeUrl=value=>{try{const x=new URL(String(value||'').trim());return x.protocol==='https:' && !x.username && !x.password ? x.href:'';}catch{return '';}};
  function picture(url,cls,alt=''){
    const el=document.createElement('img');el.className=cls;el.alt=alt;el.loading='lazy';el.decoding='async';el.referrerPolicy='no-referrer';
    const src=safeUrl(url);if(src)el.src=src;else el.hidden=true;return el;
  }
  let panel=null,unlocked=false,checked=false,busy=false,giftInfo=null,selected=null,searchTimer=0,searchSeq=0;
  function create(){
    if(panel)return;
    panel=document.createElement('div');panel.id='watchPartyPaywall';panel.className='watch-party-paywall';panel.hidden=true;
    panel.innerHTML='<div class="watch-party-paywall-overlay"></div><section class="watch-party-unlock-card" role="dialog" aria-modal="true" aria-labelledby="watchPartyUnlockTitle">'+
      '<div class="watch-party-ios-handle" aria-hidden="true"></div><button class="watch-party-unlock-close" id="watchPartyUnlockClose" type="button">×</button>'+
      '<div class="watch-party-paywall-profile"><div class="watch-party-paywall-banner"><img id="watchPartyPaywallBanner" hidden alt=""></div>'+
      '<div class="watch-party-paywall-identity"><span class="watch-party-paywall-avatar" id="watchPartyPaywallAvatar"></span><div class="watch-party-paywall-names"><small id="watchPartyProfileCaption"></small><strong id="watchPartyPaywallName"></strong><span id="watchPartyPaywallUsername"></span></div></div></div>'+
      '<h2 id="watchPartyUnlockTitle">Watch Party</h2><p id="watchPartyUnlockDescription"></p>'+
      '<div id="watchPartyPurchaseSection"><div class="watch-party-unlock-price"><strong id="watchPartyUnlockPrice"></strong><span id="watchPartyOneTime"></span></div>'+
      '<div class="watch-party-unlock-reward"><span class="watch-party-gold-tag notranslate" translate="no">Happier Than Ever</span><div><strong id="watchPartyRewardTitle"></strong><span id="watchPartyRewardInfo"></span></div></div>'+
      '<div class="watch-party-unlock-plus"><strong id="watchPartyPlusTitle"></strong><p id="watchPartyPlusInfo"></p></div>'+
      '<button id="watchPartyUnlockCheckout" type="button" class="watch-party-unlock-checkout"></button></div>'+
      '<div id="watchPartyGiftSection" class="watch-party-gift-section" hidden><p id="watchPartyGiftInfo"></p>'+
      '<div id="watchPartyGiftUsed" class="watch-party-gift-used" hidden></div><div id="watchPartyGiftPicker" hidden>'+
      '<label for="watchPartyGiftSearch" id="watchPartyGiftSearchLabel"></label><input type="search" id="watchPartyGiftSearch" autocomplete="off" spellcheck="false" maxlength="40">'+
      '<div class="watch-party-gift-results" id="watchPartyGiftResults"></div><div class="watch-party-selected-card" id="watchPartySelectedCard" hidden></div>'+
      '<button id="watchPartyGiftConfirm" type="button" class="watch-party-unlock-checkout" hidden></button>'+
      '<button id="watchPartyGiftCancel" type="button" class="watch-party-ios-secondary" hidden></button></div></div>'+
      '<p id="watchPartyUnlockStatus" class="watch-party-unlock-status" role="status" aria-live="polite"></p></section>';
    document.body.append(panel);
    panel.querySelector('.watch-party-paywall-overlay').addEventListener('click',close);
    $('watchPartyUnlockClose').addEventListener('click',close);
    $('watchPartyUnlockCheckout').addEventListener('click',checkout);
    $('watchPartyGiftSearch').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(findFans,260);});
    $('watchPartyGiftConfirm').addEventListener('click',sendGift);
    $('watchPartyGiftCancel').addEventListener('click',()=>{selected=null;renderGift();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel&&!panel.hidden)close();});
  }
  function status(message){if($('watchPartyUnlockStatus'))$('watchPartyUnlockStatus').textContent=message||'';}
  function open(){create();panel.hidden=false;render();loadMyProfile();if(unlocked)loadGift();}
  function close(){if(panel)panel.hidden=true;}
  async function loadMyProfile(){
    let profile=null;
    try{if(user()?.uid)profile=await window.beBackend?.profiles?.get(user().uid,{force:true});}catch(_){}
    if(!panel)return;
    const name=String(profile?.displayName||profile?.display_name||user()?.displayName||user()?.username||t('profile'));
    const username=String(profile?.username||user()?.username||'').trim();
    $('watchPartyProfileCaption').textContent=t('profile');
    $('watchPartyPaywallName').textContent=name;
    $('watchPartyPaywallUsername').textContent=username?'@'+username:'';
    const avatar=$('watchPartyPaywallAvatar');avatar.replaceChildren();
    const photo=picture(profile?.avatarUrl||profile?.avatar_url,'watch-party-paywall-avatar-image',name);
    if(!photo.hidden)avatar.append(photo);else avatar.textContent=name.trim().slice(0,1).toUpperCase();
    const banner=$('watchPartyPaywallBanner'),src=safeUrl(profile?.bannerUrl||profile?.banner_url);
    if(src){banner.src=src;banner.hidden=false;}else{banner.hidden=true;banner.removeAttribute('src');}
  }
  async function invoke(body){
    if(!client()||!user())throw Error(t('login'));
    const {data,error}=await client().functions.invoke('watch-party-checkout',{body});
    if(error||data?.error)throw Error(String(data?.error||t('error')));
    return data;
  }
  async function refresh(){
    if(!client()||!user()){checked=true;unlocked=false;giftInfo=null;render();return false;}
    try{
      const {data,error}=await client().rpc('has_watch_party_access');
      if(error)throw error;
      unlocked=data===true;checked=true;render();
      if(unlocked)await loadGift();
      return unlocked;
    }catch(_){checked=false;return false;}
  }
  async function loadGift(){
    if(!unlocked||!client()||!user())return;
    try{
      const {data,error}=await client().rpc('my_watch_party_gift_status');
      if(!error){giftInfo=Array.isArray(data)?data[0]:data;renderGift();}
    }catch(_){}
  }
  function renderGift(){
    if(!panel)return;
    const section=$('watchPartyGiftSection'),picker=$('watchPartyGiftPicker'),used=$('watchPartyGiftUsed');
    if(!unlocked){section.hidden=true;return;}
    section.hidden=false;$('watchPartyGiftInfo').textContent=t('giftInfo');
    if(!giftInfo){picker.hidden=true;used.hidden=true;return;}
    if(!giftInfo.eligible){
      picker.hidden=true;used.hidden=false;used.textContent=t('onlyPaid');return;
    }
    if(giftInfo.gifted_to){
      picker.hidden=true;used.hidden=false;used.replaceChildren();
      const photo=picture(giftInfo.recipient_avatar,'watch-party-gifted-photo');
      if(!photo.hidden)used.append(photo);
      const text=document.createElement('span');text.textContent=t('giftUsed')+' @'+giftInfo.gifted_to;used.append(text);return;
    }
    used.hidden=true;picker.hidden=false;
    $('watchPartyGiftSearchLabel').textContent=t('giftSearch');$('watchPartyGiftSearch').placeholder=t('giftSearch');
    $('watchPartyGiftConfirm').textContent=t('giftConfirm');$('watchPartyGiftCancel').textContent=t('giftChange');
    $('watchPartyGiftConfirm').hidden=!selected;$('watchPartyGiftCancel').hidden=!selected;
    $('watchPartySelectedCard').hidden=!selected;
    $('watchPartyGiftSearch').hidden=!!selected;
    $('watchPartyGiftResults').hidden=!!selected;
    if(!selected && !$('watchPartyGiftSearch').value.trim())$('watchPartyGiftResults').textContent=t('giftPlaceholder');
  }
  async function findFans(){
    const results=$('watchPartyGiftResults');
    if(!results||!client())return;
    const query=$('watchPartyGiftSearch').value.trim().replace(/^@+/,'').slice(0,30),seq=++searchSeq;
    results.replaceChildren();
    if(query.length<2){results.textContent=t('giftPlaceholder');return;}
    const {data,error}=await client().rpc('search_public_profiles',{p_query:query,p_limit:8});
    if(seq!==searchSeq)return;
    if(error){results.textContent=t('error');return;}
    const fans=(Array.isArray(data)?data:[]).filter(p=>p.username&&String(p.username).toLowerCase()!==String(user()?.username||'').toLowerCase());
    if(!fans.length){results.textContent=t('giftEmpty');return;}
    for(const fan of fans){
      const button=document.createElement('button');button.type='button';button.className='watch-party-ios-user';
      const photo=picture(fan.avatar_url,'watch-party-ios-user-photo');
      if(!photo.hidden)button.append(photo);
      const label=document.createElement('span');label.textContent='@'+fan.username;button.append(label);
      button.addEventListener('click',()=>chooseFan(fan));results.append(button);
    }
  }
  async function chooseFan(fan){
    selected={username:fan.username,name:fan.username,avatar:fan.avatar_url,banner:''};
    try{
      const {data}=await client().rpc('get_public_profile',{p_username:fan.username});
      const p=Array.isArray(data)?data[0]:data;
      if(p){selected.name=p.display_name||selected.name;selected.avatar=p.avatar_url||selected.avatar;selected.banner=p.banner_url||'';}
    }catch(_){}
    const card=$('watchPartySelectedCard');card.replaceChildren();
    const cover=picture(selected.banner,'watch-party-selected-banner');if(!cover.hidden)card.append(cover);
    const identity=document.createElement('div');identity.className='watch-party-selected-identity';
    const avatar=picture(selected.avatar,'watch-party-selected-avatar');if(!avatar.hidden)identity.append(avatar);
    const names=document.createElement('div');names.className='watch-party-selected-names';
    const bold=document.createElement('strong');bold.textContent=selected.name;
    const sub=document.createElement('span');sub.textContent='@'+selected.username;
    names.append(bold,sub);identity.append(names);card.append(identity);renderGift();
  }
  async function sendGift(){
    if(!selected||busy||!giftInfo?.eligible||giftInfo?.gifted_to)return;
    busy=true;$('watchPartyGiftConfirm').disabled=true;status('');
    try{
      const {data,error}=await client().rpc('gift_watch_party_access',{p_username:selected.username});
      if(error){
        const code=String(error.message||'');
        throw Error(code.includes('gift_already_used')?t('giftUsed'):code.includes('fan_already_unlocked')?t('alreadyUnlocked'):t('error'));
      }
      if(data!=='gift_granted')throw Error(t('error'));
      selected=null;giftInfo=null;await loadGift();status(t('giftDone'));
    }catch(e){status(e.message||t('error'));}
    finally{busy=false;$('watchPartyGiftConfirm').disabled=false;}
  }
  async function checkout(){
    if(busy)return;
    busy=true;const button=$('watchPartyUnlockCheckout');button.disabled=true;status(t('connecting'));
    try{
      const data=await invoke({action:'create',locale:String(window.BETVLocale?.slug||'pt-br').toLowerCase()});
      if(data?.unlocked){unlocked=true;checked=true;render();await loadGift();return;}
      const url=new URL(String(data?.url||''));
      if(url.protocol!=='https:'||!/(^|\.)stripe\.com$/.test(url.hostname))throw Error(t('error'));
      location.assign(url.href);
    }catch(e){status(e.message||t('error'));}
    finally{busy=false;button.disabled=false;}
  }
  async function verifyReturn(){
    const params=new URLSearchParams(location.search);
    if(params.get('watch_party_checkout')!=='success'||!params.get('session_id'))return;
    open();status(t('verifying'));
    try{
      const result=await invoke({action:'verify',session_id:params.get('session_id')});
      if(!result?.unlocked)throw Error(t('notConfirmed'));
      unlocked=true;checked=true;giftInfo=null;render();await loadGift();status(t('confirmed'));
      window.dispatchEvent(new CustomEvent('be:community-tag-updated',{detail:{userId:user()?.uid,tag:'happier_than_ever'}}));
    }catch(_){status(t('notConfirmed'));}
    finally{
      const url=new URL(location.href);url.searchParams.delete('watch_party_checkout');url.searchParams.delete('session_id');
      history.replaceState(history.state,'',url.pathname+url.search+url.hash);
    }
  }
  function promote(){
    const head=$('communityFavoritesContent')?.closest('.community-section')?.querySelector('.community-section-head');
    if(!head)return;
    let card=head.querySelector('.watch-party-community-widget');
    if(!card){
      card=document.createElement('button');card.type='button';card.className='watch-party-community-widget';
      card.innerHTML='<span class="watch-party-community-copy"><strong>Watch Party</strong><small></small></span><span class="watch-party-community-price"></span>';
      head.append(card);card.addEventListener('click',open);
    }
    card.querySelector('small').textContent=t('community');
    card.querySelector('.watch-party-community-price').textContent=unlocked?t('unlocked'):priceForLocale().text;
  }
  function render(){
    if(panel){
      $('watchPartyUnlockClose').setAttribute('aria-label',t('close'));
      $('watchPartyUnlockTitle').textContent=unlocked?t('unlocked'):'Watch Party';
      $('watchPartyUnlockDescription').textContent=unlocked?t('unlockedInfo'):t('description');
      $('watchPartyPurchaseSection').hidden=unlocked;
      $('watchPartyGiftSection').hidden=!unlocked;
      $('watchPartyUnlockPrice').textContent=priceForLocale().text;
      $('watchPartyOneTime').textContent=t('oneTime');
      $('watchPartyRewardTitle').textContent=t('reward');$('watchPartyRewardInfo').textContent=t('rewardInfo');
      $('watchPartyPlusTitle').textContent=t('plus');$('watchPartyPlusInfo').textContent=t('plusInfo');
      $('watchPartyUnlockCheckout').textContent=t('checkout');if(unlocked)renderGift();
    }
    const button=$('contentDetailWatchParty');
    if(button){
      const play=$('contentDetailPlay');
      if(play&&button.previousElementSibling!==play)play.insertAdjacentElement('afterend',button);
      button.classList.add('watch-party-main-cta');
      button.dataset.watchPartyUnlock=unlocked?'true':'false';
      button.setAttribute('aria-label','Watch Party');
      const label=button.querySelector('span');if(label)label.textContent='Watch Party';
    }
    promote();
  }
  function guard(event){
    const target=event.target.closest?.('#contentDetailWatchParty,.watch-party-player-button');
    if(!target||unlocked)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(!checked&&user())refresh().then(ok=>{if(ok)window.BETVWatchParty?.open?.();else open();});
    else open();
    if(!user())status(t('login'));
  }
  function initialize(){
    document.addEventListener('click',guard,true);
    new MutationObserver(promote).observe(document.body,{attributes:true,attributeFilter:['class']});
    window.addEventListener('be:content-ready',render);
    window.addEventListener('be:i18n-ready',render);
    window.addEventListener('be:community-tag-updated',render);
    render();
    Promise.resolve(window.beBackend?.ready).then(async()=>{await refresh();await verifyReturn();}).catch(()=>{});
    window.beBackend?.auth?.onChange?.(()=>refresh());
  }
  window.BETVWatchPartyPaywall=Object.freeze({open,isUnlocked:()=>unlocked,refresh});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
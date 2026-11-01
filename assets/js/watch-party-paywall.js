/* BETV Watch Party — iOS-style unlock, localized Checkout and one permanent +1 gift. */
(() => {
  'use strict';
  if (window.BETVWatchPartyPaywall) return;
  const $ = id => document.getElementById(id);
  const keys=['description','oneTime','exchange','reward','rewardInfo','plus','plusInfo','checkout','close','login','connecting','verifying','confirmed','notConfirmed','unlocked','unlockedInfo','giftTitle','giftInfo','giftSearch','giftPlaceholder','giftEmpty','giftConfirm','giftChange','giftDone','giftUsed','onlyPaid','alreadyUnlocked','error','community','choose','sentTo','profile'];
  const dict={
    'pt-br':['Assista ao mesmo filme ou vídeo com seus amigos em uma sala sincronizada.','Pagamento único · acesso permanente','≈ R$ 27,19 · € 4,49 (estimativas; valor final na Stripe)','Sua tag exclusiva','Receba a tag dourada Happier Than Ever após a confirmação do pagamento.','Inclui +1 acesso para presentear','Depois de pagar, escolha um amigo pelo @usuário. Ele recebe acesso permanente e a mesma tag dourada, sem pagar nada.','Desbloqueie sua Watch Party agora','Fechar','Entre na sua conta BETV para continuar.','Conectando à Stripe…','Verificando pagamento na Stripe…','Pagamento confirmado! Sua Watch Party está ativa.','Pagamento ainda não confirmado.','Acesso ativado','Você já tem acesso à Watch Party.','Seu presente +1','Escolha um fã para dar acesso permanente e a tag Happier Than Ever.','Pesquisar @usuário','Digite pelo menos duas letras para encontrar um fã.','Nenhum fã encontrado.','Presentear este fã','Escolher outro fã','Presente enviado! Seu amigo já tem acesso e a tag dourada.','Você já presenteou','O presente +1 é exclusivo de quem comprou o desbloqueio.','Esse fã já tem acesso. Escolha outro.','Não foi possível concluir. Tente novamente.','Assista junto com seu amigo','Selecionar','Acesso concedido a','Seu perfil BETV'],
    'en-us':['Watch the same movie or video with friends in a synchronized room.','One-time payment · lifetime access','≈ R$27.19 · €4.49 (estimates; final amount at Stripe)','Your exclusive badge','Get the gold Happier Than Ever badge after payment is confirmed.','Includes one free access to gift','After paying, choose a friend by @username. They get lifetime access and the same gold badge at no extra cost.','Unlock Watch Party & watch together','Close','Sign in to your BETV account to continue.','Connecting to Stripe…','Verifying payment with Stripe…','Payment confirmed! Watch Party is active.','Payment not yet confirmed.','Access unlocked','You already have Watch Party access.','Your +1 gift','Choose a fan to give lifetime access and the Happier Than Ever badge.','Search @username','Type at least two characters to find a fan.','No fans found.','Gift access to this fan','Choose another fan','Gift sent! Your friend now has access and the gold badge.','You have already gifted access to','The +1 gift is only for members who purchased access.','This fan already has access. Choose someone else.','Could not complete the request. Please try again.','Watch together with a friend','Select','Access granted to','Your BETV profile'],
    es:['Mira la misma película o vídeo con amigos en una sala sincronizada.','Pago único · acceso permanente','≈ 27,19 R$ · 4,49 € (estimaciones; importe final en Stripe)','Tu insignia exclusiva','Recibe la insignia dorada Happier Than Ever tras confirmar el pago.','Incluye 1 acceso para regalar','Después de pagar, elige a un amigo por su @usuario. Recibirá acceso permanente y la misma insignia dorada gratis.','Desbloquea Watch Party y disfruta','Cerrar','Inicia sesión en BETV para continuar.','Conectando con Stripe…','Verificando el pago en Stripe…','¡Pago confirmado! Watch Party está activa.','Pago aún no confirmado.','Acceso activado','Ya tienes acceso a Watch Party.','Tu regalo +1','Elige a un fan para regalar acceso permanente y la insignia Happier Than Ever.','Buscar @usuario','Escribe al menos dos letras para encontrar un fan.','No se encontraron fans.','Regalar acceso a este fan','Elegir otro fan','¡Regalo enviado! Tu amigo ya tiene acceso y la insignia dorada.','Ya regalaste acceso a','El regalo +1 es exclusivo de quienes compran el acceso.','Este fan ya tiene acceso. Elige a otro.','No se pudo completar. Inténtalo de nuevo.','Mira contenido con un amigo','Seleccionar','Acceso concedido a','Tu perfil BETV'],
    fr:['Regardez le même film ou la même vidéo avec vos amis dans un salon synchronisé.','Paiement unique · accès à vie','≈ 27,19 R$ · 4,49 € (estimations ; montant final sur Stripe)','Votre badge exclusif','Recevez le badge doré Happier Than Ever après confirmation du paiement.','Inclut un accès à offrir','Après paiement, choisissez un ami par son @pseudo. Il recevra gratuitement un accès à vie et le même badge doré.','Débloquez Watch Party maintenant','Fermer','Connectez-vous à votre compte BETV pour continuer.','Connexion à Stripe…','Vérification du paiement auprès de Stripe…','Paiement confirmé ! Watch Party est active.','Paiement pas encore confirmé.','Accès activé','Vous avez déjà accès à Watch Party.','Votre cadeau +1','Choisissez un fan qui recevra un accès à vie et le badge Happier Than Ever.','Chercher un @pseudo','Saisissez au moins deux caractères pour trouver un fan.','Aucun fan trouvé.','Offrir cet accès','Choisir un autre fan','Cadeau envoyé ! Votre ami a désormais accès et le badge doré.','Vous avez déjà offert l’accès à','Le cadeau +1 est réservé aux personnes ayant acheté l’accès.','Ce fan a déjà accès. Choisissez quelqu’un d’autre.','Impossible de terminer. Veuillez réessayer.','Regardez ensemble avec un ami','Sélectionner','Accès accordé à','Votre profil BETV'],
    it:['Guarda lo stesso film o video con gli amici in una stanza sincronizzata.','Pagamento una tantum · accesso permanente','≈ 27,19 R$ · 4,49 € (stime; importo finale su Stripe)','Il tuo badge esclusivo','Ricevi il badge dorato Happier Than Ever dopo la conferma del pagamento.','Include 1 accesso da regalare','Dopo il pagamento, scegli un amico tramite @utente. Riceverà gratis accesso permanente e lo stesso badge dorato.','Sblocca Watch Party e guarda insieme','Chiudi','Accedi al tuo account BETV per continuare.','Connessione a Stripe…','Verifica del pagamento con Stripe…','Pagamento confermato! Watch Party è attiva.','Pagamento non ancora confermato.','Accesso attivato','Hai già accesso a Watch Party.','Il tuo regalo +1','Scegli un fan a cui regalare accesso permanente e il badge Happier Than Ever.','Cerca @utente','Digita almeno due caratteri per trovare un fan.','Nessun fan trovato.','Regala accesso a questo fan','Scegli un altro fan','Regalo inviato! Il tuo amico ha già accesso e il badge dorato.','Hai già regalato l’accesso a','Il regalo +1 è riservato a chi ha acquistato l’accesso.','Questo fan ha già accesso. Scegline un altro.','Impossibile completare. Riprova.','Guarda insieme a un amico','Seleziona','Accesso concesso a','Il tuo profilo BETV']
  };
  const t = key => {
    const index=keys.indexOf(key),locale=String(window.BETVLocale?.slug||'pt-br').toLowerCase();
    return (dict[locale]||dict['pt-br'])[index] || dict['pt-br'][index] || key;
  };
  const pixWords={"pt-br":{"pay":"Pagar com Pix","panel":"Pagamento Pix","title":"Pagamento via Pix","back":"Voltar","instructions":"Escaneie o QR Code ou copie o código Pix. O acesso é liberado após a confirmação.","copyLabel":"Pix copia e cola","copyCodeLabel":"Código Pix para copiar","copy":"Copiar código Pix","copied":"Código Pix copiado.","copyFallback":"Código selecionado. Use Copiar no menu do aparelho.","waiting":"Aguardando confirmação do Mercado Pago…","status":"Status: ","verification":"Verificação indisponível. Tentaremos novamente.","generating":"Gerando Pix seguro…","errorPrefix":"Não foi possível gerar o Pix: ","retry":"tente novamente","stripeUnavailable":"Pix indisponível nesta conta Stripe. Tente o pagamento por cartão."},"en-us":{"pay":"Pay with Pix","panel":"Pix payment","title":"Pay via Pix","back":"Back","instructions":"Scan the QR code or copy the Pix code. Access unlocks after payment confirmation.","copyLabel":"Pix copy and paste","copyCodeLabel":"Pix code to copy","copy":"Copy Pix code","copied":"Pix code copied.","copyFallback":"Code selected. Use Copy in your device menu.","waiting":"Waiting for Mercado Pago confirmation…","status":"Status: ","verification":"Verification unavailable. We will try again.","generating":"Generating a secure Pix payment…","errorPrefix":"Could not generate Pix: ","retry":"try again","stripeUnavailable":"Pix is unavailable on this Stripe account. Please pay by card."},"es":{"pay":"Pagar con Pix","panel":"Pago Pix","title":"Pago mediante Pix","back":"Volver","instructions":"Escanea el código QR o copia el código Pix. El acceso se activa tras la confirmación.","copyLabel":"Pix copia y pega","copyCodeLabel":"Código Pix para copiar","copy":"Copiar código Pix","copied":"Código Pix copiado.","copyFallback":"Código seleccionado. Usa Copiar en el menú del dispositivo.","waiting":"Esperando confirmación de Mercado Pago…","status":"Estado: ","verification":"No se puede verificar ahora. Volveremos a intentarlo.","generating":"Generando un pago Pix seguro…","errorPrefix":"No se pudo generar Pix: ","retry":"inténtalo de nuevo","stripeUnavailable":"Pix no está disponible en esta cuenta de Stripe. Paga con tarjeta."},"fr":{"pay":"Payer avec Pix","panel":"Paiement Pix","title":"Paiement via Pix","back":"Retour","instructions":"Scannez le code QR ou copiez le code Pix. L’accès est activé après confirmation.","copyLabel":"Code Pix à copier-coller","copyCodeLabel":"Code Pix à copier","copy":"Copier le code Pix","copied":"Code Pix copié.","copyFallback":"Code sélectionné. Utilisez Copier dans le menu de votre appareil.","waiting":"En attente de la confirmation de Mercado Pago…","status":"Statut : ","verification":"Vérification indisponible. Nous réessaierons.","generating":"Création du paiement Pix sécurisé…","errorPrefix":"Impossible de générer le Pix : ","retry":"réessayez","stripeUnavailable":"Pix n’est pas disponible sur ce compte Stripe. Payez par carte."},"it":{"pay":"Paga con Pix","panel":"Pagamento Pix","title":"Pagamento tramite Pix","back":"Indietro","instructions":"Scansiona il codice QR o copia il codice Pix. L’accesso viene attivato dopo la conferma.","copyLabel":"Pix copia e incolla","copyCodeLabel":"Codice Pix da copiare","copy":"Copia il codice Pix","copied":"Codice Pix copiato.","copyFallback":"Codice selezionato. Usa Copia nel menu del dispositivo.","waiting":"In attesa di conferma da Mercado Pago…","status":"Stato: ","verification":"Verifica non disponibile. Riproveremo.","generating":"Generazione del pagamento Pix sicuro…","errorPrefix":"Impossibile generare il Pix: ","retry":"riprova","stripeUnavailable":"Pix non è disponibile su questo account Stripe. Paga con carta."}};
  const px=key=>(pixWords[String(window.BETVLocale?.slug||'pt-br').toLowerCase()]||pixWords['pt-br'])[key];
  function renderPixLocale(){
    if(!panel)return;
    $('watchPartyUnlockPix').textContent=px('pay');
    $('watchPartyPixPanel').setAttribute('aria-label',px('panel'));
    $('watchPartyPixPanel').querySelector('.watch-party-pix-head strong').textContent=px('title');
    $('watchPartyPixBack').setAttribute('aria-label',px('back'));
    $('watchPartyPixInstructions').textContent=px('instructions');
    $('watchPartyPixCodeLabel').textContent=px('copyLabel');
    $('watchPartyPixCode').setAttribute('aria-label',px('copyCodeLabel'));
    $('watchPartyPixCopy').textContent=px('copy');
  }
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
  let verifyingPayment=false,pendingTimer=0,pendingTries=0,pixData=null,pixTimer=0,pixChecking=false;
  const pixStorage=()=> 'betvWatchPartyPix:'+String(user()?.uid||'guest');
  const loadPix=()=>{try{const o=JSON.parse(localStorage.getItem(pixStorage())||'null');return o&&Date.now()-Number(o.savedAt||0)<35*60000&&/^[0-9]{5,25}$/.test(o.paymentId)?o:null;}catch(_){return null;}};
  const savePix=v=>{try{localStorage.setItem(pixStorage(),JSON.stringify({...v,savedAt:Date.now()}));}catch(_){}};
  const clearPix=()=>{clearInterval(pixTimer);pixTimer=0;pixData=null;try{localStorage.removeItem(pixStorage());}catch(_){}};
  const pendingStorageKey=()=> 'betvWatchPartyPending:'+String(user()?.uid||'guest');
  const pendingSession=()=>{
    try{
      const pending=JSON.parse(localStorage.getItem(pendingStorageKey())||'null');
      if(!pending||Number(pending.expiresAt)<Date.now()){localStorage.removeItem(pendingStorageKey());return '';}
      const id=String(pending.sessionId||'');
      return /^cs_(test|live)_[a-zA-Z0-9]{10,200}$/.test(id)?id:'';
    }catch(_){return '';}
  };
  const rememberPending=id=>{try{localStorage.setItem(pendingStorageKey(),JSON.stringify({sessionId:id,expiresAt:Date.now()+86400000}));}catch(_){}};
  const forgetPending=()=>{clearTimeout(pendingTimer);pendingTries=0;try{localStorage.removeItem(pendingStorageKey());}catch(_){}};
  function create(){
    if(panel)return;
    panel=document.createElement('div');panel.id='watchPartyPaywall';panel.className='watch-party-paywall';panel.hidden=true;
    panel.innerHTML='<div class="watch-party-paywall-overlay"></div><section class="watch-party-unlock-card" role="dialog" aria-modal="true" aria-labelledby="watchPartyUnlockTitle">'+
      '<div class="watch-party-ios-handle" aria-hidden="true"></div><button class="watch-party-unlock-close" id="watchPartyUnlockClose" type="button" aria-label="Fechar"><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>'+
      '<div class="watch-party-paywall-profile"><div class="watch-party-paywall-banner"><img id="watchPartyPaywallBanner" hidden alt=""></div>'+
      '<div class="watch-party-paywall-identity"><span class="watch-party-paywall-avatar" id="watchPartyPaywallAvatar"></span><div class="watch-party-paywall-names"><strong id="watchPartyPaywallName"></strong><span class="watch-party-gold-tag watch-party-preview-tag notranslate" translate="no" title="Prévia da tag">Happier Than Ever</span><span id="watchPartyPaywallUsername" hidden></span></div></div></div>'+
      '<h2 id="watchPartyUnlockTitle">Watch Party</h2><p id="watchPartyUnlockDescription"></p>'+
      '<div id="watchPartyPurchaseSection"><div class="watch-party-unlock-price"><strong id="watchPartyUnlockPrice"></strong><span id="watchPartyOneTime"></span></div>'+
      '<div class="watch-party-unlock-reward"><span class="watch-party-gold-tag notranslate" translate="no">Happier Than Ever</span><div><strong id="watchPartyRewardTitle"></strong><span id="watchPartyRewardInfo"></span></div></div>'+
      '<div class="watch-party-unlock-plus"><strong id="watchPartyPlusTitle"></strong><p id="watchPartyPlusInfo"></p></div>'+
      '<button id="watchPartyUnlockCheckout" type="button" class="watch-party-unlock-checkout"></button><button id="watchPartyUnlockPix" type="button" class="watch-party-unlock-pix" hidden>Pagar com Pix</button></div>'+ 
      '<section id="watchPartyPixPanel" class="watch-party-pix-panel" hidden aria-label="Pagamento Pix"><header class="watch-party-pix-head"><strong>Pagamento via Pix</strong><button type="button" id="watchPartyPixBack" aria-label="Voltar">×</button></header><p id="watchPartyPixInstructions">Escaneie o QR Code ou copie o código Pix. O acesso é liberado após a confirmação.</p><img id="watchPartyPixQr" alt="QR Code Pix" hidden><label id="watchPartyPixCodeLabel" class="watch-party-pix-copy-label" for="watchPartyPixCode">Pix copia e cola</label><textarea id="watchPartyPixCode" rows="2" readonly spellcheck="false" aria-label="Código Pix para copiar"></textarea><button type="button" id="watchPartyPixCopy" class="watch-party-unlock-checkout">Copiar código Pix</button><p id="watchPartyPixStatus" aria-live="polite"></p></section>'+
      '<div id="watchPartyGiftSection" class="watch-party-gift-section" hidden><p id="watchPartyGiftInfo"></p>'+
      '<div id="watchPartyGiftUsed" class="watch-party-gift-used" hidden></div><div id="watchPartyGiftPicker" hidden>'+
      '<label for="watchPartyGiftSearch" id="watchPartyGiftSearchLabel"></label><input type="search" id="watchPartyGiftSearch" autocomplete="off" spellcheck="false" maxlength="40">'+
      '<div class="watch-party-gift-results" id="watchPartyGiftResults"></div><div class="watch-party-selected-card" id="watchPartySelectedCard" hidden></div>'+
      '<button id="watchPartyGiftConfirm" type="button" class="watch-party-unlock-checkout" hidden></button>'+
      '<button id="watchPartyGiftCancel" type="button" class="watch-party-ios-secondary" hidden></button></div></div>'+
      '<div id="watchPartyUnlockedPanel" hidden><div class="watch-party-unlocked-copy"><strong id="watchPartyUnlockedTitle">Acesso ativado</strong><p id="watchPartyUnlockedInfo">Você já tem acesso à Watch Party.</p></div><button type="button" id="watchPartyUnlockedDone">Fechar</button></div><p id="watchPartyUnlockStatus" class="watch-party-unlock-status" role="status" aria-live="polite"></p></section>';
    document.body.append(panel);
    panel.querySelector('.watch-party-paywall-overlay').addEventListener('click',close);
    $('watchPartyUnlockClose').addEventListener('click',close);
    $('watchPartyUnlockedDone').addEventListener('click',close);
    $('watchPartyUnlockCheckout').addEventListener('click',()=>checkout('card'));$('watchPartyUnlockPix').addEventListener('click',()=>startPix());
    $('watchPartyPixBack').addEventListener('click',()=>{clearInterval(pixTimer);pixTimer=0;$('watchPartyPixPanel').hidden=true;render();});
    $('watchPartyPixCopy').addEventListener('click',async()=>{const code=String(pixData?.qrCode||'');if(!code)return;const area=$('watchPartyPixCode');try{if(!navigator.clipboard?.writeText)throw Error('clipboard_unavailable');await navigator.clipboard.writeText(code);$('watchPartyPixStatus').textContent=px('copied');}catch(_){area.focus();area.select();$('watchPartyPixStatus').textContent=px('copyFallback');}});
    $('watchPartyGiftSearch').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(findFans,260);});
    $('watchPartyGiftConfirm').addEventListener('click',sendGift);
    $('watchPartyGiftCancel').addEventListener('click',()=>{selected=null;renderGift();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel&&!panel.hidden)close();});
  }
  function status(message){if($('watchPartyUnlockStatus'))$('watchPartyUnlockStatus').textContent=message||'';}
  // Use BETV's existing login route instead of displaying the paid sheet to guests.
  function goToLogin(){
    if(panel)panel.hidden=true;
    if(typeof window.BETVPublicRoutes?.go==='function'){
      window.BETVPublicRoutes.go('/login');
      document.body.classList.add('login-mode');
    }else{
      location.assign(typeof window.BETVLocaleURL==='function'?window.BETVLocaleURL('/login'):'/login');
    }
  }
  function open(){
    if(!user()){goToLogin();return;}
    create();panel.hidden=false;render();loadMyProfile();if(unlocked)loadGift();else if(loadPix()){pixData=loadPix();showPix();}
    if(!verifyingPayment&&!unlocked&&pendingSession())queueMicrotask(()=>verifyReturn());
  }
  function close(){if(panel)panel.hidden=true;clearTimeout(pendingTimer);clearInterval(pixTimer);pixTimer=0;}
  async function loadMyProfile(){
    let profile=null;
    try{if(user()?.uid)profile=await window.beBackend?.profiles?.get(user().uid,{force:true});}catch(_){}
    if(!panel)return;
    const name=String(profile?.displayName||profile?.display_name||user()?.displayName||user()?.username||t('profile'));
    const username=String(profile?.username||user()?.username||'').trim();
    $('watchPartyPaywallName').textContent=name;
    $('watchPartyPaywallUsername').textContent='';
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
      if(unlocked)await loadGift();window.dispatchEvent(new Event('be:watch-party-gift-status'));
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
      if(data!=='gift_pending')throw Error(t('error'));
      selected=null;giftInfo=null;await loadGift();status(t('giftDone'));window.dispatchEvent(new Event('be:watch-party-gift-status'));
    }catch(e){status(e.message||t('error'));}
    finally{busy=false;$('watchPartyGiftConfirm').disabled=false;}
  }
  function showPix(){
    if(!panel||!pixData)return;
    panel.hidden=false;
    $('watchPartyPurchaseSection').hidden=true;
    $('watchPartyPixPanel').hidden=false;renderPixLocale();
    const image=$('watchPartyPixQr');
    const b64=String(pixData.qrCodeBase64||'').replace(/\s/g,'');
    if(/^[A-Za-z0-9+/=]+$/.test(b64)&&b64.length<100000){image.src='data:image/png;base64,'+b64;image.hidden=false;}
    else {image.hidden=true;image.removeAttribute('src');}
    $('watchPartyPixCode').value=String(pixData.qrCode||'');
    $('watchPartyPixCopy').disabled=!pixData.qrCode;
    $('watchPartyPixStatus').textContent=px('waiting');
    clearInterval(pixTimer);pixTimer=setInterval(checkPix,8000);
    checkPix();
  }
  async function checkPix(){
    if(pixChecking||!pixData||!user())return;
    pixChecking=true;
    try{
      const {data,error}=await client().functions.invoke('watch-party-pix',{body:{action:'status',paymentId:pixData.paymentId}});
      if(error||data?.error)throw Error(String(data?.error||'pix_status_unavailable'));
      if(data?.unlocked){
        clearPix();unlocked=true;checked=true;giftInfo=null;
        $('watchPartyPixPanel').hidden=true;render();await loadGift();status(t('confirmed'));
        window.dispatchEvent(new Event('be:watch-party-gift-status'));
        window.dispatchEvent(new Event('be:community-tag-updated'));
      }else if(pixData&&data?.status&&data.status!=='pending'){
        $('watchPartyPixStatus').textContent=px('status')+String(data.status).slice(0,40);
      }
    }catch(_){if($('watchPartyPixStatus'))$('watchPartyPixStatus').textContent=px('verification');}
    finally{pixChecking=false;}
  }
  async function startPix(){
    if(busy||!user())return;
    pixData=loadPix();
    if(pixData){showPix();return;}
    busy=true;
    const button=$('watchPartyUnlockPix');button.disabled=true;
    status(px('generating'));
    try{
      const requestId=window.crypto?.randomUUID?.();
      if(!requestId)throw Error('pix_request_unavailable');
      const {data,error}=await client().functions.invoke('watch-party-pix',{body:{action:'create',requestId}});
      if(error||data?.error)throw Error(String(data?.error||'pix_creation_failed'));
      if(data?.unlocked){unlocked=true;checked=true;render();return;}
      if(!data?.paymentId)throw Error('pix_missing_code');
      pixData={paymentId:String(data.paymentId),qrCode:String(data.qrCode||''),qrCodeBase64:String(data.qrCodeBase64||'')};
      savePix(pixData);showPix();status('');
    }catch(e){status(px('errorPrefix')+String(e.message||px('retry')));}
    finally{busy=false;button.disabled=false;}
  }
  async function checkout(method='card'){
    if(busy)return;
    busy=true;const button=$('watchPartyUnlockCheckout'),pix=$('watchPartyUnlockPix');button.disabled=true;pix.disabled=true;status('');
    try{
      const data=await invoke({action:'create',locale:String(window.BETVLocale?.slug||'pt-br').toLowerCase(),paymentMethod:method});
      if(data?.unlocked){unlocked=true;checked=true;render();await loadGift();return;}
      const url=new URL(String(data?.url||''));
      if(url.protocol!=='https:'||!/(^|\.)stripe\.com$/.test(url.hostname))throw Error(t('error'));
      if(method==='pix'&&data.session_id)rememberPending(data.session_id);
      location.assign(url.href);
    }catch(e){const msg=String(e.message||'');status(msg==='pix_not_available'?px('stripeUnavailable'):(msg||t('error')));}
    finally{busy=false;button.disabled=false;pix.disabled=false;}
  }
  async function verifyReturn(){
    if(verifyingPayment||!user())return;
    const params=new URLSearchParams(location.search);
    const checkoutReturn=params.get('watch_party_checkout')==='success';
    const sessionId=(checkoutReturn?params.get('session_id'):'')||pendingSession();
    if(!sessionId||!/^cs_(test|live)_[a-zA-Z0-9]{10,200}$/.test(sessionId))return;
    if(checkoutReturn){
      const url=new URL(location.href);url.searchParams.delete('watch_party_checkout');url.searchParams.delete('session_id');
      history.replaceState(history.state,'',url.pathname+url.search+url.hash);
    }
    verifyingPayment=true;clearTimeout(pendingTimer);
    open();status(t('verifying'));
    try{
      const result=await invoke({action:'verify',session_id:sessionId});
      if(result?.pending){
        if(!pendingSession())rememberPending(sessionId);
        const waiting={
          'pt-br':'Aguardando a confirmação do pagamento. Você pode voltar mais tarde; verificaremos novamente.',
          'en-us':'Waiting for payment confirmation. You can return later; we will check again.',
          es:'Esperando la confirmación del pago. Puedes volver más tarde; lo verificaremos de nuevo.',
          fr:'En attente de la confirmation du paiement. Vous pouvez revenir plus tard ; nous vérifierons à nouveau.',
          it:'In attesa della conferma del pagamento. Puoi tornare più tardi; controlleremo di nuovo.'
        };
        status(waiting[String(window.BETVLocale?.slug||'pt-br').toLowerCase()]||waiting['pt-br']);
        if(!panel.hidden&&pendingTries<24){pendingTries++;pendingTimer=setTimeout(()=>verifyReturn(),15000);}
        return;
      }
      if(!result?.unlocked)throw Error(t('notConfirmed'));
      forgetPending();unlocked=true;checked=true;giftInfo=null;render();await loadGift();status(t('confirmed'));
      window.dispatchEvent(new CustomEvent('be:community-tag-updated',{detail:{userId:user()?.uid,tag:'happier_than_ever'}}));
    }catch(_){status(t('notConfirmed'));}
    finally{verifyingPayment=false;}
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
      renderPixLocale();
      $('watchPartyUnlockClose').setAttribute('aria-label',t('close'));
      const card=panel.querySelector('.watch-party-unlock-card');
      card?.classList.toggle('is-unlocked',unlocked);
      card?.setAttribute('aria-labelledby',unlocked?'watchPartyUnlockedTitle':'watchPartyUnlockTitle');
      $('watchPartyUnlockTitle').textContent='Watch Party';
      $('watchPartyUnlockTitle').hidden=unlocked;
      $('watchPartyUnlockDescription').textContent=unlocked?'':t('description');
      $('watchPartyUnlockDescription').hidden=unlocked;
      $('watchPartyPurchaseSection').hidden=unlocked;
      $('watchPartyUnlockedPanel').hidden=!unlocked;
      $('watchPartyUnlockedTitle').textContent=t('unlocked');
      $('watchPartyUnlockedInfo').textContent=t('unlockedInfo');
      $('watchPartyUnlockedDone').textContent=t('close');
      $('watchPartyGiftSection').hidden=!unlocked;
      $('watchPartyUnlockPrice').textContent=priceForLocale().text;
      $('watchPartyOneTime').textContent=t('oneTime');
      $('watchPartyRewardTitle').textContent=t('reward');$('watchPartyRewardInfo').textContent=t('rewardInfo');
      $('watchPartyPlusTitle').textContent=t('plus');$('watchPartyPlusInfo').textContent=t('plusInfo');
      $('watchPartyUnlockCheckout').textContent=t('checkout');$('watchPartyUnlockPix').hidden=unlocked||String(window.BETVLocale?.slug||'pt-br').toLowerCase()!=='pt-br';if(unlocked){$('watchPartyPixPanel').hidden=true;clearPix();renderGift();}
    }
    const button=$('contentDetailWatchParty');
    if(button){
      const play=$('contentDetailPlay');
      if(play&&play.nextElementSibling!==button)play.insertAdjacentElement('afterend',button);
      button.classList.add('watch-party-main-cta');
      button.dataset.watchPartyUnlock=unlocked?'true':'false';
      const actionLabel=({'pt-br':'Assistir junto','en-us':'Watch together',es:'Ver juntos',fr:'Regarder ensemble',it:'Guarda insieme'})[String(window.BETVLocale?.slug||'pt-br').toLowerCase()]||'Assistir junto';
      button.setAttribute('aria-label',actionLabel);
      const label=button.querySelector('span');if(label)label.textContent=actionLabel;
    }
    promote();
  }
  function guard(event){
    const target=event.target.closest?.('#contentDetailWatchParty,.watch-party-player-button');
    if(!target)return;
    if(!user()){
      event.preventDefault();event.stopImmediatePropagation();
      goToLogin();return;
    }
    if(unlocked)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(!checked)refresh().then(ok=>{if(ok)window.BETVWatchParty?.open?.();else open();});
    else open();
  }
  function initialize(){
    document.addEventListener('click',guard,true);
    new MutationObserver(promote).observe(document.body,{attributes:true,attributeFilter:['class']});
    window.addEventListener('be:content-ready',render);
    window.addEventListener('be:i18n-ready',render);
    window.addEventListener('be:community-tag-updated',render);
    render();
    Promise.resolve(window.beBackend?.ready).then(async()=>{await refresh();await verifyReturn();if(!unlocked&&loadPix()){pixData=loadPix();checkPix();}}).catch(()=>{});
    window.beBackend?.auth?.onChange?.(()=>refresh());
  }
  window.BETVWatchPartyPaywall=Object.freeze({open,isUnlocked:()=>unlocked,canGift:()=>Boolean(giftInfo?.eligible&&!giftInfo?.gifted_to),refresh});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
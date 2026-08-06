/* Página pública Apoie uma ONG. */
;(function(){
  'use strict';
  if(String(location.hash||'').startsWith('#/admin'))return;

  var page=document.getElementById('donatePage');
  var hero=document.getElementById('donateHero');
  var list=document.getElementById('donateNgoList');
  var status=document.getElementById('donatePageStatus');
  var showMoreButton=document.getElementById('donateNgoShowMore');
  var supportersSection=document.getElementById('donateSupportersSection');
  var supportersList=document.getElementById('donateSupportersList');
  var supportersStatus=document.getElementById('donateSupportersStatus');
  if(!page||!hero||!list||!status)return;

  var loaded=false;
  var loading=null;
  var supportersLoaded=false;
  var supportersLoading=null;
  var ngoRecordCount=0;
  var visibleNgoCount=0;
  var notificationItems=[];
  var notificationLoaded=false;
  var notificationLoading=null;
  var NOTIFICATION_STORAGE_KEY='beNotificationsLastSeen';

  var home=document.getElementById('donatePageHome');
  var notificationButton=document.getElementById('donatePageNotifications');
  var notificationWrap=notificationButton&&notificationButton.closest('.donate-notification-wrap');
  var notificationPopup=document.getElementById('donateNotificationDropdown');
  var notificationPreviewList=document.getElementById('donateNotificationPreviewList');
  var notificationMarkAll=document.getElementById('donateNotificationMarkAll');
  var notificationClose=document.getElementById('donateNotificationClose');
  var notificationViewAll=document.getElementById('donateNotificationViewAll');
  var avatar=document.getElementById('donatePageAvatar');

  var CHECKOUT_FUNCTION_NAME='create-donation-checkout';
  var DEFAULT_MINIMUM_DONATION_CENTS=500;
  var NGO_BATCH_SIZE=12;
  var SUPPORTERS_LIMIT=48;
  var ngoMobileMedia=window.matchMedia?window.matchMedia('(max-width:760px)'):null;

  function cleanPath(){try{return decodeURIComponent(String(location.pathname||'/')).replace(/\/+$/,'')||'/';}catch(_){return String(location.pathname||'/').replace(/\/+$/,'')||'/';}}
  function isRoute(){var path=cleanPath().toLowerCase(),hash=String(location.hash||'').toLowerCase();return path==='/ong'||hash==='#ong'||hash==='#/ong';}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}
  function imageUrl(value){var raw=String(value||'').trim();if(!raw)return '';var resolved=typeof window.beMediaUrl==='function'?window.beMediaUrl(raw):raw;return resolved&&resolved!=='#'?resolved:'';}
  function active(item){return item&&item.active!==false&&String(item.active).toLowerCase()!=='false';}
  function donationSlug(value){return String(value||'ong').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'ong';}
  function parseDonationCents(value){
    var raw=String(value||'').trim().replace(/^r\$\s*/i,'').replace(/\s+/g,'').replace(/[^0-9.,]/g,'');
    if(!raw)return NaN;
    var comma=raw.lastIndexOf(','),dot=raw.lastIndexOf('.'),decimal=Math.max(comma,dot);
    var normalized;
    if(decimal>=0){
      var integer=raw.slice(0,decimal).replace(/[.,]/g,'')||'0';
      var fraction=raw.slice(decimal+1).replace(/[.,]/g,'').slice(0,2);
      normalized=integer+'.'+fraction;
    }else normalized=raw;
    var amount=Number(normalized);
    return Number.isFinite(amount)?Math.round(amount*100):NaN;
  }
  function formatDonationCents(cents){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);}
  function minimumDonationCents(value){
    var cents=Number(value);
    return Number.isInteger(cents)&&cents>=100&&cents<=100000000?cents:DEFAULT_MINIMUM_DONATION_CENTS;
  }
  function donationRequestId(){
    if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();
    if(window.crypto&&typeof window.crypto.getRandomValues==='function'){
      var bytes=new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      bytes[6]=(bytes[6]&15)|64;
      bytes[8]=(bytes[8]&63)|128;
      var hex=Array.prototype.map.call(bytes,function(value){return value.toString(16).padStart(2,'0');}).join('');
      return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
    }
    throw new Error('O navegador não conseguiu gerar uma identificação segura para o pagamento.');
  }
  function checkoutErrorMessage(error,data){
    var code=String(data&&data.code||'');
    if(code==='below_minimum')return 'O valor mínimo desta ONG é '+formatDonationCents(Number(data.minimumDonationCents)||DEFAULT_MINIMUM_DONATION_CENTS)+'.';
    if(code==='rate_limited')return 'Muitas tentativas seguidas. Aguarde um minuto e tente novamente.';
    if(code==='stripe_not_configured')return 'O checkout ainda não foi configurado no servidor.';
    if(code==='ngo_not_found')return 'Esta ONG não está mais disponível.';
    return String(data&&data.error||error&&error.message||'Não foi possível abrir o checkout agora.');
  }
  async function createDonationCheckout(ngoId,cents,requestId){
    var client=window.beBackend&&window.beBackend.client;
    if(!client||!client.functions||typeof client.functions.invoke!=='function')throw new Error('O checkout seguro não está disponível.');
    var result=await client.functions.invoke(CHECKOUT_FUNCTION_NAME,{body:{ngoId:String(ngoId||''),amountCents:cents,requestId:requestId}});
    var data=result&&result.data&&typeof result.data==='object'?result.data:null;
    if(result&&result.error){
      try{if(result.error.context&&typeof result.error.context.json==='function')data=await result.error.context.json();}catch(_){ }
      var failure=new Error(checkoutErrorMessage(result.error,data));
      failure.data=data;
      throw failure;
    }
    var url=String(data&&data.url||'');
    try{
      var parsed=new URL(url);
      if(parsed.protocol!=='https:'||!/(^|\.)stripe\.com$/i.test(parsed.hostname))throw new Error('invalid_checkout_url');
    }catch(_){throw new Error('A Stripe não retornou um checkout válido.');}
    return url;
  }

  function applyPageBanner(settings){
    var banner=imageUrl(settings&&settings.bannerUrl||'');
    if(!banner){hero.classList.remove('has-banner');hero.style.removeProperty('--donate-hero-banner');return;}
    var safe=banner.replace(/["\n\r]/g,'');
    hero.style.setProperty('--donate-hero-banner','url("'+safe+'")');
    hero.classList.add('has-banner');
  }

  function syncAvatar(){
    var source=document.getElementById('publicUserPhoto');
    var image=document.getElementById('donatePageAvatarImage');
    var fallback=document.getElementById('donatePageAvatarFallback');
    if(!image||!fallback)return;
    var src=source&&!source.hidden?String(source.currentSrc||source.src||'').trim():'';
    if(src){image.src=src;image.hidden=false;fallback.hidden=true;}
    else{image.removeAttribute('src');image.hidden=true;fallback.hidden=false;}
  }

  function syncUnread(){
    var source=document.getElementById('notificationUnreadDot');
    var dot=document.getElementById('donatePageUnreadDot');
    if(dot)dot.hidden=!source||source.hidden;
  }

  function isMobileNgoCarousel(){
    return ngoMobileMedia?ngoMobileMedia.matches:window.innerWidth<=760;
  }

  function updateShowMoreButton(){
    if(!showMoreButton)return;
    var hasMore=!isMobileNgoCarousel()&&visibleNgoCount<ngoRecordCount;
    showMoreButton.hidden=!hasMore;
    showMoreButton.setAttribute('aria-hidden',String(!hasMore));
  }

  function syncNgoVisibility(){
    var showAll=isMobileNgoCarousel();
    list.querySelectorAll('[data-ngo-card]').forEach(function(card,index){
      card.hidden=!showAll&&index>=visibleNgoCount;
    });
    updateShowMoreButton();
  }

  function showNextNgoBatch(){
    if(isMobileNgoCarousel()||visibleNgoCount>=ngoRecordCount)return;
    visibleNgoCount=Math.min(visibleNgoCount+NGO_BATCH_SIZE,ngoRecordCount);
    syncNgoVisibility();
  }

  function render(items){
    var records=(Array.isArray(items)?items:[]).filter(active).sort(function(a,b){return (Number(a.order)||0)-(Number(b.order)||0);});
    ngoRecordCount=records.length;
    visibleNgoCount=Math.min(NGO_BATCH_SIZE,ngoRecordCount);
    if(!records.length){list.innerHTML='';status.hidden=false;status.textContent='Nenhuma ONG foi publicada ainda.';updateShowMoreButton();return;}
    status.hidden=true;
    list.innerHTML=records.map(function(item,index){
      var title=String(item.title||item.name||'ONG').trim();
      var description=String(item.description||'Conheça a atuação desta organização e escolha apoiar esta causa.').trim();
      var image=imageUrl(item.imageUrl||item.bannerUrl||item.thumbnailUrl||'');
      var id='donate-ngo-'+String(item.id||index).replace(/[^a-z0-9_-]/gi,'-');
      var amountId=id+'-amount',hintId=id+'-amount-hint',errorId=id+'-amount-error';
      var ngoReference=String(item.id||donationSlug(title));
      var minimumCents=minimumDonationCents(item.minimumDonationCents);
      var minimumLabel=formatDonationCents(minimumCents);
      return '<article class="donate-ngo-card" data-ngo-card>'+ 
        '<button class="donate-ngo-toggle" type="button" aria-expanded="false" aria-controls="'+esc(id)+'" aria-label="Conhecer '+esc(title)+'" data-ngo-title="'+esc(title)+'">'+
          (image?'<img loading="lazy" decoding="async" src="'+esc(image)+'" alt="Banner da '+esc(title)+'">':'<span class="donate-ngo-placeholder" aria-hidden="true">'+esc(title.slice(0,2).toUpperCase())+'</span>')+
        '</button>'+ 
        '<div class="donate-ngo-details" id="'+esc(id)+'"><div class="donate-ngo-details-inner"><div class="donate-ngo-details-content"><h3 class="donate-ngo-name">'+esc(title)+'</h3><div class="donate-ngo-description">'+esc(description)+'</div>'+ 
          '<div class="donate-ngo-donation" data-donation-box data-ngo-reference="'+esc(ngoReference)+'" data-minimum-donation-cents="'+esc(minimumCents)+'">'+
            '<label class="donate-ngo-amount-label" for="'+esc(amountId)+'">Qual valor você deseja doar?</label>'+
            '<div class="donate-ngo-amount-field" data-donation-field><span aria-hidden="true">R$</span><input class="donate-ngo-amount-input" id="'+esc(amountId)+'" type="text" inputmode="decimal" autocomplete="off" placeholder="'+esc((minimumCents/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}))+'" aria-describedby="'+esc(hintId)+' '+esc(errorId)+'"></div>'+
            '<div class="donate-ngo-amount-meta"><small id="'+esc(hintId)+'">Valor mínimo: '+esc(minimumLabel)+'</small><small class="donate-ngo-amount-error" id="'+esc(errorId)+'" role="alert" hidden></small></div>'+
            '<button class="donate-ngo-support-button" type="button" data-stripe-donation aria-disabled="true" disabled>Doar</button>'+
          '</div>'+
        '</div></div></div></article>';
    }).join('');
    syncNgoVisibility();

    list.querySelectorAll('.donate-ngo-toggle img').forEach(function(image){
      image.addEventListener('error',function(){
        var button=image.closest('.donate-ngo-toggle');
        if(!button)return;
        var title=button.getAttribute('data-ngo-title')||'ONG';
        var placeholder=document.createElement('span');
        placeholder.className='donate-ngo-placeholder';
        placeholder.setAttribute('aria-hidden','true');
        placeholder.textContent=String(title).trim().slice(0,2).toUpperCase();
        image.replaceWith(placeholder);
      },{once:true});
    });

    list.querySelectorAll('[data-ngo-card]').forEach(function(card){
      var button=card.querySelector('.donate-ngo-toggle');
      button.addEventListener('click',function(){
        var opening=!card.classList.contains('is-open');
        list.querySelectorAll('[data-ngo-card].is-open').forEach(function(other){
          if(other!==card){
            other.classList.remove('is-open');
            var otherButton=other.querySelector('.donate-ngo-toggle');
            if(otherButton)otherButton.setAttribute('aria-expanded','false');
          }
        });
        card.classList.toggle('is-open',opening);
        button.setAttribute('aria-expanded',String(opening));
      });

      var donationBox=card.querySelector('[data-donation-box]');
      var amountInput=donationBox&&donationBox.querySelector('.donate-ngo-amount-input');
      var amountField=donationBox&&donationBox.querySelector('[data-donation-field]');
      var amountError=donationBox&&donationBox.querySelector('.donate-ngo-amount-error');
      var donationLink=donationBox&&donationBox.querySelector('[data-stripe-donation]');
      if(!donationBox||!amountInput||!amountField||!amountError||!donationLink)return;

      var minimumCents=minimumDonationCents(donationBox.getAttribute('data-minimum-donation-cents'));
      var checkoutBusy=false;

      function setCheckoutBusy(busy){
        checkoutBusy=busy;
        donationLink.classList.toggle('is-loading',busy);
        donationLink.setAttribute('aria-busy',String(busy));
        donationLink.disabled=busy||donationLink.getAttribute('aria-disabled')==='true';
        if(busy)donationLink.textContent='Abrindo checkout…';
      }

      function updateDonationButton(showError){
        var value=amountInput.value.trim();
        var cents=parseDonationCents(value);
        var valid=Number.isFinite(cents)&&Number.isInteger(cents)&&cents>=minimumCents&&cents<=100000000;
        var tooLow=value!==''&&Number.isFinite(cents)&&cents<minimumCents;
        var tooHigh=value!==''&&Number.isFinite(cents)&&cents>100000000;
        var invalid=value!==''&&!Number.isFinite(cents);
        var hasError=showError&&(tooLow||tooHigh||invalid);
        amountField.classList.toggle('is-invalid',hasError);
        amountInput.setAttribute('aria-invalid',String(hasError));
        amountError.hidden=!hasError;
        amountError.textContent=tooLow?'O valor mínimo desta ONG é '+formatDonationCents(minimumCents)+'.':(tooHigh?'O valor informado é muito alto.':(invalid?'Digite um valor válido.':''));
        donationLink.setAttribute('aria-disabled',valid?'false':'true');
        donationLink.disabled=!valid||checkoutBusy;
        if(!checkoutBusy)donationLink.textContent=valid?'Doar '+formatDonationCents(cents):'Doar';
        return valid?cents:false;
      }

      amountInput.addEventListener('input',function(){updateDonationButton(true);});
      amountInput.addEventListener('blur',function(){
        var cents=parseDonationCents(amountInput.value);
        if(Number.isFinite(cents))amountInput.value=(cents/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
        updateDonationButton(true);
      });
      amountInput.addEventListener('keydown',function(event){
        if(event.key==='Enter'){
          event.preventDefault();
          if(updateDonationButton(true))donationLink.click();
        }
      });
      donationLink.addEventListener('click',async function(){
        var cents=updateDonationButton(true);
        if(!cents||checkoutBusy){if(!cents)amountInput.focus();return;}
        amountError.hidden=true;
        setCheckoutBusy(true);
        try{
          var requestId=donationRequestId();
          var checkoutUrl=await createDonationCheckout(donationBox.getAttribute('data-ngo-reference'),cents,requestId);
          location.assign(checkoutUrl);
        }catch(error){
          amountField.classList.add('is-invalid');
          amountError.hidden=false;
          amountError.textContent=checkoutErrorMessage(error,error&&error.data);
          setCheckoutBusy(false);
          updateDonationButton(false);
        }
      });
      updateDonationButton(false);
    });
  }

  function supporterInitials(value){
    var parts=String(value||'Apoiador').trim().split(/\s+/).filter(Boolean);
    return (parts.slice(0,2).map(function(part){return part.charAt(0);}).join('')||'A').toUpperCase();
  }

  function renderSupporters(items){
    if(!supportersSection||!supportersList||!supportersStatus)return;
    var records=(Array.isArray(items)?items:[]).filter(function(item){
      return String(item&&(item.username||item.user_username)||'').replace(/^@/,'').trim();
    });
    supportersSection.hidden=false;
    if(!records.length){
      supportersList.innerHTML='';
      supportersStatus.hidden=false;
      supportersStatus.textContent='Nenhum apoiador para exibir ainda.';
      return;
    }
    supportersStatus.hidden=true;
    supportersList.innerHTML=records.map(function(item){
      var displayName=String(item.display_name||item.displayName||item.user_display_name||'Apoiador').trim()||'Apoiador';
      var username=String(item.username||item.user_username||'').replace(/^@/,'').trim();
      var banner=imageUrl(item.banner_url||item.bannerUrl||'');
      var avatarUrl=imageUrl(item.avatar_url||item.avatarUrl||'');
      var initials=supporterInitials(displayName);
      var route='/@'+encodeURIComponent(username);
      return '<a class="donate-supporter-card" href="'+esc(route)+'" data-supporter-profile aria-label="Abrir perfil de '+esc(displayName)+'">'+
        '<span class="donate-supporter-banner">'+(banner?'<img class="donate-supporter-banner-image" loading="lazy" decoding="async" src="'+esc(banner)+'" alt="">':'')+'</span>'+
        '<span class="donate-supporter-shade" aria-hidden="true"></span>'+
        '<span class="donate-supporter-content">'+
          '<span class="donate-supporter-avatar" data-initials="'+esc(initials)+'">'+(avatarUrl?'<img class="donate-supporter-avatar-image" loading="lazy" decoding="async" src="'+esc(avatarUrl)+'" alt="Avatar de '+esc(displayName)+'">':'<span aria-hidden="true">'+esc(initials)+'</span>')+'</span>'+
          '<span class="donate-supporter-copy"><strong>'+esc(displayName)+'</strong><small>@'+esc(username)+'</small></span>'+
        '</span>'+
      '</a>';
    }).join('');

    supportersList.querySelectorAll('.donate-supporter-banner-image').forEach(function(image){
      image.addEventListener('error',function(){image.remove();},{once:true});
    });
    supportersList.querySelectorAll('.donate-supporter-avatar-image').forEach(function(image){
      image.addEventListener('error',function(){
        var avatarWrap=image.closest('.donate-supporter-avatar');
        if(!avatarWrap)return;
        avatarWrap.innerHTML='<span aria-hidden="true">'+esc(avatarWrap.getAttribute('data-initials')||'A')+'</span>';
      },{once:true});
    });
  }

  async function loadSupporters(force){
    if(!supportersSection||!supportersList||!supportersStatus)return [];
    if(supportersLoaded&&!force)return [];
    if(supportersLoading)return supportersLoading;
    supportersSection.hidden=false;
    supportersStatus.hidden=false;
    supportersStatus.textContent='Carregando apoiadores…';
    supportersLoading=(async function(){
      try{
        var client=window.beBackend&&window.beBackend.client;
        if(!client||typeof client.rpc!=='function')throw new Error('supporters_rpc_unavailable');
        var result=await client.rpc('get_public_donation_supporters',{p_limit:SUPPORTERS_LIMIT});
        if(result&&result.error)throw result.error;
        renderSupporters(result&&result.data);
        supportersLoaded=true;
        return result&&result.data||[];
      }catch(error){
        console.warn('Não foi possível carregar os apoiadores:',error);
        supportersSection.hidden=true;
        return [];
      }finally{
        supportersLoading=null;
      }
    })();
    return supportersLoading;
  }

  function notificationTime(item){
    var value=item&&(item.updatedAt||item.updated_at||item.createdAt||item.created_at||item.date)||'';
    var time=new Date(value).getTime();
    return Number.isFinite(time)?time:0;
  }

  function notificationPlainText(value){
    var source=String(value||'');
    if(window.beMarkdownPlainText)return window.beMarkdownPlainText(source);
    return source
      .replace(/!\[[^\]]*\]\([^)]*\)/g,' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g,'$1')
      .replace(/[*_~`>#-]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function trimNotification(value,max){
    var text=notificationPlainText(value);
    return text.length>max?text.slice(0,max-1).trim()+'…':text;
  }

  function renderNotificationPreview(){
    if(!notificationPreviewList)return;
    if(!notificationItems.length){
      notificationPreviewList.innerHTML='<div class="notification-preview-empty"><strong>Nenhuma atualização</strong></div>';
      return;
    }
    notificationPreviewList.innerHTML=notificationItems.slice(0,3).map(function(item){
      return '<button class="notification-preview-item" type="button" data-donate-notification-id="'+esc(item.id)+'">'+
        '<span class="notification-preview-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A8.5 8.5 0 0 0 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.7v4.7l3.2 1.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+ 
        '<span class="notification-preview-copy"><strong>'+esc(item.title||'Atualização')+'</strong><span>'+esc(trimNotification(item.description,100)||'Confira esta atualização.')+'</span></span>'+ 
        '<span class="notification-preview-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+ 
      '</button>';
    }).join('');
  }

  async function loadNotificationPreview(force){
    if(notificationLoaded&&!force)return notificationItems;
    if(notificationLoading)return notificationLoading;
    if(notificationPreviewList)notificationPreviewList.innerHTML='<div class="notification-preview-empty">Carregando…</div>';
    notificationLoading=(async function(){
      try{
        if(!window.beBackend)throw new Error('backend');
        await window.beBackend.ready;
        var items=await window.beBackend.data.list('notifications',{orderBy:'createdAt',direction:'desc'});
        notificationItems=(Array.isArray(items)?items:[])
          .filter(function(item){return active(item)&&String(item.title||'').trim();})
          .sort(function(a,b){return notificationTime(b)-notificationTime(a);});
        notificationLoaded=true;
        renderNotificationPreview();
      }catch(error){
        console.warn('Não foi possível carregar as notificações na página de ONGs:',error);
        notificationItems=[];
        notificationLoaded=true;
        if(notificationPreviewList)notificationPreviewList.innerHTML='<div class="notification-preview-empty"><strong>Não foi possível carregar</strong></div>';
      }finally{
        notificationLoading=null;
      }
      return notificationItems;
    })();
    return notificationLoading;
  }

  function closeNotificationPopup(){
    if(notificationPopup)notificationPopup.classList.remove('open');
    if(notificationButton)notificationButton.setAttribute('aria-expanded','false');
  }

  function toggleNotificationPopup(event){
    if(event){event.preventDefault();event.stopPropagation();}
    if(!notificationPopup||!notificationButton)return;
    var opening=!notificationPopup.classList.contains('open');
    notificationPopup.classList.toggle('open',opening);
    notificationButton.setAttribute('aria-expanded',String(opening));
    if(opening){
      window.dispatchEvent(new CustomEvent('be:close-notification-menus'));
      loadNotificationPreview(false);
    }
  }

  function markNotificationsRead(){
    try{localStorage.setItem(NOTIFICATION_STORAGE_KEY,String(Date.now()));}catch(_){ }
    var sourceDot=document.getElementById('notificationUnreadDot');
    var pageDot=document.getElementById('donatePageUnreadDot');
    if(sourceDot)sourceDot.hidden=true;
    if(pageDot)pageDot.hidden=true;
  }

  function openNotificationPage(id){
    closeNotificationPopup();
    var route='/atualizacoes'+(id?'/'+encodeURIComponent(id):'');
    if(window.BETVPublicRoutes)window.BETVPublicRoutes.go(route);
    else location.href=route;
  }

  async function load(force){
    if(loaded&&!force)return;
    if(loading)return loading;
    status.hidden=false;status.textContent='Carregando ONGs…';
    loading=(async function(){
      try{
        if(!window.beBackend)throw new Error('backend');
        await window.beBackend.ready;
        var results=await Promise.all([
          window.beBackend.data.list('ongs',{orderBy:'order',direction:'asc'}),
          window.beBackend.data.get('settings','ong').catch(function(){return null;})
        ]);
        applyPageBanner(results[1]);
        render(results[0]);
        loaded=true;
        loadSupporters(force);
      }catch(error){
        console.warn('Não foi possível carregar as ONGs:',error);
        list.innerHTML='';
        status.hidden=false;
        status.textContent='Não foi possível carregar as ONGs agora. Tente novamente em instantes.';
      }finally{
        loading=null;
      }
    })();
    return loading;
  }

  function open(){
    document.body.classList.add('donate-page-active');
    page.hidden=false;
    page.setAttribute('aria-hidden','false');
    syncAvatar();
    syncUnread();
    load(false);
    document.title='Apoie uma ONG — Billie Eilish TV';
  }

  function close(){
    closeNotificationPopup();
    document.body.classList.remove('donate-page-active');
    page.hidden=true;
    page.setAttribute('aria-hidden','true');
    document.title='Billie Eilish TV';
  }

  document.addEventListener('click',function(event){
    var link=event.target&&event.target.closest?event.target.closest('[data-open-donate="true"]'):null;
    if(!link)return;
    event.preventDefault();
    if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/ong');
    else location.assign('/ong');
  });

  if(home)home.addEventListener('click',function(){
    closeNotificationPopup();
    if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/');
    else location.href='/';
  });

  if(showMoreButton)showMoreButton.addEventListener('click',showNextNgoBatch);
  if(ngoMobileMedia){
    if(typeof ngoMobileMedia.addEventListener==='function')ngoMobileMedia.addEventListener('change',syncNgoVisibility);
    else if(typeof ngoMobileMedia.addListener==='function')ngoMobileMedia.addListener(syncNgoVisibility);
  }
  if(supportersList)supportersList.addEventListener('click',function(event){
    var link=event.target&&event.target.closest?event.target.closest('[data-supporter-profile]'):null;
    if(!link||!window.BETVPublicRoutes)return;
    event.preventDefault();
    window.BETVPublicRoutes.go(link.getAttribute('href')||'/');
  });
  if(notificationButton)notificationButton.addEventListener('click',toggleNotificationPopup);
  if(notificationClose)notificationClose.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();closeNotificationPopup();});
  if(notificationMarkAll)notificationMarkAll.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();markNotificationsRead();});
  if(notificationViewAll)notificationViewAll.addEventListener('click',function(){openNotificationPage('');});
  if(notificationPreviewList)notificationPreviewList.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-donate-notification-id]'):null;
    if(button)openNotificationPage(button.getAttribute('data-donate-notification-id')||'');
  });
  if(notificationPopup)notificationPopup.addEventListener('click',function(event){event.stopPropagation();});

  if(avatar)avatar.addEventListener('click',function(){
    closeNotificationPopup();
    var account=window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;
    if(!account){
      if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/login');
      else location.href='/login';
      return;
    }
    close();
    window.setTimeout(function(){
      var profileAction=document.querySelector('#userDropdown [data-public-action="profile"]');
      if(profileAction){profileAction.click();return;}
      window.dispatchEvent(new CustomEvent('be:open-profile-route'));
    },0);
  });

  document.addEventListener('click',function(event){
    if(notificationPopup&&notificationPopup.classList.contains('open')&&notificationWrap&&!notificationWrap.contains(event.target))closeNotificationPopup();
  });
  document.addEventListener('keydown',function(event){if(event.key==='Escape')closeNotificationPopup();});

  var originalDot=document.getElementById('notificationUnreadDot');
  if(originalDot&&window.MutationObserver)new MutationObserver(syncUnread).observe(originalDot,{attributes:true,attributeFilter:['hidden','class']});
  var originalAvatar=document.getElementById('publicUserPhoto');
  if(originalAvatar&&window.MutationObserver)new MutationObserver(syncAvatar).observe(originalAvatar,{attributes:true,attributeFilter:['src','hidden']});

  window.addEventListener('be:open-donate-page',function(){open();});
  window.addEventListener('be:close-donate-page',function(){close();});
  window.addEventListener('be:profile-avatar-changed',syncAvatar);
  window.addEventListener('be:profile-device-synced',syncAvatar);
  window.addEventListener('be:content-ready',function(){
    notificationLoaded=false;
    supportersLoaded=false;
    if(isRoute()){
      load(true);
      if(notificationPopup&&notificationPopup.classList.contains('open'))loadNotificationPreview(true);
    }
  });
  window.addEventListener('pageshow',function(){if(isRoute())open();});
  window.addEventListener('popstate',function(){if(isRoute())open();else if(document.body.classList.contains('donate-page-active'))close();});
  window.addEventListener('hashchange',function(){if(isRoute())open();else if(document.body.classList.contains('donate-page-active'))close();});
  if(isRoute())open();
})();

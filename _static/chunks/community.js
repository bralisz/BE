;(function(){
  'use strict';
  if(window.BETVCommunity)return;
  if(String(location.hash||'').startsWith('#/admin')) return;

  var state={loading:false,lastPayload:null,requestId:0,detailReturnToCommunity:false,catalogHomeView:'home',watchedContentIds:Object.create(null)};
  var page=null;
  var mobileMenu=null;
  var preferenceRequest=0;

  function t(source,vars){
    if(window.BETVI18n&&typeof window.BETVI18n.t==='function')return window.BETVI18n.t(source,vars||{});
    return String(source||'').replace(/\{([a-zA-Z0-9_]+)\}/g,function(_,key){return Object.prototype.hasOwnProperty.call(vars||{},key)?String(vars[key]):_;});
  }
  function applyI18n(root){if(window.BETVI18n&&typeof window.BETVI18n.apply==='function')window.BETVI18n.apply(root||document);}
  function currentUser(){return window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;}
  function mediaUrl(value){var raw=String(value||'').trim();return raw&&window.beMediaUrl?window.beMediaUrl(raw):raw;}
  function validUuid(value){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value||''));}
  function numericPublicId(value){
    var text=String(value||'video').trim();
    if(/^\d{8}$/.test(text))return text;
    var hash=2166136261;
    for(var index=0;index<text.length;index+=1){hash^=text.charCodeAt(index);hash=Math.imul(hash,16777619);}
    return String(10000000+((hash>>>0)%90000000));
  }
  function rankingPreferenceKey(userId){return 'beCommunityRankingsPublic:'+String(userId||'guest');}
  function readRankingPreference(userId){
    try{var value=localStorage.getItem(rankingPreferenceKey(userId));if(value==='false')return false;if(value==='true')return true;}catch(_){ }
    return true;
  }
  function writeRankingPreference(userId,value){try{localStorage.setItem(rankingPreferenceKey(userId),value?'true':'false');}catch(_){ }}
  function setHomeTab(tab){try{window.dispatchEvent(new CustomEvent('be:set-home-tab',{detail:{tab:String(tab||'home')}}));}catch(_){ }}

  function normalizeCommunityTag(value){
    var normalized=String(value||'').trim().toLowerCase();
    return normalized==='avocado'||normalized==='eyelash'||normalized==='blohsh'||normalized==='billie_fan'||normalized==='boaf'?normalized:'';
  }
  function communityTagMeta(value){
    var tag=normalizeCommunityTag(value);
    if(tag==='avocado')return {key:'avocado',label:'Avocado',className:'is-avocado'};
    if(tag==='eyelash')return {key:'eyelash',label:'Eyelash',className:'is-eyelash'};
    if(tag==='blohsh')return {key:'blohsh',label:'Blohsh',className:'is-blohsh'};
    if(tag==='billie_fan')return {key:'billie_fan',label:t('Fã da Billie'),className:'is-billie-fan'};
    if(tag==='boaf')return {key:'boaf',label:'BOAF',className:'is-boaf'};
    return null;
  }
  function communityTagMarkup(value){
    var meta=communityTagMeta(value);
    if(!meta)return '';
    return '<span class="community-award-tag '+meta.className+' notranslate" data-i18n-ignore translate="no">'+meta.label+'</span>';
  }


  var BOAF_STREAM_URL='https://open.spotify.com/playlist/7GsA1b3dcISozmOc9G0tcT?si=d0qmzIyJSxiFLUx0flAsng';
  var BOAF_STREAM_IMAGE='/assets/images/community/boaf-stream-4bi.webp';
  var BOAF_STREAM_MESSAGE='BIRDS OF A FEATHER, de Billie Eilish, está prestes a fazer história ABSOLUTA como a música solo mais rápida da história do Spotify atingir a marca de 4 BILHÕES de Streams e a PRIMEIRA canção de uma artista feminina a conseguir o feito.';
  var BOAF_CAMPAIGN_ENDED=true; // O marco de 4 bilhões substituiu a campanha de ouvir.
  var BOAF_STREAM_NOTICE_KEY='betvBoafStreamNotice:4bi:v2';
  var boafNoticeOpenedForUser='';
  var boafNoticeTimer=0;
  var boafOwnedTagCache=Object.create(null);

  function profileOwnsBoafTag(profile){
    if(!profile||typeof profile!=='object')return false;
    var active=String(profile.communityTag||profile.community_tag||'').trim().toLowerCase();
    if(active==='boaf')return true;
    var owned=profile.communityTags||profile.community_tags;
    return Array.isArray(owned)&&owned.some(function(tag){return String(tag||'').trim().toLowerCase()==='boaf';});
  }
  async function boafUserOwnsReward(userId){
    var uid=String(userId||'').trim();
    if(!uid)return false;
    if(boafOwnedTagCache[uid]===true)return true;
    try{
      await Promise.resolve(window.beBackend&&window.beBackend.ready);
      var profiles=window.beBackend&&window.beBackend.profiles;
      if(!profiles||typeof profiles.get!=='function')return false;
      var profile=await profiles.get(uid);
      var owned=profileOwnsBoafTag(profile);
      boafOwnedTagCache[uid]=owned;
      return owned;
    }catch(_){return false;}
  }

  function boafNoticeUser(){
    var user=currentUser();
    return user&&user.uid?user:null;
  }
  function boafNoticeStorageKey(userId){
    return BOAF_STREAM_NOTICE_KEY+':'+String(userId||'').trim();
  }
  function boafNoticeDismissed(userId){
    var uid=String(userId||(boafNoticeUser()&&boafNoticeUser().uid)||'').trim();
    if(!uid)return true;
    try{return localStorage.getItem(boafNoticeStorageKey(uid))==='seen';}catch(_){return false;}
  }
  function dismissBoafNotice(){
    var user=boafNoticeUser();
    if(!user||!user.uid)return;
    try{localStorage.setItem(boafNoticeStorageKey(user.uid),'seen');}catch(_){ }
    try{window.dispatchEvent(new CustomEvent('be:boaf-stream-notice-dismissed',{detail:{userId:String(user.uid)}}));}catch(_){ }
  }
  function isBoafLoginSurface(){
    var path=String(location.pathname||'').replace(/\/+$/,'').toLowerCase();
    var hash=String(location.hash||'').toLowerCase();
    return document.body.classList.contains('login-mode')||path==='/login'||/\/(?:pt-br|en-us|es|fr|it)\/login$/.test(path)||hash==='#login'||hash==='#/login';
  }
  function canShowBoafNotice(){
    var user=boafNoticeUser();
    if(!user||!user.uid)return false;
    if(isBoafLoginSurface())return false;
    if(window.BETVGuestAccess&&typeof window.BETVGuestAccess.isActive==='function'&&window.BETVGuestAccess.isActive())return false;
    if(boafOwnedTagCache[String(user.uid)]===true)return false;
    return !boafNoticeDismissed(user.uid);
  }
  function boafNewAccountFlowKey(userId){
    return 'betvNewAccountFlowPending:'+String(userId||'').trim();
  }
  function boafNewAccountFlowPending(userId){
    var uid=String(userId||'').trim();
    if(!uid)return false;
    try{return localStorage.getItem(boafNewAccountFlowKey(uid))==='1';}catch(_){return false;}
  }
  function boafNewAccountFavoritesReady(userId){
    var uid=String(userId||'').trim();
    if(!uid)return false;
    try{
      var favorites=JSON.parse(localStorage.getItem('beProfileTopFavorites:'+uid)||'[]');
      return Array.isArray(favorites)&&favorites.length>=4;
    }catch(_){return false;}
  }
  function boafNewAccountShareReady(userId){
    var uid=String(userId||'').trim();
    if(!uid)return false;
    try{
      if(String(localStorage.getItem('beProfileShareCampaignSeen:'+uid)||'').trim())return true;
      return String(localStorage.getItem('beCommunityTag:'+uid)||'').trim().toLowerCase()==='billie_fan';
    }catch(_){return false;}
  }
  function boafNoticeBlockedBySetup(){
    var body=document.body;
    if(!body)return true;
    if(body.classList.contains('profile-onboarding-active')||body.classList.contains('profile-share-campaign-open')||body.classList.contains('profile-favorites-picker-active'))return true;
    var sharePrompt=document.getElementById('profileShareCampaignPrompt');
    if(sharePrompt&&sharePrompt.offsetParent!==null)return true;
    var favoritesPicker=document.getElementById('profileFavoritesPicker');
    if(favoritesPicker&&!favoritesPicker.hidden)return true;
    return false;
  }
  function boafNewAccountFlowReady(userId){
    if(!boafNewAccountFlowPending(userId))return true;
    return boafNewAccountShareReady(userId)&&!boafNoticeBlockedBySetup();
  }
  function completeBoafNewAccountFlow(userId){
    try{localStorage.removeItem(boafNewAccountFlowKey(userId));}catch(_){ }
  }
  function hideBoafStreamPanelWithoutDismiss(){
    var modal=document.getElementById('boafStreamPanel');
    if(modal)modal.hidden=true;
    document.body.classList.remove('boaf-stream-panel-open');
  }

  function boafPendingClaimKey(userId){
    return 'betvBoafPendingClaim:4bi:'+String(userId||'').trim();
  }
  function setBoafPendingClaim(userId,pending){
    var uid=String(userId||'').trim();
    if(!uid)return;
    try{
      if(pending)localStorage.setItem(boafPendingClaimKey(uid),'1');
      else localStorage.removeItem(boafPendingClaimKey(uid));
    }catch(_){ }
  }
  function hasBoafPendingClaim(userId){
    var uid=String(userId||'').trim();
    if(!uid)return false;
    try{return localStorage.getItem(boafPendingClaimKey(uid))==='1';}catch(_){return false;}
  }
  async function waitForBoafAuthenticatedUser(timeoutMs){
    var deadline=Date.now()+Math.max(800,Number(timeoutMs)||4500);
    try{await Promise.resolve(window.beBackend&&window.beBackend.ready);}catch(_){ }
    while(Date.now()<deadline){
      var user=currentUser();
      if(user&&user.uid)return user;
      await new Promise(function(resolve){window.setTimeout(resolve,90);});
    }
    return currentUser();
  }
  async function claimBoafStreamTag(statusNode,options){
    options=options||{};
    var user=await waitForBoafAuthenticatedUser(options.waitMs||4500);
    if(!user||!user.uid){
      if(statusNode){statusNode.textContent=t('Entre na sua conta para receber a tag BOAF.');statusNode.classList.add('is-visible','is-warning');}
      return false;
    }
    var uid=String(user.uid);
    setBoafPendingClaim(uid,true);
    try{
      await Promise.resolve(window.beBackend&&window.beBackend.ready);
      var client=window.beBackend&&window.beBackend.client;
      if(!client||typeof client.rpc!=='function')throw new Error('boaf_rpc_unavailable');

      /* A conta pode ter acabado de entrar e o perfil ainda estar sendo criado. */
      try{
        if(window.beBackend&&window.beBackend.profiles&&typeof window.beBackend.profiles.ensure==='function'){
          await window.beBackend.profiles.ensure(user);
        }
      }catch(_){ }

      var lastError=null;
      for(var attempt=0;attempt<3;attempt+=1){
        var result=await client.rpc('claim_boaf_stream_tag');
        if(!result||!result.error){lastError=null;break;}
        lastError=result.error;
        if(attempt<2){
          try{
            if(window.beBackend&&window.beBackend.profiles&&typeof window.beBackend.profiles.ensure==='function')await window.beBackend.profiles.ensure(user);
          }catch(_){ }
          await new Promise(function(resolve){window.setTimeout(resolve,180+(attempt*180));});
        }
      }
      if(lastError)throw lastError;
      setBoafPendingClaim(uid,false);
      boafOwnedTagCache[uid]=true;
      dismissBoafNotice();
      try{
        if(window.beBackend&&window.beBackend.profiles&&typeof window.beBackend.profiles.get==='function'){
          var refreshed=await window.beBackend.profiles.get(uid,{force:true});
          if(refreshed&&typeof refreshed==='object')window.dispatchEvent(new CustomEvent('be:profile-refreshed',{detail:{profile:refreshed}}));
        }
      }catch(_){ }
      try{window.dispatchEvent(new CustomEvent('be:community-tag-updated',{detail:{userId:uid,tag:'boaf'}}));}catch(_){ }
      if(statusNode){statusNode.textContent=t('Tag BOAF adicionada ao seu perfil.');statusNode.classList.remove('is-warning');statusNode.classList.add('is-visible','is-success');}
      return true;
    }catch(_){
      /* Mantém a concessão pendente para repetir quando a sessão/perfil terminar de inicializar. */
      setBoafPendingClaim(uid,true);
      return false;
    }
  }

  async function retryPendingBoafClaim(){
    var user=await waitForBoafAuthenticatedUser(1800);
    if(!user||!user.uid||!hasBoafPendingClaim(user.uid))return false;
    return claimBoafStreamTag(null,{waitMs:1800});
  }

  function bindBoafListenLinks(root){
    (root||document).querySelectorAll('[data-boaf-listen]').forEach(function(link){
      if(link.dataset.boafBound==='true')return;
      link.dataset.boafBound='true';
      link.addEventListener('click',async function(event){
        event.preventDefault();
        var destination=String(link.href||BOAF_STREAM_URL);
        var popup=null;
        try{
          popup=window.open('about:blank','_blank');
          if(popup)popup.opener=null;
        }catch(_){popup=null;}
        var scope=link.closest('.community-boaf-card,.boaf-stream-panel');
        var status=scope&&scope.querySelector?scope.querySelector('.boaf-stream-status'):null;
        link.setAttribute('aria-busy','true');
        await claimBoafStreamTag(status,{waitMs:5000});
        dismissBoafNotice();
        if(scope&&scope.classList.contains('boaf-stream-panel'))closeBoafStreamPanel();
        link.removeAttribute('aria-busy');
        try{
          if(popup&&!popup.closed)popup.location.replace(destination);
          else window.open(destination,'_blank','noopener,noreferrer');
        }catch(_){location.href=destination;}
      });
    });
  }

  function closeBoafStreamPanel(){
    var modal=document.getElementById('boafStreamPanel');
    if(!modal)return;
    modal.hidden=true;
    document.body.classList.remove('boaf-stream-panel-open');
    dismissBoafNotice();
  }

  function openBoafStreamPanel(options){
    if(BOAF_CAMPAIGN_ENDED)return;
    options=options&&typeof options==='object'?options:{};
    if(options.auto===true&&!canShowBoafNotice())return;
    if(!boafNoticeUser()||isBoafLoginSurface())return;
    var modal=document.getElementById('boafStreamPanel');
    if(!modal){
      modal=document.createElement('div');
      modal.id='boafStreamPanel';
      modal.className='boaf-stream-panel-backdrop';
      modal.hidden=true;
      modal.innerHTML='<section class="boaf-stream-panel" role="dialog" aria-modal="true" aria-labelledby="boafStreamPanelTitle">'
        +'<button class="boaf-stream-panel-close" type="button" aria-label="'+t('Fechar')+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>'
        +'<div class="boaf-stream-panel-media"><img src="'+BOAF_STREAM_IMAGE+'" alt="BIRDS OF A FEATHER" decoding="async"></div>'
        +'<div class="boaf-stream-panel-copy"><h2 id="boafStreamPanelTitle">Stream Bird of a Feather</h2><p>'+t(BOAF_STREAM_MESSAGE)+'</p>'
        +'<div class="boaf-stream-reward"><strong>'+t('Quem ouvir ganha a tag {tag}.',{tag:'<span class="profile-award-tag is-boaf notranslate boaf-stream-inline-tag" data-i18n-ignore translate="no">BOAF</span>'})+'</strong></div>'
        +'<a class="boaf-stream-listen" data-boaf-listen href="'+BOAF_STREAM_URL+'" target="_blank" rel="noopener noreferrer">'+t('Ouvir')+'</a><p class="boaf-stream-status" aria-live="polite"></p></div></section>';
      document.body.appendChild(modal);
      var close=modal.querySelector('.boaf-stream-panel-close');if(close)close.addEventListener('click',closeBoafStreamPanel);
      modal.addEventListener('click',function(event){if(event.target===modal)closeBoafStreamPanel();});
      bindBoafListenLinks(modal);
    }
    modal.hidden=false;
    document.body.classList.add('boaf-stream-panel-open');
    applyI18n(modal);
  }

  function scheduleBoafStreamNotice(delay){
    if(BOAF_CAMPAIGN_ENDED){hideBoafStreamPanelWithoutDismiss();return;}
    var user=boafNoticeUser();
    if(!user||!user.uid){hideBoafStreamPanelWithoutDismiss();return;}
    var uid=String(user.uid);
    if(boafNoticeOpenedForUser===uid||boafNoticeDismissed(uid))return;
    if(boafNoticeTimer)window.clearTimeout(boafNoticeTimer);
    boafNoticeTimer=window.setTimeout(async function(){
      boafNoticeTimer=0;
      var active=boafNoticeUser();
      if(!active||String(active.uid)!==uid){hideBoafStreamPanelWithoutDismiss();return;}
      if(await boafUserOwnsReward(uid)){
        dismissBoafNotice();
        hideBoafStreamPanelWithoutDismiss();
        return;
      }
      if(boafNoticeBlockedBySetup()||!boafNewAccountFlowReady(uid)){
        scheduleBoafStreamNotice(700);
        return;
      }
      if(!canShowBoafNotice()){
        if(isBoafLoginSurface())scheduleBoafStreamNotice(700);
        return;
      }
      if(boafNewAccountFlowPending(uid))completeBoafNewAccountFlow(uid);
      boafNoticeOpenedForUser=uid;
      openBoafStreamPanel({auto:true});
    },Math.max(250,Number(delay)||900));
  }

  async function loadCommunityOngBanner(){
    var spotlight=document.getElementById('communityOngSpotlight');
    var image=document.getElementById('communityOngSpotlightImage');
    if(!spotlight||!image)return;
    try{
      await Promise.resolve(window.beBackend&&window.beBackend.ready);
      var dataApi=window.beBackend&&window.beBackend.data;
      if(!dataApi||typeof dataApi.get!=='function')return;
      var settings=await dataApi.get('settings','ong');
      var raw=String(settings&&settings.bannerUrl||'').trim();
      if(!raw)return;
      var banner=mediaUrl(raw);
      if(!banner||banner==='#')return;
      image.src=banner;
      image.addEventListener('load',function(){spotlight.hidden=false;},{once:true});
      image.addEventListener('error',function(){spotlight.hidden=true;image.removeAttribute('src');},{once:true});
      if(image.complete&&image.naturalWidth>0)spotlight.hidden=false;
    }catch(_){spotlight.hidden=true;}
  }

  function createPage(){
    if(document.getElementById('communityPage')){page=document.getElementById('communityPage');return page;}
    var main=document.querySelector('body > main');
    if(!main)return null;
    page=document.createElement('section');
    page.id='communityPage';
    page.className='community-page';
    page.hidden=true;
    page.setAttribute('aria-label','Comunidade dos Avocados');
    page.innerHTML=''
      +'<div class="community-page-inner">'
      +  '<section class="community-hero-banner" aria-label="Banner da comunidade"><div class="community-hero-banner-frame"><img src="/_static/media/community/community-hero-banner.webp" alt="Banner da comunidade dos Avocados" decoding="async"><div class="community-hero-banner-overlay" aria-hidden="true"></div></div></section>'
      +  '<div class="community-content-shell">'
      +    '<header class="community-page-heading"><h1>Comunidade dos Avocados</h1><p>Descubra o que os fãs estão assistindo, salvando e curtindo dentro do Billie Eilish TV.</p></header>'
      +    '<section class="community-section community-boaf-section" id="communityBoafSection"><div class="community-section-head"><h2>'+t('Obrigado por ajudar BIRDS OF A FEATHER a alcançar')+'</h2></div><article class="community-boaf-card" id="communityBoafCard"><div class="community-boaf-promo"><div class="boaf-stream-counter" id="boafStreamCounter" aria-live="polite">'+t('4 bilhões')+'</div><p class="boaf-stream-counter-subtitle">'+t('de streams no Spotify')+'</p><span class="community-award-tag is-boaf notranslate" data-i18n-ignore translate="no">BOAF</span><div class="community-boaf-media"><img src="/assets/images/community/boaf-stream-4bi.webp" alt="BIRDS OF A FEATHER" decoding="async"></div></div></article></section>'
      +    '<section class="community-section" id="communityContinueSection"><div class="community-section-head"><h2>Continue assistindo</h2></div><div id="communityContinueContent"></div></section>'
      +    '<section class="community-section"><div class="community-section-head"><h2>Favoritos dos fãs</h2></div><div id="communityFavoritesContent"></div></section>'
      +    '<section class="community-section"><div class="community-section-head community-featured-head"><div class="community-section-title"><h2>Perfis em destaque</h2><p class="community-section-subtitle">Compartilhe seu perfil para receber curtidas e aparecer no ranking.</p></div><details class="community-rules-details"><summary class="community-rules-button">Regras</summary><div class="community-rules-panel" id="communityProfileRules"><p>Este ranking mostra os perfis que mais receberam curtidas da comunidade. Compartilhe seu perfil com outros usuários para que eles conheçam sua página e possam curti-la.</p><p>No final de cada mês, o 1º, 2º e 3º lugar ganham uma tag especial no perfil:</p><div class="community-rules-tags"><div class="community-rules-tag-row"><span class="community-rules-place">1° lugar</span><span class="community-award-tag is-avocado notranslate" data-i18n-ignore translate="no">Avocado</span></div><div class="community-rules-tag-row"><span class="community-rules-place">2° lugar</span><span class="community-award-tag is-eyelash notranslate" data-i18n-ignore translate="no">Eyelash</span></div><div class="community-rules-tag-row"><span class="community-rules-place">3° lugar</span><span class="community-award-tag is-blohsh notranslate" data-i18n-ignore translate="no">Blohsh</span></div></div></div></details></div><div class="community-ranking-wrap"><div class="community-ranking-card" id="communityProfileRanking"></div><div class="community-ranking-own" id="communityOwnProfile" hidden></div></div></section>'
      +    '<div class="community-supporters-cta-wrap"><button class="community-supporters-cta" id="communitySupportersButton" type="button">Ver fãs que apoiam o site</button></div>'
      +    '<section class="community-ong-spotlight" id="communityOngSpotlight" hidden aria-label="Apoie uma ONG"><div class="community-ong-spotlight-frame"><img id="communityOngSpotlightImage" alt="Apoie uma ONG" decoding="async"><div class="community-ong-spotlight-overlay" aria-hidden="true"></div><a class="community-ong-spotlight-button" href="/ong" data-open-donate="true">Apoie uma ONG</a></div></section>'
      +  '</div>'
      +'</div>';
    main.appendChild(page);
    bindBoafListenLinks(page);
    page.querySelector('#communitySupportersButton').addEventListener('click',function(){closeCommunity(false);if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go('/fãs');else location.assign('/fãs');});
    var ongButton=page.querySelector('.community-ong-spotlight-button');if(ongButton)ongButton.addEventListener('click',function(){closeCommunity(false);});
    var rulesDetails=page.querySelector('.community-rules-details');
    var rulesButton=page.querySelector('.community-rules-button');
    if(rulesDetails&&rulesButton)rulesButton.addEventListener('click',function(event){
      event.preventDefault();
      event.stopPropagation();
      rulesDetails.open=!rulesDetails.open;
      document.body.classList.add('community-page-active');
      page.hidden=false;
      setHomeTab('community');
    });
    page.addEventListener('click',function(event){
      var interactive=event.target&&event.target.closest?event.target.closest('a,button,summary,input,select,textarea,[role="button"],.video-card,.community-ranking-row'):null;
      if(interactive)return;
      event.preventDefault();
      event.stopPropagation();
      document.body.classList.add('community-page-active');
      page.hidden=false;
      setHomeTab('community');
    });
    loadCommunityOngBanner();
    applyI18n(page);
    return page;
  }

  function setCommunityNavActive(active){
    var communityButton=document.querySelector('[data-community-tab]');
    if(communityButton){communityButton.classList.toggle('active',Boolean(active));if(active){communityButton.setAttribute('aria-current','page');communityButton.setAttribute('aria-pressed','true');setHomeTab('community');}else{communityButton.removeAttribute('aria-current');communityButton.setAttribute('aria-pressed','false');}}
    document.querySelectorAll('[data-mobile-destination]').forEach(function(button){
      if(button.dataset.mobileDestination==='community'){
        button.classList.toggle('active',Boolean(active));
        button.setAttribute('aria-current',active?'page':'false');
      }else if(active){
        button.classList.remove('active');
        button.setAttribute('aria-current','false');
      }
    });
  }

  function toggleCatalogVisibility(showCommunity){
    function rememberAndHide(node){
      if(!node)return;



      if(!Object.prototype.hasOwnProperty.call(node.dataset||{},'communityPrevHidden')){
        node.dataset.communityPrevHidden=node.hidden?'1':'0';
      }
      node.hidden=true;
      node.style.setProperty('display','none','important');
    }
    function restoreNode(node){
      if(!node)return;
      if(Object.prototype.hasOwnProperty.call(node.dataset||{},'communityPrevHidden')){
        node.hidden=node.dataset.communityPrevHidden==='1';
        delete node.dataset.communityPrevHidden;
      }
      node.style.removeProperty('display');
    }
    var main=document.querySelector('body > main');
    if(main){
      Array.prototype.slice.call(main.children||[]).forEach(function(child){
        if(child===page){
          child.hidden=!showCommunity;
          if(showCommunity)child.style.setProperty('display','block','important');
          else child.style.removeProperty('display');
          return;
        }
        if(showCommunity)rememberAndHide(child);
        else restoreNode(child);
      });
    }
    var catalog=document.getElementById('dynamicSections');
    if(catalog){
      if(showCommunity)rememberAndHide(catalog);
      else restoreNode(catalog);
    }
  }

  function rememberCatalogHomeView(){
    var view=String(document.body.dataset.homeView||'').trim().toLowerCase();
    if(view&&view!=='community')state.catalogHomeView=view;
  }
  function catalogTabForView(view){
    view=String(view||'home').toLowerCase();
    if(view==='films'||view==='movies'||view==='series')return 'films';
    if(view==='videos')return 'videos';
    return 'home';
  }

  function closeCommunity(resetView,tabAfter){
    if(document.body.classList.contains('community-page-active')){
      document.body.classList.remove('community-page-active');
      toggleCatalogVisibility(false);
      if(page)page.hidden=true;
    }
    if(page)page.hidden=true;
    setCommunityNavActive(false);
    if(resetView!==false&&document.body.dataset.homeView==='community')document.body.dataset.homeView=state.catalogHomeView||'home';
    if(tabAfter)setHomeTab(tabAfter);
  }

  function establishCatalogBase(){
    if(document.body.classList.contains('community-page-active'))return;
    var dedicated=document.body.classList.contains('profile-page-active')||document.body.classList.contains('settings-page-active')||document.body.classList.contains('support-page-active')||document.body.classList.contains('notification-page-active')||document.body.classList.contains('billie-page-active')||document.body.classList.contains('donate-page-active')||document.body.classList.contains('fans-page-active')||document.body.classList.contains('album-page-active')||document.body.classList.contains('detail-page-active');
    if(!dedicated)return;
    var logo=document.getElementById('logoBtn');
    if(logo){logo.dataset.beHistoryMode='none';logo.click();delete logo.dataset.beHistoryMode;}
  }

  function preserveCommunitySurfaceForHeaderUtility(){
    var shouldRestore=document.body.classList.contains('community-page-active')||document.body.dataset.homeView==='community';
    if(!shouldRestore)return;
    window.requestAnimationFrame(function(){
      var dedicated=document.body.classList.contains('profile-page-active')||document.body.classList.contains('settings-page-active')||document.body.classList.contains('notification-page-active')||document.body.classList.contains('support-page-active')||document.body.classList.contains('legal-page-active')||document.body.classList.contains('billie-page-active')||document.body.classList.contains('donate-page-active')||document.body.classList.contains('fans-page-active')||document.body.classList.contains('album-page-active')||document.body.classList.contains('detail-page-active');
      if(dedicated)return;
      createPage();
      if(!page)return;
      document.body.classList.add('community-page-active');
      document.body.dataset.homeView='community';
      page.hidden=false;
      toggleCatalogVisibility(true);
      setCommunityNavActive(true);
      setHomeTab('community');
    });
  }

  function openCommunity(){
    closeMobileAccountMenu();
    // Community uses the catalog surface. Leave /ong first so its popstate handler
    // cannot bring the ONG page back over Community.
    var route=String(window.BETVLocalePath?window.BETVLocalePath():location.pathname||'/').replace(/\/+$/,'').toLowerCase()||'/';
    if(route==='/ong'&&window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go('/');
    establishCatalogBase();
    window.dispatchEvent(new CustomEvent('be:close-donate-page'));
    document.body.classList.remove('donate-page-active');
    var donationPage=document.getElementById('donatePage');
    if(donationPage){donationPage.hidden=true;donationPage.setAttribute('aria-hidden','true');}
    createPage();
    if(!page)return;
    if(!document.body.classList.contains('community-page-active'))rememberCatalogHomeView();
    document.body.classList.add('community-page-active');
    document.body.dataset.homeView='community';
    page.hidden=false;
    toggleCatalogVisibility(true);
    document.querySelectorAll('.home-nav-link.active,#logoBtn.active').forEach(function(button){if(!button.matches('[data-community-tab]')){button.classList.remove('active');button.removeAttribute('aria-current');button.setAttribute('aria-pressed','false');}});
    setCommunityNavActive(true);
    try{window.dispatchEvent(new CustomEvent('be:close-public-search'));window.dispatchEvent(new CustomEvent('be:close-mobile-search'));}catch(_){ }
    window.scrollTo({top:0,left:0,behavior:'auto'});
    refreshCommunity();
  }
  window.BETVCommunity={open:openCommunity,close:closeCommunity,refresh:refreshCommunity,record:recordRecentFromPlay};
  window.addEventListener('be:open-community',openCommunity);


  window.addEventListener('be:restore-community-surface',function(){preserveCommunitySurfaceForHeaderUtility();});
  ['be:open-profile-route','be:open-config','be:open-notifications','be:open-support','be:open-donate-page','be:open-fans-page','be:open-billie-page','be:open-album-page','be:open-legal-route'].forEach(function(name){window.addEventListener(name,function(){state.detailReturnToCommunity=false;closeCommunity(false);});});
  window.addEventListener('be:home-entered',function(){state.detailReturnToCommunity=false;closeCommunity(true,'home');});

  function catalogData(row){
    row=row&&typeof row==='object'?row:{};
    var contentId=String(row.contentId||row.content_id||'');
    var escapedContentId=contentId?(window.CSS&&typeof window.CSS.escape==='function'?window.CSS.escape(contentId):contentId.replace(/([\"'\\.#:[\](),>+~*=\s])/g,'\\$1')):'';
    var original=contentId?document.querySelector('[data-open-detail="true"][data-record-id="'+escapedContentId+'"]'):null;
    if(original){
      var d=original.dataset||{};
      return {itemId:String(d.itemId||numericPublicId(contentId)),recordId:contentId,favoriteId:(d.collection||row.collection||'videos')+':'+contentId,title:String(d.title||'Conteúdo'),description:String(d.description||''),year:String(d.year||''),duration:String(d.duration||''),contentUrl:String(d.contentUrl||'#'),imageUrl:String(d.imageUrl||''),bannerUrl:String(d.bannerUrl||d.imageUrl||''),logoUrl:String(d.logoUrl||''),showCardLogo:String(d.showCardLogo||'')==='true',collection:String(d.collection||row.collection||'videos'),sectionId:String(d.sectionId||''),sectionName:String(d.sectionName||''),streamingAvailability:String(d.streamingAvailability||''),streamingLinks:String(d.streamingLinks||''),category:String(d.category||''),contentType:String(d.contentType||''),mediaType:String(d.mediaType||''),preserveTitle:String(d.preserveTitle||'')==='true'};
    }
    var data=row.data&&typeof row.data==='object'?row.data:{};
    var collection=String(row.collection||data.collection||'videos');
    var recordId=contentId||String(data.id||'');
    return {itemId:numericPublicId(data.publicId||recordId||data.title),recordId:recordId,favoriteId:recordId?collection+':'+recordId:'',title:String(data.title||'Conteúdo'),description:String(data.description||''),year:String(data.year||''),duration:String(data.duration||data.videoDuration||data.runtime||''),contentUrl:String(data.videoUrl||data.contentUrl||data.link||'#'),imageUrl:String(data.thumbnailUrl||data.imageUrl||data.bannerUrl||''),bannerUrl:String(collection==='movies'||collection==='series'?(data.thumbnailUrl||data.imageUrl||data.bannerUrl||''):(data.bannerUrl||data.imageUrl||data.thumbnailUrl||'')),logoUrl:String(data.logoUrl||''),showCardLogo:data.showCardLogo===true||String(data.showCardLogo||'').toLowerCase()==='true',collection:collection,sectionId:String(data.sectionId||''),sectionName:String(data.sectionName||''),streamingAvailability:data.streamingAvailability||[],streamingLinks:data.streamingLinks||{},category:String(data.category||data.type||''),contentType:String(data.contentType||''),mediaType:String(data.mediaType||''),preserveTitle:Boolean(data.preserveTitle)};
  }

  function createVideoCard(row,options){
    options=options&&typeof options==='object'?options:{};
    var data=catalogData(row);
    var card=document.createElement('a');
    card.className='video-card'+(data.preserveTitle?' notranslate':'');
    if(data.preserveTitle)card.setAttribute('translate','no');
    card.href='/'+encodeURIComponent(data.itemId);
    card.setAttribute('aria-label',data.title);
    card.dataset.itemId=data.itemId;card.dataset.recordId=data.recordId;card.dataset.openDetail='true';card.dataset.title=data.title;card.dataset.description=data.description;card.dataset.year=data.year;card.dataset.duration=data.duration;card.dataset.contentUrl=data.contentUrl;card.dataset.imageUrl=data.imageUrl;card.dataset.bannerUrl=data.bannerUrl;card.dataset.logoUrl=data.logoUrl;card.dataset.showCardLogo=data.showCardLogo?'true':'false';card.dataset.collection=data.collection;card.dataset.sectionId=data.sectionId;card.dataset.sectionName=data.sectionName;card.dataset.category=data.category||'';card.dataset.contentType=data.contentType||'';card.dataset.mediaType=data.mediaType||'';card.dataset.streamingAvailability=Array.isArray(data.streamingAvailability)?data.streamingAvailability.join(','):String(data.streamingAvailability||'');card.dataset.streamingLinks=typeof data.streamingLinks==='string'?data.streamingLinks:JSON.stringify(data.streamingLinks||{});card.dataset.preserveTitle=data.preserveTitle?'true':'false';
    var image=document.createElement('img');image.className='video-card-thumbnail';image.loading='lazy';image.decoding='async';image.fetchPriority='low';image.alt=data.title;image.src=mediaUrl(data.imageUrl||data.bannerUrl||'/_static/media/pages/billie-home-banner-default.webp');card.appendChild(image);
    var watched=Boolean(options.showWatched&&((row&&row.lastWatchedAt)||state.watchedContentIds[String(data.recordId||'')]));
    if(watched){var watchedBadge=document.createElement('span');watchedBadge.className='community-watched-badge';watchedBadge.textContent='WATCHED';watchedBadge.setAttribute('aria-label','Watched');card.appendChild(watchedBadge);}
    if(data.logoUrl&&data.logoUrl!=='#'&&(String(data.collection).toLowerCase()!=='videos'||data.showCardLogo)){var logoSlot=document.createElement('span');logoSlot.className='video-card-logo-slot';logoSlot.setAttribute('aria-hidden','true');var logo=document.createElement('img');logo.className='video-card-logo';logo.decoding='async';logo.alt='';logo.src=mediaUrl(data.logoUrl);logo.addEventListener('error',function(){logoSlot.remove();},{once:true});logoSlot.appendChild(logo);card.appendChild(logoSlot);}
    if(Number(row&&row.saves)>0){var social=document.createElement('span');social.className='community-favorite-social';social.setAttribute('aria-label',t('{count} curtidas',{count:Number(row.saves)||0}));var faces=document.createElement('span');faces.className='community-favorite-faces';var avatars=Array.isArray(row.fanAvatars)?row.fanAvatars.slice(0,3):[];avatars.forEach(function(person){var face=document.createElement('span');face.className='community-favorite-face'+(isCurrentProfilePerson(person)?' is-current-user':'');var faceImg=document.createElement('img');faceImg.decoding='async';faceImg.alt='';faceImg.src=window.BETVResolveAvatar?window.BETVResolveAvatar(person&&person.avatarUrl):mediaUrl(person&&person.avatarUrl||'/_static/media/profile/default-avatar.png');face.appendChild(faceImg);faces.appendChild(face);});social.appendChild(faces);var extra=Math.max(0,(Number(row.saves)||0)-avatars.length);var count=document.createElement('span');count.className='community-favorite-count';count.textContent=extra>0?'+'+extra:String(Number(row.saves)||0);social.appendChild(count);card.appendChild(social);}
    card.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();state.detailReturnToCommunity=true;closeCommunity(false,'community');if(typeof window.beOpenSavedContent==='function')window.beOpenSavedContent(data);else location.assign('/'+encodeURIComponent(data.itemId));});
    return card;
  }

  function renderRail(hostId,rows,emptyText,options){
    var host=document.getElementById(hostId);if(!host)return;
    host.innerHTML='';
    if(!Array.isArray(rows)||!rows.length){var empty=document.createElement('div');empty.className='community-empty';empty.textContent=emptyText;host.appendChild(empty);return;}
    var rail=document.createElement('div');rail.className='community-rail';rows.forEach(function(row){rail.appendChild(createVideoCard(row,options));});host.appendChild(rail);
  }

  function normalizeProfileAvatarRing(value){
    var normalized=String(value||'').trim().toUpperCase();
    return /^#[0-9A-F]{6}$/.test(normalized)?normalized:'';
  }

  function createRankAvatar(url,name,borderColor,username){
    var avatar=document.createElement('span');avatar.className='community-rank-avatar';
    var normalizedUsername=String(username||'').replace(/^@/,'').trim();
    if(normalizedUsername)avatar.dataset.ringUsername=normalizedUsername;
    var ring=normalizeProfileAvatarRing(borderColor);
    if(ring){avatar.classList.add('has-custom-ring');avatar.style.setProperty('--community-avatar-ring',ring);}
    var img=document.createElement('img');img.decoding='async';img.alt='';img.src=window.BETVResolveAvatar?window.BETVResolveAvatar(url):mediaUrl(url||'/_static/media/profile/default-avatar.png');avatar.appendChild(img);return avatar;
  }

  function hydrateRankingAvatarRings(root){
    if(!root||typeof window.BETVGetPublicAvatarRing!=='function')return;
    Array.prototype.forEach.call(root.querySelectorAll('.community-rank-avatar:not(.has-custom-ring)[data-ring-username]'),function(avatar){
      var username=String(avatar.dataset.ringUsername||'').trim();if(!username)return;
      Promise.resolve(window.BETVGetPublicAvatarRing(username)).then(function(color){
        var ring=normalizeProfileAvatarRing(color);if(!ring||!avatar.isConnected)return;
        avatar.classList.add('has-custom-ring');avatar.style.setProperty('--community-avatar-ring',ring);
      }).catch(function(){});
    });
  }

  function isCurrentProfilePerson(person){
    var me=currentUser();if(!me)return false;
    if(sameRankingUser(person,me))return true;
    var personUsername=String(person&&person.username||'').replace(/^@/,'').trim().toLowerCase();
    var meUsername=String(me&&((me.profile&&me.profile.username)||me.username)||'').replace(/^@/,'').trim().toLowerCase();
    return Boolean(personUsername&&meUsername&&personUsername===meUsername);
  }

  function sameRankingUser(left,right){
    var leftId=String(left&&(left.userId||left.user_id||left.uid)||'').trim();
    var rightId=String(right&&(right.userId||right.user_id||right.uid)||'').trim();
    if(leftId&&rightId)return leftId===rightId;
    var leftUsername=String(left&&left.username||'').replace(/^@/,'').trim().toLowerCase();
    var rightUsername=String(right&&right.username||'').replace(/^@/,'').trim().toLowerCase();
    return Boolean(leftUsername&&rightUsername&&leftUsername===rightUsername);
  }

  function rankingContainsUser(rows,item){
    if(!item||!item.position||!Array.isArray(rows)||!rows.length)return false;
    return rows.some(function(row){return sameRankingUser(row,item)||Number(row.position||0)===Number(item.position||0);});
  }

  function rankToneClass(item){
    var position=Number(item&&item.position||0);
    if(position===1)return ' rank-first';
    if(position===2)return ' rank-second';
    if(position===3)return ' rank-third';
    return position>0&&position<=3?' top-three':'';
  }

  function renderProfileRanking(rows){
    var host=document.getElementById('communityProfileRanking');if(!host)return;host.innerHTML='';
    if(!Array.isArray(rows)||!rows.length){var empty=document.createElement('div');empty.className='community-ranking-empty';empty.textContent=t('Ainda não há perfis suficientes para este ranking.');host.appendChild(empty);return;}
    rows.forEach(function(item){
      var button=document.createElement('button');button.type='button';button.className='community-ranking-row'+rankToneClass(item)+(isCurrentProfilePerson(item)?' is-current-user':'');
      var pos=document.createElement('span');pos.className='community-rank-number';pos.textContent='#'+String(item.position||'—');button.appendChild(pos);
      button.appendChild(createRankAvatar(item.avatarUrl,item.displayName,item.avatarBorderColor||item.avatar_border_color,item.username));
      var copy=document.createElement('span');copy.className='community-rank-copy';var nameLine=document.createElement('span');nameLine.className='community-rank-name-line';var strong=document.createElement('strong');strong.textContent=String(item.displayName||item.username||'Usuário');nameLine.appendChild(strong);var tagMarkup=communityTagMarkup(item&&item.communityTag);if(tagMarkup){var tagWrap=document.createElement('span');tagWrap.className='community-rank-tag';tagWrap.innerHTML=tagMarkup;nameLine.appendChild(tagWrap);}copy.appendChild(nameLine);var handle=document.createElement('span');handle.className='community-rank-handle';handle.textContent='@'+String(item.username||'usuario').replace(/^@/,'');copy.appendChild(handle);button.appendChild(copy);
      var value=document.createElement('span');value.className='community-rank-value';value.textContent=Number(item.likes)===1?t('1 curtida'):t('{count} curtidas',{count:Number(item.likes)||0});button.appendChild(value);
      button.addEventListener('click',function(){closeCommunity(false);var route='/@'+encodeURIComponent(String(item.username||'').replace(/^@/,''));if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go(route);else location.assign(route);});
      host.appendChild(button);
    });
    hydrateRankingAvatarRings(host);
  }

  function renderOwnRanking(hostId,item,visibility,hideBecauseListed){
    var own=document.getElementById(hostId);if(!own)return;own.innerHTML='';
    if(!currentUser()||hideBecauseListed){own.hidden=true;return;}
    if(visibility===false){own.hidden=false;own.className='community-ranking-own is-message';own.textContent=t('Você não está participando dos rankings públicos.');return;}
    if(!item||!item.position){own.hidden=false;own.className='community-ranking-own is-message';own.textContent=t('Ainda não há perfis suficientes para este ranking.');return;}
    own.hidden=false;own.className='community-ranking-own';
    var row=document.createElement('div');row.className='community-ranking-own-row';
    var pos=document.createElement('span');pos.className='community-rank-number';pos.textContent='#'+String(item.position);row.appendChild(pos);
    row.appendChild(createRankAvatar(item.avatarUrl,item.displayName,item.avatarBorderColor||item.avatar_border_color,item.username));
    var copy=document.createElement('span');copy.className='community-rank-copy';var nameLine=document.createElement('span');nameLine.className='community-rank-name-line';var strong=document.createElement('strong');strong.textContent=String(item.displayName||item.username||'Usuário');nameLine.appendChild(strong);var ownTagMarkup=communityTagMarkup(item&&item.communityTag);if(ownTagMarkup){var ownTag=document.createElement('span');ownTag.className='community-rank-tag';ownTag.innerHTML=ownTagMarkup;nameLine.appendChild(ownTag);}copy.appendChild(nameLine);row.appendChild(copy);
    var value=document.createElement('span');value.className='community-rank-value';value.textContent=Number(item.likes)===1?t('1 curtida'):t('{count} curtidas',{count:Number(item.likes)||0});row.appendChild(value);
    own.appendChild(row);
    hydrateRankingAvatarRings(own);
  }

  function renderPayload(payload){
    state.lastPayload=payload||{};
    state.watchedContentIds=Object.create(null);
    (Array.isArray(payload&&payload.recent)?payload.recent:[]).forEach(function(item){var id=String(item&&(item.contentId||item.content_id)||'').trim();if(id)state.watchedContentIds[id]=true;});
    var user=currentUser();
    var recentEmpty=user?t('Os vídeos que você assistir aparecerão aqui.'):t('Entre na sua conta para ver os vídeos assistidos recentemente.');
    renderRail('communityContinueContent',user?(payload.recent||[]):[],recentEmpty,{showWatched:true});
    renderRail('communityFavoritesContent',payload.fanFavorites||[],t('Os favoritos da comunidade aparecerão aqui.'));
    var profileRows=payload.profileRanking||[];
    renderProfileRanking(profileRows);
    renderOwnRanking('communityOwnProfile',payload.myProfilePosition,payload.rankingVisibility!==false,rankingContainsUser(profileRows,payload.myProfilePosition));
    if(user&&payload.rankingVisibility!==null&&payload.rankingVisibility!==undefined)writeRankingPreference(user.uid,payload.rankingVisibility!==false);
    applyI18n(page);
  }

  async function refreshCommunity(){
    if(!document.body.classList.contains('community-page-active'))return;
    if(state.loading)return;
    var requestId=++state.requestId;
    state.loading=true;
    document.getElementById("communityLoadError")?.remove();
    var profileLimit=15;
    try{
      var result=await window.BETVFeatures.withTimeout((async function(){
        await Promise.resolve(window.beBackend&&window.beBackend.ready);
        var client=window.beBackend&&window.beBackend.client;
        if(!client||typeof client.rpc!=='function')throw new Error('community_backend_unavailable');
        return client.rpc('get_community_overview',{p_profile_limit:profileLimit});
      })(),8000);
      if(result&&result.error)throw result.error;
      if(requestId!==state.requestId||!document.body.classList.contains('community-page-active'))return;
      renderPayload(result&&result.data&&typeof result.data==='object'?result.data:{});
    }catch(error){
      if(requestId!==state.requestId||!document.body.classList.contains('community-page-active'))return;
      var retry=document.createElement('button');retry.id='communityLoadError';retry.type='button';retry.className='profile-btn';retry.textContent=t('Tentar novamente');retry.onclick=refreshCommunity;if(page)page.prepend(retry);
      if(state.lastPayload)return;
      renderRail('communityContinueContent' ,[],currentUser()?t('Não foi possível carregar seu histórico agora.'):t('Entre na sua conta para ver os vídeos assistidos recentemente.'));
      renderRail('communityFavoritesContent',[],t('Não foi possível carregar os favoritos da comunidade agora.'));
      renderProfileRanking([]);renderOwnRanking('communityOwnProfile',null,readRankingPreference(currentUser()&&currentUser().uid),false);
    }finally{if(requestId===state.requestId)state.loading=false;}
  }

  async function recordWatchFromPlay(play){
    var user=currentUser();if(!user||!play)return false;
    var recordId=String(play.dataset.recordId||'');if(!validUuid(recordId))return false;
    try{await Promise.resolve(window.beBackend&&window.beBackend.ready);var client=window.beBackend&&window.beBackend.client;if(!client||typeof client.rpc!=='function')return false;var result=await client.rpc('record_community_watch',{p_content_id:recordId});if(result&&result.error)throw result.error;state.lastPayload=null;return result&&result.data!==false;}catch(error){(void 0);return false;}
  }

  function recordRecentFromPlay(play){
    if(!play)return;
    recordWatchFromPlay(play);
  }

  function mobileAccountItem(action,label,path,extra){
    return '<button type="button" role="menuitem" data-mobile-account="'+action+'"'+(extra||'')+'><span class="mobile-account-label">'+t(label)+'</span><svg class="mobile-account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg></button>';
  }
  function createMobileAccountMenu(){
    if(document.getElementById('mobileAccountPopover')){mobileMenu=document.getElementById('mobileAccountPopover');return;}
    var trigger=document.getElementById('mobileProfileButton');if(trigger){trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-controls','mobileAccountPopover');trigger.setAttribute('aria-expanded','false');}
    var icons={home:'<path d="m3 10 9-7 9 7v10h-6v-7H9v7H3Z"/>',films:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4"/>',videos:'<rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2Z"/>',people:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M15 15a5 5 0 0 1 6 5"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',heart:'<path d="M20.8 5.6a5.4 5.4 0 0 0-8.8 1 5.4 5.4 0 0 0-8.8 6L12 21l8.8-8.4a5.4 5.4 0 0 0 0-7Z"/>',support:'<path d="M4 13a8 8 0 0 1 16 0v6h-4v-7h4M4 12h4v7H4ZM16 19c0 2-2 3-4 3"/>',install:'<path d="M12 3v11m-4-4 4 4 4-4M5 18v3h14v-3"/>',logout:'<path d="M10 5H4v14h6m5-11 4 4-4 4M19 12H9"/>'};
    var item=mobileAccountItem;
    mobileMenu=document.createElement('div');mobileMenu.className='mobile-account-popover';mobileMenu.id='mobileAccountPopover';mobileMenu.setAttribute('role','menu');mobileMenu.setAttribute('aria-label','Menu');
    mobileMenu.innerHTML='<div class="mobile-account-group" role="none">'+item('profile','Perfil',icons.user)+item('community','Comunidade',icons.people)+item('settings','Configurações',icons.settings)+'</div>'+
      '<div class="mobile-account-group" role="none">'+item('support','Suporte',icons.support)+item('donate','Apoie uma ONG',icons.heart)+'</div>'+
      '<div class="mobile-account-group" role="none">'+item('login','Entrar',icons.user)+item('install','Instalar app',icons.install)+item('logout','Sair',icons.logout,' class="danger"')+'</div>';
    document.body.appendChild(mobileMenu);applyI18n(mobileMenu);if(typeof window.BETVSyncInstallUi==='function')window.BETVSyncInstallUi();
    mobileMenu.addEventListener('click',function(event){
      var button=event.target.closest('[data-mobile-account]');if(!button)return;
      var action=button.dataset.mobileAccount;closeMobileAccountMenu();
      if(['home','films','videos','search','support','fans'].includes(action)){window.dispatchEvent(new CustomEvent('be:mobile-destination',{detail:{destination:action}}));return;}
      if(action==='community'){openCommunity();return;}
      if(action==='notifications'){window.dispatchEvent(new CustomEvent('be:open-notifications'));return;}
      if(action==='billie'||action==='donate'){var link=document.querySelector(action==='billie'?'a[data-open-billie]':'a[data-open-donate]');if(link)link.click();else if(window.BETVPublicRoutes)window.BETVPublicRoutes.go(action==='billie'?'/billie-eilish':'/ong');return;}
      if(action==='login'){var accountAction=document.getElementById('publicAuthAction');if(accountAction)accountAction.click();else if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/login');return;}
      if(action==='profile'||action==='settings'){var nav=window.BETVNavigation;if(nav&&typeof nav[action==='profile'?'openProfile':'openSettings']==='function')nav[action==='profile'?'openProfile':'openSettings']();else{var original=document.querySelector('#userDropdown [data-public-action="'+action+'"]');if(original)original.click();}return;}
      if(action==='install'){if(typeof window.BETVRequestAppInstall==='function')window.BETVRequestAppInstall();return;}
      if(action==='logout'){var authAction=document.getElementById('publicAuthAction');if(authAction)authAction.click();}
    });
    mobileMenu.addEventListener('keydown',function(event){
      var items=Array.from(mobileMenu.querySelectorAll('[role="menuitem"]')).filter(function(item){return !item.hidden;});
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeMobileAccountMenu();document.getElementById('mobileProfileButton')?.focus();return;}
      if(event.key==='Tab'){closeMobileAccountMenu();return;}
      if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
      event.preventDefault();var index=items.indexOf(document.activeElement);var next=event.key==='Home'?0:event.key==='End'?items.length-1:event.key==='ArrowDown'?(index+1)%items.length:(index-1+items.length)%items.length;items[next]?.focus();
    });
  }
  function positionMobileAccountMenu(){
    if(!mobileMenu)return;var trigger=document.getElementById('mobileProfileButton');if(!trigger)return;
    var rect=trigger.getBoundingClientRect();var viewport=window.visualViewport;
    var height=Math.min(window.innerHeight,viewport&&viewport.height||window.innerHeight);var width=Math.min(260,window.innerWidth-24);
    var top=Math.max(12,Math.min(rect.bottom+8,height-120));
    var alignRight=rect.left+rect.width/2>=window.innerWidth/2;
    var left=alignRight?rect.right-width:rect.left;
    mobileMenu.style.width=width+'px';mobileMenu.style.maxHeight=Math.max(80,height-top-12)+'px';mobileMenu.style.left=Math.max(12,Math.min(left,window.innerWidth-width-12))+'px';mobileMenu.style.top=top+'px';
    mobileMenu.style.transformOrigin=alignRight?'top right':'top left';
  }
  function openMobileAccountMenu(){
    if(!window.matchMedia('(max-width:760px)').matches)return;createMobileAccountMenu();
    var user=currentUser();var expectedSession=false;try{expectedSession=localStorage.getItem('beAuthExpected')==='1'&&Boolean(localStorage.getItem('beSessionUid'));}catch(_){ }
    var loggedIn=Boolean(user)||expectedSession;var guestActive=!loggedIn&&Boolean(window.BETVGuestAccess&&window.BETVGuestAccess.isActive());
    mobileMenu.classList.toggle('is-logged-out',!loggedIn);mobileMenu.classList.toggle('is-guest-account',guestActive);
    mobileMenu.querySelector('[data-mobile-account="login"]').hidden=loggedIn;
    ['profile','settings','logout'].forEach(function(action){mobileMenu.querySelector('[data-mobile-account="'+action+'"]').hidden=!loggedIn;});
    var install=mobileMenu.querySelector('[data-mobile-account="install"]');var running=typeof window.BETVIsAppRunning==='function'&&window.BETVIsAppRunning();var installed=typeof window.BETVIsAppInstalled==='function'&&window.BETVIsAppInstalled();
    install.hidden=running;install.querySelector('.mobile-account-label').textContent=installed&&!running?'Abrir app':'Instalar app';install.classList.toggle('is-installed',installed&&!running);
    applyI18n(mobileMenu);positionMobileAccountMenu();document.body.classList.add('mobile-account-menu-open');
    var trigger=document.getElementById('mobileProfileButton');if(trigger)trigger.setAttribute('aria-expanded','true');
    mobileMenu.querySelector('[role="menuitem"]:not([hidden])')?.focus({preventScroll:true});
  }
  function closeMobileAccountMenu(){document.body.classList.remove('mobile-account-menu-open');var trigger=document.getElementById('mobileProfileButton');if(trigger)trigger.setAttribute('aria-expanded','false');}
  function toggleMobileAccountMenu(){if(document.body.classList.contains('mobile-account-menu-open'))closeMobileAccountMenu();else openMobileAccountMenu();}

  async function loadRankingPreference(input,status,user){
    var request=++preferenceRequest;var local=readRankingPreference(user.uid);input.checked=local;
    try{await Promise.resolve(window.beBackend&&window.beBackend.ready);var pref=window.beBackend&&window.beBackend.preferences;if(!pref||typeof pref.get!=='function')return;var row=await pref.get(user.uid,{force:true});if(request!==preferenceRequest||!document.body.contains(input))return;var value=!(row&&row.data&&row.data.communityRankingsPublic===false);writeRankingPreference(user.uid,value);input.checked=value;}catch(_){ }
  }

  function injectPrivacySettings(){
    var body=document.getElementById('settingsPageBody');var panel=body&&body.querySelector('[data-settings-panel="profile"]');var user=currentUser();if(!panel||!user||panel.querySelector('.community-privacy-card'))return;
    var card=document.createElement('div');card.className='settings-panel-card community-privacy-card';
    card.innerHTML='<div class="community-privacy-copy"><h2>Rankings da Comunidade</h2><p>Escolha se seu perfil pode aparecer no ranking público de perfis mais curtidos da Comunidade.</p></div><label class="community-privacy-toggle" for="communityRankingVisibility"><span>Participar do ranking público da Comunidade</span><span class="community-privacy-switch"><input id="communityRankingVisibility" type="checkbox"><i aria-hidden="true"></i></span></label><div class="community-privacy-status" id="communityRankingVisibilityStatus" aria-live="polite"></div>';
    panel.appendChild(card);applyI18n(card);
    var input=card.querySelector('#communityRankingVisibility');var status=card.querySelector('#communityRankingVisibilityStatus');loadRankingPreference(input,status,user);
    input.addEventListener('change',async function(){var enabled=input.checked;writeRankingPreference(user.uid,enabled);status.textContent=t('Salvando…');status.className='community-privacy-status';input.disabled=true;try{await Promise.resolve(window.beBackend&&window.beBackend.ready);var pref=window.beBackend&&window.beBackend.preferences;if(!pref||typeof pref.get!=='function'||typeof pref.save!=='function')throw new Error('preferences_unavailable');var current=await pref.get(user.uid,{force:true});var payload=Object.assign({},current&&current.data||{}, {communityRankingsPublic:enabled,updatedAt:new Date().toISOString()});await pref.save(user.uid,payload);if(typeof window.beScheduleUserDataSync==='function')window.beScheduleUserDataSync('community-ranking-privacy');status.textContent=t('Preferência salva.');status.className='community-privacy-status ok';window.dispatchEvent(new CustomEvent('be:community-ranking-visibility',{detail:{enabled:enabled}}));if(document.body.classList.contains('community-page-active'))refreshCommunity();}catch(error){input.checked=!enabled;writeRankingPreference(user.uid,!enabled);status.textContent=t('Não foi possível salvar agora.');status.className='community-privacy-status err';}finally{input.disabled=false;}});
  }

  function bind(){
    createPage();createMobileAccountMenu();scheduleBoafStreamNotice(1000);window.setTimeout(retryPendingBoafClaim,900);
    var tab=document.querySelector('[data-community-tab]');if(tab)tab.addEventListener('click',function(event){event.preventDefault();openCommunity();});
    var play=document.getElementById('contentDetailPlay');
    if(play&&play.dataset.communityRecentBound!=='true'){
      play.dataset.communityRecentBound='true';
      play.addEventListener('pointerup',function(){recordRecentFromPlay(play);});
      play.addEventListener('keydown',function(event){if(event.key==='Enter')recordRecentFromPlay(play);});
    }
    document.addEventListener('click',function(event){
      var insideCommunity=event.target&&event.target.closest?event.target.closest('#communityPage'):null;
      if(insideCommunity&&document.body.classList.contains('community-page-active')){
        if(page)page.hidden=false;
        setHomeTab('community');
        return;
      }
      var headerUtility=event.target&&event.target.closest?event.target.closest('#userChip,#notificationButton,#mobileProfileButton,#mobileNotificationButton,#homeSearchToggle,#homeSearchInput,#mobileSearchButton,#mobileSearchInput'):null;
      if(headerUtility)preserveCommunitySurfaceForHeaderUtility();
      if(document.body.classList.contains('mobile-account-menu-open')){var trigger=event.target&&event.target.closest?event.target.closest('#mobileProfileButton'):null;if(!trigger&&mobileMenu&&!mobileMenu.contains(event.target))closeMobileAccountMenu();}
      var profileRoute=event.target&&event.target.closest?event.target.closest('[data-public-action="profile"],[data-public-action="settings"]'):null;
      if(profileRoute&&document.body.classList.contains('community-page-active'))closeCommunity(false);
      var notificationHome=event.target&&event.target.closest?event.target.closest('#notificationPageClose,#notificationPageHome'):null;
      if(notificationHome)setHomeTab('home');
      var nav=event.target&&event.target.closest?event.target.closest('#logoBtn,[data-home-view],[data-public-action="support"],[data-public-action="donate"]'):null;
      if(nav&&!nav.matches('[data-community-tab]')){var target='home';if(nav.dataset&&nav.dataset.homeView)target=nav.dataset.homeView;else if(nav.matches('[data-public-action="support"]'))target='support';closeCommunity(false,target);}
    },true);




    document.addEventListener('input',function(event){
      var searchField=event.target&&event.target.closest?event.target.closest('#homeSearchInput,#mobileSearchInput'):null;
      if(searchField)preserveCommunitySurfaceForHeaderUtility();
    },true);
    document.addEventListener('focusin',function(event){
      var searchField=event.target&&event.target.closest?event.target.closest('#homeSearchInput,#mobileSearchInput'):null;
      if(searchField)preserveCommunitySurfaceForHeaderUtility();
    },true);
    window.addEventListener('be:toggle-mobile-account-menu',toggleMobileAccountMenu);
    window.addEventListener('be:close-notification-menus',closeMobileAccountMenu);
    window.addEventListener('popstate',function(){closeMobileAccountMenu();if(document.body.classList.contains('community-page-active'))closeCommunity(true);window.setTimeout(function(){if(state.detailReturnToCommunity&&!document.body.classList.contains('detail-page-active')&&!document.body.classList.contains('notification-page-active')&&!document.body.classList.contains('profile-page-active')&&!document.body.classList.contains('settings-page-active')){state.detailReturnToCommunity=false;openCommunity();return;}if(!document.body.classList.contains('community-page-active')&&!document.body.classList.contains('detail-page-active')&&!document.body.classList.contains('notification-page-active')&&!document.body.classList.contains('profile-page-active')&&!document.body.classList.contains('settings-page-active')&&!document.body.classList.contains('support-page-active')&&!document.body.classList.contains('legal-page-active')&&!document.body.classList.contains('billie-page-active')&&!document.body.classList.contains('donate-page-active')&&!document.body.classList.contains('fans-page-active')&&!document.body.classList.contains('album-page-active'))setHomeTab(catalogTabForView(state.catalogHomeView));},0);});
    window.addEventListener('hashchange',closeMobileAccountMenu);
    window.addEventListener('resize',function(){if(!window.matchMedia('(max-width:760px)').matches)closeMobileAccountMenu();else if(document.body.classList.contains('mobile-account-menu-open'))positionMobileAccountMenu();});
    function syncMobileMenuPosition(){if(document.body.classList.contains('mobile-account-menu-open'))positionMobileAccountMenu();}
    if(window.visualViewport)window.visualViewport.addEventListener('resize',syncMobileMenuPosition);
    new MutationObserver(syncMobileMenuPosition).observe(document.body,{attributes:true,attributeFilter:['class']});
    document.addEventListener('keydown',function(event){if(event.key==='Escape')closeMobileAccountMenu();});
    var settingsBody=document.getElementById('settingsPageBody');if(settingsBody){new MutationObserver(function(){injectPrivacySettings();}).observe(settingsBody,{childList:true,subtree:true});}
    window.addEventListener('be:catalog-ready',function(){if(document.body.classList.contains('community-page-active')){toggleCatalogVisibility(true);setHomeTab('community');}});
    window.addEventListener('be:open-config',function(){setTimeout(injectPrivacySettings,0);});
    window.addEventListener('be:user-data-synced',function(event){var user=currentUser();var data=event&&event.detail&&event.detail.data;if(user&&data&&Object.prototype.hasOwnProperty.call(data,'communityRankingsPublic'))writeRankingPreference(user.uid,data.communityRankingsPublic!==false);});
    window.addEventListener('be:community-ranking-visibility',function(event){var user=currentUser();if(user)writeRankingPreference(user.uid,!(event&&event.detail&&event.detail.enabled===false));});
    window.beBackend&&window.beBackend.auth&&window.beBackend.auth.onChange&&window.beBackend.auth.onChange(function(user){setTimeout(injectPrivacySettings,50);if(document.body.classList.contains('community-page-active'))refreshCommunity();var active=user&&user.uid?user:currentUser();if(!active||!active.uid){boafNoticeOpenedForUser='';if(boafNoticeTimer){window.clearTimeout(boafNoticeTimer);boafNoticeTimer=0;}hideBoafStreamPanelWithoutDismiss();return;}window.setTimeout(function(){scheduleBoafStreamNotice(350);retryPendingBoafClaim();},450);});
    window.addEventListener('be:profile-share-campaign-complete',function(){scheduleBoafStreamNotice(300);});
    window.addEventListener('be:profile-favorites-changed',function(){scheduleBoafStreamNotice(300);});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

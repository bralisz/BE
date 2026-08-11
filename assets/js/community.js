;(function(){
  'use strict';
  if(String(location.hash||'').startsWith('#/admin')) return;

  var state={period:'month',loading:false,lastPayload:null,requestId:0,detailReturnToCommunity:false};
  var page=null;
  var mobileMenu=null;
  var preferenceRequest=0;
  var detailWatch={sessionId:'',contentId:'',armedContentId:'',timer:null,inFlight:false};

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
  function formatWatchTime(seconds){
    var total=Math.max(0,Math.round(Number(seconds)||0));
    var hours=Math.floor(total/3600);
    var minutes=Math.floor((total%3600)/60);
    if(hours>0)return hours+'h '+minutes+'min';
    return Math.max(1,minutes)+'min';
  }
  function rankingPreferenceKey(userId){return 'beCommunityRankingsPublic:'+String(userId||'guest');}
  function readRankingPreference(userId){
    try{var value=localStorage.getItem(rankingPreferenceKey(userId));if(value==='false')return false;if(value==='true')return true;}catch(_){ }
    return true;
  }
  function writeRankingPreference(userId,value){try{localStorage.setItem(rankingPreferenceKey(userId),value?'true':'false');}catch(_){ }}
  function setHomeTab(tab){try{window.dispatchEvent(new CustomEvent('be:set-home-tab',{detail:{tab:String(tab||'home')}}));}catch(_){ }}

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
      +  '<header class="community-page-heading"><h1>Comunidade dos Avocados</h1><p>Descubra o que os fãs estão assistindo, salvando e curtindo dentro do Billie Eilish TV.</p></header>'
      +  '<section class="community-section" id="communityContinueSection"><div class="community-section-head"><h2>Continue assistindo</h2></div><div id="communityContinueContent"></div></section>'
      +  '<section class="community-section"><div class="community-section-head"><h2>Favoritos dos fãs</h2></div><div id="communityFavoritesContent"></div></section>'
      +  '<section class="community-section"><div class="community-section-head"><h2>Perfis em destaque</h2><details class="community-rules-details"><summary class="community-rules-button">Regras</summary><div class="community-rules-panel" id="communityProfileRules">Este ranking mostra os perfis que mais receberam curtidas da comunidade. Você pode compartilhar seu perfil com outros usuários para que eles conheçam sua página e possam curti-la.</div></details></div><div class="community-ranking-wrap"><div class="community-ranking-card" id="communityProfileRanking"></div><div class="community-ranking-own" id="communityOwnProfile" hidden></div></div></section>'
      +  '<section class="community-section"><div class="community-section-head"><h2>Quem mais assistiu</h2><div class="community-watch-toolbar" role="group" aria-label="Período do ranking"><button class="community-watch-filter active" type="button" data-community-period="month">Este mês</button><button class="community-watch-filter" type="button" data-community-period="all">Todos os tempos</button></div></div><div class="community-ranking-wrap"><div class="community-ranking-card" id="communityWatchRanking"></div><div class="community-ranking-own" id="communityOwnWatch" hidden></div></div></section>'
      +  '<div class="community-supporters-cta-wrap"><button class="community-supporters-cta" id="communitySupportersButton" type="button">Ver fãs que apoiam o site</button></div>'
      +  '<section class="community-ong-spotlight" id="communityOngSpotlight" hidden aria-label="Apoie uma ONG"><div class="community-ong-spotlight-frame"><img id="communityOngSpotlightImage" alt="Apoie uma ONG" loading="lazy" decoding="async"><div class="community-ong-spotlight-overlay" aria-hidden="true"></div><a class="community-ong-spotlight-button" href="/ong" data-open-donate="true">Apoie uma ONG</a></div></section>'
      +'</div>';
    main.appendChild(page);
    page.querySelector('#communitySupportersButton').addEventListener('click',function(){closeCommunity(false);if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go('/fãs');else location.assign('/fãs');});
    var ongButton=page.querySelector('.community-ong-spotlight-button');if(ongButton)ongButton.addEventListener('click',function(){closeCommunity(false);});
    loadCommunityOngBanner();
    page.querySelectorAll('[data-community-period]').forEach(function(button){button.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();document.body.classList.add('community-page-active');if(page)page.hidden=false;state.period=button.dataset.communityPeriod==='all'?'all':'month';page.querySelectorAll('[data-community-period]').forEach(function(item){item.classList.toggle('active',item===button);});setHomeTab('community');refreshCommunity();});});
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
    var main=document.querySelector('body > main');
    if(main){
      Array.prototype.slice.call(main.children||[]).forEach(function(child){
        if(child===page){
          child.hidden=!showCommunity;
          if(showCommunity)child.style.setProperty('display','block','important');
          else child.style.removeProperty('display');
          return;
        }
        if(showCommunity){
          child.dataset.communityPrevHidden=child.hidden?'1':'0';
          child.hidden=true;
          child.style.setProperty('display','none','important');
        }else if(Object.prototype.hasOwnProperty.call(child.dataset||{},'communityPrevHidden')){
          child.hidden=child.dataset.communityPrevHidden==='1';
          delete child.dataset.communityPrevHidden;
          child.style.removeProperty('display');
        }else child.style.removeProperty('display');
      });
    }
    var catalog=document.getElementById('dynamicSections');
    if(catalog){
      if(showCommunity){
        catalog.dataset.communityPrevHidden=catalog.hidden?'1':'0';
        catalog.hidden=true;
        catalog.style.setProperty('display','none','important');
      }else{
        if(Object.prototype.hasOwnProperty.call(catalog.dataset||{},'communityPrevHidden')){
          catalog.hidden=catalog.dataset.communityPrevHidden==='1';
          delete catalog.dataset.communityPrevHidden;
        }
        catalog.style.removeProperty('display');
      }
    }
  }

  function closeCommunity(resetView,tabAfter){
    if(document.body.classList.contains('community-page-active')){
      document.body.classList.remove('community-page-active');
      toggleCatalogVisibility(false);
      if(page)page.hidden=true;
    }
    setCommunityNavActive(false);
    if(resetView!==false&&document.body.dataset.homeView==='community')document.body.dataset.homeView='home';
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
    establishCatalogBase();
    createPage();
    if(!page)return;
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
  window.BETVCommunity={open:openCommunity,close:closeCommunity,refresh:refreshCommunity};
  window.addEventListener('be:open-community',openCommunity);
  ['be:open-profile-route','be:open-config','be:open-notifications','be:open-support','be:open-donate-page','be:open-fans-page','be:open-billie-page','be:open-album-page','be:open-legal-route'].forEach(function(name){window.addEventListener(name,function(){state.detailReturnToCommunity=false;closeCommunity(false);});});
  window.addEventListener('be:home-entered',function(){state.detailReturnToCommunity=false;closeCommunity(true,'home');});

  function catalogData(row){
    row=row&&typeof row==='object'?row:{};
    var contentId=String(row.contentId||row.content_id||'');
    var escapedContentId=contentId?(window.CSS&&typeof window.CSS.escape==='function'?window.CSS.escape(contentId):contentId.replace(/([\"'\\.#:[\](),>+~*=\s])/g,'\\$1')):'';
    var original=contentId?document.querySelector('[data-open-detail="true"][data-record-id="'+escapedContentId+'"]'):null;
    if(original){
      var d=original.dataset||{};
      return {itemId:String(d.itemId||numericPublicId(contentId)),recordId:contentId,favoriteId:(d.collection||row.collection||'videos')+':'+contentId,title:String(d.title||'Conteúdo'),description:String(d.description||''),year:String(d.year||''),duration:String(d.duration||''),contentUrl:String(d.contentUrl||'#'),imageUrl:String(d.imageUrl||''),bannerUrl:String(d.bannerUrl||d.imageUrl||''),logoUrl:String(d.logoUrl||''),collection:String(d.collection||row.collection||'videos'),sectionId:String(d.sectionId||''),sectionName:String(d.sectionName||''),streamingAvailability:String(d.streamingAvailability||''),streamingLinks:String(d.streamingLinks||''),category:String(d.category||''),contentType:String(d.contentType||''),mediaType:String(d.mediaType||''),preserveTitle:String(d.preserveTitle||'')==='true'};
    }
    var data=row.data&&typeof row.data==='object'?row.data:{};
    var collection=String(row.collection||data.collection||'videos');
    var recordId=contentId||String(data.id||'');
    return {itemId:numericPublicId(data.publicId||recordId||data.title),recordId:recordId,favoriteId:recordId?collection+':'+recordId:'',title:String(data.title||'Conteúdo'),description:String(data.description||''),year:String(data.year||''),duration:String(data.duration||data.videoDuration||data.runtime||''),contentUrl:String(data.videoUrl||data.contentUrl||data.link||'#'),imageUrl:String(data.thumbnailUrl||data.imageUrl||data.bannerUrl||''),bannerUrl:String(collection==='movies'||collection==='series'?(data.thumbnailUrl||data.imageUrl||data.bannerUrl||''):(data.bannerUrl||data.imageUrl||data.thumbnailUrl||'')),logoUrl:String(data.logoUrl||''),collection:collection,sectionId:String(data.sectionId||''),sectionName:String(data.sectionName||''),streamingAvailability:data.streamingAvailability||[],streamingLinks:data.streamingLinks||{},category:String(data.category||data.type||''),contentType:String(data.contentType||''),mediaType:String(data.mediaType||''),preserveTitle:Boolean(data.preserveTitle)};
  }

  function createVideoCard(row){
    var data=catalogData(row);
    var card=document.createElement('a');
    card.className='video-card'+(data.preserveTitle?' notranslate':'');
    if(data.preserveTitle)card.setAttribute('translate','no');
    card.href='/'+encodeURIComponent(data.itemId);
    card.setAttribute('aria-label',data.title);
    card.dataset.itemId=data.itemId;card.dataset.recordId=data.recordId;card.dataset.openDetail='true';card.dataset.title=data.title;card.dataset.description=data.description;card.dataset.year=data.year;card.dataset.duration=data.duration;card.dataset.contentUrl=data.contentUrl;card.dataset.imageUrl=data.imageUrl;card.dataset.bannerUrl=data.bannerUrl;card.dataset.logoUrl=data.logoUrl;card.dataset.collection=data.collection;card.dataset.sectionId=data.sectionId;card.dataset.sectionName=data.sectionName;card.dataset.category=data.category||'';card.dataset.contentType=data.contentType||'';card.dataset.mediaType=data.mediaType||'';card.dataset.streamingAvailability=Array.isArray(data.streamingAvailability)?data.streamingAvailability.join(','):String(data.streamingAvailability||'');card.dataset.streamingLinks=typeof data.streamingLinks==='string'?data.streamingLinks:JSON.stringify(data.streamingLinks||{});card.dataset.preserveTitle=data.preserveTitle?'true':'false';
    var image=document.createElement('img');image.className='video-card-thumbnail';image.loading='lazy';image.decoding='async';image.alt=data.title;image.src=mediaUrl(data.imageUrl||data.bannerUrl||'/assets/images/pages/billie-home-banner-default.webp');card.appendChild(image);
    if(data.logoUrl&&data.logoUrl!=='#'&&String(data.collection).toLowerCase()!=='videos'){var logoSlot=document.createElement('span');logoSlot.className='video-card-logo-slot';logoSlot.setAttribute('aria-hidden','true');var logo=document.createElement('img');logo.className='video-card-logo';logo.loading='lazy';logo.decoding='async';logo.alt='';logo.src=mediaUrl(data.logoUrl);logo.addEventListener('error',function(){logoSlot.remove();},{once:true});logoSlot.appendChild(logo);card.appendChild(logoSlot);}
    if(Number(row&&row.saves)>0){var social=document.createElement('span');social.className='community-favorite-social';social.setAttribute('aria-label',t('{count} curtidas',{count:Number(row.saves)||0}));var faces=document.createElement('span');faces.className='community-favorite-faces';var avatars=Array.isArray(row.fanAvatars)?row.fanAvatars.slice(0,3):[];avatars.forEach(function(person){var face=document.createElement('span');face.className='community-favorite-face';var faceImg=document.createElement('img');faceImg.loading='lazy';faceImg.decoding='async';faceImg.alt='';faceImg.src=window.BETVResolveAvatar?window.BETVResolveAvatar(person&&person.avatarUrl):mediaUrl(person&&person.avatarUrl||'/assets/images/profile/default-avatar.png');face.appendChild(faceImg);faces.appendChild(face);});social.appendChild(faces);var extra=Math.max(0,(Number(row.saves)||0)-avatars.length);var count=document.createElement('span');count.className='community-favorite-count';count.textContent=extra>0?'+'+extra:String(Number(row.saves)||0);social.appendChild(count);card.appendChild(social);}
    card.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();state.detailReturnToCommunity=true;closeCommunity(false,'community');if(typeof window.beOpenSavedContent==='function')window.beOpenSavedContent(data);else location.assign('/'+encodeURIComponent(data.itemId));});
    return card;
  }

  function renderRail(hostId,rows,emptyText){
    var host=document.getElementById(hostId);if(!host)return;
    host.innerHTML='';
    if(!Array.isArray(rows)||!rows.length){var empty=document.createElement('div');empty.className='community-empty';empty.textContent=emptyText;host.appendChild(empty);return;}
    var rail=document.createElement('div');rail.className='community-rail';rows.forEach(function(row){rail.appendChild(createVideoCard(row));});host.appendChild(rail);
  }

  function createRankAvatar(url,name){
    var avatar=document.createElement('span');avatar.className='community-rank-avatar';
    var img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt='';img.src=window.BETVResolveAvatar?window.BETVResolveAvatar(url):mediaUrl(url||'/assets/images/profile/default-avatar.png');avatar.appendChild(img);return avatar;
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
      var button=document.createElement('button');button.type='button';button.className='community-ranking-row'+rankToneClass(item);
      var pos=document.createElement('span');pos.className='community-rank-number';pos.textContent='#'+String(item.position||'—');button.appendChild(pos);
      button.appendChild(createRankAvatar(item.avatarUrl,item.displayName));
      var copy=document.createElement('span');copy.className='community-rank-copy';var strong=document.createElement('strong');strong.textContent=String(item.displayName||item.username||'Usuário');var handle=document.createElement('span');handle.textContent='@'+String(item.username||'usuario').replace(/^@/,'');copy.append(strong,handle);button.appendChild(copy);
      var value=document.createElement('span');value.className='community-rank-value';value.textContent=Number(item.likes)===1?t('1 curtida'):t('{count} curtidas',{count:Number(item.likes)||0});button.appendChild(value);
      button.addEventListener('click',function(){closeCommunity(false);var route='/@'+encodeURIComponent(String(item.username||'').replace(/^@/,''));if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go(route);else location.assign(route);});
      host.appendChild(button);
    });
  }

  function renderOwnRanking(hostId,item,kind,visibility,hideBecauseListed){
    var own=document.getElementById(hostId);if(!own)return;own.innerHTML='';
    if(!currentUser()||hideBecauseListed){own.hidden=true;return;}
    if(visibility===false){own.hidden=false;own.className='community-ranking-own is-message';own.textContent=t('Você não está participando dos rankings públicos.');return;}
    if(!item||!item.position){own.hidden=false;own.className='community-ranking-own is-message';own.textContent=kind==='watch'?t('Sua posição aparecerá aqui após você assistir a algum conteúdo.'):t('Ainda não há perfis suficientes para este ranking.');return;}
    own.hidden=false;own.className='community-ranking-own';
    var row=document.createElement('div');row.className='community-ranking-own-row';
    var pos=document.createElement('span');pos.className='community-rank-number';pos.textContent='#'+String(item.position);row.appendChild(pos);
    row.appendChild(createRankAvatar(item.avatarUrl,item.displayName));
    var copy=document.createElement('span');copy.className='community-rank-copy';var strong=document.createElement('strong');strong.textContent=String(item.displayName||item.username||'Usuário');copy.appendChild(strong);row.appendChild(copy);
    var value=document.createElement('span');value.className='community-rank-value';value.textContent=kind==='watch'?formatWatchTime(item.watchSeconds):(Number(item.likes)===1?t('1 curtida'):t('{count} curtidas',{count:Number(item.likes)||0}));row.appendChild(value);
    own.appendChild(row);
  }

  function renderWatchRanking(rows,myPosition,visibility,hideBecauseListed){
    var host=document.getElementById('communityWatchRanking');if(!host)return;host.innerHTML='';
    if(!Array.isArray(rows)||!rows.length){var empty=document.createElement('div');empty.className='community-ranking-empty';empty.textContent=t('Ainda não há atividade suficiente para este ranking.');host.appendChild(empty);}
    else rows.forEach(function(item){
      var button=document.createElement('button');button.type='button';button.className='community-ranking-row'+rankToneClass(item);
      var pos=document.createElement('span');pos.className='community-rank-number';pos.textContent='#'+String(item.position||'—');button.appendChild(pos);button.appendChild(createRankAvatar(item.avatarUrl,item.displayName));
      var copy=document.createElement('span');copy.className='community-rank-copy';var strong=document.createElement('strong');strong.textContent=String(item.displayName||item.username||'Usuário');var handle=document.createElement('span');handle.textContent='@'+String(item.username||'usuario').replace(/^@/,'');copy.append(strong,handle);button.appendChild(copy);
      var value=document.createElement('span');value.className='community-rank-value';value.textContent=formatWatchTime(item.watchSeconds);button.appendChild(value);
      button.addEventListener('click',function(){closeCommunity(false);var route='/@'+encodeURIComponent(String(item.username||'').replace(/^@/,''));if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go(route);else location.assign(route);});host.appendChild(button);
    });
    renderOwnRanking('communityOwnWatch',myPosition,'watch',visibility,hideBecauseListed);
  }

  function renderPayload(payload){
    state.lastPayload=payload||{};
    var user=currentUser();
    var recentEmpty=user?t('Os vídeos que você assistir aparecerão aqui.'):t('Entre na sua conta para ver os vídeos assistidos recentemente.');
    renderRail('communityContinueContent',user?(payload.recent||[]):[],recentEmpty);
    renderRail('communityFavoritesContent',payload.fanFavorites||[],t('Os favoritos da comunidade aparecerão aqui.'));
    var profileRows=payload.profileRanking||[];
    var watchRows=payload.watchRanking||[];
    renderProfileRanking(profileRows);
    renderOwnRanking('communityOwnProfile',payload.myProfilePosition,'profile',payload.rankingVisibility!==false,rankingContainsUser(profileRows,payload.myProfilePosition));
    renderWatchRanking(watchRows,payload.myWatchPosition,payload.rankingVisibility!==false,rankingContainsUser(watchRows,payload.myWatchPosition));
    if(user&&payload.rankingVisibility!==null&&payload.rankingVisibility!==undefined)writeRankingPreference(user.uid,payload.rankingVisibility!==false);
    applyI18n(page);
  }

  async function refreshCommunity(){
    if(!document.body.classList.contains('community-page-active'))return;
    var requestId=++state.requestId;
    state.loading=true;
    var period=state.period;
    var profileLimit=15;
    try{
      await Promise.resolve(window.beBackend&&window.beBackend.ready);
      var client=window.beBackend&&window.beBackend.client;
      if(!client||typeof client.rpc!=='function')throw new Error('community_backend_unavailable');
      var result=await client.rpc('get_community_overview',{p_watch_period:period,p_profile_limit:profileLimit,p_watch_limit:15});
      if(result&&result.error)throw result.error;
      if(requestId!==state.requestId||!document.body.classList.contains('community-page-active'))return;
      renderPayload(result&&result.data&&typeof result.data==='object'?result.data:{});
    }catch(error){
      if(requestId!==state.requestId||!document.body.classList.contains('community-page-active'))return;
      console.warn('Comunidade:',error&&error.message?error.message:error);
      renderRail('communityContinueContent',[],currentUser()?t('Não foi possível carregar seu histórico agora.'):t('Entre na sua conta para ver os vídeos assistidos recentemente.'));
      renderRail('communityFavoritesContent',[],t('Não foi possível carregar os favoritos da comunidade agora.'));
      renderProfileRanking([]);renderOwnRanking('communityOwnProfile',null,'profile',readRankingPreference(currentUser()&&currentUser().uid),false);renderWatchRanking([],null,readRankingPreference(currentUser()&&currentUser().uid),false);
    }finally{if(requestId===state.requestId)state.loading=false;}
  }

  async function recordWatchFromPlay(play){
    var user=currentUser();if(!user||!play)return false;
    var recordId=String(play.dataset.recordId||'');if(!validUuid(recordId))return false;
    try{await Promise.resolve(window.beBackend&&window.beBackend.ready);var client=window.beBackend&&window.beBackend.client;if(!client||typeof client.rpc!=='function')return false;var result=await client.rpc('record_community_watch',{p_content_id:recordId});if(result&&result.error)throw result.error;state.lastPayload=null;return result&&result.data!==false;}catch(error){console.warn('Não foi possível registrar o conteúdo recente:',error&&error.message?error.message:error);return false;}
  }

  function armDetailWatchFromPlay(play){
    if(!play)return;
    var recordId=String(play.dataset.recordId||'');
    if(!validUuid(recordId)||!currentUser())return;
    recordWatchFromPlay(play).then(function(saved){
      if(!saved)return;
      var current=document.getElementById('contentDetailPlay');
      if(!current||String(current.dataset.recordId||'')!==recordId||!document.body.classList.contains('detail-page-active'))return;
      detailWatch.armedContentId=recordId;
      syncDetailWatchTimer();
    });
  }

  function createWatchSessionId(){
    try{if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();}catch(_){ }
    var bytes=new Uint8Array(16);try{window.crypto.getRandomValues(bytes);}catch(_){for(var i=0;i<bytes.length;i+=1)bytes[i]=Math.floor(Math.random()*256);}
    bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
    var hex=Array.prototype.map.call(bytes,function(value){return value.toString(16).padStart(2,'0');}).join('');
    return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
  }

  function detailWatchContext(){
    var play=document.getElementById('contentDetailPlay');
    if(!play||!currentUser()||!document.body.classList.contains('detail-page-active'))return null;
    var recordId=String(play.dataset.recordId||'');
    if(!validUuid(recordId))return null;
    return {recordId:recordId,visible:document.visibilityState==='visible'};
  }

  async function sendDetailWatchHeartbeat(contentId,sessionId,finish){
    if(!validUuid(contentId)||!validUuid(sessionId))return;
    try{
      await Promise.resolve(window.beBackend&&window.beBackend.ready);
      var client=window.beBackend&&window.beBackend.client;
      if(!client||typeof client.rpc!=='function')return;
      var result=await client.rpc('heartbeat_community_watch',{p_content_id:contentId,p_session_id:sessionId,p_finish:Boolean(finish)});
      if(result&&result.error)throw result.error;
      state.lastPayload=null;
    }catch(error){console.warn('Não foi possível atualizar o tempo assistido:',error&&error.message?error.message:error);}
  }

  function stopDetailWatchTimer(sendFinal){
    if(detailWatch.timer){clearInterval(detailWatch.timer);detailWatch.timer=null;}
    var contentId=detailWatch.contentId;
    var sessionId=detailWatch.sessionId;
    detailWatch.contentId='';detailWatch.sessionId='';detailWatch.inFlight=false;
    if(sendFinal&&contentId&&sessionId)sendDetailWatchHeartbeat(contentId,sessionId,true);
  }

  function startDetailWatchTimer(context){
    if(!context||!context.recordId)return;
    if(detailWatch.sessionId&&detailWatch.contentId===context.recordId)return;
    stopDetailWatchTimer(true);
    detailWatch.contentId=context.recordId;
    detailWatch.sessionId=createWatchSessionId();
    sendDetailWatchHeartbeat(detailWatch.contentId,detailWatch.sessionId,false);
    detailWatch.timer=setInterval(function(){
      if(detailWatch.inFlight||!detailWatch.sessionId)return;
      var current=detailWatchContext();
      if(!current||current.recordId!==detailWatch.contentId){syncDetailWatchTimer();return;}
      detailWatch.inFlight=true;
      var contentId=detailWatch.contentId,sessionId=detailWatch.sessionId;
      sendDetailWatchHeartbeat(contentId,sessionId,false).finally(function(){if(detailWatch.sessionId===sessionId)detailWatch.inFlight=false;});
    },5000);
  }

  function syncDetailWatchTimer(){
    var context=detailWatchContext();
    if(!context){stopDetailWatchTimer(true);detailWatch.armedContentId='';return;}
    if(detailWatch.armedContentId!==context.recordId){stopDetailWatchTimer(true);detailWatch.armedContentId='';return;}
    if(!context.visible){stopDetailWatchTimer(true);return;}
    if(detailWatch.contentId!==context.recordId||!detailWatch.sessionId)startDetailWatchTimer(context);
  }

  function createMobileAccountMenu(){
    if(document.getElementById('mobileAccountPopover')){mobileMenu=document.getElementById('mobileAccountPopover');return;}
    var trigger=document.getElementById('mobileProfileButton');if(trigger){trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');}
    mobileMenu=document.createElement('div');mobileMenu.className='mobile-account-popover';mobileMenu.id='mobileAccountPopover';mobileMenu.setAttribute('role','menu');mobileMenu.setAttribute('aria-label','Conta');
    mobileMenu.innerHTML='<button type="button" role="menuitem" data-mobile-account="profile">Perfil</button><button type="button" role="menuitem" data-mobile-account="community">Comunidade</button><button type="button" role="menuitem" data-mobile-account="settings">Configurações</button><div class="mobile-account-divider" aria-hidden="true"></div><button class="danger" type="button" role="menuitem" data-mobile-account="logout">Sair</button>';
    document.body.appendChild(mobileMenu);applyI18n(mobileMenu);
    mobileMenu.addEventListener('click',function(event){var button=event.target.closest('[data-mobile-account]');if(!button)return;var action=button.dataset.mobileAccount;closeMobileAccountMenu();if(action==='community'){openCommunity();return;}if(action==='profile'){var p=document.querySelector('#userDropdown [data-public-action="profile"]');if(p)p.click();else if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/login');return;}if(action==='settings'){var s=document.querySelector('#userDropdown [data-public-action="settings"]');if(s)s.click();else if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/login');return;}if(action==='logout'){var a=document.getElementById('publicAuthAction');if(a)a.click();}});
  }
  function positionMobileAccountMenu(){if(!mobileMenu)return;var trigger=document.getElementById('mobileProfileButton');if(!trigger)return;var rect=trigger.getBoundingClientRect();var width=Math.min(260,Math.max(180,window.innerWidth-24));var height=Math.max(1,mobileMenu.offsetHeight||210);var left=Math.max(12,Math.min(rect.left,window.innerWidth-width-12));var top=Math.max(8,Math.min(rect.bottom+8,window.innerHeight-height-8));mobileMenu.style.left=left+'px';mobileMenu.style.top=top+'px';}
  function openMobileAccountMenu(){if(!window.matchMedia('(max-width:760px)').matches)return;createMobileAccountMenu();var user=currentUser();var logout=mobileMenu.querySelector('[data-mobile-account="logout"]');if(logout)logout.hidden=!user;positionMobileAccountMenu();document.body.classList.add('mobile-account-menu-open');var trigger=document.getElementById('mobileProfileButton');if(trigger)trigger.setAttribute('aria-expanded','true');}
  function closeMobileAccountMenu(){document.body.classList.remove('mobile-account-menu-open');var trigger=document.getElementById('mobileProfileButton');if(trigger)trigger.setAttribute('aria-expanded','false');}
  function toggleMobileAccountMenu(){if(document.body.classList.contains('mobile-account-menu-open'))closeMobileAccountMenu();else openMobileAccountMenu();}

  async function loadRankingPreference(input,status,user){
    var request=++preferenceRequest;var local=readRankingPreference(user.uid);input.checked=local;
    try{await Promise.resolve(window.beBackend&&window.beBackend.ready);var pref=window.beBackend&&window.beBackend.preferences;if(!pref||typeof pref.get!=='function')return;var row=await pref.get(user.uid,{force:true});if(request!==preferenceRequest||!document.body.contains(input))return;var value=!(row&&row.data&&row.data.communityRankingsPublic===false);writeRankingPreference(user.uid,value);input.checked=value;}catch(_){ }
  }

  function injectPrivacySettings(){
    var body=document.getElementById('settingsPageBody');var panel=body&&body.querySelector('[data-settings-panel="profile"]');var user=currentUser();if(!panel||!user||panel.querySelector('.community-privacy-card'))return;
    var card=document.createElement('div');card.className='settings-panel-card community-privacy-card';
    card.innerHTML='<div class="community-privacy-copy"><h2>Rankings da Comunidade</h2><p>Escolha se seu perfil pode aparecer nos rankings públicos de curtidas e horas assistidas. Seu histórico detalhado nunca é exibido para outros usuários.</p></div><label class="community-privacy-toggle" for="communityRankingVisibility"><span>Participar dos rankings públicos da Comunidade</span><span class="community-privacy-switch"><input id="communityRankingVisibility" type="checkbox"><i aria-hidden="true"></i></span></label><div class="community-privacy-status" id="communityRankingVisibilityStatus" aria-live="polite"></div>';
    panel.appendChild(card);applyI18n(card);
    var input=card.querySelector('#communityRankingVisibility');var status=card.querySelector('#communityRankingVisibilityStatus');loadRankingPreference(input,status,user);
    input.addEventListener('change',async function(){var enabled=input.checked;writeRankingPreference(user.uid,enabled);status.textContent=t('Salvando…');status.className='community-privacy-status';input.disabled=true;try{await Promise.resolve(window.beBackend&&window.beBackend.ready);var pref=window.beBackend&&window.beBackend.preferences;if(!pref||typeof pref.get!=='function'||typeof pref.save!=='function')throw new Error('preferences_unavailable');var current=await pref.get(user.uid,{force:true});var payload=Object.assign({},current&&current.data||{}, {communityRankingsPublic:enabled,updatedAt:new Date().toISOString()});await pref.save(user.uid,payload);if(typeof window.beScheduleUserDataSync==='function')window.beScheduleUserDataSync('community-ranking-privacy');status.textContent=t('Preferência salva.');status.className='community-privacy-status ok';window.dispatchEvent(new CustomEvent('be:community-ranking-visibility',{detail:{enabled:enabled}}));if(document.body.classList.contains('community-page-active'))refreshCommunity();}catch(error){input.checked=!enabled;writeRankingPreference(user.uid,!enabled);status.textContent=t('Não foi possível salvar agora.');status.className='community-privacy-status err';}finally{input.disabled=false;}});
  }

  function bind(){
    createPage();createMobileAccountMenu();
    var tab=document.querySelector('[data-community-tab]');if(tab)tab.addEventListener('click',function(event){event.preventDefault();openCommunity();});
    var play=document.getElementById('contentDetailPlay');
    if(play&&play.dataset.communityWatchBound!=='true'){
      play.dataset.communityWatchBound='true';
      play.addEventListener('pointerup',function(){armDetailWatchFromPlay(play);});
      play.addEventListener('keydown',function(event){if(event.key==='Enter')armDetailWatchFromPlay(play);});
    }
    if(play&&play.dataset.communityDwellObserved!=='true'){
      play.dataset.communityDwellObserved='true';
      new MutationObserver(function(){syncDetailWatchTimer();}).observe(play,{attributes:true,attributeFilter:['data-record-id','data-duration']});
    }
    if(document.body.dataset.communityDwellObserved!=='true'){
      document.body.dataset.communityDwellObserved='true';
      new MutationObserver(function(){syncDetailWatchTimer();}).observe(document.body,{attributes:true,attributeFilter:['class']});
      document.addEventListener('visibilitychange',syncDetailWatchTimer);
      window.addEventListener('pagehide',function(){stopDetailWatchTimer(true);detailWatch.armedContentId='';});
      window.addEventListener('be:detail-close',function(){stopDetailWatchTimer(true);detailWatch.armedContentId='';});
    }
    setTimeout(syncDetailWatchTimer,0);
    document.addEventListener('click',function(event){
      var headerUtility=event.target&&event.target.closest?event.target.closest('#userChip,#notificationButton,#mobileProfileButton,#mobileNotificationButton'):null;
      if(headerUtility)preserveCommunitySurfaceForHeaderUtility();
      if(document.body.classList.contains('mobile-account-menu-open')){var trigger=event.target&&event.target.closest?event.target.closest('#mobileProfileButton'):null;if(!trigger&&mobileMenu&&!mobileMenu.contains(event.target))closeMobileAccountMenu();}
      var profileRoute=event.target&&event.target.closest?event.target.closest('[data-public-action="profile"],[data-public-action="settings"]'):null;
      if(profileRoute&&document.body.classList.contains('community-page-active'))closeCommunity(false);
      var notificationHome=event.target&&event.target.closest?event.target.closest('#notificationPageClose,#notificationPageHome'):null;
      if(notificationHome)setHomeTab('home');
      var nav=event.target&&event.target.closest?event.target.closest('#logoBtn,[data-home-view],[data-public-action="support"],[data-public-action="donate"]'):null;
      if(nav&&!nav.matches('[data-community-tab]')){var target='home';if(nav.dataset&&nav.dataset.homeView)target=nav.dataset.homeView;else if(nav.matches('[data-public-action="support"]'))target='support';closeCommunity(false,target);}
    },true);
    window.addEventListener('be:toggle-mobile-account-menu',toggleMobileAccountMenu);
    window.addEventListener('be:close-notification-menus',closeMobileAccountMenu);
    window.addEventListener('popstate',function(){closeMobileAccountMenu();if(document.body.classList.contains('community-page-active'))closeCommunity(false);window.setTimeout(function(){if(state.detailReturnToCommunity&&!document.body.classList.contains('detail-page-active')&&!document.body.classList.contains('notification-page-active')&&!document.body.classList.contains('profile-page-active')&&!document.body.classList.contains('settings-page-active')){state.detailReturnToCommunity=false;openCommunity();return;}if(!document.body.classList.contains('community-page-active')&&!document.body.classList.contains('detail-page-active')&&!document.body.classList.contains('notification-page-active')&&!document.body.classList.contains('profile-page-active')&&!document.body.classList.contains('settings-page-active'))setHomeTab('home');},0);});
    window.addEventListener('hashchange',closeMobileAccountMenu);
    window.addEventListener('resize',function(){if(!window.matchMedia('(max-width:760px)').matches)closeMobileAccountMenu();else if(document.body.classList.contains('mobile-account-menu-open'))positionMobileAccountMenu();});
    document.addEventListener('keydown',function(event){if(event.key==='Escape')closeMobileAccountMenu();});
    var settingsBody=document.getElementById('settingsPageBody');if(settingsBody){new MutationObserver(function(){injectPrivacySettings();}).observe(settingsBody,{childList:true,subtree:true});}
    window.addEventListener('be:catalog-ready',function(){if(document.body.classList.contains('community-page-active')){toggleCatalogVisibility(true);setHomeTab('community');}});
    window.addEventListener('be:open-config',function(){setTimeout(injectPrivacySettings,0);});
    window.addEventListener('be:user-data-synced',function(event){var user=currentUser();var data=event&&event.detail&&event.detail.data;if(user&&data&&Object.prototype.hasOwnProperty.call(data,'communityRankingsPublic'))writeRankingPreference(user.uid,data.communityRankingsPublic!==false);});
    window.addEventListener('be:community-ranking-visibility',function(event){var user=currentUser();if(user)writeRankingPreference(user.uid,!(event&&event.detail&&event.detail.enabled===false));});
    window.beBackend&&window.beBackend.auth&&window.beBackend.auth.onChange&&window.beBackend.auth.onChange(function(){setTimeout(injectPrivacySettings,50);syncDetailWatchTimer();if(document.body.classList.contains('community-page-active'))refreshCommunity();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

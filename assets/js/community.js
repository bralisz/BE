;(function(){
  'use strict';
  if(String(location.hash||'').startsWith('#/admin')) return;

  var state={period:'month',loading:false,lastPayload:null,requestId:0};
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
    page.setAttribute('aria-label','Comunidade');
    page.innerHTML=''
      +'<div class="community-page-inner">'
      +  '<header class="community-page-heading"><h1>Comunidade</h1><p>Descubra o que os fãs estão assistindo, salvando e curtindo dentro do Billie Eilish TV.</p></header>'
      +  '<section class="community-section" id="communityContinueSection"><div class="community-section-head"><h2>Continue assistindo</h2></div><div id="communityContinueContent"></div></section>'
      +  '<section class="community-section"><div class="community-section-head"><h2>Favoritos dos fãs</h2></div><div id="communityFavoritesContent"></div></section>'
      +  '<section class="community-section"><div class="community-section-head"><h2>Perfis em destaque</h2></div><div class="community-ranking-wrap"><div class="community-ranking-card" id="communityProfileRanking"></div><div class="community-ranking-own" id="communityOwnProfile" hidden></div></div></section>'
      +  '<section class="community-section"><div class="community-section-head"><h2>Quem mais assistiu</h2><div class="community-watch-toolbar" role="group" aria-label="Período do ranking"><button class="community-watch-filter active" type="button" data-community-period="month">Este mês</button><button class="community-watch-filter" type="button" data-community-period="all">Todos os tempos</button></div></div><div class="community-ranking-wrap"><div class="community-ranking-card" id="communityWatchRanking"></div><div class="community-ranking-own" id="communityOwnWatch" hidden></div></div></section>'
      +  '<div class="community-supporters-cta-wrap"><button class="community-supporters-cta" id="communitySupportersButton" type="button">Ver fãs que apoiam o site</button></div>'
      +  '<section class="community-ong-spotlight" id="communityOngSpotlight" hidden aria-label="Apoie uma ONG"><div class="community-ong-spotlight-frame"><img id="communityOngSpotlightImage" alt="Apoie uma ONG" loading="lazy" decoding="async"><div class="community-ong-spotlight-overlay" aria-hidden="true"></div><a class="community-ong-spotlight-button" href="/ong" data-open-donate="true">Apoie uma ONG</a></div></section>'
      +'</div>';
    main.appendChild(page);
    page.querySelector('#communitySupportersButton').addEventListener('click',function(){closeCommunity(true);if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go('/fãs');else location.assign('/fãs');});
    var ongButton=page.querySelector('.community-ong-spotlight-button');if(ongButton)ongButton.addEventListener('click',function(){closeCommunity(true);});
    loadCommunityOngBanner();
    page.querySelectorAll('[data-community-period]').forEach(function(button){button.addEventListener('click',function(){state.period=button.dataset.communityPeriod==='all'?'all':'month';page.querySelectorAll('[data-community-period]').forEach(function(item){item.classList.toggle('active',item===button);});refreshCommunity();});});
    applyI18n(page);
    return page;
  }

  function setCommunityNavActive(active){
    var communityButton=document.querySelector('[data-community-tab]');
    if(communityButton){communityButton.classList.toggle('active',Boolean(active));if(active){communityButton.setAttribute('aria-current','page');communityButton.setAttribute('aria-pressed','true');}else{communityButton.removeAttribute('aria-current');communityButton.removeAttribute('aria-pressed');}}
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

  function closeCommunity(resetView){
    if(!document.body.classList.contains('community-page-active'))return;
    document.body.classList.remove('community-page-active');
    if(page)page.hidden=true;
    setCommunityNavActive(false);
    if(resetView!==false&&document.body.dataset.homeView==='community')document.body.dataset.homeView='home';
  }

  function establishCatalogBase(){
    if(document.body.classList.contains('community-page-active'))return;
    var dedicated=document.body.classList.contains('profile-page-active')||document.body.classList.contains('settings-page-active')||document.body.classList.contains('support-page-active')||document.body.classList.contains('notification-page-active')||document.body.classList.contains('billie-page-active')||document.body.classList.contains('donate-page-active')||document.body.classList.contains('fans-page-active')||document.body.classList.contains('album-page-active')||document.body.classList.contains('detail-page-active');
    if(!dedicated)return;
    var logo=document.getElementById('logoBtn');
    if(logo){logo.dataset.beHistoryMode='none';logo.click();delete logo.dataset.beHistoryMode;}
  }

  function openCommunity(){
    closeMobileAccountMenu();
    establishCatalogBase();
    createPage();
    if(!page)return;
    document.body.classList.add('community-page-active');
    document.body.dataset.homeView='community';
    page.hidden=false;
    document.querySelectorAll('.home-nav-link.active,#logoBtn.active').forEach(function(button){if(!button.matches('[data-community-tab]')){button.classList.remove('active');button.removeAttribute('aria-current');button.setAttribute('aria-pressed','false');}});
    setCommunityNavActive(true);
    try{window.dispatchEvent(new CustomEvent('be:close-public-search'));window.dispatchEvent(new CustomEvent('be:close-mobile-search'));}catch(_){ }
    window.scrollTo({top:0,left:0,behavior:'auto'});
    refreshCommunity();
  }
  window.BETVCommunity={open:openCommunity,close:closeCommunity,refresh:refreshCommunity};
  window.addEventListener('be:open-community',openCommunity);

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
    card.addEventListener('click',function(event){event.preventDefault();closeCommunity(true);if(typeof window.beOpenSavedContent==='function')window.beOpenSavedContent(data);else location.assign('/'+encodeURIComponent(data.itemId));});
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

  function renderProfileRanking(rows){
    var host=document.getElementById('communityProfileRanking');if(!host)return;host.innerHTML='';
    if(!Array.isArray(rows)||!rows.length){var empty=document.createElement('div');empty.className='community-ranking-empty';empty.textContent=t('Ainda não há perfis suficientes para este ranking.');host.appendChild(empty);return;}
    rows.forEach(function(item){
      var button=document.createElement('button');button.type='button';button.className='community-ranking-row'+(Number(item.position)<=3?' top-three':'');
      var pos=document.createElement('span');pos.className='community-rank-number';pos.textContent='#'+String(item.position||'—');button.appendChild(pos);
      button.appendChild(createRankAvatar(item.avatarUrl,item.displayName));
      var copy=document.createElement('span');copy.className='community-rank-copy';var strong=document.createElement('strong');strong.textContent=String(item.displayName||item.username||'Usuário');var handle=document.createElement('span');handle.textContent='@'+String(item.username||'usuario').replace(/^@/,'');copy.append(strong,handle);button.appendChild(copy);
      var value=document.createElement('span');value.className='community-rank-value';value.textContent=Number(item.likes)===1?t('1 curtida'):t('{count} curtidas',{count:Number(item.likes)||0});button.appendChild(value);
      button.addEventListener('click',function(){closeCommunity(true);var route='/@'+encodeURIComponent(String(item.username||'').replace(/^@/,''));if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go(route);else location.assign(route);});
      host.appendChild(button);
    });
  }

  function renderOwnRanking(hostId,item,kind,visibility){
    var own=document.getElementById(hostId);if(!own)return;own.innerHTML='';
    if(!currentUser()){own.hidden=true;return;}
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

  function renderWatchRanking(rows,myPosition,visibility){
    var host=document.getElementById('communityWatchRanking');if(!host)return;host.innerHTML='';
    if(!Array.isArray(rows)||!rows.length){var empty=document.createElement('div');empty.className='community-ranking-empty';empty.textContent=t('Ainda não há atividade suficiente para este ranking.');host.appendChild(empty);}
    else rows.forEach(function(item){
      var button=document.createElement('button');button.type='button';button.className='community-ranking-row'+(Number(item.position)<=3?' top-three':'');
      var pos=document.createElement('span');pos.className='community-rank-number';pos.textContent='#'+String(item.position||'—');button.appendChild(pos);button.appendChild(createRankAvatar(item.avatarUrl,item.displayName));
      var copy=document.createElement('span');copy.className='community-rank-copy';var strong=document.createElement('strong');strong.textContent=String(item.displayName||item.username||'Usuário');var handle=document.createElement('span');handle.textContent='@'+String(item.username||'usuario').replace(/^@/,'');copy.append(strong,handle);button.appendChild(copy);
      var value=document.createElement('span');value.className='community-rank-value';value.textContent=formatWatchTime(item.watchSeconds);button.appendChild(value);
      button.addEventListener('click',function(){closeCommunity(true);var route='/@'+encodeURIComponent(String(item.username||'').replace(/^@/,''));if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go(route);else location.assign(route);});host.appendChild(button);
    });
    renderOwnRanking('communityOwnWatch',myPosition,'watch',visibility);
  }

  function renderPayload(payload){
    state.lastPayload=payload||{};
    var user=currentUser();
    var recentEmpty=user?t('Os vídeos que você assistir aparecerão aqui.'):t('Entre na sua conta para ver os vídeos assistidos recentemente.');
    renderRail('communityContinueContent',user?(payload.recent||[]):[],recentEmpty);
    renderRail('communityFavoritesContent',payload.fanFavorites||[],t('Os favoritos da comunidade aparecerão aqui.'));
    renderProfileRanking(payload.profileRanking||[]);
    renderOwnRanking('communityOwnProfile',payload.myProfilePosition,'profile',payload.rankingVisibility!==false);
    renderWatchRanking(payload.watchRanking||[],payload.myWatchPosition,payload.rankingVisibility!==false);
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
      renderProfileRanking([]);renderOwnRanking('communityOwnProfile',null,'profile',readRankingPreference(currentUser()&&currentUser().uid));renderWatchRanking([],null,readRankingPreference(currentUser()&&currentUser().uid));
    }finally{if(requestId===state.requestId)state.loading=false;}
  }

  async function recordWatchFromPlay(play){
    var user=currentUser();if(!user||!play)return;
    var recordId=String(play.dataset.recordId||'');if(!validUuid(recordId))return;
    try{await Promise.resolve(window.beBackend&&window.beBackend.ready);var client=window.beBackend&&window.beBackend.client;if(!client||typeof client.rpc!=='function')return;var result=await client.rpc('record_community_watch',{p_content_id:recordId});if(result&&result.error)throw result.error;state.lastPayload=null;}catch(error){console.warn('Não foi possível registrar o conteúdo recente:',error&&error.message?error.message:error);}
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
      play.addEventListener('pointerup',function(){recordWatchFromPlay(play);});
      play.addEventListener('keydown',function(event){if(event.key==='Enter')recordWatchFromPlay(play);});
    }
    document.addEventListener('click',function(event){
      if(document.body.classList.contains('mobile-account-menu-open')){var trigger=event.target&&event.target.closest?event.target.closest('#mobileProfileButton'):null;if(!trigger&&mobileMenu&&!mobileMenu.contains(event.target))closeMobileAccountMenu();}
      var nav=event.target&&event.target.closest?event.target.closest('#logoBtn,[data-home-view],[data-public-action="support"],[data-public-action="donate"]'):null;if(nav&&!nav.matches('[data-community-tab]'))closeCommunity(false);
    },true);
    window.addEventListener('be:toggle-mobile-account-menu',toggleMobileAccountMenu);
    window.addEventListener('be:close-notification-menus',closeMobileAccountMenu);
    window.addEventListener('popstate',function(){closeMobileAccountMenu();if(document.body.classList.contains('community-page-active'))closeCommunity(false);});
    window.addEventListener('hashchange',closeMobileAccountMenu);
    window.addEventListener('resize',function(){if(!window.matchMedia('(max-width:760px)').matches)closeMobileAccountMenu();else if(document.body.classList.contains('mobile-account-menu-open'))positionMobileAccountMenu();});
    document.addEventListener('keydown',function(event){if(event.key==='Escape')closeMobileAccountMenu();});
    var settingsBody=document.getElementById('settingsPageBody');if(settingsBody){new MutationObserver(function(){injectPrivacySettings();}).observe(settingsBody,{childList:true,subtree:true});}
    window.addEventListener('be:open-config',function(){setTimeout(injectPrivacySettings,0);});
    window.addEventListener('be:user-data-synced',function(event){var user=currentUser();var data=event&&event.detail&&event.detail.data;if(user&&data&&Object.prototype.hasOwnProperty.call(data,'communityRankingsPublic'))writeRankingPreference(user.uid,data.communityRankingsPublic!==false);});
    window.addEventListener('be:community-ranking-visibility',function(event){var user=currentUser();if(user)writeRankingPreference(user.uid,!(event&&event.detail&&event.detail.enabled===false));});
    window.beBackend&&window.beBackend.auth&&window.beBackend.auth.onChange&&window.beBackend.auth.onChange(function(){setTimeout(injectPrivacySettings,50);if(document.body.classList.contains('community-page-active'))refreshCommunity();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

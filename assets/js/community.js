;(function(){
  'use strict';
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
    return normalized==='avocado'||normalized==='eyelash'||normalized==='blohsh'||normalized==='billie_fan'?normalized:'';
  }
  function communityTagMeta(value){
    var tag=normalizeCommunityTag(value);
    if(tag==='avocado')return {key:'avocado',label:'Avocado',className:'is-avocado'};
    if(tag==='eyelash')return {key:'eyelash',label:'Eyelash',className:'is-eyelash'};
    if(tag==='blohsh')return {key:'blohsh',label:'Blohsh',className:'is-blohsh'};
    if(tag==='billie_fan')return {key:'billie_fan',label:t('Fã da Billie'),className:'is-billie-fan'};
    return null;
  }
  function communityTagMarkup(value){
    var meta=communityTagMeta(value);
    if(!meta)return '';
    return '<span class="community-award-tag '+meta.className+' notranslate" data-i18n-ignore translate="no">'+meta.label+'</span>';
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
      +  '<section class="community-hero-banner" aria-label="Banner da comunidade"><div class="community-hero-banner-frame"><img src="/assets/images/community/community-hero-banner.jpg" alt="Banner da comunidade dos Avocados" decoding="async"><div class="community-hero-banner-overlay" aria-hidden="true"></div></div></section>'
      +  '<div class="community-content-shell">'
      +    '<header class="community-page-heading"><h1>Comunidade dos Avocados</h1><p>Descubra o que os fãs estão assistindo, salvando e curtindo dentro do Billie Eilish TV.</p></header>'
      +    '<section class="community-section" id="communityContinueSection"><div class="community-section-head"><h2>Continue assistindo</h2></div><div id="communityContinueContent"></div></section>'
      +    '<section class="community-section"><div class="community-section-head"><h2>Favoritos dos fãs</h2></div><div id="communityFavoritesContent"></div></section>'
      +    '<section class="community-section"><div class="community-section-head community-featured-head"><div class="community-section-title"><h2>Perfis em destaque</h2><p class="community-section-subtitle">Compartilhe seu perfil para receber curtidas e aparecer no ranking.</p></div><details class="community-rules-details"><summary class="community-rules-button">Regras</summary><div class="community-rules-panel" id="communityProfileRules"><p>Este ranking mostra os perfis que mais receberam curtidas da comunidade. Compartilhe seu perfil com outros usuários para que eles conheçam sua página e possam curti-la.</p><p>No final de cada mês, o 1º, 2º e 3º lugar ganham uma tag especial no perfil:</p><div class="community-rules-tags"><div class="community-rules-tag-row"><span class="community-rules-place">1° lugar</span><span class="community-award-tag is-avocado notranslate" data-i18n-ignore translate="no">Avocado</span></div><div class="community-rules-tag-row"><span class="community-rules-place">2° lugar</span><span class="community-award-tag is-eyelash notranslate" data-i18n-ignore translate="no">Eyelash</span></div><div class="community-rules-tag-row"><span class="community-rules-place">3° lugar</span><span class="community-award-tag is-blohsh notranslate" data-i18n-ignore translate="no">Blohsh</span></div></div></div></details></div><div class="community-ranking-wrap"><div class="community-ranking-card" id="communityProfileRanking"></div><div class="community-ranking-own" id="communityOwnProfile" hidden></div></div></section>'
      +    '<div class="community-supporters-cta-wrap"><button class="community-supporters-cta" id="communitySupportersButton" type="button">Ver fãs que apoiam o site</button></div>'
      +    '<section class="community-ong-spotlight" id="communityOngSpotlight" hidden aria-label="Apoie uma ONG"><div class="community-ong-spotlight-frame"><img id="communityOngSpotlightImage" alt="Apoie uma ONG" decoding="async"><div class="community-ong-spotlight-overlay" aria-hidden="true"></div><a class="community-ong-spotlight-button" href="/ong" data-open-donate="true">Apoie uma ONG</a></div></section>'
      +  '</div>'
      +'</div>';
    main.appendChild(page);
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
      // A Comunidade pode reaplicar esta proteção ao focar/digitar na pesquisa.
      // Guarde o estado original apenas na primeira vez; sobrescrever o snapshot
      // enquanto o catálogo já está oculto fazia ele continuar escondido ao voltar.
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
    establishCatalogBase();
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
  window.BETVCommunity={open:openCommunity,close:closeCommunity,refresh:refreshCommunity};
  window.addEventListener('be:open-community',openCommunity);
  // Fechar o pop-up de notificações não é navegação. Se ele foi aberto sobre a
  // Comunidade, restaura a superfície da Comunidade sem mudar URL, rolagem ou aba.
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
      return {itemId:String(d.itemId||numericPublicId(contentId)),recordId:contentId,favoriteId:(d.collection||row.collection||'videos')+':'+contentId,title:String(d.title||'Conteúdo'),description:String(d.description||''),year:String(d.year||''),duration:String(d.duration||''),contentUrl:String(d.contentUrl||'#'),imageUrl:String(d.imageUrl||''),bannerUrl:String(d.bannerUrl||d.imageUrl||''),logoUrl:String(d.logoUrl||''),collection:String(d.collection||row.collection||'videos'),sectionId:String(d.sectionId||''),sectionName:String(d.sectionName||''),streamingAvailability:String(d.streamingAvailability||''),streamingLinks:String(d.streamingLinks||''),category:String(d.category||''),contentType:String(d.contentType||''),mediaType:String(d.mediaType||''),preserveTitle:String(d.preserveTitle||'')==='true'};
    }
    var data=row.data&&typeof row.data==='object'?row.data:{};
    var collection=String(row.collection||data.collection||'videos');
    var recordId=contentId||String(data.id||'');
    return {itemId:numericPublicId(data.publicId||recordId||data.title),recordId:recordId,favoriteId:recordId?collection+':'+recordId:'',title:String(data.title||'Conteúdo'),description:String(data.description||''),year:String(data.year||''),duration:String(data.duration||data.videoDuration||data.runtime||''),contentUrl:String(data.videoUrl||data.contentUrl||data.link||'#'),imageUrl:String(data.thumbnailUrl||data.imageUrl||data.bannerUrl||''),bannerUrl:String(collection==='movies'||collection==='series'?(data.thumbnailUrl||data.imageUrl||data.bannerUrl||''):(data.bannerUrl||data.imageUrl||data.thumbnailUrl||'')),logoUrl:String(data.logoUrl||''),collection:collection,sectionId:String(data.sectionId||''),sectionName:String(data.sectionName||''),streamingAvailability:data.streamingAvailability||[],streamingLinks:data.streamingLinks||{},category:String(data.category||data.type||''),contentType:String(data.contentType||''),mediaType:String(data.mediaType||''),preserveTitle:Boolean(data.preserveTitle)};
  }

  function createVideoCard(row,options){
    options=options&&typeof options==='object'?options:{};
    var data=catalogData(row);
    var card=document.createElement('a');
    card.className='video-card'+(data.preserveTitle?' notranslate':'');
    if(data.preserveTitle)card.setAttribute('translate','no');
    card.href='/'+encodeURIComponent(data.itemId);
    card.setAttribute('aria-label',data.title);
    card.dataset.itemId=data.itemId;card.dataset.recordId=data.recordId;card.dataset.openDetail='true';card.dataset.title=data.title;card.dataset.description=data.description;card.dataset.year=data.year;card.dataset.duration=data.duration;card.dataset.contentUrl=data.contentUrl;card.dataset.imageUrl=data.imageUrl;card.dataset.bannerUrl=data.bannerUrl;card.dataset.logoUrl=data.logoUrl;card.dataset.collection=data.collection;card.dataset.sectionId=data.sectionId;card.dataset.sectionName=data.sectionName;card.dataset.category=data.category||'';card.dataset.contentType=data.contentType||'';card.dataset.mediaType=data.mediaType||'';card.dataset.streamingAvailability=Array.isArray(data.streamingAvailability)?data.streamingAvailability.join(','):String(data.streamingAvailability||'');card.dataset.streamingLinks=typeof data.streamingLinks==='string'?data.streamingLinks:JSON.stringify(data.streamingLinks||{});card.dataset.preserveTitle=data.preserveTitle?'true':'false';
    var image=document.createElement('img');image.className='video-card-thumbnail';image.decoding='async';image.alt=data.title;image.src=mediaUrl(data.imageUrl||data.bannerUrl||'/assets/images/pages/billie-home-banner-default.webp');card.appendChild(image);
    var watched=Boolean(options.showWatched&&((row&&row.lastWatchedAt)||state.watchedContentIds[String(data.recordId||'')]));
    if(watched){var watchedBadge=document.createElement('span');watchedBadge.className='community-watched-badge';watchedBadge.textContent='WATCHED';watchedBadge.setAttribute('aria-label','Watched');card.appendChild(watchedBadge);}
    if(data.logoUrl&&data.logoUrl!=='#'&&String(data.collection).toLowerCase()!=='videos'){var logoSlot=document.createElement('span');logoSlot.className='video-card-logo-slot';logoSlot.setAttribute('aria-hidden','true');var logo=document.createElement('img');logo.className='video-card-logo';logo.decoding='async';logo.alt='';logo.src=mediaUrl(data.logoUrl);logo.addEventListener('error',function(){logoSlot.remove();},{once:true});logoSlot.appendChild(logo);card.appendChild(logoSlot);}
    if(Number(row&&row.saves)>0){var social=document.createElement('span');social.className='community-favorite-social';social.setAttribute('aria-label',t('{count} curtidas',{count:Number(row.saves)||0}));var faces=document.createElement('span');faces.className='community-favorite-faces';var avatars=Array.isArray(row.fanAvatars)?row.fanAvatars.slice(0,3):[];avatars.forEach(function(person){var face=document.createElement('span');face.className='community-favorite-face'+(isCurrentProfilePerson(person)?' is-current-user':'');var faceImg=document.createElement('img');faceImg.decoding='async';faceImg.alt='';faceImg.src=window.BETVResolveAvatar?window.BETVResolveAvatar(person&&person.avatarUrl):mediaUrl(person&&person.avatarUrl||'/assets/images/profile/default-avatar.png');face.appendChild(faceImg);faces.appendChild(face);});social.appendChild(faces);var extra=Math.max(0,(Number(row.saves)||0)-avatars.length);var count=document.createElement('span');count.className='community-favorite-count';count.textContent=extra>0?'+'+extra:String(Number(row.saves)||0);social.appendChild(count);card.appendChild(social);}
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
    var img=document.createElement('img');img.decoding='async';img.alt='';img.src=window.BETVResolveAvatar?window.BETVResolveAvatar(url):mediaUrl(url||'/assets/images/profile/default-avatar.png');avatar.appendChild(img);return avatar;
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
    var requestId=++state.requestId;
    state.loading=true;
    var profileLimit=15;
    try{
      await Promise.resolve(window.beBackend&&window.beBackend.ready);
      var client=window.beBackend&&window.beBackend.client;
      if(!client||typeof client.rpc!=='function')throw new Error('community_backend_unavailable');
      var result=await client.rpc('get_community_overview',{p_profile_limit:profileLimit});
      if(result&&result.error)throw result.error;
      if(requestId!==state.requestId||!document.body.classList.contains('community-page-active'))return;
      renderPayload(result&&result.data&&typeof result.data==='object'?result.data:{});
    }catch(error){
      if(requestId!==state.requestId||!document.body.classList.contains('community-page-active'))return;
      (void 0);
      renderRail('communityContinueContent',[],currentUser()?t('Não foi possível carregar seu histórico agora.'):t('Entre na sua conta para ver os vídeos assistidos recentemente.'));
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

  function createMobileAccountMenu(){
    if(document.getElementById('mobileAccountPopover')){mobileMenu=document.getElementById('mobileAccountPopover');return;}
    var trigger=document.getElementById('mobileProfileButton');if(trigger){trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');}
    mobileMenu=document.createElement('div');mobileMenu.className='mobile-account-popover';mobileMenu.id='mobileAccountPopover';mobileMenu.setAttribute('role','menu');mobileMenu.setAttribute('aria-label','Conta');
    var runningAsMobileApp=typeof window.BETVIsAppRunning==='function'&&window.BETVIsAppRunning();var installItem=runningAsMobileApp?'':'<button type="button" role="menuitem" data-mobile-account="install">Instalar app</button>';mobileMenu.innerHTML='<button type="button" role="menuitem" data-mobile-account="profile">Perfil</button><button type="button" role="menuitem" data-mobile-account="community">Comunidade</button><button type="button" role="menuitem" data-mobile-account="settings">Configurações</button>'+installItem+'<div class="mobile-account-divider" aria-hidden="true"></div><button class="danger" type="button" role="menuitem" data-mobile-account="logout">Sair</button>';
    document.body.appendChild(mobileMenu);applyI18n(mobileMenu);if(typeof window.BETVSyncInstallUi==='function')window.BETVSyncInstallUi();
    mobileMenu.addEventListener('click',function(event){var button=event.target.closest('[data-mobile-account]');if(!button)return;var action=button.dataset.mobileAccount;closeMobileAccountMenu();if(action==='community'){openCommunity();return;}if(action==='profile'){var p=document.querySelector('#userDropdown [data-public-action="profile"]');if(p)p.click();else if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/login');return;}if(action==='settings'){var s=document.querySelector('#userDropdown [data-public-action="settings"]');if(s)s.click();else if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/login');return;}if(action==='install'){if(typeof window.BETVRequestAppInstall==='function')window.BETVRequestAppInstall();return;}if(action==='logout'){var a=document.getElementById('publicAuthAction');if(a)a.click();}});
  }
  function positionMobileAccountMenu(){if(!mobileMenu)return;var trigger=document.getElementById('mobileProfileButton');if(!trigger)return;var rect=trigger.getBoundingClientRect();var width=Math.min(260,Math.max(180,window.innerWidth-24));var height=Math.max(1,mobileMenu.offsetHeight||210);var left=Math.max(12,Math.min(rect.left,window.innerWidth-width-12));var top=Math.max(8,Math.min(rect.bottom+8,window.innerHeight-height-8));mobileMenu.style.left=left+'px';mobileMenu.style.top=top+'px';}
  function openMobileAccountMenu(){if(!window.matchMedia('(max-width:760px)').matches)return;createMobileAccountMenu();var user=currentUser();var logout=mobileMenu.querySelector('[data-mobile-account="logout"]');if(logout)logout.hidden=!user;var install=mobileMenu.querySelector('[data-mobile-account="install"]');if(install){var running=typeof window.BETVIsAppRunning==='function'&&window.BETVIsAppRunning();var installed=typeof window.BETVIsAppInstalled==='function'&&window.BETVIsAppInstalled();install.hidden=running;install.textContent=installed&&!running?'Abrir app':'Instalar app';install.classList.toggle('is-installed',installed&&!running);}positionMobileAccountMenu();document.body.classList.add('mobile-account-menu-open');var trigger=document.getElementById('mobileProfileButton');if(trigger)trigger.setAttribute('aria-expanded','true');}
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
    createPage();createMobileAccountMenu();
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
    // A pesquisa é uma utilidade da barra, não uma navegação. Mantém a página
    // Comunidade ativa ao abrir a lupa e enquanto o usuário digita, tanto no
    // desktop quanto no mobile. Perfis/resultados continuam podendo abrir suas
    // rotas normalmente quando o usuário seleciona um item.
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
    document.addEventListener('keydown',function(event){if(event.key==='Escape')closeMobileAccountMenu();});
    var settingsBody=document.getElementById('settingsPageBody');if(settingsBody){new MutationObserver(function(){injectPrivacySettings();}).observe(settingsBody,{childList:true,subtree:true});}
    window.addEventListener('be:catalog-ready',function(){if(document.body.classList.contains('community-page-active')){toggleCatalogVisibility(true);setHomeTab('community');}});
    window.addEventListener('be:open-config',function(){setTimeout(injectPrivacySettings,0);});
    window.addEventListener('be:user-data-synced',function(event){var user=currentUser();var data=event&&event.detail&&event.detail.data;if(user&&data&&Object.prototype.hasOwnProperty.call(data,'communityRankingsPublic'))writeRankingPreference(user.uid,data.communityRankingsPublic!==false);});
    window.addEventListener('be:community-ranking-visibility',function(event){var user=currentUser();if(user)writeRankingPreference(user.uid,!(event&&event.detail&&event.detail.enabled===false));});
    window.beBackend&&window.beBackend.auth&&window.beBackend.auth.onChange&&window.beBackend.auth.onChange(function(){setTimeout(injectPrivacySettings,50);if(document.body.classList.contains('community-page-active'))refreshCommunity();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

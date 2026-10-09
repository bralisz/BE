(()=>{
'use strict';
if(window.BETVAccountReady)return;
const {toggleDropdown,closeNotificationMenus}=window.BETVAccountShell;
const userChip=document.getElementById('userChip');
const userDropdown=document.getElementById('userDropdown');
  async function setupPublicAccount(){
    var callbackDestination=new URLSearchParams(location.search||'').get('auth_callback');
    if(location.hash.startsWith('#/admin')||callbackDestination==='admin') return;
    if(!window.beBackend) return;
    var auth=beBackend.auth;
    var photo=document.getElementById('publicUserPhoto');
    var fallback=document.getElementById('publicUserFallback');
    var username=document.getElementById('ddUsername');
    var dashboard=document.getElementById('publicDashboardLink');
    var authAction=document.getElementById('publicAuthAction');
    function syncAuthActionLabel(){
      if(!authAction)return;
      var expectedSession=false;
      try{expectedSession=localStorage.getItem('beAuthExpected')==='1'&&Boolean(localStorage.getItem('beSessionUid'));}catch(_){ }
      var loggedIn=Boolean(auth.currentUser)||expectedSession;
      var guestActive=!loggedIn&&Boolean(window.BETVGuestAccess&&window.BETVGuestAccess.isActive());
      setInterfaceText(authAction,loggedIn?'Sair':(guestActive?'Criar conta':'Entrar'));
      authAction.classList.toggle('danger',loggedIn);
      authAction.classList.toggle('guest-create-account',guestActive);
      if(userDropdown){
        userDropdown.classList.toggle('is-logged-out',!loggedIn);
        userDropdown.classList.toggle('is-guest-account',guestActive);
        userDropdown.setAttribute('data-account-state',loggedIn?'authenticated':(guestActive?'guest':'anonymous'));
      }
    }
    var avatarPicker=document.getElementById('avatarPicker');
    var avatarPickerBody=document.getElementById('avatarPickerBody');
    var avatarPickerClose=document.getElementById('avatarPickerClose');
    var avatarPickerCancel=document.getElementById('avatarPickerCancel');
    var profileModal=document.getElementById('profileModal');
    var profileBody=document.getElementById('profileBody');
    var profileClose=document.getElementById('profileClose');
    var profilePage=document.getElementById('profilePage');
    var profilePageAvatar=document.getElementById('profilePageAvatar');
    var profilePageBanner=document.getElementById('profilePageBanner');
    var profilePageBannerImg=document.getElementById('profilePageBannerImg');
    var profilePageBannerFallback=document.getElementById('profilePageBannerFallback');
    var profilePageName=document.getElementById('profilePageName');
    var profilePageHandle=document.getElementById('profilePageHandle');
    var profilePageBadge=document.getElementById('profilePageBadge');
    var profilePageAwardTags=document.getElementById('profilePageAwardTags');
    var profilePageSocials=document.getElementById('profilePageSocials');
    var profilePageMetaLabel=document.getElementById('profilePageMetaLabel');
    var profilePageMemberSince=document.getElementById('profilePageMemberSince');
    var profilePageMore=document.getElementById('profilePageMore');
    var profilePageActionsMenu=document.getElementById('profilePageActionsMenu');
    var profilePageEdit=document.getElementById('profilePageEdit');
    var profilePageSettings=document.getElementById('profilePageSettings');
    var profilePageFollow=document.getElementById('profilePageFollow');
    var profilePageLike=document.getElementById('profilePageLike');
    var profilePageShare=document.getElementById('profilePageShare');
    var profilePageFollowersButton=document.getElementById('profilePageFollowersButton');
    var profilePageFollowingButton=document.getElementById('profilePageFollowingButton');
    var profilePageFollowersCount=document.getElementById('profilePageFollowersCount');
    var profilePageFollowingCount=document.getElementById('profilePageFollowingCount');
    var profilePageFollowersLabel=document.getElementById('profilePageFollowersLabel');
    var profilePageFollowingLabel=document.getElementById('profilePageFollowingLabel');
    var profilePageLikesReceived=document.getElementById('profilePageLikesReceived');
    var profilePageLogout=document.getElementById('profilePageLogout');
    var profilePageHome=document.getElementById('profilePageHome');
    var profileRelationshipsModal=document.getElementById('profileRelationshipsModal');
    var profileRelationshipsTitle=document.getElementById('profileRelationshipsTitle');
    var profileRelationshipsSubtitle=document.getElementById('profileRelationshipsSubtitle');
    var profileRelationshipsClose=document.getElementById('profileRelationshipsClose');
    var profileRelationshipsList=document.getElementById('profileRelationshipsList');
    var profileRelationshipsSearchWrap=document.getElementById('profileRelationshipsSearchWrap');
    var profileRelationshipsSearch=document.getElementById('profileRelationshipsSearch');
    var profileInlineEditing=false;
    var profileInlineOriginalName='';
    var profileInlineDraftName='';
    var profileInlineNameWasEditing=false;
    var profileInlineBannerButton=null;
    var profileInlineAvatarButton=null;
    var profileInlineNameButton=null;
    var profileInlineDock=null;
    var profileInlinePaletteButton=null;
    var profileInlineTagButton=null;
    var profileInlineCancelButton=null;
    var profileInlineSaveButton=null;
    var profileInlineColorPanel=null;
    var profileInlineTagPanel=null;
    var profileInlineTagSaving=false;
    var profileInlineOriginalProfileColor='';
    var profileInlineOriginalAvatarBorderColor='';
    var profileInlineOriginalAvatarUrl='';
    var profileInlineOriginalAvatarId='';
    var profileInlineOriginalBannerUrl='';
    var profileInlineOriginalBannerId='';
    var profileFollowState={username:'',following:false,loading:false};
    var profileRelationshipsState={open:false,type:'followers',username:'',items:[],page:1,pageSize:20,total:0,totalPages:0,loading:false,query:'',allowSearch:false};
    var profileFavoritesSection=document.getElementById('profileFavoritesSection');
    var profileFavoritesContent=document.getElementById('profileFavoritesContent');
    var profileFavoritesEdit=document.getElementById('profileFavoritesEdit');
    var profileLovedAlbumsSection=document.getElementById('profileLovedAlbumsSection');
    var profileLovedAlbumsContent=document.getElementById('profileLovedAlbumsContent');
    var profileLovedAlbumsEdit=document.getElementById('profileLovedAlbumsEdit');
    function localizedProfileText(source,variables){
      return window.BETVI18n&&typeof window.BETVI18n.t==='function'?window.BETVI18n.t(source,variables||{}):String(source||'').replace(/\{([a-zA-Z0-9_]+)\}/g,function(_,key){return variables&&Object.prototype.hasOwnProperty.call(variables,key)?String(variables[key]):_;});
    }
    function setLiteralText(element,value){
      if(!element)return;
      element.classList.add('notranslate');
      element.setAttribute('translate','no');
      element.textContent=String(value==null?'':value);
    }
    function setInterfaceText(element,source){
      if(!element)return;
      element.classList.remove('notranslate');
      element.removeAttribute('translate');
      element.textContent=localizedProfileText(source);
      if(window.BETVI18n&&typeof window.BETVI18n.apply==='function')window.BETVI18n.apply(element);
    }
    function currentViewedProfileHandle(){return beBackend.normalizeUsername(profileRouteUsername()||(viewedProfile&&viewedProfile.username)||(currentProfile&&currentProfile.username)||'');}
    function profileFollowIconMarkup(isFollowing){
      return isFollowing
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 19a6 6 0 0 0-12 0"></path><circle cx="14" cy="8" r="4"></circle><path d="M1.5 12h7"></path></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 19a6 6 0 0 0-12 0"></path><circle cx="14" cy="8" r="4"></circle><path d="M5 8.5v7"></path><path d="M1.5 12h7"></path></svg>';
    }
    function renderProfileFollowUi(){
      if(!profilePageFollow)return;
      var guest=!auth.currentUser;
      var own=!guest&&isOwnProfileView();
      var available=!guest&&!own&&Boolean(currentViewedProfileHandle());
      profilePageFollow.hidden=!available;
      profilePageFollow.setAttribute('aria-hidden',available?'false':'true');
      if(!available)return;
      var following=profileFollowState.following===true;
      profilePageFollow.classList.toggle('is-following',following);
      profilePageFollow.setAttribute('aria-pressed',following?'true':'false');
      profilePageFollow.setAttribute('aria-label',localizedProfileText(following?'Deixar de seguir':'Seguir perfil'));
      profilePageFollow.title=localizedProfileText(following?'Deixar de seguir':'Seguir perfil');
      profilePageFollow.disabled=profileFollowState.loading===true||profileFollowState.ready!==true||profileFollowWritePending;
      profilePageFollow.innerHTML=profileFollowIconMarkup(following);
      if(window.BETVI18n&&typeof window.BETVI18n.apply==='function')window.BETVI18n.apply(profilePageFollow);
    }
    function updateProfileFollowStatButtons(profile){
      var followers=Math.max(0,Number(profile&&profile.followersCount||0)||0);
      var following=Math.max(0,Number(profile&&profile.followingCount||0)||0);
      if(profilePageFollowersCount)profilePageFollowersCount.textContent=String(followers);
      if(profilePageFollowingCount)profilePageFollowingCount.textContent=String(following);
      if(profilePageFollowersLabel)profilePageFollowersLabel.textContent=localizedProfileText('Seguidores');
      if(profilePageFollowingLabel)profilePageFollowingLabel.textContent=localizedProfileText('Seguindo');
      if(profilePageFollowersButton){profilePageFollowersButton.disabled=false;profilePageFollowersButton.setAttribute('aria-label',localizedProfileText('{count} seguidores',{count:followers}));}
      if(profilePageFollowingButton){profilePageFollowingButton.disabled=false;profilePageFollowingButton.setAttribute('aria-label',localizedProfileText('{count} seguindo',{count:following}));}
    }
    // The backup RPCs persist UUID relationships independently of preference sync.
    var profileFollowCache=new Map();
    var profileFollowPromises=new Map();
    var profileFollowWritePending=false;
    function followCacheKey(handle){return String(auth.currentUser&&auth.currentUser.uid||'guest')+':'+handle;}
    function applyProfileFollowRow(handle,row){
      if(currentViewedProfileHandle()!==handle)return;
      profileFollowState={username:handle,following:Boolean(row.following),loading:false,ready:true};
      var counts={followersCount:Math.max(0,Number(row.followers_count)||0),followingCount:Math.max(0,Number(row.following_count)||0)};
      if(viewedProfile&&beBackend.normalizeUsername(viewedProfile.username)===handle)viewedProfile={...viewedProfile,...counts};
      updateProfileFollowStatButtons(counts);renderProfileFollowUi();
    }
    async function refreshProfileFollowState(force){
      var handle=currentViewedProfileHandle();
      if(!handle||!document.body.classList.contains('profile-page-active')||viewedProfileStatus!=='ready'||profileFollowWritePending)return;
      var key=followCacheKey(handle),cached=profileFollowCache.get(key);
      if(!force&&cached&&Date.now()-cached.at<30000){applyProfileFollowRow(handle,cached.row);return;}
      if(profileFollowPromises.has(key))return profileFollowPromises.get(key);
      profileFollowState={username:handle,following:false,loading:true,ready:false};renderProfileFollowUi();
      var request=(async function(){
        try{
          await beBackend.ready;
          var result=await beBackend.client.rpc('get_profile_follow_state',{p_username:handle});
          if(result.error)throw result.error;
          var row=Array.isArray(result.data)?result.data[0]:result.data;
          if(!row)throw new Error('profile_not_found');
          if(followCacheKey(handle)!==key)return;
          if(profileFollowCache.size>=100)profileFollowCache.delete(profileFollowCache.keys().next().value);
          profileFollowCache.set(key,{row:row,at:Date.now()});applyProfileFollowRow(handle,row);
        }catch(_){
          if(currentViewedProfileHandle()===handle&&followCacheKey(handle)===key){profileFollowState={username:handle,following:false,loading:false,ready:false};renderProfileFollowUi();}
        }finally{profileFollowPromises.delete(key);}
      })();
      profileFollowPromises.set(key,request);return request;
    }
    async function toggleProfileFollow(){
      var user=auth.currentUser,handle=currentViewedProfileHandle();
      if(!user||!user.uid||!handle||isOwnProfileView()||profileFollowWritePending||profileFollowState.loading||!profileFollowState.ready)return;
      var already=profileFollowState.following,key=followCacheKey(handle);
      profileFollowWritePending=true;profileFollowState.loading=true;renderProfileFollowUi();
      var status=document.getElementById('profileFollowStatus');if(status)status.textContent='';
      try{
        await beBackend.ready;
        // Explicit desired state is safe to retry; a toggle could reverse a saved action.
        var result=await beBackend.client.rpc('set_profile_follow',{p_username:handle,p_following:!already});
        if(result.error)throw result.error;
        var row=Array.isArray(result.data)?result.data[0]:result.data;
        if(!row)throw new Error('follow_unavailable');
        profileFollowCache.clear();
        if(auth.currentUser&&auth.currentUser.uid===user.uid){profileFollowCache.set(key,{row:row,at:Date.now()});applyProfileFollowRow(handle,row);}
        if(profileRelationshipsState.open&&profileRelationshipsState.username===handle)loadProfileRelationshipsPage(1,true);
      }catch(_){
        if(currentViewedProfileHandle()===handle&&followCacheKey(handle)===key){
          profileFollowState={username:handle,following:already,loading:false,ready:true};renderProfileFollowUi();
          if(status)status.textContent=localizedProfileText('Não foi possível salvar. Tente novamente.');
        }
      }finally{
        profileFollowWritePending=false;
        if(currentViewedProfileHandle()!==handle||followCacheKey(handle)!==key)refreshProfileFollowState(false);
      }
    }
    function relationshipItemMarkup(item){
      var avatar=item&&item.avatarUrl?'<img src="'+escapePublic(item.avatarUrl)+'" alt="'+escapePublic(item.displayName||item.username||'Usuário')+'">':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 19a6 6 0 0 0-12 0"></path><circle cx="9" cy="8" r="4"></circle></svg>';
      var tagMeta=profileCommunityTagMeta(item&&item.communityTag);
      var badge=tagMeta?'<span class="profile-award-tag '+tagMeta.className+' notranslate" translate="no">'+escapePublic(tagMeta.label)+'</span>':'';
      return '<button class="profile-relationships-item" type="button" data-relationship-username="'+escapePublic(item.username||'')+'"><span class="profile-relationships-person"><span class="profile-relationships-avatar">'+avatar+'</span><span class="profile-relationships-copy"><strong>'+escapePublic(item.displayName||'Usuário')+'</strong><span>@'+escapePublic(item.username||'perfil')+'</span></span></span>'+badge+'</button>';
    }
    function profileRelationshipPageTokens(current,total){
      if(total<=1)return total===1?[1]:[];
      if(total<=5){var all=[];for(var i=1;i<=total;i++)all.push(i);return all;}
      if(current<=3)return [1,2,3,'ellipsis',total];
      if(current>=total-2)return [1,'ellipsis',total-2,total-1,total];
      return [1,'ellipsis',current-1,current,current+1,'ellipsis',total];
    }
    function profileRelationshipPaginationMarkup(){
      var totalPages=Math.max(0,Number(profileRelationshipsState.totalPages||0)||0);
      var current=Math.max(1,Number(profileRelationshipsState.page||1)||1);
      if(totalPages<=1)return '';
      var tokens=profileRelationshipPageTokens(current,totalPages);
      var html='<nav class="profile-relationships-pagination" aria-label="Paginação"><button class="profile-relationships-page-arrow" type="button" data-relationship-page="'+Math.max(1,current-1)+'" aria-label="Página anterior"'+(current<=1?' disabled':'')+'>&lt;</button>';
      tokens.forEach(function(token){
        if(token==='ellipsis'){html+='<span class="profile-relationships-page-ellipsis" aria-hidden="true">…</span>';return;}
        var active=Number(token)===current;
        html+='<button class="profile-relationships-page'+(active?' is-active':'')+'" type="button" data-relationship-page="'+token+'" aria-label="Página '+token+'"'+(active?' aria-current="page"':'')+'>'+token+'</button>';
      });
      html+='<button class="profile-relationships-page-arrow" type="button" data-relationship-page="'+Math.min(totalPages,current+1)+'" aria-label="Próxima página"'+(current>=totalPages?' disabled':'')+'>&gt;</button></nav>';
      return html;
    }
    function renderProfileRelationships(){
      if(!profileRelationshipsList)return;
      var html='';
      if(profileRelationshipsState.error){profileRelationshipsList.textContent=localizedProfileText('Não foi possível carregar a lista. Tente novamente.');return;}
      if(!profileRelationshipsState.items.length&&!profileRelationshipsState.loading){html='<div class="profile-relationships-empty">'+escapePublic(localizedProfileText('Nenhum usuário encontrado.'))+'</div>';}else{html=profileRelationshipsState.items.map(relationshipItemMarkup).join('');}
      if(profileRelationshipsState.loading)html+='<div class="profile-relationships-loading">'+escapePublic(localizedProfileText('Carregando…'))+'</div>';
      else html+=profileRelationshipPaginationMarkup();
      profileRelationshipsList.innerHTML=html;
      if(window.BETVI18n&&typeof window.BETVI18n.apply==='function')window.BETVI18n.apply(profileRelationshipsList);
      profileRelationshipsList.querySelectorAll('[data-relationship-page]').forEach(function(button){button.onclick=function(){if(button.disabled)return;var nextPage=Math.max(1,Number(button.getAttribute('data-relationship-page')||1)||1);loadProfileRelationshipsPage(nextPage);};});
      profileRelationshipsList.querySelectorAll('[data-relationship-username]').forEach(function(button){button.onclick=function(){var username=button.getAttribute('data-relationship-username');closeProfileRelationships();openPublicProfile(true,username);};});
    }
    async function loadProfileRelationshipsPage(page,reset){
      if(!profileRelationshipsState.username)return;
      var listState=profileRelationshipsState;
      var listRequest=(listState.request||0)+1;listState.request=listRequest;
      var pageSize=20;
      var targetPage=Math.max(1,Math.floor(Number(page)||1));
      if(reset){profileRelationshipsState.items=[];profileRelationshipsState.page=1;profileRelationshipsState.total=0;profileRelationshipsState.totalPages=0;targetPage=1;renderProfileRelationships();}
      profileRelationshipsState.error=false;profileRelationshipsState.loading=true;renderProfileRelationships();
      try{
        var offset=(targetPage-1)*pageSize;
        var url='/api/public-profile?view=relationships&username='+encodeURIComponent(profileRelationshipsState.username)+'&type='+encodeURIComponent(profileRelationshipsState.type)+'&offset='+encodeURIComponent(offset)+'&limit='+pageSize+'&q='+encodeURIComponent(profileRelationshipsState.query||'');
        var response=await fetch(url,{headers:{Accept:'application/json'},cache:'default'});
        if(!response.ok)throw new Error('relationships_unavailable');
        var payload=await response.json();
        if(profileRelationshipsState!==listState||listState.request!==listRequest)return;
        var items=Array.isArray(payload&&payload.items)?payload.items:[];
        var total=Math.max(0,Number(payload&&payload.total||0)||0);
        var totalPages=Math.ceil(total/pageSize);
        if(totalPages>0&&targetPage>totalPages){profileRelationshipsState.loading=false;return loadProfileRelationshipsPage(totalPages,false);}
        profileRelationshipsState.items=items;
        profileRelationshipsState.page=totalPages>0?targetPage:1;
        profileRelationshipsState.pageSize=pageSize;
        profileRelationshipsState.total=total;
        profileRelationshipsState.totalPages=totalPages;
      }catch(_){
        if(profileRelationshipsState!==listState||listState.request!==listRequest)return;
        profileRelationshipsState.error=true;
        profileRelationshipsState.items=[];
        profileRelationshipsState.total=0;
        profileRelationshipsState.totalPages=0;
      }finally{
        if(profileRelationshipsState===listState&&listState.request===listRequest){
        profileRelationshipsState.loading=false;renderProfileRelationships();
        if(profileRelationshipsList)profileRelationshipsList.scrollTop=0;
        }
      }
    }
    var profileRelationshipsSearchTimer=0;
    function openProfileRelationships(type){
      var handle=currentViewedProfileHandle();if(!handle||!profileRelationshipsModal)return;
      profileRelationshipsState={open:true,type:type==='following'?'following':'followers',username:handle,items:[],page:1,pageSize:20,total:0,totalPages:0,loading:false,query:'',allowSearch:isOwnProfileView()};
      profileRelationshipsModal.hidden=false;
      document.body.classList.add('profile-relationships-open');
      if(profileRelationshipsTitle)profileRelationshipsTitle.textContent=localizedProfileText(profileRelationshipsState.type==='following'?'Seguindo':'Seguidores');
      if(profileRelationshipsSubtitle)profileRelationshipsSubtitle.textContent=localizedProfileText(profileRelationshipsState.type==='following'?'Perfis que este usuário acompanha.':'Perfis que acompanham este usuário.');
      if(profileRelationshipsSearchWrap)profileRelationshipsSearchWrap.hidden=!profileRelationshipsState.allowSearch;
      if(profileRelationshipsSearch){profileRelationshipsSearch.value='';profileRelationshipsSearch.placeholder=localizedProfileText('Pesquisar usuários');}
      renderProfileRelationships();
      loadProfileRelationshipsPage(1,true);
      if(window.BETVI18n&&typeof window.BETVI18n.apply==='function')window.BETVI18n.apply(profileRelationshipsModal);
    }
    function closeProfileRelationships(){
      if(!profileRelationshipsModal)return;
      profileRelationshipsModal.hidden=true;
      document.body.classList.remove('profile-relationships-open');
      profileRelationshipsState={open:false,type:'followers',username:'',items:[],page:1,pageSize:20,total:0,totalPages:0,loading:false,query:'',allowSearch:false};
      if(profileRelationshipsList)profileRelationshipsList.innerHTML='';
    }
    function syncProfileLanguage(){
      if(profileFavoritesEdit)profileFavoritesEdit.textContent=localizedProfileText('Editar favoritos');
      if(profileLovedAlbumsEdit)profileLovedAlbumsEdit.textContent=localizedProfileText('Editar álbuns');
      if(profilePageEdit){var editLabel=profilePageEdit.querySelector('span');if(editLabel)editLabel.textContent=localizedProfileText('Editar perfil');}
      if(profilePageSettings){var settingsLabel=profilePageSettings.querySelector('span');if(settingsLabel)settingsLabel.textContent=localizedProfileText('Configurações');}
      if(profileInlineBannerButton)profileInlineBannerButton.textContent=localizedProfileText('Editar banner');
      if(profileInlineAvatarButton){profileInlineAvatarButton.setAttribute('aria-label',localizedProfileText('Editar avatar'));profileInlineAvatarButton.title=localizedProfileText('Editar avatar');}
      if(profileInlineNameButton){profileInlineNameButton.setAttribute('aria-label',localizedProfileText('Editar nome'));profileInlineNameButton.title=localizedProfileText('Editar nome');}
      if(profileInlinePaletteButton){profileInlinePaletteButton.setAttribute('aria-label',localizedProfileText('Personalizar cores'));profileInlinePaletteButton.title=localizedProfileText('Personalizar cores');}
      if(profileInlineTagButton){profileInlineTagButton.setAttribute('aria-label',localizedProfileText('Trocar tag'));profileInlineTagButton.title=localizedProfileText('Trocar tag');}
      if(profileInlineCancelButton&&!profileInlineCancelButton.disabled)profileInlineCancelButton.textContent=localizedProfileText('Cancelar');
      if(profileInlineSaveButton&&!profileInlineSaveButton.disabled)profileInlineSaveButton.textContent=localizedProfileText('Salvar');
      if(profileInlineColorPanel&&!profileInlineColorPanel.hidden)rebuildInlineColorPanel();
      if(profileInlineTagPanel&&!profileInlineTagPanel.hidden)rebuildInlineTagPanel();
      if(profilePageFollowersLabel)profilePageFollowersLabel.textContent=localizedProfileText('Seguidores');
      if(profilePageFollowingLabel)profilePageFollowingLabel.textContent=localizedProfileText('Seguindo');
      if(profileRelationshipsTitle&&profileRelationshipsState.open)profileRelationshipsTitle.textContent=localizedProfileText(profileRelationshipsState.type==='following'?'Seguindo':'Seguidores');
      if(profileRelationshipsSubtitle&&profileRelationshipsState.open)profileRelationshipsSubtitle.textContent=localizedProfileText(profileRelationshipsState.type==='following'?'Perfis que este usuário acompanha.':'Perfis que acompanham este usuário.');
      if(profileRelationshipsSearch&&profileRelationshipsState.open)profileRelationshipsSearch.placeholder=localizedProfileText('Pesquisar usuários');
      if(profileLikeState&&typeof renderProfileLikeUi==='function')renderProfileLikeUi();
      renderProfileFollowUi();
      updateProfileFollowStatButtons(viewedProfile||currentProfile||{});
    }
    syncProfileLanguage();
    window.addEventListener('be:i18n-ready',syncProfileLanguage);
    window.addEventListener('be:profile-refreshed',function(event){
      var next=event&&event.detail&&event.detail.profile;
      if(!next||!auth.currentUser||String(next.uid||next.id||'')!==String(auth.currentUser.uid||''))return;
      currentProfile={...(currentProfile||{}),...next};
      if(isOwnProfileView())viewedProfile={...(viewedProfile||{}),...next};
      renderProfileAwardTags(viewedProfile||currentProfile);
      syncInlineTagButtonVisibility();
      updateProfileActionVisibility();
      if(profileInlineTagPanel&&!profileInlineTagPanel.hidden)rebuildInlineTagPanel();
    });
    var profileFavoritesPicker=document.getElementById('profileFavoritesPicker');
    var profileFavoritesPickerBody=document.getElementById('profileFavoritesPickerBody');
    var profileFavoritesPickerClose=document.getElementById('profileFavoritesPickerClose');
    var profileFavoritesHeaderSave=document.getElementById('profileFavoritesHeaderSave');
    var profileFavoritesCancel=document.getElementById('profileFavoritesCancel');
    var profileFavoritesSave=document.getElementById('profileFavoritesSave');
    var profileFavoritesSearch=document.getElementById('profileFavoritesSearch');
    var profileFavoritesSelectionCount=document.getElementById('profileFavoritesSelectionCount');
    var profileFavoritesItems=[];
    var profileFavoritesDraft=[];
    var profileFavoritesCatalog=[];
    var profileFavoritesLastFocus=null;
    var profileFavoritesReturnPath='';
    var profileLovedAlbumsPicker=document.getElementById('profileLovedAlbumsPicker');
    var profileLovedAlbumsPickerBody=document.getElementById('profileLovedAlbumsPickerBody');
    var profileLovedAlbumsPickerClose=document.getElementById('profileLovedAlbumsPickerClose');
    var profileLovedAlbumsHeaderSave=document.getElementById('profileLovedAlbumsHeaderSave');
    var profileLovedAlbumsCancel=document.getElementById('profileLovedAlbumsCancel');
    var profileLovedAlbumsSave=document.getElementById('profileLovedAlbumsSave');
    var profileLovedAlbumsSearch=document.getElementById('profileLovedAlbumsSearch');
    var profileLovedAlbumsSelectionCount=document.getElementById('profileLovedAlbumsSelectionCount');
    var profileLovedAlbumsItems=[];
    var profileLovedAlbumsDraft=[];
    var profileLovedAlbumsCatalog=[];
    var profileLovedAlbumsLastFocus=null;
    var profileLovedAlbumsReturnPath='';
    var profileSavedSection=document.getElementById('profileSavedSection');
    var profileSavedGrid=document.getElementById('profileSavedGrid');
    var profileSavedCount=document.getElementById('profileSavedCount');
    var profileSavedItems=[];
    var settingsPage=document.getElementById('settingsPage');
    var settingsPageBody=document.getElementById('settingsPageBody');
    var bannerPicker=document.getElementById('bannerPicker');
    var bannerPickerBody=document.getElementById('bannerPickerBody');
    var bannerPickerClose=document.getElementById('bannerPickerClose');
    var bannerPickerCancel=document.getElementById('bannerPickerCancel');
    var profileOnboarding=document.getElementById('profileOnboarding');
    var onboardingForm=document.getElementById('onboardingForm');
    var onboardingUsername=document.getElementById('onboardingUsername');
    var onboardingHandlePreview=document.getElementById('onboardingHandlePreview');
    var onboardingMessage=document.getElementById('onboardingMessage');
    var onboardingChooseAvatar=document.getElementById('onboardingChooseAvatar');
    var onboardingAvatarPreview=document.getElementById('onboardingAvatarPreview');
    var selectedAvatar='';
    var currentProfile={};
    var viewedProfile=null;
    var viewedProfileStatus='idle';
    var viewedProfileRequest=0;
    var profileLikeRequest=0;
    var profileLikeState={username:'',liked:false,count:0,loading:false};
    var onboardingShownFor='';
    var avatarPickerReturnView='';
    var bannerPickerReturnView='';
    var SETTINGS_TAB_SESSION_KEY='beSettingsActiveTab';
    var settingsActiveTab=(function(){
      var remembered='';
      try{remembered=String(history.state&&history.state.settingsTab||sessionStorage.getItem(SETTINGS_TAB_SESSION_KEY)||'');}catch(_){ }
      return ['profile','connections','socials','devices','data','language','session','account'].indexOf(remembered)>=0?remembered:'profile';
    })();
    var settingsSaveConfirm=document.getElementById('settingsSaveConfirm');
    var settingsSaveCancel=document.getElementById('settingsSaveCancel');
    var settingsSaveApprove=document.getElementById('settingsSaveApprove');
    var settingsSaveToast=document.getElementById('settingsSaveToast');
    var settingsConfirmResolver=null;
    var settingsToastTimer=null;
    var pickerGalleryCache=null;
    var pickerGalleryPromise=null;
    var avatarGalleryRendered=false;
    var bannerGalleryRendered=false;
    var avatarImageObserver=null;
    var bannerImageObserver=null;
    var profileDeviceSyncStop=null;
    var preferenceDeviceSyncStop=null;
    var preferenceSyncTimer=0;
    var pendingProfileColorSync=null;
    var preferenceSyncUserId='';
    var preferenceSyncStarting=false;
    var applyingRemotePreferences=false;
    var settingsSyncState='idle';
    var settingsSyncMessage='Aguardando login para sincronizar.';

    function escapePublic(value){return String(value||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
    function normalizeProfileSocialValue(network,value){
      var kind=String(network||'').toLowerCase();
      var raw=String(value||'').trim();
      if(!raw)return '';
      if(kind==='x'||kind==='instagram'||kind==='tiktok'){
        var expectedHosts=kind==='x'?['x.com','twitter.com']:(kind==='instagram'?['instagram.com']:['tiktok.com']);
        var candidate=raw;
        if(/^https?:\/\//i.test(candidate)||/^(?:www\.)?(?:x\.com|twitter\.com|instagram\.com|tiktok\.com)\//i.test(candidate)){
          try{
            var socialUrl=new URL(/^https?:\/\//i.test(candidate)?candidate:'https://'+candidate);
            var host=String(socialUrl.hostname||'').toLowerCase().replace(/^www\./,'');
            if(expectedHosts.indexOf(host)<0)return '';
            candidate=String(socialUrl.pathname||'').replace(/^\/+|\/+$/g,'').split('/')[0]||'';
          }catch(_){return '';}
        }
        candidate=String(candidate||'').replace(/^@+/,'').split(/[/?#]/)[0].trim();
        if(kind==='x')return /^[A-Za-z0-9_]{1,15}$/.test(candidate)?candidate:'';
        if(kind==='instagram')return /^[A-Za-z0-9._]{1,30}$/.test(candidate)&&candidate.indexOf('..')<0?candidate:'';
        return /^[A-Za-z0-9._]{2,24}$/.test(candidate)&&candidate.charAt(candidate.length-1)!=='.'?candidate:'';
      }
      return '';
    }
    function normalizeProfileSocialLinks(value){
      var source=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
      return {
        x:normalizeProfileSocialValue('x',source.x||source.twitter||''),
        instagram:normalizeProfileSocialValue('instagram',source.instagram||''),
        tiktok:normalizeProfileSocialValue('tiktok',source.tiktok||'')
      };
    }
    function hasProfileSocialLinks(value){var links=normalizeProfileSocialLinks(value);return Boolean(links.x||links.instagram||links.tiktok);}
    function profileSocialStorageKey(userId){return 'beProfileSocialLinks:'+String(userId||'guest');}
    function readProfileSocialLinks(userId){
      try{return normalizeProfileSocialLinks(JSON.parse(localStorage.getItem(profileSocialStorageKey(userId))||'{}'));}
      catch(_){return normalizeProfileSocialLinks({});}
    }
    function writeProfileSocialLinks(userId,value){
      var links=normalizeProfileSocialLinks(value);
      try{localStorage.setItem(profileSocialStorageKey(userId),JSON.stringify(links));}catch(_){ }
      return links;
    }
    function profileSocialHref(network,value){
      var normalized=normalizeProfileSocialValue(network,value);
      if(!normalized)return '';
      if(network==='x')return 'https://x.com/'+encodeURIComponent(normalized);
      if(network==='instagram')return 'https://www.instagram.com/'+encodeURIComponent(normalized)+'/';
      if(network==='tiktok')return 'https://www.tiktok.com/@'+encodeURIComponent(normalized);
      return '';
    }
    function profileSocialIcon(network){
      if(network==='x')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.4L6.47 22H3.36l7.26-8.3L2.97 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.72L8.43 4.05H6.58L17.8 19.84Z"></path></svg>';
      if(network==='instagram')return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><path d="M17.5 6.5h.01"></path></svg>';
      if(network==='tiktok')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.35 2.4h3.08c.22 1.2.7 2.2 1.45 3.03A6.1 6.1 0 0 0 22 7.2v3.13a9.02 9.02 0 0 1-4.47-1.47v6.2a6.66 6.66 0 1 1-5.75-6.6v3.2a3.5 3.5 0 1 0 2.57 3.37V2.4Z"></path></svg>';
      return '';
    }
    function renderProfileSocials(profile){
      if(!profilePageSocials)return;
      if(!profile){profilePageSocials.innerHTML='';profilePageSocials.hidden=true;profilePageSocials.setAttribute('hidden','');return;}
      var links=normalizeProfileSocialLinks(profile&&profile.socialLinks);
      if(isOwnProfileView()&&auth.currentUser){
        var localLinks=readProfileSocialLinks(auth.currentUser.uid);
        if(hasProfileSocialLinks(localLinks)||!hasProfileSocialLinks(links))links=localLinks;
      }
      var labels={x:'X',instagram:'Instagram',tiktok:'TikTok'};
      var order=['x','instagram','tiktok'];
      var markup=order.map(function(network){
        var value=links[network];if(!value)return '';
        var href=profileSocialHref(network,value);
        var title=labels[network];
        var className='profile-page-social-link is-'+network;
        if(href)return '<a class="'+className+'" href="'+escapePublic(href)+'" target="_blank" rel="noopener noreferrer" aria-label="Abrir '+labels[network]+'" title="'+escapePublic(title)+'">'+profileSocialIcon(network)+'</a>';
        return '<span class="'+className+' is-static" role="img" aria-label="'+escapePublic(title)+'" title="'+escapePublic(title)+'">'+profileSocialIcon(network)+'</span>';
      }).join('');
      profilePageSocials.innerHTML=markup;
      profilePageSocials.hidden=!markup;
      if(markup)profilePageSocials.removeAttribute('hidden');else profilePageSocials.setAttribute('hidden','');
    }
    function avatarCacheKey(user){return 'beSelectedAvatar:'+(user&&user.uid?user.uid:'guest');}
    function selectedProfileAvatar(profile){return profile&&profile.avatarUrl?String(profile.avatarUrl):'';}
    function setMainAvatar(url){var shown=String(url||'').trim();if(window.BETVApplyAvatar)window.BETVApplyAvatar(photo,shown);else{photo.src=shown||window.BETV_DEFAULT_AVATAR;photo.hidden=false;}fallback.hidden=true;updateOnboardingAvatar();}
    function fallbackAvatarSvg(){return '<img loading="eager" decoding="async" src="'+escapePublic(window.BETV_DEFAULT_AVATAR||'/_static/media/profile/default-avatar.png')+'" data-avatar-fallback="'+escapePublic(window.BETV_DEFAULT_AVATAR||'/_static/media/profile/default-avatar.png')+'" alt="Sem foto de perfil">';}
    function updateOnboardingAvatar(){if(!onboardingAvatarPreview)return;var shown=selectedAvatar||selectedProfileAvatar(currentProfile)||window.BETV_DEFAULT_AVATAR;onboardingAvatarPreview.innerHTML='<img loading="eager" decoding="async" src="'+escapePublic(window.BETVResolveAvatar?window.BETVResolveAvatar(shown):shown)+'" data-avatar-fallback="'+escapePublic(window.BETV_DEFAULT_AVATAR||'/_static/media/profile/default-avatar.png')+'" alt="Foto do perfil">';}
    function syncBodyScroll(){var locked=!avatarPicker.hidden||!bannerPicker.hidden||!profileModal.hidden||!profileOnboarding.hidden||(profileFavoritesPicker&&!profileFavoritesPicker.hidden)||(profileLovedAlbumsPicker&&!profileLovedAlbumsPicker.hidden)||(settingsSaveConfirm&&!settingsSaveConfirm.hidden);document.body.style.overflow=locked?'hidden':'';}
    function keepSettingsOpen(){
      if(!auth.currentUser)return;
      profilePage.hidden=true;profilePage.setAttribute('hidden','');profilePage.setAttribute('aria-hidden','true');
      settingsPage.hidden=false;settingsPage.removeAttribute('hidden');settingsPage.setAttribute('aria-hidden','false');
      document.body.classList.remove('profile-page-active','login-mode','support-page-active','notification-page-active','billie-page-active','donate-page-active','detail-page-active','section-catalog-active');
      document.body.classList.add('settings-page-active');
      if(!isConfigRoute())replacePublicRoute('/config');
    }
    function pushPickerHistory(kind){
      if(!window.matchMedia('(max-width:760px)').matches)return;
      if(history.state&&history.state.beOverlay===kind)return;
      try{history.pushState({...history.state,beOverlay:kind},'',location.pathname+(location.search||'')+(location.hash||''));}catch(_){}
    }
    function closeAvatarPicker(unwindHistory){
      var returnView=avatarPickerReturnView;
      var shouldUnwind=unwindHistory!==false&&window.matchMedia('(max-width:760px)').matches&&history.state&&history.state.beOverlay==='avatar-picker';
      avatarPicker.hidden=true;avatarPickerReturnView='';document.body.classList.remove('avatar-picker-active');
      if(avatarImageObserver){avatarImageObserver.disconnect();avatarImageObserver=null;}syncBodyScroll();if(returnView==='settings')keepSettingsOpen();
      if(shouldUnwind){try{history.back();}catch(_){}}
    }
    function closeBannerPicker(unwindHistory){
      var returnView=bannerPickerReturnView;
      var shouldUnwind=unwindHistory!==false&&window.matchMedia('(max-width:760px)').matches&&history.state&&history.state.beOverlay==='banner-picker';
      bannerPicker.hidden=true;bannerPickerReturnView='';document.body.classList.remove('banner-picker-active');
      if(bannerImageObserver){bannerImageObserver.disconnect();bannerImageObserver=null;}syncBodyScroll();if(returnView==='settings')keepSettingsOpen();
      if(shouldUnwind){try{history.back();}catch(_){}}
    }
    function closeProfile(){profileModal.hidden=true;profileModal.setAttribute('aria-hidden','true');syncBodyScroll();}
    function closeProfileActionsMenu(returnFocus){
      if(!profilePageActionsMenu||profilePageActionsMenu.hidden)return;
      profilePageActionsMenu.hidden=true;
      profilePageActionsMenu.setAttribute('hidden','');
      profilePageMore.setAttribute('aria-expanded','false');
      profilePageActionsMenu.style.removeProperty('--profile-actions-left');
      profilePageActionsMenu.style.removeProperty('--profile-actions-top');
      if(returnFocus===true)profilePageMore.focus({preventScroll:true});
    }
    function positionProfileActionsMenu(){
      if(!profilePageActionsMenu||profilePageActionsMenu.hidden||!profilePageMore)return;
      var rect=profilePageMore.getBoundingClientRect();
      var menuRect=profilePageActionsMenu.getBoundingClientRect();
      var gap=10;
      var edge=12;
      var left=Math.min(window.innerWidth-menuRect.width-edge,Math.max(edge,rect.right-menuRect.width));
      var top=rect.top-menuRect.height-gap;
      if(top<edge)top=Math.min(window.innerHeight-menuRect.height-edge,rect.bottom+gap);
      profilePageActionsMenu.style.setProperty('--profile-actions-left',Math.round(left)+'px');
      profilePageActionsMenu.style.setProperty('--profile-actions-top',Math.round(Math.max(edge,top))+'px');
    }
    function openProfileActionsMenu(){
      if(!auth.currentUser){window.BETVPublicRoutes.go('/login');document.body.classList.add('login-mode');return;}
      if(!isOwnProfileView())return;
      profilePageActionsMenu.hidden=false;
      profilePageActionsMenu.removeAttribute('hidden');
      profilePageMore.setAttribute('aria-expanded','true');
      window.requestAnimationFrame(function(){positionProfileActionsMenu();if(profilePageEdit)profilePageEdit.focus({preventScroll:true});});
    }
    function toggleProfileActionsMenu(){
      if(!profilePageActionsMenu)return;
      if(profilePageActionsMenu.hidden)openProfileActionsMenu();else closeProfileActionsMenu(false);
    }
    function profileInlineIcon(kind){
      if(kind==='palette')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6h-.8a1.45 1.45 0 0 1 0-2.9H15A6 6 0 0 0 21 8.5C21 5.46 17.4 3 12 3Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.7" cy="9" r="1" fill="currentColor"/><circle cx="10.5" cy="6.8" r="1" fill="currentColor"/><circle cx="14.2" cy="6.8" r="1" fill="currentColor"/><circle cx="16.7" cy="9.4" r="1" fill="currentColor"/></svg>';
      if(kind==='tag')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5v5.1c0 .8.3 1.6.9 2.2l6.9 6.9a2.5 2.5 0 0 0 3.5 0l3.9-3.9a2.5 2.5 0 0 0 0-3.5l-6.9-6.9a3.1 3.1 0 0 0-2.2-.9H5.5a1 1 0 0 0-1 1Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8.3" cy="8.3" r="1.25" fill="currentColor"/></svg>';
      if(kind==='pencil')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="m13.8 6.2 4 4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
      if(kind==='plus')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
      if(kind==='close')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      return '';
    }
    function ensureInlineProfileEditor(){
      if(!profilePage)return;
      var hero=profilePage.querySelector('.profile-page-hero');
      var info=profilePage.querySelector('.profile-page-info');
      var nameRow=profilePage.querySelector('.profile-page-name-row');
      if(!hero||!info||!nameRow)return;

      var wrap=profilePageAvatar&&profilePageAvatar.parentElement&&profilePageAvatar.parentElement.classList.contains('profile-page-avatar-edit-wrap')?profilePageAvatar.parentElement:null;
      if(profilePageAvatar&&!wrap){
        wrap=document.createElement('div');
        wrap.className='profile-page-avatar-edit-wrap';
        profilePageAvatar.parentNode.insertBefore(wrap,profilePageAvatar);
        wrap.appendChild(profilePageAvatar);
      }
      if(wrap&&!profileInlineAvatarButton){
        profileInlineAvatarButton=document.createElement('button');
        profileInlineAvatarButton.type='button';
        profileInlineAvatarButton.className='profile-inline-avatar-edit';
        profileInlineAvatarButton.setAttribute('aria-label',localizedProfileText('Editar avatar'));
        profileInlineAvatarButton.title=localizedProfileText('Editar avatar');
        profileInlineAvatarButton.innerHTML=profileInlineIcon('plus');
        profileInlineAvatarButton.onclick=function(event){event.preventDefault();event.stopPropagation();openAvatarPicker();};
        wrap.appendChild(profileInlineAvatarButton);
      }
      if(!profileInlineBannerButton){
        profileInlineBannerButton=document.createElement('button');
        profileInlineBannerButton.type='button';
        profileInlineBannerButton.className='profile-inline-banner-edit';
        profileInlineBannerButton.textContent=localizedProfileText('Editar banner');
        profileInlineBannerButton.onclick=function(event){event.preventDefault();event.stopPropagation();openBannerPicker();};
        hero.appendChild(profileInlineBannerButton);
      }
      if(!profileInlineNameButton){
        profileInlineNameButton=document.createElement('button');
        profileInlineNameButton.type='button';
        profileInlineNameButton.className='profile-inline-name-edit';
        profileInlineNameButton.setAttribute('aria-label',localizedProfileText('Editar nome'));
        profileInlineNameButton.title=localizedProfileText('Editar nome');
        profileInlineNameButton.innerHTML=profileInlineIcon('pencil');
        profileInlineNameButton.onclick=function(event){event.preventDefault();event.stopPropagation();beginInlineNameEdit();};
        profilePageName.insertAdjacentElement('afterend',profileInlineNameButton);
      }
      if(!profileInlineDock){
        profileInlineDock=document.createElement('div');
        profileInlineDock.className='profile-inline-edit-dock';
        profileInlineDock.innerHTML='<button class="profile-inline-palette" type="button" aria-label="'+escapePublic(localizedProfileText('Personalizar cores'))+'" title="'+escapePublic(localizedProfileText('Personalizar cores'))+'">'+profileInlineIcon('palette')+'</button><button class="profile-inline-cancel" type="button">'+escapePublic(localizedProfileText('Cancelar'))+'</button><button class="profile-inline-save" type="button">'+escapePublic(localizedProfileText('Salvar'))+'</button><button class="profile-inline-tag-button" type="button" aria-label="'+escapePublic(localizedProfileText('Trocar tag'))+'" title="'+escapePublic(localizedProfileText('Trocar tag'))+'">'+profileInlineIcon('tag')+'</button>';
        document.body.appendChild(profileInlineDock);
        profileInlinePaletteButton=profileInlineDock.querySelector('.profile-inline-palette');
        profileInlineTagButton=profileInlineDock.querySelector('.profile-inline-tag-button');
        profileInlineCancelButton=profileInlineDock.querySelector('.profile-inline-cancel');
        profileInlineSaveButton=profileInlineDock.querySelector('.profile-inline-save');
        profileInlinePaletteButton.onclick=function(event){event.preventDefault();event.stopPropagation();toggleInlineColorPanel();};
        profileInlineTagButton.onclick=function(event){event.preventDefault();event.stopPropagation();toggleInlineTagPanel();};
        profileInlineCancelButton.onclick=function(event){event.preventDefault();event.stopPropagation();cancelInlineProfileEdit();};
        profileInlineSaveButton.onclick=function(event){event.preventDefault();event.stopPropagation();saveInlineProfileEdit();};
      }
      if(!profileInlineColorPanel){
        profileInlineColorPanel=document.createElement('section');
        profileInlineColorPanel.className='profile-inline-color-popover';
        profileInlineColorPanel.setAttribute('role','dialog');
        profileInlineColorPanel.setAttribute('aria-label','Personalização de cores');
        profileInlineColorPanel.hidden=true;
        document.body.appendChild(profileInlineColorPanel);
      }
      if(!profileInlineTagPanel){
        profileInlineTagPanel=document.createElement('section');
        profileInlineTagPanel.className='profile-inline-tag-popover';
        profileInlineTagPanel.setAttribute('role','dialog');
        profileInlineTagPanel.setAttribute('aria-label',localizedProfileText('Suas tags'));
        profileInlineTagPanel.hidden=true;
        document.body.appendChild(profileInlineTagPanel);
      }
      syncInlineTagButtonVisibility();
    }
    function beginInlineNameEdit(){
      if(!profileInlineEditing||!profilePageName)return;
      profileInlineNameWasEditing=true;
      profilePageName.setAttribute('contenteditable','true');
      profilePageName.setAttribute('role','textbox');
      profilePageName.setAttribute('aria-label','Nome do perfil');
      profilePageName.setAttribute('spellcheck','false');
      profilePageName.classList.add('is-inline-editing');
      if(profileInlineNameButton)profileInlineNameButton.classList.add('is-active');
      profilePageName.focus({preventScroll:true});
      try{
        var range=document.createRange();range.selectNodeContents(profilePageName);range.collapse(false);
        var selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
      }catch(_){ }
    }
    function finishInlineNameEdit(restore){
      if(!profilePageName)return;
      if(restore===true){profileInlineDraftName=profileInlineOriginalName;setLiteralText(profilePageName,profileInlineOriginalName);}
      else{
        var value=String(profilePageName.textContent||'').replace(/\s+/g,' ').trim().slice(0,50);
        profileInlineDraftName=value||profileInlineOriginalName;
        setLiteralText(profilePageName,profileInlineDraftName);
      }
      profileInlineNameWasEditing=false;
      profilePageName.removeAttribute('contenteditable');
      profilePageName.removeAttribute('role');
      profilePageName.removeAttribute('aria-label');
      profilePageName.classList.remove('is-inline-editing');
      if(profileInlineNameButton)profileInlineNameButton.classList.remove('is-active');
    }
    function ownedProfileCommunityTags(profile){
      var values=[];
      var list=profile&&(profile.communityTags||profile.community_tags);
      if(Array.isArray(list))values=values.concat(list);
      var active=profile&&(profile.communityTag||profile.community_tag);
      if(active)values.push(active);
      var seen={};
      return values.map(normalizeProfileCommunityTag).filter(function(tag){
        if(!tag||seen[tag])return false;
        seen[tag]=true;
        return true;
      });
    }
    function syncInlineTagButtonVisibility(){
      if(!profileInlineTagButton)return;
      var owned=ownedProfileCommunityTags(currentProfile||viewedProfile);
      profileInlineTagButton.hidden=!owned.length;
      profileInlineTagButton.setAttribute('aria-hidden',owned.length?'false':'true');
      if(!owned.length)closeInlineTagPanel();
    }
    function rebuildInlineTagPanel(){
      if(!profileInlineTagPanel||!auth.currentUser)return;
      var owned=ownedProfileCommunityTags(currentProfile||viewedProfile);
      var active=normalizeProfileCommunityTag((currentProfile&&currentProfile.communityTag)||(viewedProfile&&viewedProfile.communityTag)||'');
      profileInlineTagPanel.setAttribute('aria-label',localizedProfileText('Suas tags'));
      if(!owned.length){
        profileInlineTagPanel.innerHTML='<header class="profile-inline-tag-head"><div><strong>'+escapePublic(localizedProfileText('Suas tags'))+'</strong><span>'+escapePublic(localizedProfileText('Você ainda não possui tags.'))+'</span></div><button class="profile-inline-tag-close" type="button" aria-label="'+escapePublic(localizedProfileText('Fechar'))+'">'+profileInlineIcon('close')+'</button></header>';
      }else{
        profileInlineTagPanel.innerHTML='<header class="profile-inline-tag-head"><div><strong>'+escapePublic(localizedProfileText('Suas tags'))+'</strong><span>'+escapePublic(localizedProfileText('Escolha a tag que deseja exibir no seu perfil.'))+'</span></div><button class="profile-inline-tag-close" type="button" aria-label="'+escapePublic(localizedProfileText('Fechar'))+'">'+profileInlineIcon('close')+'</button></header><div class="profile-inline-tag-list">'+owned.map(function(tag){var meta=profileCommunityTagMeta(tag);if(!meta)return '';var selected=tag===active;return '<button class="profile-inline-tag-option'+(selected?' is-selected':'')+'" type="button" data-profile-community-tag="'+escapePublic(tag)+'" aria-pressed="'+(selected?'true':'false')+'"><span class="profile-inline-tag-option-main"><span class="profile-award-tag '+meta.className+' notranslate" translate="no">'+escapePublic(meta.label)+'</span></span><span class="profile-inline-tag-option-state">'+(selected?escapePublic(localizedProfileText('Em uso')):'')+'</span><span class="profile-inline-tag-check" aria-hidden="true">'+(selected?'✓':'')+'</span></button>';}).join('')+'</div>';
      }
      var close=profileInlineTagPanel.querySelector('.profile-inline-tag-close');
      if(close)close.onclick=function(){closeInlineTagPanel();};
      profileInlineTagPanel.querySelectorAll('[data-profile-community-tag]').forEach(function(button){
        button.onclick=function(event){event.preventDefault();event.stopPropagation();selectInlineCommunityTag(button.getAttribute('data-profile-community-tag'));};
      });
    }
    async function selectInlineCommunityTag(tag){
      if(profileInlineTagSaving||!auth.currentUser)return;
      var normalized=normalizeProfileCommunityTag(tag);
      var owned=ownedProfileCommunityTags(currentProfile||viewedProfile);
      if(!normalized||owned.indexOf(normalized)<0)return;
      var active=normalizeProfileCommunityTag((currentProfile&&currentProfile.communityTag)||(viewedProfile&&viewedProfile.communityTag)||'');


      var nextTag=normalized===active?'':normalized;
      profileInlineTagSaving=true;
      if(profileInlineTagPanel)profileInlineTagPanel.querySelectorAll('button').forEach(function(button){button.disabled=true;});
      try{
        var client=window.beBackend&&window.beBackend.client;
        if(!client||typeof client.rpc!=='function')throw new Error('backend_unavailable');
        var result=await client.rpc('set_my_community_tag',{p_tag:nextTag});
        if(result&&result.error)throw result.error;
        currentProfile={...(currentProfile||{}),communityTag:nextTag,communityTags:owned};
        if(viewedProfile&&isOwnProfileView())viewedProfile={...viewedProfile,communityTag:nextTag,communityTags:owned};
        try{
          var storageKey='beCommunityTag:'+String(auth.currentUser.uid||'');
          if(nextTag)localStorage.setItem(storageKey,nextTag);else localStorage.removeItem(storageKey);
        }catch(_){ }
        renderProfileAwardTags(viewedProfile||currentProfile);
        try{window.dispatchEvent(new CustomEvent('be:community-tag-updated',{detail:{userId:String(auth.currentUser.uid||''),tag:nextTag}}));}catch(_){ }
        rebuildInlineTagPanel();
        window.setTimeout(closeInlineTagPanel,180);
      }catch(error){
        (void 0);
        rebuildInlineTagPanel();
      }finally{
        profileInlineTagSaving=false;
      }
    }
    function openInlineTagPanel(){
      if(!profileInlineEditing||!profileInlineTagPanel||!profileInlineTagButton||profileInlineTagButton.hidden)return;
      closeInlineColorPanel();
      rebuildInlineTagPanel();
      profileInlineTagPanel.hidden=false;
      profileInlineTagPanel.removeAttribute('hidden');
      profileInlineTagButton.classList.add('is-active');
    }
    function closeInlineTagPanel(){
      if(!profileInlineTagPanel)return;
      profileInlineTagPanel.hidden=true;
      profileInlineTagPanel.setAttribute('hidden','');
      if(profileInlineTagButton)profileInlineTagButton.classList.remove('is-active');
    }
    function toggleInlineTagPanel(){
      if(!profileInlineTagPanel)return;
      if(profileInlineTagPanel.hidden)openInlineTagPanel();else closeInlineTagPanel();
    }

    function rebuildInlineColorPanel(){
      if(!profileInlineColorPanel||!auth.currentUser)return;
      var uid=auth.currentUser.uid;
      var profileColor=normalizeProfileColorValue((currentProfile&&currentProfile.profileColor)||readProfileColorValue(uid,'profile'));
      var avatarBorderColor=normalizeProfileColorValue((currentProfile&&currentProfile.avatarBorderColor)||readProfileColorValue(uid,'avatar-border'));
      profileInlineColorPanel.innerHTML='<header class="profile-inline-color-head"><div><strong>'+escapePublic(localizedProfileText('Cores do perfil'))+'</strong><span>'+escapePublic(localizedProfileText('personalize conforme seu gosto'))+'</span></div><button class="profile-inline-color-close" type="button" aria-label="'+escapePublic(localizedProfileText('Fechar'))+'">'+profileInlineIcon('close')+'</button></header><div class="profile-inline-color-scroll">'+profileColorSettingsMarkup(profileColor,avatarBorderColor)+'</div><footer class="profile-inline-color-footer"><button class="profile-inline-reset" type="button">'+escapePublic(localizedProfileText('Voltar ao padrão'))+'</button></footer>';
      var close=profileInlineColorPanel.querySelector('.profile-inline-color-close');
      var reset=profileInlineColorPanel.querySelector('.profile-inline-reset');
      if(close)close.onclick=function(){closeInlineColorPanel();};
      if(reset)reset.onclick=function(){resetInlineProfileColors();};
      bindProfileColorSettings(auth.currentUser,profileInlineColorPanel);
    }
    function openInlineColorPanel(){
      if(!profileInlineEditing||!profileInlineColorPanel)return;
      closeInlineTagPanel();
      rebuildInlineColorPanel();
      profileInlineColorPanel.hidden=false;
      profileInlineColorPanel.removeAttribute('hidden');
      if(profileInlinePaletteButton)profileInlinePaletteButton.classList.add('is-active');
    }
    function closeInlineColorPanel(){
      if(!profileInlineColorPanel)return;
      profileInlineColorPanel.hidden=true;
      profileInlineColorPanel.setAttribute('hidden','');
      if(profileInlinePaletteButton)profileInlinePaletteButton.classList.remove('is-active');
    }
    function toggleInlineColorPanel(){
      if(!profileInlineColorPanel)return;
      if(profileInlineColorPanel.hidden)openInlineColorPanel();else closeInlineColorPanel();
    }
    function resetInlineProfileColors(){
      if(!auth.currentUser)return;
      var uid=auth.currentUser.uid;
      persistProfileThemeColor('profile',uid,'');
      persistProfileThemeColor('avatar-border',uid,'');
      rebuildInlineColorPanel();
    }
    function restoreInlineProfileColors(){
      if(!auth.currentUser)return;
      var uid=auth.currentUser.uid;
      writeProfileColorValue(uid,'profile',profileInlineOriginalProfileColor);
      writeProfileColorValue(uid,'avatar-border',profileInlineOriginalAvatarBorderColor);
      currentProfile={...(currentProfile||{}),profileColor:profileInlineOriginalProfileColor,avatarBorderColor:profileInlineOriginalAvatarBorderColor};
      if(viewedProfile&&isOwnProfileView())viewedProfile={...viewedProfile,profileColor:profileInlineOriginalProfileColor,avatarBorderColor:profileInlineOriginalAvatarBorderColor};
      pendingProfileColorSync={userId:String(uid||''),profileColor:profileInlineOriginalProfileColor,profileAvatarBorderColor:profileInlineOriginalAvatarBorderColor};
      applyProfileTheme(viewedProfile||currentProfile);
      applyOwnAvatarBorder(currentProfile,uid);
      scheduleCrossDeviceSync('profile-colors');
    }
    function commitInlineColorDrafts(){
      if(!profileInlineColorPanel||!auth.currentUser)return;
      profileInlineColorPanel.querySelectorAll('[data-profile-color-kind]').forEach(function(control){
        var customTrigger=control.querySelector('[data-profile-color-custom-open]');
        var shouldCommit=control.dataset.profileCustomDirty==='true'||Boolean(customTrigger&&customTrigger.classList.contains('is-selected'));
        if(!shouldCommit)return;
        var kind=control.getAttribute('data-profile-color-kind')==='avatar-border'?'avatar-border':'profile';
        var hexInput=control.querySelector('[data-profile-color-hex]');
        if(!hexInput)return;
        var color=normalizeProfileColorValue(hexInput.value);
        if(color){control.dataset.profileCustomDirty='false';persistProfileThemeColor(kind,auth.currentUser.uid,color);}
      });
    }
    function startInlineProfileEdit(){
      if(!auth.currentUser||!isOwnProfileView())return;
      ensureInlineProfileEditor();
      profileInlineEditing=true;
      profileInlineOriginalName=String((viewedProfile&&viewedProfile.displayName)||(currentProfile&&currentProfile.displayName)||auth.currentUser.displayName||profilePageName.textContent||'Usuário').trim();
      profileInlineDraftName=profileInlineOriginalName;
      profileInlineOriginalProfileColor=normalizeProfileColorValue((currentProfile&&currentProfile.profileColor)||readProfileColorValue(auth.currentUser.uid,'profile'));
      profileInlineOriginalAvatarBorderColor=normalizeProfileColorValue((currentProfile&&currentProfile.avatarBorderColor)||readProfileColorValue(auth.currentUser.uid,'avatar-border'));
      profileInlineOriginalAvatarUrl=String((currentProfile&&currentProfile.avatarUrl)||auth.currentUser.photoURL||'').trim();
      profileInlineOriginalAvatarId=String((currentProfile&&currentProfile.avatarId)||'').trim();
      profileInlineOriginalBannerUrl=String((currentProfile&&currentProfile.bannerUrl)||'').trim();
      profileInlineOriginalBannerId=String((currentProfile&&currentProfile.bannerId)||'').trim();
      document.body.classList.add('profile-inline-editing');
      if(profileInlineCancelButton){profileInlineCancelButton.disabled=false;profileInlineCancelButton.textContent=localizedProfileText('Cancelar');}
      if(profileInlineSaveButton){profileInlineSaveButton.disabled=false;profileInlineSaveButton.textContent=localizedProfileText('Salvar');}
      syncInlineTagButtonVisibility();
      closeInlineColorPanel();
      closeInlineTagPanel();
    }
    function stopInlineProfileEdit(keepName){
      if(profileInlineNameWasEditing)finishInlineNameEdit(keepName!==true);
      else if(keepName!==true&&profilePageName&&profileInlineOriginalName)setLiteralText(profilePageName,profileInlineOriginalName);
      profileInlineEditing=false;
      profileInlineNameWasEditing=false;
      document.body.classList.remove('profile-inline-editing');
      closeInlineColorPanel();
      closeInlineTagPanel();
      profileInlineOriginalName='';
      profileInlineDraftName='';
      profileInlineOriginalProfileColor='';
      profileInlineOriginalAvatarBorderColor='';
      profileInlineOriginalAvatarUrl='';
      profileInlineOriginalAvatarId='';
      profileInlineOriginalBannerUrl='';
      profileInlineOriginalBannerId='';
    }
    async function cancelInlineProfileEdit(){
      if(!profileInlineEditing)return;
      var uid=auth.currentUser&&auth.currentUser.uid;
      if(profileInlineNameWasEditing)finishInlineNameEdit(true);
      else if(profilePageName&&profileInlineOriginalName)setLiteralText(profilePageName,profileInlineOriginalName);
      restoreInlineProfileColors();
      if(profileInlineCancelButton){profileInlineCancelButton.disabled=true;profileInlineCancelButton.textContent=localizedProfileText('Cancelando…');}
      try{
        if(uid){
          var currentAvatar=String((currentProfile&&currentProfile.avatarUrl)||'').trim();
          var currentBanner=String((currentProfile&&currentProfile.bannerUrl)||'').trim();
          if(currentAvatar!==profileInlineOriginalAvatarUrl){
            var restoredAvatar=await beBackend.profiles.setAvatar(uid,profileInlineOriginalAvatarUrl,profileInlineOriginalAvatarId);
            if(restoredAvatar)currentProfile=restoredAvatar;
            selectedAvatar=profileInlineOriginalAvatarUrl;
            setMainAvatar(profileInlineOriginalAvatarUrl);
            try{localStorage.setItem(avatarCacheKey(auth.currentUser),profileInlineOriginalAvatarUrl);}catch(_){ }
          }
          if(currentBanner!==profileInlineOriginalBannerUrl){
            var restoredBanner=await beBackend.profiles.setBanner(uid,profileInlineOriginalBannerUrl,profileInlineOriginalBannerId);
            if(restoredBanner)currentProfile=restoredBanner;
          }
        }
      }catch(error){
        (void 0);
      }
      viewedProfile={...(viewedProfile||{}),...(currentProfile||{}),displayName:profileInlineOriginalName,profileColor:profileInlineOriginalProfileColor,avatarBorderColor:profileInlineOriginalAvatarBorderColor,avatarUrl:profileInlineOriginalAvatarUrl,bannerUrl:profileInlineOriginalBannerUrl,bannerId:profileInlineOriginalBannerId};
      renderProfilePage();
      stopInlineProfileEdit(false);
      if(profileInlineCancelButton){profileInlineCancelButton.disabled=false;profileInlineCancelButton.textContent=localizedProfileText('Cancelar');}
    }
    async function saveInlineProfileEdit(){
      if(!auth.currentUser||!profileInlineEditing)return;
      if(profileInlineNameWasEditing)finishInlineNameEdit(false);
      commitInlineColorDrafts();
      var displayName=String(profileInlineDraftName||profilePageName.textContent||'').replace(/\s+/g,' ').trim().slice(0,50);
      if(!displayName){beginInlineNameEdit();return;}
      var button=profileInlineSaveButton;
      if(button){button.disabled=true;button.textContent=localizedProfileText('Salvando…');}
      try{
        currentProfile=await beBackend.profiles.update(auth.currentUser.uid,{displayName:displayName,updatedAt:beBackend.now()});
        await auth.updateCurrentUser({displayName:displayName});
        viewedProfile={...(viewedProfile||{}),...(currentProfile||{}),displayName:displayName};
        viewedProfileStatus='ready';
        profileInlineDraftName=displayName;
        profileInlineOriginalName=displayName;
        setLiteralText(profilePageName,displayName);
        renderProfilePage();
        stopInlineProfileEdit(true);
      }catch(error){
        (void 0);
        if(button){button.disabled=false;button.textContent=localizedProfileText('Tentar novamente');}
      }
    }
    function openProfileEditor(){
      closeProfileActionsMenu(false);
      if(!auth.currentUser){window.BETVPublicRoutes.go('/login');document.body.classList.add('login-mode');return;}
      if(!isOwnProfileView())return;
      startInlineProfileEdit();
    }
    function resolveSettingsConfirm(value){
      if(!settingsSaveConfirm||settingsSaveConfirm.hidden)return;
      settingsSaveConfirm.hidden=true;syncBodyScroll();
      var resolve=settingsConfirmResolver;settingsConfirmResolver=null;if(resolve)resolve(Boolean(value));
    }
    function askSettingsSave(){
      if(!settingsSaveConfirm)return Promise.resolve(true);
      if(settingsConfirmResolver)resolveSettingsConfirm(false);
      settingsSaveConfirm.hidden=false;syncBodyScroll();
      return new Promise(function(resolve){settingsConfirmResolver=resolve;setTimeout(function(){if(settingsSaveApprove)settingsSaveApprove.focus({preventScroll:true});},40);});
    }
    function showSettingsSaved(){
      if(!settingsSaveToast)return;
      clearTimeout(settingsToastTimer);settingsSaveToast.hidden=false;
      settingsToastTimer=setTimeout(function(){settingsSaveToast.hidden=true;},2200);
    }
    function syncedUserCacheKey(userId){return 'beSyncedUserData:'+String(userId||'guest');}
    function readStorageJson(key,fallback){try{var parsed=JSON.parse(localStorage.getItem(key)||'null');return parsed===null?fallback:parsed;}catch(_){return fallback;}}
    var PROFILE_COLOR_PRESETS=['#1DBCB3','#8B5CF6','#3B82F6','#22C55E','#FF4747','#FFA10A'];
    function normalizeProfileColorValue(value){
      var normalized=String(value||'').trim().toUpperCase();
      return /^#[0-9A-F]{6}$/.test(normalized)?normalized:'';
    }
    function profileColorStorageKey(userId,kind){
      return (kind==='avatar-border'?'beProfileAvatarBorderColor:':'beProfileColor:')+String(userId||'guest');
    }
    function readProfileColorValue(userId,kind){
      try{return normalizeProfileColorValue(localStorage.getItem(profileColorStorageKey(userId,kind))||'');}catch(_){return '';}
    }
    function writeProfileColorValue(userId,kind,value){
      var normalized=normalizeProfileColorValue(value);
      try{
        var key=profileColorStorageKey(userId,kind);
        if(normalized)localStorage.setItem(key,normalized);else localStorage.removeItem(key);
      }catch(_){ }
      return normalized;
    }
    function profileColorRgb(value){
      var hex=normalizeProfileColorValue(value);
      if(!hex)return null;
      return {r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)};
    }
    function applyOwnAvatarBorder(profile,userId){
      var uid=String(arguments.length>1?userId:((auth.currentUser&&auth.currentUser.uid)||'')).trim();
      var border=normalizeProfileColorValue(profile&&(profile.avatarBorderColor||profile.profileAvatarBorderColor));
      if(!border&&uid)border=readProfileColorValue(uid,'avatar-border');
      var root=document.documentElement;
      root.classList.toggle('profile-avatar-global-customized',Boolean(border));
      if(border){
        root.style.setProperty('--betv-user-avatar-border',border);
        root.style.setProperty('--betv-header-avatar-border',border);
        root.style.setProperty('--betv-header-avatar-inner-border',border);
      }else{
        root.style.removeProperty('--betv-user-avatar-border');
        root.style.removeProperty('--betv-header-avatar-border');
        root.style.removeProperty('--betv-header-avatar-inner-border');
      }
    }
    function applyProfileTheme(profile){
      var theme=normalizeProfileColorValue(profile&&profile.profileColor);
      var border=normalizeProfileColorValue(profile&&(profile.avatarBorderColor||profile.profileAvatarBorderColor));
      var ownUser=auth.currentUser&&auth.currentUser.uid?String(auth.currentUser.uid):'';
      var ownContext=Boolean(ownUser&&(profile===currentProfile||(document.body.classList.contains('profile-page-active')&&isOwnProfileView())));
      if(ownContext){
        if(!theme)theme=readProfileColorValue(ownUser,'profile');
        if(!border)border=readProfileColorValue(ownUser,'avatar-border');
      }
      var rgb=profileColorRgb(theme);
      document.body.classList.toggle('profile-color-customized',Boolean(theme));
      document.body.classList.toggle('profile-avatar-border-customized',Boolean(border));
      if(theme&&rgb){
        document.body.style.setProperty('--profile-theme-color',theme);
        document.body.style.setProperty('--profile-theme-rgb',rgb.r+','+rgb.g+','+rgb.b);
        var linear=[rgb.r,rgb.g,rgb.b].map(function(value){value/=255;return value<=.04045?value/12.92:Math.pow((value+.055)/1.055,2.4);});
        var light=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722>.179;
        document.body.style.setProperty('--profile-mobile-ink',light?'#111318':'#ffffff');
        document.body.style.setProperty('--profile-mobile-muted',light?'rgba(17,19,24,.76)':'rgba(255,255,255,.78)');
        document.body.style.setProperty('--profile-mobile-line',light?'rgba(17,19,24,.18)':'rgba(255,255,255,.18)');
      }else{
        document.body.style.removeProperty('--profile-theme-color');
        document.body.style.removeProperty('--profile-theme-rgb');
        ['--profile-mobile-ink','--profile-mobile-muted','--profile-mobile-line'].forEach(function(key){document.body.style.removeProperty(key);});
      }
      if(border)document.body.style.setProperty('--profile-avatar-border',border);
      else document.body.style.removeProperty('--profile-avatar-border');
    }
    function profileColorIsPreset(value){return PROFILE_COLOR_PRESETS.indexOf(normalizeProfileColorValue(value))>=0;}
    function profileColorControlMarkup(kind,title,description,value){
      var normalized=normalizeProfileColorValue(value);
      var customSelected=Boolean(normalized&&!profileColorIsPreset(normalized));
      var swatches=PROFILE_COLOR_PRESETS.map(function(color){
        return '<button class="profile-color-swatch'+(normalized===color?' is-selected':'')+'" type="button" data-profile-color-preset="'+color+'" aria-label="'+escapePublic(color)+'" title="'+escapePublic(color)+'" style="--profile-swatch:'+color+'"></button>';
      }).join('');
      var customButton='<button class="profile-color-custom-trigger'+(customSelected?' is-selected':'')+'" type="button" data-profile-color-custom-open aria-expanded="false"><span class="profile-color-rainbow" aria-hidden="true"></span><span>'+escapePublic(localizedProfileText('Personalizado'))+'</span></button>';
      return '<section class="profile-color-control" data-profile-color-kind="'+kind+'">'
        +'<div class="profile-color-heading"><h2>'+escapePublic(title)+'</h2><p>'+escapePublic(description)+'</p></div>'
        +'<div class="profile-color-options" role="group" aria-label="'+escapePublic(title)+'">'+swatches+customButton+'</div>'
        +'<div class="profile-custom-color-panel" data-profile-custom-panel hidden>'
          +'<div class="profile-color-sv" data-profile-color-sv tabindex="0" aria-label="'+escapePublic(localizedProfileText('Selecionar tom e intensidade'))+'"><span class="profile-color-picker-dot" data-profile-color-picker-dot></span></div>'
          +'<input class="profile-color-hue" data-profile-color-hue type="range" min="0" max="360" value="0" step="1" aria-label="'+escapePublic(localizedProfileText('Matiz'))+'">'
          +'<div class="profile-color-hex-row"><input class="profile-color-hex" data-profile-color-hex type="text" inputmode="text" maxlength="7" spellcheck="false" autocomplete="off" value="'+escapePublic(normalized||'')+'" placeholder="#C61414"><span class="profile-color-live-preview" data-profile-color-live-preview aria-hidden="true"></span></div>'
          +'<div class="profile-color-panel-actions"><span class="profile-color-preview-label">'+escapePublic(localizedProfileText('PRÉVIA'))+'</span><button class="settings-button primary profile-color-save" data-profile-color-save type="button">'+escapePublic(localizedProfileText('Salvar'))+'</button><button class="profile-color-restore" data-profile-color-restore type="button">'+escapePublic(localizedProfileText('Restaurar padrão'))+'</button></div>'
        +'</div>'
      +'</section>';
    }
    function profileColorSettingsMarkup(profileColor,avatarBorderColor){
      return '<div class="settings-profile-colors">'
        +profileColorControlMarkup('profile',localizedProfileText('Cor do perfil'),localizedProfileText('Escolha uma cor para personalizar o visual do seu perfil.'),profileColor)
        +profileColorControlMarkup('avatar-border',localizedProfileText('Cor da borda de avatar'),localizedProfileText('Escolha a cor do aro exibido ao redor do seu avatar.'),avatarBorderColor)
      +'</div>';
    }
    function profileHexToHsv(hex){
      var rgb=profileColorRgb(hex)||{r:139,g:92,b:246};
      var r=rgb.r/255,g=rgb.g/255,b=rgb.b/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,h=0;
      if(d){
        if(max===r)h=60*(((g-b)/d)%6);
        else if(max===g)h=60*((b-r)/d+2);
        else h=60*((r-g)/d+4);
      }
      if(h<0)h+=360;
      return {h:h,s:max?d/max:0,v:max};
    }
    function profileHsvToHex(h,s,v){
      h=((Number(h)||0)%360+360)%360;s=Math.max(0,Math.min(1,Number(s)||0));v=Math.max(0,Math.min(1,Number(v)||0));
      var c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c,r=0,g=0,b=0;
      if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
      function part(n){return Math.round((n+m)*255).toString(16).padStart(2,'0');}
      return ('#'+part(r)+part(g)+part(b)).toUpperCase();
    }
    function persistProfileThemeColor(kind,userId,value){
      var normalized=writeProfileColorValue(userId,kind,value);
      if(auth.currentUser&&auth.currentUser.uid===userId){
        currentProfile={...(currentProfile||{})};
        if(kind==='profile')currentProfile.profileColor=normalized;
        else currentProfile.avatarBorderColor=normalized;
        if(viewedProfile&&isOwnProfileView()){
          viewedProfile={...viewedProfile};
          if(kind==='profile')viewedProfile.profileColor=normalized;
          else viewedProfile.avatarBorderColor=normalized;
        }
      }
      pendingProfileColorSync={
        userId:String(userId||''),
        profileColor:readProfileColorValue(userId,'profile'),
        profileAvatarBorderColor:readProfileColorValue(userId,'avatar-border')
      };
      applyProfileTheme(viewedProfile||currentProfile);
      if(kind==='avatar-border')applyOwnAvatarBorder(currentProfile,userId);
      scheduleCrossDeviceSync('profile-colors');
      showSettingsSaved();
      window.setTimeout(function(){
        if(document.body.classList.contains('settings-page-active')){renderSettingsPage();keepSettingsOpen();}
      },30);
    }
    function bindProfileColorSettings(user,rootOverride){
      var colorRoot=rootOverride||settingsPageBody;
      if(!colorRoot||!user||!user.uid)return;
      colorRoot.querySelectorAll('[data-profile-color-kind]').forEach(function(control){
        var kind=control.getAttribute('data-profile-color-kind')==='avatar-border'?'avatar-border':'profile';
        var customOpen=control.querySelector('[data-profile-color-custom-open]');
        var panel=control.querySelector('[data-profile-custom-panel]');
        var sv=control.querySelector('[data-profile-color-sv]');
        var dot=control.querySelector('[data-profile-color-picker-dot]');
        var hue=control.querySelector('[data-profile-color-hue]');
        var hexInput=control.querySelector('[data-profile-color-hex]');
        var live=control.querySelector('[data-profile-color-live-preview]');
        var save=control.querySelector('[data-profile-color-save]');
        var restore=control.querySelector('[data-profile-color-restore]');
        var initial=kind==='profile'
          ?normalizeProfileColorValue((currentProfile&&currentProfile.profileColor)||readProfileColorValue(user.uid,'profile'))
          :normalizeProfileColorValue((currentProfile&&currentProfile.avatarBorderColor)||readProfileColorValue(user.uid,'avatar-border'));
        var state=profileHexToHsv(initial||(kind==='profile'?'#8B5CF6':'#FFFFFF'));
        function stateHex(){return profileHsvToHex(state.h,state.s,state.v);}
        function refresh(){
          var color=stateHex();
          if(sv)sv.style.setProperty('--profile-picker-hue','hsl('+Math.round(state.h)+' 100% 50%)');
          if(dot){dot.style.left=(state.s*100)+'%';dot.style.top=((1-state.v)*100)+'%';dot.style.background=color;}
          if(hue)hue.value=String(Math.round(state.h));
          if(hexInput)hexInput.value=color;
          if(live)live.style.background=color;
        }
        function setFromHex(value){
          var normalized=normalizeProfileColorValue(value);
          if(!normalized)return false;
          state=profileHexToHsv(normalized);refresh();return true;
        }
        function markSelectedColor(value,forceCustom){
          var normalized=normalizeProfileColorValue(value);
          control.querySelectorAll('[data-profile-color-preset]').forEach(function(button){
            var buttonColor=normalizeProfileColorValue(button.getAttribute('data-profile-color-preset'));
            button.classList.toggle('is-selected',Boolean(normalized&&!forceCustom&&buttonColor===normalized));
          });
          if(customOpen){
            var customSelected=Boolean(normalized&&(forceCustom||!profileColorIsPreset(normalized)));
            customOpen.classList.toggle('is-selected',customSelected);
          }
        }
        function markCustomDirty(){
          control.dataset.profileCustomDirty='true';
          markSelectedColor(stateHex(),true);
        }
        function setSV(event){
          if(!sv)return;
          var rect=sv.getBoundingClientRect();
          var x=Math.max(0,Math.min(rect.width,(event.clientX||0)-rect.left));
          var y=Math.max(0,Math.min(rect.height,(event.clientY||0)-rect.top));
          state.s=rect.width?x/rect.width:0;
          state.v=rect.height?1-y/rect.height:1;
          refresh();
          markCustomDirty();
        }
        control.querySelectorAll('[data-profile-color-preset]').forEach(function(button){
          button.onclick=function(){
            var color=normalizeProfileColorValue(button.getAttribute('data-profile-color-preset'));
            if(color){control.dataset.profileCustomDirty='false';setFromHex(color);markSelectedColor(color,false);persistProfileThemeColor(kind,user.uid,color);}
          };
        });
        if(customOpen)customOpen.onclick=function(){
          if(!panel)return;
          var opening=panel.hidden;
          panel.hidden=!opening;
          customOpen.setAttribute('aria-expanded',opening?'true':'false');
          if(opening){
            var current=kind==='profile'
              ?normalizeProfileColorValue((currentProfile&&currentProfile.profileColor)||readProfileColorValue(user.uid,'profile'))
              :normalizeProfileColorValue((currentProfile&&currentProfile.avatarBorderColor)||readProfileColorValue(user.uid,'avatar-border'));
            setFromHex(current||(kind==='profile'?'#8B5CF6':'#FFFFFF'));refresh();
          }
        };
        if(hue)hue.oninput=function(){state.h=Number(hue.value)||0;refresh();markCustomDirty();};
        if(hexInput){
          hexInput.oninput=function(){var value=String(hexInput.value||'').trim();if(/^#[0-9a-fA-F]{6}$/.test(value)){setFromHex(value);markCustomDirty();}};
          hexInput.onblur=function(){if(!setFromHex(hexInput.value))refresh();};
        }
        if(sv){
          sv.addEventListener('pointerdown',function(event){
            event.preventDefault();sv.setPointerCapture&&sv.setPointerCapture(event.pointerId);setSV(event);
            function move(moveEvent){setSV(moveEvent);}
            function up(upEvent){try{sv.releasePointerCapture&&sv.releasePointerCapture(upEvent.pointerId);}catch(_){ }sv.removeEventListener('pointermove',move);sv.removeEventListener('pointerup',up);sv.removeEventListener('pointercancel',up);}
            sv.addEventListener('pointermove',move);sv.addEventListener('pointerup',up);sv.addEventListener('pointercancel',up);
          });
          sv.addEventListener('keydown',function(event){
            var step=event.shiftKey?0.05:0.01,handled=true;
            if(event.key==='ArrowLeft')state.s=Math.max(0,state.s-step);
            else if(event.key==='ArrowRight')state.s=Math.min(1,state.s+step);
            else if(event.key==='ArrowUp')state.v=Math.min(1,state.v+step);
            else if(event.key==='ArrowDown')state.v=Math.max(0,state.v-step);
            else handled=false;
            if(handled){event.preventDefault();refresh();}
          });
        }
        if(save)save.onclick=function(){
          var color=stateHex();
          control.dataset.profileCustomDirty='false';
          markSelectedColor(color,true);
          persistProfileThemeColor(kind,user.uid,color);
        };
        if(restore)restore.onclick=function(){control.dataset.profileCustomDirty='false';markSelectedColor('',false);persistProfileThemeColor(kind,user.uid,'');};
        refresh();
      });
    }
    function uniqueSyncStrings(values,limit){var result=[];(Array.isArray(values)?values:[]).forEach(function(value){var normalized=String(value||'').trim();if(normalized&&result.indexOf(normalized)<0)result.push(normalized);});return typeof limit==='number'?result.slice(0,limit):result;}
    function accountDeviceId(){
      var key='beAccountDeviceId',value='';
      try{value=String(localStorage.getItem(key)||'');}catch(_){ }
      if(value)return value;
      try{value=window.crypto&&typeof window.crypto.randomUUID==='function'?window.crypto.randomUUID():('device-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12));}catch(_){value='device-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);}
      try{localStorage.setItem(key,value);}catch(_){ }
      return value;
    }
    function accountDeviceType(){
      var ua=String(navigator.userAgent||'');
      var mobile=Boolean(navigator.userAgentData&&navigator.userAgentData.mobile)||/Android|iPhone|iPad|iPod|Mobile/i.test(ua);
      return mobile?'mobile':'pc';
    }
    function genericMobileModel(value){
      var name=String(value||'').trim();
      return !name||name.length<2||/^(?:k|android|mobile|phone|smartphone|unknown|generic|linux|wv)$/i.test(name);
    }
    function mobileDeviceBrandName(model,ua){
      var raw=String(model||'').replace(/\s+/g,' ').trim(),source=(raw+' '+String(ua||'')).trim();
      if(genericMobileModel(raw))raw='';
      if(/iPhone/i.test(source))return 'iPhone';
      if(/iPad/i.test(source))return 'iPad';
      var rules=[
        [/Samsung|\bSM-[A-Z0-9-]+\b|\bGT-[A-Z0-9-]+\b|\bSCH-[A-Z0-9-]+\b|\bSGH-[A-Z0-9-]+\b/i,'Samsung'],
        [/\bPixel(?:\s|$)/i,'Google'],
        [/Motorola|\bmoto(?:\s|$)|\bXT\d{3,5}\b/i,'Motorola'],
        [/Xiaomi|Redmi|POCO/i,'Xiaomi'],
        [/OnePlus/i,'OnePlus'],
        [/OPPO/i,'OPPO'],
        [/\bRMX\d+\b|realme/i,'realme'],
        [/HUAWEI/i,'Huawei'],
        [/HONOR/i,'Honor'],
        [/\bVIVO\b|iQOO/i,'vivo'],
        [/ASUS|ROG Phone/i,'ASUS'],
        [/Sony|Xperia/i,'Sony'],
        [/Nokia|HMD Global/i,'Nokia'],
        [/\bLG[- ]|LG Electronics/i,'LG'],
        [/\bTCL\b/i,'TCL'],
        [/\bZTE\b|nubia/i,'ZTE'],
        [/TECNO/i,'TECNO'],
        [/Infinix/i,'Infinix'],
        [/Nothing Phone|\bA0\d{2}\b/i,'Nothing'],
        [/Lenovo/i,'Lenovo'],
        [/Meizu/i,'Meizu']
      ];
      for(var i=0;i<rules.length;i+=1){
        if(!rules[i][0].test(source))continue;
        var brand=rules[i][1];
        if(!raw||genericMobileModel(raw))return brand;
        if(raw.toLowerCase().indexOf(brand.toLowerCase())===0)return raw.slice(0,80);
        if(brand==='Google'&&/^Pixel/i.test(raw))return ('Google '+raw).slice(0,80);
        if(brand==='Xiaomi'&&/^(?:Redmi|POCO|Xiaomi)/i.test(raw))return raw.slice(0,80);
        if(brand==='Motorola'&&/^moto/i.test(raw))return ('Motorola '+raw).slice(0,80);
        return (brand+' '+raw).slice(0,80);
      }
      return 'Celular';
    }
    function accountDeviceName(modelOverride){
      var ua=String(navigator.userAgent||''),platform=String((navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||'');
      if(/iPhone/i.test(ua))return 'iPhone';
      if(/iPad/i.test(ua)||/Mac/i.test(platform)&&navigator.maxTouchPoints>1)return 'iPad';
      if(accountDeviceType()==='mobile'){
        var stored='';try{stored=String(localStorage.getItem('beAccountDeviceResolvedName')||'').trim();}catch(_){ }
        if(stored&&!genericMobileModel(stored))return stored;
        var model=String(modelOverride||'').trim();
        if(!model&&/Android/i.test(ua)){
          var match=ua.match(/Android[^;]*;\s*([^;)]+?)(?:\s+Build\/|;|\))/i);
          model=match&&String(match[1]||'').trim()||'';
        }
        return mobileDeviceBrandName(model,ua);
      }
      if(/Windows/i.test(ua)||/Win/i.test(platform))return 'Windows PC';
      if(/Mac/i.test(ua)||/Mac/i.test(platform))return 'Mac';
      if(/Linux/i.test(ua)||/Linux/i.test(platform))return 'Linux PC';
      return 'Computador';
    }
    async function refreshAccountDeviceIdentity(userId){
      if(accountDeviceType()!=='mobile')return accountDeviceName();
      var resolved=accountDeviceName();
      try{
        var uaData=navigator.userAgentData;
        if(uaData&&typeof uaData.getHighEntropyValues==='function'){
          var details=await uaData.getHighEntropyValues(['model']);
          var model=String(details&&details.model||'').trim();
          if(model&&!genericMobileModel(model))resolved=mobileDeviceBrandName(model,navigator.userAgent||'');
        }
      }catch(_){ }
      if(!resolved||genericMobileModel(resolved))resolved='Celular';
      try{localStorage.setItem('beAccountDeviceResolvedName',resolved);}catch(_){ }
      if(userId){
        var devices=readAccountDevices(userId),id=accountDeviceId(),changed=false;
        devices=devices.map(function(item){if(item.id!==id)return item;if(item.name!==resolved){changed=true;return {...item,name:resolved};}return item;});
        if(changed){writeAccountDevices(userId,devices);if(typeof window.beScheduleUserDataSync==='function')window.beScheduleUserDataSync('device-identity');}
      }
      return resolved;
    }
    function normalizeAccountDevices(values){
      var byId={};
      (Array.isArray(values)?values:[]).forEach(function(item){
        if(!item||typeof item!=='object')return;
        var id=String(item.id||'').trim();if(!id)return;
        var normalized={id:id,type:String(item.type||'pc')==='mobile'?'mobile':'pc',name:String(item.name||'').trim().slice(0,80),active:item.active!==false,lastSeen:String(item.lastSeen||''),disconnectedAt:String(item.disconnectedAt||'')};
        if(normalized.type==='mobile'&&(genericMobileModel(normalized.name)||/^(?:dispositivo móvel|mobile device|dispositivo mobile|appareil mobile)$/i.test(normalized.name)))normalized.name='Celular';
        var current=byId[id];
        var nextTime=Math.max(Date.parse(normalized.lastSeen||'')||0,Date.parse(normalized.disconnectedAt||'')||0);
        var currentTime=current?Math.max(Date.parse(current.lastSeen||'')||0,Date.parse(current.disconnectedAt||'')||0):0;
        if(!current||nextTime>=currentTime)byId[id]=normalized;
      });
      return Object.keys(byId).map(function(id){return byId[id];}).filter(function(item){
        var stamp=Math.max(Date.parse(item.lastSeen||'')||0,Date.parse(item.disconnectedAt||'')||0);
        return !stamp||Date.now()-stamp<90*24*60*60*1000;
      }).slice(0,18);
    }
    function mergeAccountDevices(a,b){return normalizeAccountDevices((Array.isArray(a)?a:[]).concat(Array.isArray(b)?b:[]));}
    function accountDevicesStorageKey(userId){return 'beAccountDevices:'+String(userId||'guest');}
    function readAccountDevices(userId){return normalizeAccountDevices(readStorageJson(accountDevicesStorageKey(userId),[]));}
    function writeAccountDevices(userId,devices){var normalized=normalizeAccountDevices(devices);try{localStorage.setItem(accountDevicesStorageKey(userId),JSON.stringify(normalized));}catch(_){ }return normalized;}
    function currentAccountDeviceRecord(active){return {id:accountDeviceId(),type:accountDeviceType(),name:accountDeviceName(),active:active!==false,lastSeen:beBackend.now(),disconnectedAt:active===false?beBackend.now():''};}
    function ensureCurrentAccountDevice(userId,devices){
      var id=accountDeviceId(),values=normalizeAccountDevices(devices).filter(function(item){return item.id!==id;});
      values.unshift(currentAccountDeviceRecord(true));
      return writeAccountDevices(userId,values);
    }
    function normalizeTvDeviceBrands(value){
      var source=value&&typeof value==='object'&&!Array.isArray(value)?value:{},out={};
      Object.keys(source).slice(0,16).forEach(function(id){var entry=source[id];if(!entry)return;var name=typeof entry==='string'?entry:String(entry.name||'');var updatedAt=typeof entry==='object'?String(entry.updatedAt||''):'';if(name.trim())out[String(id)]={name:name.trim().slice(0,80),updatedAt:updatedAt};});
      return out;
    }
    function mergeTvDeviceBrands(a,b){var out=normalizeTvDeviceBrands(a),next=normalizeTvDeviceBrands(b);Object.keys(next).forEach(function(id){var oldTime=Date.parse(out[id]&&out[id].updatedAt||'')||0,newTime=Date.parse(next[id].updatedAt||'')||0;if(!out[id]||newTime>=oldTime)out[id]=next[id];});return out;}
    function tvDeviceBrandsStorageKey(userId){return 'beTvKnownBrands:'+String(userId||'guest');}
    function readTvDeviceBrands(userId){return normalizeTvDeviceBrands(readStorageJson(tvDeviceBrandsStorageKey(userId),{}));}
    function writeTvDeviceBrands(userId,value){var normalized=normalizeTvDeviceBrands(value);try{localStorage.setItem(tvDeviceBrandsStorageKey(userId),JSON.stringify(normalized));}catch(_){ }return normalized;}
    function syncRecordIdentity(item){return String((item&&item.favoriteId)||(item&&item.itemId)||((item&&item.collection&&item.recordId)?item.collection+':'+item.recordId:'')||(item&&item.title)||'').trim();}
    function normalizeFollowingUsernames(value){var list=Array.isArray(value)?value:[];var result=[];var seen={};list.forEach(function(item){var username=beBackend.normalizeUsername(item);if(!beBackend.validUsername(username)||seen[username])return;seen[username]=true;result.push(username);});return result.slice(0,500);}
    function uniqueSyncRecords(values,limit){var result=[];(Array.isArray(values)?values:[]).forEach(function(item){if(!item||typeof item!=='object')return;var identity=syncRecordIdentity(item);if(!identity||result.some(function(current){return syncRecordIdentity(current)===identity;}))return;result.push({...item});});return typeof limit==='number'?result.slice(0,limit):result;}
    function normalizeCrossDeviceData(value){
      var source=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
      return {
        version:1,
        detailFavorites:uniqueSyncStrings(source.detailFavorites),
        featuredFavorites:uniqueSyncStrings(source.featuredFavorites),
        savedContents:uniqueSyncRecords(source.savedContents,20),
        profileTopFavorites:uniqueSyncRecords(source.profileTopFavorites,4),
        profileLovedAlbums:uniqueSyncRecords(source.profileLovedAlbums,4),
        profileSocialLinks:normalizeProfileSocialLinks(source.profileSocialLinks),
        profileColor:normalizeProfileColorValue(source.profileColor),
        profileAvatarBorderColor:normalizeProfileColorValue(source.profileAvatarBorderColor),
        profileShareCampaignSeen:String(source.profileShareCampaignSeen||'').slice(0,120),
        communityRankingsPublic:Object.prototype.hasOwnProperty.call(source,'communityRankingsPublic')?(source.communityRankingsPublic!==false&&String(source.communityRankingsPublic).toLowerCase()!=='false'):null,
        followingUsers:normalizeFollowingUsernames(source.followingUsers),
        accountDevices:normalizeAccountDevices(source.accountDevices),
        tvDeviceBrands:normalizeTvDeviceBrands(source.tvDeviceBrands),
        updatedAt:String(source.updatedAt||'')
      };
    }
    function captureCrossDeviceData(userId){
      return normalizeCrossDeviceData({
        detailFavorites:readStorageJson('beDetailFavorites',[]),
        featuredFavorites:readStorageJson('beFeaturedFavorites',[]),
        savedContents:readStorageJson('beSavedContents',[]),
        profileTopFavorites:readStorageJson('beProfileTopFavorites:'+String(userId||'guest'),[]),
        profileLovedAlbums:readStorageJson('beProfileLovedAlbums:'+String(userId||'guest'),[]),
        profileSocialLinks:readProfileSocialLinks(userId),
        profileColor:readProfileColorValue(userId,'profile'),
        profileAvatarBorderColor:readProfileColorValue(userId,'avatar-border'),
        profileShareCampaignSeen:(function(){try{return String(localStorage.getItem('beProfileShareCampaignSeen:'+String(userId||'guest'))||'');}catch(_){return '';}})(),
        communityRankingsPublic:(function(){try{return localStorage.getItem('beCommunityRankingsPublic:'+String(userId||'guest'))!=='false';}catch(_){return true;}})(),
        followingUsers:readStorageJson('beFollowingUsers:'+String(userId||'guest'),[]),
        accountDevices:ensureCurrentAccountDevice(userId,readAccountDevices(userId)),
        tvDeviceBrands:readTvDeviceBrands(userId),
        updatedAt:beBackend.now()
      });
    }
    function mergeInitialCrossDeviceData(remoteData,localData){
      var remoteSource=remoteData&&typeof remoteData==='object'&&!Array.isArray(remoteData)?remoteData:{};
      var remote=normalizeCrossDeviceData(remoteSource),local=normalizeCrossDeviceData(localData);
      var remoteHasProfileColor=Object.prototype.hasOwnProperty.call(remoteSource,'profileColor');
      var remoteHasAvatarBorder=Object.prototype.hasOwnProperty.call(remoteSource,'profileAvatarBorderColor');
      return normalizeCrossDeviceData({
        detailFavorites:remote.detailFavorites.concat(local.detailFavorites),
        featuredFavorites:remote.featuredFavorites.concat(local.featuredFavorites),
        savedContents:remote.savedContents.concat(local.savedContents),
        profileTopFavorites:remote.profileTopFavorites.concat(local.profileTopFavorites),
        profileLovedAlbums:remote.profileLovedAlbums.concat(local.profileLovedAlbums),
        profileSocialLinks:hasProfileSocialLinks(remote.profileSocialLinks)?remote.profileSocialLinks:local.profileSocialLinks,
        profileColor:remoteHasProfileColor?remote.profileColor:local.profileColor,
        profileAvatarBorderColor:remoteHasAvatarBorder?remote.profileAvatarBorderColor:local.profileAvatarBorderColor,
        profileShareCampaignSeen:remote.profileShareCampaignSeen||local.profileShareCampaignSeen,
        communityRankingsPublic:remote.communityRankingsPublic===null?local.communityRankingsPublic:remote.communityRankingsPublic!==false,
        followingUsers:(remote.followingUsers||[]).concat(local.followingUsers||[]),
        accountDevices:mergeAccountDevices(remote.accountDevices,local.accountDevices),
        tvDeviceBrands:mergeTvDeviceBrands(remote.tvDeviceBrands,local.tvDeviceBrands),
        updatedAt:beBackend.now()
      });
    }
    function localCrossDeviceSeed(userId){
      var cached=readStorageJson(syncedUserCacheKey(userId),null);
      if(cached&&typeof cached==='object')return normalizeCrossDeviceData(cached.data||cached);
      var owner='';try{owner=String(localStorage.getItem('beSyncedDataOwner')||'');}catch(_){ }
      if(!owner||owner===String(userId||''))return captureCrossDeviceData(userId);
      return normalizeCrossDeviceData({});
    }
    function updateSettingsSyncStatus(){
      var box=document.getElementById('settingsDeviceSync');
      var message=document.getElementById('settingsDeviceSyncMessage');
      if(!box||!message)return;
      box.classList.remove('is-idle','is-syncing','is-active','is-error');
      box.classList.add('is-'+settingsSyncState);
      message.textContent=settingsSyncMessage;
    }
    function setSettingsSyncStatus(state,message){settingsSyncState=state||'idle';settingsSyncMessage=String(message||'');updateSettingsSyncStatus();}
    function settingsSyncMarkup(){
      var state=['idle','syncing','active','error'].indexOf(settingsSyncState)>=0?settingsSyncState:'idle';
      return '<div class="settings-device-sync is-'+state+'" id="settingsDeviceSync" role="status"><span class="settings-device-sync-dot" aria-hidden="true"></span><span><strong>Sincronização entre dispositivos</strong><small id="settingsDeviceSyncMessage">'+escapePublic(settingsSyncMessage)+'</small></span></div>';
    }
    function applyCrossDeviceData(value,userId,source){
      if(!userId)return;
      var data=normalizeCrossDeviceData(value);
      try{if(!data.profileShareCampaignSeen)data.profileShareCampaignSeen=String(localStorage.getItem('beProfileShareCampaignSeen:'+String(userId))||'');}catch(_){ }
      if(pendingProfileColorSync&&pendingProfileColorSync.userId===String(userId)){
        var remoteMatchesPending=data.profileColor===pendingProfileColorSync.profileColor&&data.profileAvatarBorderColor===pendingProfileColorSync.profileAvatarBorderColor;
        if(remoteMatchesPending){
          pendingProfileColorSync=null;
        }else{
          data.profileColor=pendingProfileColorSync.profileColor;
          data.profileAvatarBorderColor=pendingProfileColorSync.profileAvatarBorderColor;
        }
      }
      applyingRemotePreferences=true;
      try{
        localStorage.setItem('beDetailFavorites',JSON.stringify(data.detailFavorites));
        localStorage.setItem('beFeaturedFavorites',JSON.stringify(data.featuredFavorites));
        localStorage.setItem('beSavedContents',JSON.stringify(data.savedContents));
        localStorage.setItem('beProfileTopFavorites:'+userId,JSON.stringify(data.profileTopFavorites));
        localStorage.setItem('beProfileLovedAlbums:'+userId,JSON.stringify(data.profileLovedAlbums));
        localStorage.setItem(profileSocialStorageKey(userId),JSON.stringify(data.profileSocialLinks));
        writeAccountDevices(userId,data.accountDevices);
        writeTvDeviceBrands(userId,data.tvDeviceBrands);
        if(data.profileColor)localStorage.setItem(profileColorStorageKey(userId,'profile'),data.profileColor);else localStorage.removeItem(profileColorStorageKey(userId,'profile'));
        if(data.profileAvatarBorderColor)localStorage.setItem(profileColorStorageKey(userId,'avatar-border'),data.profileAvatarBorderColor);else localStorage.removeItem(profileColorStorageKey(userId,'avatar-border'));
        if(data.profileShareCampaignSeen)localStorage.setItem('beProfileShareCampaignSeen:'+String(userId),data.profileShareCampaignSeen);else localStorage.removeItem('beProfileShareCampaignSeen:'+String(userId));
        localStorage.setItem('beCommunityRankingsPublic:'+String(userId),data.communityRankingsPublic===false?'false':'true');
        localStorage.setItem('beFollowingUsers:'+String(userId),JSON.stringify(data.followingUsers||[]));
        localStorage.setItem(syncedUserCacheKey(userId),JSON.stringify({data:data,updatedAt:data.updatedAt||beBackend.now()}));
        localStorage.setItem('beSyncedDataOwner',String(userId));
      }catch(error){(void 0);}
      applyingRemotePreferences=false;
      var ownDevice=data.accountDevices.find(function(item){return item.id===accountDeviceId();});
      if(source==='remote'&&ownDevice&&ownDevice.active===false&&auth.currentUser&&auth.currentUser.uid===userId){
        window.setTimeout(function(){
          if(!auth.currentUser||auth.currentUser.uid!==userId)return;
          try{localStorage.setItem('beRemoteDeviceDisconnect','1');}catch(_){ }
          Promise.resolve(auth.signOut()).catch(function(){}).finally(function(){try{localStorage.removeItem('beRemoteDeviceDisconnect');}catch(_){ }showLogin();setMode('email');});
        },80);
      }
      profileFavoritesItems=data.profileTopFavorites.slice(0,4);
      profileLovedAlbumsItems=data.profileLovedAlbums.slice(0,4);
      if(auth.currentUser&&auth.currentUser.uid===userId){
        currentProfile={...(currentProfile||{}),socialLinks:data.profileSocialLinks,profileColor:data.profileColor,avatarBorderColor:data.profileAvatarBorderColor};
        applyOwnAvatarBorder(currentProfile,userId);
        if(viewedProfile&&isOwnProfileView())viewedProfile={...viewedProfile,socialLinks:data.profileSocialLinks,profileColor:data.profileColor,avatarBorderColor:data.profileAvatarBorderColor};
      }
      try{window.dispatchEvent(new CustomEvent('be:user-data-synced',{detail:{userId:userId,source:source||'remote',data:data}}));}catch(_){ }
      try{window.dispatchEvent(new CustomEvent('be:favorites-changed',{detail:{synced:true}}));}catch(_){ }
      try{window.dispatchEvent(new CustomEvent('be:profile-favorites-changed',{detail:{items:profileFavoritesItems,synced:true}}));}catch(_){ }
      try{window.dispatchEvent(new CustomEvent('be:profile-loved-albums-changed',{detail:{items:profileLovedAlbumsItems,synced:true}}));}catch(_){ }
      if(document.body.classList.contains('profile-page-active')){applyProfileTheme(viewedProfile||currentProfile);renderProfileSocials(viewedProfile||currentProfile);renderProfileFavorites();renderProfileLovedAlbums();renderProfileSaved();renderProfileFollowUi();}
      if(document.body.classList.contains('settings-page-active')){window.setTimeout(function(){renderSettingsPage();keepSettingsOpen();},0);}
    }
    async function persistCrossDeviceData(reason){
      var user=auth.currentUser;
      if(!user||!user.uid||applyingRemotePreferences||!beBackend.preferences)return;
      var userId=user.uid;
      var payload=captureCrossDeviceData(userId);
      try{localStorage.setItem(syncedUserCacheKey(userId),JSON.stringify({data:payload,updatedAt:payload.updatedAt}));localStorage.setItem('beSyncedDataOwner',String(userId));}catch(_){ }
      setSettingsSyncStatus('syncing','Salvando alterações do '+((reason==='profile-favorites'||reason==='profile-albums'||reason==='profile-socials'||reason==='profile-colors')?'perfil':'aparelho')+'…');
      try{
        var saved=await beBackend.preferences.save(userId,payload);
        if(auth.currentUser&&auth.currentUser.uid===userId){
          setSettingsSyncStatus('active','Sincronizado entre celular e computador.');
        }
      }catch(error){
        (void 0);
        setSettingsSyncStatus('error','Alterações mantidas neste aparelho. A sincronização será tentada novamente.');
      }
    }
    function scheduleCrossDeviceSync(reason){
      if(applyingRemotePreferences||!auth.currentUser||!auth.currentUser.uid)return;
      clearTimeout(preferenceSyncTimer);
      preferenceSyncTimer=setTimeout(function(){persistCrossDeviceData(reason||'configuração');},900);
    }
    window.beScheduleUserDataSync=scheduleCrossDeviceSync;
    function stopCrossDeviceSync(){
      clearTimeout(preferenceSyncTimer);preferenceSyncTimer=0;
      if(profileDeviceSyncStop){try{profileDeviceSyncStop();}catch(_){ }profileDeviceSyncStop=null;}
      if(preferenceDeviceSyncStop){try{preferenceDeviceSyncStop();}catch(_){ }preferenceDeviceSyncStop=null;}
      preferenceSyncUserId='';preferenceSyncStarting=false;
    }
    function applyRemoteProfile(profile,userId){
      if(!profile||!auth.currentUser||auth.currentUser.uid!==userId)return;
      var rememberedAvatar=selectedProfileAvatar(currentProfile)||selectedAvatar||localStorage.getItem('beSelectedAvatar:'+userId)||'';
      currentProfile={...(currentProfile||{}),...profile};
      if(!selectedProfileAvatar(currentProfile)&&rememberedAvatar){
        currentProfile.avatarUrl=rememberedAvatar;
        currentProfile.avatarId=currentProfile.avatarId||(profile&&profile.avatarId)||'saved-selection';
      }
      selectedAvatar=selectedProfileAvatar(currentProfile);
      try{
        localStorage.setItem('beSelectedAvatar:'+userId,selectedAvatar||'');
        localStorage.setItem('beProfileBanner:'+userId,JSON.stringify({bannerUrl:String(currentProfile.bannerUrl||''),bannerId:String(currentProfile.bannerId||''),updatedAt:currentProfile.updatedAt||beBackend.now()}));
      }catch(_){ }
      setLiteralText(username,currentProfile.username?'@'+currentProfile.username:(currentProfile.displayName||auth.currentUser.displayName||'Usuário'));
      setMainAvatar(selectedAvatar);renderProfilePage();
      if(document.body.classList.contains('settings-page-active')||isConfigRoute()){renderSettingsPage();keepSettingsOpen();}
      try{window.dispatchEvent(new CustomEvent('be:profile-device-synced',{detail:{userId:userId,profile:currentProfile}}));}catch(_){ }
    }
    async function startCrossDeviceSync(user){
      if(!user||!user.uid||!beBackend.preferences)return;
      if(preferenceSyncUserId===user.uid&&(preferenceSyncStarting||preferenceDeviceSyncStop))return;
      stopCrossDeviceSync();
      var userId=user.uid;preferenceSyncUserId=userId;preferenceSyncStarting=true;
      refreshAccountDeviceIdentity(userId).catch(function(){});
      setSettingsSyncStatus('syncing','Carregando as configurações da sua conta…');
      try{
        var cachedSeed=readStorageJson(syncedUserCacheKey(userId),null);
        var localSeed=cachedSeed&&typeof cachedSeed==='object'?normalizeCrossDeviceData(cachedSeed.data||cachedSeed):localCrossDeviceSeed(userId);
        var remote=await beBackend.preferences.get(userId);
        if(!auth.currentUser||auth.currentUser.uid!==userId)return;
        var merged=localSeed;
        if(remote){
          var remoteData=normalizeCrossDeviceData(remote.data);
          if(cachedSeed&&typeof cachedSeed==='object'){
            var remoteTime=Date.parse(remoteData.updatedAt||remote.updatedAt||'')||0;
            var localTime=Date.parse(localSeed.updatedAt||cachedSeed.updatedAt||'')||0;
            if(remoteTime&&localTime)merged=remoteTime>=localTime?remoteData:localSeed;
            else if(remoteTime)merged=remoteData;
            else if(!localTime)merged=mergeInitialCrossDeviceData(remote.data,localSeed);
          }else{
            merged=remoteData;
          }
        }
        var remoteDeviceData=remote?normalizeCrossDeviceData(remote.data):normalizeCrossDeviceData({});
        var remoteOwnDevice=remoteDeviceData.accountDevices.find(function(item){return item.id===accountDeviceId();});
        var freshAccountLogin=false;try{freshAccountLogin=sessionStorage.getItem('beFreshAccountLogin')==='1';if(freshAccountLogin)sessionStorage.removeItem('beFreshAccountLogin');}catch(_){ }
        if(remote&&remoteOwnDevice&&remoteOwnDevice.active===false&&!freshAccountLogin){applyCrossDeviceData(remote.data,userId,'remote');return;}
        merged.accountDevices=ensureCurrentAccountDevice(userId,mergeAccountDevices(merged.accountDevices,remoteDeviceData.accountDevices));
        merged.tvDeviceBrands=mergeTvDeviceBrands(merged.tvDeviceBrands,remoteDeviceData.tvDeviceBrands);
        applyCrossDeviceData(merged,userId,remote?'remote':'local');
        var saved=await beBackend.preferences.save(userId,{...merged,updatedAt:beBackend.now()});
        if(!auth.currentUser||auth.currentUser.uid!==userId)return;
        preferenceDeviceSyncStop=beBackend.preferences.subscribe(userId,function(record){
          if(!record||!auth.currentUser||auth.currentUser.uid!==userId)return;
          applyCrossDeviceData(record.data,userId,'remote');
          setSettingsSyncStatus('active','Atualizado em todos os dispositivos.');
        });
        if(beBackend.profiles&&typeof beBackend.profiles.subscribe==='function')profileDeviceSyncStop=beBackend.profiles.subscribe(userId,function(profile){applyRemoteProfile(profile,userId);});
        setSettingsSyncStatus('active','Sincronizado entre celular e computador.');
      }catch(error){
        (void 0);
        setSettingsSyncStatus('error','Os dados continuam salvos neste aparelho; verifique a conexão para sincronizar.');
      }finally{preferenceSyncStarting=false;}
    }
    function closeOnboarding(force){if(!force&&auth.currentUser&&!String(currentProfile.username||'').trim())return;profileOnboarding.hidden=true;document.body.classList.remove('profile-onboarding-active');profileOnboarding.setAttribute('aria-hidden','true');syncBodyScroll();}

    function setupAvatarRails(){
      avatarPickerBody.querySelectorAll('.avatar-category').forEach(function(section){
        var rail=section.querySelector('.avatar-options');
        var prev=section.querySelector('.avatar-rail-arrow.prev');
        var next=section.querySelector('.avatar-rail-arrow.next');
        if(!rail||!prev||!next)return;
        function amount(){return Math.max(rail.clientWidth*.78,320);}
        function update(){var max=rail.scrollWidth-rail.clientWidth;prev.hidden=rail.scrollLeft<=4;next.hidden=max<=4||rail.scrollLeft>=max-4;}
        prev.addEventListener('click',function(){rail.scrollBy({left:-amount(),behavior:'smooth'});});
        next.addEventListener('click',function(){rail.scrollBy({left:amount(),behavior:'smooth'});});
        rail.addEventListener('scroll',update,{passive:true});
        requestAnimationFrame(update);
      });
    }

    function avatarCategoryTitle(category){
      return String(category||'Outros').trim()||'Outros';
    }

    async function loadPickerGallery(){
      if(Array.isArray(pickerGalleryCache))return pickerGalleryCache;
      if(!pickerGalleryPromise){
        pickerGalleryPromise=beBackend.data.list('gallery',{orderBy:'order',direction:'asc'}).then(function(items){
          pickerGalleryCache=(Array.isArray(items)?items:[]).filter(function(item){return item&&item.active!==false&&item.imageUrl;});
          return pickerGalleryCache;
        }).finally(function(){pickerGalleryPromise=null;});
      }
      return pickerGalleryPromise;
    }

    function activatePickerImages(root,kind){
      if(!root)return;
      var images=Array.from(root.querySelectorAll('img[data-picker-src]'));
      if(!images.length)return;
      var hydrate=function(image){
        var src=image.dataset.pickerSrc||'';
        if(!src)return;
        image.src=src;
        image.removeAttribute('data-picker-src');
      };
      if(!('IntersectionObserver' in window)){images.forEach(hydrate);return;}
      if(kind==='avatar'&&avatarImageObserver)avatarImageObserver.disconnect();
      if(kind==='banner'&&bannerImageObserver)bannerImageObserver.disconnect();
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){if(!entry.isIntersecting)return;hydrate(entry.target);observer.unobserve(entry.target);});
      },{root:root,rootMargin:'260px 220px',threshold:.01});
      images.forEach(function(image){observer.observe(image);});
      if(kind==='avatar')avatarImageObserver=observer;else bannerImageObserver=observer;
    }

    function syncAvatarPickerSelection(){
      var current=selectedAvatar||selectedProfileAvatar(currentProfile)||'';
      avatarPickerBody.querySelectorAll('.avatar-option').forEach(function(option){option.classList.toggle('selected',option.dataset.avatarUrl===current);});
    }

    function bindAvatarPickerSelection(){
      if(avatarPickerBody.dataset.selectionBound==='true')return;
      avatarPickerBody.dataset.selectionBound='true';
      avatarPickerBody.addEventListener('click',async function(event){
        var button=event.target.closest('[data-avatar-url]');
        if(!button||!avatarPickerBody.contains(button)||button.disabled)return;
        var url=button.dataset.avatarUrl||'';
        var returnView=avatarPickerReturnView;
        button.disabled=true;
        try{
          if(auth.currentUser){
            var savedProfile=await beBackend.profiles.setAvatar(auth.currentUser.uid,url,button.dataset.avatarId);
            if(savedProfile)currentProfile=savedProfile;
          }else{currentProfile.avatarUrl=url;}
          selectedAvatar=(currentProfile&&currentProfile.avatarUrl)||url;
          setMainAvatar(selectedAvatar);
          localStorage.setItem(avatarCacheKey(auth.currentUser),selectedAvatar);
          syncAvatarPickerSelection();
          if(returnView==='profile'&&document.body.classList.contains('profile-page-active')){
            viewedProfile={...(viewedProfile||{}),...(currentProfile||{}),avatarUrl:selectedAvatar};
            viewedProfileStatus='ready';
            renderProfilePage();
          }
          if(returnView==='settings'){renderSettingsPage();keepSettingsOpen();showSettingsSaved();}
          setTimeout(closeAvatarPicker,120);
        }catch(error){
          button.disabled=false;
          (void 0);
          alert('Não foi possível salvar o avatar. Tente novamente.');
        }
      });
    }

    async function openAvatarPicker(){
      avatarPickerReturnView=document.body.classList.contains('settings-page-active')||isConfigRoute()?'settings':(document.body.classList.contains('profile-page-active')?'profile':'');
      toggleDropdown(false);document.body.classList.add('avatar-picker-active');avatarPicker.hidden=false;syncBodyScroll();pushPickerHistory('avatar-picker');
      bindAvatarPickerSelection();
      if(avatarGalleryRendered){
        syncAvatarPickerSelection();
        activatePickerImages(avatarPickerBody,'avatar');
        return;
      }
      avatarPickerBody.innerHTML='<div class="avatar-picker-empty">Carregando avatares…</div>';
      try{
        var items=(await loadPickerGallery()).filter(function(item){var type=String(item.itemType||'').toLowerCase();return type!=='banner'&&!/banner/i.test(String(item.category||''));});
        if(!items.length){avatarPickerBody.innerHTML='<div class="avatar-picker-empty">Nenhum avatar disponível no momento.</div>';return;}
        var groups={};
        items.forEach(function(item){var cat=(item.category||'Outros').trim()||'Outros';(groups[cat]||(groups[cat]=[])).push(item);});
        avatarPickerBody.innerHTML='<div class="avatar-category-columns">'+Object.keys(groups).map(function(cat){
          return '<section class="avatar-category"><h3>'+escapePublic(avatarCategoryTitle(cat))+'</h3><div class="avatar-rail-shell"><button class="avatar-rail-arrow prev" type="button" aria-label="Ver avatares anteriores" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6"/></svg></button><div class="avatar-options">'+groups[cat].map(function(item){var imageUrl=window.beMediaUrl?window.beMediaUrl(item.imageUrl):item.imageUrl;return '<button class="avatar-option" type="button" data-avatar-url="'+escapePublic(item.imageUrl)+'" data-avatar-id="'+escapePublic(item.id)+'" aria-label="Avatar da categoria '+escapePublic(cat)+'"><img data-picker-src="'+escapePublic(imageUrl)+'" decoding="async" fetchpriority="low" width="160" height="160" alt="Avatar da categoria '+escapePublic(cat)+'"></button>';}).join('')+'</div><button class="avatar-rail-arrow next" type="button" aria-label="Ver mais avatares"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m9 18 6-6-6-6"/></svg></button></div></section>';
        }).join('')+'</div>';
        avatarGalleryRendered=true;
        setupAvatarRails();
        syncAvatarPickerSelection();
        activatePickerImages(avatarPickerBody,'avatar');
      }catch(error){avatarPickerBody.innerHTML='<div class="avatar-picker-empty">Não foi possível carregar a galeria.</div>';(void 0);}
    }


    function profileFallbackAvatar(){return '<img loading="eager" decoding="async" src="'+escapePublic(window.BETV_DEFAULT_AVATAR||'/_static/media/profile/default-avatar.png')+'" data-avatar-fallback="'+escapePublic(window.BETV_DEFAULT_AVATAR||'/_static/media/profile/default-avatar.png')+'" alt="Sem foto de perfil">';}
    function publicProfileYear(profile){
      var source=profile&&profile.createdAt?profile.createdAt:beBackend.now();
      var date=new Date(source);
      return String(date.getFullYear()||new Date().getFullYear());
    }
    function cleanPathname(){try{return decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/'))).replace(/\/+$/,'')||'/';}catch(_){return String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';}}
    function isConfigRoute(){var path=cleanPathname().toLowerCase();var hash=location.hash.toLowerCase();return path==='/config'||hash==='#config'||hash==='#/config';}
    function isProfileRoute(){return /^\/@[^/?#]+$/i.test(cleanPathname())||/^#\/perfil\/@[^/?#]+/i.test(location.hash);}
    function profileRouteUsername(){
      var match=cleanPathname().match(/^\/@([^/?#]+)$/i);
      var raw='';
      if(match){try{raw=decodeURIComponent(match[1]||'');}catch(_){raw=match[1]||'';}}
      if(!raw){var hashMatch=String(location.hash||'').match(/^#\/perfil\/@([^/?#]+)/i);if(hashMatch){try{raw=decodeURIComponent(hashMatch[1]||'');}catch(_){raw=hashMatch[1]||'';}}}
      return beBackend.normalizeUsername(raw);
    }
    function profileRoutePath(profile){
      var handle=beBackend.normalizeUsername((profile&&profile.username)||profileRouteUsername()||(currentProfile&&currentProfile.username)||'perfil');
      return '/@'+encodeURIComponent(handle||'perfil');
    }
    function replacePublicRoute(path){history.replaceState({beRoute:'public'},'',path+(location.search||''));}
    function pushPublicRoute(path){if(cleanPathname()!==path||location.hash)history.pushState({beRoute:'public'},'',path+(location.search||''));}
    function closePublicPages(updateRoute){
      if(profileInlineEditing)stopInlineProfileEdit(false);




      viewedProfileRequest++;
      profileLikeRequest++;
      document.body.classList.remove('profile-page-active','settings-page-active','profile-favorites-picker-active','profile-view-own');
      applyProfileTheme(null);
      if(profilePage){
        profilePage.hidden=true;
        profilePage.setAttribute('hidden','');
        profilePage.setAttribute('aria-hidden','true');
      }
      if(settingsPage){
        settingsPage.hidden=true;
        settingsPage.setAttribute('hidden','');
        settingsPage.setAttribute('aria-hidden','true');
      }
      if(profileFavoritesPicker){profileFavoritesPicker.hidden=true;profileFavoritesPicker.setAttribute('hidden','');}
      if(profileLovedAlbumsPicker){profileLovedAlbumsPicker.hidden=true;profileLovedAlbumsPicker.setAttribute('hidden','');}
      profileFavoritesReturnPath='';
      profileLovedAlbumsReturnPath='';
      if(typeof syncBodyScroll==='function')syncBodyScroll();
      if(updateRoute!==false&&(isConfigRoute()||isProfileRoute()))pushPublicRoute('/');
    }
    function readCachedProfileBanner(user){
      if(!user||!user.uid)return {bannerUrl:'',bannerId:''};
      try{
        var parsed=JSON.parse(localStorage.getItem('beProfileBanner:'+user.uid)||'{}');
        return {bannerUrl:String(parsed.bannerUrl||''),bannerId:String(parsed.bannerId||'')};
      }catch(_){return {bannerUrl:'',bannerId:''};}
    }
    function resolvedProfileBanner(user){
      if(!user)return {bannerUrl:'',bannerId:''};
      var cached=readCachedProfileBanner(user);
      var metadata=user&&user.raw&&(user.raw.user_metadata||user.raw.raw_user_meta_data)||{};
      var bannerUrl=String((currentProfile&&currentProfile.bannerUrl)||metadata.profile_banner_url||metadata.banner_url||cached.bannerUrl||'').trim();
      var bannerId=String((currentProfile&&currentProfile.bannerId)||metadata.profile_banner_id||metadata.banner_id||cached.bannerId||'').trim();
      if(currentProfile&&bannerUrl){currentProfile.bannerUrl=bannerUrl;currentProfile.bannerId=bannerId;}
      return {bannerUrl:bannerUrl,bannerId:bannerId};
    }
    function applyProfileBanner(bannerUrl){
      if(isConfigRoute()||document.body.classList.contains('settings-page-active')){
        if(profilePage){profilePage.hidden=true;profilePage.setAttribute('hidden','');profilePage.setAttribute('aria-hidden','true');}
        return;
      }
      var hero=profilePage&&profilePage.querySelector('.profile-page-hero');
      var url=String(bannerUrl||'').trim();
      if(!url){
        if(hero){hero.classList.remove('has-profile-banner');hero.style.backgroundImage='';}
        profilePageBanner.hidden=true;profilePageBanner.style.display='none';
        profilePageBannerImg.removeAttribute('src');
        profilePageBannerFallback.hidden=false;profilePageBannerFallback.style.display='block';
        return;
      }
      if(hero){
        hero.classList.add('has-profile-banner');
        hero.style.backgroundImage='url('+JSON.stringify(window.beMediaUrl?window.beMediaUrl(url):url)+')';
        hero.style.backgroundSize='cover';
        hero.style.backgroundPosition='center center';
      }
      profilePageBannerImg.src=window.beMediaUrl?window.beMediaUrl(url):url;
      profilePageBanner.hidden=false;profilePageBanner.removeAttribute('hidden');profilePageBanner.style.display='block';
      profilePageBannerFallback.hidden=true;profilePageBannerFallback.setAttribute('hidden','');profilePageBannerFallback.style.display='none';
    }
    function isOwnProfileView(){
      if(!auth.currentUser)return false;
      var viewedHandle=beBackend.normalizeUsername((viewedProfile&&viewedProfile.username)||profileRouteUsername());
      var ownHandle=beBackend.normalizeUsername((currentProfile&&currentProfile.username)||'');
      if(viewedHandle&&ownHandle&&viewedHandle===ownHandle)return true;
      var viewedUid=String((viewedProfile&&(viewedProfile.uid||viewedProfile.id))||'').trim();
      var ownUid=String((currentProfile&&(currentProfile.uid||currentProfile.id))||(auth.currentUser&&auth.currentUser.uid)||'').trim();
      return Boolean(viewedUid&&ownUid&&viewedUid===ownUid);
    }
    function profileLikeCount(value){
      var count=Number(value||0);
      return Number.isFinite(count)&&count>0?Math.floor(count):0;
    }
    function currentViewedProfileHandle(){
      return beBackend.normalizeUsername((viewedProfile&&viewedProfile.username)||profileRouteUsername()||(currentProfile&&currentProfile.username)||'');
    }
    function renderProfileLikeUi(){
      var guest=!auth.currentUser;
      var own=isOwnProfileView();
      var ready=viewedProfileStatus==='ready'&&Boolean(viewedProfile);
      var handle=currentViewedProfileHandle();
      var stateMatches=Boolean(handle&&profileLikeState.username===handle);
      var count=stateMatches?profileLikeCount(profileLikeState.count):profileLikeCount(viewedProfile&&viewedProfile.likesReceived);
      var liked=stateMatches&&profileLikeState.liked===true;
      var loading=stateMatches&&profileLikeState.loading===true;
      if(profilePageLikesReceived){
        profilePageLikesReceived.hidden=count<1;
        if(count<1)profilePageLikesReceived.setAttribute('hidden','');else profilePageLikesReceived.removeAttribute('hidden');
        profilePageLikesReceived.textContent=count===1?localizedProfileText('1 curtida recebida'):localizedProfileText('{count} curtidas recebidas',{count:count});
      }
      if(profilePageLike){
        var canLike=ready&&!guest&&!own;
        profilePageLike.hidden=!canLike;
        profilePageLike.setAttribute('aria-hidden',canLike?'false':'true');
        profilePageLike.classList.toggle('is-liked',liked);
        profilePageLike.setAttribute('aria-pressed',liked?'true':'false');
        profilePageLike.setAttribute('aria-label',liked?'Remover curtida do perfil':'Curtir perfil');
        profilePageLike.title=liked?'Remover curtida':'Curtir perfil';
        profilePageLike.disabled=Boolean(loading);
        profilePageLike.setAttribute('aria-busy',loading?'true':'false');
      }
    }
    function updateProfileActionVisibility(){
      var guest=!auth.currentUser;
      var own=!guest&&isOwnProfileView();
      var browsingAsGuest=guest&&Boolean(window.BETVGuestAccess&&window.BETVGuestAccess.isActive());
      document.body.classList.toggle('profile-viewer-guest',guest);
      document.body.classList.toggle('profile-view-own',!guest&&isOwnProfileView());
      renderProfileLikeUi();
      renderProfileFollowUi();
      if(profilePageMore){var hideMore=guest||!own;profilePageMore.hidden=hideMore;profilePageMore.setAttribute('aria-hidden',hideMore?'true':'false');if(hideMore)closeProfileActionsMenu(false);}
      if(profilePageHome){profilePageHome.title='Home';profilePageHome.setAttribute('aria-label','Voltar para a Home');}
    }
    async function refreshProfileLikeState(){
      var profile=viewedProfile;
      var handle=currentViewedProfileHandle();
      var requestId=++profileLikeRequest;
      profileLikeState={username:handle,liked:false,count:profileLikeCount(profile&&profile.likesReceived),loading:Boolean(auth.currentUser&&handle)};
      renderProfileLikeUi();
      if(!auth.currentUser||!handle||!window.beBackend)return;
      try{
        await window.beBackend.ready;
        var client=window.beBackend.client;
        if(!client||typeof client.rpc!=='function')throw new Error('profile_like_rpc_unavailable');
        var result=await client.rpc('get_profile_like_state',{p_username:handle});
        if(result.error)throw result.error;
        var row=Array.isArray(result.data)?result.data[0]:result.data;
        if(requestId!==profileLikeRequest||handle!==currentViewedProfileHandle())return;
        var count=profileLikeCount(row&&row.like_count);
        profileLikeState={username:handle,liked:Boolean(row&&row.liked),count:count,loading:false};
        if(viewedProfile&&beBackend.normalizeUsername(viewedProfile.username)===handle)viewedProfile={...viewedProfile,likesReceived:count};
        if(isOwnProfileView()&&currentProfile)currentProfile={...currentProfile,likesReceived:count};
        renderProfileLikeUi();
      }catch(error){
        if(requestId!==profileLikeRequest||handle!==currentViewedProfileHandle())return;
        profileLikeState={...profileLikeState,loading:false};
        renderProfileLikeUi();
        (void 0);
      }
    }
    async function toggleProfileLike(){
      var handle=currentViewedProfileHandle();
      if(!auth.currentUser){window.BETVPublicRoutes.go('/login');return;}
      if(!handle||isOwnProfileView()||profileLikeState.loading)return;
      var requestId=++profileLikeRequest;
      profileLikeState={username:handle,liked:profileLikeState.username===handle&&profileLikeState.liked===true,count:profileLikeState.username===handle?profileLikeCount(profileLikeState.count):profileLikeCount(viewedProfile&&viewedProfile.likesReceived),loading:true};
      renderProfileLikeUi();
      try{
        await window.beBackend.ready;
        var client=window.beBackend.client;
        if(!client||typeof client.rpc!=='function')throw new Error('profile_like_rpc_unavailable');
        var result=await client.rpc('toggle_profile_like',{p_username:handle});
        if(result.error)throw result.error;
        var row=Array.isArray(result.data)?result.data[0]:result.data;
        if(requestId!==profileLikeRequest||handle!==currentViewedProfileHandle())return;
        var count=profileLikeCount(row&&row.like_count);
        profileLikeState={username:handle,liked:Boolean(row&&row.liked),count:count,loading:false};
        if(viewedProfile)viewedProfile={...viewedProfile,likesReceived:count};
        renderProfileLikeUi();
      }catch(error){
        if(requestId!==profileLikeRequest||handle!==currentViewedProfileHandle())return;
        profileLikeState={...profileLikeState,loading:false};
        renderProfileLikeUi();
        (void 0);
      }
    }
    function setProfilePageAvatar(url){
      var avatar=String(url||'').trim()||window.BETV_DEFAULT_AVATAR;
      profilePageAvatar.hidden=false;profilePageAvatar.removeAttribute('hidden');profilePageAvatar.setAttribute('aria-hidden','false');
      profilePageAvatar.innerHTML='<img loading="eager" fetchpriority="high" decoding="async" src="'+escapePublic(window.BETVResolveAvatar?window.BETVResolveAvatar(avatar):avatar)+'" data-avatar-fallback="'+escapePublic(window.BETV_DEFAULT_AVATAR||'"+DEFAULT+"')+'" alt="Avatar do perfil">';
      var info=profilePage&&profilePage.querySelector('.profile-page-info');if(info)info.classList.remove('without-avatar');
    }
    function renderProfileState(title,handle,message){
      applyProfileTheme(null);
      setInterfaceText(profilePageName,title);
      setLiteralText(profilePageHandle,'@'+(handle||'perfil'));
      profilePageBadge.textContent='Perfil';
      profilePageMetaLabel.textContent='Perfil público';
      profilePageMemberSince.textContent=message||'';
      renderProfileSocials(null);
      profileLikeState={username:handle||'',liked:false,count:0,loading:false};
      renderProfileLikeUi();
      setProfilePageAvatar('');
      applyProfileBanner('');
      profileFavoritesSection.hidden=true;
      if(profileLovedAlbumsSection)profileLovedAlbumsSection.hidden=true;
      profileSavedSection.hidden=true;
    }
    function trustedProfileContent(item){
      var source=[];try{source=typeof window.beGetCatalogContents==='function'?window.beGetCatalogContents():[];}catch(_){source=[];}
      var identity=profileFavoriteIdentity(item);
      var match=source.find(function(candidate){
        if(identity&&profileFavoriteIdentity(candidate)===identity)return true;
        if(item&&item.recordId&&candidate&&candidate.recordId)return String(item.collection||'videos')===String(candidate.collection||'videos')&&String(item.recordId)===String(candidate.recordId);
        return Boolean(item&&item.itemId&&candidate&&String(item.itemId)===String(candidate.itemId));
      });
      return match||item;
    }

    function profileFavoriteIdentity(item){
      return String((item&&item.favoriteId)||((item&&item.collection&&item.recordId)?item.collection+':'+item.recordId:'')||(item&&item.itemId)||(item&&item.title)||'').trim();
    }
    function normalizeProfileFavorite(item){
      return {
        itemId:String(item&&item.itemId||''),
        recordId:String(item&&item.recordId||''),
        favoriteId:String(item&&item.favoriteId||''),
        title:String(item&&item.title||'Conteúdo'),
        description:String(item&&item.description||''),
        year:String(item&&item.year||''),
        duration:String(item&&item.duration||''),
        contentUrl:String(item&&item.contentUrl||'#'),
        imageUrl:String(item&&(item.imageUrl||item.thumbnailUrl||item.bannerUrl)||''),
        bannerUrl:String(item&&(item.bannerUrl||item.imageUrl||item.thumbnailUrl)||''),
        logoUrl:String(item&&item.logoUrl||''),
        collection:String(item&&item.collection||'videos').toLowerCase()
      };
    }
    function profileFavoritesStorageKey(){
      return 'beProfileTopFavorites:'+(auth.currentUser&&auth.currentUser.uid?auth.currentUser.uid:'guest');
    }
    function readProfileFavorites(){
      try{
        var parsed=JSON.parse(localStorage.getItem(profileFavoritesStorageKey())||'[]');
        if(!Array.isArray(parsed))return [];
        var result=[];
        parsed.map(normalizeProfileFavorite).forEach(function(item){
          var identity=profileFavoriteIdentity(item);
          if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.push(item);
        });
        return result.slice(0,4);
      }catch(_){return [];}
    }
    function writeProfileFavorites(items){
      var normalized=(Array.isArray(items)?items:[]).map(normalizeProfileFavorite).slice(0,4);
      localStorage.setItem(profileFavoritesStorageKey(),JSON.stringify(normalized));
      try{localStorage.setItem('beSyncedUserData:'+(auth.currentUser&&auth.currentUser.uid?auth.currentUser.uid:'guest'),JSON.stringify({data:captureCrossDeviceData(auth.currentUser&&auth.currentUser.uid)}));}catch(_){ }
      if(typeof window.beScheduleUserDataSync==='function')window.beScheduleUserDataSync('profile-favorites');
      profileFavoritesItems=normalized;
      window.dispatchEvent(new CustomEvent('be:profile-favorites-changed',{detail:{items:normalized}}));
    }
    function profileFavoriteCollectionLabel(item){
      var type=String(item&&item.collection||'videos').toLowerCase();
      if(type==='movies')return 'FILME';
      if(type==='series')return 'SÉRIE';
      return 'VÍDEO';
    }
    function profileFavoriteImage(item){
      return String(item&&(item.imageUrl||item.bannerUrl)||'').trim();
    }
    function profileCatalogContents(){
      var source=[];
      try{source=typeof window.beGetCatalogContents==='function'?window.beGetCatalogContents():[];}catch(error){(void 0);}
      var result=[];
      source.map(normalizeProfileFavorite).forEach(function(item){
        var identity=profileFavoriteIdentity(item);
        if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.push(item);
      });
      profileFavoritesItems.forEach(function(item){
        var identity=profileFavoriteIdentity(item);
        if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.unshift(item);
      });
      return result;
    }
    function renderProfileFavorites(){
      if(!profileFavoritesSection||!profileFavoritesContent)return;
      var ownProfile=isOwnProfileView();
      var publicReady=viewedProfileStatus==='ready'&&viewedProfile;
      profileFavoritesSection.hidden=!publicReady;
      if(!publicReady){profileFavoritesItems=[];profileFavoritesContent.innerHTML='';if(profileFavoritesEdit)profileFavoritesEdit.hidden=true;return;}
      profileFavoritesItems=(ownProfile?readProfileFavorites():(Array.isArray(viewedProfile.favorites)?viewedProfile.favorites.map(normalizeProfileFavorite).slice(0,4):[])).map(function(item){return normalizeProfileFavorite(trustedProfileContent(item));});
      if(profileFavoritesEdit)profileFavoritesEdit.hidden=!ownProfile||profileFavoritesItems.length===0;
      if(ownProfile&&profileFavoritesItems.length===0){
        profileFavoritesContent.innerHTML='<button class="profile-favorites-empty" id="profileFavoritesAdd" type="button"><span class="profile-favorites-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><strong>Adicionar favoritos</strong><span>Escolha de 1 a 4 conteúdos que representam o seu gosto.</span></button>';
        var addButton=document.getElementById('profileFavoritesAdd');if(addButton)addButton.addEventListener('click',openProfileFavoritesPicker);return;
      }
      if(!profileFavoritesItems.length){
        profileFavoritesContent.innerHTML='<div class="profile-favorites-empty profile-public-empty"><strong>Nenhum favorito público</strong><span>Esta pessoa ainda não escolheu os favoritos do perfil.</span></div>';
        return;
      }
      profileFavoritesContent.innerHTML='<div class="profile-favorites-ranking">'+profileFavoritesItems.map(function(item,index){
        var image=profileFavoriteImage(item);
        var imageAttrs=index===0?' loading="eager" fetchpriority="high" decoding="async"':(index===1?' loading="eager" decoding="async"':' decoding="async"');
        var rank=String(index+1);
        var gradientId='profileFavoriteRankGradient'+rank;
        var clipId='profileFavoriteRankClip'+rank;
        var rankSvg='<svg class="profile-favorite-rank-svg" viewBox="0 0 126 240" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">'
          +'<defs><linearGradient id="'+gradientId+'" y1="0%" y2="0%" x1="0%" x2="100%"><stop offset="0%" stop-color="rgba(255,255,255,1)"></stop><stop offset="50%" stop-color="rgba(255,255,255,1)"></stop><stop offset="100%" stop-color="rgba(255,255,255,0)"></stop></linearGradient><clipPath id="'+clipId+'"><text x="63" y="177" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="151" font-weight="900">'+rank+'</text></clipPath></defs>'
          +'<rect x="0" y="0" width="100%" height="100%" fill="url(#'+gradientId+')" clip-path="url(#'+clipId+')"></rect></svg>';
        return '<button class="profile-favorite-ranked-item" type="button" data-profile-favorite-index="'+index+'" aria-label="Abrir '+escapePublic(item.title||'favorito')+'">'
          +'<span class="profile-favorite-rank" aria-hidden="true">'+rankSvg+'</span>'
          +'<span class="profile-favorite-poster">'+(image?'<img'+imageAttrs+' src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(image):image)+'" alt="">':'<span class="profile-favorite-placeholder"></span>')
          +'<span class="profile-favorite-type">'+profileFavoriteCollectionLabel(item)+'</span>'
          +'<span class="profile-favorite-title notranslate" translate="no">'+escapePublic(item.title||'Conteúdo')+'</span></span>'
          +'</button>';
      }).join('')+'</div>';
    }

    function profileLovedAlbumsStorageKey(){
      return 'beProfileLovedAlbums:'+(auth.currentUser&&auth.currentUser.uid?auth.currentUser.uid:'guest');
    }
    function readProfileLovedAlbums(){
      try{
        var parsed=JSON.parse(localStorage.getItem(profileLovedAlbumsStorageKey())||'[]');
        if(!Array.isArray(parsed))return [];
        var result=[];
        parsed.map(normalizeProfileFavorite).forEach(function(item){
          item.collection='albums';
          var identity=profileFavoriteIdentity(item);
          if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.push(item);
        });
        return result.slice(0,4);
      }catch(_){return [];}
    }
    function writeProfileLovedAlbums(items){
      var normalized=(Array.isArray(items)?items:[]).map(normalizeProfileFavorite).map(function(item){item.collection='albums';return item;}).slice(0,4);
      localStorage.setItem(profileLovedAlbumsStorageKey(),JSON.stringify(normalized));
      try{localStorage.setItem('beSyncedUserData:'+(auth.currentUser&&auth.currentUser.uid?auth.currentUser.uid:'guest'),JSON.stringify({data:captureCrossDeviceData(auth.currentUser&&auth.currentUser.uid)}));}catch(_){ }
      if(typeof window.beScheduleUserDataSync==='function')window.beScheduleUserDataSync('profile-albums');
      profileLovedAlbumsItems=normalized;
      window.dispatchEvent(new CustomEvent('be:profile-loved-albums-changed',{detail:{items:normalized}}));
    }
    function albumProfileRecord(album){
      var id=String(album&&album.id||album&&album.recordId||'').trim();
      var rawImage=String(album&&(album.imageUrl||album.thumbnailUrl||album.bannerUrl)||'');
      var storedImage=window.beMediaUrl?window.beMediaUrl(rawImage):rawImage;if(storedImage==='#')storedImage='';
      return normalizeProfileFavorite({
        itemId:id?'album:'+id:String(album&&album.itemId||''),
        recordId:id,
        favoriteId:id?'albums:'+id:String(album&&album.favoriteId||''),
        title:String(album&&album.title||'Álbum'),
        year:String(album&&album.year||''),
        imageUrl:storedImage,
        bannerUrl:storedImage,
        collection:'albums'
      });
    }
    async function loadProfileLovedAlbumsCatalog(){
      try{
        if(!window.beBackend)return profileLovedAlbumsItems.slice();
        await window.beBackend.ready;
        var values=await window.beBackend.data.list('news',{orderBy:'order',direction:'asc'});
        var result=[];
        (Array.isArray(values)?values:[]).filter(function(album){return album&&album.active!==false&&String(album.title||'').trim();}).forEach(function(album){
          var item=albumProfileRecord(album),identity=profileFavoriteIdentity(item);
          if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.push(item);
        });
        profileLovedAlbumsItems.forEach(function(item){
          var identity=profileFavoriteIdentity(item);
          if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.unshift(item);
        });
        return result;
      }catch(error){(void 0);return profileLovedAlbumsItems.slice();}
    }
    function renderProfileLovedAlbums(){
      if(!profileLovedAlbumsSection||!profileLovedAlbumsContent)return;
      var ownProfile=isOwnProfileView();
      var publicReady=viewedProfileStatus==='ready'&&viewedProfile;
      profileLovedAlbumsSection.hidden=!publicReady;
      if(!publicReady){profileLovedAlbumsItems=[];profileLovedAlbumsContent.innerHTML='';if(profileLovedAlbumsEdit)profileLovedAlbumsEdit.hidden=true;return;}
      profileLovedAlbumsItems=ownProfile?readProfileLovedAlbums():(Array.isArray(viewedProfile.lovedAlbums)?viewedProfile.lovedAlbums.map(normalizeProfileFavorite).slice(0,4):[]);
      profileLovedAlbumsItems.forEach(function(item){item.collection='albums';});
      if(profileLovedAlbumsEdit)profileLovedAlbumsEdit.hidden=!ownProfile||profileLovedAlbumsItems.length===0;
      if(ownProfile&&profileLovedAlbumsItems.length===0){
        profileLovedAlbumsContent.innerHTML='<button class="profile-favorites-empty" id="profileLovedAlbumsAdd" type="button"><span class="profile-favorites-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><strong>Adicionar álbuns</strong><span>Escolha de 1 a 4 álbuns que você ama.</span></button>';
        var addButton=document.getElementById('profileLovedAlbumsAdd');if(addButton)addButton.addEventListener('click',openProfileLovedAlbumsPicker);return;
      }
      if(!profileLovedAlbumsItems.length){
        profileLovedAlbumsContent.innerHTML='<div class="profile-favorites-empty profile-public-empty"><strong>Nenhum álbum escolhido</strong><span>Esta pessoa ainda não escolheu os álbuns que ama.</span></div>';
        return;
      }
      profileLovedAlbumsContent.innerHTML='<div class="profile-favorites-ranking">'+profileLovedAlbumsItems.map(function(item,index){
        var image=profileFavoriteImage(item);
        var imageAttrs=index===0?' loading="eager" fetchpriority="high" decoding="async"':(index===1?' loading="eager" decoding="async"':' decoding="async"');
        var rank=String(index+1);
        var gradientId='profileLovedAlbumRankGradient'+rank;
        var clipId='profileLovedAlbumRankClip'+rank;
        var rankSvg='<svg class="profile-favorite-rank-svg" viewBox="0 0 126 240" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">'
          +'<defs><linearGradient id="'+gradientId+'" y1="0%" y2="0%" x1="0%" x2="100%"><stop offset="0%" stop-color="rgba(255,255,255,1)"></stop><stop offset="50%" stop-color="rgba(255,255,255,1)"></stop><stop offset="100%" stop-color="rgba(255,255,255,0)"></stop></linearGradient><clipPath id="'+clipId+'"><text x="63" y="177" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="151" font-weight="900">'+rank+'</text></clipPath></defs>'
          +'<rect x="0" y="0" width="100%" height="100%" fill="url(#'+gradientId+')" clip-path="url(#'+clipId+')"></rect></svg>';
        return '<button class="profile-favorite-ranked-item" type="button" data-profile-loved-album-index="'+index+'" aria-label="Abrir '+escapePublic(item.title||'álbum')+'">'
          +'<span class="profile-favorite-rank" aria-hidden="true">'+rankSvg+'</span>'
          +'<span class="profile-favorite-poster">'+(image?'<img'+imageAttrs+' src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(image):image)+'" alt="">':'<span class="profile-favorite-placeholder"></span>')
          +'<span class="profile-favorite-type">ÁLBUM</span>'
          +'<span class="profile-favorite-title notranslate" translate="no">'+escapePublic(item.title||'Álbum')+'</span></span>'
          +'</button>';
      }).join('')+'</div>';
    }
    function renderProfileLovedAlbumsPicker(){
      if(!profileLovedAlbumsPickerBody)return;
      var query=String(profileLovedAlbumsSearch&&profileLovedAlbumsSearch.value||'').trim().toLocaleLowerCase('pt-BR');
      var filtered=profileLovedAlbumsCatalog.filter(function(item){return !query||[item.title,item.year,'álbum'].join(' ').toLocaleLowerCase('pt-BR').indexOf(query)>=0;});
      if(!filtered.length){
        profileLovedAlbumsPickerBody.innerHTML='<div class="profile-favorites-picker-empty"><strong>Nenhum álbum encontrado</strong><span>Pesquise usando outro nome ou uma parte do título.</span></div>';
      }else{
        var selectedItems=profileLovedAlbumsDraft.map(function(selected){return filtered.find(function(item){return profileFavoriteIdentity(item)===profileFavoriteIdentity(selected);});}).filter(Boolean);
        var selectedIdentities=new Set(selectedItems.map(profileFavoriteIdentity));
        var visibleItems=selectedItems.concat(filtered.filter(function(item){return !selectedIdentities.has(profileFavoriteIdentity(item));})).slice(0,12);
        profileLovedAlbumsPickerBody.innerHTML='<div class="profile-favorites-picker-grid">'+visibleItems.map(function(item){
          var catalogIndex=profileLovedAlbumsCatalog.findIndex(function(current){return profileFavoriteIdentity(current)===profileFavoriteIdentity(item);});
          var selectedIndex=profileLovedAlbumsDraft.findIndex(function(current){return profileFavoriteIdentity(current)===profileFavoriteIdentity(item);});
          var selected=selectedIndex>=0,image=profileFavoriteImage(item);
          return '<button class="profile-favorites-option'+(selected?' selected':'')+'" type="button" data-profile-loved-album-option="'+catalogIndex+'" data-no-content-open="true" aria-pressed="'+String(selected)+'">'
            +'<span class="profile-favorites-option-media">'+(image?'<img decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(image):image)+'" alt="">':'<span class="profile-favorite-placeholder"></span>')
            +'<span class="profile-favorites-option-order">'+(selected?selectedIndex+1:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>')+'</span></span>'
            +'<span class="profile-favorites-option-copy"><strong class="notranslate" translate="no">'+escapePublic(item.title||'Álbum')+'</strong><small>ÁLBUM'+(item.year?' • '+escapePublic(item.year):'')+'</small></span>'
            +'</button>';
        }).join('')+'</div><p class="profile-favorites-search-hint"><strong>Não achou o álbum?</strong><span>Pesquise pelo nome na barra acima.</span></p>';
      }
      if(profileLovedAlbumsSelectionCount)profileLovedAlbumsSelectionCount.textContent=profileLovedAlbumsDraft.length+' de 4';
      var ready=profileLovedAlbumsDraft.length>=1&&profileLovedAlbumsDraft.length<=4;
      if(profileLovedAlbumsSave)profileLovedAlbumsSave.disabled=!ready;
      if(profileLovedAlbumsHeaderSave)profileLovedAlbumsHeaderSave.disabled=!ready;
    }
    async function openProfileLovedAlbumsPicker(event){
      if(!profileLovedAlbumsPicker)return;
      if(event&&event.currentTarget)profileLovedAlbumsLastFocus=event.currentTarget;else profileLovedAlbumsLastFocus=document.activeElement;
      profileLovedAlbumsItems=readProfileLovedAlbums();
      profileLovedAlbumsDraft=profileLovedAlbumsItems.slice(0,4);
      if(profileLovedAlbumsSearch)profileLovedAlbumsSearch.value='';
      profileLovedAlbumsReturnPath=location.pathname+(location.search||'');
      profileLovedAlbumsPicker.hidden=false;
      document.body.classList.add('profile-favorites-picker-active');
      syncBodyScroll();
      if(profileLovedAlbumsPickerBody)profileLovedAlbumsPickerBody.innerHTML='<div class="profile-favorites-picker-empty"><strong>Carregando álbuns…</strong></div>';
      profileLovedAlbumsCatalog=await loadProfileLovedAlbumsCatalog();
      renderProfileLovedAlbumsPicker();
      requestAnimationFrame(function(){if(profileLovedAlbumsSearch)profileLovedAlbumsSearch.focus({preventScroll:true});});
    }
    function closeProfileLovedAlbumsPicker(){
      if(!profileLovedAlbumsPicker||profileLovedAlbumsPicker.hidden)return;
      profileLovedAlbumsPicker.hidden=true;
      document.body.classList.remove('profile-favorites-picker-active');
      profileLovedAlbumsDraft=[];
      syncBodyScroll();
      if(profileLovedAlbumsLastFocus&&typeof profileLovedAlbumsLastFocus.focus==='function')profileLovedAlbumsLastFocus.focus({preventScroll:true});
      profileLovedAlbumsLastFocus=null;profileLovedAlbumsReturnPath='';
    }
    function restoreProfileLovedAlbumsContext(){


      if(!document.body.classList.contains('profile-page-active')&&!isProfileRoute())return;
      if(!profileLovedAlbumsReturnPath)return;
      document.body.classList.add('profile-page-active');document.body.classList.remove('detail-page-active');
      if(profilePage){profilePage.hidden=false;profilePage.removeAttribute('hidden');profilePage.setAttribute('aria-hidden','false');}
      if(profileLovedAlbumsPicker){profileLovedAlbumsPicker.hidden=false;profileLovedAlbumsPicker.removeAttribute('hidden');}
      var expected=profileLovedAlbumsReturnPath||location.pathname+(location.search||'');
      if(expected&&location.pathname+(location.search||'')!==expected){try{history.replaceState({beRoute:'profile'},'',expected);}catch(_){}}
    }
    function toggleProfileLovedAlbumOption(index){
      var item=profileLovedAlbumsCatalog[index];if(!item)return;
      var identity=profileFavoriteIdentity(item);
      var selectedIndex=profileLovedAlbumsDraft.findIndex(function(current){return profileFavoriteIdentity(current)===identity;});
      if(selectedIndex>=0)profileLovedAlbumsDraft.splice(selectedIndex,1);
      else if(profileLovedAlbumsDraft.length<4)profileLovedAlbumsDraft.push(item);
      else{
        if(profileLovedAlbumsSelectionCount){profileLovedAlbumsSelectionCount.textContent='Limite de 4 álbuns';profileLovedAlbumsSelectionCount.classList.add('limit');setTimeout(function(){profileLovedAlbumsSelectionCount.classList.remove('limit');profileLovedAlbumsSelectionCount.textContent=profileLovedAlbumsDraft.length+' de 4';},900);}
        if(navigator.vibrate)navigator.vibrate(20);return;
      }
      renderProfileLovedAlbumsPicker();restoreProfileLovedAlbumsContext();requestAnimationFrame(restoreProfileLovedAlbumsContext);setTimeout(restoreProfileLovedAlbumsContext,80);
    }
    function saveProfileLovedAlbums(){
      if(profileLovedAlbumsDraft.length<1||profileLovedAlbumsDraft.length>4)return;
      writeProfileLovedAlbums(profileLovedAlbumsDraft);closeProfileLovedAlbumsPicker();renderProfileLovedAlbums();
    }
    function bindProfileLovedAlbums(){
      if(profileLovedAlbumsContent&&profileLovedAlbumsContent.dataset.bound!=='true'){
        profileLovedAlbumsContent.dataset.bound='true';
        profileLovedAlbumsContent.addEventListener('click',function(event){
          var button=event.target.closest('[data-profile-loved-album-index]');if(!button)return;
          var item=profileLovedAlbumsItems[Number(button.dataset.profileLovedAlbumIndex)];if(!item)return;
          var id=String(item.recordId||item.itemId||'').replace(/^album:/,'');if(!id)return;
          closePublicPages(false);
          var path='/albuns/'+encodeURIComponent(id);
          if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go(path);else location.assign(window.BETVLocaleURL?window.BETVLocaleURL(path):path);
        });
      }
      if(profileLovedAlbumsEdit&&profileLovedAlbumsEdit.dataset.bound!=='true'){profileLovedAlbumsEdit.dataset.bound='true';profileLovedAlbumsEdit.addEventListener('click',openProfileLovedAlbumsPicker);}
      if(profileLovedAlbumsPicker&&profileLovedAlbumsPicker.dataset.bound!=='true'){
        profileLovedAlbumsPicker.dataset.bound='true';
        if(profileLovedAlbumsPickerClose)profileLovedAlbumsPickerClose.addEventListener('click',closeProfileLovedAlbumsPicker);
        if(profileLovedAlbumsCancel)profileLovedAlbumsCancel.addEventListener('click',closeProfileLovedAlbumsPicker);
        if(profileLovedAlbumsSave)profileLovedAlbumsSave.addEventListener('click',saveProfileLovedAlbums);
        if(profileLovedAlbumsHeaderSave)profileLovedAlbumsHeaderSave.addEventListener('click',saveProfileLovedAlbums);
        if(profileLovedAlbumsSearch)profileLovedAlbumsSearch.addEventListener('input',renderProfileLovedAlbumsPicker);
        if(profileLovedAlbumsPickerBody){
          var lovedAlbumTouchHandledUntil=0;
          function stopLovedAlbumEvent(event){var button=event.target&&event.target.closest?event.target.closest('[data-profile-loved-album-option]'):null;if(!button)return null;event.preventDefault();event.stopPropagation();if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();return button;}
          profileLovedAlbumsPickerBody.addEventListener('pointerdown',function(event){stopLovedAlbumEvent(event);});
          profileLovedAlbumsPickerBody.addEventListener('pointerup',function(event){var button=stopLovedAlbumEvent(event);if(!button||event.pointerType==='mouse')return;lovedAlbumTouchHandledUntil=Date.now()+700;toggleProfileLovedAlbumOption(Number(button.dataset.profileLovedAlbumOption));});
          profileLovedAlbumsPickerBody.addEventListener('click',function(event){var button=stopLovedAlbumEvent(event);if(!button||Date.now()<lovedAlbumTouchHandledUntil)return;toggleProfileLovedAlbumOption(Number(button.dataset.profileLovedAlbumOption));});
        }
        profileLovedAlbumsPicker.addEventListener('click',function(event){if(event.target===profileLovedAlbumsPicker)closeProfileLovedAlbumsPicker();},true);
        document.addEventListener('keydown',function(event){if(event.key==='Escape'&&profileLovedAlbumsPicker&&!profileLovedAlbumsPicker.hidden){event.preventDefault();closeProfileLovedAlbumsPicker();}});
      }
    }

    function profileFavoriteIsSelected(item){
      var identity=profileFavoriteIdentity(item);
      return profileFavoritesDraft.some(function(current){return profileFavoriteIdentity(current)===identity;});
    }
    function renderProfileFavoritesPicker(){
      if(!profileFavoritesPickerBody)return;
      var query=String(profileFavoritesSearch&&profileFavoritesSearch.value||'').trim().toLocaleLowerCase('pt-BR');
      var filtered=profileFavoritesCatalog.filter(function(item){
        if(!query)return true;
        return [item.title,item.year,item.duration,profileFavoriteCollectionLabel(item)].join(' ').toLocaleLowerCase('pt-BR').indexOf(query)>=0;
      });
      if(!filtered.length){
        profileFavoritesPickerBody.innerHTML='<div class="profile-favorites-picker-empty"><strong>Nenhum conteúdo encontrado</strong><span>Pesquise usando outro nome ou uma parte do título.</span></div>';
      }else{
        var selectedItems=profileFavoritesDraft.map(function(selected){
          return filtered.find(function(item){return profileFavoriteIdentity(item)===profileFavoriteIdentity(selected);});
        }).filter(Boolean);
        var selectedIdentities=new Set(selectedItems.map(profileFavoriteIdentity));
        var visibleItems=selectedItems.concat(filtered.filter(function(item){return !selectedIdentities.has(profileFavoriteIdentity(item));})).slice(0,11);
        profileFavoritesPickerBody.innerHTML='<div class="profile-favorites-picker-grid">'+visibleItems.map(function(item){
          var catalogIndex=profileFavoritesCatalog.findIndex(function(current){return profileFavoriteIdentity(current)===profileFavoriteIdentity(item);});
          var selectedIndex=profileFavoritesDraft.findIndex(function(current){return profileFavoriteIdentity(current)===profileFavoriteIdentity(item);});
          var selected=selectedIndex>=0;
          var image=profileFavoriteImage(item);
          return '<button class="profile-favorites-option'+(selected?' selected':'')+'" type="button" data-profile-favorite-option="'+catalogIndex+'" data-no-content-open="true" aria-pressed="'+String(selected)+'">'
            +'<span class="profile-favorites-option-media">'+(image?'<img decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(image):image)+'" alt="">':'<span class="profile-favorite-placeholder"></span>')
            +'<span class="profile-favorites-option-order">'+(selected?selectedIndex+1:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>')+'</span></span>'
            +'<span class="profile-favorites-option-copy"><strong class="notranslate" translate="no">'+escapePublic(item.title||'Conteúdo')+'</strong><small>'+profileFavoriteCollectionLabel(item)+(item.year?' • '+escapePublic(item.year):'')+'</small></span>'
            +'</button>';
        }).join('')+'</div><p class="profile-favorites-search-hint"><strong>Não achou o vídeo que queria?</strong><span>Pesquise pelo nome na barra acima.</span></p>';
      }
      if(profileFavoritesSelectionCount)profileFavoritesSelectionCount.textContent=profileFavoritesDraft.length+' de 4';
      var favoritesReadyToSave=profileFavoritesDraft.length>=1&&profileFavoritesDraft.length<=4;
      if(profileFavoritesSave)profileFavoritesSave.disabled=!favoritesReadyToSave;
      if(profileFavoritesHeaderSave)profileFavoritesHeaderSave.disabled=!favoritesReadyToSave;
    }
    function openProfileFavoritesPicker(event){
      if(event&&event.currentTarget)profileFavoritesLastFocus=event.currentTarget;
      else profileFavoritesLastFocus=document.activeElement;
      profileFavoritesItems=readProfileFavorites();
      profileFavoritesDraft=profileFavoritesItems.slice(0,4);
      profileFavoritesCatalog=profileCatalogContents();
      if(profileFavoritesSearch)profileFavoritesSearch.value='';
      profileFavoritesReturnPath=location.pathname+(location.search||'');
      renderProfileFavoritesPicker();
      profileFavoritesPicker.hidden=false;
      document.body.classList.add('profile-favorites-picker-active');
      requestAnimationFrame(function(){if(profileFavoritesSearch)profileFavoritesSearch.focus({preventScroll:true});});
    }
    function closeProfileFavoritesPicker(){
      if(!profileFavoritesPicker||profileFavoritesPicker.hidden)return;
      profileFavoritesPicker.hidden=true;
      document.body.classList.remove('profile-favorites-picker-active');
      profileFavoritesDraft=[];
      if(profileFavoritesLastFocus&&typeof profileFavoritesLastFocus.focus==='function')profileFavoritesLastFocus.focus({preventScroll:true});
      profileFavoritesLastFocus=null;
      profileFavoritesReturnPath='';
    }
    function restoreProfileFavoritesContext(){

      if(!document.body.classList.contains('profile-page-active')&&!isProfileRoute())return;
      if(!profileFavoritesReturnPath)return;
      document.body.classList.add('profile-page-active');
      document.body.classList.remove('detail-page-active');
      if(profilePage){
        profilePage.hidden=false;
        profilePage.removeAttribute('hidden');
        profilePage.setAttribute('aria-hidden','false');
      }
      if(profileFavoritesPicker){
        profileFavoritesPicker.hidden=false;
        profileFavoritesPicker.removeAttribute('hidden');
      }
      var expected=profileFavoritesReturnPath||location.pathname+(location.search||'');
      if(expected&&location.pathname+(location.search||'')!==expected){
        try{history.replaceState({beRoute:'profile'},'',expected);}catch(_){}
      }
    }
    function toggleProfileFavoriteOption(index){
      var item=profileFavoritesCatalog[index];
      if(!item)return;
      var identity=profileFavoriteIdentity(item);
      var selectedIndex=profileFavoritesDraft.findIndex(function(current){return profileFavoriteIdentity(current)===identity;});
      if(selectedIndex>=0)profileFavoritesDraft.splice(selectedIndex,1);
      else if(profileFavoritesDraft.length<4)profileFavoritesDraft.push(item);
      else{
        if(profileFavoritesSelectionCount){profileFavoritesSelectionCount.textContent='Limite de 4 favoritos';profileFavoritesSelectionCount.classList.add('limit');setTimeout(function(){profileFavoritesSelectionCount.classList.remove('limit');profileFavoritesSelectionCount.textContent=profileFavoritesDraft.length+' de 4';},900);}
        if(navigator.vibrate)navigator.vibrate(20);
        return;
      }
      renderProfileFavoritesPicker();
      restoreProfileFavoritesContext();
      requestAnimationFrame(restoreProfileFavoritesContext);
      setTimeout(restoreProfileFavoritesContext,80);
    }
    function saveProfileFavorites(){
      if(profileFavoritesDraft.length<1||profileFavoritesDraft.length>4)return;
      writeProfileFavorites(profileFavoritesDraft);
      closeProfileFavoritesPicker();
      renderProfileFavorites();
    }
    function bindProfileFavorites(){
      if(profileFavoritesContent&&profileFavoritesContent.dataset.bound!=='true'){
        profileFavoritesContent.dataset.bound='true';
        profileFavoritesContent.addEventListener('click',function(event){
          var button=event.target.closest('[data-profile-favorite-index]');
          if(!button)return;
          var item=profileFavoritesItems[Number(button.dataset.profileFavoriteIndex)];
          if(!item)return;
          closePublicPages(false);
          if(typeof window.beOpenSavedContent==='function')window.beOpenSavedContent(trustedProfileContent(item));
        });
      }
      if(profileFavoritesEdit&&profileFavoritesEdit.dataset.bound!=='true'){
        profileFavoritesEdit.dataset.bound='true';
        profileFavoritesEdit.addEventListener('click',openProfileFavoritesPicker);
      }
      if(profileFavoritesPicker&&profileFavoritesPicker.dataset.bound!=='true'){
        profileFavoritesPicker.dataset.bound='true';
        if(profileFavoritesPickerClose)profileFavoritesPickerClose.addEventListener('click',closeProfileFavoritesPicker);
        if(profileFavoritesCancel)profileFavoritesCancel.addEventListener('click',closeProfileFavoritesPicker);
        if(profileFavoritesSave)profileFavoritesSave.addEventListener('click',saveProfileFavorites);
        if(profileFavoritesHeaderSave)profileFavoritesHeaderSave.addEventListener('click',saveProfileFavorites);
        if(profileFavoritesSearch)profileFavoritesSearch.addEventListener('input',renderProfileFavoritesPicker);
        if(profileFavoritesPickerBody){
          var profileFavoriteTouchHandledUntil=0;
          function keepFavoritePickerInProfile(){
            document.body.classList.add('profile-page-active');
            if(profileFavoritesPicker)profileFavoritesPicker.hidden=false;
          }
          function stopFavoriteOptionEvent(event){
            var button=event.target&&event.target.closest?event.target.closest('[data-profile-favorite-option]'):null;
            if(!button)return null;
            event.preventDefault();
            event.stopPropagation();
            if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
            return button;
          }
          profileFavoritesPickerBody.addEventListener('pointerdown',function(event){
            stopFavoriteOptionEvent(event);
          });
          profileFavoritesPickerBody.addEventListener('pointerup',function(event){
            var button=stopFavoriteOptionEvent(event);
            if(!button||event.pointerType==='mouse')return;
            profileFavoriteTouchHandledUntil=Date.now()+700;
            toggleProfileFavoriteOption(Number(button.dataset.profileFavoriteOption));
            keepFavoritePickerInProfile();
          });
          profileFavoritesPickerBody.addEventListener('click',function(event){
            var button=stopFavoriteOptionEvent(event);
            if(!button)return;
            if(Date.now()<profileFavoriteTouchHandledUntil)return;
            toggleProfileFavoriteOption(Number(button.dataset.profileFavoriteOption));
            keepFavoritePickerInProfile();
          });
        }
        profileFavoritesPicker.addEventListener('click',function(event){
          var option=event.target&&event.target.closest?event.target.closest('[data-profile-favorite-option]'):null;
          if(option){
            event.preventDefault();
            event.stopPropagation();
            if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
            if(Date.now()>=profileFavoriteTouchHandledUntil){
              toggleProfileFavoriteOption(Number(option.dataset.profileFavoriteOption));
            }
            restoreProfileFavoritesContext();
            return;
          }
          if(event.target===profileFavoritesPicker)closeProfileFavoritesPicker();
        },true);
        document.addEventListener('keydown',function(event){if(event.key==='Escape'&&profileFavoritesPicker&&!profileFavoritesPicker.hidden){event.preventDefault();closeProfileFavoritesPicker();}});
      }
    }

    function renderProfileSaved(){
      if(!profileSavedSection||!profileSavedGrid)return;
      var ownProfile=isOwnProfileView();
      var publicReady=viewedProfileStatus==='ready'&&viewedProfile;
      profileSavedSection.hidden=!publicReady;
      if(!publicReady){profileSavedItems=[];profileSavedGrid.innerHTML='';if(profileSavedCount)profileSavedCount.textContent='';return;}
      if(ownProfile){
        try{profileSavedItems=typeof window.beGetSavedContents==='function'?window.beGetSavedContents():[];}catch(error){(void 0);profileSavedItems=[];}
      }else profileSavedItems=Array.isArray(viewedProfile.savedContents)?viewedProfile.savedContents.map(normalizeProfileFavorite).slice(0,20):[];
      profileSavedItems=profileSavedItems.map(function(item){return normalizeProfileFavorite(trustedProfileContent(item));});
      if(profileSavedCount)profileSavedCount.textContent=profileSavedItems.length?(profileSavedItems.length+' '+(profileSavedItems.length===1?'salvo':'salvos')):'';
      if(!profileSavedItems.length){
        profileSavedGrid.innerHTML='<div class="profile-saved-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg><strong>Nenhum conteúdo salvo ainda</strong><span>'+(ownProfile?'Os conteúdos e álbuns em que você tocar no coração aparecerão aqui.':'Esta pessoa ainda não possui conteúdos salvos no perfil.')+'</span></div>';
        return;
      }
      profileSavedGrid.innerHTML=profileSavedItems.map(function(item,index){
        var image=item.imageUrl||item.bannerUrl||'';
        var isAlbum=String(item.collection||'').toLowerCase()==='albums';
        var meta=[isAlbum?'Álbum':'',item.year,item.duration].filter(Boolean).join(' • ');
        return '<button class="profile-saved-card'+(isAlbum?' is-album':'')+'" type="button" data-saved-index="'+index+'" aria-label="Abrir '+escapePublic(item.title||'conteúdo salvo')+'">'
          +'<span class="profile-saved-thumb">'+(image?'<img decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(image):image)+'" alt="">':'<span class="profile-saved-placeholder" aria-hidden="true"></span>')+'<span class="profile-saved-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7Z"></path></svg></span></span>'
          +'<span class="profile-saved-copy"><strong class="notranslate" translate="no">'+escapePublic(item.title||'Conteúdo salvo')+'</strong>'+(meta?'<small>'+escapePublic(meta)+'</small>':'')+'</span>'
          +'</button>';
      }).join('');
    }

    function bindProfileSavedGrid(){
      if(!profileSavedGrid||profileSavedGrid.dataset.savedBound==='true')return;
      profileSavedGrid.dataset.savedBound='true';
      profileSavedGrid.addEventListener('click',function(event){
        var button=event.target.closest('[data-saved-index]');
        if(!button||!profileSavedGrid.contains(button))return;
        var item=profileSavedItems[Number(button.dataset.savedIndex)];
        if(!item)return;
        closePublicPages(false);
        if(typeof window.beOpenSavedContent==='function')window.beOpenSavedContent(trustedProfileContent(item));
      });
    }

    function normalizeProfileCommunityTag(value){
      var normalized=String(value||'').trim().toLowerCase();
      return normalized==='avocado'||normalized==='eyelash'||normalized==='blohsh'||normalized==='billie_fan'||normalized==='boaf'?normalized:'';
    }
    function profileCommunityTagMeta(value){
      var tag=normalizeProfileCommunityTag(value);
      if(tag==='avocado')return {label:'Avocado',className:'is-avocado'};
      if(tag==='eyelash')return {label:'Eyelash',className:'is-eyelash'};
      if(tag==='blohsh')return {label:'Blohsh',className:'is-blohsh'};
      if(tag==='billie_fan')return {label:localizedProfileText('Fã da Billie'),className:'is-billie-fan'};
      if(tag==='boaf')return {label:'BOAF',className:'is-boaf'};
      return null;
    }
    function renderProfileAwardTags(profile){
      if(!profilePageAwardTags)return;
      var raw=profile&&(profile.communityTag||profile.community_tag)||'';
      if(isOwnProfileView()&&auth.currentUser&&auth.currentUser.uid){
        try{raw=localStorage.getItem('beCommunityTag:'+String(auth.currentUser.uid))||raw;}catch(_){ }
      }
      var meta=profileCommunityTagMeta(raw);
      if(!meta){profilePageAwardTags.innerHTML='';profilePageAwardTags.hidden=true;profilePageAwardTags.setAttribute('hidden','');return;}
      profilePageAwardTags.innerHTML='<span class="profile-award-tag '+meta.className+' notranslate" translate="no">'+escapePublic(meta.label)+'</span>';
      profilePageAwardTags.hidden=false;profilePageAwardTags.removeAttribute('hidden');
    }

    function renderProfilePage(){
      if(isConfigRoute()||document.body.classList.contains('settings-page-active')){
        if(profilePage){profilePage.hidden=true;profilePage.setAttribute('hidden','');profilePage.setAttribute('aria-hidden','true');}
        return;
      }
      updateProfileActionVisibility();
      var handle=profileRouteUsername()||beBackend.normalizeUsername((viewedProfile&&viewedProfile.username)||(currentProfile&&currentProfile.username)||'perfil');
      if(viewedProfileStatus==='loading'){renderProfileState('Carregando perfil',handle,'');return;}
      if(viewedProfileStatus==='missing'){renderProfileState('Perfil não encontrado',handle,'Confira o link e tente novamente.');return;}
      if(viewedProfileStatus==='error'){renderProfileState('Não foi possível carregar',handle,'Verifique sua conexão e tente novamente.');var retry=document.createElement('button');retry.type='button';retry.className='profile-btn';retry.textContent='Tentar novamente';retry.onclick=function(){openPublicProfile(false,handle);};profilePageMemberSince.appendChild(retry);return;}
      var profile=viewedProfile;
      if(!profile){renderProfileState('Perfil não encontrado',handle,'');return;}
      applyProfileTheme(profile);
      var ownProfile=isOwnProfileView();
      if(profileInlineEditing&&!ownProfile)stopInlineProfileEdit(false);
      var displayName=profile.displayName||(ownProfile&&auth.currentUser&&auth.currentUser.displayName)||'Usuário';
      var avatar=ownProfile?selectedProfileAvatar(profile):String(profile.avatarUrl||'');
      var banner=ownProfile&&auth.currentUser?resolvedProfileBanner(auth.currentUser).bannerUrl:String(profile.bannerUrl||'');
      setLiteralText(profilePageName,(profileInlineEditing&&ownProfile&&profileInlineDraftName)?profileInlineDraftName:displayName);
      setLiteralText(profilePageHandle,'@'+(profile.username||handle||'perfil'));
      renderProfileAwardTags(profile);
      syncInlineTagButtonVisibility();
      profilePageBadge.textContent='Perfil';
      profilePageMetaLabel.textContent='Perfil público';
      profilePageMemberSince.textContent='Membro desde '+publicProfileYear(profile);
      renderProfileSocials(profile);
      updateProfileFollowStatButtons(profile);
      if(profileLikeState.username!==beBackend.normalizeUsername(profile.username||handle))profileLikeState={username:beBackend.normalizeUsername(profile.username||handle),liked:false,count:profileLikeCount(profile.likesReceived),loading:false};
      renderProfileLikeUi();
      refreshProfileFollowState(false);
      setProfilePageAvatar(avatar);
      applyProfileBanner(banner);
      renderProfileFavorites();
      renderProfileLovedAlbums();
      renderProfileSaved();
      bindProfileFavorites();
      bindProfileLovedAlbums();
      bindProfileSavedGrid();
    }

    function settingsDeviceIcon(type){
      if(type==='tv')return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="13" rx="2"></rect><path d="M8 21h8M12 18v3"></path></svg>';
      if(type==='mobile')return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.3"></rect><path d="M10.5 5h3M11 18.5h2"></path></svg>';
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"></rect><path d="M8 21h8M12 17v4"></path></svg>';
    }
    function settingsDeviceDate(value){
      var date=new Date(value||Date.now());if(Number.isNaN(date.getTime()))date=new Date();
      var locale=String(window.BETVI18n&&window.BETVI18n.locale||'pt-BR');
      try{return new Intl.DateTimeFormat(locale,{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date);}catch(_){return date.toLocaleString();}
    }
    async function disconnectSyncedAccountDevice(userId,deviceId){
      if(!userId||!deviceId||!beBackend.preferences)return;
      var remote=await beBackend.preferences.get(userId,{force:true});
      var data=normalizeCrossDeviceData(remote&&remote.data||captureCrossDeviceData(userId));
      var found=false,stamp=beBackend.now();
      data.accountDevices=normalizeAccountDevices(data.accountDevices.map(function(item){
        if(item.id!==deviceId)return item;found=true;return {...item,active:false,disconnectedAt:stamp,lastSeen:item.lastSeen||stamp};
      }));
      if(!found)data.accountDevices.push({id:deviceId,type:'pc',name:'Dispositivo',active:false,lastSeen:stamp,disconnectedAt:stamp});
      data.updatedAt=stamp;
      await beBackend.preferences.save(userId,data);
      applyCrossDeviceData(data,userId,'device-disconnect');
    }
    async function renderSettingsDevices(){
      var list=document.getElementById('settingsDevicesList');if(!list)return;
      var user=auth.currentUser;if(!user||!user.uid){list.innerHTML='<div class="settings-devices-empty">'+escapePublic(localizedProfileText('Entre para ver seus dispositivos.'))+'</div>';return;}
      try{await refreshAccountDeviceIdentity(user.uid);}catch(_){ }
      var localDevices=ensureCurrentAccountDevice(user.uid,readAccountDevices(user.uid)).filter(function(item){return item.active!==false;});
      var brands=readTvDeviceBrands(user.uid);
      list.innerHTML='<div class="settings-devices-loading">'+escapePublic(localizedProfileText('Carregando dispositivos…'))+'</div>';
      var tvRows=[];
      try{
        var client=beBackend.client;
        if(client&&typeof client.rpc==='function'){
          var response=await client.rpc('tv_my_sessions');
          if(!response.error)tvRows=Array.isArray(response.data)?response.data:[];
        }
      }catch(_){ }
      var nowMs=Date.now();
      tvRows=tvRows.filter(function(row){var seen=Date.parse(row&&row.last_seen_at||'')||0;return row&&String(row.status||'')==='paired'&&(!seen||nowMs-seen<3*60*1000);});
      var entries=[];
      tvRows.forEach(function(row){
        var media=row.current_media&&typeof row.current_media==='object'?row.current_media:{};
        var known=brands[String(row.session_id||'')]||{};
        var name=String(known.name||media.deviceBrand||media.tvBrand||media.deviceName||localizedProfileText('Smart TV')).trim();
        entries.push({kind:'tv',id:String(row.session_id||''),type:'tv',name:name,date:row.last_seen_at||row.updated_at||new Date().toISOString(),current:false});
      });
      localDevices.forEach(function(item){var deviceName=String(item.name||'').trim();if(item.type==='mobile'&&(!deviceName||deviceName==='Celular'||genericMobileModel(deviceName)))deviceName=localizedProfileText('Celular');else if(!deviceName)deviceName=localizedProfileText('Computador');entries.push({kind:'account',id:item.id,type:item.type,name:deviceName,date:item.lastSeen||new Date().toISOString(),current:item.id===accountDeviceId()});});
      entries.sort(function(a,b){return (Date.parse(b.date)||0)-(Date.parse(a.date)||0);});
      if(!entries.length){list.innerHTML='<div class="settings-devices-empty">'+escapePublic(localizedProfileText('Nenhum dispositivo ativo encontrado.'))+'</div>';return;}
      list.innerHTML=entries.map(function(item){
        return '<div class="settings-device-item" data-device-kind="'+escapePublic(item.kind)+'" data-device-id="'+escapePublic(item.id)+'">'
          +'<span class="settings-device-icon is-'+escapePublic(item.type)+'">'+settingsDeviceIcon(item.type)+'</span>'
          +'<span class="settings-device-copy"><strong>'+escapePublic(item.name)+(item.current?'<em>'+escapePublic(localizedProfileText('Este dispositivo'))+'</em>':'')+'</strong><small>'+escapePublic(settingsDeviceDate(item.date))+'</small></span>'
          +'<button class="settings-device-disconnect" type="button">'+escapePublic(localizedProfileText('Desconectar'))+'</button>'
          +'</div>';
      }).join('');
      list.querySelectorAll('.settings-device-disconnect').forEach(function(button){button.onclick=async function(){
        var row=button.closest('.settings-device-item');if(!row||button.disabled)return;
        button.disabled=true;button.textContent=localizedProfileText('Desconectando…');
        try{
          if(row.dataset.deviceKind==='tv'){
            var client=beBackend.client;if(!client||typeof client.rpc!=='function')throw new Error('tv_unavailable');
            var result=await client.rpc('tv_disconnect_session',{p_session_id:row.dataset.deviceId});if(result&&result.error)throw result.error;
          }else{
            var disconnectingCurrent=row.dataset.deviceId===accountDeviceId();
            await disconnectSyncedAccountDevice(user.uid,row.dataset.deviceId);
            if(disconnectingCurrent){
              try{localStorage.setItem('beRemoteDeviceDisconnect','1');}catch(_){ }
              try{await auth.signOut();}finally{try{localStorage.removeItem('beRemoteDeviceDisconnect');}catch(_){ }}
              showLogin();setMode('email');return;
            }
          }
          await renderSettingsDevices();
        }catch(_){button.disabled=false;button.textContent=localizedProfileText('Desconectar');}
      };});
      if(window.BETVI18n&&typeof window.BETVI18n.apply==='function')window.BETVI18n.apply(list);
    }
    var accountDeviceActivitySyncAt=0;
    window.BETVAccountDevices={
      refresh:function(){if(auth.currentUser&&auth.currentUser.uid){ensureCurrentAccountDevice(auth.currentUser.uid,readAccountDevices(auth.currentUser.uid));scheduleCrossDeviceSync('device-activity');accountDeviceActivitySyncAt=Date.now();}},
      disconnectCurrent:async function(){var user=auth.currentUser;if(!user||!user.uid)return;try{if(localStorage.getItem('beRemoteDeviceDisconnect')==='1')return;}catch(_){ }var current=readAccountDevices(user.uid).find(function(item){return item.id===accountDeviceId();});if(current&&current.active===false)return;await disconnectSyncedAccountDevice(user.uid,accountDeviceId());}
    };
    window.addEventListener('focus',function(){if(auth.currentUser&&Date.now()-accountDeviceActivitySyncAt>6*60*60*1000)window.BETVAccountDevices.refresh();},{passive:true});

    function renderSettingsPage(){
      var user=auth.currentUser;
      if(!user){
        settingsPageBody.innerHTML='<div class="settings-card"><h2>Entre para continuar</h2><p>Faça login para editar sua conta e personalizar o perfil.</p><div class="settings-btn-row"><button class="settings-button primary" id="settingsLoginAction" type="button">Entrar</button></div></div>';
        document.getElementById('settingsLoginAction').onclick=function(){closePublicPages();window.BETVPublicRoutes.go('/login');document.body.classList.add('login-mode');};
        return;
      }
      var avatar=selectedProfileAvatar(currentProfile);
      var bannerState=resolvedProfileBanner(user);
      var banner=bannerState.bannerUrl;
      var identities=user&&user.raw&&Array.isArray(user.raw.identities)?user.raw.identities:[];
      var providers=user&&user.raw&&user.raw.app_metadata&&Array.isArray(user.raw.app_metadata.providers)?user.raw.app_metadata.providers:[];
      var discordConnected=providers.indexOf('discord')>=0||identities.some(function(identity){return String(identity.provider||'').toLowerCase()==='discord';});
      var storedSocialLinks=readProfileSocialLinks(user.uid);
      var socialLinks=hasProfileSocialLinks(storedSocialLinks)?storedSocialLinks:normalizeProfileSocialLinks(currentProfile&&currentProfile.socialLinks);
      var profileColor=normalizeProfileColorValue((currentProfile&&currentProfile.profileColor)||readProfileColorValue(user.uid,'profile'));
      var avatarBorderColor=normalizeProfileColorValue((currentProfile&&currentProfile.avatarBorderColor)||readProfileColorValue(user.uid,'avatar-border'));
      var profileColorControls=profileColorSettingsMarkup(profileColor,avatarBorderColor);
      var settingsTabs=['profile','connections','devices','language','session','data'];
      if(settingsActiveTab==='socials')settingsActiveTab='connections';
      if(settingsActiveTab==='account')settingsActiveTab='session';
      if(settingsTabs.indexOf(settingsActiveTab)<0)settingsActiveTab='profile';
      settingsPageBody.innerHTML=''
        +'<div class="settings-legal-layout">'
        +  '<nav class="settings-page-nav" aria-label="Seções das configurações">'
        +    '<button type="button" data-settings-tab="profile"'+(settingsActiveTab==='profile'?' class="active" aria-current="page"':'')+'>Perfil</button>'
        +    '<button type="button" data-settings-tab="connections"'+(settingsActiveTab==='connections'?' class="active" aria-current="page"':'')+'>Conexões e Redes Sociais</button>'
        +    '<button type="button" data-settings-tab="devices"'+(settingsActiveTab==='devices'?' class="active" aria-current="page"':'')+'>Meus Dispositivos</button>'
        +    '<button type="button" data-settings-tab="language"'+(settingsActiveTab==='language'?' class="active" aria-current="page"':'')+'>Idioma</button>'
        +    '<button type="button" data-settings-tab="session"'+(settingsActiveTab==='session'?' class="active" aria-current="page"':'')+'>Conta e Sessão</button>'
        +    '<button type="button" data-settings-tab="data"'+(settingsActiveTab==='data'?' class="active" aria-current="page"':'')+'>Meus Dados</button>'
        +  '</nav>'
        +  '<main class="settings-page-content">'
        +    '<section class="settings-section-panel settings-profile-panel" data-settings-panel="profile"'+(settingsActiveTab==='profile'?'':' hidden')+'><h1>Perfil</h1><p class="settings-panel-lead">Escolha o banner, o avatar e as cores do seu perfil.</p><div class="settings-panel-card"><div class="settings-banner-preview">'+(banner?'<img loading="eager" fetchpriority="high" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(banner):banner)+'" alt="Banner atual">':'')+'<span>'+(banner?'Banner selecionado':'Nenhum banner selecionado')+'</span></div><div class="settings-avatar-row"><div class="settings-avatar-preview'+(avatarBorderColor?' has-custom-ring':'')+'"'+(avatarBorderColor?' style="--settings-avatar-ring:'+avatarBorderColor+'"':'')+'>'+(avatar?'<img loading="eager" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(avatar):avatar)+'" alt="Avatar atual">':profileFallbackAvatar())+'</div><div><strong class="settings-avatar-title">Avatar atual</strong><span class="settings-muted">Atualize sua imagem principal do perfil.</span></div></div><div class="settings-btn-row settings-profile-actions"><button class="settings-button primary" id="settingsChooseBanner" type="button">Escolher banner</button><button class="settings-button" id="settingsChooseAvatar" type="button">Trocar avatar</button></div><div class="settings-status" id="settingsAppearanceStatus"></div>'+profileColorControls+'</div></section>'
        +    '<section class="settings-section-panel settings-connections-panel" data-settings-panel="connections"'+(settingsActiveTab==='connections'?'':' hidden')+'><h1>Conexões e Redes Sociais</h1><p class="settings-panel-lead">Gerencie sua conexão de conta e as redes exibidas no perfil público.</p><div class="settings-panel-card"><div class="settings-social-heading"><h2>Conexões conectadas</h2><p>Gerencie os serviços vinculados à sua conta.</p></div><div class="settings-connection"><div><strong>Discord</strong><span class="settings-muted">'+(discordConnected?'Sua conta Discord está conectada.':'Use sua identidade do Discord na plataforma.')+'</span></div><button class="settings-button" id="settingsConnectDiscord" type="button" '+(discordConnected?'disabled':'')+'><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.54 5.34A16.4 16.4 0 0 0 15.44 4l-.5 1.04a15.1 15.1 0 0 0-5.87 0L8.56 4a16.6 16.6 0 0 0-4.11 1.35C1.85 9.2 1.15 12.96 1.5 16.66a16.6 16.6 0 0 0 5.04 2.55l1.23-1.67c-.68-.26-1.33-.58-1.94-.96l.47-.36c3.72 1.72 7.76 1.72 11.44 0l.48.36c-.62.38-1.27.7-1.95.96l1.23 1.67a16.5 16.5 0 0 0 5.03-2.55c.42-4.29-.72-8.01-2.99-11.32ZM8.68 14.5c-1.12 0-2.04-1.03-2.04-2.3 0-1.27.9-2.3 2.04-2.3 1.15 0 2.06 1.04 2.04 2.3 0 1.27-.9 2.3-2.04 2.3Zm6.64 0c-1.12 0-2.04-1.03-2.04-2.3 0-1.27.9-2.3 2.04-2.3 1.15 0 2.06 1.04 2.04 2.3 0 1.27-.89 2.3-2.04 2.3Z"/></svg><span>'+(discordConnected?'Discord conectado':'Conectar Discord')+'</span></button></div><div class="settings-status" id="settingsDiscordStatus"></div></div><div class="settings-panel-card settings-social-card"><div class="settings-social-heading"><h2>Redes sociais</h2><p>Adicione as redes que devem aparecer ao lado do seu nome no perfil público.</p></div><form id="settingsSocialForm"><div class="settings-social-fields"><div class="settings-social-field"><label for="settingsSocialX"><span class="settings-social-brand is-x">'+profileSocialIcon('x')+'</span><span>X</span></label><div class="settings-social-input-wrap"><span class="settings-social-prefix">x.com/</span><input id="settingsSocialX" name="x" type="text" maxlength="80" autocomplete="off" autocapitalize="none" spellcheck="false" value="'+escapePublic(socialLinks.x||'')+'" placeholder="usuario"></div></div><div class="settings-social-field"><label for="settingsSocialInstagram"><span class="settings-social-brand is-instagram">'+profileSocialIcon('instagram')+'</span><span>Instagram</span></label><div class="settings-social-input-wrap"><span class="settings-social-prefix">instagram.com/</span><input id="settingsSocialInstagram" name="instagram" type="text" maxlength="100" autocomplete="off" autocapitalize="none" spellcheck="false" value="'+escapePublic(socialLinks.instagram||'')+'" placeholder="usuario"></div></div><div class="settings-social-field"><label for="settingsSocialTikTok"><span class="settings-social-brand is-tiktok">'+profileSocialIcon('tiktok')+'</span><span>TikTok</span></label><div class="settings-social-input-wrap"><span class="settings-social-prefix">tiktok.com/@</span><input id="settingsSocialTikTok" name="tiktok" type="text" maxlength="80" autocomplete="off" autocapitalize="none" spellcheck="false" value="'+escapePublic(socialLinks.tiktok||'')+'" placeholder="usuario"></div></div></div><div class="settings-status" id="settingsSocialStatus"></div><div class="settings-btn-row settings-social-actions"><button class="settings-button primary" type="submit">Salvar redes sociais</button></div></form></div></section>'
        +    '<section class="settings-section-panel settings-devices-panel" data-settings-panel="devices"'+(settingsActiveTab==='devices'?'':' hidden')+'><h1>Meus Dispositivos</h1><p class="settings-panel-lead">Apenas dispositivos ativos vinculados à sua conta aparecem aqui.</p><div class="settings-devices-list" id="settingsDevicesList"><div class="settings-devices-loading">Carregando dispositivos…</div></div></section>'
        +    '<section class="settings-section-panel settings-data-panel" data-settings-panel="data"'+(settingsActiveTab==='data'?'':' hidden')+'><h1>Meus Dados</h1><p class="settings-panel-lead">Baixe uma cópia das informações essenciais da sua conta e do seu perfil.</p><div class="settings-data-actions settings-data-actions-outside"><button class="settings-button settings-export-button" id="settingsExportData" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Exportar meus dados</span></button><a class="settings-data-privacy-button" href="/privacy">Ver Termos de Privacidade</a></div><div class="settings-status settings-data-status" id="settingsExportStatus"></div></section>'
        +    '<section class="settings-section-panel settings-language-panel" data-settings-panel="language"'+(settingsActiveTab==='language'?'':' hidden')+'><h1>Idioma</h1><p class="settings-panel-lead">Escolha o idioma usado em todas as áreas públicas do site.</p><div class="settings-panel-card"><div class="settings-language-options" role="radiogroup" aria-label="Idioma do site"><button class="settings-language-option" type="button" data-settings-language="pt-br" role="radio"><strong>Português (Brasil)</strong><span>Português</span></button><button class="settings-language-option" type="button" data-settings-language="en-us" role="radio"><strong>English (United States)</strong><span>Inglês</span></button><button class="settings-language-option" type="button" data-settings-language="es" role="radio"><strong>Español</strong><span>Espanhol</span></button><button class="settings-language-option" type="button" data-settings-language="fr" role="radio"><strong>Français</strong><span>Francês</span></button><button class="settings-language-option" type="button" data-settings-language="it" role="radio"><strong>Italiano</strong><span>Italiano</span></button></div><p class="settings-muted settings-language-note">A página será recarregada no idioma escolhido e sua preferência ficará salva neste dispositivo.</p></div></section>'
        +    '<section class="settings-section-panel settings-session-panel" data-settings-panel="session"'+(settingsActiveTab==='session'?'':' hidden')+'><h1>Conta</h1><p class="settings-panel-lead">Altere o nome exibido e o @ do seu perfil.</p><div class="settings-panel-card"><form id="settingsAccountForm"><div class="settings-form-grid"><div class="settings-field"><label>Nome</label><input class="notranslate" translate="no" name="displayName" maxlength="50" required value="'+escapePublic(currentProfile.displayName||user.displayName||'')+'"></div><div class="settings-field"><label>@</label><input class="notranslate" translate="no" name="username" maxlength="20" pattern="[a-z0-9._]{3,20}" required value="'+escapePublic(currentProfile.username||'')+'" placeholder="'+escapePublic(localizedProfileText('seunome'))+'"></div></div><div class="settings-status" id="settingsAccountStatus"></div><div class="settings-btn-row"><button class="settings-button primary" type="submit">Salvar alterações</button></div></form></div><div class="settings-panel-card settings-security-card"><div class="settings-security-row"><div class="settings-security-copy"><strong>Verificação em duas etapas</strong><span class="settings-muted" id="settingsMfaDescription">Adicione uma camada extra de segurança usando um aplicativo autenticador.</span></div><div class="settings-security-actions"><button class="settings-button primary" id="settingsMfaToggle" type="button" disabled>Verificando…</button><button class="settings-security-forgot" id="settingsForgotPassword" type="button">Esqueci a senha</button></div></div><div class="settings-mfa-setup" id="settingsMfaSetup" hidden><div class="settings-mfa-qr"><img id="settingsMfaQr" alt="QR Code para configurar o aplicativo autenticador" hidden><span id="settingsMfaQrFallback">QR Code</span></div><div class="settings-mfa-setup-copy"><strong>Configure seu autenticador</strong><p>Escaneie o QR Code no Google Authenticator, Microsoft Authenticator, Authy ou outro app compatível.</p><div class="settings-mfa-secret-row"><span>Chave manual</span><code class="notranslate" translate="no" id="settingsMfaSecret"></code></div><form id="settingsMfaVerifyForm"><div class="settings-field"><label for="settingsMfaCode">Código de 6 dígitos</label><input id="settingsMfaCode" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required placeholder="000000"></div><div class="settings-btn-row settings-mfa-verify-actions"><button class="settings-button primary" type="submit">Confirmar e ativar</button><button class="settings-button" id="settingsMfaCancel" type="button">Cancelar</button></div></form></div></div><div class="settings-status" id="settingsMfaStatus"></div></div><div class="settings-session-section"><h1>Sessão</h1><p class="settings-panel-lead">Saia desta conta ou exclua permanentemente seu acesso e perfil.</p><div class="settings-btn-row settings-session-actions"><button class="settings-danger" id="settingsDeleteAccount" type="button">Excluir conta</button><button class="settings-button" id="settingsLogoutAccount" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Sair da conta</span></button></div><div class="settings-status settings-session-status" id="settingsDeleteStatus"></div></div></section>'
        +  '</main>'
        +'</div>';
      if(window.BETVI18n&&typeof window.BETVI18n.apply==='function')window.BETVI18n.apply(settingsPageBody);
      function activateSettingsTab(tab,moveToTop){
        if(settingsTabs.indexOf(tab)<0)tab='profile';
        settingsActiveTab=tab;
        try{sessionStorage.setItem(SETTINGS_TAB_SESSION_KEY,tab);}catch(_){ }
        settingsPageBody.querySelectorAll('[data-settings-tab]').forEach(function(button){
          var active=button.getAttribute('data-settings-tab')===tab;
          button.classList.toggle('active',active);
          if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
        });
        settingsPageBody.querySelectorAll('[data-settings-panel]').forEach(function(panel){
          var active=panel.getAttribute('data-settings-panel')===tab;
          panel.hidden=!active;
          panel.setAttribute('aria-hidden',active?'false':'true');
        });
        if(tab==='devices')window.setTimeout(renderSettingsDevices,0);
        if(moveToTop&&settingsPage){settingsPage.scrollTop=0;}
      }
      settingsPageBody.querySelectorAll('[data-settings-tab]').forEach(function(button){
        button.onclick=function(event){
          if(event){
            event.preventDefault();
            event.stopPropagation();
            if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
          }
          var tab=button.getAttribute('data-settings-tab');
          activateSettingsTab(tab,true);


          keepSettingsOpen();
          try{
            var configUrl='/config'+(location.search||'');
            var state={...(history.state||{}),beRoute:'config',settingsTab:tab};
            history.replaceState(state,'',configUrl);
          }catch(_){ }
        };
      });
      activateSettingsTab(settingsActiveTab,false);
      var activeLanguage=String(window.BETVLocale&&window.BETVLocale.slug||'pt-br');
      settingsPageBody.querySelectorAll('[data-settings-language]').forEach(function(button){
        var selected=button.getAttribute('data-settings-language')===activeLanguage;
        button.classList.toggle('active',selected);
        button.setAttribute('aria-checked',selected?'true':'false');
        button.onclick=function(){
          var next=button.getAttribute('data-settings-language');
          if(next===activeLanguage)return;
          button.disabled=true;
          if(window.BETVLocale&&typeof window.BETVLocale.switchTo==='function')window.BETVLocale.switchTo(next);
          else location.assign('/'+next+(window.BETVLocalePath&&window.BETVLocalePath()!=='/'?window.BETVLocalePath():'')+(location.search||''));
        };
      });
      document.getElementById('settingsChooseAvatar').onclick=function(){openAvatarPicker();};
      document.getElementById('settingsChooseBanner').onclick=function(){openBannerPicker();};
      bindProfileColorSettings(user);
      document.getElementById('settingsConnectDiscord').onclick=async function(){
        var msg=document.getElementById('settingsDiscordStatus');
        if(discordConnected){msg.textContent='Discord já está conectado.';msg.className='settings-status ok';return;}
        this.disabled=true;msg.textContent='Abrindo conexão com Discord…';msg.className='settings-status';
        try{sessionStorage.setItem('beOpenSettingsAfterDiscord','1');await auth.connectDiscord();msg.textContent='Redirecionando para o Discord…';msg.className='settings-status ok';}
        catch(error){msg.textContent=localizedProfileText('Não foi possível conectar:')+' '+localizedProfileText(error&&error.message?error.message:'Tente novamente.');msg.className='settings-status err';this.disabled=false;}
      };
      var socialForm=document.getElementById('settingsSocialForm');
      if(socialForm)socialForm.addEventListener('submit',async function(event){
        event.preventDefault();
        var form=event.currentTarget;
        var msg=document.getElementById('settingsSocialStatus');
        var submit=form.querySelector('[type="submit"]');
        var rawX=String(form.x.value||'').trim();
        var rawInstagram=String(form.instagram.value||'').trim();
        var rawTikTok=String(form.tiktok.value||'').trim();
        var x=normalizeProfileSocialValue('x',rawX);
        var instagram=normalizeProfileSocialValue('instagram',rawInstagram);
        var tiktok=normalizeProfileSocialValue('tiktok',rawTikTok);
        if(rawX&&!x){msg.textContent='Informe um usuário válido do X, como x.com/usuario.';msg.className='settings-status err';return;}
        if(rawInstagram&&!instagram){msg.textContent='Informe um usuário válido do Instagram, como instagram.com/usuario.';msg.className='settings-status err';return;}
        if(rawTikTok&&!tiktok){msg.textContent='Informe um usuário válido do TikTok, como tiktok.com/@usuario.';msg.className='settings-status err';return;}
        submit.disabled=true;msg.textContent='Salvando redes sociais…';msg.className='settings-status';
        var links=writeProfileSocialLinks(user.uid,{x:x,instagram:instagram,tiktok:tiktok});
        currentProfile={...(currentProfile||{}),socialLinks:links};
        if(viewedProfile&&isOwnProfileView())viewedProfile={...viewedProfile,socialLinks:links};
        form.x.value=links.x;form.instagram.value=links.instagram;form.tiktok.value=links.tiktok;
        try{
          await persistCrossDeviceData('profile-socials');
          if(settingsSyncState==='error'){msg.textContent='Redes sociais salvas neste aparelho. A sincronização será tentada novamente.';msg.className='settings-status err';}
          else{msg.textContent='Redes sociais salvas no perfil.';msg.className='settings-status ok';showSettingsSaved();}
        }catch(error){
          msg.textContent='As redes sociais foram salvas neste aparelho, mas a sincronização falhou.';msg.className='settings-status err';
        }finally{submit.disabled=false;}
      });
      var settingsMfaEnrollment=null;
      var settingsMfaToggle=document.getElementById('settingsMfaToggle');
      var settingsMfaSetup=document.getElementById('settingsMfaSetup');
      var settingsMfaStatus=document.getElementById('settingsMfaStatus');
      var settingsMfaDescription=document.getElementById('settingsMfaDescription');
      var settingsMfaQr=document.getElementById('settingsMfaQr');
      var settingsMfaQrFallback=document.getElementById('settingsMfaQrFallback');
      var settingsMfaSecret=document.getElementById('settingsMfaSecret');
      var settingsMfaVerifyForm=document.getElementById('settingsMfaVerifyForm');
      var settingsForgotPassword=document.getElementById('settingsForgotPassword');
      function setSettingsMfaStatus(message,type){if(!settingsMfaStatus)return;settingsMfaStatus.textContent=message||'';settingsMfaStatus.className='settings-status '+(type||'');}
      function closeSettingsMfaSetup(){settingsMfaEnrollment=null;if(settingsMfaSetup)settingsMfaSetup.hidden=true;if(settingsMfaQr){settingsMfaQr.hidden=true;settingsMfaQr.removeAttribute('src');}if(settingsMfaQrFallback)settingsMfaQrFallback.hidden=false;if(settingsMfaSecret)settingsMfaSecret.textContent='';if(settingsMfaVerifyForm)settingsMfaVerifyForm.reset();}
      async function refreshSettingsMfa(){
        if(!settingsMfaToggle)return;
        if(typeof auth.getMfaStatus!=='function'){settingsMfaToggle.disabled=true;settingsMfaToggle.textContent='Indisponível';if(settingsMfaDescription)settingsMfaDescription.textContent='A verificação em duas etapas requer a autenticação online do site.';return;}
        settingsMfaToggle.disabled=true;settingsMfaToggle.textContent='Verificando…';
        try{
          var status=await auth.getMfaStatus();
          if(!status.supported){settingsMfaToggle.textContent='Indisponível';if(settingsMfaDescription)settingsMfaDescription.textContent='A verificação em duas etapas não está disponível nesta conta.';return;}
          settingsMfaToggle.dataset.enabled=status.enabled?'true':'false';
          settingsMfaToggle.dataset.factorId=status.factor&&status.factor.id?String(status.factor.id):'';
          settingsMfaToggle.textContent=status.enabled?'Desativar':'Ativar';
          settingsMfaToggle.classList.toggle('primary',!status.enabled);
          if(settingsMfaDescription)settingsMfaDescription.textContent=status.enabled?'Ativada. O código do autenticador será solicitado apenas ao entrar com e-mail e senha.':'Adicione uma camada extra de segurança usando um aplicativo autenticador.';
          settingsMfaToggle.disabled=false;
        }catch(error){settingsMfaToggle.textContent='Tentar novamente';settingsMfaToggle.disabled=false;setSettingsMfaStatus(error&&error.message?error.message:'Não foi possível verificar a segurança da conta.','err');}
      }
      if(settingsMfaToggle)settingsMfaToggle.onclick=async function(){
        if(settingsMfaToggle.disabled)return;
        var enabled=settingsMfaToggle.dataset.enabled==='true';
        settingsMfaToggle.disabled=true;setSettingsMfaStatus(enabled?'Desativando…':'Preparando autenticação…');
        if(enabled){
          if(!confirm(localizedProfileText('Desativar a verificação em duas etapas desta conta?'))) {settingsMfaToggle.disabled=false;setSettingsMfaStatus('');return;}
          try{await auth.disableMfa(settingsMfaToggle.dataset.factorId||'');closeSettingsMfaSetup();setSettingsMfaStatus('Verificação em duas etapas desativada.','ok');await refreshSettingsMfa();}
          catch(error){setSettingsMfaStatus(error&&error.message?error.message:'Não foi possível desativar agora.','err');settingsMfaToggle.disabled=false;}
          return;
        }
        try{
          settingsMfaEnrollment=await auth.beginMfaEnrollment();
          if(settingsMfaEnrollment&&settingsMfaEnrollment.alreadyEnabled){setSettingsMfaStatus('A verificação em duas etapas já está ativada.','ok');await refreshSettingsMfa();return;}
          if(!settingsMfaEnrollment||!settingsMfaEnrollment.factorId)throw new Error('Não foi possível criar o autenticador.');
          if(settingsMfaSetup)settingsMfaSetup.hidden=false;
          if(settingsMfaSecret)settingsMfaSecret.textContent=String(settingsMfaEnrollment.secret||'');
          if(settingsMfaQr&&settingsMfaEnrollment.qrCode){settingsMfaQr.src=String(settingsMfaEnrollment.qrCode);settingsMfaQr.hidden=false;if(settingsMfaQrFallback)settingsMfaQrFallback.hidden=true;}
          else if(settingsMfaQrFallback)settingsMfaQrFallback.hidden=false;
          settingsMfaToggle.textContent='Aguardando confirmação';
          setSettingsMfaStatus('Escaneie o QR Code e confirme com o código gerado pelo aplicativo.');
          var codeInput=document.getElementById('settingsMfaCode');if(codeInput)codeInput.focus({preventScroll:true});
        }catch(error){closeSettingsMfaSetup();setSettingsMfaStatus(error&&error.message?error.message:'Não foi possível iniciar a verificação em duas etapas.','err');await refreshSettingsMfa();}
      };
      if(settingsMfaVerifyForm)settingsMfaVerifyForm.addEventListener('submit',async function(event){
        event.preventDefault();
        var submit=event.submitter||settingsMfaVerifyForm.querySelector('[type="submit"]');
        var code=String(settingsMfaVerifyForm.elements.namedItem('code').value||'').replace(/\D/g,'').slice(0,6);
        settingsMfaVerifyForm.elements.namedItem('code').value=code;
        if(code.length!==6){setSettingsMfaStatus('Digite o código de 6 dígitos do aplicativo autenticador.','err');return;}
        if(!settingsMfaEnrollment||!settingsMfaEnrollment.factorId){setSettingsMfaStatus('Inicie a ativação novamente.','err');return;}
        if(submit)submit.disabled=true;setSettingsMfaStatus('Confirmando código…');
        try{await auth.verifyMfaEnrollment({factorId:settingsMfaEnrollment.factorId,code:code});closeSettingsMfaSetup();setSettingsMfaStatus('Verificação em duas etapas ativada com sucesso.','ok');await refreshSettingsMfa();}
        catch(error){setSettingsMfaStatus(error&&error.message?error.message:'Código inválido ou expirado.','err');}
        finally{if(submit)submit.disabled=false;}
      });
      var settingsMfaCancel=document.getElementById('settingsMfaCancel');
      if(settingsMfaCancel)settingsMfaCancel.onclick=async function(){var factorId=settingsMfaEnrollment&&settingsMfaEnrollment.factorId||'';closeSettingsMfaSetup();setSettingsMfaStatus('');try{if(factorId&&typeof auth.cancelMfaEnrollment==='function')await auth.cancelMfaEnrollment(factorId);}catch(_){ }await refreshSettingsMfa();};
      if(settingsForgotPassword)settingsForgotPassword.onclick=async function(){
        if(settingsForgotPassword.disabled)return;settingsForgotPassword.disabled=true;setSettingsMfaStatus('Enviando link para redefinir sua senha…');
        try{await auth.sendPasswordReset(user.email);setSettingsMfaStatus('Enviamos um link de redefinição para o e-mail da sua conta.','ok');}
        catch(error){setSettingsMfaStatus(error&&error.message?error.message:'Não foi possível enviar o link agora.','err');}
        finally{settingsForgotPassword.disabled=false;}
      };
      refreshSettingsMfa();
      document.getElementById('settingsExportData').onclick=async function(){
        var button=this;
        var msg=document.getElementById('settingsExportStatus');
        button.disabled=true;msg.textContent='Preparando seus dados…';msg.className='settings-status';
        try{
          var payload=await auth.exportAccount();
          var localData={};
          try{localData.featuredFavorites=JSON.parse(localStorage.getItem('beFeaturedFavorites')||'[]');}catch(_){localData.featuredFavorites=[];}
          try{localData.detailFavorites=JSON.parse(localStorage.getItem('beDetailFavorites')||'[]');}catch(_){localData.detailFavorites=[];}
          try{localData.preferences=JSON.parse(localStorage.getItem('beCookiePreferences')||'{}');}catch(_){localData.preferences={};}
          try{localData.savedContents=JSON.parse(localStorage.getItem('beSavedContents')||'[]');}catch(_){localData.savedContents=[];}
          try{localData.profileTopFavorites=JSON.parse(localStorage.getItem('beProfileTopFavorites:'+user.uid)||'[]');}catch(_){localData.profileTopFavorites=[];}
          try{localData.profileLovedAlbums=JSON.parse(localStorage.getItem('beProfileLovedAlbums:'+user.uid)||'[]');}catch(_){localData.profileLovedAlbums=[];}
          localData.profileSocialLinks=readProfileSocialLinks(user.uid);
          try{localData.communityRankingsPublic=localStorage.getItem('beCommunityRankingsPublic:'+user.uid)!=='false';}catch(_){localData.communityRankingsPublic=true;}
          localData.crossDeviceSync={enabled:beBackend.mode==='supabase',state:settingsSyncState,lastMessage:settingsSyncMessage};
          var exportData={
            exportedAt:payload.exportedAt||beBackend.now(),
            account:payload.account||null,
            profile:payload.profile||currentProfile||null,
            siteData:localData
          };
          var json=JSON.stringify(exportData,null,2);
          var blob=new Blob([json],{type:'application/json;charset=utf-8'});
          var link=document.createElement('a');
          var handle=String((currentProfile&&currentProfile.username)||(currentProfile&&currentProfile.displayName)||(user&&user.uid)||'usuario').replace(/[^a-z0-9_-]+/gi,'-');
          link.href=URL.createObjectURL(blob);link.download='dados-betv-'+handle+'.json';document.body.appendChild(link);link.click();link.remove();
          setTimeout(function(){URL.revokeObjectURL(link.href);},1000);
          msg.textContent='Arquivo exportado com sucesso.';msg.className='settings-status ok';
        }catch(error){msg.textContent=localizedProfileText('Não foi possível exportar:')+' '+localizedProfileText(error&&error.message?error.message:'Tente novamente.');msg.className='settings-status err';}
        finally{button.disabled=false;}
      };
      document.getElementById('settingsLogoutAccount').onclick=async function(){
        var msg=document.getElementById('settingsDeleteStatus');
        this.disabled=true;msg.textContent='Saindo da conta…';msg.className='settings-status';
        try{await auth.signOut();closePublicPages(false);showLogin();}
        catch(error){msg.textContent=localizedProfileText('Não foi possível sair:')+' '+localizedProfileText(error&&error.message?error.message:'Tente novamente.');msg.className='settings-status err';this.disabled=false;}
      };
      document.getElementById('settingsDeleteAccount').onclick=async function(){
        var button=this;
        var msg=document.getElementById('settingsDeleteStatus');
        var deletingUser=auth.currentUser;
        if(!confirm(localizedProfileText('Excluir esta conta permanentemente? Esta ação não pode ser desfeita. A conta, o perfil e a sessão serão removidos.')))return;
        button.disabled=true;msg.textContent='Excluindo conta…';msg.className='settings-status';
        try{
          await auth.deleteAccount();
          try{
            if(deletingUser&&deletingUser.uid){
              localStorage.removeItem('beSelectedAvatar:'+deletingUser.uid);
              localStorage.removeItem('beProfileBanner:'+deletingUser.uid);
            }
            localStorage.removeItem('beAuthExpected');
            localStorage.removeItem('beSessionUid');
            sessionStorage.removeItem('beOpenSettingsAfterDiscord');
            sessionStorage.removeItem('beOAuthDestination');
          }catch(_){ }
          closePublicPages(false);
          window.alert(localizedProfileText('Conta excluída com sucesso. Você foi desconectado do site.'));
          window.location.replace(window.BETVLocaleURL?window.BETVLocaleURL('/'):'/');
        }catch(error){
          msg.textContent=localizedProfileText('Não foi possível excluir:')+' '+localizedProfileText(error&&error.message?error.message:'Tente novamente.');
          msg.className='settings-status err';
          button.disabled=false;
        }
      };
      document.getElementById('settingsAccountForm').addEventListener('submit',async function(e){
        e.preventDefault();
        var form=e.currentTarget,msg=document.getElementById('settingsAccountStatus'),submit=form.querySelector('[type="submit"]');
        var displayName=form.displayName.value.trim();
        var handle=beBackend.normalizeUsername(form.username.value);
        form.username.value=handle;
        if(!beBackend.validUsername(handle)){msg.textContent='O @ deve ter de 3 a 20 caracteres, usando letras minúsculas, números, ponto ou underline.';msg.className='settings-status err';return;}
        var approved=await askSettingsSave();if(!approved){keepSettingsOpen();return;}
        submit.disabled=true;msg.textContent='Salvando…';msg.className='settings-status';
        try{
          currentProfile=await beBackend.profiles.update(user.uid,{displayName:displayName,username:handle,updatedAt:beBackend.now()});
          await auth.updateCurrentUser({displayName:displayName});
          setLiteralText(username,'@'+handle);
          renderProfilePage();keepSettingsOpen();
          msg.textContent='Conta atualizada com sucesso.';msg.className='settings-status ok';showSettingsSaved();
        }catch(error){msg.textContent=error&&error.code==='username-in-use'?localizedProfileText('Este @ já está em uso.'):localizedProfileText('Não foi possível salvar:')+' '+localizedProfileText(error&&error.message?error.message:'Tente novamente.');msg.className='settings-status err';}
        finally{submit.disabled=false;}
      });
    }
    function syncBannerPickerSelection(){
      var current=resolvedProfileBanner(auth.currentUser).bannerUrl;
      bannerPickerBody.querySelectorAll('.banner-option').forEach(function(option){option.classList.toggle('selected',option.dataset.bannerUrl===current);});
    }
    function bindBannerPickerSelection(){
      if(bannerPickerBody.dataset.selectionBound==='true')return;
      bannerPickerBody.dataset.selectionBound='true';
      bannerPickerBody.addEventListener('click',async function(event){
        var button=event.target.closest('[data-banner-url]');
        if(!button||!bannerPickerBody.contains(button)||button.disabled||!auth.currentUser)return;
        var returnView=bannerPickerReturnView;
        button.disabled=true;
        var bannerUrl=button.dataset.bannerUrl||'';
        var bannerId=button.dataset.bannerId||'';
        currentProfile={...(currentProfile||{}),bannerUrl:bannerUrl,bannerId:bannerId};
        try{localStorage.setItem('beProfileBanner:'+auth.currentUser.uid,JSON.stringify({bannerUrl:bannerUrl,bannerId:bannerId,updatedAt:beBackend.now()}));}catch(_){ }
        syncBannerPickerSelection();
        applyProfileBanner(bannerUrl);
        renderProfilePage();
        try{
          var savedProfile=await beBackend.profiles.setBanner(auth.currentUser.uid,bannerUrl,bannerId);
          if(savedProfile)currentProfile={...savedProfile,bannerUrl:bannerUrl,bannerId:bannerId};
        }catch(error){
          (void 0);
        }
        renderProfilePage();
        if(returnView==='settings'||document.body.classList.contains('settings-page-active')||isConfigRoute()){renderSettingsPage();keepSettingsOpen();showSettingsSaved();}
        setTimeout(closeBannerPicker,100);
      });
    }
    async function openBannerPicker(){
      bannerPickerReturnView=document.body.classList.contains('settings-page-active')||isConfigRoute()?'settings':(document.body.classList.contains('profile-page-active')?'profile':'');
      document.body.classList.add('banner-picker-active');bannerPicker.hidden=false;syncBodyScroll();pushPickerHistory('banner-picker');
      bindBannerPickerSelection();
      if(bannerGalleryRendered){
        syncBannerPickerSelection();
        activatePickerImages(bannerPickerBody,'banner');
        return;
      }
      bannerPickerBody.innerHTML='<div class="banner-picker-empty">Carregando banners…</div>';
      try{
        var items=(await loadPickerGallery()).filter(function(item){
          var type=String(item.itemType||'').toLowerCase();
          return type==='banner'||/banner/i.test(String(item.category||''));
        });
        if(!items.length){bannerPickerBody.innerHTML='<div class="banner-picker-empty">Nenhum banner disponível no momento.</div>';return;}
        var groups={};
        items.forEach(function(item){var cat=(item.category||'Banners de perfil').trim()||'Banners de perfil';(groups[cat]||(groups[cat]=[])).push(item);});
        bannerPickerBody.innerHTML=Object.keys(groups).map(function(cat){
          return '<section class="banner-group"><h3>'+escapePublic(cat)+'</h3><div class="banner-grid">'+groups[cat].map(function(item){var imageUrl=window.beMediaUrl?window.beMediaUrl(item.imageUrl):item.imageUrl;return '<button class="banner-option" type="button" data-banner-url="'+escapePublic(item.imageUrl)+'" data-banner-id="'+escapePublic(item.id)+'" aria-label="Selecionar banner de perfil"><img data-picker-src="'+escapePublic(imageUrl)+'" decoding="async" fetchpriority="low" width="640" height="220" alt="Banner de perfil"></button>';}).join('')+'</div></section>';
        }).join('');
        bannerGalleryRendered=true;
        syncBannerPickerSelection();
        activatePickerImages(bannerPickerBody,'banner');
      }catch(error){bannerPickerBody.innerHTML='<div class="banner-picker-empty">Não foi possível carregar os banners.</div>';(void 0);}
    }
    function closeDetailBeforeDedicatedPage(){
      var detailSection=document.getElementById('contentDetailSection');
      var detailRecommendations=document.getElementById('detailRecommendations');
      if(detailSection)detailSection.hidden=true;
      if(detailRecommendations)detailRecommendations.hidden=true;
      document.body.classList.remove('detail-page-active');
      window.dispatchEvent(new CustomEvent('be:close-album-page'));
    }
    async function openPublicProfile(updateRoute,requestedUsername){
      closeProfileRelationships();
      window.dispatchEvent(new CustomEvent('be:close-public-search'));
      window.dispatchEvent(new CustomEvent('be:close-mobile-search'));
      closeDetailBeforeDedicatedPage();
      window.dispatchEvent(new CustomEvent('be:close-section-view'));
      document.body.classList.remove('section-catalog-active');
      toggleDropdown(false);settingsPage.hidden=true;profilePage.hidden=false;
      profilePage.removeAttribute('hidden');profilePage.setAttribute('aria-hidden','false');
      document.body.classList.remove('settings-page-active','login-mode','support-page-active','notification-page-active','billie-page-active','donate-page-active','fans-page-active','album-page-active','detail-page-active','legal-page-active');document.body.classList.add('profile-page-active');
      updateProfileActionVisibility();
      var handle=beBackend.normalizeUsername(requestedUsername||profileRouteUsername()||(currentProfile&&currentProfile.username)||'');
      if(!handle){
        if(!auth.currentUser){window.BETVPublicRoutes.go('/login');return;}
        handle=beBackend.normalizeUsername((currentProfile&&currentProfile.username)||'perfil');
      }
      var route='/@'+encodeURIComponent(handle||'perfil');
      if(updateRoute!==false)pushPublicRoute(route);else if(isProfileRoute()&&(cleanPathname()!==route||location.hash))replacePublicRoute(route);
      var requestId=++viewedProfileRequest;
      var ownHandle=beBackend.normalizeUsername((currentProfile&&currentProfile.username)||'');
      if(auth.currentUser&&ownHandle&&handle===ownHandle){
        viewedProfile=null;viewedProfileStatus='loading';renderProfilePage();window.scrollTo({top:0,behavior:'auto'});
        var renderOwnProfile=function(){
          if(requestId!==viewedProfileRequest||!document.body.classList.contains('profile-page-active'))return;
          viewedProfile={...(currentProfile||{}),socialLinks:readProfileSocialLinks(auth.currentUser.uid),profileColor:normalizeProfileColorValue((currentProfile&&currentProfile.profileColor)||readProfileColorValue(auth.currentUser.uid,'profile')),avatarBorderColor:normalizeProfileColorValue((currentProfile&&currentProfile.avatarBorderColor)||readProfileColorValue(auth.currentUser.uid,'avatar-border')),favorites:readProfileFavorites(),lovedAlbums:readProfileLovedAlbums(),savedContents:(typeof window.beGetSavedContents==='function'?window.beGetSavedContents():[])};
          viewedProfileStatus='ready';renderProfilePage();refreshProfileLikeState();refreshProfileFollowState(true);
        };
        if(typeof window.BETVRunAfterInteractionPaint==='function')window.BETVRunAfterInteractionPaint(renderOwnProfile);else window.setTimeout(renderOwnProfile,0);
        return;
      }
      viewedProfile=null;viewedProfileStatus='loading';renderProfilePage();window.scrollTo({top:0,behavior:'auto'});
      try{
        var profile=await beBackend.profiles.getPublic(handle);
        if(requestId!==viewedProfileRequest||(!isProfileRoute()&&!document.body.classList.contains('profile-page-active')))return;
        viewedProfile=profile;viewedProfileStatus=profile?'ready':'missing';renderProfilePage();if(profile){refreshProfileLikeState();refreshProfileFollowState(false);}
      }catch(error){
        if(requestId!==viewedProfileRequest||(!isProfileRoute()&&!document.body.classList.contains('profile-page-active')))return;
        (void 0);viewedProfile=null;viewedProfileStatus='error';renderProfilePage();
      }
    }

    function openSettingsPage(updateRoute){
      closeProfileRelationships();
      if(profileInlineEditing)stopInlineProfileEdit(false);
      closeProfileActionsMenu(false);
      closeDetailBeforeDedicatedPage();
      window.dispatchEvent(new CustomEvent('be:close-section-view'));
      document.body.classList.remove('section-catalog-active');
      closeNotificationMenus();
      toggleDropdown(false);
      profilePage.hidden=true;profilePage.setAttribute('hidden','');profilePage.setAttribute('aria-hidden','true');
      settingsPage.dataset.renderReady='false';
      document.body.classList.remove('profile-page-active','login-mode','support-page-active','notification-page-active','billie-page-active','donate-page-active','fans-page-active','album-page-active','detail-page-active');
      document.body.classList.add('settings-page-active');
      settingsPage.hidden=false;settingsPage.removeAttribute('hidden');settingsPage.setAttribute('aria-hidden','false');
      if(!settingsPageBody.childElementCount)settingsPageBody.innerHTML='<div class="settings-page-opening" aria-hidden="true"></div>';
      var finishSettingsRender=function(){
        if(!document.body.classList.contains('settings-page-active'))return;
        try{renderSettingsPage();}catch(error){(void 0);settingsPageBody.innerHTML='<div class="settings-card"><h2>Configurações</h2><p>Não foi possível carregar esta área. Atualize a página e tente novamente.</p></div>';}
        settingsPage.dataset.renderReady='true';
        if(window.BETVReleaseConfigPaint){
          settingsPage.setAttribute('aria-busy','true');
          Promise.resolve(window.BETVReleaseConfigPaint({container:settingsPage})).finally(function(){settingsPage.removeAttribute('aria-busy');});
        }
      };
      var configBoot=document.documentElement.classList.contains('config-route-boot');
      if(!configBoot&&typeof window.BETVRunAfterInteractionPaint==='function')window.BETVRunAfterInteractionPaint(finishSettingsRender);else finishSettingsRender();
      if(updateRoute!==false&&!isConfigRoute())pushPublicRoute('/config');
      window.scrollTo({top:0,behavior:'auto'});
    }

    function renderProfile(){
      var user=auth.currentUser;
      if(!user){profileBody.innerHTML='<div class="profile-login-required"><h3>Entre para acessar seu perfil</h3><p>Use seu e-mail e senha para continuar.</p><button class="profile-btn primary" id="profileLogin" type="button">Entrar com e-mail</button></div>';document.getElementById('profileLogin').onclick=function(){closeProfile();window.BETVPublicRoutes.go('/login');document.body.classList.add('login-mode');};return;}
      var avatar=selectedProfileAvatar(currentProfile);
      profileBody.innerHTML='<div class="profile-intro"><div class="profile-avatar-preview"><img loading="eager" decoding="async" src="'+escapePublic(window.BETVResolveAvatar?window.BETVResolveAvatar(avatar):avatar||'/_static/media/profile/default-avatar.png')+'" data-avatar-fallback="/_static/media/profile/default-avatar.png" alt="Avatar do perfil"></div><div><h3 class="notranslate" translate="no">'+escapePublic(currentProfile.displayName||user.displayName||'Novo perfil')+'</h3><p class="notranslate" translate="no" style="color:var(--ice-faint);margin-top:6px">'+escapePublic(user.email||'')+'</p><div class="profile-avatar-actions"><button class="profile-btn" id="profileChooseAvatar" type="button">Escolher foto</button></div></div></div><form id="profileForm"><div class="profile-form"><div class="profile-field"><label>Nome exibido</label><input class="notranslate" translate="no" name="displayName" maxlength="50" required value="'+escapePublic(currentProfile.displayName||user.displayName||'')+'"></div><div class="profile-field"><label>@ de usuário</label><input class="notranslate" translate="no" name="username" maxlength="20" pattern="[a-z0-9._]{3,20}" required placeholder="ex.: billiefan" value="'+escapePublic(currentProfile.username||'')+'"></div><div class="profile-field full"><label>E-mail</label><input class="notranslate" translate="no" value="'+escapePublic(user.email||'')+'" readonly></div><div class="profile-field full"><label>Biografia</label><textarea name="bio" id="profileBio" rows="4" maxlength="180" placeholder="Conte um pouco sobre você…">'+escapePublic(currentProfile.bio||'')+'</textarea><div class="profile-counter"><span id="profileBioCount">0</span>/180</div></div></div><div class="profile-message" id="profileMessage"></div><div class="profile-actions"><button class="profile-btn" type="button" id="profileCancel">Cancelar</button><button class="profile-btn primary" type="submit">Salvar perfil</button></div></form>';
      document.getElementById('profileChooseAvatar').onclick=function(){closeProfile();openAvatarPicker();};document.getElementById('profileCancel').onclick=closeProfile;
      var bio=document.getElementById('profileBio'),count=document.getElementById('profileBioCount');function updateCount(){count.textContent=bio.value.length;}bio.addEventListener('input',updateCount);updateCount();
      document.getElementById('profileForm').addEventListener('submit',async function(e){e.preventDefault();var form=e.currentTarget,msg=document.getElementById('profileMessage'),submit=form.querySelector('[type="submit"]');var displayName=form.displayName.value.trim(),handle=beBackend.normalizeUsername(form.username.value),bioText=form.bio.value.trim();form.username.value=handle;if(!beBackend.validUsername(handle)){msg.textContent='O @ deve ter de 3 a 20 caracteres, usando letras minúsculas, números, ponto ou underline.';msg.className='profile-message err';return;}submit.disabled=true;msg.textContent='Salvando…';msg.className='profile-message';try{var payload={displayName:displayName,username:handle,bio:bioText,updatedAt:beBackend.now()};currentProfile=await beBackend.profiles.update(user.uid,payload);await auth.updateCurrentUser({displayName:displayName});setLiteralText(username,handle?'@'+handle:(displayName||'Usuário'));if(document.body.classList.contains('profile-page-active')){viewedProfile={...(viewedProfile||{}),...(currentProfile||{})};viewedProfileStatus='ready';renderProfilePage();if(handle)replacePublicRoute('/@'+encodeURIComponent(handle));}msg.textContent='Perfil salvo com sucesso.';msg.className='profile-message ok';setTimeout(closeProfile,700);}catch(error){msg.textContent=error&&error.code==='username-in-use'?'Este @ já está em uso. Escolha outro.':'Não foi possível salvar: '+error.message;msg.className='profile-message err';}finally{submit.disabled=false;}});
    }


    function openOnboarding(user){
      if(!user||beBackend.isAdmin(user)||String(currentProfile.username||'').trim())return;
      onboardingShownFor=user.uid;
      document.body.classList.add('profile-onboarding-active');
      profileOnboarding.hidden=false;
      profileOnboarding.setAttribute('aria-hidden','false');
      onboardingMessage.textContent='';onboardingMessage.className='onboarding-message';
      onboardingUsername.value='';
      onboardingHandlePreview.textContent='@seunome';
      updateOnboardingAvatar();syncBodyScroll();
      setTimeout(function(){onboardingUsername.focus({preventScroll:true});},120);
    }

    onboardingUsername.addEventListener('input',function(){
      var normalized=beBackend.normalizeUsername(onboardingUsername.value);
      if(onboardingUsername.value!==normalized)onboardingUsername.value=normalized;
      onboardingHandlePreview.textContent='@'+(normalized||'seunome');
      onboardingMessage.textContent='';onboardingMessage.className='onboarding-message';
    });
    onboardingChooseAvatar.addEventListener('click',openAvatarPicker);
    onboardingForm.addEventListener('submit',async function(event){
      event.preventDefault();
      var user=auth.currentUser;
      if(!user)return;
      var handle=beBackend.normalizeUsername(onboardingUsername.value);
      onboardingUsername.value=handle;
      if(!beBackend.validUsername(handle)){
        onboardingMessage.textContent='Escolha um @ de 3 a 20 caracteres usando apenas letras minúsculas, números, ponto ou underline.';
        onboardingMessage.className='onboarding-message err';
        onboardingUsername.focus();return;
      }
      var submit=onboardingForm.querySelector('[type="submit"]');
      submit.disabled=true;onboardingMessage.textContent='Salvando seu perfil…';onboardingMessage.className='onboarding-message';
      try{
        currentProfile=await beBackend.profiles.update(user.uid,{username:handle,displayName:currentProfile.displayName||user.displayName||'',profileComplete:true,updatedAt:beBackend.now()});
        setLiteralText(username,'@'+handle);
        onboardingMessage.textContent='';onboardingMessage.className='onboarding-message';
        closeOnboarding(true);
      }catch(error){
        onboardingMessage.textContent=error&&error.code==='username-in-use'?'Esse @ já está em uso. Tente outro.':'Não foi possível salvar seu @. '+(error&&error.message?error.message:'Tente novamente.');
        onboardingMessage.className='onboarding-message err';
      }finally{submit.disabled=false;}
    });

    async function logoutFromProfile(){
      if(!profilePageLogout||profilePageLogout.disabled)return;
      profilePageLogout.disabled=true;
      profilePageLogout.setAttribute('aria-busy','true');
      try{
        await auth.signOut();
        location.replace(window.BETVLocaleURL?window.BETVLocaleURL('/login'):'/login');
      }catch(error){
        profilePageLogout.disabled=false;
        profilePageLogout.removeAttribute('aria-busy');
        (void 0);
        alert('Não foi possível sair da conta. Tente novamente.');
      }
    }

    function openProfile(){if(!auth.currentUser){window.BETVPublicRoutes.go('/login');return;}openPublicProfile(true,(currentProfile&&currentProfile.username)||'');}
    if(profilePageName){
      profilePageName.addEventListener('input',function(){
        if(!profileInlineEditing||!profileInlineNameWasEditing)return;
        var value=String(profilePageName.textContent||'').replace(/[\r\n]+/g,' ').slice(0,50);
        if(profilePageName.textContent!==value)profilePageName.textContent=value;
        profileInlineDraftName=value;
      });
      profilePageName.addEventListener('keydown',function(event){
        if(!profileInlineEditing||!profileInlineNameWasEditing)return;
        if(event.key==='Enter'){event.preventDefault();finishInlineNameEdit(false);profileInlineSaveButton&&profileInlineSaveButton.focus({preventScroll:true});}
        else if(event.key==='Escape'){event.preventDefault();finishInlineNameEdit(true);profileInlineNameButton&&profileInlineNameButton.focus({preventScroll:true});}
      });
      profilePageName.addEventListener('blur',function(){if(profileInlineEditing&&profileInlineNameWasEditing)finishInlineNameEdit(false);});
    }
    document.addEventListener('pointerdown',function(event){
      if(!profileInlineEditing)return;
      var inColor=profileInlineColorPanel&&!profileInlineColorPanel.hidden;
      var inTag=profileInlineTagPanel&&!profileInlineTagPanel.hidden;
      if(!inColor&&!inTag)return;
      if(inColor&&(profileInlineColorPanel.contains(event.target)||(profileInlinePaletteButton&&profileInlinePaletteButton.contains(event.target))))return;
      if(inTag&&(profileInlineTagPanel.contains(event.target)||(profileInlineTagButton&&profileInlineTagButton.contains(event.target))))return;
      if(inColor)closeInlineColorPanel();
      if(inTag)closeInlineTagPanel();
    });
    avatarPickerClose.addEventListener('click',closeAvatarPicker);avatarPickerCancel.addEventListener('click',closeAvatarPicker);bannerPickerClose.addEventListener('click',closeBannerPicker);if(bannerPickerCancel)bannerPickerCancel.addEventListener('click',closeBannerPicker);profileClose.addEventListener('click',closeProfile);if(settingsSaveCancel)settingsSaveCancel.addEventListener('click',function(){resolveSettingsConfirm(false);});if(settingsSaveApprove)settingsSaveApprove.addEventListener('click',function(){resolveSettingsConfirm(true);});if(settingsSaveConfirm)settingsSaveConfirm.addEventListener('click',function(event){if(event.target===settingsSaveConfirm)resolveSettingsConfirm(false);});profileModal.addEventListener('click',function(e){if(e.target===profileModal)closeProfile();});if(profilePageMore)profilePageMore.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();toggleProfileActionsMenu();});if(profilePageEdit)profilePageEdit.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();openProfileEditor();});if(profilePageSettings)profilePageSettings.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();openSettingsPage(true);});document.addEventListener('click',function(event){if(!profilePageActionsMenu||profilePageActionsMenu.hidden)return;if(event.target===profilePageMore||profilePageMore.contains(event.target)||profilePageActionsMenu.contains(event.target))return;closeProfileActionsMenu(false);});document.addEventListener('keydown',function(event){if(event.key!=='Escape')return;var boafPanel=document.getElementById('boafStreamPanel');if(boafPanel&&!boafPanel.hidden){event.preventDefault();boafPanel.hidden=true;document.body.classList.remove('boaf-stream-panel-open');return;}if(profileRelationshipsState.open){event.preventDefault();closeProfileRelationships();return;}if(profilePageActionsMenu&&!profilePageActionsMenu.hidden){event.preventDefault();closeProfileActionsMenu(true);}});window.addEventListener('resize',function(){if(profilePageActionsMenu&&!profilePageActionsMenu.hidden)positionProfileActionsMenu();});
    window.addEventListener('pageshow',function(){if(document.body.classList.contains('profile-page-active'))updateProfileActionVisibility();});
    document.addEventListener('visibilitychange',function(){if(!document.hidden&&document.body.classList.contains('profile-page-active'))updateProfileActionVisibility();});
    window.addEventListener('scroll',function(){if(profilePageActionsMenu&&!profilePageActionsMenu.hidden)closeProfileActionsMenu(false);},true);if(profilePageFollow)profilePageFollow.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();toggleProfileFollow();});if(profilePageLike)profilePageLike.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();toggleProfileLike();});if(profilePageFollowersButton)profilePageFollowersButton.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();if(!profilePageFollowersButton.disabled)openProfileRelationships('followers');});if(profilePageFollowingButton)profilePageFollowingButton.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();if(!profilePageFollowingButton.disabled)openProfileRelationships('following');});if(profileRelationshipsClose)profileRelationshipsClose.addEventListener('click',function(){closeProfileRelationships();});if(profileRelationshipsModal)profileRelationshipsModal.addEventListener('click',function(event){if(event.target===profileRelationshipsModal)closeProfileRelationships();});if(profileRelationshipsSearch)profileRelationshipsSearch.addEventListener('input',function(){if(!profileRelationshipsState.allowSearch)return;clearTimeout(profileRelationshipsSearchTimer);profileRelationshipsState.query=String(profileRelationshipsSearch.value||'').trim();profileRelationshipsSearchTimer=setTimeout(function(){loadProfileRelationshipsPage(1,true);},350);});if(profilePageLogout)profilePageLogout.addEventListener('click',logoutFromProfile);if(profilePageHome)profilePageHome.addEventListener('click',function(event){if(event){event.preventDefault();event.stopPropagation();}if(!auth.currentUser&&window.BETVGuestAccess)window.BETVGuestAccess.setActive(true);closePublicPages(false);if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function'){window.BETVPublicRoutes.go('/');}else{location.assign(window.BETVLocaleURL?window.BETVLocaleURL('/'):'/');}window.requestAnimationFrame(function(){var home=document.getElementById('logoBtn');if(home){home.dataset.beHistoryMode='none';home.click();delete home.dataset.beHistoryMode;}window.scrollTo({top:0,left:0,behavior:'auto'});});});bindProfileFavorites();bindProfileLovedAlbums();bindProfileSavedGrid();window.addEventListener('be:favorites-changed',function(){if(document.body.classList.contains('profile-page-active'))renderProfileSaved();});window.addEventListener('be:catalog-ready',function(){if(document.body.classList.contains('profile-page-active')){renderProfileFavorites();renderProfileLovedAlbums();renderProfileSaved();}if(profileFavoritesPicker&&!profileFavoritesPicker.hidden){profileFavoritesCatalog=profileCatalogContents();renderProfileFavoritesPicker();}});window.addEventListener('storage',function(event){if(['beSavedContents','beDetailFavorites','beFeaturedFavorites'].indexOf(event.key)>=0&&document.body.classList.contains('profile-page-active'))renderProfileSaved();if(event.key===profileFavoritesStorageKey()&&document.body.classList.contains('profile-page-active'))renderProfileFavorites();if(event.key===profileLovedAlbumsStorageKey()&&document.body.classList.contains('profile-page-active'))renderProfileLovedAlbums();});document.getElementById('settingsClosePage').addEventListener('click',function(event){
      if(event){event.preventDefault();event.stopPropagation();}



      try{sessionStorage.removeItem(SETTINGS_TAB_SESSION_KEY);}catch(_){ }
      settingsActiveTab='profile';
      closePublicPages(false);
      if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.replace==='function'){
        window.BETVPublicRoutes.replace('/');
      }else{
        history.replaceState({beRoute:'public'},'','/');
        window.dispatchEvent(new PopStateEvent('popstate',{state:{beRoute:'public'}}));
      }



      var homeButton=document.getElementById('logoBtn');
      if(homeButton){
        homeButton.dataset.beHistoryMode='none';
        homeButton.click();
        delete homeButton.dataset.beHistoryMode;
      }else{
        document.body.dataset.homeView='home';
      }
      window.scrollTo({top:0,left:0,behavior:'auto'});
    });document.querySelectorAll('button[data-home-view],a[data-home-view],#logoBtn').forEach(function(button){button.addEventListener('click',function(){closePublicPages(true);});});window.addEventListener('be:open-config',function(){openSettingsPage(false);});window.addEventListener('be:open-profile-route',function(){openPublicProfile(false).catch(function(error){(void 0);});});window.addEventListener('popstate',function(){
      if(!avatarPicker.hidden)closeAvatarPicker(false);
      if(!bannerPicker.hidden)closeBannerPicker(false);
      if(isConfigRoute()){if(auth.currentUser)openSettingsPage(false);else window.BETVPublicRoutes.go('/login');}
      else if(isProfileRoute())openPublicProfile(false).catch(function(error){(void 0);});
      else closePublicPages(false);
    });
    auth.onChange(async function(currentUser){
      dashboard.hidden=true;
      var isAdmin=false;
      if(currentUser){
        try{isAdmin=beBackend.isAdmin(currentUser);currentProfile=await beBackend.profiles.ensure(currentUser);}catch(error){(void 0);currentProfile={displayName:currentUser.displayName||'',avatarUrl:''};}
        if(currentProfile&&currentProfile.banned){window.dispatchEvent(new CustomEvent('be:user-banned',{detail:{email:currentUser.email||'',reason:currentProfile.banReason||'',bannedAt:currentProfile.bannedAt||''}}));try{await auth.signOut();}catch(_){ }return;}
        var restoredBanner=resolvedProfileBanner(currentUser);if(restoredBanner.bannerUrl){currentProfile.bannerUrl=restoredBanner.bannerUrl;currentProfile.bannerId=restoredBanner.bannerId;}
        setLiteralText(username,currentProfile.username?'@'+currentProfile.username:(currentProfile.displayName||currentUser.displayName||'Usuário'));selectedAvatar=selectedProfileAvatar(currentProfile)||localStorage.getItem(avatarCacheKey(currentUser))||'';setMainAvatar(selectedAvatar);applyOwnAvatarBorder(currentProfile,currentUser.uid);syncAuthActionLabel();updateProfileActionVisibility();if(document.body.classList.contains('settings-page-active'))renderSettingsPage();startCrossDeviceSync(currentUser).catch(function(error){(void 0);});if(isConfigRoute())setTimeout(function(){openSettingsPage(false);},0);else if(isProfileRoute())setTimeout(function(){openPublicProfile(false).catch(function(error){(void 0);});},0);if(sessionStorage.getItem('beOpenSettingsAfterDiscord')==='1'){sessionStorage.removeItem('beOpenSettingsAfterDiscord');setTimeout(function(){openSettingsPage(true);},180);}if(!isAdmin&&!String(currentProfile.username||'').trim()&&onboardingShownFor!==currentUser.uid)setTimeout(function(){openOnboarding(currentUser);},220);
      }else{stopCrossDeviceSync();setInterfaceText(username,'Visitante');currentProfile={};applyOwnAvatarBorder(null,'');selectedAvatar='';setMainAvatar('');syncAuthActionLabel();updateProfileActionVisibility();if(isProfileRoute())setTimeout(function(){openPublicProfile(false).catch(function(error){(void 0);});},0);else{viewedProfile=null;viewedProfileStatus='idle';}if(document.body.classList.contains('settings-page-active'))renderSettingsPage();onboardingShownFor='';closeOnboarding(true);}
      dashboard.hidden=!isAdmin;
    });
    document.querySelectorAll('[data-public-action]').forEach(function(button){button.addEventListener('click',async function(){
      var action=button.dataset.publicAction;if(action==='dashboard'){if(!beBackend.isAdmin(auth.currentUser)){dashboard.hidden=true;toggleDropdown(false);return;}location.hash='#/admin/dashboard';return;}if(action==='auth'){if(auth.currentUser){await auth.signOut();toggleDropdown(false);return;}if(window.BETVGuestAccess&&window.BETVGuestAccess.isActive()){window.BETVGuestAccess.setActive(false);localStorage.removeItem('beAuthExpected');localStorage.removeItem('beSessionUid');}syncAuthActionLabel();window.BETVPublicRoutes.go('/login');document.body.classList.add('login-mode');toggleDropdown(false);return;}if(action==='avatar'){openAvatarPicker();return;}if(action==='profile'){openProfile();return;}if(action==='donate'){toggleDropdown(false);if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/ong');return;}if(action==='support'){toggleDropdown(false);if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go('/suporte');else window.dispatchEvent(new CustomEvent('be:open-support'));return;}if(action==='settings'){openSettingsPage(true);return;}
    });});
    window.addEventListener('be:guest-access',syncAuthActionLabel);
    window.addEventListener('be:i18n-ready',syncAuthActionLabel);
    window.addEventListener('storage',function(event){
      if(event&&event.key==='beGuestAccess')syncAuthActionLabel();
      if(auth.currentUser&&event&&event.key===profileColorStorageKey(auth.currentUser.uid,'avatar-border'))applyOwnAvatarBorder(currentProfile,auth.currentUser.uid);
    });
    window.addEventListener('be:profile-avatar-changed',function(event){
      var detail=event&&event.detail||{};
      if(!auth.currentUser||detail.userId!==auth.currentUser.uid)return;
      if(detail.profile)currentProfile=detail.profile;
      else currentProfile={...(currentProfile||{}),avatarUrl:detail.avatarUrl||'',avatarId:detail.avatarId||''};
      selectedAvatar=detail.avatarUrl||'';
      localStorage.setItem(avatarCacheKey(auth.currentUser),selectedAvatar);
      setMainAvatar(selectedAvatar);updateOnboardingAvatar();if(!document.body.classList.contains('settings-page-active')&&!isConfigRoute())renderProfilePage();if(document.body.classList.contains('settings-page-active')||isConfigRoute()){renderSettingsPage();keepSettingsOpen();}
    });
    window.addEventListener('be:profile-banner-changed',function(event){
      var detail=event&&event.detail||{};
      if(!auth.currentUser||detail.userId!==auth.currentUser.uid)return;
      var latestUrl=String(detail.bannerUrl||(detail.profile&&detail.profile.bannerUrl)||resolvedProfileBanner(auth.currentUser).bannerUrl||'');
      var latestId=String(detail.bannerId||(detail.profile&&detail.profile.bannerId)||'');
      currentProfile={...(currentProfile||{}),...(detail.profile||{}),bannerUrl:latestUrl,bannerId:latestId};
      if(latestUrl){
        try{localStorage.setItem('beProfileBanner:'+auth.currentUser.uid,JSON.stringify({bannerUrl:latestUrl,bannerId:latestId,updatedAt:beBackend.now()}));}catch(_){ }
      }
      if(!document.body.classList.contains('settings-page-active')&&!isConfigRoute()){
        applyProfileBanner(latestUrl);
        renderProfilePage();
      }
      if(document.body.classList.contains('settings-page-active')||isConfigRoute()){renderSettingsPage();keepSettingsOpen();}
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(settingsSaveConfirm&&!settingsSaveConfirm.hidden){resolveSettingsConfirm(false);return;}closeAvatarPicker();closeBannerPicker();closeProfile();closeOnboarding(false);}});
    setTimeout(function(){if(isConfigRoute()){if(auth.currentUser)openSettingsPage(false);}else if(isProfileRoute())openPublicProfile(false).catch(function(error){(void 0);});},0);
  }

window.BETVAccountReady=setupPublicAccount();
})();

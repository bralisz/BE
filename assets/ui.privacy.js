(function(){
  "use strict";

  
  var field = document.getElementById('particles');
  var COUNT = window.innerWidth < 600 ? 14 : 26;
  for (var i = 0; i < COUNT; i++){
    var p = document.createElement('div');
    p.className = 'particle';
    var size = 1 + Math.random() * 2.2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.bottom = (-10 - Math.random() * 20) + 'vh';
    var dur = 14 + Math.random() * 18;
    p.style.animationDuration = dur + 's';
    p.style.animationDelay = (-Math.random() * dur) + 's';
    field.appendChild(p);
  }

  var topbar = document.getElementById('topbar');

  
  document.getElementById('logoBtn').addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  
  var userChip = document.getElementById('userChip');
  var userDropdown = document.getElementById('userDropdown');

  function toggleDropdown(force){
    var open = typeof force === 'boolean' ? force : !userDropdown.classList.contains('open');
    userDropdown.classList.toggle('open', open);
    userChip.setAttribute('aria-expanded', String(open));
  }
  userChip.addEventListener('click', function(e){
    e.stopPropagation();
    toggleDropdown();
  });
  document.addEventListener('click', function(e){
    if (!userDropdown.contains(e.target) && e.target !== userChip) toggleDropdown(false);
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') toggleDropdown(false);
  });


  
  async function setupPublicAccount(){
    var callbackDestination=new URLSearchParams(location.search||'').get('auth_callback');
    if(location.hash.startsWith('#/admin')||callbackDestination==='admin') return;
    if(!window.beBackend) return;
    await window.beBackend.ready;
    var auth=beBackend.auth;
    var photo=document.getElementById('publicUserPhoto');
    var fallback=document.getElementById('publicUserFallback');
    var username=document.getElementById('ddUsername');
    var dashboard=document.getElementById('publicDashboardLink');
    var authAction=document.getElementById('publicAuthAction');
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
    var profilePageMetaLabel=document.getElementById('profilePageMetaLabel');
    var profilePageMemberSince=document.getElementById('profilePageMemberSince');
    var profilePageMore=document.getElementById('profilePageMore');
    var settingsPage=document.getElementById('settingsPage');
    var settingsPageBody=document.getElementById('settingsPageBody');
    var bannerPicker=document.getElementById('bannerPicker');
    var bannerPickerBody=document.getElementById('bannerPickerBody');
    var bannerPickerClose=document.getElementById('bannerPickerClose');
    var profileOnboarding=document.getElementById('profileOnboarding');
    var onboardingForm=document.getElementById('onboardingForm');
    var onboardingUsername=document.getElementById('onboardingUsername');
    var onboardingHandlePreview=document.getElementById('onboardingHandlePreview');
    var onboardingMessage=document.getElementById('onboardingMessage');
    var onboardingChooseAvatar=document.getElementById('onboardingChooseAvatar');
    var onboardingAvatarPreview=document.getElementById('onboardingAvatarPreview');
    var selectedAvatar='';
    var currentProfile={};
    var onboardingShownFor='';

    function escapePublic(value){return String(value||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
    function avatarCacheKey(user){return 'beSelectedAvatar:'+(user&&user.uid?user.uid:'guest');}
    function selectedProfileAvatar(profile){return profile&&profile.avatarId&&profile.avatarUrl?String(profile.avatarUrl):'';}
    function setMainAvatar(url){var shown=String(url||'').trim();if(shown){photo.src=shown;photo.hidden=false;fallback.hidden=true;}else{photo.removeAttribute('src');photo.hidden=true;fallback.hidden=false;}updateOnboardingAvatar();}
    function fallbackAvatarSvg(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7.5" r="4"/></svg>';}
    function updateOnboardingAvatar(){if(!onboardingAvatarPreview)return;var shown=selectedAvatar||selectedProfileAvatar(currentProfile)||'';onboardingAvatarPreview.innerHTML=shown?'<img loading="lazy" decoding="async" src="'+escapePublic(shown)+'" alt="Foto do perfil">':fallbackAvatarSvg();}
    function syncBodyScroll(){var locked=!avatarPicker.hidden||!bannerPicker.hidden||!profileModal.hidden||!profileOnboarding.hidden;document.body.style.overflow=locked?'hidden':'';}
    function closeAvatarPicker(){avatarPicker.hidden=true;syncBodyScroll();}
    function closeBannerPicker(){bannerPicker.hidden=true;syncBodyScroll();}
    function closeProfile(){profileModal.hidden=true;syncBodyScroll();}
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

    async function openAvatarPicker(){
      toggleDropdown(false);avatarPicker.hidden=false;syncBodyScroll();
      avatarPickerBody.innerHTML='<div class="avatar-picker-empty">Carregando avatares…</div>';
      try{
        var items=(await beBackend.data.list('gallery',{orderBy:'order',direction:'asc'})).filter(function(item){var type=String(item.itemType||'').toLowerCase();return item.active!==false&&item.imageUrl&&type!=='banner';});
        if(!items.length){avatarPickerBody.innerHTML='<div class="avatar-picker-empty">Nenhum avatar disponível no momento.</div>';return;}
        var groups={};
        items.forEach(function(item){var cat=(item.category||'Outros').trim()||'Outros';(groups[cat]||(groups[cat]=[])).push(item);});
        avatarPickerBody.innerHTML='<div class="avatar-category-columns">'+Object.keys(groups).map(function(cat){
          return '<section class="avatar-category"><h3>'+escapePublic(avatarCategoryTitle(cat))+'</h3><div class="avatar-rail-shell"><button class="avatar-rail-arrow prev" type="button" aria-label="Ver avatares anteriores" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6"/></svg></button><div class="avatar-options">'+groups[cat].map(function(item){return '<button class="avatar-option '+(selectedAvatar===item.imageUrl?'selected':'')+'" type="button" data-avatar-url="'+escapePublic(item.imageUrl)+'" data-avatar-id="'+escapePublic(item.id)+'" aria-label="Avatar da categoria '+escapePublic(cat)+'"><img loading="lazy" decoding="async" src="'+escapePublic(item.imageUrl)+'" alt="Avatar da categoria '+escapePublic(cat)+'"></button>';}).join('')+'</div><button class="avatar-rail-arrow next" type="button" aria-label="Ver mais avatares"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m9 18 6-6-6-6"/></svg></button></div></section>';
        }).join('')+'</div>';
        setupAvatarRails();
        avatarPickerBody.querySelectorAll('[data-avatar-url]').forEach(function(button){button.addEventListener('click',async function(){
          var url=button.dataset.avatarUrl;button.disabled=true;
          try{
            if(auth.currentUser){
              var savedProfile=await beBackend.profiles.setAvatar(auth.currentUser.uid,url,button.dataset.avatarId);
              if(savedProfile)currentProfile=savedProfile;
            }else{currentProfile.avatarUrl=url;}
            selectedAvatar=(currentProfile&&currentProfile.avatarUrl)||url;
            setMainAvatar(selectedAvatar);
            localStorage.setItem(avatarCacheKey(auth.currentUser),selectedAvatar);
            avatarPickerBody.querySelectorAll('.avatar-option').forEach(function(x){x.classList.toggle('selected',x===button);});
            setTimeout(closeAvatarPicker,180);
          }catch(error){
            button.disabled=false;
            console.warn('Avatar não salvo no perfil:',error.message);
            alert('Não foi possível salvar o avatar. Tente novamente.');
          }
        });});
      }catch(error){avatarPickerBody.innerHTML='<div class="avatar-picker-empty">Não foi possível carregar a galeria.</div>';console.warn(error);}
    }



    function profileFallbackAvatar(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7.5" r="4"/></svg>';}
    function publicProfileYear(){
      var source=currentProfile&&currentProfile.createdAt?currentProfile.createdAt:beBackend.now();
      var date=new Date(source);
      return String(date.getFullYear()||new Date().getFullYear());
    }
    function cleanPathname(){try{return decodeURIComponent(String(location.pathname||'/')).replace(/\/+$/,'')||'/';}catch(_){return String(location.pathname||'/').replace(/\/+$/,'')||'/';}}
    function isConfigRoute(){var path=cleanPathname().toLowerCase();var hash=location.hash.toLowerCase();return path==='/config'||hash==='#config'||hash==='#/config';}
    function isProfileRoute(){return /^\/@[^/?#]+$/i.test(cleanPathname())||/^#\/perfil\/@[^/?#]+/i.test(location.hash);}
    function profileRoutePath(){
      var handle=beBackend.normalizeUsername((currentProfile&&currentProfile.username)||'perfil');
      return '/@'+encodeURIComponent(handle||'perfil');
    }
    function replacePublicRoute(path){history.replaceState({beRoute:'public'},'',path+(location.search||''));}
    function pushPublicRoute(path){if(cleanPathname()!==path||location.hash)history.pushState({beRoute:'public'},'',path+(location.search||''));}
    function closePublicPages(updateRoute){
      document.body.classList.remove('profile-page-active','settings-page-active');
      profilePage.hidden=true;
      settingsPage.hidden=true;
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
        hero.style.backgroundImage='url('+JSON.stringify(url)+')';
        hero.style.backgroundSize='cover';
        hero.style.backgroundPosition='center center';
      }
      profilePageBannerImg.src=url;
      profilePageBanner.hidden=false;profilePageBanner.removeAttribute('hidden');profilePageBanner.style.display='block';
      profilePageBannerFallback.hidden=true;profilePageBannerFallback.setAttribute('hidden','');profilePageBannerFallback.style.display='none';
    }
    function renderProfilePage(){
      var user=auth.currentUser;
      if(!user){
        profilePageName.textContent='Entre para ver seu perfil';
        profilePageHandle.textContent='@visitante';
        profilePageBadge.textContent='Visitante';
        profilePageMetaLabel.textContent='Conta desconectada';
        profilePageMemberSince.textContent='';
        profilePageAvatar.innerHTML=profileFallbackAvatar();
        profilePageBanner.hidden=true;profilePageBannerImg.removeAttribute('src');profilePageBannerFallback.hidden=false;
        return;
      }
      var displayName=currentProfile.displayName||user.displayName||'Usuário';
      var handle=currentProfile.username?'@'+currentProfile.username:'@perfil';
      var avatar=selectedProfileAvatar(currentProfile);
      var bannerState=resolvedProfileBanner(user);
      var banner=bannerState.bannerUrl;
      profilePageName.textContent=displayName;
      profilePageHandle.textContent=handle;
      profilePageBadge.textContent='Perfil';
      profilePageMetaLabel.textContent='Conta pessoal';
      profilePageMemberSince.textContent='Membro desde '+publicProfileYear();
      profilePageAvatar.innerHTML=avatar?'<img loading="lazy" decoding="async" src="'+escapePublic(avatar)+'" alt="Avatar do perfil">':profileFallbackAvatar();
      applyProfileBanner(banner);
    }
    function renderSettingsPage(){
      var user=auth.currentUser;
      if(!user){
        settingsPageBody.innerHTML='<div class="settings-card"><h2>Entre para continuar</h2><p>Faça login para editar sua conta e personalizar o perfil.</p><div class="settings-btn-row"><button class="settings-button primary" id="settingsLoginAction" type="button">Entrar</button></div></div>';
        document.getElementById('settingsLoginAction').onclick=function(){closePublicPages();location.hash='#login';document.body.classList.add('login-mode');};
        return;
      }
      var avatar=selectedProfileAvatar(currentProfile);
      var bannerState=resolvedProfileBanner(user);
      var banner=bannerState.bannerUrl;
      var identities=user&&user.raw&&Array.isArray(user.raw.identities)?user.raw.identities:[];
      var providers=user&&user.raw&&user.raw.app_metadata&&Array.isArray(user.raw.app_metadata.providers)?user.raw.app_metadata.providers:[];
      var discordConnected=providers.indexOf('discord')>=0||identities.some(function(identity){return String(identity.provider||'').toLowerCase()==='discord';});
      settingsPageBody.innerHTML=''
        +'<div class="settings-grid settings-grid-aligned">'
        +  '<section class="settings-card settings-account-card"><h2>Conta</h2><p>Altere o nome exibido e o @ do seu perfil.</p><form id="settingsAccountForm"><div class="settings-form-grid"><div class="settings-field"><label>Nome</label><input name="displayName" maxlength="50" required value="'+escapePublic(currentProfile.displayName||user.displayName||'')+'"></div><div class="settings-field"><label>@</label><input name="username" maxlength="20" pattern="[a-z0-9._]{3,20}" required value="'+escapePublic(currentProfile.username||'')+'" placeholder="seunome"></div></div><div class="settings-status" id="settingsAccountStatus"></div><div class="settings-btn-row"><button class="settings-button primary" type="submit">Salvar alterações</button></div></form></section>'
        +  '<section class="settings-card settings-profile-card"><h2>Perfil</h2><p>Escolha o banner de fundo do perfil e troque o avatar.</p><div class="settings-banner-preview">'+(banner?'<img loading="eager" fetchpriority="high" decoding="async" src="'+escapePublic(banner)+'" alt="Banner atual">':'')+'<span>'+(banner?'Banner selecionado':'Nenhum banner selecionado')+'</span></div><div class="settings-avatar-row"><div class="settings-avatar-preview">'+(avatar?'<img loading="eager" decoding="async" src="'+escapePublic(avatar)+'" alt="Avatar atual">':profileFallbackAvatar())+'</div><div><strong class="settings-avatar-title">Avatar atual</strong><span class="settings-muted">Atualize sua imagem principal do perfil.</span></div></div><div class="settings-btn-row"><button class="settings-button primary" id="settingsChooseBanner" type="button">Escolher banner</button><button class="settings-button" id="settingsChooseAvatar" type="button">Trocar avatar</button></div><div class="settings-status" id="settingsAppearanceStatus"></div></section>'
        +  '<section class="settings-card settings-connections-card"><h2>Conexões conectadas</h2><p>Conecte o Discord à sua conta.</p><div class="settings-connection"><div><strong>Discord</strong><span class="settings-muted">'+(discordConnected?'Sua conta Discord está conectada.':'Use sua identidade do Discord na plataforma.')+'</span></div><button class="settings-button" id="settingsConnectDiscord" type="button" '+(discordConnected?'disabled':'')+'><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.54 5.34A16.4 16.4 0 0 0 15.44 4l-.5 1.04a15.1 15.1 0 0 0-5.87 0L8.56 4a16.6 16.6 0 0 0-4.11 1.35C1.85 9.2 1.15 12.96 1.5 16.66a16.6 16.6 0 0 0 5.04 2.55l1.23-1.67c-.68-.26-1.33-.58-1.94-.96l.47-.36c3.72 1.72 7.76 1.72 11.44 0l.48.36c-.62.38-1.27.7-1.95.96l1.23 1.67a16.5 16.5 0 0 0 5.03-2.55c.42-4.29-.72-8.01-2.99-11.32ZM8.68 14.5c-1.12 0-2.04-1.03-2.04-2.3 0-1.27.9-2.3 2.04-2.3 1.15 0 2.06 1.04 2.04 2.3 0 1.27-.9 2.3-2.04 2.3Zm6.64 0c-1.12 0-2.04-1.03-2.04-2.3 0-1.27.9-2.3 2.04-2.3 1.15 0 2.06 1.04 2.04 2.3 0 1.27-.89 2.3-2.04 2.3Z"/></svg><span>'+(discordConnected?'Discord conectado':'Conectar Discord')+'</span></button></div><div class="settings-status" id="settingsDiscordStatus"></div></section>'
        +  '<section class="settings-card settings-session-card"><h2>Conta e sessão</h2><p>Saia desta conta ou exclua permanentemente seu acesso e perfil.</p><div class="settings-btn-row"><button class="settings-danger" id="settingsDeleteAccount" type="button">Excluir conta</button><button class="settings-button" id="settingsLogoutAccount" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Sair da conta</span></button></div><div class="settings-status" id="settingsDeleteStatus"></div></section>'
        +'</div>';
      document.getElementById('settingsChooseAvatar').onclick=function(){openAvatarPicker();};
      document.getElementById('settingsChooseBanner').onclick=function(){openBannerPicker();};
      document.getElementById('settingsConnectDiscord').onclick=async function(){
        var msg=document.getElementById('settingsDiscordStatus');
        if(discordConnected){msg.textContent='Discord já está conectado.';msg.className='settings-status ok';return;}
        this.disabled=true;msg.textContent='Abrindo conexão com Discord…';msg.className='settings-status';
        try{sessionStorage.setItem('beOpenSettingsAfterDiscord','1');await auth.connectDiscord();msg.textContent='Redirecionando para o Discord…';msg.className='settings-status ok';}
        catch(error){msg.textContent='Não foi possível conectar: '+(error&&error.message?error.message:'Tente novamente.');msg.className='settings-status err';this.disabled=false;}
      };
      document.getElementById('settingsLogoutAccount').onclick=async function(){
        var msg=document.getElementById('settingsDeleteStatus');
        this.disabled=true;msg.textContent='Saindo da conta…';msg.className='settings-status';
        try{await auth.signOut();closePublicPages(false);showLogin();}
        catch(error){msg.textContent='Não foi possível sair: '+(error&&error.message?error.message:'Tente novamente.');msg.className='settings-status err';this.disabled=false;}
      };
      document.getElementById('settingsDeleteAccount').onclick=async function(){
        var msg=document.getElementById('settingsDeleteStatus');
        if(!confirm('Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita.'))return;
        this.disabled=true;msg.textContent='Excluindo conta…';msg.className='settings-status';
        try{await auth.deleteAccount();closePublicPages(false);showLogin();}
        catch(error){msg.textContent='Não foi possível excluir: '+(error&&error.message?error.message:'Tente novamente.');msg.className='settings-status err';this.disabled=false;}
      };
      document.getElementById('settingsAccountForm').addEventListener('submit',async function(e){
        e.preventDefault();
        var form=e.currentTarget,msg=document.getElementById('settingsAccountStatus'),submit=form.querySelector('[type="submit"]');
        var displayName=form.displayName.value.trim();
        var handle=beBackend.normalizeUsername(form.username.value);
        form.username.value=handle;
        if(!beBackend.validUsername(handle)){msg.textContent='O @ deve ter de 3 a 20 caracteres, usando letras minúsculas, números, ponto ou underline.';msg.className='settings-status err';return;}
        submit.disabled=true;msg.textContent='Salvando…';msg.className='settings-status';
        try{
          currentProfile=await beBackend.profiles.update(user.uid,{displayName:displayName,username:handle,updatedAt:beBackend.now()});
          await auth.updateCurrentUser({displayName:displayName});
          username.textContent='@'+handle;
          renderProfilePage();
          msg.textContent='Conta atualizada com sucesso.';msg.className='settings-status ok';
        }catch(error){msg.textContent=error&&error.code==='username-in-use'?'Este @ já está em uso.':'Não foi possível salvar: '+error.message;msg.className='settings-status err';}
        finally{submit.disabled=false;}
      });
    }
    async function openBannerPicker(){
      bannerPicker.hidden=false;syncBodyScroll();
      bannerPickerBody.innerHTML='<div class="banner-picker-empty">Carregando banners…</div>';
      try{
        var items=(await beBackend.data.list('gallery',{orderBy:'order',direction:'asc'})).filter(function(item){
          if(item.active===false||!item.imageUrl)return false;
          var type=String(item.itemType||'').toLowerCase();
          return type==='banner' || /banner/i.test(String(item.category||''));
        });
        if(!items.length){bannerPickerBody.innerHTML='<div class="banner-picker-empty">Nenhum banner disponível no momento.</div>';return;}
        var groups={};
        items.forEach(function(item){var cat=(item.category||'Banners de perfil').trim()||'Banners de perfil';(groups[cat]||(groups[cat]=[])).push(item);});
        var selectedBanner=resolvedProfileBanner(auth.currentUser).bannerUrl;
        bannerPickerBody.innerHTML=Object.keys(groups).map(function(cat){
          return '<section class="banner-group"><h3>'+escapePublic(cat)+'</h3><div class="banner-grid">'+groups[cat].map(function(item){return '<button class="banner-option '+(selectedBanner===item.imageUrl?'selected':'')+'" type="button" data-banner-url="'+escapePublic(item.imageUrl)+'" data-banner-id="'+escapePublic(item.id)+'" aria-label="Selecionar banner de perfil"><img loading="lazy" decoding="async" src="'+escapePublic(item.imageUrl)+'" alt="Banner de perfil"></button>';}).join('')+'</div></section>';
        }).join('');
        bannerPickerBody.querySelectorAll('[data-banner-url]').forEach(function(button){button.addEventListener('click',async function(){
          if(!auth.currentUser)return;
          button.disabled=true;
          var bannerUrl=button.dataset.bannerUrl||'';
          var bannerId=button.dataset.bannerId||'';
          currentProfile={...(currentProfile||{}),bannerUrl:bannerUrl,bannerId:bannerId};
          try{localStorage.setItem('beProfileBanner:'+auth.currentUser.uid,JSON.stringify({bannerUrl:bannerUrl,bannerId:bannerId,updatedAt:beBackend.now()}));}catch(_){ }
          bannerPickerBody.querySelectorAll('.banner-option').forEach(function(option){option.classList.toggle('selected',option===button);});
          applyProfileBanner(bannerUrl);
          renderProfilePage();
          try{
            var savedProfile=await beBackend.profiles.setBanner(auth.currentUser.uid,bannerUrl,bannerId);
            if(savedProfile)currentProfile={...savedProfile,bannerUrl:bannerUrl,bannerId:bannerId};
          }catch(error){
            console.warn('O banner foi mantido no perfil local; o banco não aceitou a atualização:',error&&error.message?error.message:error);
          }
          renderProfilePage();
          if(document.body.classList.contains('settings-page-active'))renderSettingsPage();
          setTimeout(closeBannerPicker,120);
        });});
      }catch(error){bannerPickerBody.innerHTML='<div class="banner-picker-empty">Não foi possível carregar os banners.</div>';console.warn(error);}
    }
    function closeDetailBeforeDedicatedPage(){
      var detailSection=document.getElementById('contentDetailSection');
      var detailRecommendations=document.getElementById('detailRecommendations');
      if(detailSection)detailSection.hidden=true;
      if(detailRecommendations)detailRecommendations.hidden=true;
      document.body.classList.remove('detail-page-active');
    }
    function openPublicProfile(updateRoute){
      closeDetailBeforeDedicatedPage();
      toggleDropdown(false);settingsPage.hidden=true;profilePage.hidden=false;
      document.body.classList.remove('settings-page-active','login-mode');document.body.classList.add('profile-page-active');
      try{renderProfilePage();}catch(error){console.error('Falha ao renderizar perfil:',error);}
      var route=profileRoutePath();if(updateRoute!==false)pushPublicRoute(route);else if(isProfileRoute()&&(cleanPathname()!==route||location.hash))replacePublicRoute(route);
      window.scrollTo({top:0,behavior:'auto'});
    }
    function openSettingsPage(updateRoute){
      closeDetailBeforeDedicatedPage();
      toggleDropdown(false);profilePage.hidden=true;settingsPage.hidden=false;
      document.body.classList.remove('profile-page-active','login-mode');document.body.classList.add('settings-page-active');
      try{renderSettingsPage();}catch(error){console.error('Falha ao renderizar configurações:',error);settingsPageBody.innerHTML='<div class="settings-card"><h2>Configurações</h2><p>Não foi possível carregar esta área. Atualize a página e tente novamente.</p></div>';}
      if(updateRoute!==false&&!isConfigRoute())pushPublicRoute('/config');
      window.scrollTo({top:0,behavior:'auto'});
    }

    function renderProfile(){
      var user=auth.currentUser;
      if(!user){profileBody.innerHTML='<div class="profile-login-required"><h3>Entre para acessar seu perfil</h3><p>Use seu e-mail e senha para continuar.</p><button class="profile-btn primary" id="profileLogin" type="button">Entrar com e-mail</button></div>';document.getElementById('profileLogin').onclick=function(){closeProfile();location.hash='#login';document.body.classList.add('login-mode');};return;}
      var avatar=selectedProfileAvatar(currentProfile);
      profileBody.innerHTML='<div class="profile-intro"><div class="profile-avatar-preview">'+(avatar?'<img loading="lazy" decoding="async" src="'+escapePublic(avatar)+'" alt="Avatar do perfil">':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7.5" r="4"/></svg>')+'</div><div><h3>'+escapePublic(currentProfile.displayName||user.displayName||'Novo perfil')+'</h3><p style="color:var(--ice-faint);margin-top:6px">'+escapePublic(user.email||'')+'</p><div class="profile-avatar-actions"><button class="profile-btn" id="profileChooseAvatar" type="button">Escolher foto</button></div></div></div><form id="profileForm"><div class="profile-form"><div class="profile-field"><label>Nome exibido</label><input name="displayName" maxlength="50" required value="'+escapePublic(currentProfile.displayName||user.displayName||'')+'"></div><div class="profile-field"><label>@ de usuário</label><input name="username" maxlength="20" pattern="[a-z0-9._]{3,20}" required placeholder="ex.: billiefan" value="'+escapePublic(currentProfile.username||'')+'"></div><div class="profile-field full"><label>E-mail</label><input value="'+escapePublic(user.email||'')+'" readonly></div><div class="profile-field full"><label>Biografia</label><textarea name="bio" id="profileBio" rows="4" maxlength="180" placeholder="Conte um pouco sobre você…">'+escapePublic(currentProfile.bio||'')+'</textarea><div class="profile-counter"><span id="profileBioCount">0</span>/180</div></div></div><div class="profile-message" id="profileMessage"></div><div class="profile-actions"><button class="profile-btn" type="button" id="profileCancel">Cancelar</button><button class="profile-btn primary" type="submit">Salvar perfil</button></div></form>';
      document.getElementById('profileChooseAvatar').onclick=function(){closeProfile();openAvatarPicker();};document.getElementById('profileCancel').onclick=closeProfile;
      var bio=document.getElementById('profileBio'),count=document.getElementById('profileBioCount');function updateCount(){count.textContent=bio.value.length;}bio.addEventListener('input',updateCount);updateCount();
      document.getElementById('profileForm').addEventListener('submit',async function(e){e.preventDefault();var form=e.currentTarget,msg=document.getElementById('profileMessage'),submit=form.querySelector('[type="submit"]');var displayName=form.displayName.value.trim(),handle=beBackend.normalizeUsername(form.username.value),bioText=form.bio.value.trim();form.username.value=handle;if(!beBackend.validUsername(handle)){msg.textContent='O @ deve ter de 3 a 20 caracteres, usando letras minúsculas, números, ponto ou underline.';msg.className='profile-message err';return;}submit.disabled=true;msg.textContent='Salvando…';msg.className='profile-message';try{var payload={displayName:displayName,username:handle,bio:bioText,updatedAt:beBackend.now()};currentProfile=await beBackend.profiles.update(user.uid,payload);await auth.updateCurrentUser({displayName:displayName});username.textContent=handle?'@'+handle:(displayName||'Usuário');msg.textContent='Perfil salvo com sucesso.';msg.className='profile-message ok';setTimeout(closeProfile,700);}catch(error){msg.textContent=error&&error.code==='username-in-use'?'Este @ já está em uso. Escolha outro.':'Não foi possível salvar: '+error.message;msg.className='profile-message err';}finally{submit.disabled=false;}});
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
        username.textContent='@'+handle;
        onboardingMessage.textContent='Perfil configurado com sucesso.';onboardingMessage.className='onboarding-message ok';
        setTimeout(function(){closeOnboarding(true);},420);
      }catch(error){
        onboardingMessage.textContent=error&&error.code==='username-in-use'?'Esse @ já está em uso. Tente outro.':'Não foi possível salvar seu @. '+(error&&error.message?error.message:'Tente novamente.');
        onboardingMessage.className='onboarding-message err';
      }finally{submit.disabled=false;}
    });

    function openProfile(){openPublicProfile(true);}
    avatarPickerClose.addEventListener('click',closeAvatarPicker);avatarPickerCancel.addEventListener('click',closeAvatarPicker);bannerPickerClose.addEventListener('click',closeBannerPicker);profileClose.addEventListener('click',closeProfile);profileModal.addEventListener('click',function(e){if(e.target===profileModal)closeProfile();});profilePageMore.addEventListener('click',function(){openSettingsPage(true);});document.getElementById('settingsClosePage').addEventListener('click',function(){openPublicProfile(true);});document.querySelectorAll('[data-home-view],#logoBtn').forEach(function(button){button.addEventListener('click',function(){closePublicPages(true);});});window.addEventListener('be:open-config',function(){openSettingsPage(false);});window.addEventListener('be:open-profile-route',function(){if(auth.currentUser)openPublicProfile(false);});window.addEventListener('popstate',function(){if(!auth.currentUser)return;if(isConfigRoute())openSettingsPage(false);else if(isProfileRoute())openPublicProfile(false);else closePublicPages(false);});
    auth.onChange(async function(currentUser){
      dashboard.hidden=true;
      var isAdmin=false;
      if(currentUser){
        try{isAdmin=beBackend.isAdmin(currentUser);currentProfile=await beBackend.profiles.ensure(currentUser);}catch(error){console.warn('Perfil:',error.message);currentProfile={displayName:currentUser.displayName||'',avatarUrl:''};}
        if(currentProfile&&currentProfile.banned){try{await auth.signOut();}catch(_){ }location.replace('/404.html');return;}
        var restoredBanner=resolvedProfileBanner(currentUser);if(restoredBanner.bannerUrl){currentProfile.bannerUrl=restoredBanner.bannerUrl;currentProfile.bannerId=restoredBanner.bannerId;}
        username.textContent=currentProfile.username?'@'+currentProfile.username:(currentProfile.displayName||currentUser.displayName||'Usuário');selectedAvatar=selectedProfileAvatar(currentProfile)||localStorage.getItem(avatarCacheKey(currentUser))||'';setMainAvatar(selectedAvatar);authAction.textContent='Sair';renderProfilePage();if(document.body.classList.contains('settings-page-active'))renderSettingsPage();if(isConfigRoute())setTimeout(function(){openSettingsPage(false);},0);else if(isProfileRoute())setTimeout(function(){openPublicProfile(false);},0);if(sessionStorage.getItem('beOpenSettingsAfterDiscord')==='1'){sessionStorage.removeItem('beOpenSettingsAfterDiscord');setTimeout(function(){openSettingsPage(true);},180);}if(!isAdmin&&!String(currentProfile.username||'').trim()&&onboardingShownFor!==currentUser.uid)setTimeout(function(){openOnboarding(currentUser);},220);
      }else{username.textContent='Visitante';currentProfile={};selectedAvatar='';setMainAvatar('');authAction.textContent='Entrar';renderProfilePage();if(document.body.classList.contains('settings-page-active'))renderSettingsPage();onboardingShownFor='';closeOnboarding(true);}
      dashboard.hidden=!isAdmin;
    });
    document.querySelectorAll('[data-public-action]').forEach(function(button){button.addEventListener('click',async function(){
      var action=button.dataset.publicAction;if(action==='dashboard'){if(!beBackend.isAdmin(auth.currentUser)){dashboard.hidden=true;toggleDropdown(false);return;}location.hash='#/admin/dashboard';return;}if(action==='auth'){if(auth.currentUser){await auth.signOut();toggleDropdown(false);return;}location.hash='#login';document.body.classList.add('login-mode');toggleDropdown(false);return;}if(action==='avatar'){openAvatarPicker();return;}if(action==='profile'){openProfile();return;}if(action==='support'){window.dispatchEvent(new CustomEvent('be:open-support'));return;}if(action==='settings'){openSettingsPage(true);return;}
    });});
    window.addEventListener('be:profile-avatar-changed',function(event){
      var detail=event&&event.detail||{};
      if(!auth.currentUser||detail.userId!==auth.currentUser.uid)return;
      if(detail.profile)currentProfile=detail.profile;
      else currentProfile={...(currentProfile||{}),avatarUrl:detail.avatarUrl||'',avatarId:detail.avatarId||''};
      selectedAvatar=detail.avatarUrl||'';
      localStorage.setItem(avatarCacheKey(auth.currentUser),selectedAvatar);
      setMainAvatar(selectedAvatar);updateOnboardingAvatar();renderProfilePage();if(document.body.classList.contains('settings-page-active'))renderSettingsPage();
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
      applyProfileBanner(latestUrl);
      renderProfilePage();
      if(document.body.classList.contains('settings-page-active'))renderSettingsPage();
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeAvatarPicker();closeBannerPicker();closeProfile();closeOnboarding(false);}});
    setTimeout(function(){if(!auth.currentUser)return;if(isConfigRoute())openSettingsPage(false);else if(isProfileRoute())openPublicProfile(false);},0);
  }
  function startPublicAccount(){setupPublicAccount().catch(function(error){console.error('Falha ao iniciar conta pública:',error);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startPublicAccount,{once:true});else startPublicAccount();

  
  var widgets = document.querySelectorAll('[data-tilt]');
  widgets.forEach(function(w){
    w.addEventListener('mousemove', function(e){
      var r = w.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      w.style.setProperty('--mx', x + '%');
      w.style.setProperty('--my', y + '%');
    });
  });

  
  var items = document.querySelectorAll('.widget');
  items.forEach(function(el, idx){
    el.style.animationDelay = (idx * 0.06) + 's';
  });

  
  var featured = document.getElementById('featured');
  if (featured && !featured.closest('.featured-wrap').hidden){
    var fSlides = Array.prototype.slice.call(featured.querySelectorAll('.f-slide'));
    var fDots = Array.prototype.slice.call(document.querySelectorAll('.f-dot'));
    var fIndex = 0;
    var AUTOPLAY_MS = 10000;
    var fTimer = null;

    function goToSlide(i){
      fIndex = (i + fSlides.length) % fSlides.length;
      fSlides.forEach(function(s, idx){ s.classList.toggle('active', idx === fIndex); });
      fDots.forEach(function(d, idx){ d.classList.toggle('active', idx === fIndex); });
    }
    function nextSlide(){ goToSlide(fIndex + 1); }
    function startAutoplay(){
      stopAutoplay();
      fTimer = window.setInterval(nextSlide, AUTOPLAY_MS);
    }
    function stopAutoplay(){
      if (fTimer){ window.clearInterval(fTimer); fTimer = null; }
    }

    fDots.forEach(function(dot){
      dot.addEventListener('click', function(){
        goToSlide(parseInt(dot.getAttribute('data-goto'), 10));
        startAutoplay();
      });
    });

    featured.addEventListener('mouseenter', stopAutoplay);
    featured.addEventListener('mouseleave', startAutoplay);

    goToSlide(0);
    startAutoplay();
  }

})();

;

(function(){
  'use strict';
  var initialCallbackDestination=new URLSearchParams(location.search||'').get('auth_callback');
  if(location.hash.startsWith('#/admin')||initialCallbackDestination==='admin') return;

  var bgIndex=0,bgTimer=null,authReady=false,authFlowBusy=false,currentProfile=null,auth=null,selectedAuthEmail='';
  function hideSiteSkeleton(){var loading=q('authLoading');if(loading)loading.hidden=true;}
  function showSiteSkeleton(){var loading=q('authLoading');if(loading)loading.hidden=false;}
  window.addEventListener('be:content-ready',hideSiteSkeleton);

  function q(id){return document.getElementById(id)}
  function setStatus(message,type){var el=q('authStatus');if(!el)return;el.textContent=message||'';el.className='auth-status '+(type||'');}
  function friendly(error){
    var code=(error&&error.code)||'';
    var map={
      'auth/invalid-credential':'E-mail ou senha incorretos.',
      'auth/user-not-found':'Conta não encontrada.',
      'auth/wrong-password':'E-mail ou senha incorretos.',
      'auth/email-already-in-use':'Este e-mail já possui uma conta.',
      'auth/weak-password':'Use uma senha com pelo menos 6 caracteres.',
      'auth/invalid-email':'Digite um e-mail válido.',
      'auth/too-many-requests':'Muitas tentativas. Aguarde um pouco e tente novamente.',
      'auth/network-request-failed':'Não foi possível conectar. Verifique sua internet e tente novamente.',
      'auth/session-missing':'Não foi possível concluir a sessão de login. Tente entrar novamente.',
      'auth/email-rate-limit':'O limite temporário de e-mails do Supabase foi atingido. Aguarde e tente novamente mais tarde ou continue com o Discord.',
      'auth/provider-not-enabled':'O login com Discord ainda não foi ativado no Supabase.',
      'backend/not-configured':'Este recurso será ativado quando o Supabase estiver conectado.',
      'username-in-use':'Este nome de usuário já está em uso. Escolha outro.',
      'username-invalid':'O @ informado não é válido.'
    };
    return map[code]||(error&&error.message)||'Não foi possível concluir. Tente novamente.';
  }
  function validAuthPassword(value){return /^(?=.{6,}$)(?=.*[0-9!@#$%^&*._-]).+$/.test(String(value||''));}
  function normalizeUsername(value){return beBackend.normalizeUsername(value);}
  function validUsername(value){return beBackend.validUsername(value);}
  function callbackParams(){var query=new URLSearchParams(location.search||''),raw=String(location.hash||'').replace(/^#/,''),nested=raw.indexOf('#'),payload=nested>=0?raw.slice(nested+1):raw,hash=new URLSearchParams(payload);return {query:query,hash:hash};}
  function hasAuthCallback(){var p=callbackParams();return Boolean(p.query.get('code')||p.query.get('error')||p.query.get('error_code')||p.query.get('auth_callback')||p.hash.get('access_token')||p.hash.get('refresh_token')||p.hash.get('error')||p.hash.get('error_code'));}
  function authCallbackError(){var p=callbackParams();return p.query.get('error_description')||p.hash.get('error_description')||p.query.get('error')||p.hash.get('error')||'';}
  function cleanPathname(){try{return decodeURIComponent(String(location.pathname||'/')).replace(/\/+$/,'')||'/';}catch(_){return String(location.pathname||'/').replace(/\/+$/,'')||'/';}}
  function replaceRoute(route){var url=new URL(location.href);['code','error','error_code','error_description','auth_callback','oauth'].forEach(function(name){url.searchParams.delete(name)});if(String(route||'').startsWith('/')){url.pathname=route;url.hash='';}else{url.pathname='/';url.hash=route||'';}history.replaceState(null,'',url.pathname+(url.search||'')+url.hash);}
  function isConfigRoute(){var path=cleanPathname().toLowerCase(),hash=location.hash.toLowerCase();return path==='/config'||hash==='#config'||hash==='#/config';}
  function isProfileRoute(){return /^\/@[^/?#]+$/i.test(cleanPathname())||/^#\/perfil\/@[^/?#]+/i.test(location.hash);}
  function isVideoRoute(){return /^\/\d{6,12}$/i.test(cleanPathname())||/^#\/video\/[^/?#]+/i.test(location.hash);}
  function isLegalRoute(){return /^#\/?(?:terms|privacy|cookies|dmca)$/i.test(String(location.hash||''));}
  function isSupportRoute(){var path=cleanPathname().toLowerCase(),hash=String(location.hash||'').toLowerCase();return path==='/suporte'||hash==='#suporte'||hash==='#/suporte'||hash==='#support'||hash==='#/support';}
  function showLegalRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','detail-page-active');document.body.classList.add('legal-page-active');window.dispatchEvent(new CustomEvent('be:open-legal-route'));window.scrollTo(0,0);}
  function showSupportRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','detail-page-active');document.body.classList.add('support-page-active');window.dispatchEvent(new CustomEvent('be:open-support'));window.scrollTo(0,0);}
  function showLogin(){document.body.classList.remove('profile-page-active','settings-page-active','legal-page-active','support-page-active');document.body.classList.add('login-mode');if(location.hash!=='#login'&&location.hash!=='#/login')replaceRoute('#login');}
  function enterHome(preserveRoute){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','support-page-active');sessionStorage.removeItem('beOAuthDestination');if(!preserveRoute)replaceRoute('/');window.dispatchEvent(new CustomEvent('be:close-support'));window.scrollTo(0,0);}
  function enterConfig(){document.body.classList.remove('profile-page-active','login-mode','support-page-active');document.body.classList.add('settings-page-active');sessionStorage.removeItem('beOAuthDestination');if(!isConfigRoute())replaceRoute('/config');window.dispatchEvent(new CustomEvent('be:close-support'));window.dispatchEvent(new CustomEvent('be:open-config'));window.scrollTo(0,0);}
  function setMode(mode,email){
    if(email)selectedAuthEmail=String(email).trim().toLowerCase();
    var steps={email:q('emailStep'),password:q('passwordStep'),signup:q('signupStep')};
    Object.keys(steps).forEach(function(key){if(steps[key])steps[key].hidden=key!==mode;});
    q('authGate').dataset.authStep=mode;
    if(selectedAuthEmail){
      q('loginEmail').value=selectedAuthEmail;
      q('signupEmail').value=selectedAuthEmail;
      q('loginSelectedEmail').textContent=selectedAuthEmail;
      q('signupSelectedEmail').textContent=selectedAuthEmail;
      q('authEmail').value=selectedAuthEmail;
    }
    setStatus('');
    window.requestAnimationFrame(function(){
      var target=mode==='email'?q('authEmail'):mode==='password'?q('loginPassword'):q('signupName');
      if(target)target.focus({preventScroll:true});
    });
  }
  function initBackgrounds(){
    var slides=[].slice.call(document.querySelectorAll('.login-bg-slide'));
    var dots=q('loginDots');
    if(!slides.length)return;
    function randomIndex(except){
      if(slides.length<2)return 0;
      var next=except;
      while(next===except){
        if(window.crypto&&window.crypto.getRandomValues){
          var value=new Uint32Array(1);
          window.crypto.getRandomValues(value);
          next=value[0]%slides.length;
        }else{
          next=Math.floor(Math.random()*slides.length);
        }
      }
      return next;
    }
    bgIndex=randomIndex(-1);
    if(dots){
      dots.innerHTML=slides.map(function(_,i){return '<button class="login-dot '+(i===bgIndex?'active':'')+'" type="button" data-bg="'+i+'"></button>'}).join('');
    }
    function show(i){
      bgIndex=(i+slides.length)%slides.length;
      slides.forEach(function(slide,j){slide.classList.toggle('active',j===bgIndex)});
      if(dots)dots.querySelectorAll('.login-dot').forEach(function(dot,j){dot.classList.toggle('active',j===bgIndex)});
    }
    function restart(){
      clearInterval(bgTimer);
      bgTimer=setInterval(function(){show(randomIndex(bgIndex))},10000);
    }
    if(dots)dots.addEventListener('click',function(e){var button=e.target.closest('[data-bg]');if(!button)return;show(Number(button.dataset.bg));restart()});
    show(bgIndex);
    restart();
  }

  async function recoverAuthenticatedUser(user){
    if(user)return user;
    if(!auth||typeof auth.getAuthenticatedUser!=='function')return null;
    var waits=hasAuthCallback()?[0,100,250,500,900,1500,2500]:[0,100,220,450,800];
    for(var i=0;i<waits.length;i+=1){
      if(waits[i])await new Promise(function(resolve){setTimeout(resolve,waits[i])});
      user=await auth.getAuthenticatedUser();
      if(user)return user;
    }
    return null;
  }

  async function enforceAccountAccess(user){
    if(!user)return true;
    var status={banned:Boolean(currentProfile&&currentProfile.banned),reason:currentProfile&&currentProfile.banReason||''};
    if(typeof auth.accountStatus==='function'){
      try{var latest=await auth.accountStatus();if(latest)status={...status,...latest,banned:Boolean(status.banned||latest.banned)};}catch(error){console.warn('Não foi possível confirmar o status da conta:',error);}
    }
    if(!status.banned)return true;
    try{await auth.signOut();}catch(_){ }
    location.replace('/404.html');
    return false;
  }

  async function finishPublicLogin(user){
    user=await recoverAuthenticatedUser(user);
    if(!user){var sessionError=new Error('Não foi possível concluir a sessão de login. Tente entrar novamente.');sessionError.code='auth/session-missing';throw sessionError;}
    localStorage.setItem('beAuthExpected','1');
    localStorage.setItem('beSessionUid',user.uid);
    try{currentProfile=await beBackend.profiles.ensure(user);}catch(error){console.warn('Perfil não pôde ser carregado:',error);currentProfile={uid:user.uid,email:user.email||'',displayName:user.displayName||'',username:'',avatarUrl:''};}
    if(!(await enforceAccountAccess(user)))return null;
    setStatus('');
    if(isSupportRoute())showSupportRoute();
    else if(isConfigRoute())enterConfig();
    else if(isProfileRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-profile-route'));}
    else if(isVideoRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-video-route'));}
    else enterHome();
    return user;
  }

  async function boot(){
    auth=beBackend.auth;
    q('discordAuthButton').onclick=async function(){
      var button=this;
      if(authFlowBusy)return;
      authFlowBusy=true;button.disabled=true;setStatus('');
      try{await auth.signInWithDiscord();}catch(err){setStatus(friendly(err),'error');authFlowBusy=false;button.disabled=false;}
    };

    q('emailLookupForm').addEventListener('submit',async function(e){
      e.preventDefault();
      var form=e.currentTarget,b=e.submitter||form.querySelector('[type="submit"]'),email=form.elements.namedItem('email').value.trim().toLowerCase();
      if(authFlowBusy)return;
      authFlowBusy=true;if(b)b.disabled=true;setStatus('Continuando com segurança…');
      try{
        var exists=typeof auth.accountExists==='function'?await auth.accountExists(email):null;
        selectedAuthEmail=email;
        if(exists===true){setMode('password',email);}
        else if(exists===false){setMode('signup',email);}
        else{throw new Error('Não foi possível verificar este e-mail agora. Tente novamente.');}
      }catch(err){setStatus(friendly(err),'error');}
      finally{authFlowBusy=false;if(b)b.disabled=false;}
    });

    document.querySelectorAll('.change-auth-email').forEach(function(button){
      button.addEventListener('click',function(){
        q('loginPassword').value='';
        q('signupPassword').value='';
        setMode('email',selectedAuthEmail);
      });
    });
    q('switchToSignup').addEventListener('click',function(){setMode('signup',selectedAuthEmail)});
    q('switchToPassword').addEventListener('click',function(){setMode('password',selectedAuthEmail)});

    q('forgotPassword').onclick=async function(){
      var email=selectedAuthEmail||q('loginEmail').value.trim();
      if(!email){setMode('email');setStatus('Digite seu e-mail para receber o link de redefinição.','error');return;}
      try{await auth.sendPasswordReset(email);setStatus('Enviamos um link de redefinição para seu e-mail.','ok')}catch(err){setStatus(friendly(err),'error')}
    };

    q('loginForm').addEventListener('submit',async function(e){
      e.preventDefault();
      var form=e.currentTarget,b=e.submitter||form.querySelector('[type="submit"]'),email=(selectedAuthEmail||form.elements.namedItem('email').value).trim().toLowerCase(),password=form.elements.namedItem('password').value;
      if(!validAuthPassword(password)){setStatus('Use pelo menos 6 caracteres e inclua um número ou caractere especial.','error');form.elements.namedItem('password').focus();return;}
      if(authFlowBusy)return;
      authFlowBusy=true;if(b)b.disabled=true;setStatus('Entrando…');
      try{var result=await auth.signInWithEmail({email:email,password:password,remember:q('rememberLogin').checked});await finishPublicLogin(result&&result.user?result.user:auth.currentUser);}catch(err){showLogin();setMode('password',email);setStatus(err&&err.code==='admin-only'?'A conta administrativa deve acessar #/admin.':friendly(err),'error');}finally{authFlowBusy=false;if(b)b.disabled=false;}
    });

    q('signupForm').addEventListener('submit',async function(e){
      e.preventDefault();
      var form=e.currentTarget,b=e.submitter||form.querySelector('[type="submit"]'),name=form.elements.namedItem('name').value.trim(),email=(selectedAuthEmail||form.elements.namedItem('email').value).trim().toLowerCase(),password=form.elements.namedItem('password').value;
      if(name.length<2){setStatus('Digite seu nome completo.','error');return;}
      if(!validAuthPassword(password)){setStatus('Use pelo menos 6 caracteres e inclua um número ou caractere especial.','error');form.elements.namedItem('password').focus();return;}
      if(authFlowBusy)return;
      authFlowBusy=true;if(b)b.disabled=true;setStatus('Criando sua conta…');
      try{
        var result=await auth.signUp({email:email,password:password,name:name,username:'',remember:true});
        if(result.needsEmailConfirmation){showLogin();setMode('password',email);setStatus('Conta criada. Abra o link enviado ao seu e-mail para confirmar o endereço e depois faça login.','ok');return;}
        currentProfile=await beBackend.profiles.ensure(result.user);localStorage.setItem('beAuthExpected','1');localStorage.setItem('beSessionUid',result.user.uid);setStatus('Conta criada com sucesso.','ok');enterHome();
      }catch(err){
        showLogin();
        if(err&&err.code==='auth/email-already-in-use')setMode('password',email);else setMode('signup',email);
        setStatus(friendly(err),'error');
      }finally{authFlowBusy=false;if(b)b.disabled=false;}
    });

    auth.onChange(async function(user){
      authReady=true;
      if(authFlowBusy)return;
      if(user&&!(await enforceAccountAccess(user)))return;
      if(isSupportRoute()){hideSiteSkeleton();showSupportRoute();return;}
      if(isLegalRoute()){hideSiteSkeleton();showLegalRoute();return;}
      if(!user){
        hideSiteSkeleton();
        var callbackActive=hasAuthCallback(),callbackFailure=authCallbackError();
        var expectedSession=callbackActive||localStorage.getItem('beAuthExpected')==='1'||Boolean(localStorage.getItem('beSessionUid'));
        if(expectedSession&&!callbackFailure){
          try{
            var recoveredUser=await recoverAuthenticatedUser(null);
            if(recoveredUser){await finishPublicLogin(recoveredUser);return;}
          }catch(recoveryError){console.warn('Não foi possível confirmar a sessão:',recoveryError);}
        }
        localStorage.removeItem('beSessionUid');
        localStorage.removeItem('beAuthExpected');
        sessionStorage.removeItem('beOAuthDestination');
        showLogin();selectedAuthEmail='';setMode('email');
        if(callbackFailure)setStatus('O Discord não concluiu o login: '+decodeURIComponent(String(callbackFailure).replace(/\+/g,' ')),'error');
        else if(callbackActive)setStatus('O retorno do Discord chegou, mas a sessão não foi criada. Confira as URLs de redirecionamento do Supabase e do Discord.','error');
        return;
      }
      try{
        showSiteSkeleton();
        await finishPublicLogin(user);
        if(window.__beContentReady)hideSiteSkeleton();
      }catch(error){hideSiteSkeleton();showLogin();setStatus(error&&error.code==='admin-only'?'A conta administrativa deve acessar #/admin.':friendly(error),'error');}
    });

    function handlePublicRoute(){
      if(location.hash.startsWith('#/admin'))return;
      if(isSupportRoute()){showSupportRoute();return;}
      if(isLegalRoute()){showLegalRoute();return;}
      if(!authReady)return;
      if(isConfigRoute()){if(auth.currentUser)enterConfig();else showLogin();return;}
      if(isProfileRoute()){if(auth.currentUser){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-profile-route'));}else showLogin();return;}
      if(isVideoRoute()){if(auth.currentUser){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-video-route'));}else showLogin();return;}
      if(auth.currentUser)enterHome(true);else showLogin();
    }
    window.addEventListener('hashchange',handlePublicRoute);
    window.addEventListener('popstate',handlePublicRoute);
    window.setInterval(function(){if(auth.currentUser)enforceAccountAccess(auth.currentUser);},60000);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&auth.currentUser)enforceAccountAccess(auth.currentUser);});
  }

  async function startAuthentication(){
    try{if(!window.beBackend)throw new Error('O adaptador de autenticação não foi carregado.');await window.beBackend.ready;await boot();}catch(error){hideSiteSkeleton();if(isSupportRoute())showSupportRoute();else if(isLegalRoute())showLegalRoute();else{showLogin();setStatus('Não foi possível iniciar a autenticação. Detalhes: '+friendly(error),'error');}console.error('Falha ao iniciar autenticação:',error);}
  }

  document.addEventListener('DOMContentLoaded',function(){initBackgrounds();setMode('email');startAuthentication()});
})();

;

(function(){
  'use strict';
  if(String(location.hash||'').startsWith('#/admin')) return;

  var legalPage=document.getElementById('legalPage');
  var legalAvatarButton=document.getElementById('legalAvatarButton');
  var legalAvatarImage=document.getElementById('legalAvatarImage');
  var legalAvatarFallback=document.getElementById('legalAvatarFallback');
  var legalHomeButton=document.getElementById('legalHomeButton');
  var cookieNotice=document.getElementById('cookieNotice');
  var cookieAccept=document.getElementById('cookieAccept');
  var legalRoutes=['terms','privacy','cookies','dmca'];

  // Mantém a área legal fora da estrutura da Home para que ela nunca seja
  // renderizada junto do catálogo, independentemente do restante do layout.
  if(legalPage&&legalPage.parentNode!==document.body){document.body.appendChild(legalPage);}

  function routeName(){
    var value=String(location.hash||'').replace(/^#\/?/,'').split(/[?&]/)[0].toLowerCase();
    return legalRoutes.indexOf(value)>=0?value:'';
  }
  function isSecure(){return location.protocol==='https:';}
  function cookieValue(name){
    var prefix=name+'=';
    var parts=String(document.cookie||'').split(';');
    for(var i=0;i<parts.length;i++){
      var item=parts[i].trim();
      if(item.indexOf(prefix)===0)return decodeURIComponent(item.slice(prefix.length));
    }
    return '';
  }
  function setCookie(name,value,maxAge){
    var cookie=name+'='+encodeURIComponent(value)+'; Path=/; Max-Age='+String(maxAge)+'; SameSite=Lax';
    if(isSecure())cookie+='; Secure';
    document.cookie=cookie;
  }
  function establishNecessaryStorage(){
    var prefs={necessary:true,locale:'pt-BR',version:1,updatedAt:new Date().toISOString()};
    setCookie('be_site_preferences',JSON.stringify(prefs),15552000);
    try{localStorage.setItem('beCookiePreferences',JSON.stringify(prefs));}catch(_){ }
  }
  function acknowledged(){
    if(cookieValue('be_cookie_ack')==='1')return true;
    try{return localStorage.getItem('beCookieAcknowledged')==='1';}catch(_){return false;}
  }
  function acceptCookies(){
    establishNecessaryStorage();
    setCookie('be_cookie_ack','1',15552000);
    try{localStorage.setItem('beCookieAcknowledged','1');}catch(_){ }
    if(cookieNotice)cookieNotice.hidden=true;
  }
  function showCookieNotice(){
    establishNecessaryStorage();
    if(cookieNotice)cookieNotice.hidden=acknowledged();
  }

  function syncLegalAvatar(){
    if(!legalAvatarButton||!legalAvatarImage||!legalAvatarFallback)return;
    var loggedUser=window.beBackend&&beBackend.auth?beBackend.auth.currentUser:null;
    if(!loggedUser){
      legalAvatarButton.classList.add('is-login');
      legalAvatarButton.setAttribute('aria-label','Entrar na plataforma');
      legalAvatarImage.hidden=true;
      legalAvatarImage.removeAttribute('src');
      legalAvatarFallback.textContent='Entrar';
      legalAvatarFallback.hidden=false;
      return;
    }
    legalAvatarButton.classList.remove('is-login');
    legalAvatarButton.setAttribute('aria-label','Abrir perfil');
    var source=document.getElementById('publicUserPhoto');
    var name=document.getElementById('ddUsername');
    var src=source&&!source.hidden?String(source.getAttribute('src')||''):'';
    if(src){
      legalAvatarImage.src=src;
      legalAvatarImage.hidden=false;
      legalAvatarFallback.hidden=true;
    }else{
      legalAvatarImage.hidden=true;
      legalAvatarImage.removeAttribute('src');
      var label=name?String(name.textContent||'').replace(/^@/,'').trim():(loggedUser.displayName||loggedUser.email||'');
      legalAvatarFallback.textContent=(label.charAt(0)||'M').toUpperCase();
      legalAvatarFallback.hidden=false;
    }
  }
  function renderLegalRoute(){
    var route=routeName();
    if(!route){
      document.body.classList.remove('legal-page-active');
      if(legalPage){legalPage.hidden=true;legalPage.setAttribute('aria-hidden','true');}
      return false;
    }
    if(legalPage){legalPage.hidden=false;legalPage.setAttribute('aria-hidden','false');}
    document.body.classList.remove('login-mode','profile-page-active','settings-page-active','detail-page-active');
    document.body.classList.add('legal-page-active');
    document.querySelectorAll('#legalPage [data-legal-page]').forEach(function(article){
      var active=article.getAttribute('data-legal-page')===route;
      article.hidden=!active;
      article.setAttribute('aria-hidden',active?'false':'true');
    });
    document.querySelectorAll('#legalPage [data-legal-link]').forEach(function(link){
      var active=link.getAttribute('data-legal-link')===route;
      link.classList.toggle('active',active);
      if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    syncLegalAvatar();
    document.title=({terms:'Terms & Conditions',privacy:'Privacy Policy',cookies:'Cookies',dmca:'DMCA / Copyright'}[route])+' — BETV';
    window.scrollTo(0,0);
    return true;
  }
  function goHome(){
    history.pushState({beRoute:'home'},'',location.pathname+(location.search||''));
    document.body.classList.remove('legal-page-active');
    if(legalPage)legalPage.hidden=true;
    document.title='BETV';
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0,0);
  }
  function openProfile(){
    var loggedUser=window.beBackend&&beBackend.auth?beBackend.auth.currentUser:null;
    goHome();
    window.setTimeout(function(){
      if(!loggedUser){location.hash='#login';return;}
      var button=document.querySelector('[data-public-action="profile"]');
      if(button)button.click();
      else location.hash='#login';
    },50);
  }

  if(legalHomeButton)legalHomeButton.addEventListener('click',goHome);
  if(legalAvatarButton)legalAvatarButton.addEventListener('click',openProfile);
  if(cookieAccept)cookieAccept.addEventListener('click',acceptCookies);
  window.addEventListener('hashchange',renderLegalRoute);
  window.addEventListener('popstate',renderLegalRoute);
  window.addEventListener('be:open-legal-route',renderLegalRoute);
  window.addEventListener('be:profile-avatar-changed',syncLegalAvatar);
  if(window.beBackend&&beBackend.ready){beBackend.ready.then(function(){if(beBackend.auth&&beBackend.auth.onChange)beBackend.auth.onChange(syncLegalAvatar);syncLegalAvatar();}).catch(syncLegalAvatar);}
  document.addEventListener('DOMContentLoaded',function(){renderLegalRoute();showCookieNotice();});
  if(document.readyState!=='loading'){renderLegalRoute();showCookieNotice();}
})();


/* Navegação de segurança dos três pontos do perfil, válida no mobile e desktop. */
;(function(){
  'use strict';
  function openProfileSettings(event){
    var button=event.target&&event.target.closest?event.target.closest('#profilePageMore'):null;
    if(!button)return;
    event.preventDefault();
    event.stopPropagation();
    var account=window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;
    if(!account){
      location.hash='#login';
      document.body.classList.add('login-mode');
      return;
    }
    var target='/config'+(location.search||'');
    try{history.pushState({beRoute:'config'},'',target);}catch(_){location.hash='#/config';}
    window.dispatchEvent(new CustomEvent('be:open-config'));
    window.setTimeout(function(){
      if(!document.body.classList.contains('settings-page-active'))location.assign(target);
    },220);
  }
  document.addEventListener('click',openProfileSettings,true);
  document.addEventListener('touchend',function(event){
    var button=event.target&&event.target.closest?event.target.closest('#profilePageMore'):null;
    if(!button)return;
    openProfileSettings(event);
  },{capture:true,passive:false});
})();

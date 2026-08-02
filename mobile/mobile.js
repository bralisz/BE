(() => {
  'use strict';
  if (location.hash.startsWith('#/admin')) return;

  const isMobile = () => window.matchMedia('(max-width:760px)').matches;
  const icon = name => ({
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></svg>',
    film:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4"/></svg>',
    series:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="m9 2 3 3 3-3M7 10h7M7 14h5M17 10h.01M17 14h.01"/></svg>',
    support:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-2v-7h4M4 12h4v7H6a2 2 0 0 1-2-2Z"/><path d="M16 19c0 2-2 3-4 3"/></svg>',
    user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7.5" r="4"/></svg>'
  }[name] || '');

  function openDrawer(open){
    document.body.classList.toggle('mobile-drawer-open', Boolean(open));
    const toggle = document.getElementById('mobileMenuToggle');
    if (toggle) toggle.setAttribute('aria-expanded', String(Boolean(open)));
  }

  function closeSearch(){
    document.body.classList.remove('mobile-search-open');
    const input = document.getElementById('mobileSearchInput');
    const desktopInput = document.getElementById('homeSearchInput');
    if (input) input.value = '';
    if (desktopInput){
      desktopInput.value = '';
      desktopInput.dispatchEvent(new Event('input',{bubbles:true}));
    }
  }

  function setActiveDestination(destination){
    document.querySelectorAll('[data-mobile-destination]').forEach(button => {
      button.classList.toggle('active', button.dataset.mobileDestination === destination);
    });
  }

  function selectView(destination){
    closeSearch();
    if (destination === 'home'){
      document.getElementById('logoBtn')?.click();
      document.body.dataset.mobileCollection = '';
    } else if (destination === 'movies' || destination === 'series'){
      const target = document.querySelector(`[data-home-view="${destination}"]`);
      if (target) target.click();
      document.body.dataset.mobileCollection = destination;
    } else if (destination === 'support'){
      document.querySelector('.home-nav-link[data-public-action="support"]')?.click();
    }
    setActiveDestination(destination);
    openDrawer(false);
  }

  function openProfile(){
    openDrawer(false);
    const profileAction = document.querySelector('#userDropdown [data-public-action="profile"]');
    const currentUser = window.beBackend?.auth?.currentUser;
    if (currentUser && profileAction){
      profileAction.click();
      return;
    }
    if (currentUser){
      window.dispatchEvent(new CustomEvent('be:open-profile-route'));
      return;
    }
    location.hash = '#login';
    document.body.classList.add('login-mode');
  }

  function createMobileUI(){
    if (document.getElementById('mobileAppBar')) return;

    const bar = document.createElement('header');
    bar.className = 'mobile-app-bar';
    bar.id = 'mobileAppBar';
    bar.innerHTML = `
      <button class="mobile-menu-toggle" id="mobileMenuToggle" type="button" aria-label="Abrir menu" aria-expanded="false">${icon('menu')}</button>
      <button class="mobile-brand" id="mobileHomeBrand" type="button" aria-label="Ir para a Home"><img src="/assets/logo.png" alt="BE"></button>
      <button class="mobile-profile-button" id="mobileProfileButton" type="button" aria-label="Abrir perfil"><span id="mobileHeaderAvatar">${icon('user')}</span></button>`;

    const backdrop = document.createElement('button');
    backdrop.className = 'mobile-drawer-backdrop';
    backdrop.id = 'mobileDrawerBackdrop';
    backdrop.type = 'button';
    backdrop.setAttribute('aria-label','Fechar menu');

    const drawer = document.createElement('aside');
    drawer.className = 'mobile-drawer';
    drawer.id = 'mobileDrawer';
    drawer.setAttribute('aria-label','Menu mobile');
    drawer.innerHTML = `
      <div class="mobile-drawer-top">
        <button class="mobile-drawer-profile" id="mobileDrawerProfile" type="button">
          <span class="mobile-drawer-avatar" id="mobileDrawerAvatar">${icon('user')}</span>
          <span class="mobile-drawer-user"><strong id="mobileDrawerName">Visitante</strong><span id="mobileDrawerUsername">Entrar ou criar conta</span></span>
        </button>
        <button class="mobile-drawer-close" id="mobileDrawerClose" type="button" aria-label="Fechar menu">${icon('close')}</button>
      </div>
      <nav class="mobile-drawer-nav" aria-label="Navegação mobile">
        <button class="mobile-drawer-link active" type="button" data-mobile-destination="home">${icon('home')}<span>Home</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="movies">${icon('film')}<span>Filmes</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="series">${icon('series')}<span>Séries</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="support">${icon('support')}<span>Suporte</span></button>
      </nav>
      <div class="mobile-drawer-footer">BE — experiência mobile</div>`;

    document.body.append(bar, backdrop, drawer);
    syncProfile();
  }

  function handleMobileClick(event){
    if (!isMobile()) return;
    const target = event.target.closest('button, [data-mobile-destination]');
    if (!target) return;

    if (target.id === 'mobileMenuToggle'){
      event.preventDefault();
      event.stopPropagation();
      openDrawer(true);
      return;
    }
    if (target.id === 'mobileDrawerClose' || target.id === 'mobileDrawerBackdrop'){
      event.preventDefault();
      openDrawer(false);
      return;
    }
    if (target.id === 'mobileHomeBrand'){
      event.preventDefault();
      selectView('home');
      return;
    }
    if (target.id === 'mobileProfileButton' || target.id === 'mobileDrawerProfile'){
      event.preventDefault();
      event.stopPropagation();
      openProfile();
      return;
    }
    if (target.dataset.mobileDestination){
      event.preventDefault();
      selectView(target.dataset.mobileDestination);
    }
  }

  function syncProfile(){
    const sourcePhoto = document.getElementById('publicUserPhoto');
    const username = document.getElementById('ddUsername');
    const headerAvatar = document.getElementById('mobileHeaderAvatar');
    const drawerAvatar = document.getElementById('mobileDrawerAvatar');
    const drawerName = document.getElementById('mobileDrawerName');
    const drawerUsername = document.getElementById('mobileDrawerUsername');
    if (!headerAvatar || !drawerAvatar) return;

    const update = () => {
      const src = sourcePhoto && !sourcePhoto.hidden ? sourcePhoto.getAttribute('src') : '';
      const raw = String(username?.textContent || '').trim();
      const account = window.beBackend?.auth?.currentUser;
      const fallbackName = String(account?.displayName || account?.profile?.displayName || account?.profile?.username || '').trim();
      const display = raw || fallbackName || 'Visitante';
      const normalized = display.startsWith('@') ? display : (display === 'Visitante' ? 'Entrar ou criar conta' : `@${display}`);
      const safeSrc = String(src || account?.photoURL || account?.profile?.avatarUrl || '').replace(/"/g,'&quot;');
      const avatarMarkup = safeSrc ? `<img src="${safeSrc}" alt="Avatar">` : icon('user');
      headerAvatar.innerHTML = avatarMarkup;
      drawerAvatar.innerHTML = avatarMarkup;
      drawerName.textContent = display.startsWith('@') ? display.slice(1) : display;
      drawerUsername.textContent = normalized;
    };

    update();
    if (sourcePhoto) new MutationObserver(update).observe(sourcePhoto,{attributes:true,attributeFilter:['src','hidden']});
    if (username) new MutationObserver(update).observe(username,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden']});
    window.addEventListener('be:profile-avatar-changed',update);
    window.setTimeout(update,500);
    window.setTimeout(update,1600);
  }

  function addMobileViewButtons(){
    const nav = document.getElementById('homeNavLinks');
    if (!nav) return;
    if (!nav.querySelector('[data-home-view="movies"]')){
      const movies = document.createElement('button');
      movies.type='button'; movies.hidden=true; movies.dataset.homeView='movies'; movies.textContent='Filmes';
      nav.append(movies);
    }
    if (!nav.querySelector('[data-home-view="series"]')){
      const series = document.createElement('button');
      series.type='button'; series.hidden=true; series.dataset.homeView='series'; series.textContent='Séries';
      nav.append(series);
    }
  }

  function start(){
    addMobileViewButtons();
    createMobileUI();
    document.addEventListener('click',handleMobileClick,true);
    document.addEventListener('keydown',event=>{
      if (event.key === 'Escape') openDrawer(false);
    });
    window.addEventListener('resize',()=>{ if (!isMobile()) openDrawer(false); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

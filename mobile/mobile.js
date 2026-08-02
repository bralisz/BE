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
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7.5" r="4"/></svg>'
  }[name] || '');

  function createMobileUI(){
    if (document.getElementById('mobileAppBar')) return;
    const bar = document.createElement('header');
    bar.className = 'mobile-app-bar';
    bar.id = 'mobileAppBar';
    bar.innerHTML = `
      <button class="mobile-menu-toggle" id="mobileMenuToggle" type="button" aria-label="Abrir menu" aria-expanded="false">${icon('menu')}</button>
      <button class="mobile-brand" id="mobileHomeBrand" type="button" aria-label="Ir para a Home"><img src="/assets/logo.png" alt="BE"></button>
      <button class="mobile-profile-button" id="mobileProfileButton" type="button" aria-label="Abrir conta"><span id="mobileHeaderAvatar">${icon('user')}</span></button>`;

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

    const searchPanel = document.createElement('div');
    searchPanel.className = 'mobile-search-panel';
    searchPanel.id = 'mobileSearchPanel';
    searchPanel.innerHTML = `<input id="mobileSearchInput" type="search" autocomplete="off" placeholder="Pesquisar filmes e vídeos" aria-label="Pesquisar conteúdos"><button class="mobile-search-close" id="mobileSearchClose" type="button" aria-label="Fechar pesquisa">${icon('close')}</button>`;

    document.body.append(bar, backdrop, drawer, searchPanel);
    bindMobileUI();
    syncProfile();
  }

  function openDrawer(open){
    document.body.classList.toggle('mobile-drawer-open', open);
    const toggle = document.getElementById('mobileMenuToggle');
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
  }
  function closeSearch(){
    document.body.classList.remove('mobile-search-open');
    const input = document.getElementById('mobileSearchInput');
    const desktopInput = document.getElementById('homeSearchInput');
    if (input) input.value = '';
    if (desktopInput){ desktopInput.value=''; desktopInput.dispatchEvent(new Event('input',{bubbles:true})); }
  }

  function setActiveDestination(destination){
    document.querySelectorAll('[data-mobile-destination]').forEach(button => button.classList.toggle('active', button.dataset.mobileDestination === destination));
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

  function bindMobileUI(){
    document.getElementById('mobileMenuToggle')?.addEventListener('click',()=>openDrawer(true));
    document.getElementById('mobileDrawerClose')?.addEventListener('click',()=>openDrawer(false));
    document.getElementById('mobileDrawerBackdrop')?.addEventListener('click',()=>openDrawer(false));
    document.getElementById('mobileHomeBrand')?.addEventListener('click',()=>selectView('home'));
    document.getElementById('mobileProfileButton')?.addEventListener('click',()=>document.getElementById('userChip')?.click());
    document.getElementById('mobileDrawerProfile')?.addEventListener('click',()=>{
      openDrawer(false);
      const profileAction = document.querySelector('#userDropdown [data-public-action="profile"]');
      if (profileAction) profileAction.click(); else document.getElementById('userChip')?.click();
    });
    document.querySelectorAll('[data-mobile-destination]').forEach(button=>button.addEventListener('click',()=>selectView(button.dataset.mobileDestination)));
    document.getElementById('mobileSearchClose')?.addEventListener('click',closeSearch);
    document.getElementById('mobileSearchInput')?.addEventListener('input',event=>{
      const desktopInput = document.getElementById('homeSearchInput');
      if (!desktopInput) return;
      desktopInput.value = event.currentTarget.value;
      desktopInput.dispatchEvent(new Event('input',{bubbles:true}));
    });
    document.addEventListener('keydown',event=>{
      if (event.key === 'Escape'){
        openDrawer(false);
        closeSearch();
      }
    });
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
      const display = raw || 'Visitante';
      const handle = display.startsWith('@') ? display : (display === 'Visitante' ? 'Entrar ou criar conta' : display);
      const avatarMarkup = src ? `<img src="${src.replace(/"/g,'&quot;')}" alt="Avatar">` : icon('user');
      headerAvatar.innerHTML = avatarMarkup;
      drawerAvatar.innerHTML = avatarMarkup;
      drawerName.textContent = display.startsWith('@') ? display.slice(1) : display;
      drawerUsername.textContent = handle;
    };
    update();
    if (sourcePhoto) new MutationObserver(update).observe(sourcePhoto,{attributes:true,attributeFilter:['src','hidden']});
    if (username) new MutationObserver(update).observe(username,{childList:true,subtree:true,characterData:true});
    window.addEventListener('be:profile-avatar-changed',update);
  }

  function addMobileViewButtons(){
    const nav = document.getElementById('homeNavLinks');
    if (!nav || nav.querySelector('[data-home-view="movies"]')) return;
    const movies = document.createElement('button');
    movies.type='button'; movies.hidden=true; movies.dataset.homeView='movies'; movies.textContent='Filmes';
    const series = document.createElement('button');
    series.type='button'; series.hidden=true; series.dataset.homeView='series'; series.textContent='Séries';
    nav.append(movies,series);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    addMobileViewButtons();
    createMobileUI();
  });
  window.addEventListener('resize',()=>{ if (!isMobile()) openDrawer(false); });
})();

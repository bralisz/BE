(() => {
  'use strict';
  if (location.hash.startsWith('#/admin')) return;

  const MOBILE_QUERY = '(max-width:760px)';
  const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;

  const icon = name => ({
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></svg>',
    film:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4"/></svg>',
    video:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2Z"/><path d="m8.5 9 4 3-4 3Z"/></svg>',
    support:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-2v-7h4M4 12h4v7H6a2 2 0 0 1-2-2Z"/><path d="M16 19c0 2-2 3-4 3"/></svg>',
    user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7.5" r="4"/></svg>',
    logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="m15 8 4 4-4 4M19 12H9"/></svg>'
  }[name] || '');

  function openDrawer(open) {
    const shouldOpen = Boolean(open) && isMobile();
    document.body.classList.toggle('mobile-drawer-open', shouldOpen);
    const toggle = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileDrawer');
    if (toggle) toggle.setAttribute('aria-expanded', String(shouldOpen));
    if (drawer) drawer.setAttribute('aria-hidden', String(!shouldOpen));
  }

  function syncMobileSearch(value) {
    const desktopInput = document.getElementById('homeSearchInput');
    if (!desktopInput) return;
    desktopInput.value = String(value || '');
    desktopInput.dispatchEvent(new Event('input', { bubbles:true }));
  }

  function openMobileSearch(open, clearOnClose = true) {
    const shouldOpen = Boolean(open) && isMobile();
    const input = document.getElementById('mobileSearchInput');
    const button = document.getElementById('mobileSearchButton');
    document.body.classList.toggle('mobile-search-open', shouldOpen);
    if (button) {
      button.setAttribute('aria-expanded', String(shouldOpen));
      button.setAttribute('aria-label', shouldOpen ? 'Fechar pesquisa' : 'Abrir pesquisa');
    }
    if (shouldOpen) {
      openDrawer(false);
      window.requestAnimationFrame(() => input?.focus({ preventScroll:true }));
    } else if (clearOnClose && input) {
      input.value = '';
      syncMobileSearch('');
      button?.focus({ preventScroll:true });
    }
  }

  function setActiveDestination(destination) {
    document.querySelectorAll('[data-mobile-destination]').forEach(button => {
      const active = button.dataset.mobileDestination === destination;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function clickHomeView(view) {
    const selector = view === 'home' ? '#logoBtn' : `[data-home-view="${view}"]`;
    const button = document.querySelector(selector);
    if (!button) return false;
    button.click();
    return true;
  }

  function selectView(destination) {
    if (destination === 'home') {
      clickHomeView('home');
      document.body.dataset.mobileCollection = '';
    } else if (destination === 'films') {
      clickHomeView('films');
      document.body.dataset.mobileCollection = 'films';
    } else if (destination === 'videos') {
      clickHomeView('videos');
      document.body.dataset.mobileCollection = 'videos';
    } else if (destination === 'community') {
      window.dispatchEvent(new CustomEvent('be:open-community'));
      document.body.dataset.mobileCollection = 'community';
    } else if (destination === 'support') {
      document.querySelector('.home-nav-link[data-public-action="support"]')?.click();
    }
    setActiveDestination(destination);
    openDrawer(false);
    openMobileSearch(false);
  }

  function openProfile() {
    openDrawer(false);
    openMobileSearch(false);
    const currentUser = window.beBackend?.auth?.currentUser;
    if (!currentUser) {
      location.assign('/login');
      document.body.classList.add('login-mode');
      return;
    }
    const profileAction = document.querySelector('#userDropdown [data-public-action="profile"]');
    if (profileAction) profileAction.click();
    else window.dispatchEvent(new CustomEvent('be:open-profile-route'));
  }

  async function logout() {
    openDrawer(false);
    const auth = window.beBackend?.auth;
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      location.assign('/login');
      document.body.classList.add('login-mode');
      return;
    }
    const existingAction = document.querySelector('#publicAuthAction[data-public-action="auth"]');
    if (existingAction) {
      existingAction.click();
      return;
    }
    try {
      await auth.signOut();
      clickHomeView('home');
    } catch (error) {
      console.warn('Não foi possível sair:', error?.message || error);
    }
  }

  function createMobileUI() {
    if (document.getElementById('mobileAppBar')) return;

    const bar = document.createElement('header');
    bar.className = 'mobile-app-bar';
    bar.id = 'mobileAppBar';
    bar.innerHTML = `
      <button class="mobile-profile-button" id="mobileProfileButton" type="button" aria-label="Abrir perfil"><span id="mobileHeaderAvatar">${icon('user')}</span></button>
      <div class="mobile-search-control" id="mobileSearchControl">
        <label class="sr-only" for="mobileSearchInput">Pesquisar conteúdos</label>
        <input id="mobileSearchInput" type="search" autocomplete="off" placeholder="Pesquisar filmes e vídeos" aria-label="Pesquisar filmes e vídeos">
        <button class="mobile-search-button" id="mobileSearchButton" type="button" aria-label="Abrir pesquisa" aria-expanded="false">
          <span class="mobile-search-icon">${icon('search')}</span>
          <span class="mobile-search-close-icon">${icon('close')}</span>
        </button>
      </div>`;

    const backdrop = document.createElement('button');
    backdrop.className = 'mobile-drawer-backdrop';
    backdrop.id = 'mobileDrawerBackdrop';
    backdrop.type = 'button';
    backdrop.setAttribute('aria-label', 'Fechar menu');

    const drawer = document.createElement('aside');
    drawer.className = 'mobile-drawer';
    drawer.id = 'mobileDrawer';
    drawer.setAttribute('aria-label', 'Menu mobile');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
      <div class="mobile-drawer-top">
        <button class="mobile-drawer-profile" id="mobileDrawerProfile" type="button" aria-label="Abrir perfil">
          <span class="mobile-drawer-avatar" id="mobileDrawerAvatar">${icon('user')}</span>
          <span class="mobile-drawer-user"><strong id="mobileDrawerName">Visitante</strong><span id="mobileDrawerUsername">Entrar ou criar conta</span></span>
        </button>
        <button class="mobile-drawer-close" id="mobileDrawerClose" type="button" aria-label="Fechar menu">${icon('close')}</button>
      </div>
      <nav class="mobile-drawer-nav" aria-label="Navegação mobile">
        <button class="mobile-drawer-link active" type="button" data-mobile-destination="home">${icon('home')}<span>Home</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="films">${icon('film')}<span>Filmes</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="videos">${icon('video')}<span>Vídeos</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="community">${icon('fans')}<span>Comunidade</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="support">${icon('support')}<span>Suporte</span></button>
      </nav>
      <div class="mobile-drawer-footer">
        <button class="mobile-logout-button" id="mobileLogoutButton" type="button">${icon('logout')}<span>Sair do site</span></button>
      </div>`;

    document.body.append(bar, backdrop, drawer);
    bindMobileActions();
    syncProfile();
  }

  function bindActivation(element, handler) {
    if (!element || element.dataset.mobileBound === 'true') return;
    element.dataset.mobileBound = 'true';
    let lastTouch = 0;
    element.addEventListener('touchend', event => {
      if (!isMobile()) return;
      lastTouch = Date.now();
      event.preventDefault();
      event.stopPropagation();
      handler(event);
    }, { passive:false });
    element.addEventListener('click', event => {
      if (!isMobile()) return;
      if (Date.now() - lastTouch < 650) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      handler(event);
    });
  }

  function bindMobileActions() {
    const searchButton = document.getElementById('mobileSearchButton');
    const searchInput = document.getElementById('mobileSearchInput');

    bindActivation(searchButton, () => {
      openMobileSearch(!document.body.classList.contains('mobile-search-open'));
    });

    if (searchInput && searchInput.dataset.mobileSearchBound !== 'true') {
      searchInput.dataset.mobileSearchBound = 'true';
      searchInput.addEventListener('input', () => syncMobileSearch(searchInput.value));
      searchInput.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          openMobileSearch(false);
        }
      });
    }

    bindActivation(document.getElementById('mobileDrawerClose'), () => openDrawer(false));
    bindActivation(document.getElementById('mobileDrawerBackdrop'), () => openDrawer(false));
    bindActivation(document.getElementById('mobileProfileButton'), () => window.dispatchEvent(new CustomEvent('be:toggle-mobile-account-menu')));
    bindActivation(document.getElementById('mobileDrawerProfile'), openProfile);
    bindActivation(document.getElementById('mobileLogoutButton'), logout);
    document.querySelectorAll('[data-mobile-destination]').forEach(button => {
      bindActivation(button, () => selectView(button.dataset.mobileDestination));
    });
  }

  function syncProfile() {
    const sourcePhoto = document.getElementById('publicUserPhoto');
    const usernameSource = document.getElementById('ddUsername');
    const profileNameSource = document.getElementById('profilePageName');
    const profileHandleSource = document.getElementById('profilePageHandle');
    const headerAvatar = document.getElementById('mobileHeaderAvatar');
    const drawerAvatar = document.getElementById('mobileDrawerAvatar');
    const drawerName = document.getElementById('mobileDrawerName');
    const drawerUsername = document.getElementById('mobileDrawerUsername');
    const logoutButton = document.getElementById('mobileLogoutButton');
    if (!headerAvatar || !drawerAvatar || !drawerName || !drawerUsername) return;

    const update = () => {
      const account = window.beBackend?.auth?.currentUser;
      const src = sourcePhoto && !sourcePhoto.hidden ? sourcePhoto.getAttribute('src') : '';
      const profileAvatar = account?.profile?.avatarUrl ? String(account.profile.avatarUrl) : '';
      const safeSrc = String(src || profileAvatar || '').replace(/"/g, '&quot;');
      const avatarMarkup = safeSrc ? `<img loading="lazy" decoding="async" src="${safeSrc}" alt="Avatar">` : icon('user');
      headerAvatar.innerHTML = avatarMarkup;
      drawerAvatar.innerHTML = avatarMarkup;

      if (!account) {
        drawerName.textContent = 'Visitante';
        drawerUsername.textContent = 'Entrar ou criar conta';
        if (logoutButton) logoutButton.hidden = true;
        return;
      }

      const profileName = String(profileNameSource?.textContent || '').trim();
      const accountName = String(account?.profile?.displayName || account?.displayName || '').trim();
      const rawHandle = String(profileHandleSource?.textContent || usernameSource?.textContent || account?.profile?.username || '').trim();
      const handle = rawHandle && rawHandle !== 'Visitante' ? (rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`) : '';
      drawerName.textContent = profileName || accountName || handle.replace(/^@/, '') || 'Usuário';
      drawerUsername.textContent = handle || 'Perfil conectado';
      if (logoutButton) logoutButton.hidden = false;
    };

    update();
    [sourcePhoto, usernameSource, profileNameSource, profileHandleSource].filter(Boolean).forEach(node => {
      new MutationObserver(update).observe(node, {
        attributes:true,
        childList:true,
        subtree:true,
        characterData:true,
        attributeFilter:['src','hidden']
      });
    });
    window.addEventListener('be:profile-avatar-changed', update);
    window.beBackend?.auth?.onChange?.(() => window.setTimeout(update, 40));
    window.setTimeout(update, 500);
    window.setTimeout(update, 1600);
  }

  function syncActiveFromPublicView() {
    if (document.body.classList.contains('community-page-active')) {
      setActiveDestination('community');
      return;
    }
    const view = document.body.dataset.homeView || 'home';
    setActiveDestination(view === 'films' ? 'films' : view === 'videos' ? 'videos' : 'home');
  }

  function start() {
    createMobileUI();
    syncActiveFromPublicView();
    window.addEventListener('be:catalog-ready', syncActiveFromPublicView);
    window.addEventListener('resize', () => {
      if (!isMobile()) {
        openDrawer(false);
        openMobileSearch(false);
      }
    });
    window.addEventListener('popstate', () => { openDrawer(false); openMobileSearch(false, false); });
    window.addEventListener('hashchange', () => { openDrawer(false); openMobileSearch(false, false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        openDrawer(false);
        openMobileSearch(false);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();

/* BETV installed mobile app: compact bottom navigation (Home, Profile, Saved). */
(() => {
  'use strict';
  if (window.BETVMobileBottomNav) return;

  const mobile = window.matchMedia('(max-width: 760px)');
  const isApp = () => mobile.matches && document.documentElement.classList.contains('betv-installed-app');
  const nav = document.createElement('nav');
  nav.id = 'betvMobileBottomNav';
  nav.className = 'betv-mobile-bottom-nav';
  nav.setAttribute('aria-label', 'Navegação do aplicativo');
  nav.hidden = true;
  nav.innerHTML = `
    <button type="button" data-app-tab="home" aria-label="Início" title="Início">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>
    </button>
    <button type="button" data-app-tab="profile" aria-label="Perfil" title="Perfil">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.3-4.2 3.2-6.5 7.5-6.5s7.2 2.3 7.5 6.5"/></svg>
    </button>
    <button type="button" data-app-tab="saved" aria-label="Vídeos salvos" title="Vídeos salvos">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="4.2" height="16" rx="1.2"/><rect x="9.5" y="4" width="4.2" height="16" rx="1.2"/><path d="m16 5 3.2-.8L23 19l-3.5.9z"/></svg>
    </button>`;

  let activeTab = 'home';
  let savedPending = false;
  let savedObserver = null;
  let savedTimeout = 0;

  const ownUsername = () => {
    const current = window.beBackend?.auth?.currentUser;
    return String(current?.profile?.username || current?.username || '').replace(/^@/, '').toLowerCase();
  };
  const viewingOwnProfile = () => {
    if (!document.body.classList.contains('profile-page-active')) return false;
    if (document.body.classList.contains('profile-view-own')) return true;
    const own = ownUsername();
    const viewed = String(document.getElementById('profilePageHandle')?.textContent || '').trim().replace(/^@/, '').toLowerCase();
    return Boolean(own && viewed === own);
  };
  const localizedLabels = () => {
    const slug = String(window.BETVLocale?.slug || document.documentElement.lang || 'pt-br').toLowerCase();
    if (slug.startsWith('en')) return ['Home', 'Profile', 'Saved videos'];
    if (slug.startsWith('es')) return ['Inicio', 'Perfil', 'Vídeos guardados'];
    if (slug.startsWith('fr')) return ['Accueil', 'Profil', 'Vidéos enregistrées'];
    if (slug.startsWith('it')) return ['Home', 'Profilo', 'Video salvati'];
    return ['Início', 'Perfil', 'Vídeos salvos'];
  };
  function syncLabels() {
    const words = localizedLabels();
    ['home', 'profile', 'saved'].forEach((tab, i) => {
      const button = nav.querySelector('[data-app-tab="' + tab + '"]');
      button.setAttribute('aria-label', words[i]);
      button.title = words[i];
    });
  }
  function sync() {
    const visible = isApp() &&
      !document.body.classList.contains('login-mode') &&
      !document.body.classList.contains('admin-mode') &&
      !document.body.classList.contains('drive-player-open') &&
      !document.body.classList.contains('player-open') &&
      !document.body.classList.contains('profile-onboarding-active') &&
      !document.body.classList.contains('profile-favorites-picker-active') &&
      !document.body.classList.contains('avatar-picker-active') &&
      !document.body.classList.contains('banner-picker-active');
    nav.hidden = !visible;
    if (!visible) return;
    const onProfile = document.body.classList.contains('profile-page-active');
    const selected = onProfile ? (activeTab === 'saved' ? 'saved' : 'profile') : 'home';
    for (const button of nav.querySelectorAll('[data-app-tab]')) {
      const active = button.dataset.appTab === selected;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
  }
  function stopSavedWatch() {
    savedPending = false;
    if (savedObserver) savedObserver.disconnect();
    savedObserver = null;
    if (savedTimeout) clearTimeout(savedTimeout);
    savedTimeout = 0;
  }
  function trySavedSection() {
    if (!savedPending || !isApp() || !viewingOwnProfile()) return;
    const section = document.getElementById('profileSavedSection');
    if (!section || section.hidden || !section.isConnected) return;
    stopSavedWatch();
    requestAnimationFrame(() => {
      if (!isApp() || !document.body.classList.contains('profile-page-active')) return;
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      sync();
    });
  }
  function watchSavedSection() {
    stopSavedWatch();
    savedPending = true;
    savedObserver = new MutationObserver(trySavedSection);
    savedObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const profile = document.getElementById('profilePage');
    if (profile) savedObserver.observe(profile, { attributes: true, subtree: true, childList: true, attributeFilter: ['hidden', 'class'] });
    savedTimeout = setTimeout(stopSavedWatch, 6500);
    trySavedSection();
  }
  function openProfile(saved) {
    if (!isApp()) return;
    const user = window.beBackend?.auth?.currentUser;
    activeTab = saved ? 'saved' : 'profile';
    if (!user) {
      stopSavedWatch();
      window.BETVPublicRoutes?.go?.('/login');
      sync();
      return;
    }
    if (saved) watchSavedSection();
    else stopSavedWatch();
    if (saved && viewingOwnProfile()) {
      trySavedSection();
      sync();
      return;
    }
    try {
      const result = window.BETVNavigation?.openProfile?.();
      if (saved) Promise.resolve(result).then(trySavedSection).catch(stopSavedWatch);
    } catch (_) {
      stopSavedWatch();
    }
    sync();
  }

  nav.addEventListener('click', event => {
    const button = event.target.closest('[data-app-tab]');
    if (!button || !isApp()) return;
    const tab = button.dataset.appTab;
    if (tab === 'home') {
      activeTab = 'home';
      stopSavedWatch();
      const homeButton = document.getElementById('mobileHomeButton');
      if (homeButton) homeButton.click();
      else if (window.BETVPublicRoutes?.go) window.BETVPublicRoutes.go('/');
      else location.assign('/');
      sync();
    } else {
      openProfile(tab === 'saved');
    }
  });

  function init() {
    if (document.getElementById(nav.id)) return;
    document.body.appendChild(nav);
    syncLabels();
    sync();
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    ['popstate', 'hashchange', 'pageshow', 'be:route-change', 'be:home-entered'].forEach(name =>
      window.addEventListener(name, () => {
        if (!document.body.classList.contains('profile-page-active')) {
          activeTab = 'home';
          stopSavedWatch();
        }
        sync();
      })
    );
    window.addEventListener('be:i18n-ready', syncLabels);
    window.addEventListener('be:open-profile-route', () => {
      if (savedPending) trySavedSection();
      else activeTab = 'profile';
      sync();
    });
  }

  window.BETVMobileBottomNav = Object.freeze({ refresh: sync });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

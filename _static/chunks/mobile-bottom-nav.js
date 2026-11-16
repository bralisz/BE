/* BETV installed-app-only bottom navigation, standalone heart-saved library and detail back. */
(() => {
  'use strict';
  if (window.BETVMobileBottomNav) return;

  const mobile = window.matchMedia('(max-width:760px)');
  const app = () => mobile.matches && document.documentElement.classList.contains('betv-installed-app');
  const detail = () => document.body.classList.contains('detail-page-active');
  const signedIn = () => Boolean(window.beBackend?.auth?.currentUser?.uid);
  const tabs = ['home','profile','saved'];
  const nav = document.createElement('nav');
  nav.id = 'betvMobileBottomNav';
  nav.className = 'betv-mobile-bottom-nav';
  nav.setAttribute('aria-label', 'Navegação do aplicativo');
  nav.hidden = true;
  nav.innerHTML = `
    <button type="button" data-app-tab="home" aria-label="Início">
      <svg class="app-tab-home-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>
      <svg class="app-tab-back-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m14.5 5-7 7 7 7"/><path d="M8 12h13"/></svg>
    </button>
    <button type="button" data-app-tab="profile" aria-label="Perfil">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.3-4.2 3.2-6.5 7.5-6.5s7.2 2.3 7.5 6.5"/></svg>
    </button>
    <button type="button" data-app-tab="saved" aria-label="Vídeos salvos">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="4.2" height="16" rx="1.2"/><rect x="9.5" y="4" width="4.2" height="16" rx="1.2"/><path d="m16 5 3.2-.8L23 19l-3.5.9z"/></svg>
    </button>`;

  const page = document.createElement('section');
  page.id = 'betvAppSavedPage';
  page.className = 'betv-app-saved-page';
  page.hidden = true;
  page.setAttribute('aria-label', 'Vídeos salvos');
  page.innerHTML = `
    <header class="betv-app-saved-heading">
      <div><span class="betv-app-saved-eyebrow">SUA BIBLIOTECA</span>
      <h1 id="betvAppSavedTitle">Vídeos salvos</h1>
      <p id="betvAppSavedSubtitle">Conteúdos que você marcou com o coração.</p></div>
      <span id="betvAppSavedCount" aria-live="polite"></span>
    </header>
    <div class="betv-app-saved-grid" id="betvAppSavedGrid"></div>
    <button class="betv-app-saved-more" id="betvAppSavedMore" type="button" hidden>Ver mais</button>`;

  let current = 'home';
  let returnToSaved = false;
  let shown = 0;
  let items = [];
  const pageSize = 24;
  const homeTab = () => nav.querySelector('[data-app-tab="home"]');
  const savedTab = () => nav.querySelector('[data-app-tab="saved"]');
  const grid = () => page.querySelector('#betvAppSavedGrid');
  const more = () => page.querySelector('#betvAppSavedMore');

  function dictionary() {
    const slug = String(window.BETVLocale?.slug || document.documentElement.lang || 'pt-br').toLowerCase();
    if (slug.startsWith('en')) return ['Home','Back','Profile','Saved videos','YOUR LIBRARY','Saved videos','Videos, films and episodes you liked.','No saved videos yet.','Tap the heart on any video to find it here.','Show more','Explore videos','saved'];
    if (slug.startsWith('es')) return ['Inicio','Volver','Perfil','Vídeos guardados','TU BIBLIOTECA','Vídeos guardados','Contenidos que marcaste con el corazón.','Todavía no hay vídeos guardados.','Toca el corazón de un vídeo para encontrarlo aquí.','Ver más','Explorar vídeos','guardados'];
    if (slug.startsWith('fr')) return ['Accueil','Retour','Profil','Vidéos enregistrées','VOTRE BIBLIOTHÈQUE','Vidéos enregistrées','Contenus que vous avez aimés.','Aucune vidéo enregistrée.','Touchez le cœur d’une vidéo pour la retrouver ici.','Voir plus','Explorer les vidéos','enregistrés'];
    if (slug.startsWith('it')) return ['Home','Indietro','Profilo','Video salvati','LA TUA LIBRERIA','Video salvati','Contenuti che hai salvato con il cuore.','Nessun video salvato.','Tocca il cuore di un video per trovarlo qui.','Mostra altri','Esplora video','salvati'];
    return ['Início','Voltar','Perfil','Vídeos salvos','SUA BIBLIOTECA','Vídeos salvos','Conteúdos que você marcou com o coração.','Nenhum vídeo salvo ainda.','Toque no coração de algum conteúdo para encontrá-lo aqui.','Ver mais','Explorar vídeos','salvos'];
  }
  function labels() {
    const words = dictionary();
    const names = [detail() ? words[1] : words[0], words[2], words[3]];
    tabs.forEach((tab, i) => {
      const button = nav.querySelector('[data-app-tab="' + tab + '"]');
      button.setAttribute('aria-label', names[i]);
      button.title = names[i];
    });
    page.querySelector('.betv-app-saved-eyebrow').textContent = words[4];
    page.querySelector('#betvAppSavedTitle').textContent = words[5];
    page.querySelector('#betvAppSavedSubtitle').textContent = words[6];
    more().textContent = words[9];
    page.setAttribute('aria-label', words[5]);
  }
  function isSavedPage() { return document.body.classList.contains('betv-app-saved-active'); }
  function revealSaved() {
    if (!app() || !signedIn()) return;
    returnToSaved = false;
    current = 'saved';
    document.body.classList.add('betv-app-saved-active');
    page.hidden = false;
    page.scrollTop = 0;
    renderSaved(true);
    sync();
  }
  function concealSaved() {
    document.body.classList.remove('betv-app-saved-active');
    page.hidden = true;
  }
  function savedItems() {
    try {
      const result = window.beGetSavedContents?.();
      return Array.isArray(result)
        ? result.filter(item => item && ['videos','movies','series'].includes(String(item.collection || 'videos').toLowerCase()))
        : [];
    } catch (_) { return []; }
  }
  function safePoster(value) {
    if (!value) return '';
    try {
      const media = typeof window.beMediaUrl === 'function' ? window.beMediaUrl(value) : value;
      const url = new URL(String(media), location.origin);
      return url.protocol === 'https:' || url.origin === location.origin && url.protocol === 'http:' ? url.href : '';
    } catch (_) { return ''; }
  }
  function card(item) {
    const title = String(item.title || '');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'betv-app-saved-card';
    button.setAttribute('aria-label', title);
    const cover = document.createElement('span');
    cover.className = 'betv-app-saved-cover';
    const poster = safePoster(item.imageUrl || item.bannerUrl);
    if (poster) {
      const img = document.createElement('img');
      img.src = poster;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
      cover.appendChild(img);
    }
    const name = document.createElement('strong');
    name.textContent = title;
    name.className = 'betv-app-saved-name';
    const meta = document.createElement('small');
    meta.className = 'betv-app-saved-meta';
    meta.textContent = [item.year, item.duration].filter(Boolean).join(' · ');
    const heart = document.createElement('span');
    heart.className = 'betv-app-saved-heart';
    heart.setAttribute('aria-hidden', 'true');
    heart.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
    cover.appendChild(heart);
    button.append(cover, name, meta);
    button.addEventListener('click', () => {
      if (!app()) return;
      concealSaved();
      returnToSaved = true;
      try {
        if (typeof window.beOpenSavedContent === 'function') window.beOpenSavedContent(item);
        else returnToSaved = false;
      } catch (_) { returnToSaved = false; revealSaved(); }
      sync();
    });
    return button;
  }
  function appendPage() {
    const start = shown;
    shown = Math.min(items.length, shown + pageSize);
    const fragment = document.createDocumentFragment();
    for (let i = start; i < shown; i++) fragment.appendChild(card(items[i]));
    grid().appendChild(fragment);
    more().hidden = shown >= items.length;
  }
  function renderSaved(reset = false) {
    if (!isSavedPage()) return;
    const next = savedItems();
    if (!reset && next.length === items.length && next.every((item, i) =>
      String(item.favoriteId || item.itemId || item.recordId) === String(items[i]?.favoriteId || items[i]?.itemId || items[i]?.recordId))) return;
    items = next;
    shown = 0;
    grid().replaceChildren();
    const count = page.querySelector('#betvAppSavedCount');
    count.textContent = String(items.length) + ' ' + dictionary()[11];
    if (items.length) { appendPage(); return; }
    more().hidden = true;
    const empty = document.createElement('div');
    empty.className = 'betv-app-saved-empty';
    const title = document.createElement('strong');
    title.textContent = dictionary()[7];
    const hint = document.createElement('p');
    hint.textContent = dictionary()[8];
    const browse = document.createElement('button');
    browse.type = 'button';
    browse.textContent = dictionary()[10];
    browse.addEventListener('click', () => { concealSaved(); openHome(); });
    empty.append(title, hint, browse);
    grid().appendChild(empty);
  }
  function sync() {
    labels();
    const body = document.body;
    const visible = app() &&
      !['login-mode','admin-mode','drive-player-open','player-open','profile-onboarding-active',
        'profile-favorites-picker-active','avatar-picker-active','banner-picker-active'].some(cls => body.classList.contains(cls));
    nav.hidden = !visible;
    if (!visible) { if (!app()) concealSaved(); return; }
    const selected = isSavedPage() ? 'saved' : detail() ? 'home' : body.classList.contains('profile-page-active') ? 'profile' : 'home';
    for (const button of nav.querySelectorAll('[data-app-tab]')) {
      const active = button.dataset.appTab === selected;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    homeTab().classList.toggle('is-back', detail());
  }
  function openHome() {
    returnToSaved = false;
    current = 'home';
    concealSaved();
    const home = document.getElementById('mobileHomeButton');
    if (home) home.click();
    else if (typeof window.BETVPublicRoutes?.go === 'function') window.BETVPublicRoutes.go('/');
    else location.assign('/');
    sync();
  }
  function openProfile() {
    returnToSaved = false;
    current = 'profile';
    concealSaved();
    if (!signedIn()) { window.BETVPublicRoutes?.go?.('/login'); sync(); return; }
    try { window.BETVNavigation?.openProfile?.(); } catch (_) {}
    sync();
  }
  function backFromDetail() {
    if (!detail()) return;
    if (returnToSaved) {
      window.dispatchEvent(new CustomEvent('be:detail-close'));
      returnToSaved = false;
      revealSaved();
      return;
    }
    const back = document.getElementById('detailHomeLink');
    if (back) back.click();
    else window.dispatchEvent(new CustomEvent('be:detail-close'));
    sync();
  }
  nav.addEventListener('click', event => {
    const button = event.target.closest('[data-app-tab]');
    if (!button || !app()) return;
    if (button.dataset.appTab === 'home') {
      if (detail()) backFromDetail();
      else openHome();
    } else if (button.dataset.appTab === 'profile') openProfile();
    else if (signedIn()) revealSaved();
    else { concealSaved(); window.BETVPublicRoutes?.go?.('/login'); }
  });
  more().addEventListener('click', appendPage);

  function onRouteChange() {
    if (returnToSaved && !detail() && !isSavedPage() && signedIn() &&
        !['login-mode','admin-mode','player-open','drive-player-open'].some(cls => document.body.classList.contains(cls))) {
      revealSaved();
    }
    if (isSavedPage()) sync();
    else sync();
  }
  function init() {
    if (document.getElementById(nav.id)) return;
    document.body.append(page, nav);
    sync();
    new MutationObserver(sync).observe(document.body, { attributes:true, attributeFilter:['class'] });
    new MutationObserver(sync).observe(document.documentElement, { attributes:true, attributeFilter:['class'] });
    ['popstate','hashchange','pageshow','be:route-change'].forEach(name =>
      window.addEventListener(name, () => requestAnimationFrame(onRouteChange)));
    window.addEventListener('be:home-entered', () => { concealSaved(); returnToSaved = false; sync(); });
    window.addEventListener('be:open-profile-route', () => { concealSaved(); returnToSaved = false; sync(); });
    window.addEventListener('be:favorites-changed', () => { if (isSavedPage()) renderSaved(); });
    window.addEventListener('be:user-data-synced', () => { if (isSavedPage()) renderSaved(true); });
    window.addEventListener('be:i18n-ready', () => { labels(); if (isSavedPage()) renderSaved(true); });
    document.addEventListener('click', event => {
      if (!app() || !detail() || !event.target?.closest?.('#mobileHomeButton')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      backFromDetail();
    }, true);
  }
  window.BETVMobileBottomNav = Object.freeze({ refresh:sync, openSaved:revealSaved });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();

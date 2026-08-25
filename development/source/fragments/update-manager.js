(function () {
  'use strict';

  var ENDPOINT = '/api/deployment-version';
  // Compartilha a checagem entre abas para evitar requests repetidos.
  var CHECK_INTERVAL = 12 * 60 * 60 * 1000;
  var MIN_CHECK_GAP_MS = 2 * 60 * 60 * 1000;
  var SHARED_CHECK_TTL_MS = 12 * 60 * 60 * 1000;
  var SHARED_CHECK_KEY = 'betvDeploymentVersionCheckV3';
  var OBSERVED_RELEASE_KEY = 'betvObservedReleaseStateV1';
  var PENDING_UPDATE_KEY = 'betvPendingUpdateVersion';
  var ADMIN_APPLIED_UPDATE_KEY = 'betvAdminAppliedUpdateVersion';
  var PUBLIC_APPLIED_UPDATE_KEY = 'betvPublicAppliedUpdateVersion';
  var currentVersion = String(window.__BETV_DEPLOYMENT_VERSION__ || '').trim();
  var latestVersion = '';
  var popup = null;
  var checking = false;
  var updateStarted = false;
  var intervalId = 0;
  var lastCheckAt = 0;
  var popupObserver = null;
  var releaseStateLoaded = false;
  var publicReleaseEnabled = false;
  var publicReleasedVersion = '';
  var UPDATE_COPY = {
    'pt-br': { available:'Atualização disponível', ready:'Uma nova versão do site está pronta.', action:'Atualizar', updating:'Atualizando a nova versão' },
    'en-us': { available:'Update available', ready:'A new version of the site is ready.', action:'Update', updating:'Updating to the new version' },
    'es': { available:'Actualización disponible', ready:'Hay una nueva versión del sitio lista.', action:'Actualizar', updating:'Actualizando a la nueva versión' },
    'fr': { available:'Mise à jour disponible', ready:'Une nouvelle version du site est prête.', action:'Mettre à jour', updating:'Mise à jour vers la nouvelle version' },
    'it': { available:'Aggiornamento disponibile', ready:'È pronta una nuova versione del sito.', action:'Aggiorna', updating:'Aggiornamento alla nuova versione' }
  };

  function updateLocaleSlug() {
    var configured = String(window.BETVLocale && window.BETVLocale.slug || '').toLowerCase();
    if (UPDATE_COPY[configured]) return configured;
    var match = String(window.location.pathname || '').toLowerCase().match(/^\/(pt-br|en-us|es|fr|it)(?:\/|$)/);
    return match && UPDATE_COPY[match[1]] ? match[1] : 'pt-br';
  }

  function updateCopy() {
    return UPDATE_COPY[updateLocaleSlug()] || UPDATE_COPY['pt-br'];
  }

  function isAuthenticatedAdmin() {
    try {
      var backend = window.beBackend;
      var account = backend && backend.auth ? backend.auth.currentUser : null;
      if (!account) return false;
      if (backend && typeof backend.isAdmin === 'function') return backend.isAdmin(account) === true;
      return String(account.role || '').toLowerCase() === 'admin';
    } catch (_) {}
    return false;
  }

  function isAdminContext() {
    var hash = String(window.location.hash || '').toLowerCase();
    return hash.indexOf('#/admin') === 0 ||
      document.body.classList.contains('admin-mode') ||
      document.documentElement.classList.contains('admin-mode') ||
      isAuthenticatedAdmin();
  }

  function hidePopup() {
    if (!popup) return;
    popup.hidden = true;
    popup.style.removeProperty('display');
    popup.style.removeProperty('visibility');
  }

  function canExposeVersionToCurrentViewer(version) {
    version = String(version || '').trim();
    if (!version) return false;
    if (isAdminContext()) return true;
    return releaseStateLoaded && publicReleaseEnabled && publicReleasedVersion === version;
  }

  function readAdminAppliedUpdate() {
    try { return String(window.localStorage.getItem(ADMIN_APPLIED_UPDATE_KEY) || '').trim(); } catch (_) {}
    return '';
  }

  function persistAdminAppliedUpdate(version) {
    version = String(version || '').trim();
    if (!version) return;
    try { window.localStorage.setItem(ADMIN_APPLIED_UPDATE_KEY, version); } catch (_) {}
  }

  function readPublicAppliedUpdate() {
    try { return String(window.localStorage.getItem(PUBLIC_APPLIED_UPDATE_KEY) || '').trim(); } catch (_) {}
    return '';
  }

  function persistPublicAppliedUpdate(version) {
    version = String(version || '').trim();
    if (!version) return;
    try { window.localStorage.setItem(PUBLIC_APPLIED_UPDATE_KEY, version); } catch (_) {}
  }

  function readPendingUpdate() {
    var value = '';
    try { value = String(window.localStorage.getItem(PENDING_UPDATE_KEY) || '').trim(); } catch (_) {}
    if (value) return value;
    try { value = String(window.sessionStorage.getItem(PENDING_UPDATE_KEY) || '').trim(); } catch (_) {}
    return value;
  }

  function persistPendingUpdate(version) {
    version = String(version || '').trim();
    if (!version) return;
    try { window.localStorage.setItem(PENDING_UPDATE_KEY, version); } catch (_) {}
    try { window.sessionStorage.setItem(PENDING_UPDATE_KEY, version); } catch (_) {}
  }

  function clearPendingUpdate() {
    try { window.localStorage.removeItem(PENDING_UPDATE_KEY); } catch (_) {}
    try { window.sessionStorage.removeItem(PENDING_UPDATE_KEY); } catch (_) {}
  }

  function cleanUpdateParameter() {
    try {
      var url = new URL(window.location.href);
      if (!url.searchParams.has('__betv_update')) return;
      var appliedVersion = String(url.searchParams.get('__betv_update') || '').trim();
      var loadedVersion = String(window.__BETV_DEPLOYMENT_VERSION__ || currentVersion || '').trim();
      var requiresExactBuild = /^v:/.test(appliedVersion);
      var verified = Boolean(appliedVersion) && (!requiresExactBuild || (loadedVersion && loadedVersion === appliedVersion));

      if (verified) {
        if (isAdminContext()) persistAdminAppliedUpdate(appliedVersion);
        else persistPublicAppliedUpdate(appliedVersion);
        clearPendingUpdate();
      } else if (appliedVersion) {
        // Nunca marca uma atualização como concluída se o HTML ainda pertence ao
        // deploy antigo. Mantém o aviso disponível para uma nova tentativa.
        persistPendingUpdate(appliedVersion);
      }
      url.searchParams.delete('__betv_update');
      url.searchParams.delete('_');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    } catch (_) {}
  }

  function createPopup() {
    if (popup && document.body.contains(popup)) return popup;

    var copy = updateCopy();
    var element = document.createElement('aside');
    element.className = 'betv-update-popup';
    element.id = 'betvUpdatePopup';
    element.hidden = true;
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');
    element.setAttribute('aria-label', copy.available);
    element.setAttribute('translate', 'no');
    element.setAttribute('data-i18n-ignore', '');
    element.innerHTML = [
      '<div class="betv-update-copy">',
      '<strong>'+copy.available+'</strong>',
      '<span>'+copy.ready+'</span>',
      '</div>',
      '<button class="betv-update-action" type="button">'+copy.action+'</button>'
    ].join('');

    element.querySelector('.betv-update-action').addEventListener('click', applyUpdate);
    document.body.appendChild(element);
    popup = element;
    return element;
  }

  function forcePopupVisible(element) {
    if (!element) return;
    element.hidden = false;
    // Mantém o aviso acima de qualquer página/rota que esconda outros filhos do body.
    element.style.setProperty('display', 'grid', 'important');
    element.style.setProperty('visibility', 'visible', 'important');
  }

  function ensurePopupStillMounted() {
    if (updateStarted) return;
    if (popup && !document.body.contains(popup)) popup = null;
    var pending = readPendingUpdate();
    if (!pending) return;
    if (canExposeVersionToCurrentViewer(pending)) forcePopupVisible(createPopup());
  }

  function observePopupMount() {
    if (popupObserver || typeof MutationObserver !== 'function' || !document.body) return;
    popupObserver = new MutationObserver(function () {
      if (updateStarted) return;
      if (popup && document.body.contains(popup)) return;
      window.setTimeout(ensurePopupStillMounted, 0);
    });
    popupObserver.observe(document.body, { childList:true });
  }

  function showPopup(version, force) {
    version = String(version || '').trim();
    if (!version || updateStarted) return;
    if (!force && version === currentVersion) return;
    latestVersion = version;
    persistPendingUpdate(version);
    forcePopupVisible(createPopup());
  }

  function restorePendingUpdate() {
    var pending = readPendingUpdate();
    if (!pending || updateStarted) return;
    if (canExposeVersionToCurrentViewer(pending)) {
      showPopup(pending, true);
      return;
    }
    if (releaseStateLoaded && !isAdminContext()) {
      clearPendingUpdate();
      hidePopup();
    }
  }

  function readSharedVersionCheck() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(SHARED_CHECK_KEY) || 'null');
      if (!parsed || !parsed.checkedAt || !parsed.data) return null;
      if (Date.now() - Number(parsed.checkedAt) >= SHARED_CHECK_TTL_MS) return null;
      return parsed;
    } catch (_) { return null; }
  }

  function writeSharedVersionCheck(data) {
    try {
      window.localStorage.setItem(SHARED_CHECK_KEY, JSON.stringify({ checkedAt: Date.now(), data: data || {} }));
    } catch (_) {}
  }

  function applyVersionPayload(data) {
    data = data || {};
    var version = String(data.version || '').trim();
    if (!version || version.indexOf('local:') === 0) return;

    if (data.releaseStateAvailable !== false) {
      releaseStateLoaded = true;
      publicReleaseEnabled = data.updateReleaseEnabled === true || String(data.updateReleaseEnabled || '').toLowerCase() === 'true';
      publicReleasedVersion = String(data.releasedDeploymentVersion || '').trim();
    }

    if (isAdminContext()) {
      var adminAppliedVersion = readAdminAppliedUpdate();
      if (version !== adminAppliedVersion) showPopup(version, true);
      else {
        clearPendingUpdate();
        hidePopup();
      }
      if (!currentVersion) currentVersion = version;
      return;
    }

    if (!canExposeVersionToCurrentViewer(version)) {
      clearPendingUpdate();
      hidePopup();
      if (!currentVersion) currentVersion = version;
      return;
    }

    var publicAppliedVersion = readPublicAppliedUpdate();
    if (publicAppliedVersion !== version) {
      showPopup(version, true);
      return;
    }

    clearPendingUpdate();
    hidePopup();
    if (!currentVersion) currentVersion = version;
  }

  function applyPublicReleaseStateFromSettings() {
    if (isAdminContext() || !releaseStateLoaded) return false;

    var releasedVersion = String(publicReleasedVersion || '').trim();
    if (!publicReleaseEnabled || !releasedVersion) {
      clearPendingUpdate();
      hidePopup();
      return true;
    }

    var loadedVersion = String(window.__BETV_DEPLOYMENT_VERSION__ || currentVersion || '').trim();
    var appliedVersion = readPublicAppliedUpdate();

    if (loadedVersion && loadedVersion === releasedVersion) {
      persistPublicAppliedUpdate(releasedVersion);
      clearPendingUpdate();
      hidePopup();
      currentVersion = loadedVersion;
      return true;
    }

    if (appliedVersion === releasedVersion) {
      clearPendingUpdate();
      hidePopup();
      return true;
    }

    showPopup(releasedVersion, true);
    return true;
  }

  function fetchLatestVersion(force) {
    // Visitantes públicos recebem o estado de release nas configurações cacheadas.
    // O endpoint de fingerprint fica reservado ao admin para economizar Functions.
    if (!isAdminContext()) return Promise.resolve();
    var nowMs = Date.now();
    if (checking || updateStarted || document.visibilityState === 'prerender') return Promise.resolve();
    if (!force && document.visibilityState === 'hidden') return Promise.resolve();

    if (!force) {
      var shared = readSharedVersionCheck();
      if (shared) {
        lastCheckAt = Math.max(lastCheckAt, Number(shared.checkedAt) || nowMs);
        applyVersionPayload(shared.data);
        return Promise.resolve();
      }
      if (lastCheckAt && nowMs - lastCheckAt < MIN_CHECK_GAP_MS) return Promise.resolve();
    }

    lastCheckAt = nowMs;
    checking = true;
    var requestUrl = force ? ENDPOINT + '?fresh=' + String(Date.now()) : ENDPOINT;
    return fetch(requestUrl, {
      method: 'GET',
      cache: force ? 'no-store' : 'default',
      credentials: 'omit',
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      if (!response.ok) throw new Error('version-check-failed');
      return response.json();
    }).then(function (data) {
      writeSharedVersionCheck(data);
      applyVersionPayload(data);
    }).catch(function () {})
      .finally(function () { checking = false; });
  }


  function protectedCookie(name) {
    var normalized = String(name || '').trim().toLowerCase();
    if (!normalized) return true;

    // Estes cookies mantêm sessão, autenticação e preferências essenciais.
    if (normalized === 'be_site_preferences' || normalized === 'be_cookie_ack') return true;
    if (/^(?:__host-|__secure-)?sb[-_]/.test(normalized)) return true;
    return /(?:auth|session|token|login|supabase)/.test(normalized);
  }

  function cookiePaths() {
    var paths = ['/'];
    var parts = String(window.location.pathname || '/').split('/').filter(Boolean);
    var current = '';

    parts.forEach(function (part) {
      current += '/' + part;
      paths.push(current, current + '/');
    });

    return Array.from(new Set(paths));
  }

  function cookieDomains() {
    var hostname = String(window.location.hostname || '').trim();
    var domains = [''];
    if (!hostname || hostname === 'localhost' || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return domains;

    domains.push(hostname, '.' + hostname);
    var parts = hostname.split('.').filter(Boolean);
    if (parts.length > 2) {
      var rootDomain = parts.slice(-2).join('.');
      domains.push(rootDomain, '.' + rootDomain);
    }
    return Array.from(new Set(domains));
  }

  function expireCookie(name, path, domain) {
    var attributes = [
      name + '=',
      'Max-Age=0',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'Path=' + path,
      'SameSite=Lax'
    ];
    if (domain) attributes.push('Domain=' + domain);
    if (window.location.protocol === 'https:') attributes.push('Secure');
    try { document.cookie = attributes.join('; '); } catch (_) {}
  }

  function clearNonEssentialCookies() {
    var names = String(document.cookie || '')
      .split(';')
      .map(function (entry) { return String(entry.split('=')[0] || '').trim(); })
      .filter(Boolean);

    var paths = cookiePaths();
    var domains = cookieDomains();

    names.forEach(function (name) {
      if (protectedCookie(name)) return;
      paths.forEach(function (path) {
        domains.forEach(function (domain) { expireCookie(name, path, domain); });
      });
    });
  }

  function clearTransientStorage() {
    // Remove somente caches descartáveis. Login, idioma, avatar, favoritos,
    // preferências e demais configurações pessoais permanecem intactos.
    try {
      var removableLocalKeys = [];
      for (var index = 0; index < localStorage.length; index += 1) {
        var key = String(localStorage.key(index) || '');
        var transient = key.indexOf('betvDynamicI18n:') === 0 ||
          key.indexOf('betvHomeBootstrap') === 0 ||
          key.indexOf('betvDeploymentVersionCheck') === 0 ||
          key.indexOf('betvObservedReleaseState') === 0 ||
          key === 'betvUpdateAssetCache' ||
          key === 'betvUpdateVersion' ||
          key === 'beContentAnalyticsSession';
        if (transient) removableLocalKeys.push(key);
      }
      removableLocalKeys.forEach(function (key) { localStorage.removeItem(key); });
    } catch (_) {}

    try {
      var removableSessionKeys = [];
      for (var sessionIndex = 0; sessionIndex < sessionStorage.length; sessionIndex += 1) {
        var sessionKey = String(sessionStorage.key(sessionIndex) || '');
        if (sessionKey.indexOf('betvUpdate') === 0 || sessionKey.indexOf('betvHomeBootstrap') === 0) removableSessionKeys.push(sessionKey);
      }
      removableSessionKeys.forEach(function (key) { sessionStorage.removeItem(key); });
    } catch (_) {}
  }

  function clearBrowserCaches() {
    var jobs = [];

    clearNonEssentialCookies();
    clearTransientStorage();

    try {
      if ('caches' in window) {
        jobs.push(
          window.caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key) { return window.caches.delete(key); }));
          })
        );
      }
    } catch (_) {}

    try {
      if ('serviceWorker' in navigator) {
        jobs.push(
          navigator.serviceWorker.getRegistrations().then(function (registrations) {
            return Promise.all(registrations.map(function (registration) { return registration.unregister(); }));
          })
        );
      }
    } catch (_) {}

    return Promise.allSettled(jobs);
  }

  function currentResourceUrls() {
    var urls = [];

    try {
      var documentUrl = new URL(window.location.href);
      documentUrl.searchParams.delete('__betv_update');
      documentUrl.searchParams.delete('_');
      urls.push(documentUrl.href);
    } catch (_) {}

    try {
      document.querySelectorAll('script[src],link[href]').forEach(function (node) {
        if (node.tagName === 'LINK') {
          var rel = String(node.getAttribute('rel') || '').toLowerCase();
          if (!/(?:^|\s)(?:stylesheet|modulepreload|preload)(?:\s|$)/.test(rel)) return;
        }

        var raw = node.tagName === 'SCRIPT' ? node.getAttribute('src') : node.getAttribute('href');
        if (!raw) return;

        try {
          var url = new URL(raw, window.location.href);
          if (url.origin !== window.location.origin) return;
          url.hash = '';
          urls.push(url.href);
        } catch (_) {}
      });
    } catch (_) {}

    return Array.from(new Set(urls));
  }

  function refreshNetworkResources(targetVersion) {
    var urls = currentResourceUrls();
    if (!urls.length) return Promise.resolve();

    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timeoutId = window.setTimeout(function () {
      if (controller) controller.abort();
    }, 10000);

    var requests = urls.map(function (rawUrl) {
      var cacheBustedUrl = rawUrl;
      try {
        var parsed = new URL(rawUrl, window.location.href);
        parsed.searchParams.set('__betv_asset_update', String(targetVersion || Date.now()));
        parsed.searchParams.set('_', String(Date.now()));
        cacheBustedUrl = parsed.href;
      } catch (_) {}

      var bypassOptions = {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin',
        redirect: 'follow',
        headers: { 'Cache-Control': 'no-cache, no-store, max-age=0', 'Pragma': 'no-cache' }
      };
      var reloadOptions = {
        method: 'GET',
        cache: 'reload',
        credentials: 'same-origin',
        redirect: 'follow',
        headers: { 'Cache-Control': 'no-cache, max-age=0', 'Pragma': 'no-cache' }
      };
      if (controller) {
        bypassOptions.signal = controller.signal;
        reloadOptions.signal = controller.signal;
      }

      // 1) busca uma URL única para atravessar caches intermediários/CDN;
      // 2) recarrega a URL original com cache:'reload' para substituir a entrada
      //    do cache HTTP usada pelo navegador após o reload. É o equivalente
      //    mais próximo de Ctrl+F5 que uma página consegue iniciar sozinha.
      return fetch(cacheBustedUrl, bypassOptions)
        .catch(function () { return null; })
        .then(function () { return fetch(rawUrl, reloadOptions); });
    });

    return Promise.allSettled(requests).finally(function () {
      window.clearTimeout(timeoutId);
    });
  }

  function applyUpdate() {
    if (updateStarted) return;
    updateStarted = true;

    // Guarda rota, aba do catálogo, pesquisa e posição antes do reload de
    // atualização. O módulo de restauração usa estes dados depois que os
    // novos arquivos terminam de carregar.
    try {
      if (window.BETVPreserveReloadPosition && typeof window.BETVPreserveReloadPosition.markUpdate === 'function') {
        window.BETVPreserveReloadPosition.markUpdate();
      }
    } catch (_) {}

    var copy = updateCopy();
    var element = createPopup();
    var button = element.querySelector('.betv-update-action');
    var title = element.querySelector('.betv-update-copy strong');
    var subtitle = element.querySelector('.betv-update-copy span');
    element.setAttribute('aria-label',copy.updating);
    if(title)title.textContent=copy.updating;
    if(subtitle)subtitle.hidden=true;
    if(button){button.disabled=true;button.hidden=true;}

    var targetVersion = latestVersion || readPendingUpdate() || String(Date.now());
    persistPendingUpdate(targetVersion);

    Promise.resolve()
      .then(clearBrowserCaches)
      .then(function () { return refreshNetworkResources(targetVersion); })
      .finally(function () {
        try {
          var url = new URL(window.location.href);
          url.searchParams.set('__betv_update', targetVersion);
          url.searchParams.set('_', String(Date.now()));
          window.location.replace(url.href);
        } catch (_) {
          window.location.reload();
        }
      });
  }

  function scheduleChecks() {
    observePopupMount();
    window.setTimeout(function () { if (isAdminContext()) fetchLatestVersion(); }, 1200);
    intervalId = window.setInterval(function () { if (isAdminContext()) fetchLatestVersion(); }, CHECK_INTERVAL);

    // Uma conta administrativa recebe o aviso mesmo quando estiver navegando
    // pela área pública. Assim que a autenticação confirmar o papel de admin,
    // uma nova checagem é feita sem esperar o próximo intervalo.
    try {
      var backend = window.beBackend;
      if (backend && backend.auth && typeof backend.auth.onChange === 'function') {
        backend.auth.onChange(function (account) {
          if (!account || !isAuthenticatedAdmin()) return;
          restorePendingUpdate();
          fetchLatestVersion(true);
        });
      } else if (backend && backend.ready && typeof backend.ready.then === 'function') {
        backend.ready.then(function () {
          if (!isAuthenticatedAdmin()) return;
          restorePendingUpdate();
          fetchLatestVersion(true);
        }).catch(function () {});
      }
    } catch (_) {}

    window.addEventListener('focus', fetchLatestVersion, { passive: true });
    window.addEventListener('online', fetchLatestVersion, { passive: true });
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) fetchLatestVersion();
      else restorePendingUpdate();
    });
    window.addEventListener('popstate', function () { restorePendingUpdate(); fetchLatestVersion(); }, { passive: true });
    window.addEventListener('hashchange', function () { restorePendingUpdate(); fetchLatestVersion(); }, { passive: true });
    window.addEventListener('be:update-release-changed', function (event) {
      var detail = event && event.detail || {};
      releaseStateLoaded = true;
      publicReleaseEnabled = detail.updateReleaseEnabled === true || String(detail.updateReleaseEnabled || '').toLowerCase() === 'true';
      publicReleasedVersion = String(detail.releasedDeploymentVersion || '').trim();
      var releaseStateKey = (publicReleaseEnabled ? '1:' : '0:') + publicReleasedVersion;
      var releaseChanged = false;
      try {
        releaseChanged = String(window.localStorage.getItem(OBSERVED_RELEASE_KEY) || '') !== releaseStateKey;
        window.localStorage.setItem(OBSERVED_RELEASE_KEY, releaseStateKey);
      } catch (_) {}
      if (!isAdminContext()) {
        applyPublicReleaseStateFromSettings();
        return;
      }
      fetchLatestVersion(releaseChanged);
    });
    window.addEventListener('storage', function (event) {
      if (!isAdminContext() || !event || event.key !== SHARED_CHECK_KEY || !event.newValue) return;
      var shared = readSharedVersionCheck();
      if (shared) applyVersionPayload(shared.data);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        restorePendingUpdate();
        fetchLatestVersion();
      }
    });
  }

  cleanUpdateParameter();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleChecks, { once: true });
  } else {
    scheduleChecks();
  }

  window.addEventListener('beforeunload', function () {
    if (intervalId) window.clearInterval(intervalId);
    if (popupObserver) popupObserver.disconnect();
  }, { once: true });
})();

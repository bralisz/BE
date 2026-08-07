(function () {
  'use strict';

  var ENDPOINT = '/api/deployment-version';
  var CHECK_INTERVAL = 60000;
  var PENDING_UPDATE_KEY = 'betvPendingUpdateVersion';
  var currentVersion = String(window.__BETV_DEPLOYMENT_VERSION__ || '').trim();
  var latestVersion = '';
  var popup = null;
  var checking = false;
  var updateStarted = false;
  var intervalId = 0;
  var UPDATE_COPY = {
    'pt-br': { available:'Atualização disponível', ready:'Uma nova versão do site está pronta.', action:'Atualizar', updating:'Atualizando a nova versão' },
    'en-us': { available:'Update available', ready:'A new version of the site is ready.', action:'Update', updating:'Updating to the new version' },
    'es': { available:'Actualización disponible', ready:'Hay una nueva versión del sitio lista.', action:'Actualizar', updating:'Actualizando a la nueva versión' }
  };

  function updateLocaleSlug() {
    var configured = String(window.BETVLocale && window.BETVLocale.slug || '').toLowerCase();
    if (UPDATE_COPY[configured]) return configured;
    var match = String(window.location.pathname || '').toLowerCase().match(/^\/(pt-br|en-us|es)(?:\/|$)/);
    return match && UPDATE_COPY[match[1]] ? match[1] : 'pt-br';
  }

  function updateCopy() {
    return UPDATE_COPY[updateLocaleSlug()] || UPDATE_COPY['pt-br'];
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
      clearPendingUpdate();
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
    showPopup(pending, true);
  }

  function fetchLatestVersion() {
    if (checking || updateStarted || document.visibilityState === 'prerender') return Promise.resolve();
    checking = true;

    var separator = ENDPOINT.indexOf('?') === -1 ? '?' : '&';
    return fetch(ENDPOINT + separator + 't=' + Date.now(), {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('version-check-failed');
        return response.json();
      })
      .then(function (data) {
        var version = String(data && data.version || '').trim();
        if (!version || version.indexOf('local:') === 0) return;

        var pending = readPendingUpdate();
        if (pending) {
          // Se outro deploy saiu enquanto o aviso estava pendente, atualiza o aviso
          // para a versão mais nova sem fazê-lo sumir ao trocar de página.
          showPopup(version, true);
          return;
        }

        if (!currentVersion) {
          currentVersion = version;
          return;
        }

        if (version !== currentVersion) showPopup(version, false);
      })
      .catch(function () {})
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
    // preferências e demais configurações do usuário permanecem intactos.
    try {
      var removableLocalKeys = [];
      for (var index = 0; index < localStorage.length; index += 1) {
        var key = String(localStorage.key(index) || '');
        if (key.indexOf('betvDynamicI18n:') === 0 || key === 'beContentAnalyticsSession') {
          removableLocalKeys.push(key);
        }
      }
      removableLocalKeys.forEach(function (key) { localStorage.removeItem(key); });
    } catch (_) {}

    try {
      ['betvUpdateAssetCache', 'betvUpdateVersion'].forEach(function (key) {
        sessionStorage.removeItem(key);
      });
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

  function refreshNetworkResources() {
    var urls = currentResourceUrls();
    if (!urls.length) return Promise.resolve();

    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timeoutId = window.setTimeout(function () {
      if (controller) controller.abort();
    }, 8000);

    var requests = urls.map(function (url) {
      var options = {
        method: 'GET',
        cache: 'reload',
        credentials: 'same-origin',
        redirect: 'follow'
      };
      if (controller) options.signal = controller.signal;
      return fetch(url, options);
    });

    return Promise.allSettled(requests).finally(function () {
      window.clearTimeout(timeoutId);
    });
  }

  function applyUpdate() {
    if (updateStarted) return;
    updateStarted = true;

    var copy = updateCopy();
    var element = createPopup();
    var button = element.querySelector('.betv-update-action');
    var title = element.querySelector('.betv-update-copy strong');
    var subtitle = element.querySelector('.betv-update-copy span');
    element.setAttribute('aria-label',copy.updating);
    if(title)title.textContent=copy.updating;
    if(subtitle)subtitle.hidden=true;
    if(button){button.disabled=true;button.hidden=true;}

    Promise.resolve()
      .then(clearBrowserCaches)
      .then(refreshNetworkResources)
      .finally(function () {
        try {
          var url = new URL(window.location.href);
          url.searchParams.set('__betv_update', latestVersion || readPendingUpdate() || String(Date.now()));
          url.searchParams.set('_', String(Date.now()));
          window.location.replace(url.href);
        } catch (_) {
          clearPendingUpdate();
          window.location.reload();
        }
      });
  }

  function scheduleChecks() {
    restorePendingUpdate();
    window.setTimeout(fetchLatestVersion, 3000);
    intervalId = window.setInterval(fetchLatestVersion, CHECK_INTERVAL);

    window.addEventListener('focus', function () {
      restorePendingUpdate();
      fetchLatestVersion();
    }, { passive: true });
    window.addEventListener('online', fetchLatestVersion, { passive: true });
    window.addEventListener('pageshow', function (event) {
      restorePendingUpdate();
      if (event.persisted) fetchLatestVersion();
    });
    window.addEventListener('popstate', restorePendingUpdate, { passive: true });
    window.addEventListener('hashchange', restorePendingUpdate, { passive: true });
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
  }, { once: true });
})();

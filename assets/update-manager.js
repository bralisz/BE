(function () {
  'use strict';

  var ENDPOINT = '/api/deployment-version';
  var CHECK_INTERVAL = 60000;
  var currentVersion = String(window.__BETV_DEPLOYMENT_VERSION__ || '').trim();
  var latestVersion = '';
  var popup = null;
  var checking = false;
  var updateStarted = false;
  var intervalId = 0;

  function cleanUpdateParameter() {
    try {
      var url = new URL(window.location.href);
      if (!url.searchParams.has('__betv_update')) return;
      url.searchParams.delete('__betv_update');
      url.searchParams.delete('_');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    } catch (_) {}
  }

  function createPopup() {
    if (popup) return popup;

    var element = document.createElement('aside');
    element.className = 'betv-update-popup';
    element.id = 'betvUpdatePopup';
    element.hidden = true;
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');
    element.setAttribute('aria-label', 'Atualização disponível');
    element.innerHTML = [
      '<div class="betv-update-icon" aria-hidden="true">',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '<path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"></path>',
      '<path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"></path>',
      '</svg>',
      '</div>',
      '<div class="betv-update-copy">',
      '<strong>Atualização disponível</strong>',
      '<span>Uma nova versão do site está pronta.</span>',
      '</div>',
      '<button class="betv-update-action" type="button">Atualizar</button>'
    ].join('');

    element.querySelector('.betv-update-action').addEventListener('click', applyUpdate);
    document.body.appendChild(element);
    popup = element;
    return element;
  }

  function showPopup(version) {
    if (!version || version === currentVersion || updateStarted) return;
    latestVersion = version;
    var element = createPopup();
    element.hidden = false;
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

        if (!currentVersion) {
          currentVersion = version;
          return;
        }

        if (version !== currentVersion) showPopup(version);
      })
      .catch(function () {})
      .finally(function () { checking = false; });
  }

  function clearBrowserCaches() {
    var jobs = [];

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

  function applyUpdate() {
    if (updateStarted) return;
    updateStarted = true;

    var element = createPopup();
    var button = element.querySelector('.betv-update-action');
    var subtitle = element.querySelector('.betv-update-copy span');
    button.disabled = true;
    button.textContent = 'Atualizando…';
    subtitle.textContent = 'Sincronizando a versão mais recente.';

    clearBrowserCaches().finally(function () {
      try {
        var url = new URL(window.location.href);
        url.searchParams.set('__betv_update', latestVersion || String(Date.now()));
        url.searchParams.set('_', String(Date.now()));
        window.location.replace(url.href);
      } catch (_) {
        window.location.reload();
      }
    });
  }

  function scheduleChecks() {
    window.setTimeout(fetchLatestVersion, 3000);
    intervalId = window.setInterval(fetchLatestVersion, CHECK_INTERVAL);

    window.addEventListener('focus', fetchLatestVersion, { passive: true });
    window.addEventListener('online', fetchLatestVersion, { passive: true });
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) fetchLatestVersion();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') fetchLatestVersion();
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

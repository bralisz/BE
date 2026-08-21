(() => {
  'use strict';

  const ACTIVE_SESSION_KEY = 'beTvActiveSessionId';
  const ACTIVE_CODE_KEY = 'beTvActivePairCode';
  const CURRENT_MEDIA_KEY = 'beTvCurrentMedia';
  const PENDING_MEDIA_KEY = 'beTvPendingMedia';

  let activeSessionId = '';
  let activeCode = '';
  let currentMedia = null;
  let widget = null;
  let panel = null;
  let summary = null;
  let titleNode = null;
  let statusNode = null;
  let disconnected = false;
  let busy = false;
  let paused = false;

  function readJson(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  function desktopWidgetEnabled() {
    try { return window.matchMedia('(min-width: 1000px)').matches; }
    catch (_) { return Number(window.innerWidth || 0) >= 1000; }
  }


  function currentLocaleSlug() {
    const raw = String(window.BETVI18n?.slug || window.BETVLocale?.slug || document.documentElement.lang || 'pt-br').trim().toLowerCase();
    if (raw === 'en' || raw === 'en-us' || raw.startsWith('en-')) return 'en-us';
    if (raw === 'es' || raw.startsWith('es-')) return 'es';
    if (raw === 'fr' || raw.startsWith('fr-')) return 'fr';
    return 'pt-br';
  }

  function widgetText() {
    const texts = {
      'pt-br': { watching: 'Assistindo na TV', empty: 'Escolha algo para assistir na TV', disconnect: 'Desconectar da TV', aria: 'Controle da Smart TV conectada' },
      'en-us': { watching: 'Watching on TV', empty: 'Choose something to watch on TV', disconnect: 'Disconnect from TV', aria: 'Connected Smart TV controls' },
      es: { watching: 'Viendo en la TV', empty: 'Elige algo para ver en la TV', disconnect: 'Desconectar de la TV', aria: 'Controles de la Smart TV conectada' },
      fr: { watching: 'Lecture sur la TV', empty: 'Choisissez quelque chose à regarder à la TV', disconnect: 'Déconnecter la TV', aria: 'Commandes de la Smart TV connectée' }
    };
    return texts[currentLocaleSlug()] || texts['pt-br'];
  }

  function hasPlayableMedia(media) {
    const source = media && typeof media === 'object' ? media : {};
    return Boolean(String(
      source.contentUrl || source.tvDriveUrl || source.mobileAppDriveUrl || source.driveUrl ||
      source.vkUrl || source.videoUrl || source.embedUrl || source.url || ''
    ).trim());
  }

  function mediaArtwork(media) {
    const source = media && typeof media === 'object' ? media : {};
    return String(source.bannerUrl || source.imageUrl || source.logoUrl || '').trim();
  }

  function cleanCssUrl(value) {
    const raw = String(value || '').trim();
    if (!/^https?:\/\//i.test(raw) && !/^\//.test(raw)) return '';
    return `url("${raw.replace(/["\\\n\r]/g, char => `\\${char}`)}")`;
  }

  function iconMarkup(kind) {
    if (kind === 'rewind') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 7 7 11l4 4" fill="none"></path><path d="M8 11h6a5 5 0 1 1-4.5 7.2" fill="none"></path><text x="10.5" y="14.7" font-size="6.2" stroke="none" text-anchor="middle">10</text></svg>';
    if (kind === 'forward') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 7 4 4-4 4" fill="none"></path><path d="M16 11h-6a5 5 0 1 0 4.5 7.2" fill="none"></path><text x="13.5" y="14.7" font-size="6.2" stroke="none" text-anchor="middle">10</text></svg>';
    if (kind === 'play') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 5.7 18 12l-9.8 6.3Z" stroke="none"></path></svg>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3.7" height="14" rx="1" stroke="none"></rect><rect x="13.3" y="5" width="3.7" height="14" rx="1" stroke="none"></rect></svg>';
  }

  function closeWidgetPanel() {
    if (!widget || !widget.classList.contains('is-open')) return;
    widget.classList.remove('is-open');
    if (panel) panel.hidden = true;
    if (summary) summary.setAttribute('aria-expanded', 'false');
  }

  function ensureWidget() {
    if (widget) return widget;
    widget = document.createElement('aside');
    widget.className = 'betv-tv-session-widget';
    widget.id = 'betvTvSessionWidget';
    widget.hidden = true;
    widget.setAttribute('aria-label', widgetText().aria);
    widget.innerHTML = `
      <div class="betv-tv-session-shell">
        <div class="betv-tv-session-art" aria-hidden="true"></div>
        <button class="betv-tv-session-summary" type="button" aria-expanded="false">
          <span class="betv-tv-session-copy"><small class="betv-tv-session-status notranslate" translate="no">Assistindo na TV</small><strong class="betv-tv-session-title notranslate" translate="no">Billie Eilish TV</strong></span>
          <span class="betv-tv-session-chevron" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m7 9 5 5 5-5"></path></svg></span>
        </button>
        <div class="betv-tv-session-panel" hidden>
          <button class="betv-tv-session-disconnect" type="button">Desconectar da TV</button>
        </div>
      </div>`;
    document.body.appendChild(widget);
    panel = widget.querySelector('.betv-tv-session-panel');
    summary = widget.querySelector('.betv-tv-session-summary');
    statusNode = widget.querySelector('.betv-tv-session-status');
    titleNode = widget.querySelector('.betv-tv-session-title');

    summary.addEventListener('click', () => {
      const open = !widget.classList.contains('is-open');
      widget.classList.toggle('is-open', open);
      panel.hidden = !open;
      summary.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    widget.querySelector('.betv-tv-session-disconnect').addEventListener('click', disconnect);

    // Ao interagir com qualquer outra área do site, recolhe o widget.
    document.addEventListener('click', event => {
      if (!widget || widget.hidden || !widget.classList.contains('is-open')) return;
      if (widget.contains(event.target)) return;
      closeWidgetPanel();
    });

    return widget;
  }

  function render() {
    if (!desktopWidgetEnabled()) {
      if (widget) widget.hidden = true;
      return;
    }
    ensureWidget();
    const valid = Boolean(activeSessionId && !disconnected);
    widget.hidden = !valid;
    if (!valid) return;
    const source = currentMedia && typeof currentMedia === 'object' ? currentMedia : {};
    const copy = widgetText();
    widget.setAttribute('aria-label', copy.aria);
    const disconnectButton = widget.querySelector('.betv-tv-session-disconnect');
    if (disconnectButton) disconnectButton.textContent = copy.disconnect;
    const hasMedia = hasPlayableMedia(source);
    widget.classList.toggle('is-empty', !hasMedia);
    if (hasMedia) {
      statusNode.hidden = false;
      statusNode.textContent = copy.watching;
      titleNode.textContent = String(source.title || 'Billie Eilish TV');
    } else {
      statusNode.hidden = true;
      statusNode.textContent = '';
      titleNode.textContent = copy.empty;
    }
    const artwork = cleanCssUrl(mediaArtwork(source));
    widget.style.setProperty('--betv-tv-cover', hasMedia && artwork ? artwork : 'linear-gradient(135deg,#171a20,#08090b)');
    widget.classList.toggle('is-busy', busy);
    widget.querySelectorAll('button').forEach(button => { button.disabled = busy; });
  }

  function persistMedia(media) {
    currentMedia = media && typeof media === 'object' ? media : null;
    if (!currentMedia) return;
    try { localStorage.setItem(CURRENT_MEDIA_KEY, JSON.stringify(currentMedia)); } catch (_) {}
  }

  function clearSession() {
    activeSessionId = '';
    activeCode = '';
    currentMedia = null;
    disconnected = true;
    paused = false;
    closeWidgetPanel();
    try {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      localStorage.removeItem(ACTIVE_CODE_KEY);
      localStorage.removeItem(CURRENT_MEDIA_KEY);
      localStorage.removeItem(PENDING_MEDIA_KEY);
    } catch (_) {}
    render();
  }

  async function clientReady() {
    if (!window.beBackend) return null;
    await window.beBackend.ready;
    return window.beBackend.client || null;
  }

  async function loadActiveSession() {
    disconnected = false;
    const storedId = String(localStorage.getItem(ACTIVE_SESSION_KEY) || '').trim();
    const cachedMedia = readJson(CURRENT_MEDIA_KEY);
    if (cachedMedia) currentMedia = cachedMedia;
    if (storedId) {
      activeSessionId = storedId;
      activeCode = String(localStorage.getItem(ACTIVE_CODE_KEY) || '');
      render();
    }

    try {
      const client = await clientReady();
      if (!client || !window.beBackend?.auth?.currentUser) { if (!storedId) clearSession(); return null; }
      const { data, error } = await client.rpc('tv_my_sessions');
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      if (!rows.length) { clearSession(); return null; }
      const row = rows.find(item => String(item.session_id || '') === storedId) || rows[0];
      activeSessionId = String(row.session_id || '');
      activeCode = String(row.pairing_code || activeCode || '');
      disconnected = false;
      try {
        localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
        if (activeCode) localStorage.setItem(ACTIVE_CODE_KEY, activeCode);
      } catch (_) {}
      const remoteMedia = row.current_media && typeof row.current_media === 'object' ? row.current_media : null;
      if (remoteMedia && Object.keys(remoteMedia).length) {
        // O cache local preserva a arte da capa para sessões antigas em que o
        // payload da TV ainda não incluía imageUrl/bannerUrl.
        const cached = currentMedia && typeof currentMedia === 'object' ? currentMedia : {};
        persistMedia({ ...cached, ...remoteMedia, imageUrl: remoteMedia.imageUrl || cached.imageUrl || '', bannerUrl: remoteMedia.bannerUrl || cached.bannerUrl || '' });
      }
      render();
      return row;
    } catch (error) {
      console.warn('Não foi possível confirmar a Smart TV conectada:', error);
      if (!storedId) clearSession();
      return null;
    }
  }

  async function sendMedia(media) {
    if (busy) return false;
    const source = media && typeof media === 'object' ? { ...media } : null;
    if (!source || !String(source.contentUrl || '').trim()) return false;
    if (!activeSessionId) await loadActiveSession();
    if (!activeSessionId) return false;
    busy = true;
    paused = false;
    render();
    try {
      const client = await clientReady();
      if (!client) return false;
      delete source.remoteControl;
      const { error } = await client.rpc('tv_send_media', { p_session_id: activeSessionId, p_media: source });
      if (error) throw error;
      persistMedia(source);
      try { localStorage.removeItem(PENDING_MEDIA_KEY); } catch (_) {}
      disconnected = false;
      render();
      try { window.dispatchEvent(new CustomEvent('be:tv-media-sent', { detail: { media: source } })); } catch (_) {}
      return true;
    } catch (error) {
      console.warn('Falha ao enviar conteúdo para a Smart TV:', error);
      clearSession();
      return false;
    } finally {
      busy = false;
      render();
    }
  }

  async function remote(action, value) {
    if (busy || !activeSessionId || !currentMedia) return false;
    busy = true;
    render();
    const nextPaused = action === 'pause' ? true : action === 'play' ? false : paused;
    try {
      const client = await clientReady();
      if (!client) return false;
      const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const payload = { ...currentMedia, remoteControl: { action: String(action || ''), value: Number(value) || 0, nonce } };
      const { error } = await client.rpc('tv_send_media', { p_session_id: activeSessionId, p_media: payload });
      if (error) throw error;
      currentMedia = payload;
      paused = nextPaused;
      try { localStorage.setItem(CURRENT_MEDIA_KEY, JSON.stringify(currentMedia)); } catch (_) {}
      return true;
    } catch (error) {
      console.warn('Não foi possível controlar a reprodução da TV:', error);
      return false;
    } finally {
      busy = false;
      render();
    }
  }

  async function disconnect() {
    if (busy || !activeSessionId) return;
    busy = true;
    render();
    try {
      const client = await clientReady();
      if (client) await client.rpc('tv_disconnect_session', { p_session_id: activeSessionId });
    } catch (error) {
      console.warn('Falha ao encerrar a conexão da Smart TV:', error);
    }
    clearSession();
    busy = false;
  }

  window.BETVTVSession = { loadActiveSession, sendMedia, disconnect, remote };

  Promise.resolve(window.beBackend?.ready)
    .catch(() => null)
    .then(() => loadActiveSession());

  window.addEventListener('storage', event => {
    if (event.key === ACTIVE_SESSION_KEY || event.key === CURRENT_MEDIA_KEY) loadActiveSession();
  });
  window.addEventListener('be:i18n-ready', () => render());
  try {
    const desktopMedia = window.matchMedia('(min-width: 1000px)');
    const onDesktopChange = () => render();
    if (typeof desktopMedia.addEventListener === 'function') desktopMedia.addEventListener('change', onDesktopChange);
    else if (typeof desktopMedia.addListener === 'function') desktopMedia.addListener(onDesktopChange);
  } catch (_) {}
})();

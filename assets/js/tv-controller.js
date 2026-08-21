(() => {
  'use strict';

  const SUPABASE_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
  const ACTIVE_SESSION_KEY = 'beTvActiveSessionId';
  const ACTIVE_CODE_KEY = 'beTvActivePairCode';
  const PENDING_MEDIA_KEY = 'beTvPendingMedia';
  const CURRENT_MEDIA_KEY = 'beTvCurrentMedia';
  const POST_AUTH_KEY = 'bePostAuthReturn';

  const loading = document.getElementById('controllerLoading');
  const formView = document.getElementById('controllerFormView');
  const connectedView = document.getElementById('controllerConnectedView');
  const accountHost = document.getElementById('controllerAccount');
  const connectedAccountHost = document.getElementById('controllerConnectedAccount');
  const form = document.getElementById('pairCodeForm');
  const codeInput = document.getElementById('pairCodeInput');
  const message = document.getElementById('controllerMessage');
  const connectedMessage = document.getElementById('connectedMessage');
  const connectedCode = document.getElementById('connectedCode');
  const pendingPreview = document.getElementById('pendingPreview');
  const pendingThumb = document.getElementById('pendingThumb');
  const pendingTitle = document.getElementById('pendingTitle');
  const pendingMeta = document.getElementById('pendingMeta');
  const sendButton = document.getElementById('sendToTvButton');
  const disconnectButton = document.getElementById('disconnectTvButton');
  const subtitleRemoteButton = document.getElementById('tvSubtitleRemoteButton');

  let client = null;
  let user = null;
  let userProfile = null;
  let activeSessionId = '';
  let activeCode = '';
  let pendingMedia = null;
  let busy = false;
  let castToastTimer = 0;
  let currentTvMedia = null;
  let tvSubtitlesEnabled = false;

  function safeCode(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  }

  function safeReturnTarget() {
    return `${location.pathname}${location.search}`;
  }


  function returnHome() {
    try { location.replace('/'); }
    catch (_) { location.href = '/'; }
  }

  function desktopControllerMode() {
    try { return window.matchMedia('(min-width: 1000px)').matches; }
    catch (_) { return Number(window.innerWidth || 0) >= 1000; }
  }

  function profileMetadata() {
    return user?.user_metadata || {};
  }

  function accountProfile() {
    const metadata = profileMetadata();
    return {
      displayName: String(userProfile?.display_name || metadata.display_name || metadata.full_name || user?.email || 'Sua conta').trim(),
      username: String(userProfile?.username || metadata.username || metadata.user_name || '').trim().replace(/^@+/, ''),
      avatarUrl: String(userProfile?.avatar_url || metadata.profile_avatar_url || '').trim(),
      bannerUrl: String(userProfile?.banner_url || metadata.profile_banner_url || metadata.banner_url || '').trim()
    };
  }

  function currentLocaleSlug() {
    const raw = String(window.BETVI18n?.slug || window.BETVLocale?.slug || document.documentElement.lang || 'pt-br').trim().toLowerCase();
    if (raw === 'en' || raw === 'en-us' || raw.startsWith('en-')) return 'en-us';
    if (raw === 'es' || raw.startsWith('es-')) return 'es';
    if (raw === 'fr' || raw.startsWith('fr-')) return 'fr';
    return 'pt-br';
  }

  function mediaLocale(media) {
    const raw = String(media?.subtitleLocale || currentLocaleSlug()).trim().toLowerCase();
    if (raw === 'en' || raw === 'en-us' || raw.startsWith('en-')) return 'en-us';
    if (raw === 'es' || raw.startsWith('es-')) return 'es';
    if (raw === 'fr' || raw.startsWith('fr-')) return 'fr';
    return 'pt-br';
  }

  function subtitleUploadedLocale(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const url = new URL(raw, location.origin);
      const path = decodeURIComponent(url.pathname || '').toLowerCase();
      const match = path.match(/(?:^|\/)(pt-br|pt|es|fr|en-us|en)[-_][^/]+\.(?:srt|vtt)$/i);
      if (!match) return '';
      const code = String(match[1] || '').toLowerCase();
      if (code === 'pt' || code === 'pt-br') return 'pt-br';
      if (code === 'en' || code === 'en-us') return 'en-us';
      if (code === 'es') return 'es';
      if (code === 'fr') return 'fr';
    } catch (_) {}
    return '';
  }

  function subtitleMatchesLocale(value, locale) {
    const uploadedLocale = subtitleUploadedLocale(value);
    return !uploadedLocale || uploadedLocale === locale;
  }

  function localizedSubtitleUrl(media) {
    if (!media || typeof media !== 'object') return '';
    const locale = mediaLocale(media);
    const aliases = locale === 'pt-br' ? ['pt-br', 'pt'] : locale === 'en-us' ? ['en-us', 'en'] : [locale];
    const maps = [media.subtitleTracks, media.subtitleUrls, media.subtitles];
    for (const map of maps) {
      if (!map || typeof map !== 'object' || Array.isArray(map)) continue;
      for (const key of aliases) {
        const value = map[key];
        if (typeof value === 'string' && value.trim() && subtitleMatchesLocale(value, locale)) return value.trim();
        if (value && typeof value === 'object' && String(value.url || value.subtitleUrl || '').trim()) {
          const nested = String(value.url || value.subtitleUrl).trim();
          if (subtitleMatchesLocale(nested, locale)) return nested;
        }
      }
    }
    const translations = media.translations;
    if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
      for (const key of aliases) {
        const translated = translations[key];
        if (translated && typeof translated === 'object' && String(translated.subtitleUrl || '').trim()) {
          const nested = String(translated.subtitleUrl).trim();
          if (subtitleMatchesLocale(nested, locale)) return nested;
        }
      }
    }
    const fallback = String(media.subtitleUrl || '').trim();
    return fallback && subtitleMatchesLocale(fallback, locale) ? fallback : '';
  }

  function hasPlayableMedia(media) {
    if (!media || typeof media !== 'object') return false;
    return Boolean(String(media.tvDriveUrl || media.mobileAppDriveUrl || media.appDriveUrl || media.contentUrl || '').trim());
  }

  function mediaWithTvState(media, subtitleEnabled = false) {
    const source = media && typeof media === 'object' ? media : {};
    const subtitleLocale = mediaLocale(source);
    const subtitleUrl = localizedSubtitleUrl(source);
    const profile = accountProfile();
    return {
      itemId: String(source.itemId || ''),
      recordId: String(source.recordId || ''),
      title: String(source.title || 'Billie Eilish TV'),
      year: String(source.year || ''),
      duration: String(source.duration || ''),
      contentUrl: String(source.contentUrl || ''),
      mobileAppDriveUrl: String(source.mobileAppDriveUrl || source.appDriveUrl || ''),
      tvDriveUrl: String(source.tvDriveUrl || source.mobileAppDriveUrl || source.appDriveUrl || ''),
      collection: String(source.collection || 'videos'),
      description: String(source.description || ''),
      imageUrl: String(source.imageUrl || ''),
      bannerUrl: String(source.bannerUrl || ''),
      logoUrl: String(source.logoUrl || ''),
      subtitleUrl,
      subtitleLocale,
      subtitleEnabled: Boolean(subtitleUrl && subtitleEnabled),
      tvProfile: profile
    };
  }

  async function syncProfileToTv() {
    if (!client || !activeSessionId || !user) return false;
    const source = currentTvMedia && typeof currentTvMedia === 'object' ? currentTvMedia : {};
    const nextMedia = mediaWithTvState(source, Boolean(source.subtitleEnabled));
    const previous = source.tvProfile && typeof source.tvProfile === 'object' ? source.tvProfile : {};
    const nextProfile = nextMedia.tvProfile || {};
    if (previous.displayName === nextProfile.displayName && previous.username === nextProfile.username && previous.avatarUrl === nextProfile.avatarUrl && previous.bannerUrl === nextProfile.bannerUrl) return true;
    const { error } = await client.rpc('tv_send_media', { p_session_id: activeSessionId, p_media: nextMedia });
    if (error) throw error;
    currentTvMedia = nextMedia;
    return true;
  }

  async function loadAccountProfile() {
    if (!client || !user?.id) return null;
    const { data, error } = await client
      .from('profiles')
      .select('display_name,username,avatar_url,banner_url')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw error;
    userProfile = data || null;
    return userProfile;
  }

  function accountMarkup(target) {
    if (!target || !user) return;
    const profile = accountProfile();
    const name = profile.displayName || 'Sua conta';
    const initial = (name.trim()[0] || 'B').toUpperCase();
    target.textContent = '';
    target.classList.toggle('has-banner', Boolean(profile.bannerUrl));

    if (profile.bannerUrl) {
      const banner = document.createElement('img');
      banner.className = 'tv-account-banner';
      banner.src = profile.bannerUrl;
      banner.alt = '';
      banner.loading = 'eager';
      banner.decoding = 'async';
      banner.addEventListener('error', () => {
        banner.remove();
        target.classList.remove('has-banner');
      }, { once: true });
      target.appendChild(banner);
    }

    const avatar = document.createElement('span');
    avatar.className = 'tv-account-avatar';
    avatar.textContent = initial;
    if (profile.avatarUrl) {
      const image = document.createElement('img');
      image.src = profile.avatarUrl;
      image.alt = '';
      image.loading = 'eager';
      image.decoding = 'async';
      image.addEventListener('error', () => { image.remove(); avatar.textContent = initial; }, { once: true });
      avatar.appendChild(image);
    }

    const copy = document.createElement('span');
    copy.className = 'tv-account-copy';
    const strong = document.createElement('strong');
    strong.textContent = name;
    const small = document.createElement('span');
    small.textContent = profile.username ? `@${profile.username}` : 'Perfil Billie Eilish TV';
    copy.append(strong, small);
    target.append(avatar, copy);
  }

  function setMessage(target, text, type = '') {
    if (!target) return;
    target.className = `tv-message${type ? ` ${type}` : ''}`;
    target.textContent = text || '';
  }

  function showCastToast(text) {
    let toast = document.getElementById('tvCastToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tvCastToast';
      toast.className = 'tv-cast-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = text || '';
    window.clearTimeout(castToastTimer);
    requestAnimationFrame(() => toast.classList.add('show'));
    castToastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
  }


  function syncSubtitleRemote() {
    if (!subtitleRemoteButton) return;
    const hasSubtitle = Boolean(currentTvMedia && localizedSubtitleUrl(currentTvMedia));
    subtitleRemoteButton.hidden = !hasSubtitle;
    subtitleRemoteButton.disabled = false;
    subtitleRemoteButton.classList.toggle('is-active', hasSubtitle && tvSubtitlesEnabled);
    subtitleRemoteButton.setAttribute('aria-pressed', tvSubtitlesEnabled ? 'true' : 'false');
    const label = subtitleRemoteButton.querySelector('span:last-child');
    if (label) label.textContent = tvSubtitlesEnabled ? 'Desativar legendas na TV' : 'Ativar legendas na TV';
  }

  function readPendingMedia() {
    try {
      const raw = localStorage.getItem(PENDING_MEDIA_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.contentUrl) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function renderPending() {
    pendingMedia = readPendingMedia();
    if (!pendingMedia) {
      pendingPreview.hidden = true;
      sendButton.hidden = true;
      return;
    }
    pendingTitle.textContent = String(pendingMedia.title || 'Conteúdo selecionado');
    pendingMeta.textContent = [pendingMedia.collection === 'movies' ? 'Filme' : pendingMedia.collection === 'series' ? 'Série' : 'Vídeo', pendingMedia.duration].filter(Boolean).join(' • ');
    pendingThumb.textContent = '';
    const imageUrl = String(pendingMedia.imageUrl || pendingMedia.bannerUrl || '').trim();
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = '';
      img.loading = 'eager';
      pendingThumb.appendChild(img);
    }
    pendingPreview.hidden = false;
    sendButton.hidden = false;
    sendButton.textContent = 'Transmitir agora';
    sendButton.classList.remove('is-transmitted');
    sendButton.disabled = false;
  }

  function showForm() {
    loading.hidden = true;
    connectedView.hidden = true;
    formView.hidden = false;
    accountMarkup(accountHost);
    renderPending();
  }

  function showConnected() {
    loading.hidden = true;
    formView.hidden = true;
    connectedView.hidden = false;
    accountMarkup(connectedAccountHost);
    connectedCode.textContent = activeCode ? `Código ${activeCode} • pronta para receber conteúdo` : 'Pronta para receber conteúdo';
    renderPending();
    syncSubtitleRemote();
  }

  async function loadMySession() {
    const { data, error } = await client.rpc('tv_my_sessions');
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    if (!rows.length) return null;
    const stored = String(localStorage.getItem(ACTIVE_SESSION_KEY) || '');
    return rows.find(row => String(row.session_id) === stored) || rows[0];
  }

  async function claim(code) {
    const normalized = safeCode(code);
    if (normalized.length !== 8) {
      setMessage(message, 'Digite o código de 8 caracteres mostrado na TV.', 'error');
      return false;
    }
    const { data, error } = await client.rpc('tv_claim_session', { p_pairing_code: normalized });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.session_id) throw new Error('pairing_failed');
    activeSessionId = String(row.session_id);
    activeCode = normalized;
    localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    localStorage.setItem(ACTIVE_CODE_KEY, activeCode);
    showConnected();
    try { await syncProfileToTv(); } catch (error) { console.warn('Não foi possível sincronizar o perfil com a TV:', error); }
    try { history.replaceState(null, '', '/connect-tv/'); } catch (_) {}
    return true;
  }

  async function sendPending({ automatic = false } = {}) {
    pendingMedia = readPendingMedia();
    if (!pendingMedia || !activeSessionId) return false;
    if (busy) return false;
    busy = true;
    sendButton.disabled = true;
    setMessage(connectedMessage, automatic ? 'Enviando para sua TV…' : 'Transmitindo…');
    try {
      const mediaToSend = mediaWithTvState(pendingMedia, false);
      const { error } = await client.rpc('tv_send_media', {
        p_session_id: activeSessionId,
        p_media: mediaToSend
      });
      if (error) throw error;
      currentTvMedia = mediaToSend;
      tvSubtitlesEnabled = false;
      try { localStorage.setItem(CURRENT_MEDIA_KEY, JSON.stringify(mediaToSend)); } catch (_) {}
      localStorage.removeItem(PENDING_MEDIA_KEY);
      setMessage(connectedMessage, '');
      sendButton.textContent = 'Transmitido';
      sendButton.classList.add('is-transmitted');
      sendButton.disabled = true;
      syncSubtitleRemote();
      return true;
    } catch (error) {
      console.error('Falha ao transmitir:', error);
      sendButton.classList.remove('is-transmitted');
      setMessage(connectedMessage, 'Não foi possível enviar o conteúdo. Reconecte a TV e tente novamente.', 'error');
      sendButton.disabled = false;
      return false;
    } finally {
      busy = false;
    }
  }

  function friendlyPairError(error) {
    const text = String(error?.message || '').toLowerCase();
    if (text.includes('pairing_code_expired')) return 'Esse código expirou. Gere um novo código na TV.';
    if (text.includes('pairing_code_already_used')) return 'Esse código já foi conectado a outra conta.';
    if (text.includes('invalid_pairing_code')) return 'Confira o código exibido na TV.';
    return 'Não foi possível conectar a TV. Confira o código e tente novamente.';
  }

  async function boot() {
    if (!window.supabase?.createClient) throw new Error('supabase_unavailable');
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: window.localStorage
      }
    });

    const { data: userData } = await client.auth.getUser();
    user = userData?.user || null;
    if (!user) {
      const target = safeReturnTarget();
      try { sessionStorage.setItem(POST_AUTH_KEY, target); } catch (_) {}
      location.replace(`/login?return_to=${encodeURIComponent(target)}`);
      return;
    }

    pendingMedia = readPendingMedia();
    try {
      await loadAccountProfile();
    } catch (error) {
      console.warn('Não foi possível carregar o perfil na transmissão:', error);
    }
    accountMarkup(accountHost);
    accountMarkup(connectedAccountHost);

    const queryCode = safeCode(new URLSearchParams(location.search).get('code'));
    if (queryCode.length === 8) {
      codeInput.value = queryCode;
      loading.querySelector('span:last-child').textContent = 'Conectando à sua Smart TV…';
      try {
        const ok = await claim(queryCode);
        if (ok && pendingMedia) await sendPending({ automatic: true });
        if (ok && desktopControllerMode()) returnHome();
        if (ok) showConnected();
        return;
      } catch (error) {
        showForm();
        setMessage(message, friendlyPairError(error), 'error');
        return;
      }
    }

    try {
      const existing = await loadMySession();
      if (existing) {
        activeSessionId = String(existing.session_id || '');
        currentTvMedia = existing.current_media && typeof existing.current_media === 'object' ? existing.current_media : {};
        tvSubtitlesEnabled = Boolean(currentTvMedia && currentTvMedia.subtitleEnabled);
        activeCode = String(existing.pairing_code || localStorage.getItem(ACTIVE_CODE_KEY) || '');
        localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
        if (activeCode) localStorage.setItem(ACTIVE_CODE_KEY, activeCode);
        if (!desktopControllerMode()) showConnected();
        try { await syncProfileToTv(); } catch (error) { console.warn('Não foi possível sincronizar o perfil com a TV:', error); }
        if (pendingMedia) await sendPending({ automatic: true });
        if (desktopControllerMode()) returnHome();
        showConnected();
      } else {
        showForm();
      }
    } catch (error) {
      console.warn('Não foi possível recuperar TVs anteriores:', error);
      showForm();
    }
  }

  codeInput?.addEventListener('input', () => {
    const value = safeCode(codeInput.value);
    codeInput.value = value;
    setMessage(message, '');
  });

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    const button = event.submitter || form.querySelector('button[type="submit"]');
    button.disabled = true;
    setMessage(message, 'Conectando…');
    try {
      const ok = await claim(codeInput.value);
      if (ok && readPendingMedia()) await sendPending({ automatic: true });
      if (ok && desktopControllerMode()) returnHome();
      if (ok) showConnected();
    } catch (error) {
      showForm();
      setMessage(message, friendlyPairError(error), 'error');
    } finally {
      busy = false;
      button.disabled = false;
    }
  });

  sendButton?.addEventListener('click', () => sendPending());

  subtitleRemoteButton?.addEventListener('click', async () => {
    if (!activeSessionId || !currentTvMedia || !localizedSubtitleUrl(currentTvMedia) || busy) return;
    busy = true;
    subtitleRemoteButton.disabled = true;
    const next = !tvSubtitlesEnabled;
    try {
      const updatedMedia = mediaWithTvState(currentTvMedia, next);
      let changed = false;

      // Preferimos a RPC leve quando ela já estiver instalada no Supabase: ela
      // altera somente o estado da legenda e não reinicia o vídeo na televisão.
      try {
        const result = await client.rpc('tv_set_subtitles', { p_session_id: activeSessionId, p_enabled: next });
        if (!result?.error && result?.data === true) changed = true;
      } catch (_) {}

      // Compatibilidade com instalações que ainda não aplicaram a migration da
      // RPC acima. O payload é propositalmente pequeno para não estourar o limite
      // do tv_send_media e a TV ignora a mudança de versão quando o vídeo é o mesmo.
      if (!changed) {
        const fallback = await client.rpc('tv_send_media', { p_session_id: activeSessionId, p_media: updatedMedia });
        if (fallback?.error) throw fallback.error;
        changed = true;
      }

      currentTvMedia = updatedMedia;
      tvSubtitlesEnabled = next;
      setMessage(connectedMessage, '');
      syncSubtitleRemote();
      showCastToast(next ? 'Legendas ativadas na TV.' : 'Legendas desativadas na TV.');
    } catch (error) {
      console.error('Falha ao controlar legendas da TV:', error);
      setMessage(connectedMessage, 'Não foi possível alterar as legendas da TV.', 'error');
      subtitleRemoteButton.disabled = false;
    } finally { busy = false; }
  });

  disconnectButton?.addEventListener('click', async () => {
    if (!activeSessionId || busy) return;
    busy = true;
    disconnectButton.disabled = true;
    setMessage(connectedMessage, 'Desconectando…');
    try {
      await client.rpc('tv_disconnect_session', { p_session_id: activeSessionId });
    } catch (error) {
      console.warn('Falha ao encerrar a sessão da TV:', error);
    }
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(ACTIVE_CODE_KEY);
    localStorage.removeItem(CURRENT_MEDIA_KEY);
    activeSessionId = '';
    activeCode = '';
    codeInput.value = '';
    setMessage(connectedMessage, '');
    showForm();
    busy = false;
    disconnectButton.disabled = false;
  });

  boot().catch(error => {
    console.error(error);
    loading.hidden = true;
    formView.hidden = false;
    setMessage(message, 'Não foi possível iniciar a conexão com a TV. Atualize a página.', 'error');
  });
})();

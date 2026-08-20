(() => {
  'use strict';

  const SUPABASE_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
  const SESSION_ID_KEY = 'beTvReceiverSessionId';
  const DEVICE_TOKEN_KEY = 'beTvReceiverDeviceToken';
  const POLL_MS = 1500;

  const loading = document.getElementById('receiverLoading');
  const pairing = document.getElementById('receiverPairing');
  const connected = document.getElementById('receiverConnected');
  const player = document.getElementById('receiverPlayer');
  const card = document.getElementById('receiverCard');
  const qr = document.getElementById('receiverQr');
  const codeHost = document.getElementById('receiverCode');
  const statusHost = document.getElementById('receiverStatus');
  const ownerHost = document.getElementById('receiverOwner');
  const connectedTitle = document.getElementById('receiverConnectedTitle');
  const connectedCopy = document.getElementById('receiverConnectedCopy');
  const playerHost = document.getElementById('receiverPlayerHost');
  const mediaTitle = document.getElementById('receiverMediaTitle');
  const mediaMeta = document.getElementById('receiverMediaMeta');

  let client = null;
  let sessionId = '';
  let deviceToken = '';
  let pollTimer = 0;
  let mediaVersion = -1;
  let creating = false;

  function randomToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
  }

  function show(view) {
    if (loading) loading.hidden = view !== 'loading';
    if (pairing) pairing.hidden = view !== 'pairing';
    if (connected) connected.hidden = view !== 'connected';
    if (player) player.hidden = view !== 'player';
    card?.classList.toggle('is-playing', view === 'player');
  }

  function renderCode(code) {
    if (!codeHost) return;
    codeHost.textContent = '';
    String(code || '').split('').forEach(char => {
      const span = document.createElement('span');
      span.textContent = char;
      codeHost.appendChild(span);
    });
  }

  function setStatus(text, type = '') {
    if (!statusHost) return;
    statusHost.className = `tv-status${type ? ` ${type}` : ''}`;
    statusHost.innerHTML = '<span class="pulse" aria-hidden="true"></span><span></span>';
    statusHost.lastElementChild.textContent = text;
  }

  function safeHttpUrl(value) {
    try {
      const url = new URL(String(value || '').trim(), location.origin);
      if (!['http:', 'https:'].includes(url.protocol)) return '';
      return url.href;
    } catch (_) {
      return '';
    }
  }

  function driveInfo(value) {
    const raw = safeHttpUrl(value);
    if (!raw) return null;
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase();
      if (!['drive.google.com', 'drive.usercontent.google.com'].includes(host)) return null;
      const match = url.pathname.match(/\/file\/d\/([^/]+)/i) || url.pathname.match(/\/d\/([^/]+)/i);
      const id = match?.[1] || url.searchParams.get('id') || '';
      if (!/^[a-z0-9_-]{10,}$/i.test(id)) return null;
      const resourceKey = String(url.searchParams.get('resourcekey') || '').trim();
      return { id, resourceKey: /^[a-z0-9_-]+$/i.test(resourceKey) ? resourceKey : '' };
    } catch (_) {
      return null;
    }
  }

  function youtubeInfo(value) {
    const raw = safeHttpUrl(value);
    if (!raw) return null;
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      const isShort = host === 'youtu.be';
      if (!isShort && !['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com'].includes(host)) return null;
      const parts = url.pathname.split('/').filter(Boolean);
      let id = isShort ? (parts[0] || '') : (['embed', 'shorts', 'live', 'v'].includes(parts[0] || '') ? (parts[1] || '') : (url.searchParams.get('v') || ''));
      if (!/^[a-z0-9_-]{6,20}$/i.test(id)) id = '';
      const list = String(url.searchParams.get('list') || '').trim();
      if (!id && !/^[a-z0-9_-]{6,80}$/i.test(list)) return null;
      return { id, list };
    } catch (_) {
      return null;
    }
  }

  function vkInfo(value) {
    const raw = safeHttpUrl(value);
    if (!raw) return null;
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      if (!['vkvideo.ru', 'vk.com'].includes(host)) return null;
      let owner = '';
      let id = '';
      let hash = '';
      if (/\/video_ext\.php$/i.test(url.pathname)) {
        owner = String(url.searchParams.get('oid') || '');
        id = String(url.searchParams.get('id') || '');
        hash = String(url.searchParams.get('hash') || '');
      } else {
        const match = url.pathname.match(/\/video(-?\d+)_(\d+)/i);
        if (match) [owner, id] = [match[1], match[2]];
      }
      if (!/^-?\d+$/.test(owner) || !/^\d+$/.test(id)) return null;
      if (hash && !/^[a-z0-9_-]+$/i.test(hash)) hash = '';
      return { owner, id, hash };
    } catch (_) {
      return null;
    }
  }

  function createIframe(src) {
    const frame = document.createElement('iframe');
    frame.src = src;
    frame.title = 'Player da Billie Eilish TV';
    frame.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    return frame;
  }

  function renderMedia(media, version) {
    if (!media || typeof media !== 'object') return false;
    const rawUrl = safeHttpUrl(media.contentUrl);
    if (!rawUrl) return false;
    if (Number(version) === mediaVersion) return true;
    mediaVersion = Number(version);

    let element = null;
    const drive = driveInfo(rawUrl);
    const yt = youtubeInfo(rawUrl);
    const vk = vkInfo(rawUrl);

    if (drive) {
      const params = new URLSearchParams({ autoplay: '1' });
      if (drive.resourceKey) params.set('resourcekey', drive.resourceKey);
      element = createIframe(`https://drive.google.com/file/d/${encodeURIComponent(drive.id)}/preview?${params.toString()}`);
    } else if (yt) {
      const params = new URLSearchParams({ autoplay: '1', controls: '1', rel: '0', playsinline: '1' });
      if (yt.list) params.set('list', yt.list);
      const path = yt.id ? `embed/${encodeURIComponent(yt.id)}` : 'embed/videoseries';
      element = createIframe(`https://www.youtube-nocookie.com/${path}?${params.toString()}`);
    } else if (vk) {
      const params = new URLSearchParams({ oid: vk.owner, id: vk.id, autoplay: '1', hd: '4' });
      if (vk.hash) params.set('hash', vk.hash);
      element = createIframe(`https://vk.com/video_ext.php?${params.toString()}`);
    } else if (/\.(?:mp4|webm|m4v)(?:$|[?#])/i.test(rawUrl)) {
      const video = document.createElement('video');
      video.src = rawUrl;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      element = video;
    }

    if (!element) {
      show('connected');
      connectedTitle.textContent = 'TV conectada';
      connectedCopy.textContent = 'Este conteúdo não possui um formato compatível com o player da Smart TV. Escolha outro vídeo no celular.';
      return false;
    }

    playerHost.replaceChildren(element);
    mediaTitle.textContent = String(media.title || 'Billie Eilish TV');
    mediaMeta.textContent = [media.year, media.duration].filter(Boolean).join(' • ');
    show('player');
    return true;
  }

  async function createSession() {
    if (creating) return;
    creating = true;
    show('loading');
    try {
      deviceToken = randomToken();
      const { data, error } = await client.rpc('tv_create_session', { p_device_token: deviceToken });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.session_id || !row?.pairing_code) throw new Error('session_not_created');
      sessionId = String(row.session_id);
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
      sessionStorage.setItem(DEVICE_TOKEN_KEY, deviceToken);
      renderCode(row.pairing_code);
      const connectUrl = `${location.origin}/connect-tv/?code=${encodeURIComponent(row.pairing_code)}`;
      qr.src = `/api/tv-qr?url=${encodeURIComponent(connectUrl)}`;
      show('pairing');
      setStatus('Aguardando conexão do celular…');
    } catch (error) {
      console.error('Falha ao criar conexão da TV:', error);
      show('pairing');
      renderCode('--------');
      setStatus('Não foi possível preparar a conexão. Atualize a página.', 'error');
    } finally {
      creating = false;
    }
  }

  async function poll() {
    if (!sessionId || !deviceToken || document.visibilityState === 'hidden') return;
    try {
      const { data, error } = await client.rpc('tv_receiver_state', {
        p_session_id: sessionId,
        p_device_token: deviceToken
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        sessionStorage.removeItem(SESSION_ID_KEY);
        sessionStorage.removeItem(DEVICE_TOKEN_KEY);
        sessionId = '';
        deviceToken = '';
        await createSession();
        return;
      }
      if (row.status === 'disconnected') {
        sessionStorage.removeItem(SESSION_ID_KEY);
        sessionStorage.removeItem(DEVICE_TOKEN_KEY);
        sessionId = '';
        deviceToken = '';
        mediaVersion = -1;
        playerHost.replaceChildren();
        await createSession();
        return;
      }
      if (row.status === 'paired') {
        ownerHost.textContent = row.owner_display_name || 'Conta conectada';
        if (row.current_media && Object.keys(row.current_media).length) {
          renderMedia(row.current_media, row.media_version);
        } else if (player.hidden) {
          connectedTitle.textContent = 'Conectado à sua conta';
          connectedCopy.textContent = 'Agora escolha um vídeo ou filme no celular e toque no ícone de transmissão.';
          show('connected');
        }
      }
    } catch (error) {
      console.warn('Falha temporária ao sincronizar a TV:', error);
    }
  }

  async function boot() {
    if (!window.supabase?.createClient) {
      show('pairing');
      setStatus('Não foi possível carregar a conexão da TV. Atualize a página.', 'error');
      return;
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    sessionId = String(sessionStorage.getItem(SESSION_ID_KEY) || '');
    deviceToken = String(sessionStorage.getItem(DEVICE_TOKEN_KEY) || '');
    if (!sessionId || !deviceToken) await createSession();
    else {
      show('loading');
      await poll();
      if (!sessionId) await createSession();
    }

    clearInterval(pollTimer);
    pollTimer = window.setInterval(poll, POLL_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') poll();
    });
  }

  boot().catch(error => {
    console.error(error);
    show('pairing');
    setStatus('Não foi possível iniciar a conexão. Atualize a página.', 'error');
  });
})();

/* BETV Watch Party — opt-in rooms using Supabase Realtime Broadcast & Presence. */
(() => {
  'use strict';
  if (window.BETVWatchParty) return;
  const el = id => document.getElementById(id);
  const ROOM_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  const roomParam = 'watchParty', videoParam = 'watchVideo';
  const language = () => String(window.BETVLocale?.slug || 'pt-br').toLowerCase();
  const translations = {
    'pt-br': ['Assistir juntos', 'Watch Party', 'Assista com amigos, mesmo à distância.', 'Copiar convite', 'Convite copiado!', 'Sair da sala', 'Chat da sala', 'Sua mensagem…', 'Enviar', 'Abrir vídeo', 'Sala pronta. Convide seus amigos!', 'Entrando na sala…', 'Conectado', 'Aguardando o anfitrião…', 'Faça login para participar.', 'Vídeo não encontrado para este convite.', 'Falha na conexão. Tente novamente.', 'Ninguém escreveu ainda. Diga oi!', 'Reprodução sincronizada', 'O player externo não permite sincronização automática. Você ainda pode conversar.', 'online', 'O anfitrião encerrou a sala.', 'Não foi possível copiar. Use o endereço do navegador.', 'Fechar'],
    'en-us': ['Watch together', 'Watch Party', 'Watch with friends, wherever you are.', 'Copy invite', 'Invite copied!', 'Leave room', 'Party chat', 'Your message…', 'Send', 'Open video', 'Room ready. Invite your friends!', 'Joining room…', 'Connected', 'Waiting for the host…', 'Sign in to join a Watch Party.', 'Video not found for this invitation.', 'Connection failed. Try again.', 'No messages yet. Say hello!', 'Playback synchronized', 'This external player cannot sync automatically. Chat is still available.', 'online', 'The host ended the room.', 'Could not copy. Use the browser address bar.', 'Close'],
    'es': ['Ver juntos', 'Watch Party', 'Vean juntos desde cualquier lugar.', 'Copiar invitación', '¡Enlace copiado!', 'Salir', 'Chat de sala', 'Tu mensaje…', 'Enviar', 'Abrir vídeo', 'Sala lista. ¡Invita a tus amigos!', 'Entrando…', 'Conectado', 'Esperando al anfitrión…', 'Inicia sesión para participar.', 'Vídeo no encontrado.', 'Error de conexión. Inténtalo de nuevo.', 'Todavía no hay mensajes.', 'Reproducción sincronizada', 'Este reproductor externo no se sincroniza automáticamente. El chat sigue disponible.', 'en línea', 'El anfitrión cerró la sala.', 'Copia el enlace desde el navegador.', 'Cerrar'],
    'fr': ['Regarder ensemble', 'Watch Party', 'Regardez ensemble à distance.', 'Copier le lien', 'Lien copié !', 'Quitter', 'Discussion', 'Votre message…', 'Envoyer', 'Ouvrir la vidéo', 'Salon prêt. Invitez vos amis !', 'Connexion…', 'Connecté', 'En attente de l’hôte…', 'Connectez-vous pour participer.', 'Vidéo introuvable.', 'Connexion impossible. Réessayez.', 'Aucun message.', 'Lecture synchronisée', 'Ce lecteur externe ne se synchronise pas. La discussion reste disponible.', 'en ligne', 'L’hôte a fermé le salon.', 'Copiez le lien dans la barre d’adresse.', 'Fermer'],
    'it': ['Guarda insieme', 'Watch Party', 'Guarda insieme ai tuoi amici.', 'Copia invito', 'Link copiato!', 'Esci', 'Chat della stanza', 'Il tuo messaggio…', 'Invia', 'Apri video', 'Stanza pronta. Invita gli amici!', 'Connessione…', 'Connesso', 'In attesa dell’host…', 'Accedi per partecipare.', 'Video non trovato.', 'Connessione non riuscita. Riprova.', 'Nessun messaggio.', 'Riproduzione sincronizzata', 'Questo player esterno non supporta la sincronizzazione. La chat è disponibile.', 'online', 'L’host ha chiuso la stanza.', 'Copia il link dalla barra degli indirizzi.', 'Chiudi']
  };
  const tx = n => (translations[language()] || translations['pt-br'])[n];
  const KEY = Object.freeze({BUTTON:0,TITLE:1,INTRO:2,INVITE:3,COPIED:4,LEAVE:5,CHAT:6,PLACEHOLDER:7,SEND:8,OPEN:9,READY:10,JOINING:11,CONNECTED:12,WAITING:13,AUTH:14,VIDEO:15,ERROR:16,EMPTY:17,SYNC:18,LIMITED:19,ONLINE:20,ENDED:21,COPYFAIL:22,CLOSE:23});
  const token = window.crypto?.randomUUID?.() || '';
  let channel = null, room = '', host = false, hostToken = '', joined = false, pending = false, latest = null;
  let hostTimer = 0, followerTimer = 0, lastChatAt = 0, lastPublishAt = 0;
  let currentVideoId = '';
  const client = () => window.beBackend?.client;
  const user = () => window.beBackend?.auth?.currentUser;
  const name = () => String(user()?.username || user()?.displayName || user()?.name || 'Fã').slice(0, 32);
  const currentVideo = () => {
    const button = el('contentDetailPlay');
    return button && document.body.classList.contains('detail-page-active') &&
      button.dataset.mediaPlayerTrigger === 'true' && button.dataset.itemId
      ? {id:button.dataset.itemId, title:button.dataset.title || ''} : null;
  };
  const nativeVideo = () => {
    const overlay = el('driveVideoPlayerOverlay'), video = el('driveVideoPlayerVideo');
    return overlay && !overlay.hidden && !overlay.classList.contains('is-frame-mode') ? video : null;
  };
  const inviteUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set(roomParam, room);
    url.searchParams.set(videoParam, currentVideoId);
    url.hash = '';
    return url.href;
  };
  const setUrl = (keep) => {
    const url = new URL(location.href);
    if (keep) { url.searchParams.set(roomParam, room); url.searchParams.set(videoParam, currentVideoId); }
    else { url.searchParams.delete(roomParam); url.searchParams.delete(videoParam); }
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  };
  function status(text, error = false) {
    el('watchPartyStatus').textContent = text;
    el('watchPartyStatus').classList.toggle('is-error', error);
  }
  function showPanel() {
    el('watchPartyPanel').hidden = false;
    el('contentDetailWatchParty').setAttribute('aria-expanded', 'true');
  }
  function hidePanel() {
    el('watchPartyPanel').hidden = true;
    el('contentDetailWatchParty').setAttribute('aria-expanded', 'false');
  }
  function resetChat() {
    el('watchPartyMessages').replaceChildren();
    el('watchPartyEmpty').hidden = false;
  }
  function chatMessage(who, body, own = false) {
    const list = el('watchPartyMessages');
    const line = document.createElement('div');
    line.className = 'watch-party-message' + (own ? ' is-self' : '');
    const author = document.createElement('strong');
    author.textContent = who.slice(0, 32);
    const text = document.createElement('p');
    text.textContent = body.slice(0, 280);
    line.append(author, text);
    list.appendChild(line);
    while (list.children.length > 80) list.firstElementChild.remove();
    list.scrollTop = list.scrollHeight;
    el('watchPartyEmpty').hidden = true;
  }
  function send(event, payload) {
    if (!joined || !channel) return;
    channel.send({type:'broadcast', event, payload}).catch(() => {});
  }
  function countPresence() {
    if (!channel || !joined) return;
    const presence = Object.values(channel.presenceState()).flat().filter(Boolean);
    const uniq = new Map(presence.map(row => [row.token, row]));
    el('watchPartyCount').textContent = uniq.size + ' ' + tx(KEY.ONLINE);
    const leader = [...uniq.values()].find(row => row.isHost === true);
    hostToken = leader?.token || (host ? token : '');
    if (!host && !leader) status(tx(KEY.WAITING));
    else if (!host) status(tx(KEY.CONNECTED));
  }
  function playbackState() {
    const video = nativeVideo();
    if (!video) return null;
    return {from:token, position:Number(video.currentTime || 0), playing:!video.paused && !video.ended, at:Date.now()};
  }
  function publishPlayback(force = false) {
    if (!host || !joined) return;
    if (!force && Date.now() - lastPublishAt < 300) return;
    const snapshot = playbackState();
    if (snapshot) {
      lastPublishAt = Date.now();
      send('playback', snapshot);
    }
  }
  function applyPlayback(state) {
    if (host || !state || state.from !== hostToken) return;
    const video = nativeVideo();
    if (!video || video.readyState < 1) {
      const overlay = el('driveVideoPlayerOverlay');
      if (overlay && !overlay.hidden && overlay.classList.contains('is-frame-mode')) status(tx(KEY.LIMITED));
      return;
    }
    const position = Number(state.position);
    if (!Number.isFinite(position) || position < 0) return;
    const offset = state.playing ? Math.min(3, Math.max(0, (Date.now() - Number(state.at || Date.now())) / 1000)) : 0;
    const target = Math.min(Number.isFinite(video.duration) ? video.duration : position + offset, position + offset);
    if (Math.abs(video.currentTime - target) > 1.4) {
      try { video.currentTime = target; } catch (_) {}
    }
    if (state.playing && video.paused) video.play().catch(() => {});
    if (!state.playing && !video.paused) video.pause();
  }
  async function leaveRoom(removeUrl = true) {
    const old = channel;
    channel = null; room = ''; hostToken = ''; host = false; joined = false; pending = false;
    latest = null; currentVideoId = '';
    clearInterval(hostTimer); clearInterval(followerTimer);
    hostTimer = followerTimer = 0;
    if (removeUrl) setUrl(false);
    if (old) {
      try { await old.untrack(); } catch (_) {}
      try { await client()?.removeChannel(old); } catch (_) {}
    }
    resetChat();
    el('watchPartyCount').textContent = '0 ' + tx(KEY.ONLINE);
    el('watchPartyCopy').disabled = true;
    el('watchPartyLeave').hidden = true;
    el('watchPartyOpenVideo').hidden = true;
    el('contentDetailWatchParty').classList.remove('is-active');
  }
  async function connect(id, asHost) {
    const video = currentVideo();
    if (!video) { showPanel(); status(tx(KEY.VIDEO), true); return; }
    try { await Promise.resolve(window.beBackend?.ready); } catch (_) {}
    if (!user() || !client() || !token) { showPanel(); status(tx(KEY.AUTH), true); return; }
    if (!ROOM_RE.test(id) || pending) return;
    if (channel) await leaveRoom();
    currentVideoId = video.id;
    room = id; host = asHost; pending = true; joined = false; hostToken = host ? token : '';
    showPanel(); resetChat(); status(tx(KEY.JOINING));
    el('watchPartyCopy').disabled = false;
    el('watchPartyLeave').hidden = false;
    el('watchPartyOpenVideo').hidden = false;
    const ch = client().channel('betv-party:' + room, {
      config:{presence:{key:token},broadcast:{self:false,ack:false}}
    });
    channel = ch;
    ch.on('presence', {event:'sync'}, countPresence);
    ch.on('broadcast', {event:'playback'}, ({payload}) => {
      if (!host && payload && payload.from === hostToken) {
        latest = payload;
        applyPlayback(payload);
      }
    });
    ch.on('broadcast', {event:'sync-request'}, () => { if (host) publishPlayback(true); });
    ch.on('broadcast', {event:'message'}, ({payload}) => {
      if (payload && typeof payload.text === 'string' && payload.text.trim() && payload.text.length <= 280 && payload.from !== token)
        chatMessage(String(payload.name || 'Fã'), payload.text);
    });
    ch.on('broadcast', {event:'room-ended'}, ({payload}) => {
      if (!host && payload?.from === hostToken) {
        status(tx(KEY.ENDED), true);
        leaveRoom();
        showPanel();
        status(tx(KEY.ENDED), true);
      }
    });
    ch.subscribe(async state => {
      if (ch !== channel) return;
      if (state === 'SUBSCRIBED') {
        joined = true; pending = false;
        el('contentDetailWatchParty').classList.add('is-active');
        try { await ch.track({token, name:name(), isHost:host}); } catch (_) {}
        setUrl(true);
        status(host ? tx(KEY.READY) : tx(KEY.WAITING));
        countPresence();
        if (host) {
          hostTimer = setInterval(() => publishPlayback(), 2500);
          publishPlayback(true);
        } else {
          followerTimer = setInterval(() => { if (latest) applyPlayback(latest); }, 1100);
          send('sync-request', {from:token});
        }
      } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') {
        pending = false;
        status(tx(KEY.ERROR), true);
      }
    });
  }
  function buildPanel() {
    const panel = document.createElement('aside');
    panel.id = 'watchPartyPanel';
    panel.className = 'watch-party-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Watch Party');
    panel.innerHTML = '<header class="watch-party-header"><div class="watch-party-heading"><span class="watch-party-symbol" aria-hidden="true">◉</span><div><strong id="watchPartyTitle"></strong><p id="watchPartyIntro"></p></div></div><button type="button" class="watch-party-close" id="watchPartyClose" aria-label="Fechar">×</button></header>' +
      '<div class="watch-party-status"><span class="watch-party-pulse"></span><span id="watchPartyCount"></span></div>' +
      '<p id="watchPartyStatus" class="watch-party-feedback" role="status" aria-live="polite"></p>' +
      '<div class="watch-party-buttons"><button id="watchPartyCopy" type="button" class="watch-party-primary" disabled></button><button id="watchPartyOpenVideo" type="button" hidden></button></div>' +
      '<div class="watch-party-chat-heading" id="watchPartyChatTitle"></div><div class="watch-party-chat"><p id="watchPartyEmpty"></p><div id="watchPartyMessages" role="log" aria-live="polite" aria-relevant="additions"></div></div>' +
      '<form id="watchPartyForm" class="watch-party-composer"><input id="watchPartyInput" maxlength="280" autocomplete="off" required aria-label="Chat"><button id="watchPartySend" type="submit"></button></form>' +
      '<button id="watchPartyLeave" type="button" class="watch-party-leave" hidden></button>';
    document.body.appendChild(panel);
    el('watchPartyClose').addEventListener('click', hidePanel);
    el('watchPartyCopy').addEventListener('click', async () => {
      if (!room) return;
      try {
        await navigator.clipboard.writeText(inviteUrl());
        status(tx(KEY.COPIED));
      } catch (_) { status(tx(KEY.COPYFAIL), true); }
    });
    el('watchPartyOpenVideo').addEventListener('click', () => {
      const play = el('contentDetailPlay');
      if (play?.dataset.mediaPlayerTrigger === 'true') play.click();
    });
    el('watchPartyLeave').addEventListener('click', async () => {
      if (host) send('room-ended', {from:token});
      await leaveRoom();
      hidePanel();
    });
    el('watchPartyForm').addEventListener('submit', e => {
      e.preventDefault();
      if (!joined || !channel || Date.now() - lastChatAt < 900) return;
      const input = el('watchPartyInput');
      const body = input.value.trim().slice(0, 280);
      if (!body) return;
      lastChatAt = Date.now();
      send('message', {from:token, name:name(), text:body});
      chatMessage(name(), body, true);
      input.value = '';
    });
    el('contentDetailWatchParty').addEventListener('click', e => {
      e.preventDefault();
      if (joined || pending) { showPanel(); return; }
      const id = window.crypto?.randomUUID?.();
      if (!id) return status(tx(KEY.ERROR), true);
      connect(id, true);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !panel.hidden && e.target.closest('#watchPartyPanel')) hidePanel();
    });
    window.addEventListener('pagehide', () => { if (channel) client()?.removeChannel(channel); });
    window.addEventListener('be:detail-close', () => { if (channel) leaveRoom(); hidePanel(); });
    const videoObserver = new MutationObserver(() => {
      if (joined && currentVideo()?.id && currentVideo().id !== currentVideoId) { leaveRoom(); hidePanel(); }
      tryJoinInvite();
    });
    const play = el('contentDetailPlay');
    if (play) videoObserver.observe(play, {attributes:true, attributeFilter:['data-item-id','data-media-player-trigger']});
    [ 'play','pause','seeked' ].forEach(event => {
      document.addEventListener(event, e => {
        if (e.target?.id === 'driveVideoPlayerVideo') {
          if (host) publishPlayback(true);
          else if (latest) applyPlayback(latest);
        }
      }, true);
    });
    const countdown = new URLSearchParams(location.search);
    if (countdown.has(roomParam)) {
      let tries = 0;
      const timer = setInterval(() => {
        if (joined || tries++ > 60) { clearInterval(timer); return; }
        tryJoinInvite();
      }, 500);
      tryJoinInvite();
    }
    refreshLanguage();
    window.addEventListener('be:i18n-ready', refreshLanguage);
  }
  function refreshLanguage() {
    const map = {
      contentDetailWatchParty:KEY.BUTTON, watchPartyTitle:KEY.TITLE, watchPartyIntro:KEY.INTRO,
      watchPartyCopy:KEY.INVITE, watchPartyOpenVideo:KEY.OPEN, watchPartyChatTitle:KEY.CHAT,
      watchPartyEmpty:KEY.EMPTY, watchPartySend:KEY.SEND, watchPartyLeave:KEY.LEAVE
    };
    Object.entries(map).forEach(([id, key]) => { if (el(id)) el(id).textContent = tx(key); });
    el('watchPartyInput').placeholder = tx(KEY.PLACEHOLDER);
    el('watchPartyClose').setAttribute('aria-label', tx(KEY.CLOSE));
    if (!joined) el('watchPartyCount').textContent = '0 ' + tx(KEY.ONLINE);
  }
  let invitePending = false;
  function tryJoinInvite() {
    const url = new URL(location.href);
    const id = url.searchParams.get(roomParam);
    const expected = url.searchParams.get(videoParam);
    if (!id || !ROOM_RE.test(id) || !expected || expected.length > 180 || joined || pending || invitePending) return;
    const video = currentVideo();
    if (!video || video.id !== expected) return;
    invitePending = true;
    connect(id, false).finally(() => { invitePending = false; });
  }
  function init() {
    if (!el('contentDetailWatchParty') || !el('contentDetailPlay')) return;
    buildPanel();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  window.BETVWatchParty = Object.freeze({open: () => el('watchPartyPanel') && showPanel()});
})();

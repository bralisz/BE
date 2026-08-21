(function () {
  'use strict';

  /*
   * Receiver intentionally uses ES5-era syntax/APIs so older Smart TV
   * browsers (old Tizen/WebOS/NetCast/Chromium builds) can still pair.
   * The TV talks to our same-origin /api/tv bridge instead of loading the
   * Supabase browser SDK, which removes a large modern-JS dependency.
   */
  var SESSION_ID_KEY = 'beTvReceiverSessionId';
  var DEVICE_TOKEN_KEY = 'beTvReceiverDeviceToken';
  var POLL_MS = 1800;

  var loading = document.getElementById('receiverLoading');
  var pairing = document.getElementById('receiverPairing');
  var connected = document.getElementById('receiverConnected');
  var player = document.getElementById('receiverPlayer');
  var card = document.getElementById('receiverCard');
  var qr = document.getElementById('receiverQr');
  var codeHost = document.getElementById('receiverCode');
  var statusHost = document.getElementById('receiverStatus');
  var ownerHost = document.getElementById('receiverOwner');
  var connectedTitle = document.getElementById('receiverConnectedTitle');
  var connectedCopy = document.getElementById('receiverConnectedCopy');
  var playerHost = document.getElementById('receiverPlayerHost');
  var mediaTitle = document.getElementById('receiverMediaTitle');
  var mediaMeta = document.getElementById('receiverMediaMeta');

  var sessionId = '';
  var deviceToken = '';
  var pollTimer = 0;
  var mediaVersion = -1;
  var creating = false;
  var legacyMode = detectLegacyTv();

  function hasClass(element, name) {
    return element && (' ' + element.className + ' ').indexOf(' ' + name + ' ') >= 0;
  }

  function addClass(element, name) {
    if (!element || hasClass(element, name)) return;
    element.className = (element.className ? element.className + ' ' : '') + name;
  }

  function removeClass(element, name) {
    if (!element) return;
    element.className = (' ' + element.className + ' ').replace(' ' + name + ' ', ' ').replace(/^\s+|\s+$/g, '');
  }

  function detectLegacyTv() {
    var ua = String(navigator.userAgent || '').toLowerCase();
    var oldPlatform = /netcast|maple|hbbtv|smart-tv|smarttv|viera|aquos|tizen[\s\/][1234](?:\.|\b)|web0s[\s\/][1234](?:\.|\b)|webos[\s\/][1234](?:\.|\b)/i.test(ua);
    var oldChrome = ua.match(/(?:chrome|chromium)\/(\d+)/i);
    if (oldChrome && Number(oldChrome[1]) < 60) oldPlatform = true;
    if (!window.Promise || !window.URL || !window.fetch) oldPlatform = true;
    return oldPlatform;
  }

  if (legacyMode) {
    addClass(document.documentElement, 'legacy-tv');
    addClass(document.body, 'legacy-tv');
  }

  function safeSessionGet(key) {
    try { return String(window.sessionStorage ? sessionStorage.getItem(key) || '' : ''); }
    catch (ignore) { return ''; }
  }

  function safeSessionSet(key, value) {
    try { if (window.sessionStorage) sessionStorage.setItem(key, value); }
    catch (ignore) {}
  }

  function safeSessionRemove(key) {
    try { if (window.sessionStorage) sessionStorage.removeItem(key); }
    catch (ignore) {}
  }

  function randomToken() {
    var out = '';
    var i;
    try {
      if (window.crypto && window.crypto.getRandomValues && window.Uint8Array) {
        var bytes = new Uint8Array(32);
        window.crypto.getRandomValues(bytes);
        for (i = 0; i < bytes.length; i += 1) {
          var hex = bytes[i].toString(16);
          out += hex.length < 2 ? '0' + hex : hex;
        }
        return out;
      }
    } catch (ignore) {}
    for (i = 0; i < 64; i += 1) out += Math.floor(Math.random() * 16).toString(16);
    return out;
  }

  function setVisible(element, visible) {
    if (!element) return;
    element.style.display = visible ? '' : 'none';
    try {
      if (visible) element.removeAttribute('hidden');
      else element.setAttribute('hidden', 'hidden');
    } catch (ignore) {}
    try { element.hidden = !visible; } catch (ignore2) {}
  }

  function isVisible(element) {
    if (!element) return false;
    return element.style.display !== 'none' && !element.getAttribute('hidden');
  }

  function show(view) {
    setVisible(loading, view === 'loading');
    setVisible(pairing, view === 'pairing');
    setVisible(connected, view === 'connected');
    setVisible(player, view === 'player');
    if (card) {
      if (view === 'player') addClass(card, 'is-playing');
      else removeClass(card, 'is-playing');
    }
  }

  function renderCode(code) {
    if (!codeHost) return;
    while (codeHost.firstChild) codeHost.removeChild(codeHost.firstChild);
    var chars = String(code || '').split('');
    for (var i = 0; i < chars.length; i += 1) {
      var span = document.createElement('span');
      span.appendChild(document.createTextNode(chars[i]));
      codeHost.appendChild(span);
    }
  }

  function setStatus(text, type) {
    if (!statusHost) return;
    statusHost.className = 'tv-status' + (type ? ' ' + type : '');
    statusHost.innerHTML = '<span class="pulse" aria-hidden="true"></span><span></span>';
    var labels = statusHost.getElementsByTagName('span');
    if (labels.length > 1) labels[1].appendChild(document.createTextNode(String(text || '')));
  }

  function encodeFormValue(value) {
    return encodeURIComponent(String(value == null ? '' : value));
  }

  function apiCall(action, payload, callback) {
    var xhr;
    try { xhr = new XMLHttpRequest(); }
    catch (error) { callback(error); return; }

    xhr.open('POST', '/api/tv?action=' + encodeFormValue(action), true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.timeout = 15000;

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      var data = null;
      try { data = xhr.responseText ? JSON.parse(xhr.responseText) : null; }
      catch (ignore) {}
      if (xhr.status >= 200 && xhr.status < 300) {
        callback(null, data);
        return;
      }
      var err = new Error(data && (data.message || data.error) ? String(data.message || data.error) : 'tv_api_error');
      err.status = xhr.status;
      callback(err);
    };
    xhr.ontimeout = function () { callback(new Error('tv_api_timeout')); };
    xhr.onerror = function () { callback(new Error('tv_api_network')); };

    try { xhr.send(JSON.stringify(payload || {})); }
    catch (error) { callback(error); }
  }

  function parseUrl(value) {
    var raw = String(value || '').replace(/^\s+|\s+$/g, '');
    if (!raw) return null;
    try {
      var a = document.createElement('a');
      a.href = raw;
      if (!a.protocol || !a.host) {
        var base = document.createElement('a');
        base.href = location.href;
        a.href = base.protocol + '//' + base.host + (raw.charAt(0) === '/' ? raw : '/' + raw);
      }
      if (a.protocol !== 'http:' && a.protocol !== 'https:') return null;
      return a;
    } catch (ignore) {
      return null;
    }
  }

  function queryValue(search, name) {
    var query = String(search || '').replace(/^\?/, '').split('&');
    var target = String(name || '').toLowerCase();
    for (var i = 0; i < query.length; i += 1) {
      var part = query[i].split('=');
      var key = '';
      try { key = decodeURIComponent(part.shift() || '').toLowerCase(); }
      catch (ignore) { key = String(part.shift() || '').toLowerCase(); }
      if (key !== target) continue;
      var raw = part.join('=');
      try { return decodeURIComponent(raw.replace(/\+/g, ' ')); }
      catch (ignore2) { return raw; }
    }
    return '';
  }

  function safeHttpUrl(value) {
    var parsed = parseUrl(value);
    return parsed ? parsed.href : '';
  }

  function driveInfo(value) {
    var url = parseUrl(value);
    if (!url) return null;
    var host = String(url.hostname || '').toLowerCase();
    if (host !== 'drive.google.com' && host !== 'drive.usercontent.google.com') return null;
    var match = String(url.pathname || '').match(/\/file\/d\/([^/]+)/i) || String(url.pathname || '').match(/\/d\/([^/]+)/i);
    var id = match && match[1] ? match[1] : queryValue(url.search, 'id');
    if (!/^[a-z0-9_-]{10,}$/i.test(id)) return null;
    var resourceKey = String(queryValue(url.search, 'resourcekey') || '').replace(/^\s+|\s+$/g, '');
    if (resourceKey && !/^[a-z0-9_-]+$/i.test(resourceKey)) resourceKey = '';
    return { id: id, resourceKey: resourceKey };
  }

  function youtubeInfo(value) {
    var url = parseUrl(value);
    if (!url) return null;
    var host = String(url.hostname || '').toLowerCase().replace(/^www\./, '');
    var isShort = host === 'youtu.be';
    if (!isShort && host !== 'youtube.com' && host !== 'm.youtube.com' && host !== 'music.youtube.com' && host !== 'youtube-nocookie.com') return null;
    var rawParts = String(url.pathname || '').split('/');
    var parts = [];
    var i;
    for (i = 0; i < rawParts.length; i += 1) if (rawParts[i]) parts.push(rawParts[i]);
    var id = '';
    if (isShort) id = parts[0] || '';
    else if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live' || parts[0] === 'v') id = parts[1] || '';
    else id = queryValue(url.search, 'v');
    if (!/^[a-z0-9_-]{6,20}$/i.test(id)) id = '';
    var list = String(queryValue(url.search, 'list') || '').replace(/^\s+|\s+$/g, '');
    if (!id && !/^[a-z0-9_-]{6,80}$/i.test(list)) return null;
    return { id: id, list: list };
  }

  function vkInfo(value) {
    var url = parseUrl(value);
    if (!url) return null;
    var host = String(url.hostname || '').toLowerCase().replace(/^www\./, '');
    if (host !== 'vkvideo.ru' && host !== 'vk.com') return null;
    var owner = '';
    var id = '';
    var hash = '';
    if (/\/video_ext\.php$/i.test(String(url.pathname || ''))) {
      owner = String(queryValue(url.search, 'oid') || '');
      id = String(queryValue(url.search, 'id') || '');
      hash = String(queryValue(url.search, 'hash') || '');
    } else {
      var match = String(url.pathname || '').match(/\/video(-?\d+)_(\d+)/i);
      if (match) { owner = match[1]; id = match[2]; }
    }
    if (!/^-?\d+$/.test(owner) || !/^\d+$/.test(id)) return null;
    if (hash && !/^[a-z0-9_-]+$/i.test(hash)) hash = '';
    return { owner: owner, id: id, hash: hash };
  }

  function paramsString(items) {
    var out = [];
    for (var key in items) {
      if (!Object.prototype.hasOwnProperty.call(items, key)) continue;
      if (items[key] === '' || items[key] == null) continue;
      out.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(items[key])));
    }
    return out.join('&');
  }

  function createIframe(src) {
    var frame = document.createElement('iframe');
    frame.src = src;
    frame.title = 'Player da Billie Eilish TV';
    frame.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
    frame.setAttribute('allowfullscreen', 'allowfullscreen');
    frame.setAttribute('frameborder', '0');
    return frame;
  }

  function createVideo(src, subtitleUrl) {
    var video = document.createElement('video');
    video.src = src;
    video.setAttribute('controls', 'controls');
    video.setAttribute('autoplay', 'autoplay');
    video.setAttribute('preload', 'auto');
    video.setAttribute('playsinline', 'playsinline');
    video.setAttribute('webkit-playsinline', 'webkit-playsinline');
    if (subtitleUrl && /\.vtt(?:$|[?#])/i.test(subtitleUrl)) {
      var track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = 'Legendas';
      track.srclang = 'pt';
      track.src = subtitleUrl;
      track.default = true;
      video.appendChild(track);
    }
    return video;
  }

  function clearPlayer() {
    if (!playerHost) return;
    while (playerHost.firstChild) playerHost.removeChild(playerHost.firstChild);
  }

  function preferredMediaUrl(media) {
    var driveCandidate = String(media.tvDriveUrl || media.mobileAppDriveUrl || media.appDriveUrl || '').replace(/^\s+|\s+$/g, '');
    if (driveCandidate && driveInfo(driveCandidate)) return driveCandidate;
    return String(media.contentUrl || '').replace(/^\s+|\s+$/g, '');
  }

  function renderMedia(media, version) {
    if (!media || typeof media !== 'object') return false;
    var selectedUrl = preferredMediaUrl(media);
    var rawUrl = safeHttpUrl(selectedUrl);
    if (!rawUrl) return false;
    if (Number(version) === mediaVersion) return true;
    mediaVersion = Number(version);

    var element = null;
    var drive = driveInfo(rawUrl);
    var yt = youtubeInfo(rawUrl);
    var vk = vkInfo(rawUrl);

    if (drive) {
      if (legacyMode) {
        var directDrive = 'https://drive.usercontent.google.com/download?' + paramsString({ id: drive.id, export: 'download', confirm: 't', authuser: '0', resourcekey: drive.resourceKey });
        var proxyDrive = '/api/drive-media?' + paramsString({ id: drive.id, resourcekey: drive.resourceKey });
        element = createVideo(directDrive, String(media.subtitleUrl || ''));
        (function (video, fallbackDrive, proxyUrl) {
          var fallbackStep = 0;
          video.onerror = function () {
            if (fallbackStep === 0) {
              fallbackStep = 1;
              try {
                video.src = proxyUrl;
                if (video.load) video.load();
                return;
              } catch (ignore) {}
            }
            if (fallbackStep > 1) return;
            fallbackStep = 2;
            var preview = 'https://drive.google.com/file/d/' + encodeURIComponent(fallbackDrive.id) + '/preview?' + paramsString({ autoplay: '1', resourcekey: fallbackDrive.resourceKey });
            clearPlayer();
            playerHost.appendChild(createIframe(preview));
          };
        })(element, drive, proxyDrive);
      } else {
        element = createIframe('https://drive.google.com/file/d/' + encodeURIComponent(drive.id) + '/preview?' + paramsString({ autoplay: '1', resourcekey: drive.resourceKey }));
      }
    } else if (yt) {
      var path = yt.id ? 'embed/' + encodeURIComponent(yt.id) : 'embed/videoseries';
      element = createIframe('https://www.youtube-nocookie.com/' + path + '?' + paramsString({ autoplay: '1', controls: '1', rel: '0', playsinline: '1', list: yt.list }));
    } else if (vk) {
      element = createIframe('https://vk.com/video_ext.php?' + paramsString({ oid: vk.owner, id: vk.id, autoplay: '1', hd: legacyMode ? '2' : '4', hash: vk.hash }));
    } else if (/\.(?:mp4|webm|m4v)(?:$|[?#])/i.test(rawUrl)) {
      element = createVideo(rawUrl, String(media.subtitleUrl || ''));
    }

    if (!element) {
      show('connected');
      if (connectedTitle) connectedTitle.textContent = 'TV conectada';
      if (connectedCopy) connectedCopy.textContent = 'Este conteúdo não possui um formato compatível com o player desta Smart TV. Escolha outro vídeo no celular.';
      return false;
    }

    clearPlayer();
    playerHost.appendChild(element);
    if (mediaTitle) mediaTitle.textContent = String(media.title || 'Billie Eilish TV');
    if (mediaMeta) {
      var meta = [];
      if (media.year) meta.push(media.year);
      if (media.duration) meta.push(media.duration);
      mediaMeta.textContent = meta.join(' • ');
    }
    show('player');
    return true;
  }

  function createSession() {
    if (creating) return;
    creating = true;
    show('loading');
    deviceToken = randomToken();
    apiCall('create', { deviceToken: deviceToken }, function (error, row) {
      creating = false;
      if (error || !row || !row.session_id || !row.pairing_code) {
        if (window.console && console.error) console.error('Falha ao criar conexão da TV:', error || 'session_not_created');
        show('pairing');
        renderCode('--------');
        setStatus('Não foi possível preparar a conexão. Atualize a página.', 'error');
        return;
      }
      sessionId = String(row.session_id);
      safeSessionSet(SESSION_ID_KEY, sessionId);
      safeSessionSet(DEVICE_TOKEN_KEY, deviceToken);
      renderCode(row.pairing_code);
      var connectUrl = location.protocol + '//' + location.host + '/connect-tv/?code=' + encodeURIComponent(row.pairing_code);
      if (qr) qr.src = '/api/tv-qr?url=' + encodeURIComponent(connectUrl) + '&format=png';
      show('pairing');
      setStatus('Aguardando conexão do celular…');
    });
  }

  function resetSession() {
    safeSessionRemove(SESSION_ID_KEY);
    safeSessionRemove(DEVICE_TOKEN_KEY);
    sessionId = '';
    deviceToken = '';
    mediaVersion = -1;
    clearPlayer();
    createSession();
  }

  function poll() {
    if (!sessionId || !deviceToken) return;
    if (typeof document.hidden !== 'undefined' && document.hidden) return;
    apiCall('state', { sessionId: sessionId, deviceToken: deviceToken }, function (error, row) {
      if (error) {
        if (window.console && console.warn) console.warn('Falha temporária ao sincronizar a TV:', error);
        return;
      }
      if (!row) {
        resetSession();
        return;
      }
      if (row.status === 'disconnected') {
        resetSession();
        return;
      }
      if (row.status === 'paired') {
        if (ownerHost) ownerHost.textContent = row.owner_display_name || 'Conta conectada';
        var currentMedia = row.current_media;
        var hasMedia = currentMedia && typeof currentMedia === 'object';
        if (hasMedia) {
          var keys = [];
          try { keys = Object.keys(currentMedia); } catch (ignore) {
            for (var key in currentMedia) if (Object.prototype.hasOwnProperty.call(currentMedia, key)) keys.push(key);
          }
          hasMedia = keys.length > 0;
        }
        if (hasMedia) renderMedia(currentMedia, row.media_version);
        else if (!isVisible(player)) {
          if (connectedTitle) connectedTitle.textContent = 'Conectado à sua conta';
          if (connectedCopy) connectedCopy.textContent = 'Agora escolha um vídeo ou filme no celular e toque no ícone de transmissão.';
          show('connected');
        }
      }
    });
  }

  function boot() {
    sessionId = safeSessionGet(SESSION_ID_KEY);
    deviceToken = safeSessionGet(DEVICE_TOKEN_KEY);
    if (!sessionId || !deviceToken) createSession();
    else {
      show('loading');
      poll();
    }

    if (pollTimer) window.clearInterval(pollTimer);
    pollTimer = window.setInterval(poll, POLL_MS);
    if (document.addEventListener) {
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) poll();
      }, false);
    }
  }

  try { boot(); }
  catch (error) {
    if (window.console && console.error) console.error(error);
    show('pairing');
    setStatus('Não foi possível iniciar a conexão. Atualize a página.', 'error');
  }
})();

'use strict';

const crypto = require('crypto');

const SUPABASE_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const DEVICE_TOKEN = /^[a-f0-9]{64}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseCookies(req) {
  const out = Object.create(null);
  const raw = String(req.headers.cookie || '');
  raw.split(';').forEach(part => {
    const index = part.indexOf('=');
    if (index < 0) return;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!key) return;
    try { out[key] = decodeURIComponent(value); }
    catch (_) { out[key] = value; }
  });
  return out;
}

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(String(value || ''))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

async function supabaseRpc(name, payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload || {})
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; }
  catch (_) { data = null; }

  if (!response.ok) {
    const message = data && (data.message || data.error_description || data.hint)
      ? String(data.message || data.error_description || data.hint)
      : 'tv_rpc_failed';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return Array.isArray(data) ? (data[0] || null) : data;
}

async function createSession() {
  const deviceToken = crypto.randomBytes(32).toString('hex');
  const row = await supabaseRpc('tv_create_session', { p_device_token: deviceToken });
  if (!row || !row.session_id || !row.pairing_code) throw new Error('tv_session_not_created');
  return {
    sessionId: String(row.session_id),
    deviceToken,
    pairingCode: String(row.pairing_code),
    state: {
      status: 'waiting',
      current_media: {},
      media_version: 0,
      owner_display_name: ''
    }
  };
}

async function loadState(sessionId, deviceToken) {
  if (!UUID.test(sessionId) || !DEVICE_TOKEN.test(deviceToken)) return null;
  return supabaseRpc('tv_receiver_state', {
    p_session_id: sessionId,
    p_device_token: deviceToken
  });
}

function driveInfo(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (host !== 'drive.google.com' && host !== 'drive.usercontent.google.com') return null;
    const match = url.pathname.match(/\/file\/d\/([^/]+)/i) || url.pathname.match(/\/d\/([^/]+)/i);
    const id = (match && match[1]) || url.searchParams.get('id') || '';
    if (!/^[a-z0-9_-]{10,}$/i.test(id)) return null;
    const resourceKey = String(url.searchParams.get('resourcekey') || '').trim();
    return {
      id,
      resourceKey: /^[a-z0-9_-]+$/i.test(resourceKey) ? resourceKey : ''
    };
  } catch (_) {
    return null;
  }
}

function youtubeInfo(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const short = host === 'youtu.be';
    if (!short && !['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com'].includes(host)) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    let id = short ? (parts[0] || '') : '';
    if (!short) {
      if (['embed', 'shorts', 'live', 'v'].includes(parts[0] || '')) id = parts[1] || '';
      else id = url.searchParams.get('v') || '';
    }
    const list = String(url.searchParams.get('list') || '').trim();
    if (id && !/^[a-z0-9_-]{6,20}$/i.test(id)) id = '';
    if (!id && !/^[a-z0-9_-]{6,80}$/i.test(list)) return null;
    return { id, list };
  } catch (_) {
    return null;
  }
}

function vkInfo(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host !== 'vkvideo.ru' && host !== 'vk.com') return null;
    let owner = '';
    let id = '';
    let hash = '';
    if (/\/video_ext\.php$/i.test(url.pathname)) {
      owner = String(url.searchParams.get('oid') || '');
      id = String(url.searchParams.get('id') || '');
      hash = String(url.searchParams.get('hash') || '');
    } else {
      const match = url.pathname.match(/\/video(-?\d+)_(\d+)/i);
      if (match) {
        owner = match[1];
        id = match[2];
      }
    }
    if (!/^-?\d+$/.test(owner) || !/^\d+$/.test(id)) return null;
    if (hash && !/^[a-z0-9_-]+$/i.test(hash)) hash = '';
    return { owner, id, hash };
  } catch (_) {
    return null;
  }
}

function qs(items) {
  return Object.keys(items)
    .filter(key => items[key] !== '' && items[key] != null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(items[key]))}`)
    .join('&');
}

function preferredMediaUrl(media) {
  const driveCandidate = String(media.tvDriveUrl || media.mobileAppDriveUrl || media.appDriveUrl || '').trim();
  if (driveCandidate && driveInfo(driveCandidate)) return driveCandidate;
  return String(media.contentUrl || '').trim();
}

function renderMedia(media) {
  if (!media || typeof media !== 'object') return '';
  const selected = preferredMediaUrl(media);
  const drive = driveInfo(selected);
  const yt = youtubeInfo(selected);
  const vk = vkInfo(selected);
  let player = '';

  if (drive) {
    const direct = `https://drive.usercontent.google.com/download?${qs({
      id: drive.id,
      export: 'download',
      confirm: 't',
      authuser: '0',
      resourcekey: drive.resourceKey
    })}`;
    const preview = `https://drive.google.com/file/d/${encodeURIComponent(drive.id)}/preview?${qs({ autoplay: '1', resourcekey: drive.resourceKey })}`;
    player = `<video id="legacyTvVideo" controls autoplay preload="auto" src="${escapeHtml(direct)}" style="width:100%;height:100%;background:#000" onerror="this.style.display='none';document.getElementById('legacyDriveFallback').style.display='block';"></video>` +
      `<iframe id="legacyDriveFallback" src="${escapeHtml(preview)}" allow="autoplay; fullscreen" allowfullscreen frameborder="0" style="display:none;width:100%;height:100%;border:0;background:#000"></iframe>`;
  } else if (yt) {
    const path = yt.id ? `embed/${encodeURIComponent(yt.id)}` : 'embed/videoseries';
    const src = `https://www.youtube-nocookie.com/${path}?${qs({ autoplay: '1', controls: '1', rel: '0', list: yt.list })}`;
    player = `<iframe src="${escapeHtml(src)}" allow="autoplay; fullscreen" allowfullscreen frameborder="0"></iframe>`;
  } else if (vk) {
    const src = `https://vk.com/video_ext.php?${qs({ oid: vk.owner, id: vk.id, autoplay: '1', hd: '2', hash: vk.hash })}`;
    player = `<iframe src="${escapeHtml(src)}" allow="autoplay; fullscreen" allowfullscreen frameborder="0"></iframe>`;
  } else if (/^https?:\/\//i.test(selected) && /\.(?:mp4|m4v|webm)(?:$|[?#])/i.test(selected)) {
    player = `<video controls autoplay preload="auto" src="${escapeHtml(selected)}"></video>`;
  }

  if (!player) return '';

  const title = escapeHtml(media.title || 'Billie Eilish TV');
  const meta = [media.year, media.duration].filter(Boolean).map(escapeHtml).join(' • ');
  return `
    <div class="tv-card-inner" id="receiverPlayer">
      <div class="tv-player-wrap" id="receiverPlayerHost">${player}</div>
      <div class="tv-now-playing">
        <div class="tv-now-playing-copy">
          <strong class="tv-now-playing-title">${title}</strong>
          <span class="tv-now-playing-meta">${meta}</span>
        </div>
        <span class="tv-receiver-badge"><span class="pulse"></span>Conectado ao celular</span>
      </div>
    </div>`;
}

function codeMarkup(code) {
  return String(code || '').split('').map(char => `<span>${escapeHtml(char)}</span>`).join('');
}

function baseHtml({ body, refreshSeconds = 0, playing = false, mediaVersion = 0 }) {
  const refresh = refreshSeconds > 0
    ? `<meta http-equiv="refresh" content="${refreshSeconds};url=/tv">`
    : '';

  const poll = playing ? `
<script type="text/javascript">
(function(){
  var version=${Number(mediaVersion) || 0};
  function poll(){
    var x;
    try{x=new XMLHttpRequest();}catch(e){setTimeout(poll,5000);return;}
    try{
      x.open('GET','/api/tv-page-state?v='+new Date().getTime(),true);
      x.onreadystatechange=function(){
        if(x.readyState!==4)return;
        if(x.status>=200&&x.status<300){
          try{var d=JSON.parse(x.responseText||'{}');if(d&&Number(d.media_version)!==version){location.reload();return;}}catch(e){}
        }
        setTimeout(poll,4000);
      };
      x.send(null);
    }catch(e){setTimeout(poll,5000);}
  }
  setTimeout(poll,4000);
})();
</script>` : '';

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="theme-color" content="#020409">
  ${refresh}
  <title>Conectar Smart TV — Billie Eilish TV</title>
  <link rel="icon" href="/assets/icons/favicon-home-pc.ico">
  <link rel="stylesheet" href="/assets/css/tv-pairing.css?rev=20260820-tv-fullscreen-v1">
</head>
<body class="tv-receiver legacy-tv${playing ? ' is-playing' : ''}">
  <main class="tv-shell">
    <div class="tv-content">
      <header class="tv-topbar">
        <a class="tv-brand" href="/" aria-label="Billie Eilish TV"><img src="/assets/images/brand/logo-tv.png?v=20260820-tv-legacy-v3" alt="Billie Eilish TV"></a>
        <a class="tv-back" href="/">Sair</a>
      </header>
      <section class="tv-main">
        <article class="tv-card tv-receiver-card${playing ? ' is-playing' : ''}">
          ${body}
        </article>
      </section>
    </div>
  </main>${poll}
</body>
</html>`;
}

function pairingBody(code, connectUrl) {
  return `
    <div class="tv-card-inner" id="receiverPairing">
      <span class="tv-eyebrow"><span class="tv-dot"></span>Smart TV</span>
      <h1>Conecte seu celular</h1>
      <p>Escaneie o QR Code com a câmera do celular. Você entra na sua conta e a TV fica pronta para receber os vídeos do site.</p>
      <div class="tv-pair-grid">
        <div class="tv-qr"><img src="/api/tv-qr?url=${encodeURIComponent(connectUrl)}&format=png" alt="QR Code para conectar esta TV"></div>
        <div class="tv-code-panel">
          <span class="tv-code-label">Seu código</span>
          <div class="tv-code" aria-label="Código da TV">${codeMarkup(code)}</div>
          <div class="tv-note"><span>1.</span><span>Escaneie o QR Code.<br><strong>2.</strong> Entre na sua conta.<br><strong>3.</strong> Abra um vídeo ou filme e toque no ícone de transmissão.</span></div>
          <span class="tv-help">O código expira em 5 minutos se não for usado.</span>
        </div>
      </div>
      <div class="tv-status"><span class="pulse"></span><span>Aguardando conexão do celular…</span></div>
    </div>`;
}

function connectedBody(owner) {
  return `
    <div class="tv-card-inner" id="receiverConnected">
      <span class="tv-eyebrow"><span class="tv-dot"></span>TV conectada</span>
      <h1>Conectado à sua conta</h1>
      <p>Agora escolha um vídeo ou filme no celular e toque no ícone de transmissão.</p>
      <div class="tv-status connected"><span class="pulse"></span><span>${escapeHtml(owner || 'Conta conectada')}</span></div>
    </div>`;
}

function errorBody() {
  return `
    <div class="tv-card-inner">
      <span class="tv-eyebrow"><span class="tv-dot"></span>Smart TV</span>
      <h1>Não foi possível conectar</h1>
      <p>Atualize a página para tentar novamente.</p>
      <div class="tv-status error"><span class="pulse"></span><span>Falha ao preparar a conexão.</span></div>
    </div>`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const cookies = parseCookies(req);
  let sessionId = String(cookies.be_tv_sid || '');
  let deviceToken = String(cookies.be_tv_token || '');

  try {
    let state = await loadState(sessionId, deviceToken);
    let pairingCode = String(cookies.be_tv_code || '');

    if (!state || state.status === 'disconnected') {
      const created = await createSession();
      sessionId = created.sessionId;
      deviceToken = created.deviceToken;
      pairingCode = created.pairingCode;
      state = created.state;
      res.setHeader('Set-Cookie', [
        cookie('be_tv_sid', sessionId, 60 * 60 * 24 * 30),
        cookie('be_tv_token', deviceToken, 60 * 60 * 24 * 30),
        cookie('be_tv_code', pairingCode, 60 * 10)
      ]);
    }

    if (state.status === 'waiting') {
      if (!pairingCode) {
        // A sessão já existia, mas o navegador perdeu apenas o cookie do código.
        // Recria para garantir que a TV sempre mostre um código válido.
        const created = await createSession();
        sessionId = created.sessionId;
        deviceToken = created.deviceToken;
        pairingCode = created.pairingCode;
        state = created.state;
        res.setHeader('Set-Cookie', [
          cookie('be_tv_sid', sessionId, 60 * 60 * 24 * 30),
          cookie('be_tv_token', deviceToken, 60 * 60 * 24 * 30),
          cookie('be_tv_code', pairingCode, 60 * 10)
        ]);
      }
      const connectUrl = `https://billieilishtv.site/connect-tv/?code=${encodeURIComponent(pairingCode)}`;
      const html = baseHtml({ body: pairingBody(pairingCode, connectUrl), refreshSeconds: 3 });
      return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(html);
    }

    if (state.status === 'paired') {
      const media = state.current_media && typeof state.current_media === 'object' ? state.current_media : {};
      const hasMedia = Object.keys(media).length > 0;
      if (hasMedia) {
        const rendered = renderMedia(media);
        if (rendered) {
          const html = baseHtml({
            body: rendered,
            playing: true,
            mediaVersion: state.media_version
          });
          return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(html);
        }
      }
      const html = baseHtml({ body: connectedBody(state.owner_display_name), refreshSeconds: 3 });
      return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(html);
    }

    const html = baseHtml({ body: errorBody(), refreshSeconds: 5 });
    return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(html);
  } catch (error) {
    console.error('TV legacy page failed:', error);
    const html = baseHtml({ body: errorBody(), refreshSeconds: 5 });
    return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(html);
  }
};

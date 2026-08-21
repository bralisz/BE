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


function isLegacyTvRequest(req) {
  const ua = String((req && req.headers && req.headers['user-agent']) || '').toLowerCase();
  if (!ua) return false;
  if (/netcast|maple|hbbtv|viera|aquos|nettv|inettvbrowser/i.test(ua)) return true;
  const tizen = ua.match(/tizen[\s\/](\d+)(?:\.|\b)/i);
  if (tizen) return Number(tizen[1]) <= 6;
  const webos = ua.match(/(?:web0s|webos)[\s\/](\d+)(?:\.|\b)/i);
  if (webos) return Number(webos[1]) <= 6;
  // Samsung Orsay e outros aparelhos pré-Tizen costumam expor apenas SMART-TV.
  if (/smart-tv|smarttv/i.test(ua)) return true;
  const chrome = ua.match(/(?:chrome|chromium)\/(\d+)/i);
  if (chrome && Number(chrome[1]) < 80 && /tizen|webos|web0s|smart-tv|smarttv|hbbtv/i.test(ua)) return true;
  const safari = ua.match(/version\/(\d+)(?:\.\d+)?[^)]*safari/i);
  if (safari && Number(safari[1]) < 10) return true;
  return false;
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

function normalizeSubtitleLocale(value) {
  const raw = String(value || 'pt-br').trim().toLowerCase();
  if (raw === 'en' || raw === 'en-us' || raw.indexOf('en-') === 0) return 'en-us';
  if (raw === 'es' || raw.indexOf('es-') === 0) return 'es';
  if (raw === 'fr' || raw.indexOf('fr-') === 0) return 'fr';
  return 'pt-br';
}

function subtitleUploadedLocale(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw, 'https://billieilishtv.site');
    const path = decodeURIComponent(url.pathname || '').toLowerCase();
    const match = path.match(/(?:^|\/)(pt-br|pt|en-us|en|es|fr)[-_][^/]+\.(?:srt|vtt)$/i);
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
  return uploadedLocale ? uploadedLocale === locale : locale === 'pt-br';
}

function localizedSubtitleUrl(media) {
  const source = media && typeof media === 'object' && !Array.isArray(media) ? media : {};
  const locale = normalizeSubtitleLocale(source.subtitleLocale);
  const aliases = locale === 'pt-br' ? ['pt-br', 'pt'] : locale === 'en-us' ? ['en-us', 'en'] : [locale];
  for (const map of [source.subtitleTracks, source.subtitleUrls, source.subtitles]) {
    if (!map || typeof map !== 'object' || Array.isArray(map)) continue;
    for (const key of aliases) {
      const value = map[key];
      if (typeof value === 'string' && value.trim() && subtitleMatchesLocale(value, locale)) return value.trim();
      if (value && typeof value === 'object') {
        const nested = String(value.url || value.subtitleUrl || '').trim();
        if (nested && subtitleMatchesLocale(nested, locale)) return nested;
      }
    }
  }
  const translations = source.translations;
  if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
    for (const key of aliases) {
      const translated = translations[key];
      const nested = translated && typeof translated === 'object' ? String(translated.subtitleUrl || '').trim() : '';
      if (nested && subtitleMatchesLocale(nested, locale)) return nested;
    }
  }
  const fallback = String(source.subtitleUrl || '').trim();
  return fallback && subtitleMatchesLocale(fallback, locale) ? fallback : '';
}

function mediaStateKey(media) {
  const source = media && typeof media === 'object' && !Array.isArray(media) ? media : {};
  const playable = String(source.tvDriveUrl || source.mobileAppDriveUrl || source.appDriveUrl || source.contentUrl || '').trim();
  if (playable) {
    return ['media', playable, source.itemId || '', source.recordId || '', source.title || '', source.subtitleUrl || '', source.subtitleLocale || ''].map(value => String(value || '')).join('|').slice(0, 3000);
  }
  const profile = source.tvProfile && typeof source.tvProfile === 'object' && !Array.isArray(source.tvProfile) ? source.tvProfile : {};
  return ['profile', profile.displayName || '', profile.username || '', profile.avatarUrl || '', profile.bannerUrl || ''].map(value => String(value || '')).join('|').slice(0, 3000);
}

function subtitleClientUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const drive = driveInfo(raw);
  if (drive) return `/api/drive-media?${qs({ id: drive.id, resourcekey: drive.resourceKey })}`;
  try {
    const url = new URL(raw, 'https://billieilishtv.site');
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    // As legendas enviadas pelo Dashboard ficam no bucket movie-subtitles.
    // A TV lê pelo mesmo domínio do site para evitar bloqueios CORS em
    // navegadores antigos de Smart TV.
    if (url.hostname.toLowerCase() === 'cxkevnnxibhezvospkce.supabase.co' && url.pathname.indexOf('/storage/v1/object/public/movie-subtitles/') === 0) {
      return `/api/tv-subtitle?${qs({ url: url.href })}`;
    }
    return url.href;
  } catch (_) {
    return '';
  }
}

async function inlinePairingQr(connectUrl) {
  try {
    const QRCode = require('qrcode');
    const png = await QRCode.toBuffer(String(connectUrl || ''), {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 360,
      color: { dark: '#000000', light: '#ffffff' }
    });
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch (error) {
    console.error('TV inline QR generation failed:', error);
    return '';
  }
}

function renderMedia(media, legacyPlayback) {
  if (!media || typeof media !== 'object') return '';
  const selected = preferredMediaUrl(media);
  const drive = driveInfo(selected);
  const yt = youtubeInfo(selected);
  const vk = vkInfo(selected);
  const subtitleUrl = subtitleClientUrl(localizedSubtitleUrl(media));
  let player = '';
  let provider = '';

  if (drive) {
    const preview = `https://drive.google.com/file/d/${encodeURIComponent(drive.id)}/preview?${qs({ autoplay: '1', resourcekey: drive.resourceKey })}`;
    provider = 'drive';
    if (legacyPlayback) {
      // Players oficiais do Drive usam JavaScript moderno e costumam falhar em
      // browsers antigos de Smart TV. No modo legado usamos HTML5 nativo e
      // deixamos o Google entregar o arquivo diretamente após um 302 do resolver.
      const resolved = `/api/drive-media?${qs({ id: drive.id, resourcekey: drive.resourceKey, tv: '1' })}`;
      const metadata = `/api/drive-media?${qs({ id: drive.id, resourcekey: drive.resourceKey, metadata: '1' })}`;
      const direct = `https://drive.usercontent.google.com/download?${qs({ id: drive.id, export: 'download', confirm: 't', authuser: '0', resourcekey: drive.resourceKey })}`;
      const alternate = `https://drive.google.com/uc?${qs({ id: drive.id, export: 'download', confirm: 't', resourcekey: drive.resourceKey })}`;
      // Primeiro tenta a origem direta (sem custo de transferência para a Vercel).
      // Se a TV travar, a segunda tentativa usa nosso endpoint em modo TV: o
      // servidor mantém os cookies de confirmação do Google e responde aos Range
      // requests da TV em blocos menores. Formatos pouco seguros para TVs antigas
      // vão direto para o preview/transcode oficial do Drive.
      player = `<video id="legacyTvVideo" controls="controls" autoplay="autoplay" playsinline="playsinline" preload="auto" src="${escapeHtml(direct)}" data-drive-src-1="${escapeHtml(direct)}" data-drive-src-2="${escapeHtml(resolved)}" data-drive-src-3="${escapeHtml(alternate)}" data-drive-meta="${escapeHtml(metadata)}" style="width:100%;height:100%;background:#000"></video>` +
        `<iframe id="legacyDriveFallback" src="about:blank" data-src="${escapeHtml(preview)}" allow="autoplay; fullscreen; encrypted-media" allowfullscreen frameborder="0" style="display:none;width:100%;height:100%;border:0;background:#000"></iframe>`;
    } else {
      // TVs novas continuam usando o player oficial do Google Drive.
      player = `<iframe id="legacyTvFrame" src="${escapeHtml(preview)}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen frameborder="0" style="width:100%;height:100%;border:0;background:#000"></iframe>`;
    }
  } else if (yt) {
    const path = yt.id ? `embed/${encodeURIComponent(yt.id)}` : 'embed/videoseries';
    const src = `https://www.youtube-nocookie.com/${path}?${qs({ autoplay: '1', controls: '1', rel: '0', list: yt.list })}`;
    provider = 'youtube';
    player = `<iframe id="legacyTvFrame" src="${escapeHtml(src)}" allow="autoplay; fullscreen" allowfullscreen frameborder="0"></iframe>`;
  } else if (vk) {
    provider = 'vk';
    const official = `https://vk.com/video_ext.php?${qs({ oid: vk.owner, id: vk.id, autoplay: '1', hd: '2', js_api: '1', hash: vk.hash })}`;
    const officialAlt = `https://vkvideo.ru/video_ext.php?${qs({ oid: vk.owner, id: vk.id, autoplay: '1', hd: '2', js_api: '1', hash: vk.hash })}`;
    if (legacyPlayback) {
      // O iframe atual do VK também depende de APIs modernas. Para TVs antigas,
      // o servidor resolve uma URL MP4 temporária e o <video> nativo reproduz o
      // arquivo. Se a resolução falhar, o player oficial ainda fica como fallback.
      const resolved480 = `/api/vk-media?${qs({ oid: vk.owner, id: vk.id, hash: vk.hash, quality: '480' })}`;
      const resolved360 = `/api/vk-media?${qs({ oid: vk.owner, id: vk.id, hash: vk.hash, quality: '360' })}`;
      const resolved240 = `/api/vk-media?${qs({ oid: vk.owner, id: vk.id, hash: vk.hash, quality: '240' })}`;
      player = `<video id="legacyTvVideo" controls="controls" autoplay="autoplay" playsinline="playsinline" preload="metadata" src="${escapeHtml(resolved480)}" data-vk-src-1="${escapeHtml(resolved480)}" data-vk-src-2="${escapeHtml(resolved360)}" data-vk-src-3="${escapeHtml(resolved240)}" style="width:100%;height:100%;background:#000"></video>` +
        `<iframe id="legacyTvFrame" src="about:blank" data-src="${escapeHtml(official)}" data-fallback-src="${escapeHtml(officialAlt)}" onerror="var u=this.getAttribute('data-fallback-src');if(u&&this.src!==u){this.src=u;}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen frameborder="0" style="display:none;width:100%;height:100%;border:0;background:#000"></iframe>`;
    } else {
      // TVs novas usam diretamente o player oficial incorporado do VK.
      player = `<iframe id="legacyTvFrame" src="${escapeHtml(official)}" data-fallback-src="${escapeHtml(officialAlt)}" onerror="var u=this.getAttribute('data-fallback-src');if(u&&this.src!==u){this.src=u;}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen frameborder="0"></iframe>`;
    }
  } else if (/^https?:\/\//i.test(selected) && /\.(?:mp4|m4v|webm)(?:$|[?#])/i.test(selected)) {
    provider = 'native';
    player = `<video id="legacyTvVideo" controls autoplay playsinline preload="metadata" src="${escapeHtml(selected)}"></video>`;
  }

  if (!player) return '';

  const title = escapeHtml(media.title || 'Billie Eilish TV');
  const meta = [media.year, media.duration].filter(Boolean).map(escapeHtml).join(' • ');
  const subtitleControls = subtitleUrl && (provider === 'native' || provider === 'drive' || provider === 'vk')
    ? `<div class="tv-subtitle-overlay" id="tvSubtitleOverlay" hidden></div>`
    : '';
  const subtitleScript = subtitleUrl && (provider === 'native' || provider === 'drive' || provider === 'vk')
    ? subtitleRuntimeScript(subtitleUrl, provider, Boolean(media.subtitleEnabled))
    : '';

  return `
    <div class="tv-card-inner" id="receiverPlayer">
      <div class="tv-player-wrap" id="receiverPlayerHost" data-provider="${escapeHtml(provider)}">${player}${subtitleControls}<div class="tv-playback-loading" id="tvPlaybackLoading" role="status" aria-label="Carregando vídeo"><span class="tv-playback-spinner" aria-hidden="true"></span></div></div>
      <div class="tv-now-playing">
        <div class="tv-now-playing-copy">
          <strong class="tv-now-playing-title">${title}</strong>
          ${meta ? `<span class="tv-now-playing-meta">${meta}</span>` : ''}
        </div>
        <span class="tv-receiver-badge"><span class="pulse"></span>Conectado ao celular</span>
      </div>
    </div>${playbackLoadingRuntimeScript(provider)}${playbackRemoteRuntimeScript(provider)}${subtitleScript}`;
}
function playbackLoadingRuntimeScript(provider) {
  const safeProvider = JSON.stringify(String(provider || '')).replace(/</g, '\\u003c');
  return `<script type="text/javascript">
(function(){
  var provider=${safeProvider};
  var loader=document.getElementById('tvPlaybackLoading');
  var video=document.getElementById('legacyTvVideo');
  var frame=document.getElementById('legacyTvFrame');
  var driveFrame=document.getElementById('legacyDriveFallback');
  var driveAttempt=1;
  var driveMetadataChecked=false;
  var driveWatchdog=0;
  var vkAttempt=1;
  var vkWatchdog=0;
  var spinnerTimer=0;
  var spinnerAngle=0;

  function show(){if(loader){loader.style.display='block';loader.setAttribute('aria-hidden','false');}}
  function hide(){if(loader){loader.style.display='none';loader.setAttribute('aria-hidden','true');}}
  function clearWatchdog(){if(driveWatchdog){clearTimeout(driveWatchdog);driveWatchdog=0;}}
  function clearVkWatchdog(){if(vkWatchdog){clearTimeout(vkWatchdog);vkWatchdog=0;}}
  function armWatchdog(){
    clearWatchdog();
    if(provider!=='drive'||!video||video.style.display==='none')return;
    driveWatchdog=setTimeout(function(){
      if(!video||video.style.display==='none')return;
      if(video.readyState>=3&&!video.error)return;
      nextDriveSource();
    },9000);
  }
  function armVkWatchdog(){
    clearVkWatchdog();
    if(provider!=='vk'||!video||video.style.display==='none')return;
    vkWatchdog=setTimeout(function(){
      if(!video||video.style.display==='none')return;
      if(video.readyState>=2&&!video.error)return;
      nextVkSource();
    },12000);
  }
  function isLegacySafeDriveMetadata(data){
    if(!data||typeof data!=='object')return true;
    var kind=String(data.kind||'').toLowerCase();
    var type=String(data.contentType||'').toLowerCase().split(';')[0];
    var name=String(data.filename||'').toLowerCase();
    if(kind&&kind!=='video')return false;
    if(type==='video/mp4'||type==='video/x-m4v')return true;
    if(!type||type==='application/octet-stream'||type==='binary/octet-stream'){
      return !name||/\.(?:mp4|m4v)$/i.test(name);
    }
    // WebM/MKV/MOV/HEVC containers are much less reliable on old TV browsers.
    return false;
  }
  function checkDriveMetadata(){
    if(provider!=='drive'||!video||driveMetadataChecked)return;
    driveMetadataChecked=true;
    var endpoint=video.getAttribute('data-drive-meta')||'';
    if(!endpoint||!window.XMLHttpRequest)return;
    try{
      var xhr=new XMLHttpRequest();
      xhr.open('GET',endpoint,true);
      xhr.timeout=6500;
      xhr.onreadystatechange=function(){
        if(xhr.readyState!==4||xhr.status<200||xhr.status>=300)return;
        try{
          var data=JSON.parse(xhr.responseText||'{}');
          if(!isLegacySafeDriveMetadata(data))showDriveFallback();
        }catch(e){}
      };
      xhr.send(null);
    }catch(e){}
  }
  function startSpinnerFallback(){
    var ring=loader&&loader.getElementsByTagName('span')[0];
    if(!ring||spinnerTimer)return;
    var style=ring.style;
    var supportsAnimation=('animationName' in style)||('webkitAnimationName' in style);
    if(supportsAnimation)return;
    spinnerTimer=setInterval(function(){
      spinnerAngle=(spinnerAngle+30)%360;
      ring.style.transform='rotate('+spinnerAngle+'deg)';
      ring.style.webkitTransform='rotate('+spinnerAngle+'deg)';
    },90);
  }
  function showDriveFallback(){
    clearWatchdog();
    show();
    if(video){try{video.pause();}catch(e){}video.style.display='none';try{video.removeAttribute('src');video.load();}catch(e){}}
    if(driveFrame){
      driveFrame.style.display='block';
      var target=driveFrame.getAttribute('data-src')||'';
      if(target&&driveFrame.src!==target)driveFrame.src=target;
    }
    window.BETVTVDriveFallbackPending=true;
    if(typeof window.BETVTVDriveFallback==='function')window.BETVTVDriveFallback();
  }
  function nextDriveSource(){
    if(provider!=='drive'||!video){showDriveFallback();return;}
    if(video.style.display==='none')return;
    clearWatchdog();
    driveAttempt++;
    var next=video.getAttribute('data-drive-src-'+driveAttempt)||'';
    if(!next){showDriveFallback();return;}
    show();
    try{
      video.src=next;
      video.load();
      var promise=video.play();
      if(promise&&typeof promise.catch==='function')promise.catch(function(){});
    }catch(e){}
    armWatchdog();
  }
  function showVkFallback(){
    clearVkWatchdog();
    show();
    if(video){try{video.pause();}catch(e){}video.style.display='none';try{video.removeAttribute('src');video.load();}catch(e){}}
    if(frame){
      frame.style.display='block';
      var target=frame.getAttribute('data-src')||'';
      if(target&&frame.src!==target)frame.src=target;
    }
  }
  function nextVkSource(){
    if(provider!=='vk'||!video){showVkFallback();return;}
    if(video.style.display==='none')return;
    clearVkWatchdog();
    vkAttempt++;
    var next=video.getAttribute('data-vk-src-'+vkAttempt)||'';
    if(!next){showVkFallback();return;}
    show();
    try{
      video.src=next;
      video.load();
      var promise=video.play();
      if(promise&&typeof promise.catch==='function')promise.catch(function(){});
    }catch(e){}
    armVkWatchdog();
  }
  function onVideoReady(){clearWatchdog();clearVkWatchdog();hide();}
  function onVideoBusy(){show();if(provider==='drive')armWatchdog();if(provider==='vk')armVkWatchdog();}
  function onVideoError(){if(video&&video.style.display==='none')return;show();if(provider==='drive')nextDriveSource();else if(provider==='vk')nextVkSource();}

  window.BETVTVShowLoader=show;
  window.BETVTVHideLoader=hide;
  window.BETVTVNextDriveSource=nextDriveSource;
  window.BETVTVShowDriveFallback=showDriveFallback;
  window.BETVTVNextVkSource=nextVkSource;
  window.BETVTVShowVkFallback=showVkFallback;
  startSpinnerFallback();
  show();
  checkDriveMetadata();

  if(video&&video.addEventListener){
    video.addEventListener('loadstart',onVideoBusy,false);
    video.addEventListener('waiting',onVideoBusy,false);
    video.addEventListener('stalled',onVideoBusy,false);
    video.addEventListener('seeking',onVideoBusy,false);
    video.addEventListener('loadeddata',onVideoReady,false);
    video.addEventListener('canplay',onVideoReady,false);
    video.addEventListener('playing',onVideoReady,false);
    video.addEventListener('seeked',onVideoReady,false);
    video.addEventListener('error',onVideoError,false);
    if(provider==='drive')armWatchdog();
    if(provider==='vk')armVkWatchdog();
    if(video.readyState>=3)hide();
  }
  function frameLoaded(target){
    if(!target)return;
    var src='';try{src=String(target.getAttribute('src')||target.src||'');}catch(e){}
    if(target.style&&target.style.display==='none')return;
    if(!src||src==='about:blank')return;
    hide();
  }
  if(frame&&frame.addEventListener)frame.addEventListener('load',function(){frameLoaded(frame);},false);
  if(driveFrame&&driveFrame.addEventListener)driveFrame.addEventListener('load',function(){frameLoaded(driveFrame);},false);
})();
</script>`;
}

function playbackRemoteRuntimeScript(provider) {
  const safeProvider = JSON.stringify(String(provider || '')).replace(/</g, '\\u003c');
  return `<script type="text/javascript">
(function(){
  var provider=${safeProvider};
  var video=document.getElementById('legacyTvVideo');
  var frame=document.getElementById('legacyTvFrame');
  var vkPlayer=null;
  var vkReady=false;
  var pending=[];

  function visibleVideo(){return !!(video&&(!video.style||video.style.display!=='none'));}
  function asNumber(value,fallback){var n=Number(value);return isNaN(n)?fallback:n;}
  function nativeCommand(action,value){
    if(!visibleVideo())return false;
    try{
      if(action==='pause'){video.pause();return true;}
      if(action==='play'){var p=video.play();if(p&&typeof p.catch==='function')p.catch(function(){});return true;}
      if(action==='seek_relative'){
        var next=Math.max(0,(Number(video.currentTime)||0)+asNumber(value,0));
        if(isFinite(Number(video.duration))&&Number(video.duration)>0)next=Math.min(next,Number(video.duration));
        video.currentTime=next;return true;
      }
    }catch(e){}
    return false;
  }
  function resolveVkTime(callback){
    if(!vkPlayer||typeof vkPlayer.getCurrentTime!=='function'){callback(0);return;}
    try{
      var value=vkPlayer.getCurrentTime();
      if(value&&typeof value.then==='function'){
        value.then(function(next){callback(asNumber(next,0));},function(){callback(0);});
      }else callback(asNumber(value,0));
    }catch(e){callback(0);}
  }
  function vkCommand(action,value){
    if(!vkReady||!vkPlayer)return false;
    try{
      if(action==='pause'&&typeof vkPlayer.pause==='function'){vkPlayer.pause();return true;}
      if(action==='play'&&typeof vkPlayer.play==='function'){vkPlayer.play();return true;}
      if(action==='seek_relative'&&typeof vkPlayer.seek==='function'){
        resolveVkTime(function(time){try{vkPlayer.seek(Math.max(0,time+asNumber(value,0)));}catch(e){}});
        return true;
      }
    }catch(e){}
    return false;
  }
  function apply(action,value){
    action=String(action||'');
    if(!action)return false;
    if(nativeCommand(action,value))return true;
    if(provider==='vk'){
      if(vkCommand(action,value))return true;
      pending.push({action:action,value:value});
      bindVk(0);
      return true;
    }
    // O preview oficial do Google Drive não expõe uma API pública de
    // play/pause/seek. Em TVs antigas o Drive usa o <video> nativo acima,
    // onde os controles remotos funcionam normalmente.
    return false;
  }
  function flush(){
    if(!vkReady||!pending.length)return;
    var copy=pending.slice();pending.length=0;
    for(var i=0;i<copy.length;i++)vkCommand(copy[i].action,copy[i].value);
  }
  function bindVk(attempt){
    if(provider!=='vk'||!frame||vkReady)return;
    if(window.VK&&typeof window.VK.VideoPlayer==='function'){
      try{vkPlayer=window.VK.VideoPlayer(frame);vkReady=true;window.BETVTVVKPlayer=vkPlayer;flush();return;}catch(e){}
    }
    if(attempt>15)return;
    setTimeout(function(){bindVk(attempt+1);},350);
  }
  function ensureVkApi(){
    if(provider!=='vk'||!frame)return;
    if(window.VK&&typeof window.VK.VideoPlayer==='function'){bindVk(0);return;}
    var existing=document.getElementById('betvVkVideoApi');
    if(existing){bindVk(0);return;}
    var script=document.createElement('script');script.id='betvVkVideoApi';script.src='https://vk.com/js/api/videoplayer.js';script.async=true;script.onload=function(){bindVk(0);};document.getElementsByTagName('head')[0].appendChild(script);
  }
  window.BETVTVRemote=function(action,value){return apply(action,value);};
  ensureVkApi();
})();
</script>`;
}

function subtitleRuntimeScript(subtitleUrl, provider, initialEnabled) {
  const safeUrl = JSON.stringify(String(subtitleUrl || '')).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  const safeProvider = JSON.stringify(String(provider || '')).replace(/</g, '\\u003c');
  const safeInitialEnabled = initialEnabled ? 'true' : 'false';
  return `<script type="text/javascript">
(function(){
  var subtitleUrl=${safeUrl};
  var provider=${safeProvider};
  var button=null;
  var overlay=document.getElementById('tvSubtitleOverlay');
  var video=document.getElementById('legacyTvVideo');
  var frame=document.getElementById('legacyTvFrame');
  var cues=[];
  var enabled=${safeInitialEnabled};
  var vkPlayer=null;
  var vkReady=false;
  var vkTime=0;
  var vkTimePending=false;
  var driveFallback=!!window.BETVTVDriveFallbackPending;
  var driveFallbackBase=0;
  var driveFallbackStartedAt=driveFallback?new Date().getTime():0;
  var timer=0;

  function entities(text){
    return String(text||'').replace(/&nbsp;/gi,' ').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&amp;/gi,'&');
  }
  function seconds(value){
    var raw=String(value||'').replace(',','.').replace(/^\\s+|\\s+$/g,'');
    var parts=raw.split(':');
    if(parts.length<2||parts.length>3)return NaN;
    var sec=parseFloat(parts.pop()),min=parseFloat(parts.pop()),hour=parts.length?parseFloat(parts.pop()):0;
    if(isNaN(sec)||isNaN(min)||isNaN(hour))return NaN;
    return hour*3600+min*60+sec;
  }
  function parse(text){
    var source=String(text||'').replace(/^\\uFEFF/,'').replace(/\\r\\n?/g,'\\n').replace(/^\\s+|\\s+$/g,'');
    var blocks=source.split(/\\n{2,}/),out=[];
    for(var i=0;i<blocks.length;i++){
      var lines=blocks[i].split('\\n'),timeIndex=-1;
      for(var j=0;j<lines.length;j++){if(lines[j].indexOf('-->')>=0){timeIndex=j;break;}}
      if(timeIndex<0)continue;
      var match=lines[timeIndex].match(/^\\s*([^\\s]+)\\s+-->\\s+([^\\s]+)(?:\\s+.*)?$/);
      if(!match)continue;
      var start=seconds(match[1]),end=seconds(match[2]);
      if(isNaN(start)||isNaN(end)||end<=start)continue;
      var body=lines.slice(timeIndex+1).join('\\n').replace(/<br\\s*\\/?\\s*>/gi,'\\n').replace(/<[^>]+>/g,'');
      body=entities(body).replace(/^\\s+|\\s+$/g,'');
      if(body)out.push({start:start,end:end,text:body});
    }
    return out;
  }
  function cueAt(time){
    var t=Number(time); if(isNaN(t))return '';
    for(var i=cues.length-1;i>=0;i--){if(cues[i].start<=t)return t<=cues[i].end?cues[i].text:'';}
    return '';
  }
  function show(text){
    if(!overlay)return;
    var value=enabled?String(text||''):'';
    if(overlay.textContent!==value)overlay.textContent=value;
    overlay.hidden=!value;
  }
  function enableDriveFallback(){
    if(provider!=='drive')return;
    try{driveFallbackBase=Number(video&&video.currentTime)||driveFallbackBase||0;}catch(e){}
    driveFallback=true;
    driveFallbackStartedAt=new Date().getTime();
  }
  function captureVkTime(value){
    if(value&&typeof value.then==='function'){
      if(vkTimePending)return;
      vkTimePending=true;
      try{value.then(function(next){vkTimePending=false;captureVkTime(next);},function(){vkTimePending=false;});}catch(e){vkTimePending=false;}
      return;
    }
    var next=Number(value);
    if(!isNaN(next)&&next>=0)vkTime=next;
  }
  function currentTime(){
    if(provider==='native'&&video)return Number(video.currentTime)||0;
    if(provider==='drive'){
      if(driveFallback){return Math.max(0,driveFallbackBase+((new Date().getTime()-driveFallbackStartedAt)/1000));}
      return Number(video&&video.currentTime)||0;
    }
    if(provider==='vk'&&video&&(!video.style||video.style.display!=='none'))return Number(video.currentTime)||0;
    if(provider==='vk'&&vkReady&&vkPlayer&&typeof vkPlayer.getCurrentTime==='function'){
      try{captureVkTime(vkPlayer.getCurrentTime());}catch(e){}
      return vkTime;
    }
    return 0;
  }
  function tick(){show(cueAt(currentTime()));timer=setTimeout(tick,250);}
  function setEnabled(value){
    enabled=!!value;
    if(button){button.className='tv-subtitle-toggle'+(enabled?' is-active':'');button.setAttribute('aria-pressed',enabled?'true':'false');button.setAttribute('aria-label',enabled?'Desativar legendas':'Ativar legendas');}
    if(!enabled)show('');
  }
  function load(){
    if(!subtitleUrl||!window.XMLHttpRequest)return;
    var x=new XMLHttpRequest();
    try{x.open('GET',subtitleUrl,true);}catch(e){return;}
    x.onreadystatechange=function(){
      if(x.readyState!==4)return;
      if(x.status>=200&&x.status<300){cues=parse(x.responseText||'');if(enabled)show(cueAt(currentTime()));}
    };
    try{x.send(null);}catch(e){}
  }
  function bindVk(attempt){
    if(provider!=='vk'||!frame)return;
    if(window.VK&&typeof window.VK.VideoPlayer==='function'){
      try{
        vkPlayer=window.VK.VideoPlayer(frame);vkReady=true;
        if(vkPlayer&&typeof vkPlayer.on==='function'){
          var events=['inited','started','resumed','timeupdate','seeking','seeked','paused','ended'];
          for(var i=0;i<events.length;i++){
            try{vkPlayer.on(events[i],function(){currentTime();});}catch(ignore){}
          }
        }
        currentTime();return;
      }catch(e){}
    }
    if(attempt>12)return;
    setTimeout(function(){bindVk(attempt+1);},400);
  }
  window.BETVTVSetSubtitles=setEnabled;
  window.BETVTVDriveFallback=enableDriveFallback;
  if(driveFallback)enableDriveFallback();
  if(provider==='vk'){
    var script=document.createElement('script');script.src='https://vk.com/js/api/videoplayer.js';script.async=true;script.onload=function(){bindVk(0);};document.getElementsByTagName('head')[0].appendChild(script);
  }
  load();tick();
})();
</script>`;
}

function codeMarkup(code) {
  return String(code || '').split('').map(char => `<span>${escapeHtml(char)}</span>`).join('');
}

function baseHtml({ body, stateStatus = 'waiting', playing = false, mediaVersion = 0, mediaKey = '', subtitleEnabled = false, remoteNonce = '' }) {
  const initialStatus = JSON.stringify(String(stateStatus || 'waiting'));
  const initialMediaKey = JSON.stringify(String(mediaKey || ''));
  const initialRemoteNonce = JSON.stringify(String(remoteNonce || ''));
  const poll = `
<script type="text/javascript">
(function(){
  var initialStatus=${initialStatus};
  var version=${Number(mediaVersion) || 0};
  var mediaKey=${initialMediaKey};
  var subtitleEnabled=${subtitleEnabled ? 'true' : 'false'};
  var remoteNonce=${initialRemoteNonce};
  var stopped=false;
  function schedule(ms){if(!stopped)setTimeout(poll,ms);}
  function poll(){
    var x;
    var finished=false;
    function finish(ms){if(finished)return;finished=true;schedule(ms);}
    try{x=new XMLHttpRequest();}catch(e){schedule(6000);return;}
    try{
      x.open('GET','/api/tv-page-state?v='+new Date().getTime(),true);
      x.onreadystatechange=function(){
        if(x.readyState!==4)return;
        if(x.status>=200&&x.status<300){
          try{
            var d=JSON.parse(x.responseText||'{}');
            var status=d&&d.status?String(d.status):'';
            var nextVersion=d&&d.media_version!=null?Number(d.media_version):-1;
            var nextMediaKey=d&&d.media_key!=null?String(d.media_key):'';
            var statusChanged=status&&status!=='error'&&status!=='missing'&&status!==initialStatus;
            var mediaChanged=initialStatus==='paired'&&status==='paired'&&nextVersion>=0&&nextVersion!==version&&nextMediaKey!==mediaKey;
            var nextSubtitle=!!(d&&d.subtitle_enabled);
            if(subtitleEnabled===null)subtitleEnabled=nextSubtitle;
            else if(nextSubtitle!==subtitleEnabled){subtitleEnabled=nextSubtitle;if(typeof window.BETVTVSetSubtitles==='function')window.BETVTVSetSubtitles(nextSubtitle);}
            var nextRemoteNonce=d&&d.remote_nonce!=null?String(d.remote_nonce):'';
            if(nextRemoteNonce&&nextRemoteNonce!==remoteNonce){
              remoteNonce=nextRemoteNonce;
              if(typeof window.BETVTVRemote==='function')window.BETVTVRemote(String(d.remote_command||''),Number(d.remote_value)||0);
            }
            if(statusChanged||mediaChanged||status==='disconnected'){
              stopped=true;
              finished=true;
              location.reload();
              return;
            }
            if(nextVersion>=0)version=nextVersion;
            if(nextMediaKey)mediaKey=nextMediaKey;
          }catch(e){}
        }
        finish(4000);
      };
      x.onerror=function(){finish(6000);};
      x.ontimeout=function(){finish(6000);};
      x.timeout=12000;
      x.send(null);
    }catch(e){finish(6000);}
  }
  schedule(4000);
})();
</script>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="theme-color" content="#020409">
  <title>Conectar Smart TV — Billie Eilish TV</title>
  <link rel="icon" href="/assets/icons/favicon-home-pc.ico">
  <link rel="stylesheet" href="/assets/css/tv-pairing.css?rev=20260821-tv-vk-legacy-retry-v3">
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
function pairingBody(code, connectUrl, inlineQr) {
  return `
    <div class="tv-card-inner" id="receiverPairing">
      <h1>Conecte seu celular</h1>
      <p>Escaneie o QR Code com a câmera do celular. Você entra na sua conta e a TV fica pronta para receber os vídeos do site.</p>
      <div class="tv-pair-grid">
        <div class="tv-qr"><img src="${escapeHtml(inlineQr || `/api/tv-qr?code=${encodeURIComponent(code)}&v=2`)}" data-fallback-src="/api/tv-qr?code=${encodeURIComponent(code)}&v=2" onerror="var f=this.getAttribute('data-fallback-src');if(f&&this.src.indexOf(f)<0){this.src=f;}" alt="QR Code para conectar esta TV"></div>
        <div class="tv-code-panel">
          <span class="tv-code-label">Seu código</span>
          <div class="tv-code" aria-label="Código da TV">${codeMarkup(code)}</div>
          <div class="tv-note" aria-label="Como conectar">
            <div class="tv-note-step"><strong>1.</strong><span>Escaneie o QR Code.</span></div>
            <div class="tv-note-step"><strong>2.</strong><span>Entre na sua conta.</span></div>
            <div class="tv-note-step"><strong>3.</strong><span>Abra um vídeo ou filme e toque no ícone de transmissão.</span></div>
          </div>
          <span class="tv-help">O código expira em 5 minutos se não for usado.</span>
        </div>
      </div>
    </div>`;
}
function connectedBody(owner, media) {
  const embedded = media && typeof media === 'object' && !Array.isArray(media) && media.tvProfile && typeof media.tvProfile === 'object' ? media.tvProfile : null;
  const profile = embedded || (owner && typeof owner === 'object' ? owner : { displayName: owner });
  const displayName = escapeHtml(profile.displayName || profile.username || 'Conta conectada');
  const username = String(profile.username || '').trim().replace(/^@+/, '');
  const avatarUrl = String(profile.avatarUrl || '').trim();
  const bannerUrl = String(profile.bannerUrl || '').trim();
  const initial = escapeHtml((String(profile.displayName || username || 'B').trim().charAt(0) || 'B').toUpperCase());
  return `
    <div class="tv-card-inner" id="receiverConnected">
      <h1>Conectado à sua conta</h1>
      <p>Agora escolha um vídeo ou filme no celular e toque no ícone de transmissão.</p>
      <div class="tv-receiver-profile${bannerUrl ? ' has-banner' : ''}">
        ${bannerUrl ? `<img class="tv-receiver-profile-banner" src="${escapeHtml(bannerUrl)}" alt="">` : ''}
        <div class="tv-receiver-profile-shade"></div>
        <div class="tv-receiver-profile-avatar">${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="">` : initial}</div>
        <div class="tv-receiver-profile-copy">
          <strong>${displayName}</strong>
          ${username ? `<span>@${escapeHtml(username)}</span>` : ''}
        </div>
      </div>
    </div>`;
}

function errorBody() {
  return `
    <div class="tv-card-inner">
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
      const inlineQr = await inlinePairingQr(connectUrl);
      const html = baseHtml({ body: pairingBody(pairingCode, connectUrl, inlineQr), stateStatus: 'waiting', mediaVersion: state.media_version, mediaKey: mediaStateKey(state.current_media) });
      return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(html);
    }

    if (state.status === 'paired') {
      const media = state.current_media && typeof state.current_media === 'object' ? state.current_media : {};
      const hasMedia = Object.keys(media).length > 0;
      if (hasMedia) {
        const rendered = renderMedia(media, isLegacyTvRequest(req));
        if (rendered) {
          const html = baseHtml({
            body: rendered,
            stateStatus: 'paired',
            playing: true,
            mediaVersion: state.media_version,
            mediaKey: mediaStateKey(media),
            subtitleEnabled: Boolean(media.subtitleEnabled),
            remoteNonce: media.remoteControl && typeof media.remoteControl === 'object' ? String(media.remoteControl.nonce || '') : ''
          });
          return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(html);
        }
      }
      const html = baseHtml({ body: connectedBody(state.owner_display_name, media), stateStatus: 'paired', mediaVersion: state.media_version, mediaKey: mediaStateKey(media) });
      return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(html);
    }

    const html = baseHtml({ body: errorBody(), stateStatus: 'error' });
    return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(html);
  } catch (error) {
    console.error('TV legacy page failed:', error);
    const html = baseHtml({ body: errorBody(), stateStatus: 'error' });
    return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(html);
  }
};

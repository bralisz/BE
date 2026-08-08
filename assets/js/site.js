;(function(){
  'use strict';
  window.BETVGuestAccess=window.BETVGuestAccess||{
    key:'beGuestAccess',
    isActive:function(){try{return localStorage.getItem(this.key)==='1';}catch(_){return false;}},
    setActive:function(active){try{if(active)localStorage.setItem(this.key,'1');else localStorage.removeItem(this.key);}catch(_){ }return Boolean(active);}
  };
  function cleanPath(value){
    try{return decodeURIComponent(String(value||'/')).replace(/\/+$/,'')||'/';}
    catch(_){return String(value||'/').replace(/\/+$/,'')||'/';}
  }
  function legacyPublicPath(){
    var hash=String(location.hash||'');
    if(!hash||hash.startsWith('#/admin'))return '';
    var raw=hash.replace(/^#\/?/,'');
    if(!raw||raw.indexOf('#')!==-1||/^(?:access_token|refresh_token|error|error_code)=/i.test(raw))return '';
    var parts=raw.split('/').filter(Boolean);
    var name=String(parts[0]||'').toLowerCase();
    if(name==='home')return '/';
    if(name==='login'||name==='entrar')return '/login';
    if(name==='config')return '/config';
    if(['terms','privacy','cookies','dmca','comunidade'].indexOf(name)!==-1)return '/'+name;if(name==='community'||name==='comunidad')return '/comunidade';
    if(name==='suporte'||name==='support')return '/suporte';
    if(['ong','ongs'].indexOf(name)!==-1)return '/ong';
    if(['fas','fãs','fans'].indexOf(name)!==-1)return '/fãs';
    if(['albuns','álbuns','albums'].indexOf(name)!==-1)return '/albuns'+(parts[1]?'/'+encodeURIComponent(parts[1]):'');
    if(name==='billie'||name==='billie-eilish'||name==='quem-e-billie')return '/billie-eilish';
    if(name==='video'&&parts[1])return '/'+encodeURIComponent(parts[1]);
    if((name==='perfil'||name==='profile')&&parts[1])return '/'+String(parts[1]).replace(/^@?/, '@');
    if(['atualizacoes','atualizações','notificacoes','notificações','updates','notifications'].indexOf(name)!==-1){
      return '/atualizacoes'+(parts[1]?'/'+encodeURIComponent(parts[1]):'');
    }
    return '';
  }
  function navigate(path,replace){
    var target=cleanPath(path||'/');
    var url=new URL(location.href);
    url.pathname=target;
    url.hash='';
    var state=Object.assign({},history.state||{},{beRoute:target==='/login'?'login':'public'});
    history[replace?'replaceState':'pushState'](state,'',url.pathname+(url.search||''));
    window.dispatchEvent(new PopStateEvent('popstate',{state:state}));
  }
  window.BETVPublicRoutes={go:function(path){navigate(path,false);},replace:function(path){navigate(path,true);}};
  var legacy=legacyPublicPath();
  if(legacy){
    var url=new URL(location.href);
    url.pathname=legacy;
    url.hash='';
    history.replaceState(Object.assign({},history.state||{},{beRoute:'public'}),'',url.pathname+(url.search||''));
  }
})();

;(function(){
  'use strict';

  var root=document.documentElement;
  var releaseVersion=0;
  var CONFIG_SKELETON_MIN_MS=2000;
  var configBootStartedAt=Number(window.__beConfigBootStartedAt||Date.now());

  function configRouteActive(){
    try{
      var path=String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';
      var hash=String(location.hash||'').toLowerCase();
      return path.toLowerCase()==='/config'||hash==='#config'||hash==='#/config';
    }catch(_){return false;}
  }

  function clearConfigBootTimer(){
    if(!window.__beConfigBootTimer)return;
    window.clearTimeout(window.__beConfigBootTimer);
    window.__beConfigBootTimer=0;
  }

  function forceAtomicConfigLayout(){
    var body=document.body;
    var profile=document.getElementById('profilePage');
    var settings=document.getElementById('settingsPage');
    if(profile){
      profile.hidden=true;
      profile.setAttribute('hidden','');
      profile.setAttribute('aria-hidden','true');
    }
    if(settings){
      settings.hidden=false;
      settings.removeAttribute('hidden');
      settings.setAttribute('aria-hidden','false');
    }
    if(body){
      body.classList.remove('profile-page-active','login-mode','support-page-active','notification-page-active','billie-page-active','donate-page-active','fans-page-active','album-page-active','detail-page-active','section-catalog-active');
      body.classList.add('settings-page-active');
    }
  }

  function revealConfigPage(){
    clearConfigBootTimer();
    forceAtomicConfigLayout();
    var loading=document.getElementById('authLoading');
    if(loading)loading.hidden=true;
    root.classList.remove('config-route-boot','site-loading-active');
    if(document.body)document.body.classList.remove('site-loading-active');
  }

  function afterTwoFrames(){
    return new Promise(function(resolve){
      window.requestAnimationFrame(function(){
        window.requestAnimationFrame(resolve);
      });
    });
  }

  function waitForConfigMarkup(container){
    if(!container)return Promise.resolve();
    if(container.dataset&&container.dataset.renderReady==='true'&&container.querySelector('#settingsPageBody')&&container.querySelector('#settingsPageBody').children.length)return Promise.resolve();
    return new Promise(function(resolve){
      var started=Date.now();
      (function inspect(){
        var body=container.querySelector&&container.querySelector('#settingsPageBody');
        if((container.dataset&&container.dataset.renderReady==='true')||body&&body.children.length){resolve();return;}
        if(Date.now()-started>=3500){resolve();return;}
        window.setTimeout(inspect,32);
      })();
    });
  }

  function waitForConfigImages(container){
    if(!container||!container.querySelectorAll)return Promise.resolve();
    var images=Array.prototype.slice.call(container.querySelectorAll('img'));
    if(!images.length)return Promise.resolve();

    return Promise.allSettled(images.map(function(image){
      if(image.complete)return Promise.resolve();
      return new Promise(function(resolve){
        var settled=false;
        function finish(){
          if(settled)return;
          settled=true;
          image.removeEventListener('load',finish);
          image.removeEventListener('error',finish);
          resolve();
        }
        image.addEventListener('load',finish,{once:true});
        image.addEventListener('error',finish,{once:true});
        window.setTimeout(finish,1500);
      });
    }));
  }

  function waitForConfigFonts(){
    if(!document.fonts||!document.fonts.ready)return Promise.resolve();
    return Promise.race([
      Promise.resolve(document.fonts.ready).catch(function(){}),
      new Promise(function(resolve){window.setTimeout(resolve,900);})
    ]);
  }

  window.BETVReleaseConfigPaint=function BETVReleaseConfigPaint(options){
    var settings=options&&typeof options==='object'?options:{};
    var version=++releaseVersion;

    if(!root.classList.contains('config-route-boot'))return Promise.resolve();
    if(settings.immediate||!configRouteActive()){
      revealConfigPage();
      return Promise.resolve();
    }

    var container=settings.container||document.getElementById('settingsPage');
    var readiness=waitForConfigMarkup(container).then(function(){
      forceAtomicConfigLayout();
      return Promise.all([waitForConfigImages(container),waitForConfigFonts()]);
    });
    var timeout=new Promise(function(resolve){window.setTimeout(resolve,4000);});
    var elapsed=Math.max(0,Date.now()-configBootStartedAt);
    var minimumDelay=new Promise(function(resolve){window.setTimeout(resolve,Math.max(0,CONFIG_SKELETON_MIN_MS-elapsed));});

    return Promise.all([Promise.race([readiness,timeout]),minimumDelay])
      .then(function(){forceAtomicConfigLayout();return afterTwoFrames();})
      .catch(function(){})
      .finally(function(){
        if(version===releaseVersion)revealConfigPage();
      });
  };
})();

(() => {
  'use strict';
  function encodeBase64Url(value) {
    try {
      return btoa(unescape(encodeURIComponent(String(value || ''))))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    } catch (_) { return ''; }
  }
  window.beMediaUrl = function beMediaUrl(value) {
    const raw = String(value || '').trim();
    if (!raw || raw === '#') return raw || '#';
    if (/^(?:\/|data:|blob:)/i.test(raw)) return raw;
    if (!/^https:\/\//i.test(raw)) return '#';
    const token = encodeBase64Url(raw);
    return token ? `/api/media?u=${token}` : '#';
  };

  const DEFAULT_AVATAR = '/assets/images/profile/default-avatar.png';
  window.BETV_DEFAULT_AVATAR = DEFAULT_AVATAR;
  window.BETVResolveAvatar = function BETVResolveAvatar(value) {
    const raw = String(value || '').trim();
    if (!raw || raw === '#') return DEFAULT_AVATAR;
    const resolved = window.beMediaUrl ? window.beMediaUrl(raw) : raw;
    return resolved && resolved !== '#' ? resolved : DEFAULT_AVATAR;
  };
  window.BETVApplyAvatar = function BETVApplyAvatar(image, value) {
    if (!image) return DEFAULT_AVATAR;
    const resolved = window.BETVResolveAvatar(value);
    let current = '';
    let target = '';
    try {
      current = image.getAttribute('src') ? new URL(image.getAttribute('src'), location.origin).href : '';
      target = new URL(resolved, location.origin).href;
    } catch (_) {
      current = String(image.getAttribute('src') || '');
      target = resolved;
    }
    if (current !== target) image.setAttribute('src', resolved);
    image.hidden = false;
    image.removeAttribute('hidden');
    image.setAttribute('data-avatar-fallback', DEFAULT_AVATAR);
    return resolved;
  };

  function meaningfulAvatar(value) {
    const raw = String(value || '').trim();
    if (!raw || raw === '#') return '';
    try {
      const resolved = new URL(raw, location.origin);
      const fallback = new URL(DEFAULT_AVATAR, location.origin);
      if (resolved.href === fallback.href) return '';
    } catch (_) {
      if (raw === DEFAULT_AVATAR || raw.endsWith(DEFAULT_AVATAR)) return '';
    }
    return raw;
  }

  function avatarFromEvent(event) {
    const detail = event && event.detail && typeof event.detail === 'object' ? event.detail : {};
    return meaningfulAvatar(detail.avatarUrl || (detail.profile && detail.profile.avatarUrl) || '');
  }

  function currentAvatarAccount() {
    return window.beBackend && window.beBackend.auth ? window.beBackend.auth.currentUser : null;
  }

  function avatarFromAccount(account) {
    if (!account) return '';
    const metadata = account.raw && (account.raw.user_metadata || account.raw.raw_user_meta_data) || {};
    const cached = (() => {
      try { return account.uid ? localStorage.getItem('beSelectedAvatar:' + account.uid) : ''; }
      catch (_) { return ''; }
    })();
    return meaningfulAvatar(
      account.profile && account.profile.avatarUrl ||
      account.photoURL ||
      metadata.profile_avatar_url ||
      cached ||
      ''
    );
  }

  window.BETVReadSelectedAvatar = function BETVReadSelectedAvatar(event) {
    const eventAvatar = avatarFromEvent(event);
    if (eventAvatar) return eventAvatar;
    const accountAvatar = avatarFromAccount(currentAvatarAccount());
    if (accountAvatar) return accountAvatar;
    const source = document.getElementById('publicUserPhoto');
    return meaningfulAvatar(source && !source.hidden ? source.getAttribute('src') : '');
  };

  window.BETVLoadSelectedAvatar = async function BETVLoadSelectedAvatar(event) {
    const eventAvatar = avatarFromEvent(event);
    if (eventAvatar) return eventAvatar;
    try {
      if (window.beBackend && window.beBackend.ready) await window.beBackend.ready;
      const account = currentAvatarAccount();
      if (!account) return '';
      let avatar = avatarFromAccount(account);
      if (avatar) return avatar;
      if (window.beBackend && window.beBackend.profiles && typeof window.beBackend.profiles.ensure === 'function') {
        const profile = await window.beBackend.profiles.ensure(account);
        avatar = meaningfulAvatar(profile && profile.avatarUrl);
        if (avatar) return avatar;
      }
      return avatarFromAccount(currentAvatarAccount());
    } catch (_) {
      return window.BETVReadSelectedAvatar(event);
    }
  };
  document.addEventListener('error', function (event) {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || !image.hasAttribute('data-avatar-fallback')) return;
    const fallback = image.getAttribute('data-avatar-fallback') || DEFAULT_AVATAR;
    if (String(image.getAttribute('src') || '').endsWith(fallback)) return;
    image.setAttribute('src', fallback);
    image.hidden = false;
  }, true);
})();

;
window.BE_SUPABASE_CONFIG = window.BE_SUPABASE_CONFIG || Object.freeze({
  url: 'https://cxkevnnxibhezvospkce.supabase.co',
  publishableKey: 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX',
  requireEmailConfirmation: true,
  oauthAuthorizationPath: '/oauth/consent',
  oauthAuthorizeEndpoint: 'https://cxkevnnxibhezvospkce.supabase.co/auth/v1/oauth/authorize'
});

;

;
(() => {
  'use strict';

  const ADMIN_EMAIL = '';
  const LOCAL_ADMIN_EMAIL = 'admin@local.invalid';
  const DB_KEY = 'be_local_database_v2';
  const LOCAL_SESSION_KEY = 'be_local_session_v2';
  const MODE = hasSupabaseConfig() ? 'supabase' : 'local';
  const listeners = new Set();
  let currentUser = null;
  let accountStatusPromise = null;
  let accountStatusCheckedAt = 0;
  let accountStatusUserId = '';
  let accountStatusCache = { banned: false, reason: '', bannedAt: '' };
  let supabaseClient = null;
  const PROFILE_CACHE_TTL_MS = 15000;
  const PREFERENCE_CACHE_TTL_MS = 10000;
  const profileCache = new Map();
  const profileEnsurePromises = new Map();
  const preferenceCache = new Map();
  const userSyncChannels = new Map();
  let realtimeAuthPromise = null;

  function hasSupabaseConfig() {
    const config = window.BE_SUPABASE_CONFIG || {};
    return Boolean(
      window.supabase &&
      typeof window.supabase.createClient === 'function' &&
      /^https:\/\//i.test(String(config.url || '')) &&
      String(config.publishableKey || '').trim()
    );
  }

  function now() {
    return new Date().toISOString();
  }

  function wait(milliseconds) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
  }

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function backendError(code, message, original) {
    const error = new Error(message);
    error.code = code;
    if (original) error.original = original;
    return error;
  }

  function normalizeUsername(value) {
    return String(value || '').trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9._]/g, '');
  }

  function validUsername(value) {
    return /^[a-z0-9](?:[a-z0-9._]{1,18}[a-z0-9])?$/.test(value) &&
      value.length >= 3 && value.length <= 20 &&
      !value.includes('..') && !value.includes('__') &&
      !value.includes('._') && !value.includes('_.');
  }

  function safeAuthReturnUrl() {
    try {
      const stored = sessionStorage.getItem('beOauthReturn');
      if (stored) {
        const url = new URL(stored, location.origin);
        const configuredPath = String(window.BE_SUPABASE_CONFIG?.oauthAuthorizationPath || '/oauth/consent');
        if (url.origin === location.origin && url.pathname === configuredPath) return url.href;
      }
    } catch (_) {}
    return `${location.origin}/?email_confirmed=1`;
  }

  function oauthRedirectUrl(destination = 'home') {
    // OAuth sempre retorna por uma rota neutra e exclusiva. Não reutilize
    // /login, /config ou a página atual como callback do provedor.
    const url = new URL('/auth/callback', location.origin);
    url.searchParams.set('auth_callback', String(destination || 'home'));
    return url.href;
  }

  function authHashParams() {
    const rawHash = String(location.hash || '').replace(/^#/, '');
    const nestedHashIndex = rawHash.indexOf('#');
    const payload = nestedHashIndex >= 0 ? rawHash.slice(nestedHashIndex + 1) : rawHash;
    return new URLSearchParams(payload);
  }

  function authCallbackDestination() {
    const query = new URLSearchParams(location.search || '');
    const fromQuery = String(query.get('auth_callback') || '').trim().toLowerCase();
    if (fromQuery) return fromQuery;

    const rawHash = String(location.hash || '');
    if (rawHash.startsWith('#/admin')) return 'admin';

    try {
      const stored = String(sessionStorage.getItem('beOAuthDestination') || '').trim().toLowerCase();
      if (stored) return stored;
    } catch (_) {}
    return 'home';
  }

  function normalizeLegacyAuthHash() {
    const rawHash = String(location.hash || '').replace(/^#/, '');
    const nestedHashIndex = rawHash.indexOf('#');
    if (nestedHashIndex < 0) return false;

    const routePart = rawHash.slice(0, nestedHashIndex);
    const payload = rawHash.slice(nestedHashIndex + 1);
    if (!/^(?:access_token|refresh_token|error|error_code)=/i.test(payload)) return false;

    const destination = routePart.startsWith('/admin') ? 'admin' : 'home';
    try { sessionStorage.setItem('beOAuthDestination', destination); } catch (_) {}

    const url = new URL(location.href);
    if (!url.searchParams.get('auth_callback')) url.searchParams.set('auth_callback', destination);
    url.hash = '#' + payload;
    history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
    return true;
  }

  function authCallbackError() {
    const query = new URLSearchParams(location.search || '');
    const hash = authHashParams();
    return query.get('error_description') || hash.get('error_description') ||
      query.get('error') || hash.get('error') || '';
  }

  function cleanAuthCallbackUrl(destination = 'home') {
    const url = new URL(location.href);
    ['code', 'error', 'error_code', 'error_description', 'auth_callback', 'oauth'].forEach(name => {
      url.searchParams.delete(name);
    });
    url.pathname = '/';
    url.hash = destination === 'admin' ? '#/admin/dashboard' : '';
    history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
  }

  function hasAuthCallbackPayload() {
    const query = new URLSearchParams(location.search || '');
    const hash = authHashParams();
    return Boolean(
      query.get('code') || query.get('error') || query.get('error_code') || query.get('auth_callback') ||
      hash.get('access_token') || hash.get('refresh_token') || hash.get('error') || hash.get('error_code')
    );
  }

  function normalizeUser(raw) {
    if (!raw) return null;
    const metadata = raw.user_metadata || raw.raw_user_meta_data || {};
    const appMetadata = raw.app_metadata || {};
    const trustedAdminClaim = appMetadata.role === 'admin' || appMetadata.is_admin === true;
    return {
      uid: raw.id || raw.uid,
      id: raw.id || raw.uid,
      email: raw.email || '',
      displayName: metadata.display_name || metadata.full_name || raw.displayName || raw.display_name || '',
      photoURL: metadata.profile_avatar_url ? String(metadata.profile_avatar_url) : '',
      providerPhotoURL: metadata.avatar_url || raw.photoURL || raw.avatar_url || '',
      emailVerified: Boolean(raw.email_confirmed_at || raw.emailVerified || MODE === 'local'),
      role: trustedAdminClaim || raw.role === 'admin' ? 'admin' : 'member',
      raw
    };
  }

  async function hydratePrivileges(user) {
    if (!user || MODE !== 'supabase' || !supabaseClient) return user;

    // A função RPC é a confirmação principal. A leitura do próprio perfil é um
    // fallback seguro para navegadores que ainda estejam usando o cache antigo
    // do schema do Supabase logo após uma migração.
    let adminCheckFailed = false;
    try {
      const { data: allowed, error } = await supabaseClient.rpc('is_admin');
      if (!error) return { ...user, role: allowed === true ? 'admin' : 'member' };
      adminCheckFailed = true;
    } catch (_) {
      adminCheckFailed = true;
    }

    // Só faz a leitura adicional quando a verificação principal realmente
    // falhar. Usuários comuns não geram duas consultas a cada login.
    if (adminCheckFailed) {
      try {
        const { data: profile, error } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.uid)
          .maybeSingle();
        if (!error) return { ...user, role: profile?.role === 'admin' ? 'admin' : 'member' };
      } catch (_) {}
    }

    // Claims emitidas pelo servidor continuam válidas, mas nunca usamos o
    // endereço de e-mail no JavaScript público para conceder acesso.
    if (user.role === 'admin') return user;

    console.warn('Não foi possível confirmar as permissões administrativas da sessão.');
    return { ...user, role: 'member' };
  }

  async function resolveSupabaseUser(authResult) {
    if (MODE !== 'supabase' || !supabaseClient) return currentUser;

    const immediateUser = authResult?.user || authResult?.session?.user || null;
    if (immediateUser) return hydratePrivileges(normalizeUser(immediateUser));

    // Em alguns navegadores o Supabase conclui o login alguns milissegundos
    // antes de disponibilizar a sessão persistida. Tentamos novamente por um
    // curto período para não devolver o usuário à tela de login por engano.
    const retryDelays = [0, 80, 180, 360, 700];
    for (const retryDelay of retryDelays) {
      if (retryDelay) await wait(retryDelay);

      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) console.warn('Não foi possível recuperar a sessão após o login:', sessionError.message);
      const sessionUser = sessionData?.session?.user || null;
      if (sessionUser) return hydratePrivileges(normalizeUser(sessionUser));

      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      if (userError && userError.name !== 'AuthSessionMissingError') {
        console.warn('Não foi possível recuperar o usuário após o login:', userError.message);
      }
      if (userData?.user) return hydratePrivileges(normalizeUser(userData.user));
    }

    return null;
  }

  function notify() {
    const snapshot = currentUser ? { ...currentUser } : null;
    listeners.forEach(listener => {
      try { listener(snapshot); } catch (error) { console.error('Erro no listener de autenticação:', error); }
    });
  }

  function seedDatabase() {
    const createdAt = now();
    const gallery = {};
    for (let index = 1; index <= 7; index += 1) {
      const id = `avatar-${String(index).padStart(2, '0')}`;
      gallery[id] = {
        id,
        title: `Avatar ${index}`,
        category: 'Padrão',
        imageUrl: `/assets/images/avatars/avatar-${String(index).padStart(2, '0')}.webp`,
        order: index,
        active: true,
        createdAt,
        updatedAt: createdAt
      };
    }
    return {
      version: 2,
      accounts: {},
      collections: {
        featured: {}, sections: {}, contents: {}, videos: {}, movies: {}, series: {},
        shows: {}, news: {}, gallery, users: {}, settings: {}, admin_logs: {}, notifications: {}
      }
    };
  }

  function loadLocalDatabase() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DB_KEY) || 'null');
      if (parsed && parsed.version === 2 && parsed.accounts && parsed.collections) return parsed;
    } catch (error) {
      console.warn('Banco local inválido; um novo será criado.', error);
    }
    const fresh = seedDatabase();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function saveLocalDatabase(database) {
    localStorage.setItem(DB_KEY, JSON.stringify(database));
  }

  function localCollection(database, name) {
    if (!database.collections[name]) database.collections[name] = {};
    return database.collections[name];
  }

  function readLocalSession() {
    try {
      return JSON.parse(sessionStorage.getItem(LOCAL_SESSION_KEY) || localStorage.getItem(LOCAL_SESSION_KEY) || 'null');
    } catch (_) {
      return null;
    }
  }

  function writeLocalSession(user, remember = true) {
    sessionStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    if (remember) localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(LOCAL_SESSION_KEY);
  }

  function clearLocalSession() {
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }

  function bytesToBase64(bytes) {
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  async function hashPassword(password, salt) {
    const value = `${salt}:${password}`;
    if (window.crypto && window.crypto.subtle) {
      const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
      return bytesToBase64(new Uint8Array(digest));
    }
    return btoa(unescape(encodeURIComponent(value)));
  }

  function mapAuthError(error) {
    const message = String(error && error.message || '');
    const code = String(error && (error.code || error.status) || '');
    if (code === 'over_email_send_rate_limit' || /email rate limit|rate limit.*email|too many requests/i.test(message)) {
      return backendError(
        'auth/email-rate-limit',
        'O limite temporário de e-mails do Supabase foi atingido. Aguarde e tente novamente mais tarde ou continue com o Discord.',
        error
      );
    }
    if (/provider is not enabled|unsupported provider/i.test(message)) {
      return backendError('auth/provider-not-enabled', 'O login com Discord ainda não foi ativado no Supabase.', error);
    }
    if (/email not confirmed/i.test(message)) return backendError('auth/email-not-confirmed', 'Confirme seu e-mail antes de entrar.', error);
    if (/user[_ -]?banned|account[_ -]?banned|banned/i.test(`${code} ${message}`)) return backendError('auth/user-banned', 'Esta conta foi banida.', error);
    if (/invalid login credentials/i.test(message)) return backendError('auth/invalid-credential', 'E-mail ou senha incorretos.', error);
    if (/already registered|already been registered|user already/i.test(message)) return backendError('auth/email-already-in-use', 'Este e-mail já possui uma conta.', error);
    if (/password/i.test(message) && /6|weak|short/i.test(message)) return backendError('auth/weak-password', 'Use uma senha com pelo menos 6 caracteres.', error);
    if (/email/i.test(message) && /invalid/i.test(message)) return backendError('auth/invalid-email', 'Digite um e-mail válido.', error);
    if (
      /username already in use|username is already in use|profiles_username|username.*já.*uso/i.test(message) ||
      ((code === '23505' || /duplicate key|unique/i.test(message)) && /username/i.test(message))
    ) return backendError('username-in-use', 'Este nome de usuário já está em uso. Escolha outro.', error);
    return backendError(code || 'backend/error', message || 'Não foi possível concluir a operação.', error);
  }

  function profileFromRow(row) {
    if (!row) return null;
    return {
      uid: row.id,
      id: row.id,
      email: row.email || '',
      displayName: row.display_name || '',
      username: row.username || '',
      bio: row.bio || '',
      avatarUrl: row.avatar_url || '',
      avatarId: row.avatar_id || '',
      bannerUrl: row.banner_url || '',
      bannerId: row.banner_id || '',
      banned: row.banned === true,
      bannedAt: row.banned_at || '',
      banReason: row.ban_reason || '',
      role: row.role || 'member',
      profileComplete: row.profile_complete !== false,
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || '',
      lastLoginAt: row.last_login_at || ''
    };
  }

  function cacheProfile(profile) {
    if (!profile || !profile.uid) return profile;
    profileCache.set(String(profile.uid), { value: clone(profile), cachedAt: Date.now() });
    return profile;
  }

  function readCachedProfile(userId, maxAge = PROFILE_CACHE_TTL_MS) {
    const cached = profileCache.get(String(userId || ''));
    if (!cached || Date.now() - cached.cachedAt > maxAge) return null;
    return clone(cached.value);
  }

  function invalidateProfileCache(userId) {
    profileCache.delete(String(userId || ''));
  }

  function profileToRow(id, data) {
    const row = { id };
    const mappings = {
      email: 'email', displayName: 'display_name', username: 'username', bio: 'bio',
      avatarUrl: 'avatar_url', avatarId: 'avatar_id', bannerUrl: 'banner_url', bannerId: 'banner_id',
      banned: 'banned', bannedAt: 'banned_at', banReason: 'ban_reason', role: 'role',
      profileComplete: 'profile_complete', createdAt: 'created_at',
      updatedAt: 'updated_at', lastLoginAt: 'last_login_at'
    };
    Object.entries(mappings).forEach(([from, to]) => {
      if (Object.prototype.hasOwnProperty.call(data, from)) row[to] = data[from];
    });
    if (Object.prototype.hasOwnProperty.call(row, 'username') && !String(row.username || '').trim()) row.username = null;
    return row;
  }



  const TRANSLATABLE_COLLECTIONS = new Set(['contents','featured','movies','notifications','ongs','sections','series','settings','videos']);
  const TRANSLATION_FUNCTION_NAME = 'translate-content-record';

  function activeLocaleSlug() {
    if (String(location.hash || '').startsWith('#/admin')) return 'pt-br';
    const slug = String(window.BETVLocale?.slug || 'pt-br').toLowerCase();
    return ['en-us','es'].includes(slug) ? slug : 'pt-br';
  }

  function localizeDurationLabel(value, requestedSlug = activeLocaleSlug()) {
    const raw = String(value || '').trim();
    const slug = String(requestedSlug || 'pt-br').toLowerCase();
    if (!raw || slug === 'pt-br') return raw;
    const normalized = raw.toLowerCase().replace(/,/g, ' ');
    const hoursMatch = normalized.match(/(\d+)\s*(?:h|hr|hrs|hora|horas)\b/i);
    const minutesMatch = normalized.match(/(\d+)\s*(?:m|min|mins|minuto|minutos)\b/i);
    if (!hoursMatch && !minutesMatch) return raw;
    const parts = [];
    if (hoursMatch) parts.push(slug === 'en-us' ? `${Number(hoursMatch[1])} hr` : `${Number(hoursMatch[1])} h`);
    if (minutesMatch) parts.push(`${Number(minutesMatch[1])} min`);
    return parts.join(' ');
  }

  function localizeContentRecord(record) {
    if (!record || typeof record !== 'object') return record;
    const slug = activeLocaleSlug();
    if (slug === 'pt-br') return record;
    const translations = record.translations && typeof record.translations === 'object' ? record.translations : {};
    const localized = translations[slug] || translations[slug === 'en-us' ? 'en' : slug] || null;
    const result = localized && typeof localized === 'object' ? { ...record, ...localized } : { ...record };
    ['duration','runtime','videoDuration'].forEach(field => {
      if (result[field]) result[field] = localizeDurationLabel(result[field], slug);
    });
    return result;
  }

  function recordNeedsTranslation(record, slug) {
    if (!record || !record.id || slug === 'pt-br') return false;
    const translations = record.translations && typeof record.translations === 'object' ? record.translations : {};
    const localized = translations[slug];
    return !localized || typeof localized !== 'object';
  }

  async function ensureTranslatedRecords(collection, records) {
    const slug = activeLocaleSlug();
    const values = Array.isArray(records) ? records : [];
    if (slug === 'pt-br' || !TRANSLATABLE_COLLECTIONS.has(String(collection || '')) || !supabaseClient?.functions?.invoke) {
      return values.map(localizeContentRecord);
    }
    const missing = values.filter(record => recordNeedsTranslation(record, slug));
    if (missing.length) {
      try {
        const translatedById = new Map();
        for (let offset = 0; offset < missing.length; offset += 20) {
          const batch = missing.slice(offset, offset + 20);
          const result = await supabaseClient.functions.invoke(TRANSLATION_FUNCTION_NAME, {
            body: { collection: String(collection), ids: batch.map(record => String(record.id)), locales: [slug] }
          });
          if (result?.error || !result?.data || !Array.isArray(result.data.records)) {
            console.warn('Um lote de tradução não foi concluído:', result?.error?.message || 'resposta inválida');
            continue;
          }
          result.data.records.forEach(item => translatedById.set(String(item.id), item.translation || {}));
        }
        values.forEach(record => {
          const translation = translatedById.get(String(record.id));
          if (!translation || typeof translation !== 'object') return;
          if (!record.translations || typeof record.translations !== 'object') record.translations = {};
          record.translations[slug] = translation;
        });
      } catch (error) {
        console.warn('Tradução automática indisponível; mantendo o texto em português:', error?.message || error);
      }
    }
    return values.map(localizeContentRecord);
  }

  function queueRecordTranslation(collection, id) {
    if (!currentUser || currentUser.role !== 'admin' || !supabaseClient?.functions?.invoke) return;
    if (collection !== 'settings' && !TRANSLATABLE_COLLECTIONS.has(String(collection || ''))) return;
    window.setTimeout(() => {
      supabaseClient.functions.invoke(TRANSLATION_FUNCTION_NAME, {
        body: { collection: String(collection), ids: [String(id)], locales: ['en-us','es'], force: true }
      }).then(result => {
        if (result?.error) console.warn('Não foi possível atualizar as traduções automáticas:', result.error.message || result.error);
      }).catch(error => console.warn('Não foi possível atualizar as traduções automáticas:', error?.message || error));
    }, 0);
  }

  function sortAndFilter(items, options = {}) {
    let result = items.slice();
    const filters = Array.isArray(options.filters) ? options.filters : [];
    filters.forEach(filter => {
      if (!filter || filter.op !== 'eq') return;
      result = result.filter(item => item[filter.field] === filter.value);
    });
    if (options.orderBy) {
      const direction = options.direction === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        const av = a[options.orderBy];
        const bv = b[options.orderBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' || typeof bv === 'number') return (Number(av || 0) - Number(bv || 0)) * direction;
        return String(av).localeCompare(String(bv), 'pt-BR', { numeric: true }) * direction;
      });
    }
    if (Number.isFinite(options.limit)) result = result.slice(0, Math.max(0, options.limit));
    return result;
  }

  const localData = {
    async list(name, options = {}) {
      const database = loadLocalDatabase();
      const values = Object.values(localCollection(database, name)).map(clone);
      return sortAndFilter(values, options);
    },
    async get(name, id) {
      const database = loadLocalDatabase();
      return clone(localCollection(database, name)[id] || null);
    },
    async set(name, id, data, options = {}) {
      const database = loadLocalDatabase();
      const collection = localCollection(database, name);
      const previous = collection[id] || {};
      const value = options.merge === false ? { ...data } : { ...previous, ...data };
      value.id = id;
      if (!value.createdAt) value.createdAt = previous.createdAt || now();
      value.updatedAt = data.updatedAt || now();
      collection[id] = value;
      saveLocalDatabase(database);
      return clone(value);
    },
    async add(name, data) {
      const id = uid();
      const value = await this.set(name, id, { ...data, id, createdAt: data.createdAt || now(), updatedAt: data.updatedAt || now() }, { merge: false });
      return value;
    },
    async remove(name, id) {
      const database = loadLocalDatabase();
      delete localCollection(database, name)[id];
      saveLocalDatabase(database);
    },
    async count(name) {
      return (await this.list(name)).length;
    }
  };

  function usesProtectedAdminData() {
    const hash = String(location.hash || '').toLowerCase();
    const callback = String(new URLSearchParams(location.search || '').get('auth_callback') || '').toLowerCase();
    return hash.startsWith('#/admin') || callback === 'admin';
  }

  async function readPublicData(name, id = '') {
    const params = new URLSearchParams({ name: String(name || '') });
    if (id) params.set('id', String(id));
    const response = await fetch(`/api/public-data?${params.toString()}`, {
      method: 'GET', credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw backendError('public_data_unavailable', 'Conteúdo público indisponível.');
    return response.json();
  }

  const supabaseData = {
    async list(name, options = {}) {
      try {
        let items = [];
        if (!usesProtectedAdminData() && name !== 'users' && name !== 'admin_logs') {
          const publicItems = await readPublicData(name);
          const translatedItems = await ensureTranslatedRecords(name, Array.isArray(publicItems) ? publicItems : []);
          return sortAndFilter(translatedItems, options);
        }
        if (name === 'users') {
          const { data, error } = await supabaseClient.from('profiles').select('*');
          if (error) throw error;
          items = (data || []).map(profileFromRow);
        } else if (name === 'settings') {
          const { data, error } = await supabaseClient.from('site_settings').select('*');
          if (error) throw error;
          items = (data || []).map(row => ({ id: row.id, ...(row.data || {}), createdAt: row.created_at, updatedAt: row.updated_at }));
        } else if (name === 'admin_logs') {
          const { data, error } = await supabaseClient.from('admin_logs').select('*');
          if (error) throw error;
          items = (data || []).map(row => ({
            id: row.id, action: row.action, type: row.type, itemId: row.item_id,
            summary: row.summary, adminUid: row.admin_uid, createdAt: row.created_at
          }));
        } else {
          const { data, error } = await supabaseClient.from('content_items').select('id,data,created_at,updated_at').eq('collection', name);
          if (error) throw error;
          items = (data || []).map(row => ({ id: row.id, ...(row.data || {}), createdAt: row.data?.createdAt || row.created_at, updatedAt: row.data?.updatedAt || row.updated_at }));
        }
        items = await ensureTranslatedRecords(name, items);
        return sortAndFilter(items, options);
      } catch (error) {
        throw mapAuthError(error);
      }
    },
    async get(name, id) {
      try {
        if (!usesProtectedAdminData() && name !== 'users' && name !== 'admin_logs') {
          const publicValue = await readPublicData(name, id);
          if (!publicValue) return null;
          const translated = await ensureTranslatedRecords(name, [publicValue]);
          return translated[0] || localizeContentRecord(publicValue);
        }
        if (name === 'users') {
          const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', id).maybeSingle();
          if (error) throw error;
          return profileFromRow(data);
        }
        if (name === 'settings') {
          const { data, error } = await supabaseClient.from('site_settings').select('*').eq('id', id).maybeSingle();
          if (error) throw error;
          const value = data ? { id: data.id, ...(data.data || {}), createdAt: data.created_at, updatedAt: data.updated_at } : null;
          if (!value) return null;
          const translated = await ensureTranslatedRecords(name, [value]);
          return translated[0] || localizeContentRecord(value);
        }
        if (name === 'admin_logs') {
          const { data, error } = await supabaseClient.from('admin_logs').select('*').eq('id', id).maybeSingle();
          if (error) throw error;
          return data ? { id: data.id, action: data.action, type: data.type, itemId: data.item_id, summary: data.summary, adminUid: data.admin_uid, createdAt: data.created_at } : null;
        }
        const { data, error } = await supabaseClient.from('content_items').select('id,data,created_at,updated_at').eq('collection', name).eq('id', id).maybeSingle();
        if (error) throw error;
        const value = data ? { id: data.id, ...(data.data || {}), createdAt: data.data?.createdAt || data.created_at, updatedAt: data.data?.updatedAt || data.updated_at } : null;
        if (!value) return null;
        const translated = await ensureTranslatedRecords(name, [value]);
        return translated[0] || localizeContentRecord(value);
      } catch (error) {
        throw mapAuthError(error);
      }
    },
    async set(name, id, data, options = {}) {
      try {
        if (name === 'users') {
          const previous = options.merge === false ? {} : (await this.get(name, id) || {});
          const merged = { ...previous, ...data, id, updatedAt: data.updatedAt || now() };
          const { data: rows, error } = await supabaseClient.from('profiles').upsert(profileToRow(id, merged), { onConflict: 'id' }).select('*');
          if (error) throw error;
          return profileFromRow(rows && rows[0]);
        }
        if (name === 'settings') {
          const previous = options.merge === false ? {} : (await this.get(name, id) || {});
          const merged = { ...previous, ...data };
          delete merged.id; delete merged.createdAt; delete merged.updatedAt;
          const { data: rows, error } = await supabaseClient.from('site_settings').upsert({ id, data: merged, updated_at: now() }, { onConflict: 'id' }).select('*');
          if (error) throw error;
          const row = rows && rows[0];
          if (row) queueRecordTranslation('settings', row.id);
          return row ? { id: row.id, ...(row.data || {}), createdAt: row.created_at, updatedAt: row.updated_at } : null;
        }
        if (name === 'admin_logs') {
          const row = {
            id: id || undefined,
            action: data.action || '', type: data.type || '', item_id: data.itemId || '',
            summary: data.summary || '', admin_uid: data.adminUid || currentUser?.uid || null
          };
          const { data: rows, error } = await supabaseClient.from('admin_logs').upsert(row).select('*');
          if (error) throw error;
          return rows && rows[0];
        }
        const previous = options.merge === false ? {} : (await this.get(name, id) || {});
        const merged = { ...previous, ...data, id, updatedAt: data.updatedAt || now() };
        if (!merged.createdAt) merged.createdAt = previous.createdAt || now();
        const payload = { id, collection: name, data: merged, updated_by: currentUser?.uid || null, updated_at: now() };
        const { data: rows, error } = await supabaseClient.from('content_items').upsert(payload, { onConflict: 'id' }).select('id,data,created_at,updated_at');
        if (error) throw error;
        const row = rows && rows[0];
        if (row) queueRecordTranslation(name, row.id);
        return row ? { id: row.id, ...(row.data || {}), createdAt: row.data?.createdAt || row.created_at, updatedAt: row.data?.updatedAt || row.updated_at } : null;
      } catch (error) {
        throw mapAuthError(error);
      }
    },
    async add(name, data) {
      try {
        if (name === 'admin_logs') {
          const { data: rows, error } = await supabaseClient.from('admin_logs').insert({
            action: data.action || '', type: data.type || '', item_id: data.itemId || '',
            summary: data.summary || '', admin_uid: data.adminUid || currentUser?.uid || null
          }).select('*');
          if (error) throw error;
          return rows && rows[0];
        }
        if (name === 'settings') return this.set(name, data.id || uid(), data, { merge: false });
        if (name === 'users') return this.set(name, data.id || data.uid, data, { merge: false });
        const payload = { collection: name, data: { ...data, createdAt: data.createdAt || now(), updatedAt: data.updatedAt || now() }, created_by: currentUser?.uid || null, updated_by: currentUser?.uid || null };
        const { data: rows, error } = await supabaseClient.from('content_items').insert(payload).select('id,data,created_at,updated_at');
        if (error) throw error;
        const row = rows && rows[0];
        if (row) queueRecordTranslation(name, row.id);
        return row ? { id: row.id, ...(row.data || {}), createdAt: row.data?.createdAt || row.created_at, updatedAt: row.data?.updatedAt || row.updated_at } : null;
      } catch (error) {
        throw mapAuthError(error);
      }
    },
    async remove(name, id) {
      try {
        let query;
        if (name === 'users') query = supabaseClient.from('profiles').delete().eq('id', id);
        else if (name === 'settings') query = supabaseClient.from('site_settings').delete().eq('id', id);
        else if (name === 'admin_logs') query = supabaseClient.from('admin_logs').delete().eq('id', id);
        else query = supabaseClient.from('content_items').delete().eq('collection', name).eq('id', id);
        const { error } = await query;
        if (error) throw error;
      } catch (error) {
        throw mapAuthError(error);
      }
    },
    async count(name) {
      return (await this.list(name)).length;
    }
  };

  const data = MODE === 'supabase' ? supabaseData : localData;

  function profileAvatarCacheKey(userId) {
    return 'beSelectedAvatar:' + String(userId || 'guest');
  }

  function readProfileAvatarCache(userId) {
    try {
      return String(localStorage.getItem(profileAvatarCacheKey(userId)) || '').trim();
    } catch (_) {
      return '';
    }
  }

  function writeProfileAvatarCache(userId, avatarUrl) {
    try {
      localStorage.setItem(profileAvatarCacheKey(userId), String(avatarUrl || ''));
    } catch (_) {}
  }

  function profileBannerCacheKey(userId) {
    return 'beProfileBanner:' + String(userId || 'guest');
  }

  function readProfileBannerCache(userId) {
    try {
      const raw = localStorage.getItem(profileBannerCacheKey(userId));
      if (!raw) return { bannerUrl: '', bannerId: '' };
      const parsed = JSON.parse(raw);
      return {
        bannerUrl: String(parsed?.bannerUrl || ''),
        bannerId: String(parsed?.bannerId || '')
      };
    } catch (_) {
      return { bannerUrl: '', bannerId: '' };
    }
  }

  function writeProfileBannerCache(userId, bannerUrl, bannerId) {
    try {
      localStorage.setItem(profileBannerCacheKey(userId), JSON.stringify({
        bannerUrl: String(bannerUrl || ''),
        bannerId: String(bannerId || ''),
        updatedAt: now()
      }));
    } catch (_) {}
  }

  const profiles = {
    async get(userId, options = {}) {
      const force = options && options.force === true;
      if (MODE === 'supabase' && !force) {
        const cached = readCachedProfile(userId);
        if (cached) return cached;
      }
      const profile = await data.get('users', userId);
      if (profile && MODE === 'supabase') cacheProfile(profile);
      return profile;
    },
    async getPublic(username) {
      const normalized = normalizeUsername(username);
      if (!validUsername(normalized)) return null;

      if (MODE === 'local') {
        const profiles = await data.list('users');
        const profile = profiles.find(item => normalizeUsername(item && item.username) === normalized);
        if (!profile) return null;
        let preferenceData = {};
        try {
          const stored = JSON.parse(localStorage.getItem(localPreferenceKey(profile.uid || profile.id)) || 'null');
          preferenceData = stored && typeof stored === 'object' ? normalizePreferencePayload(stored.data || stored) : {};
        } catch (_) {}
        return {
          displayName: String(profile.displayName || 'Usuário'),
          username: normalized,
          avatarUrl: profile.avatarUrl ? String(profile.avatarUrl) : '',
          bannerUrl: profile.bannerId && profile.bannerUrl ? String(profile.bannerUrl) : '',
          createdAt: String(profile.createdAt || ''),
          socialLinks: preferenceData.profileSocialLinks && typeof preferenceData.profileSocialLinks === 'object' && !Array.isArray(preferenceData.profileSocialLinks) ? clone(preferenceData.profileSocialLinks) : {},
          favorites: Array.isArray(preferenceData.profileTopFavorites) ? clone(preferenceData.profileTopFavorites).slice(0, 4) : [],
          lovedAlbums: Array.isArray(preferenceData.profileLovedAlbums) ? clone(preferenceData.profileLovedAlbums).slice(0, 3) : [],
          savedContents: Array.isArray(preferenceData.savedContents) ? clone(preferenceData.savedContents).slice(0, 20) : []
        };
      }

      try {
        const response = await fetch(`/api/public-profile?username=${encodeURIComponent(normalized)}`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store'
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`public_profile_${response.status}`);
        const payload = await response.json();
        return payload && typeof payload === 'object' && !Array.isArray(payload) ? clone(payload) : null;
      } catch (error) {
        throw backendError('profile/public-unavailable', 'Não foi possível carregar este perfil público.', error);
      }
    },
    async ensure(user) {
      if (!user) throw backendError('auth/not-authenticated', 'Faça login para acessar o perfil.');

      if (MODE === 'supabase') {
        const userId = String(user.uid || '');
        const cached = readCachedProfile(userId);
        if (cached) {
          if (currentUser?.uid === user.uid) {
            currentUser = { ...currentUser, role: cached.role === 'admin' ? 'admin' : currentUser.role, photoURL: cached.avatarUrl || '', profile: cached };
          }
          return cached;
        }
        if (profileEnsurePromises.has(userId)) return profileEnsurePromises.get(userId);

        const ensurePromise = (async () => {
          const metadata = user.raw?.user_metadata || user.raw?.raw_user_meta_data || {};
          const metadataUsername = normalizeUsername(metadata.username || '');
          // profile_avatar_url só é gravado quando a pessoa escolhe um avatar no site.
          // Contas antigas podem ter a URL válida e ainda não possuir profile_avatar_id.
          const metadataAvatarUrl = String(metadata.profile_avatar_url || '').trim();
          const profileArgs = {
            p_display_name: String(user.displayName || metadata.display_name || metadata.full_name || '').trim() || null,
            p_username: metadataUsername || null,
            p_avatar_url: metadataAvatarUrl || null
          };
          let { data: rows, error } = await supabaseClient.rpc('ensure_my_profile', profileArgs);

          if (error && metadataUsername) {
            const mappedError = mapAuthError(error);
            if (mappedError.code === 'username-in-use') {
              console.warn('O nome de usuário salvo nos metadados já está em uso; carregando o perfil sem ele.');
              ({ data: rows, error } = await supabaseClient.rpc('ensure_my_profile', {
                ...profileArgs,
                p_username: null
              }));
            } else {
              throw mappedError;
            }
          }
          if (error) throw mapAuthError(error);
          const row = Array.isArray(rows) ? rows[0] : rows;
          if (!row) throw backendError('profile/not-created', 'Não foi possível criar ou carregar o perfil.');
          const profile = profileFromRow(row);
          const cachedAvatarUrl = readProfileAvatarCache(user.uid);
          const storedAvatarUrl = String(profile.avatarUrl || '').trim();
          const storedAvatarId = String(profile.avatarId || '').trim();
          const fallbackMetadataAvatarUrl = String(metadata.profile_avatar_url || '').trim();
          const metadataAvatarId = String(metadata.profile_avatar_id || '').trim();
          const recoveredAvatarUrl = storedAvatarUrl || fallbackMetadataAvatarUrl || cachedAvatarUrl || '';
          const recoveredAvatarId = storedAvatarId || metadataAvatarId || (recoveredAvatarUrl ? 'saved-selection' : '');
          profile.avatarUrl = recoveredAvatarUrl;
          profile.avatarId = recoveredAvatarId;
          if (profile.avatarUrl) writeProfileAvatarCache(user.uid, profile.avatarUrl);

          // Repara contas antigas que tinham avatar_url, mas ficaram sem avatar_id.
          // Antes, esse caso apagava a URL em memória e exibia o avatar padrão.
          if (profile.avatarUrl && (!storedAvatarId || storedAvatarUrl !== profile.avatarUrl)) {
            try {
              const { data: repairedRows, error: repairError } = await supabaseClient
                .from('profiles')
                .update({ avatar_url: profile.avatarUrl, avatar_id: profile.avatarId, updated_at: now() })
                .eq('id', userId)
                .select('*');
              if (repairError) throw repairError;
              const repaired = repairedRows && repairedRows[0] ? profileFromRow(repairedRows[0]) : null;
              if (repaired) Object.assign(profile, repaired);
            } catch (repairError) {
              console.warn('Não foi possível reparar o identificador do avatar antigo:', repairError?.message || repairError);
            }
          }
          const cachedBanner = readProfileBannerCache(user.uid);
          const metadataBannerUrl = String(metadata.profile_banner_url || metadata.banner_url || '').trim();
          const metadataBannerId = String(metadata.profile_banner_id || metadata.banner_id || '').trim();
          profile.bannerUrl = profile.bannerUrl || metadataBannerUrl || cachedBanner.bannerUrl;
          profile.bannerId = profile.bannerId || metadataBannerId || cachedBanner.bannerId;
          if (profile.bannerUrl) writeProfileBannerCache(user.uid, profile.bannerUrl, profile.bannerId);
          cacheProfile(profile);
          if (currentUser?.uid === user.uid) {
            currentUser = { ...currentUser, role: profile.role === 'admin' ? 'admin' : currentUser.role, photoURL: profile.avatarUrl || '', profile };
          }
          return clone(profile);
        })().finally(() => {
          profileEnsurePromises.delete(userId);
        });

        profileEnsurePromises.set(userId, ensurePromise);
        return ensurePromise;
      }

      const existing = await data.get('users', user.uid);
      const base = {
        uid: user.uid,
        email: user.email || '',
        displayName: existing?.displayName || user.displayName || '',
        username: existing?.username || '',
        bio: existing?.bio || '',
        avatarUrl: existing?.avatarUrl || '',
        avatarId: existing?.avatarId || (existing?.avatarUrl ? 'saved-selection' : ''),
        bannerUrl: existing?.bannerUrl || '',
        bannerId: existing?.bannerId || '',
        role: existing?.role || 'member',
        profileComplete: true,
        lastLoginAt: now(),
        updatedAt: now(),
        createdAt: existing?.createdAt || now()
      };
      return data.set('users', user.uid, base, { merge: true });
    },
    async update(userId, payload) {
      const username = normalizeUsername(payload.username);
      if (username && !validUsername(username)) throw backendError('username-invalid', 'O @ informado não é válido.');

      if (MODE === 'supabase') {
        const updateRow = { updated_at: now() };
        if (Object.prototype.hasOwnProperty.call(payload, 'displayName')) updateRow.display_name = String(payload.displayName || '').trim();
        if (Object.prototype.hasOwnProperty.call(payload, 'username')) updateRow.username = username || null;
        if (Object.prototype.hasOwnProperty.call(payload, 'bio')) updateRow.bio = String(payload.bio || '');
        if (Object.prototype.hasOwnProperty.call(payload, 'avatarUrl')) updateRow.avatar_url = String(payload.avatarUrl || '');
        if (Object.prototype.hasOwnProperty.call(payload, 'avatarId')) updateRow.avatar_id = String(payload.avatarId || '');
        if (Object.prototype.hasOwnProperty.call(payload, 'bannerUrl')) updateRow.banner_url = String(payload.bannerUrl || '');
        if (Object.prototype.hasOwnProperty.call(payload, 'bannerId')) updateRow.banner_id = String(payload.bannerId || '');
        if (Object.prototype.hasOwnProperty.call(payload, 'profileComplete')) updateRow.profile_complete = payload.profileComplete !== false;

        const { data: rows, error } = await supabaseClient
          .from('profiles')
          .update(updateRow)
          .eq('id', userId)
          .select('*');
        if (error) throw mapAuthError(error);
        const row = rows && rows[0];
        if (!row) throw backendError('profile/not-found', 'Perfil não encontrado para atualização.');
        const profile = profileFromRow(row);
        cacheProfile(profile);
        if (currentUser?.uid === userId) currentUser = { ...currentUser, photoURL: profile.avatarUrl || '', profile };
        return clone(profile);
      }

      if (username) {
        const all = await data.list('users');
        const taken = all.find(profile => String(profile.username || '').toLowerCase() === username && profile.id !== userId && profile.uid !== userId);
        if (taken) throw backendError('username-in-use', 'Este @ já está em uso.');
      }
      return data.set('users', userId, { ...payload, username, updatedAt: now() }, { merge: true });
    },
    async setAvatar(userId, avatarUrl, avatarId) {
      const normalizedUrl = String(avatarUrl || '').trim();
      const normalizedId = String(avatarId || '').trim();
      const effectiveAvatarId = normalizedId || (normalizedUrl ? 'saved-selection' : '');
      const previousProfile = currentUser?.profile || {};
      let savedProfile = null;
      let databaseError = null;

      writeProfileAvatarCache(userId, normalizedUrl);

      try {
        savedProfile = await this.update(userId, { avatarUrl: normalizedUrl, avatarId: effectiveAvatarId });
      } catch (error) {
        databaseError = error;
        console.warn('Avatar salvo por compatibilidade; o perfil remoto não aceitou a atualização:', error?.message || error);
      }

      // Mantém a escolha também nos metadados da autenticação. Assim o avatar
      // continua salvo após atualizar a página, trocar de aba ou entrar novamente.
      if (MODE === 'supabase' && currentUser?.uid === userId) {
        try {
          const existingMetadata = currentUser.raw?.user_metadata || {};
          const { data: authResult, error } = await supabaseClient.auth.updateUser({
            data: {
              ...existingMetadata,
              avatar_url: normalizedUrl,
              profile_avatar_url: normalizedUrl,
              profile_avatar_id: effectiveAvatarId
            }
          });
          if (error) throw error;
          currentUser = { ...normalizeUser(authResult?.user || currentUser.raw || currentUser), profile: savedProfile || previousProfile };
        } catch (metadataError) {
          console.warn('O avatar ficou salvo neste navegador, mas não nos metadados da conta:', metadataError?.message || metadataError);
        }
      }

      if (!savedProfile) {
        savedProfile = {
          ...previousProfile,
          uid: userId,
          id: userId,
          avatarUrl: normalizedUrl,
          avatarId: effectiveAvatarId,
          updatedAt: now()
        };
      }

      if (currentUser?.uid === userId) {
        currentUser = { ...currentUser, photoURL: normalizedUrl, profile: savedProfile };
      }

      try {
        window.dispatchEvent(new CustomEvent('be:profile-avatar-changed', {
          detail: {
            userId,
            avatarUrl: normalizedUrl,
            avatarId: effectiveAvatarId,
            profile: savedProfile,
            compatibilityFallback: Boolean(databaseError)
          }
        }));
      } catch (_) {}

      return savedProfile;
    },
    async setBanner(userId, bannerUrl, bannerId) {
      const normalizedUrl = String(bannerUrl || '').trim();
      const normalizedId = String(bannerId || '').trim();
      const previousProfile = currentUser?.profile || {};
      let savedProfile = null;
      let databaseError = null;

      try {
        savedProfile = await this.update(userId, { bannerUrl: normalizedUrl, bannerId: normalizedId });
      } catch (error) {
        // Mantém o seletor funcionando mesmo quando a instalação ainda não
        // executou a migração banner_url/banner_id no Supabase.
        databaseError = error;
        console.warn('Banner salvo por compatibilidade; atualize o schema do Supabase quando possível:', error?.message || error);
      }

      writeProfileBannerCache(userId, normalizedUrl, normalizedId);

      if (MODE === 'supabase' && currentUser?.uid === userId) {
        try {
          const existingMetadata = currentUser.raw?.user_metadata || {};
          const { data: authResult, error } = await supabaseClient.auth.updateUser({
            data: {
              ...existingMetadata,
              profile_banner_url: normalizedUrl,
              profile_banner_id: normalizedId
            }
          });
          if (error) throw error;
          currentUser = { ...normalizeUser(authResult?.user || currentUser.raw || currentUser), profile: savedProfile || previousProfile };
        } catch (metadataError) {
          console.warn('O banner ficou salvo neste navegador, mas não nos metadados da conta:', metadataError?.message || metadataError);
        }
      }

      if (!savedProfile) {
        savedProfile = {
          ...previousProfile,
          uid: userId,
          id: userId,
          bannerUrl: normalizedUrl,
          bannerId: normalizedId,
          updatedAt: now()
        };
      }

      if (currentUser?.uid === userId) {
        currentUser = { ...currentUser, profile: savedProfile };
      }
      try {
        window.dispatchEvent(new CustomEvent('be:profile-banner-changed', {
          detail: {
            userId,
            bannerUrl: normalizedUrl,
            bannerId: normalizedId,
            profile: savedProfile,
            compatibilityFallback: Boolean(databaseError)
          }
        }));
      } catch (_) {}
      return savedProfile;
    },
    subscribe(userId, callback) {
      if (!userId || typeof callback !== 'function' || MODE !== 'supabase' || !supabaseClient) return () => {};
      return subscribeSupabaseUserSync(userId, 'profile', callback);
    }
  };

  function normalizePreferencePayload(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return { ...value };
  }

  function preferenceFromRow(row) {
    if (!row) return null;
    return {
      userId: row.user_id,
      data: normalizePreferencePayload(row.data),
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || ''
    };
  }

  function cachePreference(preference) {
    if (!preference || !preference.userId) return preference;
    preferenceCache.set(String(preference.userId), { value: clone(preference), cachedAt: Date.now() });
    return preference;
  }

  function readCachedPreference(userId, maxAge = PREFERENCE_CACHE_TTL_MS) {
    const cached = preferenceCache.get(String(userId || ''));
    if (!cached || Date.now() - cached.cachedAt > maxAge) return null;
    return clone(cached.value);
  }

  function normalizeBroadcastChange(payload, fallbackEvent) {
    const data = payload?.payload && typeof payload.payload === 'object' ? payload.payload : (payload || {});
    return {
      eventType: String(data.type || data.eventType || data.event || fallbackEvent || '').toUpperCase(),
      table: String(data.table || ''),
      schema: String(data.schema || ''),
      new: data.record || data.new || null,
      old: data.old_record || data.old || null,
      raw: payload
    };
  }

  function ensureRealtimeAuth() {
    if (!supabaseClient?.realtime?.setAuth) return Promise.resolve();
    if (!realtimeAuthPromise) {
      realtimeAuthPromise = Promise.resolve(supabaseClient.realtime.setAuth()).catch(error => {
        realtimeAuthPromise = null;
        throw error;
      });
    }
    return realtimeAuthPromise;
  }

  function dispatchUserSync(entry, payload, fallbackEvent) {
    const change = normalizeBroadcastChange(payload, fallbackEvent);
    const compatibilityPayload = {
      eventType: change.eventType,
      new: change.new,
      old: change.old,
      table: change.table,
      schema: change.schema,
      raw: change.raw
    };

    if (change.table === 'profiles') {
      if (change.eventType === 'DELETE') {
        invalidateProfileCache(entry.userId);
        entry.listeners.profile.forEach(listener => {
          try { listener(null, compatibilityPayload); } catch (error) { console.error('Falha ao remover perfil sincronizado:', error); }
        });
        return;
      }
      if (!change.new || String(change.new.id || '') !== entry.userId) return;
      const profile = profileFromRow(change.new);
      if (!profile) return;
      cacheProfile(profile);
      if (currentUser?.uid === entry.userId) currentUser = { ...currentUser, photoURL: profile.avatarUrl || '', profile };
      entry.listeners.profile.forEach(listener => {
        try { listener(clone(profile), compatibilityPayload); } catch (error) { console.error('Falha ao aplicar perfil sincronizado:', error); }
      });
      return;
    }

    if (change.table === 'user_preferences') {
      if (change.eventType === 'DELETE') {
        preferenceCache.delete(entry.userId);
        entry.listeners.preferences.forEach(listener => {
          try { listener(null, compatibilityPayload); } catch (error) { console.error('Falha ao remover preferências sincronizadas:', error); }
        });
        return;
      }
      if (!change.new || String(change.new.user_id || '') !== entry.userId) return;
      const preference = preferenceFromRow(change.new);
      cachePreference(preference);
      entry.listeners.preferences.forEach(listener => {
        try { listener(clone(preference), compatibilityPayload); } catch (error) { console.error('Falha ao aplicar preferências sincronizadas:', error); }
      });
    }
  }

  function startUserSyncChannel(entry) {
    if (entry.channel || entry.starting || entry.disposed) return;
    entry.starting = ensureRealtimeAuth().then(() => {
      if (entry.disposed || entry.channel) return;
      const handler = event => payload => dispatchUserSync(entry, payload, event);
      const channel = supabaseClient
        .channel(`user-sync:${entry.userId}`, { config: { private: true } })
        .on('broadcast', { event: 'INSERT' }, handler('INSERT'))
        .on('broadcast', { event: 'UPDATE' }, handler('UPDATE'))
        .on('broadcast', { event: 'DELETE' }, handler('DELETE'));
      entry.channel = channel;
      channel.subscribe(status => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('A sincronização entre dispositivos foi interrompida:', status);
        }
      });
    }).catch(error => {
      console.warn('Não foi possível iniciar a sincronização entre dispositivos:', error?.message || error);
    }).finally(() => {
      entry.starting = null;
    });
  }

  function subscribeSupabaseUserSync(userId, kind, callback) {
    const key = String(userId || '');
    let entry = userSyncChannels.get(key);
    if (!entry) {
      entry = {
        userId: key,
        listeners: { profile: new Set(), preferences: new Set() },
        channel: null,
        starting: null,
        disposed: false
      };
      userSyncChannels.set(key, entry);
    }
    entry.disposed = false;
    entry.listeners[kind].add(callback);
    startUserSyncChannel(entry);

    return () => {
      entry.listeners[kind].delete(callback);
      if (entry.listeners.profile.size || entry.listeners.preferences.size) return;
      entry.disposed = true;
      userSyncChannels.delete(key);
      if (entry.channel) {
        try {
          const removal = supabaseClient.removeChannel(entry.channel);
          if (removal && typeof removal.catch === 'function') removal.catch(() => {});
        } catch (_) {}
        entry.channel = null;
      }
    };
  }

  function localPreferenceKey(userId) {
    return `beSyncedUserData:${String(userId || 'guest')}`;
  }

  const preferences = {
    async get(userId, options = {}) {
      if (!userId) return null;
      if (MODE === 'supabase') {
        const force = options && options.force === true;
        if (!force) {
          const cached = readCachedPreference(userId);
          if (cached) return cached;
        }
        try {
          const { data: row, error } = await supabaseClient
            .from('user_preferences')
            .select('user_id,data,created_at,updated_at')
            .eq('user_id', userId)
            .maybeSingle();
          if (error) throw error;
          const preference = preferenceFromRow(row);
          if (preference) cachePreference(preference);
          return preference ? clone(preference) : null;
        } catch (error) {
          throw mapAuthError(error);
        }
      }
      try {
        const parsed = JSON.parse(localStorage.getItem(localPreferenceKey(userId)) || 'null');
        return parsed && typeof parsed === 'object'
          ? { userId, data: normalizePreferencePayload(parsed.data || parsed), createdAt: parsed.createdAt || '', updatedAt: parsed.updatedAt || '' }
          : null;
      } catch (_) {
        return null;
      }
    },
    async save(userId, payload) {
      if (!currentUser || currentUser.uid !== userId) throw backendError('auth/not-authenticated', 'Faça login para sincronizar suas preferências.');
      const normalized = normalizePreferencePayload(payload);
      if (MODE === 'supabase') {
        try {
          const { data: rows, error } = await supabaseClient
            .from('user_preferences')
            .upsert({ user_id: userId, data: normalized, updated_at: now() }, { onConflict: 'user_id' })
            .select('user_id,data,created_at,updated_at');
          if (error) throw error;
          const preference = preferenceFromRow(rows && rows[0]);
          if (preference) cachePreference(preference);
          return preference ? clone(preference) : null;
        } catch (error) {
          throw mapAuthError(error);
        }
      }
      const stored = { userId, data: normalized, createdAt: now(), updatedAt: now() };
      localStorage.setItem(localPreferenceKey(userId), JSON.stringify(stored));
      return stored;
    },
    subscribe(userId, callback) {
      if (!userId || typeof callback !== 'function') return () => {};
      if (MODE !== 'supabase' || !supabaseClient) {
        const listener = event => {
          if (event.key !== localPreferenceKey(userId) || !event.newValue) return;
          try {
            const parsed = JSON.parse(event.newValue);
            callback({ userId, data: normalizePreferencePayload(parsed.data || parsed), createdAt: parsed.createdAt || '', updatedAt: parsed.updatedAt || '' });
          } catch (_) {}
        };
        window.addEventListener('storage', listener);
        return () => window.removeEventListener('storage', listener);
      }

      return subscribeSupabaseUserSync(userId, 'preferences', callback);
    }
  };

  const localAuth = {
    get currentUser() { return currentUser; },
    onChange(callback) {
      listeners.add(callback);
      queueMicrotask(() => callback(currentUser ? { ...currentUser } : null));
      return () => listeners.delete(callback);
    },
    async accountExists(email) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw backendError('auth/invalid-email', 'Digite um e-mail válido.');
      const database = loadLocalDatabase();
      return Boolean(database.accounts[normalizedEmail]);
    },
    async usernameAvailable(username) {
      const normalizedHandle = normalizeUsername(username);
      if (!validUsername(normalizedHandle)) throw backendError('username-invalid', 'O @ informado não é válido.');
      const database = loadLocalDatabase();
      const profilesList = Object.values(localCollection(database, 'users'));
      return !profilesList.some(profile => String(profile.username || '').toLowerCase() === normalizedHandle);
    },
    async signInWithEmail({ email, password, remember = true }) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const database = loadLocalDatabase();
      const account = database.accounts[normalizedEmail];
      if (!account) throw backendError('auth/user-not-found', 'Conta não encontrada.');
      const hash = await hashPassword(password, account.salt);
      if (hash !== account.passwordHash) throw backendError('auth/invalid-credential', 'E-mail ou senha incorretos.');
      currentUser = normalizeUser(account);
      writeLocalSession(currentUser, remember);
      await profiles.ensure(currentUser);
      notify();
      return { user: currentUser, session: { user: currentUser } };
    },
    async signUp({ email, password, name, username, remember = true }) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const normalizedHandle = normalizeUsername(username);
      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw backendError('auth/invalid-email', 'Digite um e-mail válido.');
      if (String(password || '').length < 6) throw backendError('auth/weak-password', 'Use uma senha com pelo menos 6 caracteres.');
      if (normalizedHandle && !validUsername(normalizedHandle)) throw backendError('username-invalid', 'O @ deve ter de 3 a 20 caracteres.');
      const database = loadLocalDatabase();
      if (database.accounts[normalizedEmail]) throw backendError('auth/email-already-in-use', 'Este e-mail já possui uma conta.');
      const profilesList = Object.values(localCollection(database, 'users'));
      if (normalizedHandle && profilesList.some(profile => String(profile.username || '').toLowerCase() === normalizedHandle)) throw backendError('username-in-use', 'Este @ já está em uso.');
      const userId = uid();
      const salt = uid();
      const account = {
        id: userId,
        uid: userId,
        email: normalizedEmail,
        displayName: String(name || '').trim(),
        photoURL: '',
        emailVerified: true,
        role: normalizedEmail === LOCAL_ADMIN_EMAIL ? 'admin' : 'member',
        salt,
        passwordHash: await hashPassword(password, salt),
        createdAt: now()
      };
      database.accounts[normalizedEmail] = account;
      localCollection(database, 'users')[userId] = {
        id: userId, uid: userId, email: normalizedEmail,
        displayName: account.displayName, username: normalizedHandle, bio: '', avatarUrl: '', avatarId: '', bannerUrl: '', bannerId: '',
        profileComplete: true, banned: false, bannedAt: '', banReason: '', role: account.role, createdAt: now(), updatedAt: now(), lastLoginAt: now()
      };
      saveLocalDatabase(database);
      currentUser = normalizeUser(account);
      writeLocalSession(currentUser, remember);
      notify();
      return { user: currentUser, session: { user: currentUser } };
    },
    async signOut() {
      currentUser = null;
      clearLocalSession();
      localStorage.removeItem('beAuthExpected');
      localStorage.removeItem('beSessionUid');
      notify();
    },
    async getAuthenticatedUser() {
      return currentUser ? { ...currentUser } : null;
    },
    async sendPasswordReset() {
      throw backendError('backend/not-configured', 'O envio de e-mail será ativado quando o Supabase estiver conectado.');
    },
    async updatePassword(password) {
      if (!currentUser) throw backendError('auth/not-authenticated', 'O link de redefinição não possui uma sessão válida.');
      if (String(password || '').length < 6) throw backendError('auth/weak-password', 'Use uma senha com pelo menos 6 caracteres.');
      const database = loadLocalDatabase();
      const email = String(currentUser.email || '').toLowerCase();
      const account = database.accounts[email];
      if (!account) throw backendError('auth/user-not-found', 'Conta não encontrada.');
      const salt = uid();
      account.salt = salt;
      account.passwordHash = await hashPassword(password, salt);
      saveLocalDatabase(database);
      return { user: currentUser };
    },
    async resendSignupConfirmation() {
      throw backendError('backend/not-configured', 'A confirmação por e-mail será ativada quando o Supabase estiver conectado.');
    },
    async updateCurrentUser({ displayName }) {
      if (!currentUser) throw backendError('auth/not-authenticated', 'Faça login para continuar.');
      const database = loadLocalDatabase();
      const email = currentUser.email.toLowerCase();
      if (database.accounts[email]) database.accounts[email].displayName = displayName;
      saveLocalDatabase(database);
      currentUser = { ...currentUser, displayName };
      writeLocalSession(currentUser, Boolean(localStorage.getItem(LOCAL_SESSION_KEY)));
      notify();
      return currentUser;
    },
    async signInWithGoogle() {
      throw backendError('backend/not-configured', 'Conecte o projeto ao Supabase para usar o login Google do administrador.');
    },
    async signInWithDiscord() {
      throw backendError('backend/not-configured', 'Conecte o projeto ao Supabase para usar o login com Discord.');
    },
    async connectDiscord() {
      throw backendError('backend/not-configured', 'A conexão com Discord requer o Supabase configurado.');
    },
    async accountStatus() {
      if (!currentUser) return { banned: false };
      const profile = await data.get('users', currentUser.uid).catch(() => null);
      return { banned: Boolean(profile && profile.banned), reason: profile?.banReason || '' };
    },
    async exportAccount() {
      if (!currentUser) throw backendError('auth/not-authenticated', 'Faça login para exportar seus dados.');
      const profile = await data.get('users', currentUser.uid).catch(() => null);
      return {
        ok: true,
        exportedAt: now(),
        account: {
          id: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || '',
          provider: 'local'
        },
        profile
      };
    },
    async deleteAccount() {
      if (!currentUser) throw backendError('auth/not-authenticated', 'Faça login para continuar.');
      const database = loadLocalDatabase();
      const email = String(currentUser.email || '').toLowerCase();
      const userId = currentUser.uid;
      if (email) delete database.accounts[email];
      delete localCollection(database, 'users')[userId];
      saveLocalDatabase(database);
      currentUser = null;
      clearLocalSession();
      localStorage.removeItem('beAuthExpected');
      localStorage.removeItem('beSessionUid');
      notify();
    },
    async localAdminExists(email = LOCAL_ADMIN_EMAIL) {
      const database = loadLocalDatabase();
      return Boolean(database.accounts[String(email).toLowerCase()]);
    },
    async setupLocalAdmin(email, password) {
      const normalizedEmail = String(email || LOCAL_ADMIN_EMAIL).trim().toLowerCase();
      if (normalizedEmail !== LOCAL_ADMIN_EMAIL) throw backendError('auth/not-admin', 'Use o e-mail administrativo autorizado.');
      const database = loadLocalDatabase();
      if (database.accounts[normalizedEmail]) return this.signInWithEmail({ email: normalizedEmail, password, remember: true });
      return this.signUp({ email: normalizedEmail, password, name: 'Administrador', username: 'administrador', remember: true });
    }
  };

  const supabaseAuth = {
    get currentUser() { return currentUser; },
    onChange(callback) {
      listeners.add(callback);
      queueMicrotask(() => callback(currentUser ? { ...currentUser } : null));
      return () => listeners.delete(callback);
    },
    async accountExists(email) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw backendError('auth/invalid-email', 'Digite um e-mail válido.');
      const { data, error } = await supabaseClient.rpc('account_exists', { p_email: normalizedEmail });
      if (error) throw mapAuthError(error);
      return data === true;
    },
    async usernameAvailable(username) {
      const normalizedHandle = normalizeUsername(username);
      if (!validUsername(normalizedHandle)) throw backendError('username-invalid', 'O @ informado não é válido.');
      const { data, error } = await supabaseClient.rpc('username_available', { p_username: normalizedHandle });
      if (error) {
        console.warn('Não foi possível verificar o nome de usuário:', error.message);
        return null;
      }
      return Boolean(data);
    },
    async signInWithEmail({ email, password }) {
      const { data: result, error } = await supabaseClient.auth.signInWithPassword({
        email: String(email || '').trim().toLowerCase(),
        password
      });
      if (error) throw mapAuthError(error);

      currentUser = await hydratePrivileges(normalizeUser(result?.user || result?.session?.user || null)) || await resolveSupabaseUser(result);
      if (!currentUser) {
        throw backendError(
          'auth/session-missing',
          'Não foi possível concluir a sessão de login. Tente entrar novamente.'
        );
      }

      // Uma falha no perfil não deve desfazer uma autenticação que já foi aceita.
      try {
        await profiles.ensure(currentUser);
      } catch (profileError) {
        console.warn('O login foi concluído, mas o perfil será carregado novamente pela página:', profileError?.message || profileError);
      }
      notify();
      return { user: currentUser, session: result?.session || null };
    },
    async signUp({ email, password, name, username }) {
      const normalizedHandle = normalizeUsername(username);
      if (normalizedHandle && !validUsername(normalizedHandle)) throw backendError('username-invalid', 'O @ deve ter de 3 a 20 caracteres.');
      if (normalizedHandle) {
        const usernameIsAvailable = await this.usernameAvailable(normalizedHandle);
        if (usernameIsAvailable === false) throw backendError('username-in-use', 'Este nome de usuário já está em uso. Escolha outro.');
      }
      const { data: result, error } = await supabaseClient.auth.signUp({
        email: String(email || '').trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: safeAuthReturnUrl(),
          data: { display_name: String(name || '').trim(), username: normalizedHandle }
        }
      });
      if (error) throw mapAuthError(error);
      const signedUpUser = await hydratePrivileges(normalizeUser(result.user));
      currentUser = result.session ? signedUpUser : null;
      if (currentUser) {
        await profiles.ensure(currentUser);
        await profiles.update(currentUser.uid, { displayName: String(name || '').trim(), username: normalizedHandle });
      }
      notify();
      return { user: signedUpUser, session: result.session, needsEmailConfirmation: Boolean(result.user && !result.session) };
    },
    async signOut() {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw mapAuthError(error);
      currentUser = null;
      profileCache.clear();
      preferenceCache.clear();
      userSyncChannels.forEach(entry => {
        if (entry.channel) { try { supabaseClient.removeChannel(entry.channel); } catch (_) {} }
      });
      userSyncChannels.clear();
      localStorage.removeItem('beAuthExpected');
      localStorage.removeItem('beSessionUid');
      notify();
    },
    async getAuthenticatedUser() {
      if (currentUser) return { ...currentUser };
      currentUser = await resolveSupabaseUser(null);
      return currentUser ? { ...currentUser } : null;
    },
    async sendPasswordReset(email) {
      const locale = String(window.BETVLocale?.slug || 'pt-br').toLowerCase();
      const safeLocale = ['pt-br', 'en-us', 'es'].includes(locale) ? locale : 'pt-br';
      const redirectTo = `${location.origin}/${safeLocale}/reset-password`;
      const { error } = await supabaseClient.auth.resetPasswordForEmail(String(email || '').trim().toLowerCase(), { redirectTo });
      if (error) throw mapAuthError(error);
    },
    async updatePassword(password) {
      const { data: result, error } = await supabaseClient.auth.updateUser({ password: String(password || '') });
      if (error) throw mapAuthError(error);
      currentUser = normalizeUser(result.user) || currentUser;
      notify();
      return { user: currentUser };
    },
    async resendSignupConfirmation(email) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (!normalizedEmail) throw backendError('auth/invalid-email', 'Digite um e-mail válido.');
      const { error } = await supabaseClient.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: { emailRedirectTo: safeAuthReturnUrl() }
      });
      if (error) throw mapAuthError(error);
    },
    async updateCurrentUser({ displayName }) {
      const { data: result, error } = await supabaseClient.auth.updateUser({ data: { display_name: displayName } });
      if (error) throw mapAuthError(error);
      currentUser = normalizeUser(result.user);
      notify();
      return currentUser;
    },
    async signInWithGoogle() {
      sessionStorage.setItem('beOAuthDestination', 'admin');
      localStorage.setItem('beAuthExpected', '1');
      const redirectTo = oauthRedirectUrl('admin');
      const { data: result, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, queryParams: { prompt: 'select_account' } }
      });
      if (error) throw mapAuthError(error);
      return result;
    },
    async signInWithDiscord() {
      sessionStorage.setItem('beOAuthDestination', 'home');
      localStorage.setItem('beAuthExpected', '1');
      const redirectTo = oauthRedirectUrl('discord');
      const { data: result, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo }
      });
      if (error) throw mapAuthError(error);
      return result;
    },
    async connectDiscord() {
      if (!currentUser) throw backendError('auth/not-authenticated', 'Faça login para conectar o Discord.');
      if (typeof supabaseClient.auth.linkIdentity !== 'function') throw backendError('auth/link-not-supported', 'A conexão de identidades não está disponível nesta versão do Supabase.');
      sessionStorage.setItem('beOAuthDestination', 'home');
      localStorage.setItem('beAuthExpected', '1');
      const redirectTo = oauthRedirectUrl('discord-link');
      const { data: result, error } = await supabaseClient.auth.linkIdentity({
        provider: 'discord',
        options: { redirectTo }
      });
      if (error) throw mapAuthError(error);
      return result;
    },
    async accountStatus() {
      if (!currentUser) {
        accountStatusCheckedAt = 0;
        accountStatusUserId = '';
        accountStatusCache = { banned: false, reason: '', bannedAt: '' };
        return accountStatusCache;
      }
      if (accountStatusUserId !== String(currentUser.uid || '')) {
        accountStatusUserId = String(currentUser.uid || '');
        accountStatusCheckedAt = 0;
        accountStatusCache = { banned: false, reason: '', bannedAt: '' };
      }
      const localProfile = await profiles.get(currentUser.uid).catch(() => null);
      if (localProfile) {
        accountStatusCache = {
          banned: Boolean(localProfile.banned),
          reason: localProfile.banReason || '',
          bannedAt: localProfile.bannedAt || ''
        };
        accountStatusCheckedAt = Date.now();
        return { ...accountStatusCache };
      }
      if (accountStatusPromise) return accountStatusPromise;
      if (Date.now() - accountStatusCheckedAt < 30000) return { ...accountStatusCache };

      accountStatusPromise = (async () => {
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError || !sessionData?.session?.access_token) {
          accountStatusCheckedAt = Date.now();
          accountStatusCache = { banned: false, reason: '', bannedAt: '' };
          return accountStatusCache;
        }
        try {
          const response = await fetch('/api/account-status', {
            method: 'GET',
            credentials: 'same-origin',
            cache: 'no-store',
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
              Accept: 'application/json'
            }
          });
          const payload = await response.json().catch(() => ({}));
          accountStatusCheckedAt = Date.now();
          accountStatusCache = {
            banned: Boolean(payload?.banned),
            reason: payload?.reason || '',
            bannedAt: payload?.bannedAt || ''
          };
          return { ...accountStatusCache };
        } catch (_) {
          accountStatusCheckedAt = Date.now();
          return { ...accountStatusCache };
        }
      })().finally(() => { accountStatusPromise = null; });

      return accountStatusPromise;
    },
    async exportAccount() {
      if (!currentUser) throw backendError('auth/not-authenticated', 'Faça login para exportar seus dados.');
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) throw mapAuthError(sessionError);
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw backendError('auth/not-authenticated', 'Sua sessão expirou. Entre novamente para exportar seus dados.');

      let response;
      try {
        response = await fetch('/api/export-account', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          }
        });
      } catch (_) {
        throw backendError('auth/export-account-failed', 'Não foi possível acessar o servidor para exportar seus dados.');
      }

      let payload = null;
      try { payload = await response.json(); } catch (_) {}
      if (!response.ok || payload?.ok !== true) {
        throw backendError('auth/export-account-failed', payload?.error || payload?.message || 'Não foi possível exportar os dados da conta.');
      }
      return payload;
    },
    async deleteAccount() {
      if (!currentUser) throw backendError('auth/not-authenticated', 'Faça login para continuar.');

      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) throw mapAuthError(sessionError);
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw backendError('auth/not-authenticated', 'Sua sessão expirou. Entre novamente para excluir a conta.');

      let response;
      try {
        response = await fetch('/api/delete-account', {
          method: 'POST',
          credentials: 'same-origin',
          cache: 'no-store',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ confirm: true })
        });
      } catch (_) {
        throw backendError('auth/delete-account-failed', 'Não foi possível acessar o servidor para excluir a conta. Tente novamente.');
      }

      let payload = null;
      try { payload = await response.json(); } catch (_) {}
      if (!response.ok || payload?.ok !== true) {
        const detail = payload?.error || payload?.message || `Falha no servidor (${response.status}).`;
        throw backendError('auth/delete-account-failed', detail);
      }

      // A conta já foi removida no servidor. Encerra apenas a sessão local para
      // que nenhum token antigo permaneça no navegador após a exclusão.
      try { await supabaseClient.auth.signOut({ scope: 'local' }); } catch (_) {}
      try {
        const storageKeys = [];
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (key && (/^sb-.*-auth-token$/.test(key) || key === 'beAuthExpected' || key === 'beSessionUid')) storageKeys.push(key);
        }
        storageKeys.forEach(key => localStorage.removeItem(key));
        const sessionKeys = [];
        for (let index = 0; index < sessionStorage.length; index += 1) {
          const key = sessionStorage.key(index);
          if (key && (/^sb-.*-auth-token$/.test(key) || /^beOAuth/.test(key) || key === 'beOpenSettingsAfterDiscord')) sessionKeys.push(key);
        }
        sessionKeys.forEach(key => sessionStorage.removeItem(key));
      } catch (_) {}

      currentUser = null;
      notify();
      return payload;
    },
    async localAdminExists() { return false; },
    async setupLocalAdmin() { throw backendError('backend/wrong-mode', 'O acesso local não é usado quando o Supabase está conectado.'); }
  };

  const auth = MODE === 'supabase' ? supabaseAuth : localAuth;


  async function initialize() {
    if (MODE === 'supabase') {
      // Corrige callbacks antigos no formato #/admin/dashboard#access_token=...
      // antes de o Supabase tentar detectar a sessão na URL.
      normalizeLegacyAuthHash();

      const callbackActive = hasAuthCallbackPayload();
      const callbackDestination = authCallbackDestination();
      const callbackFailure = authCallbackError();
      const config = window.BE_SUPABASE_CONFIG;
      // Versões anteriores guardavam o token apenas em sessionStorage. Isso
      // fazia uma conta parecer desconectada ao abrir o site por outro link ou
      // em uma nova aba. Migra a sessão existente uma única vez e passa a usar
      // localStorage, que é compartilhado entre abas e restaurado ao reabrir o site.
      try {
        for (let index = 0; index < sessionStorage.length; index += 1) {
          const key = sessionStorage.key(index);
          if (!key || !/^sb-.*-auth-token$/i.test(key)) continue;
          const value = sessionStorage.getItem(key);
          if (value && !localStorage.getItem(key)) localStorage.setItem(key, value);
        }
      } catch (_) {}
      supabaseClient = window.supabase.createClient(config.url, config.publishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          storage: window.localStorage
        }
      });

      // O listener é registrado imediatamente para não perder o evento SIGNED_IN
      // emitido durante o retorno do Discord/Google. Eventos vazios nunca apagam
      // uma sessão já confirmada; apenas SIGNED_OUT encerra a conta.
      supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          try { sessionStorage.setItem('bePasswordRecoveryActive', '1'); } catch (_) {}
          window.dispatchEvent(new CustomEvent('be:password-recovery', { detail: { active: true } }));
        }
        const eventUser = normalizeUser(session?.user || null);
        if (session?.access_token && supabaseClient?.realtime?.setAuth) {
          Promise.resolve(supabaseClient.realtime.setAuth(session.access_token)).catch(() => {});
        }
        window.setTimeout(async () => {
          if (event === 'SIGNED_OUT') {
            currentUser = null;
            notify();
            return;
          }

          if (eventUser) {
            const sameAccount = Boolean(currentUser && currentUser.uid === eventUser.uid);
            const passiveRefresh = event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED';
            if (sameAccount && passiveRefresh) {
              currentUser = {
                ...currentUser,
                email: eventUser.email || currentUser.email,
                emailVerified: eventUser.emailVerified || currentUser.emailVerified,
                raw: eventUser.raw || currentUser.raw
              };
              return;
            }
            currentUser = await hydratePrivileges(eventUser);
            notify();
            return;
          }

          if (event === 'INITIAL_SESSION' && currentUser) return;

          try {
            const previousUser = currentUser;
            const recoveredUser = await resolveSupabaseUser(null);
            if (recoveredUser) {
              currentUser = recoveredUser;
              notify();
              return;
            }
            if (previousUser) {
              console.warn('Evento de autenticação sem sessão ignorado para evitar logout transitório.');
              return;
            }
            currentUser = null;
            notify();
          } catch (latestError) {
            console.warn('Não foi possível confirmar a sessão:', latestError?.message || latestError);
          }
        }, 0);
      });

      const { data: sessionData, error } = await supabaseClient.auth.getSession();
      if (error) console.warn('Não foi possível restaurar a sessão:', error.message);
      currentUser = await hydratePrivileges(normalizeUser(sessionData?.session?.user || null));

      // O processamento do callback pode terminar alguns instantes depois da
      // criação do cliente. Nessas URLs aguardamos a sessão antes de liberar a UI.
      if (!currentUser && callbackActive && !callbackFailure) {
        currentUser = await resolveSupabaseUser(sessionData);
      }

      // O retorno do painel usa query string para não disputar o único fragmento
      // (#) disponível com os tokens do fluxo implícito do Supabase.
      if (callbackActive && callbackDestination === 'admin') {
        if (callbackFailure) {
          sessionStorage.setItem('adminAuthError', decodeURIComponent(String(callbackFailure).replace(/\+/g, ' ')));
        } else if (!currentUser) {
          sessionStorage.setItem('adminAuthError', 'O Google concluiu o login, mas a sessão não foi restaurada. Tente entrar novamente.');
        }
        sessionStorage.removeItem('beOAuthDestination');
        cleanAuthCallbackUrl('admin');
      }
    } else {
      const session = readLocalSession();
      if (session && session.email) {
        const database = loadLocalDatabase();
        const account = database.accounts[String(session.email).toLowerCase()];
        currentUser = account ? normalizeUser(account) : null;
        if (!currentUser) clearLocalSession();
      }
    }
    notify();
  }

  const ready = initialize().catch(error => {
    console.error('Falha ao inicializar o backend:', error);
    throw error;
  });

  window.beBackend = {
    ADMIN_EMAIL,
    mode: MODE,
    ready,
    now,
    auth,
    data,
    profiles,
    preferences,
    normalizeUsername,
    validUsername,
    isAdmin(user) { return Boolean(user && user.role === 'admin'); },
    get client() { return supabaseClient; }
  };
})();

;

;
(() => {
  'use strict';
  if (location.hash.startsWith('#/admin')) return;

  const randomFeaturedPools = { videos: [], films: [], movies: [], series: [] };
  const lastRandomFeaturedId = { videos: '', films: '', movies: '', series: '' };


  function localizedUiText(source, variables = {}) {
    if (window.BETVI18n && typeof window.BETVI18n.t === 'function') return window.BETVI18n.t(source, variables);
    return String(source || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : _);
  }

  function markdownInline(value) {
    let source = String(value ?? '');
    const tokens = [];
    const token = html => `@@BETVMD${tokens.push(html) - 1}@@`;

    source = source.replace(/`([^`\n]+)`/g, (_, code) => token(`<code>${escapeHtml(code)}</code>`));
    source = source.replace(/\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/gi, (_, label, url) => {
      const safeHref = escapeHtml(url);
      const external = /^https?:\/\//i.test(url);
      return token(`<a href="${safeHref}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(label)}</a>`);
    });

    let html = escapeHtml(source);
    html = html
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
      .replace(/~~([^~\n]+)~~/g, '<del>$1</del>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');

    return html.replace(/@@BETVMD(\d+)@@/g, (_, index) => tokens[Number(index)] || '');
  }

  function markdownToHtml(value) {
    const source = String(value ?? '').replace(/\r\n?/g, '\n').trim();
    if (!source) return '';
    const lines = source.split('\n');
    const blocks = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) { index += 1; continue; }

      if (/^```/.test(line.trim())) {
        const code = [];
        index += 1;
        while (index < lines.length && !/^```/.test(lines[index].trim())) {
          code.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) index += 1;
        blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        continue;
      }

      const heading = line.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        blocks.push(`<h${level}>${markdownInline(heading[2])}</h${level}>`);
        index += 1;
        continue;
      }

      if (/^\s*[-*+]\s+/.test(line)) {
        const items = [];
        while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
          items.push(`<li>${markdownInline(lines[index].replace(/^\s*[-*+]\s+/, ''))}</li>`);
          index += 1;
        }
        blocks.push(`<ul>${items.join('')}</ul>`);
        continue;
      }

      if (/^\s*\d+[.)]\s+/.test(line)) {
        const items = [];
        while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
          items.push(`<li>${markdownInline(lines[index].replace(/^\s*\d+[.)]\s+/, ''))}</li>`);
          index += 1;
        }
        blocks.push(`<ol>${items.join('')}</ol>`);
        continue;
      }

      if (/^>\s?/.test(line)) {
        const quotes = [];
        while (index < lines.length && /^>\s?/.test(lines[index])) {
          quotes.push(markdownInline(lines[index].replace(/^>\s?/, '')));
          index += 1;
        }
        blocks.push(`<blockquote>${quotes.join('<br>')}</blockquote>`);
        continue;
      }

      if (/^\s*(?:---|___|\*\*\*)\s*$/.test(line)) {
        blocks.push('<hr>');
        index += 1;
        continue;
      }

      const paragraph = [line];
      index += 1;
      while (index < lines.length && lines[index].trim() &&
        !/^(?:```|#{1,4}\s+|\s*[-*+]\s+|\s*\d+[.)]\s+|>\s?|\s*(?:---|___|\*\*\*)\s*$)/.test(lines[index])) {
        paragraph.push(lines[index]);
        index += 1;
      }
      blocks.push(`<p>${paragraph.map(markdownInline).join('<br>')}</p>`);
    }

    return blocks.join('');
  }

  function markdownToPlainText(value) {
    return String(value ?? '')
      .replace(/```[\s\S]*?```/g, block => block.replace(/^```[^\n]*\n?/, '').replace(/```$/, ''))
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\((?:https?:\/\/|mailto:)[^)]*\)/gi, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^>\s?/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+[.)]\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/[*_~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  window.beRenderMarkdown = markdownToHtml;
  window.beMarkdownPlainText = markdownToPlainText;

  window.addEventListener('load', async () => {
    setupHomeNavigation();
    setupDetailControls();
    try {
      if (!window.beBackend) return;
      await window.beBackend.ready;
      await applySiteSettings();
      await renderFeatured();
      await renderVideoCatalog();
      setupHomeNavigation();
      setupDetailControls();
      await openContentDetailFromRoute();
    } catch (error) {
      console.warn('Conteúdo dinâmico indisponível:', error.message);
    } finally {
      window.__beContentReady = true;
      window.dispatchEvent(new Event('be:content-ready'));
    }
  });

  function normalizedFooterLink(value, network = 'website') {
    let raw = String(value || '').trim();
    if (!raw) return '';
    if (network === 'instagram' && raw.startsWith('@')) raw = `https://www.instagram.com/${raw.slice(1)}`;
    if (network === 'x' && raw.startsWith('@')) raw = `https://x.com/${raw.slice(1)}`;
    if (network === 'discord' && !/^[a-z][a-z0-9+.-]*:/i.test(raw) && !raw.includes('/')) raw = `https://discord.gg/${raw}`;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) raw = `https://${raw}`;
    try {
      const url = new URL(raw);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) {
      return '';
    }
  }

  function applyFooterLink(id, value, network) {
    const link = document.getElementById(id);
    if (!link) return;
    const href = normalizedFooterLink(value, network);
    link.hidden = !href;
    if (href) link.href = href;
    else link.removeAttribute('href');
  }

  async function applySiteSettings() {
    const data = await beBackend.data.get('settings', 'site');
    if (!data) return;
    document.title = 'Billie Eilish TV';
    if (data.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.append(meta);
      }
      meta.content = data.description;
    }
    if (data.primaryColor) document.documentElement.style.setProperty('--blue', data.primaryColor);
    applyFooterLink('footerInstagram', data.instagram, 'instagram');
    applyFooterLink('footerWebsite', data.website || data.siteUrl, 'website');
    applyFooterLink('footerX', data.xUrl || data.twitter || data.x, 'x');
    applyFooterLink('footerDiscord', data.discordUrl || data.discord || data.discordInvite, 'discord');
  }

  async function renderFeatured() {
    const host = document.getElementById('featured');
    if (!host) return;
    const section = host.closest('.featured-wrap');
    if (section) section.hidden = true;

    let featured = (await beBackend.data.list('featured', { orderBy: 'order', direction: 'asc' }))
      .filter(item => item.active !== false && (item.contentId || item.videoId))
      .slice(0, 6);

    featured = await Promise.all(featured.map(async item => {
      try {
        const collection = ['videos', 'movies', 'series'].includes(item.contentCollection || item.sourceCollection)
          ? (item.contentCollection || item.sourceCollection)
          : 'videos';
        const sourceId = item.contentId || item.videoId;
        const source = await beBackend.data.get(collection, sourceId);
        if (!source || source.active === false) return null;
        const thumbnail = source.thumbnailUrl || source.imageUrl || source.bannerUrl || item.imageUrl || item.bannerUrl || '';
        const background = ['movies', 'series'].includes(collection)
          ? thumbnail
          : (source.bannerUrl || source.imageUrl || source.thumbnailUrl || item.bannerUrl || item.imageUrl || '');
        return {
          ...item,
          id: source.id,
          sourceId: source.id,
          publicId: numericPublicId(source.publicId || source.id || source.title),
          title: source.title || item.title,
          description: source.description || item.description,
          imageUrl: thumbnail,
          bannerUrl: background,
          contentUrl: source.videoUrl || source.contentUrl || source.link || item.contentUrl,
          duration: source.duration || source.videoDuration || source.runtime || item.duration,
          year: source.year || item.year,
          logoUrl: source.logoUrl || item.logoUrl || '',
          sectionId: source.sectionId || '',
          sectionName: source.sectionName || '',
          collection,
          category: 'destaque'
        };
      } catch (_) {
        return null;
      }
    })).then(items => items.filter(Boolean));

    if (!featured.length) {
      host.innerHTML = '';
      return;
    }

    host.innerHTML = featured.map((item, index) => {
      const image = item.bannerUrl || item.imageUrl || item.thumbnailUrl || '';
      const url = item.contentUrl || item.videoUrl || item.link || '#';
      const title = item.title || 'Destaque';
      const preserveTitle = preservesOriginalMusicTitle(item);
      const duration = item.duration || item.videoDuration || item.runtime || '';
      const year = item.year || '';
      const meta = [
        duration ? `<span class="f-duration">${escapeHtml(duration)}</span>` : '',
        duration && year ? '<span class="f-dot-sep"></span>' : '',
        year ? `<span class="f-year">${escapeHtml(year)}</span>` : ''
      ].join('');
      return `<div class="f-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="f-info">
          <div class="f-logo${preserveTitle ? ' notranslate' : ''}"${preserveTitle ? ' translate="no"' : ''}>${item.logoUrl ? `<img loading="eager" decoding="async" fetchpriority="high" src="${safeAssetUrl(item.logoUrl)}" alt="${escapeHtml(title)}">` : (['movies', 'series'].includes(item.collection) ? `<span class="sr-only">${escapeHtml(title)}</span>` : escapeHtml(title))}</div>
          <div class="f-meta">${meta}</div>
          <div class="f-desc be-markdown">${markdownToHtml(item.description || '')}</div>
          <div class="f-actions">
            <button class="f-play" type="button" data-open-detail="true"
              data-item-id="${escapeHtml(String(item.publicId || numericPublicId(item.id || item.videoId || title)))}"
              data-record-id="${escapeHtml(String(item.sourceId || item.id || item.contentId || item.videoId || ''))}"
              data-title="${escapeHtml(title)}"
              data-description="${escapeHtml(item.description || '')}"
              data-year="${escapeHtml(item.year || '')}"
              data-duration="${escapeHtml(item.duration || '')}"
              data-content-url="${safeUrl(url)}"
              data-image-url="${safeAssetUrl(item.imageUrl || '')}"
              data-banner-url="${safeAssetUrl(item.bannerUrl || item.imageUrl || '')}"
              data-logo-url="${safeAssetUrl(item.logoUrl || '')}"
              data-collection="${escapeHtml(item.collection || 'videos')}"
              data-section-id="${escapeHtml(String(item.sectionId || ''))}"
              data-section-name="${escapeHtml(String(item.sectionName || ''))}"
              data-preserve-title="${preserveTitle ? 'true' : 'false'}">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7-11-7Z"/></svg>Assistir
            </button>
            <button class="f-fav" type="button" data-favorite-id="${escapeHtml(String(`${item.collection || 'videos'}:${item.sourceId || item.contentId || item.videoId || item.id || title}`))}" aria-label="Adicionar ${escapeHtml(title)} aos favoritos" aria-pressed="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-9.7-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.7 6c-2.2 4.4-9.7 9-9.7 9Z"/></svg>
            </button>
          </div>
        </div>
        <div class="f-media">${image ? `<img decoding="async" src="${safeAssetUrl(image)}" alt="${escapeHtml(title)}" loading="eager" decoding="async" fetchpriority="high">` : '<div class="ph ph-wide" style="height:100%"></div>'}</div>
      </div>`;
    }).join('') + `<div class="f-dots" id="featuredDots">${featured.map((_, index) => `<button class="f-dot ${index === 0 ? 'active' : ''}" data-goto="${index}" aria-label="Ir para o destaque ${index + 1}"></button>`).join('')}</div>`;

    const slides = Array.from(host.querySelectorAll('.f-slide'));
    const dots = Array.from(host.querySelectorAll('.f-dot'));
    let index = 0;
    let timer = null;
    const go = next => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    const start = () => { stop(); if (slides.length > 1) timer = setInterval(() => go(index + 1), 10000); };
    dots.forEach(dot => dot.addEventListener('click', () => { go(Number(dot.dataset.goto || 0)); start(); }));
    host.addEventListener('mouseenter', stop);
    host.addEventListener('mouseleave', start);
    start();
    bindBannerImageFallbacks(host);
    setupFavoriteButtons(host);
    setupContentDetailInteractions(host);
    if (section) section.hidden = false;
  }

  function bindBannerImageFallbacks(root) {
    if (!root) return;
    root.querySelectorAll('img[data-fallback-src]').forEach(image => {
      if (image.dataset.fallbackBound === 'true') return;
      image.dataset.fallbackBound = 'true';
      image.addEventListener('error', () => {
        const fallback = image.dataset.fallbackSrc || '';
        if (fallback && image.src !== fallback && image.dataset.fallbackUsed !== 'true') {
          image.dataset.fallbackUsed = 'true';
          image.src = fallback;
        }
      });
    });
  }

  function ensureRandomFeaturedSection() {
    let section = document.getElementById('randomFeaturedSection');
    if (section) return section;
    const homeFeatured = document.getElementById('featuredSection');
    if (!homeFeatured) return null;
    section = document.createElement('section');
    section.className = 'featured-wrap tab-random-featured';
    section.id = 'randomFeaturedSection';
    section.hidden = true;
    section.innerHTML = '<div class="featured" id="randomFeatured" aria-roledescription="destaque" aria-label="Destaque aleatório da categoria"></div>';
    homeFeatured.insertAdjacentElement('afterend', section);
    return section;
  }

  function randomIndex(max) {
    if (max <= 1) return 0;
    if (window.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function chooseRandomFeatured(view, force = false) {
    const pool = randomFeaturedPools[view] || [];
    if (!pool.length) return null;
    const currentId = lastRandomFeaturedId[view];
    if (!force && currentId) {
      const current = pool.find(item => String(item.id || item.publicId || item.title) === currentId);
      if (current) return current;
    }
    let selected = pool[randomIndex(pool.length)];
    if (pool.length > 1 && currentId) {
      let attempts = 0;
      while (String(selected.id || selected.publicId || selected.title) === currentId && attempts < 8) {
        selected = pool[randomIndex(pool.length)];
        attempts += 1;
      }
    }
    lastRandomFeaturedId[view] = String(selected.id || selected.publicId || selected.title || '');
    return selected;
  }

  function renderRandomTabFeatured(view, force = false) {
    const section = ensureRandomFeaturedSection();
    const host = document.getElementById('randomFeatured');
    if (!section || !host || !['videos', 'films', 'movies', 'series'].includes(view)) {
      if (section) section.hidden = true;
      return;
    }

    const item = chooseRandomFeatured(view, force);
    if (!item) {
      host.innerHTML = '';
      section.hidden = true;
      return;
    }

    const collection = item.collection || (['films','movies'].includes(view) ? 'movies' : view === 'series' ? 'series' : 'videos');
    const title = item.title || item.name || 'Conteúdo';
    const preserveTitle = preservesOriginalMusicTitle(item);
    const thumbnail = item.thumbnailUrl || item.imageUrl || item.bannerUrl || '';
    const background = ['movies', 'series'].includes(collection)
      ? thumbnail
      : (item.bannerUrl || item.imageUrl || item.thumbnailUrl || '');
    const duration = item.duration || item.videoDuration || item.runtime || '';
    const year = item.year || '';
    const contentUrl = item.videoUrl || item.contentUrl || item.link || '#';
    const publicId = numericPublicId(item.publicId || item.id || title);
    const meta = [
      duration ? `<span class="f-duration">${escapeHtml(duration)}</span>` : '',
      duration && year ? '<span class="f-dot-sep"></span>' : '',
      year ? `<span class="f-year">${escapeHtml(year)}</span>` : ''
    ].join('');

    host.innerHTML = `<div class="f-slide active" data-index="0">
      <div class="f-info">
        <div class="f-logo${preserveTitle ? ' notranslate' : ''}"${preserveTitle ? ' translate="no"' : ''}>${item.logoUrl ? `<img loading="eager" decoding="async" fetchpriority="high" src="${safeAssetUrl(item.logoUrl)}" alt="${escapeHtml(title)}">` : escapeHtml(title)}</div>
        <div class="f-meta">${meta}</div>
        <div class="f-desc be-markdown">${markdownToHtml(item.description || '')}</div>
        <div class="f-actions">
          <button class="f-play" type="button" data-open-detail="true"
            data-item-id="${escapeHtml(String(publicId))}"
            data-record-id="${escapeHtml(String(item.id || ''))}"
            data-title="${escapeHtml(title)}"
            data-description="${escapeHtml(item.description || '')}"
            data-year="${escapeHtml(year)}"
            data-duration="${escapeHtml(duration)}"
            data-content-url="${safeUrl(contentUrl)}"
            data-image-url="${safeAssetUrl(thumbnail)}"
            data-banner-url="${safeAssetUrl(background)}"
            data-logo-url="${safeAssetUrl(item.logoUrl || '')}"
            data-collection="${escapeHtml(collection)}"
            data-section-id="${escapeHtml(String(item.sectionId || ''))}"
            data-section-name="${escapeHtml(String(item.sectionName || ''))}"
            data-preserve-title="${preserveTitle ? 'true' : 'false'}">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7-11-7Z"/></svg>Assistir
          </button>
          <button class="f-fav" type="button" data-favorite-id="${escapeHtml(`${collection}:${item.id || publicId}`)}" aria-label="Adicionar ${escapeHtml(title)} aos favoritos" aria-pressed="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-9.7-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.7 6c-2.2 4.4-9.7 9-9.7 9Z"/></svg>
          </button>
        </div>
      </div>
      <div class="f-media">${background ? `<img decoding="async" src="${safeAssetUrl(background)}" data-fallback-src="${safeAssetUrl(thumbnail)}" alt="${escapeHtml(title)}" loading="eager" decoding="async" fetchpriority="high">` : '<div class="ph ph-wide" style="height:100%"></div>'}</div>
    </div>`;

    section.dataset.featuredView = view;
    section.hidden = false;
    bindBannerImageFallbacks(host);
    setupFavoriteButtons(host);
    setupContentDetailInteractions(host);
  }

  async function renderVideoCatalog() {
    const main = document.querySelector('main');
    if (!main) return;

    const sections = (await beBackend.data.list('sections', { orderBy: 'order', direction: 'asc' }))
      .filter(section => section.active !== false);
    const [videoRows, movieRows, seriesRows, featuredRows, albumRows] = await Promise.all([
      beBackend.data.list('videos', { orderBy: 'order', direction: 'asc' }).catch(() => []),
      beBackend.data.list('movies', { orderBy: 'order', direction: 'asc' }).catch(() => []),
      beBackend.data.list('series', { orderBy: 'order', direction: 'asc' }).catch(() => []),
      beBackend.data.list('featured', { orderBy: 'order', direction: 'asc' }).catch(() => []),
      beBackend.data.list('news', { orderBy: 'order', direction: 'asc' }).catch(() => [])
    ]);
    const allVideos = videoRows.filter(video => video.active !== false);
    const allMovies = movieRows.filter(movie => movie.active !== false);
    const allSeries = seriesRows.filter(series => series.active !== false);
    const allAlbums = albumRows.filter(album => album.active !== false);
    randomFeaturedPools.videos = allVideos.map(item => ({ ...item, collection: 'videos' }));
    randomFeaturedPools.movies = allMovies.map(item => ({ ...item, collection: 'movies' }));
    randomFeaturedPools.series = allSeries.map(item => ({ ...item, collection: 'series' }));
    randomFeaturedPools.films = [...randomFeaturedPools.movies, ...randomFeaturedPools.series];
    ensureRandomFeaturedSection();
    const sourceMaps = {
      videos: new Map(allVideos.map(item => [String(item.id), item])),
      movies: new Map(allMovies.map(item => [String(item.id), item])),
      series: new Map(allSeries.map(item => [String(item.id), item]))
    };
    const featuredSeen = new Set();
    const featuredContents = featuredRows
      .filter(item => item.active !== false && (item.contentId || item.videoId))
      .map(item => {
        const collection = ['videos', 'movies', 'series'].includes(item.contentCollection || item.sourceCollection)
          ? (item.contentCollection || item.sourceCollection)
          : 'videos';
        const sourceId = String(item.contentId || item.videoId || '');
        const source = sourceMaps[collection]?.get(sourceId);
        const uniqueKey = `${collection}:${sourceId}`;
        if (!source || featuredSeen.has(uniqueKey)) return null;
        featuredSeen.add(uniqueKey);
        const thumbnail = source.thumbnailUrl || source.imageUrl || source.bannerUrl || item.imageUrl || item.bannerUrl || '';
        const background = ['movies', 'series'].includes(collection)
          ? thumbnail
          : (source.bannerUrl || source.imageUrl || source.thumbnailUrl || item.bannerUrl || item.imageUrl || '');
        return {
          ...source,
          title: source.title || item.title,
          description: source.description || item.description,
          thumbnailUrl: thumbnail,
          imageUrl: thumbnail,
          bannerUrl: background,
          videoUrl: source.videoUrl || source.contentUrl || source.link || item.contentUrl,
          contentUrl: source.contentUrl || source.videoUrl || source.link || item.contentUrl,
          duration: source.duration || source.videoDuration || source.runtime || item.duration,
          year: source.year || item.year,
          logoUrl: source.logoUrl || item.logoUrl || '',
          category: 'destaque',
          collection
        };
      })
      .filter(Boolean);
    if (!sections.length && !featuredContents.length && !allAlbums.length) return;

    const old = document.getElementById('dynamicSections');
    if (old) old.remove();

    const host = document.createElement('section');
    host.id = 'dynamicSections';
    host.className = 'video-catalog';
    host.setAttribute('aria-label', 'Categorias de conteúdos');

    if (featuredContents.length) {
      const recommendationTitle = localizedUiText('Recomendação de um fã');
      const featuredBlock = document.createElement('section');
      featuredBlock.className = 'video-rail-section featured-video-rail';
      featuredBlock.dataset.category = 'destaque';
      featuredBlock.dataset.collection = 'mixed';
      featuredBlock.dataset.homeView = 'default';
      featuredBlock.innerHTML = `
        <a class="video-rail-title" href="#" aria-label="${escapeHtml(recommendationTitle)}">
          <span>${escapeHtml(recommendationTitle)}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <div class="video-rail-shell">
          <button class="video-rail-arrow prev" type="button" aria-label="Ver recomendações anteriores" hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div class="video-rail" tabindex="0" aria-label="${escapeHtml(recommendationTitle)}">
            ${featuredContents.map(item => videoCard(item)).join('')}
          </div>
          <button class="video-rail-arrow next" type="button" aria-label="Ver mais recomendações">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>`;
      host.append(featuredBlock);
      setupRail(featuredBlock);
    }


    const appendLibrarySection = (title, collection, items) => {
      const block = document.createElement('section');
      block.className = 'video-rail-section film-library-section';
      block.dataset.category = normalizeText(title);
      block.dataset.collection = collection;
      block.dataset.homeView = 'films';
      block.hidden = true;
      block.innerHTML = `
        <a class="video-rail-title" href="#" aria-label="Ver todos: ${escapeHtml(title)}">
          <span>${escapeHtml(title)}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <div class="video-rail-shell">
          <button class="video-rail-arrow prev" type="button" aria-label="Ver conteúdos anteriores" hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div class="video-rail" tabindex="0" aria-label="${escapeHtml(title)}">
            ${items.length ? items.map(item => videoCard({ ...item, collection })).join('') : `<p class="video-rail-empty">Nenhum ${collection === 'movies' ? 'filme' : 'série'} publicado.</p>`}
          </div>
          <button class="video-rail-arrow next" type="button" aria-label="Ver mais conteúdos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>`;
      host.append(block);
      setupRail(block);
    };

    appendLibrarySection('Filmes', 'movies', allMovies);
    appendLibrarySection('Séries', 'series', allSeries);

    const normalizeSectionValue = value => normalizeText(String(value || '').replace(/-/g, ' '));
    const belongsToSection = (item, section, legacyIds, collection) => {
      if (item.sectionId && String(item.sectionId) === String(section.id)) return true;
      if (legacyIds.includes(String(item.id))) return true;

      const sectionKeys = new Set([
        normalizeSectionValue(section.title),
        normalizeSectionValue(section.category),
        normalizeSectionValue(section.slug),
        normalizeSectionValue(section.id)
      ].filter(Boolean));
      const itemKeys = [item.category, item.type, item.sectionName]
        .map(normalizeSectionValue)
        .filter(Boolean);
      if (itemKeys.some(value => sectionKeys.has(value))) return true;

      // Compatibilidade com filmes e séries antigos que ainda não tinham sectionId.
      if (!item.sectionId && collection === 'movies') {
        return [...sectionKeys].some(value => ['filme', 'filmes', 'movie', 'movies'].includes(value));
      }
      if (!item.sectionId && collection === 'series') {
        return [...sectionKeys].some(value => ['serie', 'series'].includes(value));
      }
      return false;
    };

    for (const section of sections) {
      const category = String(section.category || section.slug || section.id).trim().toLowerCase();
      const legacyIds = (Array.isArray(section.contentIds) ? section.contentIds : []).map(String);
      const limit = Math.max(1, Number(section.itemLimit || 12));

      let allSectionContents = [
        ...allVideos.filter(item => belongsToSection(item, section, legacyIds, 'videos')).map(item => ({ ...item, collection: 'videos' })),
        ...allMovies.filter(item => belongsToSection(item, section, legacyIds, 'movies')).map(item => ({ ...item, collection: 'movies' })),
        ...allSeries.filter(item => belongsToSection(item, section, legacyIds, 'series')).map(item => ({ ...item, collection: 'series' }))
      ].sort((a, b) => {
        const orderDifference = Number(a.order || 0) - Number(b.order || 0);
        if (orderDifference) return orderDifference;
        return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR');
      });
      let sectionContents = allSectionContents.slice(0, limit);

      if (!sectionContents.length && legacyIds.length) {
        const reads = await Promise.all(legacyIds.map(id => beBackend.data.get('contents', id)));
        allSectionContents = reads.filter(item => item && item.active !== false).map(item => ({ ...item, collection: item.collection || 'videos' }));
        sectionContents = allSectionContents.slice(0, limit);
      }

      const block = document.createElement('section');
      block.className = 'video-rail-section';
      block.dataset.sectionId = String(section.id || '');
      block.dataset.category = normalizeText(category);
      block.dataset.collection = 'mixed';
      block.dataset.homeView = 'default';
      block.dataset.hasVideos = String(allSectionContents.some(item => (item.collection || 'videos') === 'videos'));
      block.dataset.hasMovies = String(allSectionContents.some(item => item.collection === 'movies'));
      block.dataset.hasSeries = String(allSectionContents.some(item => item.collection === 'series'));
      block.innerHTML = `
        <a class="video-rail-title" href="${safeUrl(section.link || '#')}" aria-label="Ver todos: ${escapeHtml(section.title || 'Seção')}">
          <span>${escapeHtml(section.title || 'Seção')}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <div class="video-rail-shell">
          <button class="video-rail-arrow prev" type="button" aria-label="Ver conteúdos anteriores" hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div class="video-rail" tabindex="0" aria-label="${escapeHtml(section.title || 'Conteúdos')}">
            ${sectionContents.length ? sectionContents.map(item => videoCard(item)).join('') : '<p class="video-rail-empty">Nenhum conteúdo publicado nesta seção.</p>'}
            ${allSectionContents.length > sectionContents.length ? `<button class="video-rail-more" type="button" aria-label="Ver todos os conteúdos de ${escapeHtml(section.title || 'esta seção')}" title="Ver todos">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            </button>` : ''}
          </div>
          <button class="video-rail-arrow next" type="button" aria-label="Ver mais conteúdos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <template class="section-view-all-items">${allSectionContents.length ? allSectionContents.map(item => videoCard(item)).join('') : '<p class="video-rail-empty">Nenhum conteúdo publicado nesta seção.</p>'}</template>`;
      host.append(block);
      setupRail(block);
    }

    await addBillieHomeSpotlight(host);
    await addAlbumsHomeSection(host, allAlbums);
    await addDonateHomeSpotlight(host);
    main.insertAdjacentElement('afterend', host);
    setupContentDetailInteractions(host);
    setupSectionTitleInteractions(host);
    window.dispatchEvent(new Event('be:catalog-ready'));
  }

  async function addBillieHomeSpotlight(host) {
    if (!host || host.querySelector('.billie-home-spotlight')) return;
    const defaultBanner = '/assets/images/pages/billie-home-banner-default.webp';
    const spotlight = document.createElement('section');
    spotlight.className = 'billie-home-spotlight';
    spotlight.setAttribute('aria-label', localizedUiText('Conheça Billie Eilish'));
    spotlight.innerHTML = `
      <div class="billie-home-spotlight-frame">
        <img src="${defaultBanner}" alt="Billie Eilish" loading="lazy" decoding="async">
        <div class="billie-home-spotlight-overlay" aria-hidden="true"></div>
        <a class="billie-home-spotlight-button" href="/billie-eilish" data-open-billie="true">
          ${escapeHtml(localizedUiText('Conheça a Billie Eilish'))}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </a>
      </div>`;
    const homeSections = Array.from(host.querySelectorAll('.video-rail-section[data-home-view="default"]'));
    const anchor = homeSections[4] || homeSections[homeSections.length - 1];
    if (anchor) anchor.insertAdjacentElement('afterend', spotlight);
    else host.append(spotlight);

    const image = spotlight.querySelector('.billie-home-spotlight-frame > img');
    if (!image) return;
    image.addEventListener('error', () => {
      if (!image.src.endsWith(defaultBanner)) image.src = defaultBanner;
    });
  }



  async function addAlbumsHomeSection(host, albums) {
    if (!host || host.querySelector('.album-home-section')) return;
    const records = (Array.isArray(albums) ? albums : [])
      .filter(album => album && album.active !== false && String(album.title || '').trim())
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR'));
    if (!records.length) return;

    const localizedRoute = path => window.BETVLocaleURL ? window.BETVLocaleURL(path) : path;
    const block = document.createElement('section');
    block.className = 'video-rail-section album-home-section';
    block.dataset.category = 'albuns-singles';
    block.dataset.collection = 'news';
    block.dataset.homeView = 'default';
    block.innerHTML = `
      <a class="video-rail-title album-home-title" href="${escapeHtml(localizedRoute('/albuns'))}" data-open-albums="true" aria-label="${escapeHtml(localizedUiText('Ver todos: Álbuns & Singles'))}">
        <span>${escapeHtml(localizedUiText('Álbuns & Singles'))}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
      </a>
      <div class="video-rail-shell album-home-shell">
        <button class="video-rail-arrow prev" type="button" aria-label="${escapeHtml(localizedUiText('Ver álbuns anteriores'))}" hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div class="video-rail album-home-rail" tabindex="0" aria-label="${escapeHtml(localizedUiText('Álbuns & Singles'))}">
          ${records.map(album => {
            const title = String(album.title || 'Álbum').trim();
            const image = directImageUrlValue(album.imageUrl || album.thumbnailUrl || album.bannerUrl || '');
            const type = String(album.type || 'Álbum');
            const year = String(album.year || '');
            const route = localizedRoute('/albuns/' + encodeURIComponent(String(album.id || '')));
            return `<a class="album-home-card" href="${escapeHtml(route)}" data-album-route="${escapeHtml('/albuns/' + encodeURIComponent(String(album.id || '')))}" aria-label="${escapeHtml(title)}">
              <span class="album-home-cover">${image ? `<img src="${directImageUrl(image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '<i aria-hidden="true">♪</i>'}</span>
              <strong class="notranslate" translate="no">${escapeHtml(title)}</strong>
              <small>${escapeHtml([localizedUiText(type), year].filter(Boolean).join(' • '))}</small>
            </a>`;
          }).join('')}
        </div>
        <button class="video-rail-arrow next" type="button" aria-label="${escapeHtml(localizedUiText('Ver mais álbuns'))}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>`;
    const billie = host.querySelector('.billie-home-spotlight');
    if (billie) billie.insertAdjacentElement('afterend', block);
    else host.append(block);
    setupRail(block);
  }

  async function addDonateHomeSpotlight(host) {
    if (!host || host.querySelector('.donate-home-spotlight')) return;

    let settings = null;
    try {
      settings = await beBackend.data.get('settings', 'ong');
    } catch (_) {
      settings = null;
    }

    const rawBanner = String(settings?.bannerUrl || '').trim();
    if (!rawBanner) return;
    const banner = safeAssetUrl(rawBanner);
    if (!banner || banner === '#') return;

    const spotlight = document.createElement('section');
    spotlight.className = 'donate-home-spotlight';
    spotlight.setAttribute('aria-label', 'Apoie uma ONG');
    spotlight.innerHTML = `
      <div class="donate-home-spotlight-frame">
        <img src="${banner}" alt="Apoie uma ONG" loading="lazy" decoding="async">
        <div class="donate-home-spotlight-overlay" aria-hidden="true"></div>
        <a class="donate-home-spotlight-button" href="/ong" data-open-donate="true">Apoie uma ONG</a>
      </div>`;

    host.append(spotlight);
    const image = spotlight.querySelector('.donate-home-spotlight-frame > img');
    if (image) image.addEventListener('error', () => spotlight.remove(), { once:true });
  }

  const MUSIC_TITLE_SECTION_IDS_FRONTEND = new Set([
    '14386598-4978-403a-8548-db0ee582e291',
    '18db9515-179c-4bad-9646-1fcda63df14a'
  ]);
  function preservesOriginalMusicTitle(data) {
    if (String(data?.collection || 'videos').toLowerCase() !== 'videos') return false;
    const sectionId = String(data?.sectionId || '').trim();
    const sectionName = String(data?.sectionName || data?.sourceSectionTitle || '').trim().toLowerCase();
    return MUSIC_TITLE_SECTION_IDS_FRONTEND.has(sectionId) || ['live performances & tv','videoclipes'].includes(sectionName);
  }

  function videoCard(video) {
    const image = video.thumbnailUrl || video.imageUrl || video.bannerUrl || '';
    const contentHref = video.videoUrl || video.contentUrl || video.link || '#';
    const title = video.title || 'Abrir conteúdo';
    const category = video.category || video.type || video.contentType || '';
    const collection = video.collection || 'videos';
    const description = video.description || '';
    const year = video.year || '';
    const duration = video.duration || video.videoDuration || video.runtime || '';
    const banner = ['movies', 'series'].includes(String(collection).toLowerCase())
      ? image
      : (video.bannerUrl || video.imageUrl || video.thumbnailUrl || '');
    const logo = video.logoUrl || '';
    const showCardLogo = logo && logo !== '#' && String(collection).toLowerCase() !== 'videos';
    const recordId = video.id || video.videoId || title;
    const itemId = numericPublicId(video.publicId || recordId);
    const routeHref = detailRoutePath(itemId);
    const preserveTitle = preservesOriginalMusicTitle({ ...video, collection });
    return `<a class="video-card${preserveTitle ? ' notranslate' : ''}" ${preserveTitle ? 'translate="no"' : ''} href="${safeUrl(routeHref)}" aria-label="${escapeHtml(title)}"
      data-item-id="${escapeHtml(String(itemId))}"
      data-record-id="${escapeHtml(String(recordId))}"
      data-open-detail="true"
      data-title="${escapeHtml(title)}"
      data-description="${escapeHtml(description)}"
      data-year="${escapeHtml(year)}"
      data-duration="${escapeHtml(duration)}"
      data-content-url="${safeUrl(contentHref)}"
      data-image-url="${safeAssetUrl(image)}"
      data-banner-url="${safeAssetUrl(banner)}"
      data-logo-url="${safeAssetUrl(logo)}"
      data-title-search="${escapeHtml(normalizeText(title))}"
      data-category="${escapeHtml(normalizeText(category))}"
      data-collection="${escapeHtml(normalizeText(collection))}"
      data-section-id="${escapeHtml(String(video.sectionId || ''))}"
      data-section-name="${escapeHtml(String(video.sectionName || ''))}"
      data-preserve-title="${preserveTitle ? 'true' : 'false'}">
      <img class="video-card-thumbnail" src="${safeAssetUrl(image)}" alt="${escapeHtml(video.title || '')}" loading="lazy" decoding="async">
      ${showCardLogo ? `<span class="video-card-logo-slot" aria-hidden="true"><img class="video-card-logo" src="${safeAssetUrl(logo)}" alt="" loading="lazy" decoding="async" onerror="this.closest('.video-card-logo-slot')?.remove()"></span>` : ''}
    </a>`;
  }

  function cleanPathname() {
    try { return decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname || '/'))).replace(/\/+$/, '') || '/'; }
    catch (_) { return String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname || '/')).replace(/\/+$/, '') || '/'; }
  }

  function detailRouteId() {
    const pathMatch = cleanPathname().match(/^\/(\d{6,12})$/);
    if (pathMatch) return pathMatch[1];
    const legacyMatch = String(location.hash || '').match(/^#\/video\/([^/?#]+)/i);
    if (!legacyMatch) return '';
    try { return decodeURIComponent(legacyMatch[1]); } catch (_) { return legacyMatch[1]; }
  }

  function detailRoutePath(itemId) {
    return '/' + encodeURIComponent(String(itemId || '').trim());
  }

  function setDetailRoute(itemId, replace = false) {
    if (!itemId) return;
    const path = detailRoutePath(itemId);
    if (cleanPathname() === path && !location.hash) return;
    const url = path + (location.search || '');
    const returnView = currentCatalogView();
    const returnScrollY = Math.max(0, window.scrollY || 0);
    if (!replace && isMobileCatalogViewport() && history.state?.beRoute !== 'section' && !document.body.classList.contains('section-catalog-active')) {
      try {
        history.replaceState({
          ...(history.state || {}),
          beRoute: 'catalog',
          homeView: returnView,
          scrollY: returnScrollY
        }, '', location.pathname + (location.search || '') + (location.hash || ''));
      } catch (_) {}
    }
    const detailState = {
      beRoute: 'video',
      itemId: String(itemId),
      returnView,
      returnScrollY
    };
    if (replace) history.replaceState(detailState, '', url);
    else history.pushState(detailState, '', url);
  }

  async function openContentDetailFromRoute() {
    const itemId = detailRouteId();
    if (!itemId) {
      if (document.body.classList.contains('detail-page-active')) closeContentDetail(false, false);
      return false;
    }

    const cards = Array.from(document.querySelectorAll('[data-open-detail="true"]'));
    const card = cards.find(item => String(item.dataset.itemId || '') === itemId);
    if (card) {
      openContentDetail(cardDataWithSection(card), { updateRoute: false, instant: true });
      return true;
    }

    if (!window.beBackend) return false;
    for (const collection of ['videos', 'movies', 'series', 'contents']) {
      try {
        const items = await beBackend.data.list(collection, { orderBy: 'order', direction: 'asc' });
        const item = (items || []).find(candidate => {
          const candidateId = numericPublicId(candidate.publicId || candidate.id || candidate.title);
          return String(candidate.id || '') === itemId || candidateId === itemId;
        });
        if (!item || item.active === false) continue;
        openContentDetail({
          itemId: numericPublicId(item.publicId || item.id || itemId),
          recordId: item.id || '',
          title: item.title || 'Conteúdo',
          description: item.description || '',
          year: item.year || '',
          duration: item.duration || item.videoDuration || item.runtime || '',
          contentUrl: item.videoUrl || item.contentUrl || item.link || '#',
          imageUrl: item.thumbnailUrl || item.imageUrl || item.bannerUrl || '',
          bannerUrl: ['movies', 'series'].includes(collection)
            ? (item.thumbnailUrl || item.imageUrl || item.bannerUrl || '')
            : (item.bannerUrl || item.imageUrl || item.thumbnailUrl || ''),
          logoUrl: item.logoUrl || '',
          category: item.category || item.type || '',
          collection
        }, { updateRoute: false, instant: true });
        return true;
      } catch (_) {}
    }
    return false;
  }

  function setupContentDetailInteractions(host) {
    if (!host) return;
    host.querySelectorAll('[data-open-detail="true"]').forEach(card => {
      if (card.dataset.detailBound === 'true') return;
      card.dataset.detailBound = 'true';
      card.addEventListener('click', event => {
        event.preventDefault();
        openContentDetail(cardDataWithSection(card), { updateRoute: true });
      });
    });
  }

  let activeSectionView = null;
  let activeSectionReturnState = null;

  function isMobileCatalogViewport() {
    return window.matchMedia('(max-width:760px)').matches;
  }

  function currentCatalogView() {
    const view = normalizeText(document.body.dataset.homeView || 'home');
    return ['home', 'films', 'movies', 'series', 'videos'].includes(view) ? view : 'home';
  }

  function catalogViewButton(view) {
    const normalized = ['films', 'movies', 'series', 'videos'].includes(view) ? view : 'home';
    return normalized === 'home'
      ? document.getElementById('logoBtn')
      : document.querySelector(`[data-home-view="${normalized}"]`);
  }

  function restoreCatalogView(view, scrollY = 0) {
    const normalized = ['films', 'movies', 'series', 'videos'].includes(normalizeText(view))
      ? normalizeText(view)
      : 'home';
    const button = catalogViewButton(normalized);
    if (button && currentCatalogView() !== normalized) {
      button.dataset.beHistoryMode = 'none';
      button.click();
      delete button.dataset.beHistoryMode;
    }
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: Math.max(0, Number(scrollY) || 0), left: 0, behavior: 'auto' });
    });
  }

  function sectionHomeUrl() {
    const url = new URL(location.href);
    url.pathname = '/';
    url.hash = '';
    ['video','content','section'].forEach(name => url.searchParams.delete(name));
    return url.pathname + (url.search || '');
  }

  function returnSectionToPrevious() {
    const fallback = activeSectionReturnState || { homeView: 'home', scrollY: 0, historyPushed: false };
    window.dispatchEvent(new CustomEvent('be:close-public-search'));
    window.dispatchEvent(new CustomEvent('be:close-notification-menus'));
    if (fallback.historyPushed && history.length > 1) {
      history.back();
      return;
    }
    closeSectionView(false);
    restoreCatalogView(fallback.homeView, fallback.scrollY);
  }

  function closeSectionView(scrollHome = false) {
    const host = document.getElementById('dynamicSections');
    if (!host || !host.classList.contains('section-view-mode')) return;
    const active = activeSectionView || host.querySelector('.section-view-active');
    const activeRail = active?.querySelector?.('.video-rail');
    if (activeRail && typeof activeRail._beHomeMarkup === 'string') {
      activeRail.innerHTML = activeRail._beHomeMarkup;
      delete activeRail._beHomeMarkup;
      setupContentDetailInteractions(activeRail);
    }
    host.classList.remove('section-view-mode');
    document.body.classList.remove('section-catalog-active', 'featured-section-catalog-active');
    host.querySelectorAll('.video-rail-section').forEach(section => {
      section.classList.remove('section-view-active');
      if (section.dataset.sectionViewPreviousHidden !== undefined) {
        section.hidden = section.dataset.sectionViewPreviousHidden === 'true';
        delete section.dataset.sectionViewPreviousHidden;
      }
    });
    host.querySelectorAll('.section-view-back,.section-view-mobile-home').forEach(button => button.remove());
    activeSectionView = null;
    activeSectionReturnState = null;
    if (scrollHome && active) active.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  window.addEventListener('be:close-section-view', () => closeSectionView(false));

  function openSectionView(section, options = {}) {
    const host = section?.closest?.('#dynamicSections');
    if (!host || !section) return;
    const requestedCollection = normalizeText(options.collection || '');
    if (host.classList.contains('section-view-mode') && activeSectionView === section) return;
    const returnView = normalizeText(options.returnView || currentCatalogView());
    const returnScrollY = Number.isFinite(Number(options.returnScrollY))
      ? Math.max(0, Number(options.returnScrollY))
      : Math.max(0, window.scrollY || 0);
    closeSectionView(false);
    activeSectionView = section;
    activeSectionReturnState = {
      homeView: ['films', 'movies', 'series', 'videos'].includes(returnView) ? returnView : 'home',
      scrollY: returnScrollY,
      historyPushed: false
    };
    host.querySelectorAll('.video-rail-section').forEach(item => {
      item.dataset.sectionViewPreviousHidden = String(Boolean(item.hidden));
      item.hidden = item !== section;
    });
    host.classList.add('section-view-mode');
    document.body.classList.add('section-catalog-active');
    const isFeaturedSectionView = normalizeText(section.dataset.category || '') === 'destaque' || section.classList.contains('featured-video-rail');
    document.body.classList.toggle('featured-section-catalog-active', isFeaturedSectionView);
    section.hidden = false;
    section.classList.add('section-view-active');
    const rail = section.querySelector('.video-rail');
    const allItems = section.querySelector('.section-view-all-items');
    if (rail && allItems) {
      rail._beHomeMarkup = rail.innerHTML;
      if (requestedCollection) {
        const filteredItems = document.createElement('div');
        filteredItems.innerHTML = allItems.innerHTML;
        filteredItems.querySelectorAll('.video-card').forEach(card => {
          const collection = normalizeText(card.dataset.collection || 'videos');
          if (collection !== requestedCollection) card.remove();
        });
        const hasMatchingItems = Boolean(filteredItems.querySelector('.video-card'));
        const emptyLabel = requestedCollection === 'movies' ? 'Nenhum filme publicado nesta seção.' : requestedCollection === 'series' ? 'Nenhuma série publicada nesta seção.' : 'Nenhum vídeo publicado nesta seção.';
        rail.innerHTML = hasMatchingItems
          ? filteredItems.innerHTML
          : '<p class="video-rail-empty">'+emptyLabel+'</p>';
      } else {
        rail.innerHTML = allItems.innerHTML;
      }
      setupContentDetailInteractions(rail);
    }

    const title = section.querySelector('.video-rail-title span')?.textContent?.trim() || 'Seção';
    section.setAttribute('aria-label', title);

    section.querySelector('.section-view-mobile-home')?.remove();
    const mobileHomeButton = document.createElement('button');
    mobileHomeButton.className = 'section-view-mobile-home';
    mobileHomeButton.type = 'button';
    mobileHomeButton.setAttribute('aria-label', 'Voltar para a página anterior');
    mobileHomeButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
    mobileHomeButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      returnSectionToPrevious();
    });
    const titleNode = section.querySelector('.video-rail-title');
    if (titleNode && titleNode.parentNode === section) {
      titleNode.insertAdjacentElement('afterend', mobileHomeButton);
    } else {
      section.appendChild(mobileHomeButton);
    }

    if (options.updateHistory !== false) {
      try {
        const previousState = {
          ...(history.state || {}),
          beRoute: 'catalog',
          homeView: activeSectionReturnState.homeView,
          scrollY: activeSectionReturnState.scrollY
        };
        const currentUrl = location.pathname + (location.search || '') + (location.hash || '');
        history.replaceState(previousState, '', currentUrl);
        history.pushState({
          beRoute: 'section',
          sectionTitle: title,
          collection: requestedCollection || '',
          returnView: activeSectionReturnState.homeView,
          returnScrollY: activeSectionReturnState.scrollY
        }, '', currentUrl);
        activeSectionReturnState.historyPushed = true;
      } catch (_) {}
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function setupSectionTitleInteractions(host) {
    if (!host) return;

    if (host.dataset.sectionDelegated !== 'true') {
      host.dataset.sectionDelegated = 'true';
      host.addEventListener('click', event => {
        const moreButton = event.target.closest('.video-rail-more');
        if (moreButton && host.contains(moreButton)) {
          const section = moreButton.closest('.video-rail-section');
          if (!section) return;
          event.preventDefault();
          event.stopPropagation();
          const titleLink = section.querySelector('.video-rail-title');
          if (titleLink) titleLink.click();
          else openSectionView(section);
          return;
        }

        const title = event.target.closest('.video-rail-title');
        if (!title || !host.contains(title)) return;
        const section = title.closest('.video-rail-section');
        if (!section) return;
        event.preventDefault();
        event.stopPropagation();
        if (title.matches('[data-open-albums]')) {
          const url = new URL(title.href || '/albuns', location.origin);
          history.pushState({ beRoute: '/albuns' }, '', url.pathname + (location.search || ''));
          window.dispatchEvent(new PopStateEvent('popstate', { state: { beRoute: '/albuns' } }));
          return;
        }

        const originView = currentCatalogView();
        const originScrollY = Math.max(0, window.scrollY || 0);
        const sectionTitle = normalizeText(title.querySelector('span')?.textContent || '');
        const sectionCategory = normalizeText(section.dataset.category || '');
        const sectionId = String(section.dataset.sectionId || '').trim();
        const combinedFilmsSectionId = 'abeedcc2-d001-4f05-9d51-5a0c284e4047';
        const combinedSectionNames = [
          'filmes e series',
          'filmes & series',
          'films and series',
          'films & series',
          'movies and series',
          'movies & series',
          'peliculas y series',
          'peliculas & series'
        ];
        const isFilmsAndSeriesSection = sectionId === combinedFilmsSectionId
          || [sectionTitle, sectionCategory].some(value => combinedSectionNames.includes(value))
          || (section.dataset.hasMovies === 'true'
            && section.dataset.hasSeries === 'true'
            && section.dataset.hasVideos !== 'true');

        // A seção combinada da Home funciona como atalho para a aba Filmes,
        // onde Filmes e Séries permanecem organizados em trilhos separados.
        if (isFilmsAndSeriesSection) {
          closeSectionView(false);
          const filmsButton = document.querySelector('[data-home-view="films"]');
          if (filmsButton) {
            filmsButton.dataset.beHistoryMode = 'push';
            filmsButton.click();
            delete filmsButton.dataset.beHistoryMode;
          }
          return;
        }

        // Filmes e Séries abrem em páginas dedicadas. Mesmo que uma seção
        // tenha vínculos mistos no dashboard, o catálogo mostra somente o
        // tipo indicado pelo título/categoria clicado.
        const explicitCollection = normalizeText(section.dataset.collection || '');
        const dedicatedCollection = explicitCollection === 'movies' || explicitCollection === 'series'
          ? explicitCollection
          : ([sectionTitle, sectionCategory].some(value => ['filme','filmes','movie','movies'].includes(value))
              ? 'movies'
              : ([sectionTitle, sectionCategory].some(value => ['serie','series'].includes(value)) ? 'series' : ''));
        if (dedicatedCollection) {
          closeSectionView(false);
          const filmsButton = document.querySelector('[data-home-view="films"]');
          if (filmsButton) {
            filmsButton.dataset.beHistoryMode = 'none';
            filmsButton.click();
            delete filmsButton.dataset.beHistoryMode;
          }
          window.requestAnimationFrame(() => {
            window.setTimeout(() => openSectionView(section, {
              collection: dedicatedCollection,
              returnView: originView,
              returnScrollY: originScrollY
            }), 80);
          });
          return;
        }

        // Se a seção foi vinculada a conteúdos de Vídeos no dashboard,
        // ativa a aba Vídeos e abre a seção clicada mostrando todos os
        // vídeos vinculados a ela, sem misturar filmes ou séries.
        if (section.dataset.hasVideos === 'true') {
          closeSectionView(false);
          const videosTab = document.querySelector('[data-home-view="videos"]');
          if (videosTab) {
            videosTab.dataset.beHistoryMode = 'none';
            videosTab.click();
            delete videosTab.dataset.beHistoryMode;
          }
          window.requestAnimationFrame(() => {
            window.setTimeout(() => openSectionView(section, {
              collection: 'videos',
              returnView: originView,
              returnScrollY: originScrollY
            }), 80);
          });
          return;
        }

        openSectionView(section, { returnView: originView, returnScrollY: originScrollY });
      }, true);
    }

    if (document.body.dataset.sectionExitBound !== 'true') {
      document.body.dataset.sectionExitBound = 'true';
      document.addEventListener('click', event => {
        if (event.target.closest('#logoBtn,button[data-home-view],a[data-home-view],[data-public-action="support"]')) closeSectionView(false);
      });
      window.addEventListener('popstate', event => {
        const host = document.getElementById('dynamicSections');
        if (!host?.classList.contains('section-view-mode')) return;
        // Ao voltar de um conteúdo aberto dentro da seção, mantém a seção visível.
        if (event.state?.beRoute === 'section') return;
        const fallback = activeSectionReturnState || {};
        const destination = event.state && event.state.beRoute === 'catalog'
          ? event.state
          : fallback;
        closeSectionView(false);
        restoreCatalogView(destination.homeView || fallback.homeView || 'home',
          destination.scrollY ?? fallback.scrollY ?? 0);
      });
    }
  }

  function cardDataWithSection(card) {
    const section = card?.closest?.('.video-rail-section');
    const sectionTitle = card?.dataset?.sourceSectionTitle || section?.querySelector?.('.video-rail-title span')?.textContent?.trim() || '';
    const sectionKey = card?.dataset?.sourceSectionKey || [
      section?.dataset?.collection || card?.dataset?.collection || '',
      section?.dataset?.category || card?.dataset?.category || '',
      sectionTitle
    ].join('|');
    return {
      ...(card?.dataset || {}),
      recordId: card?.dataset?.recordId || '',
      sourceSectionKey: sectionKey,
      sourceSectionTitle: sectionTitle
    };
  }

  function shuffleItems(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  function recommendationCard(data) {
    const image = data.imageUrl || data.thumbnailUrl || data.bannerUrl || '';
    const title = data.title || 'Conteúdo';
    const contentHref = data.contentUrl || '#';
    const routeHref = detailRoutePath(data.itemId || numericPublicId(data.recordId || title));
    const preserveTitle = data.preserveTitle === true || String(data.preserveTitle || '').toLowerCase() === 'true' || preservesOriginalMusicTitle(data);
    return `<a class="detail-reco-card${preserveTitle ? ' notranslate' : ''}" ${preserveTitle ? 'translate="no"' : ''} href="${safeUrl(routeHref)}" data-open-detail="true"
      data-item-id="${escapeHtml(String(data.itemId || numericPublicId(data.recordId || title)))}"
      data-record-id="${escapeHtml(String(data.recordId || ''))}"
      data-title="${escapeHtml(title)}"
      data-description="${escapeHtml(data.description || '')}"
      data-year="${escapeHtml(data.year || '')}"
      data-duration="${escapeHtml(data.duration || '')}"
      data-content-url="${safeUrl(contentHref)}"
      data-image-url="${safeAssetUrl(image)}"
      data-banner-url="${safeAssetUrl(['movies', 'series'].includes(String(data.collection || '').toLowerCase()) ? image : (data.bannerUrl || image))}"
      data-logo-url="${safeAssetUrl(data.logoUrl || '')}"
      data-category="${escapeHtml(data.category || '')}"
      data-collection="${escapeHtml(data.collection || '')}"
      data-source-section-key="${escapeHtml(data.sourceSectionKey || '')}"
      data-source-section-title="${escapeHtml(data.sourceSectionTitle || '')}"
      data-section-id="${escapeHtml(String(data.sectionId || ''))}"
      data-section-name="${escapeHtml(String(data.sectionName || data.sourceSectionTitle || ''))}"
      data-preserve-title="${preserveTitle ? 'true' : 'false'}"
      aria-label="Abrir ${escapeHtml(title)}">
      <span class="detail-reco-thumb">${image && image !== '#' ? `<img src="${safeAssetUrl(image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async">` : '<span class="ph ph-wide" style="height:100%"></span>'}</span>
      <span class="detail-reco-name">${escapeHtml(title)}</span>
    </a>`;
  }

  function renderDetailRecommendations(current) {
    const panel = document.getElementById('detailRecommendations');
    const moreRail = document.getElementById('detailMoreRail');
    const catalog = document.getElementById('dynamicSections');
    if (!panel || !moreRail || !catalog) return;

    const currentId = String(current.itemId || current.title || '');
    const uniqueById = items => items.filter((item, index, array) => {
      const id = String(item.itemId || item.title || '');
      return array.findIndex(other => String(other.itemId || other.title || '') === id) === index;
    });

    // A seção de recomendações sempre usa nove conteúdos aleatórios do catálogo,
    // excluindo o conteúdo que está aberto. Os cards continuam disponíveis no DOM
    // mesmo quando uma aba ou seção dedicada está visualmente oculta.
    const all = uniqueById(Array.from(catalog.querySelectorAll('.video-card'))
      .map(cardDataWithSection)
      .filter(item => String(item.itemId || item.title || '') !== currentId));
    const recommendations = shuffleItems(all).slice(0, 9);

    moreRail.innerHTML = recommendations.length
      ? recommendations.map(recommendationCard).join('')
      : '<p class="detail-reco-empty">Nenhuma recomendação disponível no momento.</p>';

    setupContentDetailInteractions(panel);
    panel.hidden = false;
    panel.removeAttribute('hidden');
    panel.setAttribute('aria-hidden', 'false');
  }


  function googleDriveFileId(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const url = new URL(raw, location.origin);
      const host = String(url.hostname || '').toLowerCase();
      if (!['drive.google.com', 'drive.usercontent.google.com'].includes(host)) return '';
      const pathMatch = String(url.pathname || '').match(/\/file\/d\/([^/]+)/i)
        || String(url.pathname || '').match(/\/d\/([^/]+)/i);
      const fileId = pathMatch?.[1] || url.searchParams.get('id') || '';
      return /^[a-z0-9_-]{10,}$/i.test(fileId) ? fileId : '';
    } catch (_) {
      return '';
    }
  }

  function googleDriveResourceKey(value) {
    try {
      const url = new URL(String(value || '').trim(), location.origin);
      const resourceKey = String(url.searchParams.get('resourcekey') || '').trim();
      return /^[a-z0-9_-]+$/i.test(resourceKey) ? resourceKey : '';
    } catch (_) {
      return '';
    }
  }

  function parseMediaStartSeconds(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return 0;
    if (/^\d+$/.test(raw)) return Math.max(0, Number(raw));
    const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
    if (!match) return 0;
    return Math.max(0, (Number(match[1] || 0) * 3600) + (Number(match[2] || 0) * 60) + Number(match[3] || 0));
  }

  function youtubeMediaInfo(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    try {
      const url = new URL(raw, location.origin);
      const host = String(url.hostname || '').toLowerCase().replace(/^www\./, '');
      const youtubeHosts = ['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com'];
      const isShortHost = host === 'youtu.be';
      if (!isShortHost && !youtubeHosts.includes(host)) return null;

      const parts = String(url.pathname || '').split('/').filter(Boolean);
      let videoId = '';
      if (isShortHost) videoId = parts[0] || '';
      else if (['embed', 'shorts', 'live', 'v'].includes(parts[0] || '')) videoId = parts[1] || '';
      else videoId = url.searchParams.get('v') || '';

      const playlistId = String(url.searchParams.get('list') || '').trim();
      if (videoId && !/^[a-z0-9_-]{6,20}$/i.test(videoId)) videoId = '';
      if (!videoId && !/^[a-z0-9_-]{6,80}$/i.test(playlistId)) return null;

      const startSeconds = parseMediaStartSeconds(
        url.searchParams.get('start') || url.searchParams.get('t') || url.searchParams.get('time_continue') || ''
      );
      return { videoId, playlistId, startSeconds };
    } catch (_) {
      return null;
    }
  }

  function youtubeEmbedUrl(info) {
    if (!info) return '';
    const params = new URLSearchParams({
      autoplay: '1',
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      enablejsapi: '1',
      origin: location.origin
    });
    if (info.playlistId) params.set('list', info.playlistId);
    if (info.startSeconds > 0) params.set('start', String(info.startSeconds));
    const path = info.videoId
      ? `embed/${encodeURIComponent(info.videoId)}`
      : 'embed/videoseries';
    return `https://www.youtube-nocookie.com/${path}?${params.toString()}`;
  }

  function youtubeWatchUrl(info) {
    if (!info) return '';
    const params = new URLSearchParams();
    if (info.videoId) params.set('v', info.videoId);
    if (info.playlistId) params.set('list', info.playlistId);
    if (info.startSeconds > 0) params.set('t', `${info.startSeconds}s`);
    return info.videoId
      ? `https://www.youtube.com/watch?${params.toString()}`
      : `https://www.youtube.com/playlist?list=${encodeURIComponent(info.playlistId || '')}`;
  }

  function vkVideoInfo(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    try {
      const url = new URL(raw, location.origin);
      const host = String(url.hostname || '').toLowerCase().replace(/^www\./, '');
      if (host !== 'vkvideo.ru' && host !== 'vk.com') return null;

      let ownerId = '';
      let videoId = '';
      let hash = '';

      if (/\/video_ext\.php$/i.test(url.pathname)) {
        ownerId = String(url.searchParams.get('oid') || '').trim();
        videoId = String(url.searchParams.get('id') || '').trim();
        hash = String(url.searchParams.get('hash') || '').trim();
      } else {
        const match = String(url.pathname || '').match(/\/video(-?\d+)_(\d+)/i);
        if (match) {
          ownerId = match[1] || '';
          videoId = match[2] || '';
        }
      }

      if (!/^-?\d+$/.test(ownerId) || !/^\d+$/.test(videoId)) return null;
      if (hash && !/^[a-z0-9_-]+$/i.test(hash)) hash = '';
      return { ownerId, videoId, hash };
    } catch (_) {
      return null;
    }
  }

  function vkVideoEmbedUrl(info) {
    if (!info) return '';
    const params = new URLSearchParams({
      oid: info.ownerId,
      id: info.videoId,
      autoplay: '1',
      js_api: '1',
      hd: '4'
    });
    if (info.hash) params.set('hash', info.hash);
    return `https://vkvideo.ru/video_ext.php?${params.toString()}`;
  }

  function vkVideoWatchUrl(info) {
    if (!info) return '';
    return `https://vkvideo.ru/video${encodeURIComponent(info.ownerId)}_${encodeURIComponent(info.videoId)}`;
  }

  function googleDrivePreviewUrl(fileId, resourceKey = '') {
    const params = new URLSearchParams({ autoplay: '1' });
    if (resourceKey) params.set('resourcekey', resourceKey);
    return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview?${params.toString()}`;
  }

  function googleDriveStreamUrl(fileId, resourceKey = '') {
    const params = new URLSearchParams({ id: fileId });
    if (resourceKey) params.set('resourcekey', resourceKey);
    return `/api/drive-media?${params.toString()}`;
  }

  function googleDriveDirectStreamUrl(fileId, resourceKey = '') {
    const params = new URLSearchParams({ export: 'download', id: fileId, confirm: 't' });
    if (resourceKey) params.set('resourcekey', resourceKey);
    return `https://drive.google.com/uc?${params.toString()}`;
  }

  function normalizeDriveMediaKind(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'audio' || normalized === 'music' || normalized === 'song') return 'audio';
    if (normalized === 'video' || normalized === 'movie' || normalized === 'film') return 'video';
    return '';
  }

  function inferDriveMediaKind(...values) {
    const text = values.map(value => String(value || '').trim().toLowerCase()).filter(Boolean).join(' | ');
    if (!text) return '';
    if (/(^|[\s._/?:=&-])(mp4|m4v|webm|mov|mkv)(?=$|[\s._/?:=&-])|\b(v[ií]deo|video|filme|movie|s[eé]rie|series|vlog|entrevista|festival|show)\b/i.test(text)) return 'video';
    if (/(^|[\s._/?:=&-])(mp3|m4a|aac|wav|ogg|oga|opus|flac)(?=$|[\s._/?:=&-])|\b([aá]udio|audio|m[uú]sica|musica|song|faixa|track|album|[aá]lbum|podcast)\b/i.test(text)) return 'audio';
    return '';
  }

  async function googleDriveMediaKind(fileId, resourceKey = '') {
    if (!fileId) return '';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const metadataUrl = new URL(googleDriveStreamUrl(fileId, resourceKey), location.origin);
      metadataUrl.searchParams.set('metadata', '1');
      const response = await fetch(`${metadataUrl.pathname}${metadataUrl.search}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal
      });
      if (!response.ok) return '';
      const payload = await response.json().catch(() => ({}));
      const declaredKind = normalizeDriveMediaKind(payload?.kind);
      if (declaredKind) return declaredKind;
      const contentType = String(payload?.contentType || '').trim().toLowerCase();
      if (contentType.startsWith('audio/')) return 'audio';
      if (contentType.startsWith('video/')) return 'video';
      return inferDriveMediaKind(payload?.filename, contentType);
    } catch (_) {
      // O player continua e tenta a URL direta/preview quando a sondagem falha.
      return '';
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function formatPlayerTime(value) {
    const seconds = Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;
    return hours
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
      : `${minutes}:${String(rest).padStart(2, '0')}`;
  }

  function drivePlayerMarkup() {
    return `<div class="drive-player-overlay" id="drivePlayerOverlay" hidden aria-hidden="true">
      <section class="drive-player-shell" id="drivePlayerShell" role="dialog" aria-modal="true" aria-label="Reprodutor de mídia">
        <div class="drive-player-backdrop" id="drivePlayerBackdrop" hidden aria-hidden="true">
          <img class="drive-player-backdrop-image" id="drivePlayerBackdropImage" alt="">
        </div>
        <video class="drive-player-video" id="drivePlayerVideo" preload="metadata" playsinline></video>
        <div class="drive-player-frame-shell" id="drivePlayerFrameShell" hidden>
          <iframe class="drive-player-frame" id="drivePlayerFrame" title="Reprodutor de mídia" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
        </div>
        <div class="drive-player-loading" id="drivePlayerLoading" role="status" aria-label="Carregando mídia"><span class="drive-player-loader" aria-hidden="true"></span><span class="drive-player-loading-message" hidden></span><a class="drive-player-support-link" href="/suporte" data-public-action="support" data-support-target="contact" hidden>Informe o erro ao suporte</a></div>
        <div class="drive-player-top-controls">
          <button class="drive-player-icon drive-player-fullscreen" id="drivePlayerFullscreen" type="button" aria-label="Entrar em tela cheia" title="Tela cheia">
            <svg class="fullscreen-enter" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 5H5v5M5 5l6 6M14 19h5v-5M19 19l-6-6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg class="fullscreen-exit" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9h4a1 1 0 0 0 1-1V4M20 9h-4a1 1 0 0 1-1-1V4M4 15h4a1 1 0 0 1 1 1v4M20 15h-4a1 1 0 0 0-1 1v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="drive-player-icon drive-player-volume" id="drivePlayerVolume" type="button" aria-label="Silenciar" title="Silenciar">
            <svg class="volume-on" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            <svg class="volume-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9 4 4m0-4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </button>
          <button class="drive-player-icon drive-player-external" id="drivePlayerExternal" type="button" aria-label="Abrir no Google Drive" title="Abrir no Google Drive">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="drive-player-icon drive-player-close" id="drivePlayerClose" type="button" aria-label="Fechar reprodutor" title="Fechar">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="drive-player-center-controls" aria-label="Controles de reprodução">
          <button class="drive-player-skip" id="drivePlayerBack10" type="button" aria-label="Voltar 10 segundos" title="Voltar 10 segundos">
            <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 18H8V6"/><path d="M10 18a24 24 0 1 1-2 18"/><text x="32" y="40">10</text></svg>
          </button>
          <button class="drive-player-toggle" id="drivePlayerToggle" type="button" aria-label="Pausar" title="Pausar">
            <svg class="pause-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zm7 0h3v14h-3z"/></svg>
            <svg class="play-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7-11-7Z"/></svg>
          </button>
          <button class="drive-player-skip" id="drivePlayerForward10" type="button" aria-label="Avançar 10 segundos" title="Avançar 10 segundos">
            <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M44 18h12V6"/><path d="M54 18a24 24 0 1 0 2 18"/><text x="32" y="40">10</text></svg>
          </button>
        </div>
        <div class="drive-player-bottom-controls">
          <input class="drive-player-progress" id="drivePlayerProgress" type="range" min="0" max="1000" value="0" step="1" aria-label="Progresso da mídia">
          <div class="drive-player-time"><span id="drivePlayerCurrent">0:00</span><span aria-hidden="true">/</span><span id="drivePlayerDuration">0:00</span></div>
        </div>
      </section>
    </div>`;
  }

  function setupGoogleDrivePlayer() {
    if (document.body.dataset.drivePlayerBound === 'true') return;
    document.body.dataset.drivePlayerBound = 'true';
    document.body.insertAdjacentHTML('beforeend', drivePlayerMarkup());

    const overlay = document.getElementById('drivePlayerOverlay');
    const shell = document.getElementById('drivePlayerShell');
    const backdrop = document.getElementById('drivePlayerBackdrop');
    const backdropImage = document.getElementById('drivePlayerBackdropImage');
    const video = document.getElementById('drivePlayerVideo');
    const frameShell = document.getElementById('drivePlayerFrameShell');
    const frame = document.getElementById('drivePlayerFrame');
    const loading = document.getElementById('drivePlayerLoading');
    const loadingText = loading?.querySelector('.drive-player-loading-message');
    const supportLink = loading?.querySelector('.drive-player-support-link');
    const fullscreenButton = document.getElementById('drivePlayerFullscreen');
    const closeButton = document.getElementById('drivePlayerClose');
    const externalButton = document.getElementById('drivePlayerExternal');
    const volumeButton = document.getElementById('drivePlayerVolume');
    const toggleButton = document.getElementById('drivePlayerToggle');
    const backButton = document.getElementById('drivePlayerBack10');
    const forwardButton = document.getElementById('drivePlayerForward10');
    const progress = document.getElementById('drivePlayerProgress');
    const currentLabel = document.getElementById('drivePlayerCurrent');
    const durationLabel = document.getElementById('drivePlayerDuration');
    if (!overlay || !shell || !backdrop || !backdropImage || !video || !frameShell || !frame || !loading || !loadingText || !supportLink || !fullscreenButton || !closeButton || !externalButton || !volumeButton || !toggleButton || !backButton || !forwardButton || !progress || !currentLabel || !durationLabel) return;

    let fallbackTimer = 0;
    let controlsTimer = 0;
    let controlsInteracting = false;
    let previousFocus = null;
    let activeFileId = '';
    let activeResourceKey = '';
    let activeBannerUrl = '';
    let activeTitle = '';
    let activeMediaKind = '';
    let activeProvider = '';
    let activeExternalUrl = '';
    let frameMode = false;
    let audioMode = false;
    let streamAttempt = '';
    let metadataProbeFinished = false;
    let mediaReady = false;
    let openingToken = 0;
    let youtubeMuted = false;
    let vkPlayer = null;
    let vkApiReady = false;
    let vkApiPromise = null;
    let vkInitTimer = 0;
    let vkCurrentTime = 0;
    let vkDuration = 0;
    let vkPaused = true;
    let vkMuted = false;
    let vkVolume = 1;

    const currentFullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;

    const playerOwnsFullscreen = () => {
      const fullscreenElement = currentFullscreenElement();
      return Boolean(fullscreenElement && (fullscreenElement === shell || fullscreenElement === overlay || shell.contains(fullscreenElement)));
    };

    const syncFullscreenButton = () => {
      const active = playerOwnsFullscreen();
      overlay.classList.toggle('is-browser-fullscreen', active);
      fullscreenButton.setAttribute('aria-label', active ? 'Sair da tela cheia' : 'Entrar em tela cheia');
      fullscreenButton.title = active ? 'Sair da tela cheia' : 'Tela cheia';
    };

    const toggleBrowserFullscreen = async () => {
      try {
        if (playerOwnsFullscreen()) {
          if (typeof document.exitFullscreen === 'function') await document.exitFullscreen();
          else if (typeof document.webkitExitFullscreen === 'function') document.webkitExitFullscreen();
        } else if (typeof shell.requestFullscreen === 'function') {
          await shell.requestFullscreen();
        } else if (typeof shell.webkitRequestFullscreen === 'function') {
          shell.webkitRequestFullscreen();
        }
      } catch (_) {
        // Alguns navegadores recusam tela cheia fora de uma interação direta.
      }
      syncFullscreenButton();
      showControls(true);
    };

    const postYouTubeCommand = (func, args = []) => {
      if (activeProvider !== 'youtube' || !frameMode || !frame.contentWindow) return false;
      try {
        frame.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func,
          args
        }), '*');
        return true;
      } catch (_) {
        return false;
      }
    };

    const ensureVkVideoApi = () => {
      if (window.VK && typeof window.VK.VideoPlayer === 'function') return Promise.resolve(window.VK);
      if (vkApiPromise) return vkApiPromise;

      vkApiPromise = new Promise((resolve, reject) => {
        const finish = () => {
          if (window.VK && typeof window.VK.VideoPlayer === 'function') resolve(window.VK);
          else reject(new Error('VK Video API indisponível'));
        };
        const existing = document.querySelector('script[data-be-vk-video-api]');
        if (existing) {
          existing.addEventListener('load', finish, { once: true });
          existing.addEventListener('error', () => reject(new Error('Falha ao carregar VK Video API')), { once: true });
          window.setTimeout(finish, 2500);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://vk.com/js/api/videoplayer.js';
        script.async = true;
        script.dataset.beVkVideoApi = 'true';
        script.addEventListener('load', finish, { once: true });
        script.addEventListener('error', () => reject(new Error('Falha ao carregar VK Video API')), { once: true });
        document.head.appendChild(script);
      }).catch(error => {
        vkApiPromise = null;
        throw error;
      });

      return vkApiPromise;
    };

    const resetVkState = () => {
      window.clearTimeout(vkInitTimer);
      vkInitTimer = 0;
      if (vkPlayer && typeof vkPlayer.destroy === 'function') {
        try { vkPlayer.destroy(); } catch (_) {}
      }
      vkPlayer = null;
      vkApiReady = false;
      vkCurrentTime = 0;
      vkDuration = 0;
      vkPaused = true;
      vkMuted = false;
      vkVolume = 1;
      overlay.classList.remove('is-vk-api-mode');
    };

    const syncVkPlayerState = (state = {}, eventName = '') => {
      if (activeProvider !== 'vkvideo' || !frameMode) return;
      const time = Number(state && state.time);
      const duration = Number(state && state.duration);
      const volume = Number(state && state.volume);
      const muted = state && typeof state.muted === 'boolean' ? state.muted : null;
      const stateName = String((state && state.state) || eventName || '').trim().toLowerCase();

      if (Number.isFinite(time) && time >= 0) vkCurrentTime = time;
      if (Number.isFinite(duration) && duration > 0) vkDuration = duration;
      if (Number.isFinite(volume) && volume >= 0) vkVolume = Math.min(1, volume);
      if (muted !== null) vkMuted = muted;

      if (['started', 'resumed', 'playing'].includes(stateName)) vkPaused = false;
      else if (['paused', 'ended'].includes(stateName)) vkPaused = true;

      const ratio = vkDuration > 0 ? Math.min(1, Math.max(0, vkCurrentTime / vkDuration)) : 0;
      progress.value = String(Math.round(ratio * 1000));
      progress.style.setProperty('--drive-progress', `${Math.round(ratio * 10000) / 100}%`);
      currentLabel.textContent = formatPlayerTime(vkCurrentTime);
      durationLabel.textContent = formatPlayerTime(vkDuration);
      overlay.classList.toggle('is-paused', vkPaused);
      overlay.classList.toggle('is-muted', vkMuted || vkVolume === 0);
      toggleButton.setAttribute('aria-label', vkPaused ? 'Reproduzir' : 'Pausar');
      toggleButton.title = vkPaused ? 'Reproduzir' : 'Pausar';
      volumeButton.setAttribute('aria-label', vkMuted || vkVolume === 0 ? 'Ativar som' : 'Silenciar');
      volumeButton.title = vkMuted || vkVolume === 0 ? 'Ativar som' : 'Silenciar';

      if (!mediaReady) {
        mediaReady = true;
        setLoadingMessage('', false);
        setPlayerInteractive(true);
      }
      showControls(vkPaused);
    };

    const readVkPlayerState = () => {
      if (!vkPlayer || !vkApiReady) return;
      const snapshot = {};
      try {
        const value = vkPlayer.getCurrentTime && vkPlayer.getCurrentTime();
        if (Number.isFinite(Number(value))) snapshot.time = Number(value);
      } catch (_) {}
      try {
        const value = vkPlayer.getDuration && vkPlayer.getDuration();
        if (Number.isFinite(Number(value))) snapshot.duration = Number(value);
      } catch (_) {}
      try {
        const value = vkPlayer.getVolume && vkPlayer.getVolume();
        if (Number.isFinite(Number(value))) snapshot.volume = Number(value);
      } catch (_) {}
      try {
        const value = vkPlayer.isMuted && vkPlayer.isMuted();
        if (typeof value === 'boolean') snapshot.muted = value;
      } catch (_) {}
      try {
        const value = vkPlayer.getState && vkPlayer.getState();
        if (typeof value === 'string') snapshot.state = value;
      } catch (_) {}
      syncVkPlayerState(snapshot);
    };

    const bindVkPlayerApi = (token, attempt = 0) => {
      if (activeProvider !== 'vkvideo' || overlay.hidden || token !== openingToken) return;
      ensureVkVideoApi().then(() => {
        if (activeProvider !== 'vkvideo' || overlay.hidden || token !== openingToken) return;
        try {
          if (vkPlayer && typeof vkPlayer.destroy === 'function') {
            try { vkPlayer.destroy(); } catch (_) {}
          }
          vkPlayer = window.VK.VideoPlayer(frame);
          vkApiReady = true;
          overlay.classList.add('is-vk-api-mode');
          setPlayerInteractive(true);
          setLoadingMessage('', false);

          const onState = eventName => state => syncVkPlayerState(state || {}, eventName);
          ['inited', 'timeupdate', 'volumechange', 'started', 'resumed', 'paused', 'ended'].forEach(eventName => {
            if (vkPlayer && typeof vkPlayer.on === 'function') vkPlayer.on(eventName, onState(eventName));
          });
          if (vkPlayer && typeof vkPlayer.on === 'function') {
            vkPlayer.on('error', () => {
              // O iframe continua utilizável mesmo quando a API não consegue controlar uma mídia específica.
              overlay.classList.remove('is-vk-api-mode');
              vkApiReady = false;
              setPlayerInteractive(false);
              loading.hidden = true;
            });
          }
          readVkPlayerState();
          window.setTimeout(readVkPlayerState, 250);
          window.setTimeout(readVkPlayerState, 900);
        } catch (_) {
          if (attempt < 8) {
            window.clearTimeout(vkInitTimer);
            vkInitTimer = window.setTimeout(() => bindVkPlayerApi(token, attempt + 1), 280 + (attempt * 120));
          } else {
            vkApiReady = false;
            overlay.classList.remove('is-vk-api-mode');
            setPlayerInteractive(false);
            loading.hidden = true;
          }
        }
      }).catch(() => {
        if (activeProvider !== 'vkvideo' || overlay.hidden || token !== openingToken) return;
        vkApiReady = false;
        overlay.classList.remove('is-vk-api-mode');
        setPlayerInteractive(false);
        loading.hidden = true;
      });
    };

    const clearPlayerTimers = () => {
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(controlsTimer);
      fallbackTimer = 0;
      controlsTimer = 0;
    };

    const setLoadingMessage = (message, visible = true, revealText = false) => {
      loadingText.textContent = String(message || '');
      loadingText.hidden = !revealText;
      supportLink.hidden = !revealText;
      loading.setAttribute('aria-label', String(message || 'Carregando mídia'));
      loading.hidden = !visible;
      overlay.classList.toggle('is-loading', visible);
    };

    const setPlayerInteractive = enabled => {
      const disabled = !enabled;
      toggleButton.disabled = disabled;
      backButton.disabled = disabled;
      forwardButton.disabled = disabled;
      volumeButton.disabled = disabled;
      progress.disabled = disabled;
    };

    const applyBackdrop = () => {
      const hasBanner = Boolean(activeBannerUrl && activeBannerUrl !== '#');
      backdrop.hidden = !audioMode;
      overlay.classList.toggle('has-backdrop', audioMode && hasBanner);
      backdropImage.alt = activeTitle ? `Capa de ${activeTitle}` : 'Capa do áudio';
      if (hasBanner) {
        if (backdropImage.getAttribute('src') !== activeBannerUrl) backdropImage.setAttribute('src', activeBannerUrl);
      } else {
        backdropImage.removeAttribute('src');
      }
    };

    const setAudioMode = enabled => {
      audioMode = Boolean(enabled);
      overlay.classList.toggle('is-audio-mode', audioMode);
      overlay.classList.toggle('is-audio-frame-mode', audioMode && frameMode);
      applyBackdrop();
    };

    const applyMediaKind = kind => {
      const normalized = String(kind || '').trim().toLowerCase();
      if (normalized !== 'audio' && normalized !== 'video') return;
      activeMediaKind = normalized;
      if (normalized === 'audio') {
        setAudioMode(true);
        if (!mediaReady) setLoadingMessage('Carregando MP3 do Google Drive...');
      } else if (!frameMode) {
        setAudioMode(false);
      }
    };

    const detectAudioMode = () => {
      if (overlay.hidden || frameMode) return;
      const hasVideoDimensions = Number(video.videoWidth) > 0 && Number(video.videoHeight) > 0;
      const shouldUseAudioMode = video.readyState >= 1 && !hasVideoDimensions;
      if (shouldUseAudioMode) activeMediaKind = 'audio';
      else if (hasVideoDimensions) activeMediaKind = 'video';
      setAudioMode(shouldUseAudioMode);
    };

    const canAutoHideSiteControls = () => {
      if (overlay.hidden || overlay.classList.contains('is-loading') || overlay.classList.contains('is-error')) return false;
      if (!frameMode) return true;
      return activeProvider === 'vkvideo' && overlay.classList.contains('is-vk-api-mode');
    };

    const hideControlsForInactivity = () => {
      window.clearTimeout(controlsTimer);
      if (!canAutoHideSiteControls() || controlsInteracting) return;
      overlay.classList.remove('controls-visible');
      overlay.classList.add('controls-idle');
    };

    const showControls = (_keepVisible = false) => {
      overlay.classList.remove('controls-idle');
      overlay.classList.add('controls-visible');
      window.clearTimeout(controlsTimer);
      if (!canAutoHideSiteControls() || controlsInteracting) return;
      controlsTimer = window.setTimeout(hideControlsForInactivity, 3000);
    };

    const syncPlayerState = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const current = Number.isFinite(video.currentTime) ? video.currentTime : 0;
      const ratio = duration > 0 ? Math.min(1, Math.max(0, current / duration)) : 0;
      progress.value = String(Math.round(ratio * 1000));
      progress.style.setProperty('--drive-progress', `${Math.round(ratio * 10000) / 100}%`);
      currentLabel.textContent = formatPlayerTime(current);
      durationLabel.textContent = formatPlayerTime(duration);
      overlay.classList.toggle('is-paused', video.paused);
      overlay.classList.toggle('is-muted', video.muted || video.volume === 0);
      toggleButton.setAttribute('aria-label', video.paused ? 'Reproduzir' : 'Pausar');
      toggleButton.title = video.paused ? 'Reproduzir' : 'Pausar';
      volumeButton.setAttribute('aria-label', video.muted || video.volume === 0 ? 'Ativar som' : 'Silenciar');
      volumeButton.title = video.muted || video.volume === 0 ? 'Ativar som' : 'Silenciar';
    };

    const armFallbackTimer = (callback, delay) => {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = window.setTimeout(callback, delay);
    };

    const markMediaReady = () => {
      if (overlay.hidden || frameMode) return;
      mediaReady = true;
      window.clearTimeout(fallbackTimer);
      overlay.classList.remove('is-error');
      setLoadingMessage('', false);
      setPlayerInteractive(true);
      detectAudioMode();
      syncPlayerState();
      showControls();
    };

    const showStreamError = () => {
      if (overlay.hidden) return;
      mediaReady = false;
      window.clearTimeout(fallbackTimer);
      overlay.classList.add('is-error');
      setPlayerInteractive(false);
      setLoadingMessage('Não foi possível carregar esta mídia.', true, true);
      showControls(true);
    };

    const proxyStreamUrl = (fileId, resourceKey = '', retry = false) => {
      const url = new URL(googleDriveStreamUrl(fileId, resourceKey), location.origin);
      if (retry) url.searchParams.set('retry', String(Date.now()));
      return `${url.pathname}${url.search}`;
    };

    const requestPlayback = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => showControls(true));
      }
    };

    const useFrameFallback = () => {
      if (!activeFileId || frameMode || overlay.hidden) return;
      if (activeMediaKind === 'audio' || audioMode) {
        showStreamError('O MP3 não pôde ser reproduzido. Confirme se o arquivo está público para qualquer pessoa com o link.');
        return;
      }
      frameMode = true;
      streamAttempt = 'frame';
      window.clearTimeout(fallbackTimer);
      video.pause();
      video.removeAttribute('src');
      video.load();
      frame.src = googleDrivePreviewUrl(activeFileId, activeResourceKey);
      frameShell.hidden = false;
      overlay.classList.add('is-frame-mode', 'is-drive-frame-mode');
      loading.hidden = true;
      overlay.classList.remove('is-loading');
      setPlayerInteractive(false);
      showControls(true);
    };

    const loadProxyStream = retry => {
      if (!activeFileId || overlay.hidden || frameMode) return;
      mediaReady = false;
      streamAttempt = retry ? 'proxy-retry' : 'proxy';
      overlay.classList.remove('is-error');
      setPlayerInteractive(false);
      setLoadingMessage(audioMode || activeMediaKind === 'audio'
        ? (retry ? 'Tentando carregar o MP3 novamente...' : 'Carregando MP3 do Google Drive...')
        : (retry ? 'Tentando carregar a mídia novamente...' : 'Carregando mídia do Google Drive...'));
      video.pause();
      video.src = proxyStreamUrl(activeFileId, activeResourceKey, retry);
      video.load();
      requestPlayback();
      armFallbackTimer(() => {
        if (mediaReady || overlay.hidden || frameMode) return;
        if (activeMediaKind === 'audio' || audioMode) {
          if (!retry) {
            setLoadingMessage('O Google Drive ainda está preparando o MP3...');
            loadProxyStream(true);
          } else {
            showStreamError('O MP3 demorou demais para carregar. Confirme se ele está público para qualquer pessoa com o link.');
          }
          return;
        }
        if (!metadataProbeFinished && !retry) {
          setLoadingMessage('O Google Drive ainda está preparando o arquivo...');
          loadProxyStream(true);
          return;
        }
        tryDirectDriveStream();
      }, retry ? 26000 : 18000);
    };

    const tryDirectDriveStream = () => {
      if (!activeFileId || frameMode || overlay.hidden || streamAttempt === 'direct') return;
      if (activeMediaKind === 'audio' || audioMode) {
        if (streamAttempt !== 'proxy-retry') loadProxyStream(true);
        else showStreamError('Não foi possível acessar o MP3 pelo link público do Google Drive.');
        return;
      }
      mediaReady = false;
      streamAttempt = 'direct';
      window.clearTimeout(fallbackTimer);
      setPlayerInteractive(false);
      setLoadingMessage('Aguardando o Google Drive liberar o arquivo...');
      video.pause();
      video.src = googleDriveDirectStreamUrl(activeFileId, activeResourceKey);
      video.load();
      requestPlayback();
      armFallbackTimer(useFrameFallback, 18000);
    };

    const handleStreamFailure = () => {
      if (overlay.hidden || frameMode || mediaReady) return;
      if (activeMediaKind === 'audio' || audioMode) {
        if (streamAttempt === 'proxy') loadProxyStream(true);
        else showStreamError('Não foi possível carregar o MP3. Verifique a permissão pública do arquivo no Google Drive.');
        return;
      }
      if (streamAttempt === 'proxy') tryDirectDriveStream();
      else if (streamAttempt === 'proxy-retry') tryDirectDriveStream();
      else useFrameFallback();
    };

    const closePlayer = () => {
      if (overlay.hidden) return;
      if (playerOwnsFullscreen()) {
        try {
          if (typeof document.exitFullscreen === 'function') document.exitFullscreen();
          else if (typeof document.webkitExitFullscreen === 'function') document.webkitExitFullscreen();
        } catch (_) {}
      }
      openingToken += 1;
      clearPlayerTimers();
      resetVkState();
      video.pause();
      video.removeAttribute('src');
      video.load();
      frame.src = 'about:blank';
      frameShell.hidden = true;
      loading.hidden = false;
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      frameMode = false;
      mediaReady = false;
      setAudioMode(false);
      activeBannerUrl = '';
      activeTitle = '';
      activeMediaKind = '';
      activeProvider = '';
      activeExternalUrl = '';
      streamAttempt = '';
      metadataProbeFinished = false;
      applyBackdrop();
      overlay.classList.remove('is-open', 'is-frame-mode', 'is-drive-frame-mode', 'is-audio-frame-mode', 'is-youtube-mode', 'is-vk-api-mode', 'is-loading', 'is-error', 'controls-visible', 'controls-idle', 'is-paused', 'is-muted', 'is-browser-fullscreen');
      youtubeMuted = false;
      document.body.classList.remove('drive-player-open');
      activeFileId = '';
      activeResourceKey = '';
      progress.value = '0';
      progress.style.setProperty('--drive-progress', '0%');
      currentLabel.textContent = '0:00';
      durationLabel.textContent = '0:00';
      setPlayerInteractive(false);
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({ preventScroll: true });
      previousFocus = null;
    };

    supportLink.addEventListener('click', () => {
      closePlayer();
    });

    const openPlayer = (fileId, resourceKey = '', context = {}) => {
      if (!fileId) return;
      closePlayer();
      const token = ++openingToken;
      activeFileId = fileId;
      activeResourceKey = resourceKey;
      const requestedBanner = String(context?.bannerUrl || '').trim();
      const safeBanner = requestedBanner ? safeAssetUrlValue(requestedBanner) : '';
      activeBannerUrl = safeBanner && safeBanner !== '#' ? safeBanner : '';
      activeTitle = String(context?.title || '').trim();
      activeProvider = 'drive';
      const resourceQuery = resourceKey ? `?resourcekey=${encodeURIComponent(resourceKey)}` : '';
      activeExternalUrl = `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view${resourceQuery}`;
      externalButton.setAttribute('aria-label', 'Abrir no Google Drive');
      externalButton.title = 'Abrir no Google Drive';
      frame.title = 'Reprodutor do Google Drive';
      activeMediaKind = normalizeDriveMediaKind(context?.mediaKind)
        || inferDriveMediaKind(context?.mediaType, context?.contentType, context?.category, activeTitle, context?.contentUrl);
      frameMode = false;
      streamAttempt = '';
      metadataProbeFinished = false;
      mediaReady = false;
      setAudioMode(activeMediaKind === 'audio');
      applyBackdrop();
      previousFocus = document.activeElement;
      overlay.hidden = false;
      overlay.setAttribute('aria-hidden', 'false');
      overlay.classList.remove('is-frame-mode', 'is-drive-frame-mode', 'is-youtube-mode', 'is-error');
      overlay.classList.add('is-open', 'controls-visible', 'is-paused');
      document.body.classList.add('drive-player-open');
      frameShell.hidden = true;
      frame.src = 'about:blank';
      setPlayerInteractive(false);
      setLoadingMessage(activeMediaKind === 'audio' ? 'Carregando MP3 do Google Drive...' : 'Preparando arquivo do Google Drive...');

      googleDriveMediaKind(fileId, resourceKey).then(kind => {
        metadataProbeFinished = true;
        if (overlay.hidden || activeFileId !== fileId || token !== openingToken) return;
        applyMediaKind(kind);
      });

      loadProxyStream(false);
      closeButton.focus({ preventScroll: true });
    };

    const openYouTubePlayer = (info, context = {}) => {
      const embedUrl = youtubeEmbedUrl(info);
      if (!embedUrl) return;
      closePlayer();
      openingToken += 1;
      activeProvider = 'youtube';
      activeExternalUrl = youtubeWatchUrl(info);
      activeTitle = String(context?.title || '').trim();
      activeMediaKind = 'video';
      frameMode = true;
      mediaReady = false;
      previousFocus = document.activeElement;
      setAudioMode(false);
      overlay.hidden = false;
      overlay.setAttribute('aria-hidden', 'false');
      youtubeMuted = false;
      overlay.classList.remove('is-error', 'is-loading', 'is-drive-frame-mode', 'is-audio-frame-mode', 'is-muted');
      overlay.classList.add('is-open', 'is-frame-mode', 'is-youtube-mode', 'controls-visible');
      document.body.classList.add('drive-player-open');
      video.pause();
      video.removeAttribute('src');
      video.load();
      frameShell.hidden = false;
      loading.hidden = true;
      loadingText.hidden = true;
      frame.title = activeTitle ? `YouTube — ${activeTitle}` : 'Reprodutor do YouTube';
      frame.src = embedUrl;
      externalButton.setAttribute('aria-label', 'Abrir no YouTube');
      externalButton.title = 'Abrir no YouTube';
      setPlayerInteractive(false);
      volumeButton.disabled = false;
      volumeButton.setAttribute('aria-label', 'Silenciar');
      volumeButton.title = 'Silenciar';
      closeButton.focus({ preventScroll: true });
    };

    const openVkVideoPlayer = (info, context = {}) => {
      const embedUrl = vkVideoEmbedUrl(info);
      if (!embedUrl) return;
      closePlayer();
      const token = ++openingToken;
      activeProvider = 'vkvideo';
      activeExternalUrl = vkVideoWatchUrl(info);
      activeTitle = String(context?.title || '').trim();
      activeMediaKind = 'video';
      frameMode = true;
      mediaReady = false;
      previousFocus = document.activeElement;
      setAudioMode(false);
      resetVkState();
      overlay.hidden = false;
      overlay.setAttribute('aria-hidden', 'false');
      youtubeMuted = false;
      overlay.classList.remove('is-error', 'is-drive-frame-mode', 'is-audio-frame-mode', 'is-youtube-mode', 'is-vk-api-mode', 'is-muted');
      overlay.classList.add('is-open', 'is-frame-mode', 'controls-visible', 'is-paused');
      document.body.classList.add('drive-player-open');
      video.pause();
      video.removeAttribute('src');
      video.load();
      frameShell.hidden = false;
      frame.title = activeTitle ? `VK Video — ${activeTitle}` : 'Reprodutor do VK Video';
      setPlayerInteractive(false);
      setLoadingMessage('Sincronizando VK Video com o player...', true);
      frame.src = embedUrl;
      externalButton.setAttribute('aria-label', 'Abrir no VK Video');
      externalButton.title = 'Abrir no VK Video';
      bindVkPlayerApi(token);
      closeButton.focus({ preventScroll: true });
    };

    const togglePlayback = () => {
      if (activeProvider === 'vkvideo' && frameMode) {
        if (!vkPlayer || !vkApiReady) return;
        try {
          if (vkPaused) vkPlayer.play();
          else vkPlayer.pause();
        } catch (_) {}
        showControls(true);
        return;
      }
      if (frameMode) return;
      if (!mediaReady && video.readyState < 2) {
        setLoadingMessage(audioMode ? 'Aguardando o MP3 ficar pronto...' : 'Aguardando a mídia ficar pronta...');
        requestPlayback();
        return;
      }
      if (video.paused) requestPlayback();
      else video.pause();
    };

    document.addEventListener('click', event => {
      const link = event.target.closest('#contentDetailPlay');
      if (!link) return;
      const mediaUrl = link.dataset.contentUrl || link.getAttribute('href') || link.href;
      const fileId = googleDriveFileId(mediaUrl);
      const youtubeInfo = youtubeMediaInfo(mediaUrl);
      const vkInfo = vkVideoInfo(mediaUrl);
      if (!fileId && !youtubeInfo && !vkInfo) return;

      const linkedContent = contentDataFromElement(link);
      const detailBannerImage = document.querySelector('#contentDetailBg img');
      const bannerUrl = link.dataset.bannerUrl
        || linkedContent.bannerUrl
        || detailBannerImage?.currentSrc
        || detailBannerImage?.src
        || linkedContent.imageUrl
        || '';
      const title = link.dataset.title || linkedContent.title || '';

      event.preventDefault();
      if (youtubeInfo) {
        openYouTubePlayer(youtubeInfo, { bannerUrl, title, contentUrl: mediaUrl });
        return;
      }
      if (vkInfo) {
        openVkVideoPlayer(vkInfo, { bannerUrl, title, contentUrl: mediaUrl });
        return;
      }

      const explicitKind = normalizeDriveMediaKind(link.dataset.mediaKind || link.dataset.mediaType || '');
      const inferredKind = explicitKind || inferDriveMediaKind(
        link.dataset.contentType,
        link.dataset.category,
        linkedContent.collection,
        title,
        mediaUrl
      );
      openPlayer(fileId, googleDriveResourceKey(mediaUrl), {
        bannerUrl,
        title,
        mediaKind: inferredKind,
        mediaType: link.dataset.mediaType || '',
        contentType: link.dataset.contentType || '',
        category: link.dataset.category || '',
        contentUrl: mediaUrl
      });
    }, true);

    fullscreenButton.addEventListener('click', toggleBrowserFullscreen);
    closeButton.addEventListener('click', closePlayer);
    externalButton.addEventListener('click', () => {
      if (!activeExternalUrl) return;
      window.open(activeExternalUrl, '_blank', 'noopener,noreferrer');
      showControls(true);
    });
    volumeButton.addEventListener('click', () => {
      if (activeProvider === 'youtube' && frameMode) {
        youtubeMuted = !youtubeMuted;
        postYouTubeCommand(youtubeMuted ? 'mute' : 'unMute');
        overlay.classList.toggle('is-muted', youtubeMuted);
        volumeButton.setAttribute('aria-label', youtubeMuted ? 'Ativar som' : 'Silenciar');
        volumeButton.title = youtubeMuted ? 'Ativar som' : 'Silenciar';
        showControls(true);
        return;
      }
      if (activeProvider === 'vkvideo' && frameMode) {
        if (!vkPlayer || !vkApiReady) return;
        try {
          if (vkMuted || vkVolume === 0) vkPlayer.unmute();
          else vkPlayer.mute();
        } catch (_) {}
        showControls(true);
        return;
      }
      if (frameMode || !mediaReady) return;
      video.muted = !video.muted;
      syncPlayerState();
      showControls();
    });
    frame.addEventListener('load', () => {
      if (activeProvider === 'youtube') {
        window.setTimeout(() => {
          if (youtubeMuted) postYouTubeCommand('mute');
        }, 120);
        return;
      }
      if (activeProvider === 'vkvideo' && frame.src && frame.src !== 'about:blank') {
        const token = openingToken;
        window.setTimeout(() => bindVkPlayerApi(token), 80);
      }
    });
    toggleButton.addEventListener('click', togglePlayback);
    backButton.addEventListener('click', () => {
      if (activeProvider === 'vkvideo' && frameMode && vkPlayer && vkApiReady) {
        try { vkPlayer.seek(Math.max(0, vkCurrentTime - 10)); } catch (_) {}
      } else if (!frameMode && mediaReady) {
        video.currentTime = Math.max(0, video.currentTime - 10);
      }
      showControls();
    });
    forwardButton.addEventListener('click', () => {
      if (activeProvider === 'vkvideo' && frameMode && vkPlayer && vkApiReady) {
        const target = vkDuration > 0 ? Math.min(vkDuration, vkCurrentTime + 10) : vkCurrentTime + 10;
        try { vkPlayer.seek(target); } catch (_) {}
      } else if (!frameMode && mediaReady) {
        video.currentTime = Math.min(Number.isFinite(video.duration) ? video.duration : video.currentTime + 10, video.currentTime + 10);
      }
      showControls();
    });
    progress.addEventListener('input', () => {
      if (activeProvider === 'vkvideo' && frameMode) {
        if (!vkPlayer || !vkApiReady || vkDuration <= 0) return;
        const target = (Number(progress.value) / 1000) * vkDuration;
        vkCurrentTime = target;
        try { vkPlayer.seek(target); } catch (_) {}
        syncVkPlayerState({ time: target, duration: vkDuration, muted: vkMuted, volume: vkVolume, state: vkPaused ? 'paused' : 'playing' });
        showControls(true);
        return;
      }
      if (frameMode || !mediaReady || !Number.isFinite(video.duration) || video.duration <= 0) return;
      video.currentTime = (Number(progress.value) / 1000) * video.duration;
      syncPlayerState();
      showControls(true);
    });
    progress.addEventListener('pointerdown', () => {
      controlsInteracting = true;
      window.clearTimeout(controlsTimer);
      overlay.classList.remove('controls-idle');
      overlay.classList.add('controls-visible');
    });
    const releaseControlsInteraction = () => {
      if (!controlsInteracting) return;
      controlsInteracting = false;
      showControls();
    };
    progress.addEventListener('pointerup', releaseControlsInteraction);
    progress.addEventListener('pointercancel', releaseControlsInteraction);
    progress.addEventListener('change', () => {
      controlsInteracting = false;
      showControls();
    });

    shell.addEventListener('pointermove', () => showControls());
    shell.addEventListener('pointerdown', event => {
      if (event.target.closest('button,input,iframe')) return;
      showControls();
    });
    shell.addEventListener('touchstart', () => showControls(), { passive: true });
    shell.addEventListener('keydown', () => showControls());
    shell.addEventListener('dblclick', event => {
      const vkControllable = activeProvider === 'vkvideo' && frameMode && vkApiReady;
      if ((frameMode && !vkControllable) || event.target.closest('button,input,iframe')) return;
      togglePlayback();
    });

    video.addEventListener('loadstart', () => {
      mediaReady = false;
      setPlayerInteractive(false);
    });
    video.addEventListener('loadedmetadata', () => {
      detectAudioMode();
      syncPlayerState();
      setLoadingMessage(audioMode ? 'Sincronizando o MP3 com o player...' : 'Sincronizando mídia com o player...');
      showControls(true);
    });
    video.addEventListener('loadeddata', markMediaReady);
    video.addEventListener('canplay', markMediaReady);
    video.addEventListener('playing', markMediaReady);
    video.addEventListener('timeupdate', syncPlayerState);
    video.addEventListener('durationchange', () => {
      detectAudioMode();
      syncPlayerState();
    });
    video.addEventListener('volumechange', syncPlayerState);
    video.addEventListener('play', () => { detectAudioMode(); syncPlayerState(); showControls(); });
    video.addEventListener('pause', () => { detectAudioMode(); syncPlayerState(); showControls(true); });
    video.addEventListener('ended', () => { detectAudioMode(); syncPlayerState(); showControls(true); });
    video.addEventListener('waiting', () => {
      if (!mediaReady) setLoadingMessage(audioMode ? 'Aguardando dados do MP3...' : 'Aguardando dados da mídia...');
    });
    video.addEventListener('stalled', () => {
      if (!mediaReady) setLoadingMessage(audioMode ? 'O Google Drive ainda está enviando o MP3...' : 'O Google Drive ainda está enviando a mídia...');
    });
    video.addEventListener('error', handleStreamFailure);

    window.addEventListener('keydown', event => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') {
        if (playerOwnsFullscreen()) return;
        event.preventDefault();
        closePlayer();
        return;
      }
      if (event.key.toLowerCase() === 'f' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) {
        event.preventDefault();
        toggleBrowserFullscreen();
        return;
      }
      const vkControllable = activeProvider === 'vkvideo' && frameMode && vkApiReady;
      if ((frameMode && !vkControllable) || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) return;
      if (event.key === ' ' || event.key.toLowerCase() === 'k') {
        event.preventDefault();
        togglePlayback();
      } else if (event.key === 'ArrowLeft' && mediaReady) {
        event.preventDefault();
        if (vkControllable) {
          try { vkPlayer.seek(Math.max(0, vkCurrentTime - 10)); } catch (_) {}
        } else {
          video.currentTime = Math.max(0, video.currentTime - 10);
        }
      } else if (event.key === 'ArrowRight' && mediaReady) {
        event.preventDefault();
        if (vkControllable) {
          const target = vkDuration > 0 ? Math.min(vkDuration, vkCurrentTime + 10) : vkCurrentTime + 10;
          try { vkPlayer.seek(target); } catch (_) {}
        } else {
          video.currentTime = Math.min(Number.isFinite(video.duration) ? video.duration : video.currentTime + 10, video.currentTime + 10);
        }
      } else if (event.key.toLowerCase() === 'm' && mediaReady) {
        event.preventDefault();
        if (vkControllable) {
          try {
            if (vkMuted || vkVolume === 0) vkPlayer.unmute();
            else vkPlayer.mute();
          } catch (_) {}
        } else {
          video.muted = !video.muted;
        }
      }
      if (vkControllable) readVkPlayerState();
      else syncPlayerState();
      showControls();
    });

    const handlePlayerFullscreenChange = () => {
      syncFullscreenButton();
      if (!overlay.hidden && overlay.classList.contains('is-open')) showControls();
    };
    document.addEventListener('fullscreenchange', handlePlayerFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handlePlayerFullscreenChange);
    window.addEventListener('pagehide', closePlayer);
    window.addEventListener('be:close-drive-player', closePlayer);
    setPlayerInteractive(false);
  }

  function setupDetailControls() {
    setupGoogleDrivePlayer();
    const section = document.getElementById('contentDetailSection');
    const back = document.getElementById('detailBackButton');
    if (back && back.dataset.bound !== 'true') {
      back.dataset.bound = 'true';
      back.addEventListener('click', () => {
        if (detailRouteId() && history.state?.beRoute === 'video' && history.length > 1) {
          history.back();
          return;
        }
        closeContentDetail(true);
      });
    }
    if (section && section.dataset.bound !== 'true') {
      section.dataset.bound = 'true';
      window.addEventListener('be:detail-close', () => closeContentDetail(false));
    }
  }

  function openContentDetail(data, options = {}) {
    const section = document.getElementById('contentDetailSection');
    const featuredSection = document.getElementById('featuredSection');
    const randomFeaturedSection = document.getElementById('randomFeaturedSection');
    const bg = document.getElementById('contentDetailBg');
    const logo = document.getElementById('contentDetailLogo');
    const meta = document.getElementById('contentDetailMeta');
    const desc = document.getElementById('contentDetailDesc');
    const play = document.getElementById('contentDetailPlay');
    const list = document.getElementById('contentDetailList');
    if (!section || !bg || !logo || !meta || !desc || !play || !list) return;

    const title = data.title || 'Conteúdo';
    const preserveTitle = data.preserveTitle === true || String(data.preserveTitle || '').toLowerCase() === 'true' || preservesOriginalMusicTitle(data);
    const description = data.description || 'Descrição indisponível no momento.';
    const year = data.year || '';
    const duration = data.duration || '';
    const contentUrl = data.contentUrl || '#';
    const collection = String(data.collection || '').toLowerCase();
    const thumbnailUrl = data.imageUrl || data.thumbnailUrl || data.bannerUrl || '';
    const bannerUrl = ['movies', 'series'].includes(collection)
      ? thumbnailUrl
      : (data.bannerUrl || thumbnailUrl);
    const logoUrl = data.logoUrl || '';
    const itemId = String(data.itemId || title);
    const recordId = String(data.recordId || data.id || '');
    const canonicalFavoriteId = String(data.favoriteId || (recordId ? `${collection || 'videos'}:${recordId}` : itemId));
    if (options.updateRoute !== false) setDetailRoute(itemId, Boolean(options.replaceRoute));

    bg.innerHTML = bannerUrl && bannerUrl !== '#'
      ? `<img decoding="async" src="${safeAssetUrl(bannerUrl)}" alt="${escapeHtml(title)}" loading="eager" decoding="async" fetchpriority="high">`
      : '<div class="ph ph-wide" style="height:100%"></div>';

    logo.classList.toggle('notranslate', preserveTitle);
    if (preserveTitle) logo.setAttribute('translate', 'no'); else logo.removeAttribute('translate');
    if (logoUrl && logoUrl !== '#') {
      logo.innerHTML = collection === 'videos'
        ? `<span class="detail-logo-media--video"><img loading="eager" decoding="async" fetchpriority="high" src="${safeAssetUrl(logoUrl)}" alt="${escapeHtml(title)}"></span>`
        : `<img loading="eager" decoding="async" fetchpriority="high" src="${safeAssetUrl(logoUrl)}" alt="${escapeHtml(title)}">`;
    } else if (['movies', 'series'].includes(String(data.collection || '').toLowerCase())) {
      logo.innerHTML = `<span class="sr-only">${escapeHtml(title)}</span>`;
    } else {
      logo.textContent = title;
    }

    const metaParts = [];
    if (year) metaParts.push(`<span class="detail-year">${escapeHtml(year)}</span>`);
    if (year && duration) metaParts.push('<span class="detail-dot"></span>');
    if (duration) metaParts.push(`<span class="detail-duration">${escapeHtml(duration)}</span>`);
    meta.innerHTML = metaParts.join('');
    desc.classList.add('be-markdown');
    desc.innerHTML = markdownToHtml(description);

    const playableUrl = safeUrlValue(contentUrl);
    const hasContentLink = playableUrl !== '#';
    play.innerHTML = hasContentLink
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7-11-7Z"/></svg>Assistir'
      : 'Disponível em Breve';
    if (hasContentLink) {
      play.href = playableUrl;
      play.removeAttribute('aria-disabled');
    } else {
      play.removeAttribute('href');
      play.setAttribute('aria-disabled', 'true');
    }
    const usesInternalPlayer = hasContentLink && Boolean(googleDriveFileId(contentUrl) || youtubeMediaInfo(contentUrl));
    play.dataset.mediaPlayerTrigger = usesInternalPlayer ? 'true' : 'false';
    if (hasContentLink && /^https?:\/\//i.test(contentUrl) && !usesInternalPlayer) {
      play.target = '_blank';
      play.rel = 'noopener';
    } else {
      play.removeAttribute('target');
      play.removeAttribute('rel');
    }

    play.dataset.itemId = itemId;
    play.dataset.recordId = recordId;
    play.dataset.title = title;
    play.dataset.description = description;
    play.dataset.year = year;
    play.dataset.duration = duration;
    play.dataset.contentUrl = contentUrl;
    play.dataset.imageUrl = thumbnailUrl;
    play.dataset.bannerUrl = bannerUrl;
    play.dataset.logoUrl = logoUrl;
    play.dataset.collection = collection || 'videos';
    play.dataset.preserveTitle = preserveTitle ? 'true' : 'false';
    play.dataset.sectionId = String(data.sectionId || '');
    play.dataset.sectionName = String(data.sectionName || data.sourceSectionTitle || '');
    if (play.dataset.analyticsBound !== 'true') {
      play.dataset.analyticsBound = 'true';
      play.addEventListener('click', () => {
        const current = contentDataFromElement(play);
        if (current.contentUrl && current.contentUrl !== '#') trackContentInteraction(current, 'click');
      });
    }

    list.dataset.favoriteId = canonicalFavoriteId;
    list.dataset.itemId = itemId;
    list.dataset.recordId = recordId;
    list.dataset.title = title;
    list.dataset.description = description;
    list.dataset.year = year;
    list.dataset.duration = duration;
    list.dataset.contentUrl = contentUrl;
    list.dataset.imageUrl = thumbnailUrl;
    list.dataset.bannerUrl = bannerUrl;
    list.dataset.logoUrl = logoUrl;
    list.dataset.collection = collection || 'videos';
    list.dataset.preserveTitle = preserveTitle ? 'true' : 'false';
    list.dataset.sectionId = String(data.sectionId || '');
    list.dataset.sectionName = String(data.sectionName || data.sourceSectionTitle || '');
    syncDetailListButton(list, itemId);
    if (list.dataset.clickBound !== 'true') {
      list.dataset.clickBound = 'true';
      list.addEventListener('click', () => toggleDetailFavorite(list));
    }

    renderDetailRecommendations(data);
    if (featuredSection) featuredSection.hidden = true;
    if (randomFeaturedSection) randomFeaturedSection.hidden = true;
    document.body.classList.add('detail-page-active');
    section.hidden = false;
    section.scrollIntoView({ behavior: options.instant ? 'auto' : 'smooth', block: 'start' });
    trackContentInteraction({ ...data, recordId, collection: collection || 'videos' }, 'view');
  }

  function closeContentDetail(scrollHome = false, updateRoute = true) {
    const section = document.getElementById('contentDetailSection');
    const featuredSection = document.getElementById('featuredSection');
    const randomFeaturedSection = document.getElementById('randomFeaturedSection');
    if (section) section.hidden = true;
    document.body.classList.remove('detail-page-active');
    if (updateRoute && detailRouteId()) {
      history.pushState({ beRoute: 'home' }, '', '/' + (location.search || ''));
    }
    const recommendations = document.getElementById('detailRecommendations');
    if (recommendations) recommendations.hidden = true;
    const activeView = document.body.dataset.homeView || 'home';
    if (activeView === 'home') {
      if (featuredSection && document.getElementById('featured')?.children.length) {
        featuredSection.hidden = false;
        if (scrollHome) featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (randomFeaturedSection) randomFeaturedSection.hidden = true;
    } else if (['films', 'movies', 'series', 'videos'].includes(activeView)) {
      if (featuredSection) featuredSection.hidden = true;
      renderRandomTabFeatured(activeView, false);
      if (scrollHome) {
        const destination = randomFeaturedSection && !randomFeaturedSection.hidden
          ? randomFeaturedSection
          : document.getElementById('dynamicSections');
        destination?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  const CONTENT_ANALYTICS_SESSION_KEY = 'beContentAnalyticsSession';

  function createContentAnalyticsSessionId() {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
      const bytes = new Uint8Array(16);
      if (window.crypto && typeof window.crypto.getRandomValues === 'function') window.crypto.getRandomValues(bytes);
      else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
      bytes[6] = (bytes[6] & 15) | 64;
      bytes[8] = (bytes[8] & 63) | 128;
      const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    } catch (_) {
      return '00000000-0000-4000-8000-000000000001';
    }
  }

  function contentAnalyticsSessionId() {
    try {
      const stored = String(localStorage.getItem(CONTENT_ANALYTICS_SESSION_KEY) || '').trim();
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored)) return stored;
      const created = createContentAnalyticsSessionId();
      localStorage.setItem(CONTENT_ANALYTICS_SESSION_KEY, created);
      return created;
    } catch (_) {
      return createContentAnalyticsSessionId();
    }
  }

  function trackContentInteraction(data, eventType, active = null) {
    const normalized = normalizeSavedContent(data || {});
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized.recordId)) return;
    const type = String(eventType || '').trim().toLowerCase();
    if (!['click', 'view', 'save'].includes(type)) return;

    Promise.resolve(window.beBackend?.ready)
      .then(() => {
        const client = window.beBackend?.client;
        if (!client || typeof client.rpc !== 'function') return null;
        return client.rpc('track_content_interaction', {
          p_content_id: normalized.recordId,
          p_event_type: type,
          p_session_id: contentAnalyticsSessionId(),
          p_active: type === 'save' ? Boolean(active) : null
        });
      })
      .catch(() => null);
  }

  function detailFavoriteSet() {
    const key = 'beDetailFavorites';
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      return new Set(Array.isArray(saved) ? saved.map(String) : []);
    } catch (_) {
      return new Set();
    }
  }

  function saveDetailFavoriteSet(set) {
    localStorage.setItem('beDetailFavorites', JSON.stringify(Array.from(set)));
  }

  function favoriteKeysForContent(data) {
    const normalized = normalizeSavedContent(data || {});
    const canonical = normalized.recordId
      ? `${normalized.collection || 'videos'}:${normalized.recordId}`
      : '';
    return Array.from(new Set([
      normalized.itemId,
      normalized.favoriteId,
      canonical
    ].map(value => String(value || '').trim()).filter(Boolean)));
  }

  function isContentFavorited(data) {
    const keys = favoriteKeysForContent(data);
    if (!keys.length) return false;
    const detailFavorites = detailFavoriteSet();
    const featuredFavorites = featuredFavoriteSet();
    return keys.some(key => detailFavorites.has(key) || featuredFavorites.has(key));
  }

  function setContentFavoriteState(data, active) {
    const normalized = normalizeSavedContent(data || {});
    const alreadyActive = isContentFavorited(normalized);
    if (active && !alreadyActive && collectSavedContents().length >= SAVED_CONTENTS_LIMIT) {
      showSavedContentLimitNotice();
      return false;
    }

    const keys = favoriteKeysForContent(normalized);
    const detailFavorites = detailFavoriteSet();
    const featuredFavorites = featuredFavoriteSet();
    const canonical = normalized.recordId
      ? `${normalized.collection || 'videos'}:${normalized.recordId}`
      : (normalized.favoriteId || normalized.itemId);

    if (active) {
      if (normalized.itemId) detailFavorites.add(normalized.itemId);
      if (canonical) featuredFavorites.add(canonical);
    } else {
      keys.forEach(key => {
        detailFavorites.delete(key);
        featuredFavorites.delete(key);
      });
    }

    saveDetailFavoriteSet(detailFavorites);
    localStorage.setItem('beFeaturedFavorites', JSON.stringify(Array.from(featuredFavorites)));
    persistSavedContent(normalized, active);
    if (typeof window.beScheduleUserDataSync === 'function') window.beScheduleUserDataSync('favorites');
    return true;
  }

  function syncDetailListButton(button, itemId) {
    const data = contentDataFromElement(button);
    if (!data.itemId && itemId) data.itemId = String(itemId);
    const active = isContentFavorited(data);
    const label = active ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  }

  function toggleDetailFavorite(button) {
    const data = contentDataFromElement(button);
    const requestedActive = !isContentFavorited(data);
    const changed = setContentFavoriteState(data, requestedActive);
    const active = isContentFavorited(data);
    syncDetailListButton(button, data.itemId);
    if (changed) {
      trackContentInteraction(data, 'save', active);
      window.dispatchEvent(new CustomEvent('be:favorites-changed', { detail:{ itemId:data.itemId, favoriteId:data.favoriteId, active } }));
    }
  }

  function setupRail(section) {
    const rail = section.querySelector('.video-rail');
    const prev = section.querySelector('.video-rail-arrow.prev');
    const next = section.querySelector('.video-rail-arrow.next');

    const amount = () => Math.max(rail.clientWidth * 0.82, 320);
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      prev.hidden = rail.scrollLeft <= 4;
      next.hidden = max <= 4 || rail.scrollLeft >= max - 4;
    };

    prev.addEventListener('click', () => rail.scrollBy({ left: -amount(), behavior: 'smooth' }));
    next.addEventListener('click', () => rail.scrollBy({ left: amount(), behavior: 'smooth' }));
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    rail.addEventListener('wheel', event => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = rail.scrollWidth - rail.clientWidth;
      const canMove = (event.deltaY > 0 && rail.scrollLeft < max - 2) || (event.deltaY < 0 && rail.scrollLeft > 2);
      if (!canMove) return;
      event.preventDefault();
      rail.scrollBy({ left: event.deltaY * 1.25, behavior: 'auto' });
    }, { passive: false });

    requestAnimationFrame(update);
  }

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  const SAVED_CONTENTS_KEY = 'beSavedContents';
  const SAVED_CONTENTS_LIMIT = 20;
  let savedContentLimitToastTimer = 0;

  function showSavedContentLimitNotice() {
    let toast = document.getElementById('savedContentLimitToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'savedContentLimitToast';
      toast.className = 'saved-content-limit-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.textContent = 'Você pode salvar até 20 conteúdos.';
      document.body.appendChild(toast);
    }
    clearTimeout(savedContentLimitToastTimer);
    requestAnimationFrame(() => toast.classList.add('show'));
    savedContentLimitToastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function readJsonArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  }

  function normalizeSavedContent(data) {
    const itemId = String(data?.itemId || data?.favoriteId || data?.title || '').trim();
    const recordId = String(data?.recordId || data?.id || '').trim();
    const collection = String(data?.collection || 'videos').trim().toLowerCase() || 'videos';
    const favoriteId = String(data?.favoriteId || (recordId ? `${collection}:${recordId}` : '')).trim();
    return {
      itemId,
      recordId,
      favoriteId,
      title:String(data?.title || 'Conteúdo salvo'),
      description:String(data?.description || ''),
      year:String(data?.year || ''),
      duration:String(data?.duration || ''),
      contentUrl:String(data?.contentUrl || '#'),
      imageUrl:String(data?.imageUrl || data?.thumbnailUrl || data?.bannerUrl || ''),
      bannerUrl:String(data?.bannerUrl || data?.imageUrl || data?.thumbnailUrl || ''),
      logoUrl:String(data?.logoUrl || ''),
      collection,
      sectionId:String(data?.sectionId || ''),
      sectionName:String(data?.sectionName || data?.sourceSectionTitle || ''),
      preserveTitle:data?.preserveTitle === true || String(data?.preserveTitle || '').toLowerCase() === 'true' || preservesOriginalMusicTitle(data),
      savedAt:String(data?.savedAt || new Date().toISOString())
    };
  }

  function contentDataFromElement(element) {
    if (!element) return normalizeSavedContent({});
    const hasOwnContentData = Boolean(element.dataset?.itemId || element.dataset?.recordId);
    const detail = element.matches?.('[data-open-detail="true"]') || hasOwnContentData
      ? element
      : element.closest?.('.f-slide, .video-card, #contentDetailSection')?.querySelector?.('[data-open-detail="true"]') || element;
    const dataset = detail?.dataset || element.dataset || {};
    const favoriteId = String(element.dataset?.favoriteId || dataset.favoriteId || '');
    return normalizeSavedContent({
      itemId:dataset.itemId || element.dataset?.itemId || '',
      recordId:dataset.recordId || element.dataset?.recordId || '',
      favoriteId,
      title:dataset.title || element.dataset?.title || '',
      description:dataset.description || element.dataset?.description || '',
      year:dataset.year || element.dataset?.year || '',
      duration:dataset.duration || element.dataset?.duration || '',
      contentUrl:dataset.contentUrl || element.dataset?.contentUrl || '#',
      imageUrl:dataset.imageUrl || element.dataset?.imageUrl || '',
      bannerUrl:dataset.bannerUrl || element.dataset?.bannerUrl || '',
      logoUrl:dataset.logoUrl || element.dataset?.logoUrl || '',
      collection:dataset.collection || element.dataset?.collection || 'videos',
      sectionId:dataset.sectionId || element.dataset?.sectionId || '',
      sectionName:dataset.sectionName || dataset.sourceSectionTitle || element.dataset?.sectionName || '',
      preserveTitle:dataset.preserveTitle || element.dataset?.preserveTitle || ''
    });
  }

  function savedContentMatches(a, b) {
    if (a.itemId && b.itemId && a.itemId === b.itemId) return true;
    if (a.favoriteId && b.favoriteId && a.favoriteId === b.favoriteId) return true;
    return Boolean(a.collection && a.recordId && b.collection && b.recordId && a.collection === b.collection && a.recordId === b.recordId);
  }

  function persistSavedContent(data, active) {
    const normalized = normalizeSavedContent(data);
    let records = readJsonArray(SAVED_CONTENTS_KEY).map(normalizeSavedContent);
    records = records.filter(record => !savedContentMatches(record, normalized));
    if (active && (normalized.itemId || normalized.favoriteId || normalized.recordId)) records.unshift({ ...normalized, savedAt:new Date().toISOString() });
    localStorage.setItem(SAVED_CONTENTS_KEY, JSON.stringify(records.slice(0, SAVED_CONTENTS_LIMIT)));
  }

  function domCatalogCandidates() {
    return Array.from(document.querySelectorAll('[data-open-detail="true"]')).map(contentDataFromElement).filter(item => item.itemId || item.recordId);
  }

  function collectSavedContents() {
    const stored = readJsonArray(SAVED_CONTENTS_KEY).map(normalizeSavedContent);
    const detailIds = new Set(readJsonArray('beDetailFavorites').map(String));
    const featuredIds = new Set(readJsonArray('beFeaturedFavorites').map(String));
    const candidates = domCatalogCandidates();
    const result = [];
    const add = item => {
      const normalized = normalizeSavedContent(item);
      if (!normalized.itemId && !normalized.favoriteId && !normalized.recordId) return;
      if (result.some(current => savedContentMatches(current, normalized))) return;
      result.push(normalized);
    };
    stored.forEach(add);
    candidates.forEach(item => {
      if (detailIds.has(item.itemId) || featuredIds.has(item.favoriteId) || featuredIds.has(`${item.collection}:${item.recordId}`)) add(item);
    });
    return result.sort((a, b) => String(b.savedAt || '').localeCompare(String(a.savedAt || '')));
  }

  window.beGetSavedContents = collectSavedContents;
  window.beIsSavedContent = function(data) {
    const normalized = normalizeSavedContent(data || {});
    return collectSavedContents().some(item => savedContentMatches(item, normalized));
  };
  window.beSetSavedContent = function(data, active) {
    const normalized = normalizeSavedContent(data || {});
    const alreadyActive = collectSavedContents().some(item => savedContentMatches(item, normalized));
    if (active && !alreadyActive && collectSavedContents().length >= SAVED_CONTENTS_LIMIT) {
      showSavedContentLimitNotice();
      return false;
    }
    persistSavedContent(normalized, Boolean(active));
    if (typeof window.beScheduleUserDataSync === 'function') window.beScheduleUserDataSync('favorites');
    try { window.dispatchEvent(new CustomEvent('be:favorites-changed', { detail:{ itemId:normalized.itemId, favoriteId:normalized.favoriteId, active:Boolean(active), collection:normalized.collection } })); } catch (_) {}
    return true;
  };
  window.beGetCatalogContents = function() {
    const completeCatalog = [
      ...randomFeaturedPools.videos,
      ...randomFeaturedPools.movies,
      ...randomFeaturedPools.series
    ];
    const candidates = completeCatalog.length ? completeCatalog.map(item => {
      const collection = String(item.collection || 'videos').toLowerCase();
      const recordId = String(item.id || item.videoId || '');
      const itemId = String(numericPublicId(item.publicId || recordId || item.title));
      return normalizeSavedContent({
        ...item,
        itemId,
        recordId,
        favoriteId:recordId ? `${collection}:${recordId}` : itemId,
        collection,
        contentUrl:item.videoUrl || item.contentUrl || item.link || '#',
        imageUrl:item.thumbnailUrl || item.imageUrl || item.bannerUrl || '',
        bannerUrl:['movies', 'series'].includes(collection)
          ? (item.thumbnailUrl || item.imageUrl || item.bannerUrl || '')
          : (item.bannerUrl || item.imageUrl || item.thumbnailUrl || '')
      });
    }) : domCatalogCandidates();
    const result = [];
    candidates.forEach(item => {
      const normalized = normalizeSavedContent(item);
      if (!normalized.itemId && !normalized.favoriteId && !normalized.recordId) return;
      if (result.some(current => savedContentMatches(current, normalized))) return;
      result.push(normalized);
    });
    return result.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR'));
  };
  window.beOpenSavedContent = function(data) {
    const item = normalizeSavedContent(data);
    if (item.collection === 'albums' || item.collection === 'news') {
      const albumId = String(item.recordId || item.itemId || '').replace(/^album:/, '');
      if (!albumId) return;
      const route = '/albuns/' + encodeURIComponent(albumId);
      if (window.BETVPublicRoutes && typeof window.BETVPublicRoutes.go === 'function') window.BETVPublicRoutes.go(route);
      else location.assign(window.BETVLocaleURL ? window.BETVLocaleURL(route) : route);
      return;
    }
    if (!item.itemId) return;
    openContentDetail(item, { updateRoute:true, instant:false });
  };

  function featuredFavoriteSet() {
    return new Set(readJsonArray('beFeaturedFavorites').map(String));
  }

  function setupFavoriteButtons(host) {
    host.querySelectorAll('[data-favorite-id]').forEach(button => {
      if (button.dataset.favoriteBound === 'true') return;
      button.dataset.favoriteBound = 'true';
      const sync = () => {
        const active = isContentFavorited(contentDataFromElement(button));
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
      };
      sync();
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const data = contentDataFromElement(button);
        const requestedActive = !isContentFavorited(data);
        const changed = setContentFavoriteState(data, requestedActive);
        const active = isContentFavorited(data);
        sync();
        if (changed) {
          trackContentInteraction(data, 'save', active);
          window.dispatchEvent(new CustomEvent('be:favorites-changed', { detail:{ itemId:data.itemId, favoriteId:data.favoriteId, active } }));
        }
      });
      window.addEventListener('be:favorites-changed', sync);
    });
  }

  window.addEventListener('hashchange', () => {
    if (detailRouteId()) openContentDetailFromRoute();
    else if (document.body.classList.contains('detail-page-active')) closeContentDetail(false, false);
  });
  window.addEventListener('popstate', () => {
    if (detailRouteId()) openContentDetailFromRoute();
    else if (document.body.classList.contains('detail-page-active')) closeContentDetail(false, false);
  });
  window.addEventListener('be:open-video-route', () => openContentDetailFromRoute());

  function setupHomeNavigation() {
    const topbar = document.getElementById('topbar');
    const toggle = document.getElementById('homeSearchToggle');
    const input = document.getElementById('homeSearchInput');
    const logo = document.getElementById('logoBtn');
    const viewButtons = Array.from(document.querySelectorAll('button[data-home-view],a[data-home-view]'));
    const supportButton = topbar.querySelector('[data-public-action="support"]');
    const tabButtons = [logo, ...viewButtons, supportButton].filter(Boolean);
    if (!topbar || !toggle || !input || topbar.dataset.homeReady === 'true') return;
    topbar.dataset.homeReady = 'true';

    let currentView = 'home';
    let restoringCatalogHistory = false;
    document.body.dataset.homeView = currentView;

    const catalogHistoryUrl = () => location.pathname + (location.search || '') + (location.hash || '');
    const pushCatalogHistory = (previousView, nextView, previousScrollY) => {
      if (!isMobileCatalogViewport() || restoringCatalogHistory || previousView === nextView) return;
      if (document.body.classList.contains('section-catalog-active') || document.body.classList.contains('detail-page-active')) return;
      if (document.body.classList.contains('profile-page-active') || document.body.classList.contains('settings-page-active') ||
          document.body.classList.contains('support-page-active') || document.body.classList.contains('notification-page-active') ||
          document.body.classList.contains('legal-page-active') || document.body.classList.contains('billie-page-active') || document.body.classList.contains('login-mode')) return;
      try {
        history.replaceState({
          ...(history.state || {}),
          beRoute: 'catalog',
          homeView: previousView,
          scrollY: Math.max(0, Number(previousScrollY) || 0)
        }, '', catalogHistoryUrl());
        history.pushState({
          beRoute: 'catalog',
          homeView: nextView,
          scrollY: 0
        }, '', catalogHistoryUrl());
      } catch (_) {}
    };

    const leading = document.getElementById('homeNavLeading');
    let activeTabButton = logo;

    const positionSharedTabIndicator = activeButton => {
      if (!leading || !activeButton) return;
      window.requestAnimationFrame(() => {
        const leadingRect = leading.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        if (!buttonRect.width || !buttonRect.height) return;
        leading.style.setProperty('--home-tab-x', `${Math.max(0, buttonRect.left - leadingRect.left)}px`);
        leading.style.setProperty('--home-tab-width', `${buttonRect.width}px`);
        leading.style.setProperty('--home-tab-height', `${buttonRect.height}px`);
        leading.style.setProperty('--home-tab-y', `${Math.max(0, buttonRect.top - leadingRect.top)}px`);
      });
    };

    const setActiveTab = activeButton => {
      activeTabButton = activeButton || logo;
      tabButtons.forEach(button => {
        const active = button === activeTabButton;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
        if (button === logo) button.setAttribute('aria-current', active ? 'page' : 'false');
      });
      positionSharedTabIndicator(activeTabButton);
    };

    setActiveTab(logo);
    window.addEventListener('resize', () => positionSharedTabIndicator(activeTabButton), { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => positionSharedTabIndicator(activeTabButton));

    const setSearchOpen = open => {
      topbar.classList.toggle('search-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar pesquisa' : 'Abrir pesquisa');
      if (open) {
        window.dispatchEvent(new CustomEvent('be:close-notification-menus'));
        requestAnimationFrame(() => input.focus({ preventScroll: true }));
      } else {
        input.value = '';
        applyCatalogFilter();
        toggle.focus({ preventScroll: true });
      }
    };

    window.addEventListener('be:close-public-search', () => {
      if (topbar.classList.contains('search-open')) setSearchOpen(false);
    });

    const isFilm = category => {
      const value = normalizeText(category);
      return value === 'filme' || value === 'filmes' || value === 'movie' || value === 'movies' || value.includes('filme');
    };

    const applyCatalogFilter = (refreshFeatured = false) => {
      const rawQuery = String(input.value || '');
      if (document.body.classList.contains('album-page-active')) {
        window.dispatchEvent(new CustomEvent('be:album-search', { detail:{ query:rawQuery } }));
        return;
      }
      const host = document.getElementById('dynamicSections');
      if (!host) return;
      const query = normalizeText(rawQuery);
      const sections = Array.from(host.querySelectorAll('.video-rail-section'));
      const billieSpotlight = host.querySelector('.billie-home-spotlight');
      const donateSpotlight = host.querySelector('.donate-home-spotlight');
      if (billieSpotlight) billieSpotlight.hidden = currentView !== 'home' || Boolean(query);
      if (donateSpotlight) donateSpotlight.hidden = currentView !== 'home' || Boolean(query);
      let visibleTotal = 0;

      sections.forEach(section => {
        const sectionCategory = section.dataset.category || '';
        const sectionView = section.dataset.homeView || 'default';
        const cards = Array.from(section.querySelectorAll('.video-card, .album-home-card'));
        let visibleInSection = 0;
        const libraryView = ['films','movies','series'].includes(currentView);
        const isFeaturedRail = normalizeText(sectionCategory) === 'destaque' || section.classList.contains('featured-video-rail');
        const sectionMatchesView = libraryView
          ? sectionView === 'films'
          : currentView === 'videos'
            ? sectionView !== 'films' && !isFeaturedRail
            : currentView === 'home'
              ? sectionView !== 'films'
              : true;

        cards.forEach(card => {
          const category = card.dataset.category || sectionCategory;
          const collection = card.dataset.collection || section.dataset.collection || 'videos';
          const title = card.dataset.titleSearch || normalizeText(card.getAttribute('aria-label'));
          const contentMatchesView = currentView === 'films'
            ? (collection === 'movies' || collection === 'series')
            : currentView === 'movies'
              ? collection === 'movies'
              : currentView === 'series'
                ? collection === 'series'
                : currentView === 'videos'
                  ? collection === 'videos'
                  : true;
          const searchMatches = !query || title.includes(query) || category.includes(query) || sectionCategory.includes(query);
          const show = sectionMatchesView && contentMatchesView && searchMatches;
          card.hidden = !show;
          if (show) visibleInSection += 1;
        });

        const emptyNative = section.querySelector('.video-rail-empty');
        const emptyLibrary = sectionView === 'films' && cards.length === 0;
        const showSection = sectionMatchesView && (visibleInSection > 0 || (emptyLibrary && !query) || (cards.length === 0 && currentView !== 'films' && !query));
        section.hidden = !showSection;
        if (emptyNative) emptyNative.hidden = !showSection;
        visibleTotal += visibleInSection;
      });

      const featuredSection = document.getElementById('featuredSection');
      const randomFeaturedSection = document.getElementById('randomFeaturedSection');
      if (!document.body.classList.contains('detail-page-active')) {
        if (currentView === 'home') {
          if (featuredSection) featuredSection.hidden = !document.getElementById('featured')?.children.length;
          if (randomFeaturedSection) randomFeaturedSection.hidden = true;
        } else if (['films', 'movies', 'series', 'videos'].includes(currentView)) {
          if (featuredSection) featuredSection.hidden = true;
          renderRandomTabFeatured(currentView, refreshFeatured);
        }
      }

      let empty = host.querySelector('.home-filter-empty');
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'home-filter-empty';
        empty.setAttribute('role', 'status');
        host.prepend(empty);
      }
      if (query) {
        empty.innerHTML = `<strong>Nenhum conteúdo encontrado para “${escapeHtml(input.value.trim())}”.</strong><span>Não encontrou o que procurava? <a href="/suporte" data-public-action="support" data-support-target="contact">Relate para o suporte</a>.</span>`;
      } else {
        empty.textContent = 'Nenhum filme ou série publicado.';
      }
      empty.classList.toggle('show', visibleTotal === 0 && sections.length > 0 && Boolean(query));
    };

    const leaveAlbumsForCatalog = nextView => {
      const path = (() => {
        try {
          return decodeURIComponent(String(window.BETVLocalePath ? window.BETVLocalePath() : (location.pathname || '/'))).replace(/\/+$/, '') || '/';
        } catch (_) {
          return String(location.pathname || '/').replace(/\/+$/, '') || '/';
        }
      })();
      const albumRouteActive = document.body.classList.contains('album-page-active') || /^\/(?:albuns|álbuns|albums)(?:\/[^/]+)?$/i.test(path);
      if (!albumRouteActive) return;

      const rootPath = window.BETVLocaleURL ? window.BETVLocaleURL('/') : '/';
      const state = { beRoute:'catalog', homeView:nextView || 'home', scrollY:0 };
      try {
        const url = new URL(rootPath, location.origin);
        history.pushState(state, '', url.pathname + (location.search || ''));
        window.dispatchEvent(new PopStateEvent('popstate', { state }));
      } catch (_) {
        location.assign(rootPath);
      }
    };

    viewButtons.forEach(button => {
      button.addEventListener('click', event => {
        const nextView = button.dataset.homeView || 'videos';
        leaveAlbumsForCatalog(nextView);
        const historyMode = button.dataset.beHistoryMode || (event.isTrusted ? 'push' : 'none');
        delete button.dataset.beHistoryMode;
        if (historyMode === 'push') pushCatalogHistory(currentView, nextView, window.scrollY);

        // Ao sair dos detalhes, encerra primeiro qualquer seção dedicada. Sem isso,
        // o catálogo continuava em section-view-mode e Filmes/Vídeos herdavam apenas
        // o trilho que estava aberto antes do detalhe.
        if (document.body.classList.contains('section-catalog-active')) {
          closeSectionView(false);
          document.body.classList.remove('section-catalog-active');
        }
        if (document.body.classList.contains('detail-page-active')) {
          closeContentDetail(false, false);
          try { history.replaceState({ beRoute:'catalog', homeView:nextView, scrollY:0 }, '', '/' + (location.search || '')); } catch (_) {}
        }

        currentView = nextView;
        document.body.dataset.homeView = currentView;
        setActiveTab(button);
        applyCatalogFilter(true);
        // Ao alternar entre Filmes e Vídeos, sempre reposiciona a página no topo.
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        });
      });
    });

    supportButton?.addEventListener('click', () => {
      setActiveTab(supportButton);
    });

    logo?.addEventListener('click', event => {
      leaveAlbumsForCatalog('home');
      const historyMode = logo.dataset.beHistoryMode || (event.isTrusted ? 'push' : 'none');
      delete logo.dataset.beHistoryMode;
      if (historyMode === 'push') pushCatalogHistory(currentView, 'home', window.scrollY);
      if (document.body.classList.contains('section-catalog-active')) {
        closeSectionView(false);
        document.body.classList.remove('section-catalog-active');
      }
      if (document.body.classList.contains('detail-page-active')) {
        closeContentDetail(false, false);
        try { history.replaceState({ beRoute:'catalog', homeView:'home', scrollY:0 }, '', '/' + (location.search || '')); } catch (_) {}
      }
      currentView = 'home';
      document.body.dataset.homeView = currentView;
      setActiveTab(logo);
      input.value = '';
      setSearchOpen(false);
      applyCatalogFilter();
    });

    toggle.addEventListener('click', () => setSearchOpen(!topbar.classList.contains('search-open')));
    input.addEventListener('input', applyCatalogFilter);
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSearchOpen(false);
      } else if (event.key === 'Enter' && document.body.classList.contains('album-page-active')) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('be:album-search-commit', { detail:{ query:String(input.value || '') } }));
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && topbar.classList.contains('search-open')) setSearchOpen(false);
      if (event.key === 'Escape' && !topbar.classList.contains('search-open')) closeContentDetail();
    });
    window.addEventListener('be:catalog-ready', applyCatalogFilter);
    window.addEventListener('popstate', event => {
      if (!isMobileCatalogViewport()) return;
      if (document.body.classList.contains('section-catalog-active') || document.body.classList.contains('detail-page-active')) return;
      const state = event.state || {};
      if (state.beRoute !== 'catalog' || !state.homeView) return;
      restoringCatalogHistory = true;
      const destination = ['films', 'movies', 'series', 'videos'].includes(normalizeText(state.homeView))
        ? normalizeText(state.homeView)
        : 'home';
      const destinationButton = catalogViewButton(destination);
      if (destinationButton && currentView !== destination) {
        destinationButton.dataset.beHistoryMode = 'none';
        destinationButton.click();
        delete destinationButton.dataset.beHistoryMode;
      }
      restoringCatalogHistory = false;
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: Math.max(0, Number(state.scrollY) || 0), left: 0, behavior: 'auto' });
      });
    });

    applyCatalogFilter();
  }

  function numericPublicId(value) {
    const text = String(value || 'video').trim();
    if (/^\d{8}$/.test(text)) return text;
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return String(10000000 + ((hash >>> 0) % 90000000));
  }

  function safeUrlValue(value) {
    const text = String(value || '').trim();
    if (!text) return '#';
    if (/^(https?:\/\/|\/|#)/i.test(text)) return text;
    return '#';
  }

  function safeUrl(value) {
    return escapeHtml(safeUrlValue(value));
  }

  function safeAssetUrlValue(value) {
    const safe = safeUrlValue(value);
    return safe === '#' ? '#' : (window.beMediaUrl ? window.beMediaUrl(safe) : safe);
  }

  function safeAssetUrl(value) {
    return escapeHtml(safeAssetUrlValue(value));
  }

  function directImageUrlValue(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^\/(?!\/)/.test(raw)) return raw;
    try {
      const url = new URL(raw);
      return url.protocol === 'https:' ? url.href : '';
    } catch (_) {
      return '';
    }
  }

  function directImageUrl(value) {
    return escapeHtml(directImageUrlValue(value));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }
})();

;

;
(() => {
  'use strict';
  if (location.hash.startsWith('#/admin')) return;

  const MOBILE_QUERY = '(max-width:760px)';
  const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;

  const icon = name => ({
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>',
    close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></svg>',
    film:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4"/></svg>',
    video:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2Z"/><path d="m8.5 9 4 3-4 3Z"/></svg>',
    support:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-2v-7h4M4 12h4v7H6a2 2 0 0 1-2-2Z"/><path d="M16 19c0 2-2 3-4 3"/></svg>',
    fans:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M14 15.5a4.5 4.5 0 0 1 6.5 4"/></svg>',
    user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7.5" r="4"/></svg>',
    logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="m15 8 4 4-4 4M19 12H9"/></svg>'
  }[name] || '');

  function openDrawer(open) {
    const shouldOpen = Boolean(open) && isMobile();
    document.body.classList.toggle('mobile-drawer-open', shouldOpen);
    const toggle = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileDrawer');
    if (toggle) toggle.setAttribute('aria-expanded', String(shouldOpen));
    if (drawer) drawer.setAttribute('aria-hidden', String(!shouldOpen));
  }

  function syncMobileSearch(value) {
    const desktopInput = document.getElementById('homeSearchInput');
    if (!desktopInput) return;
    desktopInput.value = String(value || '');
    desktopInput.dispatchEvent(new Event('input', { bubbles:true }));
  }

  function openMobileSearch(open, clearOnClose = true) {
    const shouldOpen = Boolean(open) && isMobile();
    const input = document.getElementById('mobileSearchInput');
    const button = document.getElementById('mobileSearchButton');
    document.body.classList.toggle('mobile-search-open', shouldOpen);
    if (button) {
      button.setAttribute('aria-expanded', String(shouldOpen));
      button.setAttribute('aria-label', shouldOpen ? 'Fechar pesquisa' : 'Abrir pesquisa');
    }
    if (shouldOpen) {
      window.dispatchEvent(new CustomEvent('be:close-notification-menus'));
      openDrawer(false);
      window.requestAnimationFrame(() => input?.focus({ preventScroll:true }));
    } else if (clearOnClose && input) {
      input.value = '';
      syncMobileSearch('');
      button?.focus({ preventScroll:true });
    }
  }

  window.addEventListener('be:close-mobile-search', () => openMobileSearch(false));

  function setActiveDestination(destination) {
    document.querySelectorAll('[data-mobile-destination]').forEach(button => {
      const active = button.dataset.mobileDestination === destination;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function clickHomeView(view, historyMode = 'push') {
    const selector = view === 'home' ? '#logoBtn' : `[data-home-view="${view}"]`;
    const button = document.querySelector(selector);
    if (!button) return false;
    button.dataset.beHistoryMode = historyMode;
    button.click();
    delete button.dataset.beHistoryMode;
    return true;
  }

  function selectView(destination) {
    if (destination === 'home') {
      clickHomeView('home');
      document.body.dataset.mobileCollection = '';
    } else if (destination === 'films') {
      clickHomeView('films');
      document.body.dataset.mobileCollection = 'films';
    } else if (destination === 'videos') {
      clickHomeView('videos');
      document.body.dataset.mobileCollection = 'videos';
    } else if (destination === 'support') {
      document.querySelector('.home-nav-link[data-public-action="support"]')?.click();
    } else if (destination === 'fans') {
      if (window.BETVPublicRoutes && typeof window.BETVPublicRoutes.go === 'function') window.BETVPublicRoutes.go('/fãs');
      else location.href = '/fãs';
    }
    setActiveDestination(destination);
    openDrawer(false);
    openMobileSearch(false);
  }

  function openProfile() {
    openDrawer(false);
    openMobileSearch(false);
    const currentUser = window.beBackend?.auth?.currentUser;
    if (!currentUser) {
      window.BETVPublicRoutes.go('/login');
      document.body.classList.add('login-mode');
      return;
    }
    const profileAction = document.querySelector('#userDropdown [data-public-action="profile"]');
    if (profileAction) profileAction.click();
    else window.dispatchEvent(new CustomEvent('be:open-profile-route'));
  }

  async function logout() {
    openDrawer(false);
    const auth = window.beBackend?.auth;
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      window.BETVPublicRoutes.go('/login');
      document.body.classList.add('login-mode');
      return;
    }
    const existingAction = document.querySelector('#publicAuthAction[data-public-action="auth"]');
    if (existingAction) {
      existingAction.click();
      return;
    }
    try {
      await auth.signOut();
      clickHomeView('home');
    } catch (error) {
      console.warn('Não foi possível sair:', error?.message || error);
    }
  }

  function createMobileUI() {
    if (document.getElementById('mobileAppBar')) return;

    const bar = document.createElement('header');
    bar.className = 'mobile-app-bar';
    bar.id = 'mobileAppBar';
    bar.innerHTML = `
      <button class="mobile-profile-button" id="mobileProfileButton" type="button" aria-label="Abrir perfil"><span id="mobileHeaderAvatar"><img loading="eager" decoding="async" src="/assets/images/profile/default-avatar.png" data-avatar-fallback="/assets/images/profile/default-avatar.png" alt="Avatar"></span></button>
      <div class="mobile-header-actions">
        <button class="mobile-notification-button" id="mobileNotificationButton" type="button" aria-label="Abrir notificações" aria-expanded="false">${icon('bell')}<span class="notification-unread-dot" id="mobileNotificationUnreadDot" hidden></span></button>
        <div class="mobile-search-control" id="mobileSearchControl">
          <label class="sr-only" for="mobileSearchInput">Pesquisar conteúdos</label>
          <input id="mobileSearchInput" type="search" autocomplete="off" placeholder="Pesquisar filmes e vídeos" aria-label="Pesquisar filmes e vídeos">
          <button class="mobile-search-button" id="mobileSearchButton" type="button" aria-label="Abrir pesquisa" aria-expanded="false">
            <span class="mobile-search-icon">${icon('search')}</span>
            <span class="mobile-search-close-icon">${icon('close')}</span>
          </button>
        </div>
      </div>`;

    const backdrop = document.createElement('button');
    backdrop.className = 'mobile-drawer-backdrop';
    backdrop.id = 'mobileDrawerBackdrop';
    backdrop.type = 'button';
    backdrop.setAttribute('aria-label', 'Fechar menu');

    const drawer = document.createElement('aside');
    drawer.className = 'mobile-drawer';
    drawer.id = 'mobileDrawer';
    drawer.setAttribute('aria-label', 'Menu mobile');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
      <div class="mobile-drawer-top">
        <button class="mobile-drawer-profile" id="mobileDrawerProfile" type="button" aria-label="Abrir perfil">
          <span class="mobile-drawer-avatar" id="mobileDrawerAvatar"><img loading="eager" decoding="async" src="/assets/images/profile/default-avatar.png" data-avatar-fallback="/assets/images/profile/default-avatar.png" alt="Avatar"></span>
          <span class="mobile-drawer-user"><strong id="mobileDrawerName">Visitante</strong><span id="mobileDrawerUsername">Entrar ou criar conta</span></span>
        </button>
        <button class="mobile-drawer-close" id="mobileDrawerClose" type="button" aria-label="Fechar menu">${icon('close')}</button>
      </div>
      <nav class="mobile-drawer-nav" aria-label="Navegação mobile">
        <button class="mobile-drawer-link active" type="button" data-mobile-destination="home">${icon('home')}<span>Home</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="films">${icon('film')}<span>Filmes</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="videos">${icon('video')}<span>Vídeos</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="support">${icon('support')}<span>Suporte</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="fans">${icon('fans')}<span>Fãs que ajudaram o site</span></button>
      </nav>
      <div class="mobile-drawer-footer">
        <button class="mobile-logout-button" id="mobileLogoutButton" type="button">${icon('logout')}<span>Sair do site</span></button>
      </div>`;

    document.body.append(bar, backdrop, drawer);
    bindMobileActions();
    syncProfile();
  }

  function bindActivation(element, handler) {
    if (!element || element.dataset.mobileBound === 'true') return;
    element.dataset.mobileBound = 'true';
    let lastTouch = 0;
    element.addEventListener('touchend', event => {
      if (!isMobile()) return;
      lastTouch = Date.now();
      event.preventDefault();
      event.stopPropagation();
      handler(event);
    }, { passive:false });
    element.addEventListener('click', event => {
      if (!isMobile()) return;
      if (Date.now() - lastTouch < 650) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      handler(event);
    });
  }

  function bindMobileActions() {
    const searchButton = document.getElementById('mobileSearchButton');
    const searchInput = document.getElementById('mobileSearchInput');

    bindActivation(searchButton, () => {
      openMobileSearch(!document.body.classList.contains('mobile-search-open'));
    });

    if (searchInput && searchInput.dataset.mobileSearchBound !== 'true') {
      searchInput.dataset.mobileSearchBound = 'true';
      searchInput.addEventListener('input', () => syncMobileSearch(searchInput.value));
      searchInput.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          openMobileSearch(false);
        } else if (event.key === 'Enter' && document.body.classList.contains('album-page-active')) {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('be:album-search-commit', { detail:{ query:String(searchInput.value || '') } }));
          searchInput.blur();
        }
      });
    }

    bindActivation(document.getElementById('mobileDrawerClose'), () => openDrawer(false));
    bindActivation(document.getElementById('mobileDrawerBackdrop'), () => openDrawer(false));
    bindActivation(document.getElementById('mobileProfileButton'), openProfile);
    bindActivation(document.getElementById('mobileDrawerProfile'), openProfile);
    bindActivation(document.getElementById('mobileLogoutButton'), logout);
    document.querySelectorAll('[data-mobile-destination]').forEach(button => {
      bindActivation(button, () => selectView(button.dataset.mobileDestination));
    });
  }

  function syncProfile() {
    const sourcePhoto = document.getElementById('publicUserPhoto');
    const usernameSource = document.getElementById('ddUsername');
    const profileNameSource = document.getElementById('profilePageName');
    const profileHandleSource = document.getElementById('profilePageHandle');
    const headerAvatar = document.getElementById('mobileHeaderAvatar');
    const drawerAvatar = document.getElementById('mobileDrawerAvatar');
    const drawerName = document.getElementById('mobileDrawerName');
    const drawerUsername = document.getElementById('mobileDrawerUsername');
    const logoutButton = document.getElementById('mobileLogoutButton');
    if (!headerAvatar || !drawerAvatar || !drawerName || !drawerUsername) return;

    const update = () => {
      const account = window.beBackend?.auth?.currentUser;
      const src = sourcePhoto && !sourcePhoto.hidden ? sourcePhoto.getAttribute('src') : '';
      const profileAvatar = account?.profile?.avatarUrl ? String(account.profile.avatarUrl) : '';
      const shownSrc = window.BETVResolveAvatar ? window.BETVResolveAvatar(src || profileAvatar) : (src || profileAvatar || window.BETV_DEFAULT_AVATAR);
      [headerAvatar, drawerAvatar].forEach(container => {
        let image = container.querySelector('img');
        if (!image) {
          container.innerHTML = '';
          image = document.createElement('img');
          image.loading = 'eager';
          image.decoding = 'async';
          image.alt = 'Avatar';
          image.setAttribute('data-avatar-fallback', window.BETV_DEFAULT_AVATAR || '"+DEFAULT+"');
          container.appendChild(image);
        }
        if (window.BETVApplyAvatar) window.BETVApplyAvatar(image, shownSrc);
        else if (image.getAttribute('src') !== shownSrc) image.setAttribute('src', shownSrc);
      });

      if (!account) {
        drawerName.textContent = 'Visitante';
        drawerUsername.textContent = 'Entrar ou criar conta';
        if (logoutButton) logoutButton.hidden = true;
        return;
      }

      const profileName = String(profileNameSource?.textContent || '').trim();
      const accountName = String(account?.profile?.displayName || account?.displayName || '').trim();
      const rawHandle = String(profileHandleSource?.textContent || usernameSource?.textContent || account?.profile?.username || '').trim();
      const handle = rawHandle && rawHandle !== 'Visitante' ? (rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`) : '';
      drawerName.textContent = profileName || accountName || handle.replace(/^@/, '') || 'Usuário';
      drawerUsername.textContent = handle || 'Perfil conectado';
      if (logoutButton) logoutButton.hidden = false;
    };

    update();
    [sourcePhoto, usernameSource, profileNameSource, profileHandleSource].filter(Boolean).forEach(node => {
      new MutationObserver(update).observe(node, {
        attributes:true,
        childList:true,
        subtree:true,
        characterData:true,
        attributeFilter:['src','hidden']
      });
    });
    window.addEventListener('be:profile-avatar-changed', update);
    window.beBackend?.auth?.onChange?.(() => window.setTimeout(update, 40));
    window.setTimeout(update, 500);
    window.setTimeout(update, 1600);
  }

  function syncActiveFromPublicView() {
    const view = document.body.dataset.homeView || 'home';
    setActiveDestination(view === 'films' ? 'films' : view === 'videos' ? 'videos' : 'home');
  }

  function start() {
    createMobileUI();
    syncActiveFromPublicView();
    window.addEventListener('be:catalog-ready', syncActiveFromPublicView);
    window.addEventListener('resize', () => {
      if (!isMobile()) {
        openDrawer(false);
        openMobileSearch(false);
      }
    });
    window.addEventListener('popstate', () => { openDrawer(false); openMobileSearch(false, false); });
    window.addEventListener('hashchange', () => { openDrawer(false); openMobileSearch(false, false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        openDrawer(false);
        openMobileSearch(false);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();

;

;
(() => {
  'use strict';

  const PRIORITY_SELECTOR = [
    '.f-slide.active .f-media img',
    '.detail-bg img',
    '.detail-background img',
    '.login-brand img',
    '.logo-mark',
    '.home-logo-pill img',
    '.admin-logo-button img',
    '.admin-login-logo img'
  ].join(',');

  const applyImagePolicy = image => {
    if (!(image instanceof HTMLImageElement)) return;

    const priority = image.matches(PRIORITY_SELECTOR);
    image.decoding = 'async';

    if (priority) {
      image.loading = 'eager';
      try { image.fetchPriority = 'high'; } catch (_) {}
      return;
    }

    if (!image.getAttribute('loading')) image.loading = 'lazy';
    if (!image.getAttribute('fetchpriority')) {
      try { image.fetchPriority = 'low'; } catch (_) {}
    }
  };

  const applyFramePolicy = frame => {
    if (frame instanceof HTMLIFrameElement && !frame.getAttribute('loading')) {
      frame.loading = 'lazy';
    }
  };

  const revealDeferredSource = element => {
    if (!(element instanceof Element)) return;

    const source = element.getAttribute('data-src');
    const sourceSet = element.getAttribute('data-srcset');
    const background = element.getAttribute('data-bg-src');

    if (source) {
      element.setAttribute('src', window.beMediaUrl ? window.beMediaUrl(source) : source);
      element.removeAttribute('data-src');
    }
    if (sourceSet) {
      element.setAttribute('srcset', sourceSet);
      element.removeAttribute('data-srcset');
    }
    if (background) {
      const shownBackground = window.beMediaUrl ? window.beMediaUrl(background) : background;
      element.style.backgroundImage = `url("${shownBackground.replace(/"/g, '\\"')}")`;
      element.removeAttribute('data-bg-src');
    }
  };

  const deferredObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          revealDeferredSource(entry.target);
          deferredObserver.unobserve(entry.target);
        });
      }, { rootMargin: '500px 0px' })
    : null;

  const processNode = node => {
    if (!(node instanceof Element)) return;

    if (node.matches('img')) applyImagePolicy(node);
    if (node.matches('iframe')) applyFramePolicy(node);

    node.querySelectorAll('img').forEach(applyImagePolicy);
    node.querySelectorAll('iframe').forEach(applyFramePolicy);

    const deferred = [];
    if (node.matches('[data-src],[data-srcset],[data-bg-src]')) deferred.push(node);
    node.querySelectorAll('[data-src],[data-srcset],[data-bg-src]').forEach(item => deferred.push(item));

    deferred.forEach(item => {
      if (deferredObserver) deferredObserver.observe(item);
      else revealDeferredSource(item);
    });
  };

  const start = () => {
    processNode(document.documentElement);

    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(processNode);
      });
    });

    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();

;

;(function(){
  'use strict';
  var loaded=false,loading=false;
  function isAdminRoute(){
    var callback=new URLSearchParams(location.search||'').get('auth_callback');
    var remembered='';
    var path=String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'')).replace(/\/+$/,'')||'/';
    try{remembered=sessionStorage.getItem('beOAuthDestination')||'';}catch(_){ }
    return String(location.hash||'').startsWith('#/admin')||path==='/admin'||callback==='admin'||remembered==='admin';
  }
  function clearAdminBootGuard(){
    document.documentElement.classList.remove('admin-route-boot');
    if(window.__beAdminBootTimer){window.clearTimeout(window.__beAdminBootTimer);window.__beAdminBootTimer=0;}
  }
  function adminFrame(content,mode){
    clearAdminBootGuard();
    document.documentElement.classList.remove('site-loading-active');
    document.documentElement.classList.add('admin-mode');
    document.body.classList.remove('site-loading-active');
    document.body.classList.add('admin-mode');
    document.documentElement.style.setProperty('overflow','hidden','important');
    document.body.style.setProperty('overflow','hidden','important');
    document.body.innerHTML='<div class="'+(mode==='login'?'protected-admin-login-page':'protected-admin-system-page')+'">'+content+'</div>';
  }
  function showLogin(message){
    adminFrame('<section class="protected-admin-login-shell" aria-label="Entrar no Dashboard Admin"><a class="protected-admin-login-logo" href="/" aria-label="Voltar ao site"><img src="/assets/images/brand/logo.png?v=20260807-betv-logo-v4" alt="BE"></a><div class="protected-admin-login-card"><button id="protectedAdminGoogle" class="protected-admin-google-button" type="button"><span class="protected-admin-google-icon" aria-hidden="true">G</span><span class="protected-admin-google-label">Conectar via Google</span></button></div></section>','login');
    var button=document.getElementById('protectedAdminGoogle');
    if(button)button.onclick=async function(){
      var label=button.querySelector('.protected-admin-google-label');
      button.disabled=true;if(label)label.textContent='Conectando…';
      try{await window.beBackend.ready;await window.beBackend.auth.signInWithGoogle();}
      catch(error){button.disabled=false;if(label)label.textContent='Conectar via Google';alert(error&&error.message||message||'Não foi possível entrar.');}
    };
  }
  function showDenied(){
    clearAdminBootGuard();
    try{sessionStorage.removeItem('beOAuthDestination');}catch(_){ }
    location.replace('/404');
  }
  function showAdminLoadError(message){
    var safe=String(message||'Não foi possível iniciar o painel.').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});
    adminFrame('<section style="width:min(500px,100%);padding:30px;border:1px solid rgba(255,255,255,.13);border-radius:24px;background:#0a0d12;text-align:center"><h1 style="margin:0 0 10px;font-size:25px">Não foi possível carregar o painel</h1><p style="margin:0;color:#9ca7b7;line-height:1.55">'+safe+'</p><div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:22px"><button id="protectedAdminRetry" type="button" style="min-height:46px;padding:0 18px;border:0;border-radius:13px;background:#347ff1;color:#fff;font-weight:800;cursor:pointer">Tentar novamente</button><a href="/" style="display:grid;place-items:center;min-height:46px;padding:0 18px;border:1px solid rgba(255,255,255,.14);border-radius:13px;color:#fff;text-decoration:none;font-weight:800">Voltar ao site</a></div></section>');
    var retry=document.getElementById('protectedAdminRetry');
    if(retry)retry.onclick=function(){loaded=false;loading=false;location.reload();};
  }
  async function loadAdmin(){
    if(loaded||loading||!isAdminRoute())return;
    loading=true;
    clearAdminBootGuard();
    try{
      adminFrame('<div style="color:#9fb9df;font-size:16px">Carregando painel seguro…</div>');
      if(!window.beBackend)throw new Error('O sistema de autenticação não foi carregado.');
      await window.beBackend.ready;
      var client=window.beBackend.client;
      var token='';
      var retryDelays=[0,90,190,360,650];
      for(var retryIndex=0;retryIndex<retryDelays.length&&!token;retryIndex+=1){
        if(retryDelays[retryIndex])await new Promise(function(resolve){setTimeout(resolve,retryDelays[retryIndex]);});
        var sessionResult=client&&client.auth?await client.auth.getSession():null;
        token=sessionResult&&sessionResult.data&&sessionResult.data.session&&sessionResult.data.session.access_token||'';
      }
      if(!token){showLogin('Sua sessão expirou. Entre novamente.');return;}
      var currentAccount=window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;
      if(currentAccount&&window.beBackend&&typeof window.beBackend.isAdmin==='function'&&!window.beBackend.isAdmin(currentAccount)){showDenied();return;}
      var response=await fetch('/api/admin-runtime',{method:'GET',headers:{Authorization:'Bearer '+token},cache:'no-store',credentials:'same-origin'});
      if(!response.ok){
        if(response.status===401||response.status===403){showDenied();return;}
        throw new Error('O runtime protegido não respondeu corretamente (código '+response.status+').');
      }
      var source=await response.text();
      if(!String(source||'').trim())throw new Error('O runtime protegido retornou vazio.');
      await new Promise(function(resolve,reject){
        var runtimeError=null;
        var runtimeRejection=null;
        var settled=false;
        var blob=new Blob([source],{type:'application/javascript'});
        var blobUrl=URL.createObjectURL(blob);
        var script=document.createElement('script');
        function cleanup(){
          window.removeEventListener('error',onError,true);
          window.removeEventListener('unhandledrejection',onRejection,true);
          URL.revokeObjectURL(blobUrl);
          script.remove();
        }
        function finish(error){
          if(settled)return;
          settled=true;
          cleanup();
          if(error)reject(error);else resolve();
        }
        function onError(event){runtimeError=event&&event.error||new Error(event&&event.message||'Falha ao executar o painel.');}
        function onRejection(event){runtimeRejection=event&&event.reason instanceof Error?event.reason:new Error(String(event&&event.reason||'Falha ao iniciar o painel.'));}
        window.addEventListener('error',onError,true);
        window.addEventListener('unhandledrejection',onRejection,true);
        script.src=blobUrl;
        script.async=false;
        script.onload=function(){window.setTimeout(function(){finish(runtimeError||runtimeRejection);},0);};
        script.onerror=function(){finish(new Error('Não foi possível executar o runtime protegido.'));};
        document.head.appendChild(script);
        window.setTimeout(function(){
          if(settled)return;
          var visible=document.querySelector('.admin-shell,.admin-login,.admin-loader');
          if(visible)finish(runtimeError||runtimeRejection);else finish(new Error('O painel não concluiu a inicialização.'));
        },10000);
      });
      loaded=true;
      window.setTimeout(function(){
        if(!document.querySelector('.admin-shell,.admin-login,.admin-loader'))showAdminLoadError('O painel foi carregado, mas não exibiu conteúdo. Tente novamente.');
      },3500);
    }catch(error){
      showAdminLoadError(error&&error.message||'Atualize a página e tente novamente.');
    }finally{loading=false;}
  }
  loadAdmin();
  window.addEventListener('hashchange',loadAdmin);
  window.addEventListener('pageshow',loadAdmin);
  window.setTimeout(function(){
    try{window.beBackend&&window.beBackend.auth&&window.beBackend.auth.onChange&&window.beBackend.auth.onChange(loadAdmin);}catch(_){ }
  },0);
})();

;

;(function(){
  'use strict';
  function closeMenu(){
    var dropdown=document.getElementById('userDropdown');
    var chip=document.getElementById('userChip');
    if(dropdown)dropdown.classList.remove('open');
    if(chip)chip.setAttribute('aria-expanded','false');
  }
  function currentAccount(){return window.beBackend&&beBackend.auth?beBackend.auth.currentUser:null;}
  async function profileHandle(account){
    var label=document.getElementById('ddUsername');
    var value=label?String(label.textContent||'').replace(/^@/,'').trim():'';
    if(value&&value!=='Visitante'&&value!=='Usuário')return value;
    try{
      if(window.beBackend&&beBackend.profiles&&account){
        var profile=await beBackend.profiles.ensure(account);
        value=String(profile&&profile.username||'').trim();
      }
    }catch(_){ }
    return value||'perfil';
  }
  function activateSettings(){
    history.pushState({beRoute:'config'},'', '/config'+(location.search||''));
    window.dispatchEvent(new CustomEvent('be:open-config'));
    window.setTimeout(function(){
      if(!document.body.classList.contains('settings-page-active'))location.assign(window.BETVLocaleURL?window.BETVLocaleURL('/config'):'/config');
    },180);
  }
  async function activateProfile(account){
    var handle=await profileHandle(account);
    var path='/@'+encodeURIComponent(handle);
    history.pushState({beRoute:'profile'},'',path+(location.search||''));
    window.dispatchEvent(new CustomEvent('be:open-profile-route'));
    window.setTimeout(function(){
      if(!document.body.classList.contains('profile-page-active'))location.assign(window.BETVLocaleURL?window.BETVLocaleURL(path):path);
    },180);
  }
  document.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-public-action="profile"],[data-public-action="settings"]'):null;
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeMenu();
    var account=currentAccount();
    if(!account){window.BETVPublicRoutes.go('/login');document.body.classList.add('login-mode');return;}
    if(button.dataset.publicAction==='settings')activateSettings();
    else activateProfile(account);
  },true);
  window.BETVNavigation={openSettings:activateSettings,openProfile:function(){var account=currentAccount();if(account)return activateProfile(account);window.BETVPublicRoutes.go('/login');}};
})();


;(() => {
  'use strict';

  const classifyLogo = image => {
    if (!(image instanceof HTMLImageElement) || !image.classList.contains('video-card-logo')) return;
    const slot = image.closest('.video-card-logo-slot');
    if (!slot || !image.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    slot.dataset.logoShape = ratio >= 3.15 ? 'wide' : ratio <= 1.25 ? 'tall' : 'standard';
  };

  const prepareLogo = image => {
    if (!(image instanceof HTMLImageElement) || !image.classList.contains('video-card-logo')) return;
    if (image.dataset.logoSizingBound !== 'true') {
      image.dataset.logoSizingBound = 'true';
      image.addEventListener('load', () => classifyLogo(image), { passive:true });
    }
    if (image.complete) classifyLogo(image);
  };

  const scan = root => {
    if (!(root instanceof Element) && root !== document) return;
    if (root instanceof HTMLImageElement) prepareLogo(root);
    root.querySelectorAll?.('.video-card-logo').forEach(prepareLogo);
  };

  const start = () => {
    scan(document);
    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node instanceof Element) scan(node);
      }));
    }).observe(document.documentElement, { childList:true, subtree:true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();

;/* module boundary */
(function(){
  "use strict";

  
  var field = document.getElementById('particles');
  var COUNT = window.innerWidth < 600 ? 14 : 26;
  for (var i = 0; i < COUNT; i++){
    var p = document.createElement('div');
    p.className = 'particle';
    var size = 1 + Math.random() * 2.2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.bottom = (-10 - Math.random() * 20) + 'vh';
    var dur = 14 + Math.random() * 18;
    p.style.animationDuration = dur + 's';
    p.style.animationDelay = (-Math.random() * dur) + 's';
    field.appendChild(p);
  }

  var topbar = document.getElementById('topbar');

  
  document.getElementById('logoBtn').addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  
  var userChip = document.getElementById('userChip');
  var userDropdown = document.getElementById('userDropdown');

  function closeNotificationMenus(){
    window.dispatchEvent(new CustomEvent('be:close-notification-menus'));
    var notificationDropdown=document.getElementById('notificationDropdown');
    var notificationButton=document.getElementById('notificationButton');
    var mobileNotificationPopover=document.getElementById('mobileNotificationPopover');
    var mobileNotificationButton=document.getElementById('mobileNotificationButton');
    if(notificationDropdown)notificationDropdown.classList.remove('open');
    if(notificationButton)notificationButton.setAttribute('aria-expanded','false');
    if(mobileNotificationPopover)mobileNotificationPopover.hidden=true;
    if(mobileNotificationButton)mobileNotificationButton.setAttribute('aria-expanded','false');
  }
  function toggleDropdown(force){
    var open = typeof force === 'boolean' ? force : !userDropdown.classList.contains('open');
    if(open)closeNotificationMenus();
    userDropdown.classList.toggle('open', open);
    userChip.setAttribute('aria-expanded', String(open));
  }
  userChip.addEventListener('click', function(e){
    e.stopPropagation();
    toggleDropdown();
  });
  document.addEventListener('click', function(e){
    if (!userDropdown.contains(e.target) && e.target !== userChip) toggleDropdown(false);
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') toggleDropdown(false);
  });


  
  async function setupPublicAccount(){
    var callbackDestination=new URLSearchParams(location.search||'').get('auth_callback');
    if(location.hash.startsWith('#/admin')||callbackDestination==='admin') return;
    if(!window.beBackend) return;
    await window.beBackend.ready;
    var auth=beBackend.auth;
    var photo=document.getElementById('publicUserPhoto');
    var fallback=document.getElementById('publicUserFallback');
    var username=document.getElementById('ddUsername');
    var dashboard=document.getElementById('publicDashboardLink');
    var authAction=document.getElementById('publicAuthAction');
    function syncAuthActionLabel(){
      if(!authAction)return;
      var guestActive=!auth.currentUser&&Boolean(window.BETVGuestAccess&&window.BETVGuestAccess.isActive());
      authAction.textContent=(auth.currentUser||guestActive)?'Sair':'Entrar';
    }
    var avatarPicker=document.getElementById('avatarPicker');
    var avatarPickerBody=document.getElementById('avatarPickerBody');
    var avatarPickerClose=document.getElementById('avatarPickerClose');
    var avatarPickerCancel=document.getElementById('avatarPickerCancel');
    var profileModal=document.getElementById('profileModal');
    var profileBody=document.getElementById('profileBody');
    var profileClose=document.getElementById('profileClose');
    var profilePage=document.getElementById('profilePage');
    var profilePageAvatar=document.getElementById('profilePageAvatar');
    var profilePageBanner=document.getElementById('profilePageBanner');
    var profilePageBannerImg=document.getElementById('profilePageBannerImg');
    var profilePageBannerFallback=document.getElementById('profilePageBannerFallback');
    var profilePageName=document.getElementById('profilePageName');
    var profilePageHandle=document.getElementById('profilePageHandle');
    var profilePageBadge=document.getElementById('profilePageBadge');
    var profilePageSocials=document.getElementById('profilePageSocials');
    var profilePageMetaLabel=document.getElementById('profilePageMetaLabel');
    var profilePageMemberSince=document.getElementById('profilePageMemberSince');
    var profilePageMore=document.getElementById('profilePageMore');
    var profilePageNotifications=document.getElementById('profilePageNotifications');
    var profilePageLogout=document.getElementById('profilePageLogout');
    var profilePageHome=document.getElementById('profilePageHome');
    var profileFavoritesSection=document.getElementById('profileFavoritesSection');
    var profileFavoritesContent=document.getElementById('profileFavoritesContent');
    var profileFavoritesEdit=document.getElementById('profileFavoritesEdit');
    var profileLovedAlbumsSection=document.getElementById('profileLovedAlbumsSection');
    var profileLovedAlbumsContent=document.getElementById('profileLovedAlbumsContent');
    var profileLovedAlbumsEdit=document.getElementById('profileLovedAlbumsEdit');
    function localizedProfileText(source){
      return window.BETVI18n&&typeof window.BETVI18n.t==='function'?window.BETVI18n.t(source):source;
    }
    function setLiteralText(element,value){
      if(!element)return;
      element.classList.add('notranslate');
      element.setAttribute('translate','no');
      element.textContent=String(value==null?'':value);
    }
    function setInterfaceText(element,source){
      if(!element)return;
      element.classList.remove('notranslate');
      element.removeAttribute('translate');
      element.textContent=localizedProfileText(source);
      if(window.BETVI18n&&typeof window.BETVI18n.apply==='function')window.BETVI18n.apply(element);
    }
    function syncProfileLanguage(){
      if(profileFavoritesEdit)profileFavoritesEdit.textContent=localizedProfileText('Editar favoritos');
      if(profileLovedAlbumsEdit)profileLovedAlbumsEdit.textContent=localizedProfileText('Editar álbuns');
    }
    syncProfileLanguage();
    window.addEventListener('be:i18n-ready',syncProfileLanguage);
    var profileFavoritesPicker=document.getElementById('profileFavoritesPicker');
    var profileFavoritesPickerBody=document.getElementById('profileFavoritesPickerBody');
    var profileFavoritesPickerClose=document.getElementById('profileFavoritesPickerClose');
    var profileFavoritesHeaderSave=document.getElementById('profileFavoritesHeaderSave');
    var profileFavoritesCancel=document.getElementById('profileFavoritesCancel');
    var profileFavoritesSave=document.getElementById('profileFavoritesSave');
    var profileFavoritesSearch=document.getElementById('profileFavoritesSearch');
    var profileFavoritesSelectionCount=document.getElementById('profileFavoritesSelectionCount');
    var profileFavoritesItems=[];
    var profileFavoritesDraft=[];
    var profileFavoritesCatalog=[];
    var profileFavoritesLastFocus=null;
    var profileFavoritesReturnPath='';
    var profileLovedAlbumsPicker=document.getElementById('profileLovedAlbumsPicker');
    var profileLovedAlbumsPickerBody=document.getElementById('profileLovedAlbumsPickerBody');
    var profileLovedAlbumsPickerClose=document.getElementById('profileLovedAlbumsPickerClose');
    var profileLovedAlbumsHeaderSave=document.getElementById('profileLovedAlbumsHeaderSave');
    var profileLovedAlbumsCancel=document.getElementById('profileLovedAlbumsCancel');
    var profileLovedAlbumsSave=document.getElementById('profileLovedAlbumsSave');
    var profileLovedAlbumsSearch=document.getElementById('profileLovedAlbumsSearch');
    var profileLovedAlbumsSelectionCount=document.getElementById('profileLovedAlbumsSelectionCount');
    var profileLovedAlbumsItems=[];
    var profileLovedAlbumsDraft=[];
    var profileLovedAlbumsCatalog=[];
    var profileLovedAlbumsLastFocus=null;
    var profileLovedAlbumsReturnPath='';
    var profileSavedSection=document.getElementById('profileSavedSection');
    var profileSavedGrid=document.getElementById('profileSavedGrid');
    var profileSavedCount=document.getElementById('profileSavedCount');
    var profileSavedItems=[];
    var settingsPage=document.getElementById('settingsPage');
    var settingsPageBody=document.getElementById('settingsPageBody');
    var bannerPicker=document.getElementById('bannerPicker');
    var bannerPickerBody=document.getElementById('bannerPickerBody');
    var bannerPickerClose=document.getElementById('bannerPickerClose');
    var bannerPickerCancel=document.getElementById('bannerPickerCancel');
    var profileOnboarding=document.getElementById('profileOnboarding');
    var onboardingForm=document.getElementById('onboardingForm');
    var onboardingUsername=document.getElementById('onboardingUsername');
    var onboardingHandlePreview=document.getElementById('onboardingHandlePreview');
    var onboardingMessage=document.getElementById('onboardingMessage');
    var onboardingChooseAvatar=document.getElementById('onboardingChooseAvatar');
    var onboardingAvatarPreview=document.getElementById('onboardingAvatarPreview');
    var selectedAvatar='';
    var currentProfile={};
    var viewedProfile=null;
    var viewedProfileStatus='idle';
    var viewedProfileRequest=0;
    var onboardingShownFor='';
    var avatarPickerReturnView='';
    var bannerPickerReturnView='';
    var SETTINGS_TAB_SESSION_KEY='beSettingsActiveTab';
    var settingsActiveTab=(function(){
      var remembered='';
      try{remembered=String(history.state&&history.state.settingsTab||sessionStorage.getItem(SETTINGS_TAB_SESSION_KEY)||'');}catch(_){ }
      return ['profile','connections','socials','data','language','session','account'].indexOf(remembered)>=0?remembered:'profile';
    })();
    var settingsSaveConfirm=document.getElementById('settingsSaveConfirm');
    var settingsSaveCancel=document.getElementById('settingsSaveCancel');
    var settingsSaveApprove=document.getElementById('settingsSaveApprove');
    var settingsSaveToast=document.getElementById('settingsSaveToast');
    var settingsConfirmResolver=null;
    var settingsToastTimer=null;
    var pickerGalleryCache=null;
    var pickerGalleryPromise=null;
    var avatarGalleryRendered=false;
    var bannerGalleryRendered=false;
    var avatarImageObserver=null;
    var bannerImageObserver=null;
    var profileDeviceSyncStop=null;
    var preferenceDeviceSyncStop=null;
    var preferenceSyncTimer=0;
    var preferenceSyncUserId='';
    var preferenceSyncStarting=false;
    var applyingRemotePreferences=false;
    var settingsSyncState='idle';
    var settingsSyncMessage='Aguardando login para sincronizar.';

    function escapePublic(value){return String(value||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
    function normalizeProfileSocialValue(network,value){
      var kind=String(network||'').toLowerCase();
      var raw=String(value||'').trim();
      if(!raw)return '';
      if(kind==='x'||kind==='instagram'){
        var expectedHosts=kind==='x'?['x.com','twitter.com']:['instagram.com'];
        var candidate=raw;
        if(/^https?:\/\//i.test(candidate)||/^(?:www\.)?(?:x\.com|twitter\.com|instagram\.com)\//i.test(candidate)){
          try{
            var socialUrl=new URL(/^https?:\/\//i.test(candidate)?candidate:'https://'+candidate);
            var host=String(socialUrl.hostname||'').toLowerCase().replace(/^www\./,'');
            if(expectedHosts.indexOf(host)<0)return '';
            candidate=String(socialUrl.pathname||'').replace(/^\/+|\/+$/g,'').split('/')[0]||'';
          }catch(_){return '';}
        }
        candidate=String(candidate||'').replace(/^@+/,'').split(/[/?#]/)[0].trim();
        if(kind==='x')return /^[A-Za-z0-9_]{1,15}$/.test(candidate)?candidate:'';
        return /^[A-Za-z0-9._]{1,30}$/.test(candidate)&&candidate.indexOf('..')<0?candidate:'';
      }
      return '';
    }
    function normalizeProfileSocialLinks(value){
      var source=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
      return {
        x:normalizeProfileSocialValue('x',source.x||source.twitter||''),
        instagram:normalizeProfileSocialValue('instagram',source.instagram||'')
      };
    }
    function hasProfileSocialLinks(value){var links=normalizeProfileSocialLinks(value);return Boolean(links.x||links.instagram);}
    function profileSocialStorageKey(userId){return 'beProfileSocialLinks:'+String(userId||'guest');}
    function readProfileSocialLinks(userId){
      try{return normalizeProfileSocialLinks(JSON.parse(localStorage.getItem(profileSocialStorageKey(userId))||'{}'));}
      catch(_){return normalizeProfileSocialLinks({});}
    }
    function writeProfileSocialLinks(userId,value){
      var links=normalizeProfileSocialLinks(value);
      try{localStorage.setItem(profileSocialStorageKey(userId),JSON.stringify(links));}catch(_){ }
      return links;
    }
    function profileSocialHref(network,value){
      var normalized=normalizeProfileSocialValue(network,value);
      if(!normalized)return '';
      if(network==='x')return 'https://x.com/'+encodeURIComponent(normalized);
      if(network==='instagram')return 'https://www.instagram.com/'+encodeURIComponent(normalized)+'/';
      return '';
    }
    function profileSocialIcon(network){
      if(network==='x')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.4L6.47 22H3.36l7.26-8.3L2.97 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.72L8.43 4.05H6.58L17.8 19.84Z"></path></svg>';
      if(network==='instagram')return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><path d="M17.5 6.5h.01"></path></svg>';
      return '';
    }
    function renderProfileSocials(profile){
      if(!profilePageSocials)return;
      if(!profile){profilePageSocials.innerHTML='';profilePageSocials.hidden=true;profilePageSocials.setAttribute('hidden','');return;}
      var links=normalizeProfileSocialLinks(profile&&profile.socialLinks);
      if(isOwnProfileView()&&auth.currentUser){
        var localLinks=readProfileSocialLinks(auth.currentUser.uid);
        if(hasProfileSocialLinks(localLinks)||!hasProfileSocialLinks(links))links=localLinks;
      }
      var labels={x:'X',instagram:'Instagram'};
      var order=['x','instagram'];
      var markup=order.map(function(network){
        var value=links[network];if(!value)return '';
        var href=profileSocialHref(network,value);
        var title=labels[network];
        var className='profile-page-social-link is-'+network;
        if(href)return '<a class="'+className+'" href="'+escapePublic(href)+'" target="_blank" rel="noopener noreferrer" aria-label="Abrir '+labels[network]+'" title="'+escapePublic(title)+'">'+profileSocialIcon(network)+'</a>';
        return '<span class="'+className+' is-static" role="img" aria-label="'+escapePublic(title)+'" title="'+escapePublic(title)+'">'+profileSocialIcon(network)+'</span>';
      }).join('');
      profilePageSocials.innerHTML=markup;
      profilePageSocials.hidden=!markup;
      if(markup)profilePageSocials.removeAttribute('hidden');else profilePageSocials.setAttribute('hidden','');
    }
    function avatarCacheKey(user){return 'beSelectedAvatar:'+(user&&user.uid?user.uid:'guest');}
    function selectedProfileAvatar(profile){return profile&&profile.avatarUrl?String(profile.avatarUrl):'';}
    function setMainAvatar(url){var shown=String(url||'').trim();if(window.BETVApplyAvatar)window.BETVApplyAvatar(photo,shown);else{photo.src=shown||window.BETV_DEFAULT_AVATAR;photo.hidden=false;}fallback.hidden=true;updateOnboardingAvatar();}
    function fallbackAvatarSvg(){return '<img loading="eager" decoding="async" src="'+escapePublic(window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png')+'" data-avatar-fallback="'+escapePublic(window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png')+'" alt="Sem foto de perfil">';}
    function updateOnboardingAvatar(){if(!onboardingAvatarPreview)return;var shown=selectedAvatar||selectedProfileAvatar(currentProfile)||window.BETV_DEFAULT_AVATAR;onboardingAvatarPreview.innerHTML='<img loading="eager" decoding="async" src="'+escapePublic(window.BETVResolveAvatar?window.BETVResolveAvatar(shown):shown)+'" data-avatar-fallback="'+escapePublic(window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png')+'" alt="Foto do perfil">';}
    function syncBodyScroll(){var locked=!avatarPicker.hidden||!bannerPicker.hidden||!profileModal.hidden||!profileOnboarding.hidden||(profileFavoritesPicker&&!profileFavoritesPicker.hidden)||(profileLovedAlbumsPicker&&!profileLovedAlbumsPicker.hidden)||(settingsSaveConfirm&&!settingsSaveConfirm.hidden);document.body.style.overflow=locked?'hidden':'';}
    function keepSettingsOpen(){
      if(!auth.currentUser)return;
      profilePage.hidden=true;profilePage.setAttribute('hidden','');profilePage.setAttribute('aria-hidden','true');
      settingsPage.hidden=false;settingsPage.removeAttribute('hidden');settingsPage.setAttribute('aria-hidden','false');
      document.body.classList.remove('profile-page-active','login-mode','support-page-active','notification-page-active','billie-page-active','donate-page-active','detail-page-active','section-catalog-active');
      document.body.classList.add('settings-page-active');
      if(!isConfigRoute())replacePublicRoute('/config');
    }
    function pushPickerHistory(kind){
      if(!window.matchMedia('(max-width:760px)').matches)return;
      if(history.state&&history.state.beOverlay===kind)return;
      try{history.pushState({...history.state,beOverlay:kind},'',location.pathname+(location.search||'')+(location.hash||''));}catch(_){}
    }
    function closeAvatarPicker(unwindHistory){
      var returnView=avatarPickerReturnView;
      var shouldUnwind=unwindHistory!==false&&window.matchMedia('(max-width:760px)').matches&&history.state&&history.state.beOverlay==='avatar-picker';
      avatarPicker.hidden=true;avatarPickerReturnView='';document.body.classList.remove('avatar-picker-active');
      if(avatarImageObserver){avatarImageObserver.disconnect();avatarImageObserver=null;}syncBodyScroll();if(returnView==='settings')keepSettingsOpen();
      if(shouldUnwind){try{history.back();}catch(_){}}
    }
    function closeBannerPicker(unwindHistory){
      var returnView=bannerPickerReturnView;
      var shouldUnwind=unwindHistory!==false&&window.matchMedia('(max-width:760px)').matches&&history.state&&history.state.beOverlay==='banner-picker';
      bannerPicker.hidden=true;bannerPickerReturnView='';document.body.classList.remove('banner-picker-active');
      if(bannerImageObserver){bannerImageObserver.disconnect();bannerImageObserver=null;}syncBodyScroll();if(returnView==='settings')keepSettingsOpen();
      if(shouldUnwind){try{history.back();}catch(_){}}
    }
    function closeProfile(){profileModal.hidden=true;syncBodyScroll();}
    function resolveSettingsConfirm(value){
      if(!settingsSaveConfirm||settingsSaveConfirm.hidden)return;
      settingsSaveConfirm.hidden=true;syncBodyScroll();
      var resolve=settingsConfirmResolver;settingsConfirmResolver=null;if(resolve)resolve(Boolean(value));
    }
    function askSettingsSave(){
      if(!settingsSaveConfirm)return Promise.resolve(true);
      if(settingsConfirmResolver)resolveSettingsConfirm(false);
      settingsSaveConfirm.hidden=false;syncBodyScroll();
      return new Promise(function(resolve){settingsConfirmResolver=resolve;setTimeout(function(){if(settingsSaveApprove)settingsSaveApprove.focus({preventScroll:true});},40);});
    }
    function showSettingsSaved(){
      if(!settingsSaveToast)return;
      clearTimeout(settingsToastTimer);settingsSaveToast.hidden=false;
      settingsToastTimer=setTimeout(function(){settingsSaveToast.hidden=true;},2200);
    }
    function syncedUserCacheKey(userId){return 'beSyncedUserData:'+String(userId||'guest');}
    function readStorageJson(key,fallback){try{var parsed=JSON.parse(localStorage.getItem(key)||'null');return parsed===null?fallback:parsed;}catch(_){return fallback;}}
    function uniqueSyncStrings(values,limit){var result=[];(Array.isArray(values)?values:[]).forEach(function(value){var normalized=String(value||'').trim();if(normalized&&result.indexOf(normalized)<0)result.push(normalized);});return typeof limit==='number'?result.slice(0,limit):result;}
    function syncRecordIdentity(item){return String((item&&item.favoriteId)||(item&&item.itemId)||((item&&item.collection&&item.recordId)?item.collection+':'+item.recordId:'')||(item&&item.title)||'').trim();}
    function uniqueSyncRecords(values,limit){var result=[];(Array.isArray(values)?values:[]).forEach(function(item){if(!item||typeof item!=='object')return;var identity=syncRecordIdentity(item);if(!identity||result.some(function(current){return syncRecordIdentity(current)===identity;}))return;result.push({...item});});return typeof limit==='number'?result.slice(0,limit):result;}
    function normalizeCrossDeviceData(value){
      var source=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
      return {
        version:1,
        detailFavorites:uniqueSyncStrings(source.detailFavorites),
        featuredFavorites:uniqueSyncStrings(source.featuredFavorites),
        savedContents:uniqueSyncRecords(source.savedContents,20),
        profileTopFavorites:uniqueSyncRecords(source.profileTopFavorites,4),
        profileLovedAlbums:uniqueSyncRecords(source.profileLovedAlbums,3),
        profileSocialLinks:normalizeProfileSocialLinks(source.profileSocialLinks),
        updatedAt:String(source.updatedAt||'')
      };
    }
    function captureCrossDeviceData(userId){
      return normalizeCrossDeviceData({
        detailFavorites:readStorageJson('beDetailFavorites',[]),
        featuredFavorites:readStorageJson('beFeaturedFavorites',[]),
        savedContents:readStorageJson('beSavedContents',[]),
        profileTopFavorites:readStorageJson('beProfileTopFavorites:'+String(userId||'guest'),[]),
        profileLovedAlbums:readStorageJson('beProfileLovedAlbums:'+String(userId||'guest'),[]),
        profileSocialLinks:readProfileSocialLinks(userId),
        updatedAt:beBackend.now()
      });
    }
    function mergeInitialCrossDeviceData(remoteData,localData){
      var remote=normalizeCrossDeviceData(remoteData),local=normalizeCrossDeviceData(localData);
      return normalizeCrossDeviceData({
        detailFavorites:remote.detailFavorites.concat(local.detailFavorites),
        featuredFavorites:remote.featuredFavorites.concat(local.featuredFavorites),
        savedContents:remote.savedContents.concat(local.savedContents),
        profileTopFavorites:remote.profileTopFavorites.concat(local.profileTopFavorites),
        profileLovedAlbums:remote.profileLovedAlbums.concat(local.profileLovedAlbums),
        profileSocialLinks:hasProfileSocialLinks(remote.profileSocialLinks)?remote.profileSocialLinks:local.profileSocialLinks,
        updatedAt:beBackend.now()
      });
    }
    function localCrossDeviceSeed(userId){
      var cached=readStorageJson(syncedUserCacheKey(userId),null);
      if(cached&&typeof cached==='object')return normalizeCrossDeviceData(cached.data||cached);
      var owner='';try{owner=String(localStorage.getItem('beSyncedDataOwner')||'');}catch(_){ }
      if(!owner||owner===String(userId||''))return captureCrossDeviceData(userId);
      return normalizeCrossDeviceData({});
    }
    function updateSettingsSyncStatus(){
      var box=document.getElementById('settingsDeviceSync');
      var message=document.getElementById('settingsDeviceSyncMessage');
      if(!box||!message)return;
      box.classList.remove('is-idle','is-syncing','is-active','is-error');
      box.classList.add('is-'+settingsSyncState);
      message.textContent=settingsSyncMessage;
    }
    function setSettingsSyncStatus(state,message){settingsSyncState=state||'idle';settingsSyncMessage=String(message||'');updateSettingsSyncStatus();}
    function settingsSyncMarkup(){
      var state=['idle','syncing','active','error'].indexOf(settingsSyncState)>=0?settingsSyncState:'idle';
      return '<div class="settings-device-sync is-'+state+'" id="settingsDeviceSync" role="status"><span class="settings-device-sync-dot" aria-hidden="true"></span><span><strong>Sincronização entre dispositivos</strong><small id="settingsDeviceSyncMessage">'+escapePublic(settingsSyncMessage)+'</small></span></div>';
    }
    function applyCrossDeviceData(value,userId,source){
      if(!userId)return;
      var data=normalizeCrossDeviceData(value);
      applyingRemotePreferences=true;
      try{
        localStorage.setItem('beDetailFavorites',JSON.stringify(data.detailFavorites));
        localStorage.setItem('beFeaturedFavorites',JSON.stringify(data.featuredFavorites));
        localStorage.setItem('beSavedContents',JSON.stringify(data.savedContents));
        localStorage.setItem('beProfileTopFavorites:'+userId,JSON.stringify(data.profileTopFavorites));
        localStorage.setItem('beProfileLovedAlbums:'+userId,JSON.stringify(data.profileLovedAlbums));
        localStorage.setItem(profileSocialStorageKey(userId),JSON.stringify(data.profileSocialLinks));
        localStorage.setItem(syncedUserCacheKey(userId),JSON.stringify({data:data,updatedAt:data.updatedAt||beBackend.now()}));
        localStorage.setItem('beSyncedDataOwner',String(userId));
      }catch(error){console.warn('Não foi possível atualizar o cache sincronizado:',error);}
      applyingRemotePreferences=false;
      profileFavoritesItems=data.profileTopFavorites.slice(0,4);
      profileLovedAlbumsItems=data.profileLovedAlbums.slice(0,3);
      if(auth.currentUser&&auth.currentUser.uid===userId){
        currentProfile={...(currentProfile||{}),socialLinks:data.profileSocialLinks};
        if(viewedProfile&&isOwnProfileView())viewedProfile={...viewedProfile,socialLinks:data.profileSocialLinks};
      }
      try{window.dispatchEvent(new CustomEvent('be:user-data-synced',{detail:{userId:userId,source:source||'remote',data:data}}));}catch(_){ }
      try{window.dispatchEvent(new CustomEvent('be:favorites-changed',{detail:{synced:true}}));}catch(_){ }
      try{window.dispatchEvent(new CustomEvent('be:profile-favorites-changed',{detail:{items:profileFavoritesItems,synced:true}}));}catch(_){ }
      try{window.dispatchEvent(new CustomEvent('be:profile-loved-albums-changed',{detail:{items:profileLovedAlbumsItems,synced:true}}));}catch(_){ }
      if(document.body.classList.contains('profile-page-active')){renderProfileSocials(viewedProfile||currentProfile);renderProfileFavorites();renderProfileLovedAlbums();renderProfileSaved();}
    }
    async function persistCrossDeviceData(reason){
      var user=auth.currentUser;
      if(!user||!user.uid||applyingRemotePreferences||!beBackend.preferences)return;
      var userId=user.uid;
      var payload=captureCrossDeviceData(userId);
      try{localStorage.setItem(syncedUserCacheKey(userId),JSON.stringify({data:payload,updatedAt:payload.updatedAt}));localStorage.setItem('beSyncedDataOwner',String(userId));}catch(_){ }
      setSettingsSyncStatus('syncing','Salvando alterações do '+((reason==='profile-favorites'||reason==='profile-albums'||reason==='profile-socials')?'perfil':'aparelho')+'…');
      try{
        var saved=await beBackend.preferences.save(userId,payload);
        if(auth.currentUser&&auth.currentUser.uid===userId){
          setSettingsSyncStatus('active','Sincronizado entre celular e computador.');
        }
      }catch(error){
        console.warn('Não foi possível sincronizar as preferências:',error&&error.message?error.message:error);
        setSettingsSyncStatus('error','Alterações mantidas neste aparelho. A sincronização será tentada novamente.');
      }
    }
    function scheduleCrossDeviceSync(reason){
      if(applyingRemotePreferences||!auth.currentUser||!auth.currentUser.uid)return;
      clearTimeout(preferenceSyncTimer);
      preferenceSyncTimer=setTimeout(function(){persistCrossDeviceData(reason||'configuração');},350);
    }
    window.beScheduleUserDataSync=scheduleCrossDeviceSync;
    function stopCrossDeviceSync(){
      clearTimeout(preferenceSyncTimer);preferenceSyncTimer=0;
      if(profileDeviceSyncStop){try{profileDeviceSyncStop();}catch(_){ }profileDeviceSyncStop=null;}
      if(preferenceDeviceSyncStop){try{preferenceDeviceSyncStop();}catch(_){ }preferenceDeviceSyncStop=null;}
      preferenceSyncUserId='';preferenceSyncStarting=false;
    }
    function applyRemoteProfile(profile,userId){
      if(!profile||!auth.currentUser||auth.currentUser.uid!==userId)return;
      var rememberedAvatar=selectedProfileAvatar(currentProfile)||selectedAvatar||localStorage.getItem('beSelectedAvatar:'+userId)||'';
      currentProfile={...(currentProfile||{}),...profile};
      if(!selectedProfileAvatar(currentProfile)&&rememberedAvatar){
        currentProfile.avatarUrl=rememberedAvatar;
        currentProfile.avatarId=currentProfile.avatarId||(profile&&profile.avatarId)||'saved-selection';
      }
      selectedAvatar=selectedProfileAvatar(currentProfile);
      try{
        localStorage.setItem('beSelectedAvatar:'+userId,selectedAvatar||'');
        localStorage.setItem('beProfileBanner:'+userId,JSON.stringify({bannerUrl:String(currentProfile.bannerUrl||''),bannerId:String(currentProfile.bannerId||''),updatedAt:currentProfile.updatedAt||beBackend.now()}));
      }catch(_){ }
      setLiteralText(username,currentProfile.username?'@'+currentProfile.username:(currentProfile.displayName||auth.currentUser.displayName||'Usuário'));
      setMainAvatar(selectedAvatar);renderProfilePage();
      if(document.body.classList.contains('settings-page-active')||isConfigRoute()){renderSettingsPage();keepSettingsOpen();}
      try{window.dispatchEvent(new CustomEvent('be:profile-device-synced',{detail:{userId:userId,profile:currentProfile}}));}catch(_){ }
    }
    async function startCrossDeviceSync(user){
      if(!user||!user.uid||!beBackend.preferences)return;
      if(preferenceSyncUserId===user.uid&&(preferenceSyncStarting||preferenceDeviceSyncStop))return;
      stopCrossDeviceSync();
      var userId=user.uid;preferenceSyncUserId=userId;preferenceSyncStarting=true;
      setSettingsSyncStatus('syncing','Carregando as configurações da sua conta…');
      try{
        var cachedSeed=readStorageJson(syncedUserCacheKey(userId),null);
        var localSeed=cachedSeed&&typeof cachedSeed==='object'?normalizeCrossDeviceData(cachedSeed.data||cachedSeed):localCrossDeviceSeed(userId);
        var remote=await beBackend.preferences.get(userId);
        if(!auth.currentUser||auth.currentUser.uid!==userId)return;
        var merged=localSeed;
        if(remote){
          var remoteData=normalizeCrossDeviceData(remote.data);
          if(cachedSeed&&typeof cachedSeed==='object'){
            var remoteTime=Date.parse(remoteData.updatedAt||remote.updatedAt||'')||0;
            var localTime=Date.parse(localSeed.updatedAt||cachedSeed.updatedAt||'')||0;
            if(remoteTime&&localTime)merged=remoteTime>=localTime?remoteData:localSeed;
            else if(remoteTime)merged=remoteData;
            else if(!localTime)merged=mergeInitialCrossDeviceData(remoteData,localSeed);
          }else{
            merged=remoteData;
          }
        }
        applyCrossDeviceData(merged,userId,remote?'remote':'local');
        var saved=await beBackend.preferences.save(userId,{...merged,updatedAt:beBackend.now()});
        if(!auth.currentUser||auth.currentUser.uid!==userId)return;
        preferenceDeviceSyncStop=beBackend.preferences.subscribe(userId,function(record){
          if(!record||!auth.currentUser||auth.currentUser.uid!==userId)return;
          applyCrossDeviceData(record.data,userId,'remote');
          setSettingsSyncStatus('active','Atualizado em todos os dispositivos.');
        });
        if(beBackend.profiles&&typeof beBackend.profiles.subscribe==='function')profileDeviceSyncStop=beBackend.profiles.subscribe(userId,function(profile){applyRemoteProfile(profile,userId);});
        setSettingsSyncStatus('active','Sincronizado entre celular e computador.');
      }catch(error){
        console.warn('Sincronização entre dispositivos indisponível:',error&&error.message?error.message:error);
        setSettingsSyncStatus('error','Os dados continuam salvos neste aparelho; verifique a conexão para sincronizar.');
      }finally{preferenceSyncStarting=false;}
    }
    function closeOnboarding(force){if(!force&&auth.currentUser&&!String(currentProfile.username||'').trim())return;profileOnboarding.hidden=true;document.body.classList.remove('profile-onboarding-active');profileOnboarding.setAttribute('aria-hidden','true');syncBodyScroll();}

    function setupAvatarRails(){
      avatarPickerBody.querySelectorAll('.avatar-category').forEach(function(section){
        var rail=section.querySelector('.avatar-options');
        var prev=section.querySelector('.avatar-rail-arrow.prev');
        var next=section.querySelector('.avatar-rail-arrow.next');
        if(!rail||!prev||!next)return;
        function amount(){return Math.max(rail.clientWidth*.78,320);}
        function update(){var max=rail.scrollWidth-rail.clientWidth;prev.hidden=rail.scrollLeft<=4;next.hidden=max<=4||rail.scrollLeft>=max-4;}
        prev.addEventListener('click',function(){rail.scrollBy({left:-amount(),behavior:'smooth'});});
        next.addEventListener('click',function(){rail.scrollBy({left:amount(),behavior:'smooth'});});
        rail.addEventListener('scroll',update,{passive:true});
        requestAnimationFrame(update);
      });
    }

    function avatarCategoryTitle(category){
      return String(category||'Outros').trim()||'Outros';
    }

    async function loadPickerGallery(){
      if(Array.isArray(pickerGalleryCache))return pickerGalleryCache;
      if(!pickerGalleryPromise){
        pickerGalleryPromise=beBackend.data.list('gallery',{orderBy:'order',direction:'asc'}).then(function(items){
          pickerGalleryCache=(Array.isArray(items)?items:[]).filter(function(item){return item&&item.active!==false&&item.imageUrl;});
          return pickerGalleryCache;
        }).finally(function(){pickerGalleryPromise=null;});
      }
      return pickerGalleryPromise;
    }

    function activatePickerImages(root,kind){
      if(!root)return;
      var images=Array.from(root.querySelectorAll('img[data-picker-src]'));
      if(!images.length)return;
      var hydrate=function(image){
        var src=image.dataset.pickerSrc||'';
        if(!src)return;
        image.src=src;
        image.removeAttribute('data-picker-src');
      };
      if(!('IntersectionObserver' in window)){images.forEach(hydrate);return;}
      if(kind==='avatar'&&avatarImageObserver)avatarImageObserver.disconnect();
      if(kind==='banner'&&bannerImageObserver)bannerImageObserver.disconnect();
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){if(!entry.isIntersecting)return;hydrate(entry.target);observer.unobserve(entry.target);});
      },{root:root,rootMargin:'260px 220px',threshold:.01});
      images.forEach(function(image){observer.observe(image);});
      if(kind==='avatar')avatarImageObserver=observer;else bannerImageObserver=observer;
    }

    function syncAvatarPickerSelection(){
      var current=selectedAvatar||selectedProfileAvatar(currentProfile)||'';
      avatarPickerBody.querySelectorAll('.avatar-option').forEach(function(option){option.classList.toggle('selected',option.dataset.avatarUrl===current);});
    }

    function bindAvatarPickerSelection(){
      if(avatarPickerBody.dataset.selectionBound==='true')return;
      avatarPickerBody.dataset.selectionBound='true';
      avatarPickerBody.addEventListener('click',async function(event){
        var button=event.target.closest('[data-avatar-url]');
        if(!button||!avatarPickerBody.contains(button)||button.disabled)return;
        var url=button.dataset.avatarUrl||'';
        var returnView=avatarPickerReturnView;
        button.disabled=true;
        try{
          if(auth.currentUser){
            var savedProfile=await beBackend.profiles.setAvatar(auth.currentUser.uid,url,button.dataset.avatarId);
            if(savedProfile)currentProfile=savedProfile;
          }else{currentProfile.avatarUrl=url;}
          selectedAvatar=(currentProfile&&currentProfile.avatarUrl)||url;
          setMainAvatar(selectedAvatar);
          localStorage.setItem(avatarCacheKey(auth.currentUser),selectedAvatar);
          syncAvatarPickerSelection();
          if(returnView==='settings'){renderSettingsPage();keepSettingsOpen();showSettingsSaved();}
          setTimeout(closeAvatarPicker,120);
        }catch(error){
          button.disabled=false;
          console.warn('Avatar não salvo no perfil:',error.message);
          alert('Não foi possível salvar o avatar. Tente novamente.');
        }
      });
    }

    async function openAvatarPicker(){
      avatarPickerReturnView=document.body.classList.contains('settings-page-active')||isConfigRoute()?'settings':(document.body.classList.contains('profile-page-active')?'profile':'');
      toggleDropdown(false);document.body.classList.add('avatar-picker-active');avatarPicker.hidden=false;syncBodyScroll();pushPickerHistory('avatar-picker');
      bindAvatarPickerSelection();
      if(avatarGalleryRendered){
        syncAvatarPickerSelection();
        activatePickerImages(avatarPickerBody,'avatar');
        return;
      }
      avatarPickerBody.innerHTML='<div class="avatar-picker-empty">Carregando avatares…</div>';
      try{
        var items=(await loadPickerGallery()).filter(function(item){var type=String(item.itemType||'').toLowerCase();return type!=='banner'&&!/banner/i.test(String(item.category||''));});
        if(!items.length){avatarPickerBody.innerHTML='<div class="avatar-picker-empty">Nenhum avatar disponível no momento.</div>';return;}
        var groups={};
        items.forEach(function(item){var cat=(item.category||'Outros').trim()||'Outros';(groups[cat]||(groups[cat]=[])).push(item);});
        avatarPickerBody.innerHTML='<div class="avatar-category-columns">'+Object.keys(groups).map(function(cat){
          return '<section class="avatar-category"><h3>'+escapePublic(avatarCategoryTitle(cat))+'</h3><div class="avatar-rail-shell"><button class="avatar-rail-arrow prev" type="button" aria-label="Ver avatares anteriores" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6"/></svg></button><div class="avatar-options">'+groups[cat].map(function(item){var imageUrl=window.beMediaUrl?window.beMediaUrl(item.imageUrl):item.imageUrl;return '<button class="avatar-option" type="button" data-avatar-url="'+escapePublic(item.imageUrl)+'" data-avatar-id="'+escapePublic(item.id)+'" aria-label="Avatar da categoria '+escapePublic(cat)+'"><img data-picker-src="'+escapePublic(imageUrl)+'" loading="lazy" decoding="async" fetchpriority="low" width="160" height="160" alt="Avatar da categoria '+escapePublic(cat)+'"></button>';}).join('')+'</div><button class="avatar-rail-arrow next" type="button" aria-label="Ver mais avatares"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m9 18 6-6-6-6"/></svg></button></div></section>';
        }).join('')+'</div>';
        avatarGalleryRendered=true;
        setupAvatarRails();
        syncAvatarPickerSelection();
        activatePickerImages(avatarPickerBody,'avatar');
      }catch(error){avatarPickerBody.innerHTML='<div class="avatar-picker-empty">Não foi possível carregar a galeria.</div>';console.warn(error);}
    }


    function profileFallbackAvatar(){return '<img loading="eager" decoding="async" src="'+escapePublic(window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png')+'" data-avatar-fallback="'+escapePublic(window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png')+'" alt="Sem foto de perfil">';}
    function publicProfileYear(profile){
      var source=profile&&profile.createdAt?profile.createdAt:beBackend.now();
      var date=new Date(source);
      return String(date.getFullYear()||new Date().getFullYear());
    }
    function cleanPathname(){try{return decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/'))).replace(/\/+$/,'')||'/';}catch(_){return String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';}}
    function isConfigRoute(){var path=cleanPathname().toLowerCase();var hash=location.hash.toLowerCase();return path==='/config'||hash==='#config'||hash==='#/config';}
    function isProfileRoute(){return /^\/@[^/?#]+$/i.test(cleanPathname())||/^#\/perfil\/@[^/?#]+/i.test(location.hash);}
    function profileRouteUsername(){
      var match=cleanPathname().match(/^\/@([^/?#]+)$/i);
      var raw='';
      if(match){try{raw=decodeURIComponent(match[1]||'');}catch(_){raw=match[1]||'';}}
      if(!raw){var hashMatch=String(location.hash||'').match(/^#\/perfil\/@([^/?#]+)/i);if(hashMatch){try{raw=decodeURIComponent(hashMatch[1]||'');}catch(_){raw=hashMatch[1]||'';}}}
      return beBackend.normalizeUsername(raw);
    }
    function profileRoutePath(profile){
      var handle=beBackend.normalizeUsername((profile&&profile.username)||profileRouteUsername()||(currentProfile&&currentProfile.username)||'perfil');
      return '/@'+encodeURIComponent(handle||'perfil');
    }
    function replacePublicRoute(path){history.replaceState({beRoute:'public'},'',path+(location.search||''));}
    function pushPublicRoute(path){if(cleanPathname()!==path||location.hash)history.pushState({beRoute:'public'},'',path+(location.search||''));}
    function closePublicPages(updateRoute){
      document.body.classList.remove('profile-page-active','settings-page-active');
      profilePage.hidden=true;
      settingsPage.hidden=true;
      if(updateRoute!==false&&(isConfigRoute()||isProfileRoute()))pushPublicRoute('/');
    }
    function readCachedProfileBanner(user){
      if(!user||!user.uid)return {bannerUrl:'',bannerId:''};
      try{
        var parsed=JSON.parse(localStorage.getItem('beProfileBanner:'+user.uid)||'{}');
        return {bannerUrl:String(parsed.bannerUrl||''),bannerId:String(parsed.bannerId||'')};
      }catch(_){return {bannerUrl:'',bannerId:''};}
    }
    function resolvedProfileBanner(user){
      if(!user)return {bannerUrl:'',bannerId:''};
      var cached=readCachedProfileBanner(user);
      var metadata=user&&user.raw&&(user.raw.user_metadata||user.raw.raw_user_meta_data)||{};
      var bannerUrl=String((currentProfile&&currentProfile.bannerUrl)||metadata.profile_banner_url||metadata.banner_url||cached.bannerUrl||'').trim();
      var bannerId=String((currentProfile&&currentProfile.bannerId)||metadata.profile_banner_id||metadata.banner_id||cached.bannerId||'').trim();
      if(currentProfile&&bannerUrl){currentProfile.bannerUrl=bannerUrl;currentProfile.bannerId=bannerId;}
      return {bannerUrl:bannerUrl,bannerId:bannerId};
    }
    function applyProfileBanner(bannerUrl){
      if(isConfigRoute()||document.body.classList.contains('settings-page-active')){
        if(profilePage){profilePage.hidden=true;profilePage.setAttribute('hidden','');profilePage.setAttribute('aria-hidden','true');}
        return;
      }
      var hero=profilePage&&profilePage.querySelector('.profile-page-hero');
      var url=String(bannerUrl||'').trim();
      if(!url){
        if(hero){hero.classList.remove('has-profile-banner');hero.style.backgroundImage='';}
        profilePageBanner.hidden=true;profilePageBanner.style.display='none';
        profilePageBannerImg.removeAttribute('src');
        profilePageBannerFallback.hidden=false;profilePageBannerFallback.style.display='block';
        return;
      }
      if(hero){
        hero.classList.add('has-profile-banner');
        hero.style.backgroundImage='url('+JSON.stringify(window.beMediaUrl?window.beMediaUrl(url):url)+')';
        hero.style.backgroundSize='cover';
        hero.style.backgroundPosition='center center';
      }
      profilePageBannerImg.src=window.beMediaUrl?window.beMediaUrl(url):url;
      profilePageBanner.hidden=false;profilePageBanner.removeAttribute('hidden');profilePageBanner.style.display='block';
      profilePageBannerFallback.hidden=true;profilePageBannerFallback.setAttribute('hidden','');profilePageBannerFallback.style.display='none';
    }
    function isOwnProfileView(){
      if(!auth.currentUser)return false;
      var viewedHandle=beBackend.normalizeUsername((viewedProfile&&viewedProfile.username)||profileRouteUsername());
      var ownHandle=beBackend.normalizeUsername((currentProfile&&currentProfile.username)||'');
      return Boolean(viewedHandle&&ownHandle&&viewedHandle===ownHandle);
    }
    function updateProfileActionVisibility(){
      var guest=!auth.currentUser;
      var browsingAsGuest=guest&&Boolean(window.BETVGuestAccess&&window.BETVGuestAccess.isActive());
      document.body.classList.toggle('profile-viewer-guest',guest);
      if(profilePageNotifications){profilePageNotifications.hidden=guest;profilePageNotifications.setAttribute('aria-hidden',guest?'true':'false');}
      if(profilePageMore){profilePageMore.hidden=guest;profilePageMore.setAttribute('aria-hidden',guest?'true':'false');}
      if(profilePageHome){profilePageHome.title=guest&&!browsingAsGuest?'Entrar':'Home';profilePageHome.setAttribute('aria-label',guest&&!browsingAsGuest?'Ir para o login':'Voltar para a Home');}
    }
    function setProfilePageAvatar(url){
      var avatar=String(url||'').trim()||window.BETV_DEFAULT_AVATAR;
      profilePageAvatar.hidden=false;profilePageAvatar.removeAttribute('hidden');profilePageAvatar.setAttribute('aria-hidden','false');
      profilePageAvatar.innerHTML='<img loading="eager" decoding="async" src="'+escapePublic(window.BETVResolveAvatar?window.BETVResolveAvatar(avatar):avatar)+'" data-avatar-fallback="'+escapePublic(window.BETV_DEFAULT_AVATAR||'"+DEFAULT+"')+'" alt="Avatar do perfil">';
      var info=profilePage&&profilePage.querySelector('.profile-page-info');if(info)info.classList.remove('without-avatar');
    }
    function renderProfileState(title,handle,message){
      setInterfaceText(profilePageName,title);
      setLiteralText(profilePageHandle,'@'+(handle||'perfil'));
      profilePageBadge.textContent='Perfil';
      profilePageMetaLabel.textContent='Perfil público';
      profilePageMemberSince.textContent=message||'';
      renderProfileSocials(null);
      setProfilePageAvatar('');
      applyProfileBanner('');
      profileFavoritesSection.hidden=true;
      if(profileLovedAlbumsSection)profileLovedAlbumsSection.hidden=true;
      profileSavedSection.hidden=true;
    }
    function trustedProfileContent(item){
      var source=[];try{source=typeof window.beGetCatalogContents==='function'?window.beGetCatalogContents():[];}catch(_){source=[];}
      var identity=profileFavoriteIdentity(item);
      var match=source.find(function(candidate){
        if(identity&&profileFavoriteIdentity(candidate)===identity)return true;
        if(item&&item.recordId&&candidate&&candidate.recordId)return String(item.collection||'videos')===String(candidate.collection||'videos')&&String(item.recordId)===String(candidate.recordId);
        return Boolean(item&&item.itemId&&candidate&&String(item.itemId)===String(candidate.itemId));
      });
      return match||item;
    }

    function profileFavoriteIdentity(item){
      return String((item&&item.favoriteId)||((item&&item.collection&&item.recordId)?item.collection+':'+item.recordId:'')||(item&&item.itemId)||(item&&item.title)||'').trim();
    }
    function normalizeProfileFavorite(item){
      return {
        itemId:String(item&&item.itemId||''),
        recordId:String(item&&item.recordId||''),
        favoriteId:String(item&&item.favoriteId||''),
        title:String(item&&item.title||'Conteúdo'),
        description:String(item&&item.description||''),
        year:String(item&&item.year||''),
        duration:String(item&&item.duration||''),
        contentUrl:String(item&&item.contentUrl||'#'),
        imageUrl:String(item&&(item.imageUrl||item.thumbnailUrl||item.bannerUrl)||''),
        bannerUrl:String(item&&(item.bannerUrl||item.imageUrl||item.thumbnailUrl)||''),
        logoUrl:String(item&&item.logoUrl||''),
        collection:String(item&&item.collection||'videos').toLowerCase()
      };
    }
    function profileFavoritesStorageKey(){
      return 'beProfileTopFavorites:'+(auth.currentUser&&auth.currentUser.uid?auth.currentUser.uid:'guest');
    }
    function readProfileFavorites(){
      try{
        var parsed=JSON.parse(localStorage.getItem(profileFavoritesStorageKey())||'[]');
        if(!Array.isArray(parsed))return [];
        var result=[];
        parsed.map(normalizeProfileFavorite).forEach(function(item){
          var identity=profileFavoriteIdentity(item);
          if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.push(item);
        });
        return result.slice(0,4);
      }catch(_){return [];}
    }
    function writeProfileFavorites(items){
      var normalized=(Array.isArray(items)?items:[]).map(normalizeProfileFavorite).slice(0,4);
      localStorage.setItem(profileFavoritesStorageKey(),JSON.stringify(normalized));
      try{localStorage.setItem('beSyncedUserData:'+(auth.currentUser&&auth.currentUser.uid?auth.currentUser.uid:'guest'),JSON.stringify({data:captureCrossDeviceData(auth.currentUser&&auth.currentUser.uid)}));}catch(_){ }
      if(typeof window.beScheduleUserDataSync==='function')window.beScheduleUserDataSync('profile-favorites');
      profileFavoritesItems=normalized;
      window.dispatchEvent(new CustomEvent('be:profile-favorites-changed',{detail:{items:normalized}}));
    }
    function profileFavoriteCollectionLabel(item){
      var type=String(item&&item.collection||'videos').toLowerCase();
      if(type==='movies')return 'FILME';
      if(type==='series')return 'SÉRIE';
      return 'VÍDEO';
    }
    function profileFavoriteImage(item){
      return String(item&&(item.imageUrl||item.bannerUrl)||'').trim();
    }
    function profileCatalogContents(){
      var source=[];
      try{source=typeof window.beGetCatalogContents==='function'?window.beGetCatalogContents():[];}catch(error){console.warn('Não foi possível carregar o catálogo para favoritos:',error);}
      var result=[];
      source.map(normalizeProfileFavorite).forEach(function(item){
        var identity=profileFavoriteIdentity(item);
        if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.push(item);
      });
      profileFavoritesItems.forEach(function(item){
        var identity=profileFavoriteIdentity(item);
        if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.unshift(item);
      });
      return result;
    }
    function renderProfileFavorites(){
      if(!profileFavoritesSection||!profileFavoritesContent)return;
      var ownProfile=isOwnProfileView();
      var publicReady=viewedProfileStatus==='ready'&&viewedProfile;
      profileFavoritesSection.hidden=!publicReady;
      if(!publicReady){profileFavoritesItems=[];profileFavoritesContent.innerHTML='';if(profileFavoritesEdit)profileFavoritesEdit.hidden=true;return;}
      profileFavoritesItems=ownProfile?readProfileFavorites():(Array.isArray(viewedProfile.favorites)?viewedProfile.favorites.map(normalizeProfileFavorite).slice(0,4):[]);
      if(profileFavoritesEdit)profileFavoritesEdit.hidden=!ownProfile||profileFavoritesItems.length!==4;
      if(ownProfile&&profileFavoritesItems.length!==4){
        profileFavoritesContent.innerHTML='<button class="profile-favorites-empty" id="profileFavoritesAdd" type="button"><span class="profile-favorites-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><strong>Adicionar favoritos</strong><span>Escolha quatro conteúdos que representam o seu gosto.</span></button>';
        var addButton=document.getElementById('profileFavoritesAdd');if(addButton)addButton.addEventListener('click',openProfileFavoritesPicker);return;
      }
      if(!profileFavoritesItems.length){
        profileFavoritesContent.innerHTML='<div class="profile-favorites-empty profile-public-empty"><strong>Nenhum favorito público</strong><span>Esta pessoa ainda não escolheu os favoritos do perfil.</span></div>';
        return;
      }
      profileFavoritesContent.innerHTML='<div class="profile-favorites-ranking">'+profileFavoritesItems.map(function(item,index){
        var image=profileFavoriteImage(item);
        var rank=String(index+1);
        var gradientId='profileFavoriteRankGradient'+rank;
        var clipId='profileFavoriteRankClip'+rank;
        var rankSvg='<svg class="profile-favorite-rank-svg" viewBox="0 0 126 240" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">'
          +'<defs><linearGradient id="'+gradientId+'" y1="0%" y2="0%" x1="0%" x2="100%"><stop offset="0%" stop-color="rgba(255,255,255,1)"></stop><stop offset="50%" stop-color="rgba(255,255,255,1)"></stop><stop offset="100%" stop-color="rgba(255,255,255,0)"></stop></linearGradient><clipPath id="'+clipId+'"><text x="63" y="177" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="151" font-weight="900">'+rank+'</text></clipPath></defs>'
          +'<rect x="0" y="0" width="100%" height="100%" fill="url(#'+gradientId+')" clip-path="url(#'+clipId+')"></rect></svg>';
        return '<button class="profile-favorite-ranked-item" type="button" data-profile-favorite-index="'+index+'" aria-label="Abrir '+escapePublic(item.title||'favorito')+'">'
          +'<span class="profile-favorite-rank" aria-hidden="true">'+rankSvg+'</span>'
          +'<span class="profile-favorite-poster">'+(image?'<img loading="lazy" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(image):image)+'" alt="">':'<span class="profile-favorite-placeholder"></span>')
          +'<span class="profile-favorite-type">'+profileFavoriteCollectionLabel(item)+'</span>'
          +'<span class="profile-favorite-title">'+escapePublic(item.title||'Conteúdo')+'</span></span>'
          +'</button>';
      }).join('')+'</div>';
    }

    function profileLovedAlbumsStorageKey(){
      return 'beProfileLovedAlbums:'+(auth.currentUser&&auth.currentUser.uid?auth.currentUser.uid:'guest');
    }
    function readProfileLovedAlbums(){
      try{
        var parsed=JSON.parse(localStorage.getItem(profileLovedAlbumsStorageKey())||'[]');
        if(!Array.isArray(parsed))return [];
        var result=[];
        parsed.map(normalizeProfileFavorite).forEach(function(item){
          item.collection='albums';
          var identity=profileFavoriteIdentity(item);
          if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.push(item);
        });
        return result.slice(0,3);
      }catch(_){return [];}
    }
    function writeProfileLovedAlbums(items){
      var normalized=(Array.isArray(items)?items:[]).map(normalizeProfileFavorite).map(function(item){item.collection='albums';return item;}).slice(0,3);
      localStorage.setItem(profileLovedAlbumsStorageKey(),JSON.stringify(normalized));
      try{localStorage.setItem('beSyncedUserData:'+(auth.currentUser&&auth.currentUser.uid?auth.currentUser.uid:'guest'),JSON.stringify({data:captureCrossDeviceData(auth.currentUser&&auth.currentUser.uid)}));}catch(_){ }
      if(typeof window.beScheduleUserDataSync==='function')window.beScheduleUserDataSync('profile-albums');
      profileLovedAlbumsItems=normalized;
      window.dispatchEvent(new CustomEvent('be:profile-loved-albums-changed',{detail:{items:normalized}}));
    }
    function albumProfileRecord(album){
      var id=String(album&&album.id||album&&album.recordId||'').trim();
      var rawImage=String(album&&(album.imageUrl||album.thumbnailUrl||album.bannerUrl)||'');
      var storedImage=window.beMediaUrl?window.beMediaUrl(rawImage):rawImage;if(storedImage==='#')storedImage='';
      return normalizeProfileFavorite({
        itemId:id?'album:'+id:String(album&&album.itemId||''),
        recordId:id,
        favoriteId:id?'albums:'+id:String(album&&album.favoriteId||''),
        title:String(album&&album.title||'Álbum'),
        year:String(album&&album.year||''),
        imageUrl:storedImage,
        bannerUrl:storedImage,
        collection:'albums'
      });
    }
    async function loadProfileLovedAlbumsCatalog(){
      try{
        if(!window.beBackend)return profileLovedAlbumsItems.slice();
        await window.beBackend.ready;
        var values=await window.beBackend.data.list('news',{orderBy:'order',direction:'asc'});
        var result=[];
        (Array.isArray(values)?values:[]).filter(function(album){return album&&album.active!==false&&String(album.title||'').trim();}).forEach(function(album){
          var item=albumProfileRecord(album),identity=profileFavoriteIdentity(item);
          if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.push(item);
        });
        profileLovedAlbumsItems.forEach(function(item){
          var identity=profileFavoriteIdentity(item);
          if(identity&&!result.some(function(current){return profileFavoriteIdentity(current)===identity;}))result.unshift(item);
        });
        return result;
      }catch(error){console.warn('Não foi possível carregar os álbuns para o perfil:',error);return profileLovedAlbumsItems.slice();}
    }
    function renderProfileLovedAlbums(){
      if(!profileLovedAlbumsSection||!profileLovedAlbumsContent)return;
      var ownProfile=isOwnProfileView();
      var publicReady=viewedProfileStatus==='ready'&&viewedProfile;
      profileLovedAlbumsSection.hidden=!publicReady;
      if(!publicReady){profileLovedAlbumsItems=[];profileLovedAlbumsContent.innerHTML='';if(profileLovedAlbumsEdit)profileLovedAlbumsEdit.hidden=true;return;}
      profileLovedAlbumsItems=ownProfile?readProfileLovedAlbums():(Array.isArray(viewedProfile.lovedAlbums)?viewedProfile.lovedAlbums.map(normalizeProfileFavorite).slice(0,3):[]);
      profileLovedAlbumsItems.forEach(function(item){item.collection='albums';});
      if(profileLovedAlbumsEdit)profileLovedAlbumsEdit.hidden=!ownProfile||profileLovedAlbumsItems.length!==3;
      if(ownProfile&&profileLovedAlbumsItems.length!==3){
        profileLovedAlbumsContent.innerHTML='<button class="profile-favorites-empty" id="profileLovedAlbumsAdd" type="button"><span class="profile-favorites-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><strong>Adicionar álbuns</strong><span>Escolha três álbuns que você ama.</span></button>';
        var addButton=document.getElementById('profileLovedAlbumsAdd');if(addButton)addButton.addEventListener('click',openProfileLovedAlbumsPicker);return;
      }
      if(!profileLovedAlbumsItems.length){
        profileLovedAlbumsContent.innerHTML='<div class="profile-favorites-empty profile-public-empty"><strong>Nenhum álbum escolhido</strong><span>Esta pessoa ainda não escolheu os álbuns que ama.</span></div>';
        return;
      }
      profileLovedAlbumsContent.innerHTML='<div class="profile-favorites-ranking">'+profileLovedAlbumsItems.map(function(item,index){
        var image=profileFavoriteImage(item);
        var rank=String(index+1);
        var gradientId='profileLovedAlbumRankGradient'+rank;
        var clipId='profileLovedAlbumRankClip'+rank;
        var rankSvg='<svg class="profile-favorite-rank-svg" viewBox="0 0 126 240" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">'
          +'<defs><linearGradient id="'+gradientId+'" y1="0%" y2="0%" x1="0%" x2="100%"><stop offset="0%" stop-color="rgba(255,255,255,1)"></stop><stop offset="50%" stop-color="rgba(255,255,255,1)"></stop><stop offset="100%" stop-color="rgba(255,255,255,0)"></stop></linearGradient><clipPath id="'+clipId+'"><text x="63" y="177" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="151" font-weight="900">'+rank+'</text></clipPath></defs>'
          +'<rect x="0" y="0" width="100%" height="100%" fill="url(#'+gradientId+')" clip-path="url(#'+clipId+')"></rect></svg>';
        return '<button class="profile-favorite-ranked-item" type="button" data-profile-loved-album-index="'+index+'" aria-label="Abrir '+escapePublic(item.title||'álbum')+'">'
          +'<span class="profile-favorite-rank" aria-hidden="true">'+rankSvg+'</span>'
          +'<span class="profile-favorite-poster">'+(image?'<img loading="lazy" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(image):image)+'" alt="">':'<span class="profile-favorite-placeholder"></span>')
          +'<span class="profile-favorite-type">ÁLBUM</span>'
          +'<span class="profile-favorite-title notranslate" translate="no">'+escapePublic(item.title||'Álbum')+'</span></span>'
          +'</button>';
      }).join('')+'</div>';
    }
    function renderProfileLovedAlbumsPicker(){
      if(!profileLovedAlbumsPickerBody)return;
      var query=String(profileLovedAlbumsSearch&&profileLovedAlbumsSearch.value||'').trim().toLocaleLowerCase('pt-BR');
      var filtered=profileLovedAlbumsCatalog.filter(function(item){return !query||[item.title,item.year,'álbum'].join(' ').toLocaleLowerCase('pt-BR').indexOf(query)>=0;});
      if(!filtered.length){
        profileLovedAlbumsPickerBody.innerHTML='<div class="profile-favorites-picker-empty"><strong>Nenhum álbum encontrado</strong><span>Pesquise usando outro nome ou uma parte do título.</span></div>';
      }else{
        var selectedItems=profileLovedAlbumsDraft.map(function(selected){return filtered.find(function(item){return profileFavoriteIdentity(item)===profileFavoriteIdentity(selected);});}).filter(Boolean);
        var selectedIdentities=new Set(selectedItems.map(profileFavoriteIdentity));
        var visibleItems=selectedItems.concat(filtered.filter(function(item){return !selectedIdentities.has(profileFavoriteIdentity(item));})).slice(0,12);
        profileLovedAlbumsPickerBody.innerHTML='<div class="profile-favorites-picker-grid">'+visibleItems.map(function(item){
          var catalogIndex=profileLovedAlbumsCatalog.findIndex(function(current){return profileFavoriteIdentity(current)===profileFavoriteIdentity(item);});
          var selectedIndex=profileLovedAlbumsDraft.findIndex(function(current){return profileFavoriteIdentity(current)===profileFavoriteIdentity(item);});
          var selected=selectedIndex>=0,image=profileFavoriteImage(item);
          return '<button class="profile-favorites-option'+(selected?' selected':'')+'" type="button" data-profile-loved-album-option="'+catalogIndex+'" data-no-content-open="true" aria-pressed="'+String(selected)+'">'
            +'<span class="profile-favorites-option-media">'+(image?'<img loading="lazy" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(image):image)+'" alt="">':'<span class="profile-favorite-placeholder"></span>')
            +'<span class="profile-favorites-option-order">'+(selected?selectedIndex+1:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>')+'</span></span>'
            +'<span class="profile-favorites-option-copy"><strong class="notranslate" translate="no">'+escapePublic(item.title||'Álbum')+'</strong><small>ÁLBUM'+(item.year?' • '+escapePublic(item.year):'')+'</small></span>'
            +'</button>';
        }).join('')+'</div><p class="profile-favorites-search-hint"><strong>Não achou o álbum?</strong><span>Pesquise pelo nome na barra acima.</span></p>';
      }
      if(profileLovedAlbumsSelectionCount)profileLovedAlbumsSelectionCount.textContent=profileLovedAlbumsDraft.length+' de 3';
      var ready=profileLovedAlbumsDraft.length===3;
      if(profileLovedAlbumsSave)profileLovedAlbumsSave.disabled=!ready;
      if(profileLovedAlbumsHeaderSave)profileLovedAlbumsHeaderSave.disabled=!ready;
    }
    async function openProfileLovedAlbumsPicker(event){
      if(!profileLovedAlbumsPicker)return;
      if(event&&event.currentTarget)profileLovedAlbumsLastFocus=event.currentTarget;else profileLovedAlbumsLastFocus=document.activeElement;
      profileLovedAlbumsItems=readProfileLovedAlbums();
      profileLovedAlbumsDraft=profileLovedAlbumsItems.slice(0,3);
      if(profileLovedAlbumsSearch)profileLovedAlbumsSearch.value='';
      profileLovedAlbumsReturnPath=location.pathname+(location.search||'');
      profileLovedAlbumsPicker.hidden=false;
      document.body.classList.add('profile-favorites-picker-active');
      syncBodyScroll();
      if(profileLovedAlbumsPickerBody)profileLovedAlbumsPickerBody.innerHTML='<div class="profile-favorites-picker-empty"><strong>Carregando álbuns…</strong></div>';
      profileLovedAlbumsCatalog=await loadProfileLovedAlbumsCatalog();
      renderProfileLovedAlbumsPicker();
      requestAnimationFrame(function(){if(profileLovedAlbumsSearch)profileLovedAlbumsSearch.focus({preventScroll:true});});
    }
    function closeProfileLovedAlbumsPicker(){
      if(!profileLovedAlbumsPicker||profileLovedAlbumsPicker.hidden)return;
      profileLovedAlbumsPicker.hidden=true;
      document.body.classList.remove('profile-favorites-picker-active');
      profileLovedAlbumsDraft=[];
      syncBodyScroll();
      if(profileLovedAlbumsLastFocus&&typeof profileLovedAlbumsLastFocus.focus==='function')profileLovedAlbumsLastFocus.focus({preventScroll:true});
      profileLovedAlbumsLastFocus=null;profileLovedAlbumsReturnPath='';
    }
    function restoreProfileLovedAlbumsContext(){
      document.body.classList.add('profile-page-active');document.body.classList.remove('detail-page-active');
      if(profilePage){profilePage.hidden=false;profilePage.removeAttribute('hidden');}
      if(profileLovedAlbumsPicker){profileLovedAlbumsPicker.hidden=false;profileLovedAlbumsPicker.removeAttribute('hidden');}
      var expected=profileLovedAlbumsReturnPath||location.pathname+(location.search||'');
      if(expected&&location.pathname+(location.search||'')!==expected){try{history.replaceState({beRoute:'profile'},'',expected);}catch(_){}}
    }
    function toggleProfileLovedAlbumOption(index){
      var item=profileLovedAlbumsCatalog[index];if(!item)return;
      var identity=profileFavoriteIdentity(item);
      var selectedIndex=profileLovedAlbumsDraft.findIndex(function(current){return profileFavoriteIdentity(current)===identity;});
      if(selectedIndex>=0)profileLovedAlbumsDraft.splice(selectedIndex,1);
      else if(profileLovedAlbumsDraft.length<3)profileLovedAlbumsDraft.push(item);
      else{
        if(profileLovedAlbumsSelectionCount){profileLovedAlbumsSelectionCount.textContent='Limite de 3 álbuns';profileLovedAlbumsSelectionCount.classList.add('limit');setTimeout(function(){profileLovedAlbumsSelectionCount.classList.remove('limit');profileLovedAlbumsSelectionCount.textContent=profileLovedAlbumsDraft.length+' de 3';},900);}
        if(navigator.vibrate)navigator.vibrate(20);return;
      }
      renderProfileLovedAlbumsPicker();restoreProfileLovedAlbumsContext();requestAnimationFrame(restoreProfileLovedAlbumsContext);setTimeout(restoreProfileLovedAlbumsContext,80);
    }
    function saveProfileLovedAlbums(){
      if(profileLovedAlbumsDraft.length!==3)return;
      writeProfileLovedAlbums(profileLovedAlbumsDraft);closeProfileLovedAlbumsPicker();renderProfileLovedAlbums();
    }
    function bindProfileLovedAlbums(){
      if(profileLovedAlbumsContent&&profileLovedAlbumsContent.dataset.bound!=='true'){
        profileLovedAlbumsContent.dataset.bound='true';
        profileLovedAlbumsContent.addEventListener('click',function(event){
          var button=event.target.closest('[data-profile-loved-album-index]');if(!button)return;
          var item=profileLovedAlbumsItems[Number(button.dataset.profileLovedAlbumIndex)];if(!item)return;
          var id=String(item.recordId||item.itemId||'').replace(/^album:/,'');if(!id)return;
          closePublicPages(false);
          var path='/albuns/'+encodeURIComponent(id);
          if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go(path);else location.assign(window.BETVLocaleURL?window.BETVLocaleURL(path):path);
        });
      }
      if(profileLovedAlbumsEdit&&profileLovedAlbumsEdit.dataset.bound!=='true'){profileLovedAlbumsEdit.dataset.bound='true';profileLovedAlbumsEdit.addEventListener('click',openProfileLovedAlbumsPicker);}
      if(profileLovedAlbumsPicker&&profileLovedAlbumsPicker.dataset.bound!=='true'){
        profileLovedAlbumsPicker.dataset.bound='true';
        if(profileLovedAlbumsPickerClose)profileLovedAlbumsPickerClose.addEventListener('click',closeProfileLovedAlbumsPicker);
        if(profileLovedAlbumsCancel)profileLovedAlbumsCancel.addEventListener('click',closeProfileLovedAlbumsPicker);
        if(profileLovedAlbumsSave)profileLovedAlbumsSave.addEventListener('click',saveProfileLovedAlbums);
        if(profileLovedAlbumsHeaderSave)profileLovedAlbumsHeaderSave.addEventListener('click',saveProfileLovedAlbums);
        if(profileLovedAlbumsSearch)profileLovedAlbumsSearch.addEventListener('input',renderProfileLovedAlbumsPicker);
        if(profileLovedAlbumsPickerBody){
          var lovedAlbumTouchHandledUntil=0;
          function stopLovedAlbumEvent(event){var button=event.target&&event.target.closest?event.target.closest('[data-profile-loved-album-option]'):null;if(!button)return null;event.preventDefault();event.stopPropagation();if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();return button;}
          profileLovedAlbumsPickerBody.addEventListener('pointerdown',function(event){stopLovedAlbumEvent(event);});
          profileLovedAlbumsPickerBody.addEventListener('pointerup',function(event){var button=stopLovedAlbumEvent(event);if(!button||event.pointerType==='mouse')return;lovedAlbumTouchHandledUntil=Date.now()+700;toggleProfileLovedAlbumOption(Number(button.dataset.profileLovedAlbumOption));});
          profileLovedAlbumsPickerBody.addEventListener('click',function(event){var button=stopLovedAlbumEvent(event);if(!button||Date.now()<lovedAlbumTouchHandledUntil)return;toggleProfileLovedAlbumOption(Number(button.dataset.profileLovedAlbumOption));});
        }
        profileLovedAlbumsPicker.addEventListener('click',function(event){if(event.target===profileLovedAlbumsPicker)closeProfileLovedAlbumsPicker();},true);
        document.addEventListener('keydown',function(event){if(event.key==='Escape'&&profileLovedAlbumsPicker&&!profileLovedAlbumsPicker.hidden){event.preventDefault();closeProfileLovedAlbumsPicker();}});
      }
    }

    function profileFavoriteIsSelected(item){
      var identity=profileFavoriteIdentity(item);
      return profileFavoritesDraft.some(function(current){return profileFavoriteIdentity(current)===identity;});
    }
    function renderProfileFavoritesPicker(){
      if(!profileFavoritesPickerBody)return;
      var query=String(profileFavoritesSearch&&profileFavoritesSearch.value||'').trim().toLocaleLowerCase('pt-BR');
      var filtered=profileFavoritesCatalog.filter(function(item){
        if(!query)return true;
        return [item.title,item.year,item.duration,profileFavoriteCollectionLabel(item)].join(' ').toLocaleLowerCase('pt-BR').indexOf(query)>=0;
      });
      if(!filtered.length){
        profileFavoritesPickerBody.innerHTML='<div class="profile-favorites-picker-empty"><strong>Nenhum conteúdo encontrado</strong><span>Pesquise usando outro nome ou uma parte do título.</span></div>';
      }else{
        var selectedItems=profileFavoritesDraft.map(function(selected){
          return filtered.find(function(item){return profileFavoriteIdentity(item)===profileFavoriteIdentity(selected);});
        }).filter(Boolean);
        var selectedIdentities=new Set(selectedItems.map(profileFavoriteIdentity));
        var visibleItems=selectedItems.concat(filtered.filter(function(item){return !selectedIdentities.has(profileFavoriteIdentity(item));})).slice(0,11);
        profileFavoritesPickerBody.innerHTML='<div class="profile-favorites-picker-grid">'+visibleItems.map(function(item){
          var catalogIndex=profileFavoritesCatalog.findIndex(function(current){return profileFavoriteIdentity(current)===profileFavoriteIdentity(item);});
          var selectedIndex=profileFavoritesDraft.findIndex(function(current){return profileFavoriteIdentity(current)===profileFavoriteIdentity(item);});
          var selected=selectedIndex>=0;
          var image=profileFavoriteImage(item);
          return '<button class="profile-favorites-option'+(selected?' selected':'')+'" type="button" data-profile-favorite-option="'+catalogIndex+'" data-no-content-open="true" aria-pressed="'+String(selected)+'">'
            +'<span class="profile-favorites-option-media">'+(image?'<img loading="lazy" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(image):image)+'" alt="">':'<span class="profile-favorite-placeholder"></span>')
            +'<span class="profile-favorites-option-order">'+(selected?selectedIndex+1:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>')+'</span></span>'
            +'<span class="profile-favorites-option-copy"><strong>'+escapePublic(item.title||'Conteúdo')+'</strong><small>'+profileFavoriteCollectionLabel(item)+(item.year?' • '+escapePublic(item.year):'')+'</small></span>'
            +'</button>';
        }).join('')+'</div><p class="profile-favorites-search-hint"><strong>Não achou o vídeo que queria?</strong><span>Pesquise pelo nome na barra acima.</span></p>';
      }
      if(profileFavoritesSelectionCount)profileFavoritesSelectionCount.textContent=profileFavoritesDraft.length+' de 4';
      var favoritesReadyToSave=profileFavoritesDraft.length===4;
      if(profileFavoritesSave)profileFavoritesSave.disabled=!favoritesReadyToSave;
      if(profileFavoritesHeaderSave)profileFavoritesHeaderSave.disabled=!favoritesReadyToSave;
    }
    function openProfileFavoritesPicker(event){
      if(event&&event.currentTarget)profileFavoritesLastFocus=event.currentTarget;
      else profileFavoritesLastFocus=document.activeElement;
      profileFavoritesItems=readProfileFavorites();
      profileFavoritesDraft=profileFavoritesItems.slice(0,4);
      profileFavoritesCatalog=profileCatalogContents();
      if(profileFavoritesSearch)profileFavoritesSearch.value='';
      profileFavoritesReturnPath=location.pathname+(location.search||'');
      renderProfileFavoritesPicker();
      profileFavoritesPicker.hidden=false;
      document.body.classList.add('profile-favorites-picker-active');
      requestAnimationFrame(function(){if(profileFavoritesSearch)profileFavoritesSearch.focus({preventScroll:true});});
    }
    function closeProfileFavoritesPicker(){
      if(!profileFavoritesPicker||profileFavoritesPicker.hidden)return;
      profileFavoritesPicker.hidden=true;
      document.body.classList.remove('profile-favorites-picker-active');
      profileFavoritesDraft=[];
      if(profileFavoritesLastFocus&&typeof profileFavoritesLastFocus.focus==='function')profileFavoritesLastFocus.focus({preventScroll:true});
      profileFavoritesLastFocus=null;
      profileFavoritesReturnPath='';
    }
    function restoreProfileFavoritesContext(){
      document.body.classList.add('profile-page-active');
      document.body.classList.remove('detail-page-active');
      if(profilePage){
        profilePage.hidden=false;
        profilePage.removeAttribute('hidden');
      }
      if(profileFavoritesPicker){
        profileFavoritesPicker.hidden=false;
        profileFavoritesPicker.removeAttribute('hidden');
      }
      var expected=profileFavoritesReturnPath||location.pathname+(location.search||'');
      if(expected&&location.pathname+(location.search||'')!==expected){
        try{history.replaceState({beRoute:'profile'},'',expected);}catch(_){}
      }
    }
    function toggleProfileFavoriteOption(index){
      var item=profileFavoritesCatalog[index];
      if(!item)return;
      var identity=profileFavoriteIdentity(item);
      var selectedIndex=profileFavoritesDraft.findIndex(function(current){return profileFavoriteIdentity(current)===identity;});
      if(selectedIndex>=0)profileFavoritesDraft.splice(selectedIndex,1);
      else if(profileFavoritesDraft.length<4)profileFavoritesDraft.push(item);
      else{
        if(profileFavoritesSelectionCount){profileFavoritesSelectionCount.textContent='Limite de 4 favoritos';profileFavoritesSelectionCount.classList.add('limit');setTimeout(function(){profileFavoritesSelectionCount.classList.remove('limit');profileFavoritesSelectionCount.textContent=profileFavoritesDraft.length+' de 4';},900);}
        if(navigator.vibrate)navigator.vibrate(20);
        return;
      }
      renderProfileFavoritesPicker();
      restoreProfileFavoritesContext();
      requestAnimationFrame(restoreProfileFavoritesContext);
      setTimeout(restoreProfileFavoritesContext,80);
    }
    function saveProfileFavorites(){
      if(profileFavoritesDraft.length!==4)return;
      writeProfileFavorites(profileFavoritesDraft);
      closeProfileFavoritesPicker();
      renderProfileFavorites();
    }
    function bindProfileFavorites(){
      if(profileFavoritesContent&&profileFavoritesContent.dataset.bound!=='true'){
        profileFavoritesContent.dataset.bound='true';
        profileFavoritesContent.addEventListener('click',function(event){
          var button=event.target.closest('[data-profile-favorite-index]');
          if(!button)return;
          var item=profileFavoritesItems[Number(button.dataset.profileFavoriteIndex)];
          if(!item)return;
          closePublicPages(false);
          if(typeof window.beOpenSavedContent==='function')window.beOpenSavedContent(trustedProfileContent(item));
        });
      }
      if(profileFavoritesEdit&&profileFavoritesEdit.dataset.bound!=='true'){
        profileFavoritesEdit.dataset.bound='true';
        profileFavoritesEdit.addEventListener('click',openProfileFavoritesPicker);
      }
      if(profileFavoritesPicker&&profileFavoritesPicker.dataset.bound!=='true'){
        profileFavoritesPicker.dataset.bound='true';
        if(profileFavoritesPickerClose)profileFavoritesPickerClose.addEventListener('click',closeProfileFavoritesPicker);
        if(profileFavoritesCancel)profileFavoritesCancel.addEventListener('click',closeProfileFavoritesPicker);
        if(profileFavoritesSave)profileFavoritesSave.addEventListener('click',saveProfileFavorites);
        if(profileFavoritesHeaderSave)profileFavoritesHeaderSave.addEventListener('click',saveProfileFavorites);
        if(profileFavoritesSearch)profileFavoritesSearch.addEventListener('input',renderProfileFavoritesPicker);
        if(profileFavoritesPickerBody){
          var profileFavoriteTouchHandledUntil=0;
          function keepFavoritePickerInProfile(){
            document.body.classList.add('profile-page-active');
            if(profileFavoritesPicker)profileFavoritesPicker.hidden=false;
          }
          function stopFavoriteOptionEvent(event){
            var button=event.target&&event.target.closest?event.target.closest('[data-profile-favorite-option]'):null;
            if(!button)return null;
            event.preventDefault();
            event.stopPropagation();
            if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
            return button;
          }
          profileFavoritesPickerBody.addEventListener('pointerdown',function(event){
            stopFavoriteOptionEvent(event);
          });
          profileFavoritesPickerBody.addEventListener('pointerup',function(event){
            var button=stopFavoriteOptionEvent(event);
            if(!button||event.pointerType==='mouse')return;
            profileFavoriteTouchHandledUntil=Date.now()+700;
            toggleProfileFavoriteOption(Number(button.dataset.profileFavoriteOption));
            keepFavoritePickerInProfile();
          });
          profileFavoritesPickerBody.addEventListener('click',function(event){
            var button=stopFavoriteOptionEvent(event);
            if(!button)return;
            if(Date.now()<profileFavoriteTouchHandledUntil)return;
            toggleProfileFavoriteOption(Number(button.dataset.profileFavoriteOption));
            keepFavoritePickerInProfile();
          });
        }
        profileFavoritesPicker.addEventListener('click',function(event){
          var option=event.target&&event.target.closest?event.target.closest('[data-profile-favorite-option]'):null;
          if(option){
            event.preventDefault();
            event.stopPropagation();
            if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
            if(Date.now()>=profileFavoriteTouchHandledUntil){
              toggleProfileFavoriteOption(Number(option.dataset.profileFavoriteOption));
            }
            restoreProfileFavoritesContext();
            return;
          }
          if(event.target===profileFavoritesPicker)closeProfileFavoritesPicker();
        },true);
        document.addEventListener('keydown',function(event){if(event.key==='Escape'&&profileFavoritesPicker&&!profileFavoritesPicker.hidden){event.preventDefault();closeProfileFavoritesPicker();}});
      }
    }

    function renderProfileSaved(){
      if(!profileSavedSection||!profileSavedGrid)return;
      var ownProfile=isOwnProfileView();
      var publicReady=viewedProfileStatus==='ready'&&viewedProfile;
      profileSavedSection.hidden=!publicReady;
      if(!publicReady){profileSavedItems=[];profileSavedGrid.innerHTML='';if(profileSavedCount)profileSavedCount.textContent='';return;}
      if(ownProfile){
        try{profileSavedItems=typeof window.beGetSavedContents==='function'?window.beGetSavedContents():[];}catch(error){console.warn('Não foi possível carregar os conteúdos salvos:',error);profileSavedItems=[];}
      }else profileSavedItems=Array.isArray(viewedProfile.savedContents)?viewedProfile.savedContents.map(normalizeProfileFavorite).slice(0,20):[];
      if(profileSavedCount)profileSavedCount.textContent=profileSavedItems.length?(profileSavedItems.length+' '+(profileSavedItems.length===1?'salvo':'salvos')):'';
      if(!profileSavedItems.length){
        profileSavedGrid.innerHTML='<div class="profile-saved-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg><strong>Nenhum conteúdo salvo ainda</strong><span>'+(ownProfile?'Os conteúdos e álbuns em que você tocar no coração aparecerão aqui.':'Esta pessoa ainda não possui conteúdos salvos no perfil.')+'</span></div>';
        return;
      }
      profileSavedGrid.innerHTML=profileSavedItems.map(function(item,index){
        var image=item.imageUrl||item.bannerUrl||'';
        var isAlbum=String(item.collection||'').toLowerCase()==='albums';
        var meta=[isAlbum?'Álbum':'',item.year,item.duration].filter(Boolean).join(' • ');
        return '<button class="profile-saved-card'+(isAlbum?' is-album':'')+'" type="button" data-saved-index="'+index+'" aria-label="Abrir '+escapePublic(item.title||'conteúdo salvo')+'">'
          +'<span class="profile-saved-thumb">'+(image?'<img loading="lazy" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(image):image)+'" alt="">':'<span class="profile-saved-placeholder" aria-hidden="true"></span>')+'<span class="profile-saved-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7Z"></path></svg></span></span>'
          +'<span class="profile-saved-copy"><strong>'+escapePublic(item.title||'Conteúdo salvo')+'</strong>'+(meta?'<small>'+escapePublic(meta)+'</small>':'')+'</span>'
          +'</button>';
      }).join('');
    }

    function bindProfileSavedGrid(){
      if(!profileSavedGrid||profileSavedGrid.dataset.savedBound==='true')return;
      profileSavedGrid.dataset.savedBound='true';
      profileSavedGrid.addEventListener('click',function(event){
        var button=event.target.closest('[data-saved-index]');
        if(!button||!profileSavedGrid.contains(button))return;
        var item=profileSavedItems[Number(button.dataset.savedIndex)];
        if(!item)return;
        closePublicPages(false);
        if(typeof window.beOpenSavedContent==='function')window.beOpenSavedContent(trustedProfileContent(item));
      });
    }

    function renderProfilePage(){
      if(isConfigRoute()||document.body.classList.contains('settings-page-active')){
        if(profilePage){profilePage.hidden=true;profilePage.setAttribute('hidden','');profilePage.setAttribute('aria-hidden','true');}
        return;
      }
      updateProfileActionVisibility();
      var handle=profileRouteUsername()||beBackend.normalizeUsername((viewedProfile&&viewedProfile.username)||(currentProfile&&currentProfile.username)||'perfil');
      if(viewedProfileStatus==='loading'){renderProfileState('Carregando perfil',handle,'');return;}
      if(viewedProfileStatus==='missing'){renderProfileState('Perfil não encontrado',handle,'Confira o link e tente novamente.');return;}
      if(viewedProfileStatus==='error'){renderProfileState('Não foi possível carregar',handle,'Tente atualizar a página.');return;}
      var profile=viewedProfile;
      if(!profile){renderProfileState('Perfil não encontrado',handle,'');return;}
      var ownProfile=isOwnProfileView();
      var displayName=profile.displayName||(ownProfile&&auth.currentUser&&auth.currentUser.displayName)||'Usuário';
      var avatar=ownProfile?selectedProfileAvatar(profile):String(profile.avatarUrl||'');
      var banner=ownProfile&&auth.currentUser?resolvedProfileBanner(auth.currentUser).bannerUrl:String(profile.bannerUrl||'');
      setLiteralText(profilePageName,displayName);
      setLiteralText(profilePageHandle,'@'+(profile.username||handle||'perfil'));
      profilePageBadge.textContent='Perfil';
      profilePageMetaLabel.textContent='Perfil público';
      profilePageMemberSince.textContent='Membro desde '+publicProfileYear(profile);
      renderProfileSocials(profile);
      setProfilePageAvatar(avatar);
      applyProfileBanner(banner);
      renderProfileFavorites();
      renderProfileLovedAlbums();
      renderProfileSaved();
      bindProfileFavorites();
      bindProfileLovedAlbums();
      bindProfileSavedGrid();
    }

    function renderSettingsPage(){
      var user=auth.currentUser;
      if(!user){
        settingsPageBody.innerHTML='<div class="settings-card"><h2>Entre para continuar</h2><p>Faça login para editar sua conta e personalizar o perfil.</p><div class="settings-btn-row"><button class="settings-button primary" id="settingsLoginAction" type="button">Entrar</button></div></div>';
        document.getElementById('settingsLoginAction').onclick=function(){closePublicPages();window.BETVPublicRoutes.go('/login');document.body.classList.add('login-mode');};
        return;
      }
      var avatar=selectedProfileAvatar(currentProfile);
      var bannerState=resolvedProfileBanner(user);
      var banner=bannerState.bannerUrl;
      var identities=user&&user.raw&&Array.isArray(user.raw.identities)?user.raw.identities:[];
      var providers=user&&user.raw&&user.raw.app_metadata&&Array.isArray(user.raw.app_metadata.providers)?user.raw.app_metadata.providers:[];
      var discordConnected=providers.indexOf('discord')>=0||identities.some(function(identity){return String(identity.provider||'').toLowerCase()==='discord';});
      var storedSocialLinks=readProfileSocialLinks(user.uid);
      var socialLinks=hasProfileSocialLinks(storedSocialLinks)?storedSocialLinks:normalizeProfileSocialLinks(currentProfile&&currentProfile.socialLinks);
      var settingsTabs=['profile','connections','data','language','session'];
      if(settingsActiveTab==='socials')settingsActiveTab='connections';
      if(settingsActiveTab==='account')settingsActiveTab='session';
      if(settingsTabs.indexOf(settingsActiveTab)<0)settingsActiveTab='profile';
      settingsPageBody.innerHTML=''
        +'<div class="settings-legal-layout">'
        +  '<nav class="settings-page-nav" aria-label="Seções das configurações">'
        +    '<button type="button" data-settings-tab="profile"'+(settingsActiveTab==='profile'?' class="active" aria-current="page"':'')+'>Perfil</button>'
        +    '<button type="button" data-settings-tab="connections"'+(settingsActiveTab==='connections'?' class="active" aria-current="page"':'')+'>Conexões e Redes Sociais</button>'
        +    '<button type="button" data-settings-tab="data"'+(settingsActiveTab==='data'?' class="active" aria-current="page"':'')+'>Meus Dados</button>'
        +    '<button type="button" data-settings-tab="language"'+(settingsActiveTab==='language'?' class="active" aria-current="page"':'')+'>Idioma</button>'
        +    '<button type="button" data-settings-tab="session"'+(settingsActiveTab==='session'?' class="active" aria-current="page"':'')+'>Conta e Sessão</button>'
        +  '</nav>'
        +  '<main class="settings-page-content">'
        +    '<section class="settings-section-panel settings-profile-panel" data-settings-panel="profile"'+(settingsActiveTab==='profile'?'':' hidden')+'><h1>Perfil</h1><p class="settings-panel-lead">Escolha o banner e o avatar do seu perfil.</p><div class="settings-panel-card"><div class="settings-banner-preview">'+(banner?'<img loading="eager" fetchpriority="high" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(banner):banner)+'" alt="Banner atual">':'')+'<span>'+(banner?'Banner selecionado':'Nenhum banner selecionado')+'</span></div><div class="settings-avatar-row"><div class="settings-avatar-preview">'+(avatar?'<img loading="eager" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(avatar):avatar)+'" alt="Avatar atual">':profileFallbackAvatar())+'</div><div><strong class="settings-avatar-title">Avatar atual</strong><span class="settings-muted">Atualize sua imagem principal do perfil.</span></div></div><div class="settings-btn-row settings-profile-actions"><button class="settings-button primary" id="settingsChooseBanner" type="button">Escolher banner</button><button class="settings-button" id="settingsChooseAvatar" type="button">Trocar avatar</button></div><div class="settings-status" id="settingsAppearanceStatus"></div></div></section>'
        +    '<section class="settings-section-panel settings-connections-panel" data-settings-panel="connections"'+(settingsActiveTab==='connections'?'':' hidden')+'><h1>Conexões e Redes Sociais</h1><p class="settings-panel-lead">Gerencie sua conexão de conta e as redes exibidas no perfil público.</p><div class="settings-panel-card"><div class="settings-social-heading"><h2>Conexões conectadas</h2><p>Gerencie os serviços vinculados à sua conta.</p></div><div class="settings-connection"><div><strong>Discord</strong><span class="settings-muted">'+(discordConnected?'Sua conta Discord está conectada.':'Use sua identidade do Discord na plataforma.')+'</span></div><button class="settings-button" id="settingsConnectDiscord" type="button" '+(discordConnected?'disabled':'')+'><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.54 5.34A16.4 16.4 0 0 0 15.44 4l-.5 1.04a15.1 15.1 0 0 0-5.87 0L8.56 4a16.6 16.6 0 0 0-4.11 1.35C1.85 9.2 1.15 12.96 1.5 16.66a16.6 16.6 0 0 0 5.04 2.55l1.23-1.67c-.68-.26-1.33-.58-1.94-.96l.47-.36c3.72 1.72 7.76 1.72 11.44 0l.48.36c-.62.38-1.27.7-1.95.96l1.23 1.67a16.5 16.5 0 0 0 5.03-2.55c.42-4.29-.72-8.01-2.99-11.32ZM8.68 14.5c-1.12 0-2.04-1.03-2.04-2.3 0-1.27.9-2.3 2.04-2.3 1.15 0 2.06 1.04 2.04 2.3 0 1.27-.9 2.3-2.04 2.3Zm6.64 0c-1.12 0-2.04-1.03-2.04-2.3 0-1.27.9-2.3 2.04-2.3 1.15 0 2.06 1.04 2.04 2.3 0 1.27-.89 2.3-2.04 2.3Z"/></svg><span>'+(discordConnected?'Discord conectado':'Conectar Discord')+'</span></button></div><div class="settings-status" id="settingsDiscordStatus"></div></div><div class="settings-panel-card settings-social-card"><div class="settings-social-heading"><h2>Redes sociais</h2><p>Adicione as redes que devem aparecer ao lado do seu nome no perfil público.</p></div><form id="settingsSocialForm"><div class="settings-social-fields"><div class="settings-social-field"><label for="settingsSocialX"><span class="settings-social-brand is-x">'+profileSocialIcon('x')+'</span><span>X</span></label><div class="settings-social-input-wrap"><span class="settings-social-prefix">x.com/</span><input id="settingsSocialX" name="x" type="text" maxlength="80" autocomplete="off" autocapitalize="none" spellcheck="false" value="'+escapePublic(socialLinks.x||'')+'" placeholder="usuario"></div></div><div class="settings-social-field"><label for="settingsSocialInstagram"><span class="settings-social-brand is-instagram">'+profileSocialIcon('instagram')+'</span><span>Instagram</span></label><div class="settings-social-input-wrap"><span class="settings-social-prefix">instagram.com/</span><input id="settingsSocialInstagram" name="instagram" type="text" maxlength="100" autocomplete="off" autocapitalize="none" spellcheck="false" value="'+escapePublic(socialLinks.instagram||'')+'" placeholder="usuario"></div></div></div><div class="settings-status" id="settingsSocialStatus"></div><div class="settings-btn-row settings-social-actions"><button class="settings-button primary" type="submit">Salvar redes sociais</button></div></form></div></section>'
        +    '<section class="settings-section-panel settings-data-panel" data-settings-panel="data"'+(settingsActiveTab==='data'?'':' hidden')+'><h1>Meus Dados</h1><p class="settings-panel-lead">Baixe uma cópia das informações essenciais da sua conta e do seu perfil.</p><div class="settings-data-actions settings-data-actions-outside"><button class="settings-button settings-export-button" id="settingsExportData" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Exportar meus dados</span></button><a class="settings-data-privacy-button" href="/privacy">Ver Termos de Privacidade</a></div><div class="settings-status settings-data-status" id="settingsExportStatus"></div></section>'
        +    '<section class="settings-section-panel settings-language-panel" data-settings-panel="language"'+(settingsActiveTab==='language'?'':' hidden')+'><h1>Idioma</h1><p class="settings-panel-lead">Escolha o idioma usado em todas as áreas públicas do site.</p><div class="settings-panel-card"><div class="settings-language-options" role="radiogroup" aria-label="Idioma do site"><button class="settings-language-option" type="button" data-settings-language="pt-br" role="radio"><strong>Português (Brasil)</strong><span>Português</span></button><button class="settings-language-option" type="button" data-settings-language="en-us" role="radio"><strong>English (United States)</strong><span>Inglês</span></button><button class="settings-language-option" type="button" data-settings-language="es" role="radio"><strong>Español</strong><span>Espanhol</span></button></div><p class="settings-muted settings-language-note">A página será recarregada no idioma escolhido e sua preferência ficará salva neste dispositivo.</p></div></section>'
        +    '<section class="settings-section-panel settings-session-panel" data-settings-panel="session"'+(settingsActiveTab==='session'?'':' hidden')+'><h1>Conta</h1><p class="settings-panel-lead">Altere o nome exibido e o @ do seu perfil.</p><div class="settings-panel-card"><form id="settingsAccountForm"><div class="settings-form-grid"><div class="settings-field"><label>Nome</label><input class="notranslate" translate="no" name="displayName" maxlength="50" required value="'+escapePublic(currentProfile.displayName||user.displayName||'')+'"></div><div class="settings-field"><label>@</label><input class="notranslate" translate="no" name="username" maxlength="20" pattern="[a-z0-9._]{3,20}" required value="'+escapePublic(currentProfile.username||'')+'" placeholder="seunome"></div></div><div class="settings-status" id="settingsAccountStatus"></div><div class="settings-btn-row"><button class="settings-button primary" type="submit">Salvar alterações</button></div></form></div><div class="settings-session-section"><h1>Sessão</h1><p class="settings-panel-lead">Saia desta conta ou exclua permanentemente seu acesso e perfil.</p><div class="settings-btn-row settings-session-actions"><button class="settings-danger" id="settingsDeleteAccount" type="button">Excluir conta</button><button class="settings-button" id="settingsLogoutAccount" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Sair da conta</span></button></div><div class="settings-status settings-session-status" id="settingsDeleteStatus"></div></div></section>'
        +  '</main>'
        +'</div>';
      function activateSettingsTab(tab,moveToTop){
        if(settingsTabs.indexOf(tab)<0)tab='profile';
        settingsActiveTab=tab;
        try{sessionStorage.setItem(SETTINGS_TAB_SESSION_KEY,tab);}catch(_){ }
        settingsPageBody.querySelectorAll('[data-settings-tab]').forEach(function(button){
          var active=button.getAttribute('data-settings-tab')===tab;
          button.classList.toggle('active',active);
          if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
        });
        settingsPageBody.querySelectorAll('[data-settings-panel]').forEach(function(panel){
          var active=panel.getAttribute('data-settings-panel')===tab;
          panel.hidden=!active;
          panel.setAttribute('aria-hidden',active?'false':'true');
        });
        if(moveToTop&&settingsPage){settingsPage.scrollTop=0;}
      }
      settingsPageBody.querySelectorAll('[data-settings-tab]').forEach(function(button){
        button.onclick=function(event){
          if(event){
            event.preventDefault();
            event.stopPropagation();
            if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
          }
          var tab=button.getAttribute('data-settings-tab');
          activateSettingsTab(tab,true);
          // Mantém a rota e a tela de Configurações ativas ao trocar de aba.
          // Isso impede que listeners globais de navegação tratem o clique como retorno à Home.
          keepSettingsOpen();
          try{
            var configUrl='/config'+(location.search||'');
            var state={...(history.state||{}),beRoute:'config',settingsTab:tab};
            history.replaceState(state,'',configUrl);
          }catch(_){ }
        };
      });
      activateSettingsTab(settingsActiveTab,false);
      var activeLanguage=String(window.BETVLocale&&window.BETVLocale.slug||'pt-br');
      settingsPageBody.querySelectorAll('[data-settings-language]').forEach(function(button){
        var selected=button.getAttribute('data-settings-language')===activeLanguage;
        button.classList.toggle('active',selected);
        button.setAttribute('aria-checked',selected?'true':'false');
        button.onclick=function(){
          var next=button.getAttribute('data-settings-language');
          if(next===activeLanguage)return;
          button.disabled=true;
          if(window.BETVLocale&&typeof window.BETVLocale.switchTo==='function')window.BETVLocale.switchTo(next);
          else location.assign('/'+next+(window.BETVLocalePath&&window.BETVLocalePath()!=='/'?window.BETVLocalePath():'')+(location.search||''));
        };
      });
      document.getElementById('settingsChooseAvatar').onclick=function(){openAvatarPicker();};
      document.getElementById('settingsChooseBanner').onclick=function(){openBannerPicker();};
      document.getElementById('settingsConnectDiscord').onclick=async function(){
        var msg=document.getElementById('settingsDiscordStatus');
        if(discordConnected){msg.textContent='Discord já está conectado.';msg.className='settings-status ok';return;}
        this.disabled=true;msg.textContent='Abrindo conexão com Discord…';msg.className='settings-status';
        try{sessionStorage.setItem('beOpenSettingsAfterDiscord','1');await auth.connectDiscord();msg.textContent='Redirecionando para o Discord…';msg.className='settings-status ok';}
        catch(error){msg.textContent='Não foi possível conectar: '+(error&&error.message?error.message:'Tente novamente.');msg.className='settings-status err';this.disabled=false;}
      };
      var socialForm=document.getElementById('settingsSocialForm');
      if(socialForm)socialForm.addEventListener('submit',async function(event){
        event.preventDefault();
        var form=event.currentTarget;
        var msg=document.getElementById('settingsSocialStatus');
        var submit=form.querySelector('[type="submit"]');
        var rawX=String(form.x.value||'').trim();
        var rawInstagram=String(form.instagram.value||'').trim();
        var x=normalizeProfileSocialValue('x',rawX);
        var instagram=normalizeProfileSocialValue('instagram',rawInstagram);
        if(rawX&&!x){msg.textContent='Informe um usuário válido do X, como x.com/usuario.';msg.className='settings-status err';return;}
        if(rawInstagram&&!instagram){msg.textContent='Informe um usuário válido do Instagram, como instagram.com/usuario.';msg.className='settings-status err';return;}
        submit.disabled=true;msg.textContent='Salvando redes sociais…';msg.className='settings-status';
        var links=writeProfileSocialLinks(user.uid,{x:x,instagram:instagram});
        currentProfile={...(currentProfile||{}),socialLinks:links};
        if(viewedProfile&&isOwnProfileView())viewedProfile={...viewedProfile,socialLinks:links};
        form.x.value=links.x;form.instagram.value=links.instagram;
        try{
          await persistCrossDeviceData('profile-socials');
          if(settingsSyncState==='error'){msg.textContent='Redes sociais salvas neste aparelho. A sincronização será tentada novamente.';msg.className='settings-status err';}
          else{msg.textContent='Redes sociais salvas no perfil.';msg.className='settings-status ok';showSettingsSaved();}
        }catch(error){
          msg.textContent='As redes sociais foram salvas neste aparelho, mas a sincronização falhou.';msg.className='settings-status err';
        }finally{submit.disabled=false;}
      });
      document.getElementById('settingsExportData').onclick=async function(){
        var button=this;
        var msg=document.getElementById('settingsExportStatus');
        button.disabled=true;msg.textContent='Preparando seus dados…';msg.className='settings-status';
        try{
          var payload=await auth.exportAccount();
          var localData={};
          try{localData.featuredFavorites=JSON.parse(localStorage.getItem('beFeaturedFavorites')||'[]');}catch(_){localData.featuredFavorites=[];}
          try{localData.detailFavorites=JSON.parse(localStorage.getItem('beDetailFavorites')||'[]');}catch(_){localData.detailFavorites=[];}
          try{localData.preferences=JSON.parse(localStorage.getItem('beCookiePreferences')||'{}');}catch(_){localData.preferences={};}
          try{localData.savedContents=JSON.parse(localStorage.getItem('beSavedContents')||'[]');}catch(_){localData.savedContents=[];}
          try{localData.profileTopFavorites=JSON.parse(localStorage.getItem('beProfileTopFavorites:'+user.uid)||'[]');}catch(_){localData.profileTopFavorites=[];}
          try{localData.profileLovedAlbums=JSON.parse(localStorage.getItem('beProfileLovedAlbums:'+user.uid)||'[]');}catch(_){localData.profileLovedAlbums=[];}
          localData.profileSocialLinks=readProfileSocialLinks(user.uid);
          localData.crossDeviceSync={enabled:beBackend.mode==='supabase',state:settingsSyncState,lastMessage:settingsSyncMessage};
          var exportData={
            exportedAt:payload.exportedAt||beBackend.now(),
            account:payload.account||null,
            profile:payload.profile||currentProfile||null,
            siteData:localData
          };
          var json=JSON.stringify(exportData,null,2);
          var blob=new Blob([json],{type:'application/json;charset=utf-8'});
          var link=document.createElement('a');
          var handle=String((currentProfile&&currentProfile.username)||(currentProfile&&currentProfile.displayName)||(user&&user.uid)||'usuario').replace(/[^a-z0-9_-]+/gi,'-');
          link.href=URL.createObjectURL(blob);link.download='dados-betv-'+handle+'.json';document.body.appendChild(link);link.click();link.remove();
          setTimeout(function(){URL.revokeObjectURL(link.href);},1000);
          msg.textContent='Arquivo exportado com sucesso.';msg.className='settings-status ok';
        }catch(error){msg.textContent='Não foi possível exportar: '+(error&&error.message?error.message:'Tente novamente.');msg.className='settings-status err';}
        finally{button.disabled=false;}
      };
      document.getElementById('settingsLogoutAccount').onclick=async function(){
        var msg=document.getElementById('settingsDeleteStatus');
        this.disabled=true;msg.textContent='Saindo da conta…';msg.className='settings-status';
        try{await auth.signOut();closePublicPages(false);showLogin();}
        catch(error){msg.textContent='Não foi possível sair: '+(error&&error.message?error.message:'Tente novamente.');msg.className='settings-status err';this.disabled=false;}
      };
      document.getElementById('settingsDeleteAccount').onclick=async function(){
        var button=this;
        var msg=document.getElementById('settingsDeleteStatus');
        var deletingUser=auth.currentUser;
        if(!confirm('Excluir esta conta permanentemente? Esta ação não pode ser desfeita. A conta, o perfil e a sessão serão removidos.'))return;
        button.disabled=true;msg.textContent='Excluindo conta…';msg.className='settings-status';
        try{
          await auth.deleteAccount();
          try{
            if(deletingUser&&deletingUser.uid){
              localStorage.removeItem('beSelectedAvatar:'+deletingUser.uid);
              localStorage.removeItem('beProfileBanner:'+deletingUser.uid);
            }
            localStorage.removeItem('beAuthExpected');
            localStorage.removeItem('beSessionUid');
            sessionStorage.removeItem('beOpenSettingsAfterDiscord');
            sessionStorage.removeItem('beOAuthDestination');
          }catch(_){ }
          closePublicPages(false);
          window.alert('Conta excluída com sucesso. Você foi desconectado do site.');
          window.location.replace(window.BETVLocaleURL?window.BETVLocaleURL('/'):'/');
        }catch(error){
          msg.textContent='Não foi possível excluir: '+(error&&error.message?error.message:'Tente novamente.');
          msg.className='settings-status err';
          button.disabled=false;
        }
      };
      document.getElementById('settingsAccountForm').addEventListener('submit',async function(e){
        e.preventDefault();
        var form=e.currentTarget,msg=document.getElementById('settingsAccountStatus'),submit=form.querySelector('[type="submit"]');
        var displayName=form.displayName.value.trim();
        var handle=beBackend.normalizeUsername(form.username.value);
        form.username.value=handle;
        if(!beBackend.validUsername(handle)){msg.textContent='O @ deve ter de 3 a 20 caracteres, usando letras minúsculas, números, ponto ou underline.';msg.className='settings-status err';return;}
        var approved=await askSettingsSave();if(!approved){keepSettingsOpen();return;}
        submit.disabled=true;msg.textContent='Salvando…';msg.className='settings-status';
        try{
          currentProfile=await beBackend.profiles.update(user.uid,{displayName:displayName,username:handle,updatedAt:beBackend.now()});
          await auth.updateCurrentUser({displayName:displayName});
          setLiteralText(username,'@'+handle);
          renderProfilePage();keepSettingsOpen();
          msg.textContent='Conta atualizada com sucesso.';msg.className='settings-status ok';showSettingsSaved();
        }catch(error){msg.textContent=error&&error.code==='username-in-use'?'Este @ já está em uso.':'Não foi possível salvar: '+error.message;msg.className='settings-status err';}
        finally{submit.disabled=false;}
      });
    }
    function syncBannerPickerSelection(){
      var current=resolvedProfileBanner(auth.currentUser).bannerUrl;
      bannerPickerBody.querySelectorAll('.banner-option').forEach(function(option){option.classList.toggle('selected',option.dataset.bannerUrl===current);});
    }
    function bindBannerPickerSelection(){
      if(bannerPickerBody.dataset.selectionBound==='true')return;
      bannerPickerBody.dataset.selectionBound='true';
      bannerPickerBody.addEventListener('click',async function(event){
        var button=event.target.closest('[data-banner-url]');
        if(!button||!bannerPickerBody.contains(button)||button.disabled||!auth.currentUser)return;
        var returnView=bannerPickerReturnView;
        button.disabled=true;
        var bannerUrl=button.dataset.bannerUrl||'';
        var bannerId=button.dataset.bannerId||'';
        currentProfile={...(currentProfile||{}),bannerUrl:bannerUrl,bannerId:bannerId};
        try{localStorage.setItem('beProfileBanner:'+auth.currentUser.uid,JSON.stringify({bannerUrl:bannerUrl,bannerId:bannerId,updatedAt:beBackend.now()}));}catch(_){ }
        syncBannerPickerSelection();
        applyProfileBanner(bannerUrl);
        renderProfilePage();
        try{
          var savedProfile=await beBackend.profiles.setBanner(auth.currentUser.uid,bannerUrl,bannerId);
          if(savedProfile)currentProfile={...savedProfile,bannerUrl:bannerUrl,bannerId:bannerId};
        }catch(error){
          console.warn('O banner foi mantido no perfil local; o banco não aceitou a atualização:',error&&error.message?error.message:error);
        }
        renderProfilePage();
        if(returnView==='settings'||document.body.classList.contains('settings-page-active')||isConfigRoute()){renderSettingsPage();keepSettingsOpen();showSettingsSaved();}
        setTimeout(closeBannerPicker,100);
      });
    }
    async function openBannerPicker(){
      bannerPickerReturnView=document.body.classList.contains('settings-page-active')||isConfigRoute()?'settings':'';
      document.body.classList.add('banner-picker-active');bannerPicker.hidden=false;syncBodyScroll();pushPickerHistory('banner-picker');
      bindBannerPickerSelection();
      if(bannerGalleryRendered){
        syncBannerPickerSelection();
        activatePickerImages(bannerPickerBody,'banner');
        return;
      }
      bannerPickerBody.innerHTML='<div class="banner-picker-empty">Carregando banners…</div>';
      try{
        var items=(await loadPickerGallery()).filter(function(item){
          var type=String(item.itemType||'').toLowerCase();
          return type==='banner'||/banner/i.test(String(item.category||''));
        });
        if(!items.length){bannerPickerBody.innerHTML='<div class="banner-picker-empty">Nenhum banner disponível no momento.</div>';return;}
        var groups={};
        items.forEach(function(item){var cat=(item.category||'Banners de perfil').trim()||'Banners de perfil';(groups[cat]||(groups[cat]=[])).push(item);});
        bannerPickerBody.innerHTML=Object.keys(groups).map(function(cat){
          return '<section class="banner-group"><h3>'+escapePublic(cat)+'</h3><div class="banner-grid">'+groups[cat].map(function(item){var imageUrl=window.beMediaUrl?window.beMediaUrl(item.imageUrl):item.imageUrl;return '<button class="banner-option" type="button" data-banner-url="'+escapePublic(item.imageUrl)+'" data-banner-id="'+escapePublic(item.id)+'" aria-label="Selecionar banner de perfil"><img data-picker-src="'+escapePublic(imageUrl)+'" loading="lazy" decoding="async" fetchpriority="low" width="640" height="220" alt="Banner de perfil"></button>';}).join('')+'</div></section>';
        }).join('');
        bannerGalleryRendered=true;
        syncBannerPickerSelection();
        activatePickerImages(bannerPickerBody,'banner');
      }catch(error){bannerPickerBody.innerHTML='<div class="banner-picker-empty">Não foi possível carregar os banners.</div>';console.warn(error);}
    }
    function closeDetailBeforeDedicatedPage(){
      var detailSection=document.getElementById('contentDetailSection');
      var detailRecommendations=document.getElementById('detailRecommendations');
      if(detailSection)detailSection.hidden=true;
      if(detailRecommendations)detailRecommendations.hidden=true;
      document.body.classList.remove('detail-page-active');
      window.dispatchEvent(new CustomEvent('be:close-album-page'));
    }
    async function openPublicProfile(updateRoute,requestedUsername){
      closeDetailBeforeDedicatedPage();
      window.dispatchEvent(new CustomEvent('be:close-section-view'));
      document.body.classList.remove('section-catalog-active');
      toggleDropdown(false);settingsPage.hidden=true;profilePage.hidden=false;
      document.body.classList.remove('settings-page-active','login-mode');document.body.classList.add('profile-page-active');
      updateProfileActionVisibility();
      var handle=beBackend.normalizeUsername(requestedUsername||profileRouteUsername()||(currentProfile&&currentProfile.username)||'');
      if(!handle){
        if(!auth.currentUser){window.BETVPublicRoutes.go('/login');return;}
        handle=beBackend.normalizeUsername((currentProfile&&currentProfile.username)||'perfil');
      }
      var route='/@'+encodeURIComponent(handle||'perfil');
      if(updateRoute!==false)pushPublicRoute(route);else if(isProfileRoute()&&(cleanPathname()!==route||location.hash))replacePublicRoute(route);
      var requestId=++viewedProfileRequest;
      var ownHandle=beBackend.normalizeUsername((currentProfile&&currentProfile.username)||'');
      if(auth.currentUser&&ownHandle&&handle===ownHandle){
        viewedProfile={...(currentProfile||{}),socialLinks:readProfileSocialLinks(auth.currentUser.uid),favorites:readProfileFavorites(),lovedAlbums:readProfileLovedAlbums(),savedContents:(typeof window.beGetSavedContents==='function'?window.beGetSavedContents():[])};
        viewedProfileStatus='ready';
        renderProfilePage();
        window.scrollTo({top:0,behavior:'auto'});
        return;
      }
      viewedProfile=null;viewedProfileStatus='loading';renderProfilePage();window.scrollTo({top:0,behavior:'auto'});
      try{
        var profile=await beBackend.profiles.getPublic(handle);
        if(requestId!==viewedProfileRequest)return;
        viewedProfile=profile;viewedProfileStatus=profile?'ready':'missing';renderProfilePage();
      }catch(error){
        if(requestId!==viewedProfileRequest)return;
        console.error('Falha ao carregar perfil público:',error);viewedProfile=null;viewedProfileStatus='error';renderProfilePage();
      }
    }

    function openSettingsPage(updateRoute){
      closeDetailBeforeDedicatedPage();
      window.dispatchEvent(new CustomEvent('be:close-section-view'));
      document.body.classList.remove('section-catalog-active');
      closeNotificationMenus();
      toggleDropdown(false);
      profilePage.hidden=true;profilePage.setAttribute('hidden','');profilePage.setAttribute('aria-hidden','true');
      settingsPage.hidden=true;settingsPage.setAttribute('hidden','');settingsPage.setAttribute('aria-hidden','true');settingsPage.dataset.renderReady='false';
      document.body.classList.remove('profile-page-active','login-mode','support-page-active','notification-page-active','billie-page-active','donate-page-active','fans-page-active','album-page-active','detail-page-active');
      document.body.classList.add('settings-page-active');
      try{renderSettingsPage();}catch(error){console.error('Falha ao renderizar configurações:',error);settingsPageBody.innerHTML='<div class="settings-card"><h2>Configurações</h2><p>Não foi possível carregar esta área. Atualize a página e tente novamente.</p></div>';}
      settingsPage.dataset.renderReady='true';
      settingsPage.hidden=false;settingsPage.removeAttribute('hidden');settingsPage.setAttribute('aria-hidden','false');
      if(window.BETVReleaseConfigPaint){
        settingsPage.setAttribute('aria-busy','true');
        Promise.resolve(window.BETVReleaseConfigPaint({container:settingsPage})).finally(function(){settingsPage.removeAttribute('aria-busy');});
      }
      if(updateRoute!==false&&!isConfigRoute())pushPublicRoute('/config');
      window.scrollTo({top:0,behavior:'auto'});
    }

    function renderProfile(){
      var user=auth.currentUser;
      if(!user){profileBody.innerHTML='<div class="profile-login-required"><h3>Entre para acessar seu perfil</h3><p>Use seu e-mail e senha para continuar.</p><button class="profile-btn primary" id="profileLogin" type="button">Entrar com e-mail</button></div>';document.getElementById('profileLogin').onclick=function(){closeProfile();window.BETVPublicRoutes.go('/login');document.body.classList.add('login-mode');};return;}
      var avatar=selectedProfileAvatar(currentProfile);
      profileBody.innerHTML='<div class="profile-intro"><div class="profile-avatar-preview"><img loading="eager" decoding="async" src="'+escapePublic(window.BETVResolveAvatar?window.BETVResolveAvatar(avatar):avatar||'/assets/images/profile/default-avatar.png')+'" data-avatar-fallback="/assets/images/profile/default-avatar.png" alt="Avatar do perfil"></div><div><h3 class="notranslate" translate="no">'+escapePublic(currentProfile.displayName||user.displayName||'Novo perfil')+'</h3><p class="notranslate" translate="no" style="color:var(--ice-faint);margin-top:6px">'+escapePublic(user.email||'')+'</p><div class="profile-avatar-actions"><button class="profile-btn" id="profileChooseAvatar" type="button">Escolher foto</button></div></div></div><form id="profileForm"><div class="profile-form"><div class="profile-field"><label>Nome exibido</label><input class="notranslate" translate="no" name="displayName" maxlength="50" required value="'+escapePublic(currentProfile.displayName||user.displayName||'')+'"></div><div class="profile-field"><label>@ de usuário</label><input class="notranslate" translate="no" name="username" maxlength="20" pattern="[a-z0-9._]{3,20}" required placeholder="ex.: billiefan" value="'+escapePublic(currentProfile.username||'')+'"></div><div class="profile-field full"><label>E-mail</label><input class="notranslate" translate="no" value="'+escapePublic(user.email||'')+'" readonly></div><div class="profile-field full"><label>Biografia</label><textarea name="bio" id="profileBio" rows="4" maxlength="180" placeholder="Conte um pouco sobre você…">'+escapePublic(currentProfile.bio||'')+'</textarea><div class="profile-counter"><span id="profileBioCount">0</span>/180</div></div></div><div class="profile-message" id="profileMessage"></div><div class="profile-actions"><button class="profile-btn" type="button" id="profileCancel">Cancelar</button><button class="profile-btn primary" type="submit">Salvar perfil</button></div></form>';
      document.getElementById('profileChooseAvatar').onclick=function(){closeProfile();openAvatarPicker();};document.getElementById('profileCancel').onclick=closeProfile;
      var bio=document.getElementById('profileBio'),count=document.getElementById('profileBioCount');function updateCount(){count.textContent=bio.value.length;}bio.addEventListener('input',updateCount);updateCount();
      document.getElementById('profileForm').addEventListener('submit',async function(e){e.preventDefault();var form=e.currentTarget,msg=document.getElementById('profileMessage'),submit=form.querySelector('[type="submit"]');var displayName=form.displayName.value.trim(),handle=beBackend.normalizeUsername(form.username.value),bioText=form.bio.value.trim();form.username.value=handle;if(!beBackend.validUsername(handle)){msg.textContent='O @ deve ter de 3 a 20 caracteres, usando letras minúsculas, números, ponto ou underline.';msg.className='profile-message err';return;}submit.disabled=true;msg.textContent='Salvando…';msg.className='profile-message';try{var payload={displayName:displayName,username:handle,bio:bioText,updatedAt:beBackend.now()};currentProfile=await beBackend.profiles.update(user.uid,payload);await auth.updateCurrentUser({displayName:displayName});setLiteralText(username,handle?'@'+handle:(displayName||'Usuário'));msg.textContent='Perfil salvo com sucesso.';msg.className='profile-message ok';setTimeout(closeProfile,700);}catch(error){msg.textContent=error&&error.code==='username-in-use'?'Este @ já está em uso. Escolha outro.':'Não foi possível salvar: '+error.message;msg.className='profile-message err';}finally{submit.disabled=false;}});
    }


    function openOnboarding(user){
      if(!user||beBackend.isAdmin(user)||String(currentProfile.username||'').trim())return;
      onboardingShownFor=user.uid;
      document.body.classList.add('profile-onboarding-active');
      profileOnboarding.hidden=false;
      profileOnboarding.setAttribute('aria-hidden','false');
      onboardingMessage.textContent='';onboardingMessage.className='onboarding-message';
      onboardingUsername.value='';
      onboardingHandlePreview.textContent='@seunome';
      updateOnboardingAvatar();syncBodyScroll();
      setTimeout(function(){onboardingUsername.focus({preventScroll:true});},120);
    }

    onboardingUsername.addEventListener('input',function(){
      var normalized=beBackend.normalizeUsername(onboardingUsername.value);
      if(onboardingUsername.value!==normalized)onboardingUsername.value=normalized;
      onboardingHandlePreview.textContent='@'+(normalized||'seunome');
      onboardingMessage.textContent='';onboardingMessage.className='onboarding-message';
    });
    onboardingChooseAvatar.addEventListener('click',openAvatarPicker);
    onboardingForm.addEventListener('submit',async function(event){
      event.preventDefault();
      var user=auth.currentUser;
      if(!user)return;
      var handle=beBackend.normalizeUsername(onboardingUsername.value);
      onboardingUsername.value=handle;
      if(!beBackend.validUsername(handle)){
        onboardingMessage.textContent='Escolha um @ de 3 a 20 caracteres usando apenas letras minúsculas, números, ponto ou underline.';
        onboardingMessage.className='onboarding-message err';
        onboardingUsername.focus();return;
      }
      var submit=onboardingForm.querySelector('[type="submit"]');
      submit.disabled=true;onboardingMessage.textContent='Salvando seu perfil…';onboardingMessage.className='onboarding-message';
      try{
        currentProfile=await beBackend.profiles.update(user.uid,{username:handle,displayName:currentProfile.displayName||user.displayName||'',profileComplete:true,updatedAt:beBackend.now()});
        setLiteralText(username,'@'+handle);
        onboardingMessage.textContent='Perfil configurado com sucesso.';onboardingMessage.className='onboarding-message ok';
        setTimeout(function(){closeOnboarding(true);},420);
      }catch(error){
        onboardingMessage.textContent=error&&error.code==='username-in-use'?'Esse @ já está em uso. Tente outro.':'Não foi possível salvar seu @. '+(error&&error.message?error.message:'Tente novamente.');
        onboardingMessage.className='onboarding-message err';
      }finally{submit.disabled=false;}
    });

    async function logoutFromProfile(){
      if(!profilePageLogout||profilePageLogout.disabled)return;
      profilePageLogout.disabled=true;
      profilePageLogout.setAttribute('aria-busy','true');
      try{
        await auth.signOut();
        location.replace(window.BETVLocaleURL?window.BETVLocaleURL('/login'):'/login');
      }catch(error){
        profilePageLogout.disabled=false;
        profilePageLogout.removeAttribute('aria-busy');
        console.error('Não foi possível sair da conta:',error);
        alert('Não foi possível sair da conta. Tente novamente.');
      }
    }

    function openProfile(){if(!auth.currentUser){window.BETVPublicRoutes.go('/login');return;}openPublicProfile(true,(currentProfile&&currentProfile.username)||'');}
    avatarPickerClose.addEventListener('click',closeAvatarPicker);avatarPickerCancel.addEventListener('click',closeAvatarPicker);bannerPickerClose.addEventListener('click',closeBannerPicker);if(bannerPickerCancel)bannerPickerCancel.addEventListener('click',closeBannerPicker);profileClose.addEventListener('click',closeProfile);if(settingsSaveCancel)settingsSaveCancel.addEventListener('click',function(){resolveSettingsConfirm(false);});if(settingsSaveApprove)settingsSaveApprove.addEventListener('click',function(){resolveSettingsConfirm(true);});if(settingsSaveConfirm)settingsSaveConfirm.addEventListener('click',function(event){if(event.target===settingsSaveConfirm)resolveSettingsConfirm(false);});profileModal.addEventListener('click',function(e){if(e.target===profileModal)closeProfile();});profilePageMore.addEventListener('click',function(){if(auth.currentUser)openSettingsPage(true);else window.BETVPublicRoutes.go('/login');});if(profilePageNotifications)profilePageNotifications.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();window.dispatchEvent(new CustomEvent('be:open-notifications',{detail:{}}));});if(profilePageLogout)profilePageLogout.addEventListener('click',logoutFromProfile);if(profilePageHome)profilePageHome.addEventListener('click',function(){if(!auth.currentUser&&!(window.BETVGuestAccess&&window.BETVGuestAccess.isActive())){window.BETVPublicRoutes.go('/login');return;}closePublicPages(true);var home=document.getElementById('logoBtn');if(home)home.click();else location.assign(window.BETVLocaleURL?window.BETVLocaleURL('/'):'/');});bindProfileFavorites();bindProfileLovedAlbums();bindProfileSavedGrid();window.addEventListener('be:favorites-changed',function(){if(document.body.classList.contains('profile-page-active'))renderProfileSaved();});window.addEventListener('be:catalog-ready',function(){if(document.body.classList.contains('profile-page-active')){renderProfileFavorites();renderProfileLovedAlbums();renderProfileSaved();}if(profileFavoritesPicker&&!profileFavoritesPicker.hidden){profileFavoritesCatalog=profileCatalogContents();renderProfileFavoritesPicker();}});window.addEventListener('storage',function(event){if(['beSavedContents','beDetailFavorites','beFeaturedFavorites'].indexOf(event.key)>=0&&document.body.classList.contains('profile-page-active'))renderProfileSaved();if(event.key===profileFavoritesStorageKey()&&document.body.classList.contains('profile-page-active'))renderProfileFavorites();if(event.key===profileLovedAlbumsStorageKey()&&document.body.classList.contains('profile-page-active'))renderProfileLovedAlbums();});document.getElementById('settingsClosePage').addEventListener('click',function(event){
      if(event){event.preventDefault();event.stopPropagation();}

      // Fecha as configurações e troca primeiro a rota para a Home. Isso evita
      // que o clique no logo crie uma entrada extra de /config no histórico.
      try{sessionStorage.removeItem(SETTINGS_TAB_SESSION_KEY);}catch(_){ }
      settingsActiveTab='profile';
      closePublicPages(false);
      if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.replace==='function'){
        window.BETVPublicRoutes.replace('/');
      }else{
        history.replaceState({beRoute:'public'},'','/');
        window.dispatchEvent(new PopStateEvent('popstate',{state:{beRoute:'public'}}));
      }

      // A visualização do catálogo é mantida em memória. Ao sair de Conta e
      // Sessão, força explicitamente a aba Home para não reaparecer em Vídeos.
      var homeButton=document.getElementById('logoBtn');
      if(homeButton){
        homeButton.dataset.beHistoryMode='none';
        homeButton.click();
        delete homeButton.dataset.beHistoryMode;
      }else{
        document.body.dataset.homeView='home';
      }
      window.scrollTo({top:0,left:0,behavior:'auto'});
    });document.querySelectorAll('button[data-home-view],a[data-home-view],#logoBtn').forEach(function(button){button.addEventListener('click',function(){closePublicPages(true);});});window.addEventListener('be:open-config',function(){openSettingsPage(false);});window.addEventListener('be:open-profile-route',function(){openPublicProfile(false).catch(function(error){console.error('Falha ao abrir perfil público:',error);});});window.addEventListener('popstate',function(){
      if(!avatarPicker.hidden)closeAvatarPicker(false);
      if(!bannerPicker.hidden)closeBannerPicker(false);
      if(isConfigRoute()){if(auth.currentUser)openSettingsPage(false);else window.BETVPublicRoutes.go('/login');}
      else if(isProfileRoute())openPublicProfile(false).catch(function(error){console.error('Falha ao abrir perfil público:',error);});
      else closePublicPages(false);
    });
    auth.onChange(async function(currentUser){
      dashboard.hidden=true;
      var isAdmin=false;
      if(currentUser){
        try{isAdmin=beBackend.isAdmin(currentUser);currentProfile=await beBackend.profiles.ensure(currentUser);}catch(error){console.warn('Perfil:',error.message);currentProfile={displayName:currentUser.displayName||'',avatarUrl:''};}
        if(currentProfile&&currentProfile.banned){window.dispatchEvent(new CustomEvent('be:user-banned',{detail:{email:currentUser.email||'',reason:currentProfile.banReason||'',bannedAt:currentProfile.bannedAt||''}}));try{await auth.signOut();}catch(_){ }return;}
        var restoredBanner=resolvedProfileBanner(currentUser);if(restoredBanner.bannerUrl){currentProfile.bannerUrl=restoredBanner.bannerUrl;currentProfile.bannerId=restoredBanner.bannerId;}
        setLiteralText(username,currentProfile.username?'@'+currentProfile.username:(currentProfile.displayName||currentUser.displayName||'Usuário'));selectedAvatar=selectedProfileAvatar(currentProfile)||localStorage.getItem(avatarCacheKey(currentUser))||'';setMainAvatar(selectedAvatar);syncAuthActionLabel();updateProfileActionVisibility();if(document.body.classList.contains('settings-page-active'))renderSettingsPage();startCrossDeviceSync(currentUser).catch(function(error){console.warn('Falha ao iniciar sincronização:',error);});if(isConfigRoute())setTimeout(function(){openSettingsPage(false);},0);else if(isProfileRoute())setTimeout(function(){openPublicProfile(false).catch(function(error){console.error('Falha ao abrir perfil público:',error);});},0);if(sessionStorage.getItem('beOpenSettingsAfterDiscord')==='1'){sessionStorage.removeItem('beOpenSettingsAfterDiscord');setTimeout(function(){openSettingsPage(true);},180);}if(!isAdmin&&!String(currentProfile.username||'').trim()&&onboardingShownFor!==currentUser.uid)setTimeout(function(){openOnboarding(currentUser);},220);
      }else{stopCrossDeviceSync();setInterfaceText(username,'Visitante');currentProfile={};selectedAvatar='';setMainAvatar('');syncAuthActionLabel();updateProfileActionVisibility();if(isProfileRoute())setTimeout(function(){openPublicProfile(false).catch(function(error){console.error('Falha ao abrir perfil público:',error);});},0);else{viewedProfile=null;viewedProfileStatus='idle';}if(document.body.classList.contains('settings-page-active'))renderSettingsPage();onboardingShownFor='';closeOnboarding(true);}
      dashboard.hidden=!isAdmin;
    });
    document.querySelectorAll('[data-public-action]').forEach(function(button){button.addEventListener('click',async function(){
      var action=button.dataset.publicAction;if(action==='dashboard'){if(!beBackend.isAdmin(auth.currentUser)){dashboard.hidden=true;toggleDropdown(false);return;}location.hash='#/admin/dashboard';return;}if(action==='auth'){if(auth.currentUser){await auth.signOut();toggleDropdown(false);return;}if(window.BETVGuestAccess&&window.BETVGuestAccess.isActive()){window.BETVGuestAccess.setActive(false);localStorage.removeItem('beAuthExpected');localStorage.removeItem('beSessionUid');}syncAuthActionLabel();window.BETVPublicRoutes.go('/login');document.body.classList.add('login-mode');toggleDropdown(false);return;}if(action==='avatar'){openAvatarPicker();return;}if(action==='profile'){openProfile();return;}if(action==='donate'){toggleDropdown(false);if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/ong');return;}if(action==='support'){toggleDropdown(false);if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go('/suporte');else window.dispatchEvent(new CustomEvent('be:open-support'));return;}if(action==='settings'){openSettingsPage(true);return;}
    });});
    window.addEventListener('be:guest-access',syncAuthActionLabel);
    window.addEventListener('storage',function(event){if(event&&event.key==='beGuestAccess')syncAuthActionLabel();});
    window.addEventListener('be:profile-avatar-changed',function(event){
      var detail=event&&event.detail||{};
      if(!auth.currentUser||detail.userId!==auth.currentUser.uid)return;
      if(detail.profile)currentProfile=detail.profile;
      else currentProfile={...(currentProfile||{}),avatarUrl:detail.avatarUrl||'',avatarId:detail.avatarId||''};
      selectedAvatar=detail.avatarUrl||'';
      localStorage.setItem(avatarCacheKey(auth.currentUser),selectedAvatar);
      setMainAvatar(selectedAvatar);updateOnboardingAvatar();if(!document.body.classList.contains('settings-page-active')&&!isConfigRoute())renderProfilePage();if(document.body.classList.contains('settings-page-active')||isConfigRoute()){renderSettingsPage();keepSettingsOpen();}
    });
    window.addEventListener('be:profile-banner-changed',function(event){
      var detail=event&&event.detail||{};
      if(!auth.currentUser||detail.userId!==auth.currentUser.uid)return;
      var latestUrl=String(detail.bannerUrl||(detail.profile&&detail.profile.bannerUrl)||resolvedProfileBanner(auth.currentUser).bannerUrl||'');
      var latestId=String(detail.bannerId||(detail.profile&&detail.profile.bannerId)||'');
      currentProfile={...(currentProfile||{}),...(detail.profile||{}),bannerUrl:latestUrl,bannerId:latestId};
      if(latestUrl){
        try{localStorage.setItem('beProfileBanner:'+auth.currentUser.uid,JSON.stringify({bannerUrl:latestUrl,bannerId:latestId,updatedAt:beBackend.now()}));}catch(_){ }
      }
      if(!document.body.classList.contains('settings-page-active')&&!isConfigRoute()){
        applyProfileBanner(latestUrl);
        renderProfilePage();
      }
      if(document.body.classList.contains('settings-page-active')||isConfigRoute()){renderSettingsPage();keepSettingsOpen();}
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(settingsSaveConfirm&&!settingsSaveConfirm.hidden){resolveSettingsConfirm(false);return;}closeAvatarPicker();closeBannerPicker();closeProfile();closeOnboarding(false);}});
    setTimeout(function(){if(isConfigRoute()){if(auth.currentUser)openSettingsPage(false);}else if(isProfileRoute())openPublicProfile(false).catch(function(error){console.error('Falha ao abrir perfil público:',error);});},0);
  }
  function startPublicAccount(){setupPublicAccount().catch(function(error){console.error('Falha ao iniciar conta pública:',error);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startPublicAccount,{once:true});else startPublicAccount();

  
  var widgets = document.querySelectorAll('[data-tilt]');
  widgets.forEach(function(w){
    w.addEventListener('mousemove', function(e){
      var r = w.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      w.style.setProperty('--mx', x + '%');
      w.style.setProperty('--my', y + '%');
    });
  });

  
  var items = document.querySelectorAll('.widget');
  items.forEach(function(el, idx){
    el.style.animationDelay = (idx * 0.06) + 's';
  });

  
  var featured = document.getElementById('featured');
  if (featured && !featured.closest('.featured-wrap').hidden){
    var fSlides = Array.prototype.slice.call(featured.querySelectorAll('.f-slide'));
    var fDots = Array.prototype.slice.call(document.querySelectorAll('.f-dot'));
    var fIndex = 0;
    var AUTOPLAY_MS = 10000;
    var fTimer = null;

    function goToSlide(i){
      fIndex = (i + fSlides.length) % fSlides.length;
      fSlides.forEach(function(s, idx){ s.classList.toggle('active', idx === fIndex); });
      fDots.forEach(function(d, idx){ d.classList.toggle('active', idx === fIndex); });
    }
    function nextSlide(){ goToSlide(fIndex + 1); }
    function startAutoplay(){
      stopAutoplay();
      fTimer = window.setInterval(nextSlide, AUTOPLAY_MS);
    }
    function stopAutoplay(){
      if (fTimer){ window.clearInterval(fTimer); fTimer = null; }
    }

    fDots.forEach(function(dot){
      dot.addEventListener('click', function(){
        goToSlide(parseInt(dot.getAttribute('data-goto'), 10));
        startAutoplay();
      });
    });

    featured.addEventListener('mouseenter', stopAutoplay);
    featured.addEventListener('mouseleave', startAutoplay);

    goToSlide(0);
    startAutoplay();
  }

})();

;

(function(){
  'use strict';
  var initialCallbackDestination=new URLSearchParams(location.search||'').get('auth_callback');
  if(location.hash.startsWith('#/admin')||initialCallbackDestination==='admin') return;

  var bgIndex=0,bgTimer=null,authReady=false,authFlowBusy=false,currentProfile=null,auth=null,selectedAuthEmail='';
  var SITE_SKELETON_MIN_MS=Number(window.__beSiteSkeletonMinimumMs||2000);
  var siteSkeletonStartedAt=Number(window.__beSiteSkeletonStartedAt||Date.now());
  var initialSkeletonPending=true,siteSkeletonHideTimer=0,donateVisualWaitBound=false;
  function setSiteLoading(active){document.documentElement.classList.toggle('site-loading-active',Boolean(active));document.body.classList.toggle('site-loading-active',Boolean(active));}
  function releaseSiteSkeleton(){if(document.documentElement.classList.contains('config-route-boot'))return;if(isLegalRoute())showLegalRoute();var loading=q('authLoading');if(loading)loading.hidden=true;document.documentElement.classList.remove('legal-route-boot');setSiteLoading(false);initialSkeletonPending=false;siteSkeletonHideTimer=0;if(window.BETVSyncTabIcon)window.BETVSyncTabIcon();}
  function donateVisualReady(){var donatePage=q('donatePage');return !isDonateRoute()||Boolean(donatePage&&donatePage.dataset&&donatePage.dataset.visualReady==='true');}
  function waitForDonateVisualBeforeReveal(){
    if(donateVisualWaitBound)return;
    donateVisualWaitBound=true;
    window.addEventListener('be:donate-visual-ready',function(){
      donateVisualWaitBound=false;
      if(isDonateRoute())hideSiteSkeleton();
    },{once:true});
  }
  function hideSiteSkeleton(){
    if(isDonateRoute()&&!donateVisualReady()){waitForDonateVisualBeforeReveal();return;}
    if(initialSkeletonPending){
      var remaining=Math.max(0,SITE_SKELETON_MIN_MS-(Date.now()-siteSkeletonStartedAt));
      if(remaining>0){window.clearTimeout(siteSkeletonHideTimer);siteSkeletonHideTimer=window.setTimeout(hideSiteSkeleton,remaining);return;}
    }
    releaseSiteSkeleton();
  }
  function showSiteSkeleton(){window.clearTimeout(siteSkeletonHideTimer);siteSkeletonHideTimer=0;var loading=q('authLoading');if(loading)loading.hidden=false;setSiteLoading(true);}
  window.addEventListener('be:content-ready',function(){
    // O catálogo pode terminar de carregar antes da autenticação. Só remove o
    // bloqueio visual quando uma sessão válida já foi confirmada; visitantes
    // sem conta permanecem protegidos até a tela de login ser exibida.
    if(authReady&&auth&&(auth.currentUser||(window.BETVGuestAccess&&window.BETVGuestAccess.isActive())))hideSiteSkeleton();
  });

  function q(id){return document.getElementById(id)}
  var banToastTimer=0;
  function hideBannedToast(){var toast=q('accountBanToast');if(!toast)return;toast.classList.remove('show');window.setTimeout(function(){if(!toast.classList.contains('show'))toast.hidden=true;},260);}
  function showBannedToast(detail){
    detail=detail||{};
    var toast=q('accountBanToast');var appeal=q('accountBanAppeal');if(!toast)return;
    var accountEmail=String(detail.email||selectedAuthEmail||'').trim();
    var reason=String(detail.reason||'').trim();
    if(appeal){
      var appealSubject='Apelação a banimento';
      var appealBody='Olá, gostaria de solicitar a revisão do banimento da minha conta BETV.'+(accountEmail?'\n\nE-mail da conta: '+accountEmail:'')+(reason?'\nMotivo informado: '+reason:'')+'\n\nExplique aqui por que o acesso deve ser restaurado:';
      function encodeEmailField(value){
        return encodeURIComponent(String(value||'').replace(/\r?\n/g,'\r\n'));
      }
      appeal.href='mailto:billieilishtv@gmail.com?subject='+encodeEmailField(appealSubject)+'&body='+encodeEmailField(appealBody);
      appeal.removeAttribute('target');
      appeal.removeAttribute('rel');
    }
    toast.hidden=false;window.requestAnimationFrame(function(){toast.classList.add('show');});
    window.clearTimeout(banToastTimer);banToastTimer=window.setTimeout(hideBannedToast,10000);
  }
  function isBannedError(error){var value=String((error&&error.code)||'')+' '+String((error&&error.message)||'');return /user[_ -]?banned|account[_ -]?banned|banid|banned/i.test(value);}
  window.addEventListener('be:user-banned',function(event){showBannedToast(event&&event.detail||{});});
  function setStatus(message,type){var el=q('authStatus');if(!el)return;el.textContent=message||'';el.className='auth-status '+(type||'');}
  function friendly(error){
    var code=(error&&error.code)||'';
    var map={
      'auth/invalid-credential':'E-mail ou senha incorretos.',
      'auth/user-not-found':'Conta não encontrada.',
      'auth/wrong-password':'E-mail ou senha incorretos.',
      'auth/email-already-in-use':'Este e-mail já possui uma conta.',
      'auth/weak-password':'Use uma senha com pelo menos 6 caracteres.',
      'auth/invalid-email':'Digite um e-mail válido.',
      'auth/too-many-requests':'Muitas tentativas. Aguarde um pouco e tente novamente.',
      'auth/network-request-failed':'Não foi possível conectar. Verifique sua internet e tente novamente.',
      'auth/session-missing':'Não foi possível concluir a sessão de login. Tente entrar novamente.',
      'auth/user-banned':'',
      'auth/email-rate-limit':'O limite temporário de e-mails do Supabase foi atingido. Aguarde e tente novamente mais tarde ou continue com o Discord.',
      'auth/provider-not-enabled':'O login com Discord ainda não foi ativado no Supabase.',
      'backend/not-configured':'Este recurso será ativado quando o Supabase estiver conectado.',
      'username-in-use':'Este nome de usuário já está em uso. Escolha outro.',
      'username-invalid':'O @ informado não é válido.'
    };
    return map[code]||(error&&error.message)||'Não foi possível concluir. Tente novamente.';
  }
  function validAuthPassword(value){return /^(?=.{6,}$)(?=.*[0-9!@#$%^&*._-]).+$/.test(String(value||''));}
  function normalizeUsername(value){return beBackend.normalizeUsername(value);}
  function validUsername(value){return beBackend.validUsername(value);}
  function callbackParams(){var query=new URLSearchParams(location.search||''),raw=String(location.hash||'').replace(/^#/,''),nested=raw.indexOf('#'),payload=nested>=0?raw.slice(nested+1):raw,hash=new URLSearchParams(payload);return {query:query,hash:hash};}
  function hasAuthCallback(){var p=callbackParams();return Boolean(p.query.get('code')||p.query.get('error')||p.query.get('error_code')||p.query.get('auth_callback')||p.hash.get('access_token')||p.hash.get('refresh_token')||p.hash.get('error')||p.hash.get('error_code'));}
  function authCallbackError(){var p=callbackParams();return p.query.get('error_description')||p.hash.get('error_description')||p.query.get('error')||p.hash.get('error')||'';}
  function cleanPathname(){try{return decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/'))).replace(/\/+$/,'')||'/';}catch(_){return String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';}}
  function replaceRoute(route){var url=new URL(location.href);['code','error','error_code','error_description','auth_callback','oauth'].forEach(function(name){url.searchParams.delete(name)});if(String(route||'').startsWith('/')){url.pathname=route;url.hash='';}else{url.pathname='/';url.hash=route||'';}history.replaceState(null,'',url.pathname+(url.search||'')+url.hash);}
  function isConfigRoute(){var path=cleanPathname().toLowerCase(),hash=location.hash.toLowerCase();return path==='/config'||hash==='#config'||hash==='#/config';}
  function isLoginRoute(){var path=cleanPathname().toLowerCase(),hash=location.hash.toLowerCase();return path==='/login'||hash==='#login'||hash==='#/login';}
  function isPasswordRecoveryRoute(){var path=cleanPathname().toLowerCase(),hash=location.hash.toLowerCase();return path==='/reset-password'||hash==='#reset-password'||hash==='#/reset-password'||sessionStorage.getItem('bePasswordRecoveryActive')==='1';}
  function isProfileRoute(){return /^\/@[^/?#]+$/i.test(cleanPathname())||/^#\/perfil\/@[^/?#]+/i.test(location.hash);}
  function isVideoRoute(){return /^\/\d{6,12}$/i.test(cleanPathname())||/^#\/video\/[^/?#]+/i.test(location.hash);}
  function isLegalRoute(){var path=cleanPathname().toLowerCase();return /^\/(?:terms|privacy|cookies|dmca|comunidade|community|comunidad)$/i.test(path)||/^#\/?(?:terms|privacy|cookies|dmca|comunidade|community|comunidad)$/i.test(String(location.hash||''));}
  function isNotificationsRoute(){var path=cleanPathname().toLowerCase(),hash=String(location.hash||'').toLowerCase();return /^\/(?:atualizacoes|notificacoes)(?:\/[^/]+)?$/i.test(path)||/^#\/?(?:atualizacoes|notificacoes|updates|notifications)(?:\/|$)/i.test(hash);}
  function isSupportRoute(){var path=cleanPathname().toLowerCase(),hash=String(location.hash||'').toLowerCase();return path==='/suporte'||hash==='#suporte'||hash==='#/suporte'||hash==='#support'||hash==='#/support';}
  function isDonateRoute(){var path=cleanPathname().toLowerCase(),hash=String(location.hash||'').toLowerCase();return path==='/ong'||hash==='#ong'||hash==='#/ong';}
  function isBillieRoute(){var path=cleanPathname().toLowerCase(),hash=String(location.hash||'').toLowerCase();return path==='/billie-eilish'||path==='/billie'||hash==='#billie-eilish'||hash==='#/billie-eilish'||hash==='#billie'||hash==='#/billie';}
  function isFansRoute(){var path=cleanPathname().toLowerCase(),hash=String(location.hash||'').toLowerCase();return path==='/fãs'||path==='/fas'||path==='/fans'||hash==='#fãs'||hash==='#/fãs'||hash==='#fas'||hash==='#/fas'||hash==='#fans'||hash==='#/fans';}
  function isAlbumsRoute(){var path=cleanPathname().toLowerCase(),hash=String(location.hash||'').toLowerCase();return /^\/(?:albuns|álbuns|albums)(?:\/[^/]+)?$/i.test(path)||/^#\/?(?:albuns|álbuns|albums)(?:\/|$)/i.test(hash);}
  function showLegalRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','detail-page-active','support-page-active','notification-page-active','billie-page-active','donate-page-active','fans-page-active','album-page-active');document.body.classList.add('legal-page-active');window.dispatchEvent(new CustomEvent('be:close-album-page'));window.dispatchEvent(new CustomEvent('be:close-donate-page'));window.dispatchEvent(new CustomEvent('be:close-fans-page'));window.dispatchEvent(new CustomEvent('be:close-notifications'));window.dispatchEvent(new CustomEvent('be:open-legal-route'));window.scrollTo(0,0);}
  function showSupportRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','detail-page-active','notification-page-active','billie-page-active','donate-page-active','fans-page-active','album-page-active');document.body.classList.add('support-page-active');window.dispatchEvent(new CustomEvent('be:close-album-page'));window.dispatchEvent(new CustomEvent('be:close-donate-page'));window.dispatchEvent(new CustomEvent('be:close-fans-page'));window.dispatchEvent(new CustomEvent('be:close-notifications'));window.dispatchEvent(new CustomEvent('be:open-support'));window.scrollTo(0,0);}
  function showDonateRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','detail-page-active','notification-page-active','billie-page-active','support-page-active','fans-page-active','album-page-active','section-catalog-active');document.body.classList.add('donate-page-active');window.dispatchEvent(new CustomEvent('be:close-album-page'));window.dispatchEvent(new CustomEvent('be:close-support'));window.dispatchEvent(new CustomEvent('be:close-fans-page'));window.dispatchEvent(new CustomEvent('be:close-notifications'));window.dispatchEvent(new CustomEvent('be:close-billie-page'));window.dispatchEvent(new CustomEvent('be:open-donate-page'));window.scrollTo(0,0);}
  function showNotificationsRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','support-page-active','detail-page-active','billie-page-active','donate-page-active','fans-page-active','album-page-active');document.body.classList.add('notification-page-active');window.dispatchEvent(new CustomEvent('be:close-album-page'));window.dispatchEvent(new CustomEvent('be:close-donate-page'));window.dispatchEvent(new CustomEvent('be:close-fans-page'));window.dispatchEvent(new CustomEvent('be:close-support'));window.dispatchEvent(new CustomEvent('be:open-notifications'));window.scrollTo(0,0);}
  function showBillieRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','support-page-active','notification-page-active','detail-page-active','section-catalog-active','donate-page-active','fans-page-active','album-page-active');document.body.classList.add('billie-page-active');window.dispatchEvent(new CustomEvent('be:close-album-page'));window.dispatchEvent(new CustomEvent('be:close-donate-page'));window.dispatchEvent(new CustomEvent('be:close-fans-page'));window.dispatchEvent(new CustomEvent('be:close-support'));window.dispatchEvent(new CustomEvent('be:close-notifications'));window.dispatchEvent(new CustomEvent('be:open-billie-page'));window.scrollTo(0,0);}
  function showFansRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','support-page-active','notification-page-active','detail-page-active','section-catalog-active','billie-page-active','donate-page-active','album-page-active');document.body.classList.add('fans-page-active');window.dispatchEvent(new CustomEvent('be:close-donate-page'));window.dispatchEvent(new CustomEvent('be:close-support'));window.dispatchEvent(new CustomEvent('be:close-notifications'));window.dispatchEvent(new CustomEvent('be:close-billie-page'));window.dispatchEvent(new CustomEvent('be:close-album-page'));window.dispatchEvent(new CustomEvent('be:open-fans-page'));window.scrollTo(0,0);}
  function showAlbumsRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','support-page-active','notification-page-active','detail-page-active','section-catalog-active','billie-page-active','donate-page-active','fans-page-active');document.body.classList.add('album-page-active');window.dispatchEvent(new CustomEvent('be:close-donate-page'));window.dispatchEvent(new CustomEvent('be:close-fans-page'));window.dispatchEvent(new CustomEvent('be:close-support'));window.dispatchEvent(new CustomEvent('be:close-notifications'));window.dispatchEvent(new CustomEvent('be:close-billie-page'));window.dispatchEvent(new CustomEvent('be:open-album-page'));window.scrollTo(0,0);}
  function showLogin(){if(window.BETVReleaseConfigPaint)window.BETVReleaseConfigPaint({immediate:true});document.body.classList.remove('profile-page-active','settings-page-active','legal-page-active','support-page-active','notification-page-active','billie-page-active','donate-page-active','fans-page-active','album-page-active');window.dispatchEvent(new CustomEvent('be:close-album-page'));window.dispatchEvent(new CustomEvent('be:close-donate-page'));window.dispatchEvent(new CustomEvent('be:close-fans-page'));window.dispatchEvent(new CustomEvent('be:close-notifications'));document.body.classList.add('login-mode');if(!isLoginRoute()||location.hash)replaceRoute('/login');}
  function showPasswordRecovery(message,type){
    document.body.classList.remove('profile-page-active','settings-page-active','legal-page-active','support-page-active','notification-page-active','billie-page-active','donate-page-active','fans-page-active','album-page-active');
    window.dispatchEvent(new CustomEvent('be:close-album-page'));
    document.body.classList.add('login-mode');
    setMode('recovery');
    if(message)setStatus(message,type||'');
    hideSiteSkeleton();
  }
  function enterHome(preserveRoute){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','support-page-active','notification-page-active','billie-page-active','donate-page-active','fans-page-active','album-page-active');sessionStorage.removeItem('beOAuthDestination');if(!preserveRoute)replaceRoute('/');window.dispatchEvent(new CustomEvent('be:close-album-page'));window.dispatchEvent(new CustomEvent('be:close-donate-page'));window.dispatchEvent(new CustomEvent('be:close-fans-page'));window.dispatchEvent(new CustomEvent('be:close-support'));window.dispatchEvent(new CustomEvent('be:close-notifications'));window.dispatchEvent(new CustomEvent('be:close-billie-page'));window.dispatchEvent(new CustomEvent('be:home-entered'));window.scrollTo(0,0);}
  function enterConfig(){document.body.classList.remove('profile-page-active','login-mode','support-page-active','notification-page-active','billie-page-active','donate-page-active','fans-page-active','album-page-active');document.body.classList.add('settings-page-active');sessionStorage.removeItem('beOAuthDestination');if(!isConfigRoute())replaceRoute('/config');window.dispatchEvent(new CustomEvent('be:close-album-page'));window.dispatchEvent(new CustomEvent('be:close-donate-page'));window.dispatchEvent(new CustomEvent('be:close-fans-page'));window.dispatchEvent(new CustomEvent('be:close-support'));window.dispatchEvent(new CustomEvent('be:close-notifications'));window.dispatchEvent(new CustomEvent('be:close-billie-page'));window.dispatchEvent(new CustomEvent('be:open-config'));window.scrollTo(0,0);}
  function setMode(mode,email){
    if(email)selectedAuthEmail=String(email).trim().toLowerCase();
    var steps={email:q('emailStep'),password:q('passwordStep'),signup:q('signupStep'),recovery:q('passwordRecoveryStep')};
    Object.keys(steps).forEach(function(key){if(steps[key])steps[key].hidden=key!==mode;});
    q('authGate').dataset.authStep=mode;
    if(selectedAuthEmail){
      q('loginEmail').value=selectedAuthEmail;
      q('signupEmail').value=selectedAuthEmail;
      q('loginSelectedEmail').textContent=selectedAuthEmail;
      q('signupSelectedEmail').textContent=selectedAuthEmail;
      q('authEmail').value=selectedAuthEmail;
    }
    setStatus('');
    window.requestAnimationFrame(function(){
      var target=mode==='email'?q('authEmail'):mode==='password'?q('loginPassword'):mode==='recovery'?q('recoveryNewPassword'):q('signupName');
      if(target)target.focus({preventScroll:true});
    });
  }
  function initBackgrounds(){
    var allSlides=[].slice.call(document.querySelectorAll('.login-bg-slide'));
    var isMobile=window.matchMedia&&window.matchMedia('(max-width:760px)').matches;
    var slides=isMobile&&allSlides.length>4?allSlides.slice(0,4):allSlides;
    var dots=q('loginDots');
    if(!slides.length)return;
    allSlides.slice(slides.length).forEach(function(slide){slide.hidden=true;});
    function ensureLoaded(slide){
      if(!slide)return;
      var source=slide.getAttribute('data-login-bg');
      if(!source)return;
      slide.style.backgroundImage='url("'+String(source).replace(/"/g,'\\"')+'")';
      slide.removeAttribute('data-login-bg');
    }
    function randomIndex(except){
      if(slides.length<2)return 0;
      var next=except;
      while(next===except){
        if(window.crypto&&window.crypto.getRandomValues){
          var value=new Uint32Array(1);
          window.crypto.getRandomValues(value);
          next=value[0]%slides.length;
        }else{
          next=Math.floor(Math.random()*slides.length);
        }
      }
      return next;
    }
    bgIndex=randomIndex(-1);
    if(dots){
      dots.innerHTML=slides.map(function(_,i){return '<button class="login-dot '+(i===bgIndex?'active':'')+'" type="button" data-bg="'+i+'"></button>'}).join('');
    }
    function show(i){
      bgIndex=(i+slides.length)%slides.length;
      ensureLoaded(slides[bgIndex]);
      slides.forEach(function(slide,j){slide.classList.toggle('active',j===bgIndex)});
      if(dots)dots.querySelectorAll('.login-dot').forEach(function(dot,j){dot.classList.toggle('active',j===bgIndex)});
    }
    function restart(){
      clearInterval(bgTimer);
      if(document.hidden)return;
      bgTimer=setInterval(function(){show(randomIndex(bgIndex))},isMobile?16000:10000);
    }
    if(dots)dots.addEventListener('click',function(e){var button=e.target.closest('[data-bg]');if(!button)return;show(Number(button.dataset.bg));restart()});
    document.addEventListener('visibilitychange',function(){if(document.hidden)clearInterval(bgTimer);else restart();},{passive:true});
    show(bgIndex);
    restart();
    var idle=window.requestIdleCallback||function(callback){return setTimeout(callback,900)};
    idle(function(){var next=randomIndex(bgIndex);ensureLoaded(slides[next]);});
  }

  async function recoverAuthenticatedUser(user){
    if(user)return user;
    if(!auth||typeof auth.getAuthenticatedUser!=='function')return null;
    var waits=hasAuthCallback()?[0,100,250,500,900,1500,2500]:[0,100,220,450,800];
    for(var i=0;i<waits.length;i+=1){
      if(waits[i])await new Promise(function(resolve){setTimeout(resolve,waits[i])});
      user=await auth.getAuthenticatedUser();
      if(user)return user;
    }
    return null;
  }

  async function enforceAccountAccess(user){
    if(!user)return true;
    var status={banned:Boolean(currentProfile&&currentProfile.banned),reason:currentProfile&&currentProfile.banReason||''};
    if(typeof auth.accountStatus==='function'){
      try{var latest=await auth.accountStatus();if(latest)status={...status,...latest,banned:Boolean(status.banned||latest.banned)};}catch(error){console.warn('Não foi possível confirmar o status da conta:',error);}
    }
    if(!status.banned)return true;
    var detail={email:user.email||'',reason:status.reason||'',bannedAt:status.bannedAt||''};
    try{await auth.signOut();}catch(_){ }
    showLogin();setMode('email',detail.email);setStatus('');showBannedToast(detail);
    return false;
  }

  async function finishPublicLogin(user){
    user=await recoverAuthenticatedUser(user);
    if(!user){var sessionError=new Error('Não foi possível concluir a sessão de login. Tente entrar novamente.');sessionError.code='auth/session-missing';throw sessionError;}
    if(window.BETVGuestAccess)window.BETVGuestAccess.setActive(false);
    localStorage.setItem('beAuthExpected','1');
    localStorage.setItem('beSessionUid',user.uid);
    try{currentProfile=await beBackend.profiles.ensure(user);}catch(error){console.warn('Perfil não pôde ser carregado:',error);currentProfile={uid:user.uid,email:user.email||'',displayName:user.displayName||'',username:'',avatarUrl:''};}
    if(!(await enforceAccountAccess(user)))return null;
    setStatus('');
    if(isPasswordRecoveryRoute()){showPasswordRecovery();return user;}
    if(isNotificationsRoute())showNotificationsRoute();
    else if(isDonateRoute())showDonateRoute();
    else if(isSupportRoute())showSupportRoute();
    else if(isBillieRoute())showBillieRoute();
    else if(isFansRoute())showFansRoute();
    else if(isAlbumsRoute())showAlbumsRoute();
    else if(isConfigRoute()){enterConfig();hideSiteSkeleton();}
    else if(isProfileRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-profile-route'));}
    else if(isVideoRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-video-route'));}
    else enterHome();
    return user;
  }

  async function boot(){
    auth=beBackend.auth;
    var banToastClose=q('accountBanToastClose');if(banToastClose)banToastClose.onclick=function(){window.clearTimeout(banToastTimer);hideBannedToast();};
    q('discordAuthButton').onclick=async function(){
      var button=this;
      if(authFlowBusy)return;
      authFlowBusy=true;button.disabled=true;setStatus('');
      try{await auth.signInWithDiscord();}catch(err){setStatus(friendly(err),'error');authFlowBusy=false;button.disabled=false;}
    };
    var guestAccessButton=q('guestAccessButton');
    if(guestAccessButton)guestAccessButton.onclick=function(){
      if(window.BETVGuestAccess)window.BETVGuestAccess.setActive(true);
      localStorage.removeItem('beAuthExpected');
      localStorage.removeItem('beSessionUid');
      sessionStorage.removeItem('beOAuthDestination');
      setStatus('');
      enterHome();
      hideSiteSkeleton();
      window.dispatchEvent(new CustomEvent('be:guest-access'));
    };

    q('emailLookupForm').addEventListener('submit',async function(e){
      e.preventDefault();
      var form=e.currentTarget,b=e.submitter||form.querySelector('[type="submit"]'),email=form.elements.namedItem('email').value.trim().toLowerCase();
      if(authFlowBusy)return;
      authFlowBusy=true;if(b)b.disabled=true;setStatus('Entrando..');
      try{
        var exists=typeof auth.accountExists==='function'?await auth.accountExists(email):null;
        selectedAuthEmail=email;
        if(exists===true){setMode('password',email);}
        else if(exists===false){setMode('signup',email);}
        else{throw new Error('Não foi possível verificar este e-mail agora. Tente novamente.');}
      }catch(err){setStatus(friendly(err),'error');}
      finally{authFlowBusy=false;if(b)b.disabled=false;}
    });

    document.querySelectorAll('.change-auth-email').forEach(function(button){
      button.addEventListener('click',function(){
        q('loginPassword').value='';
        q('signupPassword').value='';
        setMode('email',selectedAuthEmail);
      });
    });
    q('switchToSignup').addEventListener('click',function(){setMode('signup',selectedAuthEmail)});
    q('switchToPassword').addEventListener('click',function(){setMode('password',selectedAuthEmail)});

    q('forgotPassword').onclick=async function(){
      var email=selectedAuthEmail||q('loginEmail').value.trim();
      if(!email){setMode('email');setStatus('Digite seu e-mail para receber o link de redefinição.','error');return;}
      try{await auth.sendPasswordReset(email);setStatus('Enviamos um link de redefinição para seu e-mail.','ok')}catch(err){setStatus(friendly(err),'error')}
    };

    q('recoveryBackToLogin').onclick=async function(){
      sessionStorage.removeItem('bePasswordRecoveryActive');
      try{if(auth.currentUser)await auth.signOut();}catch(_){ }
      showLogin();setMode('email');setStatus('');
    };
    q('passwordRecoveryForm').addEventListener('submit',async function(e){
      e.preventDefault();
      var form=e.currentTarget,button=e.submitter||form.querySelector('[type="submit"]'),password=form.elements.namedItem('password').value,confirmation=form.elements.namedItem('confirmPassword').value;
      if(password!==confirmation){setStatus('As senhas não coincidem.','error');form.elements.namedItem('confirmPassword').focus();return;}
      if(!validAuthPassword(password)){setStatus('Use pelo menos 6 caracteres e inclua um número ou caractere especial.','error');form.elements.namedItem('password').focus();return;}
      if(!auth.currentUser){setStatus('Este link expirou ou já foi utilizado. Solicite uma nova redefinição de senha.','error');return;}
      if(authFlowBusy)return;
      authFlowBusy=true;if(button)button.disabled=true;setStatus('Salvando sua nova senha…');
      try{
        if(typeof auth.updatePassword!=='function')throw new Error('A redefinição de senha não está disponível.');
        await auth.updatePassword(password);
        sessionStorage.removeItem('bePasswordRecoveryActive');
        form.reset();
        try{await auth.signOut();}catch(_){ }
        showLogin();setMode('email');setStatus('Senha alterada com sucesso. Entre novamente com a nova senha.','ok');
      }catch(err){showPasswordRecovery(friendly(err),'error');}
      finally{authFlowBusy=false;if(button)button.disabled=false;}
    });
    window.addEventListener('be:password-recovery',function(){showPasswordRecovery();});

    q('loginForm').addEventListener('submit',async function(e){
      e.preventDefault();
      var form=e.currentTarget,b=e.submitter||form.querySelector('[type="submit"]'),email=(selectedAuthEmail||form.elements.namedItem('email').value).trim().toLowerCase(),password=form.elements.namedItem('password').value;
      if(!validAuthPassword(password)){setStatus('Use pelo menos 6 caracteres e inclua um número ou caractere especial.','error');form.elements.namedItem('password').focus();return;}
      if(authFlowBusy)return;
      authFlowBusy=true;if(b)b.disabled=true;setStatus('Entrando…');
      try{var result=await auth.signInWithEmail({email:email,password:password,remember:q('rememberLogin').checked});await finishPublicLogin(result&&result.user?result.user:auth.currentUser);}catch(err){showLogin();setMode('password',email);if(isBannedError(err)){setStatus('');showBannedToast({email:email});}else setStatus(err&&err.code==='admin-only'?'A conta administrativa deve acessar #/admin.':friendly(err),'error');}finally{authFlowBusy=false;if(b)b.disabled=false;}
    });

    q('signupForm').addEventListener('submit',async function(e){
      e.preventDefault();
      var form=e.currentTarget,b=e.submitter||form.querySelector('[type="submit"]'),name=form.elements.namedItem('name').value.trim(),email=(selectedAuthEmail||form.elements.namedItem('email').value).trim().toLowerCase(),password=form.elements.namedItem('password').value;
      if(name.length<2){setStatus('Digite seu nome completo.','error');return;}
      if(!validAuthPassword(password)){setStatus('Use pelo menos 6 caracteres e inclua um número ou caractere especial.','error');form.elements.namedItem('password').focus();return;}
      if(authFlowBusy)return;
      authFlowBusy=true;if(b)b.disabled=true;setStatus('Criando sua conta…');
      try{
        var result=await auth.signUp({email:email,password:password,name:name,username:'',remember:true});
        if(result.needsEmailConfirmation){showLogin();setMode('password',email);setStatus('Conta criada. Abra o link enviado ao seu e-mail para confirmar o endereço e depois faça login.','ok');return;}
        currentProfile=await beBackend.profiles.ensure(result.user);if(window.BETVGuestAccess)window.BETVGuestAccess.setActive(false);localStorage.setItem('beAuthExpected','1');localStorage.setItem('beSessionUid',result.user.uid);setStatus('Conta criada com sucesso.','ok');enterHome();
      }catch(err){
        showLogin();
        if(err&&err.code==='auth/email-already-in-use')setMode('password',email);else setMode('signup',email);
        setStatus(friendly(err),'error');
      }finally{authFlowBusy=false;if(b)b.disabled=false;}
    });

    auth.onChange(async function(user){
      authReady=true;
      if(authFlowBusy)return;
      if(user&&!(await enforceAccountAccess(user)))return;
      if(isLegalRoute()){showLegalRoute();hideSiteSkeleton();return;}
      if(!user){
        // Mantém o skeleton acima do catálogo até a ausência de sessão ser
        // confirmada. Isso impede que a Home apareça por alguns instantes.
        var callbackActive=hasAuthCallback(),callbackFailure=authCallbackError();
        var expectedSession=callbackActive||localStorage.getItem('beAuthExpected')==='1'||Boolean(localStorage.getItem('beSessionUid'));
        if(expectedSession&&!callbackFailure){
          try{
            var recoveredUser=await recoverAuthenticatedUser(null);
            if(recoveredUser){await finishPublicLogin(recoveredUser);return;}
          }catch(recoveryError){console.warn('Não foi possível confirmar a sessão:',recoveryError);}
        }
        localStorage.removeItem('beSessionUid');
        localStorage.removeItem('beAuthExpected');
        sessionStorage.removeItem('beOAuthDestination');
        if(isProfileRoute()&&!callbackFailure){
          enterHome(true);window.dispatchEvent(new CustomEvent('be:open-profile-route'));hideSiteSkeleton();return;
        }
        if(isFansRoute()&&!callbackFailure){
          showFansRoute();hideSiteSkeleton();return;
        }
        if(isPasswordRecoveryRoute()){
          showPasswordRecovery('Este link expirou ou já foi utilizado. Solicite uma nova redefinição de senha.','error');
          return;
        }
        if(!callbackActive&&!callbackFailure&&window.BETVGuestAccess&&window.BETVGuestAccess.isActive()&&!isLoginRoute()){
          if(isDonateRoute())showDonateRoute();
          else if(isSupportRoute())showSupportRoute();
          else if(isBillieRoute())showBillieRoute();
          else if(isFansRoute())showFansRoute();
          else if(isAlbumsRoute())showAlbumsRoute();
          else if(isProfileRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-profile-route'));}
          else if(isVideoRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-video-route'));}
          else enterHome(true);
          hideSiteSkeleton();
          return;
        }
        showLogin();selectedAuthEmail='';setMode('email');
        if(callbackFailure)setStatus('O Discord não concluiu o login: '+decodeURIComponent(String(callbackFailure).replace(/\+/g,' ')),'error');
        else if(callbackActive)setStatus('O retorno do Discord chegou, mas a sessão não foi criada. Confira as URLs de redirecionamento do Supabase e do Discord.','error');
        hideSiteSkeleton();
        return;
      }
      try{
        showSiteSkeleton();
        await finishPublicLogin(user);
        if(window.__beContentReady)hideSiteSkeleton();
      }catch(error){hideSiteSkeleton();showLogin();setStatus(error&&error.code==='admin-only'?'A conta administrativa deve acessar #/admin.':friendly(error),'error');}
    });

    function handlePublicRoute(){
      if(location.hash.startsWith('#/admin'))return;
      if(isLegalRoute()){showLegalRoute();return;}
      if(!authReady)return;
      var guestActive=Boolean(window.BETVGuestAccess&&window.BETVGuestAccess.isActive());
      if(isPasswordRecoveryRoute()){if(auth.currentUser)showPasswordRecovery();else showPasswordRecovery('Este link expirou ou já foi utilizado. Solicite uma nova redefinição de senha.','error');return;}
      if(isProfileRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-profile-route'));return;}
      if(isNotificationsRoute()){if(auth.currentUser)showNotificationsRoute();else showLogin();return;}
      if(isDonateRoute()){if(auth.currentUser||guestActive)showDonateRoute();else showLogin();return;}
      if(isSupportRoute()){if(auth.currentUser||guestActive)showSupportRoute();else showLogin();return;}
      if(isBillieRoute()){if(auth.currentUser||guestActive)showBillieRoute();else showLogin();return;}
      if(isFansRoute()){showFansRoute();return;}
      if(isAlbumsRoute()){if(auth.currentUser||guestActive)showAlbumsRoute();else showLogin();return;}
      if(isLoginRoute()){if(auth.currentUser)enterHome();else showLogin();return;}
      if(isConfigRoute()){if(auth.currentUser)enterConfig();else showLogin();return;}
      if(isVideoRoute()){if(auth.currentUser||guestActive){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-video-route'));}else showLogin();return;}
      if(auth.currentUser||guestActive)enterHome(true);else showLogin();
    }
    window.addEventListener('hashchange',handlePublicRoute);
    window.addEventListener('popstate',handlePublicRoute);
    window.setInterval(function(){
      if(auth.currentUser&&document.visibilityState==='visible'&&navigator.onLine!==false)enforceAccountAccess(auth.currentUser);
    },60000);
  }

  async function startAuthentication(){
    try{if(!window.beBackend)throw new Error('O adaptador de autenticação não foi carregado.');await window.beBackend.ready;await boot();}catch(error){if(isLegalRoute()){showLegalRoute();hideSiteSkeleton();}else if(isFansRoute()){showFansRoute();hideSiteSkeleton();}else if(window.BETVGuestAccess&&window.BETVGuestAccess.isActive()&&!isLoginRoute()){hideSiteSkeleton();if(isDonateRoute())showDonateRoute();else if(isSupportRoute())showSupportRoute();else if(isAlbumsRoute())showAlbumsRoute();else if(isBillieRoute())showBillieRoute();else if(isProfileRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-profile-route'));}else if(isVideoRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-video-route'));}else enterHome(true);}else{hideSiteSkeleton();if(isProfileRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-profile-route'));}else{showLogin();setStatus('Não foi possível iniciar a autenticação. Detalhes: '+friendly(error),'error');}}console.error('Falha ao iniciar autenticação:',error);}
  }

  document.addEventListener('DOMContentLoaded',function(){initBackgrounds();setMode(isPasswordRecoveryRoute()?'recovery':'email');startAuthentication()});
})();

;

(function(){
  'use strict';
  if(String(location.hash||'').startsWith('#/admin')) return;

  var legalPage=document.getElementById('legalPage');
  var legalAvatarButton=document.getElementById('legalAvatarButton');
  var legalAvatarImage=document.getElementById('legalAvatarImage');
  var legalAvatarFallback=document.getElementById('legalAvatarFallback');
  var legalHomeButton=document.getElementById('legalHomeButton');
  var cookieNotice=document.getElementById('cookieNotice');
  var cookieAccept=document.getElementById('cookieAccept');
  var legalRoutes=['terms','privacy','cookies','dmca','comunidade'];

  // Mantém a área legal fora da estrutura da Home para que ela nunca seja
  // renderizada junto do catálogo, independentemente do restante do layout.
  if(legalPage&&legalPage.parentNode!==document.body){document.body.appendChild(legalPage);}

  function routeName(){
    var path='';
    try{path=decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/'))).replace(/\/+$/,'')||'/';}catch(_){path=String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';}
    var value=path.replace(/^\//,'').toLowerCase();
    if(value==='community'||value==='comunidad')value='comunidade';
    if(legalRoutes.indexOf(value)>=0)return value;
    value=String(location.hash||'').replace(/^#\/?/,'').split(/[?&]/)[0].toLowerCase();
    if(value==='community'||value==='comunidad')value='comunidade';
    return legalRoutes.indexOf(value)>=0?value:'';
  }
  function isSecure(){return location.protocol==='https:';}
  function cookieValue(name){
    var prefix=name+'=';
    var parts=String(document.cookie||'').split(';');
    for(var i=0;i<parts.length;i++){
      var item=parts[i].trim();
      if(item.indexOf(prefix)===0)return decodeURIComponent(item.slice(prefix.length));
    }
    return '';
  }
  function setCookie(name,value,maxAge){
    var cookie=name+'='+encodeURIComponent(value)+'; Path=/; Max-Age='+String(maxAge)+'; SameSite=Lax';
    if(isSecure())cookie+='; Secure';
    document.cookie=cookie;
  }
  function establishNecessaryStorage(){
    var prefs={necessary:true,locale:'pt-BR',version:1,updatedAt:new Date().toISOString()};
    setCookie('be_site_preferences',JSON.stringify(prefs),15552000);
    try{localStorage.setItem('beCookiePreferences',JSON.stringify(prefs));}catch(_){ }
  }
  function acknowledged(){
    if(cookieValue('be_cookie_ack')==='1')return true;
    try{return localStorage.getItem('beCookieAcknowledged')==='1';}catch(_){return false;}
  }
  function acceptCookies(){
    establishNecessaryStorage();
    setCookie('be_cookie_ack','1',15552000);
    try{localStorage.setItem('beCookieAcknowledged','1');}catch(_){ }
    if(cookieNotice)cookieNotice.hidden=true;
  }
  function isAuthenticatedHome(){
    var account=window.beBackend&&beBackend.auth?beBackend.auth.currentUser:null;
    if(!account)return false;
    var path='/' ;
    try{path=decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/'))).replace(/\/+$/,'')||'/';}catch(_){path=String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';}
    if(path!=='/'||location.hash)return false;
    return !document.body.classList.contains('login-mode')&&
      !document.body.classList.contains('profile-page-active')&&
      !document.body.classList.contains('settings-page-active')&&
      !document.body.classList.contains('support-page-active')&&
      !document.body.classList.contains('notification-page-active')&&
      !document.body.classList.contains('legal-page-active')&&
      !document.body.classList.contains('fans-page-active')&&
      !document.body.classList.contains('detail-page-active')&&
      !document.body.classList.contains('section-catalog-active');
  }
  function showCookieNotice(){
    if(!cookieNotice)return;
    if(acknowledged()||!isAuthenticatedHome()){cookieNotice.hidden=true;return;}
    establishNecessaryStorage();
    cookieNotice.hidden=false;
  }

  function syncLegalHomeButton(){
    if(!legalHomeButton)return;
    legalHomeButton.setAttribute('aria-label','Voltar para a página inicial');
    legalHomeButton.innerHTML='<svg class="legal-home-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3.5 10.8 12 3.7l8.5 7.1v8.4a1.8 1.8 0 0 1-1.8 1.8h-4.2v-6.2h-5V21H5.3a1.8 1.8 0 0 1-1.8-1.8Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function syncLegalAvatar(){
    if(!legalAvatarButton||!legalAvatarImage||!legalAvatarFallback)return;
    var loggedUser=window.beBackend&&beBackend.auth?beBackend.auth.currentUser:null;
    if(!loggedUser){
      legalAvatarButton.classList.add('is-login');
      legalAvatarButton.setAttribute('aria-label','Entrar na plataforma');
      legalAvatarImage.hidden=true;
      legalAvatarImage.removeAttribute('src');
      legalAvatarFallback.textContent='Entrar';
      legalAvatarFallback.hidden=false;
      return;
    }
    legalAvatarButton.classList.remove('is-login');
    legalAvatarButton.setAttribute('aria-label','Abrir perfil');
    var source=document.getElementById('publicUserPhoto');
    var name=document.getElementById('ddUsername');
    var src=source&&!source.hidden?String(source.getAttribute('src')||''):'';
    if(src){
      legalAvatarImage.src=window.beMediaUrl?window.beMediaUrl(src):src;
      legalAvatarImage.hidden=false;
      legalAvatarFallback.hidden=true;
    }else{
      legalAvatarImage.hidden=true;
      legalAvatarImage.removeAttribute('src');
      var label=name?String(name.textContent||'').replace(/^@/,'').trim():(loggedUser.displayName||loggedUser.email||'');
      legalAvatarFallback.textContent=(label.charAt(0)||'M').toUpperCase();
      legalAvatarFallback.hidden=false;
    }
  }
  function renderLegalRoute(){
    var route=routeName();
    if(!route){
      document.body.classList.remove('legal-page-active');
      if(legalPage){legalPage.hidden=true;legalPage.setAttribute('aria-hidden','true');}
      return false;
    }
    if(legalPage){legalPage.hidden=false;legalPage.setAttribute('aria-hidden','false');}
    document.body.classList.remove('login-mode','profile-page-active','settings-page-active','detail-page-active');
    document.body.classList.add('legal-page-active');
    document.querySelectorAll('#legalPage [data-legal-page]').forEach(function(article){
      var active=article.getAttribute('data-legal-page')===route;
      article.hidden=!active;
      article.setAttribute('aria-hidden',active?'false':'true');
    });
    document.querySelectorAll('#legalPage [data-legal-link]').forEach(function(link){
      var active=link.getAttribute('data-legal-link')===route;
      link.classList.toggle('active',active);
      if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    syncLegalHomeButton();
    syncLegalAvatar();
    if(window.BETVI18n&&window.BETVI18n.ready){
      window.BETVI18n.ready.then(function(){if(legalPage)window.BETVI18n.apply(legalPage);}).catch(function(){});
    }else if(window.BETVI18n&&typeof window.BETVI18n.apply==='function'&&legalPage){
      window.BETVI18n.apply(legalPage);
    }
    document.title='Billie Eilish TV';
    window.scrollTo(0,0);
    return true;
  }
  function goHome(){
    history.pushState({beRoute:'home'},'','/'+(location.search||''));
    document.body.classList.remove('legal-page-active');
    if(legalPage)legalPage.hidden=true;
    document.title='Billie Eilish TV';
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0,0);
  }
  function openProfile(){
    var loggedUser=window.beBackend&&beBackend.auth?beBackend.auth.currentUser:null;
    goHome();
    window.setTimeout(function(){
      if(!loggedUser){window.BETVPublicRoutes.go('/login');return;}
      var button=document.querySelector('[data-public-action="profile"]');
      if(button)button.click();
      else window.BETVPublicRoutes.go('/login');
    },50);
  }

  if(legalPage)legalPage.addEventListener('click',function(event){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    var link=event.target&&event.target.closest?event.target.closest('[data-legal-link]'):null;
    if(!link||!legalPage.contains(link)||link.hasAttribute('download')||String(link.getAttribute('target')||'').toLowerCase()==='_blank')return;
    var route=String(link.getAttribute('data-legal-link')||'').toLowerCase();
    if(legalRoutes.indexOf(route)<0)return;
    event.preventDefault();
    if(routeName()===route){renderLegalRoute();return;}
    if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function'){
      window.BETVPublicRoutes.go('/'+route);
      return;
    }
    var target=window.BETVLocaleURL?window.BETVLocaleURL('/'+route):'/'+route;
    history.pushState({beRoute:'legal',legalRoute:route},'',target);
    renderLegalRoute();
  });

  if(legalHomeButton)legalHomeButton.addEventListener('click',goHome);
  if(legalAvatarButton)legalAvatarButton.addEventListener('click',openProfile);
  if(cookieAccept)cookieAccept.addEventListener('click',acceptCookies);
  window.addEventListener('hashchange',renderLegalRoute);
  window.addEventListener('popstate',renderLegalRoute);
  window.addEventListener('be:open-legal-route',renderLegalRoute);
  window.addEventListener('be:profile-avatar-changed',syncLegalAvatar);
  if(window.beBackend&&beBackend.ready){beBackend.ready.then(function(){if(beBackend.auth&&beBackend.auth.onChange)beBackend.auth.onChange(function(){syncLegalAvatar();window.setTimeout(showCookieNotice,80);});syncLegalAvatar();window.setTimeout(showCookieNotice,80);}).catch(function(){syncLegalAvatar();showCookieNotice();});}
  window.addEventListener('be:i18n-ready',function(){renderLegalRoute();showCookieNotice();});
  window.addEventListener('be:home-entered',function(){window.setTimeout(showCookieNotice,80);});
  window.addEventListener('be:open-config',showCookieNotice);
  window.addEventListener('be:open-profile-route',showCookieNotice);
  window.addEventListener('be:open-support',showCookieNotice);
  window.addEventListener('be:open-notifications',showCookieNotice);
  window.addEventListener('hashchange',showCookieNotice);
  window.addEventListener('popstate',function(){window.setTimeout(showCookieNotice,50);});
  document.addEventListener('DOMContentLoaded',function(){renderLegalRoute();showCookieNotice();});
  if(document.readyState!=='loading'){renderLegalRoute();showCookieNotice();}
})();


/* Navegação de segurança dos três pontos do perfil, válida no mobile e desktop. */
;(function(){
  'use strict';
  function openProfileSettings(event){
    var button=event.target&&event.target.closest?event.target.closest('#profilePageMore'):null;
    if(!button)return;
    event.preventDefault();
    event.stopPropagation();
    var account=window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;
    if(!account){
      window.BETVPublicRoutes.go('/login');
      document.body.classList.add('login-mode');
      return;
    }
    var target='/config'+(location.search||'');
    try{history.pushState({beRoute:'config'},'',target);}catch(_){location.assign(window.BETVLocaleURL?window.BETVLocaleURL('/config'):'/config');}
    window.dispatchEvent(new CustomEvent('be:open-config'));
    window.setTimeout(function(){
      if(!document.body.classList.contains('settings-page-active'))location.assign(window.BETVLocaleURL?window.BETVLocaleURL(target):target);
    },220);
  }
  document.addEventListener('click',openProfileSettings,true);
  document.addEventListener('touchend',function(event){
    var button=event.target&&event.target.closest?event.target.closest('#profilePageMore'):null;
    if(!button)return;
    openProfileSettings(event);
  },{capture:true,passive:false});
})();

;/* module boundary */
(function(){
  'use strict';

  var page=document.getElementById('supportPage');
  var input=document.getElementById('supportSearchInput');
  var clearButton=document.getElementById('supportSearchClear');
  var status=document.getElementById('supportSearchStatus');
  var noResults=document.getElementById('supportNoResults');
  var faqList=document.getElementById('supportFaqList');
  var faqSection=faqList?faqList.closest('.support-faq'):null;
  var supportButton=document.querySelector('.home-nav-link[data-public-action="support"]');
  var logoButton=document.getElementById('logoBtn');
  var leading=document.getElementById('homeNavLeading');
  if(!page||!input||!faqList)return;

  var faqItems=Array.prototype.slice.call(faqList.querySelectorAll('.support-faq-item'));

  function normalize(value){
    return String(value||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .trim();
  }

  function cleanPath(){
    try{return decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/'))).replace(/\/+$/,'')||'/';}
    catch(_){return String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';}
  }

  function hasLegacySupportUrl(){
    var path=cleanPath().toLowerCase();
    var hash=String(location.hash||'').toLowerCase();
    return hash==='#suporte'||hash==='#/suporte'||hash==='#support'||hash==='#/support';
  }

  function isSupportRoute(){
    var state=history.state||{};
    return cleanPath().toLowerCase()==='/suporte'||hasLegacySupportUrl()||(state.beRoute==='support'&&!location.hash);
  }

  function publicUrlWithoutSupportRoute(){
    var path=cleanPath();
    if(path.toLowerCase()==='/suporte')path='/';
    return path+(location.search||'');
  }

  function positionIndicator(button){
    if(!leading||!button)return;
    window.requestAnimationFrame(function(){
      var leadingRect=leading.getBoundingClientRect();
      var buttonRect=button.getBoundingClientRect();
      if(!buttonRect.width||!buttonRect.height)return;
      leading.style.setProperty('--home-tab-x',Math.max(0,buttonRect.left-leadingRect.left)+'px');
      leading.style.setProperty('--home-tab-y',Math.max(0,buttonRect.top-leadingRect.top)+'px');
      leading.style.setProperty('--home-tab-width',buttonRect.width+'px');
      leading.style.setProperty('--home-tab-height',buttonRect.height+'px');
    });
  }

  function setSupportTab(active){
    var tabs=[logoButton].concat(Array.prototype.slice.call(document.querySelectorAll('.home-nav-link')));
    tabs.forEach(function(button){
      if(!button)return;
      var selected=active?button===supportButton:button===logoButton;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-pressed',String(selected));
      if(button===logoButton){
        if(selected)button.setAttribute('aria-current','page');
        else button.removeAttribute('aria-current');
      }
    });
    positionIndicator(active?supportButton:logoButton);
  }

  function setSupportRoute(replace){
    var currentState=history.state||{};
    var nextState=Object.assign({},currentState,{beRoute:'support'});
    var target='/suporte'+(location.search||'');
    if(replace)history.replaceState(nextState,'',target);
    else history.pushState(nextState,'',target);
  }

  function closeSearchBeforeSupport(){
    var topbar=document.getElementById('topbar');
    var desktopToggle=document.getElementById('homeSearchToggle');
    var mobileToggle=document.getElementById('mobileSearchButton');
    if(topbar)topbar.classList.remove('search-open');
    document.body.classList.remove('mobile-search-open');
    if(desktopToggle){
      desktopToggle.setAttribute('aria-expanded','false');
      desktopToggle.setAttribute('aria-label','Abrir pesquisa');
    }
    if(mobileToggle){
      mobileToggle.setAttribute('aria-expanded','false');
      mobileToggle.setAttribute('aria-label','Abrir pesquisa');
    }
  }

  function openSupport(updateRoute){
    closeSearchBeforeSupport();
    if(updateRoute!==false){
      if(!isSupportRoute())setSupportRoute(false);
      else if(hasLegacySupportUrl())setSupportRoute(true);
    }else if(hasLegacySupportUrl()){
      setSupportRoute(true);
    }
    document.body.classList.remove('login-mode','profile-page-active','settings-page-active','legal-page-active','detail-page-active','notification-page-active');
    window.dispatchEvent(new CustomEvent('be:close-notifications'));
    document.body.classList.add('support-page-active');
    page.hidden=false;
    page.setAttribute('aria-hidden','false');
    var dropdown=document.getElementById('userDropdown');
    var chip=document.getElementById('userChip');
    if(dropdown)dropdown.classList.remove('open');
    if(chip)chip.setAttribute('aria-expanded','false');
    setSupportTab(true);
    document.title='Billie Eilish TV';
    window.scrollTo(0,0);
    if(updateRoute!==false){
      window.requestAnimationFrame(function(){
        if(!isSupportRoute()||hasLegacySupportUrl())setSupportRoute(true);
      });
    }
  }

  function closeSupport(updateRoute,resetTab){
    document.body.classList.remove('support-page-active');
    page.hidden=true;
    page.setAttribute('aria-hidden','true');
    if(updateRoute!==false&&isSupportRoute()){
      var currentState=history.state||{};
      var nextState=Object.assign({},currentState,{beRoute:'home'});
      history.pushState(nextState,'',publicUrlWithoutSupportRoute());
    }
    if(resetTab!==false)setSupportTab(false);
    document.title='Billie Eilish TV';
  }

  function filterFaq(){
    var query=normalize(input.value);
    var visible=0;
    faqItems.forEach(function(item){
      var searchOnly=item.getAttribute('data-search-only')==='true';
      var match=query?normalize(item.textContent).indexOf(query)!==-1:!searchOnly;
      item.hidden=!match;
      if(!match)item.open=false;
      if(match)visible+=1;
    });
    var empty=Boolean(query)&&visible===0;
    if(clearButton)clearButton.hidden=!input.value;
    if(noResults)noResults.hidden=!empty;
    if(faqSection)faqSection.hidden=empty;
    page.classList.toggle('support-filter-empty',empty);
    if(status){
      status.textContent=empty
        ? 'Nenhuma pergunta frequente encontrada. Use a área para relatar o problema.'
        : visible+' '+(visible===1?'pergunta frequente encontrada.':'perguntas frequentes encontradas.');
    }
  }

  faqItems.forEach(function(item){
    item.addEventListener('toggle',function(){
      if(!item.open)return;
      faqItems.forEach(function(other){if(other!==item)other.open=false;});
    });
  });

  input.addEventListener('input',filterFaq);
  input.addEventListener('keydown',function(event){
    if(event.key==='Escape'&&input.value){
      event.preventDefault();
      input.value='';
      filterFaq();
    }
  });
  if(clearButton)clearButton.addEventListener('click',function(){
    input.value='';
    filterFaq();
    input.focus({preventScroll:true});
  });

  document.addEventListener('click',function(event){
    var target=event.target&&event.target.closest?event.target.closest('[data-public-action="support"],[data-mobile-destination="support"],a[href="/suporte"],a[href="#suporte"],a[href="#/suporte"],.home-nav-link[data-home-view],#logoBtn,[data-public-action="profile"],[data-public-action="settings"],[data-public-action="auth"]'):null;
    if(!target)return;
    if(target.matches('[data-public-action="support"],[data-mobile-destination="support"],a[href="/suporte"],a[href="#suporte"],a[href="#/suporte"]')){
      event.preventDefault();
      var shouldFocusContact=target.matches('[data-support-target="contact"]');
      openSupport(true);
      if(shouldFocusContact){
        window.requestAnimationFrame(function(){
          window.requestAnimationFrame(function(){
            positionIndicator(supportButton);
            var contact=page.querySelector('.support-contact');
            if(contact)contact.scrollIntoView({behavior:'smooth',block:'center'});
          });
        });
      }
      return;
    }
    if(document.body.classList.contains('support-page-active')){
      var homeDestination=target.matches('.home-nav-link[data-home-view],#logoBtn');
      closeSupport(homeDestination,!homeDestination);
    }
  },true);

  window.addEventListener('be:open-support',function(){openSupport(true);});
  window.addEventListener('be:close-support',function(){closeSupport(false,true);});
  window.addEventListener('be:open-config',function(){closeSupport(false,false);});
  window.addEventListener('be:open-profile-route',function(){closeSupport(false,false);});
  window.addEventListener('hashchange',function(){
    if(isSupportRoute())openSupport(false);
    else if(document.body.classList.contains('support-page-active'))closeSupport(false,true);
  });
  window.addEventListener('popstate',function(){
    if(isSupportRoute())openSupport(false);
    else if(document.body.classList.contains('support-page-active'))closeSupport(false,true);
  });
  window.addEventListener('resize',function(){
    if(document.body.classList.contains('support-page-active'))positionIndicator(supportButton);
  },{passive:true});
  window.addEventListener('load',function(){
    window.setTimeout(function(){
      if(isSupportRoute()||document.body.classList.contains('support-page-active'))setSupportTab(true);
    },0);
  });
  window.addEventListener('be:content-ready',function(){
    if(isSupportRoute()||document.body.classList.contains('support-page-active'))setSupportTab(true);
  });

  filterFaq();
  if(isSupportRoute())openSupport(false);
})();

;/* module boundary */
(function(){
  'use strict';

  if(String(location.hash||'').startsWith('#/admin'))return;

  var page=document.getElementById('notificationPage');
  var pageNav=document.getElementById('notificationPageNav');
  var pageContent=document.getElementById('notificationPageContent');
  var pageHome=document.getElementById('notificationPageHome');
  var pageAvatar=document.getElementById('notificationPageAvatar');
  var pageAvatarImage=document.getElementById('notificationPageAvatarImage');
  var pageAvatarFallback=document.getElementById('notificationPageAvatarFallback');
  var pageClose=document.getElementById('notificationPageClose');
  var desktopButton=document.getElementById('notificationButton');
  var desktopDropdown=document.getElementById('notificationDropdown');
  var desktopList=document.getElementById('notificationPreviewList');
  var desktopViewAll=document.getElementById('notificationViewAll');
  var desktopDot=document.getElementById('notificationUnreadDot');
  var desktopMarkAll=document.getElementById('notificationMarkAll');
  var desktopClose=document.getElementById('notificationDropdownClose');
  var mobilePopover=document.getElementById('mobileNotificationPopover');
  var mobileList=document.getElementById('mobileNotificationPreviewList');
  var mobileViewAll=document.getElementById('mobileNotificationViewAll');
  var mobileClose=document.getElementById('mobileNotificationClose');
  var mobileDot=document.getElementById('mobileNotificationUnreadDot');
  var mobileMarkAll=document.getElementById('mobileNotificationMarkAll');
  var notifications=[];
  var loaded=false;
  var loadingPromise=null;
  var selectedId='';
  var STORAGE_KEY='beNotificationsLastSeen';
  var READ_STATE_KEY='beNotificationsReadStateV2';

  if(!page||!pageNav||!pageContent)return;

  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];
    });
  }

  function cleanPath(){
    try{return decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/'))).replace(/\/+$/,'')||'/';}
    catch(_){return String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';}
  }

  function routeInfo(){
    var path=cleanPath();
    var pathMatch=path.match(/^\/(?:atualizacoes|notificacoes)(?:\/([^/]+))?$/i);
    var raw=String(location.hash||'').replace(/^#\/?/,'');
    var parts=raw.split('/').filter(Boolean);
    var name=String(parts[0]||'').toLowerCase();
    var aliases=['atualizacoes','atualizações','notificacoes','notificações','updates','notifications'];
    var legacy=aliases.indexOf(name)!==-1;
    return {
      active:Boolean(pathMatch)||legacy,
      id:pathMatch?decodeURIComponent(pathMatch[1]||''):decodeURIComponent(parts[1]||''),
      legacy:legacy
    };
  }

  function dateValue(item){
    var raw=item&&item.updatedAt||item&&item.createdAt||'';
    var date=raw instanceof Date?raw:new Date(raw);
    return Number.isNaN(date.getTime())?null:date;
  }

  function i18nText(source,variables){
    if(window.BETVI18n&&typeof window.BETVI18n.t==='function')return window.BETVI18n.t(source,variables||{});
    return String(source||'').replace(/\{([a-zA-Z0-9_]+)\}/g,function(_,key){
      return variables&&Object.prototype.hasOwnProperty.call(variables,key)?String(variables[key]):_;
    });
  }

  function notificationDateLocale(){
    return String(
      window.BETVI18n&&window.BETVI18n.locale||
      window.BETVLocale&&window.BETVLocale.locale||
      'pt-BR'
    );
  }

  function formatDate(item){
    var date=dateValue(item);
    if(!date)return i18nText('Atualizado agora');
    var formatted=date.toLocaleDateString(notificationDateLocale(),{day:'2-digit',month:'long',year:'numeric'});
    return i18nText('Atualizado em {date}',{date:formatted});
  }

  function formatShortDate(item){
    var date=dateValue(item);
    if(!date)return i18nText('agora');
    return date.toLocaleDateString(notificationDateLocale(),{day:'2-digit',month:'short',year:'numeric'}).replace('.','');
  }

  function compareNewest(a,b){
    var ad=dateValue(a),bd=dateValue(b);
    return (bd?bd.getTime():0)-(ad?ad.getTime():0);
  }

  function trimText(value,max){
    var text=String(value||'').replace(/\s+/g,' ').trim();
    return text.length>max?text.slice(0,max-1).trim()+'…':text;
  }

  function safeNotificationImageUrl(value){
    var raw=String(value||'').trim().replace(/^<|>$/g,'');
    if(!raw||/[\u0000-\u001f\u007f]/.test(raw))return '';
    try{
      var parsed=new URL(raw,location.origin);
      if(parsed.protocol!=='https:'&&parsed.protocol!=='http:')return '';
      if(parsed.username||parsed.password)return '';
      return parsed.href;
    }catch(_){return '';}
  }

  function replaceNotificationImageMarkdown(value,onImage){
    // Exclusivo das notificações. Aceita:
    // [](https://site/imagem.png) e ![](https://site/imagem.png)
    // Também aceita a forma tradicional ![descrição](https://site/imagem.png).
    var pattern=/(?:!\[([^\]\r\n]*)\]|\[\s*\])\(\s*(?:<([^>\r\n]+)>|([^\s)\r\n]+))\s*(?:["']([^"'\r\n]*)["'])?\s*\)/g;
    return String(value||'').replace(pattern,function(match,alt,angleUrl,plainUrl){
      var safeUrl=safeNotificationImageUrl(angleUrl||plainUrl||'');
      if(!safeUrl)return match;
      return onImage(safeUrl,String(alt||'').trim());
    });
  }

  function notificationImageProxyUrl(value){
    if(!window.beMediaUrl)return '';
    var proxy=window.beMediaUrl(value);
    return proxy&&proxy!=='#'&&proxy!==value?proxy:'';
  }

  function linkifyNotificationHtml(html){
    if(!html||!document.createElement)return html;
    var template=document.createElement('template');
    template.innerHTML=String(html);
    var walker=document.createTreeWalker(template.content,NodeFilter.SHOW_TEXT);
    var nodes=[];
    var node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(function(textNode){
      var parent=textNode.parentElement;
      if(!parent||parent.closest('a,code,pre'))return;
      var text=String(textNode.nodeValue||'');
      var pattern=/https?:\/\/[^\s<>"']+/gi;
      var match;
      var lastIndex=0;
      var fragment=null;
      while((match=pattern.exec(text))){
        var raw=match[0];
        var trailing='';
        while(/[.,!?;:]$/.test(raw)){
          trailing=raw.slice(-1)+trailing;
          raw=raw.slice(0,-1);
        }
        while(/\)$/.test(raw)){
          var opens=(raw.match(/\(/g)||[]).length;
          var closes=(raw.match(/\)/g)||[]).length;
          if(closes<=opens)break;
          trailing=')'+trailing;
          raw=raw.slice(0,-1);
        }
        var safeUrl=safeNotificationImageUrl(raw);
        if(!safeUrl)continue;
        if(!fragment)fragment=document.createDocumentFragment();
        fragment.append(document.createTextNode(text.slice(lastIndex,match.index)));
        var link=document.createElement('a');
        link.className='notification-inline-link';
        link.href=safeUrl;
        link.target='_blank';
        link.rel='noopener noreferrer';
        link.textContent=raw;
        fragment.append(link);
        if(trailing)fragment.append(document.createTextNode(trailing));
        lastIndex=match.index+match[0].length;
      }
      if(!fragment)return;
      fragment.append(document.createTextNode(text.slice(lastIndex)));
      textNode.replaceWith(fragment);
    });
    return template.innerHTML;
  }

  function renderNotificationMarkdown(value){
    var images=[];
    var source=replaceNotificationImageMarkdown(value,function(safeUrl,alt){
      var token='BETVNOTIFICATIONIMAGE'+images.length+'TOKEN';
      var fallbackUrl=notificationImageProxyUrl(safeUrl);
      images.push('<a class="notification-markdown-image" href="'+esc(safeUrl)+'" target="_blank" rel="noopener noreferrer" aria-label="Abrir imagem em tamanho completo">'+
        '<img loading="lazy" decoding="async" src="'+esc(safeUrl)+'"'+(fallbackUrl?' data-notification-fallback-src="'+esc(fallbackUrl)+'"':'')+' alt="'+esc(alt||'Imagem da notificação')+'">'+
      '</a>');
      return token;
    });
    var html=window.beRenderMarkdown?window.beRenderMarkdown(source):esc(source).replace(/\r?\n/g,'<br>');
    html=html.replace(/BETVNOTIFICATIONIMAGE(\d+)TOKEN/g,function(_,index){return images[Number(index)]||'';});
    return linkifyNotificationHtml(html);
  }

  function bindNotificationImages(root){
    if(!root)return;
    root.querySelectorAll('img[data-notification-fallback-src]').forEach(function(image){
      image.addEventListener('error',function useProxyFallback(){
        var fallback=image.getAttribute('data-notification-fallback-src')||'';
        image.removeAttribute('data-notification-fallback-src');
        if(fallback&&image.src!==fallback)image.src=fallback;
      },{once:true});
    });
  }

  function notificationPlainText(value){
    var source=replaceNotificationImageMarkdown(value,function(){return ' ';});
    return window.beMarkdownPlainText?window.beMarkdownPlainText(source):source.replace(/\s+/g,' ').trim();
  }

  function getMobileButton(){return document.getElementById('mobileNotificationButton');}

  function closeDesktop(){
    if(desktopDropdown)desktopDropdown.classList.remove('open');
    if(desktopButton)desktopButton.setAttribute('aria-expanded','false');
  }

  function closeMobile(){
    if(mobilePopover)mobilePopover.hidden=true;
    var button=getMobileButton();
    if(button)button.setAttribute('aria-expanded','false');
  }

  function closeMenus(){closeDesktop();closeMobile();}

  function syncPageAvatar(){
    if(!pageAvatar||!pageAvatarImage||!pageAvatarFallback)return;
    var account=window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;
    var source=document.getElementById('publicUserPhoto');
    var src=source&&!source.hidden?String(source.getAttribute('src')||''):'';
    if(account){
      if(window.BETVApplyAvatar)window.BETVApplyAvatar(pageAvatarImage,src);else{pageAvatarImage.src=src||window.BETV_DEFAULT_AVATAR;pageAvatarImage.hidden=false;}
      pageAvatarFallback.hidden=true;
      pageAvatar.setAttribute('aria-label','Abrir perfil');
      return;
    }
    if(window.BETVApplyAvatar)window.BETVApplyAvatar(pageAvatarImage,'');
    pageAvatarFallback.hidden=true;
    pageAvatar.setAttribute('aria-label','Entrar na plataforma');
  }

  function openProfileFromPage(){
    var account=window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;
    closePage(true);
    window.setTimeout(function(){
      if(!account){
        window.BETVPublicRoutes.go('/login');
        document.body.classList.add('login-mode');
        return;
      }
      var profileButton=document.querySelector('[data-public-action="profile"]');
      if(profileButton)profileButton.click();
      else window.dispatchEvent(new CustomEvent('be:open-profile-route'));
    },50);
  }

  function readState(){
    try{
      var parsed=JSON.parse(localStorage.getItem(READ_STATE_KEY)||'{}');
      return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};
    }catch(_){return {};}
  }

  function itemTimestamp(item){
    var date=dateValue(item);
    return date?date.getTime():0;
  }

  function isNotificationRead(item){
    if(!item)return true;
    var id=String(item.id||'');
    var timestamp=itemTimestamp(item);
    var state=readState();
    var itemSeen=id?Number(state[id]||0):0;
    if(itemSeen&&(timestamp?itemSeen>=timestamp:true))return true;
    var legacySeen=Number(localStorage.getItem(STORAGE_KEY)||0);
    return Boolean(legacySeen&&timestamp&&timestamp<=legacySeen);
  }

  function unreadNotifications(){
    return notifications.filter(function(item){return !isNotificationRead(item);});
  }

  function notifyReadStateChanged(){
    window.dispatchEvent(new CustomEvent('be:notification-read-state-changed'));
  }

  function markNotificationRead(id){
    id=String(id||'');
    if(!id)return;
    var item=notifications.find(function(entry){return String(entry.id||'')===id;});
    if(!item)return;
    var state=readState();
    var timestamp=itemTimestamp(item)||Date.now();
    if(Number(state[id]||0)>=timestamp)return;
    state[id]=timestamp;
    try{localStorage.setItem(READ_STATE_KEY,JSON.stringify(state));}catch(_){ }
    renderPreviews();
    notifyReadStateChanged();
  }

  function setUnreadState(){
    var currentMobileDot=document.getElementById('mobileNotificationUnreadDot')||mobileDot;
    var unread=unreadNotifications().length>0;
    if(desktopDot)desktopDot.hidden=!unread;
    if(currentMobileDot)currentMobileDot.hidden=!unread;
  }

  function markAllRead(){
    var state=readState();
    notifications.forEach(function(item){
      var id=String(item&&item.id||'');
      if(!id)return;
      state[id]=itemTimestamp(item)||Date.now();
    });
    try{localStorage.setItem(READ_STATE_KEY,JSON.stringify(state));}catch(_){ }
    var latest=notifications.length&&dateValue(notifications[0]);
    try{localStorage.setItem(STORAGE_KEY,String(latest?latest.getTime():Date.now()));}catch(_){ }
    renderPreviews();
    notifyReadStateChanged();
  }

  function previewMarkup(items){
    if(!items.length)return '<div class="notification-preview-empty"><strong>Nenhuma atualização</strong></div>';
    return items.slice(0,3).map(function(item){
      return '<button class="notification-preview-item" type="button" data-notification-id="'+esc(item.id)+'">'+
        '<span class="notification-preview-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A8.5 8.5 0 0 0 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.7v4.7l3.2 1.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+
        '<span class="notification-preview-copy"><strong>'+esc(item.title||'Atualização')+'</strong><span>'+esc(trimText(notificationPlainText(item.description),100)||'Confira esta atualização.')+'</span></span>'+
        '<span class="notification-preview-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+
      '</button>';
    }).join('');
  }

  function bindPreviewItems(root){
    if(!root)return;
    root.querySelectorAll('[data-notification-id]').forEach(function(button){
      button.addEventListener('click',function(){openPage(button.dataset.notificationId,true);});
    });
  }

  function renderPreviews(){
    var html=previewMarkup(unreadNotifications());
    if(desktopList){desktopList.innerHTML=html;bindPreviewItems(desktopList);}
    if(mobileList){mobileList.innerHTML=html;bindPreviewItems(mobileList);}
    setUnreadState();
  }

  function renderPage(id){
    if(!notifications.length){
      pageNav.innerHTML='<div class="notification-page-empty"><strong>Nenhuma atualização</strong></div>';
      pageContent.innerHTML='<div class="notification-page-empty"><strong>Nenhuma atualização</strong></div>';
      return null;
    }
    var active=notifications.find(function(item){return String(item.id)===String(id);})||notifications[0];
    selectedId=String(active.id||'');
    pageNav.innerHTML=notifications.map(function(item){
      var selected=String(item.id)===selectedId;
      return '<button class="notification-page-link '+(selected?'active':'')+'" type="button" data-notification-page-id="'+esc(item.id)+'" aria-current="'+(selected?'page':'false')+'">'+
        '<strong>'+esc(item.title||'Atualização')+'</strong>'+
        '<span>'+esc(trimText(notificationPlainText(item.description),92)||'Confira esta atualização.')+'</span>'+
      '</button>';
    }).join('');
    pageNav.querySelectorAll('[data-notification-page-id]').forEach(function(button){
      button.addEventListener('click',function(){openPage(button.dataset.notificationPageId,true);});
    });
    pageContent.innerHTML='<article class="notification-article">'+
      '<h1>'+esc(active.title||'Atualização')+'</h1>'+
      '<p class="notification-article-date" data-i18n-ignore>'+esc(formatDate(active))+'</p>'+
      '<div class="notification-article-body be-markdown">'+renderNotificationMarkdown(active.description||'')+'</div>'+
    '</article>';
    bindNotificationImages(pageContent);
    return active;
  }

  async function loadNotifications(force){
    if(loadingPromise&&!force)return loadingPromise;
    if(loaded&&!force)return notifications;
    loadingPromise=(async function(){
      try{
        if(!window.beBackend)throw new Error('Backend indisponível.');
        await window.beBackend.ready;
        var items=await window.beBackend.data.list('notifications',{orderBy:'createdAt',direction:'desc'});
        notifications=(Array.isArray(items)?items:[]).filter(function(item){return item&&item.active!==false&&String(item.title||'').trim();}).sort(compareNewest);
        loaded=true;
        renderPreviews();
        if(document.body.classList.contains('notification-page-active'))renderPage(selectedId||routeInfo().id);
        window.dispatchEvent(new CustomEvent('be:notifications-ready',{detail:{count:notifications.length}}));
      }catch(error){
        console.warn('Não foi possível carregar as notificações:',error);
        notifications=[];
        loaded=true;
        renderPreviews();
        if(document.body.classList.contains('notification-page-active'))renderPage('');
      }finally{loadingPromise=null;}
      return notifications;
    })();
    return loadingPromise;
  }

  function setNotificationRoute(id,replace){
    var url=new URL(location.href);
    url.pathname='/atualizacoes'+(id?'/'+encodeURIComponent(id):'');
    url.hash='';
    var target=url.pathname+(url.search||'');
    if(replace)history.replaceState({beRoute:'notifications',id:id||''},'',target);
    else history.pushState({beRoute:'notifications',id:id||''},'',target);
  }

  async function openPage(id,updateRoute){
    closeMenus();
    document.body.classList.remove('login-mode','profile-page-active','settings-page-active','legal-page-active','support-page-active','detail-page-active');
    document.body.classList.add('notification-page-active');
    page.hidden=false;
    page.setAttribute('aria-hidden','false');
    selectedId=String(id||'');
    document.title='Billie Eilish TV';
    syncPageAvatar();
    if(updateRoute!==false)setNotificationRoute(selectedId,false);else if(routeInfo().legacy)setNotificationRoute(selectedId,true);
    window.dispatchEvent(new CustomEvent('be:close-support'));
    await loadNotifications(false);
    var active=renderPage(selectedId);
    if(active)markNotificationRead(active.id);
    window.scrollTo(0,0);
  }

  function closePage(updateRoute){
    document.body.classList.remove('notification-page-active');
    page.hidden=true;
    page.setAttribute('aria-hidden','true');
    selectedId='';
    if(updateRoute!==false&&routeInfo().active){
      var url=new URL(location.href);
      url.pathname='/';
      url.hash='';
      history.pushState({beRoute:'home'},'',url.pathname+(url.search||''));
    }
    document.title='Billie Eilish TV';
  }

  function closeAccountMenu(){
    var userDropdown=document.getElementById('userDropdown');
    var userChip=document.getElementById('userChip');
    if(userDropdown)userDropdown.classList.remove('open');
    if(userChip)userChip.setAttribute('aria-expanded','false');
  }

  function toggleDesktop(event){
    if(event)event.stopPropagation();
    if(!desktopDropdown||!desktopButton)return;
    var open=!desktopDropdown.classList.contains('open');
    if(open){
      window.dispatchEvent(new CustomEvent('be:close-public-search'));
      window.dispatchEvent(new CustomEvent('be:close-mobile-search'));
    }
    closeMobile();
    closeAccountMenu();
    desktopDropdown.classList.toggle('open',open);
    desktopButton.setAttribute('aria-expanded',String(open));
    if(open){loadNotifications(false);}
  }

  function toggleMobile(event){
    if(event)event.stopPropagation();
    if(!mobilePopover)return;
    var open=mobilePopover.hidden;
    if(open){
      window.dispatchEvent(new CustomEvent('be:close-public-search'));
      window.dispatchEvent(new CustomEvent('be:close-mobile-search'));
    }
    closeDesktop();
    closeAccountMenu();
    mobilePopover.hidden=!open;
    var button=getMobileButton();
    if(button)button.setAttribute('aria-expanded',String(open));
    if(open){loadNotifications(false);}
  }

  if(desktopDropdown)desktopDropdown.addEventListener('click',function(event){event.stopPropagation();});
  if(desktopMarkAll)desktopMarkAll.addEventListener('click',function(event){event.stopPropagation();markAllRead();});
  if(desktopClose)desktopClose.addEventListener('click',function(event){event.stopPropagation();closeDesktop();});
  if(mobileMarkAll)mobileMarkAll.addEventListener('click',function(event){event.stopPropagation();markAllRead();});
  if(desktopViewAll)desktopViewAll.addEventListener('click',function(){openPage('',true);});
  if(mobilePopover)mobilePopover.addEventListener('click',function(event){event.stopPropagation();});
  if(mobileViewAll)mobileViewAll.addEventListener('click',function(){openPage('',true);});
  if(mobileClose)mobileClose.addEventListener('click',closeMobile);
  if(pageHome)pageHome.addEventListener('click',function(){closePage(true);});
  if(pageAvatar)pageAvatar.addEventListener('click',openProfileFromPage);
  if(pageClose)pageClose.addEventListener('click',function(){closePage(true);});

  document.addEventListener('click',function(event){
    var desktopTrigger=event.target&&event.target.closest?event.target.closest('#notificationButton'):null;
    if(!desktopTrigger)return;
    event.preventDefault();
    event.stopPropagation();
    toggleDesktop(event);
  },true);

  document.addEventListener('click',function(event){
    var mobileButton=getMobileButton();
    if(desktopDropdown&&desktopButton&&!desktopDropdown.contains(event.target)&&!desktopButton.contains(event.target))closeDesktop();
    if(mobilePopover&&!mobilePopover.hidden&&!mobilePopover.contains(event.target)&&(!mobileButton||!mobileButton.contains(event.target)))closeMobile();
  });

  document.addEventListener('keydown',function(event){
    if(event.key!=='Escape')return;
    if(document.body.classList.contains('notification-page-active'))closePage(true);
    else closeMenus();
  });

  document.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('#mobileNotificationButton'):null;
    if(button)toggleMobile(event);
  },true);

  window.addEventListener('be:close-notification-menus',closeMenus);
  window.addEventListener('be:open-config',closeMenus);

  window.addEventListener('be:open-notifications',function(event){
    var detail=event&&event.detail||{};
    openPage(detail.id||routeInfo().id,false);
  });
  window.addEventListener('be:close-notifications',function(){closePage(false);});
  window.addEventListener('be:i18n-ready',function(){if(loaded){renderPreviews();if(document.body.classList.contains('notification-page-active'))renderPage(selectedId||routeInfo().id);}});
  window.addEventListener('be:content-ready',function(){loadNotifications(true);});
  window.addEventListener('be:auth-changed',function(){syncPageAvatar();loadNotifications(true);});
  window.addEventListener('be:profile-avatar-changed',syncPageAvatar);
  window.addEventListener('be:content-ready',syncPageAvatar);
  window.addEventListener('hashchange',function(){
    var info=routeInfo();
    if(info.active)openPage(info.id,false);
    else if(document.body.classList.contains('notification-page-active'))closePage(false);
  });
  window.addEventListener('popstate',function(){
    var info=routeInfo();
    if(info.active)openPage(info.id,false);
    else if(document.body.classList.contains('notification-page-active'))closePage(false);
  });
  window.addEventListener('storage',function(event){
    if(event.key===READ_STATE_KEY||event.key===STORAGE_KEY)renderPreviews();
  });

  window.BETVNotificationsInbox={
    isRead:isNotificationRead,
    markRead:markNotificationRead,
    markAllRead:markAllRead,
    refresh:renderPreviews
  };

  syncPageAvatar();
  loadNotifications(false);
  var initial=routeInfo();
  if(initial.active)openPage(initial.id,false);
})();

;/* module boundary */
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


;/* Página dedicada: Quem é Billie Eilish. */
(function(){
  'use strict';
  if(String(location.hash||'').startsWith('#/admin'))return;

  var page=document.getElementById('billiePage');
  var homeButton=document.getElementById('billiePageHome');
  var notificationButton=document.getElementById('billiePageNotifications');
  var avatarButton=document.getElementById('billiePageAvatar');
  var avatarImage=document.getElementById('billiePageAvatarImage');
  var avatarFallback=document.getElementById('billiePageAvatarFallback');
  var unreadDot=document.getElementById('billiePageUnreadDot');
  var portrait=document.getElementById('billiePagePortrait');
  var kicker=document.getElementById('billiePageKicker');
  var title=document.getElementById('billiePageTitle');
  var manualText=document.getElementById('billieBiographyText');
  var wikipediaContent=document.getElementById('billieWikipediaContent');
  var wikipediaLoading=document.getElementById('billieWikipediaLoading');
  var wikipediaError=document.getElementById('billieWikipediaError');
  var wikipediaAttribution=document.getElementById('billieWikipediaAttribution');
  if(!page)return;

  var DEFAULT_PORTRAIT='/assets/images/pages/billie-portrait-default.webp';
  if(portrait){
    portrait.addEventListener('error',function(){
      var fallback=new URL(DEFAULT_PORTRAIT,location.origin).href;
      if(String(portrait.src||'')!==fallback){
        portrait.dataset.adminOverride='false';
        portrait.src=DEFAULT_PORTRAIT;
      }
    });
  }
  var DEFAULTS={
    sourceMode:'wikipedia',
    title:'Billie Eilish',
    kicker:'Conheça a artista',
    portraitUrl:'',
    bannerUrl:'',
    manualBio:'Billie Eilish Pirate Baird O’Connell nasceu em Los Angeles, em 18 de dezembro de 2001. Cantora e compositora, começou a criar músicas em casa ao lado do irmão e principal colaborador, FINNEAS.\n\nEla ganhou projeção internacional com Ocean Eyes e construiu uma identidade artística reconhecida pelos vocais intimistas, pela produção detalhista e por uma estética visual muito própria.\n\nEntre os projetos que marcam sua discografia estão WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?, Happier Than Ever e HIT ME HARD AND SOFT.',
    includeReferences:false,
    instagram:'https://www.instagram.com/billieeilish/',
    xUrl:'https://x.com/billieeilish',
    youtube:'https://www.youtube.com/@BillieEilish',
    spotify:'https://open.spotify.com/artist/6qqNVTkY8uBg9cP3Jd7DAH',
    website:'https://www.billieeilish.com/'
  };
  var currentSettings={...DEFAULTS};
  var loadToken=0;
  var wikipediaOrigin='https://pt.wikipedia.org';

  function cleanPath(){
    try{return decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/'))).replace(/\/+$/,'')||'/';}
    catch(_){return String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';}
  }
  function isBillieRoute(){
    var path=cleanPath().toLowerCase();
    var hash=String(location.hash||'').toLowerCase();
    return path==='/billie-eilish'||path==='/billie'||hash==='#billie-eilish'||hash==='#/billie-eilish'||hash==='#billie'||hash==='#/billie';
  }
  function mediaUrl(value){
    var raw=String(value||'').trim();
    if(!raw)return '';
    return window.beMediaUrl?window.beMediaUrl(raw):raw;
  }
  var avatarSyncVersion=0;
  function applyBillieAvatar(url){
    if(!avatarImage||!avatarFallback)return;
    if(window.BETVApplyAvatar)window.BETVApplyAvatar(avatarImage,url);else{avatarImage.src=url||window.BETV_DEFAULT_AVATAR;avatarImage.hidden=false;}
    avatarFallback.hidden=true;
  }
  function syncAvatar(event){
    var version=++avatarSyncVersion;
    var immediate=window.BETVReadSelectedAvatar?window.BETVReadSelectedAvatar(event):'';
    applyBillieAvatar(immediate);
    if(!window.BETVLoadSelectedAvatar)return;
    Promise.resolve(window.BETVLoadSelectedAvatar(event)).then(function(url){
      if(version!==avatarSyncVersion||!isBillieRoute())return;
      applyBillieAvatar(url);
    }).catch(function(){});
  }
  function syncUnread(){
    var source=document.getElementById('notificationUnreadDot');
    if(unreadDot)unreadDot.hidden=!source||source.hidden;
  }
  function paragraphs(value){
    return String(value||'').split(/\n\s*\n/g).map(function(entry){return entry.trim();}).filter(Boolean);
  }
  function escapeText(value){
    return String(value||'').replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});
  }
  function renderManual(settings){
    var items=paragraphs(settings.manualBio||DEFAULTS.manualBio);
    manualText.innerHTML=items.map(function(item){return '<p>'+escapeText(item)+'</p>';}).join('');
    manualText.hidden=false;
    wikipediaContent.hidden=true;
    wikipediaContent.innerHTML='';
    wikipediaAttribution.hidden=true;
  }
  function safeBillieExternalUrl(value){
    var raw=String(value||'').trim();
    if(!raw)return '';
    try{
      var parsed=new URL(raw);
      return parsed.protocol==='https:'?parsed.href:'';
    }catch(_){return '';}
  }
  function renderSocial(settings){
    page.querySelectorAll('[data-billie-social]').forEach(function(link){
      var key=link.getAttribute('data-billie-social');
      var url=safeBillieExternalUrl(settings[key]);
      link.hidden=!url;
      if(url)link.href=url;
      else link.removeAttribute('href');
    });
  }
  function renderBase(settings){
    currentSettings={...DEFAULTS,...(settings||{})};
    kicker.textContent=currentSettings.kicker||DEFAULTS.kicker;
    title.textContent=currentSettings.title||DEFAULTS.title;
    var customPortrait=String(currentSettings.portraitUrl||'').trim();
    if(customPortrait){
      portrait.src=mediaUrl(customPortrait);
      portrait.dataset.adminOverride='true';
    }else{
      portrait.dataset.adminOverride='false';
      portrait.src=DEFAULT_PORTRAIT;
    }
    renderSocial(currentSettings);
    if(String(currentSettings.sourceMode||'manual').toLowerCase()==='wikipedia'){
      manualText.hidden=true;
      wikipediaContent.hidden=true;
      wikipediaContent.innerHTML='';
      wikipediaAttribution.hidden=true;
    }else{
      renderManual(currentSettings);
    }
  }
  function currentLocaleSlug(){
    var value=String(window.BETVLocale&&window.BETVLocale.slug||'pt-br').toLowerCase();
    return value==='en-us'||value==='es'?value:'pt-br';
  }
  function wikipediaLocaleCopy(){
    var slug=currentLocaleSlug();
    if(slug==='en-us')return {
      loadingError:'The information could not be loaded right now. The biography saved on the site is being shown instead.',
      prepareError:'The Wikipedia article could not be prepared for display.',
      requestError:'The Wikipedia article could not be loaded.',
      summary:'Sources and credits',
      prefix:'Content adapted from',
      sourceLabel:'English Wikipedia',
      suffix:'available under the',
      licenseSuffix:'license.',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/deed.en'
    };
    if(slug==='es')return {
      loadingError:'La información no se pudo cargar en este momento. Se muestra en su lugar la biografía guardada en el sitio.',
      prepareError:'No se pudo preparar el artículo de Wikipedia para mostrarlo.',
      requestError:'No se pudo cargar el artículo de Wikipedia.',
      summary:'Fuentes y créditos',
      prefix:'Contenido adaptado de',
      sourceLabel:'Wikipedia en español',
      suffix:'disponible bajo la',
      licenseSuffix:'licencia.',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/deed.es'
    };
    return {
      loadingError:'As informações não puderam ser carregadas agora. Exibindo o texto salvo no site.',
      prepareError:'Não foi possível preparar o conteúdo para exibição.',
      requestError:'Não foi possível carregar as informações.',
      summary:'Fontes e créditos',
      prefix:'Conteúdo adaptado da',
      sourceLabel:'Wikipédia em português',
      suffix:'disponível sob a',
      licenseSuffix:'licença.',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/deed.pt-br'
    };
  }
  function absoluteWikipediaUrl(value,baseOrigin){
    var raw=String(value||'').trim();
    if(!raw)return '';
    try{
      var parsed=new URL(raw,baseOrigin||wikipediaOrigin||'https://pt.wikipedia.org');
      return parsed.protocol==='https:'?parsed.href:'';
    }catch(_){return '';}
  }
  function normalizedSectionLabel(value){
    return String(value||'').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\[[^\]]*\]/g,'')
      .replace(/[^a-z0-9]+/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }
  function removeWikipediaSection(parser,heading){
    /*
      A Wikipédia passou a envolver alguns títulos em .mw-heading.
      A remoção precisa começar pelo contêiner inteiro; caso contrário,
      a lista de "Ligações externas" permanece solta na página.
    */
    var sectionStart=heading.closest&&heading.closest('.mw-heading')||heading;
    var level=Number(String(heading.tagName||'H2').slice(1))||2;
    var cursor=sectionStart.nextSibling;
    while(cursor){
      if(cursor.nodeType===1){
        var nextHeading=cursor.matches&&cursor.matches('h2,h3,h4')
          ? cursor
          : cursor.querySelector&&cursor.querySelector(':scope > h2,:scope > h3,:scope > h4');
        if(nextHeading){
          var nextLevel=Number(String(nextHeading.tagName||'H2').slice(1))||2;
          if(nextLevel<=level)break;
        }
      }
      var next=cursor.nextSibling;
      cursor.remove();
      cursor=next;
    }
    sectionStart.remove();
  }
  function normalizeWikipediaHtml(rawHtml,baseOrigin){
    var doc=new DOMParser().parseFromString('<div id="billieWikiRoot">'+String(rawHtml||'')+'</div>','text/html');
    var root=doc.getElementById('billieWikiRoot');
    var parser=root&&root.querySelector('.mw-parser-output')||root;
    if(!parser)return {html:'',imageUrl:''};
    var infoboxImage=parser.querySelector('table.infobox img, .infobox img');
    var imageUrl=infoboxImage?absoluteWikipediaUrl(infoboxImage.getAttribute('src')||infoboxImage.getAttribute('data-src')||'',baseOrigin):'';
    parser.querySelectorAll('script,style,link,meta,noscript,iframe,object,embed,form,input,button,textarea,select,video,audio,canvas,svg,table.infobox,.infobox,.mw-editsection,.shortdescription,.hatnote,.metadata,.ambox,.navbox,.vertical-navbox,.authority-control,.catlinks,.sistersitebox,.portal,.mw-empty-elt,.noprint,.nomobile,.thumb,figure,.gallery').forEach(function(node){node.remove();});
    /* Estas remoções são permanentes e são reaplicadas em toda atualização da Wikipédia. */
    parser.querySelectorAll('sup,.reference,.mw-ref,.reflist,ol.references,[role="note"],a[href^="#cite_note"]').forEach(function(node){node.remove();});
    /* As tabelas da filmografia da Wikipédia não fazem parte do layout do BETV. */
    parser.querySelectorAll('table').forEach(function(node){node.remove();});
    var blocked=['premios e indicacoes','ver tambem','referencias','ligacoes externas','filmografia','awards and nominations','see also','references','external links','filmography','premios y nominaciones','vease tambien','enlaces externos','filmografia'];
    Array.from(parser.querySelectorAll('h2,h3,h4')).forEach(function(heading){
      if(!heading.isConnected)return;
      var label=normalizedSectionLabel(heading.textContent);
      if(blocked.some(function(item){return label===item||label.startsWith(item+' ');}))removeWikipediaSection(parser,heading);
    });
    /*
      Remove também uma eventual lista órfã de ligações externas.
      Isso cobre Commons, Wikinotícias, página oficial, Facebook, X,
      Instagram e YouTube, sem afetar links citados dentro da biografia.
    */
    Array.from(parser.querySelectorAll('ul,ol')).forEach(function(list){
      if(!list.isConnected)return;
      var labels=Array.from(list.querySelectorAll(':scope > li')).map(function(item){
        return normalizedSectionLabel(item.textContent);
      }).filter(Boolean);
      if(!labels.length)return;
      var externalLabels=['commons','wikinoticias','wikinews','pagina oficial','official website','sitio web oficial','billie eilish no facebook','billie eilish on facebook','billie eilish en facebook','billie eilish no x','billie eilish on x','billie eilish en x','billie eilish no instagram','billie eilish on instagram','billie eilish en instagram','canal de billie eilish no youtube','billie eilish youtube channel','canal de billie eilish en youtube'];
      var matches=labels.filter(function(label){
        return externalLabels.some(function(item){return label===item||label.startsWith(item+' ');});
      }).length;
      if(matches>=2&&matches>=Math.ceil(labels.length*.5))list.remove();
    });
    var allowed=new Set(['DIV','P','H2','H3','H4','UL','OL','LI','STRONG','B','EM','I','A','TABLE','THEAD','TBODY','TFOOT','TR','TH','TD','CAPTION','BLOCKQUOTE','SMALL','BR','SPAN','DL','DT','DD']);
    Array.from(parser.querySelectorAll('*')).forEach(function(element){
      if(!allowed.has(element.tagName)){
        if(['IMG','SOURCE'].includes(element.tagName)){element.remove();return;}
        element.replaceWith.apply(element,Array.from(element.childNodes));
        return;
      }
      Array.from(element.attributes).forEach(function(attribute){
        var name=attribute.name.toLowerCase();
        if(element.tagName==='A'&&name==='href')return;
        if(['colspan','rowspan','scope'].includes(name)&&['TH','TD'].includes(element.tagName))return;
        element.removeAttribute(attribute.name);
      });
      if(element.tagName==='A'){
        var href=absoluteWikipediaUrl(element.getAttribute('href'),baseOrigin);
        if(!href){element.removeAttribute('href');return;}
        element.href=href;element.target='_blank';element.rel='noopener noreferrer';
      }
    });
    parser.querySelectorAll('h2,h3,h4').forEach(function(heading){heading.textContent=String(heading.textContent||'').replace(/\s*\[editar.*$/i,'').trim();});
    return {html:parser.innerHTML.trim(),imageUrl:imageUrl};
  }
  function formatRevision(value){
    if(!value)return '';
    var date=new Date(value);
    if(Number.isNaN(date.getTime()))return '';
    var locale=window.BETVLocale&&window.BETVLocale.locale||'pt-BR';
    return date.toLocaleString(locale,{dateStyle:'medium',timeStyle:'short'});
  }
  function renderWikipediaAttribution(payload){
    if(!wikipediaAttribution)return;
    var copy=wikipediaLocaleCopy();
    var summary=wikipediaAttribution.querySelector('summary');
    var paragraph=wikipediaAttribution.querySelector('p');
    if(summary)summary.textContent=copy.summary;
    if(!paragraph)return;
    paragraph.textContent='';
    paragraph.append(document.createTextNode(copy.prefix+' '));
    var source=document.createElement('a');
    source.href=absoluteWikipediaUrl(payload&&payload.sourceUrl,wikipediaOrigin)||wikipediaOrigin+'/wiki/Billie_Eilish';
    source.target='_blank';source.rel='noopener noreferrer';
    source.textContent=String(payload&&payload.sourceLabel||copy.sourceLabel);
    paragraph.append(source,document.createTextNode(', '+copy.suffix+' '));
    var license=document.createElement('a');
    license.href=copy.licenseUrl;license.target='_blank';license.rel='noopener noreferrer';license.textContent='CC BY-SA 4.0';
    paragraph.append(license,document.createTextNode(' '+copy.licenseSuffix));
  }
  async function loadWikipedia(settings,token){
    var copy=wikipediaLocaleCopy();
    var localeSlug=currentLocaleSlug();
    wikipediaLoading.hidden=false;
    wikipediaError.hidden=true;
    wikipediaError.textContent='';
    wikipediaContent.setAttribute('translate','no');
    wikipediaContent.classList.add('notranslate');
    try{
      var endpoint='/api/billie-wikipedia?lang='+encodeURIComponent(localeSlug);
      var response=await fetch(endpoint,{method:'GET',cache:'default',credentials:'same-origin'});
      var payload=await response.json().catch(function(){return {};});
      if(!response.ok||!payload||!payload.html)throw new Error(payload.error||copy.requestError);
      if(token!==loadToken)return;
      wikipediaOrigin=String(payload.wikipediaOrigin||({'en-us':'https://en.wikipedia.org','es':'https://es.wikipedia.org'}[localeSlug])||'https://pt.wikipedia.org');
      var cleaned=normalizeWikipediaHtml(payload.html,wikipediaOrigin);
      if(!cleaned.html)throw new Error(copy.prepareError);
      wikipediaContent.innerHTML=cleaned.html;
      wikipediaContent.hidden=false;
      manualText.hidden=true;
      renderWikipediaAttribution(payload);
      wikipediaAttribution.hidden=false;
      /* A atualização do texto nunca substitui a foto padrão definida pelo site. */
      document.title='Billie Eilish TV';
    }catch(error){
      if(token!==loadToken)return;
      wikipediaError.textContent=copy.loadingError;
      wikipediaError.hidden=false;
      renderManual(settings);
    }finally{
      if(token===loadToken)wikipediaLoading.hidden=true;
    }
  }
  async function loadSettings(){
    var token=++loadToken;
    var settings={...DEFAULTS};
    try{
      var data=window.beBackend&&beBackend.data;
      if(data&&typeof data.get==='function'){
        var saved=await data.get('settings','billie-eilish');
        if(saved)settings={...settings,...saved};
      }
    }catch(error){console.warn('Não foi possível carregar as configurações da página Billie Eilish:',error);}
    if(token!==loadToken)return;
    renderBase(settings);
    if(String(settings.sourceMode||'manual').toLowerCase()==='wikipedia')loadWikipedia(settings,token);
  }
  function openPage(){
    document.body.classList.remove('login-mode','profile-page-active','settings-page-active','legal-page-active','support-page-active','notification-page-active','detail-page-active','section-catalog-active');
    document.body.classList.add('billie-page-active');
    page.hidden=false;page.setAttribute('aria-hidden','false');
    syncAvatar();syncUnread();
    document.title='Billie Eilish TV';
    window.scrollTo({top:0,left:0,behavior:'auto'});
    loadSettings();
  }
  function closePage(){
    loadToken+=1;
    document.body.classList.remove('billie-page-active');
    page.hidden=true;page.setAttribute('aria-hidden','true');
    document.title='Billie Eilish TV';
  }
  function renderRoute(){
    if(isBillieRoute()){
      var auth=window.beBackend&&beBackend.auth;
      if(auth&&auth.currentUser)openPage();
      return;
    }
    closePage();
  }

  document.addEventListener('click',function(event){
    var link=event.target&&event.target.closest?event.target.closest('[data-open-billie]'):null;
    if(!link)return;
    event.preventDefault();
    if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/billie-eilish');
    else location.assign(window.BETVLocaleURL?window.BETVLocaleURL('/billie-eilish'):'/billie-eilish');
  });
  page.addEventListener('click',function(event){
    var movieLink=event.target&&event.target.closest?event.target.closest('[data-billie-movie-link="true"]'):null;
    if(!movieLink)return;
    event.preventDefault();
    var destination=movieLink.getAttribute('href')||'/';
    if(window.BETVPublicRoutes)window.BETVPublicRoutes.go(destination);
    else location.assign(window.BETVLocaleURL?window.BETVLocaleURL(destination):destination);
  });
  if(homeButton)homeButton.addEventListener('click',function(){if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/');else location.assign(window.BETVLocaleURL?window.BETVLocaleURL('/'):'/');});
  if(notificationButton)notificationButton.addEventListener('click',function(){if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/atualizacoes');else location.assign(window.BETVLocaleURL?window.BETVLocaleURL('/atualizacoes'):'/atualizacoes');});
  if(avatarButton)avatarButton.addEventListener('click',function(){
    window.dispatchEvent(new CustomEvent('be:close-billie-page'));
    var profileAction=document.querySelector('#userDropdown [data-public-action="profile"]');
    if(profileAction){profileAction.click();return;}
    if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/login');
  });

  var sourceAvatar=document.getElementById('publicUserPhoto');
  var sourceDot=document.getElementById('notificationUnreadDot');
  if(window.MutationObserver&&sourceAvatar)new MutationObserver(syncAvatar).observe(sourceAvatar,{attributes:true,attributeFilter:['src','hidden']});
  if(window.MutationObserver&&sourceDot)new MutationObserver(syncUnread).observe(sourceDot,{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('be:open-billie-page',openPage);
  window.addEventListener('be:close-billie-page',closePage);
  window.addEventListener('be:profile-avatar-changed',syncAvatar);
  window.addEventListener('be:profile-device-synced',syncAvatar);
  if(window.beBackend&&window.beBackend.auth&&typeof window.beBackend.auth.onChange==='function')window.beBackend.auth.onChange(function(){if(isBillieRoute())syncAvatar();});
  window.addEventListener('be:content-ready',function(){if(isBillieRoute())renderRoute();});
  window.addEventListener('popstate',renderRoute);
  window.addEventListener('hashchange',renderRoute);
  document.addEventListener('DOMContentLoaded',renderRoute);
  if(document.readyState!=='loading')renderRoute();
})();


/* Página pública Apoie uma ONG. */
;(function(){
  'use strict';
  if(String(location.hash||'').startsWith('#/admin'))return;

  var page=document.getElementById('donatePage');
  var hero=document.getElementById('donateHero');
  var list=document.getElementById('donateNgoList');
  var status=document.getElementById('donatePageStatus');
  var showMoreButton=document.getElementById('donateNgoShowMore');
  var supportersSection=document.getElementById('donateSupportersSection');
  var supportersList=document.getElementById('donateSupportersList');
  var supportersStatus=document.getElementById('donateSupportersStatus');
  if(!page||!hero||!list||!status)return;

  var loaded=false;
  var loading=null;
  var supportersLoaded=false;
  var supportersLoading=null;
  var supporterKeys=Object.create(null);
  var supportersOffset=0;
  var supportersHasMore=true;
  var supportersObserver=null;
  var supportersSentinel=null;
  var supportersScrollTicking=false;
  var ngoRecordCount=0;
  var visibleNgoCount=0;
  var notificationItems=[];
  var notificationLoaded=false;
  var notificationLoading=null;
  var NOTIFICATION_STORAGE_KEY='beNotificationsLastSeen';

  var home=document.getElementById('donatePageHome');
  var notificationButton=document.getElementById('donatePageNotifications');
  var notificationWrap=notificationButton&&notificationButton.closest('.donate-notification-wrap');
  var notificationPopup=document.getElementById('donateNotificationDropdown');
  var notificationPreviewList=document.getElementById('donateNotificationPreviewList');
  var notificationMarkAll=document.getElementById('donateNotificationMarkAll');
  var notificationClose=document.getElementById('donateNotificationClose');
  var notificationViewAll=document.getElementById('donateNotificationViewAll');
  var avatar=document.getElementById('donatePageAvatar');

  var CHECKOUT_FUNCTION_NAME='create-donation-checkout';
  var DONATION_LOCALE=String(window.BETVLocale&&window.BETVLocale.locale||navigator.language||'pt-BR');
  var DONATION_CURRENCY=String(window.BETVRegional&&window.BETVRegional.currency||'BRL').toUpperCase()==='USD'?'USD':'BRL';
  var DEFAULT_MINIMUM_DONATION_CENTS={BRL:500,USD:100};
  var NGO_BATCH_SIZE=12;
  var SUPPORTERS_INITIAL_LIMIT=48;
  var SUPPORTERS_BATCH_SIZE=10;
  var ngoMobileMedia=window.matchMedia?window.matchMedia('(max-width:760px)'):null;

  function cleanPath(){try{return decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/'))).replace(/\/+$/,'')||'/';}catch(_){return String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';}}
  function isRoute(){var path=cleanPath().toLowerCase(),hash=String(location.hash||'').toLowerCase();return path==='/ong'||hash==='#ong'||hash==='#/ong';}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}
  function imageUrl(value){var raw=String(value||'').trim();if(!raw)return '';var resolved=typeof window.beMediaUrl==='function'?window.beMediaUrl(raw):raw;return resolved&&resolved!=='#'?resolved:'';}
  function active(item){return item&&item.active!==false&&String(item.active).toLowerCase()!=='false';}
  function donationSlug(value){return String(value||'ong').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'ong';}
  function i18nText(source,variables){
    if(window.BETVI18n&&typeof window.BETVI18n.t==='function')return window.BETVI18n.t(source,variables||{});
    return String(source||'').replace(/\{([a-zA-Z0-9_]+)\}/g,function(match,key){return variables&&Object.prototype.hasOwnProperty.call(variables,key)?String(variables[key]):match;});
  }
  function parseDonationCents(value){
    var raw=String(value||'').trim().replace(/\s+/g,'').replace(/[^0-9.,]/g,'');
    if(!raw)return NaN;
    var comma=raw.lastIndexOf(','),dot=raw.lastIndexOf('.'),decimal=Math.max(comma,dot);
    var normalized;
    if(decimal>=0){
      var integer=raw.slice(0,decimal).replace(/[.,]/g,'')||'0';
      var fraction=raw.slice(decimal+1).replace(/[.,]/g,'').slice(0,2);
      normalized=integer+'.'+fraction;
    }else normalized=raw;
    var amount=Number(normalized);
    return Number.isFinite(amount)?Math.round(amount*100):NaN;
  }
  function formatDonationCents(cents,currency){
    return new Intl.NumberFormat(DONATION_LOCALE,{style:'currency',currency:currency||DONATION_CURRENCY}).format(Number(cents||0)/100);
  }
  function donationCurrencySymbol(){
    try{
      var part=new Intl.NumberFormat(DONATION_LOCALE,{style:'currency',currency:DONATION_CURRENCY,currencyDisplay:'narrowSymbol'}).formatToParts(0).find(function(item){return item.type==='currency';});
      return part&&part.value?part.value:(DONATION_CURRENCY==='USD'?'$':'R$');
    }catch(_){return DONATION_CURRENCY==='USD'?'$':'R$';}
  }
  function minimumDonationCents(item){
    var source=item&&typeof item==='object'?(DONATION_CURRENCY==='USD'?item.minimumDonationUsdCents:item.minimumDonationCents):item;
    var cents=Number(source);
    return Number.isInteger(cents)&&cents>=100&&cents<=100000000?cents:DEFAULT_MINIMUM_DONATION_CENTS[DONATION_CURRENCY];
  }
  function donationRequestId(){
    if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();
    if(window.crypto&&typeof window.crypto.getRandomValues==='function'){
      var bytes=new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      bytes[6]=(bytes[6]&15)|64;
      bytes[8]=(bytes[8]&63)|128;
      var hex=Array.prototype.map.call(bytes,function(value){return value.toString(16).padStart(2,'0');}).join('');
      return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
    }
    throw new Error(i18nText('O navegador não conseguiu gerar uma identificação segura para o pagamento.'));
  }
  function checkoutErrorMessage(error,data){
    var code=String(data&&data.code||'');
    var responseCurrency=String(data&&data.currency||DONATION_CURRENCY).toUpperCase()==='USD'?'USD':'BRL';
    if(code==='below_minimum')return i18nText('O valor mínimo desta ONG é {amount}.',{amount:formatDonationCents(Number(data.minimumDonationCents)||DEFAULT_MINIMUM_DONATION_CENTS[responseCurrency],responseCurrency)});
    if(code==='rate_limited')return i18nText('Muitas tentativas seguidas. Aguarde um minuto e tente novamente.');
    if(code==='stripe_not_configured')return i18nText('O checkout ainda não foi configurado no servidor.');
    if(code==='ngo_not_found')return i18nText('Esta ONG não está mais disponível.');
    return String(data&&data.error||error&&error.message||i18nText('Não foi possível abrir o checkout agora.'));
  }
  async function createDonationCheckout(ngoId,cents,requestId){
    var client=window.beBackend&&window.beBackend.client;
    if(!client||!client.functions||typeof client.functions.invoke!=='function')throw new Error(i18nText('O checkout seguro não está disponível.'));
    var result=await client.functions.invoke(CHECKOUT_FUNCTION_NAME,{body:{ngoId:String(ngoId||''),amountCents:cents,requestId:requestId,currency:DONATION_CURRENCY,locale:DONATION_LOCALE,returnPath:String(window.BETVLocale&&window.BETVLocale.prefix||'')+'/ong'}});
    var data=result&&result.data&&typeof result.data==='object'?result.data:null;
    if(result&&result.error){
      try{if(result.error.context&&typeof result.error.context.json==='function')data=await result.error.context.json();}catch(_){ }
      var failure=new Error(checkoutErrorMessage(result.error,data));
      failure.data=data;
      throw failure;
    }
    var url=String(data&&data.url||'');
    try{
      var parsed=new URL(url);
      if(parsed.protocol!=='https:'||!/(^|\.)stripe\.com$/i.test(parsed.hostname))throw new Error('invalid_checkout_url');
    }catch(_){throw new Error(i18nText('A Stripe não retornou um checkout válido.'));}
    return url;
  }

  function applyPageBanner(settings){
    var banner=imageUrl(settings&&settings.bannerUrl||'');
    if(!banner){hero.classList.remove('has-banner');hero.style.removeProperty('--donate-hero-banner');return;}
    var safe=banner.replace(/["\n\r]/g,'');
    hero.style.setProperty('--donate-hero-banner','url("'+safe+'")');
    hero.classList.add('has-banner');
  }
  function preloadPageBanner(settings){
    var banner=imageUrl(settings&&settings.bannerUrl||'');
    if(!banner)return Promise.resolve();
    return new Promise(function(resolve){
      var settled=false,image=new Image(),timer=window.setTimeout(done,4500);
      function done(){if(settled)return;settled=true;window.clearTimeout(timer);resolve();}
      image.onload=done;
      image.onerror=done;
      image.src=banner;
      if(image.complete)done();
      else if(typeof image.decode==='function')image.decode().then(done).catch(function(){});
    });
  }
  function signalDonateVisualReady(){
    if(page.dataset.visualReady==='true')return;
    page.dataset.visualReady='true';
    window.requestAnimationFrame(function(){
      window.requestAnimationFrame(function(){window.dispatchEvent(new CustomEvent('be:donate-visual-ready'));});
    });
  }

  var donateAvatarSyncVersion=0;
  function applyDonateAvatar(url){
    var image=document.getElementById('donatePageAvatarImage');
    var fallback=document.getElementById('donatePageAvatarFallback');
    if(!image||!fallback)return;
    if(window.BETVApplyAvatar)window.BETVApplyAvatar(image,url);else{image.src=url||window.BETV_DEFAULT_AVATAR;image.hidden=false;}
    fallback.hidden=true;
  }
  function syncAvatar(event){
    var version=++donateAvatarSyncVersion;
    var immediate=window.BETVReadSelectedAvatar?window.BETVReadSelectedAvatar(event):'';
    applyDonateAvatar(immediate);
    if(!window.BETVLoadSelectedAvatar)return;
    Promise.resolve(window.BETVLoadSelectedAvatar(event)).then(function(url){
      if(version!==donateAvatarSyncVersion||!isRoute())return;
      applyDonateAvatar(url);
    }).catch(function(){});
  }

  function syncUnread(){
    var source=document.getElementById('notificationUnreadDot');
    var dot=document.getElementById('donatePageUnreadDot');
    if(dot)dot.hidden=!source||source.hidden;
  }

  function isMobileNgoCarousel(){
    return ngoMobileMedia?ngoMobileMedia.matches:window.innerWidth<=760;
  }

  function updateShowMoreButton(){
    if(!showMoreButton)return;
    var hasMore=!isMobileNgoCarousel()&&visibleNgoCount<ngoRecordCount;
    showMoreButton.hidden=!hasMore;
    showMoreButton.setAttribute('aria-hidden',String(!hasMore));
  }

  function syncNgoVisibility(){
    var showAll=isMobileNgoCarousel();
    list.querySelectorAll('[data-ngo-card]').forEach(function(card,index){
      card.hidden=!showAll&&index>=visibleNgoCount;
    });
    updateShowMoreButton();
  }

  function showNextNgoBatch(){
    if(isMobileNgoCarousel()||visibleNgoCount>=ngoRecordCount)return;
    visibleNgoCount=Math.min(visibleNgoCount+NGO_BATCH_SIZE,ngoRecordCount);
    syncNgoVisibility();
  }

  function render(items){
    var records=(Array.isArray(items)?items:[]).filter(active).sort(function(a,b){return (Number(a.order)||0)-(Number(b.order)||0);});
    ngoRecordCount=records.length;
    visibleNgoCount=Math.min(NGO_BATCH_SIZE,ngoRecordCount);
    if(!records.length){list.innerHTML='';status.hidden=false;status.textContent=i18nText('Nenhuma ONG foi publicada ainda.');updateShowMoreButton();return;}
    status.hidden=true;
    list.innerHTML=records.map(function(item,index){
      var title=String(item.title||item.name||'ONG').trim();
      var description=String(item.description||i18nText('Conheça a atuação desta organização e escolha apoiar esta causa.')).trim();
      var image=imageUrl(item.imageUrl||item.bannerUrl||item.thumbnailUrl||'');
      var id='donate-ngo-'+String(item.id||index).replace(/[^a-z0-9_-]/gi,'-');
      var amountId=id+'-amount',hintId=id+'-amount-hint',errorId=id+'-amount-error';
      var ngoReference=String(item.id||donationSlug(title));
      var minimumCents=minimumDonationCents(item);
      var minimumLabel=formatDonationCents(minimumCents);
      var currencySymbol=donationCurrencySymbol();
      var amountPlaceholder=(minimumCents/100).toLocaleString(DONATION_LOCALE,{minimumFractionDigits:2,maximumFractionDigits:2});
      return '<article class="donate-ngo-card" data-ngo-card>'+ 
        '<button class="donate-ngo-toggle" data-i18n-ignore type="button" aria-expanded="false" aria-controls="'+esc(id)+'" aria-label="'+esc(i18nText('Conhecer {name}',{name:title}))+'" data-ngo-title="'+esc(title)+'">'+
          (image?'<img loading="lazy" decoding="async" src="'+esc(image)+'" alt="'+esc(i18nText('Banner da {name}',{name:title}))+'">':'<span class="donate-ngo-placeholder" aria-hidden="true">'+esc(title.slice(0,2).toUpperCase())+'</span>')+
        '</button>'+ 
        '<div class="donate-ngo-details" id="'+esc(id)+'"><div class="donate-ngo-details-inner"><div class="donate-ngo-details-content"><h3 class="donate-ngo-name notranslate" translate="no">'+esc(title)+'</h3><div class="donate-ngo-description">'+esc(description)+'</div>'+ 
          '<div class="donate-ngo-donation" data-donation-box data-ngo-reference="'+esc(ngoReference)+'" data-minimum-donation-cents="'+esc(minimumCents)+'" data-currency="'+esc(DONATION_CURRENCY)+'">'+
            '<label class="donate-ngo-amount-label" for="'+esc(amountId)+'">'+esc(i18nText('Qual valor você deseja doar?'))+'</label>'+
            '<div class="donate-ngo-amount-field" data-donation-field><span aria-hidden="true">'+esc(currencySymbol)+'</span><input class="donate-ngo-amount-input" id="'+esc(amountId)+'" type="text" inputmode="decimal" autocomplete="off" placeholder="'+esc(amountPlaceholder)+'" aria-describedby="'+esc(hintId)+' '+esc(errorId)+'"></div>'+
            '<div class="donate-ngo-amount-meta"><small id="'+esc(hintId)+'">'+esc(i18nText('Valor mínimo: {amount}',{amount:minimumLabel}))+'</small><small class="donate-ngo-amount-error" id="'+esc(errorId)+'" role="alert" hidden></small></div>'+
            '<button class="donate-ngo-support-button" type="button" data-stripe-donation aria-disabled="true" disabled>'+esc(i18nText('Doar'))+'</button>'+
          '</div>'+
        '</div></div></div></article>';
    }).join('');
    syncNgoVisibility();

    list.querySelectorAll('.donate-ngo-toggle img').forEach(function(image){
      image.addEventListener('error',function(){
        var button=image.closest('.donate-ngo-toggle');
        if(!button)return;
        var title=button.getAttribute('data-ngo-title')||'ONG';
        var placeholder=document.createElement('span');
        placeholder.className='donate-ngo-placeholder';
        placeholder.setAttribute('aria-hidden','true');
        placeholder.textContent=String(title).trim().slice(0,2).toUpperCase();
        image.replaceWith(placeholder);
      },{once:true});
    });

    list.querySelectorAll('[data-ngo-card]').forEach(function(card){
      var button=card.querySelector('.donate-ngo-toggle');
      button.addEventListener('click',function(){
        var opening=!card.classList.contains('is-open');
        list.querySelectorAll('[data-ngo-card].is-open').forEach(function(other){
          if(other!==card){
            other.classList.remove('is-open');
            var otherButton=other.querySelector('.donate-ngo-toggle');
            if(otherButton)otherButton.setAttribute('aria-expanded','false');
          }
        });
        card.classList.toggle('is-open',opening);
        button.setAttribute('aria-expanded',String(opening));
      });

      var donationBox=card.querySelector('[data-donation-box]');
      var amountInput=donationBox&&donationBox.querySelector('.donate-ngo-amount-input');
      var amountField=donationBox&&donationBox.querySelector('[data-donation-field]');
      var amountError=donationBox&&donationBox.querySelector('.donate-ngo-amount-error');
      var donationLink=donationBox&&donationBox.querySelector('[data-stripe-donation]');
      if(!donationBox||!amountInput||!amountField||!amountError||!donationLink)return;

      var minimumCents=minimumDonationCents(donationBox.getAttribute('data-minimum-donation-cents'));
      var checkoutBusy=false;

      function setCheckoutBusy(busy){
        checkoutBusy=busy;
        donationLink.classList.toggle('is-loading',busy);
        donationLink.setAttribute('aria-busy',String(busy));
        donationLink.disabled=busy||donationLink.getAttribute('aria-disabled')==='true';
        if(busy)donationLink.textContent=i18nText('Abrindo checkout…');
      }

      function updateDonationButton(showError){
        var value=amountInput.value.trim();
        var cents=parseDonationCents(value);
        var valid=Number.isFinite(cents)&&Number.isInteger(cents)&&cents>=minimumCents&&cents<=100000000;
        var tooLow=value!==''&&Number.isFinite(cents)&&cents<minimumCents;
        var tooHigh=value!==''&&Number.isFinite(cents)&&cents>100000000;
        var invalid=value!==''&&!Number.isFinite(cents);
        var hasError=showError&&(tooLow||tooHigh||invalid);
        amountField.classList.toggle('is-invalid',hasError);
        amountInput.setAttribute('aria-invalid',String(hasError));
        amountError.hidden=!hasError;
        amountError.textContent=tooLow?i18nText('O valor mínimo desta ONG é {amount}.',{amount:formatDonationCents(minimumCents)}):(tooHigh?i18nText('O valor informado é muito alto.'):(invalid?i18nText('Digite um valor válido.'):''));
        donationLink.setAttribute('aria-disabled',valid?'false':'true');
        donationLink.disabled=!valid||checkoutBusy;
        if(!checkoutBusy)donationLink.textContent=valid?i18nText('Doar {amount}',{amount:formatDonationCents(cents)}):i18nText('Doar');
        return valid?cents:false;
      }

      amountInput.addEventListener('input',function(){updateDonationButton(true);});
      amountInput.addEventListener('blur',function(){
        var cents=parseDonationCents(amountInput.value);
        if(Number.isFinite(cents))amountInput.value=(cents/100).toLocaleString(DONATION_LOCALE,{minimumFractionDigits:2,maximumFractionDigits:2});
        updateDonationButton(true);
      });
      amountInput.addEventListener('keydown',function(event){
        if(event.key==='Enter'){
          event.preventDefault();
          if(updateDonationButton(true))donationLink.click();
        }
      });
      donationLink.addEventListener('click',async function(){
        var cents=updateDonationButton(true);
        if(!cents||checkoutBusy){if(!cents)amountInput.focus();return;}
        amountError.hidden=true;
        setCheckoutBusy(true);
        try{
          var requestId=donationRequestId();
          var checkoutUrl=await createDonationCheckout(donationBox.getAttribute('data-ngo-reference'),cents,requestId);
          location.assign(checkoutUrl);
        }catch(error){
          amountField.classList.add('is-invalid');
          amountError.hidden=false;
          amountError.textContent=checkoutErrorMessage(error,error&&error.data);
          setCheckoutBusy(false);
          updateDonationButton(false);
        }
      });
      updateDonationButton(false);
    });
  }

  function supporterInitials(value){
    var parts=String(value||'Apoiador').trim().split(/\s+/).filter(Boolean);
    return (parts.slice(0,2).map(function(part){return part.charAt(0);}).join('')||'A').toUpperCase();
  }

  function supporterKey(item){
    var id=String(item&&(item.user_id||item.userId)||'').trim();
    if(id)return 'id:'+id;
    var username=String(item&&(item.username||item.user_username)||'').replace(/^@/,'').trim().toLowerCase();
    return username?'username:'+username:'';
  }

  function supporterTime(item){
    var value=new Date(item&&(item.supported_at||item.supportedAt)||0).getTime();
    return Number.isFinite(value)?value:0;
  }

  function supporterMarkup(item){
    var displayName=String(item.display_name||item.displayName||item.user_display_name||i18nText('Apoiador')).trim()||i18nText('Apoiador');
    var username=String(item.username||item.user_username||'').replace(/^@/,'').trim();
    var banner=imageUrl(item.banner_url||item.bannerUrl||'');
    var avatarUrl=imageUrl(item.avatar_url||item.avatarUrl||window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png');
    var initials=supporterInitials(displayName);
    var route='/@'+encodeURIComponent(username);
    return '<a class="donate-supporter-card" href="'+esc(route)+'" data-supporter-profile aria-label="'+esc(i18nText('Abrir perfil de {name}',{name:displayName}))+'">'+
      '<span class="donate-supporter-banner">'+(banner?'<img class="donate-supporter-banner-image" loading="lazy" decoding="async" src="'+esc(banner)+'" alt="">':'')+'</span>'+ 
      '<span class="donate-supporter-shade" aria-hidden="true"></span>'+ 
      '<span class="donate-supporter-content">'+
        '<span class="donate-supporter-avatar" data-initials="'+esc(initials)+'"><img class="donate-supporter-avatar-image" loading="lazy" decoding="async" src="'+esc(avatarUrl||window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png')+'" data-avatar-fallback="/assets/images/profile/default-avatar.png" alt="'+esc(i18nText('Avatar de {name}',{name:displayName}))+'"></span>'+ 
        '<span class="donate-supporter-copy notranslate" translate="no"><strong>'+esc(displayName)+'</strong><small>@'+esc(username)+'</small></span>'+ 
      '</span>'+ 
    '</a>';
  }

  function bindSupporterImageFallbacks(){
    if(!supportersList)return;
    supportersList.querySelectorAll('.donate-supporter-banner-image:not([data-error-bound])').forEach(function(image){
      image.setAttribute('data-error-bound','true');
      image.addEventListener('error',function(){image.remove();},{once:true});
    });
    supportersList.querySelectorAll('.donate-supporter-avatar-image:not([data-error-bound])').forEach(function(image){
      image.setAttribute('data-error-bound','true');
      image.addEventListener('error',function(){
        if(image.getAttribute('src')!==(window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png')){
          image.setAttribute('src',window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png');
        }
      });
    });
  }

  function ensureSupportersSentinel(){
    if(!supportersSection||!supportersList)return null;
    if(supportersSentinel&&supportersSentinel.isConnected)return supportersSentinel;
    supportersSentinel=document.createElement('div');
    supportersSentinel.className='donate-supporters-sentinel';
    supportersSentinel.setAttribute('role','status');
    supportersSentinel.setAttribute('aria-live','polite');
    supportersSentinel.hidden=false;
    supportersList.insertAdjacentElement('afterend',supportersSentinel);
    return supportersSentinel;
  }

  function setSupportersLoader(message,visible){
    var sentinel=ensureSupportersSentinel();
    if(!sentinel)return;
    sentinel.textContent=visible?String(message||'Carregando mais apoiadores…'):'';
    sentinel.hidden=!visible&&!supportersHasMore;
    sentinel.classList.toggle('is-loading',Boolean(visible));
  }

  function disconnectSupportersObserver(){
    if(supportersObserver){supportersObserver.disconnect();supportersObserver=null;}
  }

  function resetSupportersPagination(clearList){
    disconnectSupportersObserver();
    supporterKeys=Object.create(null);
    supportersOffset=0;
    supportersHasMore=true;
    if(clearList&&supportersList)supportersList.innerHTML='';
    setSupportersLoader('',false);
  }

  function renderSupporters(items,append){
    if(!supportersSection||!supportersList||!supportersStatus)return 0;
    var records=(Array.isArray(items)?items:[]).filter(function(item){
      return String(item&&(item.username||item.user_username)||'').replace(/^@/,'').trim();
    }).sort(function(a,b){
      var timeDifference=supporterTime(b)-supporterTime(a);
      if(timeDifference)return timeDifference;
      return supporterKey(a).localeCompare(supporterKey(b));
    });

    supportersSection.hidden=false;
    if(!append){
      supporterKeys=Object.create(null);
      supportersList.innerHTML='';
    }

    var fresh=records.filter(function(item){
      var key=supporterKey(item);
      if(!key||supporterKeys[key])return false;
      supporterKeys[key]=true;
      return true;
    });

    if(!fresh.length&&!append){
      supportersStatus.hidden=false;
      supportersStatus.textContent='Nenhum apoiador para exibir ainda.';
      return 0;
    }

    if(fresh.length){
      supportersStatus.hidden=true;
      supportersList.insertAdjacentHTML('beforeend',fresh.map(supporterMarkup).join(''));
      bindSupporterImageFallbacks();
    }
    return fresh.length;
  }

  async function fetchSupporters(limit,offset){
    var client=window.beBackend&&window.beBackend.client;
    if(!client||typeof client.rpc!=='function')throw new Error('supporters_rpc_unavailable');
    var result=await client.rpc('get_public_donation_supporters',{
      p_limit:limit,
      p_offset:offset
    });
    if(result&&result.error)throw result.error;
    return Array.isArray(result&&result.data)?result.data:[];
  }

  function observeSupportersEnd(){
    if(!supportersLoaded||!supportersHasMore||!isRoute()||page.hidden)return;
    var sentinel=ensureSupportersSentinel();
    if(!sentinel)return;
    sentinel.hidden=false;
    if('IntersectionObserver' in window){
      if(!supportersObserver){
        supportersObserver=new IntersectionObserver(function(entries){
          if(entries.some(function(entry){return entry.isIntersecting;}))loadMoreSupporters();
        },{root:null,rootMargin:'520px 0px',threshold:0});
      }
      supportersObserver.observe(sentinel);
    }else handleSupportersScroll();
  }

  function handleSupportersScroll(){
    if('IntersectionObserver' in window||supportersScrollTicking||!supportersLoaded||!supportersHasMore||supportersLoading||!isRoute()||page.hidden)return;
    supportersScrollTicking=true;
    window.requestAnimationFrame(function(){
      supportersScrollTicking=false;
      var sentinel=ensureSupportersSentinel();
      if(!sentinel)return;
      if(sentinel.getBoundingClientRect().top<=window.innerHeight+520)loadMoreSupporters();
    });
  }

  async function loadSupporters(force){
    if(!supportersSection||!supportersList||!supportersStatus)return [];
    if(supportersLoaded&&!force){observeSupportersEnd();return [];}
    if(supportersLoading)return supportersLoading;
    if(force){supportersLoaded=false;resetSupportersPagination(true);}
    supportersSection.hidden=false;
    supportersStatus.hidden=false;
    supportersStatus.textContent='Carregando apoiadores…';
    supportersLoading=(async function(){
      try{
        var records=await fetchSupporters(SUPPORTERS_INITIAL_LIMIT,0);
        renderSupporters(records,false);
        supportersOffset=records.length;
        supportersHasMore=records.length===SUPPORTERS_INITIAL_LIMIT;
        supportersLoaded=true;
        setSupportersLoader('',false);
        if(supportersHasMore)observeSupportersEnd();
        return records;
      }catch(error){
        console.warn('Não foi possível carregar os apoiadores:',error);
        supportersSection.hidden=true;
        return [];
      }finally{
        supportersLoading=null;
      }
    })();
    return supportersLoading;
  }

  async function loadMoreSupporters(){
    if(!supportersLoaded||!supportersHasMore||supportersLoading||!isRoute()||page.hidden)return [];
    setSupportersLoader('Carregando mais apoiadores…',true);
    supportersLoading=(async function(){
      try{
        var records=await fetchSupporters(SUPPORTERS_BATCH_SIZE,supportersOffset);
        supportersOffset+=records.length;
        renderSupporters(records,true);
        supportersHasMore=records.length===SUPPORTERS_BATCH_SIZE;
        if(!supportersHasMore)disconnectSupportersObserver();
        return records;
      }catch(error){
        console.warn('Não foi possível carregar mais apoiadores:',error);
        return [];
      }finally{
        setSupportersLoader('',false);
        supportersLoading=null;
      }
    })();
    return supportersLoading;
  }

  function notificationTime(item){
    var value=item&&(item.updatedAt||item.updated_at||item.createdAt||item.created_at||item.date)||'';
    var time=new Date(value).getTime();
    return Number.isFinite(time)?time:0;
  }

  function notificationPlainText(value){
    var source=String(value||'');
    if(window.beMarkdownPlainText)return window.beMarkdownPlainText(source);
    return source
      .replace(/!\[[^\]]*\]\([^)]*\)/g,' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g,'$1')
      .replace(/[*_~`>#-]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function trimNotification(value,max){
    var text=notificationPlainText(value);
    return text.length>max?text.slice(0,max-1).trim()+'…':text;
  }

  function renderNotificationPreview(){
    if(!notificationPreviewList)return;
    var inbox=window.BETVNotificationsInbox;
    var visibleItems=notificationItems.filter(function(item){return !(inbox&&typeof inbox.isRead==='function'&&inbox.isRead(item));});
    if(!visibleItems.length){
      notificationPreviewList.innerHTML='<div class="notification-preview-empty"><strong>Nenhuma atualização</strong></div>';
      return;
    }
    notificationPreviewList.innerHTML=visibleItems.slice(0,3).map(function(item){
      return '<button class="notification-preview-item" type="button" data-donate-notification-id="'+esc(item.id)+'">'+
        '<span class="notification-preview-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A8.5 8.5 0 0 0 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.7v4.7l3.2 1.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+ 
        '<span class="notification-preview-copy"><strong>'+esc(item.title||'Atualização')+'</strong><span>'+esc(trimNotification(item.description,100)||'Confira esta atualização.')+'</span></span>'+ 
        '<span class="notification-preview-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+ 
      '</button>';
    }).join('');
  }

  async function loadNotificationPreview(force){
    if(notificationLoaded&&!force)return notificationItems;
    if(notificationLoading)return notificationLoading;
    if(notificationPreviewList)notificationPreviewList.innerHTML='<div class="notification-preview-empty">Carregando…</div>';
    notificationLoading=(async function(){
      try{
        if(!window.beBackend)throw new Error('backend');
        await window.beBackend.ready;
        var items=await window.beBackend.data.list('notifications',{orderBy:'createdAt',direction:'desc'});
        notificationItems=(Array.isArray(items)?items:[])
          .filter(function(item){return active(item)&&String(item.title||'').trim();})
          .sort(function(a,b){return notificationTime(b)-notificationTime(a);});
        notificationLoaded=true;
        renderNotificationPreview();
      }catch(error){
        console.warn('Não foi possível carregar as notificações na página de ONGs:',error);
        notificationItems=[];
        notificationLoaded=true;
        if(notificationPreviewList)notificationPreviewList.innerHTML='<div class="notification-preview-empty"><strong>Não foi possível carregar</strong></div>';
      }finally{
        notificationLoading=null;
      }
      return notificationItems;
    })();
    return notificationLoading;
  }

  function closeNotificationPopup(){
    if(notificationPopup)notificationPopup.classList.remove('open');
    if(notificationButton)notificationButton.setAttribute('aria-expanded','false');
  }

  function toggleNotificationPopup(event){
    if(event){event.preventDefault();event.stopPropagation();}
    if(!notificationPopup||!notificationButton)return;
    var opening=!notificationPopup.classList.contains('open');
    notificationPopup.classList.toggle('open',opening);
    notificationButton.setAttribute('aria-expanded',String(opening));
    if(opening){
      window.dispatchEvent(new CustomEvent('be:close-notification-menus'));
      loadNotificationPreview(false);
    }
  }

  function markNotificationsRead(){
    var inbox=window.BETVNotificationsInbox;
    if(inbox&&typeof inbox.markAllRead==='function')inbox.markAllRead();
    else try{localStorage.setItem(NOTIFICATION_STORAGE_KEY,String(Date.now()));}catch(_){ }
    renderNotificationPreview();
    var sourceDot=document.getElementById('notificationUnreadDot');
    var pageDot=document.getElementById('donatePageUnreadDot');
    if(sourceDot)sourceDot.hidden=true;
    if(pageDot)pageDot.hidden=true;
  }

  function openNotificationPage(id){
    closeNotificationPopup();
    var route='/atualizacoes'+(id?'/'+encodeURIComponent(id):'');
    if(window.BETVPublicRoutes)window.BETVPublicRoutes.go(route);
    else location.href=window.BETVLocaleURL?window.BETVLocaleURL(route):route;
  }

  async function load(force){
    if(loaded&&!force)return;
    if(loading)return loading;
    status.hidden=false;status.textContent='Carregando ONGs…';
    loading=(async function(){
      try{
        if(!window.beBackend)throw new Error('backend');
        await window.beBackend.ready;
        var results=await Promise.all([
          window.beBackend.data.list('ongs',{orderBy:'order',direction:'asc'}),
          window.beBackend.data.get('settings','ong').catch(function(){return null;})
        ]);
        await preloadPageBanner(results[1]);
        applyPageBanner(results[1]);
        render(results[0]);
        loaded=true;
        loadSupporters(force);
        signalDonateVisualReady();
      }catch(error){
        console.warn('Não foi possível carregar as ONGs:',error);
        list.innerHTML='';
        status.hidden=false;
        status.textContent='Não foi possível carregar as ONGs agora. Tente novamente em instantes.';
        signalDonateVisualReady();
      }finally{
        loading=null;
      }
    })();
    return loading;
  }

  function open(){
    document.body.classList.add('donate-page-active');
    page.hidden=false;
    page.setAttribute('aria-hidden','false');
    syncAvatar();
    syncUnread();
    if(loaded)signalDonateVisualReady();else load(false);
    if(supportersLoaded)observeSupportersEnd();
    document.title='Billie Eilish TV';
  }

  function close(){
    closeNotificationPopup();
    disconnectSupportersObserver();
    document.body.classList.remove('donate-page-active');
    page.hidden=true;
    page.setAttribute('aria-hidden','true');
    document.title='Billie Eilish TV';
  }

  document.addEventListener('click',function(event){
    var link=event.target&&event.target.closest?event.target.closest('[data-open-donate="true"]'):null;
    if(!link)return;
    event.preventDefault();
    if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/ong');
    else location.assign(window.BETVLocaleURL?window.BETVLocaleURL('/ong'):'/ong');
  });

  if(home)home.addEventListener('click',function(){
    closeNotificationPopup();
    if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/');
    else location.href=window.BETVLocaleURL?window.BETVLocaleURL('/'):'/';
  });

  if(showMoreButton)showMoreButton.addEventListener('click',showNextNgoBatch);
  if(ngoMobileMedia){
    if(typeof ngoMobileMedia.addEventListener==='function')ngoMobileMedia.addEventListener('change',syncNgoVisibility);
    else if(typeof ngoMobileMedia.addListener==='function')ngoMobileMedia.addListener(syncNgoVisibility);
  }
  if(supportersList)supportersList.addEventListener('click',function(event){
    var link=event.target&&event.target.closest?event.target.closest('[data-supporter-profile]'):null;
    if(!link||!window.BETVPublicRoutes)return;
    event.preventDefault();
    window.BETVPublicRoutes.go(link.getAttribute('href')||'/');
  });
  if(notificationButton)notificationButton.addEventListener('click',toggleNotificationPopup);
  if(notificationClose)notificationClose.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();closeNotificationPopup();});
  if(notificationMarkAll)notificationMarkAll.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();markNotificationsRead();});
  if(notificationViewAll)notificationViewAll.addEventListener('click',function(){openNotificationPage('');});
  if(notificationPreviewList)notificationPreviewList.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-donate-notification-id]'):null;
    if(button){
      var id=button.getAttribute('data-donate-notification-id')||'';
      var inbox=window.BETVNotificationsInbox;
      if(inbox&&typeof inbox.markRead==='function')inbox.markRead(id);
      renderNotificationPreview();
      openNotificationPage(id);
    }
  });
  window.addEventListener('be:notification-read-state-changed',renderNotificationPreview);
  if(notificationPopup)notificationPopup.addEventListener('click',function(event){event.stopPropagation();});

  if(avatar)avatar.addEventListener('click',function(){
    closeNotificationPopup();
    var account=window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;
    if(!account){
      if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/login');
      else location.href=window.BETVLocaleURL?window.BETVLocaleURL('/login'):'/login';
      return;
    }
    close();
    window.setTimeout(function(){
      var profileAction=document.querySelector('#userDropdown [data-public-action="profile"]');
      if(profileAction){profileAction.click();return;}
      window.dispatchEvent(new CustomEvent('be:open-profile-route'));
    },0);
  });

  document.addEventListener('click',function(event){
    if(notificationPopup&&notificationPopup.classList.contains('open')&&notificationWrap&&!notificationWrap.contains(event.target))closeNotificationPopup();
  });
  document.addEventListener('keydown',function(event){if(event.key==='Escape')closeNotificationPopup();});

  var originalDot=document.getElementById('notificationUnreadDot');
  if(originalDot&&window.MutationObserver)new MutationObserver(syncUnread).observe(originalDot,{attributes:true,attributeFilter:['hidden','class']});
  var originalAvatar=document.getElementById('publicUserPhoto');
  if(originalAvatar&&window.MutationObserver)new MutationObserver(syncAvatar).observe(originalAvatar,{attributes:true,attributeFilter:['src','hidden']});

  if(!('IntersectionObserver' in window))window.addEventListener('scroll',handleSupportersScroll,false);
  window.addEventListener('be:open-donate-page',function(){open();});
  window.addEventListener('be:close-donate-page',function(){close();});
  window.addEventListener('be:profile-avatar-changed',syncAvatar);
  window.addEventListener('be:profile-device-synced',syncAvatar);
  if(window.beBackend&&window.beBackend.auth&&typeof window.beBackend.auth.onChange==='function')window.beBackend.auth.onChange(function(){if(isRoute())syncAvatar();});
  window.addEventListener('be:content-ready',function(){
    notificationLoaded=false;
    supportersLoaded=false;
    resetSupportersPagination(true);
    if(isRoute()){
      load(true);
      if(notificationPopup&&notificationPopup.classList.contains('open'))loadNotificationPreview(true);
    }
  });
  window.addEventListener('pageshow',function(){if(isRoute())open();});
  window.addEventListener('popstate',function(){if(isRoute())open();else if(document.body.classList.contains('donate-page-active'))close();});
  window.addEventListener('hashchange',function(){if(isRoute())open();else if(document.body.classList.contains('donate-page-active'))close();});
  if(isRoute())open();
})();


/* Página desktop de fãs e comunidades que ajudaram o site. */
(function(){
  'use strict';
  if(String(location.hash||'').startsWith('#/admin'))return;

  var page=document.getElementById('fansPage');
  var home=document.getElementById('fansPageHome');
  var accountButton=document.getElementById('fansPageAccount');
  var accountFrame=document.getElementById('fansPageAvatarFrame');
  var accountImage=document.getElementById('fansPageAvatarImage');
  var accountLabel=document.getElementById('fansPageLoginLabel');
  var list=document.getElementById('fansPageList');
  var status=document.getElementById('fansPageStatus');
  var sentinel=document.getElementById('fansPageSentinel');
  var footerLinks=Array.from(document.querySelectorAll('[data-open-fans="true"]'));
  var loaded=false;
  var loading=null;
  var offset=0;
  var hasMore=true;
  var observer=null;
  var keys=Object.create(null);
  var INITIAL_LIMIT=48;
  var BATCH_LIMIT=12;

  if(!page||!list||!status)return;

  function mobile(){return Boolean(window.matchMedia&&window.matchMedia('(max-width:900px)').matches);}
  function cleanPath(){try{return decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/'))).replace(/\/+$/,'')||'/';}catch(_){return String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';}}
  function isRoute(){var path=cleanPath().toLowerCase(),hash=String(location.hash||'').toLowerCase();return path==='/fãs'||path==='/fas'||path==='/fans'||hash==='#fãs'||hash==='#/fãs'||hash==='#fas'||hash==='#/fas'||hash==='#fans'||hash==='#/fans';}
  function localized(path){return window.BETVLocaleURL?window.BETVLocaleURL(path):path;}
  function t(source,variables){return window.BETVI18n&&typeof window.BETVI18n.t==='function'?window.BETVI18n.t(source,variables||{}):String(source||'').replace(/\{([a-zA-Z0-9_]+)\}/g,function(_,key){return variables&&Object.prototype.hasOwnProperty.call(variables,key)?variables[key]:_;});}
  function currentAccount(){return window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;}
  function syncAccount(){
    if(!accountButton)return;
    var account=currentAccount();
    var source=document.getElementById('publicUserPhoto');
    if(account){
      var avatar=source&&!source.hidden?String(source.getAttribute('src')||'').trim():'';
      if(!avatar)avatar=window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png';
      accountButton.classList.remove('is-login');
      accountButton.setAttribute('aria-label',t('Abrir perfil'));
      accountButton.title=t('Perfil');
      if(accountFrame){accountFrame.hidden=false;accountFrame.setAttribute('aria-hidden','false');}
      if(accountImage&&accountImage.getAttribute('src')!==avatar)accountImage.setAttribute('src',avatar);
      if(accountLabel)accountLabel.hidden=true;
      return;
    }
    accountButton.classList.add('is-login');
    accountButton.setAttribute('aria-label',t('Entrar na plataforma'));
    accountButton.title=t('Entrar');
    if(accountFrame){accountFrame.hidden=true;accountFrame.setAttribute('aria-hidden','true');}
    if(accountLabel){accountLabel.hidden=false;accountLabel.textContent=t('Entrar');}
  }
  function openAccount(){
    var account=currentAccount();
    if(!account){
      if(window.BETVPublicRoutes&&typeof window.BETVPublicRoutes.go==='function')window.BETVPublicRoutes.go('/login');
      else location.assign(localized('/login'));
      return;
    }
    close();
    window.setTimeout(function(){
      var profileAction=document.querySelector('#userDropdown [data-public-action="profile"]');
      if(profileAction){profileAction.click();return;}
      var handle=document.getElementById('ddUsername');
      var username=handle?String(handle.textContent||'').replace(/^@/,'').trim():'';
      if(username&&window.BETVPublicRoutes)window.BETVPublicRoutes.go('/@'+encodeURIComponent(username));
    },0);
  }
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}
  function mediaUrl(value){var raw=String(value||'').trim();return raw&&window.beMediaUrl?window.beMediaUrl(raw):raw;}
  function initials(value){var parts=String(value||'Fã').trim().split(/\s+/).filter(Boolean);return (parts.slice(0,2).map(function(part){return part.charAt(0);}).join('')||'F').toUpperCase();}
  function typeOf(item){
    var value=String(item&&(item.entry_type||item.entryType)||'user').toLowerCase();
    return value==='creator'?'creator':(value==='community'?'community':'user');
  }
  function key(item){var type=typeOf(item),id=String(item&&(item.entry_id||item.entryId||item.user_id||item.userId)||'').trim();if(id)return type+':'+id;var username=String(item&&(item.username||item.user_username)||'').replace(/^@/,'').trim().toLowerCase();return username?'user:'+username:'';}
  function time(item){var value=new Date(item&&(item.supported_at||item.supportedAt)||0).getTime();return Number.isFinite(value)?value:0;}
  function markup(item){
    var type=typeOf(item);
    var community=type==='community';
    var creator=type==='creator';
    var partner=community||creator;
    var displayName=String(item.display_name||item.displayName||(partner?t('Comunidade'):t('Apoiador'))).trim()||(partner?t('Comunidade'):t('Apoiador'));
    var username=String(item.username||item.user_username||'').replace(/^@/,'').trim();
    var banner=mediaUrl(item.banner_url||item.bannerUrl||'');
    var avatar=mediaUrl(item.avatar_url||item.avatarUrl||(partner?'':window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png'));
    var target=String(item.target_url||item.targetUrl||(username?'/@'+username:'')).trim();
    var route=username?'/@'+encodeURIComponent(username):target;
    var href=partner?target:localized(route);
    var label=partner?t('Abrir comunidade {name}',{name:displayName}):t('Abrir perfil de {name}',{name:displayName});
    var avatarAlt=partner?t('Ícone de {name}',{name:displayName}):t('Avatar de {name}',{name:displayName});
    var attributes=partner?' target="_blank" rel="noopener noreferrer" data-fans-community':' data-fans-profile data-profile-route="'+esc(route)+'"';
    var avatarMarkup=avatar?'<img class="donate-supporter-avatar-image" loading="lazy" decoding="async" src="'+esc(avatar)+'"'+(partner?'':' data-avatar-fallback="/assets/images/profile/default-avatar.png"')+' alt="'+esc(avatarAlt)+'">':'<span class="donate-supporter-avatar-fallback" aria-hidden="true">'+esc(initials(displayName))+'</span>';
    var locale=String(window.BETVLocale&&window.BETVLocale.slug||'pt-br').toLowerCase();
    var tag='';
    if(community){
      tag=locale==='es'?'Comunidad':'Community';
    }else if(creator){
      tag=locale==='en-us'?'Content Creator':(locale==='es'?'Creador de contenido':'Criador de conteúdo');
    }
    return '<a class="donate-supporter-card '+(creator?'is-creator':(community?'is-community':'is-user'))+'" href="'+esc(href)+'"'+attributes+' aria-label="'+esc(label)+'">'+
      '<span class="donate-supporter-banner">'+(banner?'<img class="donate-supporter-banner-image" loading="lazy" decoding="async" src="'+esc(banner)+'" alt="">':'')+'</span>'+ 
      '<span class="donate-supporter-shade" aria-hidden="true"></span>'+ 
      '<span class="donate-supporter-content">'+
        '<span class="donate-supporter-avatar" data-initials="'+esc(initials(displayName))+'">'+avatarMarkup+'</span>'+ 
        '<span class="donate-supporter-copy"><strong class="notranslate" translate="no">'+esc(displayName)+'</strong>'+(partner?'<span class="donate-supporter-tags"><small class="donate-supporter-tag '+(creator?'is-creator-tag':'is-community-tag')+'">'+esc(tag)+'</small></span>':'<small class="notranslate" translate="no">@'+esc(username)+'</small>')+'</span>'+ 
      '</span>'+ 
    '</a>';
  }
  function bindImages(){
    list.querySelectorAll('.donate-supporter-banner-image:not([data-error-bound])').forEach(function(image){image.setAttribute('data-error-bound','true');image.addEventListener('error',function(){image.remove();},{once:true});});
    list.querySelectorAll('.donate-supporter-avatar-image:not([data-error-bound])').forEach(function(image){image.setAttribute('data-error-bound','true');image.addEventListener('error',function(){var card=image.closest('.donate-supporter-card');if(card&&(card.classList.contains('is-community')||card.classList.contains('is-creator'))){var avatar=image.closest('.donate-supporter-avatar');if(avatar)avatar.innerHTML='<span class="donate-supporter-avatar-fallback" aria-hidden="true">'+esc(avatar.getAttribute('data-initials')||'C')+'</span>';return;}if(image.getAttribute('src')!==(window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png'))image.setAttribute('src',window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png');});});
  }
  function render(items,append){
    var records=(Array.isArray(items)?items:[]).filter(function(item){return typeOf(item)==='community'||typeOf(item)==='creator'||String(item&&(item.username||item.user_username)||'').replace(/^@/,'').trim();}).sort(function(a,b){return Number(b.sort_order||b.sortOrder||0)-Number(a.sort_order||a.sortOrder||0)||time(b)-time(a)||key(a).localeCompare(key(b));});
    if(!append){keys=Object.create(null);list.innerHTML='';}
    var fresh=records.filter(function(item){var itemKey=key(item);if(!itemKey||keys[itemKey])return false;keys[itemKey]=true;return true;});
    if(!fresh.length&&!append){status.hidden=false;status.textContent=t('Nenhum fã para exibir ainda.');return 0;}
    if(fresh.length){status.hidden=true;list.insertAdjacentHTML('beforeend',fresh.map(markup).join(''));bindImages();}
    return fresh.length;
  }
  async function fetchBatch(limit,start){
    if(!window.beBackend)throw new Error('backend_unavailable');
    await window.beBackend.ready;
    var client=window.beBackend.client;
    if(!client||typeof client.rpc!=='function')throw new Error('fans_rpc_unavailable');
    var result=await client.rpc('get_public_fan_wall',{p_limit:limit,p_offset:start});
    if(result&&result.error)throw result.error;
    return Array.isArray(result&&result.data)?result.data:[];
  }
  function setLoader(message,visible){if(!sentinel)return;sentinel.textContent=visible?String(message||t('Carregando mais fãs…')):'';sentinel.hidden=!visible;sentinel.classList.toggle('is-loading',Boolean(visible));}
  function disconnect(){if(observer){observer.disconnect();observer=null;}}
  function observe(){
    disconnect();
    if(!hasMore||!sentinel||page.hidden||!isRoute())return;
    sentinel.hidden=false;
    if('IntersectionObserver' in window){observer=new IntersectionObserver(function(entries){if(entries.some(function(entry){return entry.isIntersecting;}))loadMore();},{rootMargin:'420px 0px'});observer.observe(sentinel);}
  }
  async function load(force){
    if(loading)return loading;
    if(loaded&&!force){observe();return;}
    if(force){offset=0;hasMore=true;keys=Object.create(null);list.innerHTML='';}
    status.hidden=false;status.textContent=t('Carregando fãs…');
    loading=(async function(){
      try{var records=await fetchBatch(INITIAL_LIMIT,0);render(records,false);offset=records.length;hasMore=records.length===INITIAL_LIMIT;loaded=true;setLoader('',false);if(hasMore)observe();}
      catch(error){console.warn('Não foi possível carregar os fãs e comunidades:',error);list.innerHTML='';status.hidden=false;status.textContent=t('Não foi possível carregar os fãs agora.');hasMore=false;}
      finally{loading=null;}
    })();
    return loading;
  }
  async function loadMore(){
    if(loading||!loaded||!hasMore||page.hidden||!isRoute())return;
    setLoader(t('Carregando mais fãs…'),true);
    loading=(async function(){
      try{var records=await fetchBatch(BATCH_LIMIT,offset);offset+=records.length;render(records,true);hasMore=records.length===BATCH_LIMIT;if(hasMore)observe();else disconnect();}
      catch(error){console.warn('Não foi possível carregar mais fãs:',error);hasMore=false;disconnect();}
      finally{setLoader('',false);loading=null;}
    })();
    return loading;
  }
  function open(){
    document.body.classList.add('fans-page-active');
    page.hidden=false;page.setAttribute('aria-hidden','false');
    if(window.BETVI18n&&typeof window.BETVI18n.apply==='function')window.BETVI18n.apply(page);
    syncAccount();
    load(false);
    document.title='Billie Eilish TV';
  }
  function close(){disconnect();document.body.classList.remove('fans-page-active');page.hidden=true;page.setAttribute('aria-hidden','true');document.title='Billie Eilish TV';}
  function navigate(path,replace){var target=localized(path);var url=new URL(target,location.origin);var state={beRoute:path};history[replace?'replaceState':'pushState'](state,'',url.pathname+(location.search||''));window.dispatchEvent(new PopStateEvent('popstate',{state:state}));}
  function goHome(replace){navigate('/',Boolean(replace));}

  footerLinks.forEach(function(footerLink){
    footerLink.href=localized('/fãs');
    footerLink.addEventListener('click',function(event){if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();navigate('/fãs',false);});
  });
  if(home)home.addEventListener('click',function(){goHome(false);});
  if(accountButton)accountButton.addEventListener('click',openAccount);
  var sourceAccountPhoto=document.getElementById('publicUserPhoto');
  if(window.MutationObserver&&sourceAccountPhoto)new MutationObserver(syncAccount).observe(sourceAccountPhoto,{attributes:true,attributeFilter:['src','hidden']});
  if(accountImage)accountImage.addEventListener('error',function(){accountImage.setAttribute('src',window.BETV_DEFAULT_AVATAR||'/assets/images/profile/default-avatar.png');});
  if(window.beBackend&&window.beBackend.ready)Promise.resolve(window.beBackend.ready).then(function(){if(window.beBackend.auth&&typeof window.beBackend.auth.onChange==='function')window.beBackend.auth.onChange(syncAccount);syncAccount();}).catch(function(){syncAccount();});
  list.addEventListener('click',function(event){var link=event.target&&event.target.closest?event.target.closest('[data-fans-profile]'):null;if(!link)return;event.preventDefault();navigate(link.getAttribute('data-profile-route')||'/',false);});
  window.addEventListener('be:open-fans-page',open);
  window.addEventListener('be:close-fans-page',close);
  window.addEventListener('be:profile-avatar-changed',syncAccount);
  window.addEventListener('be:profile-device-synced',syncAccount);
  window.addEventListener('be:guest-access',syncAccount);
  window.addEventListener('be:i18n-ready',function(){if(!page.hidden&&window.BETVI18n)window.BETVI18n.apply(page);syncAccount();if(window.BETVI18n)footerLinks.forEach(function(footerLink){window.BETVI18n.apply(footerLink);});});
  window.addEventListener('be:content-ready',function(){loaded=false;if(isRoute())load(true);});
  window.addEventListener('be:favorites-changed',function(){if(currentAlbum&&!page.hidden)syncAlbumFavorite();});
  window.addEventListener('popstate',function(){if(!isRoute()&&document.body.classList.contains('fans-page-active'))close();});
  window.addEventListener('hashchange',function(){if(!isRoute()&&document.body.classList.contains('fans-page-active'))close();});
  window.addEventListener('resize',function(){if(isRoute()&&!page.hidden)window.requestAnimationFrame(function(){window.scrollTo(0,window.scrollY);});});
})();


/* Página pública de Álbuns & Singles */
;(function(){
  'use strict';
  var page=document.getElementById('albumPage');
  var rail=document.getElementById('albumPageRail');
  var detail=document.getElementById('albumPageDetail');
  var status=document.getElementById('albumPageStatus');
  var cover=document.getElementById('albumDetailCover');
  var title=document.getElementById('albumDetailTitle');
  var type=document.getElementById('albumDetailType');
  var meta=document.getElementById('albumDetailMeta');
  var player=document.getElementById('albumDetailPlayer');
  var favorite=document.getElementById('albumDetailFavorite');
  var tracks=document.getElementById('albumTrackList');
  var back=document.getElementById('albumPageBack');
  if(!page||!rail||!detail||!status||!cover||!title||!type||!meta||!player||!favorite||!tracks)return;

  var records=[];
  var loaded=false;
  var loading=null;
  var activeSearch='';
  var currentAlbum=null;
  function esc(value){return String(value==null?'':value).replace(/[&<>\"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[char];});}
  function t(value,vars){return window.BETVI18n&&typeof window.BETVI18n.t==='function'?window.BETVI18n.t(value,vars):String(value||'').replace(/\{(\w+)\}/g,function(_,key){return vars&&vars[key]!=null?vars[key]:_;});}
  function localized(path){return window.BETVLocaleURL?window.BETVLocaleURL(path):path;}
  function cleanPath(){try{return decodeURIComponent(String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/'))).replace(/\/+$/,'')||'/';}catch(_){return String(location.pathname||'/').replace(/\/+$/,'')||'/';}}
  function routeId(){var match=cleanPath().match(/^\/(?:albuns|álbuns|albums)\/([^/]+)$/i);if(match){try{return decodeURIComponent(match[1]);}catch(_){return match[1];}}var hash=String(location.hash||'').match(/^#\/?(?:albuns|álbuns|albums)\/([^/?#]+)/i);if(!hash)return '';try{return decodeURIComponent(hash[1]);}catch(_){return hash[1];}}
  function isRoute(){return /^\/(?:albuns|álbuns|albums)(?:\/[^/]+)?$/i.test(cleanPath())||/^#\/?(?:albuns|álbuns|albums)(?:\/|$)/i.test(String(location.hash||''));}
  function navigate(path,replace){var target=localized(path);var url=new URL(target,location.origin);history[replace?'replaceState':'pushState']({beRoute:path},'',url.pathname+(location.search||''));window.dispatchEvent(new PopStateEvent('popstate',{state:{beRoute:path}}));}
  function image(value){var raw=String(value||'').trim();if(!raw)return '';if(/^\/(?!\/)/.test(raw)||/^https:\/\//i.test(raw))return raw;return '';}
  function href(value){var raw=String(value||'').trim();if(!raw)return '';try{var url=new URL(raw,location.origin);return url.protocol==='https:'?url.href:'';}catch(_){return '';}}
  function trackCountLabel(count){return count===1?t('1 música'):t('{count} músicas',{count:count});}
  function albumTypeLabel(value){return String(value||'').toLowerCase()==='single'?t('Single'):t('Álbum');}
  function normalize(value){return String(value==null?'':value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function searchable(album){var albumTracks=Array.isArray(album&&album.tracks)?album.tracks:[];return normalize([album&&album.title,album&&album.type,album&&album.year].concat(albumTracks.map(function(track){return track&&track.title;})).filter(Boolean).join(' '));}
  function findBySearch(query){var normalized=normalize(query);if(!normalized)return null;return records.find(function(album){return searchable(album).includes(normalized);})||null;}
  function albumSavedRecord(album){
    var id=String(album&&album.id||'').trim();
    var rawImage=String(album&&(album.imageUrl||album.thumbnailUrl||album.bannerUrl)||'');
    var storedImage=window.beMediaUrl?window.beMediaUrl(rawImage):rawImage;if(storedImage==='#')storedImage='';
    return {
      itemId:id?'album:'+id:'',
      recordId:id,
      favoriteId:id?'albums:'+id:'',
      title:String(album&&album.title||'Álbum'),
      year:String(album&&album.year||''),
      duration:'',
      contentUrl:id?'/albuns/'+encodeURIComponent(id):'#',
      imageUrl:storedImage,
      bannerUrl:storedImage,
      collection:'albums'
    };
  }
  function syncAlbumFavorite(){
    if(!favorite)return;
    var active=Boolean(currentAlbum&&typeof window.beIsSavedContent==='function'&&window.beIsSavedContent(albumSavedRecord(currentAlbum)));
    favorite.classList.toggle('active',active);
    favorite.setAttribute('aria-pressed',String(active));
    favorite.setAttribute('aria-label',active?t('Remover álbum dos salvos'):t('Salvar álbum'));
    favorite.title=active?t('Remover álbum dos salvos'):t('Salvar álbum');
  }

  function setSearchContext(active){
    var desktop=document.getElementById('homeSearchInput');
    var mobileInput=document.getElementById('mobileSearchInput');
    var placeholder=active?t('Pesquisar álbuns'):t('Pesquisar filmes e vídeos');
    [desktop,mobileInput].forEach(function(field){if(!field)return;field.placeholder=placeholder;field.setAttribute('aria-label',placeholder);});
  }

  function renderRail(selectedId){
    rail.innerHTML=records.map(function(album){
      var active=String(album.id)===String(selectedId);
      var albumTitle=String(album.title||'Álbum');
      var albumImage=image(album.imageUrl||album.thumbnailUrl||album.bannerUrl);
      return '<a class="album-page-cover-card'+(active?' active':'')+'" href="'+esc(localized('/albuns/'+encodeURIComponent(String(album.id))))+'" data-album-id="'+esc(String(album.id))+'" aria-current="'+(active?'true':'false')+'">'+
        '<span>'+(albumImage?'<img src="'+esc(albumImage)+'" alt="'+esc(albumTitle)+'" loading="lazy" decoding="async" referrerpolicy="no-referrer">':'<i aria-hidden="true">♪</i>')+'</span>'+
        '<strong class="notranslate" translate="no">'+esc(albumTitle)+'</strong><small>'+esc([albumTypeLabel(album.type),String(album.year||'')].filter(Boolean).join(' • '))+'</small></a>';
    }).join('');
  }

  function renderSelected(album){
    currentAlbum=album||null;
    if(!album){detail.hidden=true;status.hidden=false;status.textContent=t('Nenhum álbum ou single publicado.');return;}
    var albumTracks=(Array.isArray(album.tracks)?album.tracks:[]).slice().sort(function(a,b){return Number(a&&a.order||0)-Number(b&&b.order||0);});
    var albumTitle=String(album.title||'Álbum');
    var albumImage=image(album.imageUrl||album.thumbnailUrl||album.bannerUrl);
    var playerUrl=href(album.contentUrl||album.link);
    type.textContent=albumTypeLabel(album.type);
    title.textContent=albumTitle;
    meta.textContent=[String(album.year||''),trackCountLabel(albumTracks.length)].filter(Boolean).join(' • ');
    cover.src=albumImage||'/assets/images/profile/default-avatar.png';
    cover.alt=albumTitle;
    cover.referrerPolicy='no-referrer';
    player.href=playerUrl||'#';
    player.hidden=!playerUrl;
    player.setAttribute('aria-label',t('Ouvir álbum'));
    player.title=t('Ouvir álbum');
    syncAlbumFavorite();
    tracks.innerHTML=albumTracks.length?albumTracks.map(function(track,index){return '<li><span class="album-track-index">'+(index+1)+'</span><strong class="notranslate" translate="no">'+esc(track&&track.title||'')+'</strong><small>'+esc(track&&track.duration||'')+'</small></li>';}).join(''):'<li class="album-track-empty">'+esc(t('Nenhuma faixa cadastrada.'))+'</li>';
    status.hidden=true;detail.hidden=false;
    renderRail(album.id);
    document.title='Billie Eilish TV';
    if(window.BETVI18n&&typeof window.BETVI18n.apply==='function')window.BETVI18n.apply(page);
  }

  function renderSearch(query){
    activeSearch=String(query||'').trim();
    if(!records.length){renderSelected(null);return;}
    if(!activeSearch){renderSelected(records.find(function(album){return String(album.id)===String(routeId());})||records[0]);return;}
    var match=findBySearch(activeSearch);
    if(match){renderSelected(match);return;}
    currentAlbum=null;detail.hidden=true;status.hidden=false;status.textContent=t('Nenhum álbum encontrado para “{query}”.',{query:activeSearch});
  }

  async function load(force){
    if(loading)return loading;
    if(loaded&&!force){renderSearch(activeSearch);return;}
    status.hidden=true;status.textContent='';detail.hidden=true;
    loading=(async function(){
      try{
        if(!window.beBackend)throw new Error('backend_unavailable');
        await window.beBackend.ready;
        var values=await window.beBackend.data.list('news',{orderBy:'order',direction:'asc'});
        records=(Array.isArray(values)?values:[]).filter(function(album){return album&&album.active!==false&&String(album.title||'').trim();}).sort(function(a,b){return Number(a.order||0)-Number(b.order||0)||String(a.title||'').localeCompare(String(b.title||''),'pt-BR');});
        loaded=true;
        renderSearch(activeSearch);
      }catch(error){console.warn('Não foi possível carregar os álbuns:',error);records=[];status.hidden=false;status.textContent=t('Não foi possível carregar os álbuns agora.');detail.hidden=true;}
      finally{loading=null;}
    })();
    return loading;
  }

  function open(){document.body.classList.add('album-page-active');page.hidden=false;page.setAttribute('aria-hidden','false');document.title='Billie Eilish TV';setSearchContext(true);var field=document.getElementById('homeSearchInput');activeSearch=field?String(field.value||''):'';load(false);}
  function close(){document.body.classList.remove('album-page-active');page.hidden=true;page.setAttribute('aria-hidden','true');document.title='Billie Eilish TV';activeSearch='';currentAlbum=null;setSearchContext(false);}

  if(back)back.addEventListener('click',function(){navigate('/',false);});
  favorite.addEventListener('click',function(){
    if(!currentAlbum||typeof window.beIsSavedContent!=='function'||typeof window.beSetSavedContent!=='function')return;
    var record=albumSavedRecord(currentAlbum);
    var active=window.beIsSavedContent(record);
    window.beSetSavedContent(record,!active);
    syncAlbumFavorite();
  });
  rail.addEventListener('click',function(event){var link=event.target.closest('[data-album-id]');if(!link)return;event.preventDefault();navigate('/albuns/'+encodeURIComponent(link.dataset.albumId),false);});
  document.addEventListener('click',function(event){var link=event.target.closest('[data-album-route],[data-open-albums]');if(!link)return;if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();var path=link.getAttribute('data-album-route')||'/albuns';navigate(path,false);});
  window.addEventListener('be:open-album-page',open);
  window.addEventListener('be:close-album-page',close);
  window.addEventListener('be:album-search',function(event){if(!isRoute()||page.hidden)return;renderSearch(event&&event.detail?event.detail.query:'');});
  window.addEventListener('be:album-search-commit',function(event){if(!isRoute()||page.hidden)return;var query=event&&event.detail?event.detail.query:activeSearch;var match=findBySearch(query)||currentAlbum;if(match)navigate('/albuns/'+encodeURIComponent(String(match.id)),false);});
  window.addEventListener('be:content-ready',function(){loaded=false;if(isRoute())load(true);});
  window.addEventListener('be:i18n-ready',function(){if(!page.hidden){if(window.BETVI18n)window.BETVI18n.apply(page);setSearchContext(true);renderSearch(activeSearch);}});
  window.addEventListener('popstate',function(){if(isRoute()){if(document.body.classList.contains('album-page-active'))load(false);}else if(document.body.classList.contains('album-page-active'))close();});
  window.addEventListener('hashchange',function(){if(isRoute()){if(document.body.classList.contains('album-page-active'))load(false);}else if(document.body.classList.contains('album-page-active'))close();});
})();


/* Compartilhamento do perfil público. */
;(function(){
  'use strict';
  var button=document.getElementById('profilePageShare');
  if(!button)return;

  function currentProfileUrl(){
    try{
      var url=new URL(window.location.href);
      if(/^\/@[^/?#]+$/i.test(url.pathname)||/^\/(?:pt-br|en-us|es)\/@[^/?#]+$/i.test(url.pathname)){
        url.search='';
        url.hash='';
      }
      return url.toString();
    }catch(_){return String(window.location.href||'');}
  }

  function copyText(text){
    if(navigator.clipboard&&typeof navigator.clipboard.writeText==='function'){
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function(resolve,reject){
      try{
        var field=document.createElement('textarea');
        field.value=text;
        field.setAttribute('readonly','');
        field.style.position='fixed';
        field.style.opacity='0';
        field.style.pointerEvents='none';
        document.body.appendChild(field);
        field.select();
        var ok=document.execCommand('copy');
        field.remove();
        if(ok)resolve();else reject(new Error('copy_failed'));
      }catch(error){reject(error);}
    });
  }

  function showCopiedFeedback(){
    var originalTitle=button.getAttribute('title')||'Compartilhar perfil';
    button.setAttribute('title','Link copiado!');
    button.setAttribute('aria-label','Link do perfil copiado');
    button.classList.add('is-copied');
    window.setTimeout(function(){
      button.setAttribute('title',originalTitle);
      button.setAttribute('aria-label','Compartilhar perfil');
      button.classList.remove('is-copied');
    },1800);
  }

  button.addEventListener('click',async function(event){
    event.preventDefault();
    event.stopPropagation();
    var url=currentProfileUrl();
    var name=document.getElementById('profilePageName');
    var title=(name&&String(name.textContent||'').trim())||'Perfil';
    try{
      if(navigator.share){
        await navigator.share({title:title,url:url});
        return;
      }
      await copyText(url);
      showCopiedFeedback();
    }catch(error){
      if(error&&error.name==='AbortError')return;
      try{await copyText(url);showCopiedFeedback();}catch(_){ }
    }
  });
})();

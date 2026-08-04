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
})();

;
window.BE_SUPABASE_CONFIG = Object.freeze({
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
  let supabaseClient = null;

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
    const url = new URL(location.pathname || '/', location.origin);
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
    url.hash = destination === 'admin' ? '#/admin/dashboard' : '#home';
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
      photoURL: (metadata.profile_avatar_id && metadata.profile_avatar_url) ? metadata.profile_avatar_url : '',
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
    try {
      const { data: allowed, error } = await supabaseClient.rpc('is_admin');
      if (!error && allowed === true) return { ...user, role: 'admin' };
    } catch (_) {}

    try {
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.uid)
        .maybeSingle();
      if (!error && profile?.role === 'admin') return { ...user, role: 'admin' };
    } catch (_) {}

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
        imageUrl: `/assets/avatars/avatar-${String(index).padStart(2, '0')}.webp`,
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
          return sortAndFilter(Array.isArray(publicItems) ? publicItems : [], options);
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
        return sortAndFilter(items, options);
      } catch (error) {
        throw mapAuthError(error);
      }
    },
    async get(name, id) {
      try {
        if (!usesProtectedAdminData() && name !== 'users' && name !== 'admin_logs') {
          return await readPublicData(name, id);
        }
        if (name === 'users') {
          const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', id).maybeSingle();
          if (error) throw error;
          return profileFromRow(data);
        }
        if (name === 'settings') {
          const { data, error } = await supabaseClient.from('site_settings').select('*').eq('id', id).maybeSingle();
          if (error) throw error;
          return data ? { id: data.id, ...(data.data || {}), createdAt: data.created_at, updatedAt: data.updated_at } : null;
        }
        if (name === 'admin_logs') {
          const { data, error } = await supabaseClient.from('admin_logs').select('*').eq('id', id).maybeSingle();
          if (error) throw error;
          return data ? { id: data.id, action: data.action, type: data.type, itemId: data.item_id, summary: data.summary, adminUid: data.admin_uid, createdAt: data.created_at } : null;
        }
        const { data, error } = await supabaseClient.from('content_items').select('id,data,created_at,updated_at').eq('collection', name).eq('id', id).maybeSingle();
        if (error) throw error;
        return data ? { id: data.id, ...(data.data || {}), createdAt: data.data?.createdAt || data.created_at, updatedAt: data.data?.updatedAt || data.updated_at } : null;
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
    async get(userId) {
      return data.get('users', userId);
    },
    async ensure(user) {
      if (!user) throw backendError('auth/not-authenticated', 'Faça login para acessar o perfil.');

      // No Supabase, a criação/garantia do perfil passa por uma função SQL
      // SECURITY DEFINER. Ela usa auth.uid() e evita que um INSERT feito no
      // navegador seja bloqueado pelas políticas RLS durante o login/OAuth.
      if (MODE === 'supabase') {
        const metadata = user.raw?.user_metadata || user.raw?.raw_user_meta_data || {};
        const metadataUsername = normalizeUsername(metadata.username || '');

        // O avatar salvo no perfil é a fonte principal. Isso impede que a foto
        // do Google/Discord substitua o avatar escolhido sempre que o usuário
        // entra novamente.
        let savedAvatar = '';
        try {
          const { data: existingProfile, error: existingProfileError } = await supabaseClient
            .from('profiles')
            .select('avatar_url, avatar_id')
            .eq('id', user.uid)
            .maybeSingle();
          if (existingProfileError) console.warn('Não foi possível consultar o avatar salvo:', existingProfileError.message);
          savedAvatar = String(existingProfile?.avatar_id || '').trim() ? String(existingProfile?.avatar_url || '').trim() : '';
        } catch (avatarLookupError) {
          console.warn('Não foi possível consultar o avatar salvo:', avatarLookupError?.message || avatarLookupError);
        }

        const profileArgs = {
          p_display_name: String(user.displayName || metadata.display_name || metadata.full_name || '').trim() || null,
          p_username: metadataUsername || null,
          p_avatar_url: String(savedAvatar || '').trim() || null
        };
        let { data: rows, error } = await supabaseClient.rpc('ensure_my_profile', profileArgs);

        // Contas antigas podem ter guardado nos metadados um @ que outra pessoa
        // já usa. Isso não deve impedir o login: carregamos o perfil sem reaplicar
        // o @ antigo e o usuário poderá escolher outro depois.
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
        const metadataAvatarUrl = String(metadata.profile_avatar_url || '').trim();
        const metadataAvatarId = String(metadata.profile_avatar_id || '').trim();
        if (!(profile.avatarId && profile.avatarUrl)) {
          profile.avatarUrl = metadataAvatarUrl || cachedAvatarUrl || '';
          profile.avatarId = metadataAvatarId || (profile.avatarUrl ? 'saved-selection' : '');
        }
        if (profile.avatarUrl) writeProfileAvatarCache(user.uid, profile.avatarUrl);
        const cachedBanner = readProfileBannerCache(user.uid);
        const metadataBannerUrl = String(metadata.profile_banner_url || metadata.banner_url || '').trim();
        const metadataBannerId = String(metadata.profile_banner_id || metadata.banner_id || '').trim();
        profile.bannerUrl = profile.bannerUrl || metadataBannerUrl || cachedBanner.bannerUrl;
        profile.bannerId = profile.bannerId || metadataBannerId || cachedBanner.bannerId;
        if (profile.bannerUrl) writeProfileBannerCache(user.uid, profile.bannerUrl, profile.bannerId);
        if (currentUser?.uid === user.uid) {
          currentUser = { ...currentUser, role: profile.role === 'admin' ? 'admin' : currentUser.role, photoURL: profile.avatarUrl || '', profile };
        }
        return profile;
      }

      const existing = await data.get('users', user.uid);
      const base = {
        uid: user.uid,
        email: user.email || '',
        displayName: existing?.displayName || user.displayName || '',
        username: existing?.username || '',
        bio: existing?.bio || '',
        avatarUrl: existing?.avatarId ? (existing?.avatarUrl || '') : '',
        avatarId: existing?.avatarId || '',
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
        return profileFromRow(row);
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
      const previousProfile = currentUser?.profile || {};
      let savedProfile = null;
      let databaseError = null;

      writeProfileAvatarCache(userId, normalizedUrl);

      try {
        savedProfile = await this.update(userId, { avatarUrl: normalizedUrl, avatarId: normalizedId });
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
              profile_avatar_id: normalizedId
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
          avatarId: normalizedId || (normalizedUrl ? 'saved-selection' : ''),
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
            avatarId: normalizedId,
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
      const redirectTo = `${location.origin}/?password_recovery=1`;
      const { error } = await supabaseClient.auth.resetPasswordForEmail(String(email || '').trim().toLowerCase(), { redirectTo });
      if (error) throw mapAuthError(error);
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
      if (!currentUser) return { banned: false };
      const localProfile = await profiles.get(currentUser.uid).catch(() => null);
      if (localProfile?.banned) return { banned: true, reason: localProfile.banReason || '' };
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError || !sessionData?.session?.access_token) return { banned: false };
      try {
        const response = await fetch('/api/account-status', {
          headers: { Authorization: `Bearer ${sessionData.session.access_token}` }
        });
        if (!response.ok) return { banned: false };
        const payload = await response.json();
        return { banned: Boolean(payload?.banned), reason: payload?.reason || '', bannedAt: payload?.bannedAt || '' };
      } catch (_) {
        return { banned: false };
      }
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
          storage: window.localStorage
        }
      });

      // O listener é registrado imediatamente para não perder o evento SIGNED_IN
      // emitido durante o retorno do Discord/Google. Eventos vazios nunca apagam
      // uma sessão já confirmada; apenas SIGNED_OUT encerra a conta.
      supabaseClient.auth.onAuthStateChange((event, session) => {
        const eventUser = normalizeUser(session?.user || null);
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
      const duration = item.duration || item.videoDuration || item.runtime || '';
      const year = item.year || '';
      const meta = [
        duration ? `<span class="f-duration">${escapeHtml(duration)}</span>` : '',
        duration && year ? '<span class="f-dot-sep"></span>' : '',
        year ? `<span class="f-year">${escapeHtml(year)}</span>` : ''
      ].join('');
      return `<div class="f-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="f-info">
          <div class="f-logo">${item.logoUrl ? `<img loading="eager" decoding="async" fetchpriority="high" src="${safeAssetUrl(item.logoUrl)}" alt="${escapeHtml(title)}">` : (['movies', 'series'].includes(item.collection) ? `<span class="sr-only">${escapeHtml(title)}</span>` : escapeHtml(title))}</div>
          <div class="f-meta">${meta}</div>
          <p class="f-desc">${escapeHtml(item.description || '')}</p>
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
              data-collection="${escapeHtml(item.collection || 'videos')}">
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
        <div class="f-logo">${item.logoUrl ? `<img loading="eager" decoding="async" fetchpriority="high" src="${safeAssetUrl(item.logoUrl)}" alt="${escapeHtml(title)}">` : escapeHtml(title)}</div>
        <div class="f-meta">${meta}</div>
        <p class="f-desc">${escapeHtml(item.description || '')}</p>
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
            data-collection="${escapeHtml(collection)}">
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
    const [videoRows, movieRows, seriesRows, featuredRows] = await Promise.all([
      beBackend.data.list('videos', { orderBy: 'order', direction: 'asc' }).catch(() => []),
      beBackend.data.list('movies', { orderBy: 'order', direction: 'asc' }).catch(() => []),
      beBackend.data.list('series', { orderBy: 'order', direction: 'asc' }).catch(() => []),
      beBackend.data.list('featured', { orderBy: 'order', direction: 'asc' }).catch(() => [])
    ]);
    const allVideos = videoRows.filter(video => video.active !== false);
    const allMovies = movieRows.filter(movie => movie.active !== false);
    const allSeries = seriesRows.filter(series => series.active !== false);
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
    if (!sections.length && !featuredContents.length) return;

    const old = document.getElementById('dynamicSections');
    if (old) old.remove();

    const host = document.createElement('section');
    host.id = 'dynamicSections';
    host.className = 'video-catalog';
    host.setAttribute('aria-label', 'Categorias de conteúdos');

    if (featuredContents.length) {
      const featuredBlock = document.createElement('section');
      featuredBlock.className = 'video-rail-section featured-video-rail';
      featuredBlock.dataset.category = 'destaque';
      featuredBlock.dataset.collection = 'mixed';
      featuredBlock.dataset.homeView = 'default';
      featuredBlock.innerHTML = `
        <a class="video-rail-title" href="#" aria-label="Ver todos: Destaque">
          <span>Destaque</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <div class="video-rail-shell">
          <button class="video-rail-arrow prev" type="button" aria-label="Ver destaques anteriores" hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div class="video-rail" tabindex="0" aria-label="Destaque">
            ${featuredContents.map(item => videoCard(item)).join('')}
          </div>
          <button class="video-rail-arrow next" type="button" aria-label="Ver mais destaques">
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
          </div>
          <button class="video-rail-arrow next" type="button" aria-label="Ver mais conteúdos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <template class="section-view-all-items">${allSectionContents.length ? allSectionContents.map(item => videoCard(item)).join('') : '<p class="video-rail-empty">Nenhum conteúdo publicado nesta seção.</p>'}</template>`;
      host.append(block);
      setupRail(block);
    }

    main.insertAdjacentElement('afterend', host);
    setupContentDetailInteractions(host);
    setupSectionTitleInteractions(host);
    window.dispatchEvent(new Event('be:catalog-ready'));
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
    const recordId = video.id || video.videoId || title;
    const itemId = numericPublicId(video.publicId || recordId);
    const routeHref = detailRoutePath(itemId);
    return `<a class="video-card" href="${safeUrl(routeHref)}" aria-label="${escapeHtml(title)}"
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
      data-collection="${escapeHtml(normalizeText(collection))}">
      <img class="video-card-thumbnail" src="${safeAssetUrl(image)}" alt="${escapeHtml(video.title || '')}" loading="lazy" decoding="async">
      ${logo && logo !== '#' ? `<span class="video-card-logo-slot" aria-hidden="true"><img class="video-card-logo" src="${safeAssetUrl(logo)}" alt="" loading="lazy" decoding="async" onerror="this.closest('.video-card-logo-slot')?.remove()"></span>` : ''}
    </a>`;
  }

  function cleanPathname() {
    try { return decodeURIComponent(String(location.pathname || '/')).replace(/\/+$/, '') || '/'; }
    catch (_) { return String(location.pathname || '/').replace(/\/+$/, '') || '/'; }
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
    document.body.classList.remove('section-catalog-active');
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
        const title = event.target.closest('.video-rail-title');
        if (!title || !host.contains(title)) return;
        const section = title.closest('.video-rail-section');
        if (!section) return;
        event.preventDefault();
        event.stopPropagation();

        const originView = currentCatalogView();
        const originScrollY = Math.max(0, window.scrollY || 0);
        const sectionTitle = normalizeText(title.querySelector('span')?.textContent || '');
        const sectionCategory = normalizeText(section.dataset.category || '');
        const isFilmsAndSeriesSection = [sectionTitle, sectionCategory].some(value =>
          value.includes('filmes') && value.includes('series')
        );

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
        if (event.target.closest('#logoBtn,[data-home-view],[data-public-action="support"]')) closeSectionView(false);
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
    return `<a class="detail-reco-card" href="${safeUrl(routeHref)}" data-open-detail="true"
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
    const sourceKey = String(current.sourceSectionKey || '');
    const category = String(current.category || '');
    const collection = String(current.collection || '');
    const uniqueById = items => items.filter((item, index, array) => {
      const id = String(item.itemId || item.title || '');
      return array.findIndex(other => String(other.itemId || other.title || '') === id) === index;
    });

    const all = uniqueById(Array.from(catalog.querySelectorAll('.video-card'))
      .map(cardDataWithSection)
      .filter(item => String(item.itemId || item.title || '') !== currentId));

    const sameSection = sourceKey
      ? all.filter(item => String(item.sourceSectionKey || '') === sourceKey)
      : [];
    const similarCategory = all.filter(item => {
      const categoryMatch = category && String(item.category || '') === category;
      const collectionMatch = collection && String(item.collection || '') === collection;
      return categoryMatch || collectionMatch;
    });

    const moreItems = uniqueById([
      ...shuffleItems(similarCategory),
      ...shuffleItems(sameSection),
      ...shuffleItems(all)
    ]).slice(0, 9);

    moreRail.innerHTML = moreItems.length
      ? moreItems.map(recommendationCard).join('')
      : '<p class="detail-reco-empty">Nenhum vídeo semelhante disponível.</p>';

    setupContentDetailInteractions(panel);
    panel.hidden = false;
  }

  function setupDetailControls() {
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
    if (options.updateRoute !== false) setDetailRoute(itemId, Boolean(options.replaceRoute));

    bg.innerHTML = bannerUrl && bannerUrl !== '#'
      ? `<img decoding="async" src="${safeAssetUrl(bannerUrl)}" alt="${escapeHtml(title)}" loading="eager" decoding="async" fetchpriority="high">`
      : '<div class="ph ph-wide" style="height:100%"></div>';

    if (logoUrl && logoUrl !== '#') {
      logo.innerHTML = `<img loading="eager" decoding="async" fetchpriority="high" src="${safeAssetUrl(logoUrl)}" alt="${escapeHtml(title)}">`;
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
    desc.textContent = description;

    play.href = safeUrlValue(contentUrl);
    if (/^https?:\/\//i.test(contentUrl)) {
      play.target = '_blank';
      play.rel = 'noopener';
    } else {
      play.removeAttribute('target');
      play.removeAttribute('rel');
    }

    list.dataset.favoriteId = itemId;
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

  function syncDetailListButton(button, itemId) {
    const favorites = detailFavoriteSet();
    const active = favorites.has(String(itemId || ''));
    const label = active ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  }

  function toggleDetailFavorite(button) {
    const itemId = String(button.dataset.favoriteId || '');
    const favorites = detailFavoriteSet();
    if (favorites.has(itemId)) favorites.delete(itemId); else favorites.add(itemId);
    saveDetailFavoriteSet(favorites);
    syncDetailListButton(button, itemId);
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

  function setupFavoriteButtons(host) {
    const storageKey = 'beFeaturedFavorites';
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch (_) { saved = []; }
    const favorites = new Set(Array.isArray(saved) ? saved.map(String) : []);

    host.querySelectorAll('[data-favorite-id]').forEach(button => {
      const id = String(button.dataset.favoriteId || '');
      const sync = () => {
        const active = favorites.has(id);
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
      };
      sync();
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
        localStorage.setItem(storageKey, JSON.stringify(Array.from(favorites)));
        sync();
      });
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
    const viewButtons = Array.from(document.querySelectorAll('[data-home-view]'));
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
          document.body.classList.contains('legal-page-active') || document.body.classList.contains('login-mode')) return;
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
      const host = document.getElementById('dynamicSections');
      if (!host) return;
      const query = normalizeText(input.value);
      const sections = Array.from(host.querySelectorAll('.video-rail-section'));
      let visibleTotal = 0;

      sections.forEach(section => {
        const sectionCategory = section.dataset.category || '';
        const sectionView = section.dataset.homeView || 'default';
        const cards = Array.from(section.querySelectorAll('.video-card'));
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
      empty.textContent = query
        ? `Nenhum conteúdo encontrado para “${input.value.trim()}”.`
        : 'Nenhum filme ou série publicado.';
      empty.classList.toggle('show', visibleTotal === 0 && sections.length > 0 && Boolean(query));
    };

    viewButtons.forEach(button => {
      button.addEventListener('click', event => {
        const nextView = button.dataset.homeView || 'videos';
        const historyMode = button.dataset.beHistoryMode || (event.isTrusted ? 'push' : 'none');
        delete button.dataset.beHistoryMode;
        if (historyMode === 'push') pushCatalogHistory(currentView, nextView, window.scrollY);
        currentView = nextView;
        document.body.dataset.homeView = currentView;
        setActiveTab(button);
        window.dispatchEvent(new Event('be:detail-close'));
        applyCatalogFilter(true);
        // Ao alternar entre Filmes e Vídeos, sempre reposiciona a página no topo.
        // Isso evita que o destaque, os títulos ou os cards fiquem recortados atrás
        // da barra fixa quando a troca acontece após o usuário já ter rolado a página.
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        });
      });
    });

    supportButton?.addEventListener('click', () => {
      setActiveTab(supportButton);
    });

    logo?.addEventListener('click', event => {
      const historyMode = logo.dataset.beHistoryMode || (event.isTrusted ? 'push' : 'none');
      delete logo.dataset.beHistoryMode;
      if (historyMode === 'push') pushCatalogHistory(currentView, 'home', window.scrollY);
      currentView = 'home';
      document.body.dataset.homeView = currentView;
      setActiveTab(logo);
      input.value = '';
      window.dispatchEvent(new Event('be:detail-close'));
      setSearchOpen(false);
      applyCatalogFilter();
    });

    toggle.addEventListener('click', () => setSearchOpen(!topbar.classList.contains('search-open')));
    input.addEventListener('input', applyCatalogFilter);
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSearchOpen(false);
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
      location.hash = '#login';
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
      location.hash = '#login';
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
      <button class="mobile-profile-button" id="mobileProfileButton" type="button" aria-label="Abrir perfil"><span id="mobileHeaderAvatar">${icon('user')}</span></button>
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
          <span class="mobile-drawer-avatar" id="mobileDrawerAvatar">${icon('user')}</span>
          <span class="mobile-drawer-user"><strong id="mobileDrawerName">Visitante</strong><span id="mobileDrawerUsername">Entrar ou criar conta</span></span>
        </button>
        <button class="mobile-drawer-close" id="mobileDrawerClose" type="button" aria-label="Fechar menu">${icon('close')}</button>
      </div>
      <nav class="mobile-drawer-nav" aria-label="Navegação mobile">
        <button class="mobile-drawer-link active" type="button" data-mobile-destination="home">${icon('home')}<span>Home</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="films">${icon('film')}<span>Filmes</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="videos">${icon('video')}<span>Vídeos</span></button>
        <button class="mobile-drawer-link" type="button" data-mobile-destination="support">${icon('support')}<span>Suporte</span></button>
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
      const profileAvatar = account?.profile?.avatarId && account?.profile?.avatarUrl ? account.profile.avatarUrl : '';
      const shownSrc = window.beMediaUrl ? window.beMediaUrl(src || profileAvatar || '') : (src || profileAvatar || '');
      const safeSrc = String(shownSrc || '').replace(/"/g, '&quot;');
      const avatarMarkup = safeSrc ? `<img loading="lazy" decoding="async" src="${safeSrc}" alt="Avatar">` : icon('user');
      headerAvatar.innerHTML = avatarMarkup;
      drawerAvatar.innerHTML = avatarMarkup;

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
    try{remembered=sessionStorage.getItem('beOAuthDestination')||'';}catch(_){ }
    return String(location.hash||'').startsWith('#/admin')||callback==='admin'||remembered==='admin';
  }
  function adminFrame(content,mode){
    document.documentElement.classList.remove('admin-route-boot');
    document.documentElement.classList.add('admin-mode');
    document.body.classList.add('admin-mode');
    document.documentElement.style.setProperty('overflow','hidden','important');
    document.body.style.setProperty('overflow','hidden','important');
    document.body.innerHTML='<div class="'+(mode==='login'?'protected-admin-login-page':'protected-admin-system-page')+'">'+content+'</div>';
  }
  function showLogin(message){
    adminFrame('<section class="protected-admin-login-shell" aria-label="Entrar no Dashboard Admin"><a class="protected-admin-login-logo" href="/" aria-label="Voltar ao site"><img src="/assets/logo.png?v=3" alt="BE"></a><div class="protected-admin-login-card"><button id="protectedAdminGoogle" class="protected-admin-google-button" type="button"><span class="protected-admin-google-icon" aria-hidden="true">G</span><span class="protected-admin-google-label">Conectar via Google</span></button></div></section>','login');
    var button=document.getElementById('protectedAdminGoogle');
    if(button)button.onclick=async function(){
      var label=button.querySelector('.protected-admin-google-label');
      button.disabled=true;if(label)label.textContent='Conectando…';
      try{await window.beBackend.ready;await window.beBackend.auth.signInWithGoogle();}
      catch(error){button.disabled=false;if(label)label.textContent='Conectar via Google';alert(error&&error.message||message||'Não foi possível entrar.');}
    };
  }
  function showDenied(){
    adminFrame('<section style="width:min(460px,100%);padding:32px;border:1px solid rgba(255,255,255,.13);border-radius:28px;background:#0a0d12;text-align:center"><h1 style="margin:0 0 10px;font-size:27px">Acesso não autorizado</h1><p style="margin:0;color:#9ca7b7;line-height:1.55">Esta conta não possui permissão administrativa.</p><a href="/" style="display:inline-grid;place-items:center;min-height:48px;margin-top:22px;padding:0 22px;border-radius:15px;background:#347ff1;color:#fff;text-decoration:none;font-weight:800">Voltar ao site</a></section>');
  }
  async function loadAdmin(){
    if(loaded||loading||!isAdminRoute())return;
    loading=true;
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
      var response=await fetch('/api/admin-runtime',{method:'GET',headers:{Authorization:'Bearer '+token},cache:'no-store',credentials:'same-origin'});
      if(!response.ok){location.replace('/404.html');return;}
      var source=await response.text();
      await new Promise(function(resolve,reject){
        var blob=new Blob([source],{type:'application/javascript'});
        var blobUrl=URL.createObjectURL(blob);
        var script=document.createElement('script');
        script.src=blobUrl;
        script.async=false;
        script.onload=function(){URL.revokeObjectURL(blobUrl);script.remove();resolve();};
        script.onerror=function(){URL.revokeObjectURL(blobUrl);script.remove();reject(new Error('Não foi possível iniciar o painel.'));};
        document.head.appendChild(script);
      });
      loaded=true;
    }catch(error){
      adminFrame('<section style="width:min(480px,100%);padding:30px;border:1px solid rgba(255,255,255,.13);border-radius:24px;background:#0a0d12;text-align:center"><h1 style="margin:0 0 10px;font-size:25px">Não foi possível carregar o painel</h1><p style="margin:0;color:#9ca7b7;line-height:1.55">'+String(error&&error.message||'Atualize a página e tente novamente.').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})+'</p></section>');
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
      if(!document.body.classList.contains('settings-page-active'))location.assign('/config');
    },180);
  }
  async function activateProfile(account){
    var handle=await profileHandle(account);
    var path='/@'+encodeURIComponent(handle);
    history.pushState({beRoute:'profile'},'',path+(location.search||''));
    window.dispatchEvent(new CustomEvent('be:open-profile-route'));
    window.setTimeout(function(){
      if(!document.body.classList.contains('profile-page-active'))location.assign(path);
    },180);
  }
  document.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-public-action="profile"],[data-public-action="settings"]'):null;
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeMenu();
    var account=currentAccount();
    if(!account){location.hash='#login';document.body.classList.add('login-mode');return;}
    if(button.dataset.publicAction==='settings')activateSettings();
    else activateProfile(account);
  },true);
  window.BETVNavigation={openSettings:activateSettings,openProfile:function(){var account=currentAccount();if(account)return activateProfile(account);location.hash='#login';}};
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
    var profilePageMetaLabel=document.getElementById('profilePageMetaLabel');
    var profilePageMemberSince=document.getElementById('profilePageMemberSince');
    var profilePageMore=document.getElementById('profilePageMore');
    var profilePageLogout=document.getElementById('profilePageLogout');
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
    var onboardingShownFor='';
    var avatarPickerReturnView='';
    var bannerPickerReturnView='';
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

    function escapePublic(value){return String(value||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
    function avatarCacheKey(user){return 'beSelectedAvatar:'+(user&&user.uid?user.uid:'guest');}
    function selectedProfileAvatar(profile){return profile&&profile.avatarId&&profile.avatarUrl?String(profile.avatarUrl):'';}
    function setMainAvatar(url){var shown=String(url||'').trim();if(shown){photo.src=window.beMediaUrl?window.beMediaUrl(shown):shown;photo.hidden=false;fallback.hidden=true;}else{photo.removeAttribute('src');photo.hidden=true;fallback.hidden=false;}updateOnboardingAvatar();}
    function fallbackAvatarSvg(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7.5" r="4"/></svg>';}
    function updateOnboardingAvatar(){if(!onboardingAvatarPreview)return;var shown=selectedAvatar||selectedProfileAvatar(currentProfile)||'';onboardingAvatarPreview.innerHTML=shown?'<img loading="lazy" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(shown):shown)+'" alt="Foto do perfil">':fallbackAvatarSvg();}
    function syncBodyScroll(){var locked=!avatarPicker.hidden||!bannerPicker.hidden||!profileModal.hidden||!profileOnboarding.hidden||(settingsSaveConfirm&&!settingsSaveConfirm.hidden);document.body.style.overflow=locked?'hidden':'';}
    function keepSettingsOpen(){
      if(!auth.currentUser)return;
      profilePage.hidden=true;settingsPage.hidden=false;
      document.body.classList.remove('profile-page-active','login-mode','support-page-active','notification-page-active');
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


    function profileFallbackAvatar(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7.5" r="4"/></svg>';}
    function publicProfileYear(){
      var source=currentProfile&&currentProfile.createdAt?currentProfile.createdAt:beBackend.now();
      var date=new Date(source);
      return String(date.getFullYear()||new Date().getFullYear());
    }
    function cleanPathname(){try{return decodeURIComponent(String(location.pathname||'/')).replace(/\/+$/,'')||'/';}catch(_){return String(location.pathname||'/').replace(/\/+$/,'')||'/';}}
    function isConfigRoute(){var path=cleanPathname().toLowerCase();var hash=location.hash.toLowerCase();return path==='/config'||hash==='#config'||hash==='#/config';}
    function isProfileRoute(){return /^\/@[^/?#]+$/i.test(cleanPathname())||/^#\/perfil\/@[^/?#]+/i.test(location.hash);}
    function profileRoutePath(){
      var handle=beBackend.normalizeUsername((currentProfile&&currentProfile.username)||'perfil');
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
    function renderProfilePage(){
      var user=auth.currentUser;
      if(!user){
        profilePageName.textContent='Entre para ver seu perfil';
        profilePageHandle.textContent='@visitante';
        profilePageBadge.textContent='Visitante';
        profilePageMetaLabel.textContent='Conta desconectada';
        profilePageMemberSince.textContent='';
        profilePageAvatar.innerHTML=profileFallbackAvatar();
        profilePageBanner.hidden=true;profilePageBannerImg.removeAttribute('src');profilePageBannerFallback.hidden=false;
        return;
      }
      var displayName=currentProfile.displayName||user.displayName||'Usuário';
      var handle=currentProfile.username?'@'+currentProfile.username:'@perfil';
      var avatar=selectedProfileAvatar(currentProfile);
      var bannerState=resolvedProfileBanner(user);
      var banner=bannerState.bannerUrl;
      profilePageName.textContent=displayName;
      profilePageHandle.textContent=handle;
      profilePageBadge.textContent='Perfil';
      profilePageMetaLabel.textContent='Conta pessoal';
      profilePageMemberSince.textContent='Membro desde '+publicProfileYear();
      profilePageAvatar.innerHTML=avatar?'<img loading="lazy" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(avatar):avatar)+'" alt="Avatar do perfil">':profileFallbackAvatar();
      applyProfileBanner(banner);
    }
    function renderSettingsPage(){
      var user=auth.currentUser;
      if(!user){
        settingsPageBody.innerHTML='<div class="settings-card"><h2>Entre para continuar</h2><p>Faça login para editar sua conta e personalizar o perfil.</p><div class="settings-btn-row"><button class="settings-button primary" id="settingsLoginAction" type="button">Entrar</button></div></div>';
        document.getElementById('settingsLoginAction').onclick=function(){closePublicPages();location.hash='#login';document.body.classList.add('login-mode');};
        return;
      }
      var avatar=selectedProfileAvatar(currentProfile);
      var bannerState=resolvedProfileBanner(user);
      var banner=bannerState.bannerUrl;
      var identities=user&&user.raw&&Array.isArray(user.raw.identities)?user.raw.identities:[];
      var providers=user&&user.raw&&user.raw.app_metadata&&Array.isArray(user.raw.app_metadata.providers)?user.raw.app_metadata.providers:[];
      var discordConnected=providers.indexOf('discord')>=0||identities.some(function(identity){return String(identity.provider||'').toLowerCase()==='discord';});
      settingsPageBody.innerHTML=''
        +'<div class="settings-grid settings-grid-aligned">'
        +  '<section class="settings-card settings-profile-card"><h2>Perfil</h2><p>Escolha o banner de fundo do perfil e troque o avatar.</p><div class="settings-banner-preview">'+(banner?'<img loading="eager" fetchpriority="high" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(banner):banner)+'" alt="Banner atual">':'')+'<span>'+(banner?'Banner selecionado':'Nenhum banner selecionado')+'</span></div><div class="settings-avatar-row"><div class="settings-avatar-preview">'+(avatar?'<img loading="eager" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(avatar):avatar)+'" alt="Avatar atual">':profileFallbackAvatar())+'</div><div><strong class="settings-avatar-title">Avatar atual</strong><span class="settings-muted">Atualize sua imagem principal do perfil.</span></div></div><div class="settings-btn-row"><button class="settings-button primary" id="settingsChooseBanner" type="button">Escolher banner</button><button class="settings-button" id="settingsChooseAvatar" type="button">Trocar avatar</button></div><div class="settings-status" id="settingsAppearanceStatus"></div></section>'
        +  '<div class="settings-side-stack">'
        +    '<section class="settings-card settings-account-card"><h2>Conta</h2><p>Altere o nome exibido e o @ do seu perfil.</p><form id="settingsAccountForm"><div class="settings-form-grid"><div class="settings-field"><label>Nome</label><input name="displayName" maxlength="50" required value="'+escapePublic(currentProfile.displayName||user.displayName||'')+'"></div><div class="settings-field"><label>@</label><input name="username" maxlength="20" pattern="[a-z0-9._]{3,20}" required value="'+escapePublic(currentProfile.username||'')+'" placeholder="seunome"></div></div><div class="settings-status" id="settingsAccountStatus"></div><div class="settings-btn-row"><button class="settings-button primary" type="submit">Salvar alterações</button></div></form></section>'
        +    '<section class="settings-card settings-connections-card"><h2>Conexões conectadas</h2><p>Conecte o Discord à sua conta.</p><div class="settings-connection"><div><strong>Discord</strong><span class="settings-muted">'+(discordConnected?'Sua conta Discord está conectada.':'Use sua identidade do Discord na plataforma.')+'</span></div><button class="settings-button" id="settingsConnectDiscord" type="button" '+(discordConnected?'disabled':'')+'><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.54 5.34A16.4 16.4 0 0 0 15.44 4l-.5 1.04a15.1 15.1 0 0 0-5.87 0L8.56 4a16.6 16.6 0 0 0-4.11 1.35C1.85 9.2 1.15 12.96 1.5 16.66a16.6 16.6 0 0 0 5.04 2.55l1.23-1.67c-.68-.26-1.33-.58-1.94-.96l.47-.36c3.72 1.72 7.76 1.72 11.44 0l.48.36c-.62.38-1.27.7-1.95.96l1.23 1.67a16.5 16.5 0 0 0 5.03-2.55c.42-4.29-.72-8.01-2.99-11.32ZM8.68 14.5c-1.12 0-2.04-1.03-2.04-2.3 0-1.27.9-2.3 2.04-2.3 1.15 0 2.06 1.04 2.04 2.3 0 1.27-.9 2.3-2.04 2.3Zm6.64 0c-1.12 0-2.04-1.03-2.04-2.3 0-1.27.9-2.3 2.04-2.3 1.15 0 2.06 1.04 2.04 2.3 0 1.27-.89 2.3-2.04 2.3Z"/></svg><span>'+(discordConnected?'Discord conectado':'Conectar Discord')+'</span></button></div><div class="settings-status" id="settingsDiscordStatus"></div></section>'
        +    '<section class="settings-card settings-session-card"><h2>Conta e sessão</h2><p>Saia desta conta ou exclua permanentemente seu acesso e perfil.</p><div class="settings-btn-row"><button class="settings-danger" id="settingsDeleteAccount" type="button">Excluir conta</button><button class="settings-button" id="settingsLogoutAccount" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Sair da conta</span></button></div><div class="settings-status" id="settingsDeleteStatus"></div></section>'
        +  '</div>'
        +'</div>';
      document.getElementById('settingsChooseAvatar').onclick=function(){openAvatarPicker();};
      document.getElementById('settingsChooseBanner').onclick=function(){openBannerPicker();};
      document.getElementById('settingsConnectDiscord').onclick=async function(){
        var msg=document.getElementById('settingsDiscordStatus');
        if(discordConnected){msg.textContent='Discord já está conectado.';msg.className='settings-status ok';return;}
        this.disabled=true;msg.textContent='Abrindo conexão com Discord…';msg.className='settings-status';
        try{sessionStorage.setItem('beOpenSettingsAfterDiscord','1');await auth.connectDiscord();msg.textContent='Redirecionando para o Discord…';msg.className='settings-status ok';}
        catch(error){msg.textContent='Não foi possível conectar: '+(error&&error.message?error.message:'Tente novamente.');msg.className='settings-status err';this.disabled=false;}
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
          window.location.replace('/');
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
          username.textContent='@'+handle;
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
    }
    function openPublicProfile(updateRoute){
      closeDetailBeforeDedicatedPage();
      window.dispatchEvent(new CustomEvent('be:close-section-view'));
      document.body.classList.remove('section-catalog-active');
      toggleDropdown(false);settingsPage.hidden=true;profilePage.hidden=false;
      document.body.classList.remove('settings-page-active','login-mode');document.body.classList.add('profile-page-active');
      try{renderProfilePage();}catch(error){console.error('Falha ao renderizar perfil:',error);}
      var route=profileRoutePath();if(updateRoute!==false)pushPublicRoute(route);else if(isProfileRoute()&&(cleanPathname()!==route||location.hash))replacePublicRoute(route);
      window.scrollTo({top:0,behavior:'auto'});
    }
    function openSettingsPage(updateRoute){
      closeDetailBeforeDedicatedPage();
      window.dispatchEvent(new CustomEvent('be:close-section-view'));
      document.body.classList.remove('section-catalog-active');
      closeNotificationMenus();
      toggleDropdown(false);profilePage.hidden=true;settingsPage.hidden=false;
      document.body.classList.remove('profile-page-active','login-mode');document.body.classList.add('settings-page-active');
      try{renderSettingsPage();}catch(error){console.error('Falha ao renderizar configurações:',error);settingsPageBody.innerHTML='<div class="settings-card"><h2>Configurações</h2><p>Não foi possível carregar esta área. Atualize a página e tente novamente.</p></div>';}
      if(updateRoute!==false&&!isConfigRoute())pushPublicRoute('/config');
      window.scrollTo({top:0,behavior:'auto'});
    }

    function renderProfile(){
      var user=auth.currentUser;
      if(!user){profileBody.innerHTML='<div class="profile-login-required"><h3>Entre para acessar seu perfil</h3><p>Use seu e-mail e senha para continuar.</p><button class="profile-btn primary" id="profileLogin" type="button">Entrar com e-mail</button></div>';document.getElementById('profileLogin').onclick=function(){closeProfile();location.hash='#login';document.body.classList.add('login-mode');};return;}
      var avatar=selectedProfileAvatar(currentProfile);
      profileBody.innerHTML='<div class="profile-intro"><div class="profile-avatar-preview">'+(avatar?'<img loading="lazy" decoding="async" src="'+escapePublic(window.beMediaUrl?window.beMediaUrl(avatar):avatar)+'" alt="Avatar do perfil">':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7.5" r="4"/></svg>')+'</div><div><h3>'+escapePublic(currentProfile.displayName||user.displayName||'Novo perfil')+'</h3><p style="color:var(--ice-faint);margin-top:6px">'+escapePublic(user.email||'')+'</p><div class="profile-avatar-actions"><button class="profile-btn" id="profileChooseAvatar" type="button">Escolher foto</button></div></div></div><form id="profileForm"><div class="profile-form"><div class="profile-field"><label>Nome exibido</label><input name="displayName" maxlength="50" required value="'+escapePublic(currentProfile.displayName||user.displayName||'')+'"></div><div class="profile-field"><label>@ de usuário</label><input name="username" maxlength="20" pattern="[a-z0-9._]{3,20}" required placeholder="ex.: billiefan" value="'+escapePublic(currentProfile.username||'')+'"></div><div class="profile-field full"><label>E-mail</label><input value="'+escapePublic(user.email||'')+'" readonly></div><div class="profile-field full"><label>Biografia</label><textarea name="bio" id="profileBio" rows="4" maxlength="180" placeholder="Conte um pouco sobre você…">'+escapePublic(currentProfile.bio||'')+'</textarea><div class="profile-counter"><span id="profileBioCount">0</span>/180</div></div></div><div class="profile-message" id="profileMessage"></div><div class="profile-actions"><button class="profile-btn" type="button" id="profileCancel">Cancelar</button><button class="profile-btn primary" type="submit">Salvar perfil</button></div></form>';
      document.getElementById('profileChooseAvatar').onclick=function(){closeProfile();openAvatarPicker();};document.getElementById('profileCancel').onclick=closeProfile;
      var bio=document.getElementById('profileBio'),count=document.getElementById('profileBioCount');function updateCount(){count.textContent=bio.value.length;}bio.addEventListener('input',updateCount);updateCount();
      document.getElementById('profileForm').addEventListener('submit',async function(e){e.preventDefault();var form=e.currentTarget,msg=document.getElementById('profileMessage'),submit=form.querySelector('[type="submit"]');var displayName=form.displayName.value.trim(),handle=beBackend.normalizeUsername(form.username.value),bioText=form.bio.value.trim();form.username.value=handle;if(!beBackend.validUsername(handle)){msg.textContent='O @ deve ter de 3 a 20 caracteres, usando letras minúsculas, números, ponto ou underline.';msg.className='profile-message err';return;}submit.disabled=true;msg.textContent='Salvando…';msg.className='profile-message';try{var payload={displayName:displayName,username:handle,bio:bioText,updatedAt:beBackend.now()};currentProfile=await beBackend.profiles.update(user.uid,payload);await auth.updateCurrentUser({displayName:displayName});username.textContent=handle?'@'+handle:(displayName||'Usuário');msg.textContent='Perfil salvo com sucesso.';msg.className='profile-message ok';setTimeout(closeProfile,700);}catch(error){msg.textContent=error&&error.code==='username-in-use'?'Este @ já está em uso. Escolha outro.':'Não foi possível salvar: '+error.message;msg.className='profile-message err';}finally{submit.disabled=false;}});
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
        username.textContent='@'+handle;
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
        location.replace('/#login');
      }catch(error){
        profilePageLogout.disabled=false;
        profilePageLogout.removeAttribute('aria-busy');
        console.error('Não foi possível sair da conta:',error);
        alert('Não foi possível sair da conta. Tente novamente.');
      }
    }

    function openProfile(){openPublicProfile(true);}
    avatarPickerClose.addEventListener('click',closeAvatarPicker);avatarPickerCancel.addEventListener('click',closeAvatarPicker);bannerPickerClose.addEventListener('click',closeBannerPicker);if(bannerPickerCancel)bannerPickerCancel.addEventListener('click',closeBannerPicker);profileClose.addEventListener('click',closeProfile);if(settingsSaveCancel)settingsSaveCancel.addEventListener('click',function(){resolveSettingsConfirm(false);});if(settingsSaveApprove)settingsSaveApprove.addEventListener('click',function(){resolveSettingsConfirm(true);});if(settingsSaveConfirm)settingsSaveConfirm.addEventListener('click',function(event){if(event.target===settingsSaveConfirm)resolveSettingsConfirm(false);});profileModal.addEventListener('click',function(e){if(e.target===profileModal)closeProfile();});profilePageMore.addEventListener('click',function(){openSettingsPage(true);});if(profilePageLogout)profilePageLogout.addEventListener('click',logoutFromProfile);document.getElementById('settingsClosePage').addEventListener('click',function(){openPublicProfile(true);});document.querySelectorAll('[data-home-view],#logoBtn').forEach(function(button){button.addEventListener('click',function(){closePublicPages(true);});});window.addEventListener('be:open-config',function(){openSettingsPage(false);});window.addEventListener('be:open-profile-route',function(){if(auth.currentUser)openPublicProfile(false);});window.addEventListener('popstate',function(){
      if(!avatarPicker.hidden)closeAvatarPicker(false);
      if(!bannerPicker.hidden)closeBannerPicker(false);
      if(!auth.currentUser)return;
      if(isConfigRoute())openSettingsPage(false);
      else if(isProfileRoute())openPublicProfile(false);
      else closePublicPages(false);
    });
    auth.onChange(async function(currentUser){
      dashboard.hidden=true;
      var isAdmin=false;
      if(currentUser){
        try{isAdmin=beBackend.isAdmin(currentUser);currentProfile=await beBackend.profiles.ensure(currentUser);}catch(error){console.warn('Perfil:',error.message);currentProfile={displayName:currentUser.displayName||'',avatarUrl:''};}
        if(currentProfile&&currentProfile.banned){try{await auth.signOut();}catch(_){ }location.replace('/404.html');return;}
        var restoredBanner=resolvedProfileBanner(currentUser);if(restoredBanner.bannerUrl){currentProfile.bannerUrl=restoredBanner.bannerUrl;currentProfile.bannerId=restoredBanner.bannerId;}
        username.textContent=currentProfile.username?'@'+currentProfile.username:(currentProfile.displayName||currentUser.displayName||'Usuário');selectedAvatar=selectedProfileAvatar(currentProfile)||localStorage.getItem(avatarCacheKey(currentUser))||'';setMainAvatar(selectedAvatar);authAction.textContent='Sair';renderProfilePage();if(document.body.classList.contains('settings-page-active'))renderSettingsPage();if(isConfigRoute())setTimeout(function(){openSettingsPage(false);},0);else if(isProfileRoute())setTimeout(function(){openPublicProfile(false);},0);if(sessionStorage.getItem('beOpenSettingsAfterDiscord')==='1'){sessionStorage.removeItem('beOpenSettingsAfterDiscord');setTimeout(function(){openSettingsPage(true);},180);}if(!isAdmin&&!String(currentProfile.username||'').trim()&&onboardingShownFor!==currentUser.uid)setTimeout(function(){openOnboarding(currentUser);},220);
      }else{username.textContent='Visitante';currentProfile={};selectedAvatar='';setMainAvatar('');authAction.textContent='Entrar';renderProfilePage();if(document.body.classList.contains('settings-page-active'))renderSettingsPage();onboardingShownFor='';closeOnboarding(true);}
      dashboard.hidden=!isAdmin;
    });
    document.querySelectorAll('[data-public-action]').forEach(function(button){button.addEventListener('click',async function(){
      var action=button.dataset.publicAction;if(action==='dashboard'){if(!beBackend.isAdmin(auth.currentUser)){dashboard.hidden=true;toggleDropdown(false);return;}location.hash='#/admin/dashboard';return;}if(action==='auth'){if(auth.currentUser){await auth.signOut();toggleDropdown(false);return;}location.hash='#login';document.body.classList.add('login-mode');toggleDropdown(false);return;}if(action==='avatar'){openAvatarPicker();return;}if(action==='profile'){openProfile();return;}if(action==='support'){window.dispatchEvent(new CustomEvent('be:open-support'));return;}if(action==='settings'){openSettingsPage(true);return;}
    });});
    window.addEventListener('be:profile-avatar-changed',function(event){
      var detail=event&&event.detail||{};
      if(!auth.currentUser||detail.userId!==auth.currentUser.uid)return;
      if(detail.profile)currentProfile=detail.profile;
      else currentProfile={...(currentProfile||{}),avatarUrl:detail.avatarUrl||'',avatarId:detail.avatarId||''};
      selectedAvatar=detail.avatarUrl||'';
      localStorage.setItem(avatarCacheKey(auth.currentUser),selectedAvatar);
      setMainAvatar(selectedAvatar);updateOnboardingAvatar();renderProfilePage();if(document.body.classList.contains('settings-page-active')||isConfigRoute()){renderSettingsPage();keepSettingsOpen();}
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
      applyProfileBanner(latestUrl);
      renderProfilePage();
      if(document.body.classList.contains('settings-page-active')||isConfigRoute()){renderSettingsPage();keepSettingsOpen();}
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(settingsSaveConfirm&&!settingsSaveConfirm.hidden){resolveSettingsConfirm(false);return;}closeAvatarPicker();closeBannerPicker();closeProfile();closeOnboarding(false);}});
    setTimeout(function(){if(!auth.currentUser)return;if(isConfigRoute())openSettingsPage(false);else if(isProfileRoute())openPublicProfile(false);},0);
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
  function setSiteLoading(active){document.documentElement.classList.toggle('site-loading-active',Boolean(active));document.body.classList.toggle('site-loading-active',Boolean(active));}
  function hideSiteSkeleton(){var loading=q('authLoading');if(loading)loading.hidden=true;setSiteLoading(false);}
  function showSiteSkeleton(){var loading=q('authLoading');if(loading)loading.hidden=false;setSiteLoading(true);}
  window.addEventListener('be:content-ready',hideSiteSkeleton);

  function q(id){return document.getElementById(id)}
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
  function cleanPathname(){try{return decodeURIComponent(String(location.pathname||'/')).replace(/\/+$/,'')||'/';}catch(_){return String(location.pathname||'/').replace(/\/+$/,'')||'/';}}
  function replaceRoute(route){var url=new URL(location.href);['code','error','error_code','error_description','auth_callback','oauth'].forEach(function(name){url.searchParams.delete(name)});if(String(route||'').startsWith('/')){url.pathname=route;url.hash='';}else{url.pathname='/';url.hash=route||'';}history.replaceState(null,'',url.pathname+(url.search||'')+url.hash);}
  function isConfigRoute(){var path=cleanPathname().toLowerCase(),hash=location.hash.toLowerCase();return path==='/config'||hash==='#config'||hash==='#/config';}
  function isProfileRoute(){return /^\/@[^/?#]+$/i.test(cleanPathname())||/^#\/perfil\/@[^/?#]+/i.test(location.hash);}
  function isVideoRoute(){return /^\/\d{6,12}$/i.test(cleanPathname())||/^#\/video\/[^/?#]+/i.test(location.hash);}
  function isLegalRoute(){return /^#\/?(?:terms|privacy|cookies|dmca)$/i.test(String(location.hash||''));}
  function isNotificationsRoute(){var path=cleanPathname().toLowerCase(),hash=String(location.hash||'').toLowerCase();return path==='/atualizacoes'||path==='/notificacoes'||/^#\/?(?:atualizacoes|notificacoes|updates|notifications)(?:\/|$)/i.test(hash);}
  function isSupportRoute(){var path=cleanPathname().toLowerCase(),hash=String(location.hash||'').toLowerCase();return path==='/suporte'||hash==='#suporte'||hash==='#/suporte'||hash==='#support'||hash==='#/support';}
  function showLegalRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','detail-page-active','support-page-active','notification-page-active');document.body.classList.add('legal-page-active');window.dispatchEvent(new CustomEvent('be:close-notifications'));window.dispatchEvent(new CustomEvent('be:open-legal-route'));window.scrollTo(0,0);}
  function showSupportRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','detail-page-active','notification-page-active');document.body.classList.add('support-page-active');window.dispatchEvent(new CustomEvent('be:close-notifications'));window.dispatchEvent(new CustomEvent('be:open-support'));window.scrollTo(0,0);}
  function showNotificationsRoute(){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','support-page-active','detail-page-active');document.body.classList.add('notification-page-active');window.dispatchEvent(new CustomEvent('be:close-support'));window.dispatchEvent(new CustomEvent('be:open-notifications'));window.scrollTo(0,0);}
  function showLogin(){document.body.classList.remove('profile-page-active','settings-page-active','legal-page-active','support-page-active','notification-page-active');window.dispatchEvent(new CustomEvent('be:close-notifications'));document.body.classList.add('login-mode');if(location.hash!=='#login'&&location.hash!=='#/login')replaceRoute('#login');}
  function enterHome(preserveRoute){document.body.classList.remove('profile-page-active','settings-page-active','login-mode','legal-page-active','support-page-active','notification-page-active');sessionStorage.removeItem('beOAuthDestination');if(!preserveRoute)replaceRoute('/');window.dispatchEvent(new CustomEvent('be:close-support'));window.dispatchEvent(new CustomEvent('be:close-notifications'));window.scrollTo(0,0);}
  function enterConfig(){document.body.classList.remove('profile-page-active','login-mode','support-page-active','notification-page-active');document.body.classList.add('settings-page-active');sessionStorage.removeItem('beOAuthDestination');if(!isConfigRoute())replaceRoute('/config');window.dispatchEvent(new CustomEvent('be:close-support'));window.dispatchEvent(new CustomEvent('be:close-notifications'));window.dispatchEvent(new CustomEvent('be:open-config'));window.scrollTo(0,0);}
  function setMode(mode,email){
    if(email)selectedAuthEmail=String(email).trim().toLowerCase();
    var steps={email:q('emailStep'),password:q('passwordStep'),signup:q('signupStep')};
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
      var target=mode==='email'?q('authEmail'):mode==='password'?q('loginPassword'):q('signupName');
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
    try{await auth.signOut();}catch(_){ }
    location.replace('/404.html');
    return false;
  }

  async function finishPublicLogin(user){
    user=await recoverAuthenticatedUser(user);
    if(!user){var sessionError=new Error('Não foi possível concluir a sessão de login. Tente entrar novamente.');sessionError.code='auth/session-missing';throw sessionError;}
    localStorage.setItem('beAuthExpected','1');
    localStorage.setItem('beSessionUid',user.uid);
    try{currentProfile=await beBackend.profiles.ensure(user);}catch(error){console.warn('Perfil não pôde ser carregado:',error);currentProfile={uid:user.uid,email:user.email||'',displayName:user.displayName||'',username:'',avatarUrl:''};}
    if(!(await enforceAccountAccess(user)))return null;
    setStatus('');
    if(isNotificationsRoute())showNotificationsRoute();
    else if(isSupportRoute())showSupportRoute();
    else if(isConfigRoute())enterConfig();
    else if(isProfileRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-profile-route'));}
    else if(isVideoRoute()){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-video-route'));}
    else enterHome();
    return user;
  }

  async function boot(){
    auth=beBackend.auth;
    q('discordAuthButton').onclick=async function(){
      var button=this;
      if(authFlowBusy)return;
      authFlowBusy=true;button.disabled=true;setStatus('');
      try{await auth.signInWithDiscord();}catch(err){setStatus(friendly(err),'error');authFlowBusy=false;button.disabled=false;}
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

    q('loginForm').addEventListener('submit',async function(e){
      e.preventDefault();
      var form=e.currentTarget,b=e.submitter||form.querySelector('[type="submit"]'),email=(selectedAuthEmail||form.elements.namedItem('email').value).trim().toLowerCase(),password=form.elements.namedItem('password').value;
      if(!validAuthPassword(password)){setStatus('Use pelo menos 6 caracteres e inclua um número ou caractere especial.','error');form.elements.namedItem('password').focus();return;}
      if(authFlowBusy)return;
      authFlowBusy=true;if(b)b.disabled=true;setStatus('Entrando…');
      try{var result=await auth.signInWithEmail({email:email,password:password,remember:q('rememberLogin').checked});await finishPublicLogin(result&&result.user?result.user:auth.currentUser);}catch(err){showLogin();setMode('password',email);setStatus(err&&err.code==='admin-only'?'A conta administrativa deve acessar #/admin.':friendly(err),'error');}finally{authFlowBusy=false;if(b)b.disabled=false;}
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
        currentProfile=await beBackend.profiles.ensure(result.user);localStorage.setItem('beAuthExpected','1');localStorage.setItem('beSessionUid',result.user.uid);setStatus('Conta criada com sucesso.','ok');enterHome();
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
      if(isNotificationsRoute()){hideSiteSkeleton();showNotificationsRoute();return;}
      if(isSupportRoute()){hideSiteSkeleton();showSupportRoute();return;}
      if(isLegalRoute()){hideSiteSkeleton();showLegalRoute();return;}
      if(!user){
        hideSiteSkeleton();
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
        showLogin();selectedAuthEmail='';setMode('email');
        if(callbackFailure)setStatus('O Discord não concluiu o login: '+decodeURIComponent(String(callbackFailure).replace(/\+/g,' ')),'error');
        else if(callbackActive)setStatus('O retorno do Discord chegou, mas a sessão não foi criada. Confira as URLs de redirecionamento do Supabase e do Discord.','error');
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
      if(isNotificationsRoute()){showNotificationsRoute();return;}
      if(isSupportRoute()){showSupportRoute();return;}
      if(isLegalRoute()){showLegalRoute();return;}
      if(!authReady)return;
      if(isConfigRoute()){if(auth.currentUser)enterConfig();else showLogin();return;}
      if(isProfileRoute()){if(auth.currentUser){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-profile-route'));}else showLogin();return;}
      if(isVideoRoute()){if(auth.currentUser){enterHome(true);window.dispatchEvent(new CustomEvent('be:open-video-route'));}else showLogin();return;}
      if(auth.currentUser)enterHome(true);else showLogin();
    }
    window.addEventListener('hashchange',handlePublicRoute);
    window.addEventListener('popstate',handlePublicRoute);
    window.setInterval(function(){if(auth.currentUser)enforceAccountAccess(auth.currentUser);},10000);
  }

  async function startAuthentication(){
    try{if(!window.beBackend)throw new Error('O adaptador de autenticação não foi carregado.');await window.beBackend.ready;await boot();}catch(error){hideSiteSkeleton();if(isNotificationsRoute())showNotificationsRoute();else if(isSupportRoute())showSupportRoute();else if(isLegalRoute())showLegalRoute();else{showLogin();setStatus('Não foi possível iniciar a autenticação. Detalhes: '+friendly(error),'error');}console.error('Falha ao iniciar autenticação:',error);}
  }

  document.addEventListener('DOMContentLoaded',function(){initBackgrounds();setMode('email');startAuthentication()});
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
  var legalRoutes=['terms','privacy','cookies','dmca'];

  // Mantém a área legal fora da estrutura da Home para que ela nunca seja
  // renderizada junto do catálogo, independentemente do restante do layout.
  if(legalPage&&legalPage.parentNode!==document.body){document.body.appendChild(legalPage);}

  function routeName(){
    var value=String(location.hash||'').replace(/^#\/?/,'').split(/[?&]/)[0].toLowerCase();
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
  function showCookieNotice(){
    establishNecessaryStorage();
    if(cookieNotice)cookieNotice.hidden=acknowledged();
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
    syncLegalAvatar();
    document.title='Billie Eilish TV';
    window.scrollTo(0,0);
    return true;
  }
  function goHome(){
    history.pushState({beRoute:'home'},'',location.pathname+(location.search||''));
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
      if(!loggedUser){location.hash='#login';return;}
      var button=document.querySelector('[data-public-action="profile"]');
      if(button)button.click();
      else location.hash='#login';
    },50);
  }

  if(legalHomeButton)legalHomeButton.addEventListener('click',goHome);
  if(legalAvatarButton)legalAvatarButton.addEventListener('click',openProfile);
  if(cookieAccept)cookieAccept.addEventListener('click',acceptCookies);
  window.addEventListener('hashchange',renderLegalRoute);
  window.addEventListener('popstate',renderLegalRoute);
  window.addEventListener('be:open-legal-route',renderLegalRoute);
  window.addEventListener('be:profile-avatar-changed',syncLegalAvatar);
  if(window.beBackend&&beBackend.ready){beBackend.ready.then(function(){if(beBackend.auth&&beBackend.auth.onChange)beBackend.auth.onChange(syncLegalAvatar);syncLegalAvatar();}).catch(syncLegalAvatar);}
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
      location.hash='#login';
      document.body.classList.add('login-mode');
      return;
    }
    var target='/config'+(location.search||'');
    try{history.pushState({beRoute:'config'},'',target);}catch(_){location.hash='#/config';}
    window.dispatchEvent(new CustomEvent('be:open-config'));
    window.setTimeout(function(){
      if(!document.body.classList.contains('settings-page-active'))location.assign(target);
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
    try{return decodeURIComponent(String(location.pathname||'/')).replace(/\/+$/,'')||'/';}
    catch(_){return String(location.pathname||'/').replace(/\/+$/,'')||'/';}
  }

  function hasLegacySupportUrl(){
    var path=cleanPath().toLowerCase();
    var hash=String(location.hash||'').toLowerCase();
    return path==='/suporte'||hash==='#suporte'||hash==='#/suporte'||hash==='#support'||hash==='#/support';
  }

  function isSupportRoute(){
    var state=history.state||{};
    return hasLegacySupportUrl()||(state.beRoute==='support'&&!location.hash);
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
    var target=publicUrlWithoutSupportRoute();
    if(replace)history.replaceState(nextState,'',target);
    else history.pushState(nextState,'',target);
  }

  function openSupport(updateRoute){
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
      var match=!query||normalize(item.textContent).indexOf(query)!==-1;
      item.hidden=!match;
      if(!match)item.open=false;
      if(match)visible+=1;
    });
    var empty=Boolean(query)&&visible===0;
    if(clearButton)clearButton.hidden=!input.value;
    if(noResults)noResults.hidden=true;
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
    var target=event.target&&event.target.closest?event.target.closest('[data-public-action="support"],[data-mobile-destination="support"],a[href="#suporte"],a[href="#/suporte"],.home-nav-link[data-home-view],#logoBtn,[data-public-action="profile"],[data-public-action="settings"],[data-public-action="auth"]'):null;
    if(!target)return;
    if(target.matches('[data-public-action="support"],[data-mobile-destination="support"],a[href="#suporte"],a[href="#/suporte"]')){
      event.preventDefault();
      openSupport(true);
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

  if(!page||!pageNav||!pageContent)return;

  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];
    });
  }

  function cleanPath(){
    try{return decodeURIComponent(String(location.pathname||'/')).replace(/\/+$/,'')||'/';}
    catch(_){return String(location.pathname||'/').replace(/\/+$/,'')||'/';}
  }

  function routeInfo(){
    var path=cleanPath().toLowerCase();
    var raw=String(location.hash||'').replace(/^#\/?/,'');
    var parts=raw.split('/').filter(Boolean);
    var name=String(parts[0]||'').toLowerCase();
    var aliases=['atualizacoes','atualizações','notificacoes','notificações','updates','notifications'];
    var pathMatch=path==='/atualizacoes'||path==='/notificacoes';
    return {
      active:pathMatch||aliases.indexOf(name)!==-1,
      id:pathMatch?'':decodeURIComponent(parts[1]||'')
    };
  }

  function dateValue(item){
    var raw=item&&item.updatedAt||item&&item.createdAt||'';
    var date=raw instanceof Date?raw:new Date(raw);
    return Number.isNaN(date.getTime())?null:date;
  }

  function formatDate(item){
    var date=dateValue(item);
    if(!date)return 'Atualizado agora';
    return 'Atualizado em '+date.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  }

  function formatShortDate(item){
    var date=dateValue(item);
    if(!date)return 'agora';
    return date.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).replace('.','');
  }

  function compareNewest(a,b){
    var ad=dateValue(a),bd=dateValue(b);
    return (bd?bd.getTime():0)-(ad?ad.getTime():0);
  }

  function trimText(value,max){
    var text=String(value||'').replace(/\s+/g,' ').trim();
    return text.length>max?text.slice(0,max-1).trim()+'…':text;
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
    if(account&&src){
      pageAvatarImage.src=window.beMediaUrl?window.beMediaUrl(src):src;
      pageAvatarImage.hidden=false;
      pageAvatarFallback.hidden=true;
      pageAvatar.setAttribute('aria-label','Abrir perfil');
      return;
    }
    pageAvatarImage.hidden=true;
    pageAvatarImage.removeAttribute('src');
    var name=document.getElementById('ddUsername');
    var label=account?(name?String(name.textContent||'').replace(/^@/,'').trim():'')||account.displayName||account.email||'M':'M';
    pageAvatarFallback.textContent=(String(label).charAt(0)||'M').toUpperCase();
    pageAvatarFallback.hidden=false;
    pageAvatar.setAttribute('aria-label',account?'Abrir perfil':'Entrar na plataforma');
  }

  function openProfileFromPage(){
    var account=window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;
    closePage(true);
    window.setTimeout(function(){
      if(!account){
        location.hash='#login';
        document.body.classList.add('login-mode');
        return;
      }
      var profileButton=document.querySelector('[data-public-action="profile"]');
      if(profileButton)profileButton.click();
      else window.dispatchEvent(new CustomEvent('be:open-profile-route'));
    },50);
  }

  function setUnreadState(){
    var currentMobileDot=document.getElementById('mobileNotificationUnreadDot')||mobileDot;
    if(!notifications.length){
      if(desktopDot)desktopDot.hidden=true;
      if(currentMobileDot)currentMobileDot.hidden=true;
      return;
    }
    var latest=dateValue(notifications[0]);
    var seen=Number(localStorage.getItem(STORAGE_KEY)||0);
    var unread=Boolean(latest&&latest.getTime()>seen);
    if(desktopDot)desktopDot.hidden=!unread;
    if(currentMobileDot)currentMobileDot.hidden=!unread;
  }

  function markAllRead(){
    var currentMobileDot=document.getElementById('mobileNotificationUnreadDot')||mobileDot;
    var latest=notifications.length&&dateValue(notifications[0]);
    localStorage.setItem(STORAGE_KEY,String(latest?latest.getTime():Date.now()));
    if(desktopDot)desktopDot.hidden=true;
    if(currentMobileDot)currentMobileDot.hidden=true;
  }

  function previewMarkup(items){
    if(!items.length)return '<div class="notification-preview-empty"><strong>Nenhuma atualização</strong></div>';
    return items.slice(0,3).map(function(item){
      return '<button class="notification-preview-item" type="button" data-notification-id="'+esc(item.id)+'">'+
        '<span class="notification-preview-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A8.5 8.5 0 0 0 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.7v4.7l3.2 1.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+
        '<span class="notification-preview-copy"><strong>'+esc(item.title||'Atualização')+'</strong><span>'+esc(trimText(item.description,100)||'Confira esta atualização.')+'</span></span>'+
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
    var html=previewMarkup(notifications);
    if(desktopList){desktopList.innerHTML=html;bindPreviewItems(desktopList);}
    if(mobileList){mobileList.innerHTML=html;bindPreviewItems(mobileList);}
    setUnreadState();
  }

  function renderPage(id){
    if(!notifications.length){
      pageNav.innerHTML='<div class="notification-page-empty"><strong>Nenhuma atualização</strong></div>';
      pageContent.innerHTML='<div class="notification-page-empty"><strong>Nenhuma atualização</strong></div>';
      return;
    }
    var active=notifications.find(function(item){return String(item.id)===String(id);})||notifications[0];
    selectedId=String(active.id||'');
    pageNav.innerHTML=notifications.map(function(item){
      var selected=String(item.id)===selectedId;
      return '<button class="notification-page-link '+(selected?'active':'')+'" type="button" data-notification-page-id="'+esc(item.id)+'" aria-current="'+(selected?'page':'false')+'">'+
        '<strong>'+esc(item.title||'Atualização')+'</strong>'+
        '<span>'+esc(trimText(item.description,92)||'Confira esta atualização.')+'</span>'+
      '</button>';
    }).join('');
    pageNav.querySelectorAll('[data-notification-page-id]').forEach(function(button){
      button.addEventListener('click',function(){openPage(button.dataset.notificationPageId,true);});
    });
    pageContent.innerHTML='<article class="notification-article">'+
      '<h1>'+esc(active.title||'Atualização')+'</h1>'+
      '<p class="notification-article-date">'+esc(formatDate(active))+'</p>'+
      '<div class="notification-article-body">'+esc(active.description||'').replace(/\r?\n/g,'<br>')+'</div>'+
    '</article>';
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
    url.pathname='/';
    url.hash='atualizacoes'+(id?'/'+encodeURIComponent(id):'');
    var target=url.pathname+(url.search||'')+url.hash;
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
    if(updateRoute!==false)setNotificationRoute(selectedId,false);
    window.dispatchEvent(new CustomEvent('be:close-support'));
    await loadNotifications(false);
    renderPage(selectedId);
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


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
    try {
      const { data: allowed, error } = await supabaseClient.rpc('is_admin');
      if (error) throw error;
      return { ...user, role: allowed === true ? 'admin' : 'member' };
    } catch (error) {
      // Falhar fechado: sem confirmação do servidor, a conta nunca recebe acesso admin.
      console.warn('Não foi possível confirmar as permissões da sessão.');
      return { ...user, role: 'member' };
    }
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
        shows: {}, news: {}, gallery, users: {}, settings: {}, admin_logs: {}
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
  const ORIGINAL_TITLE_COLLECTIONS_BACKEND = new Set(['contents','featured','movies','series','videos','ongs','news']);
  const TRANSLATION_FUNCTION_NAME = 'translate-content-record';
  const ITALIAN_TRANSLATION_FUNCTION_NAME = 'translate-content-record-it';

  function activeLocaleSlug() {
    if (String(location.hash || '').startsWith('#/admin')) return 'pt-br';
    const slug = String(window.BETVLocale?.slug || 'pt-br').toLowerCase();
    return ['en-us','es','fr','it'].includes(slug) ? slug : 'pt-br';
  }

  function italianInitialUpperLabel(value, requestedSlug = activeLocaleSlug()) {
    const raw = String(value == null ? '' : value);
    if (String(requestedSlug || '').toLowerCase() !== 'it' || !raw) return raw;
    return raw.replace(/^(\s*)(\p{L})/u, (_, space, letter) => space + letter.toLocaleUpperCase('it-IT'));
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

  function preservesSourceRecordTitle(collection, record) {
    const normalizedCollection = String(collection || record?.collection || '').trim().toLowerCase();
    return record?.preserveTitle === true
      || String(record?.preserveTitle || '').toLowerCase() === 'true'
      || ORIGINAL_TITLE_COLLECTIONS_BACKEND.has(normalizedCollection);
  }

  function protectSourceRecordTitle(record) {
    if (!record || !window.BETVI18n || typeof window.BETVI18n.protectExact !== 'function') return;
    if (Object.prototype.hasOwnProperty.call(record, 'title')) window.BETVI18n.protectExact(record.title);
    if (Object.prototype.hasOwnProperty.call(record, 'name')) window.BETVI18n.protectExact(record.name);
  }

  function localizeContentRecord(record, collection = '') {
    if (!record || typeof record !== 'object') return record;
    const slug = activeLocaleSlug();
    if (slug === 'pt-br') return record;
    const normalizedCollection = String(collection || record?.collection || '').trim().toLowerCase();
    const translations = record.translations && typeof record.translations === 'object' ? record.translations : {};
    const localized = translations[slug] || translations[slug === 'en-us' ? 'en' : slug] || null;
    const result = localized && typeof localized === 'object' ? { ...record, ...localized } : { ...record };
    if (preservesSourceRecordTitle(normalizedCollection, record)) {
      if (Object.prototype.hasOwnProperty.call(record, 'title')) result.title = record.title;
      if (Object.prototype.hasOwnProperty.call(record, 'name')) result.name = record.name;
      result.preserveTitle = true;
      protectSourceRecordTitle(record);
    }
    if (slug === 'it') {
      if (normalizedCollection === 'sections') {
        if (typeof result.title === 'string') result.title = italianInitialUpperLabel(result.title, slug);
        if (typeof result.name === 'string') result.name = italianInitialUpperLabel(result.name, slug);
      }
      if (typeof result.sectionName === 'string') result.sectionName = italianInitialUpperLabel(result.sectionName, slug);
    }
    ['duration','runtime','videoDuration'].forEach(field => {
      if (result[field]) result[field] = localizeDurationLabel(result[field], slug);
    });
    return result;
  }

  function recordNeedsTranslation(record, slug, collection = '') {
    if (!record || !record.id || slug === 'pt-br') return false;
    const translations = record.translations && typeof record.translations === 'object' ? record.translations : {};
    const localized = translations[slug];
    if (!localized || typeof localized !== 'object') return true;
    return preservesSourceRecordTitle(collection, record)
      && (Object.prototype.hasOwnProperty.call(localized, 'title') || Object.prototype.hasOwnProperty.call(localized, 'name'));
  }

  async function ensureTranslatedRecords(collection, records) {
    const slug = activeLocaleSlug();
    const values = Array.isArray(records) ? records : [];
    if (slug === 'pt-br' || !TRANSLATABLE_COLLECTIONS.has(String(collection || '')) || !supabaseClient?.functions?.invoke) {
      return values.map(record => localizeContentRecord(record, collection));
    }
    const missing = values.filter(record => recordNeedsTranslation(record, slug, collection));
    if (missing.length) {
      try {
        const translatedById = new Map();
        for (let offset = 0; offset < missing.length; offset += 20) {
          const batch = missing.slice(offset, offset + 20);
          const translationFunction = slug === 'it' ? ITALIAN_TRANSLATION_FUNCTION_NAME : TRANSLATION_FUNCTION_NAME;
          const result = await supabaseClient.functions.invoke(translationFunction, {
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
    return values.map(record => localizeContentRecord(record, collection));
  }

  function queueRecordTranslation(collection, id) {
    if (!currentUser || currentUser.role !== 'admin' || !supabaseClient?.functions?.invoke) return;
    if (collection !== 'settings' && !TRANSLATABLE_COLLECTIONS.has(String(collection || ''))) return;
    window.setTimeout(() => {
      supabaseClient.functions.invoke(TRANSLATION_FUNCTION_NAME, {
        body: { collection: String(collection), ids: [String(id)], locales: ['en-us','es','fr'], force: true }
      }).then(result => {
        if (result?.error) console.warn('Não foi possível atualizar as traduções automáticas:', result.error.message || result.error);
      }).catch(error => console.warn('Não foi possível atualizar as traduções automáticas:', error?.message || error));
      supabaseClient.functions.invoke(ITALIAN_TRANSLATION_FUNCTION_NAME, {
        body: { collection: String(collection), ids: [String(id)], locales: ['it'], force: true }
      }).then(result => {
        if (result?.error) console.warn('Não foi possível atualizar a tradução italiana:', result.error.message || result.error);
      }).catch(error => console.warn('Não foi possível atualizar a tradução italiana:', error?.message || error));
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


  async function listAllProfileRows() {
    const rows = [];
    const pageSize = 500;
    let from = 0;

    while (true) {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      if (error) throw error;

      const page = Array.isArray(data) ? data : [];
      rows.push(...page);
      if (page.length < pageSize) break;
      from += pageSize;
    }

    return rows;
  }

  const supabaseData = {
    async list(name, options = {}) {
      try {
        let items = [];
        if (name === 'users') {
          const data = await listAllProfileRows();
          items = data.map(profileFromRow);
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
          return translated[0] || localizeContentRecord(value, name);
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
        return translated[0] || localizeContentRecord(value, name);
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
      const savedProfile = await this.update(userId, { avatarUrl: normalizedUrl, avatarId: effectiveAvatarId });

      // Mantém o avatar escolhido sincronizado com a conta autenticada. O campo
      // profile_avatar_url identifica que esta é uma escolha do usuário, e não
      // apenas a foto recebida do provedor social.
      if (MODE === 'supabase' && currentUser?.uid === userId) {
        try {
          const { data: authResult, error } = await supabaseClient.auth.updateUser({
            data: {
              avatar_url: normalizedUrl,
              profile_avatar_url: normalizedUrl,
              profile_avatar_id: effectiveAvatarId
            }
          });
          if (error) throw error;
          currentUser = normalizeUser(authResult?.user || currentUser);
        } catch (metadataError) {
          console.warn('O avatar foi salvo no perfil, mas não nos metadados da conta:', metadataError?.message || metadataError);
        }
      }

      if (currentUser?.uid === userId) {
        currentUser = { ...currentUser, photoURL: normalizedUrl, profile: savedProfile };
        notify();
      }

      try {
        window.dispatchEvent(new CustomEvent('be:profile-avatar-changed', {
          detail: { userId, avatarUrl: normalizedUrl, avatarId: effectiveAvatarId, profile: savedProfile }
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
        notify();
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
      // Não informa ao navegador se um endereço possui conta cadastrada.
      return null;
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
      if (localProfile) {
        return {
          banned: Boolean(localProfile.banned),
          reason: localProfile.banReason || '',
          bannedAt: localProfile.bannedAt || ''
        };
      }
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

      let deleted = false;
      let rpcError = null;
      const rpcResult = await supabaseClient.rpc('delete_my_account');
      if (!rpcResult.error) {
        deleted = true;
      } else {
        rpcError = rpcResult.error;
        const message = String(rpcError.message || '');
        const missingRpc = rpcError.code === 'PGRST202' || /Could not find the function|schema cache|delete_my_account/i.test(message);
        if (!missingRpc) throw mapAuthError(rpcError);
      }

      if (!deleted) {
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) throw mapAuthError(sessionError);
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) throw backendError('auth/not-authenticated', 'Sua sessão expirou. Entre novamente para excluir a conta.');

        let response;
        try {
          response = await fetch('/api/delete-account', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: '{}'
          });
        } catch (_) {
          throw mapAuthError(rpcError);
        }

        if (!response.ok) {
          let payload = null;
          try { payload = await response.json(); } catch (_) {}
          const detail = payload?.error || payload?.message || `Falha no servidor (${response.status}).`;
          throw backendError('auth/delete-account-failed', detail);
        }
        deleted = true;
      }

      if (!deleted) throw mapAuthError(rpcError);
      try { await supabaseClient.auth.signOut(); } catch (_) {}
      currentUser = null;
      localStorage.removeItem('beAuthExpected');
      localStorage.removeItem('beSessionUid');
      notify();
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

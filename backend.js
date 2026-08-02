(() => {
  'use strict';

  const ADMIN_EMAIL = String(window.BE_SUPABASE_CONFIG?.adminEmail || 'bralisofc@gmail.com').trim().toLowerCase();
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
    return {
      uid: raw.id || raw.uid,
      id: raw.id || raw.uid,
      email: raw.email || '',
      displayName: metadata.display_name || metadata.full_name || raw.displayName || raw.display_name || '',
      photoURL: metadata.profile_avatar_url || metadata.avatar_url || raw.photoURL || raw.avatar_url || '',
      emailVerified: Boolean(raw.email_confirmed_at || raw.emailVerified || MODE === 'local'),
      role: String(raw.email || '').toLowerCase() === ADMIN_EMAIL ? 'admin' : (raw.role || 'member'),
      raw
    };
  }

  async function resolveSupabaseUser(authResult) {
    if (MODE !== 'supabase' || !supabaseClient) return currentUser;

    const immediateUser = authResult?.user || authResult?.session?.user || null;
    if (immediateUser) return normalizeUser(immediateUser);

    // Em alguns navegadores o Supabase conclui o login alguns milissegundos
    // antes de disponibilizar a sessão persistida. Tentamos novamente por um
    // curto período para não devolver o usuário à tela de login por engano.
    const retryDelays = [0, 80, 180, 360, 700];
    for (const retryDelay of retryDelays) {
      if (retryDelay) await wait(retryDelay);

      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) console.warn('Não foi possível recuperar a sessão após o login:', sessionError.message);
      const sessionUser = sessionData?.session?.user || null;
      if (sessionUser) return normalizeUser(sessionUser);

      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      if (userError && userError.name !== 'AuthSessionMissingError') {
        console.warn('Não foi possível recuperar o usuário após o login:', userError.message);
      }
      if (userData?.user) return normalizeUser(userData.user);
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
      avatarUrl: 'avatar_url', avatarId: 'avatar_id', role: 'role',
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

  const supabaseData = {
    async list(name, options = {}) {
      try {
        let items = [];
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
        const payload = { id, collection: name, data: merged, updated_by: currentUser?.email || null, updated_at: now() };
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
        const payload = { collection: name, data: { ...data, createdAt: data.createdAt || now(), updatedAt: data.updatedAt || now() }, created_by: currentUser?.email || null, updated_by: currentUser?.email || null };
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
            .select('avatar_url')
            .eq('id', user.uid)
            .maybeSingle();
          if (existingProfileError) console.warn('Não foi possível consultar o avatar salvo:', existingProfileError.message);
          savedAvatar = String(existingProfile?.avatar_url || '').trim();
        } catch (avatarLookupError) {
          console.warn('Não foi possível consultar o avatar salvo:', avatarLookupError?.message || avatarLookupError);
        }

        const profileArgs = {
          p_display_name: String(user.displayName || metadata.display_name || metadata.full_name || '').trim() || null,
          p_username: metadataUsername || null,
          p_avatar_url: String(savedAvatar || metadata.profile_avatar_url || user.photoURL || metadata.avatar_url || '').trim() || null
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
        if (currentUser?.uid === user.uid && profile.avatarUrl) {
          currentUser = { ...currentUser, photoURL: profile.avatarUrl, profile };
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
        avatarUrl: existing?.avatarUrl || user.photoURL || '',
        avatarId: existing?.avatarId || '',
        role: String(user.email || '').toLowerCase() === ADMIN_EMAIL ? 'admin' : (existing?.role || 'member'),
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
      const savedProfile = await this.update(userId, { avatarUrl: normalizedUrl, avatarId: normalizedId });

      // Mantém o avatar escolhido sincronizado com a conta autenticada. O campo
      // profile_avatar_url identifica que esta é uma escolha do usuário, e não
      // apenas a foto recebida do provedor social.
      if (MODE === 'supabase' && currentUser?.uid === userId) {
        try {
          const { data: authResult, error } = await supabaseClient.auth.updateUser({
            data: {
              avatar_url: normalizedUrl,
              profile_avatar_url: normalizedUrl,
              profile_avatar_id: normalizedId
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
          detail: { userId, avatarUrl: normalizedUrl, avatarId: normalizedId, profile: savedProfile }
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
      if (!validUsername(normalizedHandle)) throw backendError('username-invalid', 'O @ deve ter de 3 a 20 caracteres.');
      const database = loadLocalDatabase();
      if (database.accounts[normalizedEmail]) throw backendError('auth/email-already-in-use', 'Este e-mail já possui uma conta.');
      const profilesList = Object.values(localCollection(database, 'users'));
      if (profilesList.some(profile => String(profile.username || '').toLowerCase() === normalizedHandle)) throw backendError('username-in-use', 'Este @ já está em uso.');
      const userId = uid();
      const salt = uid();
      const account = {
        id: userId,
        uid: userId,
        email: normalizedEmail,
        displayName: String(name || '').trim(),
        photoURL: '',
        emailVerified: true,
        role: normalizedEmail === ADMIN_EMAIL ? 'admin' : 'member',
        salt,
        passwordHash: await hashPassword(password, salt),
        createdAt: now()
      };
      database.accounts[normalizedEmail] = account;
      localCollection(database, 'users')[userId] = {
        id: userId, uid: userId, email: normalizedEmail,
        displayName: account.displayName, username: normalizedHandle, bio: '', avatarUrl: '', avatarId: '',
        profileComplete: true, role: account.role, createdAt: now(), updatedAt: now(), lastLoginAt: now()
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
    async localAdminExists(email = ADMIN_EMAIL) {
      const database = loadLocalDatabase();
      return Boolean(database.accounts[String(email).toLowerCase()]);
    },
    async setupLocalAdmin(email, password) {
      const normalizedEmail = String(email || ADMIN_EMAIL).trim().toLowerCase();
      if (normalizedEmail !== ADMIN_EMAIL) throw backendError('auth/not-admin', 'Use o e-mail administrativo autorizado.');
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
      if (error) {
        console.warn('Não foi possível verificar se a conta existe:', error.message);
        return null;
      }
      return Boolean(data);
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

      currentUser = normalizeUser(result?.user || result?.session?.user || null) || await resolveSupabaseUser(result);
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
      if (!validUsername(normalizedHandle)) throw backendError('username-invalid', 'O @ deve ter de 3 a 20 caracteres.');
      const usernameIsAvailable = await this.usernameAvailable(normalizedHandle);
      if (usernameIsAvailable === false) throw backendError('username-in-use', 'Este nome de usuário já está em uso. Escolha outro.');
      const { data: result, error } = await supabaseClient.auth.signUp({
        email: String(email || '').trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: safeAuthReturnUrl(),
          data: { display_name: String(name || '').trim(), username: normalizedHandle }
        }
      });
      if (error) throw mapAuthError(error);
      const signedUpUser = normalizeUser(result.user);
      currentUser = result.session ? signedUpUser : null;
      if (currentUser) {
        await profiles.ensure(currentUser);
        await profiles.update(currentUser.uid, { displayName: String(name || '').trim(), username: normalizedHandle, email: currentUser.email });
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
      supabaseClient = window.supabase.createClient(config.url, config.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
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
            currentUser = eventUser;
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
      currentUser = normalizeUser(sessionData?.session?.user || null);

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
    isAdmin(user) { return Boolean(user && String(user.email || '').toLowerCase() === ADMIN_EMAIL); },
    get client() { return supabaseClient; }
  };
})();

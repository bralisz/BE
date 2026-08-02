(() => {
  'use strict';

  const COLLECTIONS = ['featured','sections','contents','videos','movies','series','shows','news','gallery','users'];
  const LABELS = {dashboard:'Visão geral',featured:'Destaques',sections:'Seções do site',contents:'Conteúdos',videos:'Vídeos',movies:'Filmes',series:'Séries',shows:'Shows',news:'Álbuns',gallery:'Galeria',users:'Usuários',settings:'Configurações'};
  const ADMIN_EMAIL = 'bralisofc@gmail.com';
  const CONTENT_CATEGORIES = [
    ['videos','Vídeos','▣'],
    ['movies','Filmes','▤'],
    ['series','Séries','▥'],
    ['shows','Shows','◉'],
    ['news','Álbuns','▦']
  ];

  let auth, db, user = null, authReady = false, loginBusy = false, adminLoginBgTimer = null;

  async function decorateAccountWithProfile(account) {
    if (!account) return null;
    try {
      const profile = await beBackend.profiles.ensure(account);
      if (!profile) return account;
      return {
        ...account,
        displayName: profile.displayName || profile.username || account.displayName || '',
        photoURL: profile.avatarUrl || account.photoURL || '',
        profile
      };
    } catch (error) {
      console.warn('Não foi possível aplicar o avatar do perfil no painel:', error?.message || error);
      return account;
    }
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const adminHashRoute = () => location.hash.startsWith('#/admin');
  const adminCallback = () => {
    const queryDestination = new URLSearchParams(location.search || '').get('auth_callback');
    if (queryDestination === 'admin') return true;
    try { return sessionStorage.getItem('beOAuthDestination') === 'admin'; } catch (_) { return false; }
  };
  const route = () => adminHashRoute() ? (location.hash.replace(/^#\/admin\/?/, '') || 'dashboard') : 'dashboard';
  const go = value => { location.hash = '#/admin/' + value; };
  const adminRoute = () => adminHashRoute() || adminCallback();
  const now = () => beBackend.now();
  const normalizePublicId = value => /^\d{8}$/.test(String(value || '').trim()) ? String(value).trim() : '';
  function generatePublicId(seed = '') {
    let text = String(seed || '').trim();
    if (!text) {
      const random = new Uint32Array(2);
      if (window.crypto?.getRandomValues) window.crypto.getRandomValues(random);
      text = `${Date.now()}-${random[0] || Math.random()}-${random[1] || Math.random()}`;
    }
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return String(10000000 + ((hash >>> 0) % 90000000));
  }
  const formatDate = value => {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
  };
  const formatDateTime = value => {
    if (!value) return 'agora';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? 'agora' : date.toLocaleString('pt-BR');
  };
  const toast = (message, type = 'ok') => {
    let area = $('.toast-area');
    if (!area) {
      area = document.createElement('div');
      area.className = 'toast-area';
      document.body.append(area);
    }
    const element = document.createElement('div');
    element.className = 'toast ' + type;
    element.textContent = message;
    area.append(element);
    setTimeout(() => element.remove(), 3500);
  };

  function authErrorMessage(error) {
    const code = error && error.code ? error.code : '';
    if (code === 'backend/not-configured') return error.message;
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found') return 'E-mail ou senha incorretos.';
    if (code === 'auth/network-request-failed') return 'Falha de conexão. Verifique a internet e tente novamente.';
    return (error && error.message) || 'Não foi possível entrar no painel.';
  }


  function adminLoginBackgroundMarkup() {
    const backgrounds = [
      '/assets/login-admin-banner.jpg',
      '/assets/login-bg-1.png',
      '/assets/login-bg-2.png',
      '/assets/login-bg-3.png',
      '/assets/login-bg-4.png',
      '/assets/login-bg-5.png',
      '/assets/login-bg-6.png',
      '/assets/login-bg-7.png'
    ];
    return `<div class="admin-login-bg" aria-hidden="true">${backgrounds.map((src, index) => `<div class="admin-login-bg-slide ${index === 0 ? 'active' : ''}" style="background-image:url('${src}')"></div>`).join('')}</div>`;
  }

  function startAdminLoginBackground() {
    if (adminLoginBgTimer) clearInterval(adminLoginBgTimer);
    const slides = [...document.querySelectorAll('.admin-login-bg-slide')];
    const dots = [...document.querySelectorAll('.admin-login-dot')];
    if (!slides.length) return;
    const randomIndex = except => {
      if (slides.length < 2) return 0;
      let next = except;
      while (next === except) {
        if (window.crypto && window.crypto.getRandomValues) {
          const value = new Uint32Array(1);
          window.crypto.getRandomValues(value);
          next = value[0] % slides.length;
        } else {
          next = Math.floor(Math.random() * slides.length);
        }
      }
      return next;
    };
    let active = randomIndex(-1);
    const show = index => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === active));
      dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === active));
    };
    const restart = () => {
      if (adminLoginBgTimer) clearInterval(adminLoginBgTimer);
      adminLoginBgTimer = setInterval(() => show(randomIndex(active)), 10000);
    };
    dots.forEach(dot => dot.addEventListener('click', () => {
      show(Number(dot.dataset.adminBg || 0));
      restart();
    }));
    show(active);
    restart();
  }

  async function bootBackend() {
    if (!window.beBackend) throw new Error('O adaptador de dados não foi carregado.');
    await window.beBackend.ready;

    // Depois que o Supabase consumiu o token, garantimos que o painel esteja
    // na rota administrativa limpa, sem credenciais visíveis na barra.
    if (adminCallback() && !adminHashRoute()) {
      const url = new URL(location.href);
      ['code','error','error_code','error_description','auth_callback','oauth'].forEach(name => url.searchParams.delete(name));
      url.hash = '#/admin/dashboard';
      history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
      try { sessionStorage.removeItem('beOAuthDestination'); } catch (_) {}
    }

    auth = beBackend.auth;
    db = beBackend.data;

    auth.onChange(async account => {
      authReady = true;
      const allowed = beBackend.isAdmin(account);

      // O script do painel também é carregado na página pública. Antes, qualquer
      // login de membro era interpretado como uma tentativa de entrar no painel
      // e a sessão era encerrada imediatamente. Fora de uma rota #/admin, apenas
      // mantemos o estado administrativo em memória e não alteramos a sessão.
      if (!adminRoute()) {
        user = account && allowed ? account : null;
        return;
      }

      if (account && allowed) {
        const firstLogin = !user;
        const decoratedAccount = await decorateAccountWithProfile(account);
        user = { ...decoratedAccount, __profileReady: true };
        if (firstLogin) await logAction('admin_login', 'auth', decoratedAccount.uid, 'Login administrativo');
        if (route() === 'login') go('dashboard');
        else render();
      } else {
        if (account && !allowed) {
          try { await auth.signOut(); } catch (_) {}
          sessionStorage.setItem('adminAuthError', 'Esta conta não possui permissão para acessar o painel administrativo.');
        }
        user = null;
        render();
      }
    });
  }

  async function loginWithGoogle() {
    if (loginBusy) return;
    loginBusy = true;
    const button = $('#googleLogin');
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="google-icon">G</span><span>Conectando ao Google…</span>';
    }
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      toast(authErrorMessage(error), 'err');
      loginBusy = false;
      if (button) {
        button.disabled = false;
        button.innerHTML = '<span class="google-icon">G</span><span>Conectar via Google</span>';
      }
    }
  }

  async function loginLocal(event) {
    event.preventDefault();
    if (loginBusy) return;
    loginBusy = true;
    const form = event.currentTarget;
    const button = form.querySelector('[type="submit"]');
    const password = form.elements.password.value;
    button.disabled = true;
    button.textContent = 'Entrando…';
    try {
      const exists = await auth.localAdminExists(ADMIN_EMAIL);
      if (exists) await auth.signInWithEmail({ email: ADMIN_EMAIL, password, remember: true });
      else await auth.setupLocalAdmin(ADMIN_EMAIL, password);
      go('dashboard');
    } catch (error) {
      toast(authErrorMessage(error), 'err');
      button.disabled = false;
      button.textContent = (await auth.localAdminExists(ADMIN_EMAIL)) ? 'Entrar no painel local' : 'Criar acesso administrativo local';
      loginBusy = false;
    }
  }

  async function logout() {
    try {
      await logAction('admin_logout', 'auth', user?.uid, 'Logout administrativo');
      await auth.signOut();
      go('login');
    } catch (error) {
      toast(error.message, 'err');
    }
  }

  function render() {
    if (!adminRoute()) {
      document.body.classList.remove('admin-mode');
      document.documentElement.classList.remove('admin-mode');
      return;
    }
    document.body.classList.add('admin-mode');
    document.documentElement.classList.add('admin-mode');
    if (!authReady) {
      document.body.innerHTML = '<div class="admin-loader">Verificando acesso…</div>';
      return;
    }
    if (!user) {
      renderLogin();
      return;
    }
    if (!user.__profileReady) {
      document.body.innerHTML = '<div class="admin-loader">Carregando perfil…</div>';
      Promise.resolve(decorateAccountWithProfile(user)).then(account => {
        user = { ...account, __profileReady: true };
        render();
      }).catch(error => {
        console.warn('Não foi possível carregar o perfil do administrador:', error?.message || error);
        user = { ...user, __profileReady: true };
        render();
      });
      return;
    }
    if (route() === 'login') {
      go('dashboard');
      return;
    }
    renderShell();
  }

  async function renderLogin() {
    document.body.innerHTML = `<div class="admin-login">${adminLoginBackgroundMarkup()}<div class="admin-login-content"><div class="admin-login-topbar"><a class="admin-login-logo" href="/" aria-label="Voltar ao site"><img src="/assets/logo.png?v=3" alt="BE"></a></div><div class="login-card" aria-label="Acesso administrativo"><button id="googleLogin" class="a-btn primary google-btn"><span class="google-icon">G</span><span>Conectar via Google</span></button></div></div></div><div class="toast-area"></div>`;
    startAdminLoginBackground();
    $('#googleLogin').onclick = loginWithGoogle;
    const savedError = sessionStorage.getItem('adminAuthError');
    if (savedError) {
      sessionStorage.removeItem('adminAuthError');
      setTimeout(() => toast(savedError, 'err'), 50);
    }
  }

  function navButton(key) {
    const current = route();
    const active = current === key || (key === 'contents' && current.startsWith('contents/'));
    return `<button data-route="${key}" class="${active ? 'active' : ''}">${LABELS[key]}</button>`;
  }

  function renderShell() {
    if (adminLoginBgTimer) {
      clearInterval(adminLoginBgTimer);
      adminLoginBgTimer = null;
    }
    const routes = ['dashboard','featured','sections','contents','gallery','users','settings'];
    const accountAvatar = user.photoURL
      ? `<img src="${esc(user.photoURL)}" alt="Foto de ${esc(user.displayName || 'usuário')}">`
      : `<span>${esc((user.displayName || 'B').charAt(0).toUpperCase())}</span>`;
    document.body.innerHTML = `<div class="admin-shell"><header class="admin-topbar"><a class="admin-logo-button" href="/" aria-label="Ir para o site"><img src="/assets/logo.png?v=3" alt="BE"></a><nav class="admin-nav" aria-label="Navegação do painel">${routes.map(navButton).join('')}</nav><div class="admin-account"><button class="admin-avatar-button" id="accountToggle" aria-label="Abrir menu da conta" aria-expanded="false">${accountAvatar}</button><div class="admin-account-menu" id="accountMenu"><div class="admin-account-name">${esc(user.displayName || 'Administrador')}</div><div class="admin-account-divider"></div><button type="button" data-account-action="profile">Perfil</button><button type="button" data-account-action="settings">Configurações</button><button type="button" data-account-action="support">Suporte</button><button type="button" data-account-action="dashboard">Dashboard</button><div class="admin-account-divider"></div><button type="button" class="danger" data-account-action="logout">Sair</button></div></div></header><main class="admin-main"><section class="admin-content" id="adminContent"></section></main></div><div class="toast-area"></div>`;
    document.querySelectorAll('[data-route]').forEach(button => button.onclick = () => go(button.dataset.route));
    const accountToggle = $('#accountToggle');
    const accountMenu = $('#accountMenu');
    const accountAvatarImage = accountToggle.querySelector('img');
    if (accountAvatarImage) {
      accountAvatarImage.addEventListener('error', () => {
        accountToggle.innerHTML = `<span>${esc((user.displayName || 'B').charAt(0).toUpperCase())}</span>`;
      }, { once: true });
    }
    accountToggle.onclick = event => {
      event.stopPropagation();
      const open = accountMenu.classList.toggle('open');
      accountToggle.setAttribute('aria-expanded', String(open));
    };
    document.addEventListener('click', event => {
      if (accountMenu && !accountMenu.contains(event.target) && event.target !== accountToggle) {
        accountMenu.classList.remove('open');
        accountToggle.setAttribute('aria-expanded', 'false');
      }
    });
    accountMenu.querySelectorAll('[data-account-action]').forEach(button => button.onclick = () => {
      const action = button.dataset.accountAction;
      if (action === 'logout') return logout();
      if (action === 'dashboard') return go('dashboard');
      if (action === 'settings') return go('settings');
      if (action === 'support') return toast('Área de suporte em preparação.');
      if (action === 'profile') return toast('Área de perfil em preparação.');
    });
    loadPage().catch(error => {
      console.error(error);
      $('#adminContent').innerHTML = `<div class="a-card"><h2>Erro ao carregar</h2><p>${esc(error.message)}</p></div>`;
    });
  }

  async function loadPage() {
    const current = route();
    if (current === 'dashboard') return dashboard();
    if (current === 'settings') return settingsPage();
    if (current === 'gallery') return galleryPage();
    if (current === 'contents' || current.startsWith('contents/')) return contentsPage(current.split('/')[1] || 'videos');
    return collectionPage(current);
  }

  async function countCollection(name) {
    return db.count(name);
  }

  async function dashboard() {
    const content = $('#adminContent');
    content.innerHTML = '<div class="admin-loader" style="min-height:300px">Carregando visão geral…</div>';

    const names = ['featured','sections','videos','movies','series','shows','news','users'];
    const counts = {};
    const [videos, recent] = await Promise.all([
      db.list('videos').catch(() => []),
      db.list('admin_logs', { orderBy: 'createdAt', direction: 'desc', limit: 8 }).catch(() => [])
    ]);
    await Promise.all(names.map(async name => { counts[name] = name === 'videos' ? videos.length : await countCollection(name).catch(() => 0); }));

    const metricValue = (video, keys) => {
      for (const key of keys) {
        const value = Number(video[key]);
        if (Number.isFinite(value)) return value;
      }
      return 0;
    };
    const metricLeader = keys => videos.reduce((best, video) => {
      const value = metricValue(video, keys);
      return !best || value > best.value ? { video, value } : best;
    }, null);
    const clicked = metricLeader(['clicks','clickCount','clicksCount','totalClicks']);
    const saved = metricLeader(['saves','saveCount','savedCount','favorites','favoriteCount']);
    const viewed = metricLeader(['views','viewCount','viewsCount','totalViews']);
    const totalInteractions = videos.reduce((sum, video) => sum +
      metricValue(video, ['clicks','clickCount','clicksCount','totalClicks']) +
      metricValue(video, ['saves','saveCount','savedCount','favorites','favoriteCount']) +
      metricValue(video, ['views','viewCount','viewsCount','totalViews']), 0);

    const analyticsCard = (label, leader, icon) => {
      const video = leader && leader.video;
      const title = video ? (video.title || video.name || 'Vídeo sem título') : 'Nenhum vídeo';
      const image = video && (video.imageUrl || video.thumbnailUrl || video.bannerUrl || '');
      const value = leader ? leader.value : 0;
      return `<article class="analytics-card"><div class="analytics-label"><i>${icon}</i><span>${label}</span></div><div class="analytics-video">${image ? `<img src="${esc(image)}" alt="">` : '<div class="analytics-placeholder">▣</div>'}<div><strong>${esc(title)}</strong><small>${value.toLocaleString('pt-BR')} pessoas</small></div></div></article>`;
    };
    const logHtml = recent.length ? recent.map(item => `<div class="activity-item"><span></span><div><strong>${esc(item.summary || item.action || 'Atividade registrada')}</strong><small>${formatDateTime(item.createdAt)}</small></div></div>`).join('') : '<div class="empty">Nenhuma atividade registrada.</div>';

    content.innerHTML = `<section class="dashboard-hero"><div class="dashboard-copy"><h1>Painel de conteúdo</h1><p>Gerencie todas as áreas do site com facilidade.<br>Crie, edite, organize e publique conteúdos.</p><div class="dashboard-stats"><article><i>▤</i><div><strong>${counts.news || 0}</strong><span>Álbuns cadastrados</span></div></article><article><i>▣</i><div><strong>${counts.videos || 0}</strong><span>Vídeos cadastrados</span></div></article><article><i>◉</i><div><strong>${(counts.featured || 0) + (counts.sections || 0)}</strong><span>Destaques e seções</span></div></article></div></div></section><section class="dashboard-workspace"><div class="dashboard-side-column"><aside class="dashboard-side"><h2>Conteúdo</h2><button class="a-btn primary side-new" id="dashboardNewContent">＋ Novo conteúdo</button>${CONTENT_CATEGORIES.map((item, index) => `<button class="side-link ${index === 0 ? 'active' : ''}" data-route="contents/${item[0]}">${item[1]}<span>${counts[item[0]] || 0}</span></button>`).join('')}</aside><aside class="activity-log"><h2>Log de atividade</h2><div class="activity-list">${logHtml}</div></aside></div><div class="dashboard-panel"><div class="panel-head"><div><h2>Visão geral do conteúdo</h2><p>Veja os principais dados de acesso e engajamento dos vídeos.</p></div><button class="a-btn" data-route="contents">Ver conteúdos</button></div><div class="content-summary analytics-grid">${analyticsCard('Vídeo mais clicado', clicked, '↗')}${analyticsCard('Vídeo mais salvo', saved, '♡')}${analyticsCard('Vídeo mais visto', viewed, '◉')}<article class="analytics-card simple"><div class="analytics-label"><i>♙</i><span>Quantidade de usuários</span></div><strong class="analytics-number">${counts.users || 0}</strong><small>usuários cadastrados</small></article><article class="analytics-card simple"><div class="analytics-label"><i>▣</i><span>Total de vídeos vinculados</span></div><strong class="analytics-number">${counts.videos || 0}</strong><small>vídeos disponíveis no site</small></article><article class="analytics-card simple"><div class="analytics-label"><i>⌁</i><span>Total de interações</span></div><strong class="analytics-number">${totalInteractions.toLocaleString('pt-BR')}</strong><small>cliques, salvamentos e visualizações</small></article></div></div></section>`;
    $('#dashboardNewContent').onclick = chooseContentCategory;
    document.querySelectorAll('[data-route]').forEach(button => button.onclick = () => go(button.dataset.route));
  }

  function chooseContentCategory() {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal category-modal"><h2>Adicionar conteúdo</h2><p class="category-help">Escolha em qual categoria o novo conteúdo será cadastrado.</p><div class="category-picker">${CONTENT_CATEGORIES.map(([key,label,icon]) => `<button type="button" data-category="${key}" ${key === 'news' ? 'disabled aria-disabled="true"' : ''}><i>${icon}</i><span>${label}</span><small>${key === 'news' ? 'Em breve' : 'Criar novo item'}</small></button>`).join('')}</div><div class="modal-actions"><button type="button" class="a-btn" id="cancelCategory">Cancelar</button></div></div>`;
    document.body.append(wrap);
    $('#cancelCategory').onclick = () => wrap.remove();
    wrap.onclick = event => { if (event.target === wrap) wrap.remove(); };
    wrap.querySelectorAll('[data-category]').forEach(button => button.onclick = () => {
      const category = button.dataset.category;
      wrap.remove();
      openEditor(category);
    });
  }

  async function contentsPage(active = 'videos') {
    if (!CONTENT_CATEGORIES.some(item => item[0] === active)) active = 'videos';
    const content = $('#adminContent');
    content.innerHTML = '<div class="admin-loader" style="min-height:300px">Carregando conteúdos…</div>';
    const counts = {};
    await Promise.all(CONTENT_CATEGORIES.map(async ([key]) => { counts[key] = await countCollection(key).catch(() => 0); }));
    const label = LABELS[active] || active;
    content.innerHTML = `<div class="admin-title-row content-title-row"><div><span class="dashboard-kicker">Conteúdos</span><h1>${esc(label)}</h1><p>Gerencie os conteúdos separados por categoria.</p></div><button class="a-btn primary" id="newContent" ${active === 'news' ? 'disabled' : ''}>${active === 'news' ? 'Álbuns em breve' : '+ Adicionar conteúdo'}</button></div><section class="content-manager"><aside class="content-category-sidebar"><h2>Categorias</h2>${CONTENT_CATEGORIES.map(([key,categoryLabel,icon]) => `<button class="content-category-link ${key === active ? 'active' : ''}" data-content-category="${key}"><i>${icon}</i><span>${categoryLabel}</span><b>${counts[key] || 0}</b></button>`).join('')}</aside><div class="content-category-panel"><div class="toolbar"><input class="a-input" id="search" placeholder="Buscar por título…"><select class="a-select" id="statusFilter" style="max-width:180px"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Ocultos</option></select></div><div id="list"><div class="empty">Carregando…</div></div></div></section>`;
    if ($('#newContent') && active !== 'news') $('#newContent').onclick = chooseContentCategory;
    document.querySelectorAll('[data-content-category]').forEach(button => button.onclick = () => go('contents/' + button.dataset.contentCategory));
    const items = await db.list(active, { orderBy: 'order', direction: 'asc' });
    const draw = () => {
      const search = $('#search').value.toLowerCase();
      const status = $('#statusFilter').value;
      const rows = items.filter(item => (!search || String(item.title || item.name || '').toLowerCase().includes(search)) && (!status || String(item.active) === status));
      $('#list').innerHTML = rows.length ? `<div class="table-wrap"><table class="a-table"><thead><tr><th>Item</th><th>Tipo</th><th>Ordem</th><th>Status</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>${rows.map(item => `<tr><td><strong>${esc(item.title || item.name || item.id)}</strong><br><small style="color:var(--a-muted)">${esc(item.id)}</small></td><td>${esc(item.type || active)}</td><td>${esc(item.order ?? 0)}</td><td><span class="status ${item.active === false ? 'off' : 'on'}">${item.active === false ? 'Oculto' : 'Ativo'}</span></td><td>${formatDate(item.updatedAt)}</td><td><div class="row-actions"><button class="a-btn" data-edit="${item.id}">Editar</button><button class="a-btn danger" data-del="${item.id}">Excluir</button></div></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Nenhum item encontrado nesta categoria.</div>';
      document.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => openEditor(active, items.find(item => item.id === button.dataset.edit)));
      document.querySelectorAll('[data-del]').forEach(button => button.onclick = () => confirmDelete(active, button.dataset.del));
    };
    $('#search').oninput = draw;
    $('#statusFilter').onchange = draw;
    draw();

    try {
      const pendingEditor = JSON.parse(sessionStorage.getItem(ACTIVE_CONTENT_EDITOR_KEY) || 'null');
      if (pendingEditor?.name === active && MODERN_CONTENT_COLLECTIONS.has(active) && !document.querySelector('.content-editor-modal')) {
        const pendingItem = pendingEditor.itemId === 'new' ? null : items.find(entry => String(entry.id) === String(pendingEditor.itemId));
        const pendingKey = contentDraftKey(active, pendingItem);
        if (localStorage.getItem(pendingKey)) {
          sessionStorage.removeItem(ACTIVE_CONTENT_EDITOR_KEY);
          setTimeout(() => openEditor(active, pendingItem), 80);
        } else {
          sessionStorage.removeItem(ACTIVE_CONTENT_EDITOR_KEY);
        }
      }
    } catch (_) {}
  }

  async function galleryPage() {
    const content = $('#adminContent');
    content.innerHTML = `<div class="admin-title-row gallery-title-row"><div><span class="dashboard-kicker">Imagens dos perfis</span><h1>Galeria</h1><p>Avatares e banners ficam organizados em seções separadas.</p></div></div><div class="gallery-admin-toolbar"><input class="a-input" id="gallerySearch" placeholder="Buscar categoria…"><select class="a-select" id="galleryStatus"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Ocultos</option></select></div><div id="galleryAdminBoard"><div class="empty">Carregando galeria…</div></div>`;
    const items = await db.list('gallery', { orderBy: 'order', direction: 'asc' });
    const itemType = item => String(item.itemType || item.mediaType || 'avatar').toLowerCase() === 'banner' ? 'banner' : 'avatar';
    const draw = () => {
      const search = $('#gallerySearch').value.trim().toLowerCase();
      const status = $('#galleryStatus').value;
      const filtered = items.filter(item => {
        const type = itemType(item);
        const category = String(item.category || (type === 'banner' ? 'Banners de perfil' : 'Sem categoria'));
        return (!search || category.toLowerCase().includes(search)) && (!status || String(item.active !== false) === status);
      });
      const avatars = filtered.filter(item => itemType(item) === 'avatar');
      const banners = filtered.filter(item => itemType(item) === 'banner');
      const avatarGroups = new Map();
      avatars.forEach(item => {
        const category = String(item.category || 'Sem categoria').trim() || 'Sem categoria';
        if (!avatarGroups.has(category)) avatarGroups.set(category, []);
        avatarGroups.get(category).push(item);
      });
      const card = (item, type, category) => `<article class="gallery-avatar-card ${type === 'banner' ? 'is-banner' : ''} ${item.active === false ? 'is-hidden' : ''}"><div class="gallery-avatar-image">${item.imageUrl ? `<img src="${esc(item.imageUrl)}" alt="${type === 'banner' ? 'Banner de perfil' : `Avatar da categoria ${esc(category)}`}" loading="lazy">` : '<span>Sem imagem</span>'}</div><div class="gallery-avatar-info"><small>${item.active === false ? 'Oculto' : 'Ativo'} · ordem ${esc(item.order ?? 0)}</small></div><div class="gallery-avatar-actions"><button class="a-btn" data-edit="${item.id}">Editar</button><button class="a-btn danger" data-del="${item.id}">Excluir</button></div></article>`;
      const avatarContent = avatarGroups.size
        ? `<div class="gallery-category-board">${[...avatarGroups.entries()].map(([category, groupItems]) => `<section class="gallery-category-panel"><header><div><small>Categoria de avatares</small><h2>${esc(category)}</h2></div><span>${groupItems.length} ${groupItems.length === 1 ? 'avatar' : 'avatares'}</span></header><div class="gallery-avatar-grid">${groupItems.map(item => card(item, 'avatar', category)).join('')}</div></section>`).join('')}</div>`
        : '<div class="empty">Nenhum avatar encontrado.</div>';
      const bannerContent = banners.length
        ? `<section class="gallery-category-panel banner-panel gallery-banner-panel"><header><div><small>Banners de fundo</small><h2>Banners de perfil</h2></div><span>${banners.length} ${banners.length === 1 ? 'banner' : 'banners'}</span></header><div class="gallery-avatar-grid gallery-banner-grid">${banners.map(item => card(item, 'banner', 'Banners de perfil')).join('')}</div></section>`
        : '<div class="empty">Nenhum banner encontrado.</div>';
      const board = $('#galleryAdminBoard');
      board.innerHTML = `<section class="gallery-type-section"><div class="gallery-type-heading"><div><span class="dashboard-kicker">Avatar</span><h2>Avatares</h2><p>Os nomes aparecem apenas nas categorias.</p></div><button class="a-btn primary" id="newGalleryAvatar">+ Adicionar avatar</button></div>${avatarContent}</section><section class="gallery-type-section"><div class="gallery-type-heading"><div><span class="dashboard-kicker">Banner</span><h2>Banners de perfil</h2><p>Imagens horizontais sem nome individual.</p></div><button class="a-btn primary" id="newGalleryBanner">+ Adicionar banner</button></div>${bannerContent}</section>`;
      $('#newGalleryAvatar').onclick = () => openEditor('gallery', null, { itemType: 'avatar' });
      $('#newGalleryBanner').onclick = () => openEditor('gallery', null, { itemType: 'banner', category: 'Banners de perfil' });
      board.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => openEditor('gallery', items.find(item => item.id === button.dataset.edit)));
      board.querySelectorAll('[data-del]').forEach(button => button.onclick = () => confirmDelete('gallery', button.dataset.del));
    };
    $('#gallerySearch').oninput = draw;
    $('#galleryStatus').onchange = draw;
    draw();
  }

  async function collectionPage(name) {
    const content = $('#adminContent');
    const label = LABELS[name] || name;
    content.innerHTML = `<div class="admin-title-row"><div><h1>${esc(label)}</h1><p>Crie, edite, publique e organize os itens.</p></div>${name === 'users' ? '' : '<button class="a-btn primary" id="newItem">+ Adicionar</button>'}</div><div class="a-card"><div class="toolbar"><input class="a-input" id="search" placeholder="Buscar por título…"><select class="a-select" id="statusFilter" style="max-width:180px"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Ocultos</option></select></div><div id="list"><div class="empty">Carregando…</div></div></div>`;
    if ($('#newItem')) $('#newItem').onclick = () => openEditor(name);
    const items = await db.list(name, { orderBy: 'order', direction: 'asc' });
    const draw = () => {
      const search = $('#search').value.toLowerCase();
      const status = $('#statusFilter').value;
      const rows = items.filter(item => (!search || String(item.title || item.name || item.displayName || item.email || '').toLowerCase().includes(search)) && (!status || String(item.active) === status));
      $('#list').innerHTML = rows.length ? `<div class="table-wrap"><table class="a-table"><thead><tr><th>Item</th><th>Tipo</th><th>Ordem</th><th>Status</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>${rows.map(item => `<tr><td><strong>${esc(item.title || item.name || item.displayName || item.email || item.id)}</strong><br><small style="color:var(--a-muted)">${esc(item.id)}${name === 'videos' ? `<br>Link: /${esc(normalizePublicId(item.publicId) || generatePublicId(item.id))}` : ''}</small></td><td>${esc(item.type || name)}</td><td>${esc(item.order ?? 0)}</td><td><span class="status ${item.active === false ? 'off' : 'on'}">${item.active === false ? 'Oculto' : 'Ativo'}</span></td><td>${formatDate(item.updatedAt)}</td><td><div class="row-actions">${name === 'users' ? '' : `<button class="a-btn" data-edit="${item.id}">Editar</button><button class="a-btn danger" data-del="${item.id}">Excluir</button>`}</div></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Nenhum item encontrado.</div>';
      document.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => openEditor(name, items.find(item => item.id === button.dataset.edit)));
      document.querySelectorAll('[data-del]').forEach(button => button.onclick = () => confirmDelete(name, button.dataset.del));
    };
    $('#search').oninput = draw;
    $('#statusFilter').onchange = draw;
    draw();
  }

  function imageField(label, name, value = '') {
    const safe = esc(value);
    return `<div class="field full image-url-field"><label>${label}</label><div class="image-source-hint">Cole uma URL pública (https://...) ou use um arquivo publicado em <code>/assets/...</code>.</div><div class="image-input-row"><input class="a-input image-url-input" name="${name}" value="${safe}" placeholder="/assets/banners/exemplo.webp ou https://..."><button class="a-btn image-clear" type="button">Limpar</button></div><div class="image-validation" aria-live="polite"></div><div class="image-preview-wrap" ${value ? '' : 'hidden'}><img class="preview image-live-preview" src="${safe}" alt="Prévia de ${esc(label)}"></div></div>`;
  }

  function editorFields(name, item = {}, context = {}) {
    const showMedia = !['sections','users'].includes(name);
    const sections = context.sections || [];
    const sectionLinkedContent = ['videos','movies','series'].includes(name);
    const currentSection = sections.find(section => String(section.id) === String(item.sectionId || '')) || sections.find(section => {
      const sectionKeys = [section.title, section.category, section.slug, section.id].map(value => String(value || '').trim().toLowerCase());
      const itemKeys = [item.type, item.category, item.sectionName].map(value => String(value || '').trim().toLowerCase());
      return itemKeys.some(value => value && sectionKeys.includes(value));
    });
    const sectionOptions = sections.map(section => `<option value="${esc(section.title || section.category || section.id)}"></option>`).join('');
    const selectedFeaturedCollection = String(item.contentCollection || item.sourceCollection || (item.videoId ? 'videos' : '') || '').trim();
    const selectedFeaturedId = String(item.contentId || item.videoId || '').trim();
    const sectionFields = name === 'sections' ? `<div class="field"><label>Categoria / identificador *</label><input class="a-input" name="category" required value="${esc(item.category || item.slug || '')}" placeholder="ex.: vanity-fair"><small>Identificador interno usado também para manter compatibilidade com conteúdos antigos.</small></div><div class="field"><label>Quantidade inicial</label><input class="a-input" type="number" min="1" max="50" name="itemLimit" value="${esc(item.itemLimit ?? 12)}"></div>` : '';
    const contentSectionFields = sectionLinkedContent ? `<div class="field full"><label>Tipo / seção do site *</label><input class="a-input" id="contentSectionSearch" name="sectionSearch" list="createdSectionsList" required autocomplete="off" value="${esc(currentSection?.title || currentSection?.category || '')}" placeholder="Selecione uma seção criada em Seções do site"><input type="hidden" id="contentSectionId" name="sectionId" value="${esc(currentSection?.id || item.sectionId || '')}"><datalist id="createdSectionsList">${sectionOptions}</datalist><small>Este campo usa somente as seções criadas em “Seções do site”. O conteúdo aparecerá automaticamente na seção escolhida.</small></div>` : '';
    const typeField = sectionLinkedContent ? '' : `<div class="field"><label>Tipo</label><input class="a-input" name="type" value="${esc(item.type || name)}"></div>`;
    const videoFields = name === 'videos' ? `<div class="field"><label>ID público do vídeo</label><input class="a-input" name="publicId" value="${esc(normalizePublicId(item.publicId) || generatePublicId(item.id || ''))}" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" readonly><small>O link público será /${esc(normalizePublicId(item.publicId) || generatePublicId(item.id || ''))}.</small></div><div class="field full"><label>URL do vídeo</label><input class="a-input" name="videoUrl" value="${esc(item.videoUrl || item.contentUrl || item.link || '')}" placeholder="https://youtube.com/..."></div>` : '';
    const titleLabel = ['movies','series'].includes(name) ? 'Título interno / busca *' : 'Título *';
    const titleHelp = ['movies','series'].includes(name) ? '<small>Este texto serve para busca, acessibilidade e administração. No site, o título visual será a logo cadastrada.</small>' : '';
    const logoField = ['movies','series'].includes(name) ? imageField('Logo do título *', 'logoUrl', item.logoUrl || '') : (name === 'featured' ? imageField('Logo do conteúdo', 'logoUrl', item.logoUrl || '') : '');
    const featuredFields = name === 'featured' ? `<div class="field full featured-content-field"><label>Selecionar conteúdo publicado *</label><input type="hidden" name="contentId" id="featuredContentId" value="${esc(selectedFeaturedId)}"><input type="hidden" name="contentCollection" id="featuredContentCollection" value="${esc(selectedFeaturedCollection)}"><input type="hidden" name="videoId" id="featuredLegacyVideoId" value="${esc(selectedFeaturedCollection === 'videos' ? selectedFeaturedId : '')}"><input type="hidden" name="order" value="${esc(item.order ?? 0)}"><input type="hidden" name="active" value="${item.active === false ? 'false' : 'true'}"><div class="featured-picker" id="featuredContentPicker"><div class="featured-picker-toolbar"><label class="featured-picker-search" aria-label="Buscar conteúdo"><span aria-hidden="true">⌕</span><input type="search" id="featuredContentSearch" placeholder="Buscar por título, tipo ou ano…" autocomplete="off"></label><div class="featured-picker-tabs" role="tablist" aria-label="Filtrar tipo de conteúdo"><button type="button" class="active" data-featured-filter="all">Todos</button><button type="button" data-featured-filter="videos">Vídeos</button><button type="button" data-featured-filter="movies">Filmes</button><button type="button" data-featured-filter="series">Séries</button></div></div><div class="featured-selected" id="featuredSelectedSummary"><div class="featured-selected-empty"><span>▣</span><div><strong>Nenhum conteúdo selecionado</strong><small>Escolha um item da lista abaixo.</small></div></div></div><div class="featured-picker-list" id="featuredContentList" role="listbox" aria-label="Conteúdos publicados"></div><div class="featured-picker-empty" id="featuredContentEmpty" hidden>Nenhum conteúdo encontrado com esse filtro.</div></div><small>Você pode pesquisar e selecionar qualquer vídeo, filme ou série já publicado. A logo cadastrada no filme ou na série será usada como título visual no destaque.</small></div>` : '';
    if (name === 'featured') {
      return `<div class="form-grid featured-only-grid">${featuredFields}</div>`;
    }
    if (name === 'gallery') {
      const type = String(item.itemType || item.mediaType || 'avatar').toLowerCase() === 'banner' ? 'banner' : 'avatar';
      const isBanner = type === 'banner';
      return `<div class="form-grid"><input type="hidden" name="itemType" value="${type}"><input type="hidden" name="title" value="${isBanner ? 'Banner' : 'Avatar'}">${isBanner ? '<input type="hidden" name="category" value="Banners de perfil">' : `<div class="field full"><label>Nome da categoria *</label><input class="a-input" name="category" required maxlength="60" value="${esc(item.category || '')}" placeholder="Ex.: Tour Film"><small>O avatar não terá nome individual; somente esta categoria será exibida.</small></div>`}${imageField(isBanner ? 'Link da imagem do banner *' : 'Link da imagem do avatar *', 'imageUrl', item.imageUrl || '')}<div class="field"><label>Ordem</label><input class="a-input" type="number" name="order" value="${esc(item.order ?? 0)}"></div><div class="field"><label>Status</label><select class="a-select" name="active"><option value="true" ${item.active !== false ? 'selected' : ''}>Ativo</option><option value="false" ${item.active === false ? 'selected' : ''}>Oculto</option></select></div><div class="field full"><small>${isBanner ? 'O banner não possui nome individual. Prefira imagens horizontais em 16:6 ou 16:9.' : 'Avatares funcionam melhor em formato quadrado.'}</small></div></div>`;
    }
    return `<div class="form-grid">${featuredFields}<div class="field full"><label>${titleLabel}</label><input class="a-input" name="title" required maxlength="120" value="${esc(item.title || '')}">${titleHelp}</div>${typeField}<div class="field"><label>Ordem</label><input class="a-input" type="number" name="order" value="${esc(item.order ?? 0)}"></div>${sectionFields}${contentSectionFields}${videoFields}<div class="field full"><label>Descrição</label><textarea class="a-textarea" rows="4" maxlength="1000" name="description">${esc(item.description || '')}</textarea></div>${showMedia ? `${imageField(['movies','series'].includes(name) ? 'Imagem / thumbnail (usada também como fundo)' : 'Imagem / thumbnail', 'imageUrl', item.imageUrl || item.thumbnailUrl || '')}${['videos','movies','series'].includes(name) ? '' : imageField('Banner', 'bannerUrl', item.bannerUrl || '')}${logoField}${name === 'videos' ? '' : `<div class="field full"><label>Link do conteúdo</label><input class="a-input" name="contentUrl" value="${esc(item.contentUrl || item.link || '')}" placeholder="https://... ou /pagina"></div>`}` : ''}<div class="field"><label>Status</label><select class="a-select" name="active"><option value="true" ${item.active !== false ? 'selected' : ''}>Ativo</option><option value="false" ${item.active === false ? 'selected' : ''}>Oculto</option></select></div><div class="field"><label>Duração</label><input class="a-input" name="duration" value="${esc(item.duration || item.videoDuration || item.runtime || '')}" placeholder="Ex.: 24 min ou 1h 42min"></div><div class="field"><label>Ano</label><input class="a-input" name="year" value="${esc(item.year || '')}"></div></div>`;
  }

  function featuredCollectionLabel(collection) {
    return ({ videos: 'Vídeo', movies: 'Filme', series: 'Série' })[collection] || 'Conteúdo';
  }

  function setupFeaturedContentPicker(root, context, currentItem = {}) {
    const items = Array.isArray(context.featuredContents) ? context.featuredContents : [];
    const picker = $('#featuredContentPicker', root);
    if (!picker) return;

    const form = $('#editorForm', root);
    const search = $('#featuredContentSearch', root);
    const list = $('#featuredContentList', root);
    const empty = $('#featuredContentEmpty', root);
    const summary = $('#featuredSelectedSummary', root);
    const contentIdInput = $('#featuredContentId', root);
    const collectionInput = $('#featuredContentCollection', root);
    const legacyVideoInput = $('#featuredLegacyVideoId', root);
    const filterButtons = [...picker.querySelectorAll('[data-featured-filter]')];
    let activeFilter = 'all';

    const normalize = value => String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    const itemKey = item => `${item.collection}:${item.id}`;
    const selectedKey = () => contentIdInput.value && collectionInput.value
      ? `${collectionInput.value}:${contentIdInput.value}`
      : '';
    const imageOf = item => item.thumbnailUrl || item.imageUrl || item.bannerUrl || '';
    const metaOf = item => [featuredCollectionLabel(item.collection), item.year || '', item.duration || item.videoDuration || item.runtime || '']
      .filter(Boolean)
      .join(' · ');

    const renderSummary = item => {
      if (!item) {
        summary.innerHTML = '<div class="featured-selected-empty"><span>▣</span><div><strong>Nenhum conteúdo selecionado</strong><small>Escolha um item da lista abaixo.</small></div></div>';
        return;
      }
      const image = imageOf(item);
      summary.innerHTML = `<div class="featured-selected-card">${image ? `<img src="${esc(image)}" alt="">` : '<span class="featured-selected-placeholder">▣</span>'}<div><small>Selecionado para o destaque</small><strong>${esc(item.title || item.id)}</strong><span>${esc(metaOf(item))}</span></div><i aria-hidden="true">✓</i></div>`;
      const preview = summary.querySelector('img');
      if (preview) preview.addEventListener('error', () => preview.replaceWith(Object.assign(document.createElement('span'), { className: 'featured-selected-placeholder', textContent: '▣' })));
    };

    const fillFromContent = item => {
      if (!form || !item) return;
      if (form.elements.title) form.elements.title.value = item.title || '';
      if (form.elements.description) form.elements.description.value = item.description || '';
      if (form.elements.imageUrl) form.elements.imageUrl.value = item.imageUrl || item.thumbnailUrl || item.bannerUrl || '';
      if (form.elements.bannerUrl) form.elements.bannerUrl.value = item.bannerUrl || item.imageUrl || item.thumbnailUrl || '';
      if (form.elements.contentUrl) form.elements.contentUrl.value = item.videoUrl || item.contentUrl || item.link || '';
      if (form.elements.duration) form.elements.duration.value = item.duration || item.videoDuration || item.runtime || '';
      if (form.elements.year) form.elements.year.value = item.year || '';
      if (form.elements.logoUrl) form.elements.logoUrl.value = item.logoUrl || '';
      if (form.elements.type) form.elements.type.value = featuredCollectionLabel(item.collection).toLowerCase();
      form.querySelectorAll('.image-url-input').forEach(input => input.dispatchEvent(new Event('input')));
    };

    const choose = (item, fillFields = true) => {
      if (!item) return;
      contentIdInput.value = item.id;
      collectionInput.value = item.collection;
      legacyVideoInput.value = item.collection === 'videos' ? item.id : '';
      renderSummary(item);
      if (fillFields) fillFromContent(item);
      list.querySelectorAll('[data-featured-key]').forEach(button => {
        const selected = button.dataset.featuredKey === itemKey(item);
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-selected', String(selected));
      });
    };

    const draw = () => {
      const term = normalize(search.value);
      const current = selectedKey();
      const filtered = items.filter(item => {
        if (activeFilter !== 'all' && item.collection !== activeFilter) return false;
        if (!term) return true;
        return normalize([
          item.title,
          item.description,
          item.year,
          item.duration,
          item.type,
          featuredCollectionLabel(item.collection)
        ].filter(Boolean).join(' ')).includes(term);
      });

      list.innerHTML = filtered.map(item => {
        const image = imageOf(item);
        const key = itemKey(item);
        const selected = key === current;
        return `<button type="button" class="featured-content-option ${selected ? 'selected' : ''}" data-featured-key="${esc(key)}" role="option" aria-selected="${selected}">${image ? `<img src="${esc(image)}" alt="" loading="lazy">` : '<span class="featured-content-placeholder">▣</span>'}<span class="featured-content-copy"><span class="featured-content-badge ${esc(item.collection)}">${esc(featuredCollectionLabel(item.collection))}</span><strong>${esc(item.title || item.id)}</strong><small>${esc([item.year || '', item.duration || item.videoDuration || item.runtime || ''].filter(Boolean).join(' · ') || 'Sem informações adicionais')}</small></span><span class="featured-content-check" aria-hidden="true">✓</span></button>`;
      }).join('');
      empty.hidden = filtered.length > 0;
      list.hidden = filtered.length === 0;

      list.querySelectorAll('[data-featured-key]').forEach(button => {
        const content = items.find(item => itemKey(item) === button.dataset.featuredKey);
        button.addEventListener('click', () => choose(content, true));
        const image = button.querySelector('img');
        if (image) image.addEventListener('error', () => image.replaceWith(Object.assign(document.createElement('span'), { className: 'featured-content-placeholder', textContent: '▣' })));
      });
    };

    search.addEventListener('input', draw);
    filterButtons.forEach(button => button.addEventListener('click', () => {
      activeFilter = button.dataset.featuredFilter || 'all';
      filterButtons.forEach(item => item.classList.toggle('active', item === button));
      draw();
    }));

    const initialCollection = String(currentItem.contentCollection || currentItem.sourceCollection || (currentItem.videoId ? 'videos' : collectionInput.value) || '').trim();
    const initialId = String(currentItem.contentId || currentItem.videoId || contentIdInput.value || '').trim();
    const initial = items.find(item => item.collection === initialCollection && String(item.id) === initialId);
    if (initial) {
      contentIdInput.value = initial.id;
      collectionInput.value = initial.collection;
      legacyVideoInput.value = initial.collection === 'videos' ? initial.id : '';
      renderSummary(initial);
    } else {
      renderSummary(null);
    }
    draw();
  }

  function validImageSource(value) {
    if (!value) return true;
    return /^https?:\/\//i.test(value) || /^\/?assets\//i.test(value);
  }

  function setupImagePreviews(root) {
    root.querySelectorAll('.image-url-field').forEach(field => {
      const input = $('.image-url-input', field);
      const preview = $('.image-live-preview', field);
      const wrap = $('.image-preview-wrap', field);
      const validation = $('.image-validation', field);
      const clear = $('.image-clear', field);
      const update = () => {
        const value = input.value.trim();
        validation.textContent = '';
        validation.className = 'image-validation';
        if (!value) {
          wrap.hidden = true;
          preview.removeAttribute('src');
          return;
        }
        if (!validImageSource(value)) {
          wrap.hidden = true;
          validation.textContent = 'Use uma URL iniciada por http:// ou https://, ou um caminho /assets/...';
          validation.classList.add('err');
          return;
        }
        preview.src = value;
        wrap.hidden = false;
        validation.textContent = value.startsWith('http') ? 'Imagem externa' : 'Imagem da pasta assets';
        validation.classList.add('ok');
      };
      input.addEventListener('input', update);
      preview.addEventListener('error', () => {
        validation.textContent = 'Não foi possível carregar esta imagem. Verifique o endereço ou publique o arquivo em assets.';
        validation.className = 'image-validation err';
      });
      preview.addEventListener('load', () => {
        if (input.value.trim()) {
          validation.textContent = 'Imagem carregada corretamente.';
          validation.className = 'image-validation ok';
        }
      });
      clear.onclick = () => { input.value = ''; update(); input.focus(); };
      update();
    });
  }


  const CONTENT_DRAFT_PREFIX = 'be_admin_content_draft_v3';
  const ACTIVE_CONTENT_EDITOR_KEY = 'be_admin_active_content_editor_v1';
  const MODERN_CONTENT_COLLECTIONS = new Set(['videos','movies','series','shows']);

  function contentDraftKey(name, item) {
    return `${CONTENT_DRAFT_PREFIX}:${name}:${item?.id || 'new'}`;
  }

  function rememberActiveContentEditor(name, item) {
    try {
      sessionStorage.setItem(ACTIVE_CONTENT_EDITOR_KEY, JSON.stringify({ name, itemId: item?.id || 'new' }));
    } catch (_) {}
  }

  function clearActiveContentEditor(name, item) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(ACTIVE_CONTENT_EDITOR_KEY) || 'null');
      if (!saved || (saved.name === name && String(saved.itemId || 'new') === String(item?.id || 'new'))) {
        sessionStorage.removeItem(ACTIVE_CONTENT_EDITOR_KEY);
      }
    } catch (_) {
      try { sessionStorage.removeItem(ACTIVE_CONTENT_EDITOR_KEY); } catch (_) {}
    }
  }

  function readContentDraft(name, item) {
    try {
      const parsed = JSON.parse(localStorage.getItem(contentDraftKey(name, item)) || 'null');
      if (!parsed || !parsed.data || parsed.name !== name) return null;
      if (item?.updatedAt && parsed.baseUpdatedAt && new Date(item.updatedAt).getTime() > new Date(parsed.baseUpdatedAt).getTime()) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function normalizedDraftData(data = {}) {
    const copy = { ...data };
    if ('active' in copy) copy.active = String(copy.active) !== 'false';
    if ('order' in copy) copy.order = Number(copy.order) || 0;
    return copy;
  }

  function modernContentEditorFields(name, item = {}, context = {}) {
    const sections = context.sections || [];
    const sectionLinked = ['videos','movies','series'].includes(name);
    const isVisualTitle = ['movies','series'].includes(name);
    const currentSection = sections.find(section => String(section.id) === String(item.sectionId || '')) || sections.find(section => {
      const keys = [section.title, section.category, section.slug, section.id].map(value => String(value || '').trim().toLowerCase());
      return [item.type, item.category, item.sectionName, item.sectionSearch].some(value => value && keys.includes(String(value).trim().toLowerCase()));
    });
    const sectionOptions = sections.map(section => `<option value="${esc(section.title || section.category || section.id)}"></option>`).join('');
    const publicId = normalizePublicId(item.publicId) || generatePublicId(item.id || '');
    const categoryName = LABELS[name] || 'Conteúdo';

    return `<div class="content-editor-fields">
      <section class="editor-field-group">
        <div class="editor-group-heading"><span>01</span><div><h3>Informações principais</h3><p>Defina como o conteúdo será identificado e organizado.</p></div></div>
        <div class="form-grid modern-form-grid">
          <div class="field full"><label>${isVisualTitle ? 'Título interno / busca *' : 'Título *'}</label><input class="a-input" name="title" required maxlength="120" value="${esc(item.title || '')}" placeholder="Digite o título do conteúdo">${isVisualTitle ? '<small>O título visual no site será a logo. Este texto é usado na busca e no painel.</small>' : ''}</div>
          ${sectionLinked ? `<div class="field full"><label>Seção do site *</label><input class="a-input" id="contentSectionSearch" name="sectionSearch" list="createdSectionsList" required autocomplete="off" value="${esc(currentSection?.title || currentSection?.category || item.sectionSearch || '')}" placeholder="Selecione uma seção criada"><input type="hidden" id="contentSectionId" name="sectionId" value="${esc(currentSection?.id || item.sectionId || '')}"><datalist id="createdSectionsList">${sectionOptions}</datalist><small>O conteúdo aparecerá automaticamente na seção escolhida.</small></div>` : `<div class="field full"><label>Tipo</label><input class="a-input" name="type" value="${esc(item.type || categoryName)}" placeholder="Ex.: Performance, documentário"></div>`}
          <div class="field full"><label>Descrição</label><textarea class="a-textarea" rows="5" maxlength="1000" name="description" placeholder="Escreva uma descrição curta para o site">${esc(item.description || '')}</textarea><div class="field-counter"><span data-description-count>0</span>/1000</div></div>
        </div>
      </section>

      <section class="editor-field-group">
        <div class="editor-group-heading"><span>02</span><div><h3>Imagens e reprodução</h3><p>Use imagens nítidas; a prévia ao lado atualiza em tempo real.</p></div></div>
        <div class="form-grid modern-form-grid">
          ${imageField(isVisualTitle ? 'Imagem / thumbnail *' : 'Imagem / thumbnail *', 'imageUrl', item.imageUrl || item.thumbnailUrl || '')}
          ${isVisualTitle ? imageField('Logo do título *', 'logoUrl', item.logoUrl || '') : ''}
          <div class="field full"><label>${name === 'videos' ? 'URL do vídeo' : 'Link do conteúdo'}</label><input class="a-input" name="${name === 'videos' ? 'videoUrl' : 'contentUrl'}" value="${esc(name === 'videos' ? (item.videoUrl || item.contentUrl || item.link || '') : (item.contentUrl || item.link || ''))}" placeholder="https://..."></div>
        </div>
      </section>

      <section class="editor-field-group">
        <div class="editor-group-heading"><span>03</span><div><h3>Publicação</h3><p>Complete os detalhes e escolha quando o item ficará visível.</p></div></div>
        <div class="form-grid modern-form-grid compact-fields">
          <div class="field"><label>Ano</label><input class="a-input" name="year" value="${esc(item.year || '')}" inputmode="numeric" placeholder="2026"></div>
          <div class="field"><label>Duração</label><input class="a-input" name="duration" value="${esc(item.duration || item.videoDuration || item.runtime || '')}" placeholder="1h 42min"></div>
          <div class="field"><label>Ordem</label><input class="a-input" type="number" name="order" value="${esc(item.order ?? 0)}"></div>
          <div class="field"><label>Status</label><select class="a-select" name="active"><option value="true" ${item.active !== false ? 'selected' : ''}>Ativo</option><option value="false" ${item.active === false ? 'selected' : ''}>Oculto</option></select></div>
          ${name === 'videos' ? `<div class="field full"><label>ID público</label><div class="public-id-row"><input class="a-input" name="publicId" value="${esc(publicId)}" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" readonly><span>/${esc(publicId)}</span></div><small>O endereço público é criado automaticamente.</small></div>` : ''}
        </div>
      </section>
    </div>`;
  }

  function modernContentPreview(name) {
    const label = ({ videos:'Vídeo', movies:'Filme', series:'Série', shows:'Show' })[name] || 'Conteúdo';
    return `<aside class="content-live-preview" aria-label="Prévia do conteúdo">
      <div class="preview-pane-heading"><div><span>Preview ao vivo</span><strong>Como ficará no site</strong></div><i data-draft-indicator>Rascunho protegido</i></div>
      <div class="editor-site-preview">
        <div class="editor-preview-hero" data-preview-hero>
          <div class="editor-preview-shade"></div>
          <div class="editor-preview-copy">
            <span class="editor-preview-type">${label}</span>
            <div class="editor-preview-logo" data-preview-logo>Seu título</div>
            <div class="editor-preview-meta"><span data-preview-duration>Duração</span><b></b><span data-preview-year>Ano</span></div>
            <p data-preview-description>A descrição aparecerá aqui conforme você digitar.</p>
            <button type="button" tabindex="-1"><span>▶</span> Assistir</button>
          </div>
        </div>
        <div class="editor-preview-rail">
          <small>Card da seção</small>
          <div class="editor-preview-card" data-preview-card><span>Imagem do conteúdo</span></div>
        </div>
      </div>
      <div class="preview-help"><span>✓</span><p>A prévia é atualizada enquanto você edita. O rascunho é salvo no navegador ao trocar de aba ou recarregar a página.</p></div>
    </aside>`;
  }

  function setupModernContentEditor(root, name, item, draftKey, restoredDraft) {
    const form = $('#editorForm', root);
    if (!form) return { clearDraft() {} };
    const status = $('[data-editor-draft-status]', root);
    const indicator = $('[data-draft-indicator]', root);
    const description = form.elements.description;
    const descriptionCount = $('[data-description-count]', root);
    const hero = $('[data-preview-hero]', root);
    const previewLogo = $('[data-preview-logo]', root);
    const previewDescription = $('[data-preview-description]', root);
    const previewYear = $('[data-preview-year]', root);
    const previewDuration = $('[data-preview-duration]', root);
    const previewCard = $('[data-preview-card]', root);
    let timer = null;
    let dirty = Boolean(restoredDraft);

    const fieldValue = name => String(form.elements[name]?.value || '').trim();
    const setPreviewImage = (element, value, fallback) => {
      element.style.backgroundImage = value ? `url("${value.replace(/"/g, '%22')}")` : '';
      element.classList.toggle('has-image', Boolean(value));
      if (fallback) {
        const child = element.querySelector('span');
        if (child) child.textContent = value ? '' : fallback;
      }
    };
    const updatePreview = () => {
      const title = fieldValue('title') || 'Seu título';
      const image = fieldValue('imageUrl');
      const logo = fieldValue('logoUrl');
      const year = fieldValue('year') || 'Ano';
      const duration = fieldValue('duration') || 'Duração';
      const descriptionText = fieldValue('description') || 'A descrição aparecerá aqui conforme você digitar.';
      setPreviewImage(hero, image, '');
      setPreviewImage(previewCard, image, 'Imagem do conteúdo');
      if (['movies','series'].includes(name) && logo) {
        previewLogo.innerHTML = `<img src="${esc(logo)}" alt="${esc(title)}">`;
      } else {
        previewLogo.textContent = title;
      }
      previewDescription.textContent = descriptionText;
      previewYear.textContent = year;
      previewDuration.textContent = duration;
      if (descriptionCount && description) descriptionCount.textContent = String(description.value.length);
    };
    const snapshot = () => Object.fromEntries(new FormData(form).entries());
    const saveDraft = immediate => {
      if (timer) clearTimeout(timer);
      const execute = () => {
        try {
          localStorage.setItem(draftKey, JSON.stringify({
            name,
            data: snapshot(),
            baseUpdatedAt: item?.updatedAt || '',
            savedAt: new Date().toISOString()
          }));
          if (status) status.textContent = 'Rascunho salvo agora';
          if (indicator) indicator.textContent = 'Rascunho salvo';
        } catch (_) {
          if (status) status.textContent = 'Não foi possível salvar o rascunho';
        }
      };
      if (immediate) execute(); else timer = setTimeout(execute, 350);
    };
    const onInput = () => {
      dirty = true;
      updatePreview();
      if (status) status.textContent = 'Salvando rascunho…';
      if (indicator) indicator.textContent = 'Salvando…';
      saveDraft(false);
    };
    form.addEventListener('input', onInput);
    form.addEventListener('change', onInput);
    const onVisibility = () => { if (document.visibilityState === 'hidden' && dirty) saveDraft(true); };
    const onPageHide = () => { if (dirty) saveDraft(true); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    updatePreview();
    if (restoredDraft) {
      if (status) status.textContent = 'Rascunho anterior restaurado';
      if (indicator) indicator.textContent = 'Rascunho restaurado';
      setTimeout(() => toast('Seu rascunho foi restaurado.'), 100);
    }
    return {
      saveNow() { saveDraft(true); },
      clearDraft() {
        if (timer) clearTimeout(timer);
        localStorage.removeItem(draftKey);
        clearActiveContentEditor(name, item);
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', onPageHide);
      }
    };
  }

  async function openEditor(name, item = null, defaults = {}) {
    if (name === 'news') {
      toast('A área de Álbuns será configurada em uma próxima etapa.');
      return;
    }
    const storedDraft = MODERN_CONTENT_COLLECTIONS.has(name) ? readContentDraft(name, item) : null;
    const draft = { ...(item ? { ...item } : { ...defaults }), ...(storedDraft ? normalizedDraftData(storedDraft.data) : {}) };
    if (name === 'videos' && !normalizePublicId(draft.publicId)) draft.publicId = generatePublicId(item?.id || '');
    if (name === 'featured' && !item) {
      const active = (await db.list('featured')).filter(entry => entry.active !== false);
      if (active.length >= 6) toast('O limite de 6 destaques ativos foi atingido.', 'err');
    }
    const context = { sections: [], featuredContents: [] };
    try {
      if (['videos','movies','series'].includes(name)) context.sections = (await db.list('sections', { orderBy: 'order', direction: 'asc' })).filter(entry => entry.active !== false);
      if (name === 'featured') {
        const collections = [
          ['videos', 'Vídeo'],
          ['movies', 'Filme'],
          ['series', 'Série']
        ];
        const rows = await Promise.all(collections.map(async ([collection, label]) => {
          const entries = await db.list(collection, { orderBy: 'order', direction: 'asc' }).catch(() => []);
          return entries
            .filter(entry => entry.active !== false)
            .map(entry => ({ ...entry, collection, collectionLabel: label }));
        }));
        context.featuredContents = rows.flat().sort((a, b) => {
          const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;
          const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;
          if (aDate !== bDate) return bDate - aDate;
          return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR');
        });
        if (!context.featuredContents.length) {
          toast('Cadastre pelo menos um vídeo, filme ou série antes de criar um destaque.', 'err');
          return;
        }
      }
    } catch (error) {
      toast('Não foi possível carregar as opções: ' + error.message, 'err');
      return;
    }

    const wrap = document.createElement('div');
    const modernEditor = MODERN_CONTENT_COLLECTIONS.has(name);
    const draftKey = contentDraftKey(name, item);
    wrap.className = `modal-backdrop ${modernEditor ? 'content-editor-backdrop' : ''}`;
    wrap.innerHTML = modernEditor
      ? `<div class="modal content-editor-modal"><header class="content-editor-header"><div><span class="dashboard-kicker">${item ? 'Editar conteúdo' : 'Novo conteúdo'}</span><h2>${item ? 'Editar' : 'Adicionar'} ${esc(LABELS[name] || name)}</h2><p>Organize as informações e acompanhe a aparência no site em tempo real.</p></div><div class="editor-header-status"><span class="editor-save-dot"></span><small data-editor-draft-status>${storedDraft ? 'Rascunho anterior encontrado' : 'Rascunho protegido no navegador'}</small></div></header><form id="editorForm" class="modern-content-form"><div class="content-editor-layout">${modernContentEditorFields(name, draft, context)}${modernContentPreview(name)}</div><div class="content-editor-actions"><div><strong>${item ? 'Alterações ainda não publicadas' : 'Novo conteúdo não publicado'}</strong><small>Salvar publica os dados no banco. O rascunho local evita perdas.</small></div><div class="content-editor-action-buttons"><button type="button" class="a-btn" id="cancelModal">Cancelar</button><button class="a-btn primary" type="submit">${item ? 'Salvar alterações' : 'Publicar conteúdo'}</button></div></div></form></div>`
      : `<div class="modal ${name === 'featured' ? 'featured-editor-modal' : ''}"><h2>${item ? 'Editar' : 'Adicionar'} ${esc(LABELS[name] || name)}</h2><form id="editorForm">${editorFields(name, draft, context)}<div class="modal-actions"><button type="button" class="a-btn" id="cancelModal">Cancelar</button><button class="a-btn primary" type="submit">Salvar</button></div></form></div>`;
    document.body.append(wrap);
    if (modernEditor) rememberActiveContentEditor(name, item);
    let draftController = { clearDraft() {}, saveNow() {} };
    $('#cancelModal').onclick = () => { draftController.clearDraft(); wrap.remove(); };
    if (!modernEditor) wrap.onclick = event => { if (event.target === wrap) wrap.remove(); };
    setupImagePreviews(wrap);
    if (name === 'featured') setupFeaturedContentPicker(wrap, context, draft);
    if (modernEditor) draftController = setupModernContentEditor(wrap, name, item, draftKey, storedDraft);

    if (['videos','movies','series'].includes(name)) {
      const search = $('#contentSectionSearch', wrap);
      const hidden = $('#contentSectionId', wrap);
      const normalize = value => String(value || '').trim().toLowerCase();
      const syncSection = () => {
        const typed = normalize(search.value);
        const match = context.sections.find(section => [section.title, section.category, section.slug, section.id].some(value => normalize(value) === typed));
        hidden.value = match ? match.id : '';
        search.setCustomValidity(match ? '' : 'Selecione uma seção criada em Seções do site.');
      };
      search.addEventListener('input', syncSection);
      search.addEventListener('change', syncSection);
      syncSection();
    }


    $('#editorForm').onsubmit = async event => {
      event.preventDefault();
      const button = event.submitter;
      button.disabled = true;
      button.textContent = 'Salvando…';
      try {
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());
        for (const key of ['imageUrl','bannerUrl','logoUrl']) {
          if (data[key] && !validImageSource(data[key].trim())) throw new Error(`O campo ${key} deve usar https://... ou /assets/...`);
          if (typeof data[key] === 'string') data[key] = data[key].trim();
        }
        data.order = Number(data.order) || 0;
        if ('itemLimit' in data) data.itemLimit = Math.max(1, Number(data.itemLimit) || 12);
        if (typeof data.category === 'string') {
          data.category = name === 'gallery'
            ? data.category.trim()
            : data.category.trim().toLowerCase().replace(/\s+/g, '-');
        }
        if (name === 'gallery') data.itemType = data.itemType === 'banner' ? 'banner' : 'avatar';
        if (['movies','series'].includes(name) && !String(data.logoUrl || '').trim()) {
          throw new Error('Adicione a logo do título. Filmes e séries usam a logo no lugar do texto do cabeçalho.');
        }
        if (['movies','series'].includes(name)) {
          // Filmes e séries usam a própria thumbnail como imagem de fundo.
          data.bannerUrl = String(data.imageUrl || '').trim();
        }
        if (['videos','movies','series'].includes(name)) {
          const selected = context.sections.find(section => String(section.id) === String(data.sectionId || ''));
          if (!selected) throw new Error('Selecione uma seção criada em Seções do site.');
          data.sectionId = selected.id;
          data.sectionName = String(selected.title || selected.category || selected.id).trim();
          data.category = String(selected.category || selected.slug || selected.id).trim().toLowerCase();
          data.type = data.sectionName;
          delete data.sectionSearch;
        }
        if (name === 'videos') {
          data.publicId = normalizePublicId(data.publicId) || generatePublicId(item?.id || '');
          const existingVideos = await db.list('videos');
          const duplicated = existingVideos.some(video => video.id !== item?.id && String(normalizePublicId(video.publicId) || generatePublicId(video.id)) === data.publicId);
          if (duplicated) {
            do { data.publicId = generatePublicId(); }
            while (existingVideos.some(video => String(normalizePublicId(video.publicId) || generatePublicId(video.id)) === data.publicId));
          }
        }
        if (name === 'featured') {
          const allowedCollections = ['videos', 'movies', 'series'];
          const selectedCollection = String(data.contentCollection || '').trim();
          const selectedId = String(data.contentId || '').trim();
          if (!allowedCollections.includes(selectedCollection) || !selectedId) throw new Error('Selecione um vídeo, filme ou série para o destaque.');
          const selectedContent = context.featuredContents.find(entry => entry.collection === selectedCollection && String(entry.id) === selectedId);
          if (!selectedContent) throw new Error('O conteúdo selecionado não está mais disponível. Atualize a lista e tente novamente.');
          data.contentId = selectedContent.id;
          data.contentCollection = selectedCollection;
          data.sourceCollection = selectedCollection;
          data.videoId = selectedCollection === 'videos' ? selectedContent.id : '';
          // O destaque é totalmente vinculado ao conteúdo escolhido. Os dados visuais
          // são lidos diretamente do vídeo, filme ou série, sem campos duplicados.
          data.title = selectedContent.title || 'Destaque';
          data.description = '';
          data.imageUrl = '';
          data.bannerUrl = '';
          data.logoUrl = '';
          data.contentUrl = '';
          data.duration = '';
          data.year = '';
          if (!item) {
            const existingFeatured = await db.list('featured');
            data.order = existingFeatured.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), -1) + 1;
          } else {
            data.order = Number(item.order) || 0;
          }
        }
        data.active = data.active === 'true';
        data.updatedAt = now();
        data.updatedBy = user.email;
        if (!item) {
          data.createdAt = now();
          data.createdBy = user.email;
        }
        if (name === 'featured' && data.active) {
          const active = (await db.list('featured')).filter(entry => entry.active !== false);
          if (active.length >= 6 && !item) throw new Error('Não é possível ativar mais de 6 destaques.');
        }
        const saved = item ? await db.set(name, item.id, data, { merge: true }) : await db.add(name, data);
        await logAction(item ? 'content_updated' : 'content_created', name, saved.id, `${LABELS[name] || name}: ${name === 'gallery' ? (data.itemType === 'banner' ? 'Banner' : data.category || 'Avatar') : data.title}`);
        toast('Salvo com sucesso.');
        draftController.clearDraft();
        wrap.remove();
        loadPage();
      } catch (error) {
        toast(error.message, 'err');
        button.disabled = false;
        button.textContent = modernEditor ? (item ? 'Salvar alterações' : 'Publicar conteúdo') : 'Salvar';
      }
    };
  }

  function confirmDelete(name, id) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal" style="max-width:460px"><h2>Excluir item?</h2><p style="color:var(--a-muted)">Esta ação removerá o registro do banco atual e não poderá ser desfeita.</p><div class="modal-actions"><button class="a-btn" id="no">Cancelar</button><button class="a-btn danger" id="yes">Excluir</button></div></div>`;
    document.body.append(wrap);
    $('#no').onclick = () => wrap.remove();
    $('#yes').onclick = async () => {
      try {
        await db.remove(name, id);
        await logAction('content_deleted', name, id, `Item excluído de ${name}`);
        toast('Item excluído.');
        wrap.remove();
        loadPage();
      } catch (error) {
        toast(error.message, 'err');
      }
    };
  }

  async function settingsPage() {
    const content = $('#adminContent');
    const settings = await db.get('settings', 'site') || {};
    content.innerHTML = `<div class="admin-title-row"><div><h1>Configurações</h1><p>Identidade, SEO e comportamento geral do site.</p></div></div><div class="a-card"><form id="settingsForm"><div class="form-grid"><div class="field"><label>Nome do site</label><input class="a-input" name="siteName" value="${esc(settings.siteName || 'BE')}"></div><div class="field"><label>Cor principal</label><input class="a-input" name="primaryColor" value="${esc(settings.primaryColor || '#2D7FF9')}"></div><div class="field full"><label>Descrição do site</label><textarea class="a-textarea" name="description">${esc(settings.description || '')}</textarea></div><div class="field full"><label>Texto do rodapé</label><textarea class="a-textarea" name="footerText">${esc(settings.footerText || '')}</textarea></div><div class="field"><label>Instagram</label><input class="a-input" name="instagram" value="${esc(settings.instagram || '')}"></div><div class="field"><label>YouTube</label><input class="a-input" name="youtube" value="${esc(settings.youtube || '')}"></div>${imageField('Imagem de compartilhamento', 'shareImage', settings.shareImage || '')}</div><div class="modal-actions"><button class="a-btn primary">Salvar configurações</button></div></form></div>`;
    setupImagePreviews(content);
    $('#settingsForm').onsubmit = async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      data.updatedAt = now();
      data.updatedBy = user.email;
      await db.set('settings', 'site', data, { merge: true });
      await logAction('settings_updated', 'settings', 'site', 'Configurações do site alteradas');
      toast('Configurações salvas.');
    };
  }

  async function logAction(action, type, itemId, summary) {
    try {
      await db.add('admin_logs', { action, type, itemId, summary, adminUid: user?.uid || '', createdAt: now() });
    } catch (error) {
      console.warn('Log não salvo', error);
    }
  }

  window.addEventListener('be:profile-avatar-changed', event => {
    if (!user || event?.detail?.userId !== user.uid) return;
    user = { ...user, photoURL: event.detail.avatarUrl || '', profile: event.detail.profile || user.profile };
    if (adminRoute()) render();
  });

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', async () => {
    if (adminRoute()) document.body.innerHTML = '<div class="admin-loader">Inicializando painel…</div>';
    try {
      await bootBackend();
    } catch (error) {
      authReady = true;
      if (adminRoute()) {
        document.body.classList.add('admin-mode');
        document.documentElement.classList.add('admin-mode');
        document.body.innerHTML = `<div class="admin-login"><div class="login-card"><h1>Backend não inicializado</h1><p>${esc(error.message)}</p><button class="a-btn primary" onclick="location.reload()">Tentar novamente</button></div></div>`;
      }
      console.error('Falha ao iniciar o backend:', error);
    }
  });
})();

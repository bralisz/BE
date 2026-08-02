(() => {
  'use strict';

  const COLLECTIONS = ['featured','sections','contents','videos','movies','series','shows','news','gallery','users'];
  const LABELS = {dashboard:'Visão geral',featured:'Destaques',sections:'Seções do site',contents:'Conteúdos',videos:'Vídeos',movies:'Filmes',series:'Séries',shows:'Shows',news:'Notícias',gallery:'Galeria',users:'Usuários',settings:'Configurações'};
  const ADMIN_EMAIL = 'bralisofc@gmail.com';
  const CONTENT_CATEGORIES = [
    ['videos','Vídeos','▣'],
    ['movies','Filmes','▤'],
    ['series','Séries','▥'],
    ['shows','Shows','◉'],
    ['news','Notícias','▦']
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

    content.innerHTML = `<section class="dashboard-hero"><div class="dashboard-copy"><h1>Painel de conteúdo</h1><p>Gerencie todas as áreas do site com facilidade.<br>Crie, edite, organize e publique conteúdos.</p><div class="dashboard-stats"><article><i>▤</i><div><strong>${counts.news || 0}</strong><span>Notícias publicadas</span></div></article><article><i>▣</i><div><strong>${counts.videos || 0}</strong><span>Vídeos cadastrados</span></div></article><article><i>◉</i><div><strong>${(counts.featured || 0) + (counts.sections || 0)}</strong><span>Destaques e seções</span></div></article></div></div></section><section class="dashboard-workspace"><div class="dashboard-side-column"><aside class="dashboard-side"><h2>Conteúdo</h2><button class="a-btn primary side-new" id="dashboardNewContent">＋ Novo conteúdo</button>${CONTENT_CATEGORIES.map((item, index) => `<button class="side-link ${index === 0 ? 'active' : ''}" data-route="contents/${item[0]}">${item[1]}<span>${counts[item[0]] || 0}</span></button>`).join('')}</aside><aside class="activity-log"><h2>Log de atividade</h2><div class="activity-list">${logHtml}</div></aside></div><div class="dashboard-panel"><div class="panel-head"><div><h2>Visão geral do conteúdo</h2><p>Veja os principais dados de acesso e engajamento dos vídeos.</p></div><button class="a-btn" data-route="contents">Ver conteúdos</button></div><div class="content-summary analytics-grid">${analyticsCard('Vídeo mais clicado', clicked, '↗')}${analyticsCard('Vídeo mais salvo', saved, '♡')}${analyticsCard('Vídeo mais visto', viewed, '◉')}<article class="analytics-card simple"><div class="analytics-label"><i>♙</i><span>Quantidade de usuários</span></div><strong class="analytics-number">${counts.users || 0}</strong><small>usuários cadastrados</small></article><article class="analytics-card simple"><div class="analytics-label"><i>▣</i><span>Total de vídeos vinculados</span></div><strong class="analytics-number">${counts.videos || 0}</strong><small>vídeos disponíveis no site</small></article><article class="analytics-card simple"><div class="analytics-label"><i>⌁</i><span>Total de interações</span></div><strong class="analytics-number">${totalInteractions.toLocaleString('pt-BR')}</strong><small>cliques, salvamentos e visualizações</small></article></div></div></section>`;
    $('#dashboardNewContent').onclick = chooseContentCategory;
    document.querySelectorAll('[data-route]').forEach(button => button.onclick = () => go(button.dataset.route));
  }

  function chooseContentCategory() {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal category-modal"><h2>Adicionar conteúdo</h2><p class="category-help">Escolha em qual categoria o novo conteúdo será cadastrado.</p><div class="category-picker">${CONTENT_CATEGORIES.map(([key,label,icon]) => `<button type="button" data-category="${key}"><i>${icon}</i><span>${label}</span><small>Criar novo item</small></button>`).join('')}</div><div class="modal-actions"><button type="button" class="a-btn" id="cancelCategory">Cancelar</button></div></div>`;
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
    content.innerHTML = `<div class="admin-title-row content-title-row"><div><span class="dashboard-kicker">Conteúdos</span><h1>${esc(label)}</h1><p>Gerencie os conteúdos separados por categoria.</p></div><button class="a-btn primary" id="newContent">+ Adicionar conteúdo</button></div><section class="content-manager"><aside class="content-category-sidebar"><h2>Categorias</h2>${CONTENT_CATEGORIES.map(([key,categoryLabel,icon]) => `<button class="content-category-link ${key === active ? 'active' : ''}" data-content-category="${key}"><i>${icon}</i><span>${categoryLabel}</span><b>${counts[key] || 0}</b></button>`).join('')}</aside><div class="content-category-panel"><div class="toolbar"><input class="a-input" id="search" placeholder="Buscar por título…"><select class="a-select" id="statusFilter" style="max-width:180px"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Ocultos</option></select></div><div id="list"><div class="empty">Carregando…</div></div></div></section>`;
    $('#newContent').onclick = chooseContentCategory;
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
  }

  async function galleryPage() {
    const content = $('#adminContent');
    content.innerHTML = `<div class="admin-title-row gallery-title-row"><div><span class="dashboard-kicker">Imagens dos perfis</span><h1>Galeria</h1><p>Gerencie avatares e banners de fundo usados pelos usuários em seus perfis.</p></div><div class="gallery-title-actions"><button class="a-btn" id="newGalleryAvatar">+ Adicionar avatar</button><button class="a-btn primary" id="newGalleryBanner">+ Adicionar banner</button></div></div><div class="gallery-admin-toolbar"><input class="a-input" id="gallerySearch" placeholder="Buscar imagem ou categoria…"><select class="a-select" id="galleryType"><option value="">Todos os tipos</option><option value="avatar">Avatares</option><option value="banner">Banners de perfil</option></select><select class="a-select" id="galleryStatus"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Ocultos</option></select></div><div id="galleryAdminBoard"><div class="empty">Carregando galeria…</div></div>`;
    $('#newGalleryAvatar').onclick = () => openEditor('gallery', null, { itemType: 'avatar' });
    $('#newGalleryBanner').onclick = () => openEditor('gallery', null, { itemType: 'banner', category: 'Banners de perfil' });
    const items = await db.list('gallery', { orderBy: 'order', direction: 'asc' });
    const itemType = item => String(item.itemType || item.mediaType || 'avatar').toLowerCase() === 'banner' ? 'banner' : 'avatar';
    const draw = () => {
      const search = $('#gallerySearch').value.trim().toLowerCase();
      const status = $('#galleryStatus').value;
      const typeFilter = $('#galleryType').value;
      const filtered = items.filter(item => {
        const type = itemType(item);
        const text = `${item.title || ''} ${item.category || ''} ${type}`.toLowerCase();
        return (!search || text.includes(search)) && (!status || String(item.active !== false) === status) && (!typeFilter || type === typeFilter);
      });
      const groups = new Map();
      filtered.forEach(item => {
        const type = itemType(item);
        const category = (item.category || (type === 'banner' ? 'Banners de perfil' : 'Sem categoria')).trim() || 'Sem categoria';
        const key = `${type}::${category}`;
        if (!groups.has(key)) groups.set(key, { type, category, items: [] });
        groups.get(key).items.push(item);
      });
      const board = $('#galleryAdminBoard');
      board.innerHTML = groups.size ? `<div class="gallery-category-board">${[...groups.values()].map(group => `<section class="gallery-category-panel ${group.type === 'banner' ? 'banner-panel' : ''}"><header><div><small>${group.type === 'banner' ? 'Banners de perfil' : 'Categoria de avatares'}</small><h2>${esc(group.category)}</h2></div><span>${group.items.length} ${group.items.length === 1 ? 'imagem' : 'imagens'}</span></header><div class="gallery-avatar-grid ${group.type === 'banner' ? 'gallery-banner-grid' : ''}">${group.items.map(item => `<article class="gallery-avatar-card ${group.type === 'banner' ? 'is-banner' : ''} ${item.active === false ? 'is-hidden' : ''}"><div class="gallery-avatar-image">${item.imageUrl ? `<img src="${esc(item.imageUrl)}" alt="${esc(item.title || group.category)}" loading="lazy">` : '<span>Sem imagem</span>'}</div><div class="gallery-avatar-info"><strong>${esc(item.title || (group.type === 'banner' ? 'Banner' : 'Avatar'))}</strong><small>${item.active === false ? 'Oculto' : 'Ativo'} · ordem ${esc(item.order ?? 0)}</small></div><div class="gallery-avatar-actions"><button class="a-btn" data-edit="${item.id}">Editar</button><button class="a-btn danger" data-del="${item.id}">Excluir</button></div></article>`).join('')}</div></section>`).join('')}</div>` : '<div class="empty">Nenhuma imagem encontrada.</div>';
      board.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => openEditor('gallery', items.find(item => item.id === button.dataset.edit)));
      board.querySelectorAll('[data-del]').forEach(button => button.onclick = () => confirmDelete('gallery', button.dataset.del));
    };
    $('#gallerySearch').oninput = draw;
    $('#galleryType').onchange = draw;
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
      $('#list').innerHTML = rows.length ? `<div class="table-wrap"><table class="a-table"><thead><tr><th>Item</th><th>Tipo</th><th>Ordem</th><th>Status</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>${rows.map(item => `<tr><td><strong>${esc(item.title || item.name || item.displayName || item.email || item.id)}</strong><br><small style="color:var(--a-muted)">${esc(item.id)}</small></td><td>${esc(item.type || name)}</td><td>${esc(item.order ?? 0)}</td><td><span class="status ${item.active === false ? 'off' : 'on'}">${item.active === false ? 'Oculto' : 'Ativo'}</span></td><td>${formatDate(item.updatedAt)}</td><td><div class="row-actions">${name === 'users' ? '' : `<button class="a-btn" data-edit="${item.id}">Editar</button><button class="a-btn danger" data-del="${item.id}">Excluir</button>`}</div></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Nenhum item encontrado.</div>';
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
    const videos = context.videos || [];
    const currentSection = sections.find(section => String(section.id) === String(item.sectionId || '')) || sections.find(section => String(section.category || section.slug || '').toLowerCase() === String(item.category || '').toLowerCase());
    const sectionOptions = sections.map(section => `<option value="${esc(section.title || section.category || section.id)}"></option>`).join('');
    const videoOptions = videos.map(video => `<option value="${esc(video.id)}" ${String(item.videoId || '') === String(video.id) ? 'selected' : ''}>${esc(video.title || video.id)}</option>`).join('');
    const sectionFields = name === 'sections' ? `<div class="field"><label>Categoria / identificador *</label><input class="a-input" name="category" required value="${esc(item.category || item.slug || '')}" placeholder="ex.: vanity-fair"><small>Identificador interno usado também para manter compatibilidade com conteúdos antigos.</small></div><div class="field"><label>Quantidade inicial</label><input class="a-input" type="number" min="1" max="50" name="itemLimit" value="${esc(item.itemLimit ?? 12)}"></div>` : '';
    const videoFields = name === 'videos' ? `<div class="field full"><label>Seção do vídeo *</label><input class="a-input" id="videoSectionSearch" name="sectionSearch" list="createdSectionsList" required autocomplete="off" value="${esc(currentSection?.title || currentSection?.category || '')}" placeholder="Digite ou selecione uma seção já criada"><input type="hidden" id="videoSectionId" name="sectionId" value="${esc(currentSection?.id || item.sectionId || '')}"><datalist id="createdSectionsList">${sectionOptions}</datalist><small>Digite o nome para filtrar. O vídeo será vinculado ao ID da seção, mesmo que ela seja renomeada depois.</small></div><div class="field full"><label>URL do vídeo</label><input class="a-input" name="videoUrl" value="${esc(item.videoUrl || item.contentUrl || item.link || '')}" placeholder="https://youtube.com/..."></div>` : '';
    const featuredFields = name === 'featured' ? `<div class="field full"><label>Selecionar vídeo já adicionado *</label><select class="a-select" name="videoId" id="featuredVideoSelect" required><option value="">Escolha um vídeo cadastrado</option>${videoOptions}</select><small>O destaque usará automaticamente o título, descrição, thumbnail e link desse vídeo. Você ainda pode ajustar os campos abaixo.</small></div>` : '';
    if (name === 'gallery') {
      const type = String(item.itemType || item.mediaType || 'avatar').toLowerCase() === 'banner' ? 'banner' : 'avatar';
      return `<div class="form-grid"><div class="field"><label>Tipo de imagem *</label><select class="a-select" name="itemType"><option value="avatar" ${type === 'avatar' ? 'selected' : ''}>Avatar</option><option value="banner" ${type === 'banner' ? 'selected' : ''}>Banner de perfil</option></select></div><div class="field"><label>Nome da imagem *</label><input class="a-input" name="title" required maxlength="80" value="${esc(item.title || '')}" placeholder="Ex.: Billie ao vivo"></div><div class="field full"><label>Categoria *</label><input class="a-input" name="category" required maxlength="60" value="${esc(item.category || (type === 'banner' ? 'Banners de perfil' : ''))}" placeholder="Ex.: Tour Film"></div>${imageField(type === 'banner' ? 'Link da imagem do banner *' : 'Link da imagem do avatar *', 'imageUrl', item.imageUrl || '')}<div class="field"><label>Ordem</label><input class="a-input" type="number" name="order" value="${esc(item.order ?? 0)}"></div><div class="field"><label>Status</label><select class="a-select" name="active"><option value="true" ${item.active !== false ? 'selected' : ''}>Ativo</option><option value="false" ${item.active === false ? 'selected' : ''}>Oculto</option></select></div><div class="field full"><small>Avatares funcionam melhor em formato quadrado. Para banners, prefira imagens horizontais em 16:6 ou 16:9.</small></div></div>`;
    }
    return `<div class="form-grid">${featuredFields}<div class="field full"><label>Título *</label><input class="a-input" name="title" required maxlength="120" value="${esc(item.title || '')}"></div><div class="field"><label>Tipo</label><input class="a-input" name="type" value="${esc(item.type || name)}"></div><div class="field"><label>Ordem</label><input class="a-input" type="number" name="order" value="${esc(item.order ?? 0)}"></div>${sectionFields}${videoFields}<div class="field full"><label>Descrição</label><textarea class="a-textarea" rows="4" maxlength="1000" name="description">${esc(item.description || '')}</textarea></div>${showMedia ? `${imageField('Imagem / thumbnail', 'imageUrl', item.imageUrl || item.thumbnailUrl || '')}${name === 'videos' ? '' : imageField('Banner', 'bannerUrl', item.bannerUrl || '')}${name === 'featured' ? imageField('Logo do conteúdo', 'logoUrl', item.logoUrl || '') : ''}${name === 'videos' ? '' : `<div class="field full"><label>Link do conteúdo</label><input class="a-input" name="contentUrl" value="${esc(item.contentUrl || item.link || '')}" placeholder="https://... ou /pagina"></div>`}` : ''}<div class="field"><label>Status</label><select class="a-select" name="active"><option value="true" ${item.active !== false ? 'selected' : ''}>Ativo</option><option value="false" ${item.active === false ? 'selected' : ''}>Oculto</option></select></div><div class="field"><label>Duração</label><input class="a-input" name="duration" value="${esc(item.duration || item.videoDuration || item.runtime || '')}" placeholder="Ex.: 24 min ou 1h 42min"></div><div class="field"><label>Ano</label><input class="a-input" name="year" value="${esc(item.year || '')}"></div></div>`;
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

  async function openEditor(name, item = null, defaults = {}) {
    const draft = item ? item : { ...defaults };
    if (name === 'featured' && !item) {
      const active = (await db.list('featured')).filter(entry => entry.active !== false);
      if (active.length >= 6) toast('O limite de 6 destaques ativos foi atingido.', 'err');
    }
    const context = { sections: [], videos: [] };
    try {
      if (name === 'videos') context.sections = (await db.list('sections', { orderBy: 'order', direction: 'asc' })).filter(entry => entry.active !== false);
      if (name === 'featured') {
        context.videos = (await db.list('videos', { orderBy: 'order', direction: 'asc' })).filter(entry => entry.active !== false);
        if (!context.videos.length) {
          toast('Cadastre pelo menos um vídeo antes de criar um destaque.', 'err');
          return;
        }
      }
    } catch (error) {
      toast('Não foi possível carregar as opções: ' + error.message, 'err');
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal"><h2>${item ? 'Editar' : 'Adicionar'} ${esc(LABELS[name] || name)}</h2><form id="editorForm">${editorFields(name, draft, context)}<div class="modal-actions"><button type="button" class="a-btn" id="cancelModal">Cancelar</button><button class="a-btn primary" type="submit">Salvar</button></div></form></div>`;
    document.body.append(wrap);
    $('#cancelModal').onclick = () => wrap.remove();
    wrap.onclick = event => { if (event.target === wrap) wrap.remove(); };
    setupImagePreviews(wrap);

    if (name === 'videos') {
      const search = $('#videoSectionSearch', wrap);
      const hidden = $('#videoSectionId', wrap);
      const normalize = value => String(value || '').trim().toLowerCase();
      const syncSection = () => {
        const typed = normalize(search.value);
        const match = context.sections.find(section => [section.title, section.category, section.slug, section.id].some(value => normalize(value) === typed));
        hidden.value = match ? match.id : '';
        search.setCustomValidity(match ? '' : 'Selecione uma seção existente na lista.');
      };
      search.addEventListener('input', syncSection);
      search.addEventListener('change', syncSection);
      syncSection();
    }

    if (name === 'featured') {
      const select = $('#featuredVideoSelect', wrap);
      const fillFromVideo = () => {
        const video = context.videos.find(entry => entry.id === select.value);
        if (!video) return;
        const form = $('#editorForm', wrap);
        form.elements.title.value = video.title || '';
        form.elements.description.value = video.description || '';
        form.elements.imageUrl.value = video.imageUrl || video.thumbnailUrl || video.bannerUrl || '';
        form.elements.bannerUrl.value = video.bannerUrl || video.imageUrl || video.thumbnailUrl || '';
        form.elements.contentUrl.value = video.videoUrl || video.contentUrl || video.link || '';
        if (form.elements.duration) form.elements.duration.value = video.duration || video.videoDuration || video.runtime || '';
        form.elements.year.value = video.year || '';
        form.querySelectorAll('.image-url-input').forEach(input => input.dispatchEvent(new Event('input')));
      };
      select.addEventListener('change', fillFromVideo);
      if (!item && context.videos.length) {
        select.value = context.videos[0].id;
        fillFromVideo();
      }
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
        if (name === 'videos') {
          const selected = context.sections.find(section => String(section.id) === String(data.sectionId || ''));
          if (!selected) throw new Error('Selecione uma seção existente.');
          data.sectionId = selected.id;
          data.category = String(selected.category || selected.slug || selected.id).trim().toLowerCase();
          delete data.sectionSearch;
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
        await logAction(item ? 'content_updated' : 'content_created', name, saved.id, `${LABELS[name] || name}: ${data.title}`);
        toast('Salvo com sucesso.');
        wrap.remove();
        loadPage();
      } catch (error) {
        toast(error.message, 'err');
        button.disabled = false;
        button.textContent = 'Salvar';
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

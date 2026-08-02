(() => {
  'use strict';
  if (location.hash.startsWith('#/admin')) return;

  window.addEventListener('load', async () => {
    setupHomeNavigation();
    try {
      if (!window.beBackend) return;
      await window.beBackend.ready;
      await applySiteSettings();
      await renderFeatured();
      await renderVideoCatalog();
      setupHomeNavigation();
    } catch (error) {
      console.warn('Conteúdo dinâmico indisponível:', error.message);
    }
  });

  async function applySiteSettings() {
    const data = await beBackend.data.get('settings', 'site');
    if (!data) return;
    if (data.siteName) document.title = data.siteName;
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
  }

  async function renderFeatured() {
    const host = document.getElementById('featured');
    if (!host) return;
    const section = host.closest('.featured-wrap');
    if (section) section.hidden = true;

    let featured = (await beBackend.data.list('featured', { orderBy: 'order', direction: 'asc' }))
      .filter(item => item.active !== false && item.videoId)
      .slice(0, 6);

    featured = await Promise.all(featured.map(async item => {
      try {
        const video = await beBackend.data.get('videos', item.videoId);
        if (!video || video.active === false) return null;
        return {
          ...item,
          title: item.title || video.title,
          description: item.description || video.description,
          imageUrl: item.imageUrl || video.imageUrl || video.thumbnailUrl,
          bannerUrl: item.bannerUrl || video.bannerUrl || video.imageUrl || video.thumbnailUrl,
          contentUrl: item.contentUrl || video.videoUrl || video.contentUrl || video.link,
          duration: item.duration || video.duration || video.videoDuration || video.runtime,
          year: item.year || video.year
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
          <div class="f-logo">${item.logoUrl ? `<img src="${safeUrl(item.logoUrl)}" alt="${escapeHtml(title)}">` : escapeHtml(title)}</div>
          <div class="f-meta">${meta}</div>
          <p class="f-desc">${escapeHtml(item.description || '')}</p>
          <div class="f-actions">
            <a class="f-play" href="${safeUrl(url)}" ${/^https?:\/\//i.test(url) ? 'target="_blank" rel="noopener"' : ''}>
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7-11-7Z"/></svg>Assistir
            </a>
            <button class="f-fav" type="button" data-favorite-id="${escapeHtml(item.videoId || item.id || title)}" aria-label="Adicionar ${escapeHtml(title)} aos favoritos" aria-pressed="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-9.7-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.7 6c-2.2 4.4-9.7 9-9.7 9Z"/></svg>
            </button>
          </div>
        </div>
        <div class="f-media">${image ? `<img src="${safeUrl(image)}" alt="${escapeHtml(title)}" loading="eager">` : '<div class="ph ph-wide" style="height:100%"></div>'}</div>
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
    setupFavoriteButtons(host);
    if (section) section.hidden = false;
  }

  async function renderVideoCatalog() {
    const main = document.querySelector('main');
    if (!main) return;

    const sections = (await beBackend.data.list('sections', { orderBy: 'order', direction: 'asc' }))
      .filter(section => section.active !== false);
    const [videoRows, movieRows, featuredRows] = await Promise.all([
      beBackend.data.list('videos', { orderBy: 'order', direction: 'asc' }).catch(() => []),
      beBackend.data.list('movies', { orderBy: 'order', direction: 'asc' }).catch(() => []),
      beBackend.data.list('featured', { orderBy: 'order', direction: 'asc' }).catch(() => [])
    ]);
    const allVideos = videoRows.filter(video => video.active !== false);
    const allMovies = movieRows.filter(movie => movie.active !== false);
    const videosById = new Map(allVideos.map(video => [String(video.id), video]));
    const featuredSeen = new Set();
    const featuredVideos = featuredRows
      .filter(item => item.active !== false && item.videoId)
      .map(item => {
        const video = videosById.get(String(item.videoId));
        if (!video || featuredSeen.has(String(item.videoId))) return null;
        featuredSeen.add(String(item.videoId));
        return {
          ...video,
          title: item.title || video.title,
          description: item.description || video.description,
          thumbnailUrl: item.imageUrl || video.thumbnailUrl || video.imageUrl || video.bannerUrl,
          imageUrl: item.imageUrl || video.imageUrl || video.thumbnailUrl || video.bannerUrl,
          bannerUrl: item.bannerUrl || video.bannerUrl || video.imageUrl || video.thumbnailUrl,
          videoUrl: item.contentUrl || video.videoUrl || video.contentUrl || video.link,
          duration: item.duration || video.duration || video.videoDuration || video.runtime,
          year: item.year || video.year,
          category: 'destaque',
          collection: 'videos'
        };
      })
      .filter(Boolean);
    if (!sections.length && !allMovies.length && !featuredVideos.length) return;

    const old = document.getElementById('dynamicSections');
    if (old) old.remove();

    const host = document.createElement('section');
    host.id = 'dynamicSections';
    host.className = 'video-catalog';
    host.setAttribute('aria-label', 'Categorias de vídeos');

    if (featuredVideos.length) {
      const featuredBlock = document.createElement('section');
      featuredBlock.className = 'video-rail-section featured-video-rail';
      featuredBlock.dataset.category = 'destaque';
      featuredBlock.dataset.collection = 'videos';
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
            ${featuredVideos.map(video => videoCard(video)).join('')}
          </div>
          <button class="video-rail-arrow next" type="button" aria-label="Ver mais destaques">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>`;
      host.append(featuredBlock);
      setupRail(featuredBlock);
    }

    if (allMovies.length) {
      const movieBlock = document.createElement('section');
      movieBlock.className = 'video-rail-section';
      movieBlock.dataset.category = 'filmes';
      movieBlock.dataset.collection = 'movies';
      movieBlock.innerHTML = `
        <a class="video-rail-title" href="#" aria-label="Ver todos: Filmes">
          <span>Filmes</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <div class="video-rail-shell">
          <button class="video-rail-arrow prev" type="button" aria-label="Ver filmes anteriores" hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div class="video-rail" tabindex="0" aria-label="Filmes">
            ${allMovies.map(movie => videoCard({ ...movie, category: movie.category || 'filmes', collection: 'movies' })).join('')}
          </div>
          <button class="video-rail-arrow next" type="button" aria-label="Ver mais filmes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>`;
      host.append(movieBlock);
      setupRail(movieBlock);
    }

    for (const section of sections) {
      const category = String(section.category || section.slug || section.id).trim().toLowerCase();
      const legacyIds = Array.isArray(section.contentIds) ? section.contentIds : [];
      const limit = Math.max(1, Number(section.itemLimit || 12));

      let videos = allVideos.filter(video => {
        if (video.sectionId && String(video.sectionId) === String(section.id)) return true;
        const videoCategory = String(video.category || '').trim().toLowerCase();
        return videoCategory === category || legacyIds.includes(video.id);
      }).slice(0, limit);

      if (!videos.length && legacyIds.length) {
        const reads = await Promise.all(legacyIds.slice(0, limit).map(id => beBackend.data.get('contents', id)));
        videos = reads.filter(item => item && item.active !== false);
      }

      const block = document.createElement('section');
      block.className = 'video-rail-section';
      block.dataset.category = normalizeText(category);
      block.dataset.collection = 'videos';
      block.innerHTML = `
        <a class="video-rail-title" href="${safeUrl(section.link || '#')}" aria-label="Ver todos: ${escapeHtml(section.title || 'Seção')}">
          <span>${escapeHtml(section.title || 'Seção')}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <div class="video-rail-shell">
          <button class="video-rail-arrow prev" type="button" aria-label="Ver vídeos anteriores" hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div class="video-rail" tabindex="0" aria-label="${escapeHtml(section.title || 'Vídeos')}">
            ${videos.length ? videos.map(video => videoCard({ ...video, collection: video.collection || 'videos' })).join('') : '<p class="video-rail-empty">Nenhum vídeo publicado nesta seção.</p>'}
          </div>
          <button class="video-rail-arrow next" type="button" aria-label="Ver mais vídeos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>`;
      host.append(block);
      setupRail(block);
    }

    main.insertAdjacentElement('afterend', host);
    window.dispatchEvent(new Event('be:catalog-ready'));
  }

  function videoCard(video) {
    const image = video.thumbnailUrl || video.imageUrl || video.bannerUrl || '';
    const href = video.videoUrl || video.contentUrl || video.link || '#';
    const title = video.title || 'Abrir vídeo';
    const category = video.category || video.type || video.contentType || '';
    const collection = video.collection || 'videos';
    return `<a class="video-card" href="${safeUrl(href)}" ${/^https?:\/\//i.test(href) ? 'target="_blank" rel="noopener"' : ''} aria-label="${escapeHtml(title)}" data-title="${escapeHtml(normalizeText(title))}" data-category="${escapeHtml(normalizeText(category))}" data-collection="${escapeHtml(normalizeText(collection))}">
      <img src="${safeUrl(image)}" alt="${escapeHtml(video.title || '')}" loading="lazy" decoding="async">
    </a>`;
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

  function setupHomeNavigation() {
    const topbar = document.getElementById('topbar');
    const toggle = document.getElementById('homeSearchToggle');
    const input = document.getElementById('homeSearchInput');
    const logo = document.getElementById('logoBtn');
    const viewButtons = Array.from(document.querySelectorAll('[data-home-view]'));
    if (!topbar || !toggle || !input || topbar.dataset.homeReady === 'true') return;
    topbar.dataset.homeReady = 'true';

    let currentView = 'home';

    const setSearchOpen = open => {
      topbar.classList.toggle('search-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar pesquisa' : 'Abrir pesquisa');
      if (open) {
        requestAnimationFrame(() => input.focus({ preventScroll: true }));
      } else {
        input.value = '';
        applyCatalogFilter();
        toggle.focus({ preventScroll: true });
      }
    };

    const isFilm = category => {
      const value = normalizeText(category);
      return value === 'filme' || value === 'filmes' || value === 'movie' || value === 'movies' || value.includes('filme');
    };

    const applyCatalogFilter = () => {
      const host = document.getElementById('dynamicSections');
      if (!host) return;
      const query = normalizeText(input.value);
      const sections = Array.from(host.querySelectorAll('.video-rail-section'));
      let visibleTotal = 0;

      sections.forEach(section => {
        const sectionCategory = section.dataset.category || '';
        const cards = Array.from(section.querySelectorAll('.video-card'));
        let visibleInSection = 0;

        cards.forEach(card => {
          const category = card.dataset.category || sectionCategory;
          const collection = card.dataset.collection || section.dataset.collection || 'videos';
          const title = card.dataset.title || normalizeText(card.getAttribute('aria-label'));
          const viewMatches = currentView === 'films'
            ? (collection === 'movies' || isFilm(category) || isFilm(sectionCategory))
            : currentView === 'videos'
              ? collection !== 'movies'
              : true;
          const searchMatches = !query || title.includes(query) || category.includes(query) || sectionCategory.includes(query);
          const show = viewMatches && searchMatches;
          card.hidden = !show;
          if (show) visibleInSection += 1;
        });

        const emptyNative = section.querySelector('.video-rail-empty');
        const showSection = visibleInSection > 0 || (cards.length === 0 && currentView !== 'films' && !query);
        section.hidden = !showSection;
        if (emptyNative) emptyNative.hidden = !showSection;
        visibleTotal += visibleInSection;
      });

      let empty = host.querySelector('.home-filter-empty');
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'home-filter-empty';
        empty.setAttribute('role', 'status');
        host.prepend(empty);
      }
      empty.textContent = query
        ? `Nenhum conteúdo encontrado para “${input.value.trim()}”.`
        : 'Nenhum filme publicado nessa categoria.';
      empty.classList.toggle('show', visibleTotal === 0 && sections.length > 0 && (currentView === 'films' || Boolean(query)));
    };

    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        currentView = button.dataset.homeView || 'videos';
        viewButtons.forEach(item => item.classList.toggle('active', item === button));
        applyCatalogFilter();
        const catalog = document.getElementById('dynamicSections');
        if (catalog) catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    logo?.addEventListener('click', () => {
      currentView = 'home';
      viewButtons.forEach(item => item.classList.remove('active'));
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
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && topbar.classList.contains('search-open')) setSearchOpen(false);
    });
    window.addEventListener('be:catalog-ready', applyCatalogFilter);

    applyCatalogFilter();
  }

  function safeUrl(value) {
    const text = String(value || '').trim();
    if (!text) return '#';
    if (/^(https?:\/\/|\/|#)/i.test(text)) return escapeHtml(text);
    return '#';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }
})();

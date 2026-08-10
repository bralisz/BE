(() => {
  'use strict';
  if (location.hash.startsWith('#/admin')) return;

  const randomFeaturedPools = { videos: [], films: [], movies: [], series: [] };
  const lastRandomFeaturedId = { videos: '', films: '', movies: '', series: '' };


  function localizedUiText(source, variables = {}) {
    if (window.BETVI18n && typeof window.BETVI18n.t === 'function') return window.BETVI18n.t(source, variables);
    return String(source || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : _);
  }

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
          <div class="f-logo">${item.logoUrl ? `<img loading="eager" decoding="async" fetchpriority="high" src="${safeUrl(item.logoUrl)}" alt="${escapeHtml(title)}">` : (['movies', 'series'].includes(item.collection) ? `<span class="sr-only">${escapeHtml(title)}</span>` : escapeHtml(title))}</div>
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
              data-image-url="${safeUrl(item.imageUrl || '')}"
              data-banner-url="${safeUrl(item.bannerUrl || item.imageUrl || '')}"
              data-logo-url="${safeUrl(item.logoUrl || '')}"
              data-collection="${escapeHtml(item.collection || 'videos')}">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7-11-7Z"/></svg>Assistir
            </button>
            <button class="f-fav" type="button" data-favorite-id="${escapeHtml(String(`${item.collection || 'videos'}:${item.sourceId || item.contentId || item.videoId || item.id || title}`))}" aria-label="Adicionar ${escapeHtml(title)} aos favoritos" aria-pressed="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-9.7-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.7 6c-2.2 4.4-9.7 9-9.7 9Z"/></svg>
            </button>
          </div>
        </div>
        <div class="f-media">${image ? `<img decoding="async" src="${safeUrl(image)}" alt="${escapeHtml(title)}" loading="eager" decoding="async" fetchpriority="high">` : '<div class="ph ph-wide" style="height:100%"></div>'}</div>
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
        <div class="f-logo">${item.logoUrl ? `<img loading="eager" decoding="async" fetchpriority="high" src="${safeUrl(item.logoUrl)}" alt="${escapeHtml(title)}">` : escapeHtml(title)}</div>
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
            data-image-url="${safeUrl(thumbnail)}"
            data-banner-url="${safeUrl(background)}"
            data-logo-url="${safeUrl(item.logoUrl || '')}"
            data-collection="${escapeHtml(collection)}">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7-11-7Z"/></svg>Assistir
          </button>
          <button class="f-fav" type="button" data-favorite-id="${escapeHtml(`${collection}:${item.id || publicId}`)}" aria-label="Adicionar ${escapeHtml(title)} aos favoritos" aria-pressed="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-9.7-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.7 6c-2.2 4.4-9.7 9-9.7 9Z"/></svg>
          </button>
        </div>
      </div>
      <div class="f-media">${background ? `<img decoding="async" src="${safeUrl(background)}" data-fallback-src="${safeUrl(thumbnail)}" alt="${escapeHtml(title)}" loading="eager" decoding="async" fetchpriority="high">` : '<div class="ph ph-wide" style="height:100%"></div>'}</div>
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

      let sectionContents = [
        ...allVideos.filter(item => belongsToSection(item, section, legacyIds, 'videos')).map(item => ({ ...item, collection: 'videos' })),
        ...allMovies.filter(item => belongsToSection(item, section, legacyIds, 'movies')).map(item => ({ ...item, collection: 'movies' })),
        ...allSeries.filter(item => belongsToSection(item, section, legacyIds, 'series')).map(item => ({ ...item, collection: 'series' }))
      ].sort((a, b) => {
        const orderDifference = Number(a.order || 0) - Number(b.order || 0);
        if (orderDifference) return orderDifference;
        return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR');
      }).slice(0, limit);

      if (!sectionContents.length && legacyIds.length) {
        const reads = await Promise.all(legacyIds.slice(0, limit).map(id => beBackend.data.get('contents', id)));
        sectionContents = reads.filter(item => item && item.active !== false).map(item => ({ ...item, collection: item.collection || 'videos' }));
      }

      const block = document.createElement('section');
      block.className = 'video-rail-section';
      block.dataset.category = normalizeText(category);
      block.dataset.collection = 'mixed';
      block.dataset.homeView = 'default';
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
        </div>`;
      host.append(block);
      setupRail(block);
    }

    main.insertAdjacentElement('afterend', host);
    setupContentDetailInteractions(host);
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
    const showCardLogo = logo && logo !== '#' && String(collection).toLowerCase() !== 'videos';
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
      data-image-url="${safeUrl(image)}"
      data-banner-url="${safeUrl(banner)}"
      data-logo-url="${safeUrl(logo)}"
      data-title-search="${escapeHtml(normalizeText(title))}"
      data-category="${escapeHtml(normalizeText(category))}"
      data-collection="${escapeHtml(normalizeText(collection))}">
      <img class="video-card-thumbnail" src="${safeUrl(image)}" alt="${escapeHtml(video.title || '')}" loading="lazy" decoding="async">
      ${showCardLogo ? `<span class="video-card-logo-slot" aria-hidden="true"><img class="video-card-logo" src="${safeUrl(logo)}" alt="" loading="lazy" decoding="async" onerror="this.closest('.video-card-logo-slot')?.remove()"></span>` : ''}
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
    if (replace) history.replaceState({ beRoute: 'video', itemId: String(itemId) }, '', url);
    else history.pushState({ beRoute: 'video', itemId: String(itemId) }, '', url);
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
      data-image-url="${safeUrl(image)}"
      data-banner-url="${safeUrl(['movies', 'series'].includes(String(data.collection || '').toLowerCase()) ? image : (data.bannerUrl || image))}"
      data-logo-url="${safeUrl(data.logoUrl || '')}"
      data-category="${escapeHtml(data.category || '')}"
      data-collection="${escapeHtml(data.collection || '')}"
      data-source-section-key="${escapeHtml(data.sourceSectionKey || '')}"
      data-source-section-title="${escapeHtml(data.sourceSectionTitle || '')}"
      aria-label="Abrir ${escapeHtml(title)}">
      <span class="detail-reco-thumb">${image && image !== '#' ? `<img src="${safeUrl(image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async">` : '<span class="ph ph-wide" style="height:100%"></span>'}</span>
      <span class="detail-reco-name">${escapeHtml(title)}</span>
    </a>`;
  }

  function renderDetailRecommendations(current) {
    const panel = document.getElementById('detailRecommendations');
    const moreRail = document.getElementById('detailMoreRail');
    const recommendationRail = document.getElementById('detailRecommendationRail');
    const sameSectionRail = document.getElementById('detailSameSectionRail');
    const catalog = document.getElementById('dynamicSections');
    if (!panel || !moreRail || !recommendationRail || !sameSectionRail || !catalog) return;

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

    // 1ª seção: 7 conteúdos relacionados por categoria, coleção ou seção.
    const moreItems = uniqueById([
      ...shuffleItems(similarCategory),
      ...shuffleItems(sameSection),
      ...shuffleItems(all)
    ]).slice(0, 7);

    // 2ª seção: volta a exibir 10 recomendações aleatórias.
    const randomItems = shuffleItems(all).slice(0, 10);

    // 3ª seção: 5 vídeos da mesma seção; usa conteúdos semelhantes como reserva.
    const sameSectionItems = uniqueById([
      ...shuffleItems(sameSection),
      ...shuffleItems(similarCategory),
      ...shuffleItems(all)
    ]).slice(0, 5);

    moreRail.innerHTML = moreItems.length
      ? moreItems.map(recommendationCard).join('')
      : '<p class="detail-reco-empty">Nenhum vídeo semelhante disponível.</p>';
    recommendationRail.innerHTML = randomItems.length
      ? randomItems.map(recommendationCard).join('')
      : '<p class="detail-reco-empty">Nenhum outro vídeo disponível.</p>';
    sameSectionRail.innerHTML = sameSectionItems.length
      ? sameSectionItems.map(recommendationCard).join('')
      : '<p class="detail-reco-empty">Nenhum vídeo disponível nesta seção.</p>';

    setupContentDetailInteractions(panel);
    panel.hidden = false;
  }

  function detailShareUrl(itemId) {
    const route = detailRoutePath(itemId);
    const localizedRoute = window.BETVLocaleURL ? window.BETVLocaleURL(route) : route;
    try { return new URL(localizedRoute, location.origin).href; }
    catch (_) { return location.origin + route; }
  }

  function copyDetailShareUrl(url) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(url);
    }
    return new Promise((resolve, reject) => {
      try {
        const field = document.createElement('textarea');
        field.value = url;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        field.style.pointerEvents = 'none';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (copied) resolve();
        else reject(new Error('copy_failed'));
      } catch (error) { reject(error); }
    });
  }

  function showDetailShareCopied(button) {
    if (!button) return;
    const originalTitle = button.dataset.defaultTitle || button.getAttribute('title') || 'Compartilhar';
    button.dataset.defaultTitle = originalTitle;
    button.classList.add('is-copied');
    button.setAttribute('title', 'Link copiado!');
    button.setAttribute('aria-label', 'Link do vídeo copiado');
    window.clearTimeout(Number(button.dataset.feedbackTimer || 0));
    const timer = window.setTimeout(() => {
      button.classList.remove('is-copied');
      button.setAttribute('title', originalTitle);
      button.setAttribute('aria-label', 'Compartilhar');
      delete button.dataset.feedbackTimer;
    }, 1800);
    button.dataset.feedbackTimer = String(timer);
  }

  async function shareDetailContent(button) {
    if (!button) return;
    const itemId = String(button.dataset.itemId || detailRouteId() || '').trim();
    if (!itemId) return;
    const title = String(button.dataset.title || 'Billie Eilish TV').trim() || 'Billie Eilish TV';
    const url = detailShareUrl(itemId);
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await copyDetailShareUrl(url);
      showDetailShareCopied(button);
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      try {
        await copyDetailShareUrl(url);
        showDetailShareCopied(button);
      } catch (_) {}
    }
  }

  function setupDetailControls() {
    const section = document.getElementById('contentDetailSection');
    const back = document.getElementById('detailBackButton');
    const share = document.getElementById('contentDetailShare');
    if (back && back.dataset.bound !== 'true') {
      back.dataset.bound = 'true';
      back.addEventListener('click', () => closeContentDetail(true));
    }
    if (share && share.dataset.bound !== 'true') {
      share.dataset.bound = 'true';
      share.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        shareDetailContent(share);
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
    const share = document.getElementById('contentDetailShare');
    if (!section || !bg || !logo || !meta || !desc || !play || !list || !share) return;

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
      ? `<img decoding="async" src="${safeUrl(bannerUrl)}" alt="${escapeHtml(title)}" loading="eager" decoding="async" fetchpriority="high">`
      : '<div class="ph ph-wide" style="height:100%"></div>';

    if (logoUrl && logoUrl !== '#') {
      logo.innerHTML = collection === 'videos'
        ? `<span class="detail-logo-media--video"><img loading="eager" decoding="async" fetchpriority="high" src="${safeUrl(logoUrl)}" alt="${escapeHtml(title)}"></span>`
        : `<img loading="eager" decoding="async" fetchpriority="high" src="${safeUrl(logoUrl)}" alt="${escapeHtml(title)}">`;
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

    share.dataset.itemId = itemId;
    share.dataset.title = title;
    share.dataset.defaultTitle = 'Compartilhar';
    share.classList.remove('is-copied');
    share.setAttribute('title', 'Compartilhar');
    share.setAttribute('aria-label', 'Compartilhar');

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
      if (scrollHome && randomFeaturedSection && !randomFeaturedSection.hidden) {
        randomFeaturedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    document.body.dataset.homeView = currentView;

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
        const sectionMatchesView = libraryView
          ? sectionView === 'films'
          : currentView === 'videos'
            ? sectionView !== 'films'
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
      button.addEventListener('click', () => {
        currentView = button.dataset.homeView || 'videos';
        document.body.dataset.homeView = currentView;
        setActiveTab(button);
        window.dispatchEvent(new Event('be:detail-close'));
        applyCatalogFilter(true);
        const destination = document.getElementById('randomFeaturedSection') || document.getElementById('dynamicSections');
        if (destination && !destination.hidden) destination.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    supportButton?.addEventListener('click', () => {
      setActiveTab(supportButton);
    });

    logo?.addEventListener('click', () => {
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

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }
})();

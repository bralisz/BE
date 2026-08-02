(() => {
  'use strict';
  if (location.hash.startsWith('#/admin')) return;

  window.addEventListener('load', async () => {
    try {
      if (!window.beBackend) return;
      await window.beBackend.ready;
      await applySiteSettings();
      await renderFeatured();
      await renderVideoCatalog();
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
      return `<div class="f-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="f-info">
          <div class="f-logo">${item.logoUrl ? `<img src="${safeUrl(item.logoUrl)}" alt="${escapeHtml(title)}">` : escapeHtml(title)}</div>
          <div class="f-meta">${item.year ? `<span class="f-year">${escapeHtml(item.year)}</span>` : ''}</div>
          <p class="f-desc">${escapeHtml(item.description || '')}</p>
          <div class="f-actions">
            <a class="f-play" href="${safeUrl(url)}" ${/^https?:\/\//i.test(url) ? 'target="_blank" rel="noopener"' : ''}>
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7-11-7Z"/></svg>Assistir
            </a>
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
    if (section) section.hidden = false;
  }

  async function renderVideoCatalog() {
    const main = document.querySelector('main');
    if (!main) return;

    const sections = (await beBackend.data.list('sections', { orderBy: 'order', direction: 'asc' }))
      .filter(section => section.active !== false);
    if (!sections.length) return;

    const allVideos = (await beBackend.data.list('videos', { orderBy: 'order', direction: 'asc' }))
      .filter(video => video.active !== false);

    const old = document.getElementById('dynamicSections');
    if (old) old.remove();

    const host = document.createElement('section');
    host.id = 'dynamicSections';
    host.className = 'video-catalog';
    host.setAttribute('aria-label', 'Categorias de vídeos');

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
            ${videos.length ? videos.map(videoCard).join('') : '<p class="video-rail-empty">Nenhum vídeo publicado nesta seção.</p>'}
          </div>
          <button class="video-rail-arrow next" type="button" aria-label="Ver mais vídeos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>`;
      host.append(block);
      setupRail(block);
    }

    main.insertAdjacentElement('afterend', host);
  }

  function videoCard(video) {
    const image = video.thumbnailUrl || video.imageUrl || video.bannerUrl || '';
    const href = video.videoUrl || video.contentUrl || video.link || '#';
    return `<a class="video-card" href="${safeUrl(href)}" ${/^https?:\/\//i.test(href) ? 'target="_blank" rel="noopener"' : ''} aria-label="${escapeHtml(video.title || 'Abrir vídeo')}">
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

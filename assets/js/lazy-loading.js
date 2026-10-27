(() => {
  'use strict';
  if (window.__BETVLazyMediaStarted) return;
  window.__BETVLazyMediaStarted = true;

  const PRIORITY_SELECTOR = [
    '.f-slide.active .f-media img',
    '.f-slide.active .f-logo img',
    '.detail-bg img',
    '.community-hero-banner-frame > img',
    '.login-brand img',
    '.logo-mark',
    '.mobile-app-bar img',
    '.user-chip img',
    '.admin-logo-button img',
    '.admin-login-logo img'
  ].join(',');

  const imageReady = image => image.complete && image.naturalWidth > 0;

  function updateVisualState(image) {
    if (!image || image.nodeType !== 1 || image.tagName !== 'IMG') return;
    const hasSource = Boolean(image.currentSrc || image.getAttribute('src') || image.hasAttribute('data-src'));
    if (!hasSource) return;
    const loaded = imageReady(image);
    image.classList.toggle('betv-image-pending', !loaded);
    image.classList.toggle('betv-image-loaded', loaded);
    if (loaded) image.classList.remove('betv-image-error');
  }

  function applyImagePolicy(image) {
    if (!image || image.tagName !== 'IMG') return;
    const priority = image.matches(PRIORITY_SELECTOR) || image.getAttribute('fetchpriority') === 'high';
    image.decoding = 'async';
    if (priority) {
      image.loading = 'eager';
      image.setAttribute('fetchpriority', 'high');
    } else {
      if (!image.hasAttribute('loading')) image.loading = 'lazy';
      if (image.loading === 'lazy' && !image.hasAttribute('fetchpriority')) {
        image.setAttribute('fetchpriority', 'low');
      }
    }
    updateVisualState(image);
  }

  // Capture load/error from dynamically created images without attaching
  // individual listeners to every poster in a large catalog.
  document.addEventListener('load', event => {
    const image = event.target;
    if (image && image.tagName === 'IMG') updateVisualState(image);
  }, true);
  document.addEventListener('error', event => {
    const image = event.target;
    if (image && image.tagName === 'IMG') {
      image.classList.remove('betv-image-pending');
      image.classList.add('betv-image-error');
    }
  }, true);

  function revealDeferredSource(element) {
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
      const src = window.beMediaUrl ? window.beMediaUrl(background) : background;
      element.style.backgroundImage = 'url("' + src.replace(/"/g, '\\"') + '")';
      element.removeAttribute('data-bg-src');
    }
    if (element.tagName === 'IMG') updateVisualState(element);
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          revealDeferredSource(entry.target);
          observer.unobserve(entry.target);
        }
      }, { rootMargin: document.documentElement.classList.contains('performance-lite') ? '180px 0px' : '360px 0px' })
    : null;

  function processNode(node) {
    if (!(node instanceof Element)) return;
    const selector = 'img,[data-src],[data-srcset],[data-bg-src]';
    function process(element) {
      if (element.tagName === 'IMG') applyImagePolicy(element);
      if (element.matches('[data-src],[data-srcset],[data-bg-src]')) {
        if (observer) observer.observe(element);
        else revealDeferredSource(element);
      }
    }
    if (node.matches(selector)) process(node);
    node.querySelectorAll(selector).forEach(process);
  }

  function start() {
    processNode(document.documentElement);
    const pending = new Set();
    let scheduled = false;
    function flush() {
      scheduled = false;
      const roots = Array.from(pending);
      const rootSet = new Set(roots);
      pending.clear();
      for (const node of roots) {
        if (!node.isConnected) continue;
        let hasParent = false;
        for (let parent = node.parentElement; parent; parent = parent.parentElement) {
          if (rootSet.has(parent)) { hasParent = true; break; }
        }
        if (!hasParent) processNode(node);
      }
    }
    const mutations = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'attributes') {
          if (record.target.tagName === 'IMG') pending.add(record.target);
        } else {
          for (const node of record.addedNodes) if (node instanceof Element) pending.add(node);
        }
      }
      if (!pending.size || scheduled) return;
      scheduled = true;
      if (document.hidden) window.setTimeout(flush, 0);
      else window.requestAnimationFrame(flush);
    });
    mutations.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['src', 'srcset']
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

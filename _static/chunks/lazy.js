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

    if (!image.hasAttribute('loading')) image.loading = 'lazy';
    if (!image.getAttribute('fetchpriority')) {
      try { image.fetchPriority = 'low'; } catch (_) {}
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
      }, { rootMargin: document.documentElement.classList.contains('performance-lite') ? '180px 0px' : '500px 0px' })
    : null;

  const processNode = node => {
    if (!(node instanceof Element)) return;

    const deferred = [];
    const selector = 'img,[data-src],[data-srcset],[data-bg-src]';
    const processElement = element => {
      if (element.matches('img')) applyImagePolicy(element);
      if (element.matches('[data-src],[data-srcset],[data-bg-src]')) deferred.push(element);
    };
    if (node.matches(selector)) processElement(node);
    node.querySelectorAll(selector).forEach(processElement);

    deferred.forEach(item => {
      if (deferredObserver) deferredObserver.observe(item);
      else revealDeferredSource(item);
    });
  };

  const start = () => {
    processNode(document.documentElement);

    const pending = new Set();
    let scheduled = false;
    const flush = () => {
      scheduled = false;
      const roots = Array.from(pending);
      roots.forEach(node => {
        if (!node.isConnected) return;
        for (let parent = node.parentElement; parent; parent = parent.parentElement) {
          if (pending.has(parent)) return;
        }
        processNode(node);
      });
      pending.clear();
    };
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node instanceof Element) pending.add(node);
      }));
      if (!pending.size || scheduled) return;
      scheduled = true;
      // One scan per added subtree, coalesced across a catalog render.
      if (document.hidden) window.setTimeout(flush, 0);
      else window.requestAnimationFrame(flush);
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

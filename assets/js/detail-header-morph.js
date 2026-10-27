/* BETV desktop: morph the existing center navigation into the detail Home icon. */
(function () {
  'use strict';

  function init() {
    const nav = document.getElementById('topbar');
    const detailHome = document.getElementById('detailHomeLink');
    if (!nav || !detailHome || !document.body) return;

    const desktop = window.matchMedia('(min-width: 761px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let wasDetail = document.body.classList.contains('detail-page-active');
    let navRect = null;
    let ghost = null;
    let motion = null;

    function captureNavPosition() {
      if (document.body.classList.contains('detail-page-active') || !desktop.matches) return;
      const rect = nav.getBoundingClientRect();
      if (rect.width >= 120 && rect.height > 0) {
        navRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      }
    }

    function clearMorph() {
      if (motion) {
        const previous = motion;
        motion = null;
        previous.onfinish = null;
        previous.cancel();
      }
      if (ghost) {
        ghost.remove();
        ghost = null;
      }
      detailHome.style.removeProperty('visibility');
    }

    function morphIntoHome() {
      clearMorph();
      if (!desktop.matches || reducedMotion.matches || !navRect || document.hidden) return;
      const destination = detailHome.getBoundingClientRect();
      if (!destination.width || !destination.height) return;

      const snapshot = nav.cloneNode(true);
      snapshot.removeAttribute('id');
      snapshot.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      snapshot.querySelectorAll('button, input, a').forEach(el => { el.tabIndex = -1; });
      snapshot.classList.add('detail-nav-morph');
      snapshot.setAttribute('aria-hidden', 'true');
      snapshot.style.position = 'fixed';
      snapshot.style.left = navRect.left + 'px';
      snapshot.style.top = navRect.top + 'px';
      snapshot.style.width = navRect.width + 'px';
      snapshot.style.height = navRect.height + 'px';
      snapshot.style.maxWidth = 'none';
      snapshot.style.margin = '0';
      snapshot.style.zIndex = '10040';
      snapshot.style.pointerEvents = 'none';
      snapshot.style.transformOrigin = 'top left';
      document.body.appendChild(snapshot);
      ghost = snapshot;
      detailHome.style.visibility = 'hidden';

      const x = destination.left - navRect.left;
      const y = destination.top - navRect.top;
      const scaleX = destination.width / navRect.width;
      const scaleY = destination.height / navRect.height;
      motion = snapshot.animate([
        { transform: 'translate3d(0,0,0) scale(1,1)', opacity: 1 },
        { transform: 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + scaleX + ',' + scaleY + ')', opacity: 0.85 }
      ], { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
      const links = snapshot.querySelector('.home-nav-links');
      if (links) links.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 290, fill: 'forwards' });
      motion.onfinish = clearMorph;
    }

    const observer = new MutationObserver(() => {
      const isDetail = document.body.classList.contains('detail-page-active');
      if (isDetail === wasDetail) return;
      wasDetail = isDetail;
      if (isDetail) morphIntoHome();
      else {
        clearMorph();
        window.requestAnimationFrame(captureNavPosition);
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    document.addEventListener('pointerdown', captureNavPosition, true);
    window.addEventListener('resize', () => {
      clearMorph();
      window.requestAnimationFrame(captureNavPosition);
    }, { passive: true });
    window.addEventListener('pageshow', captureNavPosition);
    captureNavPosition();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

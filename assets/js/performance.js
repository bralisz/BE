/* Shared autoplay lifecycle: no background/offscreen work, including after rerenders. */
(() => {
  'use strict';
  const controllers = new Map();
  const lite = () => document.documentElement.classList.contains('performance-lite');
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const controller = controllers.get(entry.target);
      if (!controller) return;
      controller.visible = entry.isIntersecting;
      controller.sync();
    });
  }) : null;

  window.BETVAutoplay = (host, advance, delay, enabled = true) => {
    controllers.get(host)?.dispose();
    let timer = null;
    let paused = false;
    let disposed = false;
    const controller = {
      visible: !observer,
      stop() { clearInterval(timer); timer = null; },
      sync() {
        controller.stop();
        if (disposed || !enabled) return;
        if (!host.isConnected) { controller.dispose(); return; }
        if (paused || document.hidden || lite() || !controller.visible) return;
        timer = setInterval(() => {
          if (!host.isConnected) { controller.dispose(); return; }
          if (!document.hidden && !lite() && controller.visible) advance();
        }, delay);
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        controller.stop();
        observer?.unobserve(host);
        controllers.delete(host);
      }
    };
    controllers.set(host, controller);
    observer?.observe(host);
    controller.sync();
    return {
      start() { paused = false; controller.sync(); },
      stop() { paused = true; controller.stop(); },
      dispose: controller.dispose
    };
  };
  document.addEventListener('visibilitychange', () => controllers.forEach(controller => controller.sync()));
  window.addEventListener('be:performance-change', () => controllers.forEach(controller => controller.sync()));
})();

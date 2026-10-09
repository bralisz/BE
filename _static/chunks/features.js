/* Load account and community code when a visitor asks for those areas. */
(() => {
  'use strict';
  const revision = '20261009-community-v14';
  const pending = new Map();
  const ready = new Set();
  let actionVersion = 0;
  function withTimeout(task, ms = 10000) {
    let timer;
    const deadline = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('area_timeout')), ms); });
    return Promise.race([Promise.resolve(task), deadline]).finally(() => clearTimeout(timer));
  }
  function ensure(name) {
    if (!['account', 'community'].includes(name)) return Promise.reject(new Error('unknown_area'));
    if (ready.has(name)) return Promise.resolve();
    if (pending.has(name)) return pending.get(name);
    const script = document.createElement('script');
    script.src = `/_static/chunks/${name}.js?rev=${revision}`;
    const task = new Promise((resolve, reject) => {
      script.onload = () => Promise.resolve(name === 'account' ? window.BETVAccountReady : undefined).then(resolve, reject);
      script.onerror = () => reject(new Error('area_download_failed'));
      document.head.appendChild(script);
    });
    const request = withTimeout(task).then(() => { ready.add(name); }).catch(error => { script.remove(); throw error; }).finally(() => pending.delete(name));
    pending.set(name, request);
    return request;
  }
  function dismiss() { document.getElementById('featureLoadStatus')?.remove(); }
  function showStatus(message, retry) {
    dismiss();
    const panel = document.createElement('div');
    panel.id = 'featureLoadStatus';panel.setAttribute('role', 'status');
    panel.style.cssText = 'position:fixed;bottom:24px;left:16px;right:16px;z-index:2147483647;padding:16px;background:#15171d;color:#fff;border:1px solid #666;border-radius:14px;max-width:520px;margin:auto;font:16px system-ui;box-shadow:0 4px 20px #0008';
    const label = document.createElement('p');label.textContent = message;panel.appendChild(label);
    if (retry) { const button = document.createElement('button');button.type = 'button';button.textContent = 'Tentar novamente';button.onclick = retry;panel.appendChild(button); }
    const close = document.createElement('button');close.type = 'button';close.textContent = 'Fechar';close.onclick = () => { actionVersion++;dismiss(); };panel.appendChild(close);
    document.body.appendChild(panel);
  }
  function run(names, action) {
    const version = ++actionVersion;
    const routeAtStart = location.pathname + location.search + location.hash;
    showStatus('Abrindo esta área…');
    Promise.all(names.map(ensure)).then(() => {
      if (version !== actionVersion || routeAtStart !== location.pathname + location.search + location.hash) { dismiss(); return; }
      dismiss();action();
    }).catch(() => { if (version === actionVersion) showStatus('Não foi possível abrir esta área. Verifique sua conexão.', () => run(names, action)); });
  }
  const events = {'be:open-profile-route':['account'],'be:open-config':['account','community'],'be:open-community':['community'],'be:toggle-mobile-account-menu':['community']};
  Object.entries(events).forEach(([type, names]) => window.addEventListener(type, event => {
    if (names.every(name => ready.has(name))) return;
    event.stopImmediatePropagation();
    const detail = event.detail;
    run(names, () => window.dispatchEvent(new CustomEvent(type, {detail})));
  }, true));
  document.addEventListener('click', event => {
    const target = event.target.closest?.('[data-public-action="profile"],[data-public-action="settings"],[data-public-action="avatar"],[data-public-action="auth"],[data-community-tab],#profilePageSettings');
    if (!target) {
      if(event.target.closest?.('#logoBtn,[data-home-view],a[href]')){actionVersion++;dismiss();}
      return;
    }
    const names = target.matches('[data-community-tab]') ? ['community'] : target.matches('[data-public-action="settings"],#profilePageSettings') ? ['account','community'] : ['account'];
    if (names.every(name => ready.has(name))) return;
    event.preventDefault();event.stopImmediatePropagation();
    run(names, () => target.isConnected && target.click());
  }, true);
  window.addEventListener('popstate', () => { actionVersion++; dismiss(); });
  window.addEventListener('hashchange', () => { actionVersion++; dismiss(); });
  // Keep history recording available even before Community has been opened.
  function recordPlay(event) {
    const play = event.target.closest?.('#contentDetailPlay');
    if (play && !ready.has('community')) ensure('community').then(() => window.BETVCommunity?.record(play)).catch(() => {});
  }
  document.addEventListener('pointerup',recordPlay,true);
  document.addEventListener('keydown',event=>{if(event.key==='Enter')recordPlay(event);},true);
  window.BETVFeatures = {ensure, withTimeout};
})();

/* Preserve the outgoing page, search and horizontal rails in each history entry. */
(() => {
  const push = history.pushState.bind(history);
  const replace = history.replaceState.bind(history);
  let restoreVersion = 0;
  let outgoing = null;
  function snapshot() {
    return {x:window.scrollX,y:window.scrollY,query:document.getElementById('homeSearchInput')?.value||'',view:document.body.dataset.homeView||'home',rails:Array.from(document.querySelectorAll('.video-rail,.video-row')).map((node,index)=>[index,node.scrollLeft]).filter(item=>item[1])};
  }
  function capture(){outgoing={url:location.href,data:snapshot()};}
  window.BETVNavigationState={capture};
  document.addEventListener('click',event=>{
    if(event.target.closest?.('a,button,.video-card'))capture();
  },true);
  history.pushState = function(state, title, url) {
    const saved=outgoing?.url===location.href?outgoing.data:snapshot();
    outgoing=null;
    const catalog=!Array.from(document.body.classList).some(name=>name.endsWith('-page-active'))&&!document.body.classList.contains('login-mode');
    replace({...history.state,...(catalog?{beRoute:'catalog',homeView:saved.view}:{}),betvReturn:saved}, '', location.href);
    return push(state, title, url);
  };
  window.addEventListener('popstate', event => {
    const saved = event.state?.betvReturn;
    if (!saved) return;
    const version = ++restoreVersion;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (version !== restoreVersion) return;
      const desktop = document.getElementById('homeSearchInput');
      const mobile = document.getElementById('mobileSearchInput');
      if (event.state.beRoute==='catalog' && desktop && desktop.value !== saved.query) { desktop.value = saved.query;desktop.dispatchEvent(new Event('input',{bubbles:true})); }
      if (mobile) mobile.value = saved.query;
      const restore = () => {
        if (version !== restoreVersion) return;
        const rails = document.querySelectorAll('.video-rail,.video-row');
        for (const [index,left] of saved.rails||[]) if (rails[index]) rails[index].scrollLeft = left;
        window.scrollTo({left:saved.x||0,top:saved.y||0,behavior:'auto'});
      };
      restore();setTimeout(restore,300);
    }));
  });
  ['pointerdown','wheel','touchstart','keydown'].forEach(type => window.addEventListener(type,()=>{restoreVersion++;},{passive:true}));
})();

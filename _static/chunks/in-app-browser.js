// Android apps may use either an identifiable social browser or a generic WebView.
(() => {
  const ua = navigator.userAgent;
  if (!/Android/i.test(ua) || !/(?:\bwv\b|Instagram|Twitter(?:Android)?|TikTok|musical_ly|BytedanceWebview|FB_IAB|FBAN\/)/i.test(ua)) return;
  if (window.matchMedia('(display-mode: standalone)').matches || window.top !== window.self) return;
  const locale = window.BETVLocale;
  if (!locale?.isPrefixed || /^\/(?:admin|auth|reset-password|oauth)(?:\/|$)/.test(locale.currentPath())) return;
  const key = 'betvBrowserNoticeClosed';
  try { if (sessionStorage.getItem(key)) return; } catch (_) {}
  const messages = {
    'pt-br': ['Abra no navegador', 'Para assistir aos vídeos e entrar na sua conta, abra o BETV no navegador do celular.', 'Abrir no navegador', 'Copiar link', 'Se não abrir, toque em ⋮ e escolha “Abrir no navegador”.', 'Fechar', 'Link copiado', 'Selecione e copie o link'],
    'en-us': ['Open in your browser', 'To watch videos and sign in, open BETV in your phone’s browser.', 'Open in browser', 'Copy link', 'If it doesn’t open, tap ⋮ and choose “Open in browser”.', 'Close', 'Link copied', 'Select and copy the link'],
    es: ['Abre BETV en tu navegador', 'Para ver vídeos e iniciar sesión, abre BETV en el navegador de tu móvil.', 'Abrir en el navegador', 'Copiar enlace', 'Si no se abre, pulsa ⋮ y elige «Abrir en el navegador».', 'Cerrar', 'Enlace copiado', 'Selecciona y copia el enlace'],
    'es-419': ['Abre BETV en tu navegador', 'Para ver videos e iniciar sesión, abre BETV en el navegador de tu celular.', 'Abrir en el navegador', 'Copiar enlace', 'Si no se abre, toca ⋮ y elige “Abrir en el navegador”.', 'Cerrar', 'Enlace copiado', 'Selecciona y copia el enlace'],
    fr: ['Ouvrir dans le navigateur', 'Pour regarder les vidéos et vous connecter, ouvrez BETV dans le navigateur de votre téléphone.', 'Ouvrir dans le navigateur', 'Copier le lien', 'Si rien ne se passe, touchez ⋮ et choisissez « Ouvrir dans le navigateur ».', 'Fermer', 'Lien copié', 'Sélectionnez et copiez le lien'],
    it: ['Apri nel browser', 'Per guardare i video e accedere al tuo account, apri BETV nel browser del telefono.', 'Apri nel browser', 'Copia link', 'Se non si apre, tocca ⋮ e scegli “Apri nel browser”.', 'Chiudi', 'Link copiato', 'Seleziona e copia il link']
  };
  const [title, body, open, copy, hint, close, copied, manual] = messages[locale.slug] || messages['en-us'];
  const panel = document.createElement('dialog');
  panel.className = 'betv-browser-notice';
  panel.setAttribute('data-i18n-ignore', '');
  panel.setAttribute('aria-labelledby', 'betv-browser-title');
  panel.setAttribute('aria-describedby', 'betv-browser-body');
  panel.innerHTML = '<header><h2 id="betv-browser-title"></h2><button class="dismiss" type="button">×</button></header><p id="betv-browser-body"></p><div class="actions"><button type="button" class="open"></button><button type="button" class="copy"></button></div><small></small><span role="status"></span>';
  const el = selector => panel.querySelector(selector);
  el('h2').textContent = title;
  el('p').textContent = body;
  el('small').textContent = hint;
  el('.dismiss').setAttribute('aria-label', close);
  el('.open').textContent = open;
  el('.copy').textContent = copy;
  el('.dismiss').onclick = () => panel.close();
  panel.addEventListener('close', () => {
    try { sessionStorage.setItem(key, '1'); } catch (_) {}
    panel.remove();
  });
  el('.open').onclick = () => {
    const url = new URL(location.href);
    if (!/^https?:$/.test(url.protocol)) return;
    // The browser selector invokes the user's browser without pinning a vendor.
    const data = url.href.slice(url.protocol.length).replace(/#Intent;/gi, '%23Intent%3B');
    location.assign('intent:' + data + '#Intent;scheme=' + url.protocol.slice(0,-1) + ';action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;SEL;action=android.intent.action.MAIN;category=android.intent.category.APP_BROWSER;end');
  };
  el('.copy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      el('[role=status]').textContent = copied;
    } catch (_) {
      let field = el('input');
      if (!field) {
        field = document.createElement('input');
        field.readOnly = true;
        field.setAttribute('aria-label', manual);
        panel.append(field);
      }
      field.value = location.href;
      field.focus();
      field.select();
      el('[role=status]').textContent = manual;
    }
  };
  if (typeof panel.showModal !== 'function') return;
  document.body.append(panel);
  panel.showModal();
})();

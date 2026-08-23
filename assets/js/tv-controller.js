(() => {
  'use strict';

  const SUPABASE_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
  const ACTIVE_SESSION_KEY = 'beTvActiveSessionId';
  const ACTIVE_CODE_KEY = 'beTvActivePairCode';
  const PENDING_MEDIA_KEY = 'beTvPendingMedia';
  const CURRENT_MEDIA_KEY = 'beTvCurrentMedia';
  const POST_AUTH_KEY = 'bePostAuthReturn';
  const LOCALE_STORAGE_KEY = 'betvPreferredLocale';
  const TV_I18N = {
    'pt-br': {
      lang: 'pt-BR', pageTitle: 'Transmitir para TV — Billie Eilish TV', back: 'Voltar', heading: 'Transmitir para a TV',
      description: 'Conecte sua conta a uma Smart TV e envie vídeos e filmes diretamente do Billie Eilish TV.', checkingAccount: 'Verificando sua conta…',
      codeShown: 'Código exibido na TV', connectSmartTv: 'Conectar Smart TV',
      pairHelp: 'Na televisão, abra <strong>billieilishtv.site/tv</strong>. Você também pode escanear o QR Code mostrado na TV.',
      smartTvConnected: 'Smart TV conectada', ready: 'Pronta para receber conteúdo', readyWithCode: 'Código {code} • pronta para receber conteúdo',
      selectedContent: 'Conteúdo selecionado', sendNow: 'Transmitir agora', transmitted: 'Transmitido', chooseOther: 'Escolher outro conteúdo', disconnectTv: 'Desconectar TV',
      yourAccount: 'Sua conta', profile: 'Perfil Billie Eilish TV', movie: 'Filme', series: 'Série', video: 'Vídeo',
      enterCode: 'Digite o código de 8 caracteres mostrado na TV.', sending: 'Enviando para sua TV…', transmitting: 'Transmitindo…',
      sendError: 'Não foi possível enviar o conteúdo. Reconecte a TV e tente novamente.', expired: 'Esse código expirou. Gere um novo código na TV.',
      alreadyUsed: 'Esse código já foi conectado a outra conta.', invalidCode: 'Confira o código exibido na TV.', pairError: 'Não foi possível conectar a TV. Confira o código e tente novamente.',
      connectingSmartTv: 'Conectando à sua Smart TV…', connecting: 'Conectando…', enableSubtitles: 'Ativar legendas na TV', disableSubtitles: 'Desativar legendas na TV',
      subtitlesOn: 'Legendas ativadas na TV.', subtitlesOff: 'Legendas desativadas na TV.', subtitlesError: 'Não foi possível alterar as legendas da TV.',
      disconnecting: 'Desconectando…', bootError: 'Não foi possível iniciar a conexão com a TV. Atualize a página.'
    },
    'en-us': {
      lang: 'en-US', pageTitle: 'Cast to TV — Billie Eilish TV', back: 'Back', heading: 'Cast to TV',
      description: 'Connect your account to a Smart TV and send videos and movies directly from Billie Eilish TV.', checkingAccount: 'Checking your account…',
      codeShown: 'Code shown on TV', connectSmartTv: 'Connect Smart TV',
      pairHelp: 'On your TV, open <strong>billieilishtv.site/tv</strong>. You can also scan the QR code shown on the TV.',
      smartTvConnected: 'Smart TV connected', ready: 'Ready to receive content', readyWithCode: 'Code {code} • ready to receive content',
      selectedContent: 'Selected content', sendNow: 'Cast now', transmitted: 'Cast', chooseOther: 'Choose another title', disconnectTv: 'Disconnect TV',
      yourAccount: 'Your account', profile: 'Billie Eilish TV profile', movie: 'Movie', series: 'Series', video: 'Video',
      enterCode: 'Enter the 8-character code shown on the TV.', sending: 'Sending to your TV…', transmitting: 'Casting…',
      sendError: 'Could not send the content. Reconnect the TV and try again.', expired: 'This code has expired. Generate a new code on the TV.',
      alreadyUsed: 'This code is already connected to another account.', invalidCode: 'Check the code shown on the TV.', pairError: 'Could not connect the TV. Check the code and try again.',
      connectingSmartTv: 'Connecting to your Smart TV…', connecting: 'Connecting…', enableSubtitles: 'Turn on subtitles on TV', disableSubtitles: 'Turn off subtitles on TV',
      subtitlesOn: 'Subtitles turned on on the TV.', subtitlesOff: 'Subtitles turned off on the TV.', subtitlesError: 'Could not change the TV subtitles.',
      disconnecting: 'Disconnecting…', bootError: 'Could not start the TV connection. Refresh the page.'
    },
    es: {
      lang: 'es-ES', pageTitle: 'Transmitir a la TV — Billie Eilish TV', back: 'Volver', heading: 'Transmitir a la TV',
      description: 'Conecta tu cuenta a una Smart TV y envía videos y películas directamente desde Billie Eilish TV.', checkingAccount: 'Verificando tu cuenta…',
      codeShown: 'Código que aparece en la TV', connectSmartTv: 'Conectar Smart TV',
      pairHelp: 'En la televisión, abre <strong>billieilishtv.site/tv</strong>. También puedes escanear el código QR que aparece en la TV.',
      smartTvConnected: 'Smart TV conectada', ready: 'Lista para recibir contenido', readyWithCode: 'Código {code} • lista para recibir contenido',
      selectedContent: 'Contenido seleccionado', sendNow: 'Transmitir ahora', transmitted: 'Transmitido', chooseOther: 'Elegir otro contenido', disconnectTv: 'Desconectar TV',
      yourAccount: 'Tu cuenta', profile: 'Perfil de Billie Eilish TV', movie: 'Película', series: 'Serie', video: 'Vídeo',
      enterCode: 'Introduce el código de 8 caracteres que aparece en la TV.', sending: 'Enviando a tu TV…', transmitting: 'Transmitiendo…',
      sendError: 'No se pudo enviar el contenido. Vuelve a conectar la TV e inténtalo de nuevo.', expired: 'Este código ha caducado. Genera un código nuevo en la TV.',
      alreadyUsed: 'Este código ya está conectado a otra cuenta.', invalidCode: 'Comprueba el código que aparece en la TV.', pairError: 'No se pudo conectar la TV. Comprueba el código e inténtalo de nuevo.',
      connectingSmartTv: 'Conectando a tu Smart TV…', connecting: 'Conectando…', enableSubtitles: 'Activar subtítulos en la TV', disableSubtitles: 'Desactivar subtítulos en la TV',
      subtitlesOn: 'Subtítulos activados en la TV.', subtitlesOff: 'Subtítulos desactivados en la TV.', subtitlesError: 'No se pudieron cambiar los subtítulos de la TV.',
      disconnecting: 'Desconectando…', bootError: 'No se pudo iniciar la conexión con la TV. Actualiza la página.'
    },
    fr: {
      lang: 'fr-FR', pageTitle: 'Diffuser sur la TV — Billie Eilish TV', back: 'Retour', heading: 'Diffuser sur la TV',
      description: 'Connectez votre compte à une Smart TV et envoyez des vidéos et des films directement depuis Billie Eilish TV.', checkingAccount: 'Vérification de votre compte…',
      codeShown: 'Code affiché sur la TV', connectSmartTv: 'Connecter la Smart TV',
      pairHelp: 'Sur votre téléviseur, ouvrez <strong>billieilishtv.site/tv</strong>. Vous pouvez aussi scanner le QR code affiché sur la TV.',
      smartTvConnected: 'Smart TV connectée', ready: 'Prête à recevoir du contenu', readyWithCode: 'Code {code} • prête à recevoir du contenu',
      selectedContent: 'Contenu sélectionné', sendNow: 'Diffuser maintenant', transmitted: 'Diffusé', chooseOther: 'Choisir un autre contenu', disconnectTv: 'Déconnecter la TV',
      yourAccount: 'Votre compte', profile: 'Profil Billie Eilish TV', movie: 'Film', series: 'Série', video: 'Vidéo',
      enterCode: 'Saisissez le code à 8 caractères affiché sur la TV.', sending: 'Envoi vers votre TV…', transmitting: 'Diffusion…',
      sendError: 'Impossible d’envoyer le contenu. Reconnectez la TV et réessayez.', expired: 'Ce code a expiré. Générez un nouveau code sur la TV.',
      alreadyUsed: 'Ce code est déjà connecté à un autre compte.', invalidCode: 'Vérifiez le code affiché sur la TV.', pairError: 'Impossible de connecter la TV. Vérifiez le code et réessayez.',
      connectingSmartTv: 'Connexion à votre Smart TV…', connecting: 'Connexion…', enableSubtitles: 'Activer les sous-titres sur la TV', disableSubtitles: 'Désactiver les sous-titres sur la TV',
      subtitlesOn: 'Sous-titres activés sur la TV.', subtitlesOff: 'Sous-titres désactivés sur la TV.', subtitlesError: 'Impossible de modifier les sous-titres de la TV.',
      disconnecting: 'Déconnexion…', bootError: 'Impossible de démarrer la connexion à la TV. Actualisez la page.'
    },
    it: {
      lang: 'it-IT', pageTitle: 'Trasmetti sulla TV — Billie Eilish TV', back: 'Indietro', heading: 'Trasmetti sulla TV',
      description: 'Collega il tuo account a una Smart TV e invia video e film direttamente da Billie Eilish TV.', checkingAccount: 'Verifica del tuo account…',
      codeShown: 'Codice mostrato sulla TV', connectSmartTv: 'Collega Smart TV',
      pairHelp: 'Sulla TV, apri <strong>billieilishtv.site/tv</strong>. Puoi anche scansionare il codice QR mostrato sulla TV.',
      smartTvConnected: 'Smart TV collegata', ready: 'Pronta a ricevere contenuti', readyWithCode: 'Codice {code} • pronta a ricevere contenuti',
      selectedContent: 'Contenuto selezionato', sendNow: 'Trasmetti ora', transmitted: 'Trasmissione avviata', chooseOther: 'Scegli un altro contenuto', disconnectTv: 'Disconnetti TV',
      yourAccount: 'Il tuo account', profile: 'Profilo Billie Eilish TV', movie: 'Film', series: 'Serie', video: 'Video',
      enterCode: 'Inserisci il codice di 8 caratteri mostrato sulla TV.', sending: 'Invio alla TV…', transmitting: 'Trasmissione…',
      sendError: 'Impossibile inviare il contenuto. Ricollega la TV e riprova.', expired: 'Questo codice è scaduto. Genera un nuovo codice sulla TV.',
      alreadyUsed: 'Questo codice è già collegato a un altro account.', invalidCode: 'Controlla il codice mostrato sulla TV.', pairError: 'Impossibile collegare la TV. Controlla il codice e riprova.',
      connectingSmartTv: 'Connessione alla Smart TV…', connecting: 'Connessione…', enableSubtitles: 'Attiva sottotitoli sulla TV', disableSubtitles: 'Disattiva sottotitoli sulla TV',
      subtitlesOn: 'Sottotitoli attivati sulla TV.', subtitlesOff: 'Sottotitoli disattivati sulla TV.', subtitlesError: 'Impossibile modificare i sottotitoli della TV.',
      disconnecting: 'Disconnessione…', bootError: 'Impossibile avviare la connessione alla TV. Aggiorna la pagina.'
    }
  };

  function normalizeUiLocale(value) {
    const raw = String(value || '').trim().toLowerCase().replace('_', '-');
    if (raw === 'pt' || raw === 'pt-br' || raw.startsWith('pt-')) return 'pt-br';
    if (raw === 'en' || raw === 'en-us' || raw.startsWith('en-')) return 'en-us';
    if (raw === 'es' || raw.startsWith('es-')) return 'es';
    if (raw === 'fr' || raw.startsWith('fr-')) return 'fr';
    if (raw === 'it' || raw.startsWith('it-')) return 'it';
    return '';
  }

  function detectControllerLocale() {
    try {
      const query = normalizeUiLocale(new URLSearchParams(location.search).get('lang'));
      if (query) return query;
    } catch (_) {}
    try {
      const stored = normalizeUiLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
      if (stored) return stored;
    } catch (_) {}
    try {
      const languages = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages : [navigator.language || navigator.userLanguage || ''];
      for (const language of languages) {
        const locale = normalizeUiLocale(language);
        if (locale) return locale;
      }
    } catch (_) {}
    return 'pt-br';
  }

  const CONTROLLER_LOCALE = detectControllerLocale();
  const COPY = TV_I18N[CONTROLLER_LOCALE] || TV_I18N['pt-br'];

  function tr(key, variables = {}) {
    return String(COPY[key] || TV_I18N['pt-br'][key] || key).replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => Object.prototype.hasOwnProperty.call(variables, name) ? String(variables[name]) : _);
  }

  function applyStaticTranslations() {
    document.documentElement.lang = COPY.lang || 'pt-BR';
    document.documentElement.dataset.locale = CONTROLLER_LOCALE;
    document.title = tr('pageTitle');
    document.querySelectorAll('[data-tv-i18n]').forEach(node => {
      const key = node.getAttribute('data-tv-i18n');
      if (key) node.textContent = tr(key);
    });
    document.querySelectorAll('[data-tv-i18n-html]').forEach(node => {
      const key = node.getAttribute('data-tv-i18n-html');
      if (key) node.innerHTML = tr(key);
    });
  }

  const loading = document.getElementById('controllerLoading');
  const formView = document.getElementById('controllerFormView');
  const connectedView = document.getElementById('controllerConnectedView');
  const accountHost = document.getElementById('controllerAccount');
  const connectedAccountHost = document.getElementById('controllerConnectedAccount');
  const form = document.getElementById('pairCodeForm');
  const codeInput = document.getElementById('pairCodeInput');
  const message = document.getElementById('controllerMessage');
  const connectedMessage = document.getElementById('connectedMessage');
  const connectedCode = document.getElementById('connectedCode');
  const pendingPreview = document.getElementById('pendingPreview');
  const pendingThumb = document.getElementById('pendingThumb');
  const pendingTitle = document.getElementById('pendingTitle');
  const pendingMeta = document.getElementById('pendingMeta');
  const sendButton = document.getElementById('sendToTvButton');
  const disconnectButton = document.getElementById('disconnectTvButton');
  const subtitleRemoteButton = document.getElementById('tvSubtitleRemoteButton');

  let client = null;
  let user = null;
  let userProfile = null;
  let activeSessionId = '';
  let activeCode = '';
  let pendingMedia = null;
  let busy = false;
  let castToastTimer = 0;
  let currentTvMedia = null;
  let tvSubtitlesEnabled = false;

  function safeCode(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  }

  function safeReturnTarget() {
    return `${location.pathname}${location.search}`;
  }


  function returnHome() {
    try { location.replace('/'); }
    catch (_) { location.href = '/'; }
  }

  function desktopControllerMode() {
    try { return window.matchMedia('(min-width: 1000px)').matches; }
    catch (_) { return Number(window.innerWidth || 0) >= 1000; }
  }

  function profileMetadata() {
    return user?.user_metadata || {};
  }

  function accountProfile() {
    const metadata = profileMetadata();
    return {
      displayName: String(userProfile?.display_name || metadata.display_name || metadata.full_name || user?.email || tr('yourAccount')).trim(),
      username: String(userProfile?.username || metadata.username || metadata.user_name || '').trim().replace(/^@+/, ''),
      avatarUrl: String(userProfile?.avatar_url || metadata.profile_avatar_url || '').trim(),
      bannerUrl: String(userProfile?.banner_url || metadata.profile_banner_url || metadata.banner_url || '').trim()
    };
  }

  function currentLocaleSlug() {
    return CONTROLLER_LOCALE;
  }

  function mediaLocale(media) {
    const raw = String(media?.subtitleLocale || currentLocaleSlug()).trim().toLowerCase();
    if (raw === 'en' || raw === 'en-us' || raw.startsWith('en-')) return 'en-us';
    if (raw === 'es' || raw.startsWith('es-')) return 'es';
    if (raw === 'fr' || raw.startsWith('fr-')) return 'fr';
    if (raw === 'it' || raw.startsWith('it-')) return 'it';
    return 'pt-br';
  }

  function subtitleUploadedLocale(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const url = new URL(raw, location.origin);
      const path = decodeURIComponent(url.pathname || '').toLowerCase();
      const match = path.match(/(?:^|\/)(pt-br|pt|es|fr|it|en-us|en)[-_][^/]+\.(?:srt|vtt)$/i);
      if (!match) return '';
      const code = String(match[1] || '').toLowerCase();
      if (code === 'pt' || code === 'pt-br') return 'pt-br';
      if (code === 'en' || code === 'en-us') return 'en-us';
      if (code === 'es') return 'es';
      if (code === 'fr') return 'fr';
      if (code === 'it') return 'it';
    } catch (_) {}
    return '';
  }

  function subtitleMatchesLocale(value, locale) {
    const uploadedLocale = subtitleUploadedLocale(value);
    return !uploadedLocale || uploadedLocale === locale;
  }

  function localizedSubtitleUrl(media) {
    if (!media || typeof media !== 'object') return '';
    const locale = mediaLocale(media);
    const aliases = locale === 'pt-br' ? ['pt-br', 'pt'] : locale === 'en-us' ? ['en-us', 'en'] : [locale];
    const maps = [media.subtitleTracks, media.subtitleUrls, media.subtitles];
    for (const map of maps) {
      if (!map || typeof map !== 'object' || Array.isArray(map)) continue;
      for (const key of aliases) {
        const value = map[key];
        if (typeof value === 'string' && value.trim() && subtitleMatchesLocale(value, locale)) return value.trim();
        if (value && typeof value === 'object' && String(value.url || value.subtitleUrl || '').trim()) {
          const nested = String(value.url || value.subtitleUrl).trim();
          if (subtitleMatchesLocale(nested, locale)) return nested;
        }
      }
    }
    const translations = media.translations;
    if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
      for (const key of aliases) {
        const translated = translations[key];
        if (translated && typeof translated === 'object' && String(translated.subtitleUrl || '').trim()) {
          const nested = String(translated.subtitleUrl).trim();
          if (subtitleMatchesLocale(nested, locale)) return nested;
        }
      }
    }
    const fallback = String(media.subtitleUrl || '').trim();
    return fallback && subtitleMatchesLocale(fallback, locale) ? fallback : '';
  }

  function hasPlayableMedia(media) {
    if (!media || typeof media !== 'object') return false;
    return Boolean(String(media.tvDriveUrl || media.mobileAppDriveUrl || media.appDriveUrl || media.contentUrl || '').trim());
  }

  function mediaWithTvState(media, subtitleEnabled = false) {
    const source = media && typeof media === 'object' ? media : {};
    const subtitleLocale = mediaLocale(source);
    const subtitleUrl = localizedSubtitleUrl(source);
    const profile = accountProfile();
    return {
      itemId: String(source.itemId || ''),
      recordId: String(source.recordId || ''),
      title: String(source.title || 'Billie Eilish TV'),
      year: String(source.year || ''),
      duration: String(source.duration || ''),
      contentUrl: String(source.contentUrl || ''),
      mobileAppDriveUrl: String(source.mobileAppDriveUrl || source.appDriveUrl || ''),
      tvDriveUrl: String(source.tvDriveUrl || source.mobileAppDriveUrl || source.appDriveUrl || ''),
      collection: String(source.collection || 'videos'),
      description: String(source.description || ''),
      imageUrl: String(source.imageUrl || ''),
      bannerUrl: String(source.bannerUrl || ''),
      logoUrl: String(source.logoUrl || ''),
      subtitleUrl,
      subtitleLocale,
      subtitleEnabled: Boolean(subtitleUrl && subtitleEnabled),
      tvProfile: profile
    };
  }

  async function syncProfileToTv() {
    if (!client || !activeSessionId || !user) return false;
    const source = currentTvMedia && typeof currentTvMedia === 'object' ? currentTvMedia : {};
    const nextMedia = mediaWithTvState(source, Boolean(source.subtitleEnabled));
    const previous = source.tvProfile && typeof source.tvProfile === 'object' ? source.tvProfile : {};
    const nextProfile = nextMedia.tvProfile || {};
    if (previous.displayName === nextProfile.displayName && previous.username === nextProfile.username && previous.avatarUrl === nextProfile.avatarUrl && previous.bannerUrl === nextProfile.bannerUrl) return true;
    const { error } = await client.rpc('tv_send_media', { p_session_id: activeSessionId, p_media: nextMedia });
    if (error) throw error;
    currentTvMedia = nextMedia;
    return true;
  }

  async function loadAccountProfile() {
    if (!client || !user?.id) return null;
    const { data, error } = await client
      .from('profiles')
      .select('display_name,username,avatar_url,banner_url')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw error;
    userProfile = data || null;
    return userProfile;
  }

  function accountMarkup(target) {
    if (!target || !user) return;
    const profile = accountProfile();
    const name = profile.displayName || tr('yourAccount');
    const initial = (name.trim()[0] || 'B').toUpperCase();
    target.textContent = '';
    target.classList.toggle('has-banner', Boolean(profile.bannerUrl));

    if (profile.bannerUrl) {
      const banner = document.createElement('img');
      banner.className = 'tv-account-banner';
      banner.src = profile.bannerUrl;
      banner.alt = '';
      banner.loading = 'eager';
      banner.decoding = 'async';
      banner.addEventListener('error', () => {
        banner.remove();
        target.classList.remove('has-banner');
      }, { once: true });
      target.appendChild(banner);
    }

    const avatar = document.createElement('span');
    avatar.className = 'tv-account-avatar';
    avatar.textContent = initial;
    if (profile.avatarUrl) {
      const image = document.createElement('img');
      image.src = profile.avatarUrl;
      image.alt = '';
      image.loading = 'eager';
      image.decoding = 'async';
      image.addEventListener('error', () => { image.remove(); avatar.textContent = initial; }, { once: true });
      avatar.appendChild(image);
    }

    const copy = document.createElement('span');
    copy.className = 'tv-account-copy';
    const strong = document.createElement('strong');
    strong.textContent = name;
    const small = document.createElement('span');
    small.textContent = profile.username ? `@${profile.username}` : tr('profile');
    copy.append(strong, small);
    target.append(avatar, copy);
  }

  function setMessage(target, text, type = '') {
    if (!target) return;
    target.className = `tv-message${type ? ` ${type}` : ''}`;
    target.textContent = text || '';
  }

  function showCastToast(text) {
    let toast = document.getElementById('tvCastToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tvCastToast';
      toast.className = 'tv-cast-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = text || '';
    window.clearTimeout(castToastTimer);
    requestAnimationFrame(() => toast.classList.add('show'));
    castToastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
  }


  function syncSubtitleRemote() {
    if (!subtitleRemoteButton) return;
    const hasSubtitle = Boolean(currentTvMedia && localizedSubtitleUrl(currentTvMedia));
    subtitleRemoteButton.hidden = !hasSubtitle;
    subtitleRemoteButton.disabled = false;
    subtitleRemoteButton.classList.toggle('is-active', hasSubtitle && tvSubtitlesEnabled);
    subtitleRemoteButton.setAttribute('aria-pressed', tvSubtitlesEnabled ? 'true' : 'false');
    const label = subtitleRemoteButton.querySelector('span:last-child');
    if (label) label.textContent = tvSubtitlesEnabled ? tr('disableSubtitles') : tr('enableSubtitles');
  }

  function readPendingMedia() {
    try {
      const raw = localStorage.getItem(PENDING_MEDIA_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !hasPlayableMedia(parsed)) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function readStoredCurrentMedia() {
    try {
      const raw = localStorage.getItem(CURRENT_MEDIA_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && hasPlayableMedia(parsed) ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function renderPending() {
    pendingMedia = readPendingMedia();
    const currentMedia = hasPlayableMedia(currentTvMedia) ? currentTvMedia : readStoredCurrentMedia();
    const previewMedia = pendingMedia || currentMedia;
    const alreadyTransmitted = !pendingMedia && Boolean(currentMedia);

    if (!previewMedia) {
      pendingPreview.hidden = true;
      sendButton.hidden = true;
      return;
    }

    pendingTitle.textContent = String(previewMedia.title || tr('selectedContent'));
    pendingMeta.textContent = [previewMedia.collection === 'movies' ? tr('movie') : previewMedia.collection === 'series' ? tr('series') : tr('video'), previewMedia.duration].filter(Boolean).join(' • ');
    pendingThumb.textContent = '';
    const imageUrl = String(previewMedia.imageUrl || previewMedia.bannerUrl || '').trim();
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = '';
      img.loading = 'eager';
      img.decoding = 'async';
      pendingThumb.appendChild(img);
    }

    pendingPreview.hidden = false;
    sendButton.hidden = false;
    sendButton.textContent = alreadyTransmitted ? tr('transmitted') : tr('sendNow');
    sendButton.classList.toggle('is-transmitted', alreadyTransmitted);
    sendButton.disabled = alreadyTransmitted;
  }

  function showForm() {
    loading.hidden = true;
    connectedView.hidden = true;
    formView.hidden = false;
    accountMarkup(accountHost);
    renderPending();
  }

  function showConnected() {
    loading.hidden = true;
    formView.hidden = true;
    connectedView.hidden = false;
    accountMarkup(connectedAccountHost);
    connectedCode.textContent = activeCode ? tr('readyWithCode', { code: activeCode }) : tr('ready');
    renderPending();
    syncSubtitleRemote();
  }

  async function loadMySession() {
    const { data, error } = await client.rpc('tv_my_sessions');
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    if (!rows.length) return null;
    const stored = String(localStorage.getItem(ACTIVE_SESSION_KEY) || '');
    return rows.find(row => String(row.session_id) === stored) || rows[0];
  }

  async function claim(code) {
    const normalized = safeCode(code);
    if (normalized.length !== 8) {
      setMessage(message, tr('enterCode'), 'error');
      return false;
    }
    const { data, error } = await client.rpc('tv_claim_session', { p_pairing_code: normalized });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.session_id) throw new Error('pairing_failed');
    activeSessionId = String(row.session_id);
    activeCode = normalized;
    localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    localStorage.setItem(ACTIVE_CODE_KEY, activeCode);
    showConnected();
    try { await syncProfileToTv(); } catch (error) { (void 0); }
    try { history.replaceState(null, '', '/connect-tv/'); } catch (_) {}
    return true;
  }

  async function sendPending({ automatic = false } = {}) {
    pendingMedia = readPendingMedia();
    if (!pendingMedia || !activeSessionId) return false;
    if (busy) return false;
    busy = true;
    sendButton.disabled = true;
    setMessage(connectedMessage, automatic ? tr('sending') : tr('transmitting'));
    try {
      const mediaToSend = mediaWithTvState(pendingMedia, false);
      const { error } = await client.rpc('tv_send_media', {
        p_session_id: activeSessionId,
        p_media: mediaToSend
      });
      if (error) throw error;
      currentTvMedia = mediaToSend;
      tvSubtitlesEnabled = false;
      try { localStorage.setItem(CURRENT_MEDIA_KEY, JSON.stringify(mediaToSend)); } catch (_) {}
      localStorage.removeItem(PENDING_MEDIA_KEY);
      setMessage(connectedMessage, '');
      sendButton.textContent = tr('transmitted');
      sendButton.classList.add('is-transmitted');
      sendButton.disabled = true;
      syncSubtitleRemote();
      return true;
    } catch (error) {
      (void 0);
      sendButton.classList.remove('is-transmitted');
      setMessage(connectedMessage, tr('sendError'), 'error');
      sendButton.disabled = false;
      return false;
    } finally {
      busy = false;
    }
  }

  function friendlyPairError(error) {
    const text = String(error?.message || '').toLowerCase();
    if (text.includes('pairing_code_expired')) return tr('expired');
    if (text.includes('pairing_code_already_used')) return tr('alreadyUsed');
    if (text.includes('invalid_pairing_code')) return tr('invalidCode');
    return tr('pairError');
  }

  async function boot() {
    if (!window.supabase?.createClient) throw new Error('supabase_unavailable');
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: window.localStorage
      }
    });

    const { data: userData } = await client.auth.getUser();
    user = userData?.user || null;
    if (!user) {
      const target = safeReturnTarget();
      try { sessionStorage.setItem(POST_AUTH_KEY, target); } catch (_) {}
      location.replace(`/login?return_to=${encodeURIComponent(target)}`);
      return;
    }

    pendingMedia = readPendingMedia();
    try {
      await loadAccountProfile();
    } catch (error) {
      (void 0);
    }
    accountMarkup(accountHost);
    accountMarkup(connectedAccountHost);

    const queryCode = safeCode(new URLSearchParams(location.search).get('code'));
    if (queryCode.length === 8) {
      codeInput.value = queryCode;
      loading.querySelector('span:last-child').textContent = tr('connectingSmartTv');
      try {
        const ok = await claim(queryCode);
        if (ok && pendingMedia) await sendPending({ automatic: true });
        if (ok && desktopControllerMode()) returnHome();
        if (ok) showConnected();
        return;
      } catch (error) {
        showForm();
        setMessage(message, friendlyPairError(error), 'error');
        return;
      }
    }

    try {
      const existing = await loadMySession();
      if (existing) {
        activeSessionId = String(existing.session_id || '');
        currentTvMedia = existing.current_media && typeof existing.current_media === 'object' ? existing.current_media : {};
        tvSubtitlesEnabled = Boolean(currentTvMedia && currentTvMedia.subtitleEnabled);
        activeCode = String(existing.pairing_code || localStorage.getItem(ACTIVE_CODE_KEY) || '');
        localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
        if (activeCode) localStorage.setItem(ACTIVE_CODE_KEY, activeCode);
        if (!desktopControllerMode()) showConnected();
        try { await syncProfileToTv(); } catch (error) { (void 0); }
        if (pendingMedia) await sendPending({ automatic: true });
        if (desktopControllerMode()) returnHome();
        showConnected();
      } else {
        showForm();
      }
    } catch (error) {
      (void 0);
      showForm();
    }
  }

  codeInput?.addEventListener('input', () => {
    const value = safeCode(codeInput.value);
    codeInput.value = value;
    setMessage(message, '');
  });

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    const button = event.submitter || form.querySelector('button[type="submit"]');
    button.disabled = true;
    setMessage(message, tr('connecting'));
    try {
      const ok = await claim(codeInput.value);
      if (ok && readPendingMedia()) await sendPending({ automatic: true });
      if (ok && desktopControllerMode()) returnHome();
      if (ok) showConnected();
    } catch (error) {
      showForm();
      setMessage(message, friendlyPairError(error), 'error');
    } finally {
      busy = false;
      button.disabled = false;
    }
  });

  sendButton?.addEventListener('click', () => sendPending());

  subtitleRemoteButton?.addEventListener('click', async () => {
    if (!activeSessionId || !currentTvMedia || !localizedSubtitleUrl(currentTvMedia) || busy) return;
    busy = true;
    subtitleRemoteButton.disabled = true;
    const next = !tvSubtitlesEnabled;
    try {
      const updatedMedia = mediaWithTvState(currentTvMedia, next);
      let changed = false;

      // Preferimos a RPC leve quando ela já estiver instalada no Supabase: ela
      // altera somente o estado da legenda e não reinicia o vídeo na televisão.
      try {
        const result = await client.rpc('tv_set_subtitles', { p_session_id: activeSessionId, p_enabled: next });
        if (!result?.error && result?.data === true) changed = true;
      } catch (_) {}

      // Compatibilidade com instalações que ainda não aplicaram a migration da
      // RPC acima. O payload é propositalmente pequeno para não estourar o limite
      // do tv_send_media e a TV ignora a mudança de versão quando o vídeo é o mesmo.
      if (!changed) {
        const fallback = await client.rpc('tv_send_media', { p_session_id: activeSessionId, p_media: updatedMedia });
        if (fallback?.error) throw fallback.error;
        changed = true;
      }

      currentTvMedia = updatedMedia;
      tvSubtitlesEnabled = next;
      setMessage(connectedMessage, '');
      syncSubtitleRemote();
      showCastToast(next ? tr('subtitlesOn') : tr('subtitlesOff'));
    } catch (error) {
      (void 0);
      setMessage(connectedMessage, tr('subtitlesError'), 'error');
      subtitleRemoteButton.disabled = false;
    } finally { busy = false; }
  });

  disconnectButton?.addEventListener('click', async () => {
    if (!activeSessionId || busy) return;
    busy = true;
    disconnectButton.disabled = true;
    setMessage(connectedMessage, tr('disconnecting'));
    try {
      await client.rpc('tv_disconnect_session', { p_session_id: activeSessionId });
    } catch (error) {
      (void 0);
    }
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(ACTIVE_CODE_KEY);
    localStorage.removeItem(CURRENT_MEDIA_KEY);
    activeSessionId = '';
    activeCode = '';
    codeInput.value = '';
    setMessage(connectedMessage, '');
    showForm();
    busy = false;
    disconnectButton.disabled = false;
  });

  applyStaticTranslations();

  boot().catch(error => {
    (void 0);
    loading.hidden = true;
    formView.hidden = false;
    setMessage(message, tr('bootError'), 'error');
  });
})();

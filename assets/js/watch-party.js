/* BETV Watch Party — compact, invitation-only playback rooms (no chat). */
(() => {
  'use strict';
  if (window.BETVWatchParty) return;
  const $ = id => document.getElementById(id);
  const ROOM_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  const VIDEO_RE = /^[0-9]{6,12}$/;
  const strings = {
    'pt-br': ['Assistir juntos','Convidar fã','Pesquisar @usuário','Sair da sala','Criar sala','Entre na sua conta para enviar ou receber convites.','Aguardando convidados…','Convite enviado!','Não foi possível enviar o convite.','Sala conectada','Aguardando anfitrião…','O player externo não oferece sincronização automática.','Sincronizando reprodução…','Toque em reproduzir para acompanhar.','Watch Party','convidou você para assistir','Aceitar','Recusar','Convite expirado ou indisponível.','Nenhum fã encontrado.','Busque um fã pelo @usuário.','Pessoas na sala','Fechar','Erro de conexão. Tente novamente.'],
    'en-us': ['Watch together','Invite fan','Search @username','Leave room','Create room','Sign in to send or receive invitations.','Waiting for guests…','Invitation sent!','Could not send invitation.','Room connected','Waiting for host…','External players do not support automatic syncing.','Syncing playback…','Tap play to join the playback.','Watch Party','invited you to watch','Accept','Decline','Invitation expired or unavailable.','No fans found.','Search for a fan by @username.','People in room','Close','Connection failed. Try again.'],
    'es': ['Ver juntos','Invitar fan','Buscar @usuario','Salir de la sala','Crear sala','Inicia sesión para enviar o recibir invitaciones.','Esperando invitados…','¡Invitación enviada!','No se pudo enviar.','Sala conectada','Esperando anfitrión…','Los reproductores externos no permiten sincronización.','Sincronizando…','Toca reproducir para unirte.','Watch Party','te invitó a ver','Aceptar','Rechazar','Invitación caducada.','No se encontraron fans.','Busca un fan por @usuario.','Usuarios en la sala','Cerrar','Error de conexión.'],
    fr: ['Regarder ensemble','Inviter un fan','Chercher @pseudo','Quitter','Créer un salon','Connectez-vous pour inviter ou recevoir des invitations.','En attente des invités…','Invitation envoyée !','Échec de l’invitation.','Salon connecté','En attente de l’hôte…','Synchronisation indisponible pour les lecteurs externes.','Synchronisation…','Appuyez sur Lecture.','Watch Party','vous invite à regarder','Accepter','Refuser','Invitation expirée.','Aucun fan trouvé.','Recherchez un fan par @pseudo.','Participants','Fermer','Erreur de connexion.'],
    it: ['Guarda insieme','Invita fan','Cerca @utente','Esci dalla stanza','Crea stanza','Accedi per invitare o ricevere inviti.','In attesa di invitati…','Invito inviato!','Impossibile inviare.','Stanza connessa','In attesa dell’host…','Il player esterno non supporta la sincronizzazione.','Sincronizzazione…','Tocca Riproduci.','Watch Party','ti ha invitato a guardare','Accetta','Rifiuta','Invito scaduto.','Nessun fan trovato.','Cerca un fan per @utente.','Persone nella stanza','Chiudi','Errore di connessione.']
  };
  const t = i => (strings[String(window.BETVLocale?.slug || 'pt-br').toLowerCase()] || strings['pt-br'])[i];
  const extra = {
    'pt-br':{host:'Anfitrião',members:'Na sala',room:'Sala compartilhada',profile:'Perfil do fã',invite:'Convite para assistir juntos',gift:'Presentear +1 acesso',search:'Buscar fãs por @usuário'},
    'en-us':{host:'Host',members:'In the room',room:'Shared room',profile:'Fan profile',invite:'Watch together invitation',gift:'Gift +1 access',search:'Find fans by @username'},
    es:{host:'Anfitrión',members:'En la sala',room:'Sala compartida',profile:'Perfil del fan',invite:'Invitación para ver juntos',gift:'Regalar +1 acceso',search:'Buscar fans por @usuario'},
    fr:{host:'Hôte',members:'Dans le salon',room:'Salon partagé',profile:'Profil du fan',invite:'Invitation à regarder ensemble',gift:'Offrir +1 accès',search:'Chercher des fans par @pseudo'},
    it:{host:'Host',members:'Nella stanza',room:'Stanza condivisa',profile:'Profilo del fan',invite:'Invito a guardare insieme',gift:'Regala +1 accesso',search:'Cerca fan per @utente'}
  };
  const xt = key => (extra[String(window.BETVLocale?.slug || 'pt-br').toLowerCase()] || extra['pt-br'])[key];
  const cleanImage = value => {
    try {
      const u = new URL(String(value || '').trim());
      return u.protocol === 'https:' && !u.username && !u.password && String(value).length <= 2048 ? u.href : '';
    } catch (_) { return ''; }
  };
  function profileImage(value, alt, className) {
    const img = document.createElement('img');
    img.className = className; img.alt = alt || '';
    img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
    const url = cleanImage(value);
    if (url) img.src = url; else img.hidden = true;
    return img;
  }
  async function ownProfile() {
    try {
      const p = await window.beBackend?.profiles?.get(myId(),{force:true});
      if (p && typeof p === 'object') return {
        name:String(p.displayName || p.display_name || myName()).slice(0,64),
        username:String(p.username || '').slice(0,42),
        avatar:cleanImage(p.avatarUrl || p.avatar_url),
        banner:cleanImage(p.bannerUrl || p.banner_url)
      };
    } catch (_) {}
    return {name:myName(),username:String(authUser()?.username||''),avatar:'',banner:''};
  }
  const client = () => window.beBackend?.client;
  const authUser = () => window.beBackend?.auth?.currentUser;
  const myId = () => String(authUser()?.uid || authUser()?.id || '');
  const myName = () => String(authUser()?.username || authUser()?.displayName || 'Fã').slice(0,36);
  const token = window.crypto?.randomUUID?.() || '';
  let channel = null, room = '', videoId = '', isHost = false, joined = false, connecting = false;
  let hostId = '', state = null, lastPublish = 0, lastSyncSeq = -1, sequence = 0, syncTimer = 0;
  let pendingInvites = [], inboxChannel = null, inboxUser = '', pollTimer = 0, searchTimer = 0, lastInboxAt = 0;
  let lastInviteClickAt = 0, joinTimer = 0, notifiedIds = new Set(), panelOpened = false;
  let playbackStarted = false, startAt = 0, invitePicker = null, fanSearchSerial = 0;
  const svgIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 19v-2a6 6 0 0 1 12 0v2M17 9h5M19.5 6.5v5M17 15a4 4 0 0 1 4 4"/></svg>';

  function currentVideo() {
    const play = $('contentDetailPlay');
    return play && document.body.classList.contains('detail-page-active') && play.dataset.mediaPlayerTrigger === 'true' && VIDEO_RE.test(String(play.dataset.itemId || ''))
      ? {id:play.dataset.itemId, title:String(play.dataset.title || 'Vídeo').slice(0,180)} : null;
  }
  function activePlayer() {
    for (const [overlayId, shellId] of [['driveVideoPlayerOverlay','driveVideoPlayerShell'],['externalNativePlayerOverlay','externalNativePlayerShell']]) {
      const overlay = $(overlayId);
      if (overlay && !overlay.hidden && overlay.getAttribute('aria-hidden') !== 'true') return $(shellId);
    }
    return null;
  }
  function nativeVideo() {
    const overlay = $('driveVideoPlayerOverlay');
    return overlay && !overlay.hidden && !overlay.classList.contains('is-frame-mode') ? $('driveVideoPlayerVideo') : null;
  }
  function textStatus(value, error = false) {
    const status = $('watchPartyStatus');
    if (status) { status.textContent = String(value || ''); status.classList.toggle('is-error',error); }
  }
  function btn(label, className) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = className || ''; b.textContent = label; return b;
  }
  function safeInitial(value) { return String(value || '?').trim().slice(0,1).toUpperCase(); }
  function showPanel() {
    ensurePlacement();
    const panel = $('watchPartyPanel');
    if (panel) { panel.hidden = false; panelOpened = true; }
    updateUi();
  }
  function hidePanel() { if ($('watchPartyPanel')) $('watchPartyPanel').hidden = true; panelOpened = false; updateUi(); }
  function ensurePlacement() {
    const panel = $('watchPartyPanel'), shell = activePlayer();
    if (panel && panel.parentElement !== (shell || document.body)) (shell || document.body).appendChild(panel);
  }
  function participants() {
    if (!channel || !joined) return [];
    const presences = Object.values(channel.presenceState() || {}).flat();
    const unique = new Map();
    for (const p of presences) if (p && p.id) unique.set(String(p.id),p);
    return Array.from(unique.values()).slice(0,24);
  }
  function updateUi() {
    const people = participants();
    const count = $('watchPartyCount'), users = $('watchPartyUsers'), invite = $('watchPartyInviteToggle');
    const leave = $('watchPartyLeave'), make = $('watchPartyCreate');
    if (count) { count.textContent = people.length ? String(people.length) : ''; count.hidden = people.length === 0; }
    if (users) {
      users.replaceChildren();
      for (const p of people.slice(0,7)) {
        const tag = document.createElement('span');
        tag.className = 'watch-party-avatar'; tag.title = String(p.name || '') + (p.username ? ' · @'+p.username : '');
        tag.textContent = safeInitial(p.name);
        const img = profileImage(p.avatar, p.name, 'watch-party-avatar-image');
        if (!img.hidden) {tag.textContent='';tag.appendChild(img);}
        users.appendChild(tag);
      }
    }
    const owner = people.find(p=>p.isHost) || (isHost && joined ? people.find(p=>p.id===myId()) : null);
    const hostCard = $('watchPartyHostCard');
    if (hostCard) hostCard.hidden = !joined || !owner || !cleanImage(owner.avatar);
    const cover = $('watchPartyBanner'), name = $('watchPartyHostName'), avatar = $('watchPartyHostAvatar');
    if (cover) {
      const url = cleanImage(owner?.banner);
      if (url && cover.getAttribute('src') !== url) {cover.src=url;cover.hidden=false;}
      if (!url){cover.hidden=true;cover.removeAttribute('src');}
    }
    if (name) name.textContent=owner?.name || '';
    if (avatar) {
      const url=cleanImage(owner?.avatar);
      avatar.replaceChildren();
      if(url)avatar.appendChild(profileImage(url,owner?.name,'watch-party-host-photo'));
      else avatar.textContent=owner ? safeInitial(owner.name) : '';
    }
    if (invite) { invite.hidden = !joined || !isHost; invite.textContent = t(1); }
    if (leave) { leave.hidden = !joined; leave.textContent = t(3); }
    if (make) { make.hidden = joined || connecting; make.textContent = t(4); }
    if ($('watchPartyTitle')) $('watchPartyTitle').textContent = t(14);
    if ($('watchPartyPeopleLabel')) $('watchPartyPeopleLabel').textContent = joined ? xt('members') : '';
    if ($('watchPartyHostLabel')) $('watchPartyHostLabel').textContent = xt('host');
    if ($('watchPartyGiftOpen')) $('watchPartyGiftOpen').hidden = true;
    if ($('watchPartyRoomCode')) $('watchPartyRoomCode').textContent = joined && isHost ? room : '';
    if ($('watchPartyJoinButton')) $('watchPartyJoinButton').textContent = extraText('join');
    if ($('watchPartyCopyCode')) $('watchPartyCopyCode').textContent = extraText('copy');
    if ($('watchPartyCodeLabel')) $('watchPartyCodeLabel').textContent = extraText('code');
    if ($('watchPartyCodeHint')) $('watchPartyCodeHint').textContent = extraText('codeHint');
    if ($('watchPartyCodeInput')) $('watchPartyCodeInput').placeholder = extraText('code');
    if ($('watchPartyRoomCodeBox')) $('watchPartyRoomCodeBox').hidden = !joined || !isHost;
    if ($('watchPartyJoinBox')) $('watchPartyJoinBox').hidden = joined || connecting;
    for (const button of document.querySelectorAll('.watch-party-player-button')) {
      button.classList.toggle('is-active',joined);
      button.setAttribute('aria-pressed',String(joined));
      button.title = t(0);
      const n = button.querySelector('.watch-party-player-count');
      if (n) n.textContent = ''; // participant avatars are not repeated in the video toolbar
    }
    const detail = $('contentDetailWatchParty');
    if (detail) { detail.classList.toggle('is-active',joined);detail.setAttribute('aria-expanded',String(panelOpened)); }
  }
  function send(event,payload) {
    if (joined && channel) channel.send({type:'broadcast',event,payload}).catch(()=>{});
  }
  function openPlayerAfterHostStart() {
    if (!joined || isHost || !videoId || currentVideo()?.id!==videoId) return;
    playbackStarted=true;
    if (activePlayer()) return;
    const play=$('contentDetailPlay');
    if (play?.dataset.itemId===videoId) {
      // External media may still require a tap if the browser disallows
      // autoplay without a gesture; the shared route/player are preserved.
      play.click();
      hidePanel();
    }
  }
  function beginPlaybackByHost() {
    if (!joined || !isHost || currentVideo()?.id!==videoId) return;
    playbackStarted=true;startAt=Date.now();
    send('start-playback',{host:myId(),room,video:videoId,at:startAt});
    hidePanel();
  }
  async function joinByCode() {
    const input=$('watchPartyCodeInput'),value=String(input?.value||'').trim().toLowerCase();
    if (!ROOM_RE.test(value)) {textStatus(extraText('invalidCode'),true);return;}
    if (!client() || !myId()){textStatus(t(5),true);return;}
    const {data,error}=await client().from('watch_party_invites')
      .select('room_id,video_id').eq('room_id',value).eq('invitee_id',myId())
      .eq('status','accepted').gt('expires_at',new Date().toISOString()).limit(1);
    const entry=Array.isArray(data)?data[0]:null;
    if(error||!entry||!VIDEO_RE.test(String(entry.video_id||''))){
      textStatus(extraText('mustAccept'),true);return;
    }
    if(currentVideo()?.id===entry.video_id){connect(value,false,entry.video_id);return;}
    const pathname=typeof window.BETVLocaleURL==='function'
      ?window.BETVLocaleURL('/'+encodeURIComponent(entry.video_id))
      :'/'+encodeURIComponent(entry.video_id);
    const url=new URL(pathname,location.origin);
    url.searchParams.set('watchParty',value);url.searchParams.set('watchVideo',entry.video_id);
    location.assign(url.href);
  }
  const additional={
    'pt-br':{invalidCode:'Informe um código de sala válido.',mustAccept:'Aceite primeiro o convite nas notificações.',join:'Entrar com código',code:'Código da sala',codeHint:'O código funciona somente para fãs que aceitaram o convite.',copy:'Copiar código',copied:'Código copiado.',inviteTitle:'Convidar fã',inviteSubtitle:'Encontre um perfil e envie um convite para assistir juntos.',sent:'Convite enviado',lookup:'Pesquise pelo @usuário',startHint:'A sala está pronta. Clique em Assistir para iniciar com seus convidados.',connected:'Você entrou na sala. Aguarde o anfitrião iniciar o vídeo.'},
    'en-us':{invalidCode:'Enter a valid room code.',mustAccept:'Accept your invitation in notifications first.',join:'Join with code',code:'Room code',codeHint:'Codes work only for fans who accepted an invitation.',copy:'Copy code',copied:'Code copied.',inviteTitle:'Invite a fan',inviteSubtitle:'Find a profile and invite them to watch together.',sent:'Invitation sent',lookup:'Search by @username',startHint:'Room ready. Press Play to start with your guests.',connected:'You joined the room. Wait for the host to start the video.'},
    es:{invalidCode:'Introduce un código de sala válido.',mustAccept:'Primero acepta la invitación en notificaciones.',join:'Entrar con código',code:'Código de sala',codeHint:'Solo funciona si aceptaste una invitación.',copy:'Copiar código',copied:'Código copiado.',inviteTitle:'Invitar a un fan',inviteSubtitle:'Encuentra un perfil e invítalo a ver juntos.',sent:'Invitación enviada',lookup:'Buscar por @usuario',startHint:'Sala lista. Pulsa Reproducir para comenzar.',connected:'Estás en la sala. Espera a que inicie el anfitrión.'},
    fr:{invalidCode:'Saisissez un code de salon valide.',mustAccept:'Acceptez votre invitation dans les notifications.',join:'Rejoindre avec un code',code:'Code du salon',codeHint:'Réservé aux fans ayant accepté une invitation.',copy:'Copier le code',copied:'Code copié.',inviteTitle:'Inviter un fan',inviteSubtitle:'Trouvez un profil et invitez-le à regarder ensemble.',sent:'Invitation envoyée',lookup:'Chercher par @pseudo',startHint:'Salon prêt. Appuyez sur Lecture pour commencer.',connected:'Vous avez rejoint le salon. Attendez le lancement de l’hôte.'},
    it:{invalidCode:'Inserisci un codice stanza valido.',mustAccept:'Accetta prima l’invito dalle notifiche.',join:'Entra con codice',code:'Codice stanza',codeHint:'Valido solo per fan che hanno accettato un invito.',copy:'Copia codice',copied:'Codice copiato.',inviteTitle:'Invita un fan',inviteSubtitle:'Trova un profilo e invitalo a guardare insieme.',sent:'Invito inviato',lookup:'Cerca per @utente',startHint:'Stanza pronta. Premi Riproduci per iniziare.',connected:'Sei nella stanza. Attendi che l’host avvii il video.'}
  };
  const extraText=key=>(additional[String(window.BETVLocale?.slug||'pt-br').toLowerCase()]||additional['pt-br'])[key];
  function publish(force = false) {
    if (!isHost || !joined || !channel) return;
    if (!force && Date.now()-lastPublish < 700) return;
    const v = nativeVideo();
    const external = !v ? window.BETVExternalPlayerSync?.read?.() : null;
    if (!v && !external) { if(playbackStarted && activePlayer())textStatus(t(11),true); return; }
    lastPublish = Date.now();
    const snapshot = {host:myId(),room,video:videoId,at:Date.now(),seq:++sequence,
      provider:v ? 'html5' : external.provider,
      position:v ? Number(v.currentTime || 0) : Number(external.position || 0),
      playing:v ? (!v.paused && !v.ended) : Boolean(external.playing)};
    send('playback',snapshot);
  }
  function syncPlayback(snapshot) {
    if (isHost || !snapshot || snapshot.host !== hostId || snapshot.room !== room || snapshot.video !== videoId) return;
    if (!Number.isFinite(snapshot.seq) || snapshot.seq < lastSyncSeq) return;
    lastSyncSeq = snapshot.seq;
    state = snapshot;
    const position = Number(snapshot.position);
    if (!Number.isFinite(position) || position < 0 || position > 86400) return;
    const elapsed = snapshot.playing ? Math.max(0,Math.min(5,(Date.now()-Number(snapshot.at||Date.now()))/1000)) : 0;
    const target = position+elapsed;
    if (snapshot.provider === 'vk') {
      if (!window.BETVExternalPlayerSync?.apply?.({...snapshot,position:target})) textStatus(t(11),true);
      return;
    }
    const v = nativeVideo();
    if (snapshot.provider !== 'html5' || !v || v.readyState < 1) { textStatus(t(11),true); return; }
    const safeTarget = Math.min(Number.isFinite(v.duration) ? v.duration : 86400,target);
    if (Math.abs(v.currentTime-safeTarget)>0.65) { try { v.currentTime=safeTarget; } catch(_){} }
    if (snapshot.playing && v.paused) v.play().catch(()=>textStatus(t(13)));
    if (!snapshot.playing && !v.paused) v.pause();
  }
  async function leaveRoom(clearUrl=true) {
    const old=channel,wasHost=isHost;
    channel=null; room='';videoId='';isHost=false;joined=false;connecting=false;hostId='';state=null;lastSyncSeq=-1;playbackStarted=false;startAt=0;
    clearInterval(syncTimer);syncTimer=0;
    if (old) {
      if (wasHost) old.send({type:'broadcast',event:'room-ended',payload:{host:myId()}}).catch(()=>{});
      try {await old.untrack();}catch(_){}
      try {await client()?.removeChannel(old);}catch(_){}
    }
    if (clearUrl) {
      const url = new URL(location.href);
      url.searchParams.delete('watchParty');url.searchParams.delete('watchVideo');
      history.replaceState(history.state,'',url.pathname+url.search+url.hash);
    }
    closeInvitePicker();
    textStatus(''); updateUi();
  }
  async function connect(id,asHost,expectedId='') {
    if (connecting || joined || !ROOM_RE.test(id) || !token) return;
    const video=currentVideo();
    if (!video || (expectedId && video.id !== expectedId)) return;
    try {await Promise.resolve(window.beBackend?.ready);}catch(_){}
    if (!client() || !myId()) {showPanel();textStatus(t(5),true);return;}
    // Invitations are individual. A guest must have explicitly accepted this
    // room's invitation before their browser may subscribe to its presence.
    if (!asHost) {
      const permission=await client().from('watch_party_invites').select('id')
        .eq('room_id',id).eq('invitee_id',myId()).eq('status','accepted').limit(1);
      if (permission.error || !Array.isArray(permission.data) || !permission.data.length) {
        showPanel();textStatus(t(18),true);return;
      }
    }
    connecting=true;room=id;videoId=video.id;isHost=asHost;hostId=asHost?myId():'';
    playbackStarted=Boolean(activePlayer());
    showPanel();textStatus(asHost?t(6):t(10));
    try {
      const ch=client().channel('betv-party:'+id,{config:{presence:{key:token},broadcast:{self:false,ack:false}}});
      channel=ch;
      ch.on('presence',{event:'sync'},()=>{
        const people=participants();
        const host=people.find(p=>p.isHost===true);
        if (host) hostId=String(host.id);
        updateUi();
        if (!isHost && host) send('sync-request',{from:myId()});
      });
      ch.on('broadcast',{event:'playback'},({payload})=>{
        if (!isHost && payload && (payload.host===hostId)) syncPlayback(payload);
      });
      ch.on('broadcast',{event:'sync-request'},()=>{if(isHost){if(playbackStarted)send('start-playback',{host:myId(),room,video:videoId});publish(true);}});
      ch.on('broadcast',{event:'start-playback'},({payload})=>{
        if(!isHost && payload?.host===hostId && payload.room===room && payload.video===videoId) openPlayerAfterHostStart();
      });
      ch.on('broadcast',{event:'room-ended'},({payload})=>{if(!isHost && payload?.host===hostId){leaveRoom();hidePanel();}});
      ch.subscribe(async(status)=>{
        if (ch!==channel)return;
        if (status==='SUBSCRIBED') {
          joined=true;connecting=false;
          const url=new URL(location.href);
          url.searchParams.set('watchParty',room);url.searchParams.set('watchVideo',videoId);
          history.replaceState(history.state,'',url.pathname+url.search+url.hash);
          try {const p=await ownProfile();await ch.track({id:myId(),name:p.name,username:p.username,avatar:p.avatar,banner:p.banner,isHost,token});}catch(_){}
          textStatus(isHost?extraText('startHint'):extraText('connected'));updateUi();
          syncTimer=setInterval(()=>{if(isHost)publish();else if(state)syncPlayback(state);},1050);
          if(isHost){if(playbackStarted)publish(true);}else send('sync-request',{from:myId()});
          // Creating or accepting a room NEVER starts the video. Only the host
          // pressing the actual Play button sends the start signal.
        } else if (status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED') {
          connecting=false;joined=false;textStatus(t(23),true);updateUi();
        }
      });
    }catch(_){connecting=false;textStatus(t(23),true);updateUi();}
  }
  function inviteRow(invite) {
    const row=document.createElement('div');row.className='watch-party-notification';
    row.dataset.invite=invite.id;
    const cover=profileImage(invite.host_banner_url,'','watch-party-notification-banner');
    if (!cover.hidden) row.appendChild(cover);
    const identity=document.createElement('div');identity.className='watch-party-notification-identity';
    const avatar=document.createElement('span');avatar.className='watch-party-notification-avatar';
    avatar.textContent=safeInitial(invite.host_label);
    const image=profileImage(invite.host_avatar_url,invite.host_label,'watch-party-notification-photo');
    if(!image.hidden){avatar.textContent='';avatar.appendChild(image);}
    const copy=document.createElement('div');copy.className='watch-party-invite-copy';
    const title=document.createElement('strong');title.textContent=String(invite.host_label||'Fã');
    const username=document.createElement('small');username.textContent=invite.host_username?'@'+invite.host_username:xt('invite');
    const summary=document.createElement('span');
    summary.textContent=t(15)+' '+String(invite.video_title||'Vídeo');
    copy.append(title,username,summary);identity.append(avatar,copy);row.append(identity);
    const actions=document.createElement('div');actions.className='watch-party-invite-actions';
    const accept=btn(t(16),'watch-party-accept');
    const decline=btn(t(17),'watch-party-decline');
    accept.addEventListener('click',e=>{e.stopPropagation();respond(invite,true,actions);});
    decline.addEventListener('click',e=>{e.stopPropagation();respond(invite,false,actions);});
    actions.append(accept,decline);row.append(actions);return row;
  }
  function renderInbox() {
    const invites=pendingInvites.filter(x=>x.status==='pending' && new Date(x.expires_at).getTime()>Date.now());
    for (const listId of ['notificationPreviewList','mobileNotificationPreviewList']) {
      const list=$(listId);
      if (!list) continue;
      for (const card of list.querySelectorAll('.watch-party-notification')) card.remove();
      for (const invite of invites.slice(0,3).reverse()) list.prepend(inviteRow(invite));
    }
    for (const dotId of ['notificationUnreadDot','mobileNotificationUnreadDot']) {
      const dot=$(dotId);
      if (dot && invites.length) dot.hidden=false;
    }
    const toast=$('watchPartyInviteToast');
    if (toast) {
      toast.replaceChildren();
      if (invites.length) {toast.append(inviteRow(invites[0]));toast.hidden=false;}
      else toast.hidden=true;
    }
  }
  async function respond(invite,accept,actions) {
    if (!client() || !myId()) return;
    for (const b of actions.querySelectorAll('button'))b.disabled=true;
    const {data,error}=await client().rpc('respond_watch_party_invite',{p_invite_id:invite.id,p_accept:accept});
    if (error) {textStatus(t(18),true);for(const b of actions.querySelectorAll('button'))b.disabled=false;return;}
    pendingInvites=pendingInvites.filter(i=>i.id!==invite.id);renderInbox();
    if (accept) {
      const result=Array.isArray(data)?data[0]:data;
      if (!result || !ROOM_RE.test(result.room_id) || !VIDEO_RE.test(String(result.video_id||'')))return;
      const target=typeof window.BETVLocaleURL==='function'
        ?window.BETVLocaleURL('/'+encodeURIComponent(result.video_id))
        :'/'+encodeURIComponent(result.video_id);
      const url=new URL(target,location.origin);
      url.searchParams.set('watchParty',result.room_id);
      url.searchParams.set('watchVideo',result.video_id);
      location.assign(url.href);
    }
  }
  async function pollInbox(force=false) {
    if (!client()||!myId()) {pendingInvites=[];renderInbox();return;}
    if (!force && Date.now()-lastInboxAt<10000) return;
    lastInboxAt=Date.now();
    try {
      const {data,error}=await client().from('watch_party_invites')
        .select('id,room_id,host_label,host_username,host_avatar_url,host_banner_url,video_id,video_title,created_at,expires_at,status')
        .eq('invitee_id',myId()).eq('status','pending')
        .gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(8);
      if (error) return;
      const received=Array.isArray(data)?data:[];
      const newOne=received.find(x=>!notifiedIds.has(x.id));
      pendingInvites=received;
      received.forEach(x=>notifiedIds.add(x.id));
      renderInbox();
      if(newOne) window.dispatchEvent(new CustomEvent('be:watch-party-invitation',{detail:{id:newOne.id}}));
    } catch(_){}
  }
  function subscribeInbox() {
    const id=myId();
    if (id===inboxUser)return;
    const old=inboxChannel;
    inboxChannel=null;inboxUser=id;lastInboxAt=0;notifiedIds.clear();
    if(old)client()?.removeChannel(old).catch(()=>{});
    if(!id || !client()) {pendingInvites=[];renderInbox();return;}
    pollInbox(true);
    const ch=client().channel('betv-party-inbox:'+id);
    inboxChannel=ch;
    ch.on('postgres_changes',{event:'*',schema:'public',table:'watch_party_invites',filter:'invitee_id=eq.'+id},()=>pollInbox(true));
    ch.subscribe();
  }
  function createInvitePicker() {
    if(invitePicker)return invitePicker;
    invitePicker=document.createElement('div');
    invitePicker.id='watchPartyInvitePicker';invitePicker.className='watch-party-invite-picker';invitePicker.hidden=true;
    invitePicker.innerHTML='<div class="watch-party-picker-backdrop"></div>'+
      '<section class="watch-party-picker-dialog" role="dialog" aria-modal="true" aria-labelledby="watchPartyPickerTitle">'+
      '<div class="watch-party-ios-handle"></div><header class="watch-party-picker-header">'+
      '<div><strong id="watchPartyPickerTitle"></strong><p id="watchPartyPickerSubtitle"></p></div>'+
      '<button type="button" id="watchPartyPickerClose" aria-label="Close">×</button></header>'+
      '<div class="watch-party-picker-search"><input id="watchPartyInviteSearch" type="search" autocomplete="off" maxlength="30" spellcheck="false"></div>'+
      '<div class="watch-party-picker-results" id="watchPartySearchResults"></div>'+
      '<p class="watch-party-picker-status" id="watchPartyPickerStatus" role="status"></p></section>';
    document.body.append(invitePicker);
    invitePicker.querySelector('.watch-party-picker-backdrop').addEventListener('click',closeInvitePicker);
    $('watchPartyPickerClose').addEventListener('click',closeInvitePicker);
    $('watchPartyInviteSearch').addEventListener('input',()=>{
      clearTimeout(searchTimer);searchTimer=setTimeout(findFans,240);
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!invitePicker.hidden){event.preventDefault();event.stopImmediatePropagation();closeInvitePicker();}},true);
    return invitePicker;
  }
  function closeInvitePicker(){if(invitePicker)invitePicker.hidden=true;}
  function renderInviteLabels() {
    if(!invitePicker)return;
    $('watchPartyPickerTitle').textContent=extraText('inviteTitle');
    $('watchPartyPickerSubtitle').textContent=extraText('inviteSubtitle');
    $('watchPartyInviteSearch').placeholder=extraText('lookup');
    $('watchPartyPickerClose').setAttribute('aria-label',t(22));
  }
  function openInvitePicker(){
    if(!joined || !isHost)return;
    createInvitePicker();renderInviteLabels();
    invitePicker.hidden=false;
    $('watchPartyInviteSearch').value='';
    $('watchPartySearchResults').textContent=extraText('lookup');
    $('watchPartyPickerStatus').textContent='';
    $('watchPartyInviteSearch').focus();
  }
  async function publicFanProfile(username,avatar) {
    try {
      const {data,error}=await client().rpc('get_public_profile',{p_username:username});
      if(!error){
        const p=Array.isArray(data)?data[0]:data;
        if(p)return {username:p.username||username,name:p.display_name||username,avatar:p.avatar_url||avatar,banner:p.banner_url||''};
      }
    }catch(_){}
    return {username,name:username,avatar,banner:''};
  }
  function fanPickerCard(fan){
    const card=document.createElement('div');card.className='watch-party-picker-fan';
    const cover=document.createElement('div');cover.className='watch-party-picker-cover';
    const background=profileImage(fan.banner,'','watch-party-picker-banner');
    if(!background.hidden)cover.append(background);
    const row=document.createElement('div');row.className='watch-party-picker-fan-row';
    const avatar=document.createElement('span');avatar.className='watch-party-picker-avatar';
    const img=profileImage(fan.avatar,fan.name,'watch-party-picker-photo');
    if(!img.hidden)avatar.append(img);else avatar.textContent=safeInitial(fan.name);
    const names=document.createElement('div');names.className='watch-party-picker-names';
    const full=document.createElement('strong');full.textContent=String(fan.name||fan.username);
    const user=document.createElement('small');user.textContent='@'+fan.username;
    names.append(full,user);row.append(avatar,names);
    const action=btn(t(1),'watch-party-picker-send');
    action.addEventListener('click',()=>sendInvite(fan.username,action));
    row.append(action);card.append(cover,row);return card;
  }
  async function findFans() {
    const input=$('watchPartyInviteSearch'),results=$('watchPartySearchResults');
    if(!input||!results||!client())return;
    const serial=++fanSearchSerial,query=input.value.trim().replace(/^@+/,'').slice(0,30);
    results.replaceChildren();
    if(query.length<2){results.textContent=extraText('lookup');return;}
    const {data,error}=await client().rpc('search_public_profiles',{p_query:query,p_limit:8});
    if(serial!==fanSearchSerial||invitePicker?.hidden)return;
    if(error){results.textContent=t(8);return;}
    const found=(Array.isArray(data)?data:[]).filter(x=>String(x.username||'').toLowerCase()!==String(authUser()?.username||'').toLowerCase());
    if(!found.length){results.textContent=t(19);return;}
    const rich=await Promise.all(found.map(f=>publicFanProfile(f.username,f.avatar_url)));
    if(serial!==fanSearchSerial||invitePicker?.hidden)return;
    for(const fan of rich)results.append(fanPickerCard(fan));
  }
  async function sendInvite(username,button) {
    if(!isHost||!joined||Date.now()-lastInviteClickAt<600||!client())return;
    lastInviteClickAt=Date.now();button.disabled=true;
    const video=currentVideo();
    const {error}=await client().rpc('send_watch_party_invite',{
      p_username:username,p_room_id:room,p_video_id:videoId,p_video_title:video?.title||'Vídeo'
    });
    if(error){
      $('watchPartyPickerStatus').textContent=t(8);
      button.disabled=false;return;
    }
    button.textContent=extraText('sent');
    $('watchPartyPickerStatus').textContent=t(7);
    textStatus(t(7));
  }
  function tryJoinFromUrl() {
    if (joined||connecting)return;
    const url=new URL(location.href),id=url.searchParams.get('watchParty'),expected=url.searchParams.get('watchVideo');
    if (!id || !ROOM_RE.test(id) || !VIDEO_RE.test(String(expected||'')))return;
    if(currentVideo()?.id===expected)connect(id,false,expected);
  }
  function setupPlayerButtons() {
    const entries=[
      {parent:$('externalNativePlayerToolbar'),className:'external-native-player-action'},
      {parent:$('driveVideoPlayerActionbar')?.querySelector('.drive-video-player-actions-right'),className:'drive-video-player-action'}
    ];
    for(const item of entries){
      if(!item.parent || item.parent.querySelector('.watch-party-player-button'))continue;
      const button=btn('','watch-party-player-button '+item.className);
      button.innerHTML=svgIcon+'<span class="watch-party-player-count"></span>';
      button.setAttribute('aria-label',t(0));button.setAttribute('aria-pressed','false');
      const close=item.parent.querySelector('[id$="Close"]');
      if(close)item.parent.insertBefore(button,close);else item.parent.append(button);
      button.addEventListener('click',()=>onPartyClick());
    }
    ensurePlacement();updateUi();
  }
  function onPartyClick() {
    if(!$('watchPartyPanel'))return;
    if(!$('watchPartyPanel').hidden){hidePanel();return;}
    showPanel();
  }
  function createPanel() {
    const panel=document.createElement('aside');
    panel.id='watchPartyPanel';panel.className='watch-party-panel';panel.hidden=true;
    panel.setAttribute('aria-label','Watch Party');
    panel.innerHTML='<div class="watch-party-heading"><div class="watch-party-headlines"><strong id="watchPartyTitle">Watch Party</strong><span id="watchPartyPeopleLabel"></span></div>'+
      '<button id="watchPartyClose" type="button" aria-label="Close" class="watch-party-close">×</button></div>'+
      '<div class="watch-party-host" id="watchPartyHostCard" hidden><div class="watch-party-host-cover"><img id="watchPartyBanner" alt="" hidden></div>'+
      '<div class="watch-party-host-identity"><span id="watchPartyHostAvatar" class="watch-party-host-avatar"></span><div class="watch-party-host-text"><small id="watchPartyHostLabel"></small><strong id="watchPartyHostName"></strong></div></div></div>'+

      '<p class="watch-party-status" id="watchPartyStatus" aria-live="polite"></p>'+
      '<div class="watch-party-actions"><button type="button" id="watchPartyCreate"></button>'+
      '<button type="button" id="watchPartyInviteToggle" hidden></button>'+
      '<button type="button" id="watchPartyLeave" hidden></button></div>'+
      '<div id="watchPartyJoinBox" class="watch-party-code-entry"><input id="watchPartyCodeInput" type="text" autocomplete="off" maxlength="36" aria-label="Room code"><button id="watchPartyJoinButton" type="button"></button><small id="watchPartyCodeHint"></small></div>'+
      '<div id="watchPartyRoomCodeBox" class="watch-party-room-code" hidden><small id="watchPartyCodeLabel"></small><code id="watchPartyRoomCode"></code><button type="button" id="watchPartyCopyCode"></button></div>';
    document.body.append(panel);
    const toast=document.createElement('div');toast.id='watchPartyInviteToast';toast.className='watch-party-invite-toast';toast.hidden=true;
    toast.setAttribute('role','region');toast.setAttribute('aria-label','Watch Party');document.body.append(toast);
    $('watchPartyClose').addEventListener('click',hidePanel);
    $('watchPartyJoinButton').addEventListener('click',joinByCode);
    $('watchPartyCodeInput').addEventListener('keydown',event=>{if(event.key==='Enter')joinByCode();});
    $('watchPartyCopyCode').addEventListener('click',async()=>{
      if(!joined || !isHost || !room)return;
      try{await navigator.clipboard.writeText(room);textStatus(extraText('copied'));}
      catch(_){textStatus(extraText('code')+': '+room);}
    });
    $('watchPartyCreate').addEventListener('click',()=>{
      const id=window.crypto?.randomUUID?.();
      if(!id){textStatus(t(23),true);return;}
      connect(id,true);
    });
    $('watchPartyInviteToggle').addEventListener('click',openInvitePicker);
    $('watchPartyLeave').addEventListener('click',async()=>{await leaveRoom();hidePanel();});
    const detail=$('contentDetailWatchParty');
    detail?.addEventListener('click',e=>{e.preventDefault();onPartyClick();});
    // The player overlays are dynamically added when a video starts.
    let watchTimer=0;
    const observer=new MutationObserver(()=>{
      if(watchTimer)return;
      watchTimer=setTimeout(()=>{watchTimer=0;setupPlayerButtons();tryJoinFromUrl();},80);
    });
    observer.observe(document.body,{childList:true,subtree:false});
    document.addEventListener('play',e=>{if(e.target?.id==='driveVideoPlayerVideo')publish(true);},true);
    document.addEventListener('pause',e=>{if(e.target?.id==='driveVideoPlayerVideo')publish(true);},true);
    document.addEventListener('seeked',e=>{if(e.target?.id==='driveVideoPlayerVideo')publish(true);},true);
    document.addEventListener('loadedmetadata',e=>{if(e.target?.id==='driveVideoPlayerVideo' && state)syncPlayback(state);},true);
    window.addEventListener('be:detail-close',()=>{if(joined)leaveRoom();hidePanel();});
    window.addEventListener('pagehide',()=>{if(channel)client()?.removeChannel(channel);if(inboxChannel)client()?.removeChannel(inboxChannel);});
    window.addEventListener('be:content-ready',tryJoinFromUrl);
    document.addEventListener('click',event=>{
      if(event.target?.closest?.('#contentDetailPlay') && isHost && joined){
        // The paid access check occurs before a host can create a room.
        beginPlaybackByHost();
      }
    },true);
    window.addEventListener('popstate',tryJoinFromUrl);
    window.addEventListener('be:i18n-ready',()=>{updateUi();renderInbox();if(invitePicker&&!invitePicker.hidden)renderInviteLabels();});
    window.addEventListener('be:notifications-ready',renderInbox);
    window.setInterval(()=>{
      tryJoinFromUrl();setupPlayerButtons();ensurePlacement();
      if(myId()!==inboxUser)subscribeInbox();
      if (joined && currentVideo()?.id && currentVideo().id!==videoId) {leaveRoom();hidePanel();}
      if(joined && !activePlayer() && !document.body.classList.contains('detail-page-active')){leaveRoom();hidePanel();}
      if(pendingInvites.length)renderInbox();
    },2400);
    pollTimer=setInterval(()=>pollInbox(),14000);
    if(window.beBackend?.auth?.onChange)window.beBackend.auth.onChange(()=>subscribeInbox());
    Promise.resolve(window.beBackend?.ready).then(()=>subscribeInbox()).catch(()=>{});
    setupPlayerButtons();tryJoinFromUrl();updateUi();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',createPanel,{once:true});
  else createPanel();
  window.BETVWatchParty=Object.freeze({open:showPanel});
})();
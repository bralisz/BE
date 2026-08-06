/* Página pública Apoie uma ONG. */
;(function(){
  'use strict';
  if(String(location.hash||'').startsWith('#/admin'))return;

  var page=document.getElementById('donatePage');
  var hero=document.getElementById('donateHero');
  var list=document.getElementById('donateNgoList');
  var status=document.getElementById('donatePageStatus');
  if(!page||!hero||!list||!status)return;

  var loaded=false;
  var loading=null;
  var notificationItems=[];
  var notificationLoaded=false;
  var notificationLoading=null;
  var NOTIFICATION_STORAGE_KEY='beNotificationsLastSeen';

  var home=document.getElementById('donatePageHome');
  var notificationButton=document.getElementById('donatePageNotifications');
  var notificationWrap=notificationButton&&notificationButton.closest('.donate-notification-wrap');
  var notificationPopup=document.getElementById('donateNotificationDropdown');
  var notificationPreviewList=document.getElementById('donateNotificationPreviewList');
  var notificationMarkAll=document.getElementById('donateNotificationMarkAll');
  var notificationClose=document.getElementById('donateNotificationClose');
  var notificationViewAll=document.getElementById('donateNotificationViewAll');
  var avatar=document.getElementById('donatePageAvatar');

  function cleanPath(){try{return decodeURIComponent(String(location.pathname||'/')).replace(/\/+$/,'')||'/';}catch(_){return String(location.pathname||'/').replace(/\/+$/,'')||'/';}}
  function isRoute(){var path=cleanPath().toLowerCase(),hash=String(location.hash||'').toLowerCase();return path==='/ong'||hash==='#ong'||hash==='#/ong';}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}
  function supportUrl(value){try{var url=new URL(String(value||'').trim(),location.origin);return url.protocol==='https:'?url.href:'';}catch(_){return '';}}
  function imageUrl(value){var raw=String(value||'').trim();if(!raw)return '';var resolved=typeof window.beMediaUrl==='function'?window.beMediaUrl(raw):raw;return resolved&&resolved!=='#'?resolved:'';}
  function active(item){return item&&item.active!==false&&String(item.active).toLowerCase()!=='false';}

  function applyPageBanner(settings){
    var banner=imageUrl(settings&&settings.bannerUrl||'');
    if(!banner){hero.classList.remove('has-banner');hero.style.removeProperty('--donate-hero-banner');return;}
    var safe=banner.replace(/["\n\r]/g,'');
    hero.style.setProperty('--donate-hero-banner','url("'+safe+'")');
    hero.classList.add('has-banner');
  }

  function syncAvatar(){
    var source=document.getElementById('publicUserPhoto');
    var image=document.getElementById('donatePageAvatarImage');
    var fallback=document.getElementById('donatePageAvatarFallback');
    if(!image||!fallback)return;
    var src=source&&!source.hidden?String(source.currentSrc||source.src||'').trim():'';
    if(src){image.src=src;image.hidden=false;fallback.hidden=true;}
    else{image.removeAttribute('src');image.hidden=true;fallback.hidden=false;}
  }

  function syncUnread(){
    var source=document.getElementById('notificationUnreadDot');
    var dot=document.getElementById('donatePageUnreadDot');
    if(dot)dot.hidden=!source||source.hidden;
  }

  function render(items){
    var records=(Array.isArray(items)?items:[]).filter(active).sort(function(a,b){return (Number(a.order)||0)-(Number(b.order)||0);});
    if(!records.length){list.innerHTML='';status.hidden=false;status.textContent='Nenhuma ONG foi publicada ainda.';return;}
    status.hidden=true;
    list.innerHTML=records.map(function(item,index){
      var title=String(item.title||item.name||'ONG').trim();
      var description=String(item.description||'Conheça a atuação desta organização e escolha apoiar esta causa.').trim();
      var image=imageUrl(item.imageUrl||item.bannerUrl||item.thumbnailUrl||'');
      var href=supportUrl(item.contentUrl||item.link||'');
      var id='donate-ngo-'+String(item.id||index).replace(/[^a-z0-9_-]/gi,'-');
      return '<article class="donate-ngo-card" data-ngo-card>'+ 
        '<button class="donate-ngo-toggle" type="button" aria-expanded="false" aria-controls="'+esc(id)+'" aria-label="Conhecer '+esc(title)+'" data-ngo-title="'+esc(title)+'">'+
          (image?'<img loading="lazy" decoding="async" src="'+esc(image)+'" alt="Banner da '+esc(title)+'">':'<span class="donate-ngo-placeholder" aria-hidden="true">'+esc(title.slice(0,2).toUpperCase())+'</span>')+
        '</button>'+ 
        '<div class="donate-ngo-details" id="'+esc(id)+'"><div class="donate-ngo-details-inner"><div class="donate-ngo-details-content"><h3>'+esc(title)+'</h3><div class="donate-ngo-description">'+esc(description)+'</div>'+ 
          (href?'<a class="donate-ngo-support-button" href="'+esc(href)+'" target="_blank" rel="noopener noreferrer" aria-label="Apoiar '+esc(title)+'">Apoie</a>':'<span class="donate-ngo-support-button" aria-disabled="true">Link em breve</span>')+
        '</div></div></div></article>';
    }).join('');

    list.querySelectorAll('.donate-ngo-toggle img').forEach(function(image){
      image.addEventListener('error',function(){
        var button=image.closest('.donate-ngo-toggle');
        if(!button)return;
        var title=button.getAttribute('data-ngo-title')||'ONG';
        var placeholder=document.createElement('span');
        placeholder.className='donate-ngo-placeholder';
        placeholder.setAttribute('aria-hidden','true');
        placeholder.textContent=String(title).trim().slice(0,2).toUpperCase();
        image.replaceWith(placeholder);
      },{once:true});
    });

    list.querySelectorAll('[data-ngo-card]').forEach(function(card){
      var button=card.querySelector('.donate-ngo-toggle');
      button.addEventListener('click',function(){
        var opening=!card.classList.contains('is-open');
        list.querySelectorAll('[data-ngo-card].is-open').forEach(function(other){
          if(other!==card){
            other.classList.remove('is-open');
            var otherButton=other.querySelector('.donate-ngo-toggle');
            if(otherButton)otherButton.setAttribute('aria-expanded','false');
          }
        });
        card.classList.toggle('is-open',opening);
        button.setAttribute('aria-expanded',String(opening));
      });
    });
  }

  function notificationTime(item){
    var value=item&&(item.updatedAt||item.updated_at||item.createdAt||item.created_at||item.date)||'';
    var time=new Date(value).getTime();
    return Number.isFinite(time)?time:0;
  }

  function notificationPlainText(value){
    var source=String(value||'');
    if(window.beMarkdownPlainText)return window.beMarkdownPlainText(source);
    return source
      .replace(/!\[[^\]]*\]\([^)]*\)/g,' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g,'$1')
      .replace(/[*_~`>#-]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function trimNotification(value,max){
    var text=notificationPlainText(value);
    return text.length>max?text.slice(0,max-1).trim()+'…':text;
  }

  function renderNotificationPreview(){
    if(!notificationPreviewList)return;
    if(!notificationItems.length){
      notificationPreviewList.innerHTML='<div class="notification-preview-empty"><strong>Nenhuma atualização</strong></div>';
      return;
    }
    notificationPreviewList.innerHTML=notificationItems.slice(0,3).map(function(item){
      return '<button class="notification-preview-item" type="button" data-donate-notification-id="'+esc(item.id)+'">'+
        '<span class="notification-preview-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A8.5 8.5 0 0 0 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.7v4.7l3.2 1.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+ 
        '<span class="notification-preview-copy"><strong>'+esc(item.title||'Atualização')+'</strong><span>'+esc(trimNotification(item.description,100)||'Confira esta atualização.')+'</span></span>'+ 
        '<span class="notification-preview-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+ 
      '</button>';
    }).join('');
  }

  async function loadNotificationPreview(force){
    if(notificationLoaded&&!force)return notificationItems;
    if(notificationLoading)return notificationLoading;
    if(notificationPreviewList)notificationPreviewList.innerHTML='<div class="notification-preview-empty">Carregando…</div>';
    notificationLoading=(async function(){
      try{
        if(!window.beBackend)throw new Error('backend');
        await window.beBackend.ready;
        var items=await window.beBackend.data.list('notifications',{orderBy:'createdAt',direction:'desc'});
        notificationItems=(Array.isArray(items)?items:[])
          .filter(function(item){return active(item)&&String(item.title||'').trim();})
          .sort(function(a,b){return notificationTime(b)-notificationTime(a);});
        notificationLoaded=true;
        renderNotificationPreview();
      }catch(error){
        console.warn('Não foi possível carregar as notificações na página de ONGs:',error);
        notificationItems=[];
        notificationLoaded=true;
        if(notificationPreviewList)notificationPreviewList.innerHTML='<div class="notification-preview-empty"><strong>Não foi possível carregar</strong></div>';
      }finally{
        notificationLoading=null;
      }
      return notificationItems;
    })();
    return notificationLoading;
  }

  function closeNotificationPopup(){
    if(notificationPopup)notificationPopup.classList.remove('open');
    if(notificationButton)notificationButton.setAttribute('aria-expanded','false');
  }

  function toggleNotificationPopup(event){
    if(event){event.preventDefault();event.stopPropagation();}
    if(!notificationPopup||!notificationButton)return;
    var opening=!notificationPopup.classList.contains('open');
    notificationPopup.classList.toggle('open',opening);
    notificationButton.setAttribute('aria-expanded',String(opening));
    if(opening){
      window.dispatchEvent(new CustomEvent('be:close-notification-menus'));
      loadNotificationPreview(false);
    }
  }

  function markNotificationsRead(){
    try{localStorage.setItem(NOTIFICATION_STORAGE_KEY,String(Date.now()));}catch(_){ }
    var sourceDot=document.getElementById('notificationUnreadDot');
    var pageDot=document.getElementById('donatePageUnreadDot');
    if(sourceDot)sourceDot.hidden=true;
    if(pageDot)pageDot.hidden=true;
  }

  function openNotificationPage(id){
    closeNotificationPopup();
    var route='/atualizacoes'+(id?'/'+encodeURIComponent(id):'');
    if(window.BETVPublicRoutes)window.BETVPublicRoutes.go(route);
    else location.href=route;
  }

  async function load(force){
    if(loaded&&!force)return;
    if(loading)return loading;
    status.hidden=false;status.textContent='Carregando ONGs…';
    loading=(async function(){
      try{
        if(!window.beBackend)throw new Error('backend');
        await window.beBackend.ready;
        var results=await Promise.all([
          window.beBackend.data.list('ongs',{orderBy:'order',direction:'asc'}),
          window.beBackend.data.get('settings','ong').catch(function(){return null;})
        ]);
        applyPageBanner(results[1]);
        render(results[0]);
        loaded=true;
      }catch(error){
        console.warn('Não foi possível carregar as ONGs:',error);
        list.innerHTML='';
        status.hidden=false;
        status.textContent='Não foi possível carregar as ONGs agora. Tente novamente em instantes.';
      }finally{
        loading=null;
      }
    })();
    return loading;
  }

  function open(){
    document.body.classList.add('donate-page-active');
    page.hidden=false;
    page.setAttribute('aria-hidden','false');
    syncAvatar();
    syncUnread();
    load(false);
    document.title='Apoie uma ONG — Billie Eilish TV';
  }

  function close(){
    closeNotificationPopup();
    document.body.classList.remove('donate-page-active');
    page.hidden=true;
    page.setAttribute('aria-hidden','true');
    document.title='Billie Eilish TV';
  }

  if(home)home.addEventListener('click',function(){
    closeNotificationPopup();
    if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/');
    else location.href='/';
  });

  if(notificationButton)notificationButton.addEventListener('click',toggleNotificationPopup);
  if(notificationClose)notificationClose.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();closeNotificationPopup();});
  if(notificationMarkAll)notificationMarkAll.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();markNotificationsRead();});
  if(notificationViewAll)notificationViewAll.addEventListener('click',function(){openNotificationPage('');});
  if(notificationPreviewList)notificationPreviewList.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-donate-notification-id]'):null;
    if(button)openNotificationPage(button.getAttribute('data-donate-notification-id')||'');
  });
  if(notificationPopup)notificationPopup.addEventListener('click',function(event){event.stopPropagation();});

  if(avatar)avatar.addEventListener('click',function(){
    closeNotificationPopup();
    var account=window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;
    if(!account){
      if(window.BETVPublicRoutes)window.BETVPublicRoutes.go('/login');
      else location.href='/login';
      return;
    }
    close();
    window.setTimeout(function(){
      var profileAction=document.querySelector('#userDropdown [data-public-action="profile"]');
      if(profileAction){profileAction.click();return;}
      window.dispatchEvent(new CustomEvent('be:open-profile-route'));
    },0);
  });

  document.addEventListener('click',function(event){
    if(notificationPopup&&notificationPopup.classList.contains('open')&&notificationWrap&&!notificationWrap.contains(event.target))closeNotificationPopup();
  });
  document.addEventListener('keydown',function(event){if(event.key==='Escape')closeNotificationPopup();});

  var originalDot=document.getElementById('notificationUnreadDot');
  if(originalDot&&window.MutationObserver)new MutationObserver(syncUnread).observe(originalDot,{attributes:true,attributeFilter:['hidden','class']});
  var originalAvatar=document.getElementById('publicUserPhoto');
  if(originalAvatar&&window.MutationObserver)new MutationObserver(syncAvatar).observe(originalAvatar,{attributes:true,attributeFilter:['src','hidden']});

  window.addEventListener('be:open-donate-page',function(){open();});
  window.addEventListener('be:close-donate-page',function(){close();});
  window.addEventListener('be:profile-avatar-changed',syncAvatar);
  window.addEventListener('be:profile-device-synced',syncAvatar);
  window.addEventListener('be:content-ready',function(){
    notificationLoaded=false;
    if(isRoute()){
      load(true);
      if(notificationPopup&&notificationPopup.classList.contains('open'))loadNotificationPreview(true);
    }
  });
  window.addEventListener('pageshow',function(){if(isRoute())open();});
  window.addEventListener('popstate',function(){if(isRoute())open();else if(document.body.classList.contains('donate-page-active'))close();});
  window.addEventListener('hashchange',function(){if(isRoute())open();else if(document.body.classList.contains('donate-page-active'))close();});
  if(isRoute())open();
})();

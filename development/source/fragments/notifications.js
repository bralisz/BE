(function(){
  'use strict';

  if(String(location.hash||'').startsWith('#/admin'))return;

  var page=document.getElementById('notificationPage');
  var pageNav=document.getElementById('notificationPageNav');
  var pageContent=document.getElementById('notificationPageContent');
  var pageHome=document.getElementById('notificationPageHome');
  var pageAvatar=document.getElementById('notificationPageAvatar');
  var pageAvatarImage=document.getElementById('notificationPageAvatarImage');
  var pageAvatarFallback=document.getElementById('notificationPageAvatarFallback');
  var pageClose=document.getElementById('notificationPageClose');
  var desktopButton=document.getElementById('notificationButton');
  var desktopDropdown=document.getElementById('notificationDropdown');
  var desktopList=document.getElementById('notificationPreviewList');
  var desktopViewAll=document.getElementById('notificationViewAll');
  var desktopDot=document.getElementById('notificationUnreadDot');
  var desktopMarkAll=document.getElementById('notificationMarkAll');
  var desktopClose=document.getElementById('notificationDropdownClose');
  var mobilePopover=document.getElementById('mobileNotificationPopover');
  var mobileList=document.getElementById('mobileNotificationPreviewList');
  var mobileViewAll=document.getElementById('mobileNotificationViewAll');
  var mobileClose=document.getElementById('mobileNotificationClose');
  var mobileDot=document.getElementById('mobileNotificationUnreadDot');
  var mobileMarkAll=document.getElementById('mobileNotificationMarkAll');
  var notifications=[];
  var loaded=false;
  var loadingPromise=null;
  var selectedId='';
  var STORAGE_KEY='beNotificationsLastSeen';

  if(!page||!pageNav||!pageContent)return;

  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];
    });
  }

  function cleanPath(){
    try{return decodeURIComponent(String(location.pathname||'/')).replace(/\/+$/,'')||'/';}
    catch(_){return String(location.pathname||'/').replace(/\/+$/,'')||'/';}
  }

  function routeInfo(){
    var path=cleanPath();
    var pathMatch=path.match(/^\/(?:atualizacoes|notificacoes)(?:\/([^/]+))?$/i);
    var raw=String(location.hash||'').replace(/^#\/?/,'');
    var parts=raw.split('/').filter(Boolean);
    var name=String(parts[0]||'').toLowerCase();
    var aliases=['atualizacoes','atualizações','notificacoes','notificações','updates','notifications'];
    var legacy=aliases.indexOf(name)!==-1;
    return {
      active:Boolean(pathMatch)||legacy,
      id:pathMatch?decodeURIComponent(pathMatch[1]||''):decodeURIComponent(parts[1]||''),
      legacy:legacy
    };
  }

  function dateValue(item){
    var raw=item&&item.updatedAt||item&&item.createdAt||'';
    var date=raw instanceof Date?raw:new Date(raw);
    return Number.isNaN(date.getTime())?null:date;
  }

  function i18nText(source,variables){
    if(window.BETVI18n&&typeof window.BETVI18n.t==='function')return window.BETVI18n.t(source,variables||{});
    return String(source||'').replace(/\{([a-zA-Z0-9_]+)\}/g,function(_,key){
      return variables&&Object.prototype.hasOwnProperty.call(variables,key)?String(variables[key]):_;
    });
  }

  function notificationDateLocale(){
    return String(
      window.BETVI18n&&window.BETVI18n.locale||
      window.BETVLocale&&window.BETVLocale.locale||
      'pt-BR'
    );
  }

  function formatDate(item){
    var date=dateValue(item);
    if(!date)return i18nText('Atualizado agora');
    var formatted=date.toLocaleDateString(notificationDateLocale(),{day:'2-digit',month:'long',year:'numeric'});
    return i18nText('Atualizado em {date}',{date:formatted});
  }

  function formatShortDate(item){
    var date=dateValue(item);
    if(!date)return i18nText('agora');
    return date.toLocaleDateString(notificationDateLocale(),{day:'2-digit',month:'short',year:'numeric'}).replace('.','');
  }

  function compareNewest(a,b){
    var ad=dateValue(a),bd=dateValue(b);
    return (bd?bd.getTime():0)-(ad?ad.getTime():0);
  }

  function trimText(value,max){
    var text=String(value||'').replace(/\s+/g,' ').trim();
    return text.length>max?text.slice(0,max-1).trim()+'…':text;
  }

  function normalizeNotificationUrlSource(value){
    return String(value||'')
      .trim()
      .replace(/^<|>$/g,'')
      .replace(/&amp;/gi,'&')
      .replace(/\\([\\`*_{}\[\]()#+\-.!&=?])/g,'$1');
  }

  function safeNotificationImageUrl(value){
    var raw=normalizeNotificationUrlSource(value);
    if(!raw||/[\u0000-\u001f\u007f]/.test(raw))return '';
    try{
      var parsed=new URL(raw,location.origin);
      if(parsed.protocol!=='https:'&&parsed.protocol!=='http:')return '';
      if(parsed.username||parsed.password)return '';
      return parsed.href;
    }catch(_){return '';}
  }

  function isDiscordNotificationImageUrl(value){
    var safeUrl=safeNotificationImageUrl(value);
    if(!safeUrl)return false;
    try{
      var parsed=new URL(safeUrl);
      var host=String(parsed.hostname||'').toLowerCase();
      if(host!=='cdn.discordapp.com'&&host!=='media.discordapp.net')return false;
      return /\.(?:png|jpe?g)$/i.test(parsed.pathname||'');
    }catch(_){return false;}
  }

  function replaceNotificationImageMarkdown(value,onImage){
    var pattern=/(!?)\[([^\]\r\n]*)\]\(\s*(?:<([^>\r\n]+)>|([^\s)\r\n]+))\s*(?:["']([^"'\r\n]*)["'])?\s*\)/g;
    return String(value||'').replace(pattern,function(match,bang,label,angleUrl,plainUrl){
      var safeUrl=safeNotificationImageUrl(angleUrl||plainUrl||'');
      if(!safeUrl)return match;
      var isExplicitImage=bang==='!';
      var isEmptyLink=!String(label||'').trim();
      var isDiscordImage=isDiscordNotificationImageUrl(safeUrl);
      if(!isExplicitImage&&!isEmptyLink&&!isDiscordImage)return match;
      var alt=String(label||'').trim();
      if(/^https?:\/\//i.test(normalizeNotificationUrlSource(alt)))alt='';
      return onImage(safeUrl,alt);
    });
  }

  function notificationImageProxyUrl(value){
    if(!window.beMediaUrl)return '';
    var proxy=window.beMediaUrl(value);
    return proxy&&proxy!=='#'&&proxy!==value?proxy:'';
  }

  function linkifyNotificationHtml(html){
    if(!html||!document.createElement)return html;
    var template=document.createElement('template');
    template.innerHTML=String(html);
    var walker=document.createTreeWalker(template.content,NodeFilter.SHOW_TEXT);
    var nodes=[];
    var node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(function(textNode){
      var parent=textNode.parentElement;
      if(!parent||parent.closest('a,code,pre'))return;
      var text=String(textNode.nodeValue||'');
      var pattern=/https?:\/\/[^\s<>"']+/gi;
      var match;
      var lastIndex=0;
      var fragment=null;
      while((match=pattern.exec(text))){
        var raw=match[0];
        var trailing='';
        while(/[.,!?;:]$/.test(raw)){trailing=raw.slice(-1)+trailing;raw=raw.slice(0,-1);}
        while(/\)$/.test(raw)){
          var opens=(raw.match(/\(/g)||[]).length;
          var closes=(raw.match(/\)/g)||[]).length;
          if(closes<=opens)break;
          trailing=')'+trailing;
          raw=raw.slice(0,-1);
        }
        var safeUrl=safeNotificationImageUrl(raw);
        if(!safeUrl)continue;
        if(!fragment)fragment=document.createDocumentFragment();
        fragment.append(document.createTextNode(text.slice(lastIndex,match.index)));
        if(isDiscordNotificationImageUrl(safeUrl)){
          var imageWrapper=document.createElement('span');
          imageWrapper.className='notification-markdown-image notification-discord-image';
          var image=document.createElement('img');
          image.loading='lazy';
          image.decoding='async';
          image.referrerPolicy='no-referrer';
          image.src=safeUrl;
          image.alt='Imagem da notificação';
          imageWrapper.append(image);
          fragment.append(imageWrapper);
        }else{
          var link=document.createElement('a');
          link.className='notification-inline-link';
          link.href=safeUrl;
          link.target='_blank';
          link.rel='noopener noreferrer';
          link.textContent=raw;
          fragment.append(link);
        }
        if(trailing)fragment.append(document.createTextNode(trailing));
        lastIndex=match.index+match[0].length;
      }
      if(!fragment)return;
      fragment.append(document.createTextNode(text.slice(lastIndex)));
      textNode.replaceWith(fragment);
    });
    return template.innerHTML;
  }

  function renderNotificationMarkdown(value){
    var images=[];
    var source=replaceNotificationImageMarkdown(value,function(safeUrl,alt){
      var token='BETVNOTIFICATIONIMAGE'+images.length+'TOKEN';
      var fallbackUrl=isDiscordNotificationImageUrl(safeUrl)?'':notificationImageProxyUrl(safeUrl);
      images.push('<span class="notification-markdown-image">'+
        '<img loading="lazy" decoding="async" referrerpolicy="no-referrer" src="'+esc(safeUrl)+'"'+(fallbackUrl?' data-notification-fallback-src="'+esc(fallbackUrl)+'"':'')+' alt="'+esc(alt||'Imagem da notificação')+'">'+
      '</span>');
      return token;
    });
    var html=window.beRenderMarkdown?window.beRenderMarkdown(source):esc(source).replace(/\r?\n/g,'<br>');
    html=html.replace(/BETVNOTIFICATIONIMAGE(\d+)TOKEN/g,function(_,index){return images[Number(index)]||'';});
    return linkifyNotificationHtml(html);
  }

  function bindNotificationImages(root){
    if(!root)return;
    root.querySelectorAll('img[data-notification-fallback-src]').forEach(function(image){
      image.addEventListener('error',function useProxyFallback(){
        var fallback=image.getAttribute('data-notification-fallback-src')||'';
        image.removeAttribute('data-notification-fallback-src');
        if(fallback&&image.src!==fallback)image.src=fallback;
      },{once:true});
    });
  }

  function stripRawDiscordNotificationImages(value){
    return String(value||'').replace(/https?:\/\/[^\s<>"']+/gi,function(match){
      var raw=match;
      var trailing='';
      while(/[.,!?;:]$/.test(raw)){trailing=raw.slice(-1)+trailing;raw=raw.slice(0,-1);}
      while(/\)$/.test(raw)){
        var opens=(raw.match(/\(/g)||[]).length;
        var closes=(raw.match(/\)/g)||[]).length;
        if(closes<=opens)break;
        trailing=')'+trailing;
        raw=raw.slice(0,-1);
      }
      return isDiscordNotificationImageUrl(raw)?(' '+trailing):match;
    });
  }

  function notificationPlainText(value){
    var source=replaceNotificationImageMarkdown(value,function(){return ' ';});
    source=stripRawDiscordNotificationImages(source);
    return window.beMarkdownPlainText?window.beMarkdownPlainText(source):source.replace(/\s+/g,' ').trim();
  }

  function getMobileButton(){return document.getElementById('mobileNotificationButton');}

  function closeDesktop(){
    if(desktopDropdown)desktopDropdown.classList.remove('open');
    if(desktopButton)desktopButton.setAttribute('aria-expanded','false');
  }

  function closeMobile(){
    if(mobilePopover)mobilePopover.hidden=true;
    var button=getMobileButton();
    if(button)button.setAttribute('aria-expanded','false');
  }

  function closeMenus(){closeDesktop();closeMobile();}

  function syncPageAvatar(){
    if(!pageAvatar||!pageAvatarImage||!pageAvatarFallback)return;
    var account=window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;
    var source=document.getElementById('publicUserPhoto');
    var src=source&&!source.hidden?String(source.getAttribute('src')||''):'';
    if(account&&src){
      pageAvatarImage.src=window.beMediaUrl?window.beMediaUrl(src):src;
      pageAvatarImage.hidden=false;
      pageAvatarFallback.hidden=true;
      pageAvatar.setAttribute('aria-label','Abrir perfil');
      return;
    }
    pageAvatarImage.hidden=true;
    pageAvatarImage.removeAttribute('src');
    var name=document.getElementById('ddUsername');
    var label=account?(name?String(name.textContent||'').replace(/^@/,'').trim():'')||account.displayName||account.email||'M':'M';
    pageAvatarFallback.textContent=(String(label).charAt(0)||'M').toUpperCase();
    pageAvatarFallback.hidden=false;
    pageAvatar.setAttribute('aria-label',account?'Abrir perfil':'Entrar na plataforma');
  }

  function openProfileFromPage(){
    var account=window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;
    closePage(true);
    window.setTimeout(function(){
      if(!account){
        window.BETVPublicRoutes.go('/login');
        document.body.classList.add('login-mode');
        return;
      }
      var profileButton=document.querySelector('[data-public-action="profile"]');
      if(profileButton)profileButton.click();
      else window.dispatchEvent(new CustomEvent('be:open-profile-route'));
    },50);
  }

  function setUnreadState(){
    var currentMobileDot=document.getElementById('mobileNotificationUnreadDot')||mobileDot;
    if(!notifications.length){
      if(desktopDot)desktopDot.hidden=true;
      if(currentMobileDot)currentMobileDot.hidden=true;
      return;
    }
    var latest=dateValue(notifications[0]);
    var seen=Number(localStorage.getItem(STORAGE_KEY)||0);
    var unread=Boolean(latest&&latest.getTime()>seen);
    if(desktopDot)desktopDot.hidden=!unread;
    if(currentMobileDot)currentMobileDot.hidden=!unread;
  }

  function markAllRead(){
    var currentMobileDot=document.getElementById('mobileNotificationUnreadDot')||mobileDot;
    var latest=notifications.length&&dateValue(notifications[0]);
    localStorage.setItem(STORAGE_KEY,String(latest?latest.getTime():Date.now()));
    if(desktopDot)desktopDot.hidden=true;
    if(currentMobileDot)currentMobileDot.hidden=true;
  }

  function previewMarkup(items){
    if(!items.length)return '<div class="notification-preview-empty"><strong>Nenhuma atualização</strong></div>';
    return items.slice(0,3).map(function(item){
      return '<button class="notification-preview-item" type="button" data-notification-id="'+esc(item.id)+'">'+
        '<span class="notification-preview-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A8.5 8.5 0 0 0 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.7v4.7l3.2 1.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+
        '<span class="notification-preview-copy"><strong>'+esc(item.title||'Atualização')+'</strong><span>'+esc(trimText(notificationPlainText(item.description),100)||'Confira esta atualização.')+'</span></span>'+
        '<span class="notification-preview-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+
      '</button>';
    }).join('');
  }

  function bindPreviewItems(root){
    if(!root)return;
    root.querySelectorAll('[data-notification-id]').forEach(function(button){
      button.addEventListener('click',function(){openPage(button.dataset.notificationId,true);});
    });
  }

  function renderPreviews(){
    var html=previewMarkup(notifications);
    if(desktopList){desktopList.innerHTML=html;bindPreviewItems(desktopList);}
    if(mobileList){mobileList.innerHTML=html;bindPreviewItems(mobileList);}
    setUnreadState();
  }

  function renderPage(id){
    if(!notifications.length){
      pageNav.innerHTML='<div class="notification-page-empty"><strong>Nenhuma atualização</strong></div>';
      pageContent.innerHTML='<div class="notification-page-empty"><strong>Nenhuma atualização</strong></div>';
      return;
    }
    var active=notifications.find(function(item){return String(item.id)===String(id);})||notifications[0];
    selectedId=String(active.id||'');
    pageNav.innerHTML=notifications.map(function(item){
      var selected=String(item.id)===selectedId;
      return '<button class="notification-page-link '+(selected?'active':'')+'" type="button" data-notification-page-id="'+esc(item.id)+'" aria-current="'+(selected?'page':'false')+'">'+
        '<strong>'+esc(item.title||'Atualização')+'</strong>'+
        '<span>'+esc(trimText(notificationPlainText(item.description),92)||'Confira esta atualização.')+'</span>'+
      '</button>';
    }).join('');
    pageNav.querySelectorAll('[data-notification-page-id]').forEach(function(button){
      button.addEventListener('click',function(){openPage(button.dataset.notificationPageId,true);});
    });
    pageContent.innerHTML='<article class="notification-article">'+
      '<h1>'+esc(active.title||'Atualização')+'</h1>'+
      '<p class="notification-article-date" data-i18n-ignore>'+esc(formatDate(active))+'</p>'+
      '<div class="notification-article-body be-markdown">'+renderNotificationMarkdown(active.description||'')+'</div>'+
    '</article>';
    bindNotificationImages(pageContent);
  }

  async function loadNotifications(force){
    if(loadingPromise&&!force)return loadingPromise;
    if(loaded&&!force)return notifications;
    loadingPromise=(async function(){
      try{
        if(!window.beBackend)throw new Error('Backend indisponível.');
        await window.beBackend.ready;
        var items=await window.beBackend.data.list('notifications',{orderBy:'createdAt',direction:'desc'});
        notifications=(Array.isArray(items)?items:[]).filter(function(item){return item&&item.active!==false&&String(item.type||'')!=='profile-share-campaign'&&String(item.title||'').trim();}).sort(compareNewest);
        loaded=true;
        renderPreviews();
        if(document.body.classList.contains('notification-page-active'))renderPage(selectedId||routeInfo().id);
        window.dispatchEvent(new CustomEvent('be:notifications-ready',{detail:{count:notifications.length}}));
      }catch(error){
        console.warn('Não foi possível carregar as notificações:',error);
        notifications=[];
        loaded=true;
        renderPreviews();
        if(document.body.classList.contains('notification-page-active'))renderPage('');
      }finally{loadingPromise=null;}
      return notifications;
    })();
    return loadingPromise;
  }

  function setNotificationRoute(id,replace){
    var url=new URL(location.href);
    url.pathname='/atualizacoes'+(id?'/'+encodeURIComponent(id):'');
    url.hash='';
    var target=url.pathname+(url.search||'');
    if(replace)history.replaceState({beRoute:'notifications',id:id||''},'',target);
    else history.pushState({beRoute:'notifications',id:id||''},'',target);
  }

  async function openPage(id,updateRoute){
    closeMenus();
    document.body.classList.remove('login-mode','profile-page-active','settings-page-active','legal-page-active','support-page-active','detail-page-active');
    document.body.classList.add('notification-page-active');
    page.hidden=false;
    page.setAttribute('aria-hidden','false');
    selectedId=String(id||'');
    document.title='Billie Eilish TV';
    syncPageAvatar();
    if(updateRoute!==false)setNotificationRoute(selectedId,false);else if(routeInfo().legacy)setNotificationRoute(selectedId,true);
    window.dispatchEvent(new CustomEvent('be:close-support'));
    await loadNotifications(false);
    renderPage(selectedId);
    markAllRead();
    window.scrollTo(0,0);
  }

  function closePage(updateRoute){
    document.body.classList.remove('notification-page-active');
    page.hidden=true;
    page.setAttribute('aria-hidden','true');
    selectedId='';
    if(updateRoute!==false&&routeInfo().active){
      var url=new URL(location.href);
      url.pathname='/';
      url.hash='';
      history.pushState({beRoute:'home'},'',url.pathname+(url.search||''));
    }
    document.title='Billie Eilish TV';
  }

  function closeAccountMenu(){
    var userDropdown=document.getElementById('userDropdown');
    var userChip=document.getElementById('userChip');
    if(userDropdown)userDropdown.classList.remove('open');
    if(userChip)userChip.setAttribute('aria-expanded','false');
  }

  function toggleDesktop(event){
    if(event)event.stopPropagation();
    if(!desktopDropdown||!desktopButton)return;
    var open=!desktopDropdown.classList.contains('open');
    if(open){
      window.dispatchEvent(new CustomEvent('be:close-public-search'));
      window.dispatchEvent(new CustomEvent('be:close-mobile-search'));
    }
    closeMobile();
    closeAccountMenu();
    desktopDropdown.classList.toggle('open',open);
    desktopButton.setAttribute('aria-expanded',String(open));
    if(open){loadNotifications(false);}
  }

  function toggleMobile(event){
    if(event)event.stopPropagation();
    if(!mobilePopover)return;
    var open=mobilePopover.hidden;
    if(open){
      window.dispatchEvent(new CustomEvent('be:close-public-search'));
      window.dispatchEvent(new CustomEvent('be:close-mobile-search'));
    }
    closeDesktop();
    closeAccountMenu();
    mobilePopover.hidden=!open;
    var button=getMobileButton();
    if(button)button.setAttribute('aria-expanded',String(open));
    if(open){loadNotifications(false);}
  }

  if(desktopDropdown)desktopDropdown.addEventListener('click',function(event){event.stopPropagation();});
  if(desktopMarkAll)desktopMarkAll.addEventListener('click',function(event){event.stopPropagation();markAllRead();});
  if(desktopClose)desktopClose.addEventListener('click',function(event){event.stopPropagation();closeDesktop();});
  if(mobileMarkAll)mobileMarkAll.addEventListener('click',function(event){event.stopPropagation();markAllRead();});
  if(desktopViewAll)desktopViewAll.addEventListener('click',function(){openPage('',true);});
  if(mobilePopover)mobilePopover.addEventListener('click',function(event){event.stopPropagation();});
  if(mobileViewAll)mobileViewAll.addEventListener('click',function(){openPage('',true);});
  if(mobileClose)mobileClose.addEventListener('click',closeMobile);
  if(pageHome)pageHome.addEventListener('click',function(){closePage(true);});
  if(pageAvatar)pageAvatar.addEventListener('click',openProfileFromPage);
  if(pageClose)pageClose.addEventListener('click',function(){closePage(true);});

  document.addEventListener('click',function(event){
    var desktopTrigger=event.target&&event.target.closest?event.target.closest('#notificationButton'):null;
    if(!desktopTrigger)return;
    event.preventDefault();
    event.stopPropagation();
    toggleDesktop(event);
  },true);

  document.addEventListener('click',function(event){
    var mobileButton=getMobileButton();
    if(desktopDropdown&&desktopButton&&!desktopDropdown.contains(event.target)&&!desktopButton.contains(event.target))closeDesktop();
    if(mobilePopover&&!mobilePopover.hidden&&!mobilePopover.contains(event.target)&&(!mobileButton||!mobileButton.contains(event.target)))closeMobile();
  });

  document.addEventListener('keydown',function(event){
    if(event.key!=='Escape')return;
    if(document.body.classList.contains('notification-page-active'))closePage(true);
    else closeMenus();
  });

  document.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('#mobileNotificationButton'):null;
    if(button)toggleMobile(event);
  },true);

  window.addEventListener('be:close-notification-menus',closeMenus);
  window.addEventListener('be:open-config',closeMenus);

  window.addEventListener('be:open-notifications',function(event){
    var detail=event&&event.detail||{};
    openPage(detail.id||routeInfo().id,false);
  });
  window.addEventListener('be:close-notifications',function(){closePage(false);});
  window.addEventListener('be:i18n-ready',function(){if(loaded){renderPreviews();if(document.body.classList.contains('notification-page-active'))renderPage(selectedId||routeInfo().id);}});
  window.addEventListener('be:content-ready',function(){loadNotifications(true);});
  window.addEventListener('be:auth-changed',function(){syncPageAvatar();loadNotifications(true);});
  window.addEventListener('be:profile-avatar-changed',syncPageAvatar);
  window.addEventListener('be:content-ready',syncPageAvatar);
  window.addEventListener('hashchange',function(){
    var info=routeInfo();
    if(info.active)openPage(info.id,false);
    else if(document.body.classList.contains('notification-page-active'))closePage(false);
  });
  window.addEventListener('popstate',function(){
    var info=routeInfo();
    if(info.active)openPage(info.id,false);
    else if(document.body.classList.contains('notification-page-active'))closePage(false);
  });

  syncPageAvatar();
  loadNotifications(false);
  var initial=routeInfo();
  if(initial.active)openPage(initial.id,false);
})();

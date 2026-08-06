(function(){
  'use strict';

  var page=document.getElementById('supportPage');
  var input=document.getElementById('supportSearchInput');
  var clearButton=document.getElementById('supportSearchClear');
  var status=document.getElementById('supportSearchStatus');
  var noResults=document.getElementById('supportNoResults');
  var faqList=document.getElementById('supportFaqList');
  var faqSection=faqList?faqList.closest('.support-faq'):null;
  var supportButton=document.querySelector('.home-nav-link[data-public-action="support"]');
  var logoButton=document.getElementById('logoBtn');
  var leading=document.getElementById('homeNavLeading');
  if(!page||!input||!faqList)return;

  var faqItems=Array.prototype.slice.call(faqList.querySelectorAll('.support-faq-item'));
  var faqGroupTitles=Array.prototype.slice.call(faqList.querySelectorAll('[data-faq-group-title]'));

  function normalize(value){
    return String(value||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .trim();
  }

  function cleanPath(){
    try{return decodeURIComponent(String(location.pathname||'/')).replace(/\/+$/,'')||'/';}
    catch(_){return String(location.pathname||'/').replace(/\/+$/,'')||'/';}
  }

  function hasLegacySupportUrl(){
    var path=cleanPath().toLowerCase();
    var hash=String(location.hash||'').toLowerCase();
    return hash==='#suporte'||hash==='#/suporte'||hash==='#support'||hash==='#/support';
  }

  function isSupportRoute(){
    var state=history.state||{};
    return cleanPath().toLowerCase()==='/suporte'||hasLegacySupportUrl()||(state.beRoute==='support'&&!location.hash);
  }

  function publicUrlWithoutSupportRoute(){
    var path=cleanPath();
    if(path.toLowerCase()==='/suporte')path='/';
    return path+(location.search||'');
  }

  function positionIndicator(button){
    if(!leading||!button)return;
    window.requestAnimationFrame(function(){
      var leadingRect=leading.getBoundingClientRect();
      var buttonRect=button.getBoundingClientRect();
      if(!buttonRect.width||!buttonRect.height)return;
      leading.style.setProperty('--home-tab-x',Math.max(0,buttonRect.left-leadingRect.left)+'px');
      leading.style.setProperty('--home-tab-y',Math.max(0,buttonRect.top-leadingRect.top)+'px');
      leading.style.setProperty('--home-tab-width',buttonRect.width+'px');
      leading.style.setProperty('--home-tab-height',buttonRect.height+'px');
    });
  }

  function setSupportTab(active){
    var tabs=[logoButton].concat(Array.prototype.slice.call(document.querySelectorAll('.home-nav-link')));
    tabs.forEach(function(button){
      if(!button)return;
      var selected=active?button===supportButton:button===logoButton;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-pressed',String(selected));
      if(button===logoButton){
        if(selected)button.setAttribute('aria-current','page');
        else button.removeAttribute('aria-current');
      }
    });
    positionIndicator(active?supportButton:logoButton);
  }

  function setSupportRoute(replace){
    var currentState=history.state||{};
    var nextState=Object.assign({},currentState,{beRoute:'support'});
    var target='/suporte'+(location.search||'');
    if(replace)history.replaceState(nextState,'',target);
    else history.pushState(nextState,'',target);
  }

  function openSupport(updateRoute){
    if(updateRoute!==false){
      if(!isSupportRoute())setSupportRoute(false);
      else if(hasLegacySupportUrl())setSupportRoute(true);
    }else if(hasLegacySupportUrl()){
      setSupportRoute(true);
    }
    document.body.classList.remove('login-mode','profile-page-active','settings-page-active','legal-page-active','detail-page-active','notification-page-active');
    window.dispatchEvent(new CustomEvent('be:close-notifications'));
    document.body.classList.add('support-page-active');
    page.hidden=false;
    page.setAttribute('aria-hidden','false');
    var dropdown=document.getElementById('userDropdown');
    var chip=document.getElementById('userChip');
    if(dropdown)dropdown.classList.remove('open');
    if(chip)chip.setAttribute('aria-expanded','false');
    setSupportTab(true);
    document.title='Billie Eilish TV';
    window.scrollTo(0,0);
    if(updateRoute!==false){
      window.requestAnimationFrame(function(){
        if(!isSupportRoute()||hasLegacySupportUrl())setSupportRoute(true);
      });
    }
  }

  function closeSupport(updateRoute,resetTab){
    document.body.classList.remove('support-page-active');
    page.hidden=true;
    page.setAttribute('aria-hidden','true');
    if(updateRoute!==false&&isSupportRoute()){
      var currentState=history.state||{};
      var nextState=Object.assign({},currentState,{beRoute:'home'});
      history.pushState(nextState,'',publicUrlWithoutSupportRoute());
    }
    if(resetTab!==false)setSupportTab(false);
    document.title='Billie Eilish TV';
  }

  function filterFaq(){
    var query=normalize(input.value);
    var visible=0;
    faqGroupTitles.forEach(function(title){title.hidden=Boolean(query);});
    faqItems.forEach(function(item){
      var searchOnly=item.getAttribute('data-search-only')==='true';
      var match=query?normalize(item.textContent).indexOf(query)!==-1:!searchOnly;
      item.hidden=!match;
      if(!match)item.open=false;
      if(match)visible+=1;
    });
    var empty=Boolean(query)&&visible===0;
    if(clearButton)clearButton.hidden=!input.value;
    if(noResults)noResults.hidden=!empty;
    if(faqSection)faqSection.hidden=empty;
    page.classList.toggle('support-filter-empty',empty);
    if(status){
      status.textContent=empty
        ? 'Nenhuma pergunta frequente encontrada. Use a área para relatar o problema.'
        : visible+' '+(visible===1?'pergunta frequente encontrada.':'perguntas frequentes encontradas.');
    }
  }

  faqItems.forEach(function(item){
    item.addEventListener('toggle',function(){
      if(!item.open)return;
      faqItems.forEach(function(other){if(other!==item)other.open=false;});
    });
  });

  input.addEventListener('input',filterFaq);
  input.addEventListener('keydown',function(event){
    if(event.key==='Escape'&&input.value){
      event.preventDefault();
      input.value='';
      filterFaq();
    }
  });
  if(clearButton)clearButton.addEventListener('click',function(){
    input.value='';
    filterFaq();
    input.focus({preventScroll:true});
  });

  document.addEventListener('click',function(event){
    var target=event.target&&event.target.closest?event.target.closest('[data-public-action="support"],[data-mobile-destination="support"],a[href="/suporte"],a[href="#suporte"],a[href="#/suporte"],.home-nav-link[data-home-view],#logoBtn,[data-public-action="profile"],[data-public-action="settings"],[data-public-action="auth"]'):null;
    if(!target)return;
    if(target.matches('[data-public-action="support"],[data-mobile-destination="support"],a[href="/suporte"],a[href="#suporte"],a[href="#/suporte"]')){
      event.preventDefault();
      openSupport(true);
      return;
    }
    if(document.body.classList.contains('support-page-active')){
      var homeDestination=target.matches('.home-nav-link[data-home-view],#logoBtn');
      closeSupport(homeDestination,!homeDestination);
    }
  },true);

  window.addEventListener('be:open-support',function(){openSupport(true);});
  window.addEventListener('be:close-support',function(){closeSupport(false,true);});
  window.addEventListener('be:open-config',function(){closeSupport(false,false);});
  window.addEventListener('be:open-profile-route',function(){closeSupport(false,false);});
  window.addEventListener('hashchange',function(){
    if(isSupportRoute())openSupport(false);
    else if(document.body.classList.contains('support-page-active'))closeSupport(false,true);
  });
  window.addEventListener('popstate',function(){
    if(isSupportRoute())openSupport(false);
    else if(document.body.classList.contains('support-page-active'))closeSupport(false,true);
  });
  window.addEventListener('resize',function(){
    if(document.body.classList.contains('support-page-active'))positionIndicator(supportButton);
  },{passive:true});
  window.addEventListener('load',function(){
    window.setTimeout(function(){
      if(isSupportRoute()||document.body.classList.contains('support-page-active'))setSupportTab(true);
    },0);
  });
  window.addEventListener('be:content-ready',function(){
    if(isSupportRoute()||document.body.classList.contains('support-page-active'))setSupportTab(true);
  });

  filterFaq();
  if(isSupportRoute())openSupport(false);
})();

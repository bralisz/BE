;(function(){
  'use strict';

  var LOCALES={
    'pt-br':{locale:'pt-BR',slug:'pt-br',target:'pt'},
    'en-us':{locale:'en-US',slug:'en-us',target:'en'},
    'us':{locale:'en-US',slug:'en-us',target:'en',alias:true},
    'es':{locale:'es-ES',slug:'es',target:'es'}
  };
  var SUPPORTED=['pt-br','en-us','es'];
  var RESERVED=/^\/(?:api|assets|oauth\/consent|site\.webmanifest|favicon(?:\.ico)?|404)(?:\/|$)/i;
  var LOCALE_STORAGE_KEY='betvPreferredLocale';
  var nativePush=history.pushState.bind(history);
  var nativeReplace=history.replaceState.bind(history);

  function normalizedPath(value){
    var raw=String(value||'/');
    try{raw=decodeURIComponent(raw);}catch(_){ }
    raw=raw.split('?')[0].split('#')[0];
    if(raw.charAt(0)!=='/')raw='/'+raw;
    raw=raw.replace(/\/{2,}/g,'/').replace(/\/+$/,'');
    return raw||'/';
  }

  function localeFromPath(value){
    var path=normalizedPath(value);
    var first=String(path.split('/')[1]||'').toLowerCase();
    return LOCALES[first]?{requestedSlug:first,config:LOCALES[first]}:null;
  }

  function stripLocale(value){
    var path=normalizedPath(value);
    var found=localeFromPath(path);
    if(!found)return path;
    var stripped=path.replace(new RegExp('^/'+found.requestedSlug+'(?=/|$)','i'),'');
    return stripped||'/';
  }

  function browserLanguages(){
    var values=[];
    try{
      values=(Array.isArray(navigator.languages)&&navigator.languages.length?navigator.languages:[navigator.language||navigator.userLanguage||'']).filter(Boolean);
    }catch(_){values=[];}
    return values.map(function(value){return String(value||'').trim();}).filter(Boolean);
  }

  function storedLocale(){
    try{
      var value=String(localStorage.getItem(LOCALE_STORAGE_KEY)||'').toLowerCase();
      return SUPPORTED.indexOf(value)>=0?value:'';
    }catch(_){return '';}
  }

  function detectedLocaleSlug(){
    var saved=storedLocale();
    if(saved)return saved;
    var languages=browserLanguages();
    for(var index=0;index<languages.length;index+=1){
      var language=languages[index].toLowerCase();
      if(language.indexOf('pt')===0)return 'pt-br';
      if(language.indexOf('es')===0)return 'es';
      if(language.indexOf('en')===0)return 'en-us';
    }
    return 'en-us';
  }

  function detectedRegion(){
    var timeZone='';
    try{timeZone=String(Intl.DateTimeFormat().resolvedOptions().timeZone||'');}catch(_){ }
    if(/^America\/(?:Sao_Paulo|Fortaleza|Recife|Maceio|Bahia|Belem|Manaus|Cuiaba|Campo_Grande|Porto_Velho|Boa_Vista|Rio_Branco|Noronha|Araguaina|Santarem)$/i.test(timeZone))return 'BR';
    var languages=browserLanguages();
    for(var index=0;index<languages.length;index+=1){
      var raw=languages[index];
      var explicit=raw.match(/[-_]([a-z]{2}|\d{3})(?:$|-|_)/i);
      if(explicit)return String(explicit[1]).toUpperCase();
    }
    for(var secondIndex=0;secondIndex<languages.length;secondIndex+=1){
      try{
        if(typeof Intl.Locale==='function'){
          var locale=new Intl.Locale(languages[secondIndex]).maximize();
          if(locale.region)return String(locale.region).toUpperCase();
        }
      }catch(_){ }
    }
    return detectedLocaleSlug()==='pt-br'?'BR':'US';
  }

  var found=localeFromPath(location.pathname);
  var logicalAtBoot=stripLocale(location.pathname);
  var adminBoot=logicalAtBoot==='/admin'||String(location.hash||'').indexOf('#/admin')===0;

  if(!found&&!RESERVED.test(logicalAtBoot)&&!adminBoot){
    var autoSlug=detectedLocaleSlug();
    location.replace('/'+autoSlug+(logicalAtBoot==='/'?'':logicalAtBoot)+(location.search||'')+(location.hash||''));
    return;
  }

  var storedPrefix='';
  try{storedPrefix=String(sessionStorage.getItem('betvLocalePrefix')||'');}catch(_){ }

  var config=found&&found.config;
  var requestedSlug=found&&found.requestedSlug||'';
  var prefix=config?'/'+config.slug:'';
  var locale=config?config.locale:'pt-BR';

  if(config){
    try{localStorage.setItem(LOCALE_STORAGE_KEY,config.slug);}catch(_){ }
  }

  if(!prefix&&/^\/(?:auth\/callback|oauth\/consent)(?:\/|$)/i.test(logicalAtBoot)&&/^\/(?:pt-br|en-us|es)$/.test(storedPrefix)){
    prefix=storedPrefix;
    var storedSlug=storedPrefix.slice(1);
    locale=(LOCALES[storedSlug]&&LOCALES[storedSlug].locale)||locale;
  }else if(!/^\/(?:auth\/callback|oauth\/consent)(?:\/|$)/i.test(logicalAtBoot)){
    try{sessionStorage.setItem('betvLocalePrefix',prefix);}catch(_){ }
  }

  function isExternalOrSpecial(raw){
    return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)&&!/^https?:/i.test(raw);
  }

  function localize(value){
    if(value===undefined||value===null||value==='')return value;
    var raw=String(value);
    if(!prefix||raw.charAt(0)==='#'||isExternalOrSpecial(raw))return raw;
    var url;
    try{url=new URL(raw,location.href);}catch(_){return raw;}
    if(url.origin!==location.origin)return raw;
    if(RESERVED.test(url.pathname))return raw;
    var logical=stripLocale(url.pathname);
    url.pathname=prefix+(logical==='/'?'':logical);
    return url.pathname+(url.search||'')+(url.hash||'');
  }

  function localizeAnchor(anchor){
    if(!anchor||!anchor.getAttribute||anchor.hasAttribute('download'))return;
    var raw=anchor.getAttribute('href');
    if(!raw||raw.charAt(0)==='#')return;
    var localized=localize(raw);
    if(localized&&localized!==raw)anchor.setAttribute('href',localized);
  }

  function localizeLinks(root){
    if(!prefix||!root)return;
    if(root.nodeType===1&&root.matches&&root.matches('a[href]'))localizeAnchor(root);
    if(root.querySelectorAll)root.querySelectorAll('a[href]').forEach(localizeAnchor);
  }

  function startLinkObserver(){
    if(!prefix||!document.documentElement)return;
    localizeLinks(document.documentElement);
    var linkObserver=new MutationObserver(function(mutations){
      mutations.forEach(function(mutation){
        if(mutation.type==='attributes')localizeAnchor(mutation.target);
        mutation.addedNodes&&mutation.addedNodes.forEach(localizeLinks);
      });
    });
    linkObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
  }

  function currentLogicalPath(){return stripLocale(location.pathname);}

  history.pushState=function(state,title,url){
    return nativePush(state,title,url===undefined?url:localize(url));
  };
  history.replaceState=function(state,title,url){
    return nativeReplace(state,title,url===undefined?url:localize(url));
  };

  if(found&&found.config.alias){
    nativeReplace(history.state,'',prefix+(logicalAtBoot==='/'?'':logicalAtBoot)+(location.search||'')+(location.hash||''));
    requestedSlug=found.config.slug;
  }

  var region=detectedRegion();
  var regional=Object.freeze({
    deviceLocale:(browserLanguages()[0]||locale),
    region:region,
    currency:region==='BR'?'BRL':'USD'
  });

  var api=Object.freeze({
    locale:locale,
    slug:prefix?prefix.slice(1):'pt-br',
    prefix:prefix,
    target:(LOCALES[prefix?prefix.slice(1):'pt-br']||LOCALES['pt-br']).target,
    isPrefixed:Boolean(prefix),
    stripPath:stripLocale,
    localizePath:localize,
    currentPath:currentLogicalPath,
    supported:Object.freeze(SUPPORTED.slice()),
    detectedSlug:detectedLocaleSlug,
    setPreferred:function(slug){
      var clean=String(slug||'').toLowerCase();
      if(SUPPORTED.indexOf(clean)<0)return false;
      try{localStorage.setItem(LOCALE_STORAGE_KEY,clean);}catch(_){ }
      return true;
    },
    switchTo:function(slug){
      var clean=String(slug||'').toLowerCase();
      if(SUPPORTED.indexOf(clean)<0)return false;
      try{localStorage.setItem(LOCALE_STORAGE_KEY,clean);}catch(_){ }
      var logical=currentLogicalPath();
      var destination='/'+clean+(logical==='/'?'':logical)+(location.search||'')+(location.hash||'');
      location.assign(destination);
      return true;
    }
  });

  window.BETVLocale=api;
  window.BETVRegional=regional;
  window.BETVLocalePath=currentLogicalPath;
  window.BETVLocaleURL=localize;
  document.documentElement.lang=locale;
  document.documentElement.dataset.locale=api.slug;
  document.documentElement.dataset.localePrefix=prefix||'/';
  document.documentElement.dataset.currency=regional.currency.toLowerCase();

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startLinkObserver,{once:true});
  else startLinkObserver();

  document.addEventListener('click',function(event){
    if(!prefix||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    var target=event.target&&event.target.closest?event.target.closest('a[href]'):null;
    if(!target||target.hasAttribute('download'))return;
    var raw=target.getAttribute('href');
    if(!raw||raw.charAt(0)==='#')return;
    var localized=localize(raw);
    if(localized&&localized!==raw)target.setAttribute('href',localized);
  },true);

  try{window.dispatchEvent(new CustomEvent('be:locale-ready',{detail:api}));}catch(_){ }
})();

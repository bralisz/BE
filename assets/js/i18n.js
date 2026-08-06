;(function(){
  'use strict';

  var localeApi=window.BETVLocale||{slug:'pt-br',locale:'pt-BR',target:'pt'};
  var slug=String(localeApi.slug||'pt-br').toLowerCase();
  var locale=String(localeApi.locale||'pt-BR');
  var target=String(localeApi.target||({"en-us":"en","es":"es"}[slug]||'pt'));
  var map=Object.create(null);
  var readyResolve;
  var ready=new Promise(function(resolve){readyResolve=resolve;});
  var appliedNodes=new WeakSet();
  var observer=null;
  var queued=false;
  var pendingRoots=[];
  var TRANSLATABLE_ATTRIBUTES=['aria-label','placeholder','title','alt','value'];
  var SKIP_SELECTOR='script,style,code,pre,textarea,[data-i18n-ignore],[translate="no"],.notranslate';

  function normalize(value){return String(value==null?'':value).replace(/\s+/g,' ').trim();}
  function preserveWhitespace(raw,translated){
    var leading=(String(raw).match(/^\s*/)||[''])[0];
    var trailing=(String(raw).match(/\s*$/)||[''])[0];
    return leading+translated+trailing;
  }
  function translateExact(value){
    var key=normalize(value);
    if(!key)return String(value||'');
    return Object.prototype.hasOwnProperty.call(map,key)?map[key]:String(value||'');
  }
  function parentSkipped(node){
    var element=node&&node.nodeType===1?node:node&&node.parentElement;
    return Boolean(element&&element.closest&&element.closest(SKIP_SELECTOR));
  }
  function translateTextNode(node){
    if(!node||node.nodeType!==3||parentSkipped(node))return;
    var raw=node.nodeValue||'';
    var key=normalize(raw);
    if(!key||!/\p{L}/u.test(key))return;
    var translated=map[key];
    if(translated&&translated!==key)node.nodeValue=preserveWhitespace(raw,translated);
    appliedNodes.add(node);
  }
  function translateAttributes(element){
    if(!element||element.nodeType!==1||parentSkipped(element))return;
    TRANSLATABLE_ATTRIBUTES.forEach(function(attribute){
      if(!element.hasAttribute(attribute))return;
      var raw=element.getAttribute(attribute)||'';
      var key=normalize(raw);
      if(!key||!/\p{L}/u.test(key))return;
      var translated=map[key];
      if(translated&&translated!==raw)element.setAttribute(attribute,translated);
    });
  }
  function apply(root){
    if(slug==='pt-br'||!root)return;
    if(root.nodeType===3){translateTextNode(root);return;}
    if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
    if(root.nodeType===1)translateAttributes(root);
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{
      acceptNode:function(node){
        if(node.nodeType===1&&parentSkipped(node))return NodeFilter.FILTER_REJECT;
        if(node.nodeType===3&&parentSkipped(node))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while((node=walker.nextNode())){
      if(node.nodeType===3)translateTextNode(node);
      else translateAttributes(node);
    }
  }
  function flushQueue(){
    queued=false;
    var roots=pendingRoots.splice(0,pendingRoots.length);
    roots.forEach(apply);
  }
  function queueApply(root){
    if(!root)return;
    pendingRoots.push(root);
    if(queued)return;
    queued=true;
    (window.requestAnimationFrame||window.setTimeout)(flushQueue,16);
  }
  function startObserver(){
    if(slug==='pt-br'||observer||!document.documentElement)return;
    observer=new MutationObserver(function(mutations){
      mutations.forEach(function(mutation){
        if(mutation.type==='characterData')queueApply(mutation.target);
        mutation.addedNodes&&mutation.addedNodes.forEach(queueApply);
        if(mutation.type==='attributes')queueApply(mutation.target);
      });
    });
    observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:TRANSLATABLE_ATTRIBUTES});
  }
  function interpolation(value,variables){
    return String(value||'').replace(/\{([a-zA-Z0-9_]+)\}/g,function(_,key){
      return Object.prototype.hasOwnProperty.call(variables||{},key)?String(variables[key]):_;
    });
  }
  function t(source,variables){
    var translated=translateExact(source);
    return interpolation(translated,variables||{});
  }
  function recordTranslation(record){
    if(!record||typeof record!=='object'||slug==='pt-br')return record;
    var translations=record.translations&&typeof record.translations==='object'?record.translations:{};
    var localized=translations[slug]||translations[target]||null;
    return localized&&typeof localized==='object'?Object.assign({},record,localized):record;
  }
  function regionalCurrency(){
    var value=window.BETVRegional&&window.BETVRegional.currency;
    return String(value||'BRL').toUpperCase()==='USD'?'USD':'BRL';
  }
  function currencyFormatter(currency){
    return new Intl.NumberFormat(locale,{style:'currency',currency:currency||regionalCurrency()});
  }
  async function load(){
    if(slug==='pt-br'){
      window.BETVI18n=api;
      readyResolve(api);
      return;
    }
    try{
      var response=await fetch('/assets/i18n/'+encodeURIComponent(slug)+'.json?rev=20260806-i18n-currency-v1',{credentials:'same-origin',cache:'force-cache'});
      if(response.ok){
        var payload=await response.json();
        if(payload&&typeof payload==='object')map=payload;
      }
    }catch(error){console.warn('Não foi possível carregar o idioma do site:',error&&error.message||error);}
    window.BETVI18n=api;
    apply(document.documentElement);
    startObserver();
    readyResolve(api);
    try{window.dispatchEvent(new CustomEvent('be:i18n-ready',{detail:api}));}catch(_){ }
  }

  var api={
    slug:slug,
    locale:locale,
    target:target,
    ready:ready,
    t:t,
    apply:apply,
    translateExact:translateExact,
    localizeRecord:recordTranslation,
    currency:regionalCurrency,
    formatCurrency:function(cents,currency){return currencyFormatter(currency).format(Number(cents||0)/100);}
  };
  window.BETVI18n=api;

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();

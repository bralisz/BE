;(function(){
  'use strict';

  var localeApi=window.BETVLocale||{slug:'pt-br',locale:'pt-BR',target:'pt'};
  var slug=String(localeApi.slug||'pt-br').toLowerCase();
  var locale=String(localeApi.locale||'pt-BR');
  var target=String(localeApi.target||({'en-us':'en','es':'es','fr':'fr'}[slug]||'pt'));
  var map=Object.create(null);
  var readyResolve;
  var ready=new Promise(function(resolve){readyResolve=resolve;});
  var observer=null;
  var queued=false;
  var pendingRoots=[];
  var translateTimer=0;
  var translationBusy=false;
  var missingTexts=new Set();
  var translatedThisSession=new Set();
  var TRANSLATABLE_ATTRIBUTES=['aria-label','placeholder','title','alt','value'];
  var SKIP_SELECTOR='script,style,code,pre,textarea,[data-i18n-ignore],[translate="no"],.notranslate,#adminRoot,.admin-shell,.admin-page';
  var PROTECTED_EXACT=new Set([
    'BE','BETV','Billie Eilish','Billie Eilish TV','FINNEAS','Discord','Google','Instagram','TikTok','Twitter / X','Spotify','YouTube',
    'Apple TV','Prime Video','Paramount+','Disney+','Stripe','Supabase','CC BY-SA 4.0','LGPD','DMCA','HTTPS','BRL','USD',
    'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?','HIT ME HARD AND SOFT','Happier Than Ever','dont smile at me','Guitar Songs',
    'all the good girls go to hell','bad guy','Bellyache','BIRDS OF A FEATHER','Bored','bury a friend','CHIHIRO','everything i wanted',
    'Guess','hostage','idontwannabeyouanymore','Lo Vas A Olvidar','Lost Cause','lovely','LUNCH','Male Fantasy','my future','NDA',
    'Never Felt So Alone','No Time To Die','Ocean Eyes','ocean eyes','Therefore I Am','watch','What Was I Made For?',
    "when the party's over",'xanny','you should see me in a crown','Your Power','THE GREATEST','SKINNY',"L'AMOUR DE MA VIE",
    'Billie Bossa Nova','Getting Older','TV','bitches broken hearts','listen before i go','come out and play','One Less Lonely Girl',
    'Have Yourself A Merry Little Christmas','localStorage','sessionStorage','SameSite=Lax','be_cookie_ack','be_site_preferences'
  ]);
  var MUSIC_TITLE_SECTION_IDS=new Set(['18db9515-179c-4bad-9646-1fcda63df14a']);
  var MUSIC_TITLE_SECTION_NAMES=new Set(['videoclipes','videoclips','music videos','music video','videos musicais','vídeos musicais','videos musicales','vídeos musicales','vidéos musicales','vidéos musicaux']);
  var DYNAMIC_CACHE_KEY='betvDynamicI18n:'+slug+':v8-es-native-music-only';
  var STATIC_REV='20260810-es-native-music-only-v3';

  function isAdmin(){return String(location.hash||'').startsWith('#/admin');}
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
  function protectedText(value){
    var key=normalize(value);
    return PROTECTED_EXACT.has(key)||/^https?:\/\//i.test(key)||/^[@#][\w.-]+$/.test(key)||/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(key)||/^be_[a-z0-9_]+$/i.test(key);
  }
  function protectExact(value){
    var key=normalize(value);
    if(!key)return;
    PROTECTED_EXACT.add(key);
    map[key]=key;
    missingTexts.delete(key);
    translatedThisSession.delete(key);
  }
  function eligibleText(value){
    var key=normalize(value);
    if(!key||key.length<2||key.length>1800||!/\p{L}/u.test(key))return false;
    if(protectedText(key))return false;
    return true;
  }
  function rememberMissing(value){
    if(slug==='pt-br'||isAdmin())return;
    var key=normalize(value);
    if(!eligibleText(key)||Object.prototype.hasOwnProperty.call(map,key)||translatedThisSession.has(key))return;
    missingTexts.add(key);
    scheduleMissingTranslation();
  }
  function translateTextNode(node){
    if(!node||node.nodeType!==3||parentSkipped(node))return;
    var raw=node.nodeValue||'';
    var key=normalize(raw);
    if(!eligibleText(key))return;
    var translated=map[key];
    if(translated&&translated!==key)node.nodeValue=preserveWhitespace(raw,translated);
    else rememberMissing(key);
  }
  function translateAttributes(element){
    if(!element||element.nodeType!==1||parentSkipped(element))return;
    TRANSLATABLE_ATTRIBUTES.forEach(function(attribute){
      if(!element.hasAttribute(attribute))return;
      if(attribute==='value'&&!['BUTTON','INPUT'].includes(element.tagName))return;
      var raw=element.getAttribute(attribute)||'';
      var key=normalize(raw);
      if(!eligibleText(key))return;
      var translated=map[key];
      if(translated&&translated!==raw)element.setAttribute(attribute,translated);
      else rememberMissing(key);
    });
  }
  function apply(root){
    if(slug==='pt-br'||!root||isAdmin())return;
    if(root.nodeType===3){translateTextNode(root);return;}
    if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
    if(root.nodeType===1)translateAttributes(root);
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{
      acceptNode:function(node){
        if(parentSkipped(node))return NodeFilter.FILTER_REJECT;
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
    if(!root||isAdmin())return;
    pendingRoots.push(root);
    if(queued)return;
    queued=true;
    (window.requestAnimationFrame||window.setTimeout)(flushQueue,16);
  }
  function startObserver(){
    if(slug==='pt-br'||observer||!document.documentElement||isAdmin())return;
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
  function t(source,variables){return interpolation(translateExact(source),variables||{});}
  function recordTranslation(record){
    if(!record||typeof record!=='object'||slug==='pt-br')return record;
    var translations=record.translations&&typeof record.translations==='object'?record.translations:{};
    var localized=translations[slug]||translations[target]||null;
    if(!localized||typeof localized!=='object')return record;
    var merged=Object.assign({},record,localized);
    var collection=String(record.collection||'').toLowerCase();
    var sectionId=String(record.sectionId||'').trim();
    var sectionName=String(record.sectionName||record.sourceSectionTitle||'').trim().toLowerCase();
    var explicit=record.preserveTitle===true||String(record.preserveTitle||'').toLowerCase()==='true';
    var keepTitle=['es','fr'].includes(slug)&&(explicit||['albums','albuns','álbuns'].includes(collection)||(collection==='videos'&&(MUSIC_TITLE_SECTION_IDS.has(sectionId)||MUSIC_TITLE_SECTION_NAMES.has(sectionName))));
    if(keepTitle){
      if(Object.prototype.hasOwnProperty.call(record,'title')){merged.title=record.title;protectExact(record.title);}
      if(Object.prototype.hasOwnProperty.call(record,'name')){merged.name=record.name;protectExact(record.name);}
    }
    return merged;
  }
  function regionalCurrency(){
    var value=window.BETVRegional&&window.BETVRegional.currency;
    return String(value||'BRL').toUpperCase()==='USD'?'USD':'BRL';
  }
  function currencyFormatter(currency){return new Intl.NumberFormat(locale,{style:'currency',currency:currency||regionalCurrency()});}
  function loadDynamicCache(){
    try{
      var cached=JSON.parse(localStorage.getItem(DYNAMIC_CACHE_KEY)||'{}');
      if(cached&&typeof cached==='object')Object.keys(cached).forEach(function(key){if(typeof cached[key]==='string')map[key]=cached[key];});
    }catch(_){ }
  }
  function saveDynamicCache(){
    try{
      var dynamic={};
      translatedThisSession.forEach(function(key){if(map[key])dynamic[key]=map[key];});
      var previous=JSON.parse(localStorage.getItem(DYNAMIC_CACHE_KEY)||'{}');
      localStorage.setItem(DYNAMIC_CACHE_KEY,JSON.stringify(Object.assign({},previous&&typeof previous==='object'?previous:{},dynamic)));
    }catch(_){ }
  }
  function translationEndpoint(){
    var base=String((window.BE_SUPABASE_CONFIG&&window.BE_SUPABASE_CONFIG.url)||(window.BE_SITE_CONFIG&&window.BE_SITE_CONFIG.supabaseUrl)||'https://cxkevnnxibhezvospkce.supabase.co').replace(/\/$/,'');
    return base+'/functions/v1/translate-content-record';
  }
  function publishableKey(){return String((window.BE_SUPABASE_CONFIG&&window.BE_SUPABASE_CONFIG.publishableKey)||(window.BE_SITE_CONFIG&&window.BE_SITE_CONFIG.supabasePublishableKey)||'');}
  function takeBatch(){
    var batch=[];
    var chars=0;
    missingTexts.forEach(function(text){
      if(batch.length>=60||chars+text.length>9000)return;
      batch.push(text);chars+=text.length;
    });
    batch.forEach(function(text){missingTexts.delete(text);translatedThisSession.add(text);});
    return batch;
  }
  async function translateMissingNow(){
    if(translationBusy||slug==='pt-br'||isAdmin()||!missingTexts.size)return;
    var batch=takeBatch();
    if(!batch.length)return;
    translationBusy=true;
    try{
      var key=publishableKey();
      var headers={'Content-Type':'application/json'};
      if(key)headers.apikey=key;
      var response=await fetch(translationEndpoint(),{
        method:'POST',
        mode:'cors',
        credentials:'omit',
        headers:headers,
        body:JSON.stringify({mode:'texts',locale:slug,style:'informal-native',texts:batch})
      });
      var payload=await response.json().catch(function(){return null;});
      if(!response.ok||!payload||!Array.isArray(payload.translations))throw new Error(payload&&payload.error||'translation_failed');
      payload.translations.forEach(function(item,index){
        var source=batch[index];
        var translated=String(item||'').trim();
        if(source&&translated){
          map[source]=translated;
          map[translated]=translated;
          translatedThisSession.add(translated);
        }
      });
      saveDynamicCache();
      apply(document.documentElement);
    }catch(error){
      batch.forEach(function(text){translatedThisSession.delete(text);});
      console.warn('Tradução complementar indisponível:',error&&error.message||error);
    }finally{
      translationBusy=false;
      if(missingTexts.size)scheduleMissingTranslation(800);
    }
  }
  function scheduleMissingTranslation(delay){
    if(slug==='pt-br'||isAdmin())return;
    clearTimeout(translateTimer);
    translateTimer=setTimeout(translateMissingNow,Number(delay||350));
  }
  async function load(){
    if(slug==='pt-br'||isAdmin()){
      window.BETVI18n=api;
      readyResolve(api);
      return;
    }
    loadDynamicCache();
    try{
      var response=await fetch('/assets/i18n/'+encodeURIComponent(slug)+'.json?rev='+encodeURIComponent(STATIC_REV),{credentials:'same-origin',cache:'force-cache'});
      if(response.ok){
        var payload=await response.json();
        if(payload&&typeof payload==='object')Object.keys(payload).forEach(function(key){map[key]=payload[key];});
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
    protectExact:protectExact,
    localizeRecord:recordTranslation,
    currency:regionalCurrency,
    switchLanguage:function(nextSlug){return Boolean(window.BETVLocale&&window.BETVLocale.switchTo&&window.BETVLocale.switchTo(nextSlug));},
    formatCurrency:function(cents,currency){return currencyFormatter(currency).format(Number(cents||0)/100);}
  };
  window.BETVI18n=api;

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();

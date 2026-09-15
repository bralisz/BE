;(function(){
  'use strict';

  var localeApi=window.BETVLocale||{slug:'pt-br',locale:'pt-BR',target:'pt'};
  var slug=String(localeApi.slug||'pt-br').toLowerCase();
  var locale=String(localeApi.locale||'pt-BR');
  var target=String(localeApi.target||({'en-us':'en','es':'es','fr':'fr','it':'it'}[slug]||'pt'));
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
    'BE','BETV','Billie Eilish','Billie Eilish TV','FINNEAS','Avocado','Eyelash','Blohsh','Discord','Google','Instagram','TikTok','Twitter / X','Spotify','YouTube',
    'Apple TV','Prime Video','Paramount+','Disney+','Stripe','Supabase','CC BY-SA 4.0','LGPD','DMCA','HTTPS','BRL','USD',
    'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?','HIT ME HARD AND SOFT','Happier Than Ever','dont smile at me','Guitar Songs',
    'all the good girls go to hell','bad guy','Bellyache','BIRDS OF A FEATHER','Bored','bury a friend','CHIHIRO','everything i wanted',
    'Guess','hostage','idontwannabeyouanymore','Lo Vas A Olvidar','Lost Cause','lovely','LUNCH','Male Fantasy','my future','NDA',
    'Never Felt So Alone','No Time To Die','Ocean Eyes','ocean eyes','Therefore I Am','watch','What Was I Made For?',
    "when the party's over",'xanny','you should see me in a crown','Your Power','THE GREATEST','SKINNY',"L'AMOUR DE MA VIE",
    'Billie Bossa Nova','Getting Older','TV','bitches broken hearts','listen before i go','come out and play','One Less Lonely Girl',
    'Have Yourself A Merry Little Christmas','localStorage','sessionStorage','SameSite=Lax','be_cookie_ack','be_site_preferences','Film'
  ]);
  var MUSIC_TITLE_SECTION_IDS=new Set(['18db9515-179c-4bad-9646-1fcda63df14a','14386598-4978-403a-8548-db0ee582e291']);
  var MUSIC_TITLE_SECTION_NAMES=new Set(['videoclipes','videoclips','music videos','music video','videos musicais','vídeos musicais','videos musicales','vídeos musicales','vidéos musicales','vidéos musicaux','live performances & tv']);
  var DYNAMIC_CACHE_KEY='betvDynamicI18n:'+slug+':v14-it-wiki-live';
  var STATIC_REV='20260823-it-wiki-live-v1';
  var BUILD_REV=String(window.__BETV_DEPLOYMENT_VERSION__||STATIC_REV);

  function isAdmin(){return String(location.hash||'').startsWith('#/admin');}
  function normalize(value){return String(value==null?'':value).replace(/\s+/g,' ').trim();}
  function italianInitialUpper(value){
    var raw=String(value==null?'':value);
    if(slug!=='it'||!raw)return raw;
    return raw.replace(/^(\s*)(\p{L})/u,function(_,space,letter){return space+letter.toLocaleUpperCase('it-IT');});
  }
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
  function repairPlaceholders(source,translated){
    var src=String(source||''),out=String(translated||'');
    var sourceTokens=src.match(/\{[a-zA-Z0-9_]+\}/g)||[];
    if(!sourceTokens.length)return out;
    var translatedTokens=out.match(/\{[^{}]+\}/g)||[];
    if(sourceTokens.length!==translatedTokens.length)return out;
    translatedTokens.forEach(function(token,index){out=out.replace(token,sourceTokens[index]);});
    return out;
  }
  function normalizeImportedTranslation(source,translated){
    var out=repairPlaceholders(source,translated);
    if(slug==='it'){
      if(String(source||'').indexOf('Discord')>=0)out=out.replace(/Discordia/g,'Discord');
      if(String(source||'').indexOf('YouTube')>=0)out=out.replace(/Billie EilishYouTube/g,'YouTube di Billie Eilish');
      if(String(source||'').toLowerCase().indexOf('banner')>=0)out=out.replace(/\bbandiera\b/gi,'banner');
      if(normalize(source)==='Fã da Billie')out='Fan di Billie';
      if(normalize(source)==='Live'||normalize(source)==='Ao vivo')out='Dal vivo';
      if(normalize(source)==='Live Performances & TV')out='Spettacoli dal vivo e TV';
    }
    return out;
  }
  function enforceItalianCanonicalLabels(root){
    if(slug!=='it')return;
    var scope=(root&&root.querySelectorAll)?root:document;
    var buttons=[];
    if(root&&root.nodeType===1&&root.matches&&root.matches('[data-home-view="films"]'))buttons.push(root);
    if(scope&&scope.querySelectorAll)buttons=buttons.concat(Array.from(scope.querySelectorAll('[data-home-view="films"]')));
    buttons.forEach(function(button){
      var label=button.querySelector&&button.querySelector('span');
      if(label)label.textContent='Film';else button.textContent='Film';
    });
    if(scope&&scope.querySelectorAll)scope.querySelectorAll('[data-mobile-destination="films"] span').forEach(function(label){label.textContent='Film';});
  }
  function mergeTranslations(values,options){
    if(!values||typeof values!=='object')return 0;
    var count=0;
    Object.keys(values).forEach(function(source){
      var translated=values[source];
      if(typeof translated!=='string'||!translated.trim())return;
      var key=normalize(source);
      if(!key)return;
      var stable=normalizeImportedTranslation(key,translated.trim());
      map[key]=stable;
      map[stable]=stable;
      missingTexts.delete(key);
      count+=1;
    });
    if(slug==='it'){
      map.Filmes='Film';map.Film='Film';PROTECTED_EXACT.add('Film');
      map['Fã da Billie']='Fan di Billie';map['Fan di Billie']='Fan di Billie';
      map.Live='Dal vivo';map['Ao vivo']='Dal vivo';map['Dal vivo']='Dal vivo';
      map['Live Performances & TV']='Spettacoli dal vivo e TV';
    }
    if(options&&options.persist){
      try{
        var previous=JSON.parse(localStorage.getItem(DYNAMIC_CACHE_KEY)||'{}');
        var stableBundle={};
        Object.keys(values).forEach(function(source){
          var translated=values[source];
          if(typeof translated==='string'&&translated.trim())stableBundle[source]=normalizeImportedTranslation(source,translated.trim());
        });
        localStorage.setItem(DYNAMIC_CACHE_KEY,JSON.stringify(Object.assign({},previous&&typeof previous==='object'?previous:{},stableBundle)));
      }catch(_){ }
    }
    if(options&&options.shared)window.__BETV_ITALIAN_SHARED_I18N_READY__=true;
    if(!options||options.applyNow!==false){apply(document.documentElement);enforceItalianCanonicalLabels(document);}
    return count;
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
    enforceItalianCanonicalLabels(root);
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
    var recordType=String(record.type||record.itemType||'').trim().toLowerCase();
    var explicit=record.preserveTitle===true||String(record.preserveTitle||'').toLowerCase()==='true';
    var isAlbumRecord=collection==='news'&&['album','álbum','single'].includes(recordType);
    var keepTitle=['es','fr','it'].includes(slug)&&(explicit||isAlbumRecord||['albums','albuns','álbuns'].includes(collection)||(collection==='videos'&&(MUSIC_TITLE_SECTION_IDS.has(sectionId)||MUSIC_TITLE_SECTION_NAMES.has(sectionName))));
    if(keepTitle){
      if(Object.prototype.hasOwnProperty.call(record,'title')){merged.title=record.title;protectExact(record.title);}
      if(Object.prototype.hasOwnProperty.call(record,'name')){merged.name=record.name;protectExact(record.name);}
    }
    if(slug==='it'){
      if(collection==='sections'){
        if(typeof merged.title==='string')merged.title=italianInitialUpper(merged.title);
        if(typeof merged.name==='string')merged.name=italianInitialUpper(merged.name);
      }
      if(typeof merged.sectionName==='string')merged.sectionName=italianInitialUpper(merged.sectionName);
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
    return base+'/functions/v1/'+(slug==='it'?'translate-content-record-it':'translate-content-record');
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
          translated=normalizeImportedTranslation(source,translated);
          map[source]=translated;
          map[translated]=translated;
          translatedThisSession.add(translated);
        }
      });
      saveDynamicCache();
      apply(document.documentElement);
    }catch(error){
      batch.forEach(function(text){translatedThisSession.delete(text);});
      (void error);
    }finally{
      translationBusy=false;
      if(missingTexts.size)scheduleMissingTranslation(800);
    }
  }
  function scheduleMissingTranslation(delay){
    if(slug==='pt-br'||isAdmin())return;
    clearTimeout(translateTimer);
    var requested=Number(delay||350);
    if(slug==='it'&&!window.__BETV_ITALIAN_SHARED_I18N_READY__)requested=Math.max(requested,1800);
    translateTimer=setTimeout(translateMissingNow,requested);
  }
  function italianHomeRoute(){
    if(slug!=='it')return false;
    try{
      var path=String(location.pathname||'/').replace(/^\/it(?=\/|$)/i,'')||'/';
      return path==='/'||path==='';
    }catch(_){return false;}
  }
  function loadItalianSharedBundle(){
    if(slug!=='it'||italianHomeRoute())return Promise.resolve(null);
    if(window.__BETV_ITALIAN_SHARED_I18N_PROMISE__)return window.__BETV_ITALIAN_SHARED_I18N_PROMISE__;
    var promise=fetch('/api/public-data?name=settings&id=site&locale=it',{credentials:'same-origin',cache:'default',headers:{Accept:'application/json'}})
      .then(function(response){return response.ok?response.json():null;})
      .then(function(settings){
        var bundle=settings&&settings.italianUiTranslations;
        if(bundle&&typeof bundle==='object')mergeTranslations(bundle,{applyNow:true,persist:true,shared:true});
        return bundle||null;
      })
      .catch(function(){return null;});
    window.__BETV_ITALIAN_SHARED_I18N_PROMISE__=promise;
    return promise;
  }
  async function load(){
    if(slug==='pt-br'||isAdmin()){
      window.BETVI18n=api;
      readyResolve(api);
      return;
    }
    loadDynamicCache();
    var inlineBundle=window.__BETV_INLINE_I18N__&&window.__BETV_INLINE_I18N__[slug];
    if(inlineBundle&&typeof inlineBundle==='object')mergeTranslations(inlineBundle,{applyNow:false});

    // O núcleo italiano entra antes de qualquer fetch. Assim a primeira visita
    // não exibe PT-BR enquanto espera o arquivo ou a tradução dinâmica.
    if(slug==='it'){
      window.BETVI18n=api;
      apply(document.documentElement);
      startObserver();
      enforceItalianCanonicalLabels(document);
      readyResolve(api);
      try{window.dispatchEvent(new CustomEvent('be:i18n-ready',{detail:api}));}catch(_){ }
      fetch('/assets/i18n/'+encodeURIComponent(slug)+'.json?rev='+encodeURIComponent(STATIC_REV)+'&build='+encodeURIComponent(BUILD_REV),{credentials:'same-origin',cache:'default'})
        .then(function(response){return response.ok?response.json():null;})
        .then(function(payload){if(payload&&typeof payload==='object')mergeTranslations(payload,{applyNow:true});})
        .catch(function(){});
      loadItalianSharedBundle();
      return;
    }

    try{
      var response=await fetch('/assets/i18n/'+encodeURIComponent(slug)+'.json?rev='+encodeURIComponent(STATIC_REV)+'&build='+encodeURIComponent(BUILD_REV),{credentials:'same-origin',cache:'default'});
      if(response.ok){
        var payload=await response.json();
        if(payload&&typeof payload==='object')mergeTranslations(payload,{applyNow:false});
      }
    }catch(error){(void error);}
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
    mergeTranslations:mergeTranslations,
    localizeRecord:recordTranslation,
    currency:regionalCurrency,
    switchLanguage:function(nextSlug){return Boolean(window.BETVLocale&&window.BETVLocale.switchTo&&window.BETVLocale.switchTo(nextSlug));},
    formatCurrency:function(cents,currency){return currencyFormatter(currency).format(Number(cents||0)/100);}
  };
  window.BETVI18n=api;

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();

/* Keep the head tied to the current public route during client navigation. */
;(function () {
  'use strict';
  if (window.BETVSeo) return;
  var origin = 'https://billieilishtv.site';
  var fallbackImage = 'https://i.imgur.com/tnBMpHr.png';
  var cache = new Map();
  var version = 0, timer = null, controller = null;
  var initialPath = location.pathname;

  function capture() {
    var script = document.querySelector('script[data-betv-seo]');
    var structured = null;
    try { structured = script ? JSON.parse(script.textContent) : null; } catch (_) {}
    return {
      title: document.title,
      meta: Array.from(document.head.querySelectorAll('meta')).flatMap(function (node) {
        var kind = node.hasAttribute('property') ? 'property' : 'name';
        var key = node.getAttribute(kind) || '';
        return /^(description$|robots$|og:|twitter:)/.test(key) ? [{kind:kind,key:key,content:node.content}] : [];
      }),
      links: Array.from(document.head.querySelectorAll('link[rel="canonical"],link[rel="alternate"][hreflang]')).map(function (node) {
        return {rel:node.rel,href:node.href,hreflang:node.hreflang || ''};
      }),
      structuredData: structured,
      publicFactsHtml: document.getElementById('detailSeoFacts')?.innerHTML || ''
    };
  }
  function remember(path, value) {
    cache.delete(path); cache.set(path, {value:value,expires:Date.now() + 300000});
    if (cache.size > 40) cache.delete(cache.keys().next().value);
  }
  function cached(path) {
    var entry = cache.get(path);
    return entry && entry.expires > Date.now() ? entry.value : null;
  }
  function publicRoute() {
    return !/^#\/admin/.test(location.hash) && !/^\/(?:pt-br\/|en-us\/|es\/|fr\/|it\/)?(?:admin|api|oauth)(?:\/|$)/i.test(location.pathname);
  }
  function apply(data) {
    if (!data || typeof data.title !== 'string' || !Array.isArray(data.meta) || !Array.isArray(data.links)) return;
    document.title = data.title;
    const facts = document.getElementById('detailSeoFacts');
    if (facts && Object.prototype.hasOwnProperty.call(data, 'publicFactsHtml')) {
      facts.innerHTML = String(data.publicFactsHtml || '');
      facts.hidden = !data.publicFactsHtml;
      document.getElementById('contentDetailSection')?.classList.toggle('has-public-facts',Boolean(data.publicFactsHtml));
    }
    var title = document.querySelector('title');
    if (title) { title.setAttribute('translate', 'no'); title.setAttribute('data-i18n-ignore', ''); }
    document.head.querySelectorAll('meta[name="description"],meta[name="robots"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],link[rel="alternate"][hreflang],script[data-betv-seo]').forEach(function (node) {node.remove();});
    data.meta.forEach(function (item) {
      if (!['name','property'].includes(item.kind) || !/^(description$|robots$|og:|twitter:)/.test(item.key)) return;
      var node = document.createElement('meta'); node.setAttribute(item.kind,item.key); node.content = String(item.content || ''); document.head.appendChild(node);
    });
    data.links.forEach(function (item) {
      if (!['canonical','alternate'].includes(item.rel) || !/^https?:\/\//.test(item.href || '')) return;
      var node = document.createElement('link'); node.rel = item.rel; node.href = item.href;
      if (item.hreflang) node.hreflang = item.hreflang;
      document.head.appendChild(node);
    });
    if (data.structuredData) {
      var script = document.createElement('script'); script.type = 'application/ld+json'; script.dataset.betvSeo = 'true';
      script.textContent = JSON.stringify(data.structuredData).replace(/</g, '\\u003c'); document.head.appendChild(script);
    }
  }
  function locale() {return String(window.BETVLocale && window.BETVLocale.slug || 'pt-br');}
  function logicalPath() {return location.pathname.replace(/^\/(?:pt-br|en-us|es|fr|it)(?=\/|$)/i,'') || '/';}
  function plain(value) {
    var source = String(value || '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]*>/g,' ');
    var decoder = document.createElement('textarea'); decoder.innerHTML = source.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return decoder.value.replace(/!?\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*_`#]/g,'').replace(/\s+/g,' ').trim();
  }
  function contentKind(data) {
    if (String(data.collection || 'videos').toLowerCase() !== 'videos') return '';
    var context = [
      data.title, data.sectionName, data.sourceSectionTitle,
      data.categoryName, data.videoType, data.itemType, data.type
    ].filter(Boolean).join(' ').toLowerCase();
    if (/(?:entrevist|interview|entretien|intervista)/i.test(context)) return 'interview';
    if (/(?:live performance|ao vivo|apresenta[cç][aã]o|concert|concerto|show ao vivo|esibizione dal vivo|spectacle en direct)/i.test(context)) return 'performance';
    return '';
  }
  function videoTitle(title,kind,slug) {
    if (!kind || title.length > 48 || /billie\s+eilish/i.test(title)) return title + ' | Billie Eilish TV';
    var context = {
      'pt-br': {interview:'Entrevista com Billie Eilish',performance:'Billie Eilish ao vivo'},
      'en-us': {interview:'Billie Eilish interview',performance:'Billie Eilish live'},
      es: {interview:'Entrevista con Billie Eilish',performance:'Billie Eilish en vivo'},
      fr: {interview:'Interview de Billie Eilish',performance:'Billie Eilish en concert'},
      it: {interview:'Intervista a Billie Eilish',performance:'Billie Eilish dal vivo'}
    }[slug] || {};
    return context[kind] ? title + ' — ' + context[kind] + ' | Billie Eilish TV' : title + ' | Billie Eilish TV';
  }
  function videoDescription(title,kind,slug) {
    var messages = {
      'pt-br': {interview:'Assista à entrevista {title} com Billie Eilish na Billie Eilish TV.',performance:'Assista à apresentação {title} de Billie Eilish ao vivo na Billie Eilish TV.'},
      'en-us': {interview:'Watch the {title} interview with Billie Eilish on Billie Eilish TV.',performance:'Watch Billie Eilish perform {title} live on Billie Eilish TV.'},
      es: {interview:'Mira la entrevista {title} con Billie Eilish en Billie Eilish TV.',performance:'Mira la presentación en vivo {title} de Billie Eilish en Billie Eilish TV.'},
      fr: {interview:'Regardez l’entretien {title} avec Billie Eilish sur Billie Eilish TV.',performance:'Regardez la prestation en direct {title} de Billie Eilish sur Billie Eilish TV.'},
      it: {interview:'Guarda l’intervista {title} con Billie Eilish su Billie Eilish TV.',performance:'Guarda l’esibizione dal vivo {title} di Billie Eilish su Billie Eilish TV.'}
    };
    var template=(messages[slug]||messages['pt-br'])[kind];
    return template ? template.replace('{title}',title) : '';
  }
  function contentMetadata(data) {
    var title = String(data.title || '').trim();
    if (!title) return null;
    var slug = locale(), logical = logicalPath();
    var descriptions = {
      'pt-br': 'Explore {title} na Billie Eilish TV.', 'en-us': 'Explore {title} on Billie Eilish TV.',
      es: 'Explora {title} en Billie Eilish TV.', fr: 'Découvrez {title} sur Billie Eilish TV.', it: 'Scopri {title} su Billie Eilish TV.'
    };
    var kind = contentKind(data);
    var description = plain(data.description) || videoDescription(title,kind,slug) || (descriptions[slug] || descriptions['pt-br']).replace('{title}',title);
    var canonical = origin + '/' + slug + logical;
    var image = fallbackImage;
    try { var candidate = new URL(data.thumbnailUrl || data.imageUrl || data.bannerUrl || '',origin); if (/^https?:$/.test(candidate.protocol) && (data.thumbnailUrl || data.imageUrl || data.bannerUrl)) image = candidate.href; } catch (_) {}
    var name = videoTitle(title,kind,slug);
    var values = [
      ['name','description',description.slice(0,300)], ['name','robots','index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'],
      ['property','og:type','website'], ['property','og:site_name','Billie Eilish TV'], ['property','og:locale',({'pt-br':'pt_BR','en-us':'en_US',es:'es_ES',fr:'fr_FR',it:'it_IT'})[slug]],
      ['property','og:title',name], ['property','og:description',description.slice(0,300)], ['property','og:url',canonical], ['property','og:image',image], ['property','og:image:alt',title],
      ['name','twitter:card','summary_large_image'], ['name','twitter:title',name], ['name','twitter:description',description.slice(0,300)], ['name','twitter:image',image], ['name','twitter:image:alt',title]
    ];
    var links = [{rel:'canonical',href:canonical}];
    [['pt-br','pt-BR'],['en-us','en-US'],['es','es'],['fr','fr'],['it','it']].forEach(function (item) {links.push({rel:'alternate',hreflang:item[1],href:origin + '/' + item[0] + logical});});
    links.push({rel:'alternate',hreflang:'x-default',href:origin + logical});
    return {title:name,meta:values.map(function (item) {return {kind:item[0],key:item[1],content:item[2]};}),links:links,structuredData:null,publicFactsHtml:''};
  }
  async function refresh(path, requestVersion) {
    try {
      var requestController = new AbortController(); controller = requestController;
      var deadline = setTimeout(function () {requestController.abort();},18000);
      var params = new URLSearchParams({format:'seo',path:path});
      var response = await fetch('/api/site-page?' + params.toString(), {headers:{Accept:'application/json'},signal:requestController.signal,credentials:'same-origin'});
      if (!response.ok) return;
      var data = await response.json();
      if (requestVersion !== version || location.pathname !== path || !publicRoute()) return;
      remember(path,data); apply(data);
    } catch (_) {
      // Preserve the current content's own metadata if the server is offline.
    } finally { clearTimeout(deadline); }
  }
  function syncRoute() {
    if (!publicRoute()) return;
    version += 1;
    if (controller) controller.abort();
    clearTimeout(timer);
    var path = location.pathname, metadata = cached(path);
    if (metadata) apply(metadata);
    else {
      // A new URL must never keep the previous video's title or JSON-LD.
      apply({title:'Billie Eilish TV',meta:[],links:[],structuredData:null,publicFactsHtml:''});
    }
    var requestVersion = version;
    timer = setTimeout(function () {refresh(path,requestVersion);},25);
  }
  remember(initialPath,capture());
  var initialTitleNode = document.querySelector('title');
  if (initialTitleNode) {initialTitleNode.setAttribute('translate','no');initialTitleNode.setAttribute('data-i18n-ignore','');}
  window.BETVSeo = {pageTitle:function () {var item = cached(location.pathname);return item ? item.title : null;}};
  window.addEventListener('be:route-change',syncRoute);
  window.addEventListener('popstate',syncRoute);
  window.addEventListener('be:content-seo',function (event) {
    if (!publicRoute()) return;
    var data = event.detail || {};
    var id = String(data.itemId || '');
    var route = logicalPath();
    if (route !== '/' + id && !(id && route.endsWith('-' + id) && /^\/(?:show|entrevista|podcast|videoclipe|video|filme|serie)\//i.test(route))) return;
    var metadata = contentMetadata(data);
    if (metadata) {
      remember(location.pathname,metadata); apply(metadata);
      version += 1;
      if (controller) controller.abort();
      clearTimeout(timer);
      refresh(location.pathname,version);
    }
  });
})();

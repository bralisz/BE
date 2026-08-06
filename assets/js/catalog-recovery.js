(function(){
  'use strict';

  var API_BASE='/api/public-data';
  var attempts=0;
  var running=false;
  var retryTimer=0;

  function onHomeRoute(){
    var path='/';
    try{path=String(window.BETVLocalePath?window.BETVLocalePath():(location.pathname||'/')).replace(/\/+$/,'')||'/';}catch(_){path=location.pathname||'/';}
    if(path!=='/')return false;
    var body=document.body;
    if(!body)return false;
    return ![
      'login-mode','admin-mode','profile-page-active','settings-page-active','detail-page-active',
      'support-page-active','legal-page-active','notification-page-active','billie-page-active','donate-page-active'
    ].some(function(name){return body.classList.contains(name);});
  }

  function hasCatalog(){
    var host=document.getElementById('dynamicSections');
    return Boolean(host&&host.querySelector('.video-card'));
  }

  function unwrap(row){
    if(!row||typeof row!=='object')return null;
    var source=row.get_public_content_items||row.item||row;
    if(!source||typeof source!=='object')return null;
    if(source.data&&typeof source.data==='object'&&!Array.isArray(source.data)){
      return Object.assign({id:source.id,createdAt:source.created_at||'',updatedAt:source.updated_at||''},source.data);
    }
    return Object.assign({},source);
  }

  function normalize(payload){
    var rows=Array.isArray(payload)?payload:(payload&&Array.isArray(payload.data)?payload.data:[]);
    return rows.map(unwrap).filter(Boolean);
  }

  function timedFetch(url,options,timeout){
    var controller=typeof AbortController==='function'?new AbortController():null;
    var id=controller?setTimeout(function(){controller.abort();},timeout||10000):0;
    return fetch(url,Object.assign({},options||{},controller?{signal:controller.signal}:{})).finally(function(){if(id)clearTimeout(id);});
  }

  async function fromPublicApi(name){
    var params=new URLSearchParams({name:name,_:String(Date.now())});
    var response=await timedFetch(API_BASE+'?'+params.toString(),{
      method:'GET',credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}
    },10000);
    if(!response.ok)throw new Error('public_api_'+response.status);
    return normalize(await response.json());
  }

  async function fromSupabase(name){
    var config=window.BE_SUPABASE_CONFIG||{};
    var url=String(config.url||'').replace(/\/$/,'');
    var key=String(config.publishableKey||'').trim();
    if(!url||!key)throw new Error('supabase_config_missing');
    var response=await timedFetch(url+'/rest/v1/rpc/get_public_content_items',{
      method:'POST',cache:'no-store',
      headers:{apikey:key,Authorization:'Bearer '+key,Accept:'application/json','Content-Type':'application/json'},
      body:JSON.stringify({p_collection:name,p_id:null})
    },12000);
    if(!response.ok)throw new Error('supabase_rpc_'+response.status);
    return normalize(await response.json());
  }

  async function collection(name,required){
    var rows=[];
    try{rows=await fromPublicApi(name);}catch(_){rows=[];}
    if(rows.length||!required)return rows;
    try{rows=await fromSupabase(name);}catch(_){rows=[];}
    return rows;
  }

  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];
    });
  }

  function safeUrl(value){
    var raw=String(value||'').trim();
    if(!raw)return '#';
    if(/^\/(?!\/)/.test(raw)||/^https?:\/\//i.test(raw)||raw.charAt(0)==='#')return raw;
    return '#';
  }

  function imageUrl(value){
    var raw=safeUrl(value);
    if(raw==='#')return '';
    try{return window.beMediaUrl?window.beMediaUrl(raw):raw;}catch(_){return raw;}
  }

  function numericId(value){
    var text=String(value||'video').trim();
    if(/^\d{8}$/.test(text))return text;
    var hash=2166136261;
    for(var index=0;index<text.length;index+=1){hash^=text.charCodeAt(index);hash=Math.imul(hash,16777619);}
    return String(10000000+((hash>>>0)%90000000));
  }

  function normalized(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/-/g,' ');
  }

  function groupsFrom(sections,videos){
    var result=[];
    var seen=new Set();
    (sections||[]).filter(function(item){return item&&item.active!==false;}).forEach(function(section,index){
      var id=String(section.id||'').trim();
      var key=id||normalized(section.title||section.category)||'section-'+index;
      if(seen.has(key))return;
      seen.add(key);
      result.push({
        id:id||'recovery-'+numericId(key),
        title:String(section.title||section.sectionName||section.category||'Vídeos'),
        category:String(section.category||section.slug||''),
        order:Number(section.order||index),
        itemLimit:Math.max(1,Number(section.itemLimit||12))
      });
    });
    if(result.length)return result.sort(function(a,b){return a.order-b.order;});

    (videos||[]).forEach(function(video,index){
      var id=String(video.sectionId||'').trim();
      var title=String(video.sectionName||video.category||video.type||'Vídeos').trim()||'Vídeos';
      var key=id||normalized(title);
      if(seen.has(key))return;
      seen.add(key);
      result.push({id:id||'recovery-'+numericId(key),title:title,category:String(video.category||''),order:index,itemLimit:12});
    });
    if(!result.length&&(videos||[]).length)result.push({id:'recovery-videos',title:'Vídeos',category:'videos',order:0,itemLimit:12});
    return result;
  }

  function belongs(video,section){
    if(String(video.sectionId||'')&&String(video.sectionId)===String(section.id))return true;
    var keys=[section.title,section.category,section.id].map(normalized).filter(Boolean);
    return [video.sectionName,video.category,video.type].map(normalized).some(function(value){return value&&keys.indexOf(value)!==-1;});
  }

  function card(video){
    var title=String(video.title||'Conteúdo');
    var recordId=String(video.id||video.videoId||title);
    var publicId=String(video.publicId||numericId(recordId));
    var image=imageUrl(video.thumbnailUrl||video.imageUrl||video.bannerUrl||'');
    var content=safeUrl(video.videoUrl||video.contentUrl||video.link||'#');
    return '<a class="video-card" href="/'+encodeURIComponent(publicId)+'" aria-label="'+esc(title)+'" '+
      'data-item-id="'+esc(publicId)+'" data-record-id="'+esc(recordId)+'" data-open-detail="true" '+
      'data-title="'+esc(title)+'" data-description="'+esc(video.description||'')+'" '+
      'data-year="'+esc(video.year||'')+'" data-duration="'+esc(video.duration||video.videoDuration||video.runtime||'')+'" '+
      'data-content-url="'+esc(content)+'" data-image-url="'+esc(image)+'" data-banner-url="'+esc(imageUrl(video.bannerUrl||video.imageUrl||video.thumbnailUrl||''))+'" '+
      'data-category="'+esc(normalized(video.category||video.type||''))+'" data-collection="videos" '+
      'data-section-id="'+esc(video.sectionId||'')+'" data-section-name="'+esc(video.sectionName||'')+'">'+
      (image?'<img class="video-card-thumbnail" src="'+esc(image)+'" alt="'+esc(title)+'" loading="lazy" decoding="async">':'<span class="ph ph-wide" style="height:100%"></span>')+
    '</a>';
  }

  function sectionHtml(section,items){
    var visible=items.slice(0,Math.max(1,Number(section.itemLimit||12)));
    return '<section class="video-rail-section" data-category="'+esc(normalized(section.category||section.title))+'" data-collection="mixed" data-home-view="default" data-has-videos="true">'+
      '<a class="video-rail-title" href="#" aria-label="Ver todos: '+esc(section.title)+'"><span>'+esc(section.title)+'</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a>'+
      '<div class="video-rail-shell"><button class="video-rail-arrow prev" type="button" aria-label="Ver conteúdos anteriores" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg></button>'+
      '<div class="video-rail" tabindex="0" aria-label="'+esc(section.title)+'">'+(visible.length?visible.map(card).join(''):'<p class="video-rail-empty">Nenhum conteúdo publicado nesta seção.</p>')+'</div>'+
      '<button class="video-rail-arrow next" type="button" aria-label="Ver mais conteúdos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg></button></div></section>';
  }

  function bindArrows(host){
    host.querySelectorAll('.video-rail-section').forEach(function(section){
      var rail=section.querySelector('.video-rail');
      var prev=section.querySelector('.video-rail-arrow.prev');
      var next=section.querySelector('.video-rail-arrow.next');
      if(!rail)return;
      function update(){
        if(prev)prev.hidden=rail.scrollLeft<=4;
        if(next)next.hidden=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-4;
      }
      if(prev)prev.addEventListener('click',function(){rail.scrollBy({left:-Math.max(260,rail.clientWidth*.8),behavior:'smooth'});});
      if(next)next.addEventListener('click',function(){rail.scrollBy({left:Math.max(260,rail.clientWidth*.8),behavior:'smooth'});});
      rail.addEventListener('scroll',update,{passive:true});
      requestAnimationFrame(update);
    });
  }

  function showError(){
    if(!onHomeRoute()||hasCatalog())return;
    var main=document.querySelector('main');
    if(!main)return;
    var host=document.getElementById('dynamicSections');
    if(!host){host=document.createElement('section');host.id='dynamicSections';host.className='video-catalog catalog-recovery-error';main.insertAdjacentElement('afterend',host);}
    host.innerHTML='<section class="video-rail-section" data-home-view="default"><div class="video-rail-empty" style="padding:28px 24px;text-align:center"><strong style="display:block;margin-bottom:8px;color:#f5f5f7">O catálogo não conseguiu carregar.</strong><span style="display:block;margin-bottom:16px">Tente novamente para reconectar aos vídeos.</span><button type="button" data-catalog-recovery-retry style="min-height:42px;padding:0 18px;border:0;border-radius:12px;cursor:pointer;font-weight:700">Tentar novamente</button></div></section>';
    host.querySelector('[data-catalog-recovery-retry]').addEventListener('click',function(){attempt(true);});
  }

  async function attempt(force){
    if(running||!onHomeRoute()||(!force&&hasCatalog()))return;
    running=true;attempts+=1;
    try{
      var result=await Promise.all([collection('sections',true),collection('videos',true)]);
      var sections=result[0]||[];
      var videos=(result[1]||[]).filter(function(item){return item&&item.active!==false;});
      if(!videos.length)throw new Error('empty_videos');
      var groups=groupsFrom(sections,videos);
      var html=groups.map(function(section){return sectionHtml(section,videos.filter(function(video){return belongs(video,section);}));}).join('');
      if(!html)html=sectionHtml({id:'recovery-videos',title:'Vídeos',category:'videos',itemLimit:12},videos);
      if(!onHomeRoute()||hasCatalog())return;
      var main=document.querySelector('main');
      if(!main)return;
      var old=document.getElementById('dynamicSections');
      var host=document.createElement('section');
      host.id='dynamicSections';host.className='video-catalog';host.dataset.catalogRecovery='true';host.setAttribute('aria-label','Categorias de conteúdos');host.innerHTML=html;
      if(old)old.replaceWith(host);else main.insertAdjacentElement('afterend',host);
      bindArrows(host);
      window.__beCatalogReady=true;
      window.dispatchEvent(new Event('be:catalog-ready'));
    }catch(error){
      if(attempts>=2)showError();
      if(attempts<5){clearTimeout(retryTimer);retryTimer=setTimeout(function(){attempt(false);},Math.min(15000,1500*Math.pow(2,attempts)));}
    }finally{running=false;}
  }

  function schedule(){
    clearTimeout(retryTimer);
    retryTimer=setTimeout(function(){attempt(false);},1800);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  window.addEventListener('load',schedule,{once:true});
  window.addEventListener('be:content-ready',schedule);
  window.addEventListener('be:home-entered',schedule);
  window.addEventListener('online',schedule);
})();

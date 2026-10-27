'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const handler=require('../server/api-routes/site-page');
const savedFetch=global.fetch;
const locales=['pt-br','en-us','es','fr','it'];
const translated=Object.fromEntries(locales.map(slug=>[slug,{title:'Vídeo A '+slug,description:'Descrição A '+slug}]));
const records=[{id:'a',data:{publicId:'12345678',title:'Vídeo A pt-br',description:'Descrição A pt-br',thumbnailUrl:'https://example.test/a.webp',translations:translated}},{id:'b',data:{publicId:'87654321',title:'Vídeo B',description:'Descrição B',thumbnailUrl:'https://example.test/b.webp'}}];
global.fetch=async(url,options)=>({ok:true,json:async()=>String(url).includes('site_settings')?[]:JSON.parse(options.body).p_collection==='videos'?records:[]});
async function response(path,query={}){
 const res={code:0,body:'',setHeader(){},status(n){this.code=n;return this;},send(s){this.body=s;return this;},end(){}};
 await handler({method:'GET',url:path,query,headers:{host:'billieilishtv.site'}},res);return res;
}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(test){for(let i=0;i<100;i++){if(test())return;await delay(10);}throw new Error('SEO did not settle');}
(async()=>{
 assert.equal(fs.readFileSync('assets/js/seo.js','utf8'),fs.readFileSync('_static/chunks/seo.js','utf8'));
 for(const slug of locales){
  const home=await response('/'+slug);
  const dom=new JSDOM(home.body,{url:'https://billieilishtv.site/'+slug,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,d=w.document;let calls=0;
  const normalFetch=async raw=>{
   calls++;const url=new URL(raw,w.location.origin);const result=await response(url.pathname,Object.fromEntries(url.searchParams));
   return{ok:result.code===200,json:async()=>JSON.parse(result.body)};
  };
  w.fetch=normalFetch;
  w.eval(fs.readFileSync('assets/js/locale-routing.js','utf8'));
  w.eval(fs.readFileSync('assets/js/seo.js','utf8'));
  const initialTitle=d.title;
  function navigate(id,title,description){
   w.history.pushState({},'','/'+id);
   w.dispatchEvent(new w.CustomEvent('be:content-seo',{detail:{itemId:id,title,description,imageUrl:'https://example.test/'+id+'.webp'}}));
  }
  navigate('12345678','Vídeo A '+slug,'Descrição A '+slug);
  assert.equal(d.title,'Vídeo A '+slug+' | Billie Eilish TV','selected card sets its own title immediately');
  assert.equal(d.querySelector('link[rel="canonical"]').href,`https://billieilishtv.site/${slug}/12345678`);
  await until(()=>d.querySelector('script[data-betv-seo]'));
  assert.equal(d.querySelector('meta[name="description"]').content,'Descrição A '+slug);
  assert.equal(w.BETVPageTitle(),d.title,'settings/startup cannot restore the previous page title');
  assert.equal(d.querySelector('meta[property="og:image"]').content,'https://example.test/a.webp');
  assert.equal(d.querySelectorAll('link[hreflang]').length,6);
  assert.equal(d.querySelector('title').getAttribute('translate'),'no');
  navigate('87654321','Vídeo B','Descrição B');
  assert.equal(d.title,'Vídeo B | Billie Eilish TV');
  assert.equal(d.querySelector('script[data-betv-seo]'),null,'remove previous video JSON-LD before the response');
  await until(()=>d.querySelector('script[data-betv-seo]'));
  assert.equal(d.querySelector('meta[property="og:title"]').content,d.title);
  assert.equal(d.querySelector('meta[name="twitter:title"]').content,d.title);
  assert.equal(d.querySelectorAll('meta[name="description"]').length,1);
  assert.equal(d.querySelectorAll('link[rel="canonical"]').length,1);
  assert.equal(d.querySelector('meta[property="og:image"]').content,'https://example.test/b.webp');
  w.history.replaceState({},'','/'+slug);
  assert.equal(d.title,initialTitle,'home navigation restores its own metadata');
  await delay(60);
  // An old request that ignores abort must not overwrite a newer video.
  let releaseA;
  w.fetch=async raw=>{
   const parsed=new URL(raw,w.location.origin);
   if(parsed.searchParams.get('path').endsWith('/12345678'))return new Promise(resolve=>{releaseA=async()=>resolve(await normalFetch(raw));});
   return normalFetch(raw);
  };
  navigate('12345678','Vídeo A '+slug,'Descrição A '+slug);
  await until(()=>releaseA);
  navigate('87654321','Vídeo B','Descrição B');
  await delay(60);await releaseA();await delay(20);
  assert.equal(d.title,'Vídeo B | Billie Eilish TV','late A cannot replace current B');
  assert.equal(d.querySelector('meta[property="og:image"]').content,'https://example.test/b.webp');
  w.fetch=async()=>{throw new Error('offline');};
  navigate('12345678','Vídeo A '+slug,'Descrição A '+slug);
  await delay(60);
  assert.equal(d.title,'Vídeo A '+slug+' | Billie Eilish TV','offline fallback still refers to the selected video');
  assert.equal(d.querySelector('meta[name="description"]').content,'Descrição A '+slug);
  const before=calls;
  w.location.hash='#/admin/dashboard';w.dispatchEvent(new w.Event('be:route-change'));await delay(40);
  assert.equal(calls,before,'SEO does not request admin metadata');
  w.close();
 }
 console.log('PASS SEO navigation: all five locales, direct/SPA parity, per-video titles/descriptions/images, stale-response protection, offline fallback and metadata restoration');
})().finally(()=>{global.fetch=savedFetch;}).catch(error=>{console.error(error);process.exitCode=1;});

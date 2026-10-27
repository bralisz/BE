'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const community=fs.readFileSync('assets/js/community.js','utf8');
const published=fs.readFileSync('_static/chunks/community.js','utf8');
const css=fs.readFileSync('assets/css/site.css','utf8');
const features=fs.readFileSync('assets/js/features.js','utf8');

assert.equal(community,published,'published Community must match source');
assert.doesNotMatch(community,/community-hero-banner\.webp/);
assert(!fs.existsSync('assets/images/community/community-hero-banner.webp'));
assert(!fs.existsSync('_static/media/community/community-hero-banner.webp'));
assert.match(css,/community-page-inner:not\(\.has-community-banner\)/);
assert.match(features,/community:'20261027-random-gallery-banner-v2'/);

const start=community.indexOf('  // The Community hero uses the same active banner gallery');
const end=community.indexOf('  function createPage(){',start);
assert(start>=0&&end>start,'gallery loading helpers should be present');
const helpers=community.slice(start,end);
const factory=new Function('window','document','page','mediaUrl','Math',helpers+';return {chooseCommunityBanner};');
const tick=()=>new Promise(resolve=>setImmediate(resolve));

function fixture(rows,sharedStorage){
  const storage=sharedStorage||new Map();
  const sessionStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))};
  const displayed=[];
  const image={
    onload:null,onerror:null,complete:false,naturalWidth:0,alt:'',
    removeAttribute(name){if(name==='src'){this._src='';this.complete=false;this.naturalWidth=0;}},
    set src(src){this._src=src;displayed.push(src);this.complete=true;this.naturalWidth=12;if(this.onload)this.onload();},
    get src(){return this._src;}
  };
  const hero={hidden:true,querySelector:()=>image};
  const names=new Set();
  const inner={classList:{add:v=>names.add(v),remove:v=>names.delete(v)}};
  const page={hidden:false,querySelector:selector=>selector==='.community-hero-banner'?hero:selector==='.community-page-inner'?inner:null};
  const doc={body:{classList:{contains:value=>value==='community-page-active'}}};
  let calls=0;
  const w={sessionStorage,beBackend:{ready:Promise.resolve(),data:{async list(table,opts){calls++;assert.equal(table,'gallery');assert.equal(opts.orderBy,'order');return rows;}}}};
  const controller=factory(w,doc,page,x=>x,{random:()=>0,floor:Math.floor});
  return {controller,hero,image,names,displayed,storage,get calls(){return calls;}};
}
(async()=>{
  const items=[
    {itemType:'avatar',active:true,imageUrl:'https://example.org/av.webp'},
    {itemType:'banner',active:false,imageUrl:'https://example.org/hidden.webp'},
    {itemType:'banner',active:true,imageUrl:'javascript:alert(1)'},
    {itemType:'banner',active:true,imageUrl:'https://example.org/one.webp'},
    {itemType:'banner',active:true,imageUrl:'https://example.org/one.webp'},
    {itemType:'banner',active:true,imageUrl:'https://example.org/two.webp'},
    {mediaType:'banner',active:true,imageUrl:'https://example.org/three.webp'}
  ];
  const f=fixture(items);
  f.controller.chooseCommunityBanner();
  await tick();
  assert.equal(f.image.src,'https://example.org/one.webp');
  assert.equal(f.hero.hidden,false);
  assert(f.names.has('has-community-banner'));
  f.controller.chooseCommunityBanner();
  await tick();
  assert.equal(f.image.src,'https://example.org/two.webp','should avoid the previous banner');
  assert.equal(f.calls,1,'gallery should be cached during short navigation sessions');
  assert.equal(f.storage.get('betvCommunityLastBanner'),'https://example.org/two.webp');
  const again=fixture(items,f.storage);
  again.controller.chooseCommunityBanner();
  await tick();
  assert.equal(again.image.src,'https://example.org/one.webp','avoid repeating previous banner after reload');
  const legacy=fixture([{mediaType:'banner',active:true,imageUrl:'https://example.org/legacy.webp'}]);
  legacy.controller.chooseCommunityBanner();
  await tick();
  assert.equal(legacy.image.src,'https://example.org/legacy.webp','recognize legacy banner records');
  assert(!f.displayed.some(url=>/hidden|av\.webp|javascript/.test(url)),'only active gallery banners should load');

  const empty=fixture([{itemType:'avatar',imageUrl:'https://example.org/avatar.webp'}]);
  empty.controller.chooseCommunityBanner();
  await tick();
  assert.equal(empty.hero.hidden,true,'missing banners must not leave blank hero');
  console.log('PASS Community hero: source gallery, random choice, no repeat, safe empty state');
})().catch(error=>{console.error(error);process.exitCode=1;});

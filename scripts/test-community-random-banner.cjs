'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('assets/js/community.js','utf8');
const published=fs.readFileSync('_static/chunks/community.js','utf8');
const feature=fs.readFileSync('assets/js/features.js','utf8');
const css=fs.readFileSync('assets/css/site.css','utf8');
assert.equal(source,published,'Community chunks must match');
assert(!source.includes('community-hero-banner.webp'),'hardcoded hero removed');
assert(source.includes('if(!wasCommunityActive)chooseCommunityBanner();'),'random hero selected upon navigation');
assert(source.includes('communityBannerRequest++;'),'old async selections cancelled on exit');
assert(feature.includes("community:'20261027-community-random-v1'"));
assert(css.includes('#communityPage.community-banner-empty .community-content-shell'));

const start=source.indexOf('  // Reuse the same active profile banners');
const end=source.indexOf('  function createPage(){',start);
assert(start>=0&&end>start,'hero functions found');
const snippet=source.slice(start,end);
const available=[
 {id:'a',itemType:'banner',category:'Profile',imageUrl:'/a.webp',active:true},
 {id:'b',itemType:'banner',category:'Profile',imageUrl:'/b.webp',active:true},
 {id:'x',itemType:'avatar',category:'Avatars',imageUrl:'/not-banner.webp',active:true},
 {id:'c',itemType:'banner',imageUrl:'/disabled.webp',active:false},
 {id:'d',itemType:'banner',imageUrl:'/a.webp',active:true}
];
const calls=[];
const classSet=new Set();
const display={src:'',alt:'',removeAttribute(name){if(name==='src')this.src='';}};
const hero={hidden:true,querySelector:()=>display};
const page={classList:{add:name=>classSet.add(name),remove:name=>classSet.delete(name)},querySelector:()=>hero};
const scope={
 page,window:{beBackend:{ready:Promise.resolve(),data:{list:async(table,opts)=>{
   assert.equal(table,'gallery');assert.equal(opts.orderBy,'order');return available;
 }}}},
 document:{body:{classList:{contains:name=>name==='community-page-active'}}},
 mediaUrl:x=>x,Image:class{
   set src(x){calls.push(x);queueMicrotask(()=>{if(this.onload)this.onload();});}
 },
 Math,Set,Promise
};
vm.createContext(scope);
vm.runInContext(snippet,scope);
(async()=>{
 const options=await scope.activeProfileBanners();
 assert.deepEqual(Array.from(options),['/a.webp','/b.webp']);
 await scope.chooseCommunityBanner();
 const first=display.src;
 assert(['/a.webp','/b.webp'].includes(first));
 assert.equal(hero.hidden,false);
 assert.equal(classSet.has('community-banner-empty'),false);
 await scope.chooseCommunityBanner();
 assert.notEqual(display.src,first,'avoid immediate banner repetition when alternatives exist');
 assert.equal(calls.length,2);
 // If gallery is unavailable, leave a correctly positioned Community heading.
 scope.communityBannerOptions=[];
 await scope.chooseCommunityBanner();
 assert.equal(hero.hidden,true);
 assert.equal(classSet.has('community-banner-empty'),true);
 console.log('PASS community: active profile banners only, random/no repeat, empty state, no static hero');
})().catch(e=>{console.error(e);process.exitCode=1;});

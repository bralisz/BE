'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=file=>fs.readFileSync(file,'utf8');
const community=read('assets/js/community.js');
const served=read('_static/chunks/community.js');
const sourceCss=read('assets/css/site.css');
const servedCss=read('_static/styles/site.css');
const features=read('assets/js/features.js');
const featuresServed=read('_static/chunks/features.js');
const html=read('index.html');
const rev='20261113-community-follow-discovery-v4';
const cssRev='20261113-community-follow-style-v4';

assert.equal(community,served,'the Community chunk must mirror the source');
assert.equal(features,featuresServed,'the loader chunk must mirror the source');
assert(community.includes("title:'Encontre outros fãs da Billie'"));
const discovery=community.indexOf('id="communitySimilarSection"');
const ranking=community.indexOf('<h2>Perfis em destaque</h2>');
assert(discovery>=0&&ranking>discovery,'Fan discovery must appear before profile ranking');
assert(community.includes("bannerImg.src=bannerUrl"),'show the fan banner');
assert(community.includes("body.appendChild(avatar)"),'show a profile avatar');
assert(community.includes("name.textContent=displayName"),'show name below avatar');
assert(!community.includes("handle.textContent='@'+username"),'hide the handle');
assert(community.includes('person.sharedContents.slice(0,3)'), 'show thumbnails of saved content in common');
assert(community.includes("plus.textContent='+'+String(count)"),'show count of content in common');

assert(community.includes("followButton.textContent=similarCopy('follow')"),'blue Follow control must be under the name');
assert(community.includes("client.rpc('set_profile_follow',{p_username:username,p_following:true})"),'Follow must use the existing authenticated RPC');
assert(community.includes("if(card.isConnected)card.remove()"),'profile must disappear only once follow is confirmed');
assert(community.includes("card.className='community-similar-card'"),'recommendations use card containers');
assert(community.includes("card.appendChild(link)"),'profile navigation stays separate from Follow button');
assert(community.includes("more.className='community-similar-load-more'"),'last tile lets users request more recommendations');
assert(community.includes("more.addEventListener('click',loadMoreSimilarFans)"),'plus tile must request more profiles');
assert(community.includes("Object.keys(state.similarSeen)"),'loaded profiles must not repeat');
assert(community.includes("client.rpc('get_similar_fans_page'"),'paginated backend must be queried');

for (const css of [sourceCss,servedCss]) {
  assert(css.includes('.community-similar-card'), 'card styles must be included in the actual site CSS');
  assert(css.includes('.community-similar-banner'), 'banner styles must be included in the site CSS');
  assert(css.includes('.community-similar-thumb'), 'thumbnail overlap styles must be included in the site CSS');
  assert(css.includes('.community-similar-follow'), 'blue follow button must be in the site CSS');
  assert(css.includes('#1687ef'), 'Follow action must use the requested blue style');
  assert(css.includes('.community-similar-load-more'), 'the plus tile needs published CSS');
}
assert(features.includes("community:'"+rev+"'"),'lazy-loaded chunk requires a bumped cache key');
assert(html.includes('features.js?rev='+rev),'loader itself requires a bumped cache key');
assert(html.includes('site.css?rev='+cssRev),'main CSS requires a bumped cache key');

// Isolate the real Follow handler with a mocked, authenticated RPC.
const followStart=community.indexOf('  async function followSimilarFan(');
const renderStart=community.indexOf('  function renderSimilarFans(',followStart);
assert(followStart>=0&&renderStart>followStart,'follow handler must be present');
const isolatedFollow=community.slice(followStart,renderStart);
const instantiate=new Function('window','document','state','similarCopy','similarMessage',isolatedFollow+';return followSimilarFan;');
(async()=>{
  const host={querySelector:()=>({})};
  const dom={getElementById:()=>host};
  const state={similarHasMore:true};
  let calls=0;
  const win={beBackend:{ready:Promise.resolve(),client:{rpc:(name,params)=>{
    calls++;assert.equal(name,'set_profile_follow');assert.equal(params.p_following,true);
    return Promise.resolve({data:[{following:true}]});
  }}},BETVFeatures:{withTimeout:task=>task}};
  const copy=key=>key;
  const follow=instantiate(win,dom,state,copy,()=>{});
  const button={disabled:false,isConnected:true,textContent:'Seguir'};
  let removals=0;
  const card={isConnected:true,remove:()=>{removals++}};
  await follow('test-user',card,button);
  assert.equal(calls,1,'Follow calls the server exactly once');
  assert.equal(removals,1,'successful Follow immediately removes its recommendation');
  win.beBackend.client.rpc=()=>Promise.resolve({error:new Error('network')});
  button.disabled=false;removals=0;
  await follow('test-user',card,button);
  assert.equal(removals,0,'failed Follow must keep the recommendation visible');
  assert.equal(button.disabled,false,'Follow must be retryable on failure');
  console.log('PASS Community discovery: ordering, pagination, successful and failed Follow, CSS and revisions');
})().catch(error=>{console.error(error);process.exitCode=1;});

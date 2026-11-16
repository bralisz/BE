'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {JSDOM} = require('jsdom');
const site = fs.readFileSync('assets/js/site.js','utf8');
const community = fs.readFileSync('assets/js/community.js','utf8');
const closeStart = site.indexOf('  function closeSectionView(');
const closeCode = site.slice(closeStart,site.indexOf('  function openSectionView(',closeStart));
const baseStart = community.indexOf('  function establishCatalogBase(');
const baseCode = community.slice(baseStart,community.indexOf('  function preserveCommunitySurfaceForHeaderUtility(',baseStart));
const openStart = community.indexOf('  function openCommunity(');
const openCode = community.slice(openStart,community.indexOf('  window.BETVCommunity=',openStart));
const visibilityStart = community.indexOf('  function toggleCatalogVisibility(');
const visibilityCode = community.slice(visibilityStart,community.indexOf('  function rememberCatalogHomeView(',visibilityStart));

for(const mobile of [false,true]) {
  const dom = new JSDOM('<body><button id="logoBtn"></button><main><section id="home"></section><section id="communityPage" hidden></section></main><div id="dynamicSections"><section class="video-rail-section"><div class="video-rail">cards</div></section><section class="video-rail-section"></section></div></body>', {url:'https://billieilishtv.site/en-us/'});
  const w = dom.window, d = w.document;
  w.matchMedia = () => ({matches:mobile});w.scrollTo = () => {};
  const ctx = {window:w,document:d,CustomEvent:w.CustomEvent,location:w.location,history:w.history,
    sectionViewRenderToken:0,activeSectionView:null,activeSectionReturnState:null,
    page:d.getElementById('communityPage'),state:{},setupContentDetailInteractions:()=>{},
    closeMobileAccountMenu:()=>{},setCommunityNavActive:()=>{},createPage:()=>{},rememberCatalogHomeView:()=>{},
    renderSharePromotion:()=>{},currentUser:()=>null,chooseCommunityBanner:()=>{},refreshCommunity:()=>{},scheduleSimilarFans:()=>{}};
  vm.createContext(ctx);vm.runInContext(closeCode+baseCode+visibilityCode+openCode,ctx);
  function enterSection(stale=false) {
    d.body.className='section-catalog-active featured-section-catalog-active';
    const host=d.getElementById('dynamicSections');host.className=stale?'':'section-view-mode';
    host.hidden=false;
    const sections=host.querySelectorAll('section');
    sections[0].classList.add('section-view-active');
    sections[1].hidden=true;sections[1].dataset.sectionViewPreviousHidden='false';
    ctx.activeSectionView=sections[0];ctx.activeSectionReturnState={homeView:'videos'};
    const rail=host.querySelector('.video-rail');rail._beHomeMarkup='original';rail.innerHTML='expanded';
    ctx.sectionViewRenderToken=4;
  }
  function assertClosed() {
    assert(!d.body.classList.contains('section-catalog-active'));
    assert(!d.body.classList.contains('featured-section-catalog-active'));
    assert(!d.querySelector('.section-view-mode,.section-view-active'));
    assert.equal(d.querySelector('.video-rail').innerHTML,'original');
    assert.equal(d.querySelectorAll('#dynamicSections section')[1].hidden,false);
    assert(ctx.sectionViewRenderToken>4,'cancel pending section renders');
  }
  for(const stale of [false,true]) {
    enterSection(stale);vm.runInContext('openCommunity()',ctx);assertClosed();
    assert(d.body.classList.contains('community-page-active'));
    assert(!ctx.page.hidden);assert.equal(ctx.page.style.display,'block');
    assert.equal(w.location.pathname,'/avocados');
    // Reopening the already-active page must also repair stale section state.
    d.body.classList.add('section-catalog-active');vm.runInContext('openCommunity()',ctx);
    assert(!d.body.classList.contains('section-catalog-active'));
    vm.runInContext('toggleCatalogVisibility(false)',ctx);
    assert(!d.getElementById('home').hidden);
  }
  for(const event of ['profile-route','config','support','notifications','album-page','legal-route','billie-page','donate-page','fans-page']) {
    enterSection();w.dispatchEvent(new w.CustomEvent('be:open-'+event));assertClosed();
  }
  let restored=0;ctx.restoreCatalogView=()=>{restored++;};
  const historyStart=site.indexOf("      window.addEventListener('popstate', event => {",site.indexOf("document.body.dataset.sectionExitBound"));
  const historyEnd=site.indexOf('\n      });',historyStart)+'\n      });'.length;
  vm.runInContext(site.slice(historyStart,historyEnd),ctx);
  for(const route of ['avocados','profile','album','legal']){
    enterSection();w.dispatchEvent(new w.PopStateEvent('popstate',{state:{beRoute:route}}));assertClosed();
    assert.equal(restored,0,'Back must not overwrite a dedicated destination with Home');
  }
  enterSection();w.dispatchEvent(new w.PopStateEvent('popstate',{state:{beRoute:'catalog',homeView:'videos'}}));
  assertClosed();assert.equal(restored,1,'Back to the catalog should restore its filter and scroll');
  d.getElementById('dynamicSections').remove();d.body.classList.add('section-catalog-active');
  vm.runInContext('closeSectionView(false)',ctx);assert(!d.body.classList.contains('section-catalog-active'));
  dom.window.close();
}
console.log('PASS section exits: Community, dedicated routes, stale state, pending renders, desktop/mobile');

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
for (const css of [sourceCss,servedCss]) {
  assert(css.includes('.community-similar-card'), 'card styles must be included in the actual site CSS');
  assert(css.includes('.community-similar-banner'), 'banner styles must be included in the site CSS');
  assert(css.includes('.community-similar-thumb'), 'thumbnail overlap styles must be included in the site CSS');
}
assert(features.includes("community:'"+rev+"'"),'lazy-loaded chunk requires a bumped cache key');
assert(html.includes('features.js?rev='+rev),'loader itself requires a bumped cache key');
assert(html.includes('site.css?rev='+cssRev),'main CSS requires a bumped cache key');
console.log('PASS Community discovery: position, card design, published styles, cache revisions');

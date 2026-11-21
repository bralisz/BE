'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const PAGES = require('../server/content-public-page');
const DETAILS = require('../server/content-public-details');

const media = {
  collection:'videos',
  id:'the-show',
  data:{
    publicId:'12345678',
    title:'Coachella 2023 Legendado',
    sectionSearch:'Festivals & Shows',
    year:'2023',
    venue:'Empire Polo Club',
    duration:'1h 20m',
    description:'Apresentação com <br> destaque musical.',
    setlist:'1. Happier Than Ever\n2. bad guy\n3. <img src=x onerror=alert(1)>'
  }
};
const url = PAGES.contentPath(media);
assert.equal(url,'/show/coachella-2023-legendado');
assert.equal(PAGES.contentRouteId(url+'-12345678'),'12345678');
assert(PAGES.friendlyContentRoute(url));
const repeats = PAGES.distinguishVideoPaths([media,{...media,id:'another',data:{...media.data,publicId:'87654321'}}].map(row=>({...row})));
assert.deepEqual(repeats.map(row=>row.seoPath),[url+'-12345678',url+'-87654321']);
assert.equal(PAGES.contentType({...media,data:{category:'Entrevistas'}}),'entrevista');
assert.equal(PAGES.contentType({...media,data:{category:'Podcasts'}}),'podcast');
assert.equal(PAGES.contentType({...media,data:{sectionName:'Music videos'}}),'videoclipe');
assert.equal(PAGES.contentType({...media,collection:'movies'}),'filme');
assert.equal(PAGES.contentType({...media,collection:'series'}),'serie');
assert.equal(PAGES.contentPath({...media,data:{...media.data,title:'Outra apresentação'}}),'/show/outra-apresentacao');
assert.deepEqual(PAGES.mediaSetlist(media.data).slice(0,2),['Happier Than Ever','bad guy']);

for (const locale of ['pt-br','en-us','es','fr','it']) {
  const html = DETAILS.renderFacts(media,media.data,locale);
  const doc = new JSDOM('<main><section id="facts">' + html + '</section></main>').window.document;
  assert.equal(doc.querySelector('#facts h1').textContent,'Coachella 2023 Legendado');
  assert.equal(doc.querySelectorAll('#facts ol li').length,3);
  assert.equal(doc.querySelector('#facts ol li').textContent,'Happier Than Ever');
  assert(doc.querySelector('#facts').textContent.includes('Empire Polo Club'));
  assert.equal(doc.querySelector('#facts img'),null,'Do not render HTML from setlist data');
  assert.equal(doc.querySelector('#facts script'),null,'Do not render script from content data');
}
assert.equal(DETAILS.renderFacts(media,{title:'Sem setlist'},'pt-br').includes('<ol>'),true,'Original setlist remains when translation omits tracks');
const hidden = {...media,data:{...media.data,active:false}};
assert.equal(PAGES.contentPath(hidden),url,'A stable record keeps the same URL when its visibility changes');

const publicSource = fs.readFileSync('server/api-routes/public-data.js','utf8');
assert(publicSource.includes('seoPath: stableSeoPath'));
assert(publicSource.includes("'setlist'"));
const admin = fs.readFileSync('server/handlers/admin-runtime.js','utf8');
assert(admin.includes('ADMIN_SEO_FIELDS'));
assert.equal(require('../development/source/admin/seo-fields'), '', 'Retired admin SEO editor must not inject fields');
const html = fs.readFileSync('index.html','utf8');
assert(html.includes('id="detailSeoFacts"'));
assert.equal(fs.readFileSync('assets/js/site.js','utf8'),fs.readFileSync('_static/chunks/site.js','utf8'));
assert.equal(fs.readFileSync('assets/js/seo.js','utf8'),fs.readFileSync('_static/chunks/seo.js','utf8'));

console.log('Public media page checks passed: readable URLs, safe SSR facts, five locales with retired admin fields.');

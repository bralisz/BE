'use strict';
// Real browser regression checks using the shipped markup and styles, without APIs or user data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const index = fs.readFileSync('index.html', 'utf8');
const runtime = fs.readFileSync('assets/js/site.js', 'utf8');
const album = index.match(/<section class="album-page-shell"[\s\S]*?<\/section>/)[0];
const header = runtime.slice(runtime.indexOf("bar.id = 'mobileAppBar'"))
  .match(/bar.innerHTML = `([\s\S]*?)`;/)[1].replace(/\$\{icon\('[^']+'\)\}/g, '<svg viewBox="0 0 24 24"></svg>');

(async () => {
  const browser = await chromium.launch({headless: true,
    ...(process.env.BETV_CHROMIUM_PATH ? {executablePath: process.env.BETV_CHROMIUM_PATH} : {})});
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    for (const file of ['assets/css/site.css', '_static/styles/site.css']) {
      const css = fs.readFileSync(file, 'utf8');
      for (const installed of [false, true]) for (const width of [320,360,390,430,600,760,1024,1440]) {
        await page.setViewportSize({width, height: 900});
        await page.setContent(`<style>${css}</style><body class="album-page-active"><header id="mobileAppBar" class="mobile-app-bar">${header}</header>${album}</body>`);
        await page.evaluate(({installed}) => {
          document.documentElement.classList.toggle('betv-installed-app', installed);
          for (const id of ['albumPage','albumPageDetail','albumDetailBackdrop']) document.getElementById(id).hidden = false;
          document.getElementById('albumDetailTitle').textContent = 'INTRO (HIT ME HARD AND SOFT TOUR)';
          document.getElementById('albumDetailMeta').textContent = '2026 · 12 songs';
          document.getElementById('albumTrackList').innerHTML = Array.from({length:12}, (_, i) => `<li><span>${i+1}</span><strong>A very long track title with no room to overflow the viewport</strong><small>04:35</small></li>`).join('');
        }, {installed});
        for (const single of [false, true]) {
          await page.evaluate(single => document.getElementById('albumPageDetail').classList.toggle('is-single-track', single), single);
          const result = await page.evaluate(() => {
            const rect = id => { const r = document.getElementById(id).getBoundingClientRect(); return {left:r.left,right:r.right,width:r.width}; };
            window.scrollTo(10000, 0);
            return {viewport:innerWidth, scrollX, scrollWidth:document.documentElement.scrollWidth,
              shell:rect('albumPage'), cover:rect('albumDetailCover'), title:rect('albumDetailTitle'),
              heading:rect('mobileAlbumHeading'), back:rect('mobileAlbumBackButton'), avatar:rect('mobileProfileButton'),
              tracksVisible:getComputedStyle(document.getElementById('albumTrackList')).display !== 'none'};
          });
          const label = JSON.stringify({file,installed,width,single,result});
          assert(result.scrollWidth <= width + 1 && result.scrollX === 0, `Horizontal overflow: ${label}`);
          assert(Math.abs(result.shell.width-width) <= 1, `Page does not fill viewport: ${label}`);
          for (const key of ['cover','title']) assert(Math.abs((result[key].left+result[key].right)/2-width/2) <= 1, `Off-center ${key}: ${label}`);
          assert.equal(result.tracksVisible, !single, `Single/album track visibility: ${label}`);
          if (width <= 760) {
            assert(result.heading.left >= 0 && result.heading.right <= result.back.left+1, `Header overlaps: ${label}`);
            assert(result.back.right <= result.avatar.left+1 && result.avatar.right <= width, `Controls overflow: ${label}`);
          }
        }
      }
    }
    console.log('PASS album layout: browser/app, single/album, 320–1440px, source and shipped CSS');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const manifest=JSON.parse(fs.readFileSync('site.webmanifest','utf8'));

for(const forbidden of [
  'betv-launch-fullres-20261116.webp',
  'betv-pwa-launch-art',
  'betv-pwa-launch-ready',
  'betv-pwa-resume-splash',
  'betvPwaResumeSplash',
  'betv-pwa-resume-script'
]){
  assert.ok(!html.includes(forbidden),'retired launch wallpaper must not appear in HTML: '+forbidden);
}
assert.match(html,/id="authLoading"/,'retain normal loading behavior');
assert.match(html,/class="site-loading-skeleton"/,'retain default loading skeleton');
assert.match(html,/classList\.add\('betv-installed-app'\)/,'preserve installed app navigation detection');
assert.match(sw,/purgeLegacyLaunchWallpaper\(\)/,'purge old wallpaper from PWA cache on activation');
assert.match(sw,/new URL\(request\.url\)\.pathname === legacyPath/,'delete only the retired wallpaper');
assert.equal(manifest.display,'standalone','keep installed app behavior');
console.log('PASS BETV removed the launch wallpaper but retains PWA and normal loading.');

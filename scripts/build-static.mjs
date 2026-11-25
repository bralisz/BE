import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';

function minifyCss(input){
  const strings=[];
  let css=input.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,value=>{
    strings.push(value);
    return `___CSSSTR${strings.length-1}___`;
  });
  css=css.replace(/\/\*[\s\S]*?\*\//g,'');
  css=css.replace(/\s+/g,' ');
  // Whitespace around + is required inside CSS math functions such as calc().
  // Keep descendant whitespace before pseudo-classes, e.g. #detail :is(button).
  css=css.replace(/\s*([{};,>~])\s*/g,'$1');
  css=css.replace(/:\s+/g,':');
  css=css.replace(/;}/g,'}');
  css=css.trim();
  return css.replace(/___CSSSTR(\d+)___/g,(_,index)=>strings[Number(index)]);
}

const out='_static';
await rm(out,{recursive:true,force:true});
const copies=[
  ['assets/js/album-routes.js',`${out}/chunks/album-routes.js`],
  ['assets/js/features.js',`${out}/chunks/features.js`],
  ['assets/js/account.js',`${out}/chunks/account.js`],
  ['assets/js/community.js',`${out}/chunks/community.js`],
  ['assets/js/performance.js',`${out}/chunks/performance.js`],
  ['assets/js/locale-routing.js',`${out}/chunks/locale.js`],
  ['assets/js/in-app-browser.js',`${out}/chunks/in-app-browser.js`],
  ['assets/js/seo.js',`${out}/chunks/seo.js`],
  ['assets/js/site.js',`${out}/chunks/site.js`],
  ['assets/js/watch-party.js',`${out}/chunks/watch-party.js`],
  ['assets/js/watch-party-paywall.js',`${out}/chunks/watch-party-paywall.js`],
  ['assets/js/watch-party-gift.js',`${out}/chunks/watch-party-gift.js`],
  ['assets/js/profile-activity.js',`${out}/chunks/profile-activity.js`],
  ['assets/js/tv-controller.js',`${out}/chunks/tv.js`],
  ['assets/js/tv-session-widget.js',`${out}/chunks/session.js`],
  ['assets/js/lazy-loading.js',`${out}/chunks/lazy.js`],
  ['assets/js/mobile-bottom-nav.js',`${out}/chunks/mobile-bottom-nav.js`],
];
for(const [src,dest] of copies){await mkdir(dirname(dest),{recursive:true});await cp(src,dest);}
await mkdir(`${out}/styles`,{recursive:true});
await writeFile(`${out}/styles/site.css`,minifyCss(await readFile('assets/css/site.css','utf8')));
await writeFile(`${out}/styles/watch-party.css`,minifyCss(await readFile('assets/css/watch-party.css','utf8')));
await writeFile(`${out}/styles/watch-party-paywall.css`,minifyCss(await readFile('assets/css/watch-party-paywall.css','utf8')));
await writeFile(`${out}/styles/profile-activity.css`,minifyCss(await readFile('assets/css/profile-activity.css','utf8')));
await cp('assets/css/tv-pairing.css',`${out}/styles/tv.css`);
await mkdir(`${out}/locales`,{recursive:true});
for(const lang of ['en-us','es','fr','it'])await cp(`assets/i18n/${lang}.json`,`${out}/locales/${lang}.json`);
const spanish = JSON.parse(await readFile('assets/i18n/es.json','utf8'));
const latam = JSON.parse(await readFile('assets/i18n/es-419.json','utf8'));
await writeFile(out+'/locales/es-419.json', JSON.stringify({...spanish,...latam},null,2)+'\n');
await mkdir(`${out}/media/icons`,{recursive:true});
await cp('assets/images',`${out}/media`,{recursive:true});
await cp('assets/icons',`${out}/media/icons`,{recursive:true});


// Every production build gets content-aware asset URLs. This keeps repeat visits
// cache-friendly while ensuring a new release never loads a stale app chunk.
const hashedFiles=[
  ...copies.map(([,destination])=>destination),
  ...['site','watch-party','watch-party-paywall','profile-activity','tv'].map(name=>`${out}/styles/${name}.css`),
  ...['en-us','es','es-419','fr','it'].map(locale=>`${out}/locales/${locale}.json`)
];
const fingerprint=createHash('sha256');
for(const file of hashedFiles){
  fingerprint.update(file);
  fingerprint.update(await readFile(file));
}
const contentRevision=fingerprint.digest('hex').slice(0,16);
const commit=String(process.env.VERCEL_GIT_COMMIT_SHA||process.env.GITHUB_SHA||'').trim();
const revision=/^[0-9a-f]{12,40}$/i.test(commit)?commit.slice(0,16):contentRevision;
const originalHtml=await readFile('index.html','utf8');
const cleanHtml=originalHtml.replace(/<script id="betv-asset-build-revision">[\s\S]*?<\/script>\s*/g,'');
const stampedHtml=cleanHtml.replace(
  /((?:src|href)=["'])(\/_static\/(?:chunks|styles|locales)\/[^"'?\s]+)(?:\?[^"']*)?(["'])/gi,
  (_,prefix,url,suffix)=>`${prefix}${url}?rev=${revision}${suffix}`
);
const buildBootstrap=`<script id="betv-asset-build-revision">window.__BETV_ASSET_REV__=${JSON.stringify(revision)};window.__BETV_DEPLOYMENT_VERSION__=window.__BETV_DEPLOYMENT_VERSION__||${JSON.stringify(revision)};</script>`;
if(!stampedHtml.includes('<head>'))throw new Error('Missing HTML head for asset revision');
await writeFile('index.html',stampedHtml.replace('<head>',`<head>\n${buildBootstrap}`));
console.log(`BETV static assets versioned (${revision})`);

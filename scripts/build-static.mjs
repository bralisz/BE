import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
const out='_static';
const publicOut='public';
await rm(out,{recursive:true,force:true});
await rm(publicOut,{recursive:true,force:true});
const copies=[
  ['assets/js/locale-routing.js',`${out}/chunks/locale.js`],
  ['assets/js/site.js',`${out}/chunks/site.js`],
  ['assets/js/tv-controller.js',`${out}/chunks/tv.js`],
  ['assets/js/tv-session-widget.js',`${out}/chunks/session.js`],
  ['assets/js/lazy-loading.js',`${out}/chunks/lazy.js`],
  ['assets/css/site.css',`${out}/styles/site.css`],
  ['assets/css/tv-pairing.css',`${out}/styles/tv.css`],
];
for(const [src,dest] of copies){await mkdir(dirname(dest),{recursive:true});await cp(src,dest);}
await mkdir(`${out}/locales`,{recursive:true});
for(const lang of ['en-us','es','fr','it'])await cp(`assets/i18n/${lang}.json`,`${out}/locales/${lang}.json`);
await mkdir(`${out}/media/icons`,{recursive:true});
await cp('assets/images',`${out}/media`,{recursive:true});
await cp('assets/icons',`${out}/media/icons`,{recursive:true});

const commit=String(process.env.VERCEL_GIT_COMMIT_SHA||'').trim();
const deploymentUrl=String(process.env.VERCEL_URL||'').trim();
const environment=String(process.env.VERCEL_ENV||process.env.NODE_ENV||'development').trim();
const version=(!commit&&!deploymentUrl)
  ? `local:${environment}`
  : `v:${createHash('sha256').update(`${commit}:${deploymentUrl}`).digest('hex').slice(0,24)}`;
await writeFile(`${out}/version.json`,JSON.stringify({version,releaseStateAvailable:false,generatedAt:new Date().toISOString()})+'\n','utf8');

const publicFiles=[
  'index.html',
  '404.html',
  'site.webmanifest',
  'sw.js',
  'google95f17905463fea6a.html',
  'connect-tv/index.html',
  'oauth/consent/index.html',
  'tv/index.html',
];
for(const src of publicFiles){
  const dest=`${publicOut}/${src}`;
  await mkdir(dirname(dest),{recursive:true});
  await cp(src,dest);
}
await cp(out,`${publicOut}/${out}`,{recursive:true});

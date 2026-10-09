import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

function minifyCss(input){
  const strings=[];
  let css=input.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,value=>{
    strings.push(value);
    return `___CSSSTR${strings.length-1}___`;
  });
  css=css.replace(/\/\*[\s\S]*?\*\//g,'');
  css=css.replace(/\s+/g,' ');
  // Whitespace around + is required inside CSS math functions such as calc().
  css=css.replace(/\s*([{}:;,>~])\s*/g,'$1');
  css=css.replace(/;}/g,'}');
  css=css.trim();
  return css.replace(/___CSSSTR(\d+)___/g,(_,index)=>strings[Number(index)]);
}

const out='_static';
await rm(out,{recursive:true,force:true});
const copies=[
  ['assets/js/features.js',`${out}/chunks/features.js`],
  ['assets/js/account.js',`${out}/chunks/account.js`],
  ['assets/js/community.js',`${out}/chunks/community.js`],
  ['assets/js/performance.js',`${out}/chunks/performance.js`],
  ['assets/js/locale-routing.js',`${out}/chunks/locale.js`],
  ['assets/js/site.js',`${out}/chunks/site.js`],
  ['assets/js/tv-controller.js',`${out}/chunks/tv.js`],
  ['assets/js/tv-session-widget.js',`${out}/chunks/session.js`],
  ['assets/js/lazy-loading.js',`${out}/chunks/lazy.js`],
];
for(const [src,dest] of copies){await mkdir(dirname(dest),{recursive:true});await cp(src,dest);}
await mkdir(`${out}/styles`,{recursive:true});
await writeFile(`${out}/styles/site.css`,minifyCss(await readFile('assets/css/site.css','utf8')));
await cp('assets/css/tv-pairing.css',`${out}/styles/tv.css`);
await mkdir(`${out}/locales`,{recursive:true});
for(const lang of ['en-us','es','fr','it'])await cp(`assets/i18n/${lang}.json`,`${out}/locales/${lang}.json`);
await mkdir(`${out}/media/icons`,{recursive:true});
await cp('assets/images',`${out}/media`,{recursive:true});
await cp('assets/icons',`${out}/media/icons`,{recursive:true});

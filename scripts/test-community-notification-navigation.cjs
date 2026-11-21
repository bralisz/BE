'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const read = path => fs.readFileSync(path,'utf8');
for(const cssFile of ['assets/css/community.css','assets/css/site.css','_static/styles/site.css']){
  const css=read(cssFile);
  assert.match(css,/body\\.community-page-active\\s*>\\s*main\\s*>\\s*:not\\(#communityPage\\)/,
    cssFile+' must only hide catalog siblings, not notification article children');
  assert.doesNotMatch(css,/body\\.community-page-active\\s+main\\s*>\\s*:not\\(#communityPage\\)/,
    cssFile+' must never target every nested main element');
}

const source=read('assets/js/site.js');
assert.equal(source,read('_static/chunks/site.js'),'deployed notification code mirrors source');

for(const jsFile of ['assets/js/site.js','development/source/fragments/notifications.js']){
  const script=read(jsFile);
  const start=script.indexOf('  async function openPage(id,updateRoute){');
  const end=script.indexOf('  function closePage(updateRoute){',start);
  assert(start>=0&&end>start,jsFile+' must provide notification navigation');
  const fragment=script.slice(start,end);
  const closeIndex=fragment.indexOf('window.BETVCommunity.close(false)');
  const showIndex=fragment.indexOf("document.body.classList.add('notification-page-active')");
  assert(closeIndex>=0&&showIndex>closeIndex,jsFile+' must close Community before showing notifications');
  // Isolate the real open-page handler with a minimal DOM and route mock.
  const classes=new Set(['community-page-active']);
  const events=[];
  const document={title:'',body:{classList:{
    contains:value=>classes.has(value),
    remove:(...values)=>values.forEach(value=>classes.delete(value)),
    add:value=>classes.add(value)
  }}};
  const page={hidden:true,setAttribute:()=>{}};
  const window={
    BETVCommunity:{close:()=>{events.push('close-community');classes.delete('community-page-active');}},
    BETVPageTitle:()=> 'BETV',
    dispatchEvent:()=>{events.push('notification-event');},
    scrollTo:()=>{}
  };
  const CustomEvent=function(type,options){this.type=type;this.detail=options&&options.detail;};
  const openPage=new Function('document','window','page','CustomEvent','closeMenus','syncPageAvatar',
    'setNotificationRoute','loadNotifications','renderPage','markNotificationRead','routeInfo',
    fragment+'\\nreturn openPage;')(
    document,window,page,CustomEvent,()=>{},()=>{},
    ()=>events.push('route'),async()=>{},()=>({id:'notification-1'}),()=>{},
    ()=>({legacy:false})
  );
  (async()=>{
    await openPage('notification-1',true);
    assert(!classes.has('community-page-active'),'Community must be closed first');
    assert(classes.has('notification-page-active'),'Notification detail remains visible');
    assert.equal(page.hidden,false);
    assert(events.indexOf('close-community')>=0);
    assert(events.indexOf('close-community')<events.indexOf('route'));
    console.log('PASS '+jsFile+' opens notification from Avocados');
  })().catch(error=>{console.error(error);process.exitCode=1;});
}

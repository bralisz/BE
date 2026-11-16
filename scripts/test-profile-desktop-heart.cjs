'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const site=fs.readFileSync('assets/js/site.js','utf8'),account=fs.readFileSync('assets/js/account.js','utf8');
const start=site.indexOf('  var scheduled=false;',site.indexOf('/* BETV profile actions v13'));
const end=site.indexOf('\n  function schedule(){',start);
for(const [guest,own,mobile] of [[true,false,false],[false,false,false],[false,true,false],[true,false,true]]){
 const dom=new JSDOM('<body class="profile-page-active"><div id="profilePageActionsRow">'+['Follow','Like','Share','Home','More'].map(n=>'<button id="profilePage'+n+'"></button>').join('')+'</div></body>');
 const w=dom.window;w.matchMedia=()=>({matches:mobile});
 w.document.body.classList.toggle('profile-viewer-guest',guest);w.document.body.classList.toggle('profile-view-own',own);
 const ctx={window:w,document:w.document};vm.createContext(ctx);vm.runInContext(site.slice(start,end)+'\napply();',ctx);
 const like=w.document.getElementById('profilePageLike');
 assert.equal(like.style.display,!own&&!mobile?'grid':'none');
 if(!own&&!mobile){
  assert.equal(like.style.order,'1');assert.equal(w.document.getElementById('profilePageShare').style.order,'2');assert.equal(w.document.getElementById('profilePageHome').style.order,'3');
  assert.equal(w.document.getElementById('profilePageFollow').style.display,guest?'none':'grid');
  if(!guest)assert.equal(w.document.getElementById('profilePageFollow').style.order,'0');
 }
 const state={window:{matchMedia:()=>({matches:!mobile})},auth:{currentUser:guest?null:{}},isOwnProfileView:()=>own,viewedProfileStatus:'ready',viewedProfile:{likesReceived:3},currentViewedProfileHandle:()=> 'profile',profileLikeState:{username:'profile',count:3,liked:false,loading:false},profileLikeCount:Number,profilePageLike:like,profilePageLikesReceived:null};
 vm.createContext(state);vm.runInContext(account.slice(account.indexOf('    function renderProfileLikeUi(){'),account.indexOf('    function updateProfileActionVisibility(){'))+'\nrenderProfileLikeUi();',state);
 assert.equal(like.hidden,own||(guest&&mobile));dom.window.close();
}
let route;const ctx={auth:{currentUser:null},currentViewedProfileHandle:()=> 'profile',window:{BETVPublicRoutes:{go:p=>route=p}}};
vm.createContext(ctx);vm.runInContext(account.slice(account.indexOf('    async function toggleProfileLike(){'),account.indexOf('    function setProfilePageAvatar('))+'\ntoggleProfileLike();',ctx);assert.equal(route,'/login');
console.log('PASS desktop guest/member heart visibility, action order, mobile behavior and guest login');

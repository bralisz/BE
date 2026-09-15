;(function(){
  'use strict';
  var base='/_static/chunks/';
  function load(src){
    return new Promise(function(resolve,reject){
      var script=document.createElement('script');
      script.src=base+src+'?rev=20260915-follow-rpc-v1';
      script.async=false;
      script.onload=resolve;
      script.onerror=reject;
      document.head.appendChild(script);
    });
  }
  load('site-legacy.js').then(function(){return load('profile-follow-rpc.js');}).catch(function(){
    try{console.error('BETV site bundle failed to load');}catch(_){ }
  });
})();

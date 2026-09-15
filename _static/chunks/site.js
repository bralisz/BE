/* BETV production bundle entrypoint. */
;(function(){
  'use strict';
  var base='/_static/chunks/';
  var legacy=base+'site-legacy.js?rev=20260915-follow-rpc-v2';
  var follow=base+'profile-follow-rpc.js?rev=20260915-follow-rpc-v2';
  function load(src){
    return new Promise(function(resolve,reject){
      var script=document.createElement('script');
      script.src=src;
      script.async=false;
      script.onload=resolve;
      script.onerror=reject;
      document.head.appendChild(script);
    });
  }
  /* Load the full legacy bundle immediately; the follow layer is deliberately separate. */
  load(legacy).then(function(){return load(follow);}).catch(function(error){
    try{console.error('BETV site bundle failed to load',error);}catch(_){ }
  });
})();

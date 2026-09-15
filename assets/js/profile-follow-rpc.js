;(function(){
  'use strict';

  var buttonId='profilePageFollow';
  var handleId='profilePageHandle';
  var state={username:'',following:false,loading:false,request:0};

  function client(){return window.beBackend&&window.beBackend.client;}
  function currentUser(){return window.beBackend&&window.beBackend.auth?window.beBackend.auth.currentUser:null;}
  function normalize(value){
    var raw=String(value||'').trim().toLowerCase().replace(/^@/,'');
    return window.beBackend&&typeof window.beBackend.normalizeUsername==='function'
      ? window.beBackend.normalizeUsername(raw)
      : raw;
  }
  function handle(){
    try{
      if(typeof window.BETVLocalePath==='function'){
        var logical=String(window.BETVLocalePath()||'');
        var match=logical.match(/^\/@([^/]+)$/i);
        if(match)return normalize(match[1]);
      }
    }catch(_){ }
    var el=document.getElementById(handleId);
    return normalize(el&&el.textContent||'');
  }
  function button(){return document.getElementById(buttonId);}
  function render(){
    var el=button();
    if(!el)return;
    var username=handle();
    var user=currentUser();
    var available=Boolean(user&&user.uid&&username);
    el.hidden=!available;
    el.setAttribute('aria-hidden',available?'false':'true');
    if(!available)return;
    el.classList.toggle('is-following',state.following===true);
    el.setAttribute('aria-pressed',state.following?'true':'false');
    el.setAttribute('aria-label',state.following?'Deixar de seguir':'Seguir perfil');
    el.title=state.following?'Deixar de seguir':'Seguir perfil';
    el.disabled=state.loading===true;
    el.setAttribute('aria-busy',state.loading?'true':'false');
  }
  function updateCounts(row){
    var followers=Math.max(0,Number(row&&row.followers_count||0)||0);
    var following=Math.max(0,Number(row&&row.following_count||0)||0);
    var followersEl=document.getElementById('profilePageFollowersCount');
    var followingEl=document.getElementById('profilePageFollowingCount');
    if(followersEl)followersEl.textContent=String(followers);
    if(followingEl)followingEl.textContent=String(following);
  }
  async function refresh(){
    var user=currentUser();
    var username=handle();
    var request=++state.request;
    if(!user||!user.uid||!username){state={username:username,following:false,loading:false,request:request};render();return;}
    state={username:username,following:false,loading:true,request:request};
    render();
    try{
      await Promise.resolve(window.beBackend&&window.beBackend.ready);
      var api=client();
      if(!api||typeof api.rpc!=='function')throw new Error('supabase_rpc_unavailable');
      var result=await api.rpc('get_profile_follow_state',{p_username:username});
      if(result&&result.error)throw result.error;
      var row=Array.isArray(result.data)?result.data[0]:result.data;
      if(request!==state.request||username!==handle())return;
      state={username:username,following:Boolean(row&&row.following),loading:false,request:request};
      updateCounts(row);
      render();
    }catch(_){
      if(request!==state.request)return;
      state={username:username,following:false,loading:false,request:request};
      render();
    }
  }
  async function toggle(){
    var user=currentUser();
    var username=handle();
    if(!user||!user.uid||!username||state.loading)return;
    var request=++state.request;
    state={username:username,following:state.username===username&&state.following===true,loading:true,request:request};
    render();
    try{
      await Promise.resolve(window.beBackend&&window.beBackend.ready);
      var api=client();
      if(!api||typeof api.rpc!=='function')throw new Error('supabase_rpc_unavailable');
      var result=await api.rpc('toggle_profile_follow',{p_username:username});
      if(result&&result.error)throw result.error;
      var row=Array.isArray(result.data)?result.data[0]:result.data;
      if(request!==state.request||username!==handle())return;
      state={username:username,following:Boolean(row&&row.following),loading:false,request:request};
      updateCounts(row);
      render();
    }catch(_){
      if(request!==state.request)return;
      state={username:username,following:state.following===true,loading:false,request:request};
      render();
    }
  }
  function boot(){
    var el=button();
    if(!el)return;
    document.addEventListener('click',function(event){
      var target=event.target&&event.target.closest?event.target.closest('#'+buttonId):null;
      if(!target)return;
      event.preventDefault();
      event.stopPropagation();
      if(event.stopImmediatePropagation)event.stopImmediatePropagation();
      toggle();
    },true);
    var observed=document.getElementById(handleId);
    if(observed){
      var observer=new MutationObserver(function(){
        var next=handle();
        if(next!==state.username)refresh();
      });
      observer.observe(observed,{subtree:true,childList:true,characterData:true});
    }
    if(window.beBackend&&window.beBackend.auth&&typeof window.beBackend.auth.onChange==='function'){
      window.beBackend.auth.onChange(function(){refresh();});
    }
    refresh();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

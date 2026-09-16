;(function(){
  'use strict';

  var buttonId='profilePageFollow';
  var handleId='profilePageHandle';
  var state={username:'',targetId:'',following:false,loading:false,request:0};
  var realtimeChannel=null;
  var realtimeKey='';

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
  function locale(){
    try{
      var lang=String(document.documentElement&&document.documentElement.lang||'').toLowerCase();
      if(lang.indexOf('it')===0)return 'it';
      if(lang.indexOf('fr')===0)return 'fr';
      if(lang.indexOf('es')===0)return 'es';
      if(lang.indexOf('en')===0)return 'en';
    }catch(_){ }
    try{
      if(typeof window.BETVLocale==='function'){
        var l=String(window.BETVLocale()||'').toLowerCase();
        if(l.indexOf('it')===0)return 'it';
        if(l.indexOf('fr')===0)return 'fr';
        if(l.indexOf('es')===0)return 'es';
        if(l.indexOf('en')===0)return 'en';
      }
    }catch(_){ }
    return 'pt';
  }
  function updateLabels(){
    var labels={
      pt:{followers:'Seguidores',following:'Seguindo'},
      en:{followers:'Followers',following:'Following'},
      es:{followers:'Seguidores',following:'Siguiendo'},
      fr:{followers:'Abonnés',following:'Abonnements'},
      it:{followers:'Follower',following:'Seguiti'}
    };
    var l=labels[locale()]||labels.pt;
    var followersEl=document.getElementById('profilePageFollowersLabel');
    var followingEl=document.getElementById('profilePageFollowingLabel');
    if(followersEl)followersEl.textContent=l.followers;
    if(followingEl)followingEl.textContent=l.following;
  }
  function button(){return document.getElementById(buttonId);}
  function render(){
    updateLabels();
    var el=button();
    if(!el)return;
    var username=handle();
    var user=currentUser();
    var available=Boolean(user&&user.uid&&username&&state.username===username);
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
  function stopRealtime(){
    if(realtimeChannel&&client()&&typeof client().removeChannel==='function'){
      try{client().removeChannel(realtimeChannel);}catch(_){ }
    }
    realtimeChannel=null;
    realtimeKey='';
  }
  function startRealtime(targetId,username){
    var api=client();
    if(!api||typeof api.channel!=='function'||!targetId)return;
    var user=currentUser();
    var key=String(user&&user.uid||'')+'|'+String(targetId)+'|'+String(username||'');
    if(key===realtimeKey)return;
    stopRealtime();
    realtimeKey=key;
    realtimeChannel=api.channel('profile-follow-live-'+String(targetId));
    realtimeChannel.on('postgres_changes',{event:'*',schema:'public',table:'profile_follows'},function(payload){
      var next=payload&&payload.new||{};
      var old=payload&&payload.old||{};
      var changedTarget=String(next.following_id||old.following_id||'')===String(targetId);
      var changedViewer=String(next.follower_id||old.follower_id||'')===String(user&&user.uid||'');
      if(changedTarget||changedViewer)refresh();
    });
    realtimeChannel.subscribe();
  }
  async function refresh(){
    updateLabels();
    var user=currentUser();
    var username=handle();
    var request=++state.request;
    if(!user||!user.uid||!username){stopRealtime();state={username:username,targetId:'',following:false,loading:false,request:request};render();return;}
    state={username:username,targetId:'',following:false,loading:true,request:request};
    render();
    try{
      await Promise.resolve(window.beBackend&&window.beBackend.ready);
      var api=client();
      if(!api||typeof api.rpc!=='function')throw new Error('supabase_rpc_unavailable');
      var result=await api.rpc('get_profile_follow_state',{p_username:username});
      if(result&&result.error)throw result.error;
      var row=Array.isArray(result.data)?result.data[0]:result.data;
      if(request!==state.request||username!==handle())return;
      state={username:username,targetId:String(row&&row.target_id||''),following:Boolean(row&&row.following),loading:false,request:request};
      updateCounts(row);
      render();
      startRealtime(state.targetId,username);
    }catch(error){
      if(request!==state.request)return;
      stopRealtime();
      state={username:username,targetId:'',following:false,loading:false,request:request};
      render();
    }
  }
  async function toggle(){
    var user=currentUser();
    var username=handle();
    if(!user||!user.uid||!username||state.loading)return;
    var request=++state.request;
    var previous=state.following===true&&state.username===username;
    state={username:username,targetId:state.targetId,following:previous,loading:true,request:request};
    render();
    try{
      await Promise.resolve(window.beBackend&&window.beBackend.ready);
      var api=client();
      if(!api||typeof api.rpc!=='function')throw new Error('supabase_rpc_unavailable');
      var result=await api.rpc('toggle_profile_follow',{p_username:username});
      if(result&&result.error)throw result.error;
      var row=Array.isArray(result.data)?result.data[0]:result.data;
      if(request!==state.request||username!==handle())return;
      state={username:username,targetId:state.targetId,following:Boolean(row&&row.following),loading:false,request:request};
      updateCounts(row);
      render();
      startRealtime(state.targetId,username);
    }catch(error){
      if(request!==state.request)return;
      state={username:username,targetId:state.targetId,following:previous,loading:false,request:request};
      render();
    }
  }
  function boot(){
    var el=button();
    updateLabels();
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
        updateLabels();
        if(next!==state.username)refresh();
      });
      observer.observe(observed,{subtree:true,childList:true,characterData:true});
    }
    if(window.beBackend&&window.beBackend.auth&&typeof window.beBackend.auth.onChange==='function'){
      window.beBackend.auth.onChange(function(){refresh();});
    }
    window.addEventListener('popstate',function(){setTimeout(refresh,0);});
    refresh();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

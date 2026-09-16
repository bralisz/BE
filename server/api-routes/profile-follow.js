'use strict';

const DEFAULT_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
function config(){return {url:String(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||DEFAULT_URL).replace(/\/$/,''),key:process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||''};}
function bearer(req){var h=String(req.headers&&req.headers.authorization||'');return /^Bearer\s+\S+$/i.test(h)?h:'';}
function name(v){return String(v||'').trim().toLowerCase().replace(/^@+/,'');}
async function rpc(fn,body,token){var c=config();if(!c.key||!token)throw new Error('auth_required');var r=await fetch(c.url+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:c.key,Authorization:token,Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});var data=null;try{data=await r.json();}catch(_){}if(!r.ok){var e=new Error('supabase_'+r.status);e.status=r.status;e.data=data;throw e;}return Array.isArray(data)?data[0]:data;}
module.exports=async function profileFollow(req,res){
  if(!['GET','POST','DELETE'].includes(req.method)){res.setHeader('Allow','GET, POST, DELETE');return res.status(405).end();}
  var username=name(Array.isArray(req.query&&req.query.username)?req.query.username[0]:req.query&&req.query.username);
  if(!username)return res.status(400).json({error:'username_required'});
  var token=bearer(req);
  try{
    if(req.method==='GET'){
      var row=await rpc('get_profile_follow_state',{p_username:username},token);
      res.setHeader('Cache-Control','private, no-store, max-age=0');return res.status(200).json(row||{});
    }
    var following=req.method==='POST';
    var row=await rpc('set_profile_follow',{p_username:username,p_following:following},token);
    res.setHeader('Cache-Control','private, no-store, max-age=0');return res.status(200).json(row||{});
  }catch(error){
    var status=error&&error.status===401?401:error&&error.data&&String(error.data.message||'').includes('not_authenticated')?401:error&&error.data&&String(error.data.message||'').includes('cannot_follow_self')?409:error&&error.status===404?404:500;
    return res.status(status).json({error:status===401?'not_authenticated':status===409?'cannot_follow_self':'follow_failed'});
  }
};

'use strict';

const DEFAULT_URL='https://cxkevnnxibhezvospkce.supabase.co';
function config(){return {url:String(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||DEFAULT_URL).replace(/\/$/,''),key:process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||''}}
function clean(v,max=120){return String(v||'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,max)}
function username(v){return clean(v,80).toLowerCase().replace(/^@+/,'')}
function validUsername(v){return /^[a-z0-9](?:[a-z0-9._]{1,18}[a-z0-9])?$/.test(v)&&v.length>=3&&v.length<=20&&!v.includes('..')&&!v.includes('__')&&!v.includes('._')&&!v.includes('_.')}
function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)}
module.exports=async function profileRelationships(req,res){
 if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return res.status(405).end()}
 var raw=Array.isArray(req.query?.username)?req.query.username[0]:req.query?.username;var target=clean(raw,120);var n=username(target);var type=String(Array.isArray(req.query?.type)?req.query.type[0]:req.query?.type||'followers').toLowerCase()==='following'?'following':'followers';var q=clean(Array.isArray(req.query?.q)?req.query.q[0]:req.query?.q||'',80);var offset=Math.max(0,Number.parseInt(Array.isArray(req.query?.offset)?req.query.offset[0]:req.query?.offset,10)||0);var limit=Math.min(50,Math.max(1,Number.parseInt(Array.isArray(req.query?.limit)?req.query.limit[0]:req.query?.limit,10)||15));
 if(!target||(!validUsername(n)&&!isUuid(target)))return res.status(400).json({items:[],total:0,offset,limit,hasMore:false});
 var c=config();if(!c.key)return res.status(503).json({items:[],total:0,offset,limit,hasMore:false});
 try{var r=await fetch(c.url+'/rest/v1/rpc/get_profile_relationships',{method:'POST',headers:{apikey:c.key,Authorization:'Bearer '+c.key,Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({p_profile:target,p_type:type,p_search:q,p_offset:offset,p_limit:limit}),cache:'no-store'});var data=await r.json();if(!r.ok)throw new Error('supabase_'+r.status);var rows=Array.isArray(data)?data:[];var total=rows.length?Number(rows[0].total_count)||rows.length:0;var items=rows.map(function(x){return {id:String(x.id||''),username:username(x.username),displayName:clean(x.display_name||'Usuário',80),avatarUrl:clean(x.avatar_url,2000),communityTag:clean(x.community_tag,20).toLowerCase()}}).filter(function(x){return x.id&&validUsername(x.username)});return res.status(200).json({items,total,offset,limit,hasMore:offset+items.length<total});}
 catch(error){console.error('profile relationships failed:',error);return res.status(503).json({items:[],total:0,offset,limit,hasMore:false})}
};

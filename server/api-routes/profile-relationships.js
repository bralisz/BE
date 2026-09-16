'use strict';

const DEFAULT_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
function config(){return {url:String(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||DEFAULT_URL).replace(/\/$/,''),key:process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_KEY||process.env.SB_SERVICE_ROLE_KEY||process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||''};}
function clean(v,max=120){return String(v||'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,max)}
function username(v){return clean(v,80).toLowerCase().replace(/^@+/,'')}
function validUsername(v){return /^[a-z0-9](?:[a-z0-9._]{1,18}[a-z0-9])?$/.test(v)&&v.length>=3&&v.length<=20&&!v.includes('..')&&!v.includes('__')&&!v.includes('._')&&!v.includes('_.')}
function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)}
function mapProfile(row){return {id:clean(row.id),username:username(row.username),displayName:clean(row.display_name||row.displayName||'Usuário',80),avatarUrl:clean(row.avatar_url||row.avatarUrl,2000),communityTag:clean(row.community_tag||row.communityTag,20).toLowerCase()}}
async function rest(path){var c=config();if(!c.key)throw new Error('supabase_key_missing');var r=await fetch(c.url+path,{headers:{apikey:c.key,Authorization:'Bearer '+c.key,Accept:'application/json'},cache:'no-store'});if(!r.ok)throw new Error('supabase_'+r.status);var data=await r.json();return Array.isArray(data)?data:[]}
module.exports=async function profileRelationships(req,res){
 if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return res.status(405).end()}
 var raw=Array.isArray(req.query?.username)?req.query.username[0]:req.query?.username;var targetValue=clean(raw,120);var targetUsername=username(targetValue);var type=String(Array.isArray(req.query?.type)?req.query.type[0]:req.query?.type||'followers').toLowerCase()==='following'?'following':'followers';var search=clean(Array.isArray(req.query?.q)?req.query.q[0]:req.query?.q||'',80).toLowerCase();var offset=Math.max(0,Number.parseInt(Array.isArray(req.query?.offset)?req.query.offset[0]:req.query?.offset,10)||0);var limit=Math.min(50,Math.max(1,Number.parseInt(Array.isArray(req.query?.limit)?req.query.limit[0]:req.query?.limit,10)||15));
 if(!targetValue||(!validUsername(targetUsername)&&!isUuid(targetValue)))return res.status(400).json({items:[],total:0,offset,limit,hasMore:false});
 try{
  var filter=isUuid(targetValue)?'id=eq.'+encodeURIComponent(targetValue):'username=eq.'+encodeURIComponent(targetUsername);var targets=await rest('/rest/v1/profiles?select=id,username,banned&'+filter+'&limit=1');var target=targets[0];
  if(!target||target.banned===true)return res.status(404).json({items:[],total:0,offset,limit,hasMore:false});
  var match=type==='following'?'follower_id':'following_id',result=type==='following'?'following_id':'follower_id';var relations=await rest('/rest/v1/profile_follows?select=follower_id,following_id&'+match+'=eq.'+encodeURIComponent(target.id)+'&limit=5000');var ids=relations.map(r=>clean(r[result])).filter(Boolean);
  if(!ids.length)return res.status(200).json({items:[],total:0,offset,limit,hasMore:false});
  var idFilter=ids.map(id=>'"'+id+'"').join(',');var profiles=await rest('/rest/v1/profiles?select=id,username,display_name,avatar_url,community_tag,banned&id=in.('+encodeURIComponent(idFilter)+')&limit=5000');var order=new Map(ids.map((id,i)=>[id,i]));var items=profiles.filter(r=>r.banned!==true).map(mapProfile).filter(i=>validUsername(i.username));if(search)items=items.filter(i=>i.username.includes(search)||i.displayName.toLowerCase().includes(search));items.sort((a,b)=>(order.get(a.id)??999999)-(order.get(b.id)??999999));var total=items.length,page=items.slice(offset,offset+limit);return res.status(200).json({items:page,total,offset,limit,hasMore:offset+page.length<total});
 }catch(error){console.error('profile relationships failed:',error);return res.status(503).json({items:[],total:0,offset,limit,hasMore:false});}
};

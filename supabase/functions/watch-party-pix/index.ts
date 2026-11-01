import "jsr:@supabase/functions-js@2.4.4/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.4";
const ORIGIN="https://billieilishtv.site";
const PREVIEW=/^be(?:-[a-z0-9-]+)?-gff17\.vercel\.app$/i;
const url=Deno.env.get("SUPABASE_URL")||"",anon=Deno.env.get("SUPABASE_ANON_KEY")||"",service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"",mpToken=Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")||"";
function allowed(origin:string){if(origin===ORIGIN||origin==="https://www.billieilishtv.site")return true;try{const u=new URL(origin);return u.protocol==="https:"&&PREVIEW.test(u.hostname);}catch{return false;}}
function reply(origin:string,status:number,body:unknown){return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json;charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":origin&&allowed(origin)?origin:ORIGIN,"Access-Control-Allow-Headers":"authorization,apikey,x-client-info,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"}});}
function validUuid(v:unknown){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||""));}
function isPaymentId(v:unknown){return /^[0-9]{5,25}$/.test(String(v||""));}
async function getPayment(id:string){const r=await fetch("https://api.mercadopago.com/v1/payments/"+encodeURIComponent(id),{headers:{Authorization:"Bearer "+mpToken}});return {ok:r.ok,data:await r.json().catch(()=>null)};}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin&&allowed(origin)?origin:ORIGIN,"Access-Control-Allow-Headers":"authorization,apikey,x-client-info,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"}});
 if(req.method!=="POST")return reply(origin,405,{error:"method_not_allowed"});
 if(!allowed(origin))return reply(origin,403,{error:"origin_not_allowed"});
 const authorization=req.headers.get("authorization")||"";
 if(!authorization.startsWith("Bearer "))return reply(origin,401,{error:"sign_in_required"});
 if(!url||!anon||!service||!mpToken)return reply(origin,503,{error:"pix_not_configured"});
 const scoped=createClient(url,anon,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
 const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:authError}=await scoped.auth.getUser();
 if(authError||!user)return reply(origin,401,{error:"sign_in_required"});
 let input:Record<string,unknown>={};try{input=await req.json();}catch{return reply(origin,400,{error:"invalid_request"});}
 const [unlocks,grants,gifts]=await Promise.all([
  admin.from("watch_party_unlocks").select("user_id").eq("user_id",user.id).maybeSingle(),
  admin.from("watch_party_grants").select("user_id").eq("user_id",user.id).maybeSingle(),
  admin.from("watch_party_gifts").select("recipient_id").eq("recipient_id",user.id).maybeSingle()
 ]);
 if(unlocks.data||grants.data||gifts.data)return reply(origin,200,{unlocked:true});
 if(input.action==="create"){
  const requestId=String(input.requestId||"");
  if(!validUuid(requestId))return reply(origin,400,{error:"invalid_request"});
  if(!user.email)return reply(origin,400,{error:"email_required"});
  const {count}=await admin.from("watch_party_pix_orders").select("request_id",{count:"exact",head:true}).eq("user_id",user.id).gte("created_at",new Date(Date.now()-60000).toISOString());
  if((count||0)>=4)return reply(origin,429,{error:"pix_rate_limit"});
  const {error:rowError}=await admin.from("watch_party_pix_orders").insert({request_id:requestId,user_id:user.id,amount_cents:2719,status:"creating"});
  if(rowError)return reply(origin,409,{error:"pix_request_already_used"});
  const payload={
   transaction_amount:27.19,description:"BETV Watch Party - acesso permanente",
   payment_method_id:"pix",payer:{email:user.email},
   external_reference:"betv-wp:"+requestId,
   metadata:{purpose:"watch_party_unlock",user_id:user.id,request_id:requestId,amount_cents:"2719"},
   date_of_expiration:new Date(Date.now()+30*60000).toISOString()
  };
  let data:any=null,status=502;
  try{
   const result=await fetch("https://api.mercadopago.com/v1/payments",{method:"POST",headers:{"Authorization":"Bearer "+mpToken,"Content-Type":"application/json","X-Idempotency-Key":"betv-wp-"+requestId},body:JSON.stringify(payload)});
   status=result.status;data=await result.json().catch(()=>null);
  }catch(_){}
  const id=String(data?.id||"");
  const transaction=data?.point_of_interaction?.transaction_data||{};
  if(status<200||status>=300||!isPaymentId(id)||(!transaction.qr_code&&!transaction.qr_code_base64)){
   await admin.from("watch_party_pix_orders").update({status:"failed",updated_at:new Date().toISOString()}).eq("request_id",requestId);
   return reply(origin,502,{error:"pix_creation_failed"});
  }
  const {error:saveError}=await admin.from("watch_party_pix_orders").update({payment_id:id,status:"pending",updated_at:new Date().toISOString()}).eq("request_id",requestId).eq("user_id",user.id);
  if(saveError)return reply(origin,503,{error:"pix_order_save_failed"});
  return reply(origin,200,{paymentId:id,qrCode:String(transaction.qr_code||"").slice(0,5000),qrCodeBase64:String(transaction.qr_code_base64||"").slice(0,100000),amountCents:2719,currency:"BRL",expiresAt:data?.date_of_expiration});
 }
 if(input.action!=="status"||!isPaymentId(input.paymentId))return reply(origin,400,{error:"invalid_payment"});
 const paymentId=String(input.paymentId);
 const {data:order,error:orderError}=await admin.from("watch_party_pix_orders").select("request_id,user_id,status,amount_cents").eq("user_id",user.id).eq("payment_id",paymentId).maybeSingle();
 if(orderError||!order)return reply(origin,404,{error:"payment_not_found"});
 const mp=await getPayment(paymentId),payment=mp.data;
 if(!mp.ok||String(payment?.id)!==paymentId)return reply(origin,503,{error:"payment_check_unavailable"});
 const valid=payment?.payment_method_id==="pix"&&payment?.metadata?.purpose==="watch_party_unlock"&&payment?.metadata?.user_id===user.id&&payment?.metadata?.request_id===order.request_id&&String(payment?.external_reference||"")==="betv-wp:"+order.request_id&&Math.round(Number(payment?.transaction_amount||0)*100)===2719&&Number(order.amount_cents)===2719;
 if(!valid)return reply(origin,409,{error:"payment_mismatch"});
 if(payment.status!=="approved")return reply(origin,200,{pending:true,status:String(payment.status||"pending").slice(0,32)});
 const {error:grantError}=await admin.from("watch_party_unlocks").upsert({user_id:user.id,stripe_session_id:"mp:"+paymentId,amount_cents:2719,currency:"brl"},{onConflict:"user_id",ignoreDuplicates:true});
 if(grantError)return reply(origin,503,{error:"unlock_save_failed"});
 const {data:profile}=await admin.from("profiles").select("community_tag,community_tags").eq("id",user.id).maybeSingle();
 if(!profile)return reply(origin,503,{error:"profile_missing"});
 const tags=Array.isArray(profile.community_tags)?profile.community_tags:[];
 const {error:tagError}=await admin.from("profiles").update({community_tags:Array.from(new Set([...tags,"happier_than_ever"])),community_tag:profile.community_tag||"happier_than_ever"}).eq("id",user.id);
 if(tagError)return reply(origin,503,{error:"tag_sync_failed"});
 await admin.from("watch_party_pix_orders").update({status:"approved",updated_at:new Date().toISOString()}).eq("request_id",order.request_id);
 return reply(origin,200,{unlocked:true,tag:"happier_than_ever"});
});

import "jsr:@supabase/functions-js@2.4.4/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.4";

const supabaseUrl=Deno.env.get("SUPABASE_URL")||"";
const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const mercadoToken=Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")||"";
const json=(status:number,data:Record<string,unknown>)=>new Response(JSON.stringify(data),{
 status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}
});
const validPaymentId=(x:unknown)=>/^[0-9]{5,25}$/.test(String(x||""));
const validUuid=(x:unknown)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(x||""));
Deno.serve(async(req:Request)=>{
 if(req.method!=="GET"&&req.method!=="POST")return json(405,{ok:false});
 if(!supabaseUrl||!service||!mercadoToken)return json(503,{ok:false,error:"not_configured"});
 const reqUrl=new URL(req.url);
 let incoming:Record<string,unknown>={};
 if(req.method==="POST"){try{incoming=await req.json() as Record<string,unknown>;}catch{incoming={};}}
 const data=incoming?.data;
 const eventId=String((data&&typeof data==="object"&&"id" in data?(data as {id:unknown}).id:null)||incoming?.id||reqUrl.searchParams.get("data.id")||reqUrl.searchParams.get("id")||"");
 if(!validPaymentId(eventId))return json(200,{ok:true,ignored:true});
 const res=await fetch("https://api.mercadopago.com/v1/payments/"+encodeURIComponent(eventId),{
  headers:{"Authorization":"Bearer "+mercadoToken}
 }).catch(()=>null);
 if(!res||!res.ok)return json(503,{ok:false,error:"payment_lookup_failed"});
 const payment=await res.json().catch(()=>null) as Record<string,any>|null;
 if(!payment||String(payment.id)!==eventId)return json(200,{ok:true,ignored:true});
 if(payment?.metadata?.purpose!=="watch_party_unlock"||payment.payment_method_id!=="pix")
  return json(200,{ok:true,ignored:true});
 const requestId=String(payment.metadata?.request_id||"");
 const userId=String(payment.metadata?.user_id||"");
 const amount=Math.round(Number(payment.transaction_amount||0)*100);
 if(!validUuid(requestId)||!validUuid(userId)||amount!==2719||
  String(payment.metadata?.amount_cents)!=="2719"||
  String(payment.external_reference)!=="betv-wp:"+requestId)
  return json(200,{ok:true,ignored:true});
 const admin=createClient(supabaseUrl,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:order,error:lookupError}=await admin.from("watch_party_pix_orders")
  .select("request_id,user_id,payment_id,amount_cents,status")
  .eq("request_id",requestId).eq("payment_id",eventId).eq("user_id",userId).maybeSingle();
 if(lookupError)return json(503,{ok:false,error:"order_lookup_failed"});
 if(!order||Number(order.amount_cents)!==2719)return json(200,{ok:true,ignored:true});
 if(payment.status!=="approved"){
  const next=["rejected","cancelled","refunded","charged_back"].includes(String(payment.status))?"failed":"pending";
  const {error:updateError}=await admin.from("watch_party_pix_orders")
   .update({status:next,updated_at:new Date().toISOString()}).eq("request_id",requestId).neq("status","approved");
  if(updateError)return json(503,{ok:false,error:"order_state_failed"});
  return json(200,{ok:true,status:next});
 }
 const {error:unlockError}=await admin.from("watch_party_unlocks")
  .upsert({user_id:userId,stripe_session_id:"mp:"+eventId,amount_cents:2719,currency:"brl"},
   {onConflict:"user_id",ignoreDuplicates:true});
 if(unlockError)return json(503,{ok:false,error:"unlock_save_failed"});
 const {data:profile,error:profileError}=await admin.from("profiles")
  .select("community_tag,community_tags").eq("id",userId).maybeSingle();
 if(profileError||!profile)return json(503,{ok:false,error:"profile_missing"});
 const tags=Array.isArray(profile.community_tags)?profile.community_tags:[];
 const {error:tagError}=await admin.from("profiles").update({
  community_tags:Array.from(new Set([...tags,"happier_than_ever"])),
  community_tag:profile.community_tag||"happier_than_ever"
 }).eq("id",userId);
 if(tagError)return json(503,{ok:false,error:"badge_save_failed"});
 const {error:markError}=await admin.from("watch_party_pix_orders")
  .update({status:"approved",updated_at:new Date().toISOString()}).eq("request_id",requestId);
 if(markError)return json(503,{ok:false,error:"order_state_failed"});
 return json(200,{ok:true,confirmed:true});
});

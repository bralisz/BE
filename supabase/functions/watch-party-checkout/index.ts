import "jsr:@supabase/functions-js@2.4.4/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const ROOT = "https://billieilishtv.site";
const PROJECT_PREVIEW = /^be(?:-[a-z0-9-]+)?-gff17\.vercel\.app$/i;
const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
// Launch prices are fixed in each checkout currency; any future FX update must
// change the UI, server and database constraint together.
const WATCH_PARTY_PRICES: Record<string, number> = { usd: 500, brl: 2719, eur: 449 };
function priceForLocale(value: unknown): { currency: string; amount: number; locale: string } {
 const slug = String(value || "en-us").trim().toLowerCase();
 const currency = slug === "pt-br" ? "brl" : slug === "en-us" ? "usd" : "eur";
 const locale = slug === "pt-br" ? "pt-BR" : slug === "en-us" ? "en" : slug === "es" ? "es" : slug === "fr" ? "fr" : "it";
 return { currency, amount: WATCH_PARTY_PRICES[currency], locale };
}
const supaUrl = Deno.env.get("SUPABASE_URL") || "";
const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
function allowed(origin:string):boolean {
 if(origin===ROOT||origin==="https://www.billieilishtv.site")return true;
 try {const u=new URL(origin);return u.protocol==="https:" && PROJECT_PREVIEW.test(u.hostname);}catch{return false;}
}
function headers(origin:string):HeadersInit{return {"Access-Control-Allow-Origin":origin&&allowed(origin)?origin:ROOT,"Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin","Cache-Control":"no-store","Content-Type":"application/json; charset=utf-8"};}
function reply(origin:string,code:number,data:unknown){return new Response(JSON.stringify(data),{status:code,headers:headers(origin)});}
async function stripe(path:string,body?:URLSearchParams):Promise<{ok:boolean,data:any}>{
 const res=await fetch("https://api.stripe.com/v1/"+path,{method:body?"POST":"GET",headers:{Authorization:"Bearer "+stripeKey,...(body?{"Content-Type":"application/x-www-form-urlencoded"}:{})},body:body?.toString()});
 return {ok:res.ok,data:await res.json().catch(()=>null)};
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return reply(origin,405,{error:"method_not_allowed"});
 if(!allowed(origin))return reply(origin,403,{error:"origin_not_allowed"});
 const bearer=req.headers.get("authorization")||"";
 if(!bearer.startsWith("Bearer "))return reply(origin,401,{error:"sign_in_required"});
 if(!supaUrl||!anon||!service||!/^sk_(test|live)_/.test(stripeKey))return reply(origin,503,{error:"checkout_unavailable"});
 const userClient=createClient(supaUrl,anon,{global:{headers:{Authorization:bearer}},auth:{persistSession:false,autoRefreshToken:false}});
 const admin=createClient(supaUrl,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:userError}=await userClient.auth.getUser();
 if(userError||!user)return reply(origin,401,{error:"sign_in_required"});
 let payload:any={};try{payload=await req.json();}catch{return reply(origin,400,{error:"invalid_request"});}
 const [{data:already},{data:adminGrant},{data:receivedGift}]=await Promise.all([
  admin.from("watch_party_unlocks").select("user_id").eq("user_id",user.id).maybeSingle(),
  admin.from("watch_party_grants").select("user_id").eq("user_id",user.id).maybeSingle(),
  admin.from("watch_party_gifts").select("recipient_id").eq("recipient_id",user.id).maybeSingle()
 ]);
 const hasAccess=Boolean(already||adminGrant||receivedGift);
 if(payload.action==="status")return reply(origin,200,{unlocked:hasAccess});
 if(payload.action==="create"){
  if(hasAccess)return reply(origin,200,{unlocked:true});
  const localPrice = priceForLocale(payload.locale);
  const params=new URLSearchParams();
  params.set("mode","payment");params.set("locale",localPrice.locale);
  if(payload.paymentMethod==="pix"){
   if(localPrice.currency!=="brl")return reply(origin,400,{error:"pix_brl_only"});
   params.set("payment_method_types[0]","pix");
  }
  params.set("line_items[0][price_data][currency]",localPrice.currency);
  params.set("line_items[0][price_data][unit_amount]",String(localPrice.amount));
  params.set("line_items[0][price_data][product_data][name]","BETV Watch Party — desbloqueio permanente");
  params.set("line_items[0][quantity]","1");
  params.set("client_reference_id",user.id);
  params.set("metadata[purpose]","betv_watch_party_unlock");
  params.set("metadata[user_id]",user.id);
  params.set("metadata[price_currency]",localPrice.currency);
  params.set("metadata[price_amount_cents]",String(localPrice.amount));
  params.set("success_url",origin+"/?watch_party_checkout=success&session_id={CHECKOUT_SESSION_ID}");
  params.set("cancel_url",origin+"/?watch_party_checkout=cancelled");
  if(user.email)params.set("customer_email",user.email);
  const out=await stripe("checkout/sessions",params);
  if(!out.ok||!out.data?.id||!out.data?.url)return reply(origin,502,{error:payload.paymentMethod==="pix"?"pix_not_available":"stripe_checkout_failed"});
  return reply(origin,200,{url:out.data.url,session_id:out.data.id});
 }
 if(payload.action!=="verify"||typeof payload.session_id!=="string"||!/^cs_(test|live)_[a-zA-Z0-9]{10,200}$/.test(payload.session_id))
  return reply(origin,400,{error:"invalid_session"});
 const result=await stripe("checkout/sessions/"+encodeURIComponent(payload.session_id));
 const session=result.data;
 if(!result.ok||session?.id!==payload.session_id||
 session.mode!=="payment"||
 session.client_reference_id!==user.id||session.metadata?.purpose!=="betv_watch_party_unlock"||
 session.metadata?.user_id!==user.id||
 !Object.prototype.hasOwnProperty.call(WATCH_PARTY_PRICES,String(session.currency||"")) ||
 session.amount_subtotal !== WATCH_PARTY_PRICES[String(session.currency||"")] ||
 !(
   (session.metadata?.price_currency===session.currency &&
    session.metadata?.price_amount_cents===String(session.amount_subtotal))
   || (session.currency==="usd" && session.metadata?.amount_usd_cents==="500")
 )){
  return reply(origin,409,{error:"payment_not_confirmed"});
 }
 // A pending Pix charge must never unlock membership until Stripe confirms it is paid.
 if(session.payment_status!=="paid"||session.status!=="complete")
  return reply(origin,202,{pending:true,unlocked:false});
 const {error:insertError}=await admin.from("watch_party_unlocks").upsert({
  user_id:user.id,stripe_session_id:session.id,amount_cents:session.amount_subtotal,currency:session.currency
 },{onConflict:"user_id",ignoreDuplicates:true});
 if(insertError)return reply(origin,503,{error:"unlock_save_failed"});
 // Preserve existing badges; add the new gold reward only after Stripe confirms payment.
 const {data:profile,error:profileError}=await admin.from("profiles").select("community_tag,community_tags").eq("id",user.id).single();
 if(!profileError&&profile){
  const tags=Array.isArray(profile.community_tags)?profile.community_tags:[];
  const next=Array.from(new Set([...tags,"happier_than_ever"]));
  const {error:tagError}=await admin.from("profiles").update({
    community_tags:next,
    community_tag:profile.community_tag || "happier_than_ever"
  }).eq("id",user.id);
  if(tagError)return reply(origin,503,{error:"reward_sync_failed"});
 } else return reply(origin,503,{error:"profile_not_found"});
 return reply(origin,200,{unlocked:true,tag:"happier_than_ever"});
});

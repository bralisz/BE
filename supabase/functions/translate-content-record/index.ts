import "jsr:@supabase/functions-js@2.4.4/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SITE_ORIGIN = "https://billieilishtv.site";
const PUBLIC_COLLECTIONS = new Set(["contents","featured","movies","news","notifications","ongs","sections","series","videos"]);
const PUBLIC_SETTINGS = new Set(["site","billie-eilish","ong"]);
const TARGETS: Record<string,string> = {"en-us":"en",es:"es"};
const FIELDS = ["title","name","description","subtitle","body","summary","buttonLabel","buttonText","actionLabel","ctaLabel","label","text","manualBio","kicker","footerText","sectionName","siteName"];
const DURATION_FIELDS = ["duration","runtime","videoDuration"];
const MUSIC_SECTION_IDS = new Set(["14386598-4978-403a-8548-db0ee582e291","18db9515-179c-4bad-9646-1fcda63df14a"]);
const MUSIC_SECTION_NAMES = new Set(["live performances & tv","videoclipes"]);
const MUSIC_TITLE_PATTERN = /(^|[\s._/?:=&-])(music|musica|música|song|faixa|track|album|álbum|videoclipe|live performances)(?=$|[\s._/?:=&-])/i;
const GOOGLE_JSON = "https://translate.googleapis.com/translate_a/single";
const GOOGLE_MOBILE = "https://translate.google.com/m";
const MAX_RECORDS = 50;
const MAX_CHARS = 30000;

function allowedOrigin(origin:string){
  if(!origin)return true;
  if(origin===SITE_ORIGIN||origin==="https://www.billieilishtv.site")return true;
  try{const u=new URL(origin);return ["localhost","127.0.0.1"].includes(u.hostname)&&["http:","https:"].includes(u.protocol);}catch{return false;}
}
function cors(req:Request):HeadersInit{
  const origin=req.headers.get("origin")||SITE_ORIGIN;
  return {"Access-Control-Allow-Origin":allowedOrigin(origin)?origin:SITE_ORIGIN,"Access-Control-Allow-Headers":"authorization,x-client-info,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Max-Age":"86400","Vary":"Origin"};
}
function reply(req:Request,status:number,payload:Record<string,unknown>){return new Response(JSON.stringify(payload),{status,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});}
function text(value:unknown,max=8000){return String(value??"").trim().slice(0,max);}
function decode(value:string){return value.replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&nbsp;/gi," ").replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&amp;/gi,"&");}
function htmlResult(html:string){for(const re of [/<div[^>]*class=["'][^"']*\bresult-container\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,/<div[^>]*class=["'][^"']*\bt0\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i]){const m=html.match(re);if(m){const out=decode(m[1].replace(/<br\s*\/?\s*>/gi,"\n").replace(/<[^>]+>/g,"")).trim();if(out)return out;}}return "";}
function sleep(ms:number){return new Promise(r=>setTimeout(r,ms));}
function chunks(value:string){const out:string[]=[];let rest=value;while(rest.length>1800){const sample=rest.slice(0,1801);const cut=Math.max(sample.lastIndexOf("\n"),sample.lastIndexOf(". "),sample.lastIndexOf(" "));const size=cut>950?cut+1:1800;out.push(rest.slice(0,size));rest=rest.slice(size);}if(rest)out.push(rest);return out;}
async function translateChunk(source:string,target:string){
  if(!source.trim())return source;
  try{
    const u=new URL(GOOGLE_JSON);u.searchParams.set("client","gtx");u.searchParams.set("sl","auto");u.searchParams.set("tl",target);u.searchParams.set("dt","t");u.searchParams.set("q",source);
    const r=await fetch(u,{signal:AbortSignal.timeout(15000),headers:{"Accept":"application/json","User-Agent":"Mozilla/5.0 BETV-Translator/2.0"}});
    if(r.ok){const p=await r.json();if(Array.isArray(p)&&Array.isArray(p[0])){const result=p[0].map((part:unknown)=>Array.isArray(part)?String(part[0]||""):"").join("").trim();if(result)return result;}}
  }catch{}
  const u=new URL(GOOGLE_MOBILE);u.searchParams.set("sl","auto");u.searchParams.set("tl",target);u.searchParams.set("hl",target);u.searchParams.set("q",source);
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const r=await fetch(u,{signal:AbortSignal.timeout(15000),headers:{"Accept":"text/html,application/xhtml+xml","User-Agent":"Mozilla/5.0 BETV-Translator/2.0"}});
      if(r.status===429)throw new Error("rate_limited");
      if(!r.ok)throw new Error(`http_${r.status}`);
      const result=htmlResult(await r.text());if(result)return result;
      throw new Error("translation_not_found");
    }catch(error){if(attempt===3)throw error;await sleep(400*attempt);}
  }
  throw new Error("translation_failed");
}
async function translateValues(values:string[],target:string){
  if(!values.length)return [];
  const result=new Array<string>(values.length).fill("");
  const pieces:{index:number,part:number,source:string,marker:string}[]=[];
  values.forEach((value,index)=>chunks(value).forEach((source,part)=>pieces.push({index,part,source,marker:`⟦BETV${index}_${part}⟧`})));
  const groups:typeof pieces[]=[];let group:typeof pieces=[];let size=0;
  for(const piece of pieces){const next=piece.marker.length+piece.source.length+3;if(group.length&&size+next>1750){groups.push(group);group=[];size=0;}group.push(piece);size+=next;}if(group.length)groups.push(group);
  const translated=new Map<string,string>();
  for(const items of groups){
    const joined=items.map(item=>`${item.marker}
${item.source}`).join("\n");
    const output=await translateChunk(joined,target);
    const matches=Array.from(output.matchAll(/⟦\s*BETV(\d+)_(\d+)\s*⟧/gi));
    if(matches.length===items.length){
      matches.forEach((match,position)=>{const start=(match.index||0)+match[0].length;const end=position+1<matches.length?(matches[position+1].index||output.length):output.length;translated.set(`${match[1]}:${match[2]}`,output.slice(start,end).trim());});
    }else{
      for(const item of items){translated.set(`${item.index}:${item.part}`,await translateChunk(item.source,target));await sleep(40);}
    }
    await sleep(60);
  }
  values.forEach((_,index)=>{result[index]=pieces.filter(piece=>piece.index===index).sort((a,b)=>a.part-b.part).map(piece=>translated.get(`${piece.index}:${piece.part}`)||piece.source).join("").trim();});
  return result;
}
function active(value:unknown){return value!==false&&String(value??"true").toLowerCase()!=="false";}
function preserveTitle(collection:string,data:Record<string,unknown>,locale:string){
  const sectionId=text(data.sectionId,120),sectionName=text(data.sectionName||data.sourceSectionTitle,160).toLowerCase();
  const exactMusic=collection==="videos"&&(MUSIC_SECTION_IDS.has(sectionId)||MUSIC_SECTION_NAMES.has(sectionName));
  if(exactMusic)return true;
  if(locale!=="es")return false;
  if(collection==="movies"||collection==="news")return true;
  if(collection==="sections"&&text(data.title||data.name,200).toLowerCase()==="vanity fair")return true;
  const metadata=[data.sectionName,data.sourceSectionTitle,data.category,data.type,data.contentType,data.itemType].map(value=>text(value,180)).filter(Boolean).join(" ");
  return ["videos","contents","featured","news"].includes(collection)&&MUSIC_TITLE_PATTERN.test(metadata);
}
function duration(value:unknown,locale:string){const raw=text(value,120);if(!raw)return raw;const h=raw.match(/(\d+)\s*(?:h|hr|hrs|hora|horas)\b/i);const m=raw.match(/(\d+)\s*(?:m|min|mins|minuto|minutos)\b/i);if(!h&&!m)return raw;return [h?(locale==="en-us"?`${Number(h[1])} hr`:`${Number(h[1])} h`):"",m?`${Number(m[1])} min`:""].filter(Boolean).join(" ");}
function sourceSignature(data:Record<string,unknown>){const source:Record<string,unknown>={};for(const field of [...FIELDS,...DURATION_FIELDS])if(Object.prototype.hasOwnProperty.call(data,field))source[field]=data[field];const serialized=JSON.stringify(source);let hash=2166136261;for(let i=0;i<serialized.length;i++){hash^=serialized.charCodeAt(i);hash=Math.imul(hash,16777619);}return `src-${(hash>>>0).toString(16)}`;}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
  if(req.method!=="POST")return reply(req,405,{error:"Método não permitido."});
  const origin=req.headers.get("origin")||"";if(!allowedOrigin(origin))return reply(req,403,{error:"Origem não permitida."});
  let body:Record<string,unknown>;try{body=await req.json();}catch{return reply(req,400,{error:"Dados inválidos."});}

  const mode=text(body.mode,20).toLowerCase();
  if(mode==="texts"){
    if(!origin)return reply(req,403,{error:"Origem necessária."});
    const locale=text(body.locale,10).toLowerCase(),target=TARGETS[locale];
    const texts=Array.from(new Set((Array.isArray(body.texts)?body.texts:[]).map(v=>text(v,1800)).filter(v=>v&&/\p{L}/u.test(v)))).slice(0,60);
    if(!target||!texts.length||texts.reduce((s,v)=>s+v.length,0)>9000)return reply(req,400,{error:"Solicitação de tradução inválida."});
    try{return reply(req,200,{locale,translations:await translateValues(texts,target),provider:"deep-translator-google-web"});}catch(error){console.error("UI translation failed",text((error as Error)?.message,160));return reply(req,503,{error:"Tradução temporariamente indisponível."});}
  }

  const collection=text(body.collection,40).toLowerCase();
  const ids=Array.from(new Set((Array.isArray(body.ids)?body.ids:[]).map(v=>text(v,120)).filter(Boolean))).slice(0,MAX_RECORDS);
  const locales=Array.from(new Set((Array.isArray(body.locales)?body.locales:[]).map(v=>text(v,10).toLowerCase()).filter(v=>TARGETS[v])));
  const force=body.force===true;
  if((collection!=="settings"&&!PUBLIC_COLLECTIONS.has(collection))||!ids.length||!locales.length)return reply(req,400,{error:"Solicitação de tradução inválida."});

  const url=Deno.env.get("SUPABASE_URL")||"",anon=Deno.env.get("SUPABASE_ANON_KEY")||"",service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
  if(!url||!anon||!service)return reply(req,503,{error:"Servidor de tradução incompleto."});
  const authorization=req.headers.get("authorization")||"";
  const userClient=createClient(url,anon,{global:{headers:authorization?{Authorization:authorization}:{}},auth:{persistSession:false,autoRefreshToken:false}});
  const adminClient=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  let isAdmin=false;
  if(authorization.startsWith("Bearer ")){const {data:userData}=await userClient.auth.getUser().catch(()=>({data:{user:null}}));if(userData?.user){const {data}=await userClient.rpc("is_admin").catch(()=>({data:false}));isAdmin=data===true;}}
  if(!isAdmin){const publicSettings=collection==="settings"&&ids.every(id=>PUBLIC_SETTINGS.has(id));if(force||(!PUBLIC_COLLECTIONS.has(collection)&&!publicSettings))return reply(req,403,{error:"Acesso administrativo necessário."});}

  const table=collection==="settings"?"site_settings":"content_items";
  let query=adminClient.from(table).select("id,data,created_at,updated_at").in("id",ids);
  if(collection!=="settings")query=query.eq("collection",collection);
  const {data:loaded,error:loadError}=await query;
  if(loadError)return reply(req,500,{error:"Não foi possível carregar o conteúdo."});
  const rows=(loaded||[]).filter((row:any)=>isAdmin||collection==="settings"||active(row.data?.active));
  let total=0;const responseRecords:Record<string,unknown>[]=[];
  try{
    for(const row of rows as any[]){
      const data={...(row.data||{})};const translations={...(data.translations||{})};const signature=sourceSignature(data);
      for(const locale of locales){
        const keepTitle=collection==="ongs"||preserveTitle(collection,data,locale);
        const existing=translations[locale];if(!force&&existing&&existing.sourceUpdatedAt===signature){const cached={...existing};if(keepTitle){delete cached.title;delete cached.name;}translations[locale]=cached;responseRecords.push({id:row.id,locale,translation:cached,cached:true});continue;}
        const fields=FIELDS.filter(field=>!(keepTitle&&(field==="title"||field==="name"))).filter(field=>typeof data[field]==="string"&&text(data[field])&&!/^https?:\/\//i.test(text(data[field])));
        total+=fields.reduce((sum,field)=>sum+text(data[field]).length,0);if(total>MAX_CHARS)return reply(req,413,{error:"Conteúdo excede o limite por solicitação."});
        const values=await translateValues(fields.map(field=>text(data[field])),TARGETS[locale]);
        const translated:Record<string,unknown>={sourceUpdatedAt:signature,translatedAt:new Date().toISOString(),provider:"deep-translator-google-web"};
        fields.forEach((field,index)=>translated[field]=values[index]||data[field]);
        DURATION_FIELDS.forEach(field=>{if(typeof data[field]==="string"&&text(data[field]))translated[field]=duration(data[field],locale);});
        translations[locale]=translated;responseRecords.push({id:row.id,locale,translation:translated,cached:false});
      }
      data.translations=translations;const {error}=await adminClient.from(table).update({data}).eq("id",row.id);if(error)throw new Error(`save_${error.code}`);
    }
    return reply(req,200,{records:responseRecords,translatedRecords:rows.length,locales,provider:"deep-translator-google-web"});
  }catch(error){console.error("Translation failed",text((error as Error)?.message,160));return reply(req,503,{error:"A tradução automática está temporariamente indisponível."});}
});

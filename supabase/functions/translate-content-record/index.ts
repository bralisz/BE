import "jsr:@supabase/functions-js@2.4.4/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SITE_ORIGIN = "https://billieilishtv.site";
const PUBLIC_COLLECTIONS = new Set(["contents","featured","movies","notifications","ongs","sections","series","videos"]);
const PUBLIC_SETTINGS = new Set(["site","billie-eilish","ong"]);
const TARGETS: Record<string,string> = {"en-us":"en",es:"es",fr:"fr"};
const FIELDS = ["title","name","description","subtitle","body","summary","buttonLabel","buttonText","actionLabel","ctaLabel","label","text","manualBio","kicker","footerText","sectionName","siteName"];
const DURATION_FIELDS = ["duration","runtime","videoDuration"];
const MUSIC_VIDEO_SECTION_ID = "18db9515-179c-4bad-9646-1fcda63df14a";
const MUSIC_VIDEO_SECTION_NAMES = new Set(["videoclipes","videoclips","music videos","music video","videos musicais","vídeos musicais","videos musicales","vídeos musicales","vidéos musicales","vidéos musicaux"]);
const PROTECTED_TERMS = [
  "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?","HIT ME HARD AND SOFT","Happier Than Ever","dont smile at me","Guitar Songs",
  "all the good girls go to hell","bad guy","Bellyache","BIRDS OF A FEATHER","Bored","bury a friend","CHIHIRO","everything i wanted","Guess","hostage","idontwannabeyouanymore","Lo Vas A Olvidar","Lost Cause","lovely","LUNCH","Male Fantasy","my future","NDA","Never Felt So Alone","No Time To Die","ocean eyes","Therefore I Am","watch","What Was I Made For?","when the party's over","xanny","you should see me in a crown","Your Power","THE GREATEST","SKINNY","L'AMOUR DE MA VIE","Billie Bossa Nova","Getting Older","TV","bitches broken hearts","listen before i go","come out and play","One Less Lonely Girl","Have Yourself A Merry Little Christmas",
  "Billie Eilish TV","Billie Eilish","Prime Video","Apple TV","Paramount+","Disney+","Twitter / X",
  "CC BY-SA 4.0","SameSite=Lax","localStorage","sessionStorage","be_site_preferences","be_cookie_ack",
  "FINNEAS","Discord","Google","Instagram","TikTok","Spotify","YouTube","Stripe","Supabase",
  "BETV","DMCA","LGPD","HTTPS","BRL","USD","BE"
].sort((a,b)=>b.length-a.length);
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
function escapeRegex(value:string){return value.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
function protectNonTranslatables(input:string){
  const values:string[]=[];
  const keep=(value:string)=>{const index=values.push(value)-1;return `[[[${index}]]]`;};
  let value=input;
  const patterns=[
    /⟦\s*BETV\d+_\d+\s*⟧/gi,
    /https?:\/\/[^\s<>()]+/gi,
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,
    /\{[a-zA-Z0-9_]+\}/g,
    /\$\{[^}]+\}/g,
    /@[a-zA-Z0-9_.-]+/g,
    /#[a-zA-Z0-9_.-]+/g,
    /\bbe_[a-z0-9_]+\b/gi
  ];
  for(const pattern of patterns)value=value.replace(pattern,match=>keep(match));
  for(const term of PROTECTED_TERMS){
    const pattern=new RegExp(`(^|[^\\p{L}\\p{N}])(${escapeRegex(term)})(?=$|[^\\p{L}\\p{N}])`,"giu");
    value=value.replace(pattern,(_match,prefix,matched)=>`${prefix}${keep(matched)}`);
  }
  return {
    value,
    restore(output:string){return output.replace(/\[\s*\[\s*\[\s*(\d+)\s*\]\s*\]\s*\]/g,(_match,index)=>values[Number(index)]??_match);}
  };
}
function replaceAll(value:string,replacements:[RegExp,string][]){let output=value;for(const [pattern,replacement] of replacements)output=output.replace(pattern,replacement);return output;}
function naturalizeSpanish(value:string){
  let output=replaceAll(value,[
    [/\bUsted puede\b/g,"Puedes"],[/\busted puede\b/g,"puedes"],[/\bUsted debe\b/g,"Debes"],[/\busted debe\b/g,"debes"],
    [/\bUsted tiene\b/g,"Tienes"],[/\busted tiene\b/g,"tienes"],[/\bUsted está\b/g,"Estás"],[/\busted está\b/g,"estás"],
    [/\bUsted quiere\b/g,"Quieres"],[/\busted quiere\b/g,"quieres"],
    [/\bSeleccione\b/g,"Selecciona"],[/\bseleccione\b/g,"selecciona"],[/\bElija\b/g,"Elige"],[/\belija\b/g,"elige"],
    [/\bIntroduzca\b/g,"Ingresa"],[/\bintroduzca\b/g,"ingresa"],[/\bIngrese\b/g,"Ingresa"],[/\bingrese\b/g,"ingresa"],
    [/\bCompruebe\b/g,"Revisa"],[/\bcompruebe\b/g,"revisa"],[/\bVerifique\b/g,"Revisa"],[/\bverifique\b/g,"revisa"],
    [/\bInténtelo\b/g,"Inténtalo"],[/\binténtelo\b/g,"inténtalo"],[/\bVuelva\b/g,"Vuelve"],[/\bvuelva\b/g,"vuelve"],
    [/\bEspere\b/g,"Espera"],[/\bespere\b/g,"espera"],[/\bActualice\b/g,"Actualiza"],[/\bactualice\b/g,"actualiza"],
    [/\bAbra\b/g,"Abre"],[/\babra\b/g,"abre"],[/\bUtilice\b/g,"Usa"],[/\butilice\b/g,"usa"],
    [/\bConsulte\b/g,"Consulta"],[/\bconsulte\b/g,"consulta"],[/\bToque\b/g,"Toca"],[/\btoque\b/g,"toca"],
    [/\bHaga clic\b/g,"Haz clic"],[/\bhaga clic\b/g,"haz clic"],[/\bConfirme\b/g,"Confirma"],[/\bconfirme\b/g,"confirma"],
    [/\bimporte\b/gi,"monto"],[/\bimportes\b/gi,"montos"],[/\bcostes\b/gi,"costos"],[/\bvídeo\b/gi,"video"],[/\bvídeos\b/gi,"videos"],
    [/\bordenador\b/gi,"computadora"],[/\bmóvil\b/gi,"celular"],[/\bIntroduce\b/g,"Ingresa"],[/\bintroduce\b/g,"ingresa"],
    [/\bComprueba\b/g,"Revisa"],[/\bcomprueba\b/g,"revisa"],[/\bPulsa\b/g,"Toca"],[/\bpulsa\b/g,"toca"]
  ]);
  const singular="cuenta|perfil|contraseña|correo|e-mail|nombre|usuario|sesión|navegador|dispositivo|pago|donación|duda|problema|identidad|imagen|avatar|banner|preferencia|solicitud|moneda|dirección|conexión";
  const plural="datos|preferencias|favoritos|contenidos|videos|álbumes|credenciales|cambios|notificaciones|derechos";
  output=output.replace(new RegExp(`\\bsu (${singular})\\b`,"gi"),(match,noun)=>`${/^Su /.test(match)?"Tu":"tu"} ${noun}`);
  output=output.replace(new RegExp(`\\bsus (${plural})\\b`,"gi"),(match,noun)=>`${/^Sus /.test(match)?"Tus":"tus"} ${noun}`);
  return output;
}
function naturalizeFrench(value:string){
  let output=replaceAll(value,[
    [/\bVeuillez\s+/g,""],[/\bveuillez\s+/g,""],[/\bVous pouvez\b/g,"Tu peux"],[/\bvous pouvez\b/g,"tu peux"],
    [/\bVous devez\b/g,"Tu dois"],[/\bvous devez\b/g,"tu dois"],[/\bVous avez\b/g,"Tu as"],[/\bvous avez\b/g,"tu as"],
    [/\bVous êtes\b/g,"Tu es"],[/\bvous êtes\b/g,"tu es"],[/\bVous voulez\b/g,"Tu veux"],[/\bvous voulez\b/g,"tu veux"],
    [/\bVous souhaitez\b/g,"Tu souhaites"],[/\bvous souhaitez\b/g,"tu souhaites"],[/\bVous devrez\b/g,"Tu devras"],[/\bvous devrez\b/g,"tu devras"],
    [/\bVous pourrez\b/g,"Tu pourras"],[/\bvous pourrez\b/g,"tu pourras"],[/\bvous connecter\b/g,"te connecter"],[/\bvous déconnecter\b/g,"te déconnecter"],
    [/\bVous choisissez\b/g,"Tu choisis"],[/\bvous choisissez\b/g,"tu choisis"],[/\bVous utilisez\b/g,"Tu utilises"],[/\bvous utilisez\b/g,"tu utilises"],
    [/\bVous acceptez\b/g,"Tu acceptes"],[/\bvous acceptez\b/g,"tu acceptes"],[/\bVous contactez\b/g,"Tu contactes"],[/\bvous contactez\b/g,"tu contactes"],
    [/\bVous saisissez\b/g,"Tu saisis"],[/\bvous saisissez\b/g,"tu saisis"],[/\bVous partagez\b/g,"Tu partages"],[/\bvous partagez\b/g,"tu partages"],
    [/\bVous ouvrez\b/g,"Tu ouvres"],[/\bvous ouvrez\b/g,"tu ouvres"],[/\bVous vérifiez\b/g,"Tu vérifies"],[/\bvous vérifiez\b/g,"tu vérifies"],
    [/\bVous confirmez\b/g,"Tu confirmes"],[/\bvous confirmez\b/g,"tu confirmes"],[/\bVous sélectionnez\b/g,"Tu sélectionnes"],[/\bvous sélectionnez\b/g,"tu sélectionnes"],
    [/\bVous revenez\b/g,"Tu reviens"],[/\bvous revenez\b/g,"tu reviens"],[/\bVous attendez\b/g,"Tu attends"],[/\bvous attendez\b/g,"tu attends"],
    [/\bVous essayez\b/g,"Tu essaies"],[/\bvous essayez\b/g,"tu essaies"],[/\bVous recevez\b/g,"Tu reçois"],[/\bvous recevez\b/g,"tu reçois"],
    [/\bVous préférez\b/g,"Tu préfères"],[/\bvous préférez\b/g,"tu préfères"],[/\bVous gardez\b/g,"Tu gardes"],[/\bvous gardez\b/g,"tu gardes"],
    [/\bpour vous\b/g,"pour toi"],[/\bà vous\b/g,"à toi"],[/\bde vous\b/g,"de toi"],[/\bnous vous\b/g,"nous te"],
    [/\bChoisissez\b/g,"Choisis"],[/\bchoisissez\b/g,"choisis"],[/\bSélectionnez\b/g,"Sélectionne"],[/\bsélectionnez\b/g,"sélectionne"],
    [/\bSaisissez\b/g,"Saisis"],[/\bsaisissez\b/g,"saisis"],[/\bEntrez\b/g,"Entre"],[/\bentrez\b/g,"entre"],
    [/\bOuvrez\b/g,"Ouvre"],[/\bouvrez\b/g,"ouvre"],[/\bUtilisez\b/g,"Utilise"],[/\butilisez\b/g,"utilise"],
    [/\bVérifiez\b/g,"Vérifie"],[/\bvérifiez\b/g,"vérifie"],[/\bConsultez\b/g,"Consulte"],[/\bconsultez\b/g,"consulte"],
    [/\bRéessayez\b/g,"Réessaie"],[/\bréessayez\b/g,"réessaie"],[/\bRevenez\b/g,"Reviens"],[/\brevenez\b/g,"reviens"],
    [/\bAttendez\b/g,"Attends"],[/\battendez\b/g,"attends"],[/\bRafraîchissez\b/g,"Actualise"],[/\brafraîchissez\b/g,"actualise"],
    [/\bActualisez\b/g,"Actualise"],[/\bactualisez\b/g,"actualise"],[/\bCliquez\b/g,"Clique"],[/\bcliquez\b/g,"clique"],
    [/\bAppuyez\b/g,"Appuie"],[/\bappuyez\b/g,"appuie"],[/\bTouchez\b/g,"Touche"],[/\btouchez\b/g,"touche"],
    [/\bContactez\b/g,"Contacte"],[/\bcontactez\b/g,"contacte"],[/\bIndiquez\b/g,"Indique"],[/\bindiquez\b/g,"indique"],
    [/\bAjoutez\b/g,"Ajoute"],[/\bajoutez\b/g,"ajoute"],[/\bSupprimez\b/g,"Supprime"],[/\bsupprimez\b/g,"supprime"],
    [/\bLisez\b/g,"Lis"],[/\blisez\b/g,"lis"],[/\bConfirmez\b/g,"Confirme"],[/\bconfirmez\b/g,"confirme"],
    [/\bSignalez\b/g,"Signale"],[/\bsignalez\b/g,"signale"],[/\bTéléchargez\b/g,"Télécharge"],[/\btéléchargez\b/g,"télécharge"]
  ]);
  const masculine="compte|profil|mot de passe|e-mail|email|navigateur|appareil|paiement|don|problème|avatar|choix|nom|contenu|lien|identifiant";
  const feminine="adresse|session|question|identité|image|bannière|préférence|demande|monnaie|banque|connexion|information";
  const plural="données|informations|identifiants|favoris|contenus|vidéos|albums|préférences|droits|notifications|modifications";
  output=output.replace(new RegExp(`\\bvotre (${masculine})\\b`,"gi"),(match,noun)=>`${/^Votre /.test(match)?"Ton":"ton"} ${noun}`);
  output=output.replace(new RegExp(`\\bvotre (${feminine})\\b`,"gi"),(match,noun)=>`${/^Votre /.test(match)?"Ta":"ta"} ${noun}`);
  output=output.replace(new RegExp(`\\bvos (${plural})\\b`,"gi"),(match,noun)=>`${/^Vos /.test(match)?"Tes":"tes"} ${noun}`);
  return output;
}
function naturalizeTranslation(value:string,target:string){
  if(target==="es")return naturalizeSpanish(value);
  if(target==="fr")return naturalizeFrench(value);
  if(target==="en")return value.replace(/(^|[.!?]\s+)Please\s+/g,"$1");
  return value;
}
function chunks(value:string){const out:string[]=[];let rest=value;while(rest.length>1800){const sample=rest.slice(0,1801);const cut=Math.max(sample.lastIndexOf("\n"),sample.lastIndexOf(". "),sample.lastIndexOf(" "));const size=cut>950?cut+1:1800;out.push(rest.slice(0,size));rest=rest.slice(size);}if(rest)out.push(rest);return out;}
async function translateChunk(input:string,target:string){
  if(!input.trim())return input;
  const protectedInput=protectNonTranslatables(input),source=protectedInput.value;
  try{
    const u=new URL(GOOGLE_JSON);u.searchParams.set("client","gtx");u.searchParams.set("sl","auto");u.searchParams.set("tl",target);u.searchParams.set("dt","t");u.searchParams.set("q",source);
    const r=await fetch(u,{signal:AbortSignal.timeout(15000),headers:{"Accept":"application/json","User-Agent":"Mozilla/5.0 BETV-Translator/2.0"}});
    if(r.ok){const p=await r.json();if(Array.isArray(p)&&Array.isArray(p[0])){const result=p[0].map((part:unknown)=>Array.isArray(part)?String(part[0]||""):"").join("").trim();if(result)return protectedInput.restore(result);}}
  }catch{}
  const u=new URL(GOOGLE_MOBILE);u.searchParams.set("sl","auto");u.searchParams.set("tl",target);u.searchParams.set("hl",target);u.searchParams.set("q",source);
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const r=await fetch(u,{signal:AbortSignal.timeout(15000),headers:{"Accept":"text/html,application/xhtml+xml","User-Agent":"Mozilla/5.0 BETV-Translator/2.0"}});
      if(r.status===429)throw new Error("rate_limited");
      if(!r.ok)throw new Error(`http_${r.status}`);
      const result=htmlResult(await r.text());if(result)return protectedInput.restore(result);
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
  values.forEach((_source,index)=>{const output=pieces.filter(piece=>piece.index===index).sort((a,b)=>a.part-b.part).map(piece=>translated.get(`${piece.index}:${piece.part}`)||piece.source).join("").trim();result[index]=naturalizeTranslation(output,target);});
  return result;
}
function active(value:unknown){return value!==false&&String(value??"true").toLowerCase()!=="false";}
function preserveTitle(collection:string,data:Record<string,unknown>,locale:string){if(!["es","fr"].includes(locale))return false;if(data.preserveTitle===true||text(data.preserveTitle,10).toLowerCase()==="true")return true;if(["albums","albuns","álbuns"].includes(collection))return true;if(collection!=="videos")return false;const sectionName=text(data.sectionName||data.sourceSectionTitle,160).toLowerCase();return text(data.sectionId,120)===MUSIC_VIDEO_SECTION_ID||MUSIC_VIDEO_SECTION_NAMES.has(sectionName);}
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
    try{return reply(req,200,{locale,style:"informal-native",translations:await translateValues(texts,target),provider:"google-web-natural-v2"});}catch(error){console.error("UI translation failed",text((error as Error)?.message,160));return reply(req,503,{error:"Tradução temporariamente indisponível."});}
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
        const keepTitle=preserveTitle(collection,data,locale);
        const existing=translations[locale];
        const cachedTitleComplete=keepTitle||(!Object.prototype.hasOwnProperty.call(data,"title")||Object.prototype.hasOwnProperty.call(existing||{},"title"))&&(!Object.prototype.hasOwnProperty.call(data,"name")||Object.prototype.hasOwnProperty.call(existing||{},"name"));
        if(!force&&existing&&existing.sourceUpdatedAt===signature&&cachedTitleComplete){const cached={...existing};if(keepTitle){delete cached.title;delete cached.name;translations[locale]=cached;}responseRecords.push({id:row.id,locale,translation:cached,cached:true});continue;}
        const fields=FIELDS.filter(field=>!(keepTitle&&(field==="title"||field==="name"))).filter(field=>typeof data[field]==="string"&&text(data[field])&&!/^https?:\/\//i.test(text(data[field])));
        total+=fields.reduce((sum,field)=>sum+text(data[field]).length,0);if(total>MAX_CHARS)return reply(req,413,{error:"Conteúdo excede o limite por solicitação."});
        const values=await translateValues(fields.map(field=>text(data[field])),TARGETS[locale]);
        const translated:Record<string,unknown>={sourceUpdatedAt:signature,translatedAt:new Date().toISOString(),style:"informal-native",provider:"google-web-natural-v2"};
        fields.forEach((field,index)=>translated[field]=values[index]||data[field]);
        DURATION_FIELDS.forEach(field=>{if(typeof data[field]==="string"&&text(data[field]))translated[field]=duration(data[field],locale);});
        translations[locale]=translated;responseRecords.push({id:row.id,locale,translation:translated,cached:false});
      }
      data.translations=translations;const {error}=await adminClient.from(table).update({data}).eq("id",row.id);if(error)throw new Error(`save_${error.code}`);
    }
    return reply(req,200,{records:responseRecords,translatedRecords:rows.length,locales,style:"informal-native",provider:"google-web-natural-v2"});
  }catch(error){console.error("Translation failed",text((error as Error)?.message,160));return reply(req,503,{error:"A tradução automática está temporariamente indisponível."});}
});

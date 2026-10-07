import "jsr:@supabase/functions-js@2.4.4/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SITE = "https://billieilishtv.site";
const ALLOWED_SITE_ORIGINS = new Set([
  SITE,
  "https://www.billieilishtv.site",
  "https://be-bralis.vercel.app",
]);
const PUBLIC = new Set([
  "contents",
  "featured",
  "gallery",
  "movies",
  "news",
  "notifications",
  "ongs",
  "sections",
  "series",
  "videos",
]);
const PUBLIC_SETTINGS = new Set(["site", "billie-eilish", "ong"]);
const TARGET: Record<string, string> = {
  "en-us": "en",
  es: "es",
  fr: "fr",
  it: "it",
};
const FIELDS = [
  "title",
  "name",
  "description",
  "subtitle",
  "body",
  "summary",
  "buttonLabel",
  "buttonText",
  "actionLabel",
  "ctaLabel",
  "label",
  "text",
  "manualBio",
  "kicker",
  "footerText",
  "sectionName",
  "siteName",
];
const DURATIONS = ["duration", "runtime", "videoDuration"];
const MUSIC_VIDEO_IDS = new Set([
  "18db9515-179c-4bad-9646-1fcda63df14a",
  "14386598-4978-403a-8548-db0ee582e291",
]);
const MUSIC_VIDEO_NAMES = new Set([
  "videoclipes",
  "videoclips",
  "music videos",
  "music video",
  "videos musicais",
  "vídeos musicais",
  "videos musicales",
  "vídeos musicales",
  "vidéos musicales",
  "vidéos musicaux",
  "live performances & tv",
]);
const REV = "20261007-reliable-translations-v1";
const PROVIDER = "google-web-natural-v4";
const BASE_KEEP = [
  "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
  "HIT ME HARD AND SOFT",
  "Happier Than Ever",
  "dont smile at me",
  "Guitar Songs",
  "all the good girls go to hell",
  "bad guy",
  "Bellyache",
  "BIRDS OF A FEATHER",
  "Bored",
  "bury a friend",
  "CHIHIRO",
  "everything i wanted",
  "Guess",
  "hostage",
  "idontwannabeyouanymore",
  "Lo Vas A Olvidar",
  "Lost Cause",
  "lovely",
  "LUNCH",
  "Male Fantasy",
  "my future",
  "NDA",
  "Never Felt So Alone",
  "No Time To Die",
  "ocean eyes",
  "Therefore I Am",
  "watch",
  "What Was I Made For?",
  "when the party's over",
  "xanny",
  "you should see me in a crown",
  "Your Power",
  "THE GREATEST",
  "SKINNY",
  "WILDFLOWER",
  "L'AMOUR DE MA VIE",
  "Billie Bossa Nova",
  "Getting Older",
  "TV",
  "bitches broken hearts",
  "listen before i go",
  "come out and play",
  "One Less Lonely Girl",
  "Have Yourself A Merry Little Christmas",
  "Billie Eilish TV",
  "Billie Eilish",
  "FINNEAS",
  "Prime Video",
  "Apple TV",
  "Paramount+",
  "Disney+",
  "Twitter / X",
  "Discord",
  "Google",
  "Instagram",
  "TikTok",
  "Spotify",
  "YouTube",
  "Stripe",
  "Supabase",
  "BETV",
  "DMCA",
  "LGPD",
  "HTTPS",
  "BRL",
  "USD",
  "BE",
].sort((a, b) => b.length - a.length);
const GJSON = "https://translate.googleapis.com/translate_a/single";
const text = (v: unknown, n = 20000) =>
  String(v ?? "")
    .trim()
    .slice(0, n);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function normalizeNewlines(v: string) {
  return v.replace(/\\+n/g, "\n");
}
function originOk(origin: string) {
  if (!origin) return true;
  if (ALLOWED_SITE_ORIGINS.has(origin)) return true;
  try {
    const u = new URL(origin);
    return (
      ["localhost", "127.0.0.1"].includes(u.hostname) &&
      ["http:", "https:"].includes(u.protocol)
    );
  } catch {
    return false;
  }
}
function cors(req: Request): HeadersInit {
  const o = req.headers.get("origin") || SITE;
  return {
    "Access-Control-Allow-Origin": originOk(o) ? o : SITE,
    "Access-Control-Allow-Headers":
      "authorization,x-client-info,apikey,content-type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
function reply(req: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...cors(req),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Retry-After": "300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
function esc(v: string) {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function protect(input: string, protectedTerms: string[] = BASE_KEEP) {
  const vals: string[] = [];
  const hold = (v: string) => `[[[${vals.push(v) - 1}]]]`;
  let s = input;
  for (const re of [
    /⟦\s*BETV\d+_\d+\s*⟧/gi,
    /https?:\/\/[^\s<>()]+/gi,
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,
    /\{[a-zA-Z0-9_]+\}/g,
    /\$\{[^}]+\}/g,
    /@[a-zA-Z0-9_.-]+/g,
    /#(?:[a-zA-Z0-9_.-]+)/g,
    /\bbe_[a-z0-9_]+\b/gi,
  ])
    s = s.replace(re, (m) => hold(m));
  for (const term of protectedTerms) {
    const re = new RegExp(
      `(^|[^\\p{L}\\p{N}])(${esc(term)})(?=$|[^\\p{L}\\p{N}])`,
      "giu",
    );
    s = s.replace(re, (_m, p, m) => `${p}${hold(m)}`);
  }
  return {
    value: s,
    restore: (v: string) =>
      v.replace(
        /\[\s*\[\s*\[\s*(\d+)\s*\]\s*\]\s*\]/g,
        (_m, i) => vals[Number(i)] ?? _m,
      ),
  };
}
function natural(v: string, target: string) {
  if (target === "es")
    return v
      .replace(/\bUsted puede\b/g, "Puedes")
      .replace(/\busted puede\b/g, "puedes")
      .replace(/\bUsted debe\b/g, "Debes")
      .replace(/\busted debe\b/g, "debes")
      .replace(/\bUsted tiene\b/g, "Tienes")
      .replace(/\busted tiene\b/g, "tienes")
      .replace(/\bUsted está\b/g, "Estás")
      .replace(/\busted está\b/g, "estás")
      .replace(/\bSeleccione\b/g, "Selecciona")
      .replace(/\bseleccione\b/g, "selecciona")
      .replace(/\bElija\b/g, "Elige")
      .replace(/\belija\b/g, "elige")
      .replace(/\bIntroduzca\b/g, "Ingresa")
      .replace(/\bintroduzca\b/g, "ingresa")
      .replace(/\bIngrese\b/g, "Ingresa")
      .replace(/\bingrese\b/g, "ingresa")
      .replace(/\bCompruebe\b/g, "Revisa")
      .replace(/\bcompruebe\b/g, "revisa")
      .replace(/\bVerifique\b/g, "Revisa")
      .replace(/\bverifique\b/g, "revisa")
      .replace(/\bHaga clic\b/g, "Haz clic")
      .replace(/\bhaga clic\b/g, "haz clic")
      .replace(/\bvídeo\b/gi, "video")
      .replace(/\bvídeos\b/gi, "videos")
      .replace(/\bordenador\b/gi, "computadora")
      .replace(/\bmóvil\b/gi, "celular")
      .replace(/\bimporte\b/gi, "monto")
      .replace(/\bimportes\b/gi, "montos")
      .replace(/\bcostes\b/gi, "costos");
  if (target === "fr")
    return v
      .replace(/\bVeuillez\s+/g, "")
      .replace(/\bveuillez\s+/g, "")
      .replace(/\bVous pouvez\b/g, "Tu peux")
      .replace(/\bvous pouvez\b/g, "tu peux")
      .replace(/\bVous devez\b/g, "Tu dois")
      .replace(/\bvous devez\b/g, "tu dois")
      .replace(/\bChoisissez\b/g, "Choisis")
      .replace(/\bchoisissez\b/g, "choisis")
      .replace(/\bSélectionnez\b/g, "Sélectionne")
      .replace(/\bsélectionnez\b/g, "sélectionne");
  return v;
}
async function translateChunk(
  input: string,
  target: string,
  protectedTerms: string[] = BASE_KEEP,
) {
  if (!input.trim()) return input;
  const p = protect(input, protectedTerms);
  // Google's compact endpoint avoids the rate-blocked web-page scraper.
  const compact = new URL("https://clients5.google.com/translate_a/t");
  for (const [key, value] of [
    ["client", "dict-chrome-ex"],
    ["sl", "auto"],
    ["tl", target],
    ["q", p.value],
  ])
    compact.searchParams.set(key, value);
  try {
    const response = await fetch(compact, {
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "application/json" },
    });
    if (response.status === 429) throw new Error("rate_limited");
    if (response.ok) {
      const result = await response.json();
      const translated = Array.isArray(result)
        ? result
            .map((v: unknown) =>
              Array.isArray(v) ? String(v[0] || "") : String(v || ""),
            )
            .join("")
            .trim()
        : "";
      if (translated) return p.restore(translated);
    }
  } catch (e) {
    if ((e as Error).message === "rate_limited") throw e;
  }
  const endpoint = new URL(GJSON);
  for (const [key, value] of [
    ["client", "gtx"],
    ["sl", "auto"],
    ["tl", target],
    ["dt", "t"],
    ["q", p.value],
  ])
    endpoint.searchParams.set(key, value);
  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(10000),
    headers: { Accept: "application/json" },
  });
  if (response.status === 429) throw new Error("rate_limited");
  if (!response.ok) throw new Error(`http_${response.status}`);
  const result = await response.json();
  const translated = Array.isArray(result?.[0])
    ? result[0]
        .map((v: unknown) => (Array.isArray(v) ? String(v[0] || "") : ""))
        .join("")
        .trim()
    : "";
  if (!translated) throw new Error("translation_failed");
  return p.restore(translated);
}
function chunks(v: string) {
  const a: string[] = [];
  let s = v;
  while (s.length > 1700) {
    const x = s.slice(0, 1701),
      cut = Math.max(
        x.lastIndexOf("\n"),
        x.lastIndexOf(". "),
        x.lastIndexOf(" "),
      );
    const n = cut > 900 ? cut + 1 : 1700;
    a.push(s.slice(0, n));
    s = s.slice(n);
  }
  if (s) a.push(s);
  return a;
}
async function translateValues(
  values: string[],
  target: string,
  protectedTerms: string[] = BASE_KEEP,
) {
  if (!values.length) return [];
  const pieces: { i: number; p: number; s: string; m: string }[] = [];
  values.forEach((v, i) =>
    chunks(v).forEach((s, p) => pieces.push({ i, p, s, m: `⟦BETV${i}_${p}⟧` })),
  );
  const result = new Array<string>(values.length).fill("");
  let group: typeof pieces = [],
    size = 0;
  const groups: (typeof pieces)[] = [];
  for (const x of pieces) {
    const n = x.m.length + x.s.length + 3;
    if (group.length && size + n > 1650) {
      groups.push(group);
      group = [];
      size = 0;
    }
    group.push(x);
    size += n;
  }
  if (group.length) groups.push(group);
  const map = new Map<string, string>();
  for (const g of groups) {
    const joined = g.map((x) => `${x.m}\n${x.s}`).join("\n");
    const tr = await translateChunk(joined, target, protectedTerms);
    const mm = Array.from(tr.matchAll(/⟦\s*BETV(\d+)_(\d+)\s*⟧/gi));
    if (mm.length === g.length)
      mm.forEach((m, k) => {
        const st = (m.index || 0) + m[0].length,
          en = k + 1 < mm.length ? mm[k + 1].index || tr.length : tr.length;
        map.set(`${m[1]}:${m[2]}`, tr.slice(st, en).trim());
      });
    else
      for (const x of g) {
        map.set(
          `${x.i}:${x.p}`,
          await translateChunk(x.s, target, protectedTerms),
        );
        await sleep(40);
      }
    await sleep(60);
  }
  values.forEach((_v, i) => {
    result[i] = normalizeNewlines(
      natural(
        pieces
          .filter((x) => x.i === i)
          .sort((a, b) => a.p - b.p)
          .map((x) => map.get(`${x.i}:${x.p}`) || x.s)
          .join("\n")
          .trim(),
        target,
      ),
    );
  });
  return result;
}
function preserveTitle(
  collection: string,
  data: Record<string, unknown>,
  locale: string,
) {
  if (!TARGET[locale]) return false;
  if (
    data.preserveTitle === true ||
    text(data.preserveTitle, 10).toLowerCase() === "true"
  )
    return true;
  if (
    ["albums", "albuns", "álbuns"].includes(collection) ||
    (collection === "news" &&
      ["album", "álbum", "single"].includes(
        text(data.type || data.itemType).toLowerCase(),
      ))
  )
    return true;
  if (collection !== "videos") return false;
  const n = text(
    data.sectionName || data.sourceSectionTitle,
    160,
  ).toLowerCase();
  return (
    MUSIC_VIDEO_IDS.has(text(data.sectionId, 120)) || MUSIC_VIDEO_NAMES.has(n)
  );
}
function active(v: unknown) {
  return v !== false && text(v || "true").toLowerCase() !== "false";
}
function duration(v: unknown, locale: string) {
  const raw = text(v, 120);
  if (!raw) return raw;
  const h = raw.match(/(\d+)\s*(?:h|hr|hrs|hora|horas)\b/i),
    m = raw.match(/(\d+)\s*(?:m|min|mins|minuto|minutos)\b/i);
  if (!h && !m) return raw;
  return [
    h ? (locale === "en-us" ? `${Number(h[1])} hr` : `${Number(h[1])} h`) : "",
    m ? `${Number(m[1])} min` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
function signature(data: Record<string, unknown>) {
  const src: Record<string, unknown> = {};
  for (const f of [...FIELDS, ...DURATIONS])
    if (Object.prototype.hasOwnProperty.call(data, f)) src[f] = data[f];
  const s = JSON.stringify(src);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `src-${(h >>> 0).toString(16)}`;
}
function translationComplete(
  data: Record<string, unknown>,
  translation: Record<string, unknown>,
  keepTitle: boolean,
) {
  for (const field of FIELDS) {
    if (keepTitle && (field === "title" || field === "name")) continue;
    const source = data[field];
    if (
      typeof source !== "string" ||
      !text(source) ||
      /^https?:\/\//i.test(text(source))
    )
      continue;
    if (typeof translation[field] !== "string" || !text(translation[field]))
      return false;
  }
  return true;
}
const inFlight = new Map<string, Promise<string[]>>();
let providerBlockedUntil = 0;
async function cacheId(source: string, locale: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(locale + "\n" + source),
  );
  return Array.from(new Uint8Array(bytes), (v) =>
    v.toString(16).padStart(2, "0"),
  ).join("");
}
async function cachedTexts(texts: string[], locale: string) {
  const ids = await Promise.all(texts.map((v) => cacheId(v, locale)));
  const key = locale + ":" + ids.join(",");
  if (inFlight.has(key)) return inFlight.get(key)!;
  const task = (async () => {
    const db = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: cached, error } = await db
      .from("ui_translation_cache")
      .select("id,source,translated")
      .in("id", ids);
    if (error) throw new Error("cache_unavailable");
    const found = new Map<
      string,
      { id: string; source: string; translated: string }
    >();
    (cached || []).forEach((v: any) => found.set(v.id, v));
    const missing = texts
      .map((source, i) => ({ source, id: ids[i], i }))
      .filter((v) => found.get(v.id)?.source !== v.source);
    if (missing.length) {
      if (Date.now() < providerBlockedUntil) throw new Error("rate_limited");
      let values: string[];
      try {
        values = await translateValues(
          missing.map((v) => v.source),
          TARGET[locale],
          BASE_KEEP,
        );
      } catch (e) {
        if (/429|rate_limited/.test((e as Error).message))
          providerBlockedUntil = Date.now() + 300000;
        throw e;
      }
      const rows = missing.map((v, i) => ({
        id: v.id,
        locale,
        source: v.source,
        translated: values[i],
      }));
      const { error: writeError } = await db
        .from("ui_translation_cache")
        .upsert(rows, { onConflict: "id" });
      if (writeError) throw new Error("cache_save_failed");
      rows.forEach((v) => found.set(v.id, v));
    }
    return ids.map((id) => found.get(id)!.translated);
  })();
  inFlight.set(key, task);
  try {
    return await task;
  } finally {
    inFlight.delete(key);
  }
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST")
    return reply(req, 405, { error: "Método não permitido." });
  const origin = req.headers.get("origin") || "";
  if (!originOk(origin))
    return reply(req, 403, { error: "Origem não permitida." });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply(req, 400, { error: "Dados inválidos." });
  }
  const mode = text(body.mode, 20).toLowerCase();
  if (mode === "texts") {
    if (!origin) return reply(req, 403, { error: "Origem necessária." });
    const locale = text(body.locale, 10).toLowerCase(),
      target = TARGET[locale];
    const texts = Array.from(
      new Set(
        (Array.isArray(body.texts) ? body.texts : [])
          .map((v) => text(v, 1800))
          .filter((v) => v && /\p{L}/u.test(v)),
      ),
    ).slice(0, 60);
    if (
      !target ||
      !texts.length ||
      texts.reduce((s, v) => s + v.length, 0) > 9000
    )
      return reply(req, 400, { error: "Solicitação de tradução inválida." });
    try {
      return reply(req, 200, {
        locale,
        style: "informal-native",
        translations: await cachedTexts(texts, locale),
        provider: PROVIDER,
        revision: REV,
      });
    } catch (e) {
      console.error("UI translation failed", text((e as Error)?.message, 160));
      return reply(req, 503, {
        error: "Tradução temporariamente indisponível.",
      });
    }
  }
  const collection = text(body.collection, 40).toLowerCase();
  const ids = Array.from(
    new Set(
      (Array.isArray(body.ids) ? body.ids : [])
        .map((v) => text(v, 120))
        .filter(Boolean),
    ),
  ).slice(0, 50);
  const locales = Array.from(
    new Set(
      (Array.isArray(body.locales) ? body.locales : [])
        .map((v) => text(v, 10).toLowerCase())
        .filter((v) => TARGET[v]),
    ),
  );
  const force = body.force === true;
  if (
    (collection !== "settings" && !PUBLIC.has(collection)) ||
    !ids.length ||
    !locales.length
  )
    return reply(req, 400, { error: "Solicitação de tradução inválida." });
  const url = Deno.env.get("SUPABASE_URL") || "",
    anon = Deno.env.get("SUPABASE_ANON_KEY") || "",
    service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!url || !anon || !service)
    return reply(req, 503, { error: "Servidor de tradução incompleto." });
  const auth = req.headers.get("authorization") || "";
  const user = createClient(url, anon, {
      global: { headers: auth ? { Authorization: auth } : {} },
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    admin = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  let isAdmin = false;
  if (auth.startsWith("Bearer ")) {
    const { data: u } = await user.auth
      .getUser()
      .catch(() => ({ data: { user: null } }));
    if (u?.user) {
      const { data } = await user
        .rpc("is_admin")
        .catch(() => ({ data: false }));
      isAdmin = data === true;
    }
  }
  if (!isAdmin) {
    const publicSettings =
      collection === "settings" && ids.every((id) => PUBLIC_SETTINGS.has(id));
    if (force || (!PUBLIC.has(collection) && !publicSettings))
      return reply(req, 403, { error: "Acesso administrativo necessário." });
  }
  const table = collection === "settings" ? "site_settings" : "content_items";
  let q = admin
    .from(table)
    .select("id,data,created_at,updated_at")
    .in("id", ids);
  if (collection !== "settings") q = q.eq("collection", collection);
  const { data: loaded, error: loadError } = await q;
  if (loadError)
    return reply(req, 500, { error: "Não foi possível carregar o conteúdo." });
  const rows = (loaded || []).filter(
    (r: any) => isAdmin || collection === "settings" || active(r.data?.active),
  );
  let total = 0;
  const records: Record<string, unknown>[] = [];
  try {
    for (const row of rows as any[]) {
      const data = { ...(row.data || {}) },
        translations = { ...(data.translations || {}) },
        sig = signature(data);
      for (const locale of locales) {
        const keep = preserveTitle(collection, data, locale),
          existing = translations[locale];
        const complete = translationComplete(
          data,
          existing && typeof existing === "object" ? existing : {},
          keep,
        );
        if (
          !force &&
          existing &&
          existing.sourceUpdatedAt === sig &&
          complete
        ) {
          const cached = { ...existing };
          for (const k of Object.keys(cached))
            if (typeof cached[k] === "string")
              cached[k] = normalizeNewlines(cached[k] as string);
          if (keep) {
            delete cached.title;
            delete cached.name;
            translations[locale] = cached;
          } else translations[locale] = cached;
          records.push({
            id: row.id,
            locale,
            translation: cached,
            cached: true,
          });
          continue;
        }
        const fields = FIELDS.filter(
          (f) => !(keep && (f === "title" || f === "name")),
        ).filter(
          (f) =>
            typeof data[f] === "string" &&
            text(data[f]) &&
            !/^https?:\/\//i.test(text(data[f])),
        );
        total += fields.reduce((s, f) => s + text(data[f]).length, 0);
        if (total > 30000)
          return reply(req, 413, {
            error: "Conteúdo excede o limite por solicitação.",
          });
        const vals = await translateValues(
          fields.map((f) => text(data[f])),
          TARGET[locale],
          BASE_KEEP,
        );
        const tr: Record<string, unknown> = {
          sourceUpdatedAt: sig,
          translatedAt: new Date().toISOString(),
          style: "informal-native",
          provider: PROVIDER,
          revision: REV,
        };
        fields.forEach(
          (f, i) => (tr[f] = normalizeNewlines(vals[i] || data[f])),
        );
        DURATIONS.forEach((f) => {
          if (typeof data[f] === "string" && text(data[f]))
            tr[f] = duration(data[f], locale);
        });
        translations[locale] = tr;
        const { data: saved, error: saveError } = await admin.rpc(
          "merge_content_translation",
          {
            p_collection: collection,
            p_id: String(row.id),
            p_source: Object.fromEntries(
              Object.entries(data).filter(([key]) => key !== "translations"),
            ),
            p_translations: { [locale]: tr },
          },
        );
        if (saveError) throw new Error(`save_${saveError.code}`);
        if (!saved)
          return reply(req, 409, {
            error: "Conteúdo atualizado; a tradução será refeita.",
          });
        records.push({ id: row.id, locale, translation: tr, cached: false });
      }
    }
    return reply(req, 200, {
      records,
      translatedRecords: rows.length,
      locales,
      style: "informal-native",
      provider: PROVIDER,
      revision: REV,
    });
  } catch (e) {
    console.error("Translation failed", text((e as Error)?.message, 160));
    return reply(req, 503, {
      error: "A tradução automática está temporariamente indisponível.",
    });
  }
});

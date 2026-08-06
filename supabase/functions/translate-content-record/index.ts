import "jsr:@supabase/functions-js@2.4.4/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SITE_ORIGIN = "https://billieilishtv.site";
const PUBLIC_COLLECTIONS = new Set([
  "contents", "featured", "movies", "notifications", "ongs", "sections", "series", "videos",
]);
const ADMIN_COLLECTIONS = new Set([...PUBLIC_COLLECTIONS, "settings"]);
const LOCALE_TARGETS: Record<string, string> = { "en-us": "en", es: "es" };
const TRANSLATABLE_FIELDS = [
  "title", "name", "description", "subtitle", "body", "summary", "buttonLabel", "label", "text",
  "manualBio", "kicker", "footerText",
] as const;
const MAX_RECORDS = 50;
const MAX_TOTAL_CHARACTERS = 30_000;

function allowedOrigin(origin: string): boolean {
  if (!origin) return true;
  if (origin === SITE_ORIGIN || origin === "https://www.billieilishtv.site") return true;
  try {
    const url = new URL(origin);
    return (url.hostname === "localhost" || url.hostname === "127.0.0.1") && ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") || SITE_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowedOrigin(origin) ? origin : SITE_ORIGIN,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(req: Request, status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function safeString(value: unknown, max = 200): string {
  return String(value ?? "").trim().slice(0, max);
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function activeValue(value: unknown): boolean {
  return value !== false && String(value ?? "true").toLowerCase() !== "false";
}

function sourceRevision(row: Record<string, unknown>, data: Record<string, unknown>): string {
  return safeString(data.updatedAt || row.updated_at || row.created_at || new Date().toISOString(), 80);
}

function stringsToTranslate(data: Record<string, unknown>): Array<{ field: string; value: string }> {
  const values: Array<{ field: string; value: string }> = [];
  for (const field of TRANSLATABLE_FIELDS) {
    const value = typeof data[field] === "string" ? String(data[field]).trim() : "";
    if (!value || /^https?:\/\//i.test(value) || value.length > 8_000) continue;
    values.push({ field, value });
  }
  return values;
}

async function googleTranslate(apiKey: string, values: string[], target: string): Promise<string[]> {
  const output: string[] = [];
  for (let offset = 0; offset < values.length; offset += 128) {
    const chunk = values.slice(offset, offset + 128);
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ q: chunk, source: "pt", target, format: "text" }),
    });
    const payload = await response.json().catch(() => null) as {
      data?: { translations?: Array<{ translatedText?: string }> };
      error?: { message?: string };
    } | null;
    if (!response.ok) {
      console.error("Google Translation failed:", response.status, safeString(payload?.error?.message, 240));
      throw new Error("translation_provider_failed");
    }
    const translations = payload?.data?.translations || [];
    if (translations.length !== chunk.length) throw new Error("translation_provider_incomplete");
    output.push(...translations.map((item) => decodeEntities(String(item.translatedText || ""))));
  }
  return output;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, 405, { code: "method_not_allowed", error: "Método não permitido." });
  const origin = req.headers.get("origin") || "";
  if (!allowedOrigin(origin)) return json(req, 403, { code: "origin_not_allowed", error: "Origem não permitida." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const googleApiKey = Deno.env.get("GOOGLE_TRANSLATE_API_KEY") || "";
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(req, 503, { code: "server_not_configured", error: "Servidor de tradução incompleto." });
  }
  if (!googleApiKey) {
    return json(req, 503, { code: "google_translate_not_configured", error: "A tradução automática ainda não foi configurada." });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return json(req, 400, { code: "invalid_json", error: "Dados inválidos." }); }

  const collection = safeString(body.collection, 40).toLowerCase();
  const ids = Array.from(new Set((Array.isArray(body.ids) ? body.ids : []).map((id) => safeString(id, 120)).filter(Boolean))).slice(0, MAX_RECORDS);
  const locales = Array.from(new Set((Array.isArray(body.locales) ? body.locales : []).map((value) => safeString(value, 10).toLowerCase()).filter((value) => LOCALE_TARGETS[value])));
  const forceRequested = body.force === true;
  if (!ADMIN_COLLECTIONS.has(collection) || !ids.length || !locales.length) {
    return json(req, 400, { code: "invalid_request", error: "Solicitação de tradução inválida." });
  }

  const authorization = req.headers.get("authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: authorization ? { Authorization: authorization } : {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let isAdmin = false;
  if (authorization.startsWith("Bearer ")) {
    const { data: userData } = await userClient.auth.getUser().catch(() => ({ data: { user: null } }));
    if (userData?.user) {
      const { data: adminResult } = await userClient.rpc("is_admin").catch(() => ({ data: false }));
      isAdmin = adminResult === true;
    }
  }
  if (!isAdmin && (!PUBLIC_COLLECTIONS.has(collection) || forceRequested)) {
    return json(req, 403, { code: "forbidden", error: "Acesso administrativo necessário." });
  }

  let rows: Array<Record<string, unknown>> = [];
  if (collection === "settings") {
    const { data, error } = await adminClient.from("site_settings").select("id,data,created_at,updated_at").in("id", ids);
    if (error) return json(req, 500, { code: "database_error", error: "Não foi possível carregar as configurações." });
    rows = (data || []) as Array<Record<string, unknown>>;
  } else {
    let query = adminClient.from("content_items").select("id,data,created_at,updated_at").eq("collection", collection).in("id", ids);
    const { data, error } = await query;
    if (error) return json(req, 500, { code: "database_error", error: "Não foi possível carregar o conteúdo." });
    rows = ((data || []) as Array<Record<string, unknown>>).filter((row) => isAdmin || activeValue((row.data as Record<string, unknown> | undefined)?.active));
  }

  let totalCharacters = 0;
  const records: Array<Record<string, unknown>> = [];
  for (const row of rows) {
    const data = row.data && typeof row.data === "object" ? { ...(row.data as Record<string, unknown>) } : {};
    const revision = sourceRevision(row, data);
    const translations = data.translations && typeof data.translations === "object"
      ? { ...(data.translations as Record<string, unknown>) }
      : {};
    const fields = stringsToTranslate(data);

    for (const locale of locales) {
      const existing = translations[locale] && typeof translations[locale] === "object"
        ? translations[locale] as Record<string, unknown>
        : null;
      if (!forceRequested && existing && String(existing.sourceUpdatedAt || "") === revision) {
        records.push({ id: row.id, locale, translation: existing, cached: true });
        continue;
      }
      const characters = fields.reduce((sum, item) => sum + item.value.length, 0);
      totalCharacters += characters;
      if (totalCharacters > MAX_TOTAL_CHARACTERS) {
        return json(req, 413, { code: "translation_too_large", error: "O conteúdo excede o limite de tradução por solicitação." });
      }
      const translatedValues = fields.length
        ? await googleTranslate(googleApiKey, fields.map((item) => item.value), LOCALE_TARGETS[locale])
        : [];
      const translation: Record<string, unknown> = {
        sourceUpdatedAt: revision,
        translatedAt: new Date().toISOString(),
        provider: "google-cloud-translation",
      };
      fields.forEach((item, index) => { translation[item.field] = translatedValues[index] || item.value; });
      translations[locale] = translation;
      records.push({ id: row.id, locale, translation, cached: false });
    }

    data.translations = translations;
    const table = collection === "settings" ? "site_settings" : "content_items";
    const { error: updateError } = await adminClient.from(table).update({ data }).eq("id", row.id);
    if (updateError) {
      console.error("Failed to persist translation:", updateError.code);
      return json(req, 500, { code: "translation_save_failed", error: "A tradução foi criada, mas não pôde ser salva." });
    }
  }

  return json(req, 200, { records, translatedRecords: rows.length, locales });
});

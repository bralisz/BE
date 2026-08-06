import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SITE_ORIGIN = "https://billieilishtv.site";
const MINIMUM_FALLBACK_CENTS = 500;
const MAXIMUM_DONATION_CENTS = 100_000_000;
const RATE_LIMIT_PER_MINUTE = 6;

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

function normalizeMinimum(value: unknown): number {
  const cents = Number(value);
  return Number.isInteger(cents) && cents >= 100 && cents <= MAXIMUM_DONATION_CENTS
    ? cents
    : MINIMUM_FALLBACK_CENTS;
}

function activeValue(value: unknown): boolean {
  return value !== false && String(value ?? "true").toLowerCase() !== "false";
}

function safeText(value: unknown, maxLength: number): string {
  return String(value ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, maxLength);
}

function validRequestId(value: unknown): value is string {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value ?? ""));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, 405, { code: "method_not_allowed", error: "Método não permitido." });

  const origin = req.headers.get("origin") || "";
  if (!allowedOrigin(origin)) return json(req, 403, { code: "origin_not_allowed", error: "Origem não permitida." });

  const authorization = req.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return json(req, 401, { code: "unauthorized", error: "Entre na sua conta para continuar." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Supabase environment is incomplete for create-donation-checkout.");
    return json(req, 503, { code: "server_not_configured", error: "O servidor de pagamentos não está configurado." });
  }
  if (!/^(?:sk|rk)_(?:test|live)_/i.test(stripeSecretKey)) {
    console.error("STRIPE_SECRET_KEY is missing or invalid for create-donation-checkout.");
    return json(req, 503, { code: "stripe_not_configured", error: "O checkout ainda não foi configurado no servidor." });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { code: "invalid_json", error: "Dados inválidos." });
  }

  const ngoId = safeText(body.ngoId, 100);
  const amountCents = Number(body.amountCents);
  const requestId = String(body.requestId || "");
  if (!ngoId || !/^[a-z0-9-]{8,100}$/i.test(ngoId)) {
    return json(req, 400, { code: "invalid_ngo", error: "ONG inválida." });
  }
  if (!Number.isInteger(amountCents) || amountCents < 100 || amountCents > MAXIMUM_DONATION_CENTS) {
    return json(req, 400, { code: "invalid_amount", error: "Informe um valor válido." });
  }
  if (!validRequestId(requestId)) {
    return json(req, 400, { code: "invalid_request", error: "Não foi possível validar a tentativa de pagamento." });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userResult, error: userError } = await userClient.auth.getUser();
  const user = userResult?.user;
  if (userError || !user) return json(req, 401, { code: "unauthorized", error: "Sua sessão expirou. Entre novamente." });

  const { data: ngoRow, error: ngoError } = await adminClient
    .from("content_items")
    .select("id,data")
    .eq("collection", "ongs")
    .eq("id", ngoId)
    .maybeSingle();

  if (ngoError) {
    console.error("Failed to load NGO for donation checkout:", ngoError.code);
    return json(req, 500, { code: "ngo_lookup_failed", error: "Não foi possível validar a ONG agora." });
  }
  if (!ngoRow || !activeValue(ngoRow.data?.active)) {
    return json(req, 404, { code: "ngo_not_found", error: "Esta ONG não está disponível." });
  }

  const minimumDonationCents = normalizeMinimum(ngoRow.data?.minimumDonationCents);
  if (amountCents < minimumDonationCents) {
    return json(req, 400, {
      code: "below_minimum",
      error: "O valor está abaixo do mínimo configurado para esta ONG.",
      minimumDonationCents,
    });
  }

  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count: recentCount, error: rateError } = await adminClient
    .from("donation_checkout_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneMinuteAgo);

  if (rateError) {
    console.error("Donation checkout rate-limit lookup failed:", rateError.code);
    return json(req, 503, { code: "rate_limit_unavailable", error: "Tente novamente em instantes." });
  }
  if ((recentCount || 0) >= RATE_LIMIT_PER_MINUTE) {
    return json(req, 429, { code: "rate_limited", error: "Muitas tentativas seguidas. Aguarde um minuto." });
  }

  const ngoTitle = safeText(ngoRow.data?.title || ngoRow.data?.name || "ONG", 80) || "ONG";
  const successUrl = `${SITE_ORIGIN}/ong?doacao=sucesso&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${SITE_ORIGIN}/ong?doacao=cancelada`;
  const metadata = {
    purpose: "ong_donation",
    ngo_id: ngoId,
    ngo_name: ngoTitle,
    user_id: user.id,
    minimum_donation_cents: String(minimumDonationCents),
    selected_amount_cents: String(amountCents),
  };

  const stripeBody = new URLSearchParams();
  stripeBody.set("mode", "payment");
  stripeBody.set("success_url", successUrl);
  stripeBody.set("cancel_url", cancelUrl);
  stripeBody.set("locale", "pt-BR");
  stripeBody.set("submit_type", "donate");
  stripeBody.set("client_reference_id", `${user.id}:${ngoId}`.slice(0, 200));
  stripeBody.set("line_items[0][price_data][currency]", "brl");
  stripeBody.set("line_items[0][price_data][unit_amount]", String(amountCents));
  stripeBody.set("line_items[0][price_data][product_data][name]", `Doação BETV — ${ngoTitle}`.slice(0, 127));
  stripeBody.set("line_items[0][price_data][product_data][description]", "Parte do valor será destinada à ONG selecionada no BETV.");
  stripeBody.set("line_items[0][quantity]", "1");
  if (user.email) stripeBody.set("customer_email", user.email);
  for (const [key, value] of Object.entries(metadata)) {
    stripeBody.set(`metadata[${key}]`, value);
    stripeBody.set(`payment_intent_data[metadata][${key}]`, value);
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `betv-donation:${user.id}:${requestId}`,
    },
    body: stripeBody,
  });

  const stripePayload = await stripeResponse.json().catch(() => null) as Record<string, unknown> | null;
  if (!stripeResponse.ok || !stripePayload?.id || !stripePayload?.url) {
    const stripeError = stripePayload?.error as Record<string, unknown> | undefined;
    console.error("Stripe Checkout Session creation failed:", stripeResponse.status, safeText(stripeError?.code, 80));
    return json(req, 502, { code: "stripe_checkout_failed", error: "A Stripe não conseguiu iniciar o pagamento. Tente novamente." });
  }

  const stripeSessionId = safeText(stripePayload.id, 255);
  const { error: logError } = await adminClient.from("donation_checkout_requests").insert({
    user_id: user.id,
    ngo_id: ngoId,
    amount_cents: amountCents,
    minimum_cents: minimumDonationCents,
    stripe_session_id: stripeSessionId,
    request_id: requestId,
  });

  if (logError && logError.code !== "23505") {
    console.error("Failed to record donation checkout request:", logError.code);
  }

  return json(req, 200, {
    url: stripePayload.url,
    sessionId: stripeSessionId,
    minimumDonationCents,
  });
});

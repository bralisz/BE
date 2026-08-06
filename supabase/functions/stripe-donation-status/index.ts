import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

function json(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function getServiceKey(): string {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (legacy) return legacy;
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}") as Record<string, string>;
    return keys.default || "";
  } catch {
    return "";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = getServiceKey();
  if (!stripeSecretKey || !supabaseUrl || !serviceKey) {
    console.error("stripe-donation-status is missing required server secrets");
    return json(503, { error: "server_not_configured" });
  }

  let received: Record<string, unknown>;
  try {
    received = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const eventId = String(received.id || "");
  if (!/^evt_[A-Za-z0-9]+$/.test(eventId)) return json(400, { error: "invalid_event" });

  // O corpo recebido não é considerado confiável. O evento é consultado
  // diretamente na Stripe usando a chave secreta mantida no servidor.
  const stripeResponse = await fetch(`https://api.stripe.com/v1/events/${encodeURIComponent(eventId)}`, {
    headers: { Authorization: `Bearer ${stripeSecretKey}` },
  });
  const event = await stripeResponse.json().catch(() => null) as Record<string, any> | null;
  if (!stripeResponse.ok || !event || event.id !== eventId) {
    console.error("Unable to verify Stripe event", eventId, stripeResponse.status);
    return json(400, { error: "unverified_event" });
  }

  const type = String(event.type || "");
  const session = event.data?.object as Record<string, any> | undefined;
  const sessionId = String(session?.id || "");
  if (!sessionId.startsWith("cs_")) return json(200, { received: true, ignored: true });

  let nextStatus: "paid" | "canceled" | null = null;
  if (type === "checkout.session.completed") {
    const paymentStatus = String(session?.payment_status || "");
    if (paymentStatus === "paid" || paymentStatus === "no_payment_required") nextStatus = "paid";
  } else if (type === "checkout.session.async_payment_succeeded") {
    nextStatus = "paid";
  } else if (type === "checkout.session.expired" || type === "checkout.session.async_payment_failed") {
    nextStatus = "canceled";
  }

  if (!nextStatus) return json(200, { received: true, ignored: true });

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: current, error: lookupError } = await supabase
    .from("donation_checkout_requests")
    .select("id,status")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (lookupError) {
    console.error("Donation checkout lookup failed", lookupError.code);
    return json(500, { error: "lookup_failed" });
  }
  if (!current) return json(200, { received: true, unmatched: true });

  // Um pagamento confirmado nunca pode ser rebaixado por um evento posterior.
  if (current.status === "paid" && nextStatus !== "paid") {
    return json(200, { received: true, status: "paid" });
  }

  const update: Record<string, unknown> = { status: nextStatus };
  if (nextStatus === "paid") {
    update.paid_at = new Date(Number(event.created || Math.floor(Date.now() / 1000)) * 1000).toISOString();
  }

  const { error: updateError } = await supabase
    .from("donation_checkout_requests")
    .update(update)
    .eq("id", current.id);

  if (updateError) {
    console.error("Donation checkout status update failed", updateError.code);
    return json(500, { error: "update_failed" });
  }

  return json(200, { received: true, status: nextStatus });
});

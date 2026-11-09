import { createHash } from "crypto";

/**
 * Webhook da Paggins → Meta CAPI (Purchase).
 *
 * A Paggins chama este endpoint quando uma venda muda de status. Em compra
 * APROVADA, disparamos o evento Purchase server-side pro Pixel (EMQ alto com
 * email/telefone hasheados). Não precisa conectar API da Paggins — só configurar
 * a URL de webhook no painel da conta Paggins:
 *
 *   https://cashclub.site/api/paggins/webhook
 *
 * Envs (Render):
 *   FB_PIXEL_ID, FB_CAPI_TOKEN      (mesmas do /api/capi)
 *   PAGGINS_WEBHOOK_SECRET          (opcional) valida ?secret= ou header
 *   FB_API_VERSION, FB_TEST_EVENT_CODE (opcionais)
 */

const API_VERSION = process.env.FB_API_VERSION || "v21.0";

function sha256(v?: string | null): string | undefined {
  if (!v) return undefined;
  const n = String(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  return n ? createHash("sha256").update(n).digest("hex") : undefined;
}
function hashPhone(v?: string | null): string | undefined {
  if (!v) return undefined;
  const d = String(v).replace(/\D/g, "");
  return d.length >= 8 ? createHash("sha256").update(d).digest("hex") : undefined;
}

/** Busca recursiva do primeiro valor cujo caminho casa com os regex dados. */
function deepFind(obj: unknown, rx: RegExp, depth = 0): string | number | undefined {
  if (!obj || typeof obj !== "object" || depth > 6) return undefined;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (rx.test(k) && (typeof v === "string" || typeof v === "number")) return v as string | number;
    if (v && typeof v === "object") {
      const r = deepFind(v, rx, depth + 1);
      if (r !== undefined) return r;
    }
  }
  return undefined;
}

function isApproved(payload: Record<string, unknown>): boolean {
  const s = String(
    deepFind(payload, /^(status|payment_?status|order_?status|situacao|situation)$/i) ?? ""
  ).toLowerCase();
  return /approv|paid|pago|completed|complete|confirmed|succeeded|success|aprovad/.test(s);
}

export async function POST(req: Request) {
  const pixel = process.env.FB_PIXEL_ID;
  const token = process.env.FB_CAPI_TOKEN;
  const secret = process.env.PAGGINS_WEBHOOK_SECRET;

  // validação opcional de segredo (query ?secret= ou header x-webhook-secret)
  if (secret) {
    const url = new URL(req.url);
    const got = url.searchParams.get("secret") || req.headers.get("x-webhook-secret") || "";
    if (got !== secret) return Response.json({ ok: false, error: "bad_secret" }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try { payload = (await req.json()) as Record<string, unknown>; } catch { return Response.json({ ok: true, skipped: "no_body" }); }

  if (!isApproved(payload)) {
    return Response.json({ ok: true, skipped: "not_approved" });
  }
  if (!pixel || !token) {
    return Response.json({ ok: false, error: "capi_not_configured" });
  }

  const email = String(deepFind(payload, /^(email|e_?mail|customer_?email|buyer_?email)$/i) ?? "");
  const phone = String(deepFind(payload, /^(phone|telefone|celular|whatsapp|customer_?phone)$/i) ?? "");
  const name = String(deepFind(payload, /^(name|full_?name|customer_?name|nome)$/i) ?? "");
  const rawVal = deepFind(payload, /^(amount|value|total|price|valor|order_?value|net_?amount)$/i);
  const value = rawVal != null ? Number(String(rawVal).replace(/[^\d.,-]/g, "").replace(",", ".")) : undefined;
  const currency = String(deepFind(payload, /^(currency|moeda|iso_?currency)$/i) ?? "USD").toUpperCase().slice(0, 3) || "USD";
  const txId = String(deepFind(payload, /^(transaction_?id|order_?id|sale_?code|id|code|reference)$/i) ?? "");
  const product = String(deepFind(payload, /^(product_?name|product|plan_?name|item_?name)$/i) ?? "CashClub");

  const first = name.split(/\s+/)[0] || undefined;
  const last = name.split(/\s+/).slice(1).join(" ") || undefined;

  const user_data: Record<string, unknown> = {};
  const em = sha256(email); if (em) user_data.em = [em];
  const ph = hashPhone(phone); if (ph) user_data.ph = [ph];
  const fn = sha256(first); if (fn) user_data.fn = [fn];
  const ln = sha256(last); if (ln) user_data.ln = [ln];
  const ex = sha256(email || txId); if (ex) user_data.external_id = [ex];

  const custom_data: Record<string, unknown> = { currency };
  if (value != null && !Number.isNaN(value)) custom_data.value = value;
  if (product) custom_data.content_name = product;

  const event: Record<string, unknown> = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    // event_id = transação: dedup se a Paggins reenviar o webhook
    event_id: txId ? `pg_${txId}` : undefined,
    user_data,
    custom_data,
  };

  const body: Record<string, unknown> = { data: [event] };
  if (process.env.FB_TEST_EVENT_CODE) body.test_event_code = process.env.FB_TEST_EVENT_CODE;

  try {
    const r = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${pixel}/events?access_token=${encodeURIComponent(token)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    const fb = await r.json().catch(() => ({}));
    console.log(`[paggins-webhook] Purchase ${email || txId} ${currency} ${value ?? "?"} -> fb ok=${r.ok}`);
    return Response.json({ ok: r.ok, sent: { email: !!email, value, currency }, fb });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message });
  }
}

// GET pra teste rápido no navegador (confirma que a rota existe)
export async function GET() {
  return Response.json({ ok: true, hint: "POST do webhook da Paggins aqui. Configure esta URL no painel Paggins." });
}

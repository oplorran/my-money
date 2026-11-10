import { createHash, createHmac, timingSafeEqual } from "crypto";
import { getPool, ensureSchema } from "@/lib/db";
import { sendAccessEmail } from "@/lib/mailer";
import { sendCapi, metaPixels } from "@/lib/capi-send";

/**
 * Webhook da Paggins → Meta CAPI (Purchase).
 *
 * Em compra APROVADA, dispara Purchase server-side pro Pixel (email/telefone
 * hasheados, EMQ alto). Não precisa conectar API — só a URL de webhook no Paggins:
 *   https://cashclub.site/api/paggins/webhook
 *
 * Assinatura: header `X-Paggins-Signature: t=<unix>,v1=<hmac>`, onde
 *   hmac = HMAC_SHA256(secret, `${t}.${rawBody}`)  (secret = whsec_...).
 *
 * Envs (Render):
 *   FB_PIXEL_ID, FB_CAPI_TOKEN            (mesmas do /api/capi)
 *   PAGGINS_WEBHOOK_SECRET               whsec_... (assinatura HMAC)
 *   FB_API_VERSION, FB_TEST_EVENT_CODE   (opcionais)
 */

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

/** Verifica a assinatura HMAC do Paggins (`t=<unix>,v1=<hmac>`). */
function verifySignature(raw: string, header: string | null, secret?: string): "valid" | "invalid" | "no_secret" | "no_header" | "malformed" {
  if (!secret) return "no_secret";
  if (!header) return "no_header";
  try {
    const parts: Record<string, string> = {};
    header.split(",").forEach((kv) => {
      const i = kv.indexOf("=");
      if (i > 0) parts[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
    });
    const t = parts.t, v1 = parts.v1;
    if (!t || !v1) return "malformed";
    const expected = createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
    const a = Buffer.from(expected), b = Buffer.from(v1);
    return a.length === b.length && timingSafeEqual(a, b) ? "valid" : "invalid";
  } catch {
    return "malformed";
  }
}

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
  const s = String(deepFind(payload, /^(status|payment_?status|order_?status|situacao)$/i) ?? "").toLowerCase();
  return /approv|paid|pago|completed|complete|confirmed|succeeded|success|aprovad/.test(s);
}

export async function POST(req: Request) {
  const secret = process.env.PAGGINS_WEBHOOK_SECRET;

  const raw = await req.text().catch(() => "");
  if (!raw) return Response.json({ ok: true, skipped: "no_body" });

  // Assinatura HMAC (se o secret estiver configurado)
  const sig = verifySignature(raw, req.headers.get("x-paggins-signature") || req.headers.get("paggins-signature"), secret);
  if (secret && sig !== "valid") {
    console.warn(`[paggins-webhook] assinatura ${sig}`);
    return Response.json({ ok: false, error: "bad_signature", sig }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try { payload = JSON.parse(raw); } catch { return Response.json({ ok: true, skipped: "bad_json" }); }

  if (!isApproved(payload)) return Response.json({ ok: true, skipped: "not_approved" });
  if (!metaPixels().length) return Response.json({ ok: false, error: "capi_not_configured" });

  const data = (payload.data as Record<string, unknown>) || payload;
  const email = String(deepFind(data, /^(email|e_?mail|customer_?email|buyer_?email)$/i) ?? "");
  const phone = String(deepFind(data, /^(phone|telefone|celular|whatsapp|customer_?phone)$/i) ?? "");
  const name = String(deepFind(data, /^(name|full_?name|customer_?name|nome)$/i) ?? "");
  const rawVal = deepFind(data, /^(amount|value|total|price|valor|order_?value|net_?amount|charged_?amount)$/i);
  const value = rawVal != null ? Number(String(rawVal).replace(/[^\d.,-]/g, "").replace(",", ".")) : undefined;
  const currency = (String(deepFind(data, /^(currency|moeda)$/i) ?? "USD").toUpperCase().slice(0, 3)) || "USD";
  const txId = String(deepFind(data, /^(transaction_?id|order_?id|sale_?code|id|code|reference)$/i) ?? "");
  const product = String(deepFind(data, /^(product_?name|product|plan_?name|item_?name)$/i) ?? "CashClub");

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
    event_id: txId ? `pg_${txId}` : undefined,
    user_data,
    custom_data,
  };

  // ── Entrega do acesso por email (Resend), com dedup (igual ao funil spy) ──
  if (email) {
    try {
      let send = true;
      if (await ensureSchema()) {
        const p = getPool()!;
        const dup = await p.query("SELECT 1 FROM access_sent WHERE LOWER(email)=LOWER($1)", [email]);
        if (dup.rows.length) send = false;
        if (send) {
          const r = await sendAccessEmail(email, first);
          if (r.sent) {
            await p.query("INSERT INTO access_sent (email, tx_id, value) VALUES ($1,$2,$3) ON CONFLICT (email) DO NOTHING", [email, txId || null, value ?? null]);
          }
          console.log(`[paggins-webhook] access email ${email} sent=${r.sent} ${r.reason || ""}`);
        }
      } else {
        await sendAccessEmail(email, first); // sem DB: envia sem dedup
      }
    } catch (e) {
      console.error("[paggins-webhook] access email error (non-blocking):", (e as Error).message);
    }
  }

  // ── Aprendizado do cloaker: grava o "fingerprint" do comprador (país/device/
  //    hora/utm). Alimenta o cloak_buyer_fp pra entender quem converte. ──
  try {
    const fbFromData = (payload as Record<string, unknown>)?.conversionData as Record<string, unknown> | undefined;
    const buyerCountry = typeof fbFromData?.country === "string" ? fbFromData.country : "?";
    const buyerUtm = typeof fbFromData?.utm_source === "string" ? fbFromData.utm_source : "";
    const { recordBuyerFp } = await import("@/lib/cloak-stats");
    await recordBuyerFp({ country: buyerCountry, device: "?", utm_source: buyerUtm });
  } catch {
    /* non-blocking */
  }

  try {
    const r = await sendCapi(event);
    console.log(`[paggins-webhook] Purchase ${email || txId} ${currency} ${value ?? "?"} sig=${sig} -> pixels ${r.sent}/${r.total}`);
    return Response.json({ ok: r.ok, sent: { email: !!email, value, currency, pixels: `${r.sent}/${r.total}` } });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message });
  }
}

export async function GET() {
  return Response.json({ ok: true, hint: "Configure esta URL no webhook do Paggins." });
}

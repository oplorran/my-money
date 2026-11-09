import { createHash } from "crypto";
import { sendCapi, metaPixels } from "@/lib/capi-send";

/**
 * Meta Conversions API (server-side) — espelha o Pixel do navegador e deduplica
 * pelo mesmo `event_id`. Portado do zapspy-funnel-backend (facebook-capi).
 *
 * Envs (defina no Render, nunca no Git):
 *  - FB_PIXEL_ID       id do pixel (server)
 *  - FB_CAPI_TOKEN     access token da Conversions API
 *  - FB_API_VERSION    opcional (default v21.0)
 *  - FB_TEST_EVENT_CODE opcional (para o Test Events do Events Manager)
 */

// Route handlers são dinâmicos por padrão no Next.js 16+ com cacheComponents.

function sha256(v?: string | null): string | undefined {
  if (!v) return undefined;
  const n = String(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  return n ? createHash("sha256").update(n).digest("hex") : undefined;
}
function hashPhone(v?: string | null): string | undefined {
  if (!v) return undefined;
  const d = String(v).replace(/\D/g, "");
  return d ? createHash("sha256").update(d).digest("hex") : undefined;
}
function clientIp(req: Request): string | undefined {
  const xff = req.headers.get("x-forwarded-for") || "";
  return xff.split(",")[0].trim() || req.headers.get("x-real-ip") || undefined;
}
const arr = (v?: string) => (v ? [v] : undefined);

type Body = {
  event_name?: string;
  event_id?: string;
  event_source_url?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  external_id?: string | number;
  value?: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
  fbc?: string;
  fbp?: string;
};

export async function POST(req: Request) {
  if (!metaPixels().length) {
    return Response.json({ ok: false, error: "capi_not_configured" }, { status: 200 });
  }

  let b: Body = {};
  try { b = (await req.json()) as Body; } catch { /* corpo vazio = PageView mínimo */ }

  const user_data: Record<string, unknown> = {
    client_ip_address: clientIp(req),
    client_user_agent: req.headers.get("user-agent") || undefined,
  };
  const em = sha256(b.email); if (em) user_data.em = [em];
  const ph = hashPhone(b.phone); if (ph) user_data.ph = [ph];
  const fn = sha256(b.firstName); if (fn) user_data.fn = [fn];
  const ln = sha256(b.lastName); if (ln) user_data.ln = [ln];
  const co = sha256(b.country); if (co) user_data.country = [co];
  const ex = sha256(b.external_id != null ? String(b.external_id) : undefined); if (ex) user_data.external_id = [ex];
  if (b.fbc) user_data.fbc = b.fbc;
  if (b.fbp) user_data.fbp = b.fbp;

  const custom_data: Record<string, unknown> = {};
  if (b.value != null && !Number.isNaN(Number(b.value))) custom_data.value = Number(b.value);
  if (b.currency) custom_data.currency = b.currency;
  if (b.content_name) custom_data.content_name = b.content_name;
  if (b.content_ids) custom_data.content_ids = b.content_ids;

  const event: Record<string, unknown> = {
    event_name: b.event_name || "PageView",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    user_data,
  };
  if (b.event_id) event.event_id = b.event_id;
  const esu = b.event_source_url || req.headers.get("referer");
  if (esu) event.event_source_url = esu;
  if (Object.keys(custom_data).length) event.custom_data = custom_data;

  try {
    const r = await sendCapi(event);
    return Response.json({ ok: r.ok, sent: r.sent, total: r.total }, { status: 200 });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 200 });
  }
}

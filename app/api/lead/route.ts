import { createHash } from "crypto";
import { getPool, ensureSchema } from "@/lib/db";
import { sendCapi, metaPixels } from "@/lib/capi-send";

/**
 * Captura de lead (email) do funil → grava no Postgres (tabela `leads`) e dispara
 * o evento Lead no Meta CAPI (EMQ alto com email hasheado).
 *
 * Body JSON: { email, firstName?, funnel?, event?, fbc?, fbp?, fbclid?,
 *              utm_source?, utm_medium?, utm_campaign?, utm_content?, utm_term?, page_url? }
 */

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,24}$/i.test(v);
function sha256(v?: string | null) {
  if (!v) return undefined;
  const n = String(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  return n ? createHash("sha256").update(n).digest("hex") : undefined;
}
function clientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for") || "";
  return xff.split(",")[0].trim() || req.headers.get("x-real-ip") || undefined;
}

export async function POST(req: Request) {
  let b: Record<string, string> = {};
  try { b = await req.json(); } catch { return Response.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const email = String(b.email || "").trim().toLowerCase();
  if (!isEmail(email)) return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });

  const firstName = (b.firstName || "").trim().slice(0, 120) || null;
  const ua = req.headers.get("user-agent") || null;
  const ip = clientIp(req) || null;

  // 1) grava no banco (não bloqueia a resposta se falhar)
  try {
    if (await ensureSchema()) {
      const p = getPool()!;
      await p.query(
        `INSERT INTO leads (email, first_name, funnel, event, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbc, fbp, fbclid, ip, user_agent, page_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [email, firstName, b.funnel || null, b.event || null, b.utm_source || null, b.utm_medium || null,
         b.utm_campaign || null, b.utm_content || null, b.utm_term || null, b.fbc || null, b.fbp || null,
         b.fbclid || null, ip, ua, b.page_url || null]
      );
    }
  } catch (e) {
    console.error("[lead] db error (non-blocking):", (e as Error).message);
  }

  // 2) Lead CAPI (server-side, EMQ alto) — manda pros 2 pixels
  if (metaPixels().length) {
    try {
      const user_data: Record<string, unknown> = { client_ip_address: ip || undefined, client_user_agent: ua || undefined };
      const em = sha256(email); if (em) user_data.em = [em];
      const fn = sha256(firstName); if (fn) user_data.fn = [fn];
      const ex = sha256(email); if (ex) user_data.external_id = [ex];
      if (b.fbc) user_data.fbc = b.fbc;
      if (b.fbp) user_data.fbp = b.fbp;
      const event: Record<string, unknown> = {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_id: b.event_id || `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        event_source_url: b.page_url || req.headers.get("referer") || undefined,
        user_data,
      };
      await sendCapi(event).catch(() => {});
    } catch { /* não bloqueia */ }
  }

  return Response.json({ ok: true });
}

// Diagnóstico: contagem de leads (sem PII) — confirma conexão + inserts.
export async function GET() {
  try {
    if (!(await ensureSchema())) return Response.json({ ok: false, db: "no_database_url" });
    const p = getPool()!;
    const r = await p.query("SELECT COUNT(*)::int AS n, MAX(created_at) AS last FROM leads");
    return Response.json({ ok: true, leads: r.rows[0].n, last: r.rows[0].last });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message });
  }
}

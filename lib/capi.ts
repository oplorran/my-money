import crypto from "crypto";

/**
 * Meta Conversions API (server-side) — portado do funil ZapSpy.
 *
 * Envia eventos server-to-server pro Pixel da Meta com os dados do comprador
 * já HASHEADOS (email, telefone, nome) + fbc/fbp/IP/UA, pra EMQ alto e
 * deduplicação com o Pixel do navegador (mesmo event_id).
 *
 * Config por env (só no servidor):
 *   META_PIXEL_ID      id do pixel
 *   META_CAPI_TOKEN    access token (System User / Conversions API)
 *   META_TEST_CODE     (opcional) test_event_code do Events Manager
 *   META_API_VERSION   (opcional) default v21.0
 *
 * Sem pixel/token configurado, vira no-op silencioso (não quebra nada).
 */

const API_VERSION = process.env.META_API_VERSION ?? "v21.0";
const PIXEL_ID = process.env.META_PIXEL_ID ?? "";
const TOKEN = process.env.META_CAPI_TOKEN ?? "";
const TEST_CODE = process.env.META_TEST_CODE ?? "";

function sha256(v: string) {
  return crypto.createHash("sha256").update(v).digest("hex");
}
function norm(v?: string | null) {
  return (v ?? "").trim().toLowerCase();
}
function hashEmail(e?: string | null) {
  const v = norm(e);
  return v && v.includes("@") ? [sha256(v)] : undefined;
}
function hashPhone(p?: string | null) {
  const v = (p ?? "").replace(/\D/g, "");
  return v.length >= 8 ? [sha256(v)] : undefined;
}
function hashName(n?: string | null) {
  const v = norm(n).replace(/[^a-z\u00e0-\u00ff\s]/g, "").trim();
  return v ? [sha256(v)] : undefined;
}

export type CapiUser = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fbc?: string;
  fbp?: string;
  ip?: string;
  userAgent?: string;
  externalId?: string;
  country?: string;
};

export type CapiCustom = {
  value?: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
  [k: string]: unknown;
};

export type CapiResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  status?: number;
  result?: unknown;
  error?: unknown;
};

export async function sendCapiEvent(
  eventName: string,
  opts: { user: CapiUser; custom?: CapiCustom; eventId?: string; eventSourceUrl?: string }
): Promise<CapiResult> {
  if (!PIXEL_ID || !TOKEN) {
    return { ok: false, skipped: true, reason: "META_PIXEL_ID/META_CAPI_TOKEN ausente" };
  }

  const u = opts.user;
  const user_data: Record<string, unknown> = {};
  const em = hashEmail(u.email); if (em) user_data.em = em;
  const ph = hashPhone(u.phone); if (ph) user_data.ph = ph;
  const fn = hashName(u.firstName); if (fn) user_data.fn = fn;
  const ln = hashName(u.lastName); if (ln) user_data.ln = ln;
  if (u.country) user_data.country = [sha256(norm(u.country))];
  if (u.externalId) user_data.external_id = [sha256(norm(u.externalId))];
  if (u.fbc) user_data.fbc = u.fbc;
  if (u.fbp) user_data.fbp = u.fbp;
  if (u.ip) user_data.client_ip_address = u.ip;
  if (u.userAgent) user_data.client_user_agent = u.userAgent;

  const event: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.eventId || crypto.randomUUID(),
    action_source: "website",
    user_data,
  };
  if (opts.eventSourceUrl) event.event_source_url = opts.eventSourceUrl;
  if (opts.custom && Object.keys(opts.custom).length) event.custom_data = opts.custom;

  const body: Record<string, unknown> = { data: [event] };
  if (TEST_CODE) body.test_event_code = TEST_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      }
    );
    const json = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, status: res.status, error: json };
    return { ok: true, result: json };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

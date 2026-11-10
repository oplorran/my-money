import { NextRequest, NextResponse, type NextFetchEvent } from "next/server";

/**
 * Cloaker (Next.js edge middleware)
 * ─────────────────────────────────
 * Serve o funil real só pra tráfego de anúncio humano. Bots, revisores da Meta,
 * ferramentas de espionagem (AdSpy etc.), prefetch e desktop sem sinal recebem a
 * white page (/learn — blog MindfulMoney) servida NA MESMA URL (rewrite, sem 302).
 *
 * Portado do cloaker do zapspy. Controlado por env (sem redeploy pra ligar/desligar
 * basta mudar no Render e reiniciar):
 *   CLOAK_ENABLED           '1' (default) | '0'
 *   CLOAK_WHITE_PATH        '/learn' (default) — rota da white page
 *   CLOAK_BYPASS_TOKEN      token pra ver o funil real (via ?cb= ou ?cloak_bypass=)
 *   CLOAK_BLOCK_DESKTOP     '1' (default) — desktop sem sinal de anúncio → white
 *   CLOAK_REQUIRE_SIGNAL    '1' (default) — exige fbclid/utm pago/app in-app
 *   CLOAK_BLOCKED_COUNTRIES 'BR' (ex.) — países que sempre veem a white (via cf-ipcountry)
 *   CLOAK_DISABLED_HOSTS    hosts onde o cloaker fica OFF (ex.: domínio queimado)
 */

const WHITE_PATH = (process.env.CLOAK_WHITE_PATH || "/learn").trim();
const ENABLED = (process.env.CLOAK_ENABLED || "1") !== "0";
const BLOCK_DESKTOP = (process.env.CLOAK_BLOCK_DESKTOP || "1") !== "0";
const REQUIRE_SIGNAL = (process.env.CLOAK_REQUIRE_SIGNAL || "1") !== "0";
const BYPASS_TOKEN = (process.env.CLOAK_BYPASS_TOKEN || "").trim();
const BLOCKED_COUNTRIES = (process.env.CLOAK_BLOCKED_COUNTRIES || "")
  .split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
const DISABLED_HOSTS = (process.env.CLOAK_DISABLED_HOSTS || "")
  .split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);

// ── Rotas do FUNIL que devem ser cloakadas (front). Pós-compra fica de fora. ──
const FUNNEL_PREFIXES = ["/", "/pv11", "/pv12", "/pv13", "/pv14"];
// Nunca cloakar: app pós-compra, checkout, APIs, admin, a própria white, assets.
const SKIP_PREFIXES = [
  "/app", "/pay", "/api", "/leads", "/painel", "/paniel", "/cloaker", "/back", "/wt", "/hotwt",
  "/learn", "/_next", "/favicon", "/voice", "/icons", "/manifest", "/sw.js", "/robots", "/sitemap",
];

const BOT_RE = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|pinterest|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|gptbot|chatgpt|claudebot|applebot|headlesschrome|phantomjs|puppeteer|playwright|selenium|crawl|spider|\bbot\b|scraper|python-requests|curl|wget|go-http|java\/|okhttp|axios/i;
const ADSPY_RE = /adspy|bigspy|poweradspy|dropispy|pipiads|adplexity|spyfu|socialadscout|adbeat|whatrunswhere|anstrex|adheart|minea|droppoint|ecomhunt|nichescraper|commerceinspector|pexda|thieve|spypush|adsviser|intelligynce|similarweb|builtwith|wappalyzer/i;
const MOBILE_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|CriOS|FxiOS/i;
const META_INAPP_RE = /\b(FBAN|FBAV|FB_IAB|FBIOS|Instagram)\b/i;
const PAID_UTM_RE = /(fb|face|ig|insta|meta|google|gads|adwords|tiktok|tt|kwai|bing|cpc|ppc|paid|ads)/i;
const CLICK_IDS = ["fbclid", "gclid", "ttclid", "twclid", "msclkid", "wbraid", "gbraid"];

// Faixas IPv4 da Meta (AS32934) — crawler/preview da Meta sai daqui, nunca comprador.
const META_CIDRS: Array<[number, number]> = [
  ["31.13.24.0", 21], ["31.13.64.0", 18], ["45.64.40.0", 22], ["66.220.144.0", 20],
  ["69.63.176.0", 20], ["69.171.224.0", 19], ["74.119.76.0", 22], ["102.132.96.0", 20],
  ["103.4.96.0", 22], ["129.134.0.0", 16], ["157.240.0.0", 16], ["173.252.64.0", 18],
  ["179.60.192.0", 22], ["185.60.216.0", 22], ["204.15.20.0", 22],
].map(([ip, bits]) => [ipToLong(ip as string), bits as number]) as Array<[number, number]>;

function ipToLong(ip: string): number {
  const p = ip.split(".");
  if (p.length !== 4) return 0;
  return ((+p[0] << 24) >>> 0) + (+p[1] << 16) + (+p[2] << 8) + +p[3];
}
function isMetaIP(ip: string): boolean {
  if (!ip) return false;
  let s = ip;
  if (s.startsWith("::ffff:")) s = s.slice(7);
  if (s.includes(":")) return /^2a03:288[0-7]:/i.test(s) || s.toLowerCase().startsWith("2620:0:1c00");
  const ipL = ipToLong(s);
  if (!ipL) return false;
  return META_CIDRS.some(([base, bits]) => {
    if (bits <= 0) return true;
    const mask = bits >= 32 ? 0xffffffff : (~((2 ** (32 - bits)) - 1)) >>> 0;
    return (ipL & mask) === (base & mask);
  });
}

function clientIP(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "";
}

function countryOf(req: NextRequest): string {
  return (
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("x-render-ip-country") ||
    ""
  ).toUpperCase();
}

function deviceOf(ua: string): string {
  return MOBILE_RE.test(ua) ? "mobile" : "desktop";
}

// Log pro endpoint que grava no banco (edge não usa pg direto). Usa
// event.waitUntil pra o fetch COMPLETAR depois que o middleware retorna a
// resposta — sem isso o Edge runtime cancela o fetch e nada é gravado.
let _logEvent: NextFetchEvent | null = null;
function logCloak(
  req: NextRequest,
  outcome: "allowed" | "blocked",
  reason: string,
  lost?: boolean
): void {
  try {
    const ua = req.headers.get("user-agent") || "";
    const origin = req.nextUrl.origin;
    const body: Record<string, unknown> = {
      outcome,
      reason,
      country: countryOf(req) || "?",
      device: deviceOf(ua),
    };
    if (lost) {
      body.lost = {
        ip: clientIP(req),
        ua: ua.slice(0, 200),
        path: req.nextUrl.pathname,
        fbclid: !!req.nextUrl.searchParams.get("fbclid"),
      };
    }
    const p = fetch(origin + "/api/cloak/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
    if (_logEvent) _logEvent.waitUntil(p);
  } catch {
    /* nunca derruba o request */
  }
}

function hasAdSignal(req: NextRequest): boolean {
  const url = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";
  if (META_INAPP_RE.test(ua)) return true; // in-app browser do IG/FB = comprador real
  if (req.cookies.get("cloak_pass")?.value === "1") return true;
  for (const k of CLICK_IDS) if (url.searchParams.get(k)) return true;
  const us = (url.searchParams.get("utm_source") || "").toLowerCase();
  if (us && PAID_UTM_RE.test(us)) return true;
  return false;
}

function isPrefetch(req: NextRequest): boolean {
  const h = req.headers;
  const vals = [h.get("sec-purpose"), h.get("purpose"), h.get("x-purpose"), h.get("x-moz"), h.get("next-router-prefetch")];
  return vals.some((v) => v && /prefetch|prerender|preview/i.test(v));
}

function isFunnelPath(path: string): boolean {
  if (path === "/") return true;
  return FUNNEL_PREFIXES.some((p) => p !== "/" && (path === p || path.startsWith(p + "/")));
}
function isSkip(path: string): boolean {
  return SKIP_PREFIXES.some((p) => path === p || path.startsWith(p + "/") || path.startsWith(p));
}

function serveWhite(req: NextRequest, reason: string): NextResponse {
  // Rewrite (não redirect): serve a white page NA MESMA URL → sem assinatura de 302.
  const url = req.nextUrl.clone();
  url.pathname = WHITE_PATH;
  url.search = "";
  const res = NextResponse.rewrite(url);
  res.cookies.set("cloak_seen", "w", { maxAge: 2592000, httpOnly: true, sameSite: "lax", path: "/" });
  // Canário: se tinha sinal de anúncio real e mesmo assim foi pra white, é lead
  // perdido (exceto quando o motivo é o próprio robô da Meta/bot declarado).
  const lost = reason !== "meta_ip" && reason !== "bot" && reason !== "prefetch" && hasAdSignal(req);
  logCloak(req, "blocked", reason, lost);
  return res;
}

function serveFunnel(req: NextRequest, markPass: boolean): NextResponse {
  const res = NextResponse.next();
  res.cookies.set("cloak_seen", "ok", { maxAge: 2592000, httpOnly: true, sameSite: "lax", path: "/" });
  if (markPass) res.cookies.set("cloak_pass", "1", { maxAge: 2592000, httpOnly: true, sameSite: "lax", path: "/" });
  logCloak(req, "allowed", "-");
  return res;
}

export function middleware(req: NextRequest, event: NextFetchEvent): NextResponse {
  _logEvent = event;
  const path = req.nextUrl.pathname;
  const host = (req.headers.get("host") || "").toLowerCase().replace(/^www\./, "").split(":")[0];

  // Desligado globalmente, host na lista de exceção, ou localhost → funil direto.
  if (!ENABLED) return NextResponse.next();
  if (DISABLED_HOSTS.some((d) => host === d || host.endsWith("." + d))) return NextResponse.next();
  if (host === "localhost" || host === "127.0.0.1") return NextResponse.next();

  // Skip: app pós-compra, checkout, API, admin, white, assets.
  if (isSkip(path)) return NextResponse.next();
  // Só cloaka rota de funil (front).
  if (!isFunnelPath(path)) return NextResponse.next();
  // Só GET.
  if (req.method !== "GET") return NextResponse.next();

  const ua = req.headers.get("user-agent") || "";
  const ip = clientIP(req);

  // ── BYPASS: token via ?cb= / ?cloak_bypass= ou cookie → vê o funil real. ──
  if (BYPASS_TOKEN) {
    const qTok = req.nextUrl.searchParams.get("cb") || req.nextUrl.searchParams.get("cloak_bypass");
    const cTok = req.cookies.get("cloak_bypass")?.value;
    if (qTok === BYPASS_TOKEN || cTok === BYPASS_TOKEN) {
      const res = NextResponse.next();
      if (qTok === BYPASS_TOKEN) res.cookies.set("cloak_bypass", BYPASS_TOKEN, { maxAge: 2592000, httpOnly: true, sameSite: "lax", path: "/" });
      return res;
    }
  }

  // ── Consistência: mesmo visitante vê sempre a mesma página. ──
  const seen = req.cookies.get("cloak_seen")?.value;
  if (seen === "w") return serveWhite(req, "sticky");
  if (seen === "ok") return NextResponse.next();

  // ── Fingerprint de automação marcado pelo cliente (cloak-fp.js). ──
  if (req.cookies.get("cloak_fp")?.value === "1") return serveWhite(req, "fingerprint");

  // ── Regra dura: IP da Meta (AS32934) → sempre white. ──
  if (ip && isMetaIP(ip)) return serveWhite(req, "meta_ip");

  // ── Bot / AdSpy / sem UA → white. ──
  if (!ua) return serveWhite(req, "no_ua");
  if (BOT_RE.test(ua)) return serveWhite(req, "bot");
  if (ADSPY_RE.test(ua)) return serveWhite(req, "adspy");

  // ── Prefetch / link preview → white. ──
  if (isPrefetch(req)) return serveWhite(req, "prefetch");

  // ── País bloqueado (via cf-ipcountry / x-render-ip-country). ──
  if (BLOCKED_COUNTRIES.length) {
    const cc = countryOf(req);
    if (cc && BLOCKED_COUNTRIES.includes(cc)) return serveWhite(req, "country");
  }

  const signal = hasAdSignal(req);

  // ── Desktop sem sinal de anúncio → white. ──
  if (BLOCK_DESKTOP && !MOBILE_RE.test(ua) && !signal) return serveWhite(req, "desktop");

  // ── Exige sinal de anúncio (fbclid/utm pago/app in-app). ──
  if (REQUIRE_SIGNAL && !signal) return serveWhite(req, "no_signal");

  // Passou: funil real + cookie de passe (navegação interna não perde o acesso).
  return serveFunnel(req, true);
}

export const config = {
  // Roda em tudo menos assets estáticos óbvios (performance).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|voice|icons|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|mp3|mp4|css|js|map)$).*)"],
};

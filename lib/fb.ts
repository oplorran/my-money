/**
 * Facebook Pixel + CAPI (client helpers).
 *
 * `fbTrack` dispara o evento no NAVEGADOR (fbq) e espelha no SERVIDOR (/api/capi)
 * com o MESMO `event_id` — o Meta deduplica os dois lados (browser + CAPI),
 * melhorando o match quality sem contar a conversão duas vezes.
 *
 * Nada aqui quebra se o pixel não estiver configurado: sem
 * NEXT_PUBLIC_FB_PIXEL_ID o navegador não tem `fbq` e o /api/capi responde
 * `skipped` enquanto FB_PIXEL_ID/FB_CAPI_TOKEN não estiverem no ambiente.
 */

type Custom = Record<string, string | number | boolean | undefined>;
type UserData = { email?: string; phone?: string };

type FbWindow = Window & { fbq?: (...args: unknown[]) => void };

const PIXEL = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

function eventId(): string {
  return "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** fbclid da URL → cookie _fbc (formato fb.1.<ts>.<fbclid>), se ainda não houver. */
export function captureFbc(): void {
  if (typeof window === "undefined") return;
  try {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid && !getCookie("_fbc")) {
      document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid};path=/;max-age=7776000;SameSite=Lax`;
    }
  } catch {}
}

/**
 * Dispara um evento padrão (PageView, Lead, InitiateCheckout, Purchase…) no
 * navegador e no CAPI com o mesmo event_id. `user` (email/telefone) é hasheado
 * no servidor — nunca mandamos PII crua pro Meta a partir do browser.
 */
export function fbTrack(name: string, custom: Custom = {}, user: UserData = {}): void {
  if (typeof window === "undefined") return;
  const id = eventId();
  const w = window as FbWindow;
  try { w.fbq?.("track", name, custom, { eventID: id }); } catch {}
  try {
    const body = JSON.stringify({
      event_name: name,
      event_id: id,
      event_source_url: window.location.href,
      custom_data: custom,
      email: user.email,
      phone: user.phone,
      fbc: getCookie("_fbc"),
      fbp: getCookie("_fbp"),
    });
    fetch("/api/capi", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {}
}

export const PIXEL_ID = PIXEL;

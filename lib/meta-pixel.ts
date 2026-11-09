/**
 * Meta Pixel (browser) + CAPI (server) — deduplicado por event_id.
 *
 * Uso:
 *   import { fireEvent, PIXEL_SCRIPT } from "@/lib/meta-pixel";
 *
 * layout.tsx: adicionar PIXEL_SCRIPT no <head> via dangerouslySetInnerHTML.
 * Páginas: chamar fireEvent("InitiateCheckout", { value, currency, content_name }).
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "";

/** Script inline que inicializa o fbevents.js + dispara PageView. */
export const PIXEL_SCRIPT = PIXEL_ID
  ? [
      // fbevents.js + init + PageView
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`,
      // captura fbclid → _fbc (cookie + localStorage) pra CAPI ter dedup
      `(function(){try{var sp=new URLSearchParams(location.search);var fc=sp.get('fbclid');if(fc){var fbc='fb.1.'+Date.now()+'.'+fc;try{localStorage.setItem('_fbc',fbc)}catch(e){}try{document.cookie='_fbc='+fbc+';max-age=7776000;path=/;SameSite=Lax'}catch(e){}}var p=0,iv=setInterval(function(){var m=document.cookie.match(/_fbp=([^;]+)/);if(m){try{localStorage.setItem('_fbp',m[1])}catch(e){}clearInterval(iv)}if(++p>20)clearInterval(iv)},200)}catch(e){}})();`,
    ].join("\n")
  : "";

type MetaWindow = Window & {
  fbq?: (...args: unknown[]) => void;
};

function genEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function readCookies(): { fbc?: string; fbp?: string } {
  if (typeof document === "undefined") return {};
  const get = (name: string) => {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : undefined;
  };
  return { fbc: get("_fbc"), fbp: get("_fbp") };
}

/**
 * Dispara um evento Meta padrão (browser pixel + CAPI server deduplicado).
 *
 * @param eventName  ex.: "InitiateCheckout", "Purchase", "PageView"
 * @param data       value, currency, content_name, email, phone, etc.
 */
export function fireEvent(
  eventName: string,
  data: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_ids?: string[];
    email?: string;
    phone?: string;
    firstName?: string;
    external_id?: string;
  } = {}
) {
  if (typeof window === "undefined") return;
  const w = window as MetaWindow;
  const eventId = genEventId();
  const { fbc, fbp } = readCookies();

  // 1) Browser pixel (fbq) — com event_id pra dedup
  try {
    if (w.fbq) {
      const fbData: Record<string, unknown> = {};
      if (data.value != null) fbData.value = data.value;
      if (data.currency) fbData.currency = data.currency;
      if (data.content_name) fbData.content_name = data.content_name;
      if (data.content_ids) fbData.content_ids = data.content_ids;
      w.fbq("track", eventName, fbData, { eventID: eventId });
    }
  } catch {}

  // 2) CAPI server (deduplicado pelo mesmo event_id)
  try {
    const body: Record<string, unknown> = {
      event_name: eventName,
      event_id: eventId,
      event_source_url: window.location.href,
      fbc: fbc || localStorage.getItem("_fbc") || undefined,
      fbp: fbp || localStorage.getItem("_fbp") || undefined,
    };
    if (data.value != null) body.value = data.value;
    if (data.currency) body.currency = data.currency || "USD";
    if (data.content_name) body.content_name = data.content_name;
    if (data.content_ids) body.content_ids = data.content_ids;
    if (data.email) body.email = data.email;
    if (data.phone) body.phone = data.phone;
    if (data.firstName) body.firstName = data.firstName;
    if (data.external_id) body.external_id = data.external_id;

    fetch("/api/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

/**
 * Captura fbclid da URL e salva como _fbc (cookie + localStorage).
 * Chamar uma vez no load do app (layout ou componente raiz).
 */
export function captureFbclid() {
  if (typeof window === "undefined") return;
  try {
    const sp = new URLSearchParams(window.location.search);
    const fbclid = sp.get("fbclid");
    if (fbclid) {
      const fbc = `fb.1.${Date.now()}.${fbclid}`;
      try { localStorage.setItem("_fbc", fbc); } catch {}
      try { document.cookie = `_fbc=${fbc};max-age=${90 * 86400};path=/;SameSite=Lax`; } catch {}
    }
    // _fbp: se o pixel browser setou o cookie, espelha no localStorage pra CAPI
    const polls = [200, 600, 1500, 3000];
    polls.forEach((ms) =>
      setTimeout(() => {
        const m = document.cookie.match(/(?:^|; )_fbp=([^;]*)/);
        if (m) try { localStorage.setItem("_fbp", m[1]); } catch {}
      }, ms)
    );
  } catch {}
}

type Payload = Record<string, string | number | boolean | undefined>;

type TrackWindow = Window & {
  dataLayer?: unknown[];
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
};

/**
 * Ponto único de telemetria. Empurra para `dataLayer` (GTM) e dispara `fbq`/`gtag`
 * quando os pixels estiverem presentes. Nada aqui depende de rede própria: basta
 * colar o snippet do GTM no layout para os eventos passarem a sair.
 */
export function track(event: string, payload: Payload = {}) {
  if (typeof window === "undefined") return;
  const w = window as TrackWindow;
  try {
    w.dataLayer?.push({ event, ...payload });
    w.fbq?.("trackCustom", event, payload);
    w.gtag?.("event", event, payload);
    if (process.env.NODE_ENV !== "production") console.debug("[track]", event, payload);
  } catch {}
}

/** Lê `?sck`/`?xcod`/`utm_*` da URL para anexar aos eventos. */
export function trackingParams(): Payload {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  const out: Payload = {};
  for (const k of ["sck", "xcod", "utm_source", "utm_medium", "utm_campaign"]) {
    const v = sp.get(k);
    if (v) out[k] = v;
  }
  return out;
}

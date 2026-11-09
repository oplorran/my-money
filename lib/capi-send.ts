/**
 * Envio de eventos pro Meta CAPI em MÚLTIPLOS pixels (server-side).
 * Lê os pares pixel/token das envs e manda o mesmo evento pra cada um.
 *
 *   FB_PIXEL_ID   + FB_CAPI_TOKEN      (pixel 1)
 *   FB_PIXEL_ID_2 + FB_CAPI_TOKEN_2    (pixel 2)
 */
const API_VERSION = process.env.FB_API_VERSION || "v21.0";

export function metaPixels(): { pixel: string; token: string }[] {
  const out: { pixel: string; token: string }[] = [];
  if (process.env.FB_PIXEL_ID && process.env.FB_CAPI_TOKEN) {
    out.push({ pixel: process.env.FB_PIXEL_ID, token: process.env.FB_CAPI_TOKEN });
  }
  if (process.env.FB_PIXEL_ID_2 && process.env.FB_CAPI_TOKEN_2) {
    out.push({ pixel: process.env.FB_PIXEL_ID_2, token: process.env.FB_CAPI_TOKEN_2 });
  }
  return out;
}

/** Manda o evento pra TODOS os pixels configurados. Retorna quantos aceitaram. */
export async function sendCapi(event: Record<string, unknown>): Promise<{ ok: boolean; sent: number; total: number }> {
  const pixels = metaPixels();
  if (!pixels.length) return { ok: false, sent: 0, total: 0 };
  const payload: Record<string, unknown> = { data: [event] };
  if (process.env.FB_TEST_EVENT_CODE) payload.test_event_code = process.env.FB_TEST_EVENT_CODE;
  const body = JSON.stringify(payload);
  const results = await Promise.all(
    pixels.map(({ pixel, token }) =>
      fetch(`https://graph.facebook.com/${API_VERSION}/${pixel}/events?access_token=${encodeURIComponent(token)}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body })
        .then((r) => r.ok).catch(() => false)
    )
  );
  const sent = results.filter(Boolean).length;
  return { ok: sent > 0, sent, total: pixels.length };
}

/**
 * Nome falado: toca APENAS "{Nome}," na mesma voz "Nate" (Inworld TTS-2) dos 99 MP3.
 * O clipe é tocado antes de algumas falas, então 1 clipe serve para a ligação inteira.
 *
 * Ordem de resolução (a primeira que acertar vence):
 *   1. arquivo pré-gerado em /voice/names/<slug>.mp3   (custo zero, sem rede extra)
 *   2. /api/tts  (sua rota, com INWORLD_API_KEY)
 *   3. /api/tts do site original  (só se a sua cair)
 *
 * Se a rota própria responder 503 (sem chave), ela é desativada pelo resto da sessão
 * e todo nome vai direto para a API de terceiros, como antes.
 *
 * Qualquer falha cai no silêncio: a fala base toca sem o nome e nada trava.
 */

const LOCAL_TTS = "/api/tts";
const FALLBACK_TTS = "https://growaiclub.com/api/tts";
const FETCH_TIMEOUT = 9000;
const LOCAL_PROBE_TIMEOUT = 2500;
const MIN_BYTES = 1500;

/** Vira true quando /api/tts responde 503 (sem chave configurada). */
let localOff = false;

const MEM = new Map<string, string>();
const PENDING = new Map<string, Promise<string | null>>();

/** Só letras/apóstrofo/hífen, 1ª palavra, no máximo 18 chars, capitalizado. */
export function cleanName(raw: string): string {
  const t = raw.replace(/[^\p{L}\s'-]/gu, "").trim();
  if (!t) return "";
  const first = t.split(/\s+/)[0].slice(0, 18);
  return first.charAt(0).toLocaleUpperCase() + first.slice(1).toLocaleLowerCase();
}

function slug(name: string): string {
  return name.toLocaleLowerCase().replace(/[^a-z'-]/g, "");
}

async function exists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    return res.ok;
  } catch {
    return false;
  }
}

async function fromStatic(name: string): Promise<string | null> {
  const s = slug(name);
  if (!s) return null;
  const url = `/voice/names/${s}.mp3`;
  return (await exists(url)) ? url : null;
}

async function fromApi(endpoint: string, name: string, timeout = FETCH_TIMEOUT): Promise<string | null> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `${name},` }),
      signal: AbortSignal.timeout(timeout),
    });
    if (res.status === 503) {
      localOff = true;
      return null;
    }
    if (!res.ok) return null;
    if (!(res.headers.get("content-type") ?? "").includes("audio")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < MIN_BYTES) return null;
    return URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
  } catch {
    return null;
  }
}

async function synth(name: string): Promise<string | null> {
  const cached = await fromStatic(name);
  if (cached) return cached;
  if (!localOff) {
    const own = await fromApi(LOCAL_TTS, name, LOCAL_PROBE_TIMEOUT);
    if (own) return own;
  }
  return fromApi(FALLBACK_TTS, name);
}

/** Devolve a URL do clipe do nome, reaproveitando requisição em andamento. */
export function resolveName(name: string): Promise<string | null> {
  if (!name) return Promise.resolve(null);
  const hit = MEM.get(name);
  if (hit) return Promise.resolve(hit);
  const inFlight = PENDING.get(name);
  if (inFlight) return inFlight;
  const p = synth(name).then((url) => {
    PENDING.delete(name);
    if (url) MEM.set(name, url);
    return url;
  });
  PENDING.set(name, p);
  return p;
}

export function prefetchName(name: string) {
  if (name.length < 2 || MEM.has(name)) return;
  void resolveName(name);
}

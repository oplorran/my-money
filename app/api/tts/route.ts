import { NextResponse } from "next/server";

/**
 * TTS próprio — mesma voz "Nate" (Inworld TTS-2) dos MP3 do roteiro.
 *
 * Chave em INWORLD_API_KEY (Basic base64 do Portal). Fica só no servidor.
 * Só o nome é sintetizado: 1 requisição por visitante, ~12 KB, cache imutável.
 */

const ENDPOINT = "https://api.inworld.ai/tts/v1/voice";
const VOICE = "Nate";
const MODEL = "inworld-tts-2";
// Mesmo enquadramento dos MP3 de /public/voice (48 kHz, 64 kbps), para o nome não soar diferente.
const SAMPLE_RATE = 48000;
const BIT_RATE = 64000;
const MAX_CHARS = 40;
const TIMEOUT = 12000;

/** Cache em memória por instância; o CDN segura o resto via Cache-Control. */
const CACHE = new Map<string, ArrayBuffer>();
/** Evita mapa sem limite em processo de longa duração. */
const CACHE_MAX = 400;

export async function POST(req: Request) {
  const key = process.env.INWORLD_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "INWORLD_API_KEY ausente" }, { status: 503 });
  }

  let text = "";
  try {
    const body = (await req.json()) as { text?: unknown };
    text = String(body.text ?? "").replace(/\s+/g, " ").trim();
  } catch {
    return NextResponse.json({ error: "json invalido" }, { status: 400 });
  }
  if (!text) return NextResponse.json({ error: "text obrigatorio" }, { status: 400 });
  if (text.length > MAX_CHARS) return NextResponse.json({ error: `maximo ${MAX_CHARS}` }, { status: 413 });

  const hit = CACHE.get(text);
  if (hit) return audio(hit);

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Basic ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voiceId: VOICE,
        modelId: MODEL,
        audioConfig: { audioEncoding: "MP3", sampleRateHertz: SAMPLE_RATE, bitRate: BIT_RATE },
      }),
      signal: AbortSignal.timeout(TIMEOUT),
    });
  } catch {
    return NextResponse.json({ error: "falha ao contatar o TTS" }, { status: 502 });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `tts ${res.status}`, detail: detail.slice(0, 300) }, { status: 502 });
  }

  const json = (await res.json().catch(() => null)) as { audioContent?: string } | null;
  if (!json?.audioContent) {
    return NextResponse.json({ error: "resposta sem audioContent" }, { status: 502 });
  }

  const buf = Buffer.from(json.audioContent, "base64");
  if (buf.byteLength < 1200) {
    return NextResponse.json({ error: "audio vazio" }, { status: 502 });
  }

  const bytes = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  CACHE.set(text, bytes);
  if (CACHE.size > CACHE_MAX) {
    const oldest = CACHE.keys().next().value;
    if (oldest !== undefined) CACHE.delete(oldest);
  }
  return audio(bytes);
}

function audio(bytes: ArrayBuffer) {
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

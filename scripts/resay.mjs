/**
 * Regrava o áudio de uma linha a partir do texto atual de lib/voice-lines.json.
 *
 *   node scripts/resay.mjs 1
 *
 * Útil quando só o texto muda (ex.: um "Hi," antes do nome) sem trocar a marca
 * inteira. Mantém a voz e o formato, e guarda o original em public/voice/_bak/.
 */

import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LINES = join(ROOT, "lib", "voice-lines.json");
const VOICE = join(ROOT, "public", "voice");

const id = Number(process.argv[2]);
if (!Number.isFinite(id)) {
  console.error("Uso: node scripts/resay.mjs <id>");
  process.exit(1);
}

const lines = JSON.parse(await readFile(LINES, "utf8"));
const line = lines.find((l) => l.id === id);
if (!line) {
  console.error(`linha ${id} não existe`);
  process.exit(1);
}

const TTS = ["http://localhost:3100/api/tts", "https://growaiclub.com/api/tts"];

async function synth(text) {
  for (const url of TTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) continue;
      if (!(res.headers.get("content-type") ?? "").includes("audio")) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength < 5000) continue;
      return buf;
    } catch {
      /* tenta o próximo */
    }
  }
  return null;
}

const file = join(VOICE, line.file);
const buf = await synth(line.text);
if (!buf) {
  console.error(`[${id}] falhou ao sintetizar`);
  process.exit(1);
}

await mkdir(join(VOICE, "_bak"), { recursive: true });
await copyFile(file, join(VOICE, "_bak", line.file)).catch(() => {});
await writeFile(file, buf);

console.log(`[${id}] "${line.text}"`);
console.log(`[${id}] ${line.file} regravado (${buf.byteLength}B)`);

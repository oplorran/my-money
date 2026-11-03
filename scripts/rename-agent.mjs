/**
 * Troca o nome do agente no roteiro em texto e áudio.
 *
 *   node scripts/rename-agent.mjs "Alex Parker"          (aplica)
 *   node scripts/rename-agent.mjs "Alex Parker" --dry    (só mostra o texto)
 *
 * Regrava apenas as falas que citam o nome, na mesma voz e formato dos arquivos
 * base (Inworld "Nate", 48 kHz / 64 kbps), preservando o nome do arquivo.
 */

import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LINES = join(ROOT, "lib", "voice-lines.json");
const VOICE = join(ROOT, "public", "voice");

const name = (process.argv[2] || "").trim();
const dry = process.argv.includes("--dry");

if (name.length < 2) {
  console.error('Uso: node scripts/rename-agent.mjs "Nome Completo"');
  process.exit(1);
}

/** Falas que apresentam o agente. */
const TARGETS = [1];

const OLD = /\bDaniel Torres\b/g;

const lines = JSON.parse(await readFile(LINES, "utf8"));
const changed = [];

for (const id of TARGETS) {
  const line = lines.find((l) => l.id === id);
  if (!line) {
    console.warn(`linha ${id} inexistente, pulando`);
    continue;
  }
  const next = line.text.replace(OLD, name);
  if (next === line.text) continue;
  changed.push({ id, before: line.text, after: next });
}

if (!changed.length) {
  console.log("Nada a trocar (o nome já é esse?).");
  process.exit(0);
}

for (const c of changed) {
  console.log(`\n--- ${c.id} ---\n${c.after}`);
}

if (dry) {
  console.log(`\n[dry] ${changed.length} linha(s), nenhum áudio gerado.`);
  process.exit(0);
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

await mkdir(join(VOICE, "_bak"), { recursive: true });

let ok = 0;
for (const c of changed) {
  const line = lines.find((l) => l.id === c.id);
  const file = join(VOICE, line.file);
  const buf = await synth(c.after);
  if (!buf) {
    console.error(`[${c.id}] FALHOU ao sintetizar, texto não alterado`);
    continue;
  }
  await copyFile(file, join(VOICE, "_bak", line.file)).catch(() => {});
  await writeFile(file, buf);
  line.text = c.after;
  ok++;
  console.log(`[${c.id}] ${line.file} regravado (${buf.byteLength}B)`);
}

await writeFile(LINES, JSON.stringify(lines, null, 2) + "\n", "utf8");
console.log(`\n${ok}/${changed.length} falas regravadas. Backup em public/voice/_bak/.`);

/**
 * Reescreve a marca falada no roteiro (texto + áudio).
 *
 *   node scripts/rebrand.mjs "Cash Club"
 *   node scripts/rebrand.mjs "Cash Club" --dry   (só mostra o texto, não sintetiza)
 *
 * Regras aplicadas, na ordem:
 *   - "The My Money A I"    -> "The Cash Club A I"
 *   - "The My Money income" -> "The Cash Club income"
 *   - "My Money" / "Money Club" -> marca nova
 *
 * Backup dos MP3 antigos em public/voice/_bak/, mantendo o nome do arquivo.
 */

import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LINES = join(ROOT, "lib", "voice-lines.json");
const VOICE = join(ROOT, "public", "voice");

const brand = (process.argv[2] || "").trim();
const dry = process.argv.includes("--dry");

if (brand.length < 2) {
  console.error('Uso: node scripts/rebrand.mjs "Novo Nome"');
  process.exit(1);
}

function rewrite(text) {
  return text
    .replace(/\bThe My Money A I\b/g, `The ${brand} A I`)
    .replace(/\bMy Money A I\b/g, `${brand} A I`)
    .replace(/\bThe My Money income\b/g, `The ${brand} income`)
    .replace(/\bThe Money Club A I\b/g, `The ${brand} A I`)
    .replace(/\bThe Money Club income\b/g, `The ${brand} income`)
    .replace(/\bMy Money\b/g, brand)
    .replace(/\bMoney Club\b/g, brand);
}

const lines = JSON.parse(await readFile(LINES, "utf8"));
const changed = [];

for (const line of lines) {
  const next = rewrite(line.text);
  if (next === line.text) continue;
  changed.push({ id: line.id, file: line.file, before: line.text, after: next });
}

if (!changed.length) {
  console.log("Nada a trocar (a marca já é essa?).");
  process.exit(0);
}

for (const c of changed) {
  console.log(`\n--- ${c.id} ---\n${c.after}`);
}

if (dry) {
  console.log(`\n[dry] ${changed.length} linhas, nenhum áudio gerado.`);
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

let ok = 0;
for (const c of changed) {
  const line = lines.find((l) => l.id === c.id);
  const file = join(VOICE, line.file);
  const buf = await synth(c.after);
  if (!buf) {
    console.error(`[${c.id}] FALHOU ao sintetizar, texto não alterado`);
    continue;
  }
  await mkdir(join(VOICE, "_bak"), { recursive: true }).catch(() => {});
  await copyFile(file, join(VOICE, "_bak", line.file)).catch(() => {});
  await writeFile(file, buf);
  line.text = c.after;
  ok++;
  console.log(`[${c.id}] ${line.file} regravado (${buf.byteLength}B)`);
}

await writeFile(LINES, JSON.stringify(lines, null, 2) + "\n", "utf8");
console.log(`\n${ok}/${changed.length} falas regravadas. Backup em public/voice/_bak/.`);

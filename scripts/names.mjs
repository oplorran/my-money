/**
 * Pré-gera o clipe de cada nome de uma lista e grava em public/voice/names/<slug>.mp3.
 *
 *   INWORLD_API_KEY=xxxx node scripts/names.mjs            (lista padrão, top 300)
 *   INWORLD_API_KEY=xxxx node scripts/names.mjs nomes.txt   (uma por linha)
 *
 * Nomes já gravados são pulados, então rodar de novo é barato.
 * Depois, `lib/name.ts` tenta o arquivo estático antes de chamar /api/tts.
 */

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "voice", "names");

const KEY = process.env.INWORLD_API_KEY;
if (!KEY) {
  console.error("Falta INWORLD_API_KEY.");
  process.exit(1);
}

const DEFAULT_NAMES = `james mary robert patricia john jennifer michael linda david elizabeth william barbara richard susan joseph jessica thomas sarah charles karen christopher nancy daniel lisa matthew betty anthony margaret mark sandra donald ashley steven kimberly paul emily andrew donna joshua michelle kenneth carol kevin amanda brian dorothy george melissa timothy deborah ronald stephanie edward rebecca jason sharon jeffrey laura ryan cynthia jacob kathleen gary amy nicholas shirley eric angela jonathan helen stephen anna larry brenda justin pamela scott nicole brandon emma benjamin samantha samuel katherine gregory christine alexander debra frank rachel patrick carolyn raymond janet jack catherine dennis maria jerry heather tyler diane aaron ruth jose julie adam olivia henry joyce nathan virginia douglas victoria zachary kelly peter lauren kyle christina walter joan ethan evelyn jeremy judith harold megan keith andrea christian cheryl roger hannah noah jacqueline gerald martha carl gloria terry teresa sean ann austin sara arthur madison lawrence frances dylan kathryn jesse janice jordan abigail bryan alice billy judy bruce sophia gabriel grace logan denise albert amber willie doris alan marilyn eugene danielle russell beverly vincent isabella philip theresa bobby diana johnny natalie bradley brittany roy charlotte ralph marie eugene kayla wayne alexis louis lori dylan marie cameron tiffany juan kayla carlos brooke nathan bella casey daisy miguel hailey luis nina victor penny adrian savannah jesus aubrey diego madelyn alexa jordan caroline max genesis jayden aaliyah rafael kaylee nicolas gabriella mariana ariana brayden leah jorge arianna miguel lily ana zoe carolina makayla santiago audrey juan claire roman maya emmanuel alexa leonardo valentina mateo lucy sebastian stella andres ellie pedro piper diego sadie alejandro jade fernanda ivy sergio lilly ricardo vivian cesar norah daniela emery martin molly hugo ivanna joaquin alexandra eduardo sofia antonio alice liam amelia lucas ava mason mia logan harper oliver evelyn elijah abigail jacob emily lucas ella michael elizabeth benjamin camila alexander sofia daniel avery matthew scarlett henry victoria jack madison sebastian luna owen grace samuel chloe gregorio valeria tomas catalina`

const listPath = process.argv[2];
const raw = listPath ? await readFile(listPath, "utf8") : DEFAULT_NAMES;
const names = [...new Set(raw.split(/\s+/).map((n) => n.trim().toLowerCase()).filter((n) => /^[a-z'-]{2,18}$/.test(n)))];

await mkdir(OUT, { recursive: true });

const exists = (p) => access(p).then(() => true, () => false);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

let made = 0;
let skipped = 0;
let failed = 0;

for (const [i, name] of names.entries()) {
  const file = join(OUT, `${name}.mp3`);
  if (await exists(file)) {
    skipped++;
    continue;
  }

  try {
    const res = await fetch("https://api.inworld.ai/tts/v1/voice", {
      method: "POST",
      headers: { Authorization: `Basic ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `${cap(name)},`,
        voiceId: "Nate",
        modelId: "inworld-tts-2",
        audioConfig: { audioEncoding: "MP3", sampleRateHertz: 48000, bitRate: 64000 },
      }),
    });
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
    const { audioContent } = await res.json();
    const buf = Buffer.from(audioContent, "base64");
    if (buf.byteLength < 1200) throw new Error("audio vazio");
    await writeFile(file, buf);
    made++;
    console.log(`[${i + 1}/${names.length}] ${name} ${buf.byteLength}B`);
  } catch (e) {
    failed++;
    console.error(`[${i + 1}/${names.length}] ${name} FALHOU: ${e.message}`);
  }
}

console.log(`\n${made} gerados, ${skipped} já existiam, ${failed} falharam -> ${OUT}`);

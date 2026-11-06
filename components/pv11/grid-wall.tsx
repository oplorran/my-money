"use client";

import { AiMaker, BrandChip } from "@/components/brands";
import type { BrandKey } from "@/components/brands";

/**
 * Fundo da presell: quatro trilhas de logos passando em loop infinito.
 * Duas sobem e duas descem, cada uma com duração/atraso próprio — igual ao original.
 * A lista é duplicada porque a animação desloca exatamente −50%.
 */

type Maker = "openai" | "google" | "microsoft";
type Item = Maker | BrandKey;

const MAKERS: Maker[] = ["openai", "google", "microsoft"];

const COLS: { dir: "up" | "down"; dur: number; delay: string; items: Item[] }[] = [
  { dir: "up", dur: 64, delay: "0ms", items: ["openai", "google", "microsoft", "apple", "nvidia", "meta", "amazon", "tesla", "netflix"] },
  { dir: "down", dur: 56, delay: "-1200ms", items: ["spotify", "ibm", "oracle", "amazon", "tesla", "netflix", "apple", "nvidia", "google"] },
  { dir: "up", dur: 72, delay: "-2400ms", items: ["meta", "amazon", "apple", "nvidia", "tesla", "ibm", "oracle", "spotify", "microsoft"] },
  { dir: "down", dur: 60, delay: "-3600ms", items: ["nvidia", "meta", "amazon", "tesla", "netflix", "spotify", "openai", "ibm", "oracle"] },
];

function MakerChip({ id }: { id: Maker }) {
  return (
    <div className="mx-auto flex h-[68px] w-[68px] flex-col items-center justify-center gap-0.5 rounded-[18px] border border-[#303030] bg-[#111111]/80 backdrop-blur-[2px]">
      <span className="text-[#cccccc]">
        <AiMaker brand={id} size={17} />
      </span>
      <span className="text-[7px] font-semibold uppercase tracking-[0.16em] text-[#666666]">AI · Trade</span>
    </div>
  );
}

function isMaker(i: Item): i is Maker {
  return (MAKERS as string[]).includes(i);
}

/** `speed` multiplica a velocidade das trilhas: 1 = pv11, 2 = pv12 (mais acelerado). */
export function GridWall({ speed = 1 }: { speed?: number }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-25">
      <div className="grid h-full grid-cols-4 gap-2 px-2 md:gap-3 md:px-3">
        {COLS.map((col, i) => (
          <div key={i} className="h-full overflow-hidden">
            <div
              className={`mx-auto w-full max-w-[68px] ${col.dir === "up" ? "pv11-col-up" : "pv11-col-down"}`}
              style={{ animationDuration: `${col.dur / speed}s`, animationDelay: col.delay }}
            >
              {[0, 1].map((pass) =>
                col.items.map((item, j) => (
                  <div key={`${pass}-${item}-${j}`} className="py-1.5">
                    {isMaker(item) ? <MakerChip id={item} /> : <BrandChip brand={item} />}
                  </div>
                )),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

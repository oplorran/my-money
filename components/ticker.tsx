"use client";

import { BrandChip, type BrandKey } from "./brands";

const COLUMNS: { dir: "up" | "down"; delay: string; brands: BrandKey[] }[] = [
  { dir: "up", delay: "0s", brands: ["apple", "nvidia", "meta", "tesla", "netflix", "spotify", "ibm", "oracle"] },
  { dir: "down", delay: "-1.2s", brands: ["amazon", "tesla", "netflix", "spotify", "apple", "nvidia", "meta", "oracle"] },
  { dir: "up", delay: "-2.4s", brands: ["meta", "amazon", "apple", "nvidia", "tesla", "ibm", "oracle", "spotify"] },
  { dir: "down", delay: "-3.6s", brands: ["nvidia", "meta", "amazon", "tesla", "netflix", "spotify", "apple", "ibm"] },
];

// a trilha precisa ser mais alta que qualquer viewport: 6 cópias, e a animação
// anda só metade (-50%), então metade do conteúdo continua sempre preenchendo a tela
const REPEAT = 6;

export function Ticker() {
  return (
    <div className="absolute inset-0 flex justify-center gap-2 opacity-25 pointer-events-none overflow-hidden">
      {COLUMNS.map((col, i) => (
        <div key={i} className="w-[68px] overflow-hidden">
          <div
            className={`flex flex-col gap-2 mc-ticker ${col.dir === "down" ? "mc-ticker-down" : ""}`}
            style={{ animationDelay: col.delay }}
          >
            {Array.from({ length: REPEAT }).flatMap((_, r) =>
              col.brands.map((b, j) => <BrandChip key={`${r}-${b}-${j}`} brand={b} />),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

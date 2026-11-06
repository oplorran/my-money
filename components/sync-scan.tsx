"use client";

import { useEffect, useState } from "react";
import { StockGlyph } from "@/components/stock-glyph";
import type { StockKey } from "@/components/stock-glyph";

/**
 * Cena de sincronismo do simulador: anel orbital com os três fabricantes da licença
 * (OpenAI, Google, Microsoft) girando em volta de um núcleo, seguida da malha de 9
 * ativos com o card em execução destacado — igual ao original.
 */

/** Cor de marca de cada ativo, usada no halo do card. */
const TINT: Record<StockKey, string> = {
  META: "0, 129, 251",
  AAPL: "85, 85, 85",
  MSFT: "0, 164, 239",
  GOOGL: "66, 133, 244",
  AMZN: "255, 153, 0",
  NFLX: "229, 9, 20",
  TSLA: "204, 0, 0",
  V: "26, 31, 113",
  NVDA: "118, 185, 0",
};

const STOCKS: { t: StockKey; n: string }[] = [
  { t: "META", n: "Facebook" },
  { t: "AAPL", n: "Apple" },
  { t: "MSFT", n: "Microsoft" },
  { t: "GOOGL", n: "Google" },
  { t: "AMZN", n: "Amazon" },
  { t: "NFLX", n: "Netflix" },
  { t: "TSLA", n: "Tesla" },
  { t: "V", n: "Visa" },
  { t: "NVDA", n: "NVIDIA" },
];

/** Posições dos três selos no anel (90/22, 148.89/124, 31.11/124). */
const ORBIT = [
  { l: 90, t: 22, bg: "linear-gradient(160deg,#1ABF93 0%,#10A37F 55%,#0B7A5E 100%)", glow: "rgba(16,163,127,.55)" },
  { l: 148.89, t: 124, bg: "linear-gradient(160deg,#ffffff 0%,#f1f3f4 100%)", glow: "rgba(255,255,255,.45)" },
  { l: 31.11, t: 124, bg: "linear-gradient(160deg,#36BEF6 0%,#04ADF4 55%,#0288C2 100%)", glow: "rgba(4,173,244,.6)" },
];

function MakerGlyph({ i }: { i: number }) {
  if (i === 0) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        {[0, 60, 120].map((d) => (
          <rect key={d} x="7.4" y="2.6" width="9.2" height="18.8" rx="4.6" transform={`rotate(${d} 12 12)`} />
        ))}
      </svg>
    );
  }
  if (i === 1) {
    return (
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 23 23" fill="currentColor">
      <rect x="1" y="1" width="10" height="10" />
      <rect x="12" y="1" width="10" height="10" />
      <rect x="1" y="12" width="10" height="10" />
      <rect x="12" y="12" width="10" height="10" />
    </svg>
  );
}

export function SyncScan({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <SyncOrbit />

      <p className="mb-4 mt-3 text-center text-[13px] text-[#888888]">
        <span className="font-semibold uppercase tracking-[0.12em] text-[#a8ff16]">AI in sync</span>
        <span className="mx-2 text-[#666666]">·</span>
        <span className="tabular font-semibold text-white">{compact ? 485 : 500}</span>
        <span className="text-[#888888]"> stocks</span>
      </p>

      <StockGrid />
    </>
  );
}

/** Malha dos 9 ativos: o card "em execução" alterna sozinho, como no original. */
export function StockGrid({ className = "", dense = false }: { className?: string; dense?: boolean }) {
  const [active, setActive] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => setActive((i) => (i + 1) % STOCKS.length), 900);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={`grid w-full max-w-sm grid-cols-3 ${dense ? "gap-1.5" : "gap-3"} ${className}`}>
      {STOCKS.map((s, i) => {
        const on = active === i;
        const c = TINT[s.t];
        if (dense) {
          return (
            <div
              key={s.t}
              className="flex flex-col items-center rounded-[16px] border border-[#303030] bg-[#111111] px-1 py-1.5"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-[12px] bg-[#1b1b1d] text-white">
                <StockGlyph ticker={s.t} size={13} />
              </span>
              <p className="mt-1 text-[9.5px] font-bold leading-none text-white">{s.t}</p>
              <p className="mt-0.5 text-[8px] leading-none text-[#666666]">{s.n}</p>
            </div>
          );
        }
        return (
          <div
            key={s.t}
            className="relative overflow-hidden rounded-[18px] border p-3 transition-all duration-200"
            style={{
              background: on
                ? `linear-gradient(rgba(168,255,22,.16), rgba(168,255,22,.04))`
                : `radial-gradient(circle at 50% -10%, rgba(${c},.21), transparent 60%), #111111`,
              borderColor: on ? "rgba(168,255,22,.6)" : `rgba(${c},.27)`,
              boxShadow: on ? "0 0 20px rgba(168,255,22,.22)" : "inset 0 1px 0 rgba(255,255,255,.06)",
              transform: on ? "translateY(-2px)" : "none",
            }}
          >
            {on && <span className="qa-shine" aria-hidden />}
            <div className="relative z-10 flex flex-col items-center text-center">
              <span
                className="mb-2 flex h-11 w-11 items-center justify-center rounded-[14px] text-white"
                style={{
                  background: `linear-gradient(135deg, rgb(${c}), rgba(${c},.8))`,
                  boxShadow: `0 8px 20px rgba(${c},.33), inset 0 1px 0 rgba(255,255,255,.25)`,
                }}
              >
                <StockGlyph ticker={s.t} size={24} />
              </span>
              <span className="text-[13px] font-bold tracking-tight text-white">{s.t}</span>
              <span className="text-[10px] tracking-wide text-[#888888]">{s.n}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Anel orbital com os três fabricantes da licença girando em volta do núcleo. */
export function SyncOrbit() {
  return (
    <div className="relative mx-auto h-[180px] w-[180px]">
      <div className="absolute inset-2 rounded-full border border-[#303030]" />
      <div className="absolute inset-5 rounded-full border border-[#262626]" />

      <svg viewBox="0 0 180 180" className="pointer-events-none absolute inset-0 h-full w-full">
        {[0, 60, 120].map((deg) => (
          <circle
            key={deg}
            cx="90"
            cy="90"
            r="68"
            fill="none"
            stroke="rgba(168,255,22,.35)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 10"
            transform={`rotate(${deg - 90} 90 90)`}
            className="sync-arc"
            style={{ animationDelay: `${deg / 400}s` }}
          />
        ))}
      </svg>

      <span className="absolute left-1/2 top-1/2 z-10 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#a8ff16] shadow-[0_0_26px_rgba(168,255,22,.45)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
          <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
        </svg>
      </span>

      {ORBIT.map((o, i) => (
        <span
          key={i}
          className="absolute z-20 flex h-[44px] w-[44px] items-center justify-center rounded-full text-white"
          style={{
            background: o.bg,
            boxShadow: `0 0 0 3px #090909, 0 0 18px ${o.glow}`,
            left: o.l,
            top: o.t,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,.4),transparent_55%)]" />
          <MakerGlyph i={i} />
        </span>
      ))}
    </div>
  );
}

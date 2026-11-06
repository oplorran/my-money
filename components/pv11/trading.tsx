"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { money, writeState } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";
import { StockGlyph } from "@/components/stock-glyph";
import type { StockKey } from "@/components/stock-glyph";
import { StockGrid } from "@/components/sync-scan";

type Stage = "sync" | "choose" | "live" | "popup";
type Op = { id: number; profit: number; status: "running" | "win" | "loss" };

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

const MAKERS = [
  { n: "GPT", o: "OpenAI", brand: "openai" as const },
  { n: "GEMINI", o: "Google", brand: "google" as const },
  { n: "COPILOT", o: "Microsoft", brand: "microsoft" as const },
];

/** Anel orbital do sincronismo, com os três modelos da licença. */
const ORBIT = [
  { l: 90, t: 22, bg: "linear-gradient(160deg,#1ABF93 0%,#10A37F 55%,#0B7A5E 100%)", glow: "rgba(16,163,127,.55)", brand: "openai" as const },
  { l: 148.89, t: 124, bg: "linear-gradient(160deg,#ffffff 0%,#f1f3f4 100%)", glow: "rgba(255,255,255,.45)", brand: "google" as const },
  { l: 31.11, t: 124, bg: "linear-gradient(160deg,#36BEF6 0%,#04ADF4 55%,#0288C2 100%)", glow: "rgba(4,173,244,.6)", brand: "microsoft" as const },
];

const MODES = [
  { label: "Conservative Mode", risk: "Minimum", mult: 0.55 },
  { label: "Recommended Mode", risk: "Low", mult: 1 },
  { label: "Maximum Mode", risk: "Moderate", mult: 1.9 },
];

/** Intensidade do risco no tema: cinza (mínimo) → neon (recomendado) → neon claro. */
const ACC = [
  { rgb: "136, 136, 136", hex: "#888888" },
  { rgb: "168, 255, 22", hex: "#a8ff16" },
  { rgb: "216, 255, 138", hex: "#d8ff8a" },
];

const bandOf = (v: number) => (v < 34 ? 0 : v < 67 ? 1 : 2);

function MakerGlyph({ brand, size = 20 }: { brand: "openai" | "google" | "microsoft"; size?: number }) {
  if (brand === "openai") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        {[0, 60, 120].map((d) => (
          <rect key={d} x="7.4" y="2.6" width="9.2" height="18.8" rx="4.6" transform={`rotate(${d} 12 12)`} />
        ))}
      </svg>
    );
  }
  if (brand === "google") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 23 23" fill="currentColor">
      <rect x="1" y="1" width="10" height="10" />
      <rect x="12" y="1" width="10" height="10" />
      <rect x="1" y="12" width="10" height="10" />
      <rect x="12" y="12" width="10" height="10" />
    </svg>
  );
}

type Props = {
  start: number;
  profits: number[];
  /** rota da VSL ao final */
  vsl: string;
  /** prefixo dos eventos de telemetria */
  event: string;
  /** o pv12 exige escolher o modo de risco antes de negociar */
  riskStep?: boolean;
  /** o pv14 vai direto ao saque, sem o popup de "profit confirmed" */
  skipPopup?: boolean;
};

export function Pv11Trading({ start, profits, vsl, event, riskStep = false, skipPopup = false }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(riskStep ? "sync" : "sync");
  const [slider, setSlider] = useState(50);
  const [balance, setBalance] = useState(start);
  const [ops, setOps] = useState<Op[]>([]);
  const [idx, setIdx] = useState(0);
  const [contacting, setContacting] = useState(false);
  const [stocks, setStocks] = useState(431);
  const done = useRef(false);

  const total = profits.length;
  const mode = bandOf(slider);
  const mult = riskStep ? MODES[mode].mult : 1;
  const level = 3 + (slider / 100) * 24;
  const goal = profits.reduce((s, p) => s + p, 0);
  const preview = (goal * mult).toFixed(2);
  const profit = balance - start;

  useEffect(() => {
    const id = window.setInterval(() => setStocks(330 + Math.floor(Math.random() * 180)), 700);
    return () => window.clearInterval(id);
  }, []);

  // sincronismo → escolha de modo (pv12) ou direto para a sessão (pv11)
  useEffect(() => {
    if (stage !== "sync") return;
    const t = window.setTimeout(() => setStage(riskStep ? "choose" : "live"), 4600);
    return () => window.clearTimeout(t);
  }, [stage, riskStep]);

  // a sessão roda sozinha, um trade por vez
  useEffect(() => {
    if (stage !== "live" || idx >= total) return;
    const t = window.setTimeout(() => {
      setOps((prev) => [{ id: idx, profit: profits[idx] * mult, status: "running" }, ...prev]);
      window.setTimeout(() => {
        setOps((prev) =>
          prev.map((o) => (o.id === idx ? { ...o, status: profits[idx] > 0 ? "win" : "loss" } : o)),
        );
        setBalance((b) => b + profits[idx] * mult);
        setIdx((i) => i + 1);
        track(`${event}_trade`, { n: idx + 1, profit: profits[idx], ...trackingParams() });
      }, 1600);
    }, 1500);
    return () => window.clearTimeout(t);
  }, [stage, idx, total, mult, profits, event]);

  useEffect(() => {
    if (idx < total || stage !== "live" || done.current) return;
    done.current = true;
    if (skipPopup) {
      writeState({ balance });
      const t = window.setTimeout(() => router.push(vsl), 900);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStage("popup"), 1200);
    return () => window.clearTimeout(t);
  }, [idx, total, stage, skipPopup, balance, router, vsl]);

  const startTrading = () => {
    setBalance(start);
    setOps([]);
    setIdx(0);
    done.current = false;
    setStage("live");
    track(`${event}_start_trading`, { mode: MODES[mode].risk, ...trackingParams() });
  };

  const activate = useCallback(() => {
    if (contacting) return;
    setContacting(true);
    writeState({ balance });
    track(`${event}_activate_account`, { balance: Number(balance.toFixed(2)), ...trackingParams() });
    window.setTimeout(() => router.push(vsl), 700);
  }, [balance, contacting, router, vsl, event]);

  /* ---------- sincronismo ---------- */
  if (stage === "sync") {
    return (
      <main className="mc-shell relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4">
        <div className="mc-glow" />

        <div className="relative z-10 flex w-full max-w-[360px] flex-col items-center">
          <div className="relative h-[180px] w-[180px]">
            <div className="absolute inset-2 rounded-full border border-[#303030]" />
            <div className="absolute inset-5 rounded-full border border-[#262626]" />

            <svg viewBox="0 0 180 180" className="pointer-events-none absolute inset-0 h-full w-full">
              {[0, 120, 240].map((deg) => (
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

            <span className="absolute left-1/2 top-1/2 z-10 flex h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#a8ff16] shadow-[0_0_26px_rgba(168,255,22,.5)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
              </svg>
            </span>

            {ORBIT.map((o, i) => (
              <span
                key={i}
                className="absolute z-20 flex h-[44px] w-[44px] items-center justify-center"
                style={{
                  left: o.l,
                  top: o.t,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* o pulso vive num filho: no elemento posicionado ele sobrescreveria o translate */}
                <span
                  className="mc-breathe absolute inset-0 flex items-center justify-center rounded-full text-white"
                  style={{
                    background: o.bg,
                    boxShadow: `0 0 0 3px #090909, 0 0 18px ${o.glow}`,
                    animationDelay: `${i * 0.45}s`,
                  }}
                >
                  <MakerGlyph brand={o.brand} size={20} />
                </span>
              </span>
            ))}
          </div>

          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[#a8ff16]/30 bg-[#a8ff16]/10 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a8ff16]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#a8ff16]">
              AI in sync · <span className="tabular">{stocks}</span> stocks
            </span>
          </span>

          <StockGrid className="mt-4" />

          <p className="mt-4 text-center text-[13px] text-[#888888]">
            Scanning for high-probability opportunities
            <span className="ml-0.5 animate-pulse">…</span>
          </p>
        </div>
      </main>
    );
  }

  /* ---------- escolha do modo de risco (modal sobre o grid de ações) ---------- */
  if (stage === "choose") {
    return (
      <main className="mc-shell relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="mc-glow" />

        {/* fundo: o grid de ações, coberto pelo backdrop do modal */}
        <div className="relative z-10 mx-auto flex w-full max-w-[420px] flex-col px-4 pb-6 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a8ff16]/30 bg-[#a8ff16]/10 px-2.5 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a8ff16] opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#a8ff16]" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#a8ff16]">
                AI in sync · 500 stocks
              </span>
            </span>
            <div className="text-right leading-none">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#666666]">Balance</p>
              <p className="tabular mt-0.5 text-[13px] font-bold text-white">{money(start)}</p>
            </div>
          </div>

          <div className="mt-3">
            <StockGrid dense className="max-w-none" />
          </div>
        </div>

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

          <div className="mc-pop relative w-full max-w-[380px] overflow-hidden rounded-[28px] border border-[#303030] bg-[#111111]">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,255,22,.16),transparent_70%)]" />
          <div className="relative flex flex-col p-5">
          <div className="mb-3 text-center">
            <h1 className="text-[19px] font-bold leading-tight tracking-tight text-white">
              How much do you want to make?
            </h1>
            <p className="mt-1 text-[12px] text-[#888888]">Move the slider to pick your mode</p>
          </div>

          <div
            className="mb-4 overflow-hidden rounded-[22px] border p-4 transition-colors duration-300"
            style={{ background: "#161616", borderColor: `rgba(${ACC[mode].rgb},.3)` }}
          >
            <div className="text-center">
              <span
                className="inline-block rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  background: `rgba(${ACC[mode].rgb},.13)`,
                  color: ACC[mode].hex,
                  borderColor: `rgba(${ACC[mode].rgb},.35)`,
                }}
              >
                {MODES[mode].label}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl font-semibold text-[#888888]">$</span>
                  <span className="tabular text-4xl font-bold text-white">{preview}</span>
                </div>
                <p className="mt-1 text-[11px] text-[#888888]">Estimated profit at start</p>
              </div>

              <div className="mr-2 flex shrink-0 flex-col items-center gap-1.5">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#888888]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ACC[mode].hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                    <path d="M12 9v4M12 17h.01" />
                  </svg>
                  <span>Risk</span>
                </div>
                <div className="relative h-[76px] w-3.5 overflow-hidden rounded-full border border-[#303030] bg-[#1b1b1d]">
                  <div className="absolute inset-x-0 top-[33%] h-px bg-[#303030]" />
                  <div className="absolute inset-x-0 top-[66%] h-px bg-[#303030]" />
                  <div
                    className="absolute inset-x-0 bottom-0 transition-all duration-300"
                    style={{
                      height: `${level}%`,
                      background: `linear-gradient(to top, rgba(${ACC[mode].rgb},.55), rgb(${ACC[mode].rgb}))`,
                      boxShadow: `rgba(${ACC[mode].rgb},.55) 0 0 14px, inset 0 1px 0 rgba(255,255,255,.25)`,
                    }}
                  />
                </div>
                <span
                  className="text-[12px] font-bold uppercase tracking-wider transition-colors duration-300"
                  style={{ color: ACC[mode].hex }}
                >
                  {MODES[mode].risk}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative px-1">
              <div className="absolute inset-x-1 top-1/2 h-5 -translate-y-1/2 overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-[#1b1b1d]" />
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-150"
                  style={{
                    width: `${slider}%`,
                    background: "linear-gradient(90deg,#4d4d4d 0%,#a8ff16 100%) 0% 0%/200% 100% no-repeat",
                  }}
                />
                {[16, 50, 84].map((p) => (
                  <span
                    key={p}
                    className="pointer-events-none absolute inset-y-0 z-[1] w-px bg-[#3a3a3a]"
                    style={{ left: `${p}%`, transform: "translateX(-50%)" }}
                  />
                ))}
              </div>
              <input
                aria-label="AI settings"
                type="range"
                min={0}
                max={100}
                step={1}
                value={slider}
                onChange={(e) => setSlider(Number(e.target.value))}
                className="pv-slider relative z-10 w-full"
                style={{ "--thumb-color": ACC[mode].hex, "--thumb-glow": `rgba(${ACC[mode].rgb},.5)` } as React.CSSProperties}
              />
            </div>
            <div className="-mt-1 flex items-center justify-between px-1">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#666666]">Conservative</span>
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#666666]">Maximum</span>
            </div>
          </div>

          <div className="mb-2.5 flex h-4 items-center justify-center gap-2">
            <svg className="pv-hand h-3.5 w-3.5 text-[#a8ff16]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
            <p className="text-center text-[13px] font-semibold text-[#a8ff16]">Slide to adjust</p>
          </div>

          <button
            onClick={startTrading}
            className="mc-cta flex w-full items-center justify-center gap-2 rounded-[18px] px-6 py-3.5 text-[16px] font-bold"
          >
            START TRADING
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          </div>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- sessão ao vivo ---------- */
  const settled = ops.filter((o) => o.status !== "running").length;
  const up = profit >= 0;

  return (
    <main className="mc-shell relative flex min-h-[100svh] flex-col overflow-hidden">
      <div className="mc-glow" />

      <div className="relative z-10 mx-auto flex w-full max-w-[380px] flex-1 flex-col px-4 pb-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a8ff16]/30 bg-[#a8ff16]/10 px-2.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a8ff16] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#a8ff16]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a8ff16]">Live</span>
          </span>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#1b1b1d] text-white">
              <StockGlyph ticker="AAPL" size={15} />
            </span>
            <div className="text-right leading-tight">
              <p className="text-[12px] font-bold leading-none text-white">Apple Inc.</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#666666]">AAPL · NASDAQ</p>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-1.5">
          {MAKERS.map((m) => (
            <div key={m.n} className="rounded-[14px] border border-[#303030] bg-[#111111] px-1 py-1.5 text-center">
              <p className="text-[9.5px] font-bold leading-none text-white">{m.n}</p>
              <p className="mt-0.5 text-[8px] leading-none text-[#666666]">{m.o}</p>
            </div>
          ))}
        </div>

        <div
          className={`mb-4 rounded-[20px] border p-4 ${
            up ? "border-[#a8ff16]/25 bg-[#151b0d]" : "border-[#303030] bg-[#1b1b1d]"
          }`}
        >
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#888888]">Current balance</p>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${up ? "text-[#a8ff16]" : "text-[#888888]"}`}>
              {up ? "↑ +" : "↓ "}
              {money(Math.abs(profit))}
            </span>
          </div>
          <p className="tabular text-[38px] font-bold leading-none text-white">{money(balance)}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#a8ff16]/25 bg-[#a8ff16]/10 px-2.5 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 7-8.5 8.5-5-5L2 17" />
              <path d="M16 7h6v6" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#a8ff16]">Active profit</span>
          </span>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2.2" strokeLinecap="round">
              <path d="M3 3v18h18M8 17v-3M13 17V5M18 17V9" />
            </svg>
            Completed trades
          </p>
          <span className="tabular text-[11px] text-[#666666]">
            {settled} / {total}
          </span>
        </div>

        <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto">
          {ops.map((o) => {
            const win = o.status === "win";
            return (
              <div
                key={o.id}
                className="mc-pop flex items-center justify-between rounded-[16px] border px-3 py-2.5"
                style={{
                  background: o.status === "running" ? "#151b0d" : win ? "rgba(168,255,22,.07)" : "rgba(255,107,107,.07)",
                  borderColor:
                    o.status === "running"
                      ? "rgba(168,255,22,.35)"
                      : win
                        ? "rgba(168,255,22,.22)"
                        : "rgba(255,107,107,.22)",
                }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] text-white"
                    style={{
                      background:
                        o.status === "running"
                          ? "#1b1b1d"
                          : win
                            ? "linear-gradient(140deg,#a8ff16,#7ec600)"
                            : "linear-gradient(140deg,#ff6b6b,#c93b3b)",
                    }}
                  >
                    {o.status === "running" ? (
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2.6" strokeLinecap="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={win ? "#090909" : "#fff"} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        {win ? <path d="M20 6 9 17l-5-5" /> : <path d="m6 9 6-6 6 6M12 3v18" />}
                      </svg>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-semibold leading-tight text-white">
                      Apple Inc. <span className="font-normal text-[#666666]">· AAPL</span>
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#666666]">
                      {o.status === "running" ? "AI running technical analysis…" : `Trade #${o.id + 1}`}
                    </p>
                  </div>
                </div>
                <span
                  className="tabular text-[15px] font-bold"
                  style={{ color: o.status === "running" ? "#888888" : win ? "#a8ff16" : "#ff6b6b" }}
                >
                  {o.status === "running"
                    ? "…"
                    : `${o.profit > 0 ? "+" : "-"}$${Math.abs(o.profit).toFixed(2)}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {stage === "popup" && (
        <div className="mc-fade fixed inset-0 z-[9999] flex items-center justify-center bg-[#090909]/85 px-4">
          <div className="pv11-pop relative w-full max-w-sm overflow-hidden rounded-[28px] border border-[#303030] bg-[#111111] p-7">
            <div className="pointer-events-none absolute -top-10 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,255,22,.2),transparent_70%)]" />

            <div className="relative text-center">
              <div className="relative mx-auto mb-5 h-[72px] w-[72px]">
                <span className="absolute inset-0 rounded-full shadow-[0_0_28px_8px_rgba(168,255,22,.4)]" />
                <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#a8ff16]">
                  <span className="text-[32px] font-bold leading-none text-[#090909]">$</span>
                </span>
              </div>

              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#a8ff16]">Profit confirmed</p>
              <h2 className="tabular mb-4 text-[38px] font-bold leading-none text-white">
                +{money(profit)}
              </h2>

              <span className="inline-flex items-center gap-2 rounded-full bg-[#1b1b1d] px-4 py-2">
                <span className="text-[13px] text-[#888888]">{money(start)}</span>
                <span className="text-[#a8ff16]">→</span>
                <span className="text-[13px] font-semibold text-white">{money(balance)}</span>
                <span className="text-[11px] text-[#666666]">in 60s</span>
              </span>

              <div className="mb-6 mt-6 rounded-[20px] border border-[#a8ff16]/30 bg-[#151b0d] p-4">
                <p className="mb-1 text-[15px] font-bold text-white">TO WITHDRAW YOUR BALANCE:</p>
                <p className="text-[13px] leading-snug text-[#a8ff16]">
                  Activate your account by watching the 4-minute video.
                </p>
              </div>

              <button
                onClick={activate}
                disabled={contacting}
                className="mc-cta flex w-full items-center justify-center gap-2.5 rounded-[18px] py-3.5 text-[15px] font-bold disabled:opacity-85"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m10 8 6 4-6 4V8z" />
                </svg>
                ACTIVATE ACCOUNT
              </button>

              <p className="mt-3.5 text-[11px] text-[#666666]">4 minutes • Unlock withdrawals</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { money, writeState } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";
import { SyncScan, StockGrid } from "@/components/sync-scan";
import { StockGlyph } from "@/components/stock-glyph";
import type { StockKey } from "@/components/stock-glyph";

type Stage = "sync" | "choose" | "trading" | "popup";
type Op = { id: number; profit: number; status: "running" | "win" };

const START_BALANCE = 50;
const TOTAL_TRADES = 5;

/** Série fixa: o consolidado é sempre o mesmo, como no original. */
const PROFITS = [12.09, 11.66, 12.36, 9.84, 14.49];

const MODES = [
  { id: "low", label: "CONSERVATIVE", badge: "Conservative Mode", risk: "Minimum", mult: 0.55 },
  { id: "conservative", label: "CONSERVATIVE", badge: "Recommended Mode", risk: "Low", mult: 1 },
  { id: "maximum", label: "MAXIMUM", badge: "Maximum Mode", risk: "Moderate", mult: 1.9 },
];

/** Intensidade do risco: cinza (mínimo) → verde neon (recomendado) → neon claro. */
const ACC = [
  { rgb: "136, 136, 136", hex: "#888888", risk: "Minimum" },
  { rgb: "168, 255, 22", hex: "#a8ff16", risk: "Low" },
  { rgb: "216, 255, 138", hex: "#d8ff8a", risk: "Moderate" },
];

const bandOf = (v: number) => (v < 34 ? 0 : v < 67 ? 1 : 2);

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

export default function TradingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("sync");
  const [slider, setSlider] = useState(50);
  const [balance, setBalance] = useState(START_BALANCE);
  const [ops, setOps] = useState<Op[]>([]);
  const [idx, setIdx] = useState(0);
  const [contacting, setContacting] = useState(false);
  const done = useRef(false);

  const mode = bandOf(slider);
  const level = 3 + (slider / 100) * 24;
  const profitPreview = (START_BALANCE * MODES[mode].mult * 1.03).toFixed(2);
  const profit = balance - START_BALANCE;

  // estado 1 — sincronismo com a "malha" de ativos
  useEffect(() => {
    if (stage !== "sync") return;
    const t = setTimeout(() => setStage("choose"), 4200);
    return () => clearTimeout(t);
  }, [stage]);

  // estado 3 — a sessão roda sozinha, um trade por vez
  useEffect(() => {
    if (stage !== "trading") return;
    if (idx >= TOTAL_TRADES) return;
    const t = setTimeout(() => {
      setOps((prev) => [{ id: idx, profit: PROFITS[idx] * MODES[mode].mult, status: "running" }, ...prev]);
      setTimeout(() => {
        setOps((prev) => prev.map((o) => (o.id === idx ? { ...o, status: "win" } : o)));
        setBalance((b) => b + PROFITS[idx] * MODES[mode].mult);
        setIdx((i) => i + 1);
      }, 1500);
    }, 1400);
    return () => clearTimeout(t);
  }, [stage, idx, mode]);

  useEffect(() => {
    if (idx < TOTAL_TRADES || stage !== "trading" || done.current) return;
    done.current = true;
    const t = setTimeout(() => setStage("popup"), 1100);
    return () => clearTimeout(t);
  }, [idx, stage]);

  const start = () => {
    setBalance(START_BALANCE);
    setOps([]);
    setIdx(0);
    done.current = false;
    writeState({ balance: START_BALANCE, plan: MODES[mode].id });
    track("sim_start", { mode: MODES[mode].id, ...trackingParams() });
    setStage("trading");
  };

  const verify = useCallback(() => {
    if (contacting) return;
    setContacting(true);
    writeState({ balance });
    track("sim_verify_click", { balance: Number(balance.toFixed(2)), ...trackingParams() });
    setTimeout(() => router.push("/pv13/withdraw"), 1900);
  }, [balance, contacting, router]);

  if (stage === "sync" || stage === "choose") {
    return (
      <main className="mc-shell relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="mc-glow" />
        <div className="relative z-10 mx-auto flex w-full max-w-[380px] flex-1 flex-col items-center px-5 pb-8 pt-4">
          {stage === "sync" ? (
            <>
              <div className="flex w-full flex-1 flex-col items-center justify-center">
                <SyncScan compact />
              </div>
              <p className="mt-4 text-center text-[13px] text-[#888888]">
                Scanning for high-probability opportunities
                <span className="ml-0.5 animate-pulse">…</span>
              </p>
            </>
          ) : (
            <div className="mc-pop w-full text-center">
              <div className="mb-4 flex w-full items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a8ff16]/30 bg-[#a8ff16]/10 px-2.5 py-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a8ff16] opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#a8ff16]" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#a8ff16]">
                    AI in sync · 500 stocks
                  </span>
                </span>
                <div className="text-right leading-none">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[#666666]">Balance</p>
                  <p className="tabular mt-0.5 text-[13px] font-bold text-white">$50.00</p>
                </div>
              </div>

              <StockGrid dense className="mb-3.5 max-w-none" />

              <div className="mb-3 text-center">
                <h1 className="text-[19px] font-bold leading-tight tracking-tight text-white">
                  How much do you want to make?
                </h1>
                <p className="mt-1 text-[12px] text-[#888888]">Move the slider to pick your mode</p>
              </div>

              <div
                className="relative mb-4 overflow-hidden rounded-[22px] border p-3 transition-colors duration-300"
                style={{
                  background: "#111111",
                  borderColor: `rgba(${ACC[mode].rgb},.32)`,
                }}
              >
                <div className="text-center">
                  <span
                    className="inline-block rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{
                      background: `rgba(${ACC[mode].rgb},.15)`,
                      color: ACC[mode].hex,
                      borderColor: `rgba(${ACC[mode].rgb},.35)`,
                    }}
                  >
                    {MODES[mode].badge}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-xl font-semibold text-[#888888]">$</span>
                      <span className="tabular text-4xl font-bold text-white">{profitPreview}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#888888]">Estimated profit at start</p>
                  </div>

                  <div className="mr-2 flex shrink-0 flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#888888]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ACC[mode].hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
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
                          background: `linear-gradient(to top, rgba(${ACC[mode].rgb},.6), rgb(${ACC[mode].rgb}))`,
                          boxShadow: `rgba(${ACC[mode].rgb},.65) 0 0 14px, inset 0 1px 0 rgba(255,255,255,.3)`,
                        }}
                      />
                    </div>
                    <span className="text-[12px] font-bold uppercase tracking-wider transition-colors duration-300" style={{ color: ACC[mode].hex }}>
                      {ACC[mode].risk}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
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
                      <span key={p} className="pointer-events-none absolute inset-y-0 z-[1] w-px bg-[#3a3a3a]" style={{ left: `${p}%`, transform: "translateX(-50%)" }} />
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
                    style={{ "--thumb-color": ACC[mode].hex, "--thumb-glow": `rgba(${ACC[mode].rgb},.55)` } as React.CSSProperties}
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
                <p className="text-center text-[12px] font-semibold text-[#a8ff16]">Slide to adjust</p>
              </div>

              <button
                onClick={start}
                className="mc-cta flex w-full items-center justify-center gap-2 rounded-[18px] px-6 py-3 text-[16px] font-bold"
              >
                START TRADING
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  const won = ops.filter((o) => o.status === "win").length;
  const upper = profit >= 0;

  return (
    <main className="mc-shell relative flex min-h-[100svh] flex-col overflow-hidden">
      <div className="mc-glow" />
      <div className="relative z-10 mx-auto flex w-full max-w-[380px] flex-1 flex-col px-5 pb-6 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a8ff16]/30 bg-[#a8ff16]/10 px-2.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a8ff16] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#a8ff16]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a8ff16]">Live</span>
          </span>
          <span className="tabular text-[10.5px] font-semibold text-[#666666]">
            {won} / {TOTAL_TRADES}
          </span>
        </div>

        {/* ativo em foco */}
        <div className="mb-3 flex items-center gap-2.5 rounded-[20px] border border-[#303030] bg-[#111111] px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-[#1b1b1d] text-white">
            <StockGlyph ticker="AAPL" size={17} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight text-white">Apple Inc.</p>
            <p className="text-[10px] uppercase tracking-wider text-[#666666]">AAPL · NASDAQ</p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-1.5">
          {[
            { n: "GPT", o: "OpenAI" },
            { n: "GEMINI", o: "Google" },
            { n: "COPILOT", o: "Microsoft" },
          ].map((m) => (
            <div key={m.n} className="rounded-[14px] border border-[#303030] bg-[#111111] px-1 py-1.5 text-center">
              <p className="text-[9.5px] font-bold leading-none text-white">{m.n}</p>
              <p className="mt-0.5 text-[8px] leading-none text-[#666666]">{m.o}</p>
            </div>
          ))}
        </div>

        {/* saldo corrente */}
        <div
          className={`mb-3 rounded-[20px] border p-4 ${upper ? "border-[#a8ff16]/30 bg-[#151b0d]" : "border-[#ff6b6b]/25 bg-[#1a1010]"}`}
        >
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#888888]">Current balance</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${upper ? "bg-[#a8ff16]/15 text-[#a8ff16]" : "bg-[#ff6b6b]/15 text-[#ff6b6b]"}`}
            >
              {upper ? "Active profit" : "Active loss"}
            </span>
          </div>
          <p className={`tabular text-[11px] font-bold ${upper ? "text-[#a8ff16]" : "text-[#ff6b6b]"}`}>
            {upper ? "↑ +" : "↓ "}
            {money(Math.abs(profit)).replace("$", "$")}
          </p>
          <p className="tabular text-[38px] font-bold leading-none text-white">
            {money(balance).replace("$", "$")}
          </p>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-white">Apple Inc. · AAPL</p>
          <p className="tabular text-[10px] text-[#666666]">
            Completed trades {won} / {TOTAL_TRADES}
          </p>
        </div>

        <div className="no-scrollbar flex-1 space-y-1.5 overflow-y-auto">
          {ops.map((o) => (
            <div
              key={o.id}
              className={`relative flex items-center justify-between overflow-hidden rounded-[16px] border px-3 py-2.5 ${
                o.status === "running"
                  ? "border-[#a8ff16]/35 bg-[#151b0d]"
                  : "border-[#303030] bg-[#111111]"
              }`}
            >
              <div className="min-w-0">
                <p className="text-[11px] font-semibold leading-tight text-white">
                  {o.status === "running" ? "AI running technical analysis…" : `TRADE #${o.id + 1}`}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-[#666666]">
                  {o.status === "running" ? "In execution" : "Confirmed"}
                </p>
              </div>
              <span className={`tabular text-[13px] font-bold ${o.status === "running" ? "text-[#888888]" : "text-[#a8ff16]"}`}>
                {o.status === "running" ? "…" : `+${o.profit.toFixed(2)}`}
              </span>
              {o.status === "running" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-[#1b1b1d]">
                  <span className="trinity-bar block h-full w-1/3 bg-gradient-to-r from-transparent via-[#a8ff16] to-transparent" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {stage === "popup" && (
        <div className="mc-fade fixed inset-0 z-[9999] flex items-center justify-center bg-[#090909]/90 px-4">
          <div className="mc-pop relative w-full max-w-sm overflow-hidden rounded-[28px] border border-[#303030] bg-[#111111] p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4 h-[74px] w-[74px]">
                <span className="absolute inset-0 rounded-full bg-[#a8ff16]/25 blur-md" />
                <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#a8ff16]">
                  <span className="tabular text-[26px] font-bold leading-none text-[#090909]">
                    {Math.round(balance)}
                  </span>
                </span>
              </div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a8ff16]">
                Withdrawal requested
              </p>
              <p className="tabular mb-3 text-[38px] font-bold leading-none text-white">{money(balance)}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1b1b1d] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a8ff16]" />
                <span className="text-[11px] text-[#888888]">Pending verification</span>
              </span>
            </div>

            <div className="mb-4 mt-5 rounded-[20px] border border-[#303030] bg-[#111111] p-4 text-left">
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a8ff16]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </svg>
                Withdrawal on hold
              </p>
              <p className="mb-1 text-[14px] font-bold leading-snug text-white">
                Your request was received, but it could not be released
              </p>
              <p className="text-[11.5px] leading-snug text-[#888888]">
                Your account is still in demonstration mode. Demonstration accounts can trade, but withdrawals
                stay locked until the account holder completes verification.
              </p>
            </div>

            <div className="mb-4 rounded-[20px] border border-[#a8ff16]/25 bg-[#111111] p-4 text-left">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                To withdraw your balance:
              </p>
              <p className="text-[12.5px] leading-snug text-[#cccccc]">
                Request the transfer to your account below.
              </p>
            </div>

            <button
              onClick={verify}
              disabled={contacting}
              className="mc-cta flex w-full items-center justify-center gap-2 rounded-[20px] py-3.5 text-[15px] font-bold disabled:opacity-85"
            >
              {contacting ? (
                <>
                  <svg className="animate-spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Contacting the payments network…
                </>
              ) : (
                "CONTINUE VERIFICATION"
              )}
            </button>
            <p className="mt-3 text-center text-[11px] text-[#666666]">
              Balance available now • Opened just now
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

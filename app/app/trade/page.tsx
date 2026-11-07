"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { StockGlyph } from "@/components/stock-glyph";
import type { StockKey } from "@/components/stock-glyph";
import { ENGINES, STOCKS, cue, newSignal, pocketUrl } from "@/lib/member";
import type { Signal } from "@/lib/member";
import { useSession } from "@/lib/session-store";

type Phase = "idle" | "scanning" | "signal";

/** Duração da varredura, compartilhada com as animações via `--scan`. */
const SCAN_MS = 3600;

/** Cor de marca usada no halo de cada selo. */
const TINT: Record<string, string> = {
  META: "0,129,251",
  AAPL: "133,133,133",
  MSFT: "0,164,239",
  BABA: "255,106,0",
  AMZN: "255,153,0",
  NFLX: "229,9,20",
  TSLA: "204,0,0",
  V: "26,31,113",
  INTC: "0,104,181",
};

function EngineGlyph({ glyph }: { glyph: string }) {
  if (glyph === "openai") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        {[0, 60, 120].map((d) => (
          <rect key={d} x="7.4" y="2.6" width="9.2" height="18.8" rx="4.6" transform={`rotate(${d} 12 12)`} />
        ))}
      </svg>
    );
  }
  if (glyph === "google") {
    return (
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36a12 12 0 1 1 0-24c3 0 5.8 1.2 7.9 3l5.7-5.6A20 20 0 1 0 44 24c0-1.3-.1-2.6-.4-3.9z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.2 7.9 3l5.7-5.6A20 20 0 0 0 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
        <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 23 23" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="10" height="10" />
      <rect x="12" y="1" width="10" height="10" />
      <rect x="1" y="12" width="10" height="10" />
      <rect x="12" y="12" width="10" height="10" />
    </svg>
  );
}

function CountUp({ to }: { to: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    let start: number | null = null;
    const step = (now: number) => {
      start = start ?? now;
      const progress = Math.min(1, (now - start) / 620);
      setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [to]);
  return <>{value}</>;
}

export default function Trade() {
  const { member } = useSession();
  const [phase, setPhase] = useState<Phase>("idle");
  const [signal, setSignal] = useState<Signal | null>(null);
  const [assets, setAssets] = useState(500);
  const [left, setLeft] = useState(60);
  const [cursor, setCursor] = useState(0);
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    if (phase !== "idle") return;
    const id = window.setInterval(() => setCursor((i) => (i + 1) % STOCKS.length), 900);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "signal") return;
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const generate = () => {
    if (phase !== "idle") return;
    setPhase("scanning");
    setSignal(null);
    setLeft(60);
    setAssets(480 + Math.floor(Math.random() * 260));
    setCursor(0);
    setRun((r) => r + 1);
    cue("scan");

    // percorre os ativos um a um, como uma varredura real
    STOCKS.forEach((_, i) => {
      if (i === 0) return;
      timers.current.push(
        window.setTimeout(() => {
          setCursor(i % STOCKS.length);
          cue("tap");
        }, Math.round((SCAN_MS / STOCKS.length) * i)),
      );
    });

    timers.current.push(
      window.setTimeout(() => {
        const found = newSignal();
        setCursor(Math.max(0, STOCKS.findIndex((s) => s.ticker === found.ticker)));
        setSignal(found);
        setActive(Math.floor(Math.random() * 3));
        setPhase("signal");
        cue("win");
      }, SCAN_MS),
    );
  };

  const reset = useCallback(() => {
    setPhase("idle");
  }, []);

  const scanning = phase === "scanning";
  const sell = signal?.direction === "SELL";
  /** Sinal já entregue e modal fechado: mantém a marcação do ativo. */
  const kept = phase === "idle" && signal !== null;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-4" style={{ "--scan": `${SCAN_MS}ms` } as CSSProperties}>
      <div className="ma-card ma-in px-4 pb-4 pt-3">
        <div className="mb-3 flex justify-center">
          <span className="ma-badge">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a8ff16] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a8ff16]" />
            </span>
            AI active
          </span>
        </div>

        {/* três motores conectados */}
        <div className="relative flex items-start justify-between px-2">
          <span className="absolute left-[16%] right-[16%] top-[26px] h-[2px] rounded-full bg-[#303030]" />
          <span
            className={`absolute left-[16%] right-[16%] top-[26px] h-[2px] rounded-full bg-[linear-gradient(90deg,transparent,#a8ff16,transparent)] ${
              scanning ? "ma-stream" : "opacity-0"
            }`}
          />
          {ENGINES.map((engine, i) => {
            const lit = scanning || ((phase === "signal" || kept) && i === active);
            return (
              <div key={engine.name} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                <span className={lit ? "relative" : "contents"}>
                  {lit && (
                    <>
                      <span className="ma-ring absolute -inset-[5px] rounded-full border border-[#a8ff16]/60" />
                      <span className="ma-ring ma-ring-late absolute -inset-[5px] rounded-full border border-[#a8ff16]/30" />
                    </>
                  )}
                  <span
                    className="relative flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full text-white"
                    style={{
                      background:
                        i === 1
                          ? "linear-gradient(160deg,#ffffff,#e8e8e8)"
                          : i === 0
                            ? "linear-gradient(160deg,#1abf93,#10a37f 55%,#0b7a5e)"
                            : "linear-gradient(160deg,#36bef6,#04adf4 55%,#0288c2)",
                      boxShadow: "0 0 0 2px #090909, 0 6px 16px -6px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.3)",
                      filter: lit ? "saturate(1.25) brightness(1.08)" : undefined,
                      transform: lit ? "translateY(-2px) scale(1.04)" : undefined,
                      transition: "transform .25s ease, filter .25s ease",
                    }}
                  >
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,.42),transparent_55%)]" />
                    <span className={`relative ${i === 1 ? "text-[#090909]" : "text-white"}`}>
                      <EngineGlyph glyph={engine.glyph} />
                    </span>
                  </span>
                </span>
                <span className="text-center">
                  <span className="block text-[11.5px] font-bold leading-tight text-white">{engine.name}</span>
                  <span className="block text-[9.5px] leading-tight text-[#666666]">{engine.vendor}</span>
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#666666]">
          {scanning ? (
            <span className="text-[#a8ff16]">{`Scanning · ${assets} assets`}</span>
          ) : kept ? (
            <span className="text-[#a8ff16]">{`Last signal · ${signal?.ticker} ${signal?.direction}`}</span>
          ) : (
            "Engines in sync · ready"
          )}
        </p>

        {/* progresso real da varredura */}
        <div className={`mt-2 h-[3px] overflow-hidden rounded-full bg-[#1b1b1d] transition-opacity ${scanning ? "opacity-100" : "opacity-0"}`}>
          {scanning && (
            <div key={run} className="ma-progress h-full rounded-full bg-[linear-gradient(90deg,#6fbf00,#a8ff16)]" />
          )}
        </div>
      </div>

      <div className={`ma-in relative mt-4 grid grid-cols-3 gap-2.5 ${scanning ? "ma-grid-busy" : ""}`}>
        {scanning && <span key={`sweep-${run}`} className="ma-sweep pointer-events-none absolute inset-0 z-20" />}
        {STOCKS.map((stock, i) => {
          const on = scanning && i === cursor % STOCKS.length;
          const locked = phase !== "scanning" && signal?.ticker === stock.ticker;
          const tint = TINT[stock.ticker];
          return (
            <div
              key={stock.ticker}
              role={locked ? "button" : undefined}
              tabIndex={locked ? 0 : undefined}
              onClick={locked ? () => setPhase("signal") : undefined}
              onKeyDown={locked ? (e) => e.key === "Enter" && setPhase("signal") : undefined}
              className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border p-3 transition-all ${
                on
                  ? "ma-tile-on ma-tile-hit"
                  : locked
                    ? "ma-tile-on ma-tile-lock cursor-pointer"
                    : scanning
                      ? "ma-tile-idle"
                      : "border-[#303030] bg-[#111111]"
              }`}
              style={{ "--tint": tint } as CSSProperties}
            >
              {!locked && (
                <span
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{ background: `radial-gradient(circle at 50% -10%, rgba(${tint},.28), transparent 62%)` }}
                />
              )}
              {on && <span className="ma-hit-ring pointer-events-none absolute inset-0 z-10" />}
              <span className="relative z-10 mb-1.5 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#303030] bg-[#1b1b1d] text-white">
                <StockGlyph ticker={stock.ticker as StockKey} size={21} />
              </span>
              <span className={`relative z-10 text-[11.5px] font-bold ${on || locked ? "text-[#a8ff16]" : "text-white"}`}>
                {stock.ticker}
              </span>
              <span className="relative z-10 text-[9px] text-[#666666]">{stock.name}</span>
              {locked && (
                <span className="ma-tile-flag absolute right-1.5 top-1.5 z-10 rounded-full bg-[#a8ff16] px-1.5 py-[1px] text-[7.5px] font-black leading-tight tracking-[0.08em] text-[#090909]">
                  HIT
                </span>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={phase !== "idle"}
        aria-busy={scanning}
        className={`mc-cta mt-4 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-[16px] py-4 text-[15px] font-bold disabled:opacity-70 ${
          scanning ? "mc-cta-busy" : ""
        }`}
      >
        {scanning ? (
          <>
            <svg className="ma-spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.2-8.5" />
            </svg>
            Scanning market…
            <span className="ma-dots" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </>
        ) : (
          <>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.8-.5 5-2c.7-.9.7-2.2-.1-3s-2.1-.8-2.9 0z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 21.6 2.4 12.9 12.9 0 0 1 15.9 12 22 22 0 0 1 12 15z" />
            </svg>
            {phase === "signal" ? "Generate another signal" : "Generate signal with AI"}
          </>
        )}
      </button>

      <Link
        href="/app/inicio"
        className="mt-3 block text-center text-[11.5px] text-[#888888] underline decoration-[#303030] underline-offset-4"
      >
        Need help? Review Lesson 03 →
      </Link>

      {phase === "signal" && signal && (
        <div className="ma-overlay fixed inset-0 z-[190] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="ma-modal-in ma-card relative w-full max-w-sm overflow-hidden">
            <div className="relative p-4 pb-3">
              <button
                type="button"
                onClick={reset}
                aria-label="Close signal"
                className="absolute right-3.5 top-3.5 text-[#666666] transition-colors hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#303030] bg-[#1b1b1d] text-white">
                  <StockGlyph ticker={signal.ticker as StockKey} size={24} />
                </span>
                <div>
                  <h2 className="text-[15px] font-bold text-white">{signal.name}</h2>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#666666]">{signal.ticker} · OTC</p>
                </div>
              </div>
            </div>

            <div className="ma-hairline mx-4" />

            <div
              className="relative flex flex-col items-center px-6 py-6"
              style={{
                background: sell
                  ? "radial-gradient(70% 80%, rgba(255,107,107,.16), transparent 70%)"
                  : "radial-gradient(70% 80%, rgba(168,255,22,.16), transparent 70%)",
              }}
            >
              <span className="relative mb-3 flex h-14 w-14 items-center justify-center">
                <span className={`ma-flash pointer-events-none absolute -inset-6 rounded-full ${sell ? "ma-flash-sell" : ""}`} />
                <span
                  className={`ma-pop relative flex h-14 w-14 items-center justify-center rounded-2xl ${
                    sell
                      ? "bg-[linear-gradient(160deg,#ff8f8f,#ff6b6b_55%,#c81f1f)] shadow-[0_12px_30px_-8px_rgba(255,107,107,.7)]"
                      : "bg-[linear-gradient(160deg,#c6ff6b,#a8ff16_55%,#6fbf00)] shadow-[0_12px_30px_-8px_rgba(168,255,22,.7)]"
                  } text-[#090909]`}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    {sell ? <path d="M12 19V5M5 12l7 7 7-7" /> : <path d="M12 5v14M19 12l-7-7-7 7" />}
                  </svg>
                </span>
              </span>
              <p className={`ma-title-in text-[42px] font-black leading-none tracking-tight ${sell ? "text-[#ff6b6b]" : "text-[#a8ff16]"}`}>
                {signal.direction}
              </p>
              <p className="ma-line-in mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#888888]">
                {signal.timeframe}
              </p>

              <div className="mt-4 grid w-full grid-cols-3 gap-2">
                {[
                  { v: signal.confidence, l: "Confidence", d: 0 },
                  { v: signal.score, l: "Score", d: 90 },
                  { v: signal.strength, l: "Strength", d: 180 },
                ].map((m) => (
                  <div
                    key={m.l}
                    className="ma-metric-in rounded-xl border border-[#303030] bg-[#0d0d0d] py-2 text-center"
                    style={{ animationDelay: `${m.d}ms` }}
                  >
                    <p className="tabular text-[15px] font-bold leading-none text-white">
                      <CountUp to={m.v} />%
                    </p>
                    <p className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#666666]">{m.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="ma-hairline mx-4" />

            <div className="p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#888888]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Entry window
                </span>
                <span className="tabular text-[15px] font-bold text-white">
                  00:{String(left).padStart(2, "0")}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#1b1b1d]">
                <div
                  className="ma-bar h-full rounded-full bg-[linear-gradient(90deg,#a8ff16,#6fbf00)] transition-all duration-1000 ease-linear"
                  style={{ width: `${(left / 60) * 100}%` }}
                />
              </div>

              <a
                href={pocketUrl(member?.email)}
                target="_blank"
                rel="noreferrer"
                className="mc-cta mt-3.5 flex w-full items-center justify-center gap-2 rounded-[16px] py-3.5 text-[14.5px] font-bold"
              >
                Open in Pocket
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                </svg>
              </a>
              <button
                type="button"
                onClick={reset}
                className="mt-2 w-full py-1 text-center text-[11.5px] text-[#666666] underline decoration-[#303030] underline-offset-4"
              >
                Back to the grid
              </button>            </div>
          </div>
        </div>
      )}
    </div>
  );
}

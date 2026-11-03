"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { money, writeState } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

type Stage = "choose" | "trading" | "popup";
type Op = { id: number; label: string; profit: number; status: "running" | "win" };

const START_BALANCE = 50;

const MODES = [
  { id: "safe", label: "Safe", mult: 0.4, color: "#a1a1aa" },
  { id: "moderate", label: "Moderate", mult: 1, color: "#9a3412" },
  { id: "max", label: "Maximum", mult: 1.9, color: "#991b1b" },
];

const ASSETS = ["BTC/USD", "ETH/USD", "NVDA", "AAPL", "TSLA", "META", "AMZN", "GOOGL", "MSFT", "SOL/USD"];
const PROFITS = [11.66, 12.36, 9.84, 14.2, 10.55, 13.9, 8.42, 16.31, 11.05, 30.28];

export default function TradingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("choose");
  const [mode, setMode] = useState(1);
  const [balance, setBalance] = useState(START_BALANCE);
  const [ops, setOps] = useState<Op[]>([]);
  const [idx, setIdx] = useState(0);
  const done = useRef(false);

  const profit = balance - START_BALANCE;

  useEffect(() => {
    if (stage !== "trading" || done.current) return;
    if (idx >= PROFITS.length) return;
    const t = setTimeout(() => {
      setOps((prev) => [
        ...prev,
        { id: idx, label: ASSETS[idx % ASSETS.length], profit: PROFITS[idx] * MODES[mode].mult, status: "running" },
      ]);
      setTimeout(() => {
        setOps((prev) => prev.map((o) => (o.id === idx ? { ...o, status: "win" } : o)));
        setBalance((b) => b + PROFITS[idx] * MODES[mode].mult);
        setIdx((i) => i + 1);
      }, 1400);
    }, 1500);
    return () => clearTimeout(t);
  }, [stage, idx, mode]);

  useEffect(() => {
    if (idx >= PROFITS.length && stage === "trading") {
      done.current = true;
      const t = setTimeout(() => setStage("popup"), 1200);
      return () => clearTimeout(t);
    }
  }, [idx, stage]);

  const startSession = () => {
    setBalance(START_BALANCE);
    writeState({ balance: START_BALANCE, plan: MODES[mode].id });
    track("sim_start", { mode: MODES[mode].id, ...trackingParams() });
    setStage("trading");
  };

  const requestWithdrawal = () => {
    writeState({ balance });
    track("sim_withdraw_request", { balance: Number(balance.toFixed(2)), ...trackingParams() });
    setStage("popup");
  };

  if (stage === "choose") {
    return (
      <main className="mc-shell relative min-h-[100svh] overflow-hidden flex flex-col">
        <div className="mc-glow" />
        <AppHeader />
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 pb-10 text-center">
          <div className="w-full max-w-[340px] mx-auto">
          <div className="opacity-50 mb-6">
            <p className="text-zinc-500 text-[11px] uppercase tracking-[0.16em] mb-1.5">Step 2 of 3</p>
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-zinc-400 to-red-700" />
            </div>
          </div>
          <h1 className="text-[29px] font-black text-white leading-tight mb-2">How much do you want to make?</h1>
          <p className="text-zinc-400 text-[13px] mb-8">Move the slider to pick your mode.</p>

          <div className="rounded-2xl p-5 border mb-6" style={{ borderColor: `${MODES[mode].color}55`, background: `${MODES[mode].color}14` }}>
            <p className="text-center font-bold text-lg mb-1" style={{ color: MODES[mode].color }}>{MODES[mode].label}</p>
            <p className="text-center text-zinc-400 text-[11px] mb-3">Estimated profit at start</p>
            <p className="text-center text-white font-black text-4xl tabular">+{money(START_BALANCE * MODES[mode].mult * 0.83).replace("$", "")}</p>
          </div>

          <input
            type="range" min={0} max={2} step={1} value={mode}
            onChange={(e) => setMode(Number(e.target.value))}
            className="mc-slider w-full mb-2"
            style={{ background: "linear-gradient(to right, #52525b, #9a3412, #7f1d1d)" }}
          />
          <div className="flex justify-between text-[11px] text-zinc-500 font-semibold uppercase tracking-wider mb-8">
            <span>Safe</span><span>Moderate</span><span>Maximum</span>
          </div>

          <button onClick={startSession} className="mc-cta w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2">
            Start the session
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden flex flex-col">
      <div className="mc-glow" />
      <AppHeader />

      <div className="relative z-10 flex-1 px-5 pb-6 flex flex-col">
        <div className="w-full max-w-[340px] mx-auto flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-950/60 border border-orange-900/70 px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-800 animate-pulse" />
            <span className="text-orange-500 text-[10px] font-bold tracking-wider">AI RUNNING</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-600/30 bg-zinc-500/[.07] px-2 py-1">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-zinc-200 to-zinc-400 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.6" strokeLinecap="round"><path d="M3 17l5-5 4 3 6-7" /></svg>
            </div>
            <span className="text-white text-[10px] font-bold leading-none">AI Engine</span>
            <span className="text-zinc-500 text-[9px] uppercase tracking-wider">running</span>
          </div>
        </div>

        <div className="rounded-2xl px-4 py-3 border border-zinc-500/20 bg-zinc-500/[.07] mb-2.5 text-center">
          <p className="text-zinc-400 text-[10px] uppercase tracking-wider">Session balance</p>
          <div className="flex items-baseline justify-center gap-1.5">
            <p className="text-white font-black text-[30px] leading-none tabular">{money(balance).replace("$", "")}</p>
            <span className="text-red-400 text-sm font-bold tabular">+{profit.toFixed(2)}</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-900/25 border border-red-700/40 px-2 py-0.5">
            <span className="text-red-200 text-[10px] font-semibold uppercase">{ops.filter((o) => o.status === "win").length} wins</span>
          </div>
        </div>

        <p className="text-center text-zinc-400 text-[10px] uppercase tracking-wider mb-2">Activity</p>
        <div className="space-y-1.5 overflow-y-auto no-scrollbar flex-1">
          {ops.map((o) => (
            <div key={o.id} className={`rounded-xl px-3 py-2 border flex items-center justify-between ${o.status === "running" ? "bg-orange-900/20 border-orange-900/60" : "bg-red-900/15 border-red-800/35"}`}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${o.status === "running" ? "bg-orange-950/70" : "bg-red-800/30"}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={o.status === "running" ? "#ea580c" : "#dc2626"} strokeWidth="2" strokeLinecap="round"><path d="M3 17l5-5 4 3 6-7" /></svg>
                </div>
                <div>
                  <p className="text-white text-[12px] font-semibold">{o.label}</p>
                  <p className="text-zinc-500 text-[10px]">{o.status === "running" ? "Analyzing…" : "Profit confirmed"}</p>
                </div>
              </div>
              <span className={`text-sm font-bold tabular ${o.status === "running" ? "text-orange-500" : "text-red-400"}`}>
                {o.status === "running" ? "…" : `+${o.profit.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>

        <button onClick={requestWithdrawal} className="mc-cta w-full py-3.5 rounded-xl font-bold text-[15px] mt-3 flex items-center justify-center gap-2">
          REQUEST MY WITHDRAWAL
        </button>
        </div>
      </div>

      {stage === "popup" && <Popup balance={balance} onContinue={() => router.push("/pv13/vsl")} />}
    </main>
  );
}

function Popup({ balance, onContinue }: { balance: number; onContinue: () => void }) {
  const [state, setState] = useState<"idle" | "submitting">("idle");
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 mc-fade">
      <div className="relative w-full max-w-sm bg-[#141416] rounded-[28px] p-7 border border-zinc-500/25 overflow-hidden mc-pop">
        <div className="relative text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full call-ring bg-red-800/40" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center">
              <span className="text-white text-[30px] font-black tabular">{Math.round(balance)}</span>
            </div>
          </div>
          <p className="text-orange-500 text-xs font-bold tracking-[0.18em] uppercase mb-1">Withdrawal requested</p>
          <p className="text-white font-black text-[34px] leading-none mb-3 tabular">${balance.toFixed(2)}</p>
          <div className="inline-flex items-center gap-2 bg-[#1f1f23] rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-800" />
            <span className="text-zinc-400 text-[11px]">Pending verification</span>
          </div>
          <div className="mt-5 mb-5 bg-[#241310] rounded-2xl p-4 border border-orange-900/70 text-left">
            <p className="flex items-center gap-1.5 text-orange-500 text-[10px] font-bold uppercase tracking-[0.14em] mb-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
              Withdrawal on hold
            </p>
            <p className="text-white font-bold text-sm mb-1">Your request was received, but could not be released</p>
            <p className="text-zinc-400 text-[11px] leading-snug">Your account is in demonstration mode. Withdrawals stay locked until the account holder completes verification.</p>
          </div>
        </div>
        <button
          onClick={() => { setState("submitting"); setTimeout(onContinue, 1400); }}
          disabled={state === "submitting"}
          className="w-full py-4 rounded-2xl font-bold text-base mc-cta flex items-center justify-center gap-2 disabled:opacity-80"
        >
          {state === "submitting" ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              Connecting…
            </>
          ) : "CONTINUE VERIFICATION"}
        </button>
      </div>
    </div>
  );
}

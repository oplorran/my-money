"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  { t: "Connecting to your bank…", s: "Handshake with the payout provider" },
  { t: "Verifying details…", s: "Account holder and routing match" },
  { t: "Processing transfer…", s: "Queued for release" },
  { t: "Transfer cleared", s: "Funds ready to be released" },
];

/** Tela de handshake bancário: o funil não pula direto do CTA para a sessão. */
export function BankLoader({ amount, onDone }: { amount: string; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (step >= STEPS.length) {
      done.current = true;
      const t = window.setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 1150);
    return () => clearTimeout(t);
  }, [step, onDone]);

  const pct = Math.min(100, (step / STEPS.length) * 100);

  return (
    <main className="mc-shell relative min-h-[100svh] flex items-center justify-center px-5">
      <div className="mc-glow" />
      <div className="relative z-10 w-full max-w-[340px] text-center mc-fade">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-orange-900/70 bg-orange-950/60 flex items-center justify-center mc-breathe">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <p className="text-orange-500 text-[10px] font-bold uppercase tracking-[0.18em] mb-2">Encrypted connection to your bank</p>
        <h2 className="flex items-center justify-center gap-2 text-[19px] font-bold leading-tight text-white mb-2">
          <svg className="animate-spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.4" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
          Processing withdrawal…
        </h2>
        <p className="text-[12.5px] leading-snug text-zinc-400 mb-5">
          We are sending <span className="font-semibold text-white">{amount}</span> to your linked account
        </p>

        <div className="space-y-2 text-left mb-5">
          {STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "run" : "idle";
            return (
              <div
                key={s.t}
                className={`flex items-start gap-2.5 rounded-xl border px-3 py-2 transition-colors ${
                  state === "idle" ? "border-zinc-600/20 bg-zinc-500/[.04] opacity-45" : "border-zinc-600/30 bg-zinc-500/[.08]"
                }`}
              >
                <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${state === "done" ? "bg-red-800" : state === "run" ? "bg-orange-900" : "bg-zinc-600/40"}`}>
                  {state === "done" ? (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className={`text-[11.5px] font-semibold leading-tight ${state === "done" ? "text-white" : "text-zinc-300"}`}>{s.t}</p>
                  <p className="text-[10px] text-zinc-500 leading-snug">{s.s}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-red-900 to-orange-700 transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Do not close this window</p>
      </div>
    </main>
  );
}

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
    <main className="mc-shell relative flex min-h-[100svh] items-center justify-center px-5">
      <div className="mc-glow" />
      <div className="mc-fade relative z-10 w-full max-w-[340px] text-center">
        <div className="mc-breathe mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#303030] bg-[#111111]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a8ff16]">Encrypted connection to your bank</p>
        <h2 className="mb-2 flex items-center justify-center gap-2 text-[19px] font-bold leading-tight text-white">
          <svg className="animate-spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2.4" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
          Processing withdrawal…
        </h2>
        <p className="mb-5 text-[12.5px] leading-snug text-[#888888]">
          We are sending <span className="font-semibold text-white">{amount}</span> to your linked account
        </p>

        <div className="mb-5 space-y-2 text-left">
          {STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "run" : "idle";
            return (
              <div
                key={s.t}
                className={`flex items-start gap-2.5 rounded-[16px] border px-3 py-2 transition-colors ${
                  state === "idle" ? "border-[#262626] bg-[#0d0d0d] opacity-45" : "border-[#303030] bg-[#111111]"
                }`}
              >
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${state === "done" ? "bg-[#a8ff16]" : state === "run" ? "border border-[#a8ff16] bg-[#151b0d]" : "bg-[#1b1b1d]"}`}>
                  {state === "done" ? (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#888888]" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className={`text-[11.5px] font-semibold leading-tight ${state === "done" ? "text-white" : "text-[#cccccc]"}`}>{s.t}</p>
                  <p className="text-[10px] leading-snug text-[#666666]">{s.s}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-[#1b1b1d]">
          <div className="h-full rounded-full bg-[#a8ff16] transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#666666]">Do not close this window</p>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { money, readState } from "@/lib/funnel";

const STEPS = ["Connecting to your bank...", "Verifying details...", "Processing transfer..."];

/**
 * Handshake do pv14: mesmo tema escuro/lime do funil.
 * Depois dele a chamada de verificação é montada por cima.
 */
export function Pv14Handshake({ fallback, onDone }: { fallback: number; onDone: () => void }) {
  const [amount] = useState(() => {
    const b = readState().balance;
    return b > fallback ? b : fallback;
  });
  const [method, setMethod] = useState("Bank");
  const [done, setDone] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("m");
    if (q) setMethod(q === "paypal" ? "PayPal" : "Bank");
  }, []);

  useEffect(() => {
    const timers = [900, 1800, 2700].map((ms, i) =>
      window.setTimeout(() => setDone(i + 1), ms),
    );
    const go = window.setTimeout(onDone, 4200);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(go);
    };
  }, [onDone]);

  return (
    <main className="mc-shell relative flex min-h-[100svh] flex-col overflow-hidden">
      <div className="mc-glow" />

      <header className="relative z-10 flex items-center justify-center gap-2 px-4 pb-3 pt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#888888]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Encrypted connection to your bank</span>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-7">
          <div className="absolute inset-0 rounded-full bg-[#a8ff16]/12 blur-2xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#303030] bg-[#111111]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" x2="21" y1="22" y2="22" />
              <line x1="6" x2="6" y1="18" y2="11" />
              <line x1="10" x2="10" y1="18" y2="11" />
              <line x1="14" x2="14" y1="18" y2="11" />
              <line x1="18" x2="18" y1="18" y2="11" />
              <polygon points="12 2 20 7 4 7" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#303030] bg-[#1b1b1d]">
            <svg className="animate-spin text-[#a8ff16]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        </div>

        <h1 className="mb-1 text-[22px] font-bold leading-tight text-white">Processing withdrawal...</h1>
        <p className="mb-8 max-w-xs text-[13px] text-[#888888]">
          We are sending <span className="font-semibold text-white">{money(amount)}</span> to your {method} account
        </p>

        <ul className="w-full max-w-xs space-y-2.5 text-left">
          {STEPS.map((s, i) => {
            const on = i < done;
            return (
              <li key={s} className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                    on ? "bg-[#a8ff16] text-[#090909]" : "bg-[#1b1b1d] text-[#666666]"
                  }`}
                >
                  {on ? (
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M16.7 5.7a1 1 0 0 0-1.4-1.4L8 11.6 4.7 8.3a1 1 0 1 0-1.4 1.4l4 4a1 1 0 0 0 1.4 0l8-8z" />
                    </svg>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#666666]" />
                  )}
                </span>
                <span className={`text-[13px] font-medium ${on ? "text-white" : "text-[#666666]"}`}>{s}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="relative z-10 px-4 pb-6 pt-4 text-center">
        <p className="inline-flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
          Protected by AES-256 encryption
        </p>
      </footer>
    </main>
  );
}

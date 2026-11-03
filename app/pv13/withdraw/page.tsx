"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readState } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";
import { AppHeader } from "@/components/app-header";

const METHODS = [
  { id: "bank", label: "Bank transfer", desc: "Deposits straight into your US bank account", note: "1-2 min", grad: "from-zinc-600 to-zinc-800" },
  { id: "paypal", label: "PayPal", desc: "Receive in your PayPal balance", note: "instant", grad: "from-zinc-500 to-zinc-700" },
  { id: "venmo", label: "Venmo", desc: "Send to your Venmo account", note: "instant", grad: "from-zinc-500 to-zinc-700" },
  { id: "zelle", label: "Zelle", desc: "Arrives in minutes via Zelle", note: "instant", grad: "from-zinc-600 to-zinc-800" },
];

const FEED = [
  { n: "Mike G.", c: "US", v: 123.95, s: "8s ago" },
  { n: "Sarah L.", c: "US", v: 118.42, s: "21s ago" },
  { n: "David R.", c: "US", v: 127.1, s: "34s ago" },
];

export default function WithdrawPage() {
  const router = useRouter();
  // o valor vem do simulador; 125.57 é só o fallback de entrada direta na rota
  const [amount] = useState(() => {
    const b = readState().balance;
    return b > 50 ? b : 125.57;
  });
  const [method, setMethod] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!confirm) {
      setError(true);
      return;
    }
    if (!method) return;
    setLoading(true);
    track("withdraw_request", { amount: Number(amount.toFixed(2)), method, ...trackingParams() });
    setTimeout(() => router.push("/pay/up1"), 1500);
  };

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden">
      <div className="mc-glow" />
      <div className="relative z-10 max-w-md mx-auto px-5 pt-6 pb-8">
        <AppHeader />

        <div className="mx-auto w-full max-w-[340px]">
        <div className="text-center mb-5 mt-4">
          <div className="inline-flex items-center gap-1.5 bg-red-900/25 border border-red-800/50 rounded-full px-3 py-1 mb-3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            <span className="text-red-200 text-[11px] font-semibold tracking-[0.16em] uppercase">Balance verified and ready</span>
          </div>
          <p className="text-zinc-400 text-[12px] font-semibold tracking-[0.14em] uppercase">Available to withdraw</p>
          <p className="mt-1.5 flex items-baseline justify-center gap-1">
            <span className="text-zinc-300 text-[18px] font-semibold mr-1">$</span>
            <span className="text-[40px] leading-none font-bold text-white tabular">{amount.toFixed(2)}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-orange-900/70 bg-orange-950/40 p-3.5 mb-4 flex items-start gap-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          <p className="text-[13px] text-orange-100 leading-snug">The transfer goes to your linked personal account. Your details are encrypted and never stored.</p>
        </div>

        <p className="text-white text-[15px] font-semibold leading-tight text-center">Tap your payout method</p>
        <p className="text-zinc-400 text-[12px] mt-0.5 mb-3 text-center">Choose one of the options below</p>

        <div className="space-y-2.5 mb-5">
          {METHODS.map((m) => {
            const on = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => { setMethod(m.id); setError(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl border text-left transition-colors ${on ? "border-red-700/60 bg-red-900/25" : "border-zinc-500/25 bg-zinc-500/[.07]"}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shrink-0 bg-gradient-to-br ${m.grad}`}>
                  {m.label[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[14px] font-semibold leading-tight">{m.label}</p>
                  <p className="text-zinc-400 text-[11px] leading-snug mt-0.5">{m.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${on ? "border-red-600 bg-red-700" : "border-zinc-500/60"}`}>
                  {on && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={() => { setConfirm(!confirm); setError(false); }} className="w-full flex items-start gap-2.5 mb-2 text-left">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${confirm ? "border-red-600 bg-red-700" : "border-zinc-500/60"}`}>
            {confirm && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
          </div>
          <span className="text-[13px] text-zinc-200">I confirm I am over 18 and that these funds are mine.</span>
        </button>
        {error && (
          <p className="ml-7 text-[12px] text-red-400 flex items-center gap-1.5 mb-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
            You must confirm you are over 18 to continue.
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading || !method}
          className="w-full py-4 rounded-2xl font-bold text-base mt-3 flex items-center justify-center gap-2 disabled:opacity-40 mc-cta"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              Preparing withdrawal…
            </>
          ) : (
            <>Request withdrawal</>
          )}
        </button>
        <p className="text-center text-slate-500 text-[12px] mt-3">Arrives in your account in minutes</p>

        <p className="text-center text-zinc-500 text-[11px] uppercase tracking-wider mt-5 mb-2">Live withdrawals</p>
        <div className="space-y-1.5">
          {FEED.map((f) => (
            <div key={f.n} className="flex items-center justify-between rounded-lg bg-zinc-500/[.07] px-3 py-2">
              <span className="text-[12px] text-zinc-300">{f.n} {f.c === "US" && "🇺🇸"}</span>
              <span className="text-[12px] text-red-400 tabular">${f.v.toFixed(2)}</span>
              <span className="text-[10px] text-zinc-500">{f.s}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-zinc-500 mt-2">+2,847 withdrawals this week</p>
        </div>
      </div>
    </main>
  );
}

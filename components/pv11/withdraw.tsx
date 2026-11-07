"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { money, readState } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

type Phase = "method" | "handshake";

const METHODS = [
  { id: "bank", badge: "BANK", label: "Bank transfer", desc: "Deposits straight into your US bank account" },
  { id: "paypal", badge: "PAY", label: "PayPal", desc: "Receive in your PayPal balance" },
];

const HANDSHAKE = ["Connecting to your bank...", "Verifying details...", "Processing transfer..."];

type Props = {
  fallback: number;
  /** rota de destino depois do handshake */
  next: string;
  /** prefixo dos eventos de telemetria */
  event: string;
};

export function Pv11Withdraw({ fallback, next, event }: Props) {
  const router = useRouter();
  const [amount] = useState(() => {
    const b = readState().balance;
    return b > fallback ? b : fallback;
  });
  const [phase, setPhase] = useState<Phase>("method");
  const [method, setMethod] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [err, setErr] = useState(false);
  const [hsStep, setHsStep] = useState(0);

  const submit = () => {
    if (!confirmed) return setErr(true);
    if (!method) return;
    track(`${event}_withdraw`, { amount, method, ...trackingParams() });
    setPhase("handshake");
    HANDSHAKE.forEach((_, i) => window.setTimeout(() => setHsStep(i + 1), 900 * (i + 1)));
    window.setTimeout(() => router.push(next), 900 * HANDSHAKE.length + 700);
  };

  if (phase === "handshake") {
    return (
      <main className="mc-shell relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5">
        <div className="mc-glow" />
        <div className="mc-fade relative z-10 w-full max-w-[340px] text-center">
          <div className="mc-breathe mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#303030] bg-[#111111]">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
            Encrypted connection to your bank
          </p>
          <h2 className="mb-2 flex items-center justify-center gap-2 text-[19px] font-bold leading-tight text-white">
            <svg className="animate-spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2.4" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Processing withdrawal...
          </h2>
          <p className="mb-5 text-[12.5px] leading-snug text-[#888888]">
            We are sending <span className="font-semibold text-white">{money(amount)}</span> to your account
          </p>
          <div className="mb-5 space-y-2 text-left">
            {HANDSHAKE.map((s, i) => {
              const on = i < hsStep;
              return (
                <div
                  key={s}
                  className={`flex items-center gap-2.5 rounded-[16px] border px-3 py-2 ${
                    on ? "border-[#303030] bg-[#1b1b1d] opacity-100" : "border-[#292929] opacity-40"
                  }`}
                >
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${on ? "bg-[#a8ff16]" : "bg-[#1b1b1d]"}`}>
                    {on ? (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    )}
                  </span>
                  <p className="text-[11.5px] font-medium text-[#cccccc]">{s}</p>
                </div>
              );
            })}
          </div>
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Protected by AES-256 encryption
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden">
      <div className="mc-glow" />
      <div className="relative z-10 mx-auto w-full max-w-[380px] px-5 pb-8 pt-8">
        <div className="mb-5 text-center">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#666666]">AI Program</p>
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#a8ff16]/25 bg-[#a8ff16]/10 px-3 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a8ff16]">
              Balance verified and ready
            </span>
          </span>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#888888]">Available to withdraw</p>
          <p className="tabular mt-1 text-[38px] font-bold leading-none text-white">{money(amount)}</p>
        </div>

        <p className="mb-0.5 text-center text-[14.5px] font-semibold text-white">Tap your payout method</p>
        <p className="mb-3 text-center text-[11.5px] text-[#888888]">Choose one of the 2 available</p>

        <div className="mb-5 grid grid-cols-2 gap-2.5">
          {METHODS.map((m) => {
            const on = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMethod(m.id);
                  setErr(false);
                }}
                className={`relative rounded-[20px] border p-3.5 text-center transition-colors ${
                  on ? "border-[#a8ff16]/45 bg-[#151b0d]" : "border-[#303030] bg-[#111111]"
                }`}
              >
                <span
                  className={`absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    on ? "border-[#a8ff16]" : "border-[#303030]"
                  }`}
                >
                  {on && <span className="h-1.5 w-1.5 rounded-full bg-[#a8ff16]" />}
                </span>
                <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#1b1b1d] text-[11px] font-black text-white">
                  {m.badge}
                </span>
                <p className="text-[12.5px] font-semibold leading-tight text-white">{m.label}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-[#888888]">{m.desc}</p>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setConfirmed((c) => !c);
            setErr(false);
          }}
          className="mb-1 flex w-full items-center gap-3 rounded-[20px] border border-[#303030] bg-[#111111] px-3.5 py-3 text-left"
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
              confirmed ? "border-[#a8ff16] bg-[#a8ff16]" : "border-[#303030]"
            }`}
          >
            {confirmed && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </span>
          <span className="text-[12.5px] leading-snug text-white">
            I confirm I am over 18 years old and that these funds are mine.
          </span>
        </button>
        {err && <p className="ml-1 mt-1.5 text-[11.5px] text-[#a8ff16]">You must confirm you are over 18 to continue.</p>}

        <button
          onClick={submit}
          disabled={!method}
          className="mc-cta mt-3 flex w-full items-center justify-center rounded-[20px] py-3.5 text-[15px] font-bold text-[#090909] disabled:opacity-45"
        >
          WITHDRAW NOW
        </button>
        <p className="mt-3 text-center text-[11.5px] text-[#666666]">Arrives in your account in minutes</p>
      </div>
    </main>
  );
}

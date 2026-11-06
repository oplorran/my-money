"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cleanName } from "@/lib/name";
import { money, readState, writeState } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

type Phase = "method" | "handshake" | "verify";

const METHODS = [
  {
    id: "bank",
    label: "Bank",
    sub: "Bank transfer",
    desc: "Deposits straight into your US bank account",
  },
  {
    id: "paypal",
    label: "Pay",
    sub: "Pal",
    desc: "Receive in your PayPal balance",
  },
];

const HANDSHAKE = ["Connecting to your bank...", "Verifying details...", "Processing transfer..."];

/** Feed de saques "ao vivo" — igual ao bloco de prova social do original. */
const LIVE = [
  { i: "M", n: "Mike G.", f: "🇺🇸", v: 123.95, s: "8s ago" },
  { i: "J", n: "James P.", f: "🇬🇧", v: 125.85, s: "15s ago" },
  { i: "E", n: "Emily R.", f: "🇨🇦", v: 125.57, s: "27s ago" },
];

export default function WithdrawPage() {
  const router = useRouter();
  // o valor vem do simulador; 101.43 é o fallback de entrada direta na rota
  const [amount] = useState(() => {
    const b = readState().balance;
    return b > 50 ? b : 101.43;
  });
  const [phase, setPhase] = useState<Phase>("method");
  const [method, setMethod] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [err, setErr] = useState(false);
  const [hsStep, setHsStep] = useState(0);
  const [name, setName] = useState("");

  const pick = (id: string) => {
    setMethod(id);
    setErr(false);
    track("withdraw_method", { method: id, ...trackingParams() });
  };

  const submit = () => {
    if (!confirmed) {
      setErr(true);
      return;
    }
    if (!method) return;
    track("withdraw_request", { amount: Number(amount.toFixed(2)), method, ...trackingParams() });
    setPhase("handshake");
    HANDSHAKE.forEach((_, i) => window.setTimeout(() => setHsStep(i + 1), 900 * (i + 1)));
    window.setTimeout(() => setPhase("verify"), 900 * HANDSHAKE.length + 700);
  };

  const complete = () => {
    const v = cleanName(name);
    if (v.length < 2) return;
    writeState({ firstName: v });
    track("withdraw_verify", { ...trackingParams() });
    router.push("/pv13/vsl");
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
            We are sending <span className="font-semibold text-white">{money(amount)}</span> to your Bank account
          </p>
          <div className="mb-5 space-y-2 text-left">
            {HANDSHAKE.map((s, i) => {
              const on = i < hsStep;
              return (
                <div
                  key={s}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-opacity ${
                    on ? "border-[#303030] bg-[#151515] opacity-100" : "border-[#262626] opacity-40"
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

  if (phase === "verify") {
    return (
      <main className="mc-shell relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5">
        <div className="mc-glow" />
        <div className="mc-pop relative z-10 w-full max-w-[340px]">
          <div className="mb-4 rounded-[20px] border border-[#a8ff16]/30 bg-[#111111] p-4 text-center">
            <p className="mb-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#a8ff16]">
              Verification pending
            </p>
            <h2 className="text-[17px] font-bold leading-snug text-white">
              Your {money(amount)} withdrawal needs verification
            </h2>
            <p className="mt-1.5 text-[11.5px] leading-snug text-[#888888]">
              Enter your first name to start the identity check and release the funds.
            </p>
          </div>

          <label className="mb-1 block text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#666666]">
            First name
          </label>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && complete()}
              placeholder="First name"
              autoComplete="given-name"
              enterKeyHint="done"
              className="min-w-0 flex-1 rounded-[20px] border border-[#303030] bg-[#111111] px-4 py-3 text-white caret-white outline-none placeholder:text-[#666666] focus:border-[#a8ff16]/45 focus:ring-2 focus:ring-[#a8ff16]/20"
            />
          </div>
          <p className="mt-1 text-[10.5px] text-[#666666]">For your security</p>

          <button
            onClick={complete}
            className="mc-cta mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] py-3.5 text-[15px] font-bold text-[#090909]"
          >
            COMPLETE NOW
          </button>
          <p className="mt-3 text-center text-[11px] text-[#666666]">4 minutes · One-time verification</p>
          <p className="mt-1.5 text-center text-[10.5px] leading-snug text-[#666666]">
            This step confirms your identity and ensures the money only goes to you.
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
          <p className="mb-2 text-[12px] font-semibold text-[#cccccc]">
            Your Cash Club withdrawal is approved
          </p>
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#a8ff16]/25 bg-[#a8ff16]/10 px-3 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a8ff16]">
              Balance verified and ready
            </span>
          </span>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#888888]">
            Available to withdraw
          </p>
          <p className="mt-1 flex items-baseline justify-center">
            <span className="mr-0.5 text-[16px] font-semibold text-[#cccccc]">$</span>
            <span className="tabular text-[38px] font-bold leading-none text-white">{amount.toFixed(2)}</span>
          </p>
        </div>

        <p className="mb-0.5 text-center text-[14.5px] font-semibold text-white">Tap your payout method</p>
        <p className="mb-3 text-center text-[11.5px] text-[#888888]">Choose one of the 2 available</p>

        <div className="mb-5 grid grid-cols-2 gap-2.5">
          {METHODS.map((m) => {
            const on = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => pick(m.id)}
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
                <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#1b1b1d] to-[#111111] text-[12px] font-black leading-none text-white">
                  {m.label}
                </span>
                <p className="text-[12.5px] font-semibold leading-tight text-white">{m.sub}</p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[#888888]">{m.desc}</p>
              </button>
            );
          })}
        </div>

        <p className="mb-4 text-center text-[11px] text-[#666666]">
          {method ? "■ Method selected" : "Select a method to continue"}
        </p>

        {method && (
          <div className="mc-fade mb-4 rounded-[20px] border border-[#303030] bg-[#111111] p-3.5">
            <p className="flex items-start gap-2.5 text-[11.5px] leading-snug text-[#cccccc]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              </svg>
              The transfer goes to your linked personal account. Your details are encrypted and never stored.
            </p>
          </div>
        )}

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
        {err && (
          <p className="ml-1 mt-1.5 flex items-center gap-1.5 text-[11.5px] text-[#a8ff16]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            You must confirm you are over 18 to continue.
          </p>
        )}

        <button
          onClick={submit}
          disabled={!method}
          className="mc-cta mt-3 flex w-full items-center justify-center rounded-[20px] py-3.5 text-[15px] font-bold text-[#090909] disabled:opacity-45"
        >
          WITHDRAW NOW
        </button>
        <p className="mt-3 text-center text-[11.5px] text-[#666666]">Arrives in your account in minutes</p>

        <div className="mt-4 flex items-center justify-between px-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#666666]">Live withdrawals</p>
          <p className="text-[9px] font-semibold text-[#a8ff16]">+2,847 this week</p>
        </div>
        <div className="mt-1.5 space-y-1.5">
          {LIVE.map((l) => (
            <div key={l.n} className="flex items-center gap-2 rounded-[16px] border border-[#303030] bg-[#0d0d0d] px-2.5 py-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1b1b1d] text-[10px] font-bold text-white">
                {l.i}
              </span>
              <p className="min-w-0 flex-1 truncate text-[11px] text-[#cccccc]">
                {l.n} {l.f}
              </p>
              <span className="tabular text-[11px] font-semibold text-[#a8ff16]">US${l.v.toFixed(2)}</span>
              <span className="w-12 shrink-0 text-right text-[9.5px] text-[#666666]">{l.s}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
          Secure payment · SSL encrypted · Processed in minutes
        </p>
      </div>
    </main>
  );
}

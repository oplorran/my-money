"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { money, readState, writeState } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

type Method = "bank" | "paypal";

const METHODS: { id: Method; name: string; desc: string }[] = [
  { id: "bank", name: "Bank", desc: "Bank transfer" },
  { id: "paypal", name: "PayPal", desc: "Digital wallet" },
];

type Props = {
  fallback: number;
  /** rota de destino (a chamada de verificação) */
  next: string;
  event: string;
};

/**
 * Saque do pv14: cards horizontais no tema escuro do funil.
 * O bloco de segurança e o CTA só aparecem depois da escolha do método.
 */
export function Pv14Withdraw({ fallback, next, event }: Props) {
  const router = useRouter();
  const [amount] = useState(() => {
    const b = readState().balance;
    return b > fallback ? b : fallback;
  });
  const [method, setMethod] = useState<Method | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = () => {
    if (!method || !confirmed || busy) return;
    setBusy(true);
    writeState({ balance: amount });
    track(`${event}_withdraw`, { amount, method, ...trackingParams() });
    router.push(`${next}?m=${method}`);
  };

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden">
      <div className="mc-glow" />

      <div className="relative z-10 mx-auto w-full max-w-[420px] px-5 pb-8 pt-6">
        <div className="mb-5 text-center">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a8ff16]/30 bg-[#a8ff16]/10 px-3 py-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a8ff16]">
                Balance verified and ready
              </span>
            </span>
          </div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#888888]">
            Available to withdraw
          </p>
          <p className="tabular mt-1.5 text-[40px] font-bold leading-none text-white">{money(amount)}</p>
        </div>

        <div className="mb-3 text-center">
          <p className="text-[15px] font-semibold leading-tight text-white">Tap your payout method</p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-[#888888]">
            Choose one of the 2 available
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2.5">
          {METHODS.map((m) => {
            const on = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMethod(m.id);
                  setConfirmed(false);
                }}
                className={`relative flex h-[120px] flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] border p-3.5 text-center transition-colors ${
                  on ? "border-[#a8ff16]/45 bg-[#151b0d]" : "border-[#303030] bg-[#111111]"
                }`}
              >
                <span
                  className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                    on ? "border-[#a8ff16]" : "border-[#303030]"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full bg-[#a8ff16] transition-opacity"
                    style={{ opacity: on ? "1" : "0" }}
                  />
                </span>

                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[#1b1b1d] text-white">
                  {m.id === "bank" ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" x2="21" y1="22" y2="22" />
                      <line x1="6" x2="6" y1="18" y2="11" />
                      <line x1="10" x2="10" y1="18" y2="11" />
                      <line x1="14" x2="14" y1="18" y2="11" />
                      <line x1="18" x2="18" y1="18" y2="11" />
                      <polygon points="12 2 20 7 4 7" />
                    </svg>
                  ) : (
                    <span className="inline-flex items-baseline text-[11px] font-black italic leading-none tracking-[-0.04em]">
                      <span className="text-white">Pay</span>
                      <span className="text-[#cccccc]">Pal</span>
                    </span>
                  )}
                </span>

                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold leading-tight text-white">{m.name}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-[#888888]">{m.desc}</span>
                </span>
              </button>
            );
          })}
        </div>

        {method ? (
          <div className="mc-fade">
            <div className="mb-4 flex items-start gap-2.5 rounded-[20px] border border-[#303030] bg-[#111111] p-3.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <p className="text-[13px] leading-snug text-[#cccccc]">
                The transfer goes to your linked personal account. Your details are encrypted and never stored.
              </p>
            </div>

            <button
              onClick={() => setConfirmed((c) => !c)}
              className="flex w-full items-center gap-3 rounded-[20px] border border-[#303030] bg-[#111111] px-3.5 py-3 text-left transition-colors"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                  confirmed ? "border-[#a8ff16] bg-[#a8ff16]" : "border-[#303030]"
                }`}
              >
                {confirmed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span className="text-[13px] leading-snug text-white">
                I confirm I am over <strong>18 years old</strong> and that these funds are mine.
              </span>
            </button>

            <button
              onClick={submit}
              disabled={!confirmed || busy}
              className="mc-cta mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] py-4 text-[17px] font-bold disabled:opacity-45"
            >
              WITHDRAW NOW
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <p className="mt-3 text-center text-[12px] text-[#666666]">Arrives in your account in minutes</p>
          </div>
        ) : (
          <p className="mt-2 text-center text-[12px] text-[#666666]">Select a method to continue</p>
        )}
      </div>
    </main>
  );
}

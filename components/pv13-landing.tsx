"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Ticker } from "@/components/ticker";
import { AiMaker } from "@/components/brands";
import { ActivateOverlay } from "@/components/activate-overlay";
import { track, trackingParams } from "@/lib/track";

/** Mesmo clique curto do /audios/touchsound.mp3 do original, sem baixar arquivo. */
function touch() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1180, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.07);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
    osc.onended = () => void ctx.close();
  } catch {}
}

const MAKERS = [
  { id: "openai", bg: "linear-gradient(160deg,#1ABF93 0%,#10A37F 55%,#0B7A5E 100%)", color: "#fff" },
  { id: "google", bg: "linear-gradient(160deg,#ffffff 0%,#f1f3f4 100%)", color: "#4285F4" },
  { id: "microsoft", bg: "linear-gradient(160deg,#36BEF6 0%,#04ADF4 55%,#0288C2 100%)", color: "#fff" },
] as const;

/** Mantém as logos reconhecíveis, mas com a moldura escura do guia. */

export function Pv13Landing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const activate = () => {
    if (loading) return;
    touch();
    track("pv13_activate", trackingParams());
    setLoading(true);
    window.setTimeout(() => router.push("/pv13/trading"), 1000 + Math.random() * 500);
  };

  return (
    <>
      <Ticker />

      <div className="relative z-10 flex min-h-[100svh] flex-col">
        <AppHeader />

        {/* topo: as três empresas da licença + o saldo já creditado */}
        <div className="relative z-10 flex items-start justify-between gap-3 px-5 pt-3">
          <div className="flex -space-x-2.5">
            {MAKERS.map((m) => (
              <span
                key={m.id}
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: m.bg,
                  color: m.color,
                  boxShadow: "0 0 0 2px #090909, 0 0 0 3px #303030",
                }}
              >
                <AiMaker brand={m.id} size={19} />
              </span>
            ))}
          </div>

          <div className="rounded-2xl border border-[#303030] bg-[#111111] px-3 py-1.5">
            <p className="mb-0.5 text-[8px] font-bold uppercase leading-tight tracking-[0.16em] text-[#666666]">
              Balance
            </p>
            <p className="flex items-baseline gap-0.5">
              <span className="text-[11px] font-bold text-[#888888]">$</span>
              <span className="tabular text-lg font-bold leading-none tracking-tight text-white">50.00</span>
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-3">
          <div className="mc-pop w-full max-w-[340px] rounded-[30px] border border-[#303030] bg-[#111111] p-4 text-center">
            {/* selo com o check, como no original */}
            <div className="mb-3 flex justify-center">
              <div className="relative flex h-[62px] w-[62px] items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-[#a8ff16]/20 blur-md mc-breathe" />
                <span className="relative flex h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-[#a8ff16]/50 bg-[#151b0d]">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              </div>
            </div>

            <h1 className="mb-2 text-[21px] font-black leading-tight tracking-tight text-white">
              Congratulations!
            </h1>
            <p className="mb-3 px-1 text-[13px] leading-snug text-[#cccccc]">
              You just won 1 free license of the official AI from{" "}
              <span className="font-bold text-[#a8ff16]">GPT, Microsoft and Google</span>.
            </p>

            <div className="mb-3 h-px bg-[#292929]" />

            <p className="mb-1 text-[14px] leading-snug text-white">
              Take it — you already earned <span className="font-extrabold text-[#a8ff16]">$50.00</span>
            </p>
            <p className="mb-4 text-[12px] leading-snug text-[#888888]">
              Activate the AI and multiply your balance in 60 seconds.
            </p>

            <button
              onClick={activate}
              disabled={loading}
              className="mc-cta mc-pulse flex w-full items-center justify-center gap-2 rounded-[18px] py-3 text-[15px] font-bold tracking-wide active:scale-[.98] disabled:opacity-90"
            >
              START NOW
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>

            <p className="mt-2 text-[10px] text-[#666666]">1 free license · no card needed to test</p>
          </div>
        </div>
      </div>

      {loading && <ActivateOverlay />}
    </>
  );
}

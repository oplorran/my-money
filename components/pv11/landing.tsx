"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiMaker } from "@/components/brands";
import { GridWall } from "@/components/pv11/grid-wall";
import { ActivateOverlay } from "@/components/activate-overlay";
import { track, trackingParams } from "@/lib/track";

const MAKERS = [
  { id: "openai", bg: "linear-gradient(160deg,#1ABF93 0%,#10A37F 55%,#0B7A5E 100%)", color: "#fff" },
  { id: "google", bg: "linear-gradient(160deg,#ffffff 0%,#f1f3f4 100%)", color: "#4285F4" },
  { id: "microsoft", bg: "linear-gradient(160deg,#36BEF6 0%,#04ADF4 55%,#0288C2 100%)", color: "#fff" },
] as const;

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

type Props = {
  /** saldo já "creditado" na presell — $200 no pv11, $50 no pv12 */
  balance: number;
  /** multiplicador da velocidade das trilhas de fundo */
  speed?: number;
  /** rota da sessão de trading */
  next: string;
  /** prefixo dos eventos de telemetria */
  event: string;
};

export function Pv11Landing({ balance, speed = 1, next, event }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [whole, cents] = balance.toFixed(2).split(".");

  const start = () => {
    if (loading) return;
    touch();
    track(`${event}_start`, trackingParams());
    setLoading(true);
    window.setTimeout(() => router.push(next), 1000 + Math.random() * 400);
  };

  return (
    <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[420px] flex-col overflow-hidden">
      <GridWall speed={speed} />

      {/* topo: as três empresas da licença + o saldo já creditado */}
      <div className="relative z-10 flex items-start justify-between gap-3 px-5 pb-2 pt-5">
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
              <AiMaker brand={m.id} size={18} />
            </span>
          ))}
        </div>

        <div className="rounded-2xl border border-[#303030] bg-[#111111]/85 px-3 py-1.5 backdrop-blur-md">
          <p className="mb-0.5 text-[8px] font-bold uppercase leading-tight tracking-[0.18em] text-[#666666]">
            Balance
          </p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] font-bold text-[#888888]">$</span>
            <span className="tabular text-base font-bold leading-none tracking-tight text-white">{whole}</span>
            <span className="text-[10px] font-bold text-[#888888]">.{cents}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-8">
        <div className="pv11-pop w-full rounded-[30px] border border-[#303030] bg-[#111111]/85 p-6 text-center shadow-[0_24px_60px_-12px_rgba(0,0,0,.85)] backdrop-blur-md">
          {/* selo com o check brilhando */}
          <div className="mb-5 flex justify-center">
            <div className="relative h-[76px] w-[76px]">
              <span className="pv11-check-glow absolute inset-0 rounded-full bg-[#a8ff16]/25" />
              <span className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-[#a8ff16]/55 bg-[#151b0d]">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a8ff16"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
            </div>
          </div>

          <h1 className="mb-3 text-[23px] font-bold tracking-tight text-white">Congratulations!</h1>
          <p className="mb-4 px-1 text-[15px] leading-snug text-[#cccccc]">
            You just won <span className="font-bold text-[#a8ff16]">1 free license</span> of the official AI from{" "}
            <span className="font-bold text-white">GPT, Microsoft and Google</span>.
          </p>

          <div className="mb-4 h-px bg-[#292929]" />

          <p className="mb-2 text-[16px] leading-snug text-white">
            Take it — you already earned{" "}
            <span className="font-extrabold text-[#a8ff16]">${balance.toFixed(2)}</span>!
          </p>
          <p className="mb-6 text-[14px] leading-snug text-[#888888]">
            Activate the AI and multiply your balance in 60 seconds.
          </p>

          <div className="pv11-cta-pulse origin-center">
            <button
              onClick={start}
              disabled={loading}
              className="mc-cta flex w-full items-center justify-center gap-2 rounded-[18px] px-6 py-3.5 text-[17px] font-bold tracking-wide disabled:opacity-80"
            >
              START NOW
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {loading && <ActivateOverlay />}
    </div>
  );
}

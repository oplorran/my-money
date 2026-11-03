"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/marks";
import { BankLoader } from "@/components/bank-loader";
import { track, trackingParams } from "@/lib/track";

export function Pv13Landing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const activate = () => {
    track("pv13_activate", trackingParams());
    setLoading(true);
  };

  if (loading) {
    return <BankLoader amount="$50.00" onDone={() => router.push("/pv13/trading")} />;
  }

  return (
    <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pb-10 text-center">
      <div className="w-full max-w-[340px] mc-pop">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-800/60 bg-orange-950/60 px-2.5 py-0.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-700 animate-ping" />
          <span className="text-orange-500 text-[9.5px] font-bold tracking-[0.16em]">SYSTEM ONLINE</span>
        </div>

        <h1 className="text-[30px] leading-[1.06] font-black text-white tracking-tight mb-2.5">
          AI that trades<br />
          <span className="bg-gradient-to-r from-orange-700 via-red-800 to-red-900 bg-clip-text text-transparent">while you sleep</span>
        </h1>
        <p className="text-zinc-400 text-[13px] leading-relaxed mb-6 max-w-[270px] mx-auto">
          Start with a free $50 test credit. The AI runs the analysis, you watch it work.
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {[
            { k: "83.3%", l: "accuracy" },
            { k: "200+", l: "assets" },
            { k: ">90%", l: "confidence" },
          ].map((s) => (
            <div key={s.l} className="w-[92px] rounded-lg border border-zinc-600/25 bg-zinc-500/[.07] py-2 text-center">
              <p className="text-white font-bold text-[13px] tabular">{s.k}</p>
              <p className="text-zinc-500 text-[9px] uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-orange-900/70 bg-orange-950/40 p-3 mb-5 flex items-center gap-2.5 text-left">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-900 to-red-950 flex items-center justify-center shrink-0">
            <Mark size={20} uid="pw" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-[12px] font-semibold leading-tight">1 free license activated</p>
            <p className="text-orange-700 text-[10.5px]">$50.00 test credit added to your session</p>
          </div>
        </div>

        {/* proteção */}
        <div className="rounded-xl border border-zinc-600/25 bg-zinc-500/[.07] p-3 mb-3 text-left">
          <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-bold uppercase tracking-[0.14em] mb-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
            For your protection
          </div>
          <p className="text-zinc-400 text-[11px] leading-snug">The identity check confirms it&apos;s really you, so the money can only reach your account.</p>
        </div>

        {/* especialistas online */}
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <div className="flex -space-x-2">
            {["sarah", "marcus", "priya"].map((g) => (
              <div key={g} className="relative">
                <img src={`/pv13/gerente-${g}.jpg`} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-[#0f0f11]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0f0f11]" />
              </div>
            ))}
          </div>
          <p className="text-zinc-500 text-[10.5px]">
            <span className="text-emerald-400 font-semibold">3 specialists</span> online now
          </p>
        </div>

        <button onClick={activate} className="mc-cta mc-pulse w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[.98]">
          <span className="w-[18px] h-[18px] rounded-full bg-white/20 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
          </span>
          Activate the AI
        </button>
        <p className="text-center text-[10.5px] text-zinc-500 mt-2.5">
          Multiply your balance in 60 seconds. No card needed to test.
        </p>
      </div>
    </div>
  );
}

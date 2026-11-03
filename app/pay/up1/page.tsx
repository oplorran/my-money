"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutUrl, goExternal, readState } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

const PLANS = [
  { id: "PPU38CQFOA4", name: "Conservative", price: 37, per: "15 analyses/day", win: "85%", feats: ["15 AI analyses per day", "85% win rate", "Standard support"], badge: null },
  { id: "PPU38CQFOEP", name: "Growth", price: 47, per: "25 analyses/day", win: "88%", feats: ["25 AI analyses per day", "88% win rate", "Priority support"], badge: "MOST POPULAR" },
  { id: "PPU38CQFOEQ", name: "Elite", price: 57, per: "40 analyses/day", win: "92%", feats: ["40 AI analyses per day", "92% win rate", "Dedicated account manager"], badge: null },
];

export default function Up1() {
  const router = useRouter();
  const [spots] = useState(14);
  const st = readState();

  const buy = (id: string, plan: string) => {
    track("upsell1_click", { plan, ...trackingParams() });
    goExternal(checkoutUrl(id, { upsell: true }));
  };

  const skip = () => {
    track("upsell1_skip", trackingParams());
    router.push("/pay/up2");
  };

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden">
      <div className="mc-glow" />
      <div className="relative z-10 max-w-md mx-auto px-4 pt-5 pb-8">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-[10px] font-bold tracking-[0.18em]">PAYMENT CONFIRMED</span>
          </div>
          <h1 className="text-[24px] font-black text-white leading-tight mb-1.5">Congratulations! You now have access to My Money</h1>
          <p className="text-slate-400 text-[13px]">Last step: lock in your plan. This choice is permanent.</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3 rounded-full bg-orange-500/15 border border-orange-400/30 py-1.5">
          <span className="text-orange-300 text-[11px] font-bold">Only {spots} spots left in this session</span>
        </div>
        <p className="text-center text-slate-500 text-[11px] mb-3">Members at this level earn an average of $200–$1,000/day</p>

        <div className="space-y-2.5 mb-4">
          {PLANS.map((p) => (
            <button key={p.id} onClick={() => buy(p.id, p.name)} className={`w-full relative rounded-2xl border p-4 text-left transition-transform active:scale-[.99] ${p.badge ? "border-emerald-400/60 bg-emerald-500/8" : "border-white/12 bg-white/4"}`}>
              {p.badge && <span className="absolute -top-2 right-3 rounded-full bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 tracking-wider">{p.badge}</span>}
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-base">{p.name}</span>
                <span className="text-white font-black text-xl tabular">${p.price}</span>
              </div>
              <p className="text-slate-400 text-[11px] mb-2">{p.per} · {p.win} win rate</p>
              <ul className="space-y-1">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <button onClick={skip} className="w-full text-center text-[12px] text-slate-400 py-2.5">
          No thanks, I want to stay on the basic plan
        </button>
        <p className="text-center text-[10px] text-slate-500 leading-relaxed mt-1">
          Your plan is locked after this step. {st.firstName ? `${st.firstName}, ` : ""}you can upgrade later but never return to these prices.
        </p>
      </div>
    </main>
  );
}

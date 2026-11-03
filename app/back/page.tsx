"use client";

import { useState } from "react";
import { CHECKOUTS, TIER_DOWN, TIER_PRICE, checkoutUrl, goExternal, readState } from "@/lib/funnel";
import type { PriceTier } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

const FALLBACK: PriceTier = "27";

export default function Back() {
  const [down, setDown] = useState(false);
  // tier calculado no quiz, quando a pessoa veio do funil
  const [tier] = useState<PriceTier>(() => readState().tier ?? FALLBACK);

  const price = down ? TIER_DOWN[tier] : TIER_PRICE[tier];

  const go = () => {
    track("back_checkout_click", { tier, down, price, ...trackingParams() });
    goExternal(checkoutUrl(down ? CHECKOUTS[tier].down : CHECKOUTS[tier].full, { upsell: true }));
  };

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden flex flex-col">
      <div className="mc-glow" />
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 pb-8 max-w-md mx-auto w-full">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 text-[10px] font-bold tracking-[0.18em]">WELCOME BACK</span>
          </div>
          <h1 className="text-[28px] font-black text-white leading-tight mb-2">Your verification is still open</h1>
          <p className="text-slate-400 text-[13px]">If you leave now, the process resets from zero. Finish it while it&apos;s open.</p>
        </div>

        <div className="mc-card rounded-2xl p-5 mb-4">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{down ? "Reduced access" : "Full access"}</p>
          <p className="text-white font-black text-5xl tabular mb-1">
            ${price.toFixed(2)}
          </p>
          <p className="text-slate-400 text-[12px]">
            {down ? "One-time reduced activation — today only" : "One-time activation. Withdrawals released right after."}
          </p>
        </div>

        <button onClick={go} className="mc-cta mc-pulse w-full py-4 rounded-2xl font-bold text-lg">
          {down ? "Activate reduced access" : "Activate my account"} · ${price.toFixed(2)}
        </button>

        {!down && (
          <button onClick={() => { setDown(true); track("back_down", { tier, ...trackingParams() }); }} className="w-full text-center text-[12px] text-slate-400 py-3">
            Too expensive — show me the reduced version
          </button>
        )}
      </div>
    </main>
  );
}

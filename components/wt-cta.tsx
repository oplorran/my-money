"use client";

import { checkoutUrl, goExternal } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

export function WtCta() {
  const go = () => {
    track("wt_tripwire_click", trackingParams());
    goExternal(checkoutUrl("PPU38CQ513F"));
  };

  return (
    <button onClick={go} className="w-full rounded-xl bg-indigo-600 py-3.5 font-bold text-white">
      Activate Your Potential - $1
    </button>
  );
}

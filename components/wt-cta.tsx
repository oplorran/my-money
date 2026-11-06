"use client";

import { checkoutUrl, goExternal } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

export function WtCta() {
  const go = () => {
    track("wt_tripwire_click", trackingParams());
    goExternal(checkoutUrl("PPU38CQ513F"));
  };

  return (
    <button onClick={go} className="mc-cta w-full rounded-[18px] py-3.5 font-bold">
      Activate Your Potential - $1
    </button>
  );
}

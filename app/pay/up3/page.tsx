"use client";

import { UP3_CHECKOUT, MEMBERS_URL, checkoutUrl, goExternal } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

const ACTIVATED = ["Your premium plan", "AI Multiplier", "Pro Mode"];

export default function Up3() {
  const buy = () => {
    track("upsell3_click", { plan: "lifetime", price: 67, ...trackingParams() });
    goExternal(checkoutUrl(UP3_CHECKOUT, { upsell: true }));
  };

  const skip = () => {
    track("upsell3_skip", trackingParams());
    goExternal(MEMBERS_URL);
  };

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden pb-10">
      <div className="mc-glow" />
      <div className="relative z-10 mx-auto w-full max-w-md px-5 pt-7">
        <div className="mb-4 rounded-[20px] border border-[#a8ff16]/30 bg-[#111111] p-3.5">
          <p className="text-[11.5px] font-bold leading-snug text-[#cccccc]">
            WARNING: Your Cash Club access expires in 6 months!
          </p>
        </div>

        <p className="mb-2 text-[11px] uppercase tracking-wider text-[#666666]">You just activated:</p>
        <ul className="mb-5 space-y-1.5">
          {ACTIVATED.map((a) => (
            <li key={a} className="flex items-center gap-2 text-[12.5px] text-[#cccccc]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {a}
            </li>
          ))}
        </ul>

        <h1 className="mb-2 text-[22px] font-black leading-tight text-white">
          But there&apos;s something crucial you need to know…
        </h1>
        <p className="mb-4 text-[13px] leading-relaxed text-[#cccccc]">
          Your access expires in exactly <span className="font-bold text-[#090909]">6 months</span>.
        </p>

        <h2 className="mb-1.5 text-[13px] font-bold text-[#090909]">Why?</h2>
        <p className="mb-4 text-[12.5px] leading-relaxed text-[#888888]">
          Cash Club operates through strategic partnerships with financial institutions and market data providers.
          These agreements renew every six months and, for contractual reasons, we cannot guarantee access beyond 6
          months.
        </p>

        <h2 className="mb-1.5 text-[13px] font-bold text-[#090909]">What happens in 6 months?</h2>
        <ul className="mb-4 space-y-1">
          {["Your account will be deactivated", "You'll lose access to the AI", "Your earnings stop growing"].map((s) => (
            <li key={s} className="flex items-center gap-2 text-[12.5px] text-[#888888]">
              <span className="text-[#a8ff16]">✕</span>
              {s}
            </li>
          ))}
        </ul>

        <p className="mb-1 text-[13px] font-bold text-[#090909]">Imagine this:</p>
        <p className="mb-4 text-[12.5px] italic leading-relaxed text-[#888888]">
          You spent 6 months building consistent results… Your AI is running perfectly… And suddenly: access
          terminated.
        </p>

        <h2 className="mb-1.5 text-[15px] font-black text-white">The Solution</h2>
        <p className="mb-4 text-[12.5px] leading-relaxed text-[#cccccc]">
          As a founding member, you have an exclusive opportunity to activate lifetime access right now. To activate
          it, just tap the button below. <span className="font-semibold text-white">Available only NOW, on this page.</span>
        </p>

        <div className="rounded-[20px] border border-[#303030] bg-[#111111] p-5 text-center">
          <p className="mb-1 text-[11.5px] text-[#888888]">Lock in lifetime access with a one-time payment:</p>
          <p className="mb-4 text-[34px] font-black leading-none text-white">US$67</p>
          <button onClick={buy} className="mc-cta mc-pulse w-full rounded-[16px] py-3.5 text-[14.5px] font-bold text-[#090909]">
            ACTIVATE LIFETIME ACCESS
          </button>
          <p className="mt-2.5 text-[10.5px] leading-snug text-[#666666]">
            Unconditional 7-day guarantee. If you don&apos;t want it, we refund 100%.
          </p>
        </div>

        <button onClick={skip} className="mt-3 w-full py-2.5 text-center text-[12px] text-[#666666] underline decoration-[#303030] underline-offset-2">
          No, I want to continue without lifetime access
        </button>
        <p className="mt-1 text-center text-[10px] uppercase tracking-wider text-[#666666]">Secure payment · SSL encrypted</p>
      </div>
    </main>
  );
}

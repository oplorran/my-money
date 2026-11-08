"use client";

import { useRouter } from "next/navigation";
import { UP3_CHECKOUT, MEMBERS_URL, checkoutUrl, goExternal } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

const ACTIVATED = ["Your premium plan", "AI Multiplier", "Pro Mode"];

const LOSES = ["Your account will be deactivated", "You'll lose access to the AI", "Your earnings stop growing"];

export function Up3Offer() {
  const router = useRouter();

  const buy = () => {
    track("upsell3_click", { plan: "lifetime", price: 67, ...trackingParams() });
    goExternal(checkoutUrl(UP3_CHECKOUT, { upsell: true }));
  };

  const skip = () => {
    track("upsell3_skip", trackingParams());
    router.push(MEMBERS_URL);
  };

  return (
    <main className="u3-shell relative min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#2a0a0a]/40 via-transparent to-[#2b1400]/25" />

      <div className="relative z-10 mx-auto w-full max-w-lg px-5 py-8">
        <div className="u3-warn mb-8 rounded-[16px] p-4">
          <div className="flex items-center justify-center gap-3">
            <svg className="shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <span className="text-center text-[17px] font-black leading-tight text-white">
              WARNING: Your Money Club access expires in 6 months!
            </span>
          </div>
        </div>

        <p className="mb-4 text-[13.5px] text-[#8a8a8a]">You just activated:</p>
        <ul className="mb-8 space-y-3">
          {ACTIVATED.map((a) => (
            <li key={a} className="flex items-center gap-3">
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span className="text-[13.5px] text-white">{a}</span>
            </li>
          ))}
        </ul>

        <p className="u3-hot mb-4 text-[20px] font-bold leading-snug">
          But there&apos;s something crucial you need to know...
        </p>
        <p className="mb-6 text-[23px] font-black leading-tight text-white">
          Your access expires in exactly 6 months.
        </p>

        <div className="mb-8 rounded-[16px] border border-white/10 bg-white/[0.04] p-5">
          <h2 className="mb-3 text-[17px] font-bold text-[#facc15]">Why?</h2>
          <p className="text-[13px] leading-relaxed text-[#8a8a8a]">
            Money Club operates through strategic partnerships with financial institutions and market data providers.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-[#8a8a8a]">
            These agreements renew every six months and, for contractual reasons,{" "}
            <span className="font-semibold text-white">we cannot guarantee access beyond 6 months</span>.
          </p>
        </div>

        <h2 className="mb-4 text-[17px] font-bold text-[#f87171]">What happens in 6 months?</h2>
        <ul className="mb-8 space-y-3">
          {LOSES.map((l) => (
            <li key={l} className="flex items-center gap-3 text-[13px] text-[#cccccc]">
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
              <span>{l}</span>
            </li>
          ))}
        </ul>

        <div className="u3-lose mb-8 rounded-[16px] p-5">
          <h2 className="mb-4 text-[17px] font-bold text-white">Imagine this:</h2>
          <p className="mb-3 text-[13px] leading-relaxed text-[#d4d4d4]">
            You spent 6 months building consistent results...
          </p>
          <p className="mb-3 text-[13px] leading-relaxed text-[#d4d4d4]">Your AI is running perfectly...</p>
          <p className="text-[19px] font-bold text-[#f87171]">And suddenly: access terminated.</p>
        </div>

        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#facc15] to-[#f97316]">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                <path d="M5 21h14" />
              </svg>
            </div>
          </div>
          <h2 className="mb-4 text-[23px] font-black text-white">The Solution</h2>
          <p className="mb-4 text-[13px] leading-relaxed text-[#8a8a8a]">
            As a founding member, you have an exclusive opportunity to activate{" "}
            <span className="font-bold text-[#facc15]">lifetime access</span> right now.
          </p>
          <p className="text-[13px] font-semibold text-[#fb923c]">
            To activate it, just tap the button below. Available only NOW, on this page.
          </p>
        </div>

        <div className="u3-card mb-6 rounded-[22px] p-6">
          <p className="mb-4 text-center text-[13px] text-[#8a8a8a]">
            Lock in lifetime access with a one-time payment:
          </p>
          <p className="u3-price mb-6 text-center text-[54px] font-black leading-none">
            <span className="mr-0.5 align-baseline text-[26px] font-bold text-[#fbbf24]/90">US</span>$67
          </p>

          <button
            onClick={buy}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#eab308] via-[#f59e0b] to-[#f97316] py-5 text-[15px] font-black text-black shadow-[0_24px_50px_-20px_rgba(249,115,22,0.85)] transition-transform active:scale-[.99]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
            </svg>
            <span>ACTIVATE LIFETIME ACCESS</span>
          </button>

          <div className="flex items-center justify-center gap-2">
            <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            </svg>
            <span className="text-[12.5px] leading-snug text-[#8a8a8a]">
              Unconditional 7-day guarantee. If you don&apos;t want it, we refund 100%.
            </span>
          </div>
        </div>

        <div className="mb-8 text-center">
          <button
            onClick={skip}
            className="text-[13px] text-[#5f5f5f] underline decoration-[#333333] underline-offset-2 transition-colors hover:text-[#8a8a8a]"
          >
            No, I want to continue without lifetime access
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11.5px] text-[#5f5f5f]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Secure payment • SSL encrypted</span>
        </div>
      </div>
    </main>
  );
}

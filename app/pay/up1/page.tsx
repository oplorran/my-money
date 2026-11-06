"use client";

import { useRouter } from "next/navigation";
import { UP1_CHECKOUT, checkoutUrl, goExternal } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

const BENEFITS = [
  { label: "40+ analyses per day", note: "5x more market opportunities", color: "#a8ff16" },
  { label: "92% win rate", note: "maximum AI precision", color: "#a8ff16" },
  { label: "Personal Account Manager", note: "dedicated support", color: "#a8ff16" },
  { label: "$800–$1,000/day", note: "earning potential", color: "#a8ff16" },
];

export default function Up1() {
  const router = useRouter();

  const buy = () => {
    track("upsell1_click", { plan: "premium", price: 297, ...trackingParams() });
    goExternal(checkoutUrl(UP1_CHECKOUT, { upsell: true }));
  };

  const skip = () => {
    track("upsell1_skip", trackingParams());
    router.push("/hot/up2");
  };

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden pb-8">
      <div className="mc-glow" />

      <div className="relative z-10 border-b border-[#303030] bg-[#0a0a0a] px-4 py-3">
        <p className="text-center text-[12.5px] font-bold leading-snug text-white">
          Attention! Your APP access is not 100% complete yet…
        </p>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-4 pt-5">
        {/* stepper dos 3 passos */}
        <div className="mb-5 flex items-start justify-between px-1">
          {[
            { t: "Step 1", lines: ["Sign-Up"], done: true },
            { t: "Step 2", lines: ["Complete"], done: true },
            { t: "Step 3", lines: ["Activate", "Your", "Plan"], active: true },
          ].map((st) => (
            <div key={st.t} className="flex flex-1 flex-col items-center">
              <p className={`text-[10.5px] font-bold uppercase tracking-wider ${st.active ? "text-[#a8ff16]" : "text-[#888888]"}`}>
                {st.t}
              </p>
              <span
                className={`mt-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${
                  st.done ? "bg-[#a8ff16] text-white" : "bg-red-800 text-white"
                }`}
              >
                {st.done ? "✓" : "3"}
              </span>
              {st.lines.map((l, i) => (
                <p key={l} className={`${i === 0 ? "mt-1" : "mt-0.5"} text-[10px] font-black leading-tight ${st.active ? "text-white" : "text-white"}`}>
                  {l}
                </p>
              ))}
            </div>
          ))}
          <div className="flex flex-1 flex-col items-center opacity-55">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#666666]">Done</p>
            <span className="mt-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-[#303030] text-[11px] text-[#666666]">
              ✓
            </span>
            <p className="mt-1 text-[10px] font-black text-[#666666]">Completed</p>
          </div>
        </div>

        <h1 className="mb-2 text-[25px] font-black leading-tight text-white">
          Congratulations! You now have access to Cash Club.
        </h1>
        <p className="mb-4 text-[13px] leading-relaxed text-[#888888]">
          Before you start trading, activate your premium plan to unlock the full potential of the AI.
        </p>

        <h2 className="mb-2 text-[16px] font-black text-white">What does the Premium Plan include?</h2>
        <ul className="mb-4 space-y-1.5">
          {BENEFITS.map((b) => (
            <li key={b.label} className="flex items-start gap-2 text-[12px] leading-snug text-[#cccccc]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={b.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>
                <span className="font-bold" style={{ color: b.color }}>{b.label}</span> — {b.note}
              </span>
            </li>
          ))}
        </ul>

        <div className="relative mt-6 rounded-[20px] border border-[#303030] bg-[#111111] p-5">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#a8ff16] to-[#7fc400] px-3 py-1 text-[10px] font-bold tracking-wider text-[#090909]">
            ⭐ PREMIUM PLAN
          </span>
          <p className="mb-1 text-center text-[11.5px] text-[#888888]">Unlock everything for:</p>
          <p className="mb-0.5 flex items-baseline justify-center gap-1">
            <span className="text-[12px] font-bold text-white/50">US</span>
            <span className="tabular text-[44px] font-black leading-none text-white">$297</span>
          </p>
          <p className="mb-4 text-center text-[11px] text-[#666666]">one-time payment</p>

          <ul className="mb-4 space-y-1.5">
            {[
              "40+ AI analyses per day",
              "92% win rate (maximum precision)",
              "Personal Account Manager",
              "Earning potential: $800–$1,000/day",
              "Priority 24/7 support",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-[11.5px] text-[#cccccc]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <button onClick={buy} className="mc-cta mc-pulse w-full rounded-[16px] py-3.5 text-[15px] font-bold text-[#090909]">
            ACTIVATE PREMIUM
          </button>
        </div>

        <button onClick={skip} className="mt-3 w-full py-2.5 text-center text-[12px] text-[#666666] underline decoration-[#303030] underline-offset-2">
          No thanks, I want to stay on the basic plan
        </button>
      </div>
    </main>
  );
}

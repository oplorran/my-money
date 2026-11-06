"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UP2_CHECKOUT, checkoutUrl, goExternal } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

type Stage = "survey" | "ready" | "pitch" | "offer";

const QUESTIONS = [
  {
    q: "What's your current financial situation?",
    opts: [
      { t: "STRUGGLING", s: "I have debt or urgent money problems" },
      { t: "STABLE BUT LIMITED", s: "I pay my bills but have little left over" },
      { t: "COMFORTABLE", s: "I have some savings and control of my finances" },
      { t: "VERY COMFORTABLE", s: "I have a solid reserve and want to multiply my wealth" },
    ],
  },
  {
    q: "How much do you want to earn per month?",
    opts: [
      { t: "$5,000 – $10,000", s: "/MONTH" },
      { t: "$10,000 – $20,000", s: "/MONTH" },
      { t: "$20,000 – $35,000", s: "/MONTH" },
      { t: "OVER $35,000", s: "/MONTH" },
    ],
  },
  {
    q: "In how long do you want to achieve this?",
    opts: [
      { t: "LESS THAN 6 MONTHS", s: "" },
      { t: "6-12 MONTHS", s: "" },
      { t: "1-2 YEARS", s: "" },
    ],
  },
];

const FEATURES = [
  "Automatically reinvests your daily profits",
  "Uses compound interest to multiply your earnings",
  "AI-powered risk management protects your balance",
  "Works 24/7 while you sleep",
];

export default function Up2() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("survey");
  const [step, setStep] = useState(0);

  const buy = () => {
    track("upsell2_click", { plan: "multiplier", price: 197, ...trackingParams() });
    goExternal(checkoutUrl(UP2_CHECKOUT, { upsell: true }));
  };

  const skip = () => {
    track("upsell2_skip", trackingParams());
    router.push("/hot/up3a");
  };

  const next = () => {
    if (step + 1 < QUESTIONS.length) {
      setStep((s) => s + 1);
      return;
    }
    track("upsell2_survey_done", trackingParams());
    setStage("ready");
  };

  if (stage === "survey") {
    const q = QUESTIONS[step];
    return (
      <main className="mc-shell relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="mc-glow" />
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5">
          <div className="mb-4 flex items-center gap-3">
            <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a8ff16]">
              Question {step + 1} of {QUESTIONS.length}
            </p>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1b1b1d]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4d7a00] to-[#a8ff16] transition-all duration-500"
                style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <span className="tabular shrink-0 text-[10px] font-bold text-[#666666]">
              {Math.round(((step + 1) / QUESTIONS.length) * 100)}%
            </span>
          </div>

          <h1 className="mc-pop mb-5 text-[23px] font-black leading-snug text-white">{q.q}</h1>
          <div className="mc-pop space-y-2.5">
            {q.opts.map((o) => (
              <button
                key={o.t}
                onClick={next}
                className="w-full rounded-[16px] border border-[#303030] bg-[#111111] px-4 py-3.5 text-left transition-transform hover:border-[#a8ff16]/40 active:scale-[.99]"
              >
                <span className="block text-[13px] font-black leading-tight text-white">
                  {o.t}
                  {o.s && <span className="ml-1 text-[10px] font-medium text-[#666666]">{o.s}</span>}
                </span>
                {o.s !== "/MONTH" && <span className="mt-0.5 block text-[11.5px] text-[#888888]">{o.s}</span>}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (stage === "ready") {
    return (
      <main className="mc-shell relative flex min-h-[100svh] items-center justify-center px-5">
        <div className="mc-glow" />
        <div className="mc-pop relative z-10 w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#a8ff16]/30 bg-[#151b0d]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mb-2 text-[23px] font-black leading-tight text-white">Your profile is ready!</h1>
          <p className="mb-5 text-[12.5px] leading-relaxed text-[#888888]">
            Based on your answers, we identified the perfect solution to accelerate your results.
          </p>
          <button onClick={() => setStage("pitch")} className="mc-cta w-full rounded-[16px] py-3.5 text-[14px] font-bold text-[#090909]">
            SEE MY RESULT
          </button>
        </div>
      </main>
    );
  }

  if (stage === "pitch") {
    return (
      <main className="mc-shell relative flex min-h-[100svh] items-center justify-center px-5">
        <div className="mc-glow" />
        <div className="mc-pop relative z-10 w-full max-w-sm">
          <span className="mb-3 inline-block rounded-full border border-red-800/50 bg-red-950/40 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-[#a8ff16]">
            AI MULTIPLIER
          </span>
          <h1 className="mb-2 text-[23px] font-black leading-tight text-white">
            The tool that multiplies your earnings
          </h1>
          <p className="mb-4 text-[12.5px] leading-relaxed text-[#888888]">
            It takes your Cash Club earnings and multiplies them automatically using compound interest.
          </p>
          <ul className="mb-5 space-y-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[12px] leading-snug text-[#cccccc]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <button onClick={() => setStage("offer")} className="mc-cta w-full rounded-[16px] py-3.5 text-[14px] font-bold text-[#090909]">
            CONTINUE
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden pb-8">
      <div className="mc-glow" />
      <div className="relative z-10 mx-auto w-full max-w-md px-4 pt-6">
        <h1 className="mb-1 text-[23px] font-black leading-tight text-white">Activate AI Multiplier</h1>
        <p className="mb-4 text-[12.5px] leading-relaxed text-[#888888]">
          Multiply your Cash Club earnings automatically with compound interest.
        </p>

        <div className="relative rounded-[20px] border border-[#303030] bg-[#111111] p-5">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#4d7a00] to-[#a8ff16] px-3 py-1 text-[10px] font-bold tracking-wider text-[#090909]">
            AI MULTIPLIER
          </span>
          <p className="mb-1 text-center text-[11.5px] text-[#888888]">Unlock the multiplier for:</p>
          <p className="mb-0.5 flex items-baseline justify-center gap-1">
            <span className="text-[12px] font-bold text-white/50">US</span>
            <span className="tabular text-[44px] font-black leading-none text-white">$197</span>
          </p>
          <p className="mb-4 text-center text-[11px] text-[#666666]">one-time payment</p>

          <ul className="mb-4 space-y-1.5">
            {[...FEATURES, "Priority processing & support"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-[11.5px] text-[#cccccc]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <button onClick={buy} className="mc-cta mc-pulse w-full rounded-[16px] py-3.5 text-[15px] font-bold text-[#090909]">
            ACTIVATE MULTIPLIER
          </button>
          <p className="mt-2.5 text-center text-[10px] text-[#666666]">7-day guarantee · One-time payment</p>
        </div>

        <button onClick={skip} className="mt-3 w-full py-2.5 text-center text-[12px] text-[#666666] underline decoration-[#303030] underline-offset-2">
          No, I want to continue without multiplying
        </button>
        <p className="mt-1 text-center text-[10px] uppercase tracking-wider text-[#666666]">Secure payment · SSL encrypted</p>
      </div>
    </main>
  );
}

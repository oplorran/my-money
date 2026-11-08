"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UP2_CHECKOUT, checkoutUrl, goExternal } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

type Stage = "survey" | "ready" | "pitch" | "offer";

type Opt = { t: string; s?: string; icon?: React.ReactNode };

const ICON = {
  alert: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  wallet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  ),
  trend: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  dollar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  bot: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  ),
  zap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  ),
  sparkles: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  arrow: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  lock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

const QUESTIONS: { q: string; opts: Opt[] }[] = [
  {
    q: "What's your current financial situation?",
    opts: [
      { t: "STRUGGLING", s: "I have debt or urgent money problems", icon: ICON.alert },
      { t: "STABLE BUT LIMITED", s: "I pay my bills but have little left over", icon: ICON.wallet },
      { t: "COMFORTABLE", s: "I have some savings and control of my finances", icon: ICON.trend },
      { t: "VERY COMFORTABLE", s: "I have a solid reserve and want to multiply my wealth", icon: ICON.dollar },
    ],
  },
  {
    q: "How much do you want to earn per month?",
    opts: [
      { t: "$5,000 - $10,000", s: "/MONTH" },
      { t: "$10,000 - $20,000", s: "/MONTH" },
      { t: "$20,000 - $35,000", s: "/MONTH" },
      { t: "OVER $35,000", s: "/MONTH" },
    ],
  },
  {
    q: "In how long do you want to achieve this?",
    opts: [{ t: "LESS THAN 6 MONTHS" }, { t: "6-12 MONTHS" }, { t: "1-2 YEARS" }],
  },
];

const PITCH = [
  { t: "Automatically reinvests your daily profits", icon: ICON.zap },
  { t: "Uses compound interest to multiply your earnings", icon: ICON.trend },
  { t: "AI-powered risk management protects your balance", icon: ICON.shield },
  { t: "Works 24/7 while you sleep", icon: ICON.sparkles },
];

const OFFER = [
  "Automatically reinvests your daily profits",
  "Compound interest to multiply earnings",
  "AI-powered risk management",
  "Works 24/7 while you sleep",
  "Priority processing & support",
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
      <main className="mc-shell relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-8">
        <div className="mc-glow" />
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 w-full">
            <div className="mc-fade mb-2 flex justify-between text-[11.5px] font-semibold text-[#888888]">
              <span>
                Question {step + 1} of {QUESTIONS.length}
              </span>
              <span className="tabular">{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#1c1c1f]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3b9dff] via-[#1f7ae0] to-[#22d3ee] transition-all duration-300"
                style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <h1 key={q.q} className="mc-pop mb-8 text-center text-[23px] font-black leading-tight text-white">
            {q.q}
          </h1>

          <div key={`${step}-opts`} className="mc-pop space-y-3">
            {q.opts.map((o) => (
              <button
                key={o.t}
                onClick={next}
                className="flex w-full items-center gap-4 rounded-[16px] border border-white/10 bg-white/[0.05] p-4 text-left transition-all hover:border-[#3b9dff]/40 hover:bg-white/[0.08] active:scale-[.99]"
              >
                {o.icon && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3b9dff]/10 text-[#4da3ff]">
                    {o.icon}
                  </span>
                )}
                <span>
                  <span className="block text-[13.5px] font-bold leading-tight text-white">
                    {o.t}
                    {o.s === "/MONTH" && <span className="text-[11px] font-semibold text-[#8a8a8a]">/MONTH</span>}
                  </span>
                  {o.s && o.s !== "/MONTH" && <span className="mt-0.5 block text-[12px] text-[#8a8a8a]">{o.s}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (stage === "ready") {
    return (
      <main className="mc-shell relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-8">
        <div className="mc-glow" />
        <div className="mc-pop relative z-10 w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#34d399] to-[#059669]">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1 className="mb-4 text-[27px] font-black leading-tight text-white">Your profile is ready!</h1>
          <p className="mb-8 text-[13.5px] leading-relaxed text-[#8a8a8a]">
            Based on your answers, we identified the perfect solution to accelerate your results.
          </p>
          <button
            onClick={() => setStage("pitch")}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#3b9dff] to-[#22d3ee] py-4 text-[14.5px] font-bold text-white shadow-[0_18px_40px_-18px_rgba(59,157,255,0.9)] transition-transform active:scale-[.99]"
          >
            SEE MY RESULT
            {ICON.arrow}
          </button>
        </div>
      </main>
    );
  }

  if (stage === "pitch") {
    return (
      <main className="mc-shell relative flex min-h-[100svh] flex-col items-center overflow-hidden px-4 py-8">
        <div className="mc-glow" />
        <div className="mc-pop relative z-10 w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#4f46e5] text-white">
              {ICON.bot}
            </div>
            <h1 className="mb-3 text-[27px] font-black leading-tight text-white">AI Multiplier</h1>
            <p className="text-[13.5px] leading-relaxed text-[#8a8a8a]">
              The tool that takes your Money Club earnings and multiplies them automatically using compound interest.
            </p>
          </div>

          <div className="mb-8 space-y-4">
            {PITCH.map((f) => (
              <div key={f.t} className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-white/[0.05] p-4">
                <span className="shrink-0 text-[#c084fc]">{f.icon}</span>
                <span className="text-[12.5px] leading-snug text-[#cccccc]">{f.t}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStage("offer")}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#a855f7] to-[#4f46e5] py-4 text-[14.5px] font-bold text-white shadow-[0_18px_40px_-18px_rgba(168,85,247,0.9)] transition-transform active:scale-[.99]"
          >
            CONTINUE
            {ICON.arrow}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mc-shell relative flex min-h-[100svh] flex-col items-center overflow-hidden px-4 py-8">
      <div className="mc-glow" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-[23px] font-black leading-tight text-white">Activate AI Multiplier</h1>
          <p className="text-[12.5px] leading-relaxed text-[#8a8a8a]">
            Multiply your Money Club earnings automatically with compound interest.
          </p>
        </div>

        <div className="relative mb-6 rounded-[20px] border-2 border-[#a855f7]/40 bg-gradient-to-br from-[#a855f7]/10 to-[#4f46e5]/5 p-5 text-center shadow-[0_28px_70px_-34px_rgba(168,85,247,0.65)]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#a855f7] to-[#4f46e5] px-4 py-1.5 text-[10px] font-bold tracking-wider text-white shadow-lg">
            AI MULTIPLIER
          </span>

          <p className="mb-2 mt-4 text-[12.5px] text-[#8a8a8a]">Unlock the multiplier for:</p>
          <p className="mb-1 flex items-baseline justify-center gap-1">
            <span className="text-[12px] font-bold text-white/50">US</span>
            <span className="tabular text-[46px] font-black leading-none text-white">$197</span>
          </p>
          <p className="mb-6 text-[12px] text-[#6f6f6f]">one-time payment</p>

          <ul className="mb-6 space-y-2 text-left">
            {OFFER.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-[2px] shrink-0 text-[#c084fc]">{ICON.check}</span>
                <span className="text-[12.5px] leading-snug text-[#cccccc]">{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={buy}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#a855f7] to-[#4f46e5] py-4 text-[15px] font-bold text-white shadow-[0_18px_40px_-18px_rgba(168,85,247,0.9)] transition-transform active:scale-[.99]"
          >
            ACTIVATE MULTIPLIER
            {ICON.arrow}
          </button>
        </div>

        <p className="mb-4 text-center text-[11px] text-[#6f6f6f]">7-day guarantee · One-time payment</p>

        <div className="mb-8 text-center">
          <button
            onClick={skip}
            className="text-[12px] text-[#6b6b6b] underline decoration-[#303030] underline-offset-2 transition-colors hover:text-[#9a9a9a]"
          >
            No, I want to continue without multiplying
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#5f5f5f]">
          {ICON.lock}
          <span>Secure payment · SSL encrypted</span>
        </div>
      </div>
    </main>
  );
}

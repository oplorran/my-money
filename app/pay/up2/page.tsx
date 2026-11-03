"use client";

"use client";

import { useMemo, useState } from "react";
import { MEMBERS_URL, checkoutUrl, goExternal, money } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

const OFFERS = [
  { id: "PPU38CQFOAA", name: "Basic", price: 24.9, months: 12, per: "/mo", tag: null },
  { id: "PPU38CQFOA8", name: "Advanced", price: 34.9, months: 6, per: "/mo", tag: null },
  { id: "PPU38CQFOA6", name: "Ultra", price: 49.9, months: 4, per: "/mo", tag: "RECOMMENDED" },
];

const STEPS = [
  { q: "Where are you financially today?", opts: ["In debt", "Tight", "Some room", "Comfortable"] },
  { q: "What's your monthly target?", opts: ["$1,000", "$3,000", "$6,000", "$10,000+"] },
  { q: "What's the goal behind it?", opts: ["Pay off debt", "Extra income", "Build savings", "Replace my income"] },
  { q: "In what timeframe?", opts: ["3 months", "6 months", "1 year", "Whatever it takes"] },
];

export default function Up2() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const target = useMemo(() => {
    const t = answers[1] ?? "$3,000";
    const map: Record<string, number> = { "$1,000": 60000, "$3,000": 180000, "$6,000": 360000, "$10,000+": 600000 };
    return map[t] ?? 60000;
  }, [answers]);

  const buy = (id: string, plan: string) => {
    track("upsell2_click", { plan, ...trackingParams() });
    goExternal(checkoutUrl(id, { upsell: true }));
  };

  const skip = () => {
    track("upsell2_skip", trackingParams());
    goExternal(MEMBERS_URL);
  };

  if (step < STEPS.length) {
    const s = STEPS[step];
    return (
      <main className="mc-shell relative min-h-[100svh] overflow-hidden flex flex-col">
        <div className="mc-glow" />
        <div className="relative z-10 flex-1 flex flex-col justify-center px-5">
          <p className="text-emerald-300 text-[10px] font-bold tracking-[0.18em] mb-3">QUESTION {step + 1} / 4</p>
          <h1 className="text-[26px] font-black text-white leading-snug mb-6">{s.q}</h1>
          <div className="space-y-2.5">
            {s.opts.map((o) => (
              <button
                key={o}
                onClick={() => { setAnswers((p) => [...p, o]); setStep((v) => v + 1); }}
                className="w-full text-left rounded-xl bg-white/5 border border-white/12 px-4 py-3.5 text-[14px] text-slate-200 hover:border-sky-400/50 active:scale-[.99] transition-transform"
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden">
      <div className="mc-glow" />
      <div className="relative z-10 max-w-md mx-auto px-4 pt-6 pb-8">
        <div className="text-center mb-5">
          <span className="inline-block rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-[10px] font-bold tracking-[0.18em] mb-3">PLAN ACTIVATED</span>
          <h1 className="text-[24px] font-black text-white leading-tight">To hit your target, you need the AI Multiplier</h1>
        </div>

        <div className="mc-card rounded-2xl p-4 mb-4">
          <p className="text-slate-400 text-[11px] uppercase tracking-wider mb-1">Your projection</p>
          <p className="text-white font-black text-3xl tabular mb-1">{money(target, "USD")}</p>
          <p className="text-slate-400 text-[12px]">Needed to reach your goal compounding the base plan.</p>
        </div>

        <p className="text-center text-slate-400 text-[12px] mb-3">Choose how fast you want to get there:</p>

        <div className="space-y-2.5 mb-4">
          {OFFERS.map((o) => (
            <button key={o.id} onClick={() => buy(o.id, o.name)} className={`w-full relative rounded-2xl border p-4 text-left active:scale-[.99] transition-transform ${o.tag ? "border-emerald-400/60 bg-emerald-500/8" : "border-white/12 bg-white/4"}`}>
              {o.tag && <span className="absolute -top-2 right-3 rounded-full bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 tracking-wider">{o.tag}</span>}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-base">{o.name}</p>
                  <p className="text-slate-400 text-[11px]">Reach it in {o.months} months</p>
                </div>
                <div className="text-right">
                  <span className="text-white font-black text-xl tabular">{money(o.price, "USD")}</span>
                  <span className="text-slate-400 text-[11px]">{o.per}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={skip} className="w-full text-center text-[12px] text-slate-400 py-2.5">
          No, I want to continue without multiplying
        </button>
      </div>
    </main>
  );
}

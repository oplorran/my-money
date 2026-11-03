"use client";

import { useState } from "react";
import { BENEFITS, FAQ, FOR_YOU, INCLUDED, includedTotal, TESTIMONIALS } from "@/lib/quiz";
import { CHECKOUTS, TIER_DOWN, TIER_PRICE, checkoutUrl, goExternal } from "@/lib/funnel";
import type { PriceTier } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";
import { Cta } from "../ui/Button";

export function Offer({
  tier,
  firstName,
  onStart,
}: {
  tier: PriceTier;
  firstName: string;
  onStart: () => void;
}) {
  const [open, setOpen] = useState<number>(-1);
  const [down, setDown] = useState(false);

  const price = down ? TIER_DOWN[tier] : TIER_PRICE[tier];
  const anchor = includedTotal(TIER_PRICE[tier]);

  const go = () => {
    track("checkout_click", { tier, down, price, ...trackingParams() });
    goExternal(checkoutUrl(down ? CHECKOUTS[tier].down : CHECKOUTS[tier].full));
  };

  return (
    <div className="relative z-10 max-w-lg mx-auto px-5 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-700 text-[10px] font-bold tracking-wider">RECOMMENDATION READY</span>
        </div>
        <p className="text-slate-500 text-sm">
          {firstName ? `${firstName}, most people` : "Most people"} don&apos;t have a money problem:
        </p>
        <p className="text-lg font-bold text-slate-800">they&apos;re missing the right tools.</p>
      </div>

      <div className="qa-glass rounded-3xl p-5 mb-4">
        <p className="text-[11px] font-bold tracking-wider text-slate-400">YOUR PLAN TO USE AI</p>
        <p className="text-xl font-black text-slate-900 mb-3">Access built for your profile. Start today, at your own pace.</p>
        <ul className="space-y-2">
          {INCLUDED.map((item) => (
            <li key={item.label} className="flex items-start justify-between gap-2 text-[13px] text-slate-700">
              <span className="flex items-start gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
                {item.label}
              </span>
              <span className="text-[11px] text-slate-400 tabular shrink-0">${item.price}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-500">Total value</span>
          <span className="text-[12px] font-semibold text-slate-400 line-through tabular">${anchor}</span>
        </div>
      </div>

      <div className="qa-glass rounded-3xl p-5 mb-4">
        <p className="text-[11px] font-bold tracking-wider text-slate-400">YOUR PRICE TODAY</p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-black text-slate-900 tabular">${price.toFixed(2)}</span>
          <span className="text-[12px] font-semibold text-emerald-600">one-time</span>
        </div>
        <p className="text-[12px] text-slate-500 mb-3">
          {down
            ? "Reduced version — same access, lower entry."
            : "Full access, charged once. No subscription."}
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
            Secure payment
          </span>
          <span className="flex items-center gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            7-day guarantee
          </span>
        </div>
      </div>

      <Cta onClick={go} className="py-4 text-lg mc-cta">
        I want access now
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </Cta>

      {!down && (
        <button
          onClick={() => {
            setDown(true);
            track("offer_down", { tier, ...trackingParams() });
          }}
          className="w-full text-center text-[12px] text-slate-400 py-3"
        >
          Too expensive — show me the reduced version
        </button>
      )}

      <div className="qa-glass rounded-2xl p-4 mt-2 border border-emerald-200">
        <p className="font-bold text-slate-800 text-sm mb-1">7-day guarantee</p>
        <p className="text-[12px] text-slate-500">If it&apos;s not for you, we&apos;ll refund 100% of your money. No questions asked.</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 mt-5">
        {BENEFITS.map((b) => (
          <div key={b.title} className="qa-glass-soft rounded-2xl p-3.5">
            <p className="font-bold text-slate-800 text-sm">{b.title}</p>
            <p className="text-[12px] text-slate-500 mt-0.5">{b.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 mb-2 text-[11px] font-bold tracking-wider text-slate-400">THIS IS FOR YOU IF…</p>
      <ul className="space-y-1.5 mb-6">
        {FOR_YOU.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-slate-700">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
            {f}
          </li>
        ))}
      </ul>

      <p className="mb-2 text-[11px] font-bold tracking-wider text-slate-400">PEOPLE LIKE YOU ALREADY STARTED</p>
      <div className="space-y-2 mb-6">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="qa-glass-soft rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.avatar} flex items-center justify-center text-white text-xs font-bold`}>{t.i}</div>
              <div>
                <p className="text-[12px] font-bold text-slate-800">{t.name}</p>
                <p className="text-[10px] text-slate-400">{t.role}</p>
              </div>
            </div>
            <p className="text-[12px] text-slate-600">{t.text}</p>
          </div>
        ))}
      </div>

      <Cta onClick={go} className="py-4 text-lg mc-cta mb-6">
        Start today with a one-time payment
      </Cta>

      <p className="mb-2 text-[11px] font-bold tracking-wider text-slate-400">BEFORE YOU DECIDE</p>
      <div className="space-y-2 mb-6">
        {FAQ.map((f, i) => (
          <div key={f.q} className="qa-glass-soft rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between p-3.5 text-left">
              <span className="text-[13px] font-semibold text-slate-800">{f.q}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open === i ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {open === i && <p className="px-3.5 pb-3.5 text-[12px] text-slate-500">{f.a}</p>}
          </div>
        ))}
      </div>

      <button onClick={onStart} className="w-full text-center text-[12px] text-slate-400 py-3">Retake the quiz</button>
      <p className="text-center text-[10px] text-slate-400 leading-relaxed">
        This content is informational and educational. It does not guarantee financial results. All investing involves risk.
      </p>
    </div>
  );
}

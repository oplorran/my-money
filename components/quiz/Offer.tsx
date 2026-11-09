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
    <div className="relative z-10 mx-auto max-w-lg px-5 py-8">
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#a8ff16]/30 bg-[#a8ff16]/10 px-3 py-1">
          <span className="qa-ping h-1.5 w-1.5 rounded-full bg-[#a8ff16]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a8ff16]">RECOMMENDATION READY</span>
        </div>
        <p className="text-sm text-[#8fa3bd]">
          {firstName ? `${firstName}, most people` : "Most people"} don&apos;t have a money problem:
        </p>
        <p className="text-lg font-bold text-white">they&apos;re missing the right tools.</p>
      </div>

      <div className="qa-glass mb-4 rounded-[28px] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#63778f]">YOUR PLAN TO USE AI</p>
        <p className="mb-3 text-xl font-black text-white">Access built for your profile. Start today, at your own pace.</p>
        <ul className="space-y-2">
          {INCLUDED.map((item) => (
            <li key={item.label} className="flex items-start justify-between gap-2 text-[13px] text-[#c3d2e4]">
              <span className="flex items-start gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
                {item.label}
              </span>
              <span className="tabular shrink-0 text-[11px] text-[#63778f]">${item.price}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-[#202a3c] pt-3">
          <span className="text-[12px] font-semibold text-[#8fa3bd]">Total value</span>
          <span className="tabular text-[12px] font-semibold text-[#63778f] line-through">${anchor}</span>
        </div>
      </div>

      <div className="qa-glass mb-4 rounded-[28px] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#63778f]">YOUR PRICE TODAY</p>
        <div className="mb-1 flex items-baseline gap-2">
          <span className="tabular text-4xl font-black text-white">${price.toFixed(2)}</span>
          <span className="text-[12px] font-semibold text-[#a8ff16]">one-time</span>
        </div>
        <p className="mb-3 text-[12px] text-[#8fa3bd]">
          {down
            ? "Reduced version — same access, lower entry."
            : "Full access, charged once. No subscription."}
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-[#63778f]">
          <span className="flex items-center gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
            Secure payment
          </span>
          <span className="flex items-center gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            7-day guarantee
          </span>
        </div>
      </div>

      <Cta onClick={go} className="py-4 text-lg">
        I want access now
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </Cta>

      {!down && (
        <button
          onClick={() => {
            setDown(true);
            track("offer_down", { tier, ...trackingParams() });
          }}
          className="w-full py-3 text-center text-[12px] text-[#63778f]"
        >
          Too expensive — show me the reduced version
        </button>
      )}

      <div className="qa-glass-soft mt-2 rounded-2xl border-[#a8ff16]/25 p-4">
        <p className="mb-1 text-sm font-bold text-white">7-day guarantee</p>
        <p className="text-[12px] text-[#8fa3bd]">If it&apos;s not for you, we&apos;ll refund 100% of your money. No questions asked.</p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2.5">
        {BENEFITS.map((b) => (
          <div key={b.title} className="qa-glass-soft rounded-2xl p-3.5">
            <p className="text-sm font-bold text-white">{b.title}</p>
            <p className="mt-0.5 text-[12px] text-[#8fa3bd]">{b.desc}</p>
          </div>
        ))}
      </div>

      <p className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#63778f]">THIS IS FOR YOU IF…</p>
      <ul className="mb-6 space-y-1.5">
        {FOR_YOU.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-[#c3d2e4]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
            {f}
          </li>
        ))}
      </ul>

      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#63778f]">PEOPLE LIKE YOU ALREADY STARTED</p>
      <div className="mb-6 space-y-2">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="qa-glass-soft rounded-2xl p-3.5">
            <div className="mb-1.5 flex items-center gap-2">
              <img
                src={t.avatar}
                alt=""
                width={32}
                height={32}
                loading="lazy"
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-[#2a3448]"
              />
              <div>
                <p className="text-[12px] font-bold text-white">{t.name}</p>
                <p className="text-[10px] text-[#63778f]">{t.role}</p>
              </div>
            </div>
            <p className="text-[12px] text-[#8fa3bd]">{t.text}</p>
          </div>
        ))}
      </div>

      <Cta onClick={go} className="mb-6 py-4 text-lg">
        Start today with a one-time payment
      </Cta>

      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#63778f]">BEFORE YOU DECIDE</p>
      <div className="mb-6 space-y-2">
        {FAQ.map((f, i) => (
          <div key={f.q} className="qa-glass-soft overflow-hidden rounded-2xl">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between p-3.5 text-left">
              <span className="text-[13px] font-semibold text-white">{f.q}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#63778f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open === i ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {open === i && <p className="px-3.5 pb-3.5 text-[12px] text-[#8fa3bd]">{f.a}</p>}
          </div>
        ))}
      </div>

      <button onClick={onStart} className="w-full py-3 text-center text-[12px] text-[#63778f]">Retake the quiz</button>
      <p className="text-center text-[10px] leading-relaxed text-[#63778f]">
        This content is informational and educational. It does not guarantee financial results. All investing involves risk.
      </p>
    </div>
  );
}

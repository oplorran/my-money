"use client";

import { Logo, Stars } from "../marks";
import { track, trackingParams } from "@/lib/track";

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-10">
      <div className="text-center">
        <div className="qa-rise relative inline-flex">
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(168,255,22,.30), transparent 70%)" }} />
          <div className="qa-glass relative flex h-20 w-20 items-center justify-center rounded-[24px] px-2.5">
            <Logo height={40} variant="mark" priority />
          </div>
        </div>

        <div className="qa-rise qa-d1 mt-5">
          <div className="qa-glass-soft mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5">
            <span className="qa-ping h-2 w-2 rounded-full bg-[#a8ff16]" />
            <span className="text-xs font-semibold tracking-wide text-[#8fa3bd]">QUIZ · AI · FINANCE</span>
          </div>
          <h1 className="mb-3 text-[26px] font-black leading-[1.1] tracking-tight text-white sm:text-4xl">
            Discover how <span className="qa-accent-2">Artificial Intelligence</span> can help you with your finances
          </h1>
          <p className="mx-auto max-w-md text-base text-[#8fa3bd]">Discover your profile for the new digital era in 2 minutes.</p>
        </div>

        <div className="qa-glass qa-rise qa-d3 mt-5 rounded-3xl p-4 text-left">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#63778f]">How it works</p>
          <div className="flex items-start justify-between gap-2">
            {[
              { t: "Answer", d: "10 quick questions" },
              { t: "We analyze", d: "AI evaluates your profile" },
              { t: "Get", d: "Your personalized plan" },
            ].map((s, i) => (
              <div key={s.t} className="relative flex flex-1 flex-col items-center">
                {i < 2 && <div className="absolute left-1/2 top-6 h-[2px] w-full bg-[#202a3c]" />}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2a3448] bg-[#101827]">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 ? "bg-[#a8ff16] text-[#090909]" : "bg-[#162132] text-[#8fa3bd]"}`}>{i + 1}</span>
                </div>
                <div className="mt-2.5 text-sm font-bold text-white">{s.t}</div>
                <div className="mt-0.5 text-center text-[11px] leading-tight text-[#8fa3bd]">{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="qa-rise qa-d4 mt-5 space-y-3.5">
          <button
            onClick={() => { track("landing_start", trackingParams()); onStart(); }}
            className="qa-cta relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[18px] py-4 text-xl font-bold transition-transform active:scale-[.98]"
          >
            <span aria-hidden className="qa-shine" />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
              <path d="M9.9 15.5a2 2 0 0 0-1.4-1.4l-6.1-1.6a.5.5 0 0 1 0-1l6.1-1.5A2 2 0 0 0 9.9 8.5l1.6-6.1a.5.5 0 0 1 1 0l1.5 6.1a2 2 0 0 0 1.4 1.4l6.1 1.6a.5.5 0 0 1 0 1l-6.1 1.5a2 2 0 0 0-1.4 1.4l-1.6 6.1a.5.5 0 0 1-1 0z" />
            </svg>
            <span className="relative z-10">Start the quiz</span>
          </button>

          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2.5">
              {["M", "S", "J", "A", "L"].map((l) => (
                <div key={l} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0a0c09] bg-[#162132] text-xs font-bold text-[#a8ff16]">{l}</div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <Stars />
                <span className="ml-1 text-xs font-bold text-white">4.9</span>
              </div>
              <div className="text-[11px] text-[#63778f]">15,000+ people have already taken it</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

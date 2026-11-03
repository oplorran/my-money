"use client";

import { Mark, Stars } from "../marks";
import { track, trackingParams } from "@/lib/track";

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative z-10 max-w-lg mx-auto px-5 py-10 min-h-screen flex flex-col justify-center">
      <div className="text-center">
        <div className="relative inline-flex qa-rise">
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(99,102,241,.5), transparent 70%)" }} />
          <div className="relative w-20 h-20 rounded-[24px] qa-glass flex items-center justify-center">
            <Mark size={52} uid="hero" />
          </div>
        </div>

        <div className="mt-5 qa-rise qa-d1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full qa-glass-soft mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 text-xs font-semibold tracking-wide">QUIZ · AI · FINANCE</span>
          </div>
          <h1 className="text-[26px] sm:text-4xl font-black text-slate-900 leading-[1.1] mb-3 tracking-tight">
            Discover how{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">Artificial Intelligence</span>{" "}
            can help you with your finances
          </h1>
          <p className="text-slate-500 text-base max-w-md mx-auto">Discover your profile for the new digital era in 2 minutes.</p>
        </div>

        <div className="qa-glass rounded-3xl p-4 mt-5 qa-rise qa-d3 text-left">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 mb-3">HOW IT WORKS</p>
          <div className="flex items-start justify-between gap-2">
            {[
              { t: "Answer", d: "10 quick questions" },
              { t: "We analyze", d: "AI evaluates your profile" },
              { t: "Get", d: "Your personalized plan" },
            ].map((s, i) => (
              <div key={s.t} className="flex-1 flex flex-col items-center relative">
                {i < 2 && <div className="absolute top-6 left-1/2 w-full h-[2px] bg-gradient-to-r from-indigo-200 to-transparent" />}
                <div className="relative w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center z-10">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <div className="mt-2.5 font-bold text-slate-800 text-sm">{s.t}</div>
                <div className="text-[11px] text-slate-400 leading-tight mt-0.5 text-center">{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3.5 qa-rise qa-d4">
          <button onClick={() => { track("landing_start", trackingParams()); onStart(); }} className="relative overflow-hidden w-full rounded-2xl font-bold flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 text-white shadow-[0_18px_40px_-10px_rgba(99,102,241,.6)] py-4 text-xl active:scale-[.98] transition-transform">
            <span aria-hidden className="qa-shine" />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
              <path d="M9.9 15.5a2 2 0 0 0-1.4-1.4l-6.1-1.6a.5.5 0 0 1 0-1l6.1-1.5A2 2 0 0 0 9.9 8.5l1.6-6.1a.5.5 0 0 1 1 0l1.5 6.1a2 2 0 0 0 1.4 1.4l6.1 1.6a.5.5 0 0 1 0 1l-6.1 1.5a2 2 0 0 0-1.4 1.4l-1.6 6.1a.5.5 0 0 1-1 0z" />
            </svg>
            <span className="relative z-10">Start the quiz</span>
          </button>

          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2.5">
              {["M", "S", "J", "A", "L"].map((l, i) => (
                <div key={l} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${["from-indigo-500 to-violet-600", "from-cyan-500 to-blue-600", "from-fuchsia-500 to-purple-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600"][i]}`}>{l}</div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <Stars />
                <span className="text-xs font-bold text-slate-700 ml-1">4.9</span>
              </div>
              <div className="text-[11px] text-slate-400">15,000+ people have already taken it</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
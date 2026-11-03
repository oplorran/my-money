"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Evaluating your relationship with money...",
  "Measuring your comfort with technology...",
  "Building your digital profile...",
  "Preparing your recommendations...",
];

export function Analyzing() {
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length));
    }, 900);
    const p = setInterval(() => {
      setPct((v) => Math.min(v + 3, 100));
    }, 45);
    return () => { clearInterval(t); clearInterval(p); };
  }, []);

  return (
    <div className="text-center py-8">
      <div className="relative w-32 h-32 mx-auto mb-8">
        <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
          <circle cx="60" cy="60" r="52" stroke="#e2e8f0" strokeWidth="8" fill="none" />
          <circle
            cx="60" cy="60" r="52" stroke="url(#pg)" strokeWidth="8" fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 52}
            strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)}
            className="transition-all duration-200"
          />
          <defs>
            <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-800 tabular">{Math.round(pct)}%</span>
          <span className="text-[10px] font-bold tracking-wider text-slate-400">ANALYZING</span>
        </div>
      </div>

      <div className="space-y-2 text-left max-w-xs mx-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${i < step ? "bg-emerald-500" : i === step ? "bg-indigo-500 animate-pulse" : "bg-slate-200"}`}>
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              ) : null}
            </span>
            <span className={`text-[13px] ${i <= step ? "text-slate-700" : "text-slate-400"}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
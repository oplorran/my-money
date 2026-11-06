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
    <div className="py-8 text-center">
      <div className="relative mx-auto mb-8 h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
          <circle cx="60" cy="60" r="52" stroke="#1b1b1d" strokeWidth="8" fill="none" />
          <circle
            cx="60" cy="60" r="52" stroke="#a8ff16" strokeWidth="8" fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 52}
            strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)}
            className="transition-all duration-200"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-3xl font-black text-white">{Math.round(pct)}%</span>
          <span className="text-[10px] font-bold tracking-[0.16em] text-[#666666]">ANALYZING</span>
        </div>
      </div>

      <div className="mx-auto max-w-xs space-y-2 text-left">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2.5">
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              i < step ? "bg-[#a8ff16]" : i === step ? "animate-pulse border border-[#a8ff16] bg-[#151b0d]" : "bg-[#1b1b1d]"
            }`}>
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              ) : null}
            </span>
            <span className={`text-[13px] ${i <= step ? "text-[#cccccc]" : "text-[#666666]"}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

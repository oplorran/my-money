"use client";

import { useState } from "react";
import { Cta } from "../ui/Button";

const TIERS = [
  { color: "#ef4444", label: "It's a struggle", note: "Let's start from zero — that's fine." },
  { color: "#f59e0b", label: "Getting there", note: "You're on the way." },
  { color: "#10b981", label: "Very comfortable", note: "Great — we'll build on that." },
];

export function Scale({
  question, low, high, initial, onCommit,
}: {
  question: string; low: string; high: string; initial?: number; onCommit: (v: number) => void;
}) {
  const [v, setV] = useState<number>(typeof initial === "number" ? initial : 50);
  const tier = v <= 33 ? 0 : v <= 66 ? 1 : 2;
  const t = TIERS[tier];
  const bg = `linear-gradient(to right, ${t.color} ${v}%, rgba(148,163,184,.22) ${v}%)`;

  return (
    <div>
      <p className="text-xl font-bold text-slate-900 mb-6 leading-snug">{question}</p>
      <div className="qa-glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${t.color}1a` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l5-5 4 3 6-7" />
            </svg>
          </div>
          <span className="text-2xl font-black tabular" style={{ color: t.color }}>
            {Math.round(v)}<span className="text-sm text-slate-400">/100</span>
          </span>
        </div>
        <input
          type="range" min={0} max={100} value={v}
          onChange={(e) => setV(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: bg }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-[11px] text-slate-400">{low}</span>
          <span className="text-[11px] text-slate-400">{high}</span>
        </div>
        <p className="mt-3 text-[13px] font-semibold" style={{ color: t.color }}>{t.label} — {t.note}</p>
      </div>
      <Cta onClick={() => onCommit(v)} className="mt-4 py-3.5 text-base">Confirm</Cta>
    </div>
  );
}
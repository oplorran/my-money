"use client";

import { useState } from "react";
import { Cta } from "../ui/Button";

const TIERS = [
  { color: "#888888", label: "It's a struggle", note: "Let's start from zero — that's fine." },
  { color: "#cccccc", label: "Getting there", note: "You're on the way." },
  { color: "#a8ff16", label: "Very comfortable", note: "Great — we'll build on that." },
];

export function Scale({
  question, low, high, initial, onCommit,
}: {
  question: string; low: string; high: string; initial?: number; onCommit: (v: number) => void;
}) {
  const [v, setV] = useState<number>(typeof initial === "number" ? initial : 50);
  const tier = v <= 33 ? 0 : v <= 66 ? 1 : 2;
  const t = TIERS[tier];
  const bg = `linear-gradient(to right, ${t.color} ${v}%, #1b1b1d ${v}%)`;

  return (
    <div>
      <p className="mb-6 text-xl font-bold leading-snug text-white">{question}</p>
      <div className="qa-glass rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#303030] bg-[#111111]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l5-5 4 3 6-7" />
            </svg>
          </div>
          <span className="tabular text-2xl font-black" style={{ color: t.color }}>
            {Math.round(v)}<span className="text-sm text-[#666666]">/100</span>
          </span>
        </div>
        <input
          type="range" min={0} max={100} value={v}
          onChange={(e) => setV(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full"
          style={{ background: bg }}
        />
        <div className="mt-2 flex justify-between">
          <span className="text-[11px] text-[#666666]">{low}</span>
          <span className="text-[11px] text-[#666666]">{high}</span>
        </div>
        <p className="mt-3 text-[13px] font-semibold" style={{ color: t.color }}>{t.label} — {t.note}</p>
      </div>
      <Cta onClick={() => onCommit(v)} className="mt-4 py-3.5 text-base">Confirm</Cta>
    </div>
  );
}

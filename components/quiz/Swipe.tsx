"use client";

import { useState } from "react";
import type { SwipeValues } from "@/lib/quiz";
import { Cta } from "../ui/Button";

/** Serializa os cartões como "10110": 1 = combina, 0 = não, "-" = não respondido. */
function serialize(vals: (boolean | null)[]) {
  return vals.map((v) => (v === null ? "-" : v ? "1" : "0")).join("");
}

function parse(initial?: string | number): (boolean | null)[] | null {
  if (typeof initial !== "string" || !initial) return null;
  return initial.split("").map((c) => (c === "1" ? true : c === "0" ? false : null));
}

export function Swipe({
  cards,
  initial,
  onDone,
}: {
  cards: string[];
  initial?: string | number;
  onDone: (values: SwipeValues) => void;
}) {
  const [vals, setVals] = useState<(boolean | null)[]>(
    () => parse(initial) ?? cards.map(() => null),
  );
  const decided = vals.filter((v) => v !== null).length;
  const remaining = vals.filter((v) => v === null).length;

  const set = (i: number, truth: boolean) => {
    setVals((prev) => prev.map((v, idx) => (idx === i ? truth : v)));
  };

  const submit = () => {
    const out: SwipeValues = {};
    vals.forEach((v, i) => {
      if (v !== null) out[i] = v;
    });
    onDone(out);
  };

  return (
    <div>
      <p className="text-[11px] font-bold tracking-wider text-slate-400 mb-1">SWIPE</p>
      <p className="text-xl font-bold text-slate-900 mb-1">Swipe the cards based on what feels true</p>
      <p className="text-[13px] text-slate-400 mb-4">Right for yes, left for no — {remaining} left</p>

      <div className="space-y-2.5 mb-4">
        {cards.map((card, i) => {
          const v = vals[i];
          return (
            <div
              key={card}
              className={`qa-glass-soft rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-opacity ${v === null ? "" : "opacity-70"}`}
            >
              <p className="text-[13px] font-medium text-slate-700 leading-snug">{card}</p>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => set(i, false)}
                  aria-label="No"
                  aria-pressed={v === false}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border ${v === false ? "bg-rose-500 border-rose-500 text-white" : "bg-white/70 border-slate-200 text-slate-400"}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
                <button
                  onClick={() => set(i, true)}
                  aria-label="Yes"
                  aria-pressed={v === true}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border ${v === true ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white/70 border-slate-200 text-slate-400"}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Cta onClick={submit} disabled={decided === 0} className="py-3.5 text-base">
        Continue ({decided}/{cards.length})
      </Cta>
      {decided < cards.length && decided > 0 && (
        <p className="text-center text-[11px] text-slate-400 mt-2">
          {serialize(vals)} · responda todos para um resultado mais preciso
        </p>
      )}
    </div>
  );
}

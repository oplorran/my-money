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
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#666666]">Swipe</p>
      <p className="mb-1 text-xl font-bold text-white">Swipe the cards based on what feels true</p>
      <p className="mb-4 text-[13px] text-[#888888]">Right for yes, left for no — {remaining} left</p>

      <div className="mb-4 space-y-2.5">
        {cards.map((card, i) => {
          const v = vals[i];
          return (
            <div
              key={card}
              className={`qa-glass-soft flex items-center justify-between gap-3 p-3.5 transition-opacity ${v === null ? "" : "opacity-70"}`}
            >
              <p className="text-[13px] font-medium leading-snug text-[#cccccc]">{card}</p>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => set(i, false)}
                  aria-label="No"
                  aria-pressed={v === false}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                    v === false ? "border-[#303030] bg-[#1b1b1d] text-white" : "border-[#303030] bg-[#111111] text-[#666666]"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
                <button
                  onClick={() => set(i, true)}
                  aria-label="Yes"
                  aria-pressed={v === true}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                    v === true ? "border-[#a8ff16] bg-[#a8ff16] text-[#090909]" : "border-[#303030] bg-[#111111] text-[#666666]"
                  }`}
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
        <p className="mt-2 text-center text-[11px] text-[#666666]">
          {serialize(vals)} · responda todos para um resultado mais preciso
        </p>
      )}
    </div>
  );
}

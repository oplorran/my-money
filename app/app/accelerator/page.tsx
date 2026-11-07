"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DEDICATIONS,
  GOALS,
  PACES,
  cue,
  pocketUrl,
  projections,
  recommendCapital,
  usd,
} from "@/lib/member";
import { session, useSession } from "@/lib/session-store";

type Stage = "intro" | "goal" | "pace" | "time" | "result";

const STAGES: Stage[] = ["goal", "pace", "time"];

function Segments({ stage }: { stage: Stage }) {
  const index = STAGES.indexOf(stage);
  return (
    <div className="flex gap-1.5" aria-hidden>
      {STAGES.map((s, i) => (
        <span key={s} className={`ma-seg ${i <= index ? "ma-seg-on" : ""}`} />
      ))}
    </div>
  );
}

function Choice({
  icon,
  label,
  note,
  on,
  onClick,
}: {
  icon: string;
  label: string;
  note?: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ma-choice flex w-full items-center gap-3.5 p-4 text-left ${on ? "ma-choice-on" : ""}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#303030] bg-[#1b1b1d] text-[17px]">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-[14.5px] font-semibold text-white">{label}</span>
        {note && <span className="mt-0.5 block text-[11px] text-[#888888]">{note}</span>}
      </span>
      <svg className="ma-choice-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );
}

export default function Accelerator() {
  const { member, plan } = useSession();
  const [stage, setStage] = useState<Stage>("intro");
  const [goal, setGoal] = useState<number | null>(null);
  const [pace, setPace] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const paceOpt = PACES.find((p) => p.id === pace);
  const timeOpt = DEDICATIONS.find((d) => d.id === time);

  const finish = (timeId: string) => {
    const t = DEDICATIONS.find((d) => d.id === timeId);
    if (!goal || !paceOpt || !t) return;
    const capital = recommendCapital(goal, paceOpt.weight, t.weight);
    session.setPlan({ goal, months: paceOpt.label, dedicated: t.label, capital });
    setStage("result");
    cue("win");
  };

  const restart = () => {
    session.resetPlan();
    setGoal(null);
    setPace(null);
    setTime(null);
    setStage("goal");
    cue("tap");
  };

  if (stage === "intro") {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-5">
        <div className="ma-in text-center">
          <span className="ma-badge mb-4">Goal accelerator</span>
          <div className="ma-card mt-2 p-6">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#a8ff16]/35 bg-[#a8ff16]/12 text-[#a8ff16]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
              </svg>
            </span>
            <h1 className="text-[21px] font-black leading-tight text-white">
              Want to reach your financial goal faster?
            </h1>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#888888]">
              In three quick steps, AI will create a personalized plan so you reach your goal faster than you think.
            </p>

            {plan && (
              <div className="mt-4 rounded-[16px] border border-[#a8ff16]/25 bg-[#151b0d] p-3.5 text-left">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#a8ff16]">Last simulation</p>
                <p className="mt-1.5 text-[12.5px] text-[#cccccc]">
                  {usd(plan.goal)}
                  <span className="text-[#666666]">/mo</span> · {plan.months} · {usd(plan.capital)} recommended
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setStage("goal");
                cue("tap");
              }}
              className="mc-cta mt-5 w-full rounded-[16px] py-3.5 text-[14px] font-bold"
            >
              Start now
            </button>
          </div>
        </div>

        <p className="ma-in mt-4 text-center text-[11px] leading-relaxed text-[#666666]">
          Takes 1 minute. You can redo the simulation anytime.
        </p>
      </div>
    );
  }

  if (stage === "result" && plan) {
    const rows = projections(plan.capital, plan.goal);
    const fastest = rows[rows.length - 1];
    const planMonths = rows.find((r) => r.value === plan.capital)?.months ?? rows[1].months;
    return (
      <div className="mx-auto w-full max-w-md px-4 py-5">
        <div className="ma-in">
          <span className="ma-badge mb-3">Recommended capital</span>
          <div className="ma-card p-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666666]">To reach</p>
            <p className="mt-1 text-[13px] font-semibold text-[#cccccc]">
              {usd(plan.goal)}
              <span className="text-[#888888]">/mo</span> in {plan.months}
            </p>
            <p className="ma-count mt-4 text-[42px] font-black leading-none tracking-tight text-[#a8ff16]">
              {usd(plan.capital)}
            </p>
            <p className="mt-1.5 text-[11px] text-[#666666]">starting capital</p>

            <div className="ma-hairline my-5" />

            <p className="mb-2.5 text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#666666]">Projection</p>
            <ul className="space-y-1.5">
              {rows.map((r) => {
                const on = r.value === plan.capital;
                return (
                  <li
                    key={r.value}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 ${
                      on ? "border-[#a8ff16]/40 bg-[#151b0d]" : "border-[#303030] bg-[#0d0d0d]"
                    }`}
                  >
                    <span className={`text-[13px] font-bold ${on ? "text-[#a8ff16]" : "text-white"}`}>
                      {usd(r.value)}
                    </span>
                    <span className="text-[11.5px] text-[#888888]">{r.months} mo</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-[#888888]">
              With {usd(fastest.value)} you get there {fastest.months < planMonths ? `${Math.round((planMonths / fastest.months) * 10) / 10}x faster` : `in ${fastest.months} months`}.
            </p>
          </div>

          <a
            href={pocketUrl(member?.email)}
            target="_blank"
            rel="noreferrer"
            className="mc-cta mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] py-3.5 text-[14px] font-bold"
          >
            Go to Pocket
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </a>

          <button
            type="button"
            onClick={restart}
            className="mt-2.5 w-full rounded-[16px] border border-[#303030] bg-[#1b1b1d] py-3 text-[12.5px] font-semibold text-white"
          >
            Run another simulation
          </button>

          <Link
            href="/app/inicio"
            className="mt-3 block text-center text-[11.5px] text-[#888888] underline decoration-[#303030] underline-offset-4"
          >
            Need help? Review Lesson 02 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-5">
      <div className="ma-in">
        <span className="ma-badge mb-3">Goal accelerator</span>
        <div className="mb-4 flex items-center gap-3">
          <Segments stage={stage} />
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-[#666666]">
            Step {STAGES.indexOf(stage) + 1} of 3
          </span>
        </div>

        {stage === "goal" && (
          <>
            <h1 className="text-[21px] font-black leading-tight text-white">
              How much do you want to earn per month?
            </h1>
            <p className="mt-1.5 text-[12px] text-[#888888]">Choose your monthly target.</p>
            <div className="mt-5 space-y-2.5">
              {GOALS.map((g) => (
                <Choice
                  key={g.value}
                  icon={g.icon}
                  label={g.label}
                  on={goal === g.value}
                  onClick={() => {
                    setGoal(g.value);
                    setStage("pace");
                    cue("tap");
                  }}
                />
              ))}
            </div>
          </>
        )}

        {stage === "pace" && (
          <>
            <h1 className="text-[21px] font-black leading-tight text-white">
              How fast do you want to reach {usd(goal ?? 0)}
              <span className="text-[#888888]">/mo</span>?
            </h1>
            <p className="mt-1.5 text-[12px] text-[#888888]">
              The faster the goal, the more starting capital you need.
            </p>
            <div className="mt-5 space-y-2.5">
              {PACES.map((p) => (
                <Choice
                  key={p.id}
                  icon={p.icon}
                  label={p.label}
                  note={p.note}
                  on={pace === p.id}
                  onClick={() => {
                    setPace(p.id);
                    setStage("time");
                    cue("tap");
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStage("goal")}
              className="mt-4 text-[11.5px] text-[#888888] underline decoration-[#303030] underline-offset-4"
            >
              Back
            </button>
          </>
        )}

        {stage === "time" && (
          <>
            <h1 className="text-[21px] font-black leading-tight text-white">
              How much time can you dedicate per day?
            </h1>
            <p className="mt-1.5 text-[12px] text-[#888888]">This shapes how many trades you take.</p>
            <div className="mt-5 space-y-2.5">
              {DEDICATIONS.map((d) => (
                <Choice
                  key={d.id}
                  icon={d.icon}
                  label={d.label}
                  note={d.note}
                  on={time === d.id}
                  onClick={() => {
                    setTime(d.id);
                    finish(d.id);
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStage("pace")}
              className="mt-4 text-[11.5px] text-[#888888] underline decoration-[#303030] underline-offset-4"
            >
              Back
            </button>
            {timeOpt && (
              <p className="mt-3 text-[10.5px] text-[#666666]">
                Selected: {timeOpt.label} · {timeOpt.note}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

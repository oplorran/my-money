"use client";

import { useMemo, useState } from "react";
import { INSIGHTS, pickProfile, QUESTIONS } from "@/lib/quiz";
import type { SwipeValues } from "@/lib/quiz";
import { readState, resetState, tierFor, writeState } from "@/lib/funnel";
import type { Answers } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";
import { Landing } from "./Landing";
import { Swipe } from "./Swipe";
import { Scale } from "./Scale";
import { Analyzing } from "./Analyzing";
import { Result } from "./Result";
import { Offer } from "./Offer";
import { Progress } from "../ui/Progress";
import { Cta } from "../ui/Button";
import type { Stage } from "./types";

const LAST_INDEX = QUESTIONS.length - 1;

export function Quiz() {
  const [stage, setStage] = useState<Stage>("landing");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [text, setText] = useState("");
  const [firstName] = useState(() => readState().firstName);

  const profile = useMemo(() => pickProfile(answers), [answers]);
  const tier = useMemo(() => tierFor(computeScore(answers)), [answers]);

  const finish = (current: Answers) => {
    const score = computeScore(current);
    const nextTier = tierFor(score);
    writeState({ score, tier: nextTier });
    track("quiz_complete", { score, tier: nextTier, ...trackingParams() });
    setStage("analyzing");
    setTimeout(() => setStage("result"), 4200);
  };

  const start = () => {
    resetState();
    writeState({ startedAt: Date.now() });
    setAnswers({});
    setIndex(0);
    setText("");
    track("quiz_start", trackingParams());
    setStage("question");
  };

  const commit = (id: string, value: string | number) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    writeState({ answers: next });

    const q = QUESTIONS[index];
    track("quiz_answer", { question: q.id, block: q.block, index });

    // respiro entre blocos: fim do bloco 1 (índice 3) e do bloco 2 (índice 8)
    if (q.block === 1 && index === 3) return setStage("insight");
    if (q.block === 2 && index === 8) return setStage("insight");
    advance(next);
  };

  const advance = (current: Answers = answers) => {
    const nextIndex = index + 1;
    if (nextIndex > LAST_INDEX) {
      finish(current);
      return;
    }
    setIndex(nextIndex);
    setText(String(current[QUESTIONS[nextIndex].id] ?? ""));
  };

  const afterInsight = () => {
    setStage("question");
    advance();
  };

  if (stage === "landing") return <Landing onStart={start} />;

  if (stage === "analyzing") {
    return (
      <div className="relative z-10 max-w-lg mx-auto px-5 min-h-screen flex flex-col justify-center">
        <Analyzing />
      </div>
    );
  }

  if (stage === "result") {
    return (
      <div className="relative z-10 max-w-lg mx-auto px-5 py-10 min-h-screen flex flex-col justify-center">
        <Result profile={profile} onContinue={() => setStage("offer")} />
      </div>
    );
  }

  if (stage === "offer") {
    return (
      <Offer
        tier={tier}
        firstName={firstName}
        onStart={() => setStage("landing")}
      />
    );
  }

  if (stage === "insight") {
    const block = QUESTIONS[index].block;
    const insight = INSIGHTS[block - 1] ?? INSIGHTS[0];
    return (
      <div className="relative z-10 max-w-lg mx-auto px-5 py-10 min-h-screen flex flex-col justify-center">
        <div className="qa-glass rounded-3xl p-6 qa-rise">
          <p className="text-[11px] font-bold tracking-[0.18em] text-indigo-500 mb-2">DID YOU KNOW?</p>
          <p className="text-lg font-bold text-slate-900 leading-snug mb-2">Technology changed the rules</p>
          <p className="text-sm text-slate-600 leading-relaxed">{insight}</p>
        </div>
        <Cta onClick={afterInsight} className="mt-4 py-3.5 text-base">
          Continue
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Cta>
      </div>
    );
  }

  const q = QUESTIONS[index];
  const current = index + 1;

  return (
    <div className="relative z-10 max-w-lg mx-auto px-5 py-6 min-h-screen flex flex-col">
      <Progress current={current} total={QUESTIONS.length} />
      <div className="flex-1">
        {q.type === "swipe" && (
          <Swipe
            cards={q.cards}
            initial={answers[q.id]}
            onDone={(values) => commit(q.id, serializeSwipe(values))}
          />
        )}
        {q.type === "scale" && (
          <Scale
            question={q.question}
            low={q.low}
            high={q.high}
            initial={answers[q.id] as number}
            onCommit={(v) => commit(q.id, v)}
          />
        )}
        {q.type === "choice" && (
          <div>
            <p className="text-xl font-bold text-slate-900 mb-5 leading-snug">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => commit(q.id, opt)}
                  className={`qa-choice w-full text-left rounded-2xl p-4 border transition-all active:scale-[.99] ${answers[q.id] === opt ? "qa-choice-on" : "qa-choice-off"}`}
                >
                  <span className="text-[14px] font-medium text-slate-800">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {q.type === "text" && (
          <div>
            <p className="text-xl font-bold text-slate-900 mb-5 leading-snug">{q.question}</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={q.placeholder}
              rows={4}
              className="qa-glass-soft w-full rounded-2xl p-4 text-sm text-slate-800 outline-none resize-none placeholder:text-slate-400"
            />
            <Cta onClick={() => commit(q.id, text)} disabled={text.trim().length < 3} className="mt-3 py-3.5 text-base">
              Continue
            </Cta>
          </div>
        )}
      </div>
    </div>
  );
}

function serializeSwipe(values: SwipeValues) {
  const size = 5;
  let out = "";
  for (let i = 0; i < size; i++) out += values[i] === true ? "1" : values[i] === false ? "0" : "-";
  return out;
}

function computeScore(a: Answers) {
  let s = 0;
  const q1 = String(a.q1 ?? "");
  if (q1.startsWith("I want")) s += 1;
  const q3 = String(a.q3 ?? "");
  if (q3 === "Earn extra income") s += 1;
  if (q3 === "Reach financial freedom") s += 2;
  const q4 = Number(a.q4 ?? 50);
  if (q4 > 66) s += 1;
  const q8 = String(a.q8 ?? "");
  if (q8.startsWith("For social")) s += 0;
  else if (q8.startsWith("A lot")) s += 1;
  else if (q8.startsWith("All the time")) s += 1;
  const q10 = String(a.q10 ?? "");
  if (q10.includes("investing")) s += 1;
  if (q10.includes("everything")) s += 1;
  return s;
}

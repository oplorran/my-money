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
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5">
        <Analyzing />
      </div>
    );
  }

  if (stage === "result") {
    return (
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-10">
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
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-10">
        <div className="qa-glass qa-rise rounded-3xl p-6">
          <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-[#a8ff16]">DID YOU KNOW?</p>
          <p className="mb-2 text-lg font-bold leading-snug text-white">Technology changed the rules</p>
          <p className="text-sm leading-relaxed text-[#8fa3bd]">{insight}</p>
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
    <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col px-5 py-6">
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
            <p className="mb-5 text-xl font-bold leading-snug text-white">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => commit(q.id, opt)}
                  className={`qa-choice w-full rounded-2xl border p-4 text-left transition-all active:scale-[.99] ${answers[q.id] === opt ? "qa-choice-on" : ""}`}
                >
                  <span className="text-[14px] font-medium text-[#c3d2e4]">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {q.type === "text" && (
          <div>
            <p className="mb-5 text-xl font-bold leading-snug text-white">{q.question}</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={q.placeholder}
              rows={4}
              className="w-full resize-none rounded-[20px] border border-[#2a3448] bg-[#101827] p-4 text-sm text-white outline-none placeholder:text-[#63778f] focus:border-[#a8ff16]/55"
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

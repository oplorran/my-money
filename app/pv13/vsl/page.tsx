"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SCRIPT, VOICE } from "@/lib/voice";
import { useVoice } from "@/lib/useVoice";
import { cleanName, prefetchName } from "@/lib/name";
import { useRingtone } from "@/lib/useRingtone";
import { tierFor, writeState } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

type Phase = "ringing" | "live" | "ended";

export default function VslPage() {
  const router = useRouter();
  const { play, prime, skip, stop, speaking, muted, setMuted, setName: setSpokenName } = useVoice();
  const { start: startRing, nudge: nudgeRing, stop: stopRing, beep } = useRingtone();
  const [phase, setPhase] = useState<Phase>("ringing");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [caption, setCaption] = useState("");
  const [score, setScore] = useState(0);
  const [pendingTier, setPendingTier] = useState<"17" | "27" | "47" | "67" | "97">("47");
  const [elapsed, setElapsed] = useState("00:00");
  const running = useRef(false);
  const gen = useRef(0);
  const branchRef = useRef<Record<string, string>>({});

  const node = SCRIPT[step];

  const playIds = useCallback(
    async (ids: number[], my: number) => {
      for (const id of ids) {
        if (gen.current !== my) return;
        const line = VOICE[id];
        if (!line) continue;
        const words = line.text.split(/\s+/);
        let shown = -1;
        setCaption("");
        // o áudio dita o ritmo: as palavras aparecem conforme são faladas
        await play(id, (ratio) => {
          const n = Math.min(words.length, Math.max(1, Math.ceil(ratio * words.length)));
          if (n === shown) return;
          shown = n;
          setCaption(words.slice(0, n).join(" "));
        });
      }
      if (gen.current === my) setCaption("");
    },
    [play],
  );

  useEffect(() => {
    if (phase !== "ringing") return;
    // o contexto de áudio nasce no primeiro gesto; aqui só tentamos (o navegador pode segurar)
    startRing();
    const arm = () => {
      nudgeRing();
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
    window.addEventListener("pointerdown", arm);
    window.addEventListener("keydown", arm);
    return () => {
      stopRing();
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, [phase, startRing, nudgeRing, stopRing]);

  // cronômetro da ligação
  useEffect(() => {
    if (phase !== "live") return;
    const t0 = Date.now();
    const id = window.setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000);
      setElapsed(
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`,
      );
    }, 500);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "live" || !node || running.current) return;
    running.current = true;
    const my = ++gen.current;
    const alive = () => gen.current === my;

    (async () => {
      if (node.k === "say") {
        await playIds(node.ids, my);
        if (alive()) setStep((s) => s + 1);
      } else if (node.k === "branch") {
        // p2 usa o branch escolhido; p4 usa o score da opção (2 = ativar, 0 = dúvida)
        const key =
          node.by === "p4"
            ? String(answers[node.by] ?? "")
            : branchRef.current[node.by] ?? String(answers[node.by] ?? "");
        const ids = node.map[key] ?? node.map["extra"] ?? [];
        await playIds(ids, my);
        if (alive()) setStep((s) => s + 1);
      } else if (node.k === "ask") {
        const question = node.id === "p0" ? "What's your first name?" : node.question;
        setCaption(question);
        if (node.id === "p0") {
          await play(5);
          await play(99);
        } else {
          await play(98);
        }
        if (alive()) setCaption(question);
      } else if (node.k === "end") {
        const total = Object.values(answers).reduce((a, b) => a + b, 0);
        const tier = tierFor(total);
        setScore(total);
        setPendingTier(tier);
        writeState({ score: total, tier });
        track("vsl_complete", { score: total, tier, ...trackingParams() });
        setPhase("ended");
      }
      if (alive()) running.current = false;
    })();
  }, [phase, node, answers, play, playIds]);

  const answer = () => {
    stopRing();
    beep(880, 0.14);
    setElapsed("00:00");
    prime();
    track("vsl_answer", trackingParams());
    setPhase("live");
  };

  const decline = () => {
    stopRing();
    beep(320, 0.16);
    track("vsl_decline", trackingParams());
    stop();
    // a tela continua tocando: dá um respiro e o toque volta
    window.setTimeout(() => nudgeRing(), 500);
  };

  const hangUp = () => {
    stopRing();
    beep(320, 0.18);
    track("vsl_hangup", { step, ...trackingParams() });
    stop();
    setPhase("ringing");
    setElapsed("00:00");
    running.current = false;
    gen.current++;
    setStep(0);
    setCaption("");
  };

  const answerOpt = (id: string, opt: { score: number; branch?: string }) => {
    beep(1200, 0.05);
    skip();
    // invalida a continuação pendente da fala em andamento
    gen.current++;
    running.current = false;
    if (opt.branch) branchRef.current[id] = opt.branch;
    setAnswers((prev) => ({ ...prev, [id]: opt.score }));
    setCaption("");
    setStep((s) => s + 1);
  };

  const submitName = () => {
    skip();
    gen.current++;
    running.current = false;
    const v = cleanName(nameInput);
    if (v.length < 2) return;
    setName(v);
    setSpokenName(v);
    writeState({ firstName: v });
    track("vsl_name", { ...trackingParams() });
    setCaption("");
    setStep((s) => s + 1);
  };

  const toWithdraw = () => {
    writeState({ answers, score, tier: pendingTier });
    track("vsl_activate_click", { tier: pendingTier, score, ...trackingParams() });
    stop();
    router.push("/pv13/withdraw");
  };

  if (phase === "ringing") {
    return (
      <main className="call-screen relative min-h-[100svh] flex flex-col items-center justify-between px-6 pt-16 pb-14 text-center">
        <div className="relative z-10">
          <p className="text-orange-500/80 text-[10.5px] font-bold tracking-[0.22em] uppercase mb-1">Incoming call</p>
          <p className="text-slate-500 text-[11px]">Verification line · encrypted</p>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-9">
            <div className="absolute inset-0 rounded-full call-halo" />
            <div className="absolute inset-0 rounded-full call-halo d2" />
            <div className="absolute inset-0 rounded-full call-halo d3" />
            <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-emerald-700/40 call-avatar-img">
              <img src="/pv13/perfil-alex.png" alt="Alex Parker" className="w-full h-full object-cover" />
            </div>
          </div>

          <p className="text-white font-bold text-[26px] leading-tight mb-1">Alex Parker</p>
          <p className="text-slate-400 text-sm mb-1.5">My Money · Verification Dept.</p>
          <p className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            online · calling you
          </p>
        </div>

        <div className="relative z-10 w-full max-w-[300px]">
          <div className="flex items-end justify-center gap-1.5 h-6 mb-9">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <span key={i} className="wave-bar w-1 h-full bg-orange-800/70 rounded-full" style={{ animationDelay: `${i * 0.09}s` }} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-14">
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={decline}
                className="decline-btn w-16 h-16 rounded-full flex items-center justify-center text-white"
                aria-label="Decline"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /><path d="m3 3 18 18" /></svg>
              </button>
              <span className="text-slate-400 text-[11px]">Decline</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={answer}
                className="answer-btn mc-pulse w-[74px] h-[74px] rounded-full flex items-center justify-center text-white"
                aria-label="Answer call"
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
              </button>
              <span className="text-slate-400 text-[11px]">Answer</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "ended") {
    const price = { "17": 17, "27": 27, "47": 47, "67": 67, "97": 97 }[pendingTier];
    return (
      <main className="mc-shell relative min-h-[100svh] flex flex-col justify-center px-5 pb-8">
        <div className="mc-glow" />
        <div className="relative z-10 mc-pop">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-800/50 bg-red-900/25 px-3 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-700" />
            <span className="text-red-400 text-[10px] font-bold tracking-[0.18em]">VERIFICATION COMPLETE</span>
          </div>
          <h1 className="text-[26px] font-black text-white leading-tight mb-2">
            {name ? `${name}, your` : "Your"} withdrawal is approved.
          </h1>
          <p className="text-slate-400 text-[13px] mb-6">One last step to release it. The activation fee is a one-time ${price}.</p>

          <div className="mc-card rounded-2xl p-4 mb-6">
            <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Activation fee</p>
            <p className="text-white font-black text-4xl tabular mb-1">${price}.00</p>
            <p className="text-red-400 text-[12px] font-semibold">≈ $5,000–$15,000/yr value · one-time</p>
          </div>

          <button onClick={toWithdraw} className="mc-cta mc-pulse w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2">
            Activate now · ${price}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="call-screen relative min-h-[100svh] flex flex-col">
      {/* cabeçalho da ligação */}
      <header className="relative z-20 shrink-0 border-b border-white/10 bg-[#141416]/85 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img src="/pv13/perfil-alex.png" alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-red-700/50" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#141416] presence-dot" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">Alex Parker</p>
              <p className="text-slate-400 text-[11px] truncate">My Money · Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 tabular">{elapsed}</span>
            </div>
            <button onClick={hangUp} aria-label="End call" className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" /><line x1="22" x2="2" y1="2" y2="22" /></svg>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col min-h-0 px-4">
        {/* legenda grande, como fala ao vivo; cresce conforme o áudio e é ancorada embaixo */}
        <div className="pt-5 pb-2 min-h-[112px] flex items-end justify-center">
          <p className={`text-center font-semibold tracking-tight leading-[1.35] text-[clamp(17px,4.6vw,21px)] ${caption ? "text-white" : "text-slate-500"}`}>
            {caption || (speaking ? "…" : "Line connected.")}
          </p>
        </div>

        {speaking && (
          <div className="flex items-end justify-center gap-1 h-5 mb-4">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <span key={i} className="wave-bar w-1 h-full bg-red-600/80 rounded-full" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* área de respostas / nome */}
        <div className="pb-3">
          {node?.k === "ask" && node.id === "p0" && (
            <div className="mc-pop">
              <p className="text-center text-orange-100/90 text-[15px] font-semibold mb-2.5">Can I take your first name?</p>              <div className="flex gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    prefetchName(cleanName(e.target.value));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && submitName()}
                  placeholder="Your first name"
                  autoComplete="given-name"
                  enterKeyHint="done"
                  className="flex-1 min-w-0 rounded-2xl bg-[#0d0d0f] border border-white/15 px-4 py-3.5 text-white placeholder:text-slate-500 caret-white outline-none focus:border-orange-700/60 focus:ring-2 focus:ring-orange-800/25"
                />
                <button onClick={submitName} className="answer-btn shrink-0 px-5 rounded-2xl font-bold text-white">OK</button>
              </div>
            </div>
          )}

          {node?.k === "ask" && node.id !== "p0" && (
            <div className="space-y-2.5 mc-pop">
              {node.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => answerOpt(node.id, opt)}
                  className="w-full text-center rounded-2xl bg-white/[.06] border border-white/12 px-4 py-3.5 text-[14px] text-slate-100 active:scale-[.99] transition-all hover:border-orange-900/70 hover:bg-white/10"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* controles de telefone */}
      <footer className="relative z-20 shrink-0 flex items-center justify-center gap-8 px-4 pt-3 pb-[max(18px,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setMuted(!muted)}
          aria-label="Mute"
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${muted ? "bg-white text-slate-900" : "bg-white/10 text-white"}`}
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="m23 9-6 6M17 9l6 6" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
          )}
        </button>

        <button onClick={hangUp} aria-label="End call" className="decline-btn w-16 h-16 rounded-full flex items-center justify-center text-white">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" /><line x1="22" x2="2" y1="2" y2="22" /></svg>
        </button>

        {speaking ? (
          <button onClick={skip} aria-label="Skip line" className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5v14l9-7-9-7zm11 0h3v14h-3z" /></svg>
          </button>
        ) : (
          <div className="w-12 h-12" />
        )}
      </footer>
    </main>
  );
}

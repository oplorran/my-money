"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SCRIPT, VOICE } from "@/lib/voice";
import type { Scene } from "@/lib/voice";
import { useVoice } from "@/lib/useVoice";
import { cleanName, prefetchName } from "@/lib/name";
import { useRingtone } from "@/lib/useRingtone";
import { BACK_CHECKOUT_FULL, VSL_PRICE, checkoutUrl, money, readState, scoreOf, tierFor, writeState } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";
import { fireEvent } from "@/lib/meta-pixel";

type Phase = "ringing" | "live" | "ended";

const HAS_VOICE = new Set(Object.keys(VOICE).map(Number));

export default function VslPage() {
  const router = useRouter();
  const { play, prime, skip, stop, speaking, setMuted, setName: setSpokenName } = useVoice();
  const { start: startRing, nudge: nudgeRing, stop: stopRing, beep } = useRingtone();
  const [phase, setPhase] = useState<Phase>("ringing");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [numInput, setNumInput] = useState("");
  const [caption, setCaption] = useState("");
  const [scene, setScene] = useState<Scene | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [asking, setAsking] = useState(false);
  const running = useRef(false);
  const gen = useRef(0);
  const branchRef = useRef<Record<string, string>>({});
  const endRef = useRef<HTMLDivElement | null>(null);

  const st = useMemo(() => readState(), []);
  const balance = st.balance > 50 ? st.balance : 101.43;
  const target = answers["p1"] ?? 0;

  const node = SCRIPT[step];
  const ask = node?.k === "ask" ? node : null;

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
        if (HAS_VOICE.has(id)) {
          await play(id, (ratio) => {
            const n = Math.min(words.length, Math.max(1, Math.ceil(ratio * words.length)));
            if (n === shown) return;
            shown = n;
            setCaption(words.slice(0, n).join(" "));
          });
        } else {
          // linha sem clipe gravado: revela no ritmo da leitura
          const total = Math.max(1800, words.length * 250);
          const t0 = Date.now();
          await new Promise<void>((res) => {
            const tick = () => {
              if (gen.current !== my) return res();
              const r = Math.min(1, (Date.now() - t0) / total);
              const n = Math.max(1, Math.ceil(r * words.length));
              if (n !== shown) {
                shown = n;
                setCaption(words.slice(0, n).join(" "));
              }
              if (r >= 1) return res();
              window.setTimeout(tick, 80);
            };
            tick();
          });
        }
      }
      if (gen.current === my) setCaption("");
    },
    [play],
  );

  useEffect(() => {
    if (phase !== "ringing") return;
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

  useEffect(() => {
    if (phase !== "live") return;
    const t0 = Date.now();
    const id = window.setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000);
      setElapsed(`${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`);
    }, 500);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [caption, node]);

  useEffect(() => {
    if (phase !== "live" || !node || running.current) return;
    running.current = true;
    const my = ++gen.current;
    const alive = () => gen.current === my;

    (async () => {
      if (node.k === "say") {
        if (node.scene) setScene(node.scene);
        await playIds(node.ids, my);
        if (alive()) setStep((s) => s + 1);
      } else if (node.k === "beat") {
        if (node.scene) setScene(node.scene);
        await new Promise((r) => window.setTimeout(r, node.ms));
        if (alive()) setStep((s) => s + 1);
      } else if (node.k === "branch") {
        // p4 tem a quebra de objeção; as demais usam o branch escolhido
        const key = node.by === "p4" ? String(answers[node.by] ?? "") : branchRef.current[node.by] ?? "";
        const ids = node.map[key] ?? node.map["2"] ?? [];
        await playIds(ids, my);
        if (alive()) setStep((s) => s + 1);
      } else if (node.k === "ask") {
        if (node.id === "p0") {
          setAsking(true);
          setCaption(node.question);
          if (alive()) running.current = false;
        } else {
          setAsking(true);
          setCaption(node.question);
          if (node.id === "p1") await play(99);
          else await play(98);
          if (alive()) setCaption(node.question);
          running.current = false;
        }
      } else if (node.k === "end") {
        const score = scoreOf(answers, target);
        const tier = tierFor(score);
        writeState({ score, tier });
        track("vsl_complete", { score, tier, ...trackingParams() });
        setPhase("ended");
        running.current = false;
      }
      if (alive()) running.current = false;
    })();
  }, [phase, node, answers, play, playIds]);

  const answer = () => {
    stopRing();
    beep(880, 0.14);
    prime();
    track("vsl_answer", trackingParams());
    setPhase("live");
  };

  const decline = () => {
    stopRing();
    beep(320, 0.16);
    track("vsl_decline", trackingParams());
    stop();
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
    setScene(null);
    setAsking(false);
  };

  const pick = (id: string, opt: { score: number; branch?: string }) => {
    beep(1200, 0.05);
    skip();
    gen.current++;
    running.current = false;
    setAsking(false);
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
    track("vsl_name", trackingParams());
    setAsking(false);
    setCaption("");
    setStep((s) => s + 1);
  };

  const submitTarget = () => {
    const v = Number(numInput.replace(/[^\d]/g, ""));
    if (!v) return;
    beep(1200, 0.05);
    skip();
    gen.current++;
    running.current = false;
    setAsking(false);
    writeState({ target: v });
    setAnswers((prev) => ({ ...prev, p1: v }));
    track("vsl_target", { target: v, ...trackingParams() });
    setCaption("");
    setStep((s) => s + 1);
  };

  const toCheckout = () => {
    const score = scoreOf(answers, target);
    const tier = tierFor(score);
    writeState({ answers, score, tier, target });
    track("vsl_activate_click", { tier, score, ...trackingParams() });
    fireEvent("InitiateCheckout", { value: VSL_PRICE, currency: "USD", content_name: "CashClub Front" });
    stop();
    // o preço anunciado na chamada é fixo (US$ 29,90), igual ao original ao vivo
    const to = checkoutUrl(BACK_CHECKOUT_FULL);
    router.push(`/hotwt/up1?to=${encodeURIComponent(to)}`);
  };

  if (phase === "ringing") {
    return (
      <main className="call-screen relative flex min-h-[100svh] flex-col items-center justify-between px-6 pb-14 pt-16 text-center">
        <div className="relative z-10">
          <p className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#666666]">Incoming call</p>
          <p className="text-[11px] text-[#666666]">Cash Club · Verification Dept.</p>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-9">
            <div className="call-halo absolute inset-0 rounded-full" />
            <div className="call-halo d2 absolute inset-0 rounded-full" />
            <div className="call-halo d3 absolute inset-0 rounded-full" />
            <div className="call-avatar-img relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-[#a8ff16]/20">
              <img src="/pv13/perfil-alex.png" alt="Alex Parker" className="h-full w-full object-cover" />
            </div>
          </div>

          <p className="mb-1 text-[26px] font-bold leading-tight text-white">Alex Parker</p>
          <p className="mb-1.5 text-sm text-[#888888]">Cash Club · Verification Dept.</p>
          <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#a8ff16]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a8ff16]" />
            online · calling you
          </p>
        </div>

        <div className="relative z-10 w-full max-w-[300px]">
          <div className="mb-9 flex h-6 items-end justify-center gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <span key={i} className="wave-bar h-full w-1 rounded-full bg-[#a8ff16]/40" style={{ animationDelay: `${i * 0.09}s` }} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-14">
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={decline}
                aria-label="Decline"
                className="decline-btn flex h-16 w-16 items-center justify-center rounded-full text-white"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                  <path d="m3 3 18 18" />
                </svg>
              </button>
              <span className="text-[11px] text-[#888888]">Decline</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={answer}
                aria-label="Answer call"
                className="answer-btn mc-pulse flex h-[74px] w-[74px] items-center justify-center rounded-full text-[#090909]"
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                </svg>
              </button>
              <span className="text-[11px] text-[#888888]">Answer</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "ended") {
    return (
      <main className="mc-shell relative flex min-h-[100svh] flex-col justify-center px-5 pb-8">
        <div className="mc-glow" />
        <div className="mc-pop relative z-10 max-w-md">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#a8ff16]/30 bg-[#a8ff16]/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-[#a8ff16]" />
            <span className="text-[10px] font-bold tracking-[0.18em] text-[#a8ff16]">ACTIVATION UNLOCKED</span>
          </div>

          <div className="mb-4 rounded-[20px] border border-[#303030] bg-[#111111] p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#888888]">Account balance available</p>
            <p className="tabular text-[30px] font-bold leading-tight text-[#a8ff16]">{money(balance)}</p>
            <p className="mt-1 text-[11px] leading-snug text-[#666666]">
              Released as soon as the activation is confirmed.
            </p>
          </div>

          <button
            onClick={toCheckout}
            className="mc-cta mc-pulse w-full rounded-[20px] py-4 text-left"
          >
            <span className="flex items-center justify-between px-4">
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#090909]/70">
                  One-time activation
                </span>
                <span className="block text-[15px] font-bold text-[#090909]">Tap to activate</span>
              </span>
              <span className="tabular text-[26px] font-black leading-none text-[#090909]">${VSL_PRICE.toFixed(2).replace(".", ",")}</span>
            </span>
          </button>
          <p className="mt-2 text-center text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
            One-time · 7-day guarantee · Access by email
          </p>

          <button
            onClick={() => setPhase("live")}
            className="mt-4 flex w-full items-center justify-center gap-2 py-2.5 text-[12.5px] font-semibold text-[#888888]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            </svg>
            Tap to hear Alex again
          </button>
          <button
            onClick={() => setPhase("live")}
            className="mt-1 w-full text-center text-[12px] text-[#666666] underline decoration-[#303030] underline-offset-2"
          >
            I don&apos;t want this offer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="call-screen relative flex min-h-[100svh] flex-col">
      <header className="relative z-20 shrink-0 border-b border-[#303030] bg-[#0d0d0d]/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative shrink-0">
              <img src="/pv13/perfil-alex.png" alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#a8ff16]/25" />
              <span className="presence-dot absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d0d0d]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-white">Alex Parker</p>
              <p className="truncate text-[11px] text-[#888888]">Cash Club · Verification</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a8ff16] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a8ff16]" />
              </span>
              <span className="tabular text-[11px] font-semibold text-[#a8ff16]">{elapsed}</span>
            </div>
            <button
              onClick={hangUp}
              aria-label="End call"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8ff16] text-[#090909]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                <line x1="22" x2="2" y1="2" y2="22" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4">
        <div className="no-scrollbar flex-1 overflow-y-auto pt-4">
          {scene && <ScenePad scene={scene} target={target} />}

          {/* legenda grande, ancorada embaixo e crescendo com o áudio */}
          <div className="flex min-h-[104px] items-end justify-center pb-2 pt-3">
            <p
              className={`text-center font-semibold leading-[1.35] tracking-tight text-[clamp(17px,4.6vw,21px)] ${
                caption ? "text-white" : "text-[#666666]"
              }`}
            >
              {caption
                ? caption.split(" ").map((w, i) => (
                    <Fragment key={i}>
                      <span className="cap-word">{w}</span>{" "}
                    </Fragment>
                  ))
                : speaking
                  ? "…"
                  : "Line connected."}
            </p>
          </div>

          {speaking && (
            <div className="mb-4 flex h-5 items-end justify-center gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span key={i} className="wave-bar h-full w-1 rounded-full bg-[#a8ff16]/80" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}
        </div>

        <div ref={endRef} className="pb-3">
          {asking && ask?.id === "p0" && (
            <div className="mc-pop">
              <div className="flex gap-2">
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
                  className="min-w-0 flex-1 rounded-[20px] border border-[#303030] bg-[#111111] px-4 py-3.5 text-white caret-white outline-none placeholder:text-[#666666] focus:border-[#a8ff16]/40 focus:ring-2 focus:ring-[#a8ff16]/20"
                />
                <button onClick={submitName} className="answer-btn shrink-0 rounded-[20px] px-5 text-[14px] font-bold text-[#090909]">
                  OK
                </button>
              </div>
            </div>
          )}

          {asking && ask?.id === "p1" && (
            <div className="mc-pop">
              <div className="mb-2 flex gap-2">
                <span className="flex items-center rounded-[20px] border border-[#303030] bg-[#111111] px-3 text-[15px] font-bold text-[#888888]">
                  $
                </span>
                <input
                  value={numInput}
                  onChange={(e) => setNumInput(e.target.value.replace(/[^\d]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && submitTarget()}
                  inputMode="numeric"
                  enterKeyHint="done"
                  placeholder="3,000"
                  className="tabular min-w-0 flex-1 rounded-[20px] border border-[#303030] bg-[#111111] px-4 py-3.5 text-white caret-white outline-none placeholder:text-[#666666] focus:border-[#a8ff16]/40 focus:ring-2 focus:ring-[#a8ff16]/20"
                />
                <button onClick={submitTarget} className="answer-btn shrink-0 rounded-[20px] px-5 text-[13px] font-bold text-[#090909]">
                  Confirm
                </button>
              </div>
              <p className="text-center text-[10.5px] text-[#666666]">Type your target above, then tap Confirm</p>
            </div>
          )}

          {ask && ask.id !== "p0" && ask.id !== "p1" && (
            <div className="mc-pop">
              {ask.hint && (
                <p className="mb-2 text-center text-[12px] font-semibold text-[#888888]">{ask.hint}</p>
              )}
              <div className="space-y-2">
                {ask.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => pick(ask.id, opt)}
                    className="flex w-full items-center justify-between gap-3 rounded-[20px] border border-[#303030] bg-[#1b1b1d] px-4 py-3 text-left text-[13.5px] font-semibold leading-snug text-white transition-all hover:border-[#a8ff16]/45 hover:bg-[#1b1b1d] active:scale-[.99]"
                  >
                    <span className="min-w-0">{opt.label}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#888888]">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="relative z-20 flex shrink-0 items-center justify-center gap-8 px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-3">
        <button
          onClick={() => setMuted(false)}
          aria-label="Unmute"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1b1b1d] text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </button>

        <button onClick={hangUp} aria-label="End call" className="decline-btn flex h-16 w-16 items-center justify-center rounded-full text-white">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <line x1="22" x2="2" y1="2" y2="22" />
          </svg>
        </button>

        {speaking ? (
          <button onClick={skip} aria-label="Skip line" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1b1b1d] text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 5v14l9-7-9-7zm11 0h3v14h-3z" />
            </svg>
          </button>
        ) : (
          <div className="h-12 w-12" />
        )}
      </footer>
    </main>
  );
}

/** Réguas visuais da chamada: cada fala forte troca o palco, como no original. */
function ScenePad({ scene, target }: { scene: Scene; target: number }) {
  // a cena institucional tem duas fases no original: processamento e depois o mote
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (scene !== "institution") return;
    const t = window.setTimeout(() => setPhase(1), 9000);
    return () => window.clearTimeout(t);
  }, [scene]);

  if (scene === "institution") {
    return (
      <div className="mc-fade mb-3 rounded-[20px] border border-[#303030] bg-[#111111] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded bg-[#a8ff16]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#a8ff16]">BUY 2.4</span>
          <span className="text-[9px] uppercase tracking-wider text-[#666666]">1.2M data points / s</span>
          <span className="rounded bg-[#a8ff16]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#a8ff16]">SELL 1.8</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {["HEDGE FUNDS", "INVESTMENT BANKS", "PROP DESKS", "MARKET MAKERS"].map((i) => (
            <p key={i} className="rounded-[14px] bg-[#090909] px-2 py-1.5 text-[8.5px] font-bold tracking-wider text-[#888888]">
              {i}
            </p>
          ))}
        </div>
        {phase === 0 ? (
          <p className="mt-2 text-center text-[10px] text-[#666666]">Cash Club AI · processing 1.2M data points per second</p>
        ) : (
          <div className="mt-2 text-center">
            <p className="text-[11px] font-bold text-white">Institutional algorithms</p>
            <p className="text-[9.5px] text-[#666666]">The same engines banks use — now in your pocket</p>
          </div>
        )}
      </div>
    );
  }

  if (scene === "projection") {
    const m = target || 3000;
    const rows = [
      { k: "Week 1", n: "calibrating", v: Math.max(77, Math.round(m * 0.026)) },
      { k: "Month 1", n: "calibration", v: Math.round(m * 0.11) },
      { k: "Month 2", n: "on target", v: Math.round(m * 0.4) },
      { k: "Month 3", n: "full speed", v: m },
    ];
    return (
      <div className="mc-fade mb-3 rounded-[20px] border border-[#303030] bg-[#111111] p-3">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#666666]">Projection</p>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#666666]">Based on your profile</span>
        </div>
        <div className="space-y-1">
          {rows.map((r, i) => (
            <div key={r.k} className="flex items-center justify-between gap-2">
              <span className="w-[54px] shrink-0 text-[9.5px] font-semibold uppercase tracking-wider text-[#888888]">{r.k}</span>
              <span className="flex-1 truncate text-[9px] text-[#666666]">{r.n}</span>
              <span className="tabular text-[11.5px] font-bold text-white">
                ${r.v.toLocaleString("en-US")}
              </span>
              <span className="tabular w-[52px] shrink-0 text-right text-[9px] text-[#666666]">
                {i === 0 ? "" : `+${Math.round((r.v / rows[0].v) * 100 - 100)}%`}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-[#303030] pt-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#666666]">90 days</span>
          <span className="tabular text-[12.5px] font-black text-[#a8ff16]">
            ${Math.round(m * 1.51).toLocaleString("en-US")}
          </span>
        </div>
      </div>
    );
  }

  if (scene === "accuracy") {
    return <AccuracyPad />;
  }

  if (scene === "scarcity") {
    return (
      <div className="mc-fade mb-3 rounded-[20px] border border-[#303030] bg-[#111111] p-3">
        <div className="mb-1 flex items-baseline justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#666666]">Verified accounts this cycle</p>
          <span className="rounded bg-[#a8ff16]/20 px-1.5 py-0.5 text-[8.5px] font-bold text-[#a8ff16]">LIVE</span>
        </div>
        <p className="tabular text-[17px] font-bold leading-none text-white">300 / 350</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1b1b1d]">
          <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-[#6fbf00] to-[#a8ff16]" />
        </div>
        <div className="mt-1 flex justify-between text-[9px] uppercase tracking-wider text-[#666666]">
          <span>86% filled</span>
          <span className="font-bold text-[#a8ff16]">Only 50 spots left</span>
        </div>
      </div>
    );
  }

  if (scene === "guarantee") {
    return (
      <div className="mc-fade mb-3 flex items-center gap-2.5 rounded-[20px] border border-[#a8ff16]/25 bg-[#151b0d] p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#a8ff16]/25 text-[15px] font-black text-[#a8ff16]">
          7
        </span>
        <div>
          <p className="text-[11.5px] font-bold leading-tight text-white">7-Day Guarantee</p>
          <p className="text-[9.5px] uppercase tracking-wider text-[#a8ff16]">Risk free · full refund, no questions</p>
        </div>
      </div>
    );
  }

  if (scene === "anchor") {
    return (
      <div className="mc-fade mb-3 rounded-[20px] border border-[#303030] bg-[#111111] p-3">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#666666]">
          Institutional cost / year
        </p>
        <div className="flex items-center gap-1.5">
          {["$2,000", "$500", "$200"].map((v, i) => (
            <span
              key={v}
              className={`tabular flex-1 rounded-[14px] py-1.5 text-center text-[12px] font-bold ${
                i === 0 ? "bg-[#1b1b1d] text-[#666666] line-through" : "bg-[#1b1b1d] text-[#cccccc]"
              }`}
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (scene === "price") {
    return (
      <div className="mc-fade mb-3 rounded-[20px] border border-[#a8ff16]/30 bg-[#151b0d] p-3 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#a8ff16]">Activation today</p>
        <p className="tabular text-[30px] font-black leading-none text-white">${VSL_PRICE.toFixed(2).replace(".", ",")}</p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#666666]">One time · no monthly fee</p>
      </div>
    );
  }

  return (
    <div className="mc-fade mb-3 flex items-center justify-between rounded-[20px] border border-[#303030] bg-[#111111] p-3">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#a8ff16]">Activation locked</p>
        <p className="text-[11px] text-[#888888]">Complete the call to unlock</p>
      </div>
      <span className="text-[15px] grayscale">🔒</span>
    </div>
  );
}

/** Curva de precisão subindo de 73% para 83,33%, como a cena original. */
function AccuracyPad() {
  const [v, setV] = useState(73);

  useEffect(() => {
    const id = window.setInterval(() => setV((n) => (n >= 83.33 ? n : Math.min(83.33, n + 0.55))), 90);
    return () => window.clearInterval(id);
  }, []);

  const d = "M10,116 C20,116 20,109.9 30,109.9 C40,109.9 40,111.9 50,111.9 C60,111.9 60,99.7 70,99.7 C80,99.7 80,93.6 90,93.6 C100,93.6 100,96.6 110,96.6 C120,96.6 120,81.3 130,81.3 C140,81.3 140,73.2 150,73.2 C160,73.2 160,76.2 170,76.2 C180,76.2 180,59.9 190,59.9 C200,59.9 200,48.7 210,48.7 C220,48.7 220,42.6 230,42.6 C240,42.6 240,29.3 250,29.3 C260,29.3 260,21.1 270,21.1 C280,21.1 280,14 290,14";

  return (
    <div className="mc-fade mb-3 flex flex-col items-center rounded-[20px] border border-[#303030] bg-[#111111] px-3 py-3 text-center">
      <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#888888]">Accuracy rate</p>
      <p className="tabular mt-1 flex items-baseline text-[#a8ff16]">
        <span className="text-[34px] font-bold leading-none">{v.toFixed(2)}</span>
        <span className="ml-0.5 text-[16px] font-bold leading-none opacity-80">%</span>
      </p>

      <svg viewBox="0 0 300 132" className="mt-1 w-full" aria-hidden>
        <defs>
          <linearGradient id="acc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(168,255,22,0.32)" />
            <stop offset="100%" stopColor="rgba(168,255,22,0)" />
          </linearGradient>
        </defs>
        {[90.5, 65, 39.5].map((y) => (
          <line key={y} x1="10" x2="290" y1={y} y2={y} stroke="rgba(255,255,255,.055)" strokeWidth="1" />
        ))}
        <path d={`${d} L290,132 L10,132 Z`} fill="url(#acc-fill)" />
        <path d={d} fill="none" stroke="#a8ff16" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="290" cy="14" r="4.5" fill="#a8ff16" />
      </svg>

      <div className="mt-1 flex w-full items-start justify-between px-1">
        <div className="text-left">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#666666]" />
            <span className="text-[10px] font-semibold text-[#888888]">Launch</span>
          </span>
          <p className="ml-3 text-[11px] font-bold text-[#cccccc]">73%</p>
        </div>
        <div className="text-right">
          <span className="flex items-center justify-end gap-1.5">
            <span className="text-[10px] font-semibold text-[#a8ff16]">18 months later</span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a8ff16]" />
          </span>
          <p className="mr-3 text-[11px] font-bold text-[#a8ff16]">83.33%</p>
        </div>
      </div>
    </div>
  );
}


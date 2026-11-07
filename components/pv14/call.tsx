"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BACK_CHECKOUT_FULL, checkoutUrl, money, readState, writeState } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";
import { Pv14Handshake } from "@/components/pv14/handshake";
import { Pv14Stage } from "@/components/pv14/stage";

type Phase = "handshake" | "verify" | "call" | "ended";

type Step =
  | { k: "beat"; ms: number; scene?: Scene }
  | { k: "say"; text: string; scene?: Scene }
  | { k: "ask"; id: "p2" | "p3" | "p5"; question: string; hint?: string; options: string[] }
  | { k: "target" }
  | { k: "end" };

type Scene =
  | "ledger"
  | "projection"
  | "gates"
  | "locked"
  | "guarantee"
  | "scarcity"
  | "anchor"
  | "price"
  | "data"
  | "confidence"
  | "members"
  | "audience"
  | "growth"
  | "unlocked";

/**
 * Roteiro do pv14 (chamada de verificação).
 * Fiel à referência: contexto → checklist → mecanismo/provas → objeção → garantia
 * → escassez → ancoragem → oferta.
 */
const SCRIPT: Step[] = [
  { k: "say", text: "Daniel Torres, Money Club verification. I'm the one handling your case." },
  { k: "say", text: "I just pulled up your file. Test session completed — your A I ran and closed at $__BAL__, withdrawal requested through __METHOD__. It's all here.", scene: "ledger" },
  { k: "say", text: "The issue is your account flagged at verification. That's what I'm here to resolve — but first, I need you to understand what you have access to here. Because this isn't just about this withdrawal. It's about every withdrawal after it. And Money Club is not just another app." },
  { k: "target" },
  { k: "say", text: "__TARGET__ a month. Perfect. That's exactly the kind of target the system delivers consistently." },
  { k: "beat", ms: 2600, scene: "projection" },
  { k: "say", text: "First week, conservatively, $__WEEK__. That's because the A I is still calibrating.", scene: "projection" },
  { k: "ask", id: "p2", question: "What's your situation right now?", hint: "Tap one of the buttons below", options: [
    "I'm drowning in debt and need a way out",
    "I want extra income to breathe",
    "I want to stop depending on my job",
    "I want to build something for my future",
    "I want to give my family a better life",
  ] },
  { k: "say", text: "I see this all day long here. The people who do best on this platform are the ones with their backs against the wall. Because they don't overthink it — they activate and let the A I work." },
  { k: "ask", id: "p3", question: "What's left after your monthly bills?", hint: "Tap one of the buttons below", options: [
    "I'm in the red — more goes out than comes in",
    "Very little, less than $300",
    "Between $300 and $1,000",
    "Between $1,000 and $2,000",
    "More than $2,000",
    "Prefer not to say",
  ] },
  { k: "say", text: "Done. Your profile qualifies, __NAME__. Now stay with me." },
  { k: "say", text: "Money Club was built with a hundred and twenty seven million dollars from Bill Gates. I know how that sounds — but it's real. That's him right there in our office. I work in that building." },
  { k: "say", text: "The problem is that this technology was always locked. Only zero point three percent of the world's population had access to that kind of tool. The rest of us — me, you, everybody — were left out.", scene: "audience" },
  { k: "say", text: "No need to understand markets. No experience required. No sitting in front of a computer. You activate, and the artificial intelligence works for you, __NAME__. Twenty-four hours a day, seven days a week." },
  { k: "say", text: "You've heard the story about the artificial intelligence that beat the best chess player in the world? That happened back in the nineties. And since that day, no human has beaten an A I again.", scene: "gates" },
  { k: "say", text: "The Money Club A I was trained on millions of real trades, from thousands of members, over eighteen months. It analyzes more than two hundred assets per second. It spots patterns no human can see. And it trades with mathematical precision — no fear, no greed, no emotion.", scene: "data" },
  { k: "say", text: "It's called data augmentation — collective learning. The more people use it, the more data the A I receives. More data means more precision. And more precision means more results for everybody.", scene: "members" },
  { k: "say", text: "And the A I only executes a trade when confidence is above ninety percent. If it reads the market and sees the odds below that, it simply doesn't trade. It protects your money.", scene: "confidence" },
  { k: "say", text: "In your test session, the A I executed 5 trades and turned $50.00 into $__BAL__. That wasn't luck — that was the A I doing exactly what I just described.", scene: "ledger" },
  { k: "say", text: "The answer is simple — and it's the data augmentation I just explained. The A I needs active members trading to keep learning. No members, no data. No data, no evolution. Every person who joins improves the system for everyone — including you." },
  { k: "say", text: "__NAME__, I'm going to send you photos and results from real members now. People like you who activated and let the A I work.", scene: "members" },
  { k: "say", text: "And this is James. One hundred thousand dollars in results. Look at the kit the company sent to his house — the watch, the champagne, the plaque. That's real." },
  { k: "say", text: "He activated eight months ago. Started slow, let the A I calibrate, and grew. Now he sends me a travel photo every couple of months." },
  { k: "say", text: "And beyond individual results, we run an awards program. The top one hundred members of the year travel together on a cruise paid for by the company. That photo is from last year's cruise." },
  { k: "ask", id: "p5", question: "Where are you right now?", hint: "Tap one of the buttons below", options: [
    "I want to activate my account",
    "I still have a question",
  ] },
  { k: "say", text: "Now comes the part I need to explain carefully. Because this is where you'll understand why your withdrawal was held — and what has to happen to release it.", scene: "locked" },
  { k: "say", text: "And it worked. The A I generated $__BAL__ in your session. That's real — real trades, in the real market. But to access that balance, trade with real money and withdraw, your account has to be active.", scene: "locked" },
  { k: "say", text: "The Money Club A I learns from every member's data. If one person creates ten accounts, they contaminate the algorithm and hurt everybody. The fee guarantees each account belongs to a real person. One person, one account, one time.", scene: "data" },
  { k: "say", text: "There's a seven-day guarantee. You activate, test the platform for seven full days, use the A I, watch the balance grow. If for any reason — any reason at all, __NAME__ — you decide it's not for you, you just ask for a refund. Every cent back. No questions, no paperwork.", scene: "guarantee" },
  { k: "say", text: "So in the worst case, you test it, you don't like it, you get your money back, and you're exactly where you are right now. Zero to zero. You lose nothing." },
  { k: "say", text: "In the realistic case — and it's what I see in the reports every day — you activate, the A I trades, and by the end of the first week you have money in your account that didn't exist before.", scene: "growth" },
  { k: "say", text: "Day seven — you look at the week's total. $__WEEK__. And the question changes. It's not whether it works anymore. It's how far this goes.", scene: "projection" },
  { k: "say", text: "You told me you need a way out, __NAME__. With $__DAY__ a day coming in, imagine opening the app a month from now and seeing you already have enough to clear the first bill. That's the day everything changes." },
  { k: "say", text: "This is the second session. We opened three hundred fifty spots, because that's what the servers handle without compromising the A I's precision. When it fills, it closes. And I don't have a date for the next one.", scene: "scarcity" },
  { k: "say", text: "The activation fee could be two thousand dollars. It could be five hundred. Even two hundred would be fair for what the system delivers.", scene: "anchor" },
  { k: "say", text: "And I need you to understand something — I'm not trying to sell you anything, __NAME__. I'm explaining how the system works. The activation is a step in the process, not an offer.", scene: "anchor" },
  { k: "say", text: "Ready to activate your account?", scene: "price" },
  { k: "ask", id: "p5", question: "Ready to activate your account?", hint: "Tap one of the buttons below", options: [
    "I want to activate my account",
    "Not yet, I need to think",
  ] },
  { k: "say", text: "You'll tap the button and fill in your details — it's quick, under a minute. The only thing I ask is that you double-check your email, __NAME__. Your app access goes straight to your inbox the moment the payment confirms. Wrong email, lost access. So check it before you confirm.", scene: "unlocked" },
  { k: "end" },
];

/** Tipo de fala usado pelo "end" para trocar o palco antes do CTA. */
const OFFER_COPY = "ACTIVATION UNLOCKED";

export function Pv14Call({ fallback }: { fallback: number }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("handshake");
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [caption, setCaption] = useState("");
  const [scene, setScene] = useState<Scene | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [amount] = useState(() => {
    const b = readState().balance;
    return b > fallback ? b : fallback;
  });
  const [method, setMethod] = useState("Bank");
  const [target, setTarget] = useState(5000);
  const [targetInput, setTargetInput] = useState("");
  const running = useRef(false);
  const gen = useRef(0);

  const node = SCRIPT[step];
  const ask = node?.k === "ask" ? node : null;

  const week = useMemo(
    () => `${money(Math.round(target * 0.162))} to ${money(Math.round(target * 0.214))}`,
    [target],
  );
  const day = useMemo(() => money(Math.round(target / 30)), [target]);

  const fill = useCallback(
    (t: string) =>
      t
        .replace(/__BAL__/g, money(amount))
        .replace(/__METHOD__/g, method)
        .replace(/__NAME__/g, name || "there")
        .replace(/__TARGET__/g, money(target))
        .replace(/__WEEK__/g, week)
        .replace(/__DAY__/g, day),
    [amount, method, name, target, week, day],
  );

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("m");
    if (q) setMethod(q === "paypal" ? "PayPal" : "Bank");
  }, []);

  useEffect(() => {
    if (phase !== "call") return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // revela a legenda palavra a palavra
  const reveal = useCallback(
    async (text: string) => {
      const words = text.split(/\s+/);
      const total = Math.max(1400, words.length * 190);
      const my = gen.current;
      setCaption("");
      const t0 = Date.now();
      await new Promise<void>((res) => {
        const tick = () => {
          if (gen.current !== my) return res();
          const r = Math.min(1, (Date.now() - t0) / total);
          setCaption(words.slice(0, Math.max(1, Math.ceil(r * words.length))).join(" "));
          if (r >= 1) return res();
          window.setTimeout(tick, 70);
        };
        tick();
      });
    },
    [],
  );

  useEffect(() => {
    if (phase !== "call" || !node || running.current) return;
    running.current = true;
    const my = ++gen.current;
    const alive = () => gen.current === my;

    (async () => {
      if (node.k === "beat") {
        if (node.scene) setScene(node.scene);
        await new Promise((r) => window.setTimeout(r, node.ms));
        if (alive()) setStep((s) => s + 1);
      } else if (node.k === "say") {
        if (node.scene) setScene(node.scene);
        await reveal(fill(node.text));
        if (alive()) {
          setCaption("");
          setStep((s) => s + 1);
        }
      } else if (node.k === "ask") {
        setCaption(node.question);
        running.current = false;
        return;
      } else if (node.k === "target") {
        setCaption("How much per month would actually change your life?");
        running.current = false;
        return;
      } else if (node.k === "end") {
        setScene("unlocked");
        running.current = false;
        return;
      }
      if (alive()) running.current = false;
    })();
  }, [phase, node, reveal, fill]);

  const pick = () => {
    gen.current++;
    running.current = false;
    setCaption("");
    setStep((s) => s + 1);
  };

  const submitTarget = () => {
    const v = Number(targetInput.replace(/[^\d]/g, ""));
    if (v < 500) return;
    setTarget(v);
    writeState({ target: v });
    track("pv14_target", { target: v, ...trackingParams() });
    gen.current++;
    running.current = false;
    setCaption("");
    setStep((s) => s + 1);
  };

  const submitName = () => {
    const v = input.trim().slice(0, 18);
    if (v.length < 2) return;
    setName(v);
    writeState({ firstName: v });
    track("pv14_verify_name", trackingParams());
    setPhase("call");
  };

  const toCheckout = () => {
    if (busy) return;
    setBusy(true);
    track("pv14_activate", { balance: amount, ...trackingParams() });
    router.push(`/hotwt/up1?to=${encodeURIComponent(checkoutUrl(BACK_CHECKOUT_FULL))}`);
  };

  if (phase === "handshake") {
    return <Pv14Handshake fallback={fallback} onDone={() => setPhase("verify")} />;
  }

  if (phase === "verify") {
    return (
      <main className="mc-shell relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="mc-glow" />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5">
          <div className="mc-pop w-full max-w-sm overflow-hidden rounded-[28px] border border-[#303030] bg-[#111111] p-7">
            <div className="relative text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#a8ff16]/30 bg-[#a8ff16]/10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a8ff16]">Verification pending</p>
              <h2 className="mb-2 text-[22px] font-bold leading-tight text-white">
                Your <span className="text-[#a8ff16]">{money(amount)}</span> withdrawal needs verification
              </h2>
              <p className="mb-5 text-[13px] text-[#cccccc]">
                Enter your first name to start the identity check and release the funds.
              </p>

              <div className="mb-5 text-left">
                <label htmlFor="pv14-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#888888]">
                  First name
                </label>
                <input
                  id="pv14-name"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitName()}
                  maxLength={18}
                  autoComplete="given-name"
                  enterKeyHint="done"
                  placeholder="First name"
                  className="w-full rounded-[18px] border border-[#303030] bg-[#0d0d0d] px-4 py-3.5 text-base text-white caret-white outline-none placeholder:text-[#666666] focus:border-[#a8ff16]/45 focus:ring-2 focus:ring-[#a8ff16]/20"
                />
              </div>

              <div className="mb-5 rounded-[18px] border border-[#303030] bg-[#0d0d0d] p-3 text-left">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#a8ff16]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  For your security
                </div>
                <p className="text-xs leading-snug text-[#888888]">
                  This step confirms your identity and ensures the money only goes to you.
                </p>
              </div>

              <button
                onClick={submitName}
                className="mc-cta flex w-full items-center justify-center gap-3 rounded-[18px] py-4 text-[17px] font-bold"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                COMPLETE NOW
              </button>
              <p className="mt-3 text-xs text-[#666666]">4 minutes · One-time verification</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const clock = `00:${String(Math.min(59, elapsed)).padStart(2, "0")}`;

  return (
    <main className="call-screen fixed inset-0 flex flex-col overflow-hidden text-white">
      <header className="z-40 shrink-0 border-b border-[#303030] bg-[#0d0d0d]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img src="/pv13/perfil-daniel.jpg" alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#a8ff16]/25" />
            <span className="presence-dot absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d0d0d]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">Daniel Torres</p>
            <p className="truncate text-[11px] text-[#888888]">Money Club · Verification Dept.</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a8ff16] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a8ff16]" />
            </span>
            <p className="text-[11px] font-semibold text-[#a8ff16]">On call</p>
            <span className="tabular ml-1 text-[11px] text-[#666666]">{clock}</span>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-3">
        <div className="flex min-h-[80px] shrink-0 items-center justify-center px-1">
          <p className="text-center text-[clamp(17px,4.7vw,22px)] font-semibold leading-[1.38] tracking-tight text-white">
            {caption || (ask ? ask.question : "…")}
          </p>
        </div>

        <div className="no-scrollbar flex min-h-0 flex-1 flex-col justify-end overflow-y-auto pb-2">
          {scene && node?.k !== "end" && (
            <Pv14Stage scene={scene} amount={amount} name={name} target={target} />
          )}
        </div>

        {node?.k === "target" && (
          <div className="mc-pop shrink-0 pb-2">
            <p className="mb-2 flex items-center justify-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-[#cccccc]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-[#a8ff16]">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              Monthly target
            </p>
            <label className="relative flex min-h-[64px] items-center gap-2 rounded-[18px] border-2 border-[#303030] bg-[#1b1b1d] px-4 py-3">
              <span className="select-none text-[26px] font-semibold leading-none text-[#888888]">$</span>
              <span
                aria-hidden
                className="pointer-events-none absolute left-[3.25rem] flex items-center gap-2"
              >
                <span className="mc-caret h-[28px] w-[2px] rounded-full bg-[#a8ff16]" />
                <span className="text-[18px] font-medium text-[#666666]">___/mo</span>
              </span>
              <input
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value.replace(/[^\d]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && submitTarget()}
                inputMode="numeric"
                enterKeyHint="done"
                aria-label="Monthly target"
                className="relative z-10 min-w-0 flex-1 bg-transparent text-[34px] font-bold leading-none tracking-tight text-white outline-none"
              />
            </label>
            <p className="mt-2 text-center text-[13px] font-semibold text-[#a8ff16]">Type your target above, then tap Confirm</p>
            <button
              onClick={submitTarget}
              className="mc-cta mt-2 w-full rounded-[18px] py-3 text-[15px] font-bold"
            >
              Confirm
            </button>
          </div>
        )}

        {ask && (
          <div className="mc-pop shrink-0 pb-2">
            {ask.hint && <p className="mb-2 text-center text-[13px] text-[#888888]">{ask.hint}</p>}
            <div className="space-y-2">
              {ask.options.map((o) => (
                <button
                  key={o}
                  onClick={pick}
                  className="w-full rounded-[18px] border border-[#303030] bg-[#1b1b1d] px-4 py-3 text-left text-[13.5px] font-semibold leading-snug text-white transition-colors active:bg-[#111111]"
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        {node?.k === "end" && (
          <div className="mc-pop shrink-0 pb-3">
            <div className="mb-3 text-center">
              <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center">
                <span className="mc-breathe absolute inset-0 rounded-full border border-[#a8ff16]/40" />
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#a8ff16]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              </div>
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#a8ff16]">Activation unlocked</p>
              <p className="mt-1 text-[12.5px] text-[#888888]">
                {name ? `${name}, your account is one step away.` : "Your account is one step away."}
              </p>
            </div>

            <button
              onClick={toCheckout}
              disabled={busy}
              className="mc-cta w-full overflow-hidden rounded-[18px] p-3.5 text-left disabled:opacity-80"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.14em] text-[#090909]/70">
                    {OFFER_COPY}
                  </span>
                  <span className="mt-0.5 block whitespace-nowrap text-[15px] font-bold text-[#090909]">Tap to activate</span>
                </span>
                <span className="tabular shrink-0 text-[26px] font-black leading-none text-[#090909]">$27</span>
              </span>
            </button>
            <p className="mt-1.5 text-center text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
              One-time · 7-day guarantee · Access by email
            </p>
          </div>
        )}
      </div>

      <footer className="z-20 flex shrink-0 items-center justify-center gap-6 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
        <button
          onClick={() => router.push("/pv14/withdraw")}
          className="text-[11.5px] font-semibold text-[#666666] underline decoration-[#303030] underline-offset-2"
        >
          I don&apos;t want this offer
        </button>
        <button
          onClick={() => {
            gen.current++;
            running.current = false;
            setCaption("");
            setStep(0);
            setScene(null);
            setElapsed(0);
          }}
          className="text-[11.5px] font-semibold text-[#a8ff16]"
        >
          Tap to hear Daniel
        </button>
      </footer>
    </main>
  );
}

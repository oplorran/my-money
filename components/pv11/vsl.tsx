"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AiMaker } from "@/components/brands";
import { OFFER_RATIO, VslCta, VturbPlayer } from "@/components/vturb-player";
import { BACK_CHECKOUT_FULL, VSL_PRICE, checkoutUrl, money, readState } from "@/lib/funnel";
import { fireEvent } from "@/lib/meta-pixel";
import { track, trackingParams } from "@/lib/track";

const MAKERS = [
  { id: "openai", bg: "linear-gradient(160deg,#1ABF93 0%,#10A37F 55%,#0B7A5E 100%)", color: "#fff" },
  { id: "google", bg: "linear-gradient(160deg,#ffffff 0%,#f1f3f4 100%)", color: "#4285F4" },
  { id: "microsoft", bg: "linear-gradient(160deg,#36BEF6 0%,#04ADF4 55%,#0288C2 100%)", color: "#fff" },
] as const;

/** Avatares reais de `public/Depoimentos`, casados por gênero/idade com cada nome. */
const PEOPLE = {
  matt: "/depoimentos/pessoa-02.jpg",
  jessica: "/depoimentos/pessoa-04.jpg",
  sarah: "/depoimentos/pessoa-03.jpg",
  robert: "/depoimentos/pessoa-11.jpg",
  jennifer: "/depoimentos/pessoa-06.jpg",
  david: "/depoimentos/pessoa-01.jpg",
} as const;

const COMMENTS = [
  {
    n: "Matt Carter",
    avatar: PEOPLE.matt,
    t: "58m",
    likes: 198,
    c: "$267 today. $189 yesterday. $341 the day before. I don't have much to write. Just watch the video and stop wasting time. Your life can change in 15 minutes.",
  },
  {
    n: "Jessica Miller",
    avatar: PEOPLE.jessica,
    t: "1h",
    likes: 82,
    c: "Coming here to confirm what everyone is saying: it's real. Day one I thought it was luck. Day two, a coincidence. By day three I realized the tech actually works. I'm on day 12 and my only regret is not watching this video the first time it showed up.",
  },
  {
    n: "Sarah Thompson",
    avatar: PEOPLE.sarah,
    t: "2h",
    likes: 89,
    c: "When he explains the 83% accuracy rate and how the AI learns with every trade, it makes SO much sense. I never understood anything about investing — now I just leave the app open and watch my balance go up. Watch until the part where he shows the app live. That's when it'll click.",
  },
  {
    n: "Robert Mitchell",
    avatar: PEOPLE.robert,
    t: "4h",
    likes: 156,
    c: "I'm 61 years old and I've always been scared of this internet stuff. My grandson helped me set it up — took 5 minutes. Best part is I don't have to do anything, the AI trades on its own. I'm making almost $2,000 a week to supplement my retirement. At my age, this is a blessing.",
  },
  {
    n: "Jennifer Brooks",
    avatar: PEOPLE.jennifer,
    t: "5h",
    likes: 203,
    c: "Found this in the middle of the night, couldn't sleep thinking about the bills. I thought it was for people who understand markets, but the AI does everything on its own, literally. Yesterday I paid my kids' tuition that was 2 months behind. My husband still doesn't know where the money came from.",
  },
  {
    n: "David Reynolds",
    avatar: PEOPLE.david,
    t: "6h",
    likes: 241,
    c: "I normally never comment, but I need to leave this here. I was 3 months behind on rent, almost got evicted. Watched this video at 2am out of desperation. Today, 16 days later, every bill is paid and I still have money left over. This video changed my life, no exaggeration.",
  },
];

/** Fila de rostos para a prova social do topo (só quem não repete nos comentários). */
const AVATARS = [
  "/depoimentos/pessoa-05.jpg",
  "/depoimentos/pessoa-07.jpg",
  "/depoimentos/pessoa-08.jpg",
  "/depoimentos/pessoa-09.jpg",
  "/depoimentos/pessoa-10.jpg",
  "/depoimentos/pessoa-12.jpg",
];

type Props = {
  /** fallback do saldo quando a rota é aberta direto */
  fallback: number;
  /** duração do contador de expiração, em segundos */
  expires?: number;
  /** rota de destino do CTA (a mesma da referência) */
  next: string;
  /** prefixo dos eventos de telemetria */
  event: string;
  /** segundo do vídeo em que a oferta entra (libera o CTA) */
  ctaAt?: number;
};

export function Pv11Vsl({ fallback, expires = 27 * 60 + 40, next, event, ctaAt }: Props) {
  const router = useRouter();
  const [balance] = useState(() => {
    const b = readState().balance;
    return b > fallback ? b : fallback;
  });
  const [left, setLeft] = useState(expires);
  const [watched, setWatched] = useState(0);
  // segundo em que a oferta entra: explícito no funil ou fração da duração real
  const [offerAt, setOfferAt] = useState<number | undefined>(ctaAt);
  const [watchers, setWatchers] = useState(1243);
  const started = useRef(false);
  const lastTracked = useRef(-1);

  // contador do saldo expirando
  useEffect(() => {
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);

  // espectadores oscilando
  useEffect(() => {
    const id = window.setInterval(
      () => setWatchers((w) => Math.max(1180, w + Math.round(Math.random() * 18 - 8))),
      4200,
    );
    return () => window.clearInterval(id);
  }, []);

  const clock = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;

  const play = () => {
    if (started.current) return;
    started.current = true;
    track(`${event}_vsl_play`, trackingParams());
  };

  const finish = () => {
    track(`${event}_vsl_finish`, { balance, ...trackingParams() });
  };

  const activate = useCallback(() => {
    track(`${event}_vsl_activate`, { balance, ...trackingParams() });
    // Meta CAPI + pixel: InitiateCheckout no clique que leva ao Paggins
    fireEvent("InitiateCheckout", {
      value: VSL_PRICE,
      currency: "USD",
      content_name: "CashClub Front",
    });
    router.push(`${next}?to=${encodeURIComponent(checkoutUrl(BACK_CHECKOUT_FULL))}`);
  }, [balance, router, next, event]);

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden">
      <div className="mc-glow" />

      <div className="relative z-10 mx-auto w-full max-w-[440px] space-y-4 px-4 pb-8 pt-6">
        {/* topo: três IAs da licença + saldo */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {MAKERS.map((m) => (
              <span
                key={m.id}
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: m.bg, color: m.color, boxShadow: "0 0 0 2px #090909, 0 0 0 3px #303030" }}
              >
                <AiMaker brand={m.id} size={17} />
              </span>
            ))}
          </div>

          <div className="rounded-2xl border border-[#303030] bg-[#111111] px-3 py-1.5">
            <p className="mb-0.5 text-[8px] font-bold uppercase leading-tight tracking-[0.18em] text-[#666666]">
              Balance
            </p>
            <p className="tabular text-base font-bold leading-none text-white">{money(balance)}</p>
          </div>
        </div>

        {/* aviso do contador */}
        <div className="rounded-[20px] border border-[#a8ff16]/30 bg-[#151b0d] px-4 py-3 text-center">
          <p className="flex items-center justify-center gap-2 text-[14px] font-bold text-[#a8ff16]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            BALANCE EXPIRES IN <span className="tabular text-white">{clock}</span>
          </p>
          <p className="mt-1 text-[12px] text-[#888888]">Watch the video to lock in your funds</p>
        </div>

        {/* player */}
        <div className="overflow-hidden rounded-[20px] border border-[#303030] bg-[#0d0d0d]">
          <VturbPlayer
            onPlay={play}
            onProgress={(t) => {
              setWatched(t);
              const mark = Math.floor(t / 15);
              if (mark === lastTracked.current) return;
              lastTracked.current = mark;
              track(`${event}_vsl_progress`, { t: Math.floor(t), ...trackingParams() });
            }}
            onFinish={finish}
            onMeta={(d) => setOfferAt((prev) => prev ?? Math.round(d * OFFER_RATIO))}
          />

          <VslCta watched={watched} onActivate={activate} ctaAt={offerAt} />
        </div>

        {/* audiência */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#303030] bg-[#111111] px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a8ff16] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#a8ff16]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Live</span>
            <span className="tabular ml-0.5 text-[10px] font-semibold text-[#888888]">
              {watchers.toLocaleString("en-US")} watching now
            </span>
          </span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="flex -space-x-2">
            {AVATARS.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                width={32}
                height={32}
                loading="lazy"
                className="h-8 w-8 rounded-full border-2 border-[#090909] object-cover"
              />
            ))}
          </div>
          <span className="text-[12.5px] text-[#888888]">+487 users completed setup today</span>
        </div>

        {/* comentários */}
        <div className="space-y-2.5">
          {COMMENTS.map((c) => (
            <div key={c.n} className="flex items-start rounded-[20px] border border-[#303030] bg-[#111111] p-3">
              <img
                src={c.avatar}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                className="mr-3 h-10 w-10 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#a8ff16]">{c.n}</p>
                <p className="mt-1 text-[12.5px] leading-snug text-[#cccccc]">{c.c}</p>
                <div className="mt-2 flex items-center gap-3 text-[10.5px] text-[#666666]">
                  <span>Like</span>
                  <span>Reply</span>
                  <span>{c.t}</span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-[#303030] bg-[#1b1b1d] px-2 py-[2px] text-[#888888]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                    </svg>
                    {c.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* tiles */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[18px] border border-[#303030] bg-[#111111] p-3 text-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <p className="text-[13px] font-semibold text-white">47</p>
            <p className="text-[10px] text-[#666666]">Spots left</p>
          </div>
          <div className="rounded-[18px] border border-[#303030] bg-[#111111] p-3 text-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            </svg>
            <p className="text-[13px] font-semibold text-white">US${VSL_PRICE.toFixed(2)}</p>
            <p className="text-[10px] text-[#666666]">One-time · secure</p>
          </div>
          <div className="rounded-[18px] border border-[#303030] bg-[#111111] p-3 text-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <p className="tabular text-[13px] font-semibold text-white">{money(balance)}</p>
            <p className="text-[10px] text-[#666666]">Your Balance</p>
          </div>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#666666]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
          256-bit SSL encryption · Your data is secure
        </p>
      </div>
    </main>
  );
}

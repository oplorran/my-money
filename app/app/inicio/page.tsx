"use client";

import Link from "next/link";
import { useState } from "react";
import { LESSONS, cue, pocketUrl } from "@/lib/member";
import type { Lesson } from "@/lib/member";
import { session, useSession } from "@/lib/session-store";
import { InstallCard } from "@/components/install-card";
import { Logo } from "@/components/marks";
import { VturbPlayer } from "@/components/vturb-player";


function Step({ n, title, minutes, done }: { n: number; title: string; minutes: string; done: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${
          done ? "bg-[#a8ff16] text-[#090909]" : "border border-[#303030] bg-[#1b1b1d] text-[#666666]"
        }`}
      >
        {done ? "✓" : n}
      </span>
      <span className={`flex-1 text-[12.5px] ${done ? "text-[#666666] line-through" : "text-[#cccccc]"}`}>
        {title}
      </span>
      <span className="text-[10.5px] text-[#666666]">{minutes}</span>
    </li>
  );
}

function Player({
  lesson,
  open,
  onOpen,
  onWatch,
}: {
  lesson: Lesson;
  open: boolean;
  onOpen: () => void;
  onWatch: () => void;
}) {
  return (
    <div className="relative mx-4 mb-4 overflow-hidden rounded-xl border border-[#303030] bg-black">
      {open ? (
        <VturbPlayer playerId={lesson.player} onPlay={onWatch} className="rounded-none border-0" />
      ) : (
        <div className="relative pb-[56.25%]">
          <button
            type="button"
            onClick={() => {
              onOpen();
              cue("tap");
            }}
            aria-label={`Play, ${lesson.track}`}
            className="group absolute inset-0 flex items-center justify-center bg-[#0b0b0b]"
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,255,22,.12),transparent_65%)]" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#a8ff16]/45 bg-[#a8ff16]/12 text-[#a8ff16] transition-transform group-hover:scale-105">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className="absolute bottom-2.5 left-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
              {lesson.minutes} min · {lesson.track}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { member, watched, welcome } = useSession();
  // só um player por vez: o stub do VTurb é global e remontaria os outros
  const [openId, setOpenId] = useState<number | null>(null);
  const watch = (id: number) => session.watch(id);

  const lessonsDone = watched.length >= LESSONS.length;
  const first = member?.name.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-5">
      <div className="ma-in">
        <span className="ma-badge mb-3">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a8ff16]" />
          Licence active
        </span>
        <h1 className="text-[24px] font-black leading-tight text-white">You&apos;re in, {first}!</h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#888888]">
          Follow these steps to activate your AI and start trading.
        </p>
      </div>

      <div className="ma-card ma-in mt-5 p-4">
        <p className="mb-3 text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#666666]">Activation roadmap</p>
        <ul className="space-y-2.5">
          <Step n={1} title="Watch the 5 lessons" minutes="10 min" done={lessonsDone} />
          <Step n={2} title="Use the Accelerator" minutes="1 min" done={false} />
          <Step n={3} title="Activate your Pocket" minutes="5 min" done={false} />
        </ul>
      </div>

      <div className="ma-card ma-in mt-3 flex items-start gap-3 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#a8ff16]/12 text-[#a8ff16]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 21a2 2 0 0 0 3.4 0" />
            <path d="M18 8a6 6 0 1 0-12 0c0 4-2 5-2 5h16s-2-1-2-5" />
          </svg>
        </span>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-white">Turn on notifications</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#888888]">
            Be the first to know about important updates on your account.
          </p>
          <button
            type="button"
            onClick={() => cue("tap")}
            className="mt-2.5 rounded-full border border-[#303030] bg-[#1b1b1d] px-3 py-1.5 text-[11px] font-bold text-white"
          >
            Turn on notifications
          </button>
        </div>
      </div>

      <InstallCard />

      <div className="ma-in mt-6 space-y-3">
        {LESSONS.map((lesson) => {
          const done = watched.includes(lesson.id);
          return (
            <article key={lesson.id} className="ma-card overflow-hidden">
              <div className="flex items-center gap-3 px-4 pb-3 pt-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#303030] bg-[#1b1b1d] text-[11px] font-bold text-[#888888]">
                  {String(lesson.id).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#666666]">
                    Lesson {String(lesson.id).padStart(2, "0")}
                  </p>
                  <h2 className="truncate text-[14px] font-semibold leading-snug text-white">{lesson.title}</h2>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 ${
                    done
                      ? "border-[#a8ff16]/30 bg-[#a8ff16]/10 text-[#a8ff16]"
                      : "border-[#303030] bg-[#1b1b1d] text-[#666666]"
                  }`}
                >
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                  <span className="text-[8.5px] font-bold uppercase tracking-[0.12em]">
                    {done ? "Watched" : "Open"}
                  </span>
                </span>
              </div>
              <Player
                lesson={lesson}
                open={openId === lesson.id}
                onOpen={() => setOpenId(lesson.id)}
                onWatch={() => watch(lesson.id)}
              />
            </article>
          );
        })}
      </div>

      <div className="ma-card ma-in mt-5 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666666]">Next step</p>
        <h2 className="mt-1.5 text-[15px] font-bold text-white">Your AI is ready — activate your Pocket</h2>
        <p className="mt-1.5 text-[12px] leading-relaxed text-[#888888]">
          {watched.length}/{LESSONS.length} lessons watched. Open your broker account with the same e-mail to trade
          with the signals.
        </p>
        <a
          href={pocketUrl(member?.email)}
          target="_blank"
          rel="noreferrer"
          className="mc-cta mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] py-3.5 text-[13.5px] font-bold"
        >
          Go to Pocket
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          </svg>
        </a>
        <Link
          href="/app/accelerator"
          className="mt-3 block text-center text-[11.5px] text-[#888888] underline decoration-[#303030] underline-offset-4"
        >
          Skip and use the Accelerator instead
        </Link>
      </div>

      <p className="ma-in mt-5 text-center text-[10.5px] leading-relaxed text-[#666666]">
        Plan: start with $50 · ~15 min to activate
      </p>

      {welcome && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
          <div className="ma-card ma-in w-full max-w-sm p-6 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#a8ff16]/35 bg-[#a8ff16]/12 p-2">
              <Logo variant="mark" height={26} />
            </span>
            <h2 className="text-[19px] font-black leading-tight text-white">Welcome to Cash Club!</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#888888]">
              This is your app, where you&apos;ll earn using artificial intelligence.
            </p>
            <p className="mt-5 text-left text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#666666]">
              Complete these steps
            </p>
            <ul className="mt-2.5 space-y-2 text-left">
              {["Watch all 5 lessons", "Use the Accelerator", "Activate your Pocket"].map((t, i) => (
                <li key={t} className="flex items-center gap-2.5 text-[12px] text-[#cccccc]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1b1b1d] text-[10px] font-black text-[#888888]">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10.5px] text-[#666666]">Total time: ~15 minutes</p>
            <button
              type="button"
              onClick={() => {
                session.dismissWelcome();
                cue("tap");
              }}
              className="mc-cta mt-4 w-full rounded-[16px] py-3.5 text-[14px] font-bold"
            >
              Start now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

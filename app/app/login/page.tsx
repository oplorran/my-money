"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/marks";
import { cue } from "@/lib/member";
import { session, useSession } from "@/lib/session-store";

const LICENCE = [
  "5 activation lessons",
  "AI signal engine",
  "Goal accelerator",
  "Member ranking",
];

export default function MemberLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { member, ready } = useSession();

  useEffect(() => {
    if (ready && member) router.replace("/app/inicio");
  }, [ready, member, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError("Enter a valid e-mail to continue.");
      return;
    }
    setBusy(true);
    setError("");
    cue("win");
    session.enter(value);
    router.replace("/app/inicio");
  };

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-8">
      <div className="ma-in flex flex-col items-center text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#303030] bg-[#111111]">
          <Logo height={40} variant="mark" priority />
        </span>
        <span className="ma-badge mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-[#a8ff16]" />
          Licence active
        </span>
        <h1 className="text-[26px] font-black leading-tight text-white">You&apos;re in.</h1>
        <p className="mt-2 max-w-[19rem] text-[13px] leading-relaxed text-[#888888]">
          This is your app, where you earn using artificial intelligence. Sign in with the e-mail you used at
          checkout.
        </p>
      </div>

      <form onSubmit={submit} className="ma-in mt-7 space-y-3" noValidate>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#666666]">
            E-mail
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            className="w-full rounded-[18px] border border-[#303030] bg-[#111111] px-4 py-3.5 text-[14px] text-white placeholder:text-[#666666] focus:border-[#a8ff16]/60 focus:outline-none"
          />
        </label>

        {error && <p className="text-[11.5px] font-medium text-[#ff6b6b]">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mc-cta w-full rounded-[16px] py-3.5 text-[14px] font-bold tracking-wide"
        >
          {busy ? "Opening your app…" : "Access my account"}
        </button>
      </form>

      <div className="ma-card mt-6 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#666666]">Included in your access</p>
        <ul className="mt-3 space-y-2">
          {LICENCE.map((item) => (
            <li key={item} className="flex items-center gap-2 text-[12.5px] text-[#cccccc]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-center text-[10.5px] leading-relaxed text-[#666666]">
        Demo area: any valid e-mail opens the app. No password needed.
      </p>
    </div>
  );
}

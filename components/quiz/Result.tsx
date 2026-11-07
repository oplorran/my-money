"use client";

import type { Profile } from "@/lib/quiz";

export function Result({ profile, onContinue }: { profile: Profile; onContinue: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#a8ff16]/35 bg-[#121c14]">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#63778f]">Your profile is</p>
      <h2 className="mb-3 text-3xl font-black text-[#a8ff16]">{profile.name}</h2>
      <p className="mb-6 text-[15px] leading-snug text-[#8fa3bd]">{profile.headline}</p>

      <div className="qa-glass mb-6 rounded-2xl p-4 text-left">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#63778f]">Your traits</p>
        <ul className="space-y-2">
          {profile.traits.map((t) => (
            <li key={t} className="flex items-start gap-2 text-[13px] text-[#c3d2e4]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[#a8ff16]/28 bg-[#151b0d] p-4 text-left">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#a8ff16]">Recommendation</p>
        <p className="text-[13px] leading-snug text-[#c3d2e4]">
          You have the profile that benefits most from having AI organize your finances. Start today, at your own pace.
        </p>
      </div>

      <button onClick={onContinue} className="qa-cta mt-5 w-full rounded-[18px] py-4 font-bold transition-transform active:scale-[.98]">
        See my recommendation
      </button>
    </div>
  );
}

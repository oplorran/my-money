"use client";

import type { Profile } from "@/lib/quiz";

export function Result({ profile, onContinue }: { profile: Profile; onContinue: () => void }) {
  return (
    <div className="text-center">
      <div className={`w-24 h-24 rounded-3xl mx-auto mb-5 flex items-center justify-center bg-gradient-to-br ${profile.gradient} shadow-xl`}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <p className="text-[11px] font-bold tracking-[0.18em] text-slate-400 mb-1">YOUR PROFILE IS</p>
      <h2 className={`text-3xl font-black mb-3 ${profile.accent}`}>{profile.name}</h2>
      <p className="text-[15px] text-slate-600 leading-snug mb-6">{profile.headline}</p>

      <div className="qa-glass rounded-2xl p-4 text-left mb-6">
        <p className="text-[11px] font-bold tracking-wider text-slate-400 mb-2.5">YOUR TRAITS</p>
        <ul className="space-y-2">
          {profile.traits.map((t) => (
            <li key={t} className="flex items-start gap-2 text-[13px] text-slate-700">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="mc-cta rounded-2xl p-4 text-left">
        <p className="text-[11px] font-bold tracking-wider text-white/70 mb-1">RECOMMENDATION</p>
        <p className="text-[13px] text-white leading-snug">
          You have the profile that benefits most from having AI organize your finances. Start today, at your own pace.
        </p>
      </div>

      <button onClick={onContinue} className="mt-5 w-full py-4 rounded-2xl text-white font-bold bg-slate-900 active:scale-[.98] transition-transform">
        See my recommendation
      </button>
    </div>
  );
}
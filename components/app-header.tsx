"use client";

export function AppHeader({ label = "My Money" }: { label?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-2 relative z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-400 flex items-center justify-center shadow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l5-5 4 3 6-7" />
          </svg>
        </div>
        <span className="text-white font-bold text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/12 border border-emerald-600/30 px-2.5 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-emerald-400 text-[10px] font-bold tracking-wider">LIVE</span>
      </div>
    </div>
  );
}

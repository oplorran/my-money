"use client";

export function AppHeader({ label = "Cash Club" }: { label?: string }) {
  return (
    <div className="relative z-10 flex items-center justify-between border-b border-[#292929] px-5 pb-3 pt-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#111111] ring-1 ring-[#303030]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l5-5 4 3 6-7" />
          </svg>
        </div>
        <span className="text-sm font-bold text-white">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-[#a8ff16]/30 bg-[#a8ff16]/10 px-2.5 py-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a8ff16]" />
        <span className="text-[10px] font-bold tracking-wider text-[#a8ff16]">LIVE</span>
      </div>
    </div>
  );
}

"use client";

import { Logo } from "@/components/marks";

export function AppHeader({ label = "Cash Club" }: { label?: string }) {
  return (
    <div className="relative z-10 flex items-center justify-between border-b border-[#292929] px-5 pb-3 pt-5">
      <div className="flex items-center gap-2">
        <Logo height={16} priority />
        {label !== "Cash Club" && (
          <span className="text-sm font-bold text-white">{label}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-[#a8ff16]/30 bg-[#a8ff16]/10 px-2.5 py-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a8ff16]" />
        <span className="text-[10px] font-bold tracking-wider text-[#a8ff16]">LIVE</span>
      </div>
    </div>
  );
}

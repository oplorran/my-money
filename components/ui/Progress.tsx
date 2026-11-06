"use client";

export function Progress({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#151b0d] ring-1 ring-[#a8ff16]/35">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3 8-8" />
              <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
            </svg>
          </div>
          <span className="tabular text-sm font-bold text-white">
            {String(current).padStart(2, "0")}
            <span className="text-[#666666]">/{String(total).padStart(2, "0")}</span>
          </span>
        </div>
        <span className="tabular text-xs font-semibold text-[#888888]">{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#1b1b1d]">
        <div
          className="h-full rounded-full bg-[#a8ff16] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

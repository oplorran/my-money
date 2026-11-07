"use client";

import { RANKING, RANK_POSITION, RANK_TOTAL, usd } from "@/lib/member";
import { useSession } from "@/lib/session-store";

function Avatar({ name, on }: { name: string; on?: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-black ${
        on ? "bg-[#a8ff16] text-[#090909]" : "border border-[#303030] bg-[#1b1b1d] text-white"
      }`}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export default function Ranking() {
  const { member } = useSession();
  const pct = Math.round(((RANK_TOTAL - RANK_POSITION) / RANK_TOTAL) * 1000) / 10;
  const totalLabel = new Intl.NumberFormat("en-US").format(RANK_TOTAL);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-5">
      <div className="ma-in">
        <h1 className="text-[21px] font-black leading-tight text-white">Ranking</h1>
        <p className="mt-1 text-[12px] text-[#888888]">Top users this month.</p>
      </div>

      <div className="ma-card ma-in mt-4 flex items-center gap-3 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#a8ff16] text-[15px] font-black text-[#090909]">
          {(member?.name ?? "Y").slice(0, 1).toUpperCase()}
        </span>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-white">
            {member?.name ?? "You"}{" "}
            <span className="font-medium text-[#666666]">(you)</span>
          </p>
          <p className="mt-0.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#666666]">
            Your position this month
          </p>
        </div>
        <div className="text-right">
          <p className="tabular text-[19px] font-black leading-none text-white">#{RANK_POSITION}</p>
          <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.12em] text-[#666666]">of {totalLabel}</p>
        </div>
      </div>

      <div className="ma-in mt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-[#1b1b1d]">
          <div className="h-full rounded-full bg-[#a8ff16]" style={{ width: `${Math.max(4, pct)}%` }} />
        </div>
        <p className="mt-1.5 text-right text-[10px] text-[#666666]">Top {Math.round(pct)}% · keep going</p>
      </div>

      <ul className="ma-in mt-4 space-y-2">
        {RANKING.map((user, i) => (
          <li key={user.name} className="ma-card-flat flex items-center gap-3 p-3">
            <span className="w-5 shrink-0 text-center text-[11.5px] font-bold text-[#666666]">
              {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
            </span>
            <Avatar name={user.name} on={i < 3} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-white">{user.name}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#666666]">This month</p>
            </div>
            <span className="tabular text-[12.5px] font-bold text-[#a8ff16]">{usd(user.amount)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-[10.5px] text-[#666666]">
        … and {totalLabel} more users
      </p>
    </div>
  );
}

"use client";

import { money } from "@/lib/funnel";

type Scene =
  | "ledger"
  | "projection"
  | "gates"
  | "locked"
  | "guarantee"
  | "scarcity"
  | "anchor"
  | "price"
  | "data"
  | "confidence"
  | "members"
  | "audience"
  | "growth"
  | "unlocked";

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="mc-fade mb-3 rounded-[20px] border border-[#303030] bg-[#111111] p-3">{children}</div>
);

const Tag = ({ children, tone = "lime" }: { children: React.ReactNode; tone?: "lime" | "muted" }) => (
  <span
    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
      tone === "muted" ? "bg-[#1b1b1d] text-[#888888]" : "bg-[#a8ff16]/20 text-[#a8ff16]"
    }`}
  >
    {children}
  </span>
);

/** Réguas visuais da chamada — cada fala forte troca o palco. */
export function Pv14Stage({
  scene,
  amount,
  name,
  target,
}: {
  scene: Scene;
  amount: number;
  name: string;
  target: number;
}) {
  if (scene === "ledger") {
    return (
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#888888]">Account balance</p>
          <Tag tone="muted">Pending</Tag>
        </div>
        <p className="tabular text-[26px] font-bold leading-none text-[#a8ff16]">{money(amount)}</p>
        <p className="mt-1 text-[10px] text-[#666666]">Available after verification</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-[#303030] pt-2 text-center">
          {[
            ["Withdrawal method", "Bank"],
            ["Session", "Completed"],
            ["Operations", "5"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[8px] uppercase tracking-wider text-[#666666]">{k}</p>
              <p className="text-[11px] font-semibold text-white">{v}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[8.5px] uppercase tracking-[0.18em] text-[#666666]">
          Money Club · Ledger
        </p>
      </Card>
    );
  }

  if (scene === "projection") {
    const w1 = Math.round(target * 0.162);
    const w2 = Math.round(target * 0.214);
    return (
      <Card>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#888888]">Projection</p>
          <span className="text-[8.5px] uppercase tracking-wider text-[#666666]">Based on your profile</span>
        </div>
        <div className="space-y-1">
          {[
            ["Week 1", "calibrating", `${money(w1)}–${money(w2)}`],
            ["Month 1", "calibration", money(Math.round(target * 0.7))],
            ["Month 2", "on target", money(target)],
            ["Month 3", "full speed", money(target)],
          ].map(([k, n, v]) => (
            <div key={k} className="flex items-center justify-between gap-2">
              <span className="w-[52px] shrink-0 text-[9.5px] font-semibold uppercase tracking-wider text-[#888888]">{k}</span>
              <span className="flex-1 truncate text-[9px] text-[#666666]">{n}</span>
              <span className="tabular text-[11px] font-bold text-white">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-[#303030] pt-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#666666]">90 days</span>
          <span className="tabular text-[12.5px] font-black text-[#a8ff16]">{money(Math.round(target * 2.7))}</span>
        </div>
      </Card>
    );
  }

  if (scene === "audience") {
    return (
      <Card>
        <p className="text-center text-[34px] font-black leading-none text-white">0.3%</p>
        <p className="mt-1 text-center text-[10px] uppercase tracking-[0.16em] text-[#888888]">Had access</p>
      </Card>
    );
  }

  if (scene === "growth") {
    return (
      <Card>
        <div className="flex items-baseline justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#888888]">Portfolio growth</p>
          <span className="text-[9px] uppercase tracking-wider text-[#666666]">Last 14 sessions</span>
        </div>
        <p className="mt-1 text-center text-[26px] font-black leading-none text-[#a8ff16]">+312%</p>
      </Card>
    );
  }

  if (scene === "gates") {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#888888]">Chess engine</p>
          <span className="text-[#a8ff16]">→</span>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#888888]">Market engine</p>
        </div>
        <p className="mt-2 text-center text-[11px] text-[#cccccc]">The same logic that beat grandmasters</p>
      </Card>
    );
  }

  if (scene === "data") {
    return (
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <Tag>Money Club AI</Tag>
          <span className="text-[8.5px] uppercase tracking-wider text-[#666666]">1.2M data points / s</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {["HEDGE FUNDS", "INVESTMENT BANKS", "PROP DESKS", "MARKET MAKERS"].map((i) => (
            <p key={i} className="rounded-xl bg-[#0d0d0d] px-2 py-1.5 text-[8.5px] font-bold tracking-wider text-[#888888]">
              {i}
            </p>
          ))}
        </div>
      </Card>
    );
  }

  if (scene === "confidence") {
    return (
      <Card>
        <div className="flex items-baseline justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#888888]">Confidence gate</p>
          <span className="tabular text-[15px] font-black text-[#a8ff16]">90%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1b1b1d]">
          <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-[#6fbf00] to-[#a8ff16]" />
        </div>
        <p className="mt-1.5 text-[9.5px] text-[#888888]">Below this line the AI does not open a position</p>
      </Card>
    );
  }

  if (scene === "members") {
    return (
      <Card>
        <div className="mb-1.5 flex items-center justify-between">
          <Tag>Incoming document</Tag>
          <span className="text-[8.5px] uppercase tracking-wider text-[#666666]">Received now</span>
        </div>
        <div className="flex gap-1.5">
          {["María", "James", "Marco"].map((n) => (
            <span key={n} className="flex-1 rounded-xl bg-[#0d0d0d] py-1.5 text-center text-[10px] font-semibold text-[#cccccc]">
              {n}
            </span>
          ))}
        </div>
      </Card>
    );
  }

  if (scene === "locked") {
    return (
      <Card>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[#303030] bg-[#0d0d0d] p-2">
            <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-[#666666]">Demonstration</p>
            <p className="text-[9.5px] leading-snug text-[#888888]">Withdrawal locked</p>
            <p className="text-[9.5px] leading-snug text-[#888888]">Limited trading</p>
            <p className="text-[9.5px] leading-snug text-[#888888]">Test credit only</p>
          </div>
          <div className="rounded-xl border border-[#a8ff16]/30 bg-[#151b0d] p-2">
            <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-[#a8ff16]">Active account</p>
            <p className="text-[9.5px] leading-snug text-[#cccccc]">Withdrawals released</p>
            <p className="text-[9.5px] leading-snug text-[#cccccc]">AI trading 24/7</p>
            <p className="text-[9.5px] leading-snug text-[#cccccc]">No limits</p>
          </div>
        </div>
      </Card>
    );
  }

  if (scene === "guarantee") {
    return (
      <Card>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#a8ff16]/20 text-[15px] font-black text-[#a8ff16]">
            7
          </span>
          <div>
            <p className="text-[11.5px] font-bold leading-tight text-white">7-Day Guarantee</p>
            <p className="text-[9.5px] uppercase tracking-wider text-[#a8ff16]">Risk free · full refund, no questions</p>
          </div>
        </div>
      </Card>
    );
  }

  if (scene === "scarcity") {
    return (
      <Card>
        <div className="mb-1 flex items-baseline justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#888888]">Verified accounts this cycle</p>
          <Tag>Live</Tag>
        </div>
        <p className="tabular text-[17px] font-bold leading-none text-white">300 / 350</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1b1b1d]">
          <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-[#6fbf00] to-[#a8ff16]" />
        </div>
        <div className="mt-1 flex justify-between text-[9px] uppercase tracking-wider text-[#666666]">
          <span>86% filled</span>
          <span className="font-bold text-[#a8ff16]">Only 50 spots left</span>
        </div>
      </Card>
    );
  }

  if (scene === "anchor") {
    return (
      <Card>
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#888888]">Institutional cost / year</p>
        <div className="flex items-center gap-1.5">
          {["$2,000", "$500", "$200"].map((v, i) => (
            <span
              key={v}
              className={`tabular flex-1 rounded-xl py-1.5 text-center text-[12px] font-bold ${
                i === 0 ? "bg-[#0d0d0d] text-[#666666] line-through" : "bg-[#1b1b1d] text-[#cccccc]"
              }`}
            >
              {v}
            </span>
          ))}
        </div>
      </Card>
    );
  }

  if (scene === "price") {
    return (
      <Card>
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#a8ff16]">Activation today</p>
          <p className="tabular text-[30px] font-black leading-none text-white">$27</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#666666]">One time · no monthly fee</p>
        </div>
      </Card>
    );
  }

  if (scene === "unlocked") {
    return (
      <Card>
        <div className="text-center">
          <div className="relative mx-auto mb-2 flex h-14 w-14 items-center justify-center">
            <span className="mc-breathe absolute inset-0 rounded-full border border-[#a8ff16]/40" />
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a8ff16]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#a8ff16]">Activation unlocked</p>
          <p className="mt-0.5 text-[11px] text-[#888888]">{name ? `${name}, your account is one step away.` : "Your account is one step away."}</p>
        </div>
      </Card>
    );
  }

  return null;
}

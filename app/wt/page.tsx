import type { Metadata } from "next";
import { WtCta } from "@/components/wt-cta";

export const metadata: Metadata = {
  title: "The quiet rise of AI tools for everyday investors · TradeGuide AI",
  description: "Research, not a pitch. A week testing an AI trading tool and what stood out.",
  robots: { index: true, follow: true },
};

export default function Wt() {
  return (
    <main className="relative min-h-screen bg-[#fdfdfb] text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <span className="font-serif text-lg font-bold">
            TradeGuide <span className="text-indigo-600">AI</span>
          </span>
          <span className="text-[11px] text-slate-400">Research, not a pitch</span>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-5 py-8">
        <p className="mb-2 text-[11px] font-bold tracking-wider text-indigo-600">
          MARKETS / TECHNOLOGY
        </p>
        <h1 className="mb-3 font-serif text-3xl font-bold leading-tight">
          The quiet rise of AI tools for everyday investors
        </h1>
        <p className="mb-6 text-sm text-slate-500">By the TradeGuide Desk / 6 min read / Updated this week</p>

        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
          A note on expectations: trading involves risk. Loss is normal here. Nothing below is a guarantee of returns.
        </div>

        <p className="mb-4 leading-relaxed">
          For years, algorithmic trading lived behind institutional walls. That is changing. A new wave of tools
          promises to bring the same analysis retail platforms use into a phone app.
        </p>
        <p className="mb-4 leading-relaxed">
          We spent a week testing one of them. The idea is simple: the tool reads the market, scores setups, and only
          fires when its confidence clears a threshold. On the demo it is calm, methodical, and - importantly - it
          does not pretend to win every time.
        </p>

        <h2 className="mb-2 mt-8 font-serif text-xl font-bold">What stood out</h2>
        <ul className="mb-6 space-y-2 text-[15px]">
          {[
            "Clear, boring interface - no flashing charts",
            "A confidence gate that blocks low-quality trades",
            "A demo you can run without a card",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-emerald-600">+</span>
              {t}
            </li>
          ))}
        </ul>

        <div className="my-8 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-1 font-serif text-lg font-bold">Try it for $1</p>
          <p className="mb-3 text-[13px] text-slate-500">
            A tripwire to get you in the door. Card required, cancel anytime.
          </p>
          <WtCta />
        </div>

        <p className="text-[12px] leading-relaxed text-slate-400">
          Disclaimer: this article is for informational and educational purposes. It is not investment advice. Past
          patterns do not guarantee future results.
        </p>
      </article>
    </main>
  );
}
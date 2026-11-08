"use client";

import { useRouter } from "next/navigation";
import { UP1_CHECKOUT, checkoutUrl, goExternal } from "@/lib/funnel";
import { track, trackingParams } from "@/lib/track";

type Perk = { label: string; note: string; hue: string; icon: React.ReactNode };

const PERKS: Perk[] = [
  {
    label: "40+ analyses per day",
    note: "5x more market opportunities",
    hue: "#a8ff16",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.6 3.3a.5.5 0 0 1 .9 0l3 5.6a1 1 0 0 0 1.5.3l4.3-3.7a.5.5 0 0 1 .8.5l-2.8 10.2a1 1 0 0 1-1 .7H5.8a1 1 0 0 1-1-.7L2 6a.5.5 0 0 1 .8-.5l4.3 3.7a1 1 0 0 0 1.5-.3z" />
        <path d="M5 21h14" />
      </svg>
    ),
  },
  {
    label: "92% win rate",
    note: "maximum AI precision",
    hue: "#7dd3fc",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
      </svg>
    ),
  },
  {
    label: "Personal Account Manager",
    note: "dedicated human support",
    hue: "#c084fc",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    ),
  },
  {
    label: "$800–$1,000/day",
    note: "earning potential",
    hue: "#fbbf24",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 6.5A4.5 4.5 0 0 0 12.5 4h-1a4.2 4.2 0 0 0 0 8.4h1a4.2 4.2 0 0 1 0 8.4h-1A4.5 4.5 0 0 1 7 18" />
      </svg>
    ),
  },
];

const LOST: { n: string; a: string; b: string }[] = [
  { n: "Daily analyses", a: "8", b: "40+" },
  { n: "AI precision", a: "74%", b: "92%" },
  { n: "Support", a: "E-mail", b: "24/7 priority" },
  { n: "Account manager", a: "—", b: "Included" },
];

export default function Up1() {
  const router = useRouter();

  const buy = () => {
    track("upsell1_click", { plan: "premium", price: 297, ...trackingParams() });
    goExternal(checkoutUrl(UP1_CHECKOUT, { upsell: true }));
  };

  const skip = () => {
    track("upsell1_skip", trackingParams());
    router.push("/hot/up2");
  };

  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden pb-10">
      <div className="mc-glow" />

      {/* alerta fixo — o acesso ainda não está completo */}
      <div className="up-alert sticky top-0 z-30 px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-center gap-2.5">
          <span className="up-alert-ico text-white">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </span>
          <p className="text-center text-[12.5px] font-bold leading-snug text-white">
            Attention! Your APP access is not 100% complete yet…
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-4 pt-5">
        {/* stepper: etapa 3 em vermelho, pulsando */}
        <div className="mb-4">
          <div className="mb-1.5 grid grid-cols-3 text-center">
            {["Step 1", "Step 2", "Step 3"].map((s, i) => (
              <p key={s} className={`text-[9.5px] font-bold uppercase tracking-[0.14em] ${i === 2 ? "text-[#ff6b6b]" : "text-[#6b6b6b]"}`}>
                {s}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-3">
            <div className="up-step up-step-ok">
              <span>Sign-up</span>
              <span>complete</span>
              <span className="text-[13px]">✓</span>
            </div>
            <div className="up-step up-step-now">
              <span>Activate</span>
              <span>your</span>
              <span>plan</span>
            </div>
            <div className="up-step up-step-next">
              <span>Completed</span>
              <span>&nbsp;</span>
              <span>&nbsp;</span>
            </div>
          </div>
        </div>

        <div className="up-hero -mx-4 px-4 pb-1 pt-3">
          <h1 className="mb-2 text-[26px] font-black leading-[1.12] tracking-tight text-white">
            Congratulations! You now have access to Cash Club.
          </h1>
          <p className="mb-1 text-[13px] leading-relaxed text-[#a1a1a1]">
            But before you place your first trade, there is one last step:
          </p>
          <p className="text-[13px] font-bold leading-relaxed text-[#a8ff16]">
            activate your premium plan to unlock the full potential of the AI.
          </p>
        </div>

        <h2 className="mb-2.5 mt-5 text-[15.5px] font-black text-white">What does the Premium Plan include?</h2>
        <ul className="space-y-2">
          {PERKS.map((p) => (
            <li key={p.label} className="up-perk" style={{ borderColor: `${p.hue}33`, background: `${p.hue}0f` }}>
              <span className="up-perk-ico" style={{ background: `${p.hue}1f`, color: p.hue }}>
                {p.icon}
              </span>
              <span>
                <b style={{ color: p.hue }}>{p.label}</b> — {p.note}
              </span>
            </li>
          ))}
        </ul>

        {/* comparativo: o que fica de fora no plano básico */}
        <h2 className="mb-2 mt-6 text-[15.5px] font-black text-white">On the basic plan you keep only this:</h2>
        <div className="overflow-hidden rounded-[16px] border border-[#262626] bg-[#0d0d0d]">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[#1f1f1f] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.1em]">
            <span className="text-[#5c5c5c]">Feature</span>
            <span className="text-[#6b6b6b]">Basic</span>
            <span className="text-[#a8ff16]">Premium</span>
          </div>
          {LOST.map((row) => (
            <div key={row.n} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[#161616] px-3.5 py-2.5 text-[11.5px] last:border-0">
              <span className="text-[#9a9a9a]">{row.n}</span>
              <span className="w-14 text-center font-semibold text-[#5c5c5c] line-through decoration-[#ff6b6b]/50">{row.a}</span>
              <span className="w-14 text-center font-bold text-white">{row.b}</span>
            </div>
          ))}
        </div>

        {/* oferta */}
        <div className="up-plan mt-7">
          <span className="up-plan-tag">⭐ PREMIUM PLAN</span>
          <p className="mb-1.5 text-center text-[11.5px] text-[#9a9a9a]">Unlock everything for a single payment of:</p>
          <div className="up-price">
            <small>US</small>
            <strong>$297</strong>
            <small className="up-strike ml-2">$497</small>
          </div>
          <p className="mb-1 mt-1 text-center text-[10.5px] font-semibold text-[#a8ff16]">Save $200 — only on this page</p>
          <p className="up-fine mb-4 text-center">One-time payment · no subscription · 7-day guarantee</p>

          <ul className="mb-4 space-y-1.5">
            {[
              "40+ AI analyses per day",
              "92% win rate (maximum precision)",
              "Personal Account Manager",
              "Earning potential: $800–$1,000/day",
              "Priority 24/7 support",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-[11.5px] leading-snug text-[#cfcfcf]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="mt-[3px] shrink-0">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <button onClick={buy} className="up-cta flex w-full items-center justify-center gap-2 py-3.5 text-[14.5px] font-black">
            ACTIVATE PREMIUM
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
          <p className="up-fine mt-2.5 text-center">🔒 Secure payment · SSL encrypted · instant activation</p>
        </div>

        {/* o "não": pequeno, cinza e com fricção */}
        <div className="up-skip-box mt-4">
          <button onClick={skip} className="up-skip">
            No thanks, I want to stay on the basic plan
            <strong>You can activate later — but you lose the $200 discount.</strong>
          </button>
        </div>
      </div>
    </main>
  );
}

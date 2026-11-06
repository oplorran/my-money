"use client";

import { useEffect, useState } from "react";

/**
 * Redirector "white" do funil: segura a página ~1,2 s (como o original), preserva
 * `sck`/`xcod`/UTMs e só então sai. Aceita destino externo via `?to=` (só hosts da
 * lista branca) e cai no mapa interno quando não há destino.
 */
const PASSTHROUGH = ["sck", "xcod", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

const ALLOWED_HOSTS = [
  "go.centerpag.com",
  "checkout.centerpag.com",
  "pay.hotmart.com",
  "riseaiclub.com",
  "growaiclub.com",
  "transitaclub.com",
];

function safeTarget(raw: string): string | null {
  try {
    const url = new URL(decodeURIComponent(raw));
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");
    const ok = ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    return ok ? url.toString() : null;
  } catch {
    return null;
  }
}

export function Redirector({ fallback }: { fallback: string }) {
  const [dest, setDest] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get("to");
    let url: string | null = null;

    if (raw) {
      const target = safeTarget(raw);
      if (target) {
        const u = new URL(target);
        for (const k of PASSTHROUGH) {
          const v = sp.get(k);
          if (v) u.searchParams.set(k, v);
        }
        url = u.toString();
      }
    }

    if (!url) url = fallback;

    setDest(url);
    const t = window.setTimeout(() => window.location.replace(url!), 1200);
    return () => window.clearTimeout(t);
  }, [fallback]);

  return (
    <main className="mc-shell relative flex min-h-[100svh] flex-col items-center justify-center gap-4">
      <div className="mc-glow" />
      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <svg className="animate-spin" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a8ff16" strokeWidth="2.2" strokeLinecap="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888888]">
          Connecting to the payment page
        </p>
        <p className="max-w-[240px] break-all text-[10px] leading-snug text-[#666666]">{dest}</p>
      </div>
    </main>
  );
}

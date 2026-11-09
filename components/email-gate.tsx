"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fireEvent } from "@/lib/meta-pixel";

/**
 * Modal de captura de email do funil. Grava no banco (/api/lead), dispara Lead
 * (pixel + CAPI) e guarda o email em localStorage ("cc_email") pra prefill no
 * checkout. Chama onDone() quando o lead é salvo (ou pulado, se permitido).
 */

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}
function utms(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"].forEach((k) => {
    const v = sp.get(k);
    if (v) out[k] = v;
  });
  return out;
}

export function EmailGate({
  open,
  funnel,
  event,
  onDone,
  title = "Activate your account",
  subtitle = "Enter your email to secure your balance and unlock withdrawals.",
  cta = "Continue",
}: {
  open: boolean;
  funnel?: string;
  event?: string;
  onDone: (email: string) => void;
  title?: string;
  subtitle?: string;
  cta?: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!open || !mounted) return null;

  const submit = async () => {
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,24}$/i.test(v)) {
      setErr("Please enter a valid email");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      try { localStorage.setItem("cc_email", v); } catch {}
      // Lead: pixel browser + CAPI (via /api/lead que grava no banco e dispara CAPI)
      fireEvent("Lead", { email: v });
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: v,
          funnel,
          event,
          page_url: window.location.href,
          fbc: getCookie("_fbc") || (typeof localStorage !== "undefined" ? localStorage.getItem("_fbc") : "") || undefined,
          fbp: getCookie("_fbp") || (typeof localStorage !== "undefined" ? localStorage.getItem("_fbp") : "") || undefined,
          ...utms(),
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
    onDone(v);
  };

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 2147483647, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.82)", backdropFilter: "blur(6px)", padding: 20 }}
    >
      <div style={{ width: "100%", maxWidth: 380, background: "#111111", border: "1px solid #303030", borderRadius: 22, padding: "26px 22px", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, margin: "0 auto 14px", borderRadius: "50%", background: "#a8ff16", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" />
          </svg>
        </div>
        <h2 style={{ color: "#fff", fontSize: 19, fontWeight: 800, margin: "0 0 6px" }}>{title}</h2>
        <p style={{ color: "#888888", fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" }}>{subtitle}</p>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="you@email.com"
          style={{ width: "100%", padding: "13px 14px", borderRadius: 13, border: "1px solid #303030", background: "#0d0d0d", color: "#fff", fontSize: 15, outline: "none", marginBottom: err ? 6 : 12 }}
        />
        {err && <p style={{ color: "#ff6b6b", fontSize: 12, margin: "0 0 12px" }}>{err}</p>}
        <button
          onClick={submit}
          disabled={busy}
          style={{ width: "100%", padding: "14px", border: "none", borderRadius: 14, background: "#a8ff16", color: "#090909", fontSize: 15, fontWeight: 800, cursor: "pointer", opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "..." : cta}
        </button>
        <p style={{ color: "#555", fontSize: 10.5, marginTop: 12 }}>🔒 Your email is safe. No spam.</p>
      </div>
    </div>,
    document.body
  );
}

/** Lê o email capturado (pra prefill no checkout). */
export function savedEmail(): string {
  try { return localStorage.getItem("cc_email") || ""; } catch { return ""; }
}

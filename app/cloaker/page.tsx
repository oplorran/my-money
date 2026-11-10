"use client";

import { useEffect, useState, useCallback } from "react";

type DayRow = { date: string; allowed: string | null; blocked: string | null };
type ReasonRow = { reason: string; n: string };
type CountryRow = { country: string; allowed: string | null; blocked: string | null };
type DeviceRow = { device: string; allowed: string | null; blocked: string | null };
type LostRow = { reason: string; country: string; ip: string; ua: string; path: string; fbclid: boolean; created_at: string };

type Stats = {
  days: number;
  byDay: DayRow[];
  byReason: ReasonRow[];
  byCountry: CountryRow[];
  byDevice: DeviceRow[];
  lost: LostRow[];
  lostCount: number;
};

export default function CloakerDashboard() {
  const [key, setKey] = useState("");
  const [data, setData] = useState<Stats | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (k: string) => {
    setLoading(true); setErr("");
    try {
      const r = await fetch(`/api/cloak/stats?key=${encodeURIComponent(k)}&days=7`, { cache: "no-store" });
      if (r.status === 401) { setErr("Chave inválida"); setData(null); return; }
      const j = await r.json();
      setData(j);
      try { localStorage.setItem("cloak_key", k); } catch {}
    } catch { setErr("Erro ao carregar"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    try { const saved = localStorage.getItem("cloak_key"); if (saved) { setKey(saved); load(saved); } } catch {}
  }, [load]);

  const num = (v: string | null) => Number(v || 0);
  const totAllowed = data ? data.byDay.reduce((s, d) => s + num(d.allowed), 0) : 0;
  const totBlocked = data ? data.byDay.reduce((s, d) => s + num(d.blocked), 0) : 0;
  const total = totAllowed + totBlocked;
  const passRate = total ? Math.round((totAllowed / total) * 100) : 0;

  const card: React.CSSProperties = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 18 };
  const label: React.CSSProperties = { fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" };
  const big: React.CSSProperties = { fontSize: 28, fontWeight: 800, marginTop: 4 };

  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", padding: "28px 20px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>🛡️ Cloaker — Cash Club</h1>

        {!data && (
          <div style={{ ...card, maxWidth: 360 }}>
            <div style={label}>Chave de acesso</div>
            <input
              type="password" value={key} onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(key)}
              placeholder="CLOAK_ADMIN_KEY"
              style={{ width: "100%", marginTop: 8, padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#fff", fontSize: 14 }}
            />
            <button onClick={() => load(key)} disabled={loading} style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 8, border: 0, background: "#059669", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              {loading ? "..." : "Entrar"}
            </button>
            {err && <div style={{ color: "#f87171", fontSize: 13, marginTop: 8 }}>{err}</div>}
          </div>
        )}

        {data && (
          <>
            {/* Cards resumo */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
              <div style={card}><div style={label}>Visitantes (7d)</div><div style={big}>{total.toLocaleString()}</div></div>
              <div style={card}><div style={label}>Passaram (funil)</div><div style={{ ...big, color: "#34d399" }}>{totAllowed.toLocaleString()}</div></div>
              <div style={card}><div style={label}>Cloakados (white)</div><div style={{ ...big, color: "#fbbf24" }}>{totBlocked.toLocaleString()}</div></div>
              <div style={card}><div style={label}>Taxa de passagem</div><div style={big}>{passRate}%</div></div>
              <div style={{ ...card, borderColor: data.lostCount > 0 ? "#dc2626" : "#1e293b" }}>
                <div style={label}>⚠️ Leads perdidos</div>
                <div style={{ ...big, color: data.lostCount > 0 ? "#f87171" : "#34d399" }}>{data.lostCount}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Por dia */}
              <div style={card}>
                <div style={{ ...label, marginBottom: 12 }}>Por dia</div>
                {data.byDay.map((d) => {
                  const a = num(d.allowed), b = num(d.blocked), t = a + b || 1;
                  return (
                    <div key={d.date} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span>{d.date.slice(5)}</span>
                        <span style={{ color: "#94a3b8" }}>{a} funil · {b} white</span>
                      </div>
                      <div style={{ height: 7, background: "#1e293b", borderRadius: 99, overflow: "hidden", display: "flex" }}>
                        <div style={{ width: `${(a / t) * 100}%`, background: "#059669" }} />
                        <div style={{ width: `${(b / t) * 100}%`, background: "#f59e0b" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Motivos de bloqueio */}
              <div style={card}>
                <div style={{ ...label, marginBottom: 12 }}>Motivos de cloaking</div>
                {data.byReason.map((r) => (
                  <div key={r.reason} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: "1px solid #1e293b" }}>
                    <span>{reasonLabel(r.reason)}</span>
                    <span style={{ fontWeight: 700 }}>{Number(r.n).toLocaleString()}</span>
                  </div>
                ))}
                {data.byReason.length === 0 && <div style={{ color: "#64748b", fontSize: 13 }}>Sem bloqueios no período</div>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* País */}
              <div style={card}>
                <div style={{ ...label, marginBottom: 12 }}>Por país (funil)</div>
                {data.byCountry.slice(0, 10).map((c) => (
                  <div key={c.country} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
                    <span>{c.country}</span>
                    <span style={{ color: "#94a3b8" }}>{num(c.allowed)} funil · {num(c.blocked)} white</span>
                  </div>
                ))}
                {data.byCountry.length === 0 && <div style={{ color: "#64748b", fontSize: 13 }}>Geo indisponível (precisa de Cloudflare/header de país)</div>}
              </div>

              {/* Device */}
              <div style={card}>
                <div style={{ ...label, marginBottom: 12 }}>Por device</div>
                {data.byDevice.map((d) => (
                  <div key={d.device} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
                    <span>{d.device}</span>
                    <span style={{ color: "#94a3b8" }}>{num(d.allowed)} funil · {num(d.blocked)} white</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Canário: leads perdidos */}
            {data.lost.length > 0 && (
              <div style={{ ...card, borderColor: "#7f1d1d" }}>
                <div style={{ ...label, marginBottom: 12, color: "#f87171" }}>⚠️ Leads perdidos recentes (clique de anúncio → white)</div>
                {data.lost.map((l, i) => (
                  <div key={i} style={{ fontSize: 12.5, padding: "6px 0", borderBottom: "1px solid #1e293b", color: "#cbd5e1" }}>
                    <span style={{ color: "#f87171", fontWeight: 600 }}>{l.reason}</span>
                    {" · "}{l.country}{" · "}{l.path}{l.fbclid ? " · fbclid✓" : ""}{" · "}
                    <span style={{ color: "#64748b" }}>{new Date(l.created_at).toISOString().slice(5, 16)}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button onClick={() => load(key)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", cursor: "pointer", fontSize: 13 }}>↻ Atualizar</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function reasonLabel(r: string): string {
  const map: Record<string, string> = {
    bot: "Bot declarado",
    meta_ip: "IP da Meta (revisor)",
    adspy: "Ferramenta de espionagem",
    prefetch: "Prefetch / preview",
    desktop: "Desktop sem sinal",
    no_signal: "Sem sinal de anúncio",
    country: "País bloqueado",
    fingerprint: "Headless (cookie)",
    fp_headless: "Headless (JS)",
    no_ua: "Sem user-agent",
    sticky: "Visitante recorrente (white)",
  };
  return map[r] || r;
}

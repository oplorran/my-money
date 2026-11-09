"use client";

import { useEffect, useState, useCallback } from "react";

type Lead = {
  id: number; email: string; first_name: string | null; funnel: string | null;
  event: string | null; utm_source: string | null; utm_campaign: string | null;
  ip: string | null; created_at: string;
};

export default function LeadsPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (k: string) => {
    setLoading(true); setErr("");
    try {
      const r = await fetch(`/api/lead/list?key=${encodeURIComponent(k)}&limit=1000`);
      const d = await r.json();
      if (!r.ok || !d.ok) { setErr(d.error || "Erro"); setLoading(false); return; }
      setLeads(d.leads); setTotal(d.total); setAuthed(true);
      try { localStorage.setItem("leads_key", k); } catch {}
    } catch { setErr("Erro de conexão"); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const k = (() => { try { return localStorage.getItem("leads_key") || ""; } catch { return ""; } })();
    if (k) { setKey(k); load(k); }
  }, [load]);

  const fmtDate = (s: string) => { try { return new Date(s).toLocaleString("pt-BR"); } catch { return s; } };

  if (!authed) {
    return (
      <main style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "#090909", fontFamily: "system-ui" }}>
        <div style={{ background: "#111", border: "1px solid #303030", borderRadius: 18, padding: 28, width: 320, textAlign: "center" }}>
          <h1 style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 14 }}>🔒 Leads · Cash Club</h1>
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") load(key); }}
            placeholder="Chave de acesso" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #303030", background: "#0d0d0d", color: "#fff", outline: "none", marginBottom: 10 }} />
          <button onClick={() => load(key)} disabled={loading}
            style={{ width: "100%", padding: 12, border: "none", borderRadius: 12, background: "#a8ff16", color: "#090909", fontWeight: 800, cursor: "pointer" }}>
            {loading ? "..." : "Entrar"}
          </button>
          {err && <p style={{ color: "#ff6b6b", fontSize: 12, marginTop: 10 }}>{err}</p>}
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100svh", background: "#090909", color: "#eaeaea", fontFamily: "system-ui", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Leads</h1>
        <span style={{ background: "#151b0d", color: "#a8ff16", padding: "4px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>{total} no total</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => load(key)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #303030", background: "#111", color: "#eaeaea", cursor: "pointer" }}>↻ Atualizar</button>
          <a href={`/api/lead/list?key=${encodeURIComponent(key)}&format=csv&limit=5000`} style={{ padding: "8px 14px", borderRadius: 10, background: "#a8ff16", color: "#090909", fontWeight: 800, textDecoration: "none" }}>⬇ CSV</a>
        </div>
      </div>
      <div style={{ overflow: "auto", border: "1px solid #222", borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#111", textAlign: "left", color: "#888" }}>
              {["#", "Email", "Nome", "Funil", "Evento", "UTM source", "Campanha", "Data"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", whiteSpace: "nowrap", borderBottom: "1px solid #222" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "9px 12px", color: "#666" }}>{l.id}</td>
                <td style={{ padding: "9px 12px", fontWeight: 600 }}>{l.email}</td>
                <td style={{ padding: "9px 12px" }}>{l.first_name || "—"}</td>
                <td style={{ padding: "9px 12px" }}>{l.funnel || "—"}</td>
                <td style={{ padding: "9px 12px", color: "#a8ff16" }}>{l.event || "—"}</td>
                <td style={{ padding: "9px 12px" }}>{l.utm_source || "—"}</td>
                <td style={{ padding: "9px 12px" }}>{l.utm_campaign || "—"}</td>
                <td style={{ padding: "9px 12px", color: "#888", whiteSpace: "nowrap" }}>{fmtDate(l.created_at)}</td>
              </tr>
            ))}
            {!leads.length && <tr><td colSpan={8} style={{ padding: 20, textAlign: "center", color: "#666" }}>Nenhum lead ainda</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}

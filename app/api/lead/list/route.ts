import { getPool, ensureSchema } from "@/lib/db";

/**
 * Lista de leads (protegida por chave) pro painel. Chave via ?key= ou header
 * x-admin-key, comparada com LEADS_ADMIN_KEY.
 *
 *   GET /api/lead/list?key=XXX&limit=500&format=csv
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || req.headers.get("x-admin-key") || "";
  const expected = process.env.LEADS_ADMIN_KEY || "";
  if (!expected || key !== expected) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    if (!(await ensureSchema())) return Response.json({ ok: false, error: "no_database_url" });
    const p = getPool()!;
    const limit = Math.min(5000, Math.max(1, Number(url.searchParams.get("limit")) || 1000));
    const r = await p.query(
      `SELECT id, email, first_name, funnel, event, utm_source, utm_campaign, ip, created_at
         FROM leads ORDER BY id DESC LIMIT $1`, [limit]
    );
    const total = await p.query("SELECT COUNT(*)::int AS n FROM leads");

    if (url.searchParams.get("format") === "csv") {
      const head = "id,email,first_name,funnel,event,utm_source,utm_campaign,ip,created_at";
      const rows = r.rows.map((x) =>
        [x.id, x.email, x.first_name, x.funnel, x.event, x.utm_source, x.utm_campaign, x.ip, x.created_at?.toISOString?.() || x.created_at]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      );
      return new Response([head, ...rows].join("\n"), {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="leads.csv"` },
      });
    }

    return Response.json({ ok: true, total: total.rows[0].n, count: r.rows.length, leads: r.rows });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

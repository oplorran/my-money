import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { ensureCloakSchema } from "@/lib/cloak-stats";

/**
 * Dados do dashboard do cloaker. Protegido por ?key= (CLOAK_ADMIN_KEY).
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || "";
  const expected = process.env.CLOAK_ADMIN_KEY || process.env.LEADS_ADMIN_KEY || "cupula2026";
  if (key !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const p = getPool();
  if (!p) return NextResponse.json({ error: "no_db" }, { status: 500 });
  await ensureCloakSchema();

  const days = Math.min(30, Math.max(1, parseInt(req.nextUrl.searchParams.get("days") || "7", 10)));

  // Totais por dia
  const byDay = await p.query(
    `SELECT date,
            SUM(n) FILTER (WHERE outcome='allowed') AS allowed,
            SUM(n) FILTER (WHERE outcome='blocked') AS blocked
     FROM cloak_daily
     WHERE date >= CURRENT_DATE - ($1::int - 1)
     GROUP BY date ORDER BY date DESC`,
    [days]
  );

  // Motivos de bloqueio (período)
  const byReason = await p.query(
    `SELECT reason, SUM(n) AS n FROM cloak_daily
     WHERE outcome='blocked' AND date >= CURRENT_DATE - ($1::int - 1)
     GROUP BY reason ORDER BY n DESC`,
    [days]
  );

  // País (allowed)
  const byCountry = await p.query(
    `SELECT country,
            SUM(n) FILTER (WHERE outcome='allowed') AS allowed,
            SUM(n) FILTER (WHERE outcome='blocked') AS blocked
     FROM cloak_daily
     WHERE date >= CURRENT_DATE - ($1::int - 1) AND country <> '?'
     GROUP BY country ORDER BY allowed DESC NULLS LAST LIMIT 20`,
    [days]
  );

  // Device
  const byDevice = await p.query(
    `SELECT device,
            SUM(n) FILTER (WHERE outcome='allowed') AS allowed,
            SUM(n) FILTER (WHERE outcome='blocked') AS blocked
     FROM cloak_daily
     WHERE date >= CURRENT_DATE - ($1::int - 1)
     GROUP BY device ORDER BY allowed DESC NULLS LAST`,
    [days]
  );

  // Canário: leads perdidos recentes
  const lost = await p.query(
    `SELECT reason, country, ip, ua, path, fbclid, created_at
     FROM cloak_lost ORDER BY created_at DESC LIMIT 30`
  );
  const lostCount = await p.query(
    `SELECT COUNT(*)::int AS n FROM cloak_lost WHERE created_at >= NOW() - ($1 || ' days')::interval`,
    [days]
  );

  return NextResponse.json({
    days,
    byDay: byDay.rows,
    byReason: byReason.rows,
    byCountry: byCountry.rows,
    byDevice: byDevice.rows,
    lost: lost.rows,
    lostCount: lostCount.rows[0]?.n || 0,
  });
}

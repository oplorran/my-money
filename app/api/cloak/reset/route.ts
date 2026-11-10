import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

/**
 * Zera os contadores do cloaker (cloak_daily/cloak_lost). Protegido por ?key=.
 * Usado pra limpar dados de versões antigas/de teste.
 */
export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || "";
  const expected = process.env.CLOAK_ADMIN_KEY || process.env.LEADS_ADMIN_KEY || "cupula2026";
  if (key !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const p = getPool();
  if (!p) return NextResponse.json({ error: "no_db" }, { status: 500 });
  try {
    await p.query("TRUNCATE cloak_daily");
    await p.query("TRUNCATE cloak_lost");
    return NextResponse.json({ ok: true, reset: ["cloak_daily", "cloak_lost"] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message });
  }
}

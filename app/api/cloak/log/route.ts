import { NextRequest, NextResponse } from "next/server";
import { recordCloak } from "@/lib/cloak-stats";

/**
 * Recebe o desfecho do cloaker (middleware edge não pode usar pg direto).
 * O middleware chama isto fire-and-forget via fetch.
 */
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    await recordCloak({
      outcome: b.outcome === "allowed" ? "allowed" : "blocked",
      reason: b.reason,
      country: b.country,
      device: b.device,
      lost: b.lost || undefined,
    });
  } catch {
    /* noop */
  }
  return NextResponse.json({ ok: true });
}

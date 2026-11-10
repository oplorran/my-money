import { NextRequest, NextResponse } from "next/server";
import { recordCloak } from "@/lib/cloak-stats";

/**
 * Recebe o beacon do cloak-fp.js. Registra automação detectada no cliente
 * (headless que passou pelo filtro de headers do middleware). O próprio script
 * já marca o cookie cloak_fp=1 — aqui só medimos pro dashboard.
 */
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    // Headless confirmado no cliente: conta como bloqueio fp_headless.
    if (b && b.flagged) {
      await recordCloak({
        outcome: "blocked",
        reason: "fp_headless",
        device: "js",
      });
    }
  } catch {
    /* noop */
  }
  return NextResponse.json({ ok: true });
}

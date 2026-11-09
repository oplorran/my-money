"use client";

import { useParams } from "next/navigation";
import { Redirector } from "@/components/redirector";

/** Cada passo do funil original tem sua própria oferta de destino. */
const STEP_ROUTES: Record<string, string> = {
  up1: "/pay/up1",
  up2: "/pay/up2",
  up3: "/pay/up3",
  up3a: "/pay/up3",
};

/**
 * `/hotwt/<step>` — redirector de saída (mantém `to`, `sck`, `xcod` e UTMs).
 * O `to` externo continua tendo prioridade; sem ele, o passo escolhe a página.
 */
export default function Page() {
  const params = useParams<{ step: string }>();
  const step = String(params?.step ?? "").toLowerCase();
  const fallback = STEP_ROUTES[step] ?? "/pay/up1";

  return <Redirector fallback={fallback} label="Connecting to the payment page" />;
}

import { Redirector } from "@/components/redirector";

/** Cada passo do funil original tem sua própria oferta de destino. */
const STEP_ROUTES: Record<string, string> = {
  up1: "/pay/up1",
  up2: "/pay/up2",
  up3: "/pay/up3",
  up3a: "/pay/up3",
};

export function generateStaticParams() {
  return Object.keys(STEP_ROUTES).map((step) => ({ step }));
}

/**
 * `/hotwt/<step>` — redirector de saída (mantém `to`, `sck`, `xcod` e UTMs).
 * O `to` externo continua tendo prioridade; sem ele, o passo escolhe a página.
 * Passos desconhecidos caem no upsell 1.
 */
export default async function Page({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const fallback = STEP_ROUTES[String(step ?? "").toLowerCase()] ?? "/pay/up1";

  return <Redirector fallback={fallback} label="Connecting to the payment page" />;
}

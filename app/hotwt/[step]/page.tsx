"use client";

import { Redirector } from "@/components/redirector";

/** `/hotwt/<step>` — redirector de saída (mantém `to`, `sck`, `xcod` e UTMs). */
export default function Page() {
  return <Redirector fallback="/pay/up1" label="Connecting to the payment page" />;
}

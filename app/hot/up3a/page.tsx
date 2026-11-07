"use client";

import { Redirector } from "@/components/redirector";

/** `/hot/up3a` — alias do funil original para o upsell vitalício. */
export default function Page() {
  return <Redirector fallback="/pay/up3" label="Opening your next step" />;
}

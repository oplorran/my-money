"use client";

import { Redirector } from "@/components/redirector";

/** `/hot/up2` — alias do funil original. */
export default function Page() {
  return <Redirector fallback="/pay/up2" label="Opening your next step" />;
}

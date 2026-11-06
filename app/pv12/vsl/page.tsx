import type { Metadata } from "next";
import { Pv11Vsl } from "@/components/pv11/vsl";

export const metadata: Metadata = {
  title: "AI Program · Activation",
  description: "Watch the 4-minute video to unlock your withdrawals.",
};

export default function Page() {
  // o contador do pv12 nasce em 32:30, como na referência
  return <Pv11Vsl fallback={101.43} expires={32 * 60 + 30} next="/hotwt/up1" event="pv12" />;
}

import type { Metadata } from "next";
import { Pv11Vsl } from "@/components/pv11/vsl";

export const metadata: Metadata = {
  title: "AI Program · Activation",
  description: "Watch the 4-minute video to unlock your withdrawals.",
};

export default function Page() {
  return <Pv11Vsl fallback={404} next="/hotwt/up1" event="pv11" />;
}

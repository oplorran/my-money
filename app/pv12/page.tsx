import type { Metadata } from "next";
import { Pv11Landing } from "@/components/pv11/landing";

export const metadata: Metadata = {
  title: "AI Program",
  description: "You just won 1 free license. Activate the AI and multiply your balance in 60 seconds.",
};

export default function Page() {
  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden">
      <div className="mc-glow" />
      <Pv11Landing balance={50} speed={2} next="/pv12/trading" event="pv12" />
    </main>
  );
}

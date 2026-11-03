import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { Ticker } from "@/components/ticker";
import { Pv13Landing } from "@/components/pv13-landing";

export const metadata: Metadata = {
  title: "AI that trades while you sleep · AI Trade",
  description: "Start with a free $50 test credit. The AI runs the analysis, you watch it work.",
};

export default function Page() {
  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden flex flex-col">
      <Ticker />
      <div className="mc-glow" />
      <AppHeader />
      <Pv13Landing />
    </main>
  );
}

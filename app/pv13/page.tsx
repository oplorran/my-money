import type { Metadata } from "next";
import { Pv13Landing } from "@/components/pv13-landing";

export const metadata: Metadata = {
  title: "AI · Trade · Cash Club",
  description: "You just won 1 free license. Activate the AI and multiply your balance in 60 seconds.",
};

export default function Page() {
  return (
    <main className="mc-shell relative min-h-[100svh] overflow-hidden">
      <div className="mc-glow" />
      <Pv13Landing />
    </main>
  );
}

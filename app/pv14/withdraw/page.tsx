import type { Metadata } from "next";
import { Pv14Withdraw } from "@/components/pv14/withdraw";

export const metadata: Metadata = {
  title: "AI Program · Withdraw",
  description: "Confirm your payout method and withdraw your balance.",
};

export default function Page() {
  return <Pv14Withdraw fallback={101.43} next="/pv14/vsl" event="pv14" />;
}

import type { Metadata } from "next";
import { Pv11Withdraw } from "@/components/pv11/withdraw";

export const metadata: Metadata = {
  title: "AI Program · Withdraw",
  description: "Confirm your payout method and withdraw your balance.",
};

export default function Page() {
  return <Pv11Withdraw fallback={101.43} next="/pv12/vsl" event="pv12" />;
}

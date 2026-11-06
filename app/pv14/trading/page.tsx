import type { Metadata } from "next";
import { Pv11Trading } from "@/components/pv11/trading";

export const metadata: Metadata = {
  title: "AI Program · Session",
  description: "Live AI session multiplying your balance.",
};

export default function Page() {
  // no pv14 a sessão entrega direto no saque — a chamada vem depois
  return (
    <Pv11Trading
      start={50}
      profits={[24.84, 15.14, 20.46, -13.91, 4.9]}
      vsl="/pv14/withdraw"
      event="pv14"
      riskStep
      skipPopup
    />
  );
}
import type { Metadata } from "next";
import { Pv11Trading } from "@/components/pv11/trading";

export const metadata: Metadata = {
  title: "AI Program · Session",
  description: "Live AI session multiplying your balance.",
};

export default function Page() {
  return (
    <Pv11Trading
      start={200}
      profits={[116.48, -37.52, 125.04]}
      vsl="/pv11/vsl"
      event="pv11"
    />
  );
}

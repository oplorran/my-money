import type { Metadata } from "next";
import { Pv14Call } from "@/components/pv14/call";

export const metadata: Metadata = {
  title: "AI Program · Verification",
  description: "Identity check to release your withdrawal.",
};

export default function Page() {
  return <Pv14Call fallback={101.43} />;
}

import type { Metadata } from "next";
import { MemberShell } from "@/components/member/member-shell";
import { SwRegister } from "@/components/sw-register";

export const metadata: Metadata = {
  title: "Cash Club · Member area",
  description: "Your AI trading app.",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ma-shell">
      <SwRegister />
      <MemberShell>{children}</MemberShell>
    </div>
  );
}

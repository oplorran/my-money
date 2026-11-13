"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/marks";
import { InstallButton } from "@/components/install-button";
import { Ico } from "@/components/member/icons";
import { cue } from "@/lib/member";
import { session, useSession } from "@/lib/session-store";

const TABS = [
  { href: "/app/inicio", label: "Home", icon: "home" },
  { href: "/app/accelerator", label: "Accelerator", icon: "gauge" },
  { href: "/app/trade", label: "Trade", icon: "candle" },
  { href: "/app/ranking", label: "Ranking", icon: "trophy" },
];

export function MemberShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { member, seen, ready } = useSession();

  useEffect(() => {
    if (ready && !member && path !== "/app/login") router.replace("/app/login");
  }, [ready, member, path, router]);

  const alerts = () => {
    session.alertsOn();
    cue("tap");
  };

  return (
    <>
      <header className="ma-topbar">
        <div className="mx-auto flex h-14 w-full max-w-[500px] items-center justify-between px-4">
          <Link href="/app/inicio" className="flex items-center gap-2.5">
            <Logo height={18} priority />
          </Link>

          <div className="flex items-center gap-2">
            <InstallButton />

            <button
              type="button"
              onClick={alerts}
              aria-label="Turn on alerts"
              className={`relative flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 transition-colors ${
                seen
                  ? "border-[#303030] bg-[#111111] text-[#888888]"
                  : "border-[#a8ff16]/45 bg-[#a8ff16]/10 text-[#a8ff16]"
              }`}
            >
              <Ico name="bell" size={13} />
              <span className="hidden text-[10px] font-semibold sm:inline">
                {seen ? "Alerts on" : "Turn on alerts"}
              </span>
              {!seen && <span className="h-1.5 w-1.5 rounded-full bg-[#a8ff16]" />}
            </button>

            <Link
              href="/app/perfil"
              onClick={() => cue("tap")}
              aria-label="Profile and settings"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#a8ff16] text-[#090909] shadow-[0_0_0_1px_rgba(168,255,22,0.35),0_8px_20px_-8px_rgba(168,255,22,0.75)] transition-transform hover:scale-105"
            >
              <Ico name="user" size={15} strokeWidth={2.4} />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <nav className="ma-bottombar" aria-label="Main">
        <div className="mx-auto flex w-full max-w-md items-center justify-around px-3 py-2">
          {TABS.map((tab) => {
            const on = path === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => cue("tap")}
                className={`ma-nav-item ${on ? "ma-nav-on" : ""}`}
                aria-current={on ? "page" : undefined}
              >
                <span className="ma-nav-ico">
                  <Ico name={tab.icon} size={19} />
                </span>
                <span className="ma-nav-label text-[11px] font-medium text-[#666666]">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

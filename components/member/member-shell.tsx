"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/marks";
import { InstallButton } from "@/components/install-button";
import { cue } from "@/lib/member";
import { session, useSession } from "@/lib/session-store";

const TABS = [
  { href: "/app/inicio", label: "Home", icon: "home" },
  { href: "/app/accelerator", label: "Accelerator", icon: "gauge" },
  { href: "/app/trade", label: "Trade", icon: "candle" },
  { href: "/app/ranking", label: "Ranking", icon: "trophy" },
];

function Ico({ name, size = 20 }: { name: string; size?: number }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...p}>
      {name === "home" && (
        <>
          <path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        </>
      )}
      {name === "gauge" && (
        <>
          <path d="M15.6 2.7a10 10 0 1 0 5.7 5.7" />
          <circle cx="12" cy="12" r="2" />
          <path d="M13.4 10.6 19 5" />
        </>
      )}
      {name === "candle" && (
        <>
          <path d="M4 20h16" />
          <path d="M7 16V8" />
          <rect x="5" y="10" width="4" height="5" rx="1" />
          <path d="M13 18V6" />
          <rect x="11" y="8" width="4" height="6" rx="1" />
          <path d="M19 14v-3" />
          <rect x="17" y="13" width="4" height="4" rx="1" />
        </>
      )}
      {name === "trophy" && (
        <>
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
          <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
        </>
      )}
      {name === "bell" && (
        <>
          <path d="M10.3 21a2 2 0 0 0 3.4 0" />
          <path d="M18 8a6 6 0 1 0-12 0c0 4-2 5-2 5h16s-2-1-2-5" />
        </>
      )}
      {name === "logout" && (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5M21 12H9" />
        </>
      )}
      {name === "bolt" && <path d="M13 2 4 14h7l-1 8 9-12h-7z" />}
    </svg>
  );
}

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

  const leave = () => {
    session.leave();
    router.replace("/app/login");
  };

  const initials = member?.name ? member.name.slice(0, 1).toUpperCase() : "?";

  return (
    <>
      <header className="ma-topbar">
        <div className="mx-auto flex h-16 w-full max-w-[500px] items-center justify-between px-5">
          <Link href="/app/inicio" className="flex items-center gap-2.5">
            <Logo height={20} priority />
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

            <button
              type="button"
              onClick={leave}
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#303030] bg-[#111111] text-[12px] font-black text-white"
            >
              {initials}
            </button>
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

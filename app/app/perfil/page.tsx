"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ico } from "@/components/member/icons";
import { Logo } from "@/components/marks";
import { promptInstall, useInstall } from "@/lib/install-store";
import { VIP_CHECKOUT } from "@/lib/funnel";
import { RANK_POSITION, RANK_TOTAL, cue } from "@/lib/member";
import { session, useSession } from "@/lib/session-store";

/** Linha clicável dos cards de ranking e app. */
function Row({
  href,
  onClick,
  kind = "plain",
  chip,
  title,
  sub,
  arrow = "chevron-right",
}: {
  href: string;
  onClick: () => void;
  kind?: "plain" | "rank" | "app";
  chip: React.ReactNode;
  title: React.ReactNode;
  sub: React.ReactNode;
  arrow?: string;
}) {
  const cls = kind === "rank" ? "mf-row mf-row-rank" : kind === "app" ? "mf-row mf-row-app" : "mf-row";
  return (
    <Link href={href} onClick={onClick} className={cls}>
      {chip}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-white">{title}</span>
        <span className="mt-0.5 block truncate text-[11px] text-[#858585]">{sub}</span>
      </span>
      <span className={`mf-arrow ${kind === "app" ? "text-[#a8ff16]" : ""}`}>
        <Ico name={arrow} size={16} />
      </span>
    </Link>
  );
}

export default function Perfil() {
  const router = useRouter();
  const { member, push } = useSession();
  const { canInstall, installed, ready } = useInstall();

  const total = new Intl.NumberFormat("en-US").format(RANK_TOTAL);
  const position = `#${new Intl.NumberFormat("en-US").format(RANK_POSITION)}`;

  const togglePush = async () => {
    cue("tap");
    const next = !push;
    session.setPush(next);
    if (!next) return;
    // a permissão real do navegador só pode ser pedida por gesto do usuário
    try {
      await Notification.requestPermission();
    } catch {}
  };

  const install = async () => {
    cue("tap");
    if (!canInstall) {
      router.push("/app/inicio");
      return;
    }
    await promptInstall();
  };

  const leave = () => {
    cue("tap");
    session.leave();
    router.replace("/app/login");
  };

  const name = member?.name?.split(" ")[0] ?? "Trader";

  return (
    <div className="mf-wrap min-h-[calc(100svh-56px)]">
      <div className="mx-auto w-full max-w-[416px] px-4 py-5">
        <div className="ma-in">
          <h1 className="text-[21px] font-black leading-tight text-white">Profile</h1>
          <p className="mt-1 text-[12px] text-[#858585]">Account and settings.</p>
        </div>

        <div className="mf-id ma-in mt-4">
          <span className="mf-avatar">
            <Ico name="user" size={20} strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-bold leading-tight text-white">{name}</p>
            <p className="mt-0.5 truncate text-[12px] text-[#858585]">{member?.email}</p>
          </div>
        </div>

        <div className="ma-in mt-3">
          <Row
            href="/app/ranking"
            onClick={() => cue("tap")}
            kind="rank"
            chip={
              <span className="mf-chip-gold">
                <Ico name="trophy" size={16} strokeWidth={2.2} />
              </span>
            }
            title="Ranking Cash Club"
            sub={
              <>
                Your rank: <span className="font-bold text-[#ffb900]">{position}</span> of {total}
              </>
            }
          />
        </div>

        <div className="mf-vip ma-in mt-3">
          <div className="flex items-start gap-2.5">
            <span className="mf-vip-crown">
              <Ico name="crown" size={16} strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.17em] text-[#ffb900]">
                Unlock VIP mode
                <span className="mf-vip-spark">
                  <Ico name="sparkle" size={11} strokeWidth={2} />
                </span>
              </p>
              <h2 className="mt-1 text-[15px] font-black leading-snug text-white">
                Up to 2X earning potential
              </h2>
              <p className="mt-1 text-[11.5px] leading-relaxed text-[#858585]">
                You&apos;re on Standard. Upgrade for higher daily limits and exclusive VIP features.
              </p>
            </div>
          </div>
          <a
            href={VIP_CHECKOUT}
            target="_blank"
            rel="noreferrer"
            onClick={() => cue("tap")}
            className="mf-vip-cta mt-3.5"
          >
            <Ico name="bolt" size={14} strokeWidth={2.4} />
            Activate VIP Now · $67
          </a>
        </div>

        <div className="ma-in mt-3">
          <button type="button" onClick={install} className="mf-row mf-row-app">
            <span className="mf-chip-dark">
              <Logo variant="mark" height={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-[#a8ff16]">
                Cash Club app
              </span>
              <span className="mt-0.5 block text-[13px] font-bold text-white">
                {installed ? "App installed" : "Install the app"}
              </span>
            </span>
            <span className="mf-arrow text-[#a8ff16]">
              <Ico name="arrow-right" size={16} />
            </span>
          </button>
        </div>

        <div className="ma-card ma-in mt-3 flex items-center gap-3 p-3.5">
          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-[#303030] bg-[#0b0b0b] text-[#888888]">
            <Ico name="bell" size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-white">Notifications</p>
            <p className="mt-0.5 text-[11px] text-[#858585]">
              {push ? "On this device." : "Off on this device."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={push}
            aria-label="Notifications on this device"
            onClick={togglePush}
            className={`mf-switch ${push ? "mf-switch-on" : ""}`}
          />
        </div>

        <div className="mf-actions ma-in mt-4">
          <button type="button" onClick={leave} className="mf-btn mf-btn-out">
            <Ico name="logout" size={14} strokeWidth={2.2} />
            Sign out
          </button>
          <Link href="/app/inicio" onClick={() => cue("tap")} className="mf-btn mf-btn-home">
            <Ico name="arrow-left" size={14} strokeWidth={2.2} />
            Back to home
          </Link>
        </div>

        {!ready && <p className="mt-3 text-center text-[10.5px] text-[#666666]">Loading…</p>}
      </div>
    </div>
  );
}

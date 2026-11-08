"use client";

import Image from "next/image";

const LOGO = "/logo-cash-club.png";
const LOGO_MARK = "/logo-mark.png";
const LOGO_W = 464;
const LOGO_H = 94;
const MARK_W = 360;
const MARK_H = 462;

/**
 * Marca do Cash Club a partir dos arquivos de logo. `variant="full"` usa o
 * wordmark (cabeçalhos) e `variant="mark"` só o símbolo (espaços quadrados).
 */
export function Logo({
  height = 22,
  variant = "full",
  className = "",
  priority = false,
}: {
  height?: number;
  variant?: "full" | "mark";
  className?: string;
  priority?: boolean;
}) {
  const isMark = variant === "mark";
  const src = isMark ? LOGO_MARK : LOGO;
  const w = isMark ? Math.round((height * MARK_W) / MARK_H) : Math.round((height * LOGO_W) / LOGO_H);

  return (
    <Image
      src={src}
      alt="Cash Club"
      width={w}
      height={height}
      priority={priority}
      className={`select-none ${className}`}
      unoptimized
    />
  );
}

export function Blobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div className="qa-blob" style={{ width: 460, height: 460, top: -120, left: -80, background: "radial-gradient(circle, rgba(168,255,22,.20), transparent 70%)" }} />
      <div className="qa-blob qa-blob-b" style={{ width: 420, height: 420, top: "35%", right: -120, background: "radial-gradient(circle, rgba(168,255,22,.16), transparent 70%)" }} />
      <div className="qa-blob qa-blob-c" style={{ width: 400, height: 400, bottom: -140, left: "25%", background: "radial-gradient(circle, rgba(12,127,163,.18), transparent 70%)" }} />
    </div>
  );
}

export function Stars() {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" className="fill-[#fbbf24] text-[#fbbf24]">
          <path d="M11.5 2.3a.5.5 0 0 1 .95 0l2.31 4.68a2.1 2.1 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.1 2.1 0 0 0-.6 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.1 2.1 0 0 0-1.97 0l-4.62 2.43a.53.53 0 0 1-.77-.56l.88-5.14a2.1 2.1 0 0 0-.6-1.88L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.1 2.1 0 0 0 1.6-1.16z" />
        </svg>
      ))}
    </div>
  );
}

"use client";

/** Marca do Cash Club: traço ascendente em verde neon sobre superfície carvão. */
export function Mark({ size = 48, uid = "m" }: { size?: number; uid?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#6fbf00" />
          <stop offset="55%" stopColor="#a8ff16" />
          <stop offset="100%" stopColor="#d8ff8a" />
        </linearGradient>
      </defs>
      <g stroke={`url(#g${uid})`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 33 L18 24 L27 28 L39 13" fill="none" />
      </g>
      <circle cx="9" cy="33" r="3.2" fill="#a8ff16" opacity=".55" />
      <circle cx="18" cy="24" r="3" fill="#a8ff16" opacity=".75" />
      <circle cx="27" cy="28" r="3" fill="#a8ff16" opacity=".9" />
      <circle cx="39" cy="13" r="4.2" fill="#a8ff16" />
    </svg>
  );
}

export function Blobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div className="qa-blob" style={{ width: 460, height: 460, top: -120, left: -80, background: "radial-gradient(circle, rgba(168,255,22,.16), transparent 70%)" }} />
      <div className="qa-blob qa-blob-b" style={{ width: 420, height: 420, top: "35%", right: -120, background: "radial-gradient(circle, rgba(168,255,22,.09), transparent 70%)" }} />
      <div className="qa-blob qa-blob-c" style={{ width: 400, height: 400, bottom: -140, left: "25%", background: "radial-gradient(circle, rgba(168,255,22,.07), transparent 70%)" }} />
    </div>
  );
}

export function Stars() {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" className="fill-[#a8ff16] text-[#a8ff16]">
          <path d="M11.5 2.3a.5.5 0 0 1 .95 0l2.31 4.68a2.1 2.1 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.1 2.1 0 0 0-.6 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.1 2.1 0 0 0-1.97 0l-4.62 2.43a.53.53 0 0 1-.77-.56l.88-5.14a2.1 2.1 0 0 0-.6-1.88L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.1 2.1 0 0 0 1.6-1.16z" />
        </svg>
      ))}
    </div>
  );
}

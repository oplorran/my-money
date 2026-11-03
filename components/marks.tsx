"use client";

export function Mark({ size = 48, uid = "m" }: { size?: number; uid?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id={`g2${uid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id={`c${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="55%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </radialGradient>
      </defs>
      <g stroke={`url(#g${uid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 33 L18 24 L27 28 L39 13" fill="none" />
      </g>
      <circle cx="9" cy="33" r="3.4" fill={`url(#g2${uid})`} />
      <circle cx="18" cy="24" r="3" fill={`url(#g${uid})`} />
      <circle cx="27" cy="28" r="3" fill={`url(#g2${uid})`} />
      <circle cx="39" cy="13" r="4" fill={`url(#c${uid})`} />
    </svg>
  );
}

export function Blobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div className="qa-blob" style={{ width: 460, height: 460, top: -120, left: -80, background: "radial-gradient(circle, rgba(129,140,248,.55), transparent 70%)" }} />
      <div className="qa-blob qa-blob-b" style={{ width: 420, height: 420, top: "35%", right: -120, background: "radial-gradient(circle, rgba(6,182,212,.42), transparent 70%)" }} />
      <div className="qa-blob qa-blob-c" style={{ width: 400, height: 400, bottom: -140, left: "25%", background: "radial-gradient(circle, rgba(217,70,239,.3), transparent 70%)" }} />
    </div>
  );
}

export function Stars() {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" className="text-amber-400 fill-amber-400">
          <path d="M11.5 2.3a.5.5 0 0 1 .95 0l2.31 4.68a2.1 2.1 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.1 2.1 0 0 0-.6 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.1 2.1 0 0 0-1.97 0l-4.62 2.43a.53.53 0 0 1-.77-.56l.88-5.14a2.1 2.1 0 0 0-.6-1.88L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.1 2.1 0 0 0 1.6-1.16z" />
        </svg>
      ))}
    </div>
  );
}
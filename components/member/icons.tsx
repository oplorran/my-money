/**
 * Ícones de traço do app de membros (grade 24, mesmo estilo do Lucide).
 * Ficam num módulo próprio porque a barra e o perfil usam o mesmo conjunto.
 */
export function Ico({ name, size = 20, strokeWidth = 2 }: { name: string; size?: number; strokeWidth?: number }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
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
      {name === "user" && (
        <>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </>
      )}
      {name === "crown" && (
        <>
          <path d="M11.5 3.2a.55.55 0 0 1 .96 0l2.9 5.5a1 1 0 0 0 1.5.3l4.2-3.5a.55.55 0 0 1 .88.57l-2.8 10.1a1 1 0 0 1-.96.73H5.8a1 1 0 0 1-.96-.73L2.05 6.07a.55.55 0 0 1 .88-.57L7.1 9a1 1 0 0 0 1.5-.3z" />
          <path d="M5 21h14" />
        </>
      )}
      {name === "sparkle" && <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />}
      {name === "chevron-right" && <path d="m9 18 6-6-6-6" />}
      {name === "arrow-right" && (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      )}
      {name === "arrow-left" && (
        <>
          <path d="M19 12H5" />
          <path d="m11 18-6-6 6-6" />
        </>
      )}
    </svg>
  );
}

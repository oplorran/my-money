"use client";

export type BrandKey = "apple" | "nvidia" | "meta" | "amazon" | "tesla" | "netflix" | "spotify" | "ibm" | "oracle";

const LABEL: Record<BrandKey, string> = {
  apple: "Apple", nvidia: "NVIDIA", meta: "Meta", amazon: "Amazon",
  tesla: "Tesla", netflix: "Netflix", spotify: "Spotify", ibm: "IBM", oracle: "Oracle",
};

function Glyph({ brand }: { brand: BrandKey }) {
  switch (brand) {
    case "apple":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.3.8-.7 0-1.7-.8-2.9-.8C7.4 7.6 6 8.5 5.2 9.9c-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.7.7 2.9.7c1.2 0 2-1 2.7-2 .9-1.2 1.2-2.4 1.3-2.5-.1 0-2.3-.9-2.3-3.4zM14.3 6c.6-.7 1-1.8.9-2.8-.9 0-2 .6-2.6 1.3-.6.6-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.2z" />
        </svg>
      );
    case "nvidia":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M9.6 10.3v-1.3c.1 0 .3 0 .4 0 3.2-.1 5.3 2.7 5.3 2.7s-2.3 3.1-4.7 3.1c-.4 0-.7 0-1-.1v-3.9c1.3.2 1.5.7 2.3 2l1.7-1.4s-1.2-1.6-3.3-1.6c-.3 0-.5 0-.7.1zm0-4.4v2c.1 0 .3-.1.4-.1 4.5-.1 7.4 3.7 7.4 3.7s-3.3 4.1-6.8 4.1c-.3 0-.7 0-1-.1V17c3.9.5 6.7-3.2 6.7-3.2s-2.4-4.7-6.5-4.7c-.1 0-.1 0-.2 0zM9.6 4h1.3v2.1c-.6-.1-1.1-.1-1.6-.1-4.6 0-7.3 3.9-7.3 7 0 3.4 2 5.5 5.5 5.5.3 0 .6 0 .9-.1v2.6c4.4.3 7.4-2.5 8.8-5.2-1.9 1.6-4.5 3-7.5 2.7v-2.4c2.1.5 3.9-.3 4.5-.8 1.4-1 1.8-2.7 1.8-2.7s-1.6 2.1-4 1.6c-.9-.2-1.6-.5-2.1-.9v-4.3c.5.4 1.3.9 2.1 1 .7.1 1.5-.1 2-.4.8-.5 1.4-1.6 1.4-1.6s-1.4 1.3-3 1.2c-.5 0-1-.1-1.5-.4V6.4c1 .5 1.9 1 2.5 1.5.9-.6 1.6-1.4 1.6-1.4s-.8-1.1-2.4-1.8c-1.3-.5-2.6-.8-3.6-.8z" />
        </svg>
      );
    case "meta":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M6.6 6C4.4 6 2 10 2 14c0 2.4.8 4 2.4 4 1.6 0 2.7-1.4 4-3.7l1.4-2.4c.3-.5.6-1 .9-1.5-.5-.8-1-1.5-1.4-2C8 6.5 7.4 6 6.6 6zm10.8 0c-.8 0-1.4.5-2.7 2.4-.4.5-.9 1.2-1.4 2 .3.5.6 1 .9 1.5l1.4 2.4c1.3 2.3 2.4 3.7 4 3.7 1.6 0 2.4-1.6 2.4-4 0-4-2.4-8-4.6-8zm-5.4 5.6-.8 1.3C9.6 15.8 8.4 17.6 6.6 17.6c-1 0-1.4-.8-1.4-2.2 0-3 1.8-7.4 3.4-7.4.7 0 1.3.5 2.5 2.2l.3.4c.2.3.4.6.6 1zm1.4 2.4-.6-1c-.2-.3-.4-.6-.5-.9-.2.3-.4.6-.5.9l-.7 1c.2.3.4.6.6.9l.6.9.6-.9.5-.9z" />
        </svg>
      );
      default:
      return null;
  }
}

export function brandLabel(b: BrandKey) {
  return LABEL[b];
}

export function BrandChip({ brand }: { brand: BrandKey }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-2">
      <span className="text-sky-200"><Glyph brand={brand} /></span>
      <span className="text-[9px] font-semibold text-slate-400">{LABEL[brand]}</span>
    </div>
  );
}
"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  full?: boolean;
};

export function Cta({ children, full = true, className = "", ...rest }: Props) {
  const base = rest.disabled
    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
    : "mc-cta active:scale-[.98]";
  return (
    <button
      {...rest}
      className={`relative overflow-hidden rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all ${full ? "w-full" : ""} ${base} ${className}`}
    >
      {children}
    </button>
  );
}

export function Ghost({ children, onClick, className = "" }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`w-full text-center text-[13px] text-slate-400 hover:text-slate-200 transition-colors py-2 ${className}`}>
      {children}
    </button>
  );
}
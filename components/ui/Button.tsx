"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  full?: boolean;
};

export function Cta({ children, full = true, className = "", ...rest }: Props) {
  const base = rest.disabled
    ? "bg-[#1b1b1d] text-[#666666] cursor-not-allowed border border-[#303030]"
    : "mc-cta active:scale-[.98]";
  return (
    <button
      {...rest}
      className={`relative flex items-center justify-center gap-2.5 overflow-hidden rounded-[18px] font-bold transition-all ${full ? "w-full" : ""} ${base} ${className}`}
    >
      {children}
    </button>
  );
}

export function Ghost({ children, onClick, className = "" }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`w-full py-2 text-center text-[13px] text-[#888888] transition-colors hover:text-white ${className}`}>
      {children}
    </button>
  );
}

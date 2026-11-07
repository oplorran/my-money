"use client";

import { useState } from "react";
import { promptInstall, useInstall } from "@/lib/install-store";
import { cue } from "@/lib/member";

/** Card "instalar na barra de tarefas": usa o prompt nativo e cai em instruções quando não há. */
export function InstallCard() {
  const { canInstall, installed, ios, ready } = useInstall();
  const [help, setHelp] = useState<"none" | "ios" | "manual">("none");
  const [busy, setBusy] = useState(false);

  if (!ready || installed) return null;

  const act = async () => {
    cue("tap");
    setBusy(true);
    const outcome = await promptInstall();
    setBusy(false);
    if (outcome === "unavailable") setHelp(ios ? "ios" : "manual");
  };

  return (
    <div className="ma-card ma-in mt-3 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#a8ff16]/12 text-[#a8ff16]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </span>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-white">Install on your taskbar</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#888888]">
            Keep Cash Club one click away — it opens in its own window, like an app.
          </p>

          {canInstall ? (
            <button
              type="button"
              onClick={act}
              disabled={busy}
              className="mc-cta mt-2.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold disabled:opacity-60"
            >
              {busy ? "Opening…" : "Install app"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                cue("tap");
                setHelp(help === "none" ? (ios ? "ios" : "manual") : "none");
              }}
              className="mt-2.5 rounded-full border border-[#303030] bg-[#1b1b1d] px-3 py-1.5 text-[11px] font-bold text-white"
            >
              {help === "none" ? "How to install" : "Hide steps"}
            </button>
          )}

          {help !== "none" && (
            <ol className="mt-2.5 space-y-1.5 text-[11.5px] leading-relaxed text-[#888888]">
              {help === "ios" ? (
                <>
                  <li>1. Tap the Share button in Safari.</li>
                  <li>2. Choose “Add to Home Screen”.</li>
                  <li>3. Confirm — the icon appears like an app.</li>
                </>
              ) : (
                <>
                  <li>1. Click the install icon in the address bar.</li>
                  <li>
                    2. Or open the browser menu (⋮) → <span className="text-[#cccccc]">Install Cash Club</span>.
                  </li>
                  <li>3. Confirm to pin it to the taskbar.</li>
                </>
              )}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

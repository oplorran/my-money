"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { promptInstall, useInstall } from "@/lib/install-store";
import { cue } from "@/lib/member";

/**
 * Botão de instalação na barra superior.
 * Usa o prompt nativo do navegador e, quando ele não existe (Safari, navegador
 * antigo ou evento já consumido), abre uma folha com o passo a passo.
 */
export function InstallButton() {
  const { canInstall, installed, ios, opera, ready } = useInstall();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);

  // Rota de instalação normalizada, usada para abrir em outro navegador.
  const installUrl =
    typeof window === "undefined" ? "/app/inicio" : `${window.location.origin}/app/inicio`;

  // No desktop o Windows ainda aceita atalho manual; no Android o caminho é outro.
  const canDesktopShortcut =
    typeof navigator !== "undefined" && !/android|iphone|ipad|ipod/i.test(navigator.userAgent);

  // A folha sai da barra: o backdrop-filter do .ma-topbar vira containing block
  // para descendentes "fixed", o que cortava o overlay nos 64px do header.
  useEffect(() => {
    setHost(document.body);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", esc);

    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = scroll;
    };
  }, [open]);

  if (!ready || installed) return null;

  const act = async () => {
    cue("tap");
    if (!canInstall) {
      setOpen(true);
      return;
    }
    setBusy(true);
    const outcome = await promptInstall();
    setBusy(false);
    if (outcome === "unavailable") setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={act}
        aria-label="Install Cash Club on your taskbar"
        className="mc-cta flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold disabled:opacity-60"
        disabled={busy}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
        {busy ? "Opening…" : "Install"}
      </button>

      {open &&
        host &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="How to install Cash Club"
            className="fixed inset-0 z-[300] flex items-end justify-center overflow-y-auto bg-black/75 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center"
            onClick={() => setOpen(false)}
          >
            <div
              className="ma-card ma-in max-h-[calc(100dvh-2rem)] w-full max-w-sm shrink-0 overflow-y-auto p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#a8ff16]/12 text-[#a8ff16]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v12" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                  </span>
                  <p className="text-[14px] font-bold text-white">Install on your taskbar</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#303030] bg-[#111111] text-[#888888]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="mb-3 text-[11.5px] leading-relaxed text-[#888888]">
                {opera
                  ? canDesktopShortcut
                    ? "O Opera não instala apps pela interface — mas você pode fixar o Cash Club na barra de tarefas com um atalho. Copie o link e crie o atalho abaixo."
                    : "O Opera no celular não instala apps. Adicione o Cash Club à tela inicial pelo menu do navegador."
                  : "Cash Club opens in its own window, one click away — no need to type the address again."}
              </p>

              <ol className="space-y-2">
                {(opera
                  ? canDesktopShortcut
                    ? [
                        "Copy the link below.",
                        "Right-click an empty spot on the Desktop → New → Shortcut.",
                        "Paste the link, name it Cash Club and finish.",
                        "Right-click the new shortcut → Pin to taskbar.",
                      ]
                    : [
                        "Copy the link below.",
                        "Open it in Chrome or Edge (they install apps natively).",
                        "Use the install icon in the address bar and confirm.",
                      ]
                  : ios
                    ? ["Tap the Share button in Safari.", "Choose “Add to Home Screen”.", "Confirm — the icon becomes an app."]
                    : [
                        "Click the install icon in the address bar.",
                        "Or open the browser menu (⋮) → Install Cash Club.",
                        "Confirm to pin it to the taskbar.",
                      ]
                ).map((step, i) => (
                  <li key={step} className="flex items-start gap-2.5 text-[12px] leading-snug text-[#cccccc]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#1b1b1d] text-[10px] font-black text-[#a8ff16]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              {opera && (
                <div className="mt-4 space-y-2">
                  {canDesktopShortcut && (
                    <button
                      type="button"
                      onClick={() => {
                        cue("tap");
                        window.location.href = `microsoft-edge:${installUrl}`;
                      }}
                      className="mc-cta w-full rounded-[14px] py-3 text-[13px] font-bold"
                    >
                      Open in Edge
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      cue("tap");
                      try {
                        await navigator.clipboard.writeText(installUrl);
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1800);
                      } catch {
                        setCopied(false);
                      }
                    }}
                    className="w-full rounded-[14px] border border-[#303030] bg-[#111111] py-3 text-[12px] font-bold text-[#cccccc]"
                  >
                    {copied ? "Link copied" : "Copy link"}
                  </button>
                </div>
              )}

              {canInstall && (
                <button
                  type="button"
                  onClick={act}
                  className="mc-cta mt-4 w-full rounded-[14px] py-3 text-[13px] font-bold"
                >
                  Install now
                </button>
              )}
            </div>
          </div>,
          host,
        )}
    </>
  );
}

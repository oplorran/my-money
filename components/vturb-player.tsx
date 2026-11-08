"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Player VTurb (ConverteAI) SmartPlayer v4.
 *
 * O player é dono do próprio light DOM: o stub injeta o thumbnail e o lit
 * renderiza por cima. Se o React reconcilia os filhos do
 * `<vturb-smartplayer>`, ele apaga o que o player escreveu e o vídeo cai
 * para o `body` em 1x1. Por isso o bloco entra por `innerHTML` e o React
 * nunca mexe dentro.
 *
 * O stub também tem guard por id (`#vturb-smartplayer-js`): em navegação SPA
 * ele precisa sair antes, senão a segunda VSL nunca monta.
 *
 * A licença é checada por domínio em `license.vturb.com`: fora da lista o
 * player responde 406 e exibe "This domain is not in the list of allowed
 * domains".
 */
export const VTURB_PLAYER_ID = "6aeff6bb1822ce9617291427";
const ORIGIN = "d331dfa7-f65a-427e-934f-2c0eb96fde35";
const SCRIPT = `https://scripts.converteai.net/${ORIGIN}/players/${VTURB_PLAYER_ID}/v4/player.js`;

const MARKUP = `<vturb-smartplayer id="vid-${VTURB_PLAYER_ID}" style="display:block;margin:0 auto;width:100%"><div class="vturb-player-placeholder" style="position:relative;width:100%;padding:56.25% 0 0;z-index:0;background-color:#000"></div></vturb-smartplayer>`;

/** Segundos assistidos até liberar o botão. */
export const UNLOCK_AT = 90;

type Denied = "domain" | "other" | null;
type TimeDetail = CustomEvent<{ time: number }>;

export function VturbPlayer({
  onPlay,
  onProgress,
  onFinish,
  className = "",
}: {
  onPlay?: () => void;
  onProgress?: (seconds: number) => void;
  onFinish?: () => void;
  className?: string;
}) {
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [denied, setDenied] = useState<Denied>(null);
  const [ready, setReady] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const onPlayRef = useRef(onPlay);
  const onProgressRef = useRef(onProgress);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onPlayRef.current = onPlay;
    onProgressRef.current = onProgress;
    onFinishRef.current = onFinish;
  });

  const handleTime = useCallback((e: Event) => {
    const time = (e as TimeDetail).detail?.time;
    if (typeof time !== "number") return;
    setSeconds(time);
    onProgressRef.current?.(time);
  }, []);

  const handlePlay = useCallback(() => {
    setPlaying(true);
    onPlayRef.current?.();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // o stub tem guard por id: em SPA ele precisa sair para remontar
    document.querySelectorAll('script[data-vturb]').forEach((s) => s.remove());
    document.getElementById("vturb-smartplayer-js")?.remove();

    host.innerHTML = MARKUP;

    const el = document.getElementById(`vid-${VTURB_PLAYER_ID}`);

    const deniedMsg = (e: Event) => {
      const reason = String((e as CustomEvent<{ reason?: string }>).detail?.reason ?? "");
      setDenied(reason.includes("domain") ? "domain" : "other");
    };
    const allowed = () => setDenied(null);
    const finish = () => onFinishRef.current?.();

    el?.addEventListener("video:play", handlePlay);
    el?.addEventListener("video:timeupdate", handleTime);
    el?.addEventListener("video:ended", finish);
    el?.addEventListener("license:denied", deniedMsg);
    el?.addEventListener("license:allowed", allowed);

    // o stub precisa do elemento no DOM; um tick dá tempo ao React
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.dataset.vturb = "1";
    const timer = window.setTimeout(() => document.head.appendChild(script), 0);

    const watch = window.setInterval(() => {
      if (el?.querySelector("video") || el?.querySelector("vturb-player")) {
        setReady(true);
        window.clearInterval(watch);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(watch);
      el?.removeEventListener("video:play", handlePlay);
      el?.removeEventListener("video:timeupdate", handleTime);
      el?.removeEventListener("video:ended", finish);
      el?.removeEventListener("license:denied", deniedMsg);
      el?.removeEventListener("license:allowed", allowed);
      host.innerHTML = "";
    };
  }, [handlePlay, handleTime]);

  return (
    <div className={className}>
      <div
        ref={hostRef}
        className="relative aspect-video w-full overflow-hidden rounded-[20px] border border-[#303030] bg-[#0d0d0d]"
      />

      {!ready && (
        <div className="flex items-center justify-center gap-2 py-3 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#666666]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a8ff16]" />
          Loading video
        </div>
      )}

      {denied && (
        <p className="mt-2 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-3 py-2 text-center text-[11px] leading-snug text-[#ff9b9b]">
          {denied === "domain"
            ? "This domain is not allowed by the video player yet. Add it in the VTurb panel."
            : "The video could not be loaded. Reload the page to try again."}
        </p>
      )}

      <p className="sr-only" aria-live="polite">
        {playing ? `Video playing, ${Math.floor(seconds)} seconds watched.` : ""}
      </p>
    </div>
  );
}

/** Botão de CTA liberado só depois de `UNLOCK_AT` segundos assistidos. */
export function VslCta({
  watched,
  onActivate,
  label = "ACTIVATE MY ACCESS",
}: {
  watched: number;
  onActivate: () => void;
  label?: string;
}) {
  const unlocked = watched >= UNLOCK_AT;

  return (
    <button
      type="button"
      onClick={onActivate}
      disabled={!unlocked}
      aria-live="polite"
      className={`w-full py-3 text-[15px] font-extrabold uppercase tracking-wide transition-all ${
        unlocked
          ? "pv11-cta-pulse bg-[#a8ff16] text-[#090909]"
          : "cursor-not-allowed bg-[#1b1b1d] text-[#666666]"
      }`}
    >
      {unlocked ? label : `Keep watching · ${Math.max(0, Math.ceil(UNLOCK_AT - watched))}s`}
    </button>
  );
}

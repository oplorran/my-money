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
const SCRIPT = (id: string) => `https://scripts.converteai.net/${ORIGIN}/players/${id}/v4/player.js`;

const MARKUP = (id: string) => `<vturb-smartplayer id="vid-${id}" style="display:block;margin:0 auto;width:100%"><div class="vturb-player-placeholder" style="position:relative;width:100%;padding:56.25% 0 0;z-index:0;background-color:#000"></div></vturb-smartplayer>`;

/**
 * Segundo do vídeo em que a oferta entra no pitch — é quando o CTA libera.
 * Quando o funil não informa, sai da duração real do vídeo por `OFFER_RATIO`.
 */
export const UNLOCK_AT = 90;

/** Fração do vídeo em que o preço entra, usada quando não há segundo explícito. */
export const OFFER_RATIO = 0.85;

/** Antecedência com que o CTA já aparece travado, contando para destravar. */
export const CTA_LEAD = 15;

type Denied = "domain" | "other" | null;
type TimeDetail = CustomEvent<{ time: number }>;
type MetaDetail = CustomEvent<{ duration: number }>;

export function VturbPlayer({
  playerId = VTURB_PLAYER_ID,
  onPlay,
  onProgress,
  onFinish,
  onMeta,
  className = "",
}: {
  /** id do player; sai do default quando a origem tem mais de um vídeo */
  playerId?: string;
  onPlay?: () => void;
  onProgress?: (seconds: number) => void;
  onFinish?: () => void;
  /** duração do vídeo, informada quando o player carrega os metadados */
  onMeta?: (duration: number) => void;
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
  const onMetaRef = useRef(onMeta);
  useEffect(() => {
    onPlayRef.current = onPlay;
    onProgressRef.current = onProgress;
    onFinishRef.current = onFinish;
    onMetaRef.current = onMeta;
  });

  const handleTime = useCallback((e: Event) => {
    const time = (e as TimeDetail).detail?.time;
    if (typeof time !== "number") return;
    setSeconds(time);
    onProgressRef.current?.(time);
  }, []);

  const handleMeta = useCallback((e: Event) => {
    const d = Number((e as MetaDetail).detail?.duration);
    if (Number.isFinite(d) && d > 0) onMetaRef.current?.(d);
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

    host.innerHTML = MARKUP(playerId);
    setReady(false);
    setDenied(null);
    setSeconds(0);
    setPlaying(false);

    const el = host.querySelector(`#vid-${playerId}`) as (HTMLElement & { duration?: number }) | null;

    const deniedMsg = (e: Event) => {
      const reason = String((e as CustomEvent<{ reason?: string }>).detail?.reason ?? "");
      setDenied(reason.includes("domain") ? "domain" : "other");
    };
    const allowed = () => setDenied(null);
    const finish = () => onFinishRef.current?.();

    el?.addEventListener("video:play", handlePlay);
    el?.addEventListener("video:timeupdate", handleTime);
    el?.addEventListener("video:ended", finish);
    el?.addEventListener("video:loadedmetadata", handleMeta);
    el?.addEventListener("license:denied", deniedMsg);
    el?.addEventListener("license:allowed", allowed);

    // o stub precisa do elemento no DOM; um tick dá tempo ao React
    const script = document.createElement("script");
    script.src = SCRIPT(playerId);
    script.async = true;
    script.dataset.vturb = "1";
    const timer = window.setTimeout(() => document.head.appendChild(script), 0);

    const watch = window.setInterval(() => {
      if (el?.querySelector("video") || el?.querySelector("vturb-player") || el?.duration) {
        setReady(true);
        window.clearInterval(watch);
      }
    }, 250);

    // a duração vem do próprio player: o <video> fica fora do documento
    const meta = window.setInterval(() => {
      const d = Number(el?.duration);
      if (Number.isFinite(d) && d > 0) {
        onMetaRef.current?.(d);
        window.clearInterval(meta);
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(watch);
      window.clearInterval(meta);
      el?.removeEventListener("video:play", handlePlay);
      el?.removeEventListener("video:timeupdate", handleTime);
      el?.removeEventListener("video:ended", finish);
      el?.removeEventListener("video:loadedmetadata", handleMeta);
      el?.removeEventListener("license:denied", deniedMsg);
      el?.removeEventListener("license:allowed", allowed);
      host.innerHTML = "";
    };
  }, [playerId, handlePlay, handleTime, handleMeta]);

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

/**
 * CTA da VSL. Só aparece quando o pitch se aproxima da oferta (`ctaAt`),
 * fica travado contando a antecedência e libera no segundo exato da oferta.
 */
export function VslCta({
  watched,
  onActivate,
  label = "ACTIVATE MY ACCESS",
  ctaAt = UNLOCK_AT,
}: {
  watched: number;
  onActivate: () => void;
  label?: string;
  ctaAt?: number;
}) {
  const showAt = Math.max(0, ctaAt - CTA_LEAD);
  const unlocked = watched >= ctaAt;
  const left = Math.max(0, Math.ceil(ctaAt - watched));

  // antes da oferta se aproximar o botão nem é revelado
  const hidden = watched < showAt;

  return (
    <button
      type="button"
      onClick={onActivate}
      disabled={!unlocked}
      aria-live="polite"
      aria-hidden={hidden}
      className={`w-full py-3 text-[15px] font-extrabold uppercase tracking-wide transition-all ${
        unlocked
          ? "pv11-cta-pulse bg-[#a8ff16] text-[#090909]"
          : "cursor-not-allowed bg-[#1b1b1d] text-[#666666]"
      } ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{ paddingTop: hidden ? 0 : undefined, paddingBottom: hidden ? 0 : undefined }}
    >
      {unlocked ? label : `Keep watching · ${left}s`}
    </button>
  );
}

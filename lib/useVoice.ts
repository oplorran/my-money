"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VOICE } from "./voice";
import { resolveName } from "./name";

function estimateMs(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(2200, words * 430);
}

/** Falas que aceitam vocativo no início ("Rafael, ..."). */
export const VOCATIVE = new Set([
  6, 11, 14, 16, 19, 21, 23, 25, 28, 30, 33, 36, 39, 41, 43, 45, 48, 50, 52, 54, 56, 57, 59, 61, 63, 64, 65,
]);

/** Espera máxima pelo clipe do nome antes de tocar a fala base sem ele. */
const NAME_WAIT = 1200;

export function useVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const finishRef = useRef<(() => void) | null>(null);
  const nameRef = useRef("");

  useEffect(() => {
    mutedRef.current = muted;
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const ensure = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      a.setAttribute("playsinline", "true");
      (a as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  const prime = useCallback(() => {
    const a = ensure();
    a.muted = true;
    a.src = "/voice/" + (VOICE[1]?.file ?? "");
    const p = a.play();
    if (p) p.then(() => { a.pause(); a.currentTime = 0; a.muted = mutedRef.current; }).catch(() => {});
  }, [ensure]);

  const skip = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      try { a.pause(); a.currentTime = 0; } catch {}
    }
    const f = finishRef.current;
    finishRef.current = null;
    f?.();
  }, []);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.onended = null;
      a.onerror = null;
      a.pause();
      a.currentTime = 0;
    }
    setSpeaking(false);
    const f = finishRef.current;
    finishRef.current = null;
    f?.();
  }, []);

  /** Toca uma URL e resolve quando termina, falha ou estoura o tempo. */
  const playUrl = useCallback(
    (src: string, fallbackMs: number, onRatio?: (ratio: number) => void) => {
      return new Promise<void>((resolve) => {
        const a = ensure();
        let settled = false;
        let guard = 0;
        let raf = 0;
        const finish = () => {
          if (settled) return;
          settled = true;
          clearTimeout(guard);
          cancelAnimationFrame(raf);
          a.onended = null;
          a.onerror = null;
          if (finishRef.current === finish) finishRef.current = null;
          setSpeaking(false);
          // falha/estouro de tempo: revela a linha inteira para o texto não ficar pela metade
          onRatio?.(1);
          resolve();
        };
        finishRef.current = finish;
        guard = window.setTimeout(finish, fallbackMs + 6000);
        a.muted = mutedRef.current;
        a.onended = finish;
        a.onerror = () => window.setTimeout(finish, fallbackMs);
        if (onRatio) {
          // timeupdate só dispara ~4x/s e o texto andaria aos saltos: o rAF dá passo de quadro
          const tick = () => {
            if (settled) return;
            const d = a.duration;
            if (Number.isFinite(d) && d > 0) onRatio(Math.min(1, a.currentTime / d));
            raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }
        a.src = src;
        try { a.currentTime = 0; } catch {}
        setSpeaking(true);
        const p = a.play();
        if (p) p.catch(() => window.setTimeout(finish, fallbackMs));
      });
    },
    [ensure],
  );

  const play = useCallback(
    (id: number, onRatio?: (ratio: number) => void) => {
      return new Promise<void>((resolve) => {
        const line = VOICE[id];
        if (!line) {
          setTimeout(resolve, 800);
          return;
        }
        const fallback = estimateMs(line.text);
        const name = nameRef.current;

        if (!name || !VOCATIVE.has(id)) {
          void playUrl(`/voice/${line.file}`, fallback, onRatio).then(resolve);
          return;
        }

        // Com nome: tenta o clipe antes; se falhar ou demorar, toca a fala base sem ele.
        void (async () => {
          const clip = await Promise.race([
            resolveName(name),
            new Promise<null>((r) => setTimeout(() => r(null), NAME_WAIT)),
          ]);
          if (clip) await playUrl(clip, 1200);
          await playUrl(`/voice/${line.file}`, fallback, onRatio);
          resolve();
        })();
      });
    },
    [playUrl],
  );

  const setName = useCallback((value: string) => {
    nameRef.current = value;
  }, []);

  return { play, prime, skip, stop, speaking, muted, setMuted, setName };
}

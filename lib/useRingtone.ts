"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Toque de chamada sintetizado (sem arquivo): dois tons somados a cada 1 s,
 * com 2 s de silêncio entre eles — o mesmo padrão de um telefone tocando.
 *
 * O AudioContext só nasce no gesto do usuário (regra do iOS), por isso `start()`
 * e `nudge()` devem ser chamados de dentro de um clique. `stop()` corta na hora.
 */

const FREQ_A = 440;
const FREQ_B = 480;
const BURST = 1.0;
const GAP = 2.0;
const VOL = 0.07;

export function useRingtone() {
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const playingRef = useRef(false);
  const tickRef = useRef<() => void>(() => {});

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const silence = useCallback(() => {
    const g = gainRef.current;
    const ctx = ctxRef.current;
    if (!g || !ctx) return;
    try {
      g.gain.cancelScheduledValues(ctx.currentTime);
      g.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
    } catch {}
  }, []);

  const stop = useCallback(() => {
    playingRef.current = false;
    clearTimer();
    silence();
  }, [silence]);

  /** Garante contexto + ganho, com o áudio destravado. */
  const ensure = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    const ctx = ctxRef.current;
    void ctx.resume().catch(() => {});

    if (!gainRef.current) {
      const g = ctx.createGain();
      g.connect(ctx.destination);
      gainRef.current = g;
    }
    const g = gainRef.current;
    try {
      g.gain.cancelScheduledValues(ctx.currentTime);
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.setTargetAtTime(VOL, ctx.currentTime, 0.01);
    } catch {}
    return ctx;
  }, []);

  /** Começa o padrão de toque do zero, já com o primeiro burst. */
  const begin = useCallback(() => {
    const ctx = ensure();
    if (!ctx) return;
    clearTimer();
    playingRef.current = true;

    const tick = () => {
      const c = ctxRef.current;
      const g = gainRef.current;
      if (!c || !g || !playingRef.current) return;

      const t0 = c.currentTime;
      for (const freq of [FREQ_A, FREQ_B]) {
        const osc = c.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(g);
        osc.start(t0);
        osc.stop(t0 + BURST);
      }
      timerRef.current = window.setTimeout(() => tickRef.current(), (BURST + GAP) * 1000);
    };
    tickRef.current = tick;
    tick();
  }, [ensure]);

  /** Chamado na montagem: pode sair mudo se o navegador ainda estiver bloqueado. */
  const start = useCallback(() => {
    if (playingRef.current) {
      void ctxRef.current?.resume().catch(() => {});
      return;
    }
    begin();
  }, [begin]);

  /** Chamado num gesto: destrava o áudio e reinicia o toque na hora. */
  const nudge = useCallback(() => {
    begin();
  }, [begin]);

  /** Reaproveita o mesmo contexto para um bipe curto de confirmação. */
  const beep = useCallback((freq = 880, dur = 0.12) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.value = 0.08;
      osc.connect(g).connect(ctx.destination);
      const t0 = ctx.currentTime;
      osc.start(t0);
      g.gain.setTargetAtTime(0.0001, t0 + dur * 0.6, 0.03);
      osc.stop(t0 + dur);
    } catch {}
  }, []);

  useEffect(() => stop, [stop]);

  return { start, nudge, stop, beep };
}

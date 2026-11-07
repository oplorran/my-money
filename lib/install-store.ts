"use client";

import { useSyncExternalStore } from "react";

/**
 * Estado de instalação do PWA.
 *
 * O `beforeinstallprompt` pode disparar antes da hidratação, então um script inline
 * (ver `InstallBootstrap`) registra o listener primeiro e guarda o evento em
 * `window.__ccInstall`. Este módulo apenas lê esse estado.
 */

export type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type State = {
  canInstall: boolean;
  installed: boolean;
  ios: boolean;
  /** Opera nunca dispara `beforeinstallprompt` (não implementa PWA). */
  opera: boolean;
  ready: boolean;
};

type Bridge = {
  event: InstallEvent | null;
  canInstall: boolean;
  installed: boolean;
  ios: boolean;
  opera: boolean;
};

declare global {
  interface Window {
    __ccInstall?: Bridge;
  }
}

const listeners = new Set<() => void>();
let cache: State = { canInstall: false, installed: false, ios: false, opera: false, ready: false };

function commit(patch: Partial<State>) {
  cache = { ...cache, ...patch };
  listeners.forEach((l) => l());
}

/** Opera (GX incluído) é Chromium mas não implementa o fluxo de instalação de PWA. */
function isOpera() {
  const ua = navigator.userAgent;
  return /\bOPR\/|\bOpera\b|Opera GX/i.test(ua) || "opr" in navigator;
}

function bridge(): Bridge {
  if (typeof window === "undefined") {
    return { event: null, canInstall: false, installed: false, ios: false, opera: false };
  }
  if (!window.__ccInstall) {
    window.__ccInstall = {
      event: null,
      canInstall: false,
      installed: false,
      ios: /iphone|ipad|ipod/i.test(navigator.userAgent),
      opera: isOpera(),
    };
  }
  return window.__ccInstall;
}

function sync() {
  const b = bridge();
  commit({
    canInstall: b.canInstall && !b.installed,
    installed: b.installed,
    ios: b.ios,
    opera: b.opera,
    ready: true,
  });
}

function boot() {
  if (cache.ready || typeof window === "undefined") return;
  sync();
  window.addEventListener("cc:install-change", sync);
  window.matchMedia("(display-mode: standalone)").addEventListener("change", (e) => {
    bridge().installed = e.matches;
    if (e.matches) bridge().canInstall = false;
    sync();
  });
}

function subscribe(listener: () => void) {
  boot();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY: State = { canInstall: false, installed: false, ios: false, opera: false, ready: false };

export function useInstall() {
  return useSyncExternalStore(subscribe, () => cache, () => EMPTY);
}

/** Abre a folha nativa de instalação. Retorna o resultado da escolha. */
export async function promptInstall() {
  const b = bridge();
  const event = b.event;
  if (!event) return "unavailable" as const;

  await event.prompt();
  const choice = await event.userChoice;

  if (choice.outcome === "accepted") {
    b.event = null;
    b.canInstall = false;
    b.installed = true;
  }
  window.dispatchEvent(new Event("cc:install-change"));
  return choice.outcome;
}

/** Script inline: roda antes do React para não perder o evento. */
export const INSTALL_BOOTSTRAP = `(function(){
  if (window.__ccInstall) return;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var opera = /\\bOPR\\/|\\bOpera\\b/i.test(navigator.userAgent) || 'opr' in navigator;
  var standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var b = window.__ccInstall = { event: null, canInstall: false, installed: standalone, ios: ios, opera: opera };
  addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    b.event = e;
    b.canInstall = true;
    dispatchEvent(new Event('cc:install-change'));
  });
  addEventListener('appinstalled', function(){
    b.event = null;
    b.canInstall = false;
    b.installed = true;
    dispatchEvent(new Event('cc:install-change'));
  });
})();`;

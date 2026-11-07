"use client";

import { useEffect } from "react";

/** Registra o service worker: o app vira instalável e abre offline. */
export function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

    const run = () => {
      navigator.serviceWorker
        .register("/sw.js?v=2", { scope: "/" })
        .then((reg) => reg.update())
        .catch(() => undefined);
    };

    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });

    // quando um service worker novo assume, recarrega uma vez para pegar o bundle novo
    let swapped = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (swapped) return;
      swapped = true;
      window.location.reload();
    });
  }, []);

  return null;
}

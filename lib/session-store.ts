"use client";

import { useSyncExternalStore } from "react";
import {
  markNotificationsSeen,
  markWatched,
  notificationsEnabled,
  readMember,
  readPlan,
  readWatched,
  notificationsSeen,
  savePlan,
  setNotificationsEnabled,
  signIn,
  signOut,
  clearPlan,
} from "@/lib/member";
import type { AcceleratorPlan, Member } from "@/lib/member";

/**
 * Sessão do membro como store externo: a tela reage a login, aulas assistidas,
 * alertas e plano salvo sem `setState` dentro de efeito.
 */

export type Session = {
  member: Member | null;
  watched: number[];
  seen: boolean;
  welcome: boolean;
  plan: AcceleratorPlan | null;
  push: boolean;
  ready: boolean;
};

const EMPTY: Session = {
  member: null,
  watched: [],
  seen: true,
  welcome: false,
  plan: null,
  push: false,
  ready: false,
};

let cache: Session = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function commit(next: Partial<Session>) {
  cache = { ...cache, ...next };
  listeners.forEach((l) => l());
}

function ensure() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  cache = {
    member: readMember(),
    watched: readWatched(),
    seen: notificationsSeen(),
    welcome: !sessionStorage.getItem("cc_welcome_seen"),
    plan: readPlan(),
    push: notificationsEnabled(),
    ready: true,
  };
}

function subscribe(listener: () => void) {
  ensure();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  ensure();
  return cache;
}

function server() {
  return EMPTY;
}

export function useSession() {
  return useSyncExternalStore(subscribe, snapshot, server);
}

export const session = {
  enter(email: string) {
    commit({ member: signIn(email) });
  },
  leave() {
    signOut();
    commit({ member: null, watched: [], seen: true, welcome: false, plan: null, push: notificationsEnabled() });
  },
  watch(id: number) {
    markWatched(id);
    commit({ watched: Array.from(new Set([...cache.watched, id])) });
  },
  alertsOn() {
    markNotificationsSeen();
    commit({ seen: true });
  },
  setPush(on: boolean) {
    setNotificationsEnabled(on);
    commit({ push: on, seen: on ? true : cache.seen });
    if (on) markNotificationsSeen();
  },
  dismissWelcome() {
    try {
      sessionStorage.setItem("cc_welcome_seen", "1");
    } catch {}
    commit({ welcome: false });
  },
  setPlan(plan: AcceleratorPlan) {
    savePlan(plan);
    commit({ plan });
  },
  resetPlan() {
    clearPlan();
    commit({ plan: null });
  },
};

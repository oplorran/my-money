export type Answers = Record<string, string | number>;

export type FunnelState = {
  firstName: string;
  answers: Answers;
  score: number;
  tier: PriceTier;
  balance: number;
  plan: string | null;
  multiplier: string | null;
  startedAt: number;
};

export type PriceTier = "17" | "27" | "47" | "67" | "97";

export const CHECKOUTS: Record<PriceTier, { full: string; down: string }> = {
  "17": { full: "PPU38CQG07H", down: "PPU38CQG07N" },
  "27": { full: "PPU38CQG07I", down: "PPU38CQG07O" },
  "47": { full: "PPU38CQG07K", down: "PPU38CQG07P" },
  "67": { full: "PPU38CQG07L", down: "PPU38CQG07R" },
  "97": { full: "PPU38CQG07M", down: "PPU38CQG07S" },
};

export const TIER_PRICE: Record<PriceTier, number> = { "17": 17, "27": 27, "47": 47, "67": 67, "97": 97 };
export const TIER_DOWN: Record<PriceTier, number> = { "17": 9.9, "27": 14.9, "47": 24.9, "67": 34.9, "97": 49.9 };

/** Área de membros de destino depois dos upsells. */
export const MEMBERS_URL = "https://riseaiclub.com";

const KEY = "mc_funnel_v1";

const EMPTY: FunnelState = {
  firstName: "",
  answers: {},
  score: 0,
  tier: "47",
  balance: 50,
  plan: null,
  multiplier: null,
  startedAt: 0,
};

export function readState(): FunnelState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<FunnelState>) };
  } catch {
    return EMPTY;
  }
}

export function writeState(patch: Partial<FunnelState>) {
  if (typeof window === "undefined") return;
  try {
    const next = { ...readState(), ...patch };
    if (!next.startedAt) next.startedAt = Date.now();
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function resetState() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

export function tierFor(score: number): PriceTier {
  if (score >= 9) return "97";
  if (score >= 7) return "67";
  if (score >= 4) return "47";
  if (score >= 2) return "27";
  return "17";
}

export function checkoutUrl(id: string, opts: { email?: string; upsell?: boolean } = {}) {
  const base = `https://go.centerpag.com/${id}`;
  const qs = new URLSearchParams();
  if (opts.upsell) qs.set("upsell", "true");
  if (opts.email) qs.set("email", opts.email);
  const q = qs.toString();
  return q ? `${base}?${q}` : base;
}

/** Navega para fora do app sem mutar `window.location.href` (regra do React Compiler). */
export function goExternal(url: string) {
  if (typeof window === "undefined") return;
  window.location.assign(url);
}

export function money(v: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(v);
}

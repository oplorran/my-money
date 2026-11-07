export type Answers = Record<string, string | number>;

export type FunnelState = {
  firstName: string;
  target: number;
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

/** Checkouts pós-compra (upsells), na ordem em que aparecem. */
export const UP1_CHECKOUT = "PPU38CQHH1O"; // premium $297
export const UP2_CHECKOUT = "PPU38CQHH1P"; // AI multiplier $197
export const UP3_CHECKOUT = "PPU38CQHH1Q"; // acesso vitalício $67

/** Saída da chamada: o preço anunciado na VSL é fixo (US$ 29,90), como no original. */
export const BACK_CHECKOUT_FULL = "PPU38CQFUFH";
export const BACK_CHECKOUT_DOWN = "PPU38CQFUFG";
export const VSL_PRICE = 29.9;

/** Área de membros de destino depois dos upsells. */
export const MEMBERS_URL = "/app/login";

const KEY = "mc_funnel_v1";

const EMPTY: FunnelState = {
  firstName: "",
  target: 0,
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

/** Pontos da meta mensal digitada (p1) — o número em si não entra na soma. */
export function targetScore(target: number) {
  if (target > 15000) return 3;
  if (target > 5000) return 2;
  if (target >= 2000) return 1;
  return 0;
}

/** Score final: p1 vem da meta digitada, o resto das opções escolhidas. */
export function scoreOf(answers: Answers, target: number) {
  const rest = Object.entries(answers)
    .filter(([k]) => k !== "p1")
    .reduce((sum, [, v]) => sum + Number(v || 0), 0);
  return rest + targetScore(target);
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

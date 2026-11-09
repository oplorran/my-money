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

/**
 * Checkout único de front-end (Paggins). O preço é resolvido no checkout, então
 * as cinco faixas do quiz apontam para o mesmo link, cheio ou reduzido.
 */
export const FRONT_CHECKOUT = "https://paggins.com/checkout/3e772ea7-64b7-44d8-94ad-72a21df5fc2b";

export const CHECKOUTS: Record<PriceTier, { full: string; down: string }> = {
  "17": { full: FRONT_CHECKOUT, down: FRONT_CHECKOUT },
  "27": { full: FRONT_CHECKOUT, down: FRONT_CHECKOUT },
  "47": { full: FRONT_CHECKOUT, down: FRONT_CHECKOUT },
  "67": { full: FRONT_CHECKOUT, down: FRONT_CHECKOUT },
  "97": { full: FRONT_CHECKOUT, down: FRONT_CHECKOUT },
};

export const TIER_PRICE: Record<PriceTier, number> = { "17": 17, "27": 27, "47": 47, "67": 67, "97": 97 };
export const TIER_DOWN: Record<PriceTier, number> = { "17": 9.9, "27": 14.9, "47": 24.9, "67": 34.9, "97": 49.9 };

/**
 * Upsells 1-CLIQUE (Paggins offers API). Aceite cobra o cartão já salvo na compra
 * do front — sem reinserir dados. O Paggins injeta `acceptUrl`/`declineUrl`
 * (ligados à sessão do pedido) na URL da página de upsell; usamos esses quando
 * presentes e o link fixo abaixo como fallback.
 */
export const UP1_ACCEPT = "https://api.paggins.com/offers/686c17e6-7713-46a0-8ecd-ddfcb81d2fe5/accept?offerProductId=733a7717-e1b3-46ea-894d-897d78f90c03"; // $297
export const UP1_DECLINE = "https://api.paggins.com/offers/686c17e6-7713-46a0-8ecd-ddfcb81d2fe5/decline";
export const UP2_ACCEPT = "https://api.paggins.com/offers/67b9ea7f-7379-44b8-a5e5-dc959f2c55f1/accept?offerProductId=a9fe2a73-f682-4297-a156-886fa7b75934"; // $197
export const UP2_DECLINE = "https://api.paggins.com/offers/67b9ea7f-7379-44b8-a5e5-dc959f2c55f1/decline";
export const UP3_ACCEPT = "https://api.paggins.com/offers/909bb272-63ee-4210-8eaf-5ef235c4aa1e/accept?offerProductId=119db751-3aa6-4f92-8f07-e1759c9ae62d"; // $67
export const UP3_DECLINE = "https://api.paggins.com/offers/909bb272-63ee-4210-8eaf-5ef235c4aa1e/decline";

/** Aceite 1-clique: usa o acceptUrl injetado pelo Paggins na URL (sessão do pedido); senão o fixo. */
export function oneClickAccept(fallbackAccept: string): string {
  if (typeof window === "undefined") return fallbackAccept;
  try { return new URLSearchParams(window.location.search).get("acceptUrl") || fallbackAccept; }
  catch { return fallbackAccept; }
}
/** Recusa: usa o declineUrl injetado pelo Paggins; senão o /decline fixo (Paggins avança a cadeia). */
export function oneClickDecline(fallbackDecline: string): string {
  if (typeof window === "undefined") return fallbackDecline;
  try { return new URLSearchParams(window.location.search).get("declineUrl") || fallbackDecline; }
  catch { return fallbackDecline; }
}

/** Saída da chamada: o preço anunciado na VSL é fixo (US$ 29,90), como no original. */
export const BACK_CHECKOUT_FULL = FRONT_CHECKOUT;
export const BACK_CHECKOUT_DOWN = FRONT_CHECKOUT;
export const VSL_PRICE = 29.9;

/** Tripwire do artigo `/wt` (US$ 1) — usa o mesmo front-end. */
export const WT_CHECKOUT = FRONT_CHECKOUT;

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

/**
 * Monta a URL de checkout. Aceita tanto o id legado do CenterPag quanto uma URL
 * absoluta (Paggins); a query de rastreio é anexada ao destino final.
 */
export function checkoutUrl(target: string, opts: { email?: string; upsell?: boolean } = {}) {
  const isAbsolute = /^https?:\/\//i.test(target);
  const base = isAbsolute ? target : `https://go.centerpag.com/${target}`;
  const url = new URL(base);
  if (opts.upsell) url.searchParams.set("upsell", "true");
  if (opts.email) url.searchParams.set("email", opts.email);
  return url.toString();
}

/** Navega para fora do app sem mutar `window.location.href` (regra do React Compiler). */
export function goExternal(url: string) {
  if (typeof window === "undefined") return;
  window.location.assign(url);
}

export function money(v: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(v);
}

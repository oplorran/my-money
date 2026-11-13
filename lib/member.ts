/**
 * App de membros (área logada): dados, estado local e utilitários.
 * Estrutura fiel ao app de referência; identidade no tema Cash Club.
 */

export type Member = { name: string; email: string; joinedAt: number };

export type Lesson = {
  id: number;
  title: string;
  minutes: number;
  /** id do player VTurb (ConverteAI) da aula */
  player: string;
  /** rótulo interno do player, igual ao original */
  track: string;
};

export type Stock = { ticker: string; name: string };

export type Engine = { name: string; vendor: string; glyph: "openai" | "google" | "copilot" };

export type Signal = {
  ticker: string;
  name: string;
  direction: "BUY" | "SELL";
  timeframe: string;
  confidence: number;
  score: number;
  strength: number;
};

export type RankUser = { name: string; amount: number };

export type AcceleratorPlan = {
  goal: number;
  months: string;
  dedicated: string;
  capital: number;
};

/** Saída para a corretora, com o e-mail do membro no subid. */
export const POCKET_URL =
  "https://u3.shortink.io/register?utm_campaign=871380&utm_source=affiliate&utm_medium=sr&a=5kBIfGDhwORb5u&al=1809430&ac=treinamento&cid=990125";

export function pocketUrl(email?: string) {
  if (!email) return POCKET_URL;
  return `${POCKET_URL}&sub_id1=${encodeURIComponent(email)}`;
}

export const LESSONS: Lesson[] = [
  { id: 1, title: "How AI Works (Start Here)", minutes: 2, player: "6af65a1040ab0c1e12e29612", track: "Class 1 – Welcome!" },
  { id: 2, title: "Activate Your Account in 5 Minutes", minutes: 2, player: "6af65a3dfe9c64e8f3d04262", track: "Class 2 – Create Your Account" },
  { id: 3, title: "Your First AI Trade", minutes: 2, player: "6af65a52316ca0a2a4f3e655", track: "Class 3 – Activate Artificial Intelligence" },
  { id: 4, title: "Plan $100 → $250,000 in 6 Months", minutes: 2, player: "6af65a61d5fac6a4f3b454eb", track: "Class 4 – Operating in Practice" },
  { id: 5, title: "Next steps with your AI strategy", minutes: 2, player: "6af65a74b5baa44d4a416780", track: "Class 5 – Income Multiplier" },
];

/** Ativos da malha, na mesma ordem do original. */
export const STOCKS: Stock[] = [
  { ticker: "META", name: "Facebook" },
  { ticker: "AAPL", name: "Apple" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "BABA", name: "Alibaba" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "NFLX", name: "Netflix" },
  { ticker: "TSLA", name: "Tesla" },
  { ticker: "V", name: "Visa" },
  { ticker: "INTC", name: "Intel" },
];

export const ENGINES: Engine[] = [
  { name: "GPT", vendor: "OpenAI", glyph: "openai" },
  { name: "Gemini", vendor: "Google", glyph: "google" },
  { name: "Copilot", vendor: "Microsoft", glyph: "copilot" },
];

export const RANKING: RankUser[] = [
  { name: "James M.", amount: 47820 },
  { name: "Mary G.", amount: 46350 },
  { name: "John P.", amount: 45180 },
  { name: "Anna R.", amount: 44290 },
  { name: "David L.", amount: 43150 },
  { name: "Sophia V.", amount: 42480 },
  { name: "Peter S.", amount: 41720 },
  { name: "Laura C.", amount: 40950 },
  { name: "Michael A.", amount: 40210 },
  { name: "Emma F.", amount: 39580 },
];

export const RANK_TOTAL = 1247;
export const RANK_POSITION = 1122;

export const GOALS = [
  { value: 800, icon: "💵", label: "$800/mo" },
  { value: 2000, icon: "💰", label: "$2,000/mo" },
  { value: 4000, icon: "💎", label: "$4,000/mo" },
  { value: 8000, icon: "🔥", label: "$8,000/mo" },
  { value: 12000, icon: "🚀", label: "$12,000+/mo" },
];

export const PACES = [
  { id: "fast", icon: "⚡", label: "1–2 months", note: "fast", weight: 3 },
  { id: "moderate", icon: "📈", label: "3–5 months", note: "moderate", weight: 2 },
  { id: "gradual", icon: "🎯", label: "6–10 months", note: "gradual", weight: 1 },
];

export const DEDICATIONS = [
  { id: "low", icon: "⏱️", label: "15–20 min", note: "3–5 trades", weight: 1 },
  { id: "mid", icon: "⏳", label: "20–30 min", note: "5–10 trades", weight: 2 },
  { id: "high", icon: "🔥", label: "30–60 min", note: "10–15 trades", weight: 3 },
];

const MEMBER_KEY = "cc_member_v1";
const WATCHED_KEY = "cc_watched_v1";
const NOTIF_KEY = "cc_notif_v1";
const PLAN_KEY = "cc_accel_v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function drop(key: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch {}
}

export function readMember() {
  return read<Member | null>(MEMBER_KEY, null);
}

export function signIn(email: string) {
  const name = email.split("@")[0].replace(/[._-]+/g, " ").trim() || "Trader";
  const pretty = name.replace(/\b\w/g, (c) => c.toUpperCase());
  const member: Member = { name: pretty, email, joinedAt: Date.now() };
  write(MEMBER_KEY, member);
  return member;
}

export function signOut() {
  drop(MEMBER_KEY);
  drop(WATCHED_KEY);
  drop(NOTIF_KEY);
  drop(PLAN_KEY);
}

export function readWatched(): number[] {
  return read<number[]>(WATCHED_KEY, []);
}

export function markWatched(id: number) {
  const next = Array.from(new Set([...readWatched(), id]));
  write(WATCHED_KEY, next);
}

export function notificationsSeen() {
  return read<boolean>(NOTIF_KEY, false);
}

export function markNotificationsSeen() {
  write(NOTIF_KEY, true);
}

const PUSH_KEY = "cc_push_v1";

/** Liga/desliga as notificações neste dispositivo (preferência local, não é a permissão do navegador). */
export function notificationsEnabled() {
  return read<boolean>(PUSH_KEY, false);
}

export function setNotificationsEnabled(on: boolean) {
  write(PUSH_KEY, on);
}

export function readPlan() {
  return read<AcceleratorPlan | null>(PLAN_KEY, null);
}

export function savePlan(plan: AcceleratorPlan) {
  write(PLAN_KEY, plan);
}

export function clearPlan() {
  drop(PLAN_KEY);
}

/**
 * Capital recomendado: parte de uma base inversamente proporcional à meta;
 * prazos curtos e menos tempo por dia exigem mais capital.
 */
export function recommendCapital(goal: number, weightPace: number, weightDedication: number) {
  const paceFactor = weightPace === 3 ? 1.8 : weightPace === 2 ? 1 : 0.6;
  const timeFactor = weightDedication === 3 ? 0.85 : weightDedication === 2 ? 1 : 1.25;
  const raw = (goal / 26) * paceFactor * timeFactor;
  return Math.max(50, Math.round(raw / 25) * 25);
}

/** Projeções de tempo para 3 níveis de capital em torno do recomendado. */
export function projections(capital: number, goal: number) {
  const tiers = [capital * 0.67, capital, capital * 2].map((v) => Math.max(25, Math.round(v / 25) * 25));
  return tiers.map((value) => ({
    value,
    months: Math.max(1, Math.round(goal / (value * 7.5))),
  }));
}

export function newSignal(): Signal {
  const stock = STOCKS[Math.floor(Math.random() * STOCKS.length)];
  const direction: Signal["direction"] = Math.random() > 0.5 ? "BUY" : "SELL";
  return {
    ticker: stock.ticker,
    name: stock.name,
    direction,
    timeframe: "M1 · 1 minute",
    confidence: 90 + Math.floor(Math.random() * 8),
    score: 84 + Math.floor(Math.random() * 9),
    strength: 87 + Math.floor(Math.random() * 9),
  };
}

export function usd(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

let audio: AudioContext | null = null;

/** Efeitos curtos: toque na navegação e confirmação do sinal. */
export function cue(kind: "tap" | "win" | "scan" = "tap") {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audio = audio ?? new Ctx();
    const now = audio.currentTime;
    const notes = kind === "win" ? [660, 880, 1180] : kind === "scan" ? [420, 420] : [520];
    notes.forEach((freq, i) => {
      const osc = audio!.createOscillator();
      const gain = audio!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.075;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(kind === "tap" ? 0.05 : 0.08, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      osc.connect(gain).connect(audio!.destination);
      osc.start(start);
      osc.stop(start + 0.18);
    });
  } catch {}
}

import lines from "./voice-lines.json";

export type VoiceLine = { id: number; file: string; text: string };
export const VOICE: Record<number, VoiceLine> = Object.fromEntries(
  (lines as VoiceLine[]).map((l) => [l.id, l]),
);

export type AskOption = { label: string; score: number; branch?: string };

/** Palco visual que acompanha a fala — o original troca a cena, não só o texto. */
export type Scene =
  | "institution"
  | "accuracy"
  | "projection"
  | "guarantee"
  | "scarcity"
  | "anchor"
  | "price"
  | "locked";

export type Node =
  | { k: "say"; ids: number[]; scene?: Scene }
  | { k: "beat"; scene?: Scene; ms: number }
  | { k: "ask"; id: string; question: string; hint?: string; options: AskOption[]; num?: boolean }
  | { k: "branch"; by: string; map: Record<string, number[]> }
  | { k: "end" };

/**
 * Ordem fiel ao original: nome → meta em dinheiro (digitada) → projeção → motivo →
 * situação financeira → mecanismo/provas → objeção → garantia → escassez → ancoragem
 * → preço → bloqueio → confirmação. Só as 4 perguntas de qualificação pontuam.
 */
export const SCRIPT: Node[] = [
  { k: "say", ids: [1, 2, 3, 4] },
  { k: "ask", id: "p0", question: "What's your first name?", options: [] },
  { k: "say", ids: [5] },
  {
    k: "ask",
    id: "p1",
    num: true,
    question: "Give me a number. How much per month would actually change your life?",
    options: [],
  },
  { k: "beat", scene: "projection", ms: 4800 },
  { k: "say", ids: [9] },
  {
    k: "ask",
    id: "p2",
    question: "What's your situation right now?",
    hint: "Tap one of the buttons below",
    options: [
      { label: "I'm drowning in debt and need a way out", score: 0, branch: "debt" },
      { label: "I want extra income to breathe", score: 1, branch: "extra" },
      { label: "I want to stop depending on my job", score: 2, branch: "job" },
      { label: "I want to build something for my future", score: 2, branch: "future" },
      { label: "I want to give my family a better life", score: 1, branch: "family" },
    ],
  },
  {
    k: "branch",
    by: "p2",
    map: {
      debt: [10, 11, 12, 13],
      extra: [82, 83, 84, 85],
      job: [86, 87, 88, 89],
      future: [90, 91, 92, 93],
      family: [94, 95, 96, 97],
    },
  },
  { k: "say", ids: [6, 37] },
  {
    k: "ask",
    id: "p3",
    question: "What's left after your monthly bills?",
    hint: "Tap one of the buttons below",
    options: [
      { label: "I'm in the red — more goes out than comes in", score: 0 },
      { label: "Very little, less than $300", score: 1 },
      { label: "Between $300 and $1,000", score: 2 },
      { label: "Between $1,000 and $2,000", score: 3 },
      { label: "More than $2,000", score: 3 },
      { label: "Prefer not to say", score: 0 },
    ],
  },
  { k: "branch", by: "p3", map: { 0: [58], 1: [53, 54], 2: [55, 56], 3: [57] } },
  {
    k: "say",
    ids: [14, 15, 16, 17, 18, 19, 20, 21],
    scene: "institution",
  },
  { k: "say", ids: [22, 23], scene: "accuracy" },
  { k: "say", ids: [24, 25, 26] },
  { k: "say", ids: [27, 28, 29, 30, 31, 32, 33, 34] },
  { k: "say", ids: [38, 39, 40, 41, 42] },
  {
    k: "ask",
    id: "p4",
    question: "Where are you right now?",
    options: [
      { label: "I want to activate my account", score: 2 },
      { label: "I still have a question", score: 0, branch: "doubt" },
    ],
  },
  {
    k: "branch",
    by: "p4",
    map: {
      // dúvida -> quebra de objeção; o fechamento (63-65) é compartilhado com o "sim"
      doubt: [59, 60, 61, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 62, 64],
      "2": [],
    },
  },
  { k: "say", ids: [43, 44], scene: "guarantee" },
  { k: "say", ids: [45, 46, 47], scene: "scarcity" },
  { k: "say", ids: [48, 49], scene: "anchor" },
  { k: "say", ids: [50], scene: "price" },
  { k: "say", ids: [51], scene: "locked" },
  {
    k: "ask",
    id: "p5",
    question: "Ready to activate your account?",
    options: [
      { label: "I want to activate my account", score: 2 },
      { label: "Not yet, I need to think", score: 0 },
    ],
  },
  { k: "say", ids: [63, 64, 65] },
  { k: "end" },
];

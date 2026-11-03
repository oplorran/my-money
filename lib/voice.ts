import lines from "./voice-lines.json";

export type VoiceLine = { id: number; file: string; text: string };
export const VOICE: Record<number, VoiceLine> = Object.fromEntries(
  (lines as VoiceLine[]).map((l) => [l.id, l])
);

export type AskOption = { label: string; score: number; branch?: string };
export type Node =
  | { k: "say"; ids: number[] }
  | { k: "ask"; id: string; question: string; options: AskOption[] }
  | { k: "branch"; by: string; map: Record<string, number[]> }
  | { k: "end" };

export const SCRIPT: Node[] = [
  { k: "say", ids: [1, 2, 3, 4] },
  { k: "ask", id: "p0", question: "What's your first name?", options: [] },
  { k: "say", ids: [5, 6, 7, 8] },
  { k: "say", ids: [9] },
  {
    k: "ask", id: "p2", question: "Why are you here?",
    options: [
      { label: "I'm in debt", score: 0, branch: "debt" },
      { label: "Extra income", score: 1, branch: "extra" },
      { label: "Stop depending on my job", score: 2, branch: "job" },
      { label: "Build a future", score: 2, branch: "future" },
      { label: "For my family", score: 1, branch: "family" },
    ],
  },
  {
    k: "branch", by: "p2",
    map: {
      debt: [10, 11, 12, 13],
      extra: [82, 83, 84, 85],
      job: [86, 87, 88, 89],
      future: [90, 91, 92, 93],
      family: [94, 95, 96, 97],
    },
  },
  { k: "say", ids: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26] },
  { k: "say", ids: [27, 28, 29, 30, 31, 32, 33, 34] },
  {
    k: "ask", id: "p1", question: "How much do you want to make a month?",
    options: [
      { label: "Under $2,000", score: 0 },
      { label: "Up to $5,000", score: 1 },
      { label: "Up to $15,000", score: 2 },
      { label: "More than $15,000", score: 3 },
    ],
  },
  { k: "say", ids: [35, 36, 37, 38, 39, 40, 41, 42] },
  { k: "say", ids: [43, 44, 45, 46, 47] },
  {
    k: "ask", id: "p3", question: "What's your financial situation today?",
    options: [
      { label: "In the red", score: 0 },
      { label: "Tight, but there's room", score: 1 },
      { label: "Some room to move", score: 2 },
      { label: "Solid base", score: 3 },
    ],
  },
  { k: "branch", by: "p3", map: { 0: [58], 1: [53, 54], 2: [55, 56], 3: [57] } },
  { k: "say", ids: [48, 49, 50, 51, 52] },
  {
    k: "ask", id: "p4", question: "How do you want to proceed?",
    options: [
      { label: "I want to activate my account", score: 2 },
      { label: "I still have a question", score: 0, branch: "doubt" },
    ],
  },
  {
    k: "branch", by: "p4",
    map: {
      // dúvida -> quebra de objeção; o fechamento (63-65) é compartilhado com o "sim"
      doubt: [59, 60, 61, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 62, 64],
      "2": [],
    },
  },
  { k: "say", ids: [63, 64, 65] },
  { k: "end" },
];

export function waveParts() {
  return [0, 1, 2, 3, 4, 5, 6];
}
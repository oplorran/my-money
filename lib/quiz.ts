export type Option = { label: string; icon?: "check" | "minus" | "dot" };

/** Respostas do cartão de swipe: `true` = combina comigo, `false` = não. */
export type SwipeValues = Record<number, boolean>;

export type Question =
  | { id: string; block: 1 | 2 | 3; type: "choice"; question: string; options: string[] }
  | { id: string; block: 1; type: "swipe"; question: string; cards: string[] }
  | { id: string; block: 1 | 2; type: "scale"; question: string; low: string; high: string }
  | { id: string; block: 2; type: "text"; question: string; placeholder: string };

export const QUESTIONS: Question[] = [
  {
    id: "q1", block: 1, type: "choice",
    question: "How would you describe your relationship with money today?",
    options: [
      "I struggle to make it through the month",
      "I save a little when I can",
      "I manage my spending well",
      "I want to grow my money",
    ],
  },
  {
    id: "q2", block: 1, type: "swipe",
    question: "Swipe the cards based on what feels true",
    cards: [
      "I want to feel in control of my money",
      "I'd like to understand my finances better",
      "I think technology can help me with money",
      "I'm interested in learning about investing",
      "Artificial intelligence sparks my curiosity",
    ],
  },
  {
    id: "q3", block: 1, type: "choice",
    question: "What would you most like to achieve with your money?",
    options: ["Feel more at ease", "Save for the future", "Earn extra income", "Reach financial freedom"],
  },
  {
    id: "q4", block: 1, type: "scale",
    question: "On a scale of 0 to 100, how comfortable do you feel with your finances today?",
    low: "It's a struggle",
    high: "Very comfortable",
  },
  {
    id: "q5", block: 2, type: "choice",
    question: "When you make an important decision, how do you usually do it?",
    options: ["On instinct, in the moment", "I have a hard time deciding", "I ask others for their take", "I research before I decide"],
  },
  {
    id: "q6", block: 2, type: "choice",
    question: "How do you feel about change and uncertainty?",
    options: ["They stress me out", "It's hard, but I adapt", "I take them in stride", "I like them — I see opportunity"],
  },
  {
    id: "q7", block: 2, type: "text",
    question: "If AI could help you with just one thing about your money, what would it be?",
    placeholder: "e.g. save more, understand investing, organize my spending...",
  },
  {
    id: "q8", block: 2, type: "choice",
    question: "How often do you use technology in your day-to-day?",
    options: ["Just the basics", "For social and messaging", "A lot, for many things", "All the time — I love it"],
  },
  {
    id: "q9", block: 2, type: "scale",
    question: "On a scale of 0 to 100, how comfortable are you using apps and technology?",
    low: "It's a struggle",
    high: "Very comfortable",
  },
  {
    id: "q10", block: 3, type: "choice",
    question: "What would you like AI to do for you?",
    options: ["Help me organize my finances", "Teach me about the economy", "Guide me on investing", "Save me time on everything"],
  },
];

export const INSIGHTS = [
  "Technology changed the rules. Today, millions of people use digital tools and artificial intelligence to organize their finances and get informed before they invest. AI can analyze economic data in seconds.",
  "Learning is the smartest move. You don't need to be an expert — today's tools make understanding your finances simpler than ever. More and more people use AI to stay informed about investing.",
];

export type Profile = {
  id: string;
  name: string;
  gradient: string;
  accent: string;
  headline: string;
  traits: string[];
};

export const PROFILES: Profile[] = [
  {
    id: "digital-explorer", name: "Digital Explorer",
    gradient: "from-indigo-500 via-violet-500 to-blue-600", accent: "text-indigo-600",
    headline: "Your curiosity for what's new puts you ahead of the curve. You already see AI as a tool — not a threat.",
    traits: ["A natural curiosity for what's new", "Open to using technology in your favor", "Eager to learn about the economy", "A growth mindset"],
  },
  {
    id: "careful-saver", name: "Careful Saver",
    gradient: "from-blue-500 via-cyan-500 to-teal-500", accent: "text-blue-600",
    headline: "You take good care of your money. What's missing is a system that works while you rest.",
    traits: ["You take good care of your money", "You value safety and peace of mind", "You think before you spend", "You're after long-term stability"],
  },
  {
    id: "strategist", name: "Strategist in Training",
    gradient: "from-violet-500 via-purple-500 to-indigo-600", accent: "text-violet-600",
    headline: "You analyze before you decide and want to understand the why. AI can give you the data you're missing.",
    traits: ["You analyze before you decide", "You want to understand the why", "You like staying in control", "You think medium and long term"],
  },
  {
    id: "practical-visionary", name: "Practical Visionary",
    gradient: "from-sky-500 via-indigo-500 to-fuchsia-500", accent: "text-sky-600",
    headline: "Your future-focused outlook sets you apart. Understanding how AI is transforming the economy can help you get ready for what's next.",
    traits: ["A future-focused mindset", "You see opportunity where others see risk", "You adapt quickly to change", "You want to make the most of the digital era"],
  },
];

export function pickProfile(answers: Record<string, string | number>): Profile {
  let score = 0;
  const q1 = String(answers.q1 ?? "");
  if (q1.startsWith("I want")) score += 2;
  else if (q1.startsWith("I manage")) score += 1;
  const q3 = String(answers.q3 ?? "");
  if (q3 === "Reach financial freedom") score += 3;
  else if (q3 === "Earn extra income") score += 2;
  else if (q3 === "Save for the future") score += 1;
  const q8 = String(answers.q8 ?? "");
  if (q8.startsWith("All the time")) score += 2;
  else if (q8.startsWith("A lot")) score += 1;
  const q9 = Number(answers.q9 ?? 50);
  if (q9 > 66) score += 2;
  else if (q9 > 33) score += 1;
  // swipe (q2): cartões 4 e 5 são os de afinidade com IA e com investir
  const q2 = String(answers.q2 ?? "");
  if (q2[3] === "1" || q2[4] === "1") score += 1;
  if (score >= 8) return PROFILES[3];
  if (score >= 6) return PROFILES[0];
  if (score >= 4) return PROFILES[2];
  return PROFILES[1];
}

export const INCLUDED: { label: string; price: number }[] = [
  { label: "Access to the AI tool for organizing your finances", price: 47 },
  { label: "A practical guide to get informed before you invest", price: 19 },
  { label: "A content library on the economy and technology", price: 24 },
  { label: "Updates and new features included", price: 12 },
  { label: "Community and support along the way", price: 9 },
];

export function includedTotal(tierPrice: number) {
  return INCLUDED.reduce((sum, item) => sum + item.price, 0) + tierPrice;
}

export const BENEFITS = [
  { title: "Organize your money", desc: "Use AI to sort your spending, goals, and savings — no complicated spreadsheets." },
  { title: "Learn without the intimidation", desc: "Understand how investing works with simple, step-by-step explanations." },
  { title: "Decide with clarity", desc: "Have clear information at your fingertips before you make any money decision." },
];

export const FOR_YOU = [
  "You want to get your finances in order",
  "You feel like technology left you behind",
  "You're curious about AI but don't know where to start",
  "You want to learn about investing at your own pace",
];

export const TESTIMONIALS = [
  { name: "Marina C.", role: "Member since 2024", i: "M", avatar: "from-fuchsia-500 to-purple-600", text: "I finally understood how to start organizing my money. They explain it in a really simple way." },
  { name: "Sofia R.", role: "Member since 2024", i: "S", avatar: "from-cyan-500 to-blue-600", text: "I was scared of all this tech stuff. Now I use it every day." },
  { name: "Daniel P.", role: "Member since 2025", i: "D", avatar: "from-emerald-500 to-teal-600", text: "It helped me get informed before making decisions. It's worth way more than it costs." },
];

export const FAQ = [
  { q: "Do I need to know about tech or investing?", a: "No. It's built to start from scratch, with simple, step-by-step explanations." },
  { q: "How do I get access after I pay?", a: "Access is instant. As soon as payment is confirmed, everything is sent right away." },
  { q: "What if it's not for me?", a: "You get a 7-day guarantee. If it's not a fit, we'll refund 100% of your money." },
  { q: "Is payment secure?", a: "Yes. Payment is processed on a secure, encrypted platform." },
];
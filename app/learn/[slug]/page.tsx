import type { Metadata } from "next";
import Link from "next/link";

const ARTICLES: Record<string, { tag: string; title: string; body: string[] }> = {
  "ai-basics": {
    tag: "AI Literacy",
    title: "What Artificial Intelligence Actually Does With Your Money Data",
    body: [
      "Artificial intelligence has become a quiet part of everyday banking. When your card is declined on a suspicious purchase, when your budgeting app predicts next month's spending, or when a lender approves you in seconds — a model trained on millions of transactions is making a judgment call.",
      "At its core, most financial AI is pattern recognition. It looks at thousands of past examples and learns which combinations of signals tend to lead to a certain outcome: fraud, default, overspending. It does not 'understand' money the way a person does; it estimates probabilities.",
      "That distinction matters for you. A model can be confidently wrong. It can flag a legitimate purchase as fraud because it looks unusual, or miss a real problem because it resembles normal behavior. Knowing this helps you push back when an automated decision feels off.",
      "The practical takeaway: treat AI-driven financial tools as helpful assistants, not oracles. Use them to spot patterns you might miss, but keep your own judgment in the loop — especially for big decisions.",
    ],
  },
  "budget-50-30-20": {
    tag: "Budgeting",
    title: "The 50/30/20 Rule, Explained for Real Life",
    body: [
      "The 50/30/20 rule splits your after-tax income into three buckets: 50% for needs, 30% for wants, and 20% for savings and debt repayment. Its appeal is simplicity — no spreadsheets, no tracking every coffee.",
      "Needs are the non-negotiables: housing, utilities, groceries, minimum debt payments, insurance. Wants are everything that makes life enjoyable but could be cut in a crisis: dining out, subscriptions, travel.",
      "The rule struggles in two situations. If you live in a high-cost city, 'needs' alone can exceed 50%. And if your income is irregular, fixed percentages feel unrealistic month to month. In both cases, treat the numbers as a direction, not a law.",
      "A better version for irregular income: base your percentages on your lowest typical month, and treat anything above that as a bonus to funnel into savings. That way you never overcommit during a good month and panic during a slow one.",
    ],
  },
  "emergency-fund": {
    tag: "Saving",
    title: "How Much Should Your Emergency Fund Really Hold?",
    body: [
      "The standard advice — three to six months of expenses — is a decent starting point, but it ignores how different your risk is from everyone else's.",
      "Ask three questions. How stable is your income? A salaried employee with strong job security needs less cushion than a freelancer with lumpy earnings. How many people depend on you? More dependents means more months of buffer. How quickly could you find new income if you lost it?",
      "A practical sizing method: estimate your essential monthly costs (not your full spending — just the essentials), then multiply by the number of months you'd realistically need to recover from a job loss or emergency. For many people that lands between four and eight months.",
      "Keep the fund somewhere safe and reachable within a day or two — a high-yield savings account, not investments that can drop in value right when you need them.",
    ],
  },
  "avoid-scams": {
    tag: "Safety",
    title: "7 Red Flags of Online Money Scams You Can Spot in Seconds",
    body: [
      "Online financial scams share a surprisingly consistent playbook. Learn the pattern once and you'll recognize it everywhere.",
      "1. Guaranteed returns. No legitimate investment can promise a fixed profit. Markets carry risk — anyone who removes that risk in their pitch is lying. 2. Artificial urgency. Countdown timers and 'only 3 spots left' exist to stop you thinking. 3. Pressure to pay fast, often by irreversible methods like crypto or gift cards.",
      "4. Fake social proof. Stock-photo testimonials and screenshots of earnings are trivial to fabricate. 5. Vague mechanics. If they can't clearly explain how the money is made, assume it isn't. 6. Unsolicited contact. Real opportunities rarely slide into your DMs.",
      "7. A charismatic single figure whose lifestyle is the main selling point. When the product is someone's wealth rather than a clear service, be very skeptical. Slow down, search for independent reviews, and never send money you can't afford to lose.",
    ],
  },
  "compound-interest": {
    tag: "Investing Basics",
    title: "Compound Interest: The Only Math That Really Matters Early",
    body: [
      "Compound interest is simply earning returns on your returns. The money you make gets reinvested and starts making its own money — and over long periods, that snowball becomes enormous.",
      "The key variable is time, not the amount. Someone who invests a modest sum in their twenties often ends up ahead of someone who invests much more in their forties, purely because the early money had more years to compound.",
      "A simple illustration: money growing at a steady annual rate roughly doubles every time the rate times the number of years reaches about 72 (the 'Rule of 72'). At 8% a year, that's about nine years to double.",
      "The lesson isn't to chase high returns — it's to start early and stay consistent. Time in the market, done sensibly, beats trying to time it.",
    ],
  },
  "credit-score": {
    tag: "Credit",
    title: "Your Credit Score Isn't Magic — Here's What Moves It",
    body: [
      "Credit scores feel mysterious, but they're built from a handful of known factors with known weights.",
      "Payment history is the heaviest — simply paying on time, every time, does most of the work. Credit utilization (how much of your available credit you're using) is next; keeping it low signals you're not stretched. The length of your credit history, the mix of credit types, and recent applications round out the picture.",
      "Common myths waste energy. Checking your own score does not hurt it. Closing an old card can actually lower your score by shortening your history and raising utilization. Carrying a balance does not 'build' credit — paying in full does.",
      "Focus on the two things that matter most: never miss a payment, and keep your balances well below your limits. The rest is noise.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = ARTICLES[slug];
  if (!a) return { title: "MindfulMoney", robots: { index: true, follow: true } };
  return { title: `${a.title} — MindfulMoney`, description: a.body[0].slice(0, 155), robots: { index: true, follow: true } };
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = ARTICLES[slug];

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <header style={{ borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/learn" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>M</div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" }}>MindfulMoney</span>
          </Link>
          <Link href="/learn" style={{ fontSize: 14, color: "#475569", textDecoration: "none" }}>← All articles</Link>
        </div>
      </header>

      <article style={{ maxWidth: 680, margin: "0 auto", padding: "48px 20px 64px" }}>
        {a ? (
          <>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.5px" }}>{a.tag}</span>
            <h1 style={{ fontSize: 34, lineHeight: 1.2, fontWeight: 800, letterSpacing: "-0.5px", margin: "12px 0 24px" }}>{a.title}</h1>
            {a.body.map((p, i) => (
              <p key={i} style={{ fontSize: 17.5, lineHeight: 1.75, color: "#334155", margin: "0 0 20px" }}>{p}</p>
            ))}
            <div style={{ marginTop: 40, padding: "18px 20px", background: "#ecfdf5", borderRadius: 12, border: "1px solid #a7f3d0", fontSize: 14.5, color: "#065f46", lineHeight: 1.6 }}>
              This article is educational and does not constitute financial advice. Always consider your own situation and consult a qualified professional for personalized guidance.
            </div>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Article not found</h1>
            <p style={{ color: "#64748b" }}><Link href="/learn" style={{ color: "#059669" }}>Back to all articles →</Link></p>
          </>
        )}
      </article>
    </main>
  );
}

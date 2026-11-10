import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MindfulMoney — Smart Personal Finance & AI Literacy",
  description:
    "Practical, no-hype guides on budgeting, saving, and understanding how artificial intelligence is changing everyday money decisions.",
  robots: { index: true, follow: true },
};

const ARTICLES = [
  {
    slug: "ai-basics",
    tag: "AI Literacy",
    title: "What Artificial Intelligence Actually Does With Your Money Data",
    excerpt:
      "A plain-language look at how banks and budgeting apps use machine learning — and what it means for your privacy and your wallet.",
    read: "6 min read",
  },
  {
    slug: "budget-50-30-20",
    tag: "Budgeting",
    title: "The 50/30/20 Rule, Explained for Real Life",
    excerpt:
      "Why this decades-old framework still works, where it breaks down, and how to adapt it when your income is irregular.",
    read: "5 min read",
  },
  {
    slug: "emergency-fund",
    tag: "Saving",
    title: "How Much Should Your Emergency Fund Really Hold?",
    excerpt:
      "Three to six months is the old advice. Here is a more honest way to size your safety net based on your actual risk.",
    read: "7 min read",
  },
  {
    slug: "avoid-scams",
    tag: "Safety",
    title: "7 Red Flags of Online Money Scams You Can Spot in Seconds",
    excerpt:
      "Promises of guaranteed returns, urgency timers, and fake testimonials — learn the patterns before they cost you.",
    read: "8 min read",
  },
  {
    slug: "compound-interest",
    tag: "Investing Basics",
    title: "Compound Interest: The Only Math That Really Matters Early",
    excerpt:
      "A simple visual explanation of why starting five years earlier can double your long-term result.",
    read: "4 min read",
  },
  {
    slug: "credit-score",
    tag: "Credit",
    title: "Your Credit Score Isn't Magic — Here's What Moves It",
    excerpt:
      "The five factors that actually matter, ranked by weight, plus the myths that waste your energy.",
    read: "6 min read",
  },
];

export default function LearnPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>M</div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" }}>MindfulMoney</span>
          </div>
          <nav style={{ display: "flex", gap: 22, fontSize: 14, color: "#475569" }}>
            <Link href="/learn" style={{ color: "#475569", textDecoration: "none" }}>Articles</Link>
            <Link href="/learn/about" style={{ color: "#475569", textDecoration: "none" }}>About</Link>
            <Link href="/learn/privacy" style={{ color: "#475569", textDecoration: "none" }}>Privacy</Link>
            <Link href="/learn/contact" style={{ color: "#475569", textDecoration: "none" }}>Contact</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 20px 48px" }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#059669", background: "#ecfdf5", padding: "5px 11px", borderRadius: 99, marginBottom: 16 }}>Free financial education</span>
          <h1 style={{ fontSize: 40, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 16px", maxWidth: 720 }}>
            Understand your money and the technology shaping it — without the hype.
          </h1>
          <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.6, maxWidth: 640, margin: 0 }}>
            MindfulMoney publishes clear, practical guides on budgeting, saving, and how artificial intelligence is quietly changing everyday financial decisions. No upsells, no guarantees — just honest information.
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 20px 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px" }}>Latest articles</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 22 }}>
          {ARTICLES.map((a) => (
            <Link key={a.slug} href={`/learn/${a.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 22, height: "100%", transition: "box-shadow .2s", display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.5px" }}>{a.tag}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.35, margin: "10px 0 10px" }}>{a.title}</h3>
                <p style={{ fontSize: 14.5, color: "#64748b", lineHeight: 1.55, margin: "0 0 16px", flex: 1 }}>{a.excerpt}</p>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{a.read}</span>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter / trust */}
      <section style={{ background: "#fff", borderTop: "1px solid #e2e8f0", marginTop: 32 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 12px" }}>Money clarity, once a week</h2>
          <p style={{ fontSize: 16, color: "#475569", margin: "0 0 20px" }}>One short, practical email. No spam, unsubscribe anytime.</p>
          <form style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto" }}>
            <input type="email" placeholder="you@email.com" style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 15 }} />
            <button type="submit" style={{ padding: "12px 20px", borderRadius: 10, border: 0, background: "#059669", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Subscribe</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e2e8f0", background: "#f1f5f9" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 20, fontSize: 14, color: "#64748b" }}>
          <div style={{ maxWidth: 360 }}>
            <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>MindfulMoney</div>
            <p style={{ margin: 0, lineHeight: 1.6 }}>Independent financial education. We do not sell financial products or provide personalized investment advice.</p>
          </div>
          <div style={{ display: "flex", gap: 40 }}>
            <div>
              <div style={{ fontWeight: 700, color: "#334155", marginBottom: 10 }}>Topics</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <Link href="/learn/budget-50-30-20" style={{ color: "#64748b", textDecoration: "none" }}>Budgeting</Link>
                <Link href="/learn/emergency-fund" style={{ color: "#64748b", textDecoration: "none" }}>Saving</Link>
                <Link href="/learn/compound-interest" style={{ color: "#64748b", textDecoration: "none" }}>Investing</Link>
                <Link href="/learn/avoid-scams" style={{ color: "#64748b", textDecoration: "none" }}>Safety</Link>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#334155", marginBottom: 10 }}>Company</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <Link href="/learn/about" style={{ color: "#64748b", textDecoration: "none" }}>About</Link>
                <Link href="/learn/privacy" style={{ color: "#64748b", textDecoration: "none" }}>Privacy Policy</Link>
                <Link href="/learn/contact" style={{ color: "#64748b", textDecoration: "none" }}>Contact</Link>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #e2e8f0", padding: "16px 20px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
          © 2026 MindfulMoney. All rights reserved. Educational content only — not financial advice.
        </div>
      </footer>
    </main>
  );
}

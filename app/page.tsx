import type { Metadata } from "next";
import { Blobs } from "@/components/marks";
import { Quiz } from "@/components/quiz/Quiz";

export const metadata: Metadata = {
  title: "Cash Club · Discover your profile",
  description: "Discover how artificial intelligence can help you with your finances in 2 minutes.",
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="qa-surface" />
      <div className="qa-grid" />
      <Blobs />
      <Quiz />
    </main>
  );
}

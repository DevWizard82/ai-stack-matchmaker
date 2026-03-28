"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "@/components/Herosection";
import MatchmakerForm from "@/components/Matchmakerform";
import ResultsDashboard from "@/components/Resultsdashboard";
import type { UserAnswers } from "@/lib/matchmaker";

type View = "hero" | "form" | "results";

const PAGE_TRANSITION = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export default function Home() {
  const [view, setView] = useState<View>("hero");
  const [answers, setAnswers] = useState<UserAnswers | null>(null);

  function handleFormComplete(a: UserAnswers) {
    setAnswers(a);
    setView("results");
  }

  function handleReset() {
    setAnswers(null);
    setView("hero");
  }

  return (
    <main className="relative min-h-screen bg-[#080808] text-white antialiased">
      {/* Global ambient grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Noise grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Nav */}
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4">
        <button
          onClick={handleReset}
          className="font-display text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-70"
        >
          StackMatch<span className="text-cyan-400">.</span>
        </button>

        {view !== "hero" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleReset}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-400 transition-colors hover:text-white"
          >
            Start over
          </motion.button>
        )}
      </header>

      {/* View router */}
      <AnimatePresence mode="wait">
        {view === "hero" && (
          <motion.div key="hero" {...PAGE_TRANSITION}>
            <HeroSection onStart={() => setView("form")} />
          </motion.div>
        )}

        {view === "form" && (
          <motion.div key="form" {...PAGE_TRANSITION}>
            <MatchmakerForm onComplete={handleFormComplete} />
          </motion.div>
        )}

        {view === "results" && answers && (
          <motion.div key="results" {...PAGE_TRANSITION}>
            <ResultsDashboard answers={answers} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
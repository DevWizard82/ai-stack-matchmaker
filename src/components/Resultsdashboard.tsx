"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { UserAnswers } from "@/lib/matchmaker";
import { getMatches } from "@/lib/matchmaker";
import ToolCard from "./ToolCard";

interface ResultsDashboardProps {
    answers: UserAnswers;
    onReset: () => void;
}

const ROLE_LABELS: Record<string, string> = {
    "frontend": "Frontend Dev",
    "backend": "Backend Dev",
    "fullstack": "Full-Stack Dev",
    "data-science": "Data Scientist",
};

const BOTTLENECK_LABELS: Record<string, string> = {
    "writing-boilerplate": "Boilerplate Code",
    "cloud-deployment": "Cloud Deployment",
    "logic-debugging": "Logic & Debugging",
    "ui-design": "UI Design",
    "workflow-automation": "Workflow Automation",
};

export default function ResultsDashboard({ answers, onReset }: ResultsDashboardProps) {
    const { tools, totalCandidates } = useMemo(() => getMatches(answers), [answers]);

    return (
        <section className="relative min-h-screen px-6 py-24">
            {/* Ambient glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 z-0 h-[400px] w-[700px] -translate-x-1/2 opacity-15"
                style={{
                    background: "radial-gradient(ellipse, #00d4ff 0%, transparent 60%)",
                    filter: "blur(80px)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-12"
                >
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-widest text-cyan-400 uppercase">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Stack Analysis Complete
                    </div>

                    <h2 className="font-display text-3xl font-semibold text-white md:text-5xl">
                        Your personalised stack.
                    </h2>

                    {/* Profile summary pills */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {[
                            ROLE_LABELS[answers.role],
                            BOTTLENECK_LABELS[answers.bottleneck],
                            answers.pricing.charAt(0).toUpperCase() + answers.pricing.slice(1),
                        ].map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Stats row */}
                    <div className="mt-6 flex flex-wrap gap-6 border-t border-white/8 pt-6">
                        <Stat label="Tools matched" value={tools.length.toString()} />
                        <Stat label="Candidates scored" value={totalCandidates.toString()} />
                        <Stat label="Categories covered"
                            value={[...new Set(tools.map((t) => t.category))].length.toString()}
                        />
                    </div>
                </motion.div>

                {/* Tool grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool, i) => (
                        <ToolCard key={tool.id} tool={tool} index={i} />
                    ))}
                </div>

                {/* Empty state */}
                {tools.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-12 rounded-2xl border border-white/8 bg-white/3 p-12 text-center"
                    >
                        <p className="text-zinc-400">No tools matched your criteria.</p>
                        <button onClick={onReset} className="mt-4 text-sm text-cyan-400 hover:underline">
                            Try different answers →
                        </button>
                    </motion.div>
                )}

                {/* Footer actions */}
                {tools.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-16 flex flex-col items-center gap-4 border-t border-white/8 pt-10 text-center"
                    >
                        <p className="text-sm text-zinc-600">Not the right fit?</p>
                        <button
                            onClick={onReset}
                            className="rounded-full border border-white/12 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
                        >
                            ← Rebuild My Stack
                        </button>
                    </motion.div>
                )}
            </div>
        </section>
    );
}

// ─── Sub-component ────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="font-display text-2xl font-semibold text-white">{value}</p>
            <p className="mt-0.5 text-xs text-zinc-600">{label}</p>
        </div>
    );
}
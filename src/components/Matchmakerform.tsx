"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import type { UserAnswers } from "@/lib/matchmaker";
import type { Role, Bottleneck, Pricing } from "@/types/Tool";

interface MatchmakerFormProps {
    onComplete: (answers: UserAnswers) => void;
}

// ─── Step data ────────────────────────────────────────────────

const STEPS = [
    {
        id: "role",
        question: "What's your primary role?",
        hint: "We'll filter tools built specifically for your discipline.",
        options: [
            { value: "frontend", label: "Frontend", icon: "⬡", sub: "React, Vue, CSS" },
            { value: "backend", label: "Backend", icon: "⬡", sub: "APIs, databases, infra" },
            { value: "fullstack", label: "Full-Stack", icon: "⬡", sub: "End-to-end ownership" },
            { value: "data-science", label: "Data Science", icon: "⬡", sub: "ML, analytics, Python" },
        ],
    },
    {
        id: "bottleneck",
        question: "What slows you down most?",
        hint: "Pick your single biggest time sink. We'll target it directly.",
        options: [
            { value: "writing-boilerplate", label: "Boilerplate Code", icon: "⬡", sub: "Repetitive scaffolding" },
            { value: "cloud-deployment", label: "Cloud Deployment", icon: "⬡", sub: "CI/CD, infra setup" },
            { value: "logic-debugging", label: "Logic & Debugging", icon: "⬡", sub: "Bug hunting, reviews" },
            { value: "ui-design", label: "UI Design", icon: "⬡", sub: "Components, layouts" },
            { value: "workflow-automation", label: "Workflow Automation", icon: "⬡", sub: "Integrations, pipelines" },
        ],
    },
    {
        id: "pricing",
        question: "What's your budget?",
        hint: "We'll only show tools you can actually adopt today.",
        options: [
            { value: "free", label: "Free & OSS", icon: "⬡", sub: "Zero cost, always" },
            { value: "freemium", label: "Freemium", icon: "⬡", sub: "Free tier + paid options" },
            { value: "premium", label: "Premium", icon: "⬡", sub: "Best tool regardless of cost" },
        ],
    },
] as const;

// ─── Animations ───────────────────────────────────────────────

const slide: Variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit: (dir: number) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.3 } }),
};

// ─── Component ────────────────────────────────────────────────

export default function MatchmakerForm({ onComplete }: MatchmakerFormProps) {
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [answers, setAnswers] = useState<Partial<UserAnswers>>({});

    const current = STEPS[step];
    const progress = ((step) / STEPS.length) * 100;

    function select(value: string) {
        const next = { ...answers, [current.id]: value } as Partial<UserAnswers>;
        setAnswers(next);

        if (step < STEPS.length - 1) {
            setTimeout(() => {
                setDir(1);
                setStep((s) => s + 1);
            }, 180);
        } else {
            // All answered — fire
            setTimeout(() => onComplete(next as UserAnswers), 240);
        }
    }

    function back() {
        if (step === 0) return;
        setDir(-1);
        setStep((s) => s - 1);
    }

    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24">
            {/* Radial glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
                style={{
                    background: "radial-gradient(circle, #a855f7 0%, transparent 70%)",
                    filter: "blur(80px)",
                }}
            />

            <div className="relative z-10 w-full max-w-2xl">
                {/* Top bar: step counter + progress */}
                <div className="mb-10 flex items-center justify-between">
                    <button
                        onClick={back}
                        disabled={step === 0}
                        className="text-xs text-zinc-600 transition-colors hover:text-white disabled:opacity-0"
                    >
                        ← Back
                    </button>

                    <div className="flex items-center gap-3">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-500 ${i < step
                                    ? "w-8 bg-cyan-400"
                                    : i === step
                                        ? "w-8 bg-white"
                                        : "w-4 bg-white/15"
                                    }`}
                            />
                        ))}
                    </div>

                    <span className="font-mono text-xs text-zinc-600">
                        {step + 1} / {STEPS.length}
                    </span>
                </div>

                {/* Animated question + options */}
                <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                        key={step}
                        custom={dir}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                    >
                        {/* Question */}
                        <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
                            {current.question}
                        </h2>
                        <p className="mt-2 text-sm text-zinc-500">{current.hint}</p>

                        {/* Options grid */}
                        <div
                            className={`mt-8 grid gap-3 ${current.options.length > 3 ? "sm:grid-cols-2" : "sm:grid-cols-3"
                                }`}
                        >
                            {current.options.map((opt, i) => {
                                const selected = answers[current.id as keyof UserAnswers] === opt.value;
                                return (
                                    <motion.button
                                        key={opt.value}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        onClick={() => select(opt.value)}
                                        className={`group relative flex flex-col items-start rounded-xl border p-5 text-left transition-all duration-200 ${selected
                                            ? "border-cyan-400/60 bg-cyan-400/5 shadow-[0_0_20px_rgba(0,212,255,0.12)]"
                                            : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6"
                                            }`}
                                    >
                                        <span
                                            className={`mb-3 text-lg transition-colors ${selected ? "text-cyan-400" : "text-zinc-600 group-hover:text-zinc-400"
                                                }`}
                                        >
                                            {selected ? "◆" : "◇"}
                                        </span>
                                        <span className="font-semibold text-white text-sm">{opt.label}</span>
                                        <span className="mt-0.5 text-xs text-zinc-600">{opt.sub}</span>

                                        {selected && (
                                            <motion.div
                                                layoutId="selected-ring"
                                                className="absolute inset-0 rounded-xl ring-1 ring-cyan-400/40"
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
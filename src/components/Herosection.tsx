"use client";

import { motion, Variants } from "framer-motion";

interface HeroSectionProps {
    onStart: () => void;
}

const FADE_UP: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function HeroSection({ onStart }: HeroSectionProps) {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
            {/* Ambient grid background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
                    backgroundSize: "64px 64px",
                }}
            />

            {/* Radial glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
                style={{
                    background: "radial-gradient(circle, #00d4ff 0%, transparent 70%)",
                    filter: "blur(80px)",
                }}
            />

            <div className="relative z-10 max-w-3xl">
                {/* Eyebrow badge */}
                <motion.div
                    custom={0}
                    variants={FADE_UP}
                    initial="hidden"
                    animate="show"
                    className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-widest text-cyan-400 uppercase backdrop-blur-sm"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    AI Stack Intelligence
                </motion.div>

                {/* Headline */}
                <motion.h1
                    custom={1}
                    variants={FADE_UP}
                    initial="hidden"
                    animate="show"
                    className="font-display text-5xl font-semibold leading-[1.08] tracking-tight text-white md:text-7xl"
                >
                    Find your
                    <br />
                    <span
                        className="bg-clip-text text-transparent"
                        style={{
                            backgroundImage: "linear-gradient(90deg, #00d4ff 0%, #a855f7 100%)",
                        }}
                    >
                        perfect AI stack.
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    custom={2}
                    variants={FADE_UP}
                    initial="hidden"
                    animate="show"
                    className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg"
                >
                    Answer 3 questions about your workflow. Get a personalised dashboard
                    of AI tools that eliminates your biggest bottleneck — right now.
                </motion.p>

                {/* CTA */}
                <motion.div
                    custom={3}
                    variants={FADE_UP}
                    initial="hidden"
                    animate="show"
                    className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                >
                    <button
                        onClick={onStart}
                        className="group relative overflow-hidden rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.3)]"
                    >
                        <span className="relative z-10">Build My Stack →</span>
                        <span
                            className="absolute inset-0 z-0 translate-x-[-100%] bg-gradient-to-r from-cyan-400 to-purple-500 transition-transform duration-500 group-hover:translate-x-0"
                            aria-hidden
                        />
                        <span className="absolute inset-0 z-10 rounded-full" />
                    </button>

                    <span className="text-xs text-zinc-600">3 questions · 30 seconds · free</span>
                </motion.div>
            </div>

            {/* Scroll hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] tracking-widest text-zinc-600 uppercase">Scroll</span>
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                        className="h-4 w-px bg-gradient-to-b from-zinc-600 to-transparent"
                    />
                </div>
            </motion.div>
        </section>
    );
}
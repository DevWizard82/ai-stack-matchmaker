"use client";

import { motion } from "framer-motion";
import type { ScoredTool } from "@/lib/matchmaker";

interface ToolCardProps {
    tool: ScoredTool;
    index: number;
}

const CATEGORY_COLORS: Record<string, string> = {
    "ide": "text-amber-400   border-amber-400/20   bg-amber-400/5",
    "ai-assistant": "text-cyan-400    border-cyan-400/20    bg-cyan-400/5",
    "ui-ux": "text-pink-400    border-pink-400/20    bg-pink-400/5",
    "hosting": "text-blue-400    border-blue-400/20    bg-blue-400/5",
    "database": "text-green-400   border-green-400/20   bg-green-400/5",
    "automation": "text-orange-400  border-orange-400/20  bg-orange-400/5",
    "llm-api": "text-violet-400  border-violet-400/20  bg-violet-400/5",
    "no-code": "text-rose-400    border-rose-400/20    bg-rose-400/5",
    "productivity": "text-teal-400    border-teal-400/20    bg-teal-400/5",
};

const CATEGORY_LABELS: Record<string, string> = {
    "ide": "IDE",
    "ai-assistant": "AI Assistant",
    "ui-ux": "UI / UX",
    "hosting": "Hosting",
    "database": "Database",
    "automation": "Automation",
    "llm-api": "LLM API",
    "no-code": "No-Code",
    "productivity": "Productivity",
};

const PRICING_LABELS: Record<string, string> = {
    "free": "Free",
    "freemium": "Freemium",
    "premium": "Premium",
};

export default function ToolCard({ tool, index }: ToolCardProps) {
    const categoryStyle = CATEGORY_COLORS[tool.category] ?? "text-zinc-400 border-zinc-400/20 bg-zinc-400/5";

    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.08,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/3 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/16 hover:bg-white/5 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
        >
            {/* Top row: logo + category badge */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40">
                    <img
                        src={tool.logo_url}
                        alt={tool.name}
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=0D0D0D&color=fff&size=48`;
                        }}
                    />
                </div>

                <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${categoryStyle}`}
                >
                    {CATEGORY_LABELS[tool.category] ?? tool.category}
                </span>
            </div>

            {/* Name + description */}
            <h3 className="mt-4 font-display text-lg font-semibold text-white">{tool.name}</h3>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-zinc-500">{tool.description}</p>

            {/* Match reasons */}
            {tool.matchReasons.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                    {tool.matchReasons.map((reason) => (
                        <li
                            key={reason}
                            className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-zinc-400"
                        >
                            <span className="text-cyan-500">✓</span> {reason}
                        </li>
                    ))}
                </ul>
            )}

            {/* Footer: pricing + CTA */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/6 pt-4">
                <span className="text-xs font-medium text-zinc-600">
                    {PRICING_LABELS[tool.pricing] ?? tool.pricing}
                </span>

                <a
                    href={tool.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn relative overflow-hidden rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                >
                    <span className="relative z-10">{tool.cta_label} →</span>
                    <span
                        className="absolute inset-0 z-0 translate-y-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-transform duration-300 group-hover/btn:translate-y-0"
                        aria-hidden
                    />
                    <span className="absolute inset-0 z-10 rounded-lg" />
                </a>
            </div>

            {/* Subtle hover glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
            />
        </motion.div>
    );
}
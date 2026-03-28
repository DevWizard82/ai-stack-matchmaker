import type { Tool, Role, Bottleneck, Pricing, Category } from "@/types/Tool";
import toolsData from "@/data/tools.json";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface UserAnswers {
    role: Role;
    bottleneck: Bottleneck;
    pricing: Pricing;
}

export interface ScoredTool extends Tool {
    matchScore: number;
    matchReasons: string[];
}

export interface MatchResult {
    tools: ScoredTool[];
    totalCandidates: number;
}

// ─────────────────────────────────────────────
// Scoring weights
// ─────────────────────────────────────────────

const WEIGHTS = {
    ROLE_MATCH: 30,         // Tool explicitly targets the user's role
    BOTTLENECK_MATCH: 50,   // Tool addresses the stated bottleneck (highest weight)
    PRICING_EXACT: 20,      // Tool pricing exactly matches user's budget
    PRICING_FREE_BONUS: 10, // Free tools score bonus when user selects free/freemium
    BASE_SCORE_FACTOR: 0.1, // Tiebreaker: tool.base_score * factor added last
} as const;

// ─────────────────────────────────────────────
// Pricing compatibility
// ─────────────────────────────────────────────

/**
 * A user who wants "freemium" can also see "free" tools.
 * A user who wants "premium" sees everything.
 */
function isPricingCompatible(toolPricing: Pricing, userBudget: Pricing): boolean {
    if (userBudget === "premium") return true;
    if (userBudget === "freemium") return toolPricing === "free" || toolPricing === "freemium";
    return toolPricing === "free";
}

// ─────────────────────────────────────────────
// Score a single tool
// ─────────────────────────────────────────────

function scoreTool(tool: Tool, answers: UserAnswers): ScoredTool {
    let score = 0;
    const reasons: string[] = [];

    // 1. Role match
    if (tool.role_tags.includes(answers.role)) {
        score += WEIGHTS.ROLE_MATCH;
        reasons.push(`Built for ${answers.role} developers`);
    }

    // 2. Bottleneck match
    if (tool.bottleneck_tags.includes(answers.bottleneck)) {
        score += WEIGHTS.BOTTLENECK_MATCH;
        const bottleneckLabels: Record<Bottleneck, string> = {
            "writing-boilerplate": "Eliminates boilerplate code",
            "cloud-deployment": "Streamlines cloud deployment",
            "logic-debugging": "Accelerates debugging & logic",
            "ui-design": "Accelerates UI design",
            "workflow-automation": "Automates your workflow",
        };
        reasons.push(bottleneckLabels[answers.bottleneck]);
    }

    // 3. Pricing match
    if (tool.pricing === answers.pricing) {
        score += WEIGHTS.PRICING_EXACT;
        reasons.push(`Matches your ${answers.pricing} budget`);
    } else if (
        (answers.pricing === "freemium" || answers.pricing === "free") &&
        tool.pricing === "free"
    ) {
        score += WEIGHTS.PRICING_FREE_BONUS;
        reasons.push("Free to start");
    }

    // 4. Base score tiebreaker
    score += tool.base_score * WEIGHTS.BASE_SCORE_FACTOR;

    return { ...tool, matchScore: score, matchReasons: reasons };
}

// ─────────────────────────────────────────────
// Category diversity enforcement
// ─────────────────────────────────────────────

/**
 * From a ranked list of scored tools, pick the top N ensuring each
 * category appears at most `maxPerCategory` times. This prevents
 * a results page showing 4 AI assistants and nothing else.
 */
function diversify(
    ranked: ScoredTool[],
    maxResults: number,
    maxPerCategory: number
): ScoredTool[] {
    const categoryCounts: Partial<Record<Category, number>> = {};
    const selected: ScoredTool[] = [];

    for (const tool of ranked) {
        if (selected.length >= maxResults) break;
        const count = categoryCounts[tool.category] ?? 0;
        if (count < maxPerCategory) {
            selected.push(tool);
            categoryCounts[tool.category] = count + 1;
        }
    }

    // If diversity constraints left us short, fill remaining slots ignoring cap
    if (selected.length < maxResults) {
        for (const tool of ranked) {
            if (selected.length >= maxResults) break;
            if (!selected.find((t) => t.id === tool.id)) {
                selected.push(tool);
            }
        }
    }

    return selected;
}

// ─────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────

export function getMatches(
    answers: UserAnswers,
    maxResults = 6,
    maxPerCategory = 2
): MatchResult {
    const tools = (toolsData as { tools: Tool[] }).tools;

    // Filter out pricing-incompatible tools first
    const compatible = tools.filter((t) => isPricingCompatible(t.pricing, answers.pricing));

    // Score every compatible tool
    const scored = compatible
        .map((t) => scoreTool(t, answers))
        .filter((t) => t.matchScore > 0) // Must have at least one matching signal
        .sort((a, b) => b.matchScore - a.matchScore);

    // Apply category diversity
    const results = diversify(scored, maxResults, maxPerCategory);

    return {
        tools: results,
        totalCandidates: scored.length,
    };
}
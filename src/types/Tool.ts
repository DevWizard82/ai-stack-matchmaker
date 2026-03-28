// ============================================================
// AI Tech Stack Matchmaker — Tool Schema
// ============================================================

export type Role =
    | "frontend"
    | "backend"
    | "fullstack"
    | "data-science";

export type Bottleneck =
    | "writing-boilerplate"
    | "cloud-deployment"
    | "logic-debugging"
    | "ui-design"
    | "workflow-automation";

export type Pricing =
    | "free"
    | "freemium"
    | "premium";

export type Category =
    | "ide"
    | "ai-assistant"
    | "ui-ux"
    | "hosting"
    | "database"
    | "automation"
    | "llm-api"
    | "no-code"
    | "productivity";

export interface Tool {
    /** Unique slug identifier, e.g. "cursor-ide" */
    id: string;

    /** Display name of the tool */
    name: string;

    /** URL to the tool's logo (PNG/SVG, min 64x64, transparent background preferred) */
    logo_url: string;

    /** Primary category for UI grouping */
    category: Category;

    /**
     * Which developer roles this tool is relevant for.
     * Used for first-pass filtering.
     */
    role_tags: Role[];

    /**
     * Which workflow bottlenecks this tool addresses.
     * Used for scoring in the matching algorithm.
     */
    bottleneck_tags: Bottleneck[];

    /** Pricing tier — used for budget filter */
    pricing: Pricing;

    /** 1–2 sentence description shown on the tool card */
    description: string;

    /**
     * Monetised affiliate URL.
     * Falls back to the tool's homepage if no affiliate programme exists.
     */
    affiliate_url: string;

    /**
     * Short CTA label for the primary button on the tool card.
     * e.g. "Deploy on DigitalOcean", "Try Cursor Free"
     */
    cta_label: string;

    /**
     * 0–100 baseline popularity / quality score.
     * Used as a tiebreaker when two tools have identical tag scores.
     */
    base_score: number;
}

/** Shape of the root tools.json file */
export interface ToolsDatabase {
    version: string;
    last_updated: string; // ISO 8601
    tools: Tool[];
}
"""
build_database.py
─────────────────────────────────────────────────────────────────
Phase 4: AI Tech Stack Matchmaker — Automated Data Pipeline
─────────────────────────────────────────────────────────────────
Usage:
    python build_database.py                        # default paths
    python build_database.py --csv my_tools.csv     # custom CSV
    python build_database.py --out ../data/tools.json --merge  # merge mode
"""

import argparse
import json
import random
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

# ══════════════════════════════════════════════════════════════
# 1.  VALID UNION TYPES  (mirrors Tool.ts exactly)
# ══════════════════════════════════════════════════════════════

VALID_ROLES: set[str] = {
    "frontend",
    "backend",
    "fullstack",
    "data-science",
}

VALID_BOTTLENECKS: set[str] = {
    "writing-boilerplate",
    "cloud-deployment",
    "logic-debugging",
    "ui-design",
    "workflow-automation",
}

VALID_PRICING: set[str] = {"free", "freemium", "premium"}

VALID_CATEGORIES: set[str] = {
    "ide",
    "ai-assistant",
    "ui-ux",
    "hosting",
    "database",
    "automation",
    "llm-api",
    "no-code",
    "productivity",
}

# ══════════════════════════════════════════════════════════════
# 2.  AUTO-TAGGING DICTIONARIES
# ══════════════════════════════════════════════════════════════

# Each entry: keyword (lowercase) → list of tags it should trigger
# Format: ("tag_type", "tag_value")

ROLE_KEYWORD_MAP: dict[str, list[str]] = {
    # Frontend signals
    "react":        ["frontend"],
    "vue":          ["frontend"],
    "svelte":       ["frontend"],
    "angular":      ["frontend"],
    "css":          ["frontend"],
    "tailwind":     ["frontend"],
    "html":         ["frontend"],
    "next.js":      ["frontend", "fullstack"],
    "nextjs":       ["frontend", "fullstack"],
    "nuxt":         ["frontend", "fullstack"],
    "remix":        ["frontend", "fullstack"],
    "component":    ["frontend"],
    "ui library":   ["frontend"],
    "design system":["frontend"],
    "landing page": ["frontend"],

    # Backend signals
    "api":          ["backend"],
    "rest":         ["backend"],
    "graphql":      ["backend", "fullstack"],
    "node":         ["backend"],
    "django":       ["backend"],
    "fastapi":      ["backend"],
    "flask":        ["backend"],
    "express":      ["backend"],
    "microservice": ["backend"],
    "server":       ["backend"],
    "serverless":   ["backend", "fullstack"],
    "lambda":       ["backend"],
    "edge function":["backend", "fullstack"],

    # Fullstack signals
    "full-stack":   ["fullstack"],
    "full stack":   ["fullstack"],
    "end-to-end":   ["fullstack"],
    "monorepo":     ["fullstack"],
    "saas":         ["fullstack"],
    "web app":      ["fullstack"],
    "web application": ["fullstack"],

    # Data science signals
    "python":       ["data-science", "backend"],
    "machine learning": ["data-science"],
    "ml":           ["data-science"],
    "deep learning":["data-science"],
    "neural":       ["data-science"],
    "jupyter":      ["data-science"],
    "notebook":     ["data-science"],
    "pandas":       ["data-science"],
    "numpy":        ["data-science"],
    "pytorch":      ["data-science"],
    "tensorflow":   ["data-science"],
    "llm":          ["data-science", "backend"],
    "embedding":    ["data-science"],
    "analytics":    ["data-science"],
    "dataset":      ["data-science"],
    "etl":          ["data-science"],
    "pipeline":     ["data-science", "backend"],
}

BOTTLENECK_KEYWORD_MAP: dict[str, list[str]] = {
    # Writing boilerplate
    "boilerplate":      ["writing-boilerplate"],
    "scaffold":         ["writing-boilerplate"],
    "template":         ["writing-boilerplate"],
    "generate code":    ["writing-boilerplate"],
    "code generation":  ["writing-boilerplate"],
    "autocomplete":     ["writing-boilerplate"],
    "autocompletion":   ["writing-boilerplate"],
    "snippet":          ["writing-boilerplate"],
    "starter":          ["writing-boilerplate"],
    "repetitive":       ["writing-boilerplate"],
    "boilerplate-free": ["writing-boilerplate"],
    "crud":             ["writing-boilerplate"],

    # Cloud deployment
    "deploy":           ["cloud-deployment"],
    "deployment":       ["cloud-deployment"],
    "hosting":          ["cloud-deployment"],
    "infrastructure":   ["cloud-deployment"],
    "cloud":            ["cloud-deployment"],
    "kubernetes":       ["cloud-deployment"],
    "docker":           ["cloud-deployment"],
    "container":        ["cloud-deployment"],
    "ci/cd":            ["cloud-deployment"],
    "devops":           ["cloud-deployment"],
    "managed database": ["cloud-deployment"],
    "droplet":          ["cloud-deployment"],
    "vps":              ["cloud-deployment"],

    # Logic & debugging
    "debug":            ["logic-debugging"],
    "debugging":        ["logic-debugging"],
    "refactor":         ["logic-debugging"],
    "test":             ["logic-debugging"],
    "unit test":        ["logic-debugging"],
    "code review":      ["logic-debugging"],
    "bug":              ["logic-debugging"],
    "error":            ["logic-debugging"],
    "fix":              ["logic-debugging"],
    "explain code":     ["logic-debugging"],
    "code explanation": ["logic-debugging"],
    "pair programmer":  ["logic-debugging", "writing-boilerplate"],

    # UI design
    "ui":               ["ui-design"],
    "ux":               ["ui-design"],
    "design":           ["ui-design"],
    "wireframe":        ["ui-design"],
    "prototype":        ["ui-design"],
    "mockup":           ["ui-design"],
    "figma":            ["ui-design"],
    "pixel-perfect":    ["ui-design"],
    "interface":        ["ui-design"],
    "layout":           ["ui-design"],
    "visual":           ["ui-design"],
    "no-code":          ["ui-design", "writing-boilerplate"],

    # Workflow automation
    "automat":          ["workflow-automation"],   # prefix matches automate/automation
    "workflow":         ["workflow-automation"],
    "integration":      ["workflow-automation"],
    "trigger":          ["workflow-automation"],
    "zapier":           ["workflow-automation"],
    "webhook":          ["workflow-automation"],
    "schedule":         ["workflow-automation"],
    "orchestrat":       ["workflow-automation"],
    "connect":          ["workflow-automation"],
    "sync":             ["workflow-automation"],
    "pipeline":         ["workflow-automation"],
    "no-code":          ["workflow-automation"],
}

# ══════════════════════════════════════════════════════════════
# 3.  FALLBACK CTA LABELS PER CATEGORY
# ══════════════════════════════════════════════════════════════

CATEGORY_CTA: dict[str, str] = {
    "ide":          "Download Free",
    "ai-assistant": "Try for Free",
    "ui-ux":        "Generate UI",
    "hosting":      "Deploy Now",
    "database":     "Start Building",
    "automation":   "Automate Now",
    "llm-api":      "Access API",
    "no-code":      "Build for Free",
    "productivity": "Open App",
}

# ══════════════════════════════════════════════════════════════
# 4.  PRICING NORMALISATION
# ══════════════════════════════════════════════════════════════

PRICING_ALIASES: dict[str, str] = {
    "free":         "free",
    "open source":  "free",
    "oss":          "free",
    "open-source":  "free",
    "freemium":     "freemium",
    "free tier":    "freemium",
    "free/paid":    "freemium",
    "paid":         "premium",
    "premium":      "premium",
    "subscription": "premium",
    "enterprise":   "premium",
}

# ══════════════════════════════════════════════════════════════
# 5.  HELPER FUNCTIONS
# ══════════════════════════════════════════════════════════════

def slugify(name: str) -> str:
    """Convert 'GitHub Copilot' → 'github-copilot'."""
    name = name.lower().strip()
    name = re.sub(r"[^\w\s-]", "", name)   # remove special chars
    name = re.sub(r"[\s_]+", "-", name)     # spaces/underscores → hyphens
    name = re.sub(r"-{2,}", "-", name)      # collapse multiple hyphens
    return name.strip("-")


def normalise_pricing(raw: str) -> str:
    """Map raw CSV pricing string to a valid Pricing union type."""
    clean = str(raw).lower().strip()
    for alias, canonical in PRICING_ALIASES.items():
        if alias in clean:
            return canonical
    # Fallback: if the value is already valid, use it
    if clean in VALID_PRICING:
        return clean
    print(f"  ⚠  Unknown pricing '{raw}' — defaulting to 'freemium'")
    return "freemium"


def normalise_category(raw: str) -> str:
    """Map raw CSV category string to a valid Category union type."""
    clean = str(raw).lower().strip().replace(" ", "-")
    if clean in VALID_CATEGORIES:
        return clean
    # Common aliases
    aliases = {
        "code-editor":    "ide",
        "editor":         "ide",
        "assistant":      "ai-assistant",
        "ai":             "ai-assistant",
        "copilot":        "ai-assistant",
        "ui":             "ui-ux",
        "design":         "ui-ux",
        "cloud":          "hosting",
        "deploy":         "hosting",
        "db":             "database",
        "storage":        "database",
        "no_code":        "no-code",
        "nocode":         "no-code",
        "llm":            "llm-api",
        "model":          "llm-api",
        "api":            "llm-api",
    }
    if clean in aliases:
        return aliases[clean]
    print(f"  ⚠  Unknown category '{raw}' — defaulting to 'ai-assistant'")
    return "ai-assistant"


def extract_tags(description: str, keyword_map: dict[str, list[str]]) -> list[str]:
    """
    Scan description (lowercased) for every keyword in the map.
    Return a deduplicated, sorted list of matched tag values.
    """
    desc = description.lower()
    matched: set[str] = set()
    for keyword, tags in keyword_map.items():
        if keyword in desc:
            matched.update(tags)
    return sorted(matched)


def build_tool_record(row: pd.Series, existing_ids: set[str]) -> dict:
    """Transform a single CSV row into a Tool-schema-compliant dict."""

    # ── Core fields ──────────────────────────────────────────
    name        = str(row.get("Name", "")).strip()
    description = str(row.get("Description", "")).strip()
    logo_url    = str(row.get("Logo_URL", "")).strip()
    affiliate   = str(row.get("Affiliate_URL", "")).strip()

    # ── Slug / ID ────────────────────────────────────────────
    base_id = slugify(name)
    tool_id = base_id
    counter = 2
    while tool_id in existing_ids:          # ensure uniqueness
        tool_id = f"{base_id}-{counter}"
        counter += 1
    existing_ids.add(tool_id)

    # ── Pricing & Category ───────────────────────────────────
    pricing  = normalise_pricing(row.get("Pricing", "freemium"))
    category = normalise_category(row.get("Category", "ai-assistant"))

    # ── Auto-tagging ─────────────────────────────────────────
    role_tags       = extract_tags(description, ROLE_KEYWORD_MAP)
    bottleneck_tags = extract_tags(description, BOTTLENECK_KEYWORD_MAP)

    # Guarantee at least one tag in each list (broad fallback)
    if not role_tags:
        role_tags = ["fullstack"]
    if not bottleneck_tags:
        bottleneck_tags = ["writing-boilerplate"]

    # ── CTA label ────────────────────────────────────────────
    cta_label = CATEGORY_CTA.get(category, "Learn More")

    # ── Base score ───────────────────────────────────────────
    base_score = int(row.get("Base_Score", random.randint(70, 95)))
    base_score = max(0, min(100, base_score))   # clamp to 0-100

    return {
        "id":             tool_id,
        "name":           name,
        "logo_url":       logo_url,
        "category":       category,
        "role_tags":      role_tags,
        "bottleneck_tags":bottleneck_tags,
        "pricing":        pricing,
        "description":    description,
        "affiliate_url":  affiliate,
        "cta_label":      cta_label,
        "base_score":     base_score,
    }


# ══════════════════════════════════════════════════════════════
# 6.  VALIDATION
# ══════════════════════════════════════════════════════════════

def validate_tool(tool: dict, index: int) -> list[str]:
    """Return a list of validation error strings (empty = valid)."""
    errors: list[str] = []
    prefix = f"Row {index} ('{tool.get('name', '?')}')"

    if not tool["id"]:
        errors.append(f"{prefix}: empty id")
    if not tool["name"]:
        errors.append(f"{prefix}: empty name")
    if tool["pricing"] not in VALID_PRICING:
        errors.append(f"{prefix}: invalid pricing '{tool['pricing']}'")
    if tool["category"] not in VALID_CATEGORIES:
        errors.append(f"{prefix}: invalid category '{tool['category']}'")
    for r in tool["role_tags"]:
        if r not in VALID_ROLES:
            errors.append(f"{prefix}: invalid role_tag '{r}'")
    for b in tool["bottleneck_tags"]:
        if b not in VALID_BOTTLENECKS:
            errors.append(f"{prefix}: invalid bottleneck_tag '{b}'")

    return errors


# ══════════════════════════════════════════════════════════════
# 7.  MAIN PIPELINE
# ══════════════════════════════════════════════════════════════

def run(csv_path: Path, output_path: Path, merge: bool, version: str) -> None:
    print(f"\n{'─'*56}")
    print(f"  AI Stack Matchmaker — Data Pipeline")
    print(f"{'─'*56}")
    print(f"  CSV input   : {csv_path}")
    print(f"  JSON output : {output_path}")
    print(f"  Mode        : {'merge (keep existing)' if merge else 'overwrite'}")
    print(f"{'─'*56}\n")

    # ── Read CSV ─────────────────────────────────────────────
    if not csv_path.exists():
        print(f"❌  CSV not found: {csv_path}")
        sys.exit(1)

    df = pd.read_csv(csv_path)
    df.columns = [c.strip() for c in df.columns]   # trim header whitespace
    print(f"✔  Loaded {len(df)} rows from CSV.\n")

    required_cols = {"Name", "Description", "Pricing", "Category", "Affiliate_URL", "Logo_URL"}
    missing = required_cols - set(df.columns)
    if missing:
        print(f"❌  Missing required columns: {missing}")
        sys.exit(1)

    # ── Load existing JSON (merge mode) ──────────────────────
    existing_tools: list[dict] = []
    existing_ids:   set[str]  = set()

    if merge and output_path.exists():
        with open(output_path, "r", encoding="utf-8") as f:
            existing_db = json.load(f)
        existing_tools = existing_db.get("tools", []) or []
        existing_ids   = {t["id"] for t in existing_tools}
        print(f"✔  Loaded {len(existing_tools)} existing tools (merge mode).\n")

    # ── Process rows ─────────────────────────────────────────
    new_tools: list[dict] = []
    all_errors: list[str] = []

    for i, row in df.iterrows():
        tool   = build_tool_record(row, existing_ids)
        errors = validate_tool(tool, i + 2)   # +2 = 1-indexed + header row

        if errors:
            all_errors.extend(errors)
            print(f"  ✗  Skipping row {i+2} due to errors:")
            for e in errors:
                print(f"      • {e}")
            continue

        new_tools.append(tool)
        role_str = ", ".join(tool["role_tags"])
        btn_str  = ", ".join(tool["bottleneck_tags"])
        print(f"  ✔  [{tool['id']}]")
        print(f"      roles      : {role_str}")
        print(f"      bottlenecks: {btn_str}")
        print(f"      pricing    : {tool['pricing']}  |  category: {tool['category']}")
        print()

    # ── Assemble final database ───────────────────────────────
    all_tools = [*existing_tools, *new_tools]

    database = {
        "version":      version,
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "tools":        all_tools,
    }

    # ── Write output ──────────────────────────────────────────
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(database, f, indent=2, ensure_ascii=False)

    # ── Summary ───────────────────────────────────────────────
    print(f"{'─'*56}")
    print(f"  ✅  Done!")
    print(f"      New tools added   : {len(new_tools)}")
    print(f"      Existing (kept)   : {len(existing_tools)}")
    print(f"      Total in database : {len(all_tools)}")
    if all_errors:
        print(f"      Rows skipped      : {len(all_errors)} (see above)")
    print(f"      Output written to : {output_path}")
    print(f"{'─'*56}\n")


# ══════════════════════════════════════════════════════════════
# 8.  CLI ENTRY POINT
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="AI Stack Matchmaker — CSV → tools.json pipeline"
    )
    parser.add_argument(
        "--csv",
        type=Path,
        default=Path("raw_tools.csv"),
        help="Path to the input CSV file (default: raw_tools.csv)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("src/data/tools.json"),
        help="Path to the output JSON file (default: src/data/tools.json)",
    )
    parser.add_argument(
        "--merge",
        action="store_true",
        help="Merge new tools into existing JSON instead of overwriting",
    )
    parser.add_argument(
        "--version",
        type=str,
        default="1.1.0",
        help="Database version string written to the JSON root (default: 1.1.0)",
    )

    args = parser.parse_args()
    run(
        csv_path    = args.csv,
        output_path = args.out,
        merge       = args.merge,
        version     = args.version,
    )
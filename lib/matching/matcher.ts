import Fuse from "fuse.js";
import {
  THRESHOLD_MATCHED,
  THRESHOLD_REVIEW,
  MAX_SUGGESTIONS,
  FUSE_OPTIONS,
} from "./constants";

export interface CatalogProduct {
  id: string;
  name: string;
  aliases: string; // JSON string
  unit: string;
  pricePerUnit: number;
  category: string;
  sku: string;
}

export type MatchStatus = "matched" | "needs_review" | "not_found";

export interface MatchResult {
  status: MatchStatus;
  product: CatalogProduct | null;
  score: number; // 0–1, higher = better (inverted from Fuse)
  suggestions: CatalogProduct[]; // top-3 for review/not_found
  reason: string | null; // human-readable reason for flagging
}

interface FuseItem {
  id: string;
  name: string;
  aliasesArray: string[];
  unit: string;
  pricePerUnit: number;
  category: string;
  sku: string;
  _original: CatalogProduct;
}

let fuseInstance: Fuse<FuseItem> | null = null;
let catalogCache: CatalogProduct[] = [];

function buildFuseItems(products: CatalogProduct[]): FuseItem[] {
  return products.map((p) => {
    let aliasesArray: string[] = [];
    try {
      aliasesArray = JSON.parse(p.aliases) as string[];
    } catch {
      aliasesArray = [];
    }
    return {
      id: p.id,
      name: p.name,
      aliasesArray,
      unit: p.unit,
      pricePerUnit: p.pricePerUnit,
      category: p.category,
      sku: p.sku,
      _original: p,
    };
  });
}

/**
 * Initialise or update the Fuse.js index with the given catalog.
 * Call this once at startup or when the catalog changes.
 */
export function initialiseMatcher(products: CatalogProduct[]): void {
  catalogCache = products;
  fuseInstance = new Fuse(buildFuseItems(products), FUSE_OPTIONS);
}

/**
 * Match a raw text string against the catalog.
 * Returns matched/needs_review/not_found with score, product, and suggestions.
 */
export function matchProduct(rawText: string): MatchResult {
  if (!fuseInstance || catalogCache.length === 0) {
    return {
      status: "not_found",
      product: null,
      score: 0,
      suggestions: [],
      reason: "Catalog not loaded",
    };
  }

  const query = rawText.trim().toLowerCase();
  if (!query) {
    return {
      status: "not_found",
      product: null,
      score: 0,
      suggestions: [],
      reason: "Empty search text",
    };
  }

  const results = fuseInstance.search(query);

  if (results.length === 0) {
    return {
      status: "not_found",
      product: null,
      score: 0,
      suggestions: [],
      reason: "No products found in catalog",
    };
  }

  // Fuse score: 0 = perfect, 1 = no match → invert for our threshold
  const topResult = results[0];
  const fuseScore = topResult.score ?? 1;
  const matchScore = 1 - fuseScore;

  const topSuggestions = results
    .slice(0, MAX_SUGGESTIONS)
    .map((r) => r.item._original);

  if (matchScore >= THRESHOLD_MATCHED) {
    return {
      status: "matched",
      product: topResult.item._original,
      score: matchScore,
      suggestions: topSuggestions,
      reason: null,
    };
  }

  if (matchScore >= THRESHOLD_REVIEW) {
    const reason = buildReviewReason(query, topResult.item, matchScore);
    return {
      status: "needs_review",
      product: topResult.item._original,
      score: matchScore,
      suggestions: topSuggestions,
      reason,
    };
  }

  return {
    status: "not_found",
    product: null,
    score: matchScore,
    suggestions: topSuggestions,
    reason: `"${rawText}" did not match any product well enough (score ${matchScore.toFixed(2)})`,
  };
}

function buildReviewReason(
  query: string,
  item: FuseItem,
  score: number
): string {
  const name = item.name.toLowerCase();
  if (levenshteinDistance(query, name) <= 2) {
    return `Possible typo — did you mean "${item.name}"? (score ${score.toFixed(2)})`;
  }
  return `Low confidence match for "${item.name}" (score ${score.toFixed(2)}) — please confirm`;
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

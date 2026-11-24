// Matching threshold constants
// IMPORTANT: Fuse.js returns score where 0 = perfect match, 1 = no match.
// We invert: matchScore = 1 - fuseScore, so our thresholds are intuitive (higher = better).

/** Lines with matchScore >= this are "matched" and shown with a green indicator */
export const THRESHOLD_MATCHED = 0.85;

/** Lines with matchScore >= this but < THRESHOLD_MATCHED are "needs_review" with top-3 suggestions */
export const THRESHOLD_REVIEW = 0.5;

/** Lines with matchScore < THRESHOLD_REVIEW are "not_found" and require manual product selection */
// (implicit: everything below THRESHOLD_REVIEW)

export const MAX_SUGGESTIONS = 3;

export const FUSE_OPTIONS = {
  includeScore: true,
  threshold: 1, // We handle thresholding ourselves using the constants above
  keys: [
    { name: "name", weight: 0.6 },
    { name: "aliasesArray", weight: 0.4 },
  ],
  minMatchCharLength: 2,
  distance: 100,
  ignoreLocation: true,
};

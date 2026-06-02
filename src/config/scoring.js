// All scoring weights live here so they are easy to tune in one place.
// See build brief Section 6.

/** @typedef {"group-1"|"group-2"|"group-3"|"round-32"|"round-16"|"quarter"|"semi"|"third"|"final"} Stage */

/** @type {Record<Stage, number>} */
export const STAGE_WEIGHT = {
  "group-1": 8,
  "group-2": 10,
  "group-3": 18, // matchday 3 = win-or-go-home deciders
  "round-32": 22,
  "round-16": 30,
  "quarter": 38,
  "semi": 46,
  "third": 18,
  "final": 55,
};

/** Human-readable labels for each stage. */
export const STAGE_LABEL = {
  "group-1": "Group · Matchday 1",
  "group-2": "Group · Matchday 2",
  "group-3": "Group · Matchday 3",
  "round-32": "Round of 32",
  "round-16": "Round of 16",
  "quarter": "Quarter-final",
  "semi": "Semi-final",
  "third": "Third-place play-off",
  "final": "Final",
};

// Points added to importance for various factors.
export const FAVORITE_BONUS = 45;
export const MARQUEE_BONUS = 10;

/** @type {Record<1|2|3|4, number>} */
export const TIER_SCORE = { 1: 20, 2: 12, 3: 6, 4: 2 };

// Importance buckets -> label used in the verdict matrix.
export const IMPORTANCE_BUCKETS = [
  { min: 70, key: "MustWatch" },
  { min: 50, key: "WorthIt" },
  { min: 30, key: "Optional" },
  { min: 0, key: "Skip" },
];

// Verdict matrix: [importanceBucket][sleepCostBand] -> verdict.
// Sleep bands: "low" = cost 1-2, "mid" = cost 3, "high" = cost 4-5.
export const VERDICT_MATRIX = {
  MustWatch: { low: "WATCH LIVE", mid: "WATCH LIVE", high: "WORTH THE PAIN" },
  WorthIt: { low: "WATCH LIVE", mid: "YOUR CALL", high: "CATCH HIGHLIGHTS" },
  Optional: { low: "WATCH IF UP", mid: "CATCH HIGHLIGHTS", high: "SKIP" },
  Skip: { low: "CATCH HIGHLIGHTS", mid: "SKIP", high: "SKIP" },
};

// Visual treatment per verdict (Tailwind classes + emoji).
export const VERDICT_STYLE = {
  "WATCH LIVE": { badge: "bg-emerald-500 text-emerald-950", emoji: "🔥" },
  "WORTH THE PAIN": { badge: "bg-amber-400 text-amber-950", emoji: "💪" },
  "YOUR CALL": { badge: "bg-sky-400 text-sky-950", emoji: "🤔" },
  "WATCH IF UP": { badge: "bg-indigo-400 text-indigo-950", emoji: "👀" },
  "CATCH HIGHLIGHTS": { badge: "bg-slate-400 text-slate-950", emoji: "📺" },
  "SKIP": { badge: "bg-slate-700 text-slate-300", emoji: "😴" },
};

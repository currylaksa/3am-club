// Team strength tiers -> feed teamTierScore in the importance calc.
//
// ⚠️ ADJUST ME: This is a SEED derived from world-ranking buckets as a
// starting point, NOT gospel. Buckets:
//   Tier 1 = roughly the top ~6 ranked sides
//   Tier 2 = the next ~12
//   Tier 3 = solid qualifiers
//   Tier 4 = debutants / lowest-ranked
// Any team NOT listed here falls back to DEFAULT_TIER (3), so the app still
// scores sensibly for teams you haven't classified. Re-bucket freely — these
// numbers only nudge importance, they don't dominate it.

import { TIER_SCORE } from "./scoring.js";

export const DEFAULT_TIER = 3;

/** @type {Record<string, 1|2|3|4>} */
export const TEAM_TIER = {
  // Tier 1 — perennial favourites
  Argentina: 1,
  France: 1,
  Spain: 1,
  England: 1,
  Brazil: 1,
  Portugal: 1,

  // Tier 2 — strong contenders
  Netherlands: 2,
  Belgium: 2,
  Germany: 2,
  Croatia: 2,
  Italy: 2,
  Uruguay: 2,
  Colombia: 2,
  Morocco: 2,
  Japan: 2,
  "United States": 2,
  Mexico: 2,
  Switzerland: 2,
  Senegal: 2,
  Denmark: 2,

  // Tier 3 — solid qualifiers
  Ecuador: 3,
  Austria: 3,
  Australia: 3,
  "South Korea": 3,
  Canada: 3,
  Norway: 3,
  Poland: 3,
  Serbia: 3,
  Ukraine: 3,
  Turkey: 3,
  Egypt: 3,
  Nigeria: 3,
  "Ivory Coast": 3,
  Iran: 3,
  "Saudi Arabia": 3,
  Tunisia: 3,
  Algeria: 3,
  Paraguay: 3,
  Scotland: 3,
  Panama: 3,

  // Tier 4 — debutants / lowest-ranked qualifiers
  "New Zealand": 4,
  "South Africa": 4,
  "Cape Verde": 4,
  Jordan: 4,
  Uzbekistan: 4,
  Curacao: 4,
  Haiti: 4,
};

/** @param {string} team @returns {number} 0-20 */
export function teamTierScore(team) {
  const tier = TEAM_TIER[team] ?? DEFAULT_TIER;
  return TIER_SCORE[tier];
}

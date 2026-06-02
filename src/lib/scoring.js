// The scoring engine. Computes two independent numbers per fixture
// (importance 0-100 and sleep cost 1-5), then combines them into a verdict.
// See build brief Section 6. All weights come from src/config.

import {
  STAGE_WEIGHT,
  STAGE_LABEL,
  FAVORITE_BONUS,
  MARQUEE_BONUS,
  IMPORTANCE_BUCKETS,
  VERDICT_MATRIX,
} from "../config/scoring.js";
import { teamTierScore } from "../config/teamTiers.js";
import { isMarqueeOrRivalry } from "../config/rivalries.js";
import { mytParts } from "./time.js";

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/**
 * Match importance, 0-100.
 * @param {import("../config/scoring.js").Stage} stage
 * @param {string} home
 * @param {string} away
 * @param {string[]} favorites
 */
export function importance(stage, home, away, favorites) {
  let score = 0;
  const fav = favorites.includes(home) || favorites.includes(away);
  if (fav) score += FAVORITE_BONUS;
  score += STAGE_WEIGHT[stage];
  score += (teamTierScore(home) + teamTierScore(away)) / 2; // 0-20
  if (isMarqueeOrRivalry(home, away)) score += MARQUEE_BONUS;
  return clamp(Math.round(score), 0, 100);
}

/**
 * Sleep cost, 1-5, from the MYT kickoff hour.
 * @param {number} mytHour 0-23
 * @returns {1|2|3|4|5}
 */
export function sleepCost(mytHour) {
  if (mytHour >= 18 && mytHour < 23) return 1; // evening — easy
  if (mytHour === 23 || mytHour === 0) return 2; // late but doable
  if (mytHour === 1 || mytHour === 2) return 4; // deep into the night
  if (mytHour >= 3 && mytHour < 6) return 5; // pre-dawn — brutal
  if (mytHour >= 6 && mytHour < 9) return 3; // early wake
  return 1; // daytime
}

/** Importance number -> bucket key. */
export function importanceBucket(score) {
  return IMPORTANCE_BUCKETS.find((b) => score >= b.min).key;
}

/** Sleep cost 1-5 -> matrix band. */
function sleepBand(cost) {
  if (cost <= 2) return "low";
  if (cost === 3) return "mid";
  return "high";
}

/**
 * Full verdict for a fixture, plus the pieces and a plain-language reason.
 * @param {import("./fixtures.js").Fixture} fixture
 * @param {string[]} favorites
 */
export function scoreFixture(fixture, favorites) {
  const { hour } = mytParts(fixture.kickoffUtc);
  const imp = importance(fixture.stage, fixture.homeTeam, fixture.awayTeam, favorites);
  const cost = sleepCost(hour);
  const bucket = importanceBucket(imp);
  const verdict = VERDICT_MATRIX[bucket][sleepBand(cost)];
  return {
    importance: imp,
    sleepCost: cost,
    bucket,
    verdict,
    reason: buildReason(fixture, favorites, imp, cost, hour),
  };
}

const COST_WORDS = {
  1: "an easy evening watch",
  2: "a late but doable kickoff",
  3: "an early-morning wake-up",
  4: "deep into the night",
  5: "a brutal pre-dawn slot",
};

/** Plain-language "why" shown on the match card / detail. */
function buildReason(fixture, favorites, imp, cost, hour) {
  const bits = [];
  const favTeam =
    (favorites.includes(fixture.homeTeam) && fixture.homeTeam) ||
    (favorites.includes(fixture.awayTeam) && fixture.awayTeam);
  if (favTeam) bits.push(`Your team (${favTeam})`);
  bits.push(STAGE_LABEL[fixture.stage]);
  if (isMarqueeOrRivalry(fixture.homeTeam, fixture.awayTeam)) bits.push("a classic rivalry");

  const hh = String(hour).padStart(2, "0");
  const importancePart = bits.join(" + ");
  return `${importancePart}, but kicks off around ${hh}:00 MYT — ${COST_WORDS[cost]}.`;
}

// Marquee match-ups / classic rivalries -> +MARQUEE_BONUS to importance.
// Editable list of unordered country pairs. Order does not matter; the lookup
// normalises both directions.

/** @type {[string, string][]} */
export const MARQUEE_PAIRS = [
  ["Argentina", "Brazil"],
  ["Brazil", "Argentina"],
  ["Germany", "Netherlands"],
  ["England", "Argentina"],
  ["Spain", "Portugal"],
  ["France", "Germany"],
  ["England", "Germany"],
  ["Brazil", "France"],
  ["Argentina", "Germany"],
  ["Mexico", "United States"],
  ["Netherlands", "Belgium"],
  ["Spain", "Italy"],
  ["Uruguay", "Argentina"],
  ["Portugal", "France"],
  ["Croatia", "Serbia"],
  ["Japan", "South Korea"],
];

const key = (a, b) => [a, b].sort().join("|");
const SET = new Set(MARQUEE_PAIRS.map(([a, b]) => key(a, b)));

/** @param {string} home @param {string} away @returns {boolean} */
export function isMarqueeOrRivalry(home, away) {
  return SET.has(key(home, away));
}

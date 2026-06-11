import raw from "../data/fixtures.json";
import { scoreFixture } from "./scoring.js";
import { matchNightKey, nightLabel } from "./time.js";

/** @typedef {{id:string,kickoffUtc:string,stage:string,groupName?:string,homeTeam:string,awayTeam:string,venue:string|null,city:string|null}} Fixture */
/** @typedef {{status:string,minute:number|null,homeGoals:number|null,awayGoals:number|null}} Live */

/** Baked fixtures, chronological — the offline fallback + first paint. */
export const FIXTURES = [...raw].sort((a, b) =>
  a.kickoffUtc.localeCompare(b.kickoffUtc)
);

/** Overlay the live `/api/fixtures` list onto the baked list by id (fills knockout teams). */
export function mergeFixtures(base, remote) {
  const byId = new Map(remote.map((f) => [f.id, f]));
  return base.map((f) => byId.get(f.id) ?? f);
}

/** Attach scoring, night key, and any live score to a fixture. */
export function decorate(fixture, favorites, liveById = {}) {
  return {
    ...fixture,
    nightKey: matchNightKey(fixture.kickoffUtc),
    score: scoreFixture(fixture, favorites),
    isFavorite:
      favorites.includes(fixture.homeTeam) || favorites.includes(fixture.awayTeam),
    live: liveById[fixture.id] || null,
  };
}

/**
 * Decorate all fixtures and group them by match-night.
 * @param {Fixture[]} fixtures
 * @param {string[]} favorites
 * @param {"time"|"importance"} sort
 * @param {Record<string,Live>} liveById
 */
export function nightsView(fixtures, favorites, sort = "time", liveById = {}) {
  const decorated = fixtures.map((f) => decorate(f, favorites, liveById));
  const byNight = new Map();
  for (const f of decorated) {
    if (!byNight.has(f.nightKey)) byNight.set(f.nightKey, []);
    byNight.get(f.nightKey).push(f);
  }
  const nights = [...byNight.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, fixtures]) => {
      fixtures.sort((a, b) => {
        if (sort === "importance") {
          // favourites first, then importance, then kickoff
          if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
          if (b.score.importance !== a.score.importance)
            return b.score.importance - a.score.importance;
        }
        return a.kickoffUtc.localeCompare(b.kickoffUtc);
      });
      return { key, label: nightLabel(key), fixtures };
    });
  return nights;
}

/** Every fixture a favourited team appears in, chronological — for My Plan. */
export function fixturesForTeams(fixtures, teams, favorites, liveById = {}) {
  return fixtures
    .filter((f) => teams.includes(f.homeTeam) || teams.includes(f.awayTeam))
    .map((f) => decorate(f, favorites, liveById));
}

export function findFixture(fixtures, id) {
  return fixtures.find((f) => f.id === id);
}

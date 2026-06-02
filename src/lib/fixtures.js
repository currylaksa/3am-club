import raw from "../data/fixtures.json";
import { scoreFixture } from "./scoring.js";
import { matchNightKey, nightLabel } from "./time.js";

/** @typedef {{id:string,kickoffUtc:string,stage:string,groupName?:string,homeTeam:string,awayTeam:string,venue:string,city:string}} Fixture */

/** All fixtures, chronological. */
export const FIXTURES = [...raw].sort((a, b) =>
  a.kickoffUtc.localeCompare(b.kickoffUtc)
);

/** Attach scoring + night key to a fixture for the current favorites. */
export function decorate(fixture, favorites) {
  return {
    ...fixture,
    nightKey: matchNightKey(fixture.kickoffUtc),
    score: scoreFixture(fixture, favorites),
    isFavorite:
      favorites.includes(fixture.homeTeam) || favorites.includes(fixture.awayTeam),
  };
}

/**
 * Decorate all fixtures and group them by match-night.
 * @param {string[]} favorites
 * @param {"time"|"importance"} sort
 * @returns {{ key:string, label:string, fixtures:any[] }[]}
 */
export function nightsView(favorites, sort = "time") {
  const decorated = FIXTURES.map((f) => decorate(f, favorites));
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
export function fixturesForTeams(teams, favorites) {
  return FIXTURES.filter(
    (f) => teams.includes(f.homeTeam) || teams.includes(f.awayTeam)
  ).map((f) => decorate(f, favorites));
}

export function findFixture(id) {
  return FIXTURES.find((f) => f.id === id);
}

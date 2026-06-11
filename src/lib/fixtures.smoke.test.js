import { describe, it, expect } from "vitest";
import { nightsView, fixturesForTeams, mergeFixtures, FIXTURES } from "./fixtures.js";
import { mytTime } from "./time.js";

describe("smoke: full fixture dataset scores cleanly", () => {
  it("decorates all 104 fixtures across match-nights without error", () => {
    expect(FIXTURES.length).toBe(104);
    const nights = nightsView(FIXTURES, ["Brazil", "England"], "time");
    const all = nights.flatMap((n) => n.fixtures);
    expect(all.length).toBe(104);
    for (const f of all) {
      expect(f.score.verdict).toBeTruthy();
      expect(f.score.sleepCost).toBeGreaterThanOrEqual(1);
      expect(f.score.sleepCost).toBeLessThanOrEqual(5);
      expect(mytTime(f.kickoffUtc)).toMatch(/^\d{2}:\d{2}$/);
    }
    // Favourited teams should be flagged.
    expect(all.some((f) => f.isFavorite)).toBe(true);
  });
});

describe("mergeFixtures overlays remote schedule by id", () => {
  it("fills a TBD knockout slot from the remote list, keeps the rest", () => {
    const ko = FIXTURES.find((f) => f.homeTeam === "TBD");
    const remote = [{ ...ko, homeTeam: "Brazil", awayTeam: "France" }];
    const merged = mergeFixtures(FIXTURES, remote);
    expect(merged.length).toBe(FIXTURES.length);
    const updated = merged.find((f) => f.id === ko.id);
    expect(updated.homeTeam).toBe("Brazil");
    expect(updated.awayTeam).toBe("France");
  });
});

describe("live scores attach to fixtures by id", () => {
  it("decorates a fixture with its live payload", () => {
    const f = FIXTURES[0];
    const live = { [f.id]: { status: "IN_PLAY", minute: 67, homeGoals: 2, awayGoals: 1 } };
    const matches = fixturesForTeams(FIXTURES, [f.homeTeam], [f.homeTeam], live);
    const target = matches.find((m) => m.id === f.id);
    expect(target.live).toEqual(live[f.id]);
    // a fixture with no live entry stays null
    expect(matches.some((m) => m.live === null) || matches.length === 1).toBe(true);
  });
});

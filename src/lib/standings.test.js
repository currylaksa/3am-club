import { describe, it, expect } from "vitest";
import { computeStandings } from "./standings.js";

// Two finished Group A matches: Mexico beat South Africa 2-0,
// South Korea beat Czechia 2-1. Mirrors the live screenshot.
const fixtures = [
  { id: "1", stage: "group-1", groupName: "A", homeTeam: "Mexico", awayTeam: "South Africa", kickoffUtc: "2026-06-11T19:00:00Z" },
  { id: "2", stage: "group-1", groupName: "A", homeTeam: "South Korea", awayTeam: "Czechia", kickoffUtc: "2026-06-12T02:00:00Z" },
  { id: "3", stage: "group-1", groupName: "B", homeTeam: "Canada", awayTeam: "Qatar", kickoffUtc: "2026-06-12T19:00:00Z" },
];
const liveById = {
  1: { status: "FINISHED", homeGoals: 2, awayGoals: 0 },
  2: { status: "FINISHED", homeGoals: 2, awayGoals: 1 },
  // match 3 not played yet
};

describe("computeStandings", () => {
  const table = computeStandings(fixtures, liveById);

  it("ranks winners on top with 3 points each", () => {
    const a = table.A;
    expect(a.map((r) => r.team)).toEqual(["Mexico", "South Korea", "Czechia", "South Africa"]);
    expect(a[0]).toMatchObject({ rank: 1, mp: 1, w: 1, gf: 2, ga: 0, gd: 2, pts: 3, form: ["W"] });
    expect(a[1]).toMatchObject({ team: "South Korea", pts: 3, gd: 1 });
    expect(a[3]).toMatchObject({ team: "South Africa", l: 1, pts: 0, gd: -2, form: ["L"] });
  });

  it("counts unplayed matches as zeroes", () => {
    expect(table.B.every((r) => r.mp === 0 && r.pts === 0)).toBe(true);
    expect(table.B).toHaveLength(2);
  });

  it("ignores knockout fixtures", () => {
    const withKo = [...fixtures, { id: "9", stage: "round-32", homeTeam: "TBD", awayTeam: "TBD", kickoffUtc: "2026-06-28T19:00:00Z" }];
    expect(Object.keys(computeStandings(withKo, liveById))).toEqual(["A", "B"]);
  });
});

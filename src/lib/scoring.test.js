import { describe, it, expect } from "vitest";
import { importance, sleepCost, importanceBucket, scoreFixture } from "./scoring.js";

describe("sleepCost bands", () => {
  it("evening is easy", () => expect(sleepCost(20)).toBe(1));
  it("midnight is doable", () => {
    expect(sleepCost(23)).toBe(2);
    expect(sleepCost(0)).toBe(2);
  });
  it("1-2 AM is deep night", () => expect(sleepCost(2)).toBe(4));
  it("3-5 AM is brutal", () => {
    expect(sleepCost(3)).toBe(5);
    expect(sleepCost(5)).toBe(5);
  });
  it("6-8 AM is an early wake", () => expect(sleepCost(7)).toBe(3));
  it("daytime is easy", () => expect(sleepCost(14)).toBe(1));
});

describe("importance", () => {
  it("favoriting a team adds a big bump", () => {
    const without = importance("group-1", "Brazil", "Curacao", []);
    const withFav = importance("group-1", "Brazil", "Curacao", ["Brazil"]);
    expect(withFav - without).toBe(45);
  });

  it("the final between two giants is near-max", () => {
    const score = importance("final", "Argentina", "Brazil", []);
    // 55 (final) + 20 (tier avg) + 10 (rivalry) = 85
    expect(score).toBe(85);
  });

  it("clamps at 100", () => {
    const score = importance("final", "Argentina", "Brazil", ["Argentina"]);
    expect(score).toBe(100);
  });
});

describe("importanceBucket boundaries", () => {
  it("70 is MustWatch", () => expect(importanceBucket(70)).toBe("MustWatch"));
  it("69 is WorthIt", () => expect(importanceBucket(69)).toBe("WorthIt"));
  it("30 is Optional", () => expect(importanceBucket(30)).toBe("Optional"));
  it("29 is Skip", () => expect(importanceBucket(29)).toBe("Skip"));
});

describe("verdict matrix via scoreFixture", () => {
  it("favorite team, Round of 16, pre-dawn -> WORTH THE PAIN", () => {
    const fixture = {
      kickoffUtc: "2026-06-14T21:00:00Z", // 05:00 MYT, cost 5
      stage: "round-16",
      homeTeam: "Spain",
      awayTeam: "Morocco",
    };
    const r = scoreFixture(fixture, ["Spain"]);
    expect(r.sleepCost).toBe(5);
    expect(r.bucket).toBe("MustWatch");
    expect(r.verdict).toBe("WORTH THE PAIN");
  });

  it("two minnows, group matchday 1, pre-dawn -> SKIP", () => {
    const fixture = {
      kickoffUtc: "2026-06-14T21:00:00Z", // cost 5
      stage: "group-1",
      homeTeam: "Curacao",
      awayTeam: "Haiti",
    };
    const r = scoreFixture(fixture, []);
    expect(r.bucket).toBe("Skip");
    expect(r.verdict).toBe("SKIP");
  });

  it("favorited rivalry in the evening -> WATCH LIVE", () => {
    const fixture = {
      kickoffUtc: "2026-06-14T12:00:00Z", // 20:00 MYT, cost 1
      stage: "group-3",
      homeTeam: "Argentina",
      awayTeam: "Brazil",
    };
    const r = scoreFixture(fixture, ["Argentina"]);
    expect(r.sleepCost).toBe(1);
    expect(r.bucket).toBe("MustWatch");
    expect(r.verdict).toBe("WATCH LIVE");
  });

  it("unfavorited rivalry mid-table lands as WATCH IF UP", () => {
    const fixture = {
      kickoffUtc: "2026-06-14T12:00:00Z", // cost 1
      stage: "group-3",
      homeTeam: "Argentina",
      awayTeam: "Brazil",
    };
    const r = scoreFixture(fixture, []); // 48 -> Optional
    expect(r.verdict).toBe("WATCH IF UP");
  });
});

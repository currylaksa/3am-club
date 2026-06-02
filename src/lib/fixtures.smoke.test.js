import { describe, it, expect } from "vitest";
import { nightsView, FIXTURES } from "./fixtures.js";
import { mytTime } from "./time.js";

describe("smoke: full fixture dataset scores cleanly", () => {
  it("decorates all 104 fixtures across match-nights without error", () => {
    expect(FIXTURES.length).toBe(104);
    const nights = nightsView(["Brazil", "England"], "time");
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

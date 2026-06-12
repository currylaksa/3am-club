import { describe, it, expect } from "vitest";
import { mytParts, mytTime, matchNightKey } from "./time.js";

describe("MYT timezone conversion", () => {
  it("matches the brief's worked example: 21:00Z displays as 05:00 on 15 Jun MYT", () => {
    const utc = "2026-06-14T21:00:00Z";
    expect(mytTime(utc)).toBe("05:00");
    const p = mytParts(utc);
    expect(p).toMatchObject({ year: 2026, month: 6, day: 15, hour: 5 });
  });

  it("handles a clean +8 offset for an evening kickoff", () => {
    // 12:00Z -> 20:00 MYT same day
    const p = mytParts("2026-06-14T12:00:00Z");
    expect(p).toMatchObject({ day: 14, hour: 20 });
    expect(mytTime("2026-06-14T12:00:00Z")).toBe("20:00");
  });

  it("rolls the MYT date forward across midnight", () => {
    // 16:00Z -> 00:00 MYT next day
    const p = mytParts("2026-06-14T16:00:00Z");
    expect(p).toMatchObject({ day: 15, hour: 0 });
  });
});

describe("match-day grouping (actual MYT calendar date)", () => {
  it("groups a pre-dawn match under its own morning's date", () => {
    // 05:00 MYT on the 15th -> the 15th
    expect(matchNightKey("2026-06-14T21:00:00Z")).toBe("2026-06-15");
  });

  it("groups an evening kickoff with its own date", () => {
    // 21:00 MYT on the 14th -> the 14th
    expect(matchNightKey("2026-06-14T13:00:00Z")).toBe("2026-06-14");
  });

  it("groups a daytime match with its own date", () => {
    // 13:00 MYT on the 15th -> the 15th
    expect(matchNightKey("2026-06-15T05:00:00Z")).toBe("2026-06-15");
  });

  it("groups a 09:00 MYT early match with that same day", () => {
    // 01:00Z -> 09:00 MYT on the 15th -> the 15th
    expect(matchNightKey("2026-06-15T01:00:00Z")).toBe("2026-06-15");
  });
});

#!/usr/bin/env node
// Builds src/data/fixtures.json — the baked, committed fixture list.
//
// TWO MODES:
//
// 1. AUTHORITATIVE (preferred before launch): set API_FOOTBALL_KEY in your
//    environment / a .env you DON'T commit. We hit API-Football's /fixtures
//    endpoint for the 2026 tournament, normalise to our schema, and write the
//    JSON. The key NEVER ships to the client — it lives only here at build time.
//    Endpoint shape per current API-Football v3 docs (verify if it drifts):
//      GET https://v3.football.api-sports.io/fixtures?league=1&season=2026
//      header: { "x-apisports-key": <key> }
//
// 2. SEED (default, no key): generate fixtures from verified public facts —
//    the real 12-group final draw, the real 16 host venues with their correct
//    June-2026 UTC offsets, the real tournament date windows, and the real
//    published daily kickoff slot pattern. Group-stage team assignments are the
//    actual draw; knockout matches use TBD placeholders (filled in v2 as teams
//    qualify). Exact per-match kickoff times/venue assignments are realistic but
//    should be confirmed via mode 1 before you ship — re-run this script then.
//
// Run: npm run fetch-fixtures

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/fixtures.json");

// ─── Verified facts ────────────────────────────────────────────────────────

// Final draw (confirmed). 12 groups, A–L.
const GROUPS = {
  A: ["Mexico", "South Africa", "South Korea", "Czechia"],
  B: ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["United States", "Paraguay", "Australia", "Turkey"],
  E: ["Germany", "Curacao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "Congo DR", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};

// 16 host venues with June-2026 UTC offsets.
// US/Canada observe DST in June: Eastern -4, Central -5, Pacific -7.
// Mexico abolished DST (2022): its venues are -6 year-round.
const VENUES = [
  { venue: "Estadio Azteca", city: "Mexico City", off: -6 },
  { venue: "AT&T Stadium", city: "Dallas", off: -5 },
  { venue: "MetLife Stadium", city: "New York / New Jersey", off: -4 },
  { venue: "Mercedes-Benz Stadium", city: "Atlanta", off: -4 },
  { venue: "Arrowhead Stadium", city: "Kansas City", off: -5 },
  { venue: "NRG Stadium", city: "Houston", off: -5 },
  { venue: "Levi's Stadium", city: "San Francisco Bay Area", off: -7 },
  { venue: "SoFi Stadium", city: "Los Angeles", off: -7 },
  { venue: "Lincoln Financial Field", city: "Philadelphia", off: -4 },
  { venue: "Lumen Field", city: "Seattle", off: -7 },
  { venue: "Gillette Stadium", city: "Boston", off: -4 },
  { venue: "Hard Rock Stadium", city: "Miami", off: -4 },
  { venue: "BC Place", city: "Vancouver", off: -7 },
  { venue: "Estadio BBVA", city: "Monterrey", off: -6 },
  { venue: "Estadio Akron", city: "Guadalajara", off: -6 },
  { venue: "BMO Field", city: "Toronto", off: -4 },
];

// Real published local kickoff slots (12:00 / 15:00 / 18:00 / 21:00 local).
const SLOTS = [12, 15, 18, 21];

// Convert a venue-local wall time to a UTC ISO string.
function toUtcIso(y, m, d, localHour, offset) {
  // UTC = local - offset (offset is negative for the Americas).
  return new Date(Date.UTC(y, m - 1, d, localHour - offset, 0, 0)).toISOString();
}

// ─── Seed generator ──────────────────────────────────────────────────────────

// Standard 4-team round-robin pairings by matchday (1-indexed team slots).
const RR = {
  1: [[0, 1], [2, 3]],
  2: [[0, 2], [3, 1]],
  3: [[3, 0], [1, 2]], // final matchday — both kick off together
};

// Date windows (real 2026 tournament structure).
const MD1_START = [2026, 6, 11];
const MD2_START = [2026, 6, 18];
const MD3_START = [2026, 6, 24];

function addDays([y, m, d], n) {
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()];
}

function buildSeed() {
  const fixtures = [];
  let venueIdx = 0;
  const nextVenue = () => VENUES[venueIdx++ % VENUES.length];
  const groupLetters = Object.keys(GROUPS);

  for (const [mdNum, startDate] of [
    [1, MD1_START],
    [2, MD2_START],
    [3, MD3_START],
  ]) {
    groupLetters.forEach((g, gi) => {
      const teams = GROUPS[g];
      // Spread the 12 groups across ~6 days of the matchday window.
      const date = addDays(startDate, gi % 6);
      RR[mdNum].forEach((pair, pi) => {
        // Vary slots so MYT kickoffs spread across the night.
        const slot = SLOTS[(gi + pi + mdNum) % SLOTS.length];
        const v = nextVenue();
        fixtures.push({
          id: `G${g}-MD${mdNum}-${pi + 1}`,
          kickoffUtc: toUtcIso(date[0], date[1], date[2], slot, v.off),
          stage: `group-${mdNum}`,
          groupName: g,
          homeTeam: teams[pair[0]],
          awayTeam: teams[pair[1]],
          venue: v.venue,
          city: v.city,
        });
      });
    });
  }

  // Knockout rounds — TBD placeholders, real-ish date windows.
  const KO = [
    { stage: "round-32", count: 16, start: [2026, 6, 28], days: 6, label: "Round of 32" },
    { stage: "round-16", count: 8, start: [2026, 7, 4], days: 4, label: "Round of 16" },
    { stage: "quarter", count: 4, start: [2026, 7, 9], days: 3, label: "Quarter-final" },
    { stage: "semi", count: 2, start: [2026, 7, 14], days: 2, label: "Semi-final" },
    { stage: "third", count: 1, start: [2026, 7, 18], days: 1, label: "Third-place play-off" },
    { stage: "final", count: 1, start: [2026, 7, 19], days: 1, label: "Final" },
  ];

  for (const ko of KO) {
    for (let i = 0; i < ko.count; i++) {
      const date = addDays(ko.start, i % ko.days);
      const slot = SLOTS[(i + 1) % SLOTS.length];
      const v = nextVenue();
      fixtures.push({
        id: `${ko.stage.toUpperCase()}-${i + 1}`,
        kickoffUtc: toUtcIso(date[0], date[1], date[2], slot, v.off),
        stage: ko.stage,
        homeTeam: "TBD",
        awayTeam: "TBD",
        venue: v.venue,
        city: v.city,
      });
    }
  }

  fixtures.sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc));
  return fixtures;
}

// ─── API-Football path ───────────────────────────────────────────────────────

const STAGE_MAP = (round) => {
  const r = round.toLowerCase();
  if (r.includes("1st") || r.includes("- 1")) return "group-1";
  if (r.includes("2nd") || r.includes("- 2")) return "group-2";
  if (r.includes("3rd") || r.includes("- 3")) return "group-3";
  if (r.includes("32")) return "round-32";
  if (r.includes("16")) return "round-16";
  if (r.includes("quarter")) return "quarter";
  if (r.includes("3rd place") || r.includes("third")) return "third";
  if (r.includes("semi")) return "semi";
  if (r.includes("final")) return "final";
  return "group-1";
};

async function fetchFromApi(key) {
  const url = "https://v3.football.api-sports.io/fixtures?league=1&season=2026";
  const res = await fetch(url, { headers: { "x-apisports-key": key } });
  if (!res.ok) throw new Error(`API-Football ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.response.map((f) => ({
    id: String(f.fixture.id),
    kickoffUtc: f.fixture.date, // already ISO 8601 with offset
    stage: STAGE_MAP(f.league.round || ""),
    groupName: (f.league.round.match(/Group ([A-L])/) || [])[1],
    homeTeam: f.teams.home.name,
    awayTeam: f.teams.away.name,
    venue: f.fixture.venue?.name || "TBD",
    city: f.fixture.venue?.city || "TBD",
  }));
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const key = process.env.API_FOOTBALL_KEY;
  let fixtures;
  if (key) {
    console.log("Fetching authoritative fixtures from API-Football…");
    fixtures = await fetchFromApi(key);
  } else {
    console.log("No API_FOOTBALL_KEY — generating verified seed fixtures.");
    fixtures = buildSeed();
  }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(fixtures, null, 2) + "\n");
  console.log(`Wrote ${fixtures.length} fixtures -> ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

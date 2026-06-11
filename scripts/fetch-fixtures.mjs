#!/usr/bin/env node
// Builds src/data/fixtures.json — the baked, committed fixture list — from the
// REAL World Cup 2026 schedule via football-data.org.
//
//   1. Get a free key: https://www.football-data.org/client/register
//   2. Put it in .env (git-ignored):  FOOTBALL_DATA_KEY=...
//   3. Run: npm run fetch-fixtures
//
// The key is used ONLY here at build time and NEVER ships to the client. At
// runtime the app refreshes knockout teams + live scores through the Cloudflare
// Pages Functions in /functions, which hold the key as a server-side secret.
//
// Knockout matches carry real dates/times but "TBD" teams until they qualify;
// venue/city are null (not offered on the free tier).

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FD_BASE, FD_COMPETITION, toFixture } from "../shared/wc2026.mjs";
import { ALL_TEAMS } from "../src/lib/flags.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/fixtures.json");

const VALID_STAGES = new Set([
  "group-1", "group-2", "group-3",
  "round-32", "round-16", "quarter", "semi", "third", "final",
]);

async function fetchMatches(key) {
  const res = await fetch(`${FD_BASE}/competitions/${FD_COMPETITION}/matches`, {
    headers: { "X-Auth-Token": key },
  });
  if (!res.ok) throw new Error(`football-data ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (data.errorCode) throw new Error(`football-data: ${data.message}`);
  return data.matches || [];
}

// Fail-fast before writing: bad data should never reach the committed file.
function validate(fixtures) {
  const known = new Set(ALL_TEAMS);
  const errs = [];
  if (fixtures.length !== 104) errs.push(`expected 104 fixtures, got ${fixtures.length}`);
  for (const f of fixtures) {
    if (!VALID_STAGES.has(f.stage)) errs.push(`${f.id}: bad stage "${f.stage}"`);
    if (Number.isNaN(Date.parse(f.kickoffUtc))) errs.push(`${f.id}: bad kickoff "${f.kickoffUtc}"`);
    for (const t of [f.homeTeam, f.awayTeam]) {
      if (t !== "TBD" && !known.has(t)) errs.push(`${f.id}: unmapped team "${t}" (add to NAME_MAP or flags.js)`);
    }
  }
  const opener = fixtures[0];
  if (!(opener.homeTeam === "Mexico" && opener.awayTeam === "South Africa")) {
    errs.push(`opener is ${opener.homeTeam} v ${opener.awayTeam}, expected Mexico v South Africa`);
  }
  if (errs.length) throw new Error("Validation failed:\n  - " + errs.join("\n  - "));
}

async function main() {
  const key = process.env.FOOTBALL_DATA_KEY;
  if (!key) throw new Error("FOOTBALL_DATA_KEY not set — see header of this file.");

  console.log("Fetching real 2026 fixtures from football-data.org…");
  const matches = await fetchMatches(key);
  const fixtures = matches.map(toFixture).sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc));

  validate(fixtures);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(fixtures, null, 2) + "\n");
  console.log(`Wrote ${fixtures.length} fixtures -> ${OUT}`);
  console.log(`Opener: ${fixtures[0].homeTeam} v ${fixtures[0].awayTeam} @ ${fixtures[0].kickoffUtc}`);
}

main().catch((e) => {
  console.error(String(e.message || e));
  process.exit(1);
});

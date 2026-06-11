// Shared football-data.org → 3AM Club transforms.
// Pure ESM, no Node/browser APIs — imported by BOTH the build-time bake
// (scripts/fetch-fixtures.mjs) and the Cloudflare Pages Functions
// (functions/api/*), so the mapping can never drift between them.

export const FD_BASE = "https://api.football-data.org/v4";
export const FD_COMPETITION = "WC"; // FIFA World Cup

// football-data.org spelling → the canonical names used in flags.js / teamTiers.js.
// Only the three that differ need an entry; everything else already matches.
export const NAME_MAP = {
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Cape Verde Islands": "Cape Verde",
  "Curaçao": "Curacao",
};

/** A football-data team object (or null for an unqualified slot) → app name. */
export function canonTeam(team) {
  const name = team && team.name;
  if (!name) return "TBD";
  return NAME_MAP[name] ?? name;
}

/** football-data stage + matchday → one of the app's 9 stage keys. */
export function stageOf(stage, matchday) {
  switch (stage) {
    case "GROUP_STAGE":
      return `group-${matchday}`; // group-1 / group-2 / group-3
    case "LAST_32":
      return "round-32";
    case "LAST_16":
      return "round-16";
    case "QUARTER_FINALS":
      return "quarter";
    case "SEMI_FINALS":
      return "semi";
    case "THIRD_PLACE":
      return "third";
    case "FINAL":
      return "final";
    default:
      return "group-1";
  }
}

/** "GROUP_A" → "A"; knockout → undefined. */
export function groupOf(group) {
  return group ? group.replace("GROUP_", "") : undefined;
}

/**
 * A football-data match → an app fixture (the baked/`/api/fixtures` schema).
 * Venue/city are null: the free tier does not provide them.
 */
export function toFixture(m) {
  return {
    id: String(m.id),
    kickoffUtc: m.utcDate,
    stage: stageOf(m.stage, m.matchday),
    groupName: groupOf(m.group),
    homeTeam: canonTeam(m.homeTeam),
    awayTeam: canonTeam(m.awayTeam),
    venue: null,
    city: null,
  };
}

const LIVE_STATUSES = new Set(["IN_PLAY", "PAUSED"]);
export const isLive = (status) => LIVE_STATUSES.has(status);

/** A football-data match → the compact live payload merged onto fixtures by id. */
export function toLive(m) {
  const ft = (m.score && m.score.fullTime) || {};
  return {
    id: String(m.id),
    status: m.status, // IN_PLAY | PAUSED | FINISHED
    minute: m.minute ?? null,
    homeGoals: ft.home ?? null,
    awayGoals: ft.away ?? null,
  };
}

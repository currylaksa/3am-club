// Timezone handling. Everything the user sees is in Malaysia time
// (Asia/Kuala_Lumpur, UTC+8, no DST). We deliberately use a FIXED timezone via
// Intl, never the device timezone, so the plan reads the same whether the user
// is in Johor, on a plane, or travelling.

const MYT = "Asia/Kuala_Lumpur";

const PART_FMT = new Intl.DateTimeFormat("en-MY", {
  timeZone: MYT,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
});

/**
 * Break a UTC ISO timestamp into Malaysia-time calendar parts.
 * @param {string} kickoffUtc ISO 8601 UTC string
 * @returns {{ year:number, month:number, day:number, hour:number }}
 */
export function mytParts(kickoffUtc) {
  const parts = PART_FMT.formatToParts(new Date(kickoffUtc));
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  let hour = get("hour");
  if (hour === 24) hour = 0; // some engines emit "24" for midnight
  return { year: get("year"), month: get("month"), day: get("day"), hour };
}

const TIME_FMT = new Intl.DateTimeFormat("en-MY", {
  timeZone: MYT,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DATE_FMT = new Intl.DateTimeFormat("en-MY", {
  timeZone: MYT,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const NIGHT_LABEL_FMT = new Intl.DateTimeFormat("en-MY", {
  timeZone: "UTC", // we feed it a UTC date that already encodes the MYT night
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "05:00" in MYT. */
export function mytTime(kickoffUtc) {
  return TIME_FMT.format(new Date(kickoffUtc));
}

/** "Mon, 15 Jun" in MYT. */
export function mytDate(kickoffUtc) {
  return DATE_FMT.format(new Date(kickoffUtc));
}

/**
 * The match-day a fixture belongs to, as a YYYY-MM-DD key — the fixture's actual
 * MYT calendar date. A 03:00 MYT kickoff groups under that morning's date.
 * @param {string} kickoffUtc
 * @returns {string} e.g. "2026-06-12"
 */
export function matchNightKey(kickoffUtc) {
  const { year, month, day } = mytParts(kickoffUtc);
  const p = (n) => String(n).padStart(2, "0");
  return `${year}-${p(month)}-${p(day)}`;
}

/** Human label for a match-night key, e.g. "Sunday, 14 June". */
export function nightLabel(nightKey) {
  const [y, m, d] = nightKey.split("-").map(Number);
  return NIGHT_LABEL_FMT.format(new Date(Date.UTC(y, m - 1, d)));
}

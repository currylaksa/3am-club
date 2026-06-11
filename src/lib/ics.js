// Minimal .ics calendar file generation — no API, no library. Free.

import { STAGE_LABEL } from "../config/scoring.js";

function toIcsStamp(iso) {
  // 2026-06-14T21:00:00.000Z -> 20260614T210000Z
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Build an ICS string for one fixture (assumes a ~2h match window). */
export function fixtureToIcs(fixture) {
  const start = toIcsStamp(fixture.kickoffUtc);
  const end = toIcsStamp(
    new Date(new Date(fixture.kickoffUtc).getTime() + 2 * 60 * 60 * 1000).toISOString()
  );
  const title = `${fixture.homeTeam} vs ${fixture.awayTeam}`;
  const place = fixture.venue ? `${fixture.venue}, ${fixture.city}` : "";
  const desc = `${STAGE_LABEL[fixture.stage]}${place ? ` · ${place}` : ""} (3AM Club)`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//3AM Club//EN",
    "BEGIN:VEVENT",
    `UID:${fixture.id}@3amclub`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    ...(place ? [`LOCATION:${place}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Trigger a download of the .ics file in the browser. */
export function downloadIcs(fixture) {
  const blob = new Blob([fixtureToIcs(fixture)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fixture.homeTeam}-vs-${fixture.awayTeam}.ics`.replace(/\s+/g, "_");
  a.click();
  URL.revokeObjectURL(url);
}

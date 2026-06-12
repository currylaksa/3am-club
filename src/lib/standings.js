// Group-stage standings, computed client-side from fixtures + finished results
// (the /api/live payload). No backend. Tiebreak: points → GD → GF → name.
// (FIFA's exact head-to-head / fair-play tiebreakers are not reproduced.)

function blankRow(team) {
  return { team, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] };
}

/**
 * @param {import("./fixtures.js").Fixture[]} fixtures
 * @param {Record<string, import("./fixtures.js").Live>} liveById
 * @returns {Record<string, Array<{rank:number,team:string,mp:number,w:number,d:number,l:number,gf:number,ga:number,gd:number,pts:number,form:string[]}>>}
 */
export function computeStandings(fixtures, liveById = {}) {
  const groups = {}; // letter -> Map(team -> row)
  const rowFor = (g, team) => {
    if (!groups[g]) groups[g] = new Map();
    if (!groups[g].has(team)) groups[g].set(team, blankRow(team));
    return groups[g].get(team);
  };

  const groupFixtures = fixtures
    .filter((f) => f.stage.startsWith("group-") && f.groupName && f.homeTeam !== "TBD")
    .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc));

  for (const f of groupFixtures) {
    const home = rowFor(f.groupName, f.homeTeam);
    const away = rowFor(f.groupName, f.awayTeam);

    const live = liveById[f.id];
    const played =
      live && live.status === "FINISHED" && live.homeGoals != null && live.awayGoals != null;
    if (!played) continue;

    const hg = live.homeGoals;
    const ag = live.awayGoals;
    home.mp++; away.mp++;
    home.gf += hg; home.ga += ag;
    away.gf += ag; away.ga += hg;

    if (hg > ag) {
      home.w++; home.pts += 3; home.form.push("W");
      away.l++; away.form.push("L");
    } else if (hg < ag) {
      away.w++; away.pts += 3; away.form.push("W");
      home.l++; home.form.push("L");
    } else {
      home.d++; away.d++; home.pts++; away.pts++;
      home.form.push("D"); away.form.push("D");
    }
  }

  const out = {};
  for (const g of Object.keys(groups).sort()) {
    const rows = [...groups[g].values()].map((r) => ({ ...r, gd: r.gf - r.ga }));
    rows.sort(
      (a, b) =>
        b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team)
    );
    rows.forEach((r, i) => (r.rank = i + 1));
    out[g] = rows;
  }
  return out;
}

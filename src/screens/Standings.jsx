import { useMemo, useState } from "react";
import { computeStandings } from "../lib/standings.js";
import GroupTable from "../components/GroupTable.jsx";
import KnockoutBracket from "../components/KnockoutBracket.jsx";

export default function Standings({ fixtures, liveById, favorites, spoilerFree }) {
  const [view, setView] = useState("group");
  const [revealed, setRevealed] = useState(false);
  const standings = useMemo(() => computeStandings(fixtures, liveById), [fixtures, liveById]);

  if (spoilerFree && !revealed) {
    return (
      <div className="mx-auto max-w-md px-4 pb-28 pt-6">
        <h1 className="font-display text-3xl font-bold">Tables</h1>
        <p className="text-sm text-slate-400">Group standings &amp; knockout bracket</p>
        <div className="mt-8 rounded-2xl bg-night-soft p-6 text-center">
          <p className="text-sm text-slate-300">
            Standings reveal match results. Spoiler-free mode is on.
          </p>
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-pitch px-5 font-semibold text-white transition active:scale-[0.98]"
          >
            Reveal standings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6 lg:max-w-6xl">
      <h1 className="font-display text-3xl font-bold">Tables</h1>
      <p className="text-sm text-slate-400">Group standings &amp; knockout bracket</p>

      <div className="mt-4 flex max-w-sm rounded-lg bg-night-soft p-1 text-sm font-semibold">
        {[
          ["group", "Group Stage"],
          ["knockout", "Knockout"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setView(val)}
            aria-pressed={view === val}
            className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-md px-3 transition-colors ${
              view === val ? "bg-pitch text-white" : "text-slate-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "group" ? (
        <div className="mt-6 space-y-8 lg:columns-2 lg:gap-8 lg:space-y-0">
          {Object.entries(standings).map(([letter, rows]) => (
            <GroupTable key={letter} letter={letter} rows={rows} favorites={favorites} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <KnockoutBracket fixtures={fixtures} liveById={liveById} />
        </div>
      )}
    </div>
  );
}

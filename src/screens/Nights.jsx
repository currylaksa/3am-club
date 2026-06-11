import { useMemo, useState } from "react";
import { nightsView } from "../lib/fixtures.js";
import MatchCard from "../components/MatchCard.jsx";

export default function Nights({ fixtures, liveById, favorites, onOpenMatch }) {
  const [sort, setSort] = useState("time");
  const nights = useMemo(
    () => nightsView(fixtures, favorites, sort, liveById),
    [fixtures, favorites, sort, liveById]
  );

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Your Nights</h1>
          <p className="text-sm text-slate-400">All times in Malaysia (MYT)</p>
        </div>
        <div className="flex rounded-lg bg-night-soft p-1 text-xs font-semibold">
          {[
            ["time", "Time"],
            ["importance", "Importance"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSort(val)}
              aria-pressed={sort === val}
              className={`cursor-pointer rounded-md px-3 py-1.5 transition-colors ${
                sort === val ? "bg-pitch text-white" : "text-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-6 space-y-8">
        {nights.map((night) => (
          <section key={night.key}>
            <h2 className="sticky top-0 z-10 -mx-4 bg-night/90 px-4 py-2 text-sm font-bold text-emerald-300 backdrop-blur">
              {night.label}
            </h2>
            <div className="mt-3 space-y-3">
              {night.fixtures.map((f) => (
                <MatchCard key={f.id} fixture={f} onOpen={onOpenMatch} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

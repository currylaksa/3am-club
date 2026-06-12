import { useMemo, useState } from "react";
import { nightsView } from "../lib/fixtures.js";
import MatchCard from "../components/MatchCard.jsx";

export default function Nights({ fixtures, liveById, favorites, watchLog = {}, spoilerFree, onOpenMatch }) {
  const [sort, setSort] = useState("time");
  const nights = useMemo(
    () => nightsView(fixtures, favorites, sort, liveById),
    [fixtures, favorites, sort, liveById]
  );

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6 lg:max-w-5xl">
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
              className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md px-3 transition-colors ${
                sort === val ? "bg-pitch text-white" : "text-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-6 space-y-8 lg:columns-2 lg:gap-8 lg:space-y-0">
        {nights.map((night) => (
          <section key={night.key} className="lg:mb-8 lg:break-inside-avoid">
            <h2 className="sticky top-0 z-10 -mx-4 bg-night/90 px-4 py-2 text-sm font-bold text-emerald-300 backdrop-blur lg:static lg:mx-0 lg:rounded-md lg:px-3">
              {night.label}
            </h2>
            <div className="mt-3 space-y-3">
              {night.fixtures.map((f) => (
                <MatchCard
                  key={f.id}
                  fixture={f}
                  hideScore={spoilerFree && watchLog[f.id] !== "watched"}
                  onOpen={onOpenMatch}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

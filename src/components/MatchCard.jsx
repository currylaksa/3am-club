import { flag } from "../lib/flags.js";
import { mytTime } from "../lib/time.js";
import { STAGE_LABEL } from "../config/scoring.js";
import VerdictBadge from "./VerdictBadge.jsx";
import SleepCost from "./SleepCost.jsx";
import LiveScore from "./LiveScore.jsx";

export default function MatchCard({ fixture, onOpen }) {
  const { score, isFavorite } = fixture;
  const isTbd = fixture.homeTeam === "TBD";
  return (
    <button
      onClick={() => onOpen(fixture.id)}
      className={`w-full cursor-pointer rounded-2xl p-4 text-left transition active:scale-[0.98] ${
        isFavorite
          ? "bg-pitch/20 ring-2 ring-pitch"
          : "bg-night-soft ring-1 ring-slate-700/60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400">
          {fixture.groupName ? `Group ${fixture.groupName} · ` : ""}
          {STAGE_LABEL[fixture.stage]}
        </span>
        <div className="flex items-center gap-2">
          {fixture.live ? (
            <LiveScore live={fixture.live} />
          ) : (
            <>
              <span className="font-display text-xl font-bold tabular-nums">
                {mytTime(fixture.kickoffUtc)}
              </span>
              <SleepCost cost={score.sleepCost} />
            </>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-base font-semibold">
        {isTbd ? (
          <span className="text-slate-400">To be decided</span>
        ) : (
          <>
            <span>{flag(fixture.homeTeam)}</span>
            <span>{fixture.homeTeam}</span>
            <span className="text-slate-500">v</span>
            <span>{flag(fixture.awayTeam)}</span>
            <span>{fixture.awayTeam}</span>
            {isFavorite && <span className="ml-1 text-pitch">★</span>}
          </>
        )}
      </div>

      <div className="mt-3">
        <VerdictBadge verdict={score.verdict} />
      </div>
    </button>
  );
}

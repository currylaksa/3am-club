import { flag } from "../lib/flags.js";
import { mytDate, mytTime } from "../lib/time.js";
import { STAGE_LABEL } from "../config/scoring.js";

const ROUNDS = ["round-32", "round-16", "quarter", "semi", "third", "final"];

function TeamRow({ team, goals }) {
  const tbd = team === "TBD";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`flex items-center gap-2 ${tbd ? "text-slate-500" : ""}`}>
        <span>{tbd ? "🛡️" : flag(team)}</span>
        <span className="truncate">{tbd ? "TBD" : team}</span>
      </span>
      {goals != null && <span className="font-bold tabular-nums">{goals}</span>}
    </div>
  );
}

function KoCard({ fixture, live }) {
  const showScore = live && (live.status === "FINISHED" || live.status === "IN_PLAY" || live.status === "PAUSED");
  return (
    <div className="rounded-xl bg-night-soft p-3 text-sm ring-1 ring-slate-700/50">
      <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>{mytDate(fixture.kickoffUtc)} · {mytTime(fixture.kickoffUtc)}</span>
        {live?.status === "FINISHED" && <span className="font-semibold text-slate-500">FT</span>}
        {(live?.status === "IN_PLAY" || live?.status === "PAUSED") && <span className="font-semibold text-red-400">● LIVE</span>}
      </div>
      <div className="space-y-1.5">
        <TeamRow team={fixture.homeTeam} goals={showScore ? live.homeGoals ?? 0 : null} />
        <TeamRow team={fixture.awayTeam} goals={showScore ? live.awayGoals ?? 0 : null} />
      </div>
    </div>
  );
}

export default function KnockoutBracket({ fixtures, liveById = {} }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2">
      <div className="flex gap-4">
        {ROUNDS.map((stage) => {
          const matches = fixtures
            .filter((f) => f.stage === stage)
            .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc));
          if (!matches.length) return null;
          return (
            <div key={stage} className="flex min-w-[220px] flex-col">
              <h3 className="mb-3 text-sm font-bold text-emerald-300">{STAGE_LABEL[stage]}</h3>
              <div className="flex flex-1 flex-col justify-around gap-3">
                {matches.map((f) => (
                  <KoCard key={f.id} fixture={f} live={liveById[f.id]} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

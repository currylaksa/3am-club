import { findFixture, decorate } from "../lib/fixtures.js";
import { flag } from "../lib/flags.js";
import { mytTime, mytDate } from "../lib/time.js";
import { STAGE_LABEL } from "../config/scoring.js";
import { downloadIcs } from "../lib/ics.js";
import VerdictBadge from "../components/VerdictBadge.jsx";
import SleepCost from "../components/SleepCost.jsx";
import Icon from "../components/Icon.jsx";

const LOG_OPTIONS = [
  ["watched", "Watched", "✅"],
  ["highlights", "Highlights", "📺"],
  ["skipped", "Skipped", "😴"],
];

export default function MatchDetail({ id, favorites, watchLog, onClose, onSetLog, onToggleFav }) {
  const base = findFixture(id);
  if (!base) return null;
  const fixture = decorate(base, favorites);
  const { score } = fixture;
  const isTbd = fixture.homeTeam === "TBD";
  const current = watchLog[id];

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-night">
      <div className="mx-auto max-w-md px-4 pb-28 pt-6">
        <button onClick={onClose} className="mb-4 cursor-pointer text-sm text-slate-400 transition-colors hover:text-slate-200">
          ← Back to nights
        </button>

        <div className="text-xs font-medium text-slate-400">
          {fixture.groupName ? `Group ${fixture.groupName} · ` : ""}
          {STAGE_LABEL[fixture.stage]}
        </div>

        {isTbd ? (
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-300">To be decided</h1>
        ) : (
          <h1 className="mt-2 flex flex-wrap items-center gap-2 font-display text-3xl font-bold">
            <span>{flag(fixture.homeTeam)} {fixture.homeTeam}</span>
            <span className="text-slate-500">v</span>
            <span>{flag(fixture.awayTeam)} {fixture.awayTeam}</span>
          </h1>
        )}

        <div className="mt-3 flex items-center gap-4 text-slate-300">
          <span className="font-display text-2xl font-bold tabular-nums">{mytTime(fixture.kickoffUtc)}</span>
          <span>{mytDate(fixture.kickoffUtc)} MYT</span>
          <SleepCost cost={score.sleepCost} showLabel />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {fixture.venue}, {fixture.city}
        </p>

        <div className="mt-6 rounded-2xl bg-night-soft p-4">
          <div className="flex items-center justify-between">
            <VerdictBadge verdict={score.verdict} />
            <span className="text-xs text-slate-500">Importance {score.importance}/100</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{score.reason}</p>
        </div>

        {!isTbd && (
          <button
            onClick={() => onToggleFav(fixture)}
            className="mt-4 w-full cursor-pointer rounded-xl bg-night-soft py-3 text-sm font-semibold transition active:scale-[0.98]"
          >
            {fixture.isFavorite ? "★ Following a team in this match" : "☆ Follow a team in this match"}
          </button>
        )}

        <h2 className="mt-8 text-sm font-bold text-slate-400">Log it</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {LOG_OPTIONS.map(([val, label, emoji]) => (
            <button
              key={val}
              onClick={() => onSetLog(id, current === val ? null : val)}
              aria-pressed={current === val}
              className={`cursor-pointer rounded-xl py-3 text-sm font-semibold transition active:scale-95 ${
                current === val ? "bg-pitch text-white ring-2 ring-emerald-300" : "bg-night-soft"
              }`}
            >
              <div className="text-lg">{emoji}</div>
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => downloadIcs(fixture)}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-600 py-3 text-sm font-semibold transition active:scale-[0.98]"
        >
          <Icon name="calendar" className="h-5 w-5" />
          Add to calendar (.ics)
        </button>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { fixturesForTeams } from "../lib/fixtures.js";
import { flag } from "../lib/flags.js";
import { mytTime, mytDate } from "../lib/time.js";
import { STAGE_LABEL } from "../config/scoring.js";
import VerdictBadge from "../components/VerdictBadge.jsx";
import SleepCost from "../components/SleepCost.jsx";
import SupportButton from "../components/SupportButton.jsx";
import Icon from "../components/Icon.jsx";

// Light-hearted sleep-debt model: hours of sleep notionally sacrificed per match.
const DEBT_HOURS = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };

export default function MyPlan({ fixtures, liveById, favorites, onOpenMatch }) {
  const matches = useMemo(
    () => fixturesForTeams(fixtures, favorites, favorites, liveById),
    [fixtures, favorites, liveById]
  );

  const preDawn = matches.filter((m) => m.score.sleepCost >= 4).length;
  const debt = matches.reduce((sum, m) => sum + DEBT_HOURS[m.score.sleepCost], 0);

  const share = async () => {
    const lines = [
      `My 3AM Club plan — following ${favorites.join(", ")}`,
      `${matches.length} matches, ${preDawn} pre-dawn, ~${debt}h projected sleep debt 💀`,
      "Worth Staying Up For.",
    ];
    const text = lines.join("\n");
    try {
      if (navigator.share) await navigator.share({ title: "3AM Club", text });
      else {
        await navigator.clipboard.writeText(text);
        alert("Plan copied to clipboard!");
      }
    } catch {
      /* user cancelled share */
    }
  };

  if (!favorites.length) {
    return (
      <div className="mx-auto max-w-md px-4 pb-28 pt-10 text-center">
        <h1 className="font-display text-3xl font-bold">My Plan</h1>
        <p className="mt-4 text-slate-400">
          Follow a few teams and your path through the tournament — plus your
          projected sleep debt — shows up here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6">
      <h1 className="font-display text-3xl font-bold">My Plan</h1>
      <p className="text-sm text-slate-400">
        Following {favorites.map((t) => flag(t)).join(" ")} {favorites.join(", ")}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <Stat value={matches.length} label="Matches" />
        <Stat value={preDawn} label="Pre-dawn 💀" />
        <Stat value={`~${debt}h`} label="Sleep debt" />
      </div>

      <button
        onClick={share}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-pitch py-3 text-sm font-bold text-white transition active:scale-[0.98]"
      >
        <Icon name="share" className="h-5 w-5" />
        Share my plan
      </button>

      <h2 className="mt-8 text-sm font-bold text-slate-400">The path ahead</h2>
      <ol className="mt-3 space-y-3">
        {matches.map((m) => (
          <li key={m.id}>
            <button
              onClick={() => onOpenMatch(m.id)}
              className="w-full cursor-pointer rounded-2xl bg-night-soft p-4 text-left transition active:scale-[0.98]"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{STAGE_LABEL[m.stage]}</span>
                <span>{mytDate(m.kickoffUtc)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-semibold">
                  {flag(m.homeTeam)} {m.homeTeam}{" "}
                  <span className="text-slate-500">v</span> {m.awayTeam} {flag(m.awayTeam)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <VerdictBadge verdict={m.score.verdict} />
                <span className="flex items-center gap-2 font-mono text-sm">
                  {mytTime(m.kickoffUtc)} <SleepCost cost={m.score.sleepCost} />
                </span>
              </div>
            </button>
          </li>
        ))}
      </ol>

      <SupportButton variant="soft" className="mt-8" />
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl bg-night-soft p-3">
      <div className="font-display text-3xl font-bold tabular-nums text-emerald-300">{value}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );
}

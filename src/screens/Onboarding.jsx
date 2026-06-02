import { useState } from "react";
import { ALL_TEAMS, flag } from "../lib/flags.js";

export default function Onboarding({ initialFavorites, initialWakeTime, onDone }) {
  const [picked, setPicked] = useState(new Set(initialFavorites));
  const [wakeTime, setWakeTime] = useState(initialWakeTime || "07:00");

  const toggle = (team) => {
    const next = new Set(picked);
    next.has(team) ? next.delete(team) : next.add(team);
    setPicked(next);
  };

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-4 pb-28 pt-10">
      <h1 className="font-display text-3xl font-bold">Who are you following?</h1>
      <p className="mt-1 text-sm text-slate-400">
        Pick your teams and we'll flag the matches worth losing sleep over. You can
        change this anytime.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {ALL_TEAMS.map((team) => {
          const on = picked.has(team);
          return (
            <button
              key={team}
              onClick={() => toggle(team)}
              aria-pressed={on}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl px-1 py-3 text-center transition active:scale-95 ${
                on ? "bg-pitch text-white ring-2 ring-emerald-300" : "bg-night-soft"
              }`}
            >
              <span className="text-2xl">{flag(team)}</span>
              <span className="text-[11px] leading-tight font-medium">{team}</span>
            </button>
          );
        })}
      </div>

      <label className="mt-8 block text-sm font-medium text-slate-300">
        Your usual wake time (for sleep math)
        <input
          type="time"
          value={wakeTime}
          onChange={(e) => setWakeTime(e.target.value)}
          className="mt-1 block w-full rounded-lg bg-night-soft px-3 py-2 text-base"
        />
      </label>

      <div className="fixed inset-x-0 bottom-0 safe-bottom border-t border-slate-700/60 bg-night/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-3">
          <button
            onClick={() => onDone([...picked], wakeTime)}
            className="flex-1 cursor-pointer rounded-xl bg-pitch py-3 font-bold text-white transition active:scale-[0.98]"
          >
            {picked.size ? `Continue with ${picked.size} team${picked.size > 1 ? "s" : ""}` : "Continue"}
          </button>
          <button
            onClick={() => onDone([...picked], wakeTime)}
            className="cursor-pointer rounded-xl px-4 py-3 text-sm text-slate-400 transition-colors hover:text-slate-200"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

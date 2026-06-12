import { MAKER_BLURB, DISCLAIMER } from "../config/links.js";
import SupportButton from "../components/SupportButton.jsx";

export default function Settings({ settings, onChangeSettings, onEditTeams, onReset }) {
  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6">
      <h1 className="font-display text-3xl font-bold">Settings</h1>

      <section className="mt-6 space-y-3">
        <Row>
          <div>
            <div className="font-semibold">Spoiler-free mode</div>
            <div className="text-xs text-slate-400">
              Hide live &amp; final scores until you mark a match watched.
            </div>
          </div>
          <Toggle
            on={settings.spoilerFree}
            label="Spoiler-free mode"
            onClick={() => onChangeSettings({ ...settings, spoilerFree: !settings.spoilerFree })}
          />
        </Row>

        <Row>
          <label className="flex w-full items-center justify-between">
            <div>
              <div className="font-semibold">Usual wake time</div>
              <div className="text-xs text-slate-400">Used for sleep math.</div>
            </div>
            <input
              type="time"
              value={settings.wakeTimeMyt}
              onChange={(e) => onChangeSettings({ ...settings, wakeTimeMyt: e.target.value })}
              className="rounded-lg bg-night px-3 py-2"
            />
          </label>
        </Row>

        <button
          onClick={onEditTeams}
          className="w-full cursor-pointer rounded-2xl bg-night-soft p-4 text-left font-semibold transition active:scale-[0.98]"
        >
          Edit my teams →
        </button>
      </section>

      <SupportButton variant="solid" className="mt-6" />

      <section className="mt-8 rounded-2xl bg-night-soft p-4 text-sm leading-relaxed text-slate-300">
        <h2 className="font-bold text-slate-200">What is this?</h2>
        <p className="mt-2">{MAKER_BLURB}</p>
      </section>

      <button
        onClick={() => {
          if (confirm("Reset all your teams, logs and settings?")) onReset();
        }}
        className="mt-6 w-full cursor-pointer rounded-xl border border-red-500/40 py-3 text-sm font-semibold text-red-300 transition active:scale-[0.98]"
      >
        Reset all data
      </button>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-500">{DISCLAIMER}</p>
    </div>
  );
}

function Row({ children }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-night-soft p-4">
      {children}
    </div>
  );
}

function Toggle({ on, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition ${on ? "bg-pitch" : "bg-slate-600"}`}
      aria-pressed={on}
      aria-label={label}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

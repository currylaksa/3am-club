// First thing a new visitor sees: the pitch, before we ask for anything.

const POINTS = [
  ["🌙", "Every kickoff lands between midnight and 8 AM in Malaysia. We do the timezone math for you."],
  ["🔥", "A clear verdict on each match — WATCH LIVE, WORTH THE PAIN, or just SKIP and sleep."],
  ["💀", "See your sleep debt before it wrecks you, with a night-by-night plan in MYT."],
];

export default function Landing({ onGetStarted, onBrowse }) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-6 pb-10 pt-16 text-center">
      <img src="/favicon.svg" alt="" className="mx-auto h-24 w-24" />

      <h1 className="mt-6 font-display text-5xl font-bold tracking-tight">3AM Club</h1>
      <p className="mt-1 text-lg font-semibold text-emerald-300">Worth Staying Up For.</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        The 2026 football tournament, on Malaysia time. Which matches are actually
        worth losing sleep over? This tells you.
      </p>

      <ul className="mt-9 space-y-4 text-left">
        {POINTS.map(([icon, text]) => (
          <li key={text} className="flex gap-3">
            <span className="text-2xl leading-none" aria-hidden>{icon}</span>
            <span className="text-sm leading-relaxed text-slate-300">{text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-10">
        <button
          onClick={onGetStarted}
          className="w-full cursor-pointer rounded-xl bg-pitch py-3.5 text-base font-bold text-white transition active:scale-[0.98]"
        >
          Get started
        </button>
        <button
          onClick={onBrowse}
          className="mt-3 w-full cursor-pointer py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
        >
          Just browse the fixtures
        </button>
        <p className="mt-6 text-[11px] text-slate-600">
          Free forever · installs to your home screen · works offline
        </p>
      </div>
    </div>
  );
}

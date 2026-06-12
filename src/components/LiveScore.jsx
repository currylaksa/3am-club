// Score pill. `live` is the compact payload from /api/live:
// { status: "IN_PLAY"|"PAUSED"|"FINISHED", minute, homeGoals, awayGoals }.

export default function LiveScore({ live, className = "" }) {
  const score = `${live.homeGoals ?? 0}–${live.awayGoals ?? 0}`;
  const finished = live.status === "FINISHED";
  const tag = finished
    ? "FT"
    : live.status === "PAUSED"
    ? "HT"
    : live.minute != null
    ? `${live.minute}'`
    : "LIVE";

  const palette = finished
    ? "bg-slate-700/60 text-slate-300"
    : "bg-red-500/15 text-red-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-bold ${palette} ${className}`}
    >
      {!finished && <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />}
      <span className="tabular-nums">{score}</span>
      <span
        className={`text-xs font-semibold ${finished ? "text-slate-400" : "text-red-300/80"}`}
      >
        {tag}
      </span>
    </span>
  );
}

// Live score pill. `live` is the compact payload from /api/live:
// { status: "IN_PLAY"|"PAUSED", minute, homeGoals, awayGoals }.

export default function LiveScore({ live, className = "" }) {
  const score = `${live.homeGoals ?? 0}–${live.awayGoals ?? 0}`;
  const tag =
    live.status === "PAUSED" ? "HT" : live.minute != null ? `${live.minute}'` : "LIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md bg-red-500/15 px-2 py-1 font-bold text-red-400 ${className}`}
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
      <span className="tabular-nums">{score}</span>
      <span className="text-xs font-semibold text-red-300/80">{tag}</span>
    </span>
  );
}

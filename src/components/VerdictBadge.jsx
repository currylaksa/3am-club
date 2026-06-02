import { VERDICT_STYLE } from "../config/scoring.js";

export default function VerdictBadge({ verdict, className = "" }) {
  const style = VERDICT_STYLE[verdict] ?? VERDICT_STYLE.SKIP;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${style.badge} ${className}`}
    >
      <span aria-hidden>{style.emoji}</span>
      {verdict}
    </span>
  );
}

// Sleep-cost indicator: ☕ easy → 💀 brutal.
const ICONS = { 1: "☕", 2: "🌙", 3: "😴", 4: "🥱", 5: "💀" };
const WORDS = { 1: "Easy", 2: "Late", 3: "Early wake", 4: "Deep night", 5: "Pre-dawn" };

export default function SleepCost({ cost, showLabel = false }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-sm"
      title={`Sleep cost ${cost}/5 — ${WORDS[cost]}`}
    >
      <span aria-hidden>{ICONS[cost]}</span>
      {showLabel && <span className="text-slate-400">{WORDS[cost]}</span>}
    </span>
  );
}

import { flag } from "../lib/flags.js";

// Form dots: most-recent-last, padded to 5 slots like the reference design.
function FormDots({ form }) {
  const slots = [...form.slice(-5)];
  while (slots.length < 5) slots.push(null);
  return (
    <span className="inline-flex gap-1">
      {slots.map((r, i) => {
        if (r === "W") return <span key={i} className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[9px] font-bold text-emerald-950">✓</span>;
        if (r === "L") return <span key={i} className="grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[9px] font-bold text-red-950">✕</span>;
        if (r === "D") return <span key={i} className="grid h-4 w-4 place-items-center rounded-full bg-slate-500 text-[9px] font-bold text-slate-900">–</span>;
        return <span key={i} className="h-4 w-4 rounded-full ring-1 ring-inset ring-slate-600" />;
      })}
    </span>
  );
}

const NUM = "px-1.5 py-2 text-center tabular-nums";

export default function GroupTable({ letter, rows, favorites = [] }) {
  return (
    <section>
      <h3 className="mb-1 font-display text-lg font-bold">Group {letter}</h3>
      <div className="overflow-x-auto rounded-2xl bg-night-soft">
        <table className="w-full min-w-[460px] text-sm">
          <thead>
            <tr className="text-[11px] text-slate-400">
              <th className="px-2 py-2 text-left font-medium">Team</th>
              {["MP", "W", "D", "L", "GF", "GA", "GD"].map((h) => (
                <th key={h} className="px-1.5 py-2 text-center font-medium">{h}</th>
              ))}
              <th className="px-1.5 py-2 text-center font-bold text-slate-300">Pts</th>
              <th className="px-2 py-2 text-center font-medium">Last 5</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const advancing = r.rank <= 2;
              const fav = favorites.includes(r.team);
              return (
                <tr key={r.team} className="border-t border-slate-700/40">
                  <td className="px-2 py-2">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span className={`w-4 text-xs ${advancing ? "font-bold text-emerald-300" : "text-slate-500"}`}>{r.rank}</span>
                      <span>{flag(r.team)}</span>
                      <span className={fav ? "font-semibold text-emerald-300" : ""}>{r.team}</span>
                      {fav && <span className="text-emerald-400">★</span>}
                    </span>
                  </td>
                  <td className={NUM}>{r.mp}</td>
                  <td className={NUM}>{r.w}</td>
                  <td className={NUM}>{r.d}</td>
                  <td className={NUM}>{r.l}</td>
                  <td className={NUM}>{r.gf}</td>
                  <td className={NUM}>{r.ga}</td>
                  <td className={NUM}>{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                  <td className={`${NUM} font-bold text-slate-100`}>{r.pts}</td>
                  <td className="px-2 py-2"><FormDots form={r.form} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

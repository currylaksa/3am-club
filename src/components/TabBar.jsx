import Icon from "./Icon.jsx";

const TABS = [
  ["nights", "Nights", "moon"],
  ["plan", "My Plan", "plan"],
  ["settings", "Settings", "settings"],
];

export default function TabBar({ tab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 safe-bottom border-t border-slate-700/60 bg-night/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {TABS.map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={tab === id ? "page" : undefined}
            className={`flex flex-1 cursor-pointer flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              tab === id ? "text-emerald-300" : "text-slate-500"
            }`}
          >
            <Icon name={icon} className="h-6 w-6" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

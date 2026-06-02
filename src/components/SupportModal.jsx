import { SUPPORT_QR, SUPPORT_NOTE } from "../config/links.js";

export default function SupportModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buy me a coffee"
        className="w-full max-w-sm rounded-3xl bg-night-soft p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-extrabold text-amber-200">Buy me a coffee ☕</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{SUPPORT_NOTE}</p>

        <div className="mx-auto mt-5 w-48 rounded-2xl bg-white p-3">
          <img src={SUPPORT_QR} alt="Scan to support 3AM Club" className="h-full w-full" />
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Scan the code with your banking or e-wallet app.
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full cursor-pointer rounded-xl bg-pitch py-3 font-bold text-white transition active:scale-[0.98]"
        >
          Done
        </button>
      </div>
    </div>
  );
}

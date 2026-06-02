import { useState } from "react";
import SupportModal from "./SupportModal.jsx";

// variant "soft": gentle prompt for My Plan. variant "solid": Settings button.
export default function SupportButton({ variant = "solid", className = "" }) {
  const [open, setOpen] = useState(false);

  const trigger =
    variant === "soft" ? (
      <button
        onClick={() => setOpen(true)}
        className={`block w-full cursor-pointer rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4 text-center transition active:scale-[0.99] ${className}`}
      >
        <span className="text-sm text-amber-200/90">
          Built solo, free forever. If it saved your sleep, buy me a coffee ☕
        </span>
      </button>
    ) : (
      <button
        onClick={() => setOpen(true)}
        className={`block w-full cursor-pointer rounded-2xl bg-amber-400 py-3 text-center font-bold text-amber-950 transition active:scale-[0.98] ${className}`}
      >
        ☕ Buy me a coffee
      </button>
    );

  return (
    <>
      {trigger}
      <SupportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

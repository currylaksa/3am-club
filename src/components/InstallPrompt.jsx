import { useEffect, useState } from "react";
import { saveInstalled } from "../lib/state.js";
import Icon from "./Icon.jsx";

// Handles both install paths:
//  - Android/Chrome: capture beforeinstallprompt, show a custom button.
//  - iOS Safari: no such event — show a dismissible "Add to Home Screen" hint.
export default function InstallPrompt({ alreadyInstalled }) {
  const [deferred, setDeferred] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(alreadyInstalled);

  useEffect(() => {
    if (alreadyInstalled) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => {
      saveInstalled(true);
      setDismissed(true);
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari detection (no beforeinstallprompt there).
    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isIos && !isStandalone) setShowIosHint(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [alreadyInstalled]);

  if (dismissed) return null;

  const dismiss = () => {
    saveInstalled(true);
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  if (deferred) {
    return (
      <Banner onDismiss={dismiss}>
        <span className="text-sm">Install 3AM Club for offline access.</span>
        <button
          onClick={install}
          className="ml-auto cursor-pointer rounded-lg bg-pitch px-3 py-1.5 text-sm font-bold text-white transition active:scale-95"
        >
          Install
        </button>
      </Banner>
    );
  }

  if (showIosHint) {
    return (
      <Banner onDismiss={dismiss}>
        <span className="inline-flex flex-wrap items-center gap-1 text-sm">
          Install: tap the Share icon
          <Icon name="share" className="inline h-4 w-4" />
          → <b>Add to Home Screen</b>.
        </span>
      </Banner>
    );
  }

  return null;
}

function Banner({ children, onDismiss }) {
  return (
    <div className="mx-auto mt-3 flex max-w-md items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2">
      {children}
      <button
        onClick={onDismiss}
        className="ml-1 cursor-pointer text-slate-400 transition-colors hover:text-slate-200"
        aria-label="Dismiss"
      >
        <Icon name="x" className="h-4 w-4" />
      </button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { FIXTURES, mergeFixtures } from "./fixtures.js";

const LIVE_POLL_MS = 90_000; // matches the edge cache TTL
const MATCH_WINDOW_MS = 2.5 * 60 * 60 * 1000; // kickoff → ~full time + stoppage

/** Is any match currently inside its live window? Drives whether we poll at all. */
function anyInProgress(fixtures, now = Date.now()) {
  return fixtures.some((f) => {
    const k = Date.parse(f.kickoffUtc);
    return now >= k && now <= k + MATCH_WINDOW_MS;
  });
}

/**
 * The app's live data source:
 *  - starts from baked fixtures (instant, offline-safe),
 *  - refreshes the schedule once from /api/fixtures (knockout teams fill in),
 *  - polls /api/live for scores ONLY while a match is in progress and the tab
 *    is visible — so the free-tier quota survives.
 */
export function useWorldCupData() {
  const [fixtures, setFixtures] = useState(FIXTURES);
  const [liveById, setLiveById] = useState({});

  // One-shot schedule refresh; keep baked fixtures on any failure (offline).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/fixtures")
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((remote) => {
        if (!cancelled && Array.isArray(remote) && remote.length) {
          setFixtures(mergeFixtures(FIXTURES, remote));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Live scores.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      if (!anyInProgress(fixtures)) {
        setLiveById((m) => (Object.keys(m).length ? {} : m)); // drop stale scores
        return;
      }
      try {
        const data = await (await fetch("/api/live")).json();
        if (cancelled) return;
        const map = {};
        for (const l of data.live || []) map[l.id] = l;
        setLiveById(map);
      } catch {
        /* transient — keep last good scores */
      }
    };
    tick();
    const timer = setInterval(tick, LIVE_POLL_MS);
    const onVis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fixtures]);

  return { fixtures, liveById };
}

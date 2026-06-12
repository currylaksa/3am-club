import { useEffect, useState } from "react";
import {
  loadState,
  saveFavorites,
  saveWatchLog,
  saveSettings,
  resetAll,
} from "./lib/state.js";
import { useWorldCupData } from "./lib/useWorldCupData.js";
import Landing from "./screens/Landing.jsx";
import Onboarding from "./screens/Onboarding.jsx";
import Nights from "./screens/Nights.jsx";
import MyPlan from "./screens/MyPlan.jsx";
import Standings from "./screens/Standings.jsx";
import Settings from "./screens/Settings.jsx";
import MatchDetail from "./screens/MatchDetail.jsx";
import TabBar from "./components/TabBar.jsx";
import InstallPrompt from "./components/InstallPrompt.jsx";

export default function App() {
  const [state, setState] = useState(loadState);
  // First-run flow: landing -> onboarding -> app. Returning users go straight in.
  const [flow, setFlow] = useState(() =>
    state.favorites.length || localStorage.getItem("wp.onboarded") === "1"
      ? "app"
      : "landing"
  );
  const [tab, setTab] = useState("nights");
  const [openMatchId, setOpenMatchId] = useState(null);
  const { fixtures, liveById } = useWorldCupData();

  const { favorites, watchLog, settings, installed } = state;

  useEffect(() => saveFavorites(favorites), [favorites]);
  useEffect(() => saveWatchLog(watchLog), [watchLog]);
  useEffect(() => saveSettings(settings), [settings]);

  // Each tab should open at the top, not inherit the previous tab's scroll.
  useEffect(() => window.scrollTo(0, 0), [tab]);

  const setFavorites = (next) => setState((s) => ({ ...s, favorites: next }));

  const markOnboarded = () => {
    try {
      localStorage.setItem("wp.onboarded", "1");
    } catch { /* ignore */ }
  };

  const finishOnboarding = (picked, wakeTime) => {
    setState((s) => ({ ...s, favorites: picked, settings: { ...s.settings, wakeTimeMyt: wakeTime } }));
    markOnboarded();
    setFlow("app");
  };

  const setLog = (id, status) =>
    setState((s) => {
      const next = { ...s.watchLog };
      if (status === null) delete next[id];
      else next[id] = status;
      return { ...s, watchLog: next };
    });

  const toggleFavFromMatch = (fixture) => {
    // Toggle the home team's follow state (simple, predictable).
    const team = fixture.homeTeam;
    setFavorites(
      favorites.includes(team) ? favorites.filter((t) => t !== team) : [...favorites, team]
    );
  };

  if (flow === "landing") {
    return (
      <Landing
        onGetStarted={() => setFlow("onboarding")}
        onBrowse={() => {
          markOnboarded();
          setFlow("app");
        }}
      />
    );
  }

  if (flow === "onboarding") {
    return (
      <Onboarding
        initialFavorites={favorites}
        initialWakeTime={settings.wakeTimeMyt}
        onDone={finishOnboarding}
      />
    );
  }

  return (
    <div className="min-h-full">
      <div className="px-4 pt-3">
        <InstallPrompt alreadyInstalled={installed} />
      </div>

      {tab === "nights" && (
        <Nights
          fixtures={fixtures}
          liveById={liveById}
          favorites={favorites}
          watchLog={watchLog}
          spoilerFree={settings.spoilerFree}
          onOpenMatch={setOpenMatchId}
        />
      )}
      {tab === "plan" && (
        <MyPlan
          fixtures={fixtures}
          liveById={liveById}
          favorites={favorites}
          onOpenMatch={setOpenMatchId}
        />
      )}
      {tab === "table" && (
        <Standings
          fixtures={fixtures}
          liveById={liveById}
          favorites={favorites}
          spoilerFree={settings.spoilerFree}
        />
      )}
      {tab === "settings" && (
        <Settings
          settings={settings}
          onChangeSettings={(next) => setState((s) => ({ ...s, settings: next }))}
          onEditTeams={() => setFlow("onboarding")}
          onReset={() => {
            resetAll();
            try { localStorage.removeItem("wp.onboarded"); } catch { /* ignore */ }
            setState(loadState());
            setFlow("landing");
          }}
        />
      )}

      {openMatchId && (
        <MatchDetail
          id={openMatchId}
          fixtures={fixtures}
          liveById={liveById}
          favorites={favorites}
          watchLog={watchLog}
          spoilerFree={settings.spoilerFree}
          onClose={() => setOpenMatchId(null)}
          onSetLog={setLog}
          onToggleFav={toggleFavFromMatch}
        />
      )}

      <TabBar tab={tab} onChange={setTab} />
    </div>
  );
}

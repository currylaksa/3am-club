# Build Brief — "Worth Staying Up For" (2026 Football Tournament Viewing Planner PWA)

> Hand this whole file to Claude Code. It is the spec. Build the MVP scope first (Section 11), confirm it works, then move to v2. Verify any external API endpoint shapes against current live docs before wiring them — do not trust hardcoded response shapes in this doc blindly.

---

## 1. What we're building

A free, installable **Progressive Web App** that helps **Malaysian / SEA football fans** decide which 2026 tournament matches are worth losing sleep over, because every kickoff lands between roughly midnight and 8 AM Malaysia time.

The big global apps (FotMob, OneFootball, ESPN, the official app) all show fixtures and scores. **None of them answer the actual local question: "given I'm in Johor and this kicks off at 3 AM, is this match worth wrecking my sleep for?"** That gap is the entire product.

Core promise: pick your teams → get a personalized, night-by-night plan in Malaysia time that tells you what's a must-watch, what to skip, and what to catch on highlights — plus a running sense of how much sleep you're sacrificing.

Monetization: free to use, with a tasteful "Buy me a coffee" support button. No paywalls, no cash prediction/betting features (that would be illegal gambling in MY).

---

## 2. Tech stack (locked — matches my existing toolchain)

- **Frontend:** React 19 + Vite
- **PWA:** `vite-plugin-pwa` (handles manifest + service worker generation)
- **Styling:** Tailwind CSS (mobile-first; this is a phone-first product)
- **State/persistence:** React state + `localStorage` (no backend for MVP — see Section 5)
- **Hosting:** Cloudflare Pages **or** GitHub Pages (both free; I have GitHub Student Pack), or my existing DigitalOcean droplet. Pick Cloudflare Pages for the MVP — free, fast, easy Worker proxy later.
- **Data:** see Section 4.

No native code. No app store. This ships as a website that installs to the home screen.

---

## 3. Architecture (keep it dead simple)

```
[ Build time ] fetch full fixture list once → bake into /src/data/fixtures.json
        │
        ▼
[ Static React PWA on Cloudflare Pages ]
   - reads baked fixtures.json
   - computes importance + sleep cost in the browser
   - stores user choices in localStorage
   - (v2) fetches results via a Cloudflare Worker proxy
        │
        ▼
[ User's phone ] installs to home screen, uses offline-capable
```

MVP has **no server and no exposed API key** because fixtures are baked at build time. This is what keeps it truly zero-cost and zero-maintenance.

---

## 4. Data source

Fixtures don't change once the schedule is set, so for the MVP we **fetch the full fixture list at build time and commit it as static JSON**. No runtime API calls, no key in the bundle.

Two viable sources — try in this order:

1. **API-Football (api-sports.io)** — the 2026 tournament is under `league=1`, `season=2026`. Free account/key. Endpoint shape (verify against current docs):
   - `GET https://v3.football.api-sports.io/fixtures?league=1&season=2026`
   - Response fixtures include kickoff timestamp (UTC, ISO 8601), teams, venue, round/stage label.
2. **Open-source fallback (no key):** `github.com/rezarahiminia/worldcup2026` — free REST API with teams, groups, matches, stadiums, standings; updates scores in real time during the tournament. Good zero-key backup and useful for v2 results.

**Build step to write:** a small Node script (`scripts/fetch-fixtures.mjs`) that pulls all fixtures, normalizes them to our schema (Section 5), and writes `src/data/fixtures.json`. Run it manually now; re-run if the schedule updates. **The API key (if using API-Football) lives only in this build script / env var — it must NEVER be shipped to the client bundle.**

### CRITICAL: timezone handling
- API kickoff times are **UTC**. Malaysia is **UTC+8 (Asia/Kuala_Lumpur, no DST)**.
- Convert and display everything in MYT using a fixed timezone, not the device timezone:
  `new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', ... })`
- Worked example: a kickoff of `2026-06-14T21:00:00Z` displays as **05:00 on 15 June MYT** (a brutal pre-dawn match — exactly the kind we flag as high sleep cost).
- The "match night" a fixture belongs to should be the MYT calendar night it falls in (treat anything from, say, 18:00 MYT through ~10:00 MYT next morning as one viewing night so a 3 AM match groups with the evening before, matching how people actually plan).

---

## 5. Data model

All client-side in `localStorage`. No accounts, no backend.

### Baked fixture object (in fixtures.json)
```ts
type Fixture = {
  id: string;
  kickoffUtc: string;        // ISO 8601 UTC
  stage: Stage;              // see Section 6
  groupName?: string;        // "A".."L" for group stage
  homeTeam: string;          // country name or "TBD" / placeholder for knockouts
  awayTeam: string;
  venue: string;
  city: string;
};
```

### localStorage keys
```ts
"wp.favorites"   : string[]          // favorited team names
"wp.watchLog"    : Record<id, "watched" | "skipped" | "highlights">
"wp.settings"    : { spoilerFree: boolean; wakeTimeMyt: string /* "07:00" */ }
"wp.installed"   : boolean           // suppress install prompt after install
```

Keep a single `loadState()/saveState()` helper. Wrap all reads in try/catch (localStorage can throw in private mode).

---

## 6. The scoring engine (this is the heart of the app — get it right)

Compute **two independent numbers** per fixture, then combine into a verdict. Keep all weights in a single editable config file (`src/config/scoring.ts`) so I can tune them.

### Stage enum + weights
```ts
type Stage = "group-1" | "group-2" | "group-3" | "round-32"
           | "round-16" | "quarter" | "semi" | "third" | "final";

const STAGE_WEIGHT: Record<Stage, number> = {
  "group-1": 8, "group-2": 10, "group-3": 18,   // matchday 3 = win-or-go-home deciders
  "round-32": 22, "round-16": 30, "quarter": 38,
  "semi": 46, "third": 18, "final": 55,
};
```
(Map the API's round labels to these. Group "matchday 3" being high is deliberate — those are the dramatic deciders.)

### A. Match importance (0–100)
```
importance = 0
if (homeTeam ∈ favorites || awayTeam ∈ favorites)  importance += 45
importance += STAGE_WEIGHT[stage]
importance += (teamTierScore(home) + teamTierScore(away)) / 2   // 0–20
if (isMarqueeOrRivalry(home, away))                importance += 10
importance = clamp(importance, 0, 100)
```

**Team tiers** → `teamTierScore`: Tier1 = 20, Tier2 = 12, Tier3 = 6, Tier4 = 2.
Build the tier map in `src/config/teamTiers.ts`. Easiest robust approach: derive tiers from current FIFA world ranking buckets (top ~6 = Tier1, next ~12 = Tier2, etc.) — pull rankings once at build time or hardcode a config. **Do not assume rankings from memory; fetch or let me fill them in.** Provide a sensible default seed and a clear comment telling me to adjust.

`isMarqueeOrRivalry` = a small hardcoded list of classic pairings (e.g. historic rivalries / blockbuster matchups). Keep it as editable config.

### B. Sleep cost (1–5) — based on MYT kickoff hour
```ts
function sleepCost(myteHour: number): 1|2|3|4|5 {
  if (myteHour >= 18 && myteHour < 23) return 1; // evening — easy
  if (myteHour === 23 || myteHour === 0) return 2; // late but doable
  if (myteHour === 1 || myteHour === 2) return 4; // deep into the night
  if (myteHour >= 3 && myteHour < 6)    return 5; // pre-dawn — brutal
  if (myteHour >= 6 && myteHour < 9)    return 3; // early wake
  return 1; // daytime
}
```

### C. The verdict (combine importance + sleep cost)
Bucket importance: `MustWatch ≥70`, `WorthIt 50–69`, `Optional 30–49`, `Skip <30`.

| Importance bucket | Sleep cost 1–2 | Sleep cost 3 | Sleep cost 4–5 |
|---|---|---|---|
| MustWatch | **WATCH LIVE** | **WATCH LIVE** | **WORTH THE PAIN** |
| WorthIt | **WATCH LIVE** | **YOUR CALL** | **CATCH HIGHLIGHTS** |
| Optional | **WATCH IF UP** | **CATCH HIGHLIGHTS** | **SKIP** |
| Skip | CATCH HIGHLIGHTS | SKIP | SKIP |

Render the verdict as a colored badge on every fixture. Show *why* on tap (e.g. "Your team + Round of 16, but kicks off 4 AM").

---

## 7. Screens / UX flow (mobile-first)

1. **Onboarding** — "Which teams are you following?" Grid of all 48 nations with flags (use flag emoji or a free flag CDN; no licensed assets). Multi-select. Optional "set your usual wake time" for sleep math. Saves to localStorage, skippable.
2. **Tonight / Your Nights (home screen)** — vertical list grouped by MYT match-night. Each card: teams, MYT kickoff time + date, sleep-cost icon (☕/😴/💀 style), verdict badge. Favorited teams' matches highlighted/pinned. Default sort: chronological; toggle to "by importance".
3. **Match detail** — full info, the verdict + plain-language reasoning, "mark as watched / skipped / highlights" buttons, "add to calendar" (.ics download — free, no API).
4. **My Plan / Sleep summary** — for favorited teams: their full path through the tournament as a timeline, total number of pre-dawn (cost 4–5) matches ahead, a light-hearted "projected sleep debt" tally.
5. **Settings** — spoiler-free toggle, wake time, reset data, the Buy-Me-a-Coffee link, a short "what is this / who made it" blurb (attach your Wilderfarer identity here — the personal story is what earns donations).

Keep navigation to a simple bottom tab bar: Nights · My Plan · Settings.

---

## 8. PWA requirements

### Manifest (via vite-plugin-pwa)
```js
manifest: {
  name: "Worth Staying Up For",
  short_name: "StayUp",
  description: "Which 2026 tournament matches are worth losing sleep over — in Malaysia time.",
  theme_color: "#0b6e4f",
  background_color: "#0f172a",
  display: "standalone",
  orientation: "portrait",
  start_url: "/",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
  ]
}
```
Generate placeholder icons (simple owl/moon + ball motif, original artwork only — no FIFA/club logos).

### Service worker / caching
- `registerType: 'autoUpdate'`.
- App shell + fixtures.json: **precache** (cache-first) so it works fully offline — the plan is useful even on the train with no signal.
- (v2) live results endpoint: **stale-while-revalidate** so cached scores show instantly and refresh in the background.

### Install prompt (must handle both platforms)
- **Android/Chrome:** capture the `beforeinstallprompt` event, prevent default, stash it, and show a custom "Install app" button; call `.prompt()` on tap. Hide after install / if `wp.installed`.
- **iOS Safari:** does NOT fire `beforeinstallprompt`. Detect iOS Safari and show a small manual hint instead: "Tap the Share icon → Add to Home Screen." Show it once, dismissible.

---

## 9. Monetization — Buy Me a Coffee

- Use a hosted service link (Buy Me a Coffee / Ko-fi) or a Stripe Payment Link. **Web keeps ~100% minus processor fee** — this is exactly why we're NOT in the app stores (Apple would force IAP and skim 15–30%).
- Placement: NOT in the user's face on first load. Put it (a) in Settings, and (b) as a soft, occasional footer prompt *after* the user has clearly gotten value (e.g. after they've marked a couple matches, or on the "My Plan" screen). One tasteful line: "Built solo, free forever. If it saved your sleep, buy me a coffee ☕."
- No pressure, no modal nags.

---

## 10. Legal / IP guardrails (don't skip these)

- **No FIFA marks.** Do not use "FIFA", the official tournament name/logo/emblem/mascot, or "official" anywhere. Refer to it generically: "the 2026 tournament", "the 2026 football tournament in North America". Naming the product after the trademark is the thing that draws takedowns — the working title "Worth Staying Up For" is fine; avoid "World Cup" in the app name and store-style copy.
- Referencing **team (country) names and fixtures factually is fine.**
- **No flags/crests from licensed sources** — use emoji flags or an open-licensed flag set (e.g. open-source flag-icons), check the license.
- **No betting, no cash prediction pools, no odds.** Free-to-play only. This keeps it clear of Malaysian gambling law.
- Include a one-line disclaimer in Settings: unofficial, fan-made, not affiliated with any governing body.

---

## 11. MVP scope (BUILD THIS FIRST — must ship before 11 June 2026)

Definition of done:
- [ ] Vite + React 19 + Tailwind + vite-plugin-pwa scaffolded
- [ ] `scripts/fetch-fixtures.mjs` pulls all fixtures → `src/data/fixtures.json` (key stays server-side)
- [ ] Onboarding team-select, persisted to localStorage
- [ ] All fixtures shown in **MYT**, grouped by match-night, chronological + importance sort
- [ ] Scoring engine (Section 6) computing importance, sleep cost, and verdict badges
- [ ] Match detail with plain-language reasoning + mark watched/skipped/highlights + .ics download
- [ ] My Plan screen for favorited teams (path + sleep-debt tally)
- [ ] Installable PWA on Android + iOS (with the correct per-platform install UX)
- [ ] Works offline (app shell + fixtures precached)
- [ ] Web Share API "share my plan" + Buy-Me-a-Coffee link in Settings
- [ ] Deployed to Cloudflare Pages on a real URL
- [ ] IP guardrails (Section 10) respected throughout

## 12. v2 (during the tournament, after MVP is live)
- Live + final scores via a **Cloudflare Worker proxy** (hides API key, caches, free tier) or the open-source no-key API.
- **Spoiler-free mode**: hide all scores for matches the user hasn't marked watched.
- Auto-populate knockout bracket fixtures as teams qualify (re-run fetch script or pull live).
- Highlights links per finished match.
- "Last night you watched X and it was a 0-0 bore / a classic" reflection on the sleep tracker.
- Optional: shareable image card of "my World Cup sleep schedule" for social virality.

---

## 13. Naming
Working title: **"Worth Staying Up For."** Avoid trademarked terms in the product name. Other safe options to consider: *StayUp*, *3AM Club*, *MatchOwl*, *Kickoff o'clock*. Pick one and use it consistently in the manifest + UI.

## 14. Build order for Claude Code
1. Scaffold project + Tailwind + PWA plugin; get a blank installable shell deployed to Cloudflare Pages first (prove the pipeline).
2. Fetch script → fixtures.json.
3. Scoring config + engine with unit-tested examples (test the timezone conversion and a couple of verdict cases explicitly).
4. Screens in order: Nights → Onboarding → Match detail → My Plan → Settings.
5. Install UX + offline caching.
6. Coffee link + share + IP/disclaimer pass.
7. Ship MVP. Then v2.

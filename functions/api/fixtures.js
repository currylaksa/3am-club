// GET /api/fixtures — real 2026 schedule with knockout teams that fill in as
// sides qualify. Proxies football-data.org, normalises to the app schema, and
// edge-caches so we stay well inside the free quota. The key never reaches the
// browser: it lives in the FOOTBALL_DATA_KEY secret (set in the Pages dashboard).

import { FD_BASE, FD_COMPETITION, toFixture } from "../../shared/wc2026.mjs";

const TTL = 6 * 60 * 60; // 6h — the schedule changes only a few times all tournament.

export async function onRequest(context) {
  const { request, env } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/fixtures", request.url), request);

  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const upstream = await fetch(`${FD_BASE}/competitions/${FD_COMPETITION}/matches`, {
    headers: { "X-Auth-Token": env.FOOTBALL_DATA_KEY },
  });
  if (!upstream.ok) {
    return Response.json({ error: "upstream", status: upstream.status }, { status: 502 });
  }
  const data = await upstream.json();
  const fixtures = (data.matches || [])
    .map(toFixture)
    .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc));

  const res = Response.json(fixtures, {
    headers: { "Cache-Control": `public, max-age=${TTL}` },
  });
  context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

// GET /api/live — compact live data for in-progress matches, merged onto
// fixtures by id on the client. Edge-cached ~90s so a whole match window costs
// only a handful of origin calls regardless of how many people are watching.
// Returns { degraded:true, live:[] } instead of failing if the upstream errors.

import { FD_BASE, FD_COMPETITION, isShown, toLive } from "../../shared/wc2026.mjs";

const TTL = 90; // seconds

export async function onRequest(context) {
  const { request, env } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/live", request.url), request);

  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let body;
  try {
    const upstream = await fetch(
      `${FD_BASE}/competitions/${FD_COMPETITION}/matches`,
      { headers: { "X-Auth-Token": env.FOOTBALL_DATA_KEY } }
    );
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const data = await upstream.json();
    const live = (data.matches || []).filter((m) => isShown(m.status)).map(toLive);
    body = { degraded: false, live };
  } catch {
    body = { degraded: true, live: [] };
  }

  const res = Response.json(body, {
    headers: { "Cache-Control": `public, max-age=${TTL}` },
  });
  context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

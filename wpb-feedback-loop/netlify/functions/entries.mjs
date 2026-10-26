// WPB Feedback Loop: saves and reads Sunday team entries in Netlify Blobs.
// Staff use TEAM_CODE. Leaders use LEADER_CODE (unlocks the dashboard and call out names).
import { getStore } from "@netlify/blobs";

const TEAMS = [
  "New Here Start Here", "Welcome Desk", "Greeters", "Ushers",
  "Parking", "VST", "Café",
  "Production",
  "Elementary Large Group", "Elementary Small Group",
  "Babies 0 to 12 Months", "Babies 13 to 24 Months", "2 Year Olds", "3 Year Olds", "4 & 5 Year Olds",
  "Coaches", "Student Leaders",
];

const env = (k) => (globalThis.Netlify?.env?.get(k)) ?? process.env[k] ?? "";
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const slug = (a) => a.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const num = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) && n >= 0 ? Math.min(n, 999) : 0; };
const text = (v, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export default async (req) => {
  const teamCode = env("TEAM_CODE"), leaderCode = env("LEADER_CODE");
  if (!teamCode) return json({ error: "TEAM_CODE is not set in Netlify environment variables." }, 500);

  const isLeader = !!leaderCode && req.headers.get("x-leader-code") === leaderCode;
  const isTeam = isLeader || req.headers.get("x-team-code") === teamCode;
  if (!isTeam) return json({ error: "Wrong code" }, 401);

  const store = getStore({ name: "feedback-loop", consistency: "strong" });
  const url = new URL(req.url);

  if (req.method === "GET") {
    if (url.searchParams.get("check") === "leader") return json({ leader: isLeader }, isLeader ? 200 : 401);
    const { blobs } = await store.list({ prefix: "entry/" });
    const entries = [];
    for (let i = 0; i < blobs.length; i += 50) {
      const batch = await Promise.all(blobs.slice(i, i + 50).map((b) => store.get(b.key, { type: "json" })));
      batch.forEach((e) => { if (e) entries.push(isLeader ? e : { ...e, calloutNames: "" }); });
    }
    return json({ entries, leader: isLeader });
  }

  if (req.method === "POST") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.sunday || "") || !TEAMS.includes(b.area)) return json({ error: "Unknown team or date" }, 400);
    const id = `${b.sunday}_${slug(b.area)}`, key = `entry/${id}`;
    const prev = await store.get(key, { type: "json" });
    const entry = {
      id, sunday: b.sunday, area: b.area,
      volunteers: num(b.volunteers), shadows: num(b.shadows), callouts: num(b.callouts),
      shadowNames: text(b.shadowNames, 500),
      // Staff editing an entry never see call out names, so null means "keep what's saved".
      calloutNames: b.calloutNames === null && prev ? prev.calloutNames || "" : text(b.calloutNames, 500),
      wins: text(b.wins), story: text(b.story), better: text(b.better),
      createdAt: prev?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await store.setJSON(key, entry);
    return json({ ok: true });
  }

  if (req.method === "DELETE") {
    const id = url.searchParams.get("id") || "";
    if (!/^\d{4}-\d{2}-\d{2}_[a-z0-9-]+$/.test(id)) return json({ error: "Bad id" }, 400);
    await store.delete(`entry/${id}`);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/entries" };

import { getStore } from "@netlify/blobs";

const ALLOWED = ["https://pumukyflor.com", "https://www.pumukyflor.com", "https://8ni092-ji.myshopify.com"];

function cors(origin) {
  const ok = ALLOWED.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ALLOWED[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

async function gardenTotal(store) {
  const base = Number((await store.get("total", { consistency: "strong" })) || 0);
  const { blobs } = await store.list({ prefix: "e/" });
  let pending = 0;
  for (const b of blobs) pending += Number(b.key.split("-").pop()) || 0;
  return base + pending;
}

export default async (req) => {
  const origin = req.headers.get("origin") || "";
  const headers = cors(origin);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  const store = getStore({ name: "garden", consistency: "strong" });

  if (req.method === "POST") {
    if (origin && !ALLOWED.includes(origin)) return new Response("no", { status: 403, headers });
    let n = 0;
    try { n = Math.floor(Number(JSON.parse(await req.text()).n)); } catch (e) { n = 0; }
    if (!(n >= 1 && n <= 20)) return new Response("bad", { status: 400, headers });
    const key = `e/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${n}`;
    await store.set(key, String(n));
    return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "Content-Type": "application/json" } });
  }

  const total = await gardenTotal(store);
  return new Response(JSON.stringify({ total }), { headers: { ...headers, "Content-Type": "application/json" } });
};

export const config = { path: "/api/daisy" };

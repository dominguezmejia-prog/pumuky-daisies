import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore({ name: "garden", consistency: "strong" });
  const { blobs } = await store.list({ prefix: "e/" });
  if (!blobs.length) return;
  let add = 0;
  for (const b of blobs) add += Number(b.key.split("-").pop()) || 0;
  const base = Number((await store.get("total")) || 0);
  await store.set("total", String(base + add));
  for (const b of blobs) await store.delete(b.key);
};

export const config = { schedule: "*/10 * * * *" };

import { NextResponse } from "next/server";

const POKEAPI = "https://pokeapi.co/api/v2";
const CONCURRENCY = 15;

const BATTLE_CATEGORIES = [
  "held-items",
  "choice",
  "type-enhancement",
  "plates",
  "species-specific",
  "in-a-pinch",
  "bad-held-items",
  "training",
  "jewels",
  "effort-training",
];

async function fetchJSON(url: string) {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return res.json();
}

async function withConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const settled = await Promise.allSettled(batch.map(fn));
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value != null) results.push(r.value);
    }
  }
  return results;
}

export async function GET() {
  const allItems = await withConcurrency(BATTLE_CATEGORIES, async (cat) => {
    const data = await fetchJSON(`${POKEAPI}/item-category/${cat}`);
    return data?.items ?? [];
  }, CONCURRENCY);

  const seen = new Set<string>();
  const uniqueUrls: string[] = [];
  for (const group of allItems) {
    for (const item of group) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        uniqueUrls.push(item.url);
      }
    }
  }

  const details = await withConcurrency(uniqueUrls, async (url: string) => {
    const data = await fetchJSON(url);
    if (!data) return null;

    const effectEntry =
      data.effect_entries?.find((e: any) => e.language.name === "vi") ||
      data.effect_entries?.find((e: any) => e.language.name === "en");

    return {
      name: data.name,
      sprite: data.sprites?.default ?? "",
      effect: (effectEntry?.short_effect ?? effectEntry?.effect ?? "").replace(/\f/g, " ").trim(),
      category: data.category?.name ?? "",
    };
  }, CONCURRENCY);

  return NextResponse.json({ results: details.filter(Boolean) });
}

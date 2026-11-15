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
  "type-protection",
  "mega-stones",
  "z-crystals",
  "memories",
  "nature-mints",
  "stat-boosts",
];

const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

async function resolveSprite(name: string, defaultSprite: string | null): Promise<string> {
  if (defaultSprite) return defaultSprite;

  for (const folder of ["gen9", "gen8"]) {
    const url = `${SPRITE_BASE}/${folder}/${name}.png`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return url;
    } catch {
      continue;
    }
  }
  return "";
}

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

    const sprite = await resolveSprite(data.name, data.sprites?.default ?? null);

    return {
      name: data.name,
      sprite,
      effect: (effectEntry?.short_effect ?? effectEntry?.effect ?? "").replace(/\f/g, " ").trim(),
      category: data.category?.name ?? "",
    };
  }, CONCURRENCY);

  return NextResponse.json({ results: details.filter(Boolean) });
}

import { NextRequest, NextResponse } from "next/server";
import { getPokemonDetail } from "@/lib/pokeApi";

const CONCURRENCY = 15;

interface PokemonBatch {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
  sprite: string;
}

async function withConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

export async function POST(req: NextRequest) {
  const { ids }: { ids: number[] } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  const results = await withConcurrency(ids, getPokemonDetail, CONCURRENCY);

  const data: PokemonBatch[] = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => {
      const p = (r as PromiseFulfilledResult<{ id: number; name: string; types: Array<{ type: { name: string } }>; sprites: { front_default: string; other?: { "official-artwork": { front_default: string } } } }>).value;
      return {
        id: p.id,
        name: p.name,
        types: p.types,
        sprite:
          p.sprites.other?.["official-artwork"]?.front_default ||
          p.sprites.front_default,
      };
    });

  return NextResponse.json({ results: data });
}

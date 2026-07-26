import { NextRequest, NextResponse } from "next/server";
import { getPokemonDetail } from "@/lib/pokeApi";

interface PokemonBatch {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
  sprite: string;
}

export async function POST(req: NextRequest) {
  const { ids }: { ids: number[] } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  const results = await Promise.allSettled(
    ids.map((id) => getPokemonDetail(id)),
  );

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

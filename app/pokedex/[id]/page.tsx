import Image from "next/image";
import Link from "next/link";
import TypeBadge from "@/components/pokemon/TypeBadge";
import EvolutionChain from "@/components/pokemon/EvolutionChain";
import StatBar from "@/components/pokemon/StatBar";
import MovesList from "@/components/pokemon/MovesList";
import {
  getPokemonDetail,
  getPokemonSpecies,
  getEvolutionChain,
  getTypeDefense,
  getAbilityDetail,
} from "@/lib/pokeApi";
import TypeDefense from "@/components/pokemon/TypeDefense";
import AbilityTooltip from "@/components/pokemon/AbilityTooltip";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PokemonDetailPage({ params }: Props) {
  const { id } = await params;

  let pokemon, species, evolutionData;

  try {
    pokemon = await getPokemonDetail(id);
    species = await getPokemonSpecies(id);

    if (species.evolution_chain?.url) {
      evolutionData = await getEvolutionChain(species.evolution_chain.url);
    }
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">
            Pokémon không tồn tại
          </h1>
          <Link href="/pokedex" className="text-red-500 hover:underline">
            ← Quay lại Pokédex
          </Link>
        </div>
      </div>
    );
  }

  const moves = pokemon.moves || [];
  const damageRelations = await getTypeDefense(
    pokemon.types.map((t: any) => t.type.name),
  );

  const flavorTextEntry =
    species.flavor_text_entries?.find(
      (entry: any) => entry.language.name === "vi",
    ) ||
    species.flavor_text_entries?.find(
      (entry: any) => entry.language.name === "en",
    );

  const flavorText =
    flavorTextEntry?.flavor_text?.replace(/\f/g, " ") || "Không có mô tả";

  const genus =
    species.genera?.find((g: any) => g.language.name === "en")?.genus || "";

  const stats = pokemon.stats.map((stat: any) => ({
    name: stat.stat.name
      .replace("hp", "HP")
      .replace("attack", "Attack")
      .replace("defense", "Defense")
      .replace("special-attack", "Sp. Atk")
      .replace("special-defense", "Sp. Def")
      .replace("speed", "Speed"),
    value: stat.base_stat,
  }));

  // === EVOLUTION CHAIN - ĐÃ FIX ID ===
  const evolutionNames: string[] = [];
  const evolutionIds: number[] = [];

  if (evolutionData?.chain) {
    let current = evolutionData.chain;

    while (current) {
      const name = current.species.name;
      evolutionNames.push(name);

      // Cách 1: Lấy ID từ URL species
      const speciesUrl = current.species.url;
      const idMatch = speciesUrl.match(/\/pokemon\/(\d+)\//);

      if (idMatch && idMatch[1]) {
        evolutionIds.push(parseInt(idMatch[1]));
      } else {
        // Cách 2: Fallback dùng tên để tìm ID (gọi API nhỏ)
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
          const data = await res.json();
          evolutionIds.push(data.id);
        } catch {
          evolutionIds.push(0);
        }
      }

      current = current.evolves_to?.[0];
    }
  }

  const abilitiesWithDesc = await Promise.all(
    pokemon.abilities.map(async (ab: any) => {
      const detail = await getAbilityDetail(ab.ability.url);
      const effectEntry =
        detail.effect_entries?.find((e: any) => e.language.name === "vi") ||
        detail.effect_entries?.find((e: any) => e.language.name === "en");

      return {
        name: ab.ability.name,
        isHidden: ab.is_hidden,
        effect: effectEntry?.short_effect || "Không có mô tả.",
      };
    }),
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-12">
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <Link
          href="/pokedex"
          className="inline-flex items-center text-red-500 hover:text-red-600 mb-8 font-medium">
          ← Quay lại Pokédex
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100">
              <div className="relative w-80 h-80">
                <Image
                  src={
                    pokemon.sprites.other?.["official-artwork"]?.front_default ||
                    pokemon.sprites.front_default
                  }
                  alt={pokemon.name}
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                  sizes="(max-width: 768px) 300px, 400px"
                />
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-5xl font-bold text-red-500">
                #{pokemon.id.toString().padStart(3, "0")}
              </p>
              <h1 className="text-6xl font-bold capitalize mt-2 text-gray-900">
                {pokemon.name}
              </h1>
              <p className="text-xl text-gray-500 mt-1">{genus}</p>
            </div>

            <div className="mt-6">
              <TypeBadge types={pokemon.types} size="medium" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mô tả</h3>
              <p className="text-gray-600 leading-relaxed">
                {flavorText}
              </p>
            </div>

            {evolutionNames.length > 1 && (
              <EvolutionChain
                evolutionNames={evolutionNames}
                evolutionIds={evolutionIds}
              />
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-5">Chỉ số cơ bản</h3>
              <div className="space-y-4">
                {stats.map((stat: any) => (
                  <StatBar
                    key={stat.name}
                    name={stat.name}
                    value={stat.value}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Chiều cao</p>
                <p className="text-3xl font-semibold mt-1 text-gray-900">
                  {pokemon.height / 10} m
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Cân nặng</p>
                <p className="text-3xl font-semibold mt-1 text-gray-900">
                  {pokemon.weight / 10} kg
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Abilities</h3>
              <div className="flex flex-wrap gap-3">
                {abilitiesWithDesc.map((ab, index) => (
                  <AbilityTooltip
                    key={index}
                    name={ab.name}
                    effect={ab.effect}
                    isHidden={ab.isHidden}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <TypeDefense
                types={pokemon.types}
                damageRelations={damageRelations}
              />
            </div>
          </div>
        </div>
        <MovesList pokemonMoves={pokemon.moves} />
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import TypeBadge from "@/components/pokemon/TypeBadge";
import EvolutionChain from "@/components/pokemon/EvolutionChain";
import StatBar from "@/components/pokemon/StatBar";
import {
  getPokemonDetail,
  getPokemonSpecies,
  getEvolutionChain,
} from "@/lib/pokeApi";

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
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">
            Pokémon không tồn tại
          </h1>
          <Link href="/pokedex" className="text-blue-400 hover:underline">
            ← Quay lại Pokédex
          </Link>
        </div>
      </div>
    );
  }

  const flavorText =
    species.flavor_text_entries
      ?.find(
        (entry: any) =>
          entry.language.name === "vi" || entry.language.name === "en",
      )
      ?.flavor_text?.replace(/\f/g, " ") || "Không có mô tả.";

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

  // Xử lý Evolution Chain
  const evolutionNames: string[] = [];
  const evolutionIds: number[] = [];

  if (evolutionData?.chain) {
    let current = evolutionData.chain;
    while (current) {
      evolutionNames.push(current.species.name);

      // Lấy ID từ URL species
      const speciesUrl = current.species.url;
      const idMatch = speciesUrl.match(/pokemon\/(\d+)\//);
      if (idMatch) {
        evolutionIds.push(parseInt(idMatch[1]));
      } else {
        evolutionIds.push(0); // fallback
      }

      current = current.evolves_to?.[0];
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12">
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <Link
          href="/pokedex"
          className="inline-flex items-center text-red-400 hover:text-red-500 mb-8">
          ← Quay lại Pokédex
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Phần hình ảnh */}
          <div className="flex flex-col items-center">
            <div className="relative w-80 h-80 mb-8">
              <Image
                src={
                  pokemon.sprites.other?.["official-artwork"]?.front_default ||
                  pokemon.sprites.front_default
                }
                alt={pokemon.name}
                fill
                className="object-contain drop-shadow-2xl"
                priority
                sizes="(max-width: 768px) 300px, 400px"
              />
            </div>

            <div className="text-center">
              <p className="text-5xl font-bold text-red-500">
                #{pokemon.id.toString().padStart(3, "0")}
              </p>
              <h1 className="text-6xl font-bold capitalize mt-2">
                {pokemon.name}
              </h1>
              <p className="text-xl text-gray-400 mt-1">{genus}</p>
            </div>

            <div className="mt-8">
              <TypeBadge types={pokemon.types} size="medium" />
            </div>
          </div>

          {/* Phần thông tin */}
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-semibold mb-3">Mô tả</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {flavorText}
              </p>
            </div>

            {evolutionNames.length > 1 && (
              <EvolutionChain
                evolutionNames={evolutionNames}
                evolutionIds={evolutionIds}
              />
            )}

            <div>
              <h3 className="text-2xl font-semibold mb-5">Chỉ số cơ bản</h3>
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

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-900 p-6 rounded-2xl">
                <p className="text-gray-400 text-sm">Chiều cao</p>
                <p className="text-3xl font-semibold mt-1">
                  {pokemon.height / 10} m
                </p>
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl">
                <p className="text-gray-400 text-sm">Cân nặng</p>
                <p className="text-3xl font-semibold mt-1">
                  {pokemon.weight / 10} kg
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4">Abilities</h3>
              <div className="flex flex-wrap gap-3">
                {pokemon.abilities.map((ab: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-900 px-6 py-3 rounded-xl capitalize border border-gray-700">
                    {ab.ability.name.replace("-", " ")}
                    {ab.is_hidden && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Hidden)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

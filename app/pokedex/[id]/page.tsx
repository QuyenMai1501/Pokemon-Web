// app/pokedex/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import TypeBadge from "@/components/pokemon/TypeBadge";
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
    max: 255,
  }));

  // Hàm lấy tên evolution chain
  const getEvolutionNames = (chain: any): string[] => {
    const names: string[] = [];
    let current = chain?.chain;

    while (current) {
      names.push(current.species.name);
      current = current.evolves_to?.[0];
    }
    return names;
  };

  const evolutionNames = evolutionData ? getEvolutionNames(evolutionData) : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12">
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <Link
          href="/pokedex"
          className="inline-flex items-center text-red-400 hover:text-red-500 mb-8">
          ← Quay lại Pokédex
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Phần trái: Hình ảnh */}
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

          {/* Phần phải: Thông tin */}
          <div className="space-y-10">
            {/* Mô tả */}
            <div>
              <h3 className="text-2xl font-semibold mb-3">Mô tả</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {flavorText}
              </p>
            </div>

            {/* Evolution Chain */}
            {evolutionNames.length > 1 && (
              <div>
                <h3 className="text-2xl font-semibold mb-4">Chuỗi Tiến Hóa</h3>
                <div className="flex flex-wrap items-center gap-4 bg-gray-900 p-6 rounded-2xl">
                  {evolutionNames.map((name, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Link
                        href={`/pokedex/${name}`}
                        className="group flex flex-col items-center hover:scale-105 transition-transform">
                        <div className="relative w-20 h-20 bg-gray-800 rounded-2xl overflow-hidden">
                          <Image
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${name}.png`}
                            alt={name}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <p className="text-sm capitalize mt-2 text-gray-300 group-hover:text-white">
                          {name}
                        </p>
                      </Link>
                      {index < evolutionNames.length - 1 && (
                        <span className="text-3xl text-gray-600">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats, Physical, Abilities giữ nguyên */}
            <div>
              <h3 className="text-2xl font-semibold mb-5">Chỉ số cơ bản</h3>
              <div className="space-y-4">
                {stats.map((stat: any) => (
                  <div key={stat.name} className="flex items-center gap-4">
                    <div className="w-24 text-right font-medium text-gray-400">
                      {stat.name}
                    </div>
                    <div className="flex-1 bg-gray-800 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all duration-700"
                        style={{ width: `${(stat.value / stat.max) * 100}%` }}
                      />
                    </div>
                    <div className="w-12 font-mono text-right font-semibold">
                      {stat.value}
                    </div>
                  </div>
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

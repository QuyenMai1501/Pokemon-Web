// app/pokedex/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/pokemon/SearchBar";
import TypeBadge from "@/components/pokemon/TypeBadge";
import { getPokemonList } from "@/lib/pokeApi";

const generations = [
  { name: "Gen 1", offset: 0, limit: 151 },
  { name: "Gen 2", offset: 151, limit: 100 },
  { name: "Gen 3", offset: 251, limit: 135 },
];

export default function PokedexPage() {
  const [allPokemon, setAllPokemon] = useState<any[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedGen, setSelectedGen] = useState(0);

  useEffect(() => {
    const loadGen = async (genIndex: number) => {
      setLoading(true);
      const gen = generations[genIndex];
      const data = await getPokemonList(gen.limit, gen.offset);
      setAllPokemon(data.results);
      setFilteredPokemon(data.results);
      setLoading(false);
    };
    loadGen(selectedGen);
  }, [selectedGen]);

  useEffect(() => {
    let result = [...allPokemon];

    if (searchTerm) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredPokemon(result);
  }, [searchTerm, allPokemon]);

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <h1 className="text-5xl font-bold text-center text-red-500 mb-2">
          National Pokédex
        </h1>
        <p className="text-center text-gray-400 mb-10">
          Tra cứu hơn 1000 Pokémon
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <select
            value={selectedGen}
            onChange={(e) => setSelectedGen(Number(e.target.value))}
            className="bg-gray-900 border border-gray-700 rounded-xl px-6 py-3 text-white">
            {generations.map((gen, i) => (
              <option key={i} value={i}>
                {gen.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 rounded-2xl h-64 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredPokemon.map((pokemon) => {
              const id = pokemon.url.split("/").filter(Boolean).pop();
              return (
                <Link
                  href={`/pokedex/${id}`}
                  key={pokemon.name}
                  className="group">
                  <div className="bg-gray-900 rounded-3xl p-6 hover:bg-gray-800 transition-all border border-gray-800 hover:border-red-500 h-full flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                        alt={pokemon.name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 100px, 128px"
                      />
                    </div>
                    <p className="text-xl font-semibold capitalize mb-3">
                      #{id?.padStart(3, "0")} {pokemon.name}
                    </p>
                    {/* Sử dụng TypeBadge */}
                    <TypeBadge types={[]} />{" "}
                    {/* Tạm thời rỗng, sẽ lấy data thật sau */}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

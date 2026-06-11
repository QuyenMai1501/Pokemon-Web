// app/pokedex/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPokemonList } from "@/lib/pokeApi";
import SearchBar from "@/components/pokemon/SearchBar";

interface PokemonSimple {
  name: string;
  url: string;
}

export default function PokedexPage() {
  const [pokemonList, setPokemonList] = useState<PokemonSimple[]>([]);
  const [filteredList, setFilteredList] = useState<PokemonSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPokemon = async () => {
      const data = await getPokemonList(151, 0); // Gen 1 trước
      setPokemonList(data.results);
      setFilteredList(data.results);
      setLoading(false);
    };
    fetchPokemon();
  }, []);

  useEffect(() => {
    const filtered = pokemonList.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredList(filtered);
  }, [searchTerm, pokemonList]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-red-500 text-center mb-8">
          Pokédex
        </h1>

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {loading ? (
          <p className="text-center text-xl">Đang tải dữ liệu Pokédex...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredList.map((pokemon) => {
              const id = pokemon.url.split("/").filter(Boolean).pop();
              return (
                <Link
                  href={`/pokedex/${id}`}
                  key={pokemon.name}
                  className="group">
                  <div className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-all border border-gray-800 hover:border-red-500 h-full flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                        alt={pokemon.name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform"
                        sizes="(max-width: 768px) 100px, 128px"
                      />
                    </div>
                    <p className="text-xl font-semibold capitalize">
                      #{id?.padStart(3, "0")} {pokemon.name}
                    </p>
                    {/* Thêm TypeBadge sau */}
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

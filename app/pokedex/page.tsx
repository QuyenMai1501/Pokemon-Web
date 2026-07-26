"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/pokemon/SearchBar";
import TypeBadge from "@/components/pokemon/TypeBadge";
import { getPokemonList } from "@/lib/pokeApi";
import styles from "./page.module.css";

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
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>National Pokédex</h1>
        <p className={styles.subtitle}>Tra cứu hơn 1000 Pokémon</p>

        <div className={styles.controls}>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <select
            value={selectedGen}
            onChange={(e) => setSelectedGen(Number(e.target.value))}
            className={styles.select}
          >
            {generations.map((gen, i) => (
              <option key={i} value={i}>
                {gen.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.grid}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredPokemon.map((pokemon) => {
              const id = pokemon.url.split("/").filter(Boolean).pop();
              return (
                <Link
                  href={`/pokedex/${id}`}
                  key={pokemon.name}
                  className={styles.card}
                >
                  <div className={styles.spriteWrap}>
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                      alt={pokemon.name}
                      fill
                      className={styles.sprite}
                      sizes="(max-width: 768px) 100px, 128px"
                    />
                  </div>
                  <p className={styles.name}>
                    #{id?.padStart(3, "0")} {pokemon.name}
                  </p>
                  <TypeBadge types={[]} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/pokemon/SearchBar";
import TypeBadge, { typeColors } from "@/components/pokemon/TypeBadge";
import { getPokemonList } from "@/lib/pokeApi";
import styles from "./page.module.css";

const PAGE_SIZE = 20;

const generations = [
  { name: "Gen 1", offset: 0, limit: 151 },
  { name: "Gen 2", offset: 151, limit: 100 },
  { name: "Gen 3", offset: 251, limit: 135 },
  { name: "Gen 4", offset: 386, limit: 107 },
  { name: "Gen 5", offset: 493, limit: 156 },
  { name: "Gen 6", offset: 649, limit: 72 },
  { name: "Gen 7", offset: 721, limit: 88 },
  { name: "Gen 8", offset: 809, limit: 96 },
  { name: "Gen 9", offset: 905, limit: 120 },
];

const typeOptions = [
  "All", "normal", "fire", "water", "grass", "electric", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

interface PokemonItem {
  id: number;
  name: string;
  sprite: string;
  types: Array<{ type: { name: string } }>;
}

export default function PokedexPage() {
  const [allPokemon, setAllPokemon] = useState<{ name: string; url: string }[]>([]);
  const [pokemonData, setPokemonData] = useState<Record<number, PokemonItem>>({});
  const [scrollCount, setScrollCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGen, setSelectedGen] = useState(0);
  const [selectedType, setSelectedType] = useState("All");

  const visibleCount = selectedType !== "All" ? allPokemon.length : scrollCount;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const fetchedRef = useRef(new Set<number>());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const gen = generations[selectedGen];
      const data = await getPokemonList(gen.limit, gen.offset);
      setAllPokemon(data.results);
      setScrollCount(PAGE_SIZE);
      setPokemonData({});
      fetchedRef.current = new Set();
      setLoading(false);
    };
    load();
  }, [selectedGen]);

  const displayedIds = useMemo(
    () => allPokemon.slice(0, visibleCount).map((p) => {
      const id = Number(p.url.split("/").filter(Boolean).pop());
      return id;
    }),
    [allPokemon, visibleCount],
  );

  useEffect(() => {
    if (displayedIds.length === 0) return;

    const idsToFetch = displayedIds.filter((id) => !fetchedRef.current.has(id));
    if (idsToFetch.length === 0) return;

    idsToFetch.forEach((id) => fetchedRef.current.add(id));

    loadingRef.current = true;
    fetch("/api/pokedex/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idsToFetch }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPokemonData((prev) => {
          const next = { ...prev };
          for (const item of data.results) {
            next[item.id] = item;
          }
          return next;
        });
      })
      .finally(() => {
        loadingRef.current = false;
      });
  }, [displayedIds]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          setScrollCount((prev) => Math.min(prev + PAGE_SIZE, allPokemon.length));
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [allPokemon.length]);

  const filteredPokemon = useMemo(() => {
    const loaded = displayedIds
      .map((id) => pokemonData[id])
      .filter(Boolean);

    const typeFiltered = selectedType === "All"
      ? loaded
      : loaded.filter((p) => p.types.some((t) => t.type.name === selectedType));

    if (!debouncedSearch) return typeFiltered;

    const term = debouncedSearch.toLowerCase();
    return typeFiltered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.id.toString().padStart(3, "0").includes(term),
    );
  }, [debouncedSearch, displayedIds, pokemonData, selectedType]);

  const hasMore = visibleCount < allPokemon.length;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Pokédex</h1>
        <p className={styles.subtitle}>National Pokédex</p>

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

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={styles.select}
          >
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "Tất cả hệ" : t.charAt(0).toUpperCase() + t.slice(1)}
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
          <>
            <div className={styles.grid}>
              {filteredPokemon.map((pokemon) => {
                const primaryType = pokemon.types[0]?.type.name;
                const borderColor = primaryType ? typeColors[primaryType] : "#e5e7eb";

                return (
                  <Link
                    href={`/pokedex/${pokemon.id}`}
                    key={pokemon.id}
                    className={styles.card}
                    style={{ borderColor }}
                  >
                    <div className={styles.spriteWrap}>
                      <Image
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        fill
                        className={styles.sprite}
                        sizes="(max-width: 768px) 100px, 128px"
                      />
                    </div>
                    <p className={styles.idText}>
                      #{pokemon.id.toString().padStart(3, "0")}
                    </p>
                    <p className={styles.name}>{pokemon.name}</p>
                    <TypeBadge types={pokemon.types} size="small" />
                  </Link>
                );
              })}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className={styles.sentinel}>
                <div className={styles.loader} />
              </div>
            )}

            {!hasMore && allPokemon.length > 0 && (
              <p className={styles.endText}>Đã hiển thị tất cả Pokémon</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

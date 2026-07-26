import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
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
import styles from "./page.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const pokemon = await getPokemonDetail(id);
    return {
      title: `#${pokemon.id.toString().padStart(3, "0")} ${pokemon.name} — Pokédex`,
      description: `Thông tin chi tiết về Pokémon ${pokemon.name}`,
    };
  } catch {
    return { title: "Pokémon không tồn tại — Pokédex" };
  }
}

export default async function PokemonDetailPage({ params }: Props) {
  const { id } = await params;

  let pokemon, species, evolutionData, damageRelations;

  try {
    [pokemon, species] = await Promise.all([
      getPokemonDetail(id),
      getPokemonSpecies(id),
    ]);

    [evolutionData, damageRelations] = await Promise.all([
      species.evolution_chain?.url
        ? getEvolutionChain(species.evolution_chain.url)
        : Promise.resolve(null),
      getTypeDefense(pokemon.types.map((t: any) => t.type.name)),
    ]);
  } catch {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div style={{ textAlign: "center", paddingTop: "4rem" }}>
            <h1 className={styles.pokemonName}>Pokémon không tồn tại</h1>
            <Link href="/pokedex" className={styles.backLink}>
              ← Quay lại Pokédex
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const evolutionNames: string[] = [];
  const evolutionIds: number[] = [];

  if (evolutionData?.chain) {
    let current = evolutionData.chain;

    while (current) {
      const name = current.species.name;
      evolutionNames.push(name);

      const speciesUrl = current.species.url;
      const idMatch = speciesUrl.match(/\/pokemon\/(\d+)\//);

      if (idMatch && idMatch[1]) {
        evolutionIds.push(parseInt(idMatch[1]));
      } else {
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
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link href="/pokedex" className={styles.backLink}>
          ← Quay lại Pokédex
        </Link>

        <div className={styles.grid2}>
          <div className={styles.imageSection}>
            <div className={styles.imageCard}>
              <div className={styles.imageWrap}>
                <Image
                  src={
                    pokemon.sprites.other?.["official-artwork"]?.front_default ||
                    pokemon.sprites.front_default
                  }
                  alt={pokemon.name}
                  fill
                  style={{ objectFit: 'contain', filter: 'drop-shadow(0 20px 13px rgba(0,0,0,0.03))' }}
                  priority
                  sizes="(max-width: 768px) 300px, 400px"
                />
              </div>
            </div>

            <p className={styles.idText}>
              #{pokemon.id.toString().padStart(3, "0")}
            </p>
            <h1 className={styles.pokemonName}>{pokemon.name}</h1>
            <p className={styles.genus}>{genus}</p>

            <div className={styles.badgeWrap}>
              <TypeBadge types={pokemon.types} size="medium" />
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Mô tả</h3>
              <p className={styles.description}>{flavorText}</p>
            </div>

            {evolutionNames.length > 1 && (
              <EvolutionChain
                evolutionNames={evolutionNames}
                evolutionIds={evolutionIds}
              />
            )}

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Chỉ số cơ bản</h3>
              <div className={styles.statsList}>
                {stats.map((stat: any) => (
                  <StatBar
                    key={stat.name}
                    name={stat.name}
                    value={stat.value}
                  />
                ))}
              </div>
            </div>

            <div className={styles.statGrid}>
              <div className={styles.section}>
                <p className={styles.statLabel}>Chiều cao</p>
                <p className={styles.statValue}>{pokemon.height / 10} m</p>
              </div>
              <div className={styles.section}>
                <p className={styles.statLabel}>Cân nặng</p>
                <p className={styles.statValue}>{pokemon.weight / 10} kg</p>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Abilities</h3>
              <div className={styles.abilitiesList}>
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

            <div className={styles.section}>
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

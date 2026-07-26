'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from "./EvolutionChain.module.css";

interface EvolutionChainProps {
  evolutionNames: string[];
  evolutionIds: number[];
}

export default function EvolutionChain({ evolutionNames, evolutionIds }: EvolutionChainProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Chuỗi Tiến Hóa</h3>
      <div className={styles.list}>
        {evolutionNames.map((name, index) => {
          const id = evolutionIds[index] || 0;
          const nameLower = name.toLowerCase();

          return (
            <div key={index} className={styles.item}>
              <Link
                href={`/pokedex/${name}`}
                className={styles.link}
              >
                <div className={styles.imageBox}>
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                    alt={name}
                    fill
                    style={{ objectFit: 'contain', padding: '0.5rem' }}
                    sizes="96px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id || nameLower}.png`;
                    }}
                  />
                </div>
                <p className={styles.itemName}>{name}</p>
              </Link>
              {index < evolutionNames.length - 1 && (
                <span className={styles.arrow}>→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

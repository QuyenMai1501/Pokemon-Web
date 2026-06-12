// components/pokemon/EvolutionChain.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

interface EvolutionChainProps {
  evolutionNames: string[];
  evolutionIds: number[];
}

export default function EvolutionChain({ evolutionNames, evolutionIds }: EvolutionChainProps) {
  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Chuỗi Tiến Hóa</h3>
      <div className="flex flex-wrap items-center gap-6 bg-gray-900 p-6 rounded-2xl">
        {evolutionNames.map((name, index) => {
          const id = evolutionIds[index] || 0;
          const nameLower = name.toLowerCase();

          return (
            <div key={index} className="flex items-center gap-4">
              <Link
                href={`/pokedex/${name}`}
                className="group flex flex-col items-center hover:scale-105 transition-transform"
              >
                <div className="relative w-24 h-24 bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                    alt={name}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id || nameLower}.png`;
                    }}
                  />
                </div>
                <p className="text-sm capitalize mt-2 text-gray-300 group-hover:text-white text-center">
                  {name}
                </p>
              </Link>
              {index < evolutionNames.length - 1 && (
                <span className="text-4xl text-gray-600 mt-6">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
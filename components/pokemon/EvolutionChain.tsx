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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Chuỗi Tiến Hóa</h3>
      <div className="flex flex-wrap items-center gap-6">
        {evolutionNames.map((name, index) => {
          const id = evolutionIds[index] || 0;
          const nameLower = name.toLowerCase();

          return (
            <div key={index} className="flex items-center gap-4">
              <Link
                href={`/pokedex/${name}`}
                className="group flex flex-col items-center hover:scale-105 transition-transform"
              >
                <div className="relative w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
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
                <p className="text-sm capitalize mt-2 text-gray-600 group-hover:text-gray-900 text-center font-medium">
                  {name}
                </p>
              </Link>
              {index < evolutionNames.length - 1 && (
                <span className="text-4xl text-gray-300 mt-6">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
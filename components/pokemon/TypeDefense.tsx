// components/pokemon/TypeDefense.tsx
import TypeBadge from './TypeBadge';

interface TypeDefenseProps {
  types: Array<{ type: { name: string } }>;
  damageRelations: any;
}

const typeShortNames: Record<string, string> = {
  normal: 'NOR', fire: 'FIR', water: 'WAT', grass: 'GRA', electric: 'ELE',
  ice: 'ICE', fighting: 'FIG', poison: 'POI', ground: 'GRO', flying: 'FLY',
  psychic: 'PSY', bug: 'BUG', rock: 'ROC', ghost: 'GHO', dragon: 'DRA',
  dark: 'DAR', steel: 'STE', fairy: 'FAI'
};

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400', fire: 'bg-red-500', water: 'bg-blue-500', grass: 'bg-green-500',
  electric: 'bg-yellow-400', ice: 'bg-cyan-400', fighting: 'bg-orange-600', poison: 'bg-purple-600',
  ground: 'bg-amber-700', flying: 'bg-sky-400', psychic: 'bg-pink-500', bug: 'bg-lime-500',
  rock: 'bg-yellow-800', ghost: 'bg-indigo-700', dragon: 'bg-violet-600', dark: 'bg-gray-800',
  steel: 'bg-slate-400', fairy: 'bg-pink-300'
};

export default function TypeDefense({ types, damageRelations }: TypeDefenseProps) {
  const allTypes = Object.keys(typeShortNames);

  const getMultiplier = (attackType: string): number => {
    let multiplier = 1.0;

    types.forEach((defType) => {
      const typeName = defType.type.name;
      const relations = damageRelations[typeName];

      if (!relations) return;

      if (relations.noDamageFrom?.includes(attackType)) {
        multiplier = 0;
      } else if (relations.halfDamageFrom?.includes(attackType)) {
        multiplier *= 0.5;
      } else if (relations.doubleDamageFrom?.includes(attackType)) {
        multiplier *= 2;
      }
    });

    // Đảm bảo không bị float lạ
    return Math.round(multiplier * 4) / 4; // 0, 0.25, 0.5, 1, 2, 4
  };

  const getDisplayValue = (multi: number) => {
    if (multi === 0) return '0x';
    if (multi === 0.25) return '¼x';
    if (multi === 0.5) return '½x';
    if (multi === 2) return '2x';
    if (multi === 4) return '4x';
    return '1x';
  };

  const getBgColor = (multi: number) => {
    if (multi === 0) return 'bg-black text-gray-400';
    if (multi < 1) return 'bg-red-500/20 text-red-400';
    if (multi < 1/2) return 'bg-red-700/20 text-red-600'
    if (multi > 1) return 'bg-green-500/20 text-green-400';
    if (multi > 2) return 'bg-green-700/20 text-green-600'
    return 'bg-gray-800 text-gray-300';
  };

  return (
    <div className="mt-16">
      <h3 className="text-3xl font-bold mb-2">Type Defenses</h3>
      <p className="text-gray-400 mb-8">
        The effectiveness of each type on {types.map(t => t.type.name).join(" + ")}.
      </p>

      <div className="bg-gray-900 rounded-3xl p-8 border border-gray-700">
        <div className="grid grid-cols-9 gap-3 text-center">
          {allTypes.map((type) => {
            const multiplier = getMultiplier(type);
            const display = getDisplayValue(multiplier);
            const colorClass = typeColors[type] || 'bg-gray-500';

            return (
              <div key={type} className="flex flex-col items-center">
                <div className={`w-11 h-11 ${colorClass} text-white text-xs font-bold rounded-2xl flex items-center justify-center shadow-md mb-3`}>
                  {typeShortNames[type]}
                </div>
                <div className={`text-base font-bold px-5 py-2.5 rounded-2xl ${getBgColor(multiplier)}`}>
                  {display}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
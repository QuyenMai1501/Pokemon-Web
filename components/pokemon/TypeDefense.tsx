import styles from "./TypeDefense.module.css";

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
  normal: '#9ca3af', fire: '#ef4444', water: '#3b82f6', grass: '#22c55e',
  electric: '#eab308', ice: '#67e8f9', fighting: '#c2410c', poison: '#9333ea',
  ground: '#b45309', flying: '#7dd3fc', psychic: '#ec4899', bug: '#65a30d',
  rock: '#ca8a04', ghost: '#6d28d9', dragon: '#7c3aed', dark: '#1f2937',
  steel: '#94a3b8', fairy: '#f9a8d4'
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

    return Math.round(multiplier * 4) / 4;
  };

  const getDisplayValue = (multi: number) => {
    if (multi === 0) return '0x';
    if (multi === 0.25) return '¼x';
    if (multi === 0.5) return '½x';
    if (multi === 2) return '2x';
    if (multi === 4) return '4x';
    return '1x';
  };

  const getMultiplierStyle = (multi: number): React.CSSProperties => {
    if (multi === 0) return { background: '#111827', color: '#9ca3af' };
    if (multi < 1) return { background: '#fef2f2', color: '#b91c1c' };
    if (multi < 1/2) return { background: '#fecaca', color: '#991b1b' };
    if (multi > 2) return { background: '#dcfce7', color: '#15803d' };
    if (multi > 1) return { background: '#f0fdf4', color: '#166534' };
    return { background: '#f3f4f6', color: '#4b5563' };
  };

  return (
    <div>
      <h3 className={styles.title}>Type Defenses</h3>
      <p className={styles.subtitle}>
        The effectiveness of each type on {types.map(t => t.type.name).join(" + ")}.
      </p>

      <div className={styles.grid}>
        {allTypes.map((type) => {
          const multiplier = getMultiplier(type);
          const display = getDisplayValue(multiplier);
          const bgColor = typeColors[type] || '#6b7280';

          return (
            <div key={type} className={styles.col}>
              <div className={styles.typeBox} style={{ backgroundColor: bgColor }}>
                {typeShortNames[type]}
              </div>
              <div className={styles.multiplier} style={getMultiplierStyle(multiplier)}>
                {display}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

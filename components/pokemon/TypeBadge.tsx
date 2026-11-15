"use client";

import styles from "./TypeBadge.module.css";

export const typeColors: Record<string, string> = {
  normal: "#9ca3af", fire: "#ef4444", water: "#3b82f6", grass: "#22c55e",
  electric: "#eab308", ice: "#67e8f9", fighting: "#c2410c", poison: "#9333ea",
  ground: "#b45309", flying: "#7dd3fc", psychic: "#ec4899", bug: "#65a30d",
  rock: "#ca8a04", ghost: "#6d28d9", dragon: "#7c3aed", dark: "#1f2937",
  steel: "#94a3b8", fairy: "#f9a8d4",
};

const textColors: Record<string, string> = {
  normal: "#000", fire: "#fff", water: "#fff", grass: "#fff",
  electric: "#000", ice: "#000", fighting: "#fff", poison: "#fff",
  ground: "#fff", flying: "#000", psychic: "#fff", bug: "#fff",
  rock: "#fff", ghost: "#fff", dragon: "#fff", dark: "#fff",
  steel: "#000", fairy: "#000",
};

interface TypeBadgeProps {
  types: Array<{ type: { name: string } }>;
  size?: "small" | "medium";
}

export default function TypeBadge({ types, size = "medium" }: TypeBadgeProps) {
  if (!types || types.length === 0) {
    return <div className={styles.placeholder}></div>;
  }

  const sizeClass = size === "small" ? styles.small : styles.medium;

  return (
    <div className={styles.wrap}>
      {types.map((t, index) => {
        const typeName = t.type.name;
        const bg = typeColors[typeName] || "#6b7280";
        const color = textColors[typeName] || "#fff";

        return (
          <span
            key={index}
            className={`${styles.badge} ${sizeClass}`}
            style={{ backgroundColor: bg, color }}
          >
            {typeName}
          </span>
        );
      })}
    </div>
  );
}

"use client";

const typeColors: Record<string, string> = {
  normal: "bg-gray-400 text-black",
  fire: "bg-red-500 text-white",
  water: "bg-blue-500 text-white",
  grass: "bg-green-500 text-white",
  electric: "bg-yellow-400 text-black",
  ice: "bg-cyan-300 text-black",
  fighting: "bg-orange-700 text-white",
  poison: "bg-purple-600 text-white",
  ground: "bg-amber-700 text-white",
  flying: "bg-sky-400 text-black",
  psychic: "bg-pink-500 text-white",
  bug: "bg-lime-500 text-black",
  rock: "bg-yellow-800 text-white",
  ghost: "bg-indigo-700 text-white",
  dragon: "bg-violet-600 text-white",
  dark: "bg-gray-800 text-white",
  steel: "bg-slate-400 text-black",
  fairy: "bg-pink-300 text-black",
};

interface TypeBadgeProps {
  types: Array<{ type: { name: string } }>;
  size?: "small" | "medium";
}

export default function TypeBadge({ types, size = "medium" }: TypeBadgeProps) {
  if (!types || types.length === 0) {
    return <div className="h-6"></div>;
  }

  const badgeSize =
    size === "small" ? "px-3 py-0.5 text-xs" : "px-4 py-1 text-sm font-medium";

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {types.map((t, index) => {
        const typeName = t.type.name;
        const colorClass = typeColors[typeName] || "bg-gray-500 text-white";

        return (
          <span
            key={index}
            className={`inline-block rounded-full capitalize ${colorClass} ${badgeSize} shadow-sm`}>
            {typeName}
          </span>
        );
      })}
    </div>
  );
}

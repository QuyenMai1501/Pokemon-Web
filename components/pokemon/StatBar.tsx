interface StatBarProps {
  name: string;
  value: number;
  max?: number;
}

export default function StatBar({ name, value, max = 255 }: StatBarProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-right font-medium text-gray-400">{name}</div>
      <div className="flex-1 bg-gray-800 h-3 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 transition-all duration-700"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <div className="w-12 font-mono text-right font-semibold">{value}</div>
    </div>
  );
}

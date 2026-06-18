// components/pokemon/AbilityTooltip.tsx
'use client';

import { useState } from 'react';

interface AbilityProps {
  name: string;
  effect: string;
  isHidden?: boolean;
}

export default function AbilityTooltip({ name, effect, isHidden }: AbilityProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="bg-gray-900 px-6 py-3 rounded-xl capitalize border border-gray-700 cursor-help hover:border-red-500 transition-colors flex items-center gap-2">
        {name.replace('-', ' ')}
        {isHidden && <span className="text-xs text-amber-400">(Hidden)</span>}
      </div>

      {showTooltip && (
        <div className="absolute z-50 w-80 bg-gray-900 border border-gray-600 rounded-2xl p-4 text-sm shadow-2xl -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
          <p className="text-gray-300 leading-relaxed">{effect}</p>
        </div>
      )}
    </div>
  );
}
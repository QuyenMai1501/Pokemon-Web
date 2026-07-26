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
      <div className="bg-white px-6 py-3 rounded-xl capitalize border border-gray-200 cursor-help hover:border-red-500 transition-colors flex items-center gap-2 shadow-sm text-gray-800 font-medium">
        {name.replace('-', ' ')}
        {isHidden && <span className="text-xs text-amber-600">(Hidden)</span>}
      </div>

      {showTooltip && (
        <div className="absolute z-50 w-80 bg-white border border-gray-200 rounded-2xl p-4 text-sm shadow-lg -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
          <p className="text-gray-700 leading-relaxed">{effect}</p>
        </div>
      )}
    </div>
  );
}
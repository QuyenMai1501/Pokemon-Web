'use client';

import { useState } from 'react';
import styles from "./AbilityTooltip.module.css";

interface AbilityProps {
  name: string;
  effect: string;
  isHidden?: boolean;
}

export default function AbilityTooltip({ name, effect, isHidden }: AbilityProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={styles.badge}>
        {name.replace('-', ' ')}
        {isHidden && <span className={styles.hiddenLabel}>(Hidden)</span>}
      </div>

      {showTooltip && (
        <div className={styles.tooltip}>
          <p className={styles.tooltipText}>{effect}</p>
        </div>
      )}
    </div>
  );
}

import styles from "./StatBar.module.css";

interface StatBarProps {
  name: string;
  value: number;
  max?: number;
}

export default function StatBar({ name, value, max = 255 }: StatBarProps) {
  return (
    <div className={styles.row}>
      <div className={styles.label}>{name}</div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}

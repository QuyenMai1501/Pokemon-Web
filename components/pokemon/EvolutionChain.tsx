'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from "./EvolutionChain.module.css";

interface EvolutionEntry {
  id: number;
  name: string;
}

interface EvolutionForm extends EvolutionEntry {
  category: "regional" | "mega" | "other";
  label: string;
}

interface EvolutionChainProps {
  stages: EvolutionEntry[][];
  forms: EvolutionForm[];
}

function FormGroup({ title, forms }: { title: string; forms: EvolutionForm[] }) {
  if (forms.length === 0) return null;

  return (
    <div className={styles.formGroup}>
      <h4 className={styles.formTitle}>{title}</h4>
      <div className={styles.formList}>
        {forms.map((form) => (
          <Link key={form.id} href={`/pokedex/${form.id}`} className={styles.link}>
            <div className={styles.imageBox}>
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${form.id}.png`}
                alt={form.name}
                fill
                style={{ objectFit: "contain", padding: "0.5rem" }}
                sizes="96px"
              />
            </div>
            <p className={styles.itemName}>{form.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function EvolutionChain({ stages, forms }: EvolutionChainProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Chuỗi Tiến Hóa</h3>
      {stages.length > 1 && (
        <div className={styles.stages}>
          {stages.map((stage, stageIndex) => (
            <div key={stageIndex} className={styles.stage}>
              {stageIndex > 0 && <span className={styles.arrow}>→</span>}
              <div className={styles.stageItems}>
                {stage.map((entry) => (
                  <Link key={entry.id} href={`/pokedex/${entry.id}`} className={styles.link}>
                <div className={styles.imageBox}>
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.id}.png`}
                    alt={entry.name}
                    fill
                    style={{ objectFit: "contain", padding: "0.5rem" }}
                    sizes="96px"
                  />
                </div>
                    <p className={styles.itemName}>{entry.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <FormGroup
        title="Dạng vùng miền"
        forms={forms.filter((form) => form.category === "regional")}
      />
      <FormGroup
        title="Dạng Mega"
        forms={forms.filter((form) => form.category === "mega")}
      />
      <FormGroup
        title="Dạng khác"
        forms={forms.filter((form) => form.category === "other")}
      />
    </div>
  );
}

'use client';

import styles from "./SearchBar.module.css";

interface Props {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function SearchBar({ searchTerm, setSearchTerm }: Props) {
  return (
    <div className={styles.wrap}>
      <input
        type="text"
        placeholder="Tìm Pokémon (ví dụ: pikachu, charizard...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.input}
      />
    </div>
  );
}

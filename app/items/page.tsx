"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import styles from "./page.module.css";

interface ItemData {
  name: string;
  sprite: string;
  effect: string;
  category: string;
}

export default function ItemsPage() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/items/list")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.results);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category));
    return ["all", ...Array.from(cats).sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return items.filter((item) => {
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchSearch = !term || item.name.toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [items, searchTerm, selectedCategory]);

  const categoryLabel = (cat: string) =>
    cat === "all" ? "Tất cả" : cat.replace(/-/g, " ");

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Vật Phẩm</h1>
        <p className={styles.subtitle}>Trang bị có thể đeo được trong Pokémon</p>

        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Tìm vật phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.select}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabel(cat)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.grid}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <p className={styles.empty}>Không tìm thấy vật phẩm nào.</p>
        ) : (
          <div className={styles.grid}>
            {filteredItems.map((item) => (
              <div key={item.name} className={styles.card}>
                <div className={styles.spriteWrap}>
                  {item.sprite ? (
                    <Image src={item.sprite} alt={item.name} fill className={styles.sprite} sizes="80px" />
                  ) : (
                    <div className={styles.noSprite}>?</div>
                  )}
                </div>
                <p className={styles.name}>{item.name.replace(/-/g, " ")}</p>
                <span className={styles.categoryBadge}>
                  {categoryLabel(item.category)}
                </span>
                <p className={styles.effect}>{item.effect}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

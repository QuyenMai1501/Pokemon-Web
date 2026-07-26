"use client";

import { useState, useEffect, useMemo } from "react";
import TypeBadge from "./TypeBadge";
import { getMoveDetail } from "@/lib/pokeApi";
import styles from "./MovesList.module.css";

interface MoveDetail {
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damageClass: string;
  effect: string;
  level: number;
  method: string;
}

interface MovesListProps {
  pokemonMoves: any[];
}

export default function MovesList({ pokemonMoves }: MovesListProps) {
  const [moves, setMoves] = useState<MoveDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");

  useEffect(() => {
    const fetchMoves = async () => {
      setLoading(true);
      const detailedMoves: MoveDetail[] = [];

      for (const m of pokemonMoves.slice(0, 80)) {
        const detail = await getMoveDetail(m.move.url);
        if (detail) {
          const versionDetail = m.version_group_details[0] || {};
          const effectEntry =
            detail.effect_entries?.find(
              (e: { language: { name: string }; short_effect: string }) => e.language.name === "vi",
            ) ||
            detail.effect_entries?.find(
              (e: { language: { name: string }; short_effect: string }) => e.language.name === "en",
            );
          const rawEffect = effectEntry?.short_effect || "";

          detailedMoves.push({
            name: detail.name.replace(/-/g, " "),
            type: detail.type.name,
            power: detail.power,
            accuracy: detail.accuracy,
            pp: detail.pp,
            damageClass: detail.damage_class?.name || "status",
            effect: rawEffect || "Không có mô tả",
            level: versionDetail.level_learned_at || 0,
            method: versionDetail.move_learn_method?.name || "level-up",
          });
        }
      }

      setMoves(detailedMoves);
      setLoading(false);
    };

    if (pokemonMoves.length > 0) fetchMoves();
  }, [pokemonMoves]);

  const filteredMoves = useMemo(() => {
    return moves
      .filter((move) => {
        const matchSearch = move.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchMethod =
          filterMethod === "all" || move.method === filterMethod;
        return matchSearch && matchMethod;
      })
      .sort((a, b) => {
        if (a.method === "level-up" && b.method === "level-up")
          return a.level - b.level;
        return a.name.localeCompare(b.name);
      });
  }, [moves, searchTerm, filterMethod]);

  if (loading) {
    return <div className={styles.loading}>Đang tải danh sách chiêu thức...</div>;
  }

  const methodBadge = (method: string, level: number) => {
    if (method === "level-up") return <span className={styles.badgeLevelUp}>Level {level}</span>;
    if (method === "machine") return <span className={styles.badgeMachine}>TM/HM</span>;
    if (method === "egg") return <span className={styles.badgeEgg}>Egg</span>;
    return <span className={styles.badge}>{method}</span>;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Danh sách Chiêu Thức</h3>

        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Tìm chiêu thức..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tất cả cách học</option>
            <option value="level-up">Level Up</option>
            <option value="machine">TM/HM</option>
            <option value="tutor">Tutor</option>
            <option value="egg">Egg</option>
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Chiêu Thức</th>
              <th className={styles.th}>Hệ</th>
              <th className={styles.thCenter}>Power</th>
              <th className={styles.thCenter}>Accuracy</th>
              <th className={styles.thCenter}>PP</th>
              <th className={styles.th}>Loại</th>
              <th className={styles.th}>Cách Học</th>
              <th className={styles.th}>Hiệu Ứng</th>
            </tr>
          </thead>
          <tbody>
            {filteredMoves.map((move, index) => (
              <tr key={index} className={styles.row}>
                <td className={styles.cellName}>{move.name}</td>
                <td className={styles.cell}>
                  <TypeBadge
                    types={[{ type: { name: move.type } }]}
                    size="small"
                  />
                </td>
                <td className={styles.cellMono}>{move.power || "-"}</td>
                <td className={styles.cellNumber}>
                  {move.accuracy ? `${move.accuracy}%` : "-"}
                </td>
                <td className={styles.cellNumber}>{move.pp}</td>
                <td className={styles.cellType}>{move.damageClass}</td>
                <td className={styles.cell}>{methodBadge(move.method, move.level)}</td>
                <td className={styles.cellEffect}>{move.effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMoves.length === 0 && (
        <p className={styles.empty}>Không tìm thấy chiêu thức nào phù hợp.</p>
      )}
    </div>
  );
}

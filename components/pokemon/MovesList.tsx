// components/pokemon/MovesList.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import TypeBadge from "./TypeBadge";
import { getMoveDetail } from "@/lib/pokeApi";

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
        // Giới hạn 80 move để tránh quá tải
        const detail = await getMoveDetail(m.move.url);
        if (detail) {
          const versionDetail = m.version_group_details[0] || {};
          detailedMoves.push({
            name: detail.name.replace(/-/g, " "),
            type: detail.type.name,
            power: detail.power,
            accuracy: detail.accuracy,
            pp: detail.pp,
            damageClass: detail.damage_class?.name || "status",
            effect:
              detail.effect_entries?.[0]?.short_effect || "Không có mô tả",
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
    return (
      <div className="text-center py-12 text-gray-400">
        Đang tải danh sách chiêu thức...
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h3 className="text-3xl font-bold">Danh sách Chiêu Thức</h3>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm chiêu thức..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-5 py-3 w-72 focus:outline-none focus:border-red-500"
          />

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-5 py-3">
            <option value="all">Tất cả cách học</option>
            <option value="level-up">Level Up</option>
            <option value="machine">TM/HM</option>
            <option value="tutor">Tutor</option>
            <option value="egg">Egg</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              <th className="p-5 text-left font-semibold">Chiêu Thức</th>
              <th className="p-5 text-left font-semibold">Hệ</th>
              <th className="p-5 text-center font-semibold">Power</th>
              <th className="p-5 text-center font-semibold">Accuracy</th>
              <th className="p-5 text-center font-semibold">PP</th>
              <th className="p-5 text-left font-semibold">Loại</th>
              <th className="p-5 text-left font-semibold">Cách Học</th>
              <th className="p-5 text-left font-semibold">Hiệu Ứng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredMoves.map((move, index) => (
              <tr
                key={index}
                className="hover:bg-gray-800/70 transition-colors">
                <td className="p-5 font-medium capitalize">{move.name}</td>
                <td className="p-5">
                  <TypeBadge
                    types={[{ type: { name: move.type } }]}
                    size="small"
                  />
                </td>
                <td className="p-5 text-center font-mono font-bold">
                  {move.power || "-"}
                </td>
                <td className="p-5 text-center font-mono">
                  {move.accuracy ? `${move.accuracy}%` : "-"}
                </td>
                <td className="p-5 text-center font-mono">{move.pp}</td>
                <td className="p-5 capitalize">{move.damageClass}</td>
                <td className="p-5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs capitalize
                    ${move.method === "level-up" ? "bg-green-500/20 text-green-400" : ""}
                    ${move.method === "machine" ? "bg-blue-500/20 text-blue-400" : ""}
                    ${move.method === "egg" ? "bg-purple-500/20 text-purple-400" : ""}
                  `}>
                    {move.method === "level-up"
                      ? `Level ${move.level}`
                      : move.method}
                  </span>
                </td>
                <td className="p-5 text-sm text-gray-300 max-w-md">
                  {move.effect}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMoves.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Không tìm thấy chiêu thức nào phù hợp.
        </p>
      )}
    </div>
  );
}

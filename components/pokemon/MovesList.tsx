"use client";

import { useMemo, useState } from "react";

interface Move {
  move: { name: string; url: string };
  version_group_details: any[];
}

interface MovesListProps {
  moves: Move[];
}

export default function MovesList({ moves }: MovesListProps) {
  const [searchMove, setsearchMove] = useState("");
  const [selectedMethod, setselectedMethod] = useState("all");

  const processedMoves = useMemo(() => {
    return moves
      .map((m) => {
        const method =
          m.version_group_details[0]?.move_learn_method.name || "level-up";
        const level = m.version_group_details[0]?.level_learned_at || 0;
        return {
          name: m.move.name.replace("-", " "),
          method,
          level,
        };
      })
      .sort((a, b) => {
        if (a.method === "level-up" && b.method === "level-up")
          return a.level - b.level;
        return a.method.localeCompare(b.method);
      });
  }, [moves]);

  const filteredMoves = processedMoves.filter((move) => {
    const matchSearch = move.name
      .toLowerCase()
      .includes(searchMove.toLowerCase());
    const matchMethod =
      selectedMethod === "all" || move.method === selectedMethod;
    return matchSearch && matchMethod;
  });

  const methods = ["all", "level-up", "machine", "tutor", "egg"];

  return (
    <div className="mt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-2xl font-semibold">Các Chiêu Thức Có Thể Học</h3>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Tìm chiêu thức..."
            value={searchMove}
            onChange={(e) => setsearchMove(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm w-64"
          />

          <select
            value={selectedMethod}
            onChange={(e) => setselectedMethod(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm">
            {methods.map((m) => (
              <option key={m} value={m}>
                {m === "all" ? "Tất cả" : m.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 font-medium text-gray-400">
                Chiêu Thức
              </th>
              <th className="text-left p-4 font-medium text-gray-400">
                Cách Học
              </th>
              <th className="text-left p-4 font-medium text-gray-400">Level</th>
            </tr>
          </thead>
          <tbody>
            {filteredMoves.length > 0 ? (
              filteredMoves.map((move, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 capitalize font-medium">{move.name}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs capitalize
                      ${move.method === "level-up" ? "bg-green-500/20 text-green-400" : ""}
                      ${move.method === "machine" ? "bg-blue-500/20 text-blue-400" : ""}
                      ${move.method === "tutor" ? "bg-purple-500/20 text-purple-400" : ""}
                    `}>
                      {move.method}
                    </span>
                  </td>
                  <td className="p-4 font-mono">
                    {move.method === "level-up" && move.level > 0
                      ? move.level
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  Không tìm thấy chiêu thức nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Hiển thị dựa trên phiên bản mặc định (Red/Blue/Yellow và sau)
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import type { BattleState } from "@/lib/battle";
import styles from "./page.module.css";

const typeColors: Record<string, string> = {
  normal: "#9ca3af", fire: "#ef4444", water: "#3b82f6", grass: "#22c55e",
  electric: "#eab308", ice: "#67e8f9", fighting: "#c2410c", poison: "#9333ea",
  ground: "#b45309", flying: "#7dd3fc", psychic: "#ec4899", bug: "#65a30d",
  rock: "#ca8a04", ghost: "#6d28d9", dragon: "#7c3aed", dark: "#1f2937",
  steel: "#94a3b8", fairy: "#f9a8d4",
};
const textColors: Record<string, string> = {
  normal: "#000", fire: "#fff", water: "#fff", grass: "#fff",
  electric: "#000", ice: "#000", fighting: "#fff", poison: "#fff",
  ground: "#fff", flying: "#000", psychic: "#fff", bug: "#fff",
  rock: "#fff", ghost: "#fff", dragon: "#fff", dark: "#fff",
  steel: "#000", fairy: "#000",
};

interface TeamEntry {
  id: string;
  name: string;
}

export default function BattlePage() {
  const { status } = useSession();

  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [battling, setBattling] = useState(false);
  const [state, setState] = useState<BattleState | null>(null);
  const [moveLoading, setMoveLoading] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "unauthenticated") setLoading(false);
      return;
    }
    fetch("/api/team-builder")
      .then((r) => r.json())
      .then((data) => {
        setTeams(data.teams || []);
        if (data.teams?.length > 0) setSelectedTeamId(data.teams[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state?.log]);

  const startBattle = async () => {
    if (!selectedTeamId) return;
    setBattling(true);
    try {
      const res = await fetch("/api/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: selectedTeamId }),
      });
      const data = await res.json();
      if (data.state) setState(data.state);
    } catch {
      setBattling(false);
    }
  };

  const makeMove = async (moveIndex: number) => {
    if (!state || state.winner || moveLoading) return;
    setMoveLoading(true);
    try {
      const res = await fetch(`/api/battle/${state.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moveIndex }),
      });
      const data = await res.json();
      if (data.state) setState(data.state);
    } finally {
      setMoveLoading(false);
    }
  };

  const resetBattle = () => {
    setState(null);
    setBattling(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Đấu trường</h1>
          <div className={styles.loader} />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Đấu trường</h1>
          <div className={styles.messageBox}>
            <p className={styles.messageTitle}>Đăng nhập để tham gia đấu trường</p>
            <p className={styles.messageText}>Bạn cần đăng nhập để có thể đấu với AI.</p>
            <Link href="/auth/signin" className={styles.actionBtn}>Đăng nhập</Link>
          </div>
        </div>
      </div>
    );
  }

  if (teams.length === 0 && !battling) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Đấu trường</h1>
          <div className={styles.messageBox}>
            <p className={styles.messageTitle}>Chưa có đội nào</p>
            <p className={styles.messageText}>Bạn cần xây dựng đội hình trước khi tham gia đấu trường.</p>
            <Link href="/team-builder" className={styles.actionBtn}>Xây Team</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Đấu trường</h1>
          <p className={styles.subtitle}>Chọn đội để tham chiến</p>
          <div className={styles.teamSelect}>
            <select
              className={styles.select}
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              className={styles.actionBtn}
              onClick={startBattle}
              disabled={!selectedTeamId}
            >
              Bắt đầu đấu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const playerPokemon = state.playerTeam[state.playerActive];
  const opponentPokemon = state.opponentTeam[state.opponentActive];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Đấu trường</h1>

        <div className={styles.battleField}>
          <div className={styles.opponentArea}>
            <div className={styles.spriteBox}>
              <Image
                src={opponentPokemon?.sprite || ""}
                alt={opponentPokemon?.name || ""}
                fill
                sizes="128px"
                style={{ objectFit: "contain" }}
                className={styles.battleSprite}
              />
            </div>
            <div className={styles.infoBox}>
              <p className={styles.pokemonName}>{opponentPokemon?.name}</p>
              <p className={styles.levelText}>Lv.{opponentPokemon?.level}</p>
              <div className={styles.hpBarOuter}>
                <div
                  className={styles.hpBarInner}
                  style={{
                    width: opponentPokemon ? `${(opponentPokemon.currentHp / opponentPokemon.maxHp) * 100}%` : "0%",
                    background: opponentPokemon && opponentPokemon.currentHp / opponentPokemon.maxHp <= 0.25
                      ? "#ef4444" : "#22c55e",
                  }}
                />
              </div>
              <p className={styles.hpText}>
                {opponentPokemon?.currentHp}/{opponentPokemon?.maxHp}
              </p>
            </div>
            <div className={styles.teamIcons}>
              {state.opponentTeam.map((p, i) => (
                <span
                  key={i}
                  className={`${styles.teamDot} ${i === state.opponentActive ? styles.teamDotActive : ""} ${p.currentHp <= 0 ? styles.teamDotFainted : ""}`}
                  title={p.name}
                />
              ))}
            </div>
          </div>

          <div className={styles.battleLogWrap}>
            <div className={styles.battleLog}>
              {state.log.map((line, i) => (
                <p key={i} className={styles.logLine}>{line}</p>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          <div className={styles.playerArea}>
            <div className={styles.teamIcons}>
              {state.playerTeam.map((p, i) => (
                <span
                  key={i}
                  className={`${styles.teamDot} ${i === state.playerActive ? styles.teamDotActive : ""} ${p.currentHp <= 0 ? styles.teamDotFainted : ""}`}
                  title={p.name}
                />
              ))}
            </div>
            <div className={styles.infoBox}>
              <p className={styles.pokemonName}>{playerPokemon?.name}</p>
              <p className={styles.levelText}>Lv.{playerPokemon?.level}</p>
              <div className={styles.hpBarOuter}>
                <div
                  className={styles.hpBarInner}
                  style={{
                    width: playerPokemon ? `${(playerPokemon.currentHp / playerPokemon.maxHp) * 100}%` : "0%",
                    background: playerPokemon && playerPokemon.currentHp / playerPokemon.maxHp <= 0.25
                      ? "#ef4444" : "#22c55e",
                  }}
                />
              </div>
              <p className={styles.hpText}>
                {playerPokemon?.currentHp}/{playerPokemon?.maxHp}
              </p>
            </div>
            <div className={styles.spriteBox}>
              <Image
                src={playerPokemon?.sprite || ""}
                alt={playerPokemon?.name || ""}
                fill
                sizes="128px"
                style={{ objectFit: "contain" }}
                className={styles.battleSprite}
              />
            </div>
          </div>

          {state.winner ? (
            <div className={styles.resultBanner}>
              <h2 className={state.winner === "player" ? styles.winText : styles.loseText}>
                {state.winner === "player" ? "🎉 CHIẾN THẮNG!" : "😵 THUA CUỘC!"}
              </h2>
              <p className={styles.turnCount}>Kết thúc sau {state.turn} lượt</p>
              <button className={styles.actionBtn} onClick={resetBattle}>
                Đấu lại
              </button>
            </div>
          ) : (
            <div className={styles.moveGrid}>
              {playerPokemon?.moves.map((move, i) => {
                const disabled = moveLoading || move.currentPp <= 0;
                return (
                  <button
                    key={i}
                    className={`${styles.moveBtn} ${disabled ? styles.moveDisabled : ""}`}
                    onClick={() => makeMove(i)}
                    disabled={disabled}
                    style={{
                      borderColor: typeColors[move.type] || "#6b7280",
                    }}
                  >
                    <span
                      className={styles.moveTypeBadge}
                      style={{
                        backgroundColor: typeColors[move.type] || "#6b7280",
                        color: textColors[move.type] || "#fff",
                      }}
                    >
                      {move.type}
                    </span>
                    <span className={styles.moveName}>{move.name.replace(/-/g, " ")}</span>
                    <span className={styles.movePp}>PP {move.currentPp}/{move.pp}</span>
                    <span className={styles.movePower}>
                      {move.damageClass === "status" ? "—" : `${move.power}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { getPokemonList, getPokemonDetail } from "@/lib/pokeApi";
import styles from "./page.module.css";

interface PokemonSlot {
  pokemonId: number | null;
  nickname: string;
  ability: string | null;
  heldItem: string | null;
  moves: string[];
  nature: string | null;
}

interface TeamData {
  id: string;
  name: string;
  pokemon: (PokemonSlot & { id: string })[];
}

interface PokemonEntry {
  name: string;
  id: number;
}

interface PokemonCacheEntry {
  abilities: string[];
  moves: string[];
  sprite: string;
}

const NATURES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky",
];

function emptySlots(): PokemonSlot[] {
  return Array.from({ length: 6 }, () => ({
    pokemonId: null,
    nickname: "",
    ability: null,
    heldItem: null,
    moves: [],
    nature: null,
  }));
}

function PokemonSprite({ pokemonId, className }: { pokemonId: number; className?: string }) {
  return (
    <Image
      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
      alt=""
      fill
      sizes="80px"
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

export default function TeamBuilderPage() {
  const { data: session, status } = useSession();

  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftSlots, setDraftSlots] = useState<PokemonSlot[]>(emptySlots());

  const [editingSlotIdx, setEditingSlotIdx] = useState<number | null>(null);
  const [modalPokemonSearch, setModalPokemonSearch] = useState("");
  const [modalPokemonId, setModalPokemonId] = useState<number | null>(null);
  const [modalAbilities, setModalAbilities] = useState<string[]>([]);
  const [modalAllMoves, setModalAllMoves] = useState<string[]>([]);
  const [modalAbility, setModalAbility] = useState("");
  const [modalItem, setModalItem] = useState("");
  const [modalMoves, setModalMoves] = useState<string[]>([]);
  const [modalMoveSearch, setModalMoveSearch] = useState("");
  const [modalNature, setModalNature] = useState("");

  const [allPokemonList, setAllPokemonList] = useState<PokemonEntry[]>([]);
  const [itemsList, setItemsList] = useState<{ name: string }[]>([]);
  const [pokemonCache, setPokemonCache] = useState<Record<number, PokemonCacheEntry>>({});

  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "unauthenticated") setLoading(false);
      return;
    }
    fetch("/api/team-builder")
      .then((r) => r.json())
      .then((data) => {
        setTeams(data.teams);
        if (data.teams.length > 0) {
          const t = data.teams[0];
          setDraftName(t.name);
          setDraftSlots(t.pokemon.map((p: any) => ({
            pokemonId: p.pokemonId || null,
            nickname: p.nickname || "",
            ability: p.ability || null,
            heldItem: p.heldItem || null,
            moves: p.moves || [],
            nature: p.nature || null,
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    getPokemonList(2000, 0).then((data) => {
      setAllPokemonList(
        data.results.map((p: any) => ({
          name: p.name,
          id: Number(p.url.split("/").filter(Boolean).pop()),
        })),
      );
    });
  }, []);

  useEffect(() => {
    fetch("/api/items/list")
      .then((r) => r.json())
      .then((data) => setItemsList(data.results || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!modalPokemonId) return;
    if (pokemonCache[modalPokemonId]) {
      const c = pokemonCache[modalPokemonId];
      setModalAbilities(c.abilities);
      setModalAllMoves(c.moves);
      return;
    }
    let cancelled = false;
    getPokemonDetail(modalPokemonId)
      .then((detail) => {
        if (cancelled) return;
        const abilities = detail.abilities.map((a: any) => a.ability.name);
        const moves = detail.moves.map((m: any) => m.move.name).sort();
        setPokemonCache((prev) => ({
          ...prev,
          [modalPokemonId]: { abilities, moves, sprite: detail.sprites.front_default },
        }));
        if (!cancelled) {
          setModalAbilities(abilities);
          setModalAllMoves(moves);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [modalPokemonId, pokemonCache]);

  const filteredPokemon = useMemo(() => {
    if (!modalPokemonSearch) return [];
    const term = modalPokemonSearch.toLowerCase();
    return allPokemonList
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.id.toString().padStart(3, "0").includes(term),
      )
      .slice(0, 40);
  }, [modalPokemonSearch, allPokemonList]);

  const filteredMoves = useMemo(() => {
    if (!modalMoveSearch) return modalAllMoves;
    const term = modalMoveSearch.toLowerCase();
    return modalAllMoves.filter((m) => m.includes(term));
  }, [modalMoveSearch, modalAllMoves]);

  const handleCreateTeam = async () => {
    if (teams.length >= 4) return;
    try {
      const res = await fetch("/api/team-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Đội ${teams.length + 1}` }),
      });
      const data = await res.json();
      if (!data.team) return;
      const newTeam = data.team;
      setTeams((prev) => [...prev, newTeam]);
      setActiveIdx(teams.length);
      setDraftName(newTeam.name);
      setDraftSlots(
        newTeam.pokemon.map((p: any) => ({
          pokemonId: p.pokemonId || null,
          nickname: p.nickname || "",
          ability: p.ability || null,
          heldItem: p.heldItem || null,
          moves: p.moves || [],
          nature: p.nature || null,
        })),
      );
    } catch {}
  };

  const handleSaveTeam = async () => {
    const team = teams[activeIdx];
    if (!team) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/team-builder/${team.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draftName, pokemon: draftSlots }),
      });
      const data = await res.json();
      if (data.team) {
        setTeams((prev) => {
          const next = [...prev];
          next[activeIdx] = data.team;
          return next;
        });
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    const team = teams[activeIdx];
    if (!team || !confirm(`Xóa đội "${team.name}"?`)) return;
    try {
      await fetch(`/api/team-builder/${team.id}`, { method: "DELETE" });
      const next = teams.filter((_, i) => i !== activeIdx);
      setTeams(next);
      if (next.length === 0) {
        setDraftName("");
        setDraftSlots(emptySlots());
      } else {
        const idx = Math.min(activeIdx, next.length - 1);
        setActiveIdx(idx);
        setDraftName(next[idx].name);
        setDraftSlots(
          next[idx].pokemon.map((p: any) => ({
            pokemonId: p.pokemonId || null,
            nickname: p.nickname || "",
            ability: p.ability || null,
            heldItem: p.heldItem || null,
            moves: p.moves || [],
            nature: p.nature || null,
          })),
        );
      }
    } catch {}
  };

  const switchTeam = (idx: number) => {
    setActiveIdx(idx);
    const team = teams[idx];
    setDraftName(team.name);
    setDraftSlots(
      team.pokemon.map((p: any) => ({
        pokemonId: p.pokemonId || null,
        nickname: p.nickname || "",
        ability: p.ability || null,
        heldItem: p.heldItem || null,
        moves: p.moves || [],
        nature: p.nature || null,
      })),
    );
  };

  const openSlotEditor = (idx: number) => {
    const slot = draftSlots[idx];
    setEditingSlotIdx(idx);
    setModalPokemonSearch("");
    setModalPokemonId(slot.pokemonId);
    setModalAbility(slot.ability || "");
    setModalItem(slot.heldItem || "");
    setModalMoves([...slot.moves]);
    setModalMoveSearch("");
    setModalNature(slot.nature || "");
    setModalAbilities([]);
    setModalAllMoves([]);
  };

  const confirmSlot = () => {
    if (editingSlotIdx === null) return;
    setDraftSlots((prev) => {
      const next = [...prev];
      next[editingSlotIdx] = {
        pokemonId: modalPokemonId,
        nickname: "",
        ability: modalAbility || null,
        heldItem: modalItem || null,
        moves: modalMoves,
        nature: modalNature || null,
      };
      return next;
    });
    setEditingSlotIdx(null);
  };

  const handleSelectPokemon = (id: number) => {
    setModalPokemonId(id);
    setModalAbility("");
    setModalMoves([]);
    setModalMoveSearch("");
    setModalNature("");
  };

  const toggleMove = (move: string) => {
    setModalMoves((prev) => {
      if (prev.includes(move)) return prev.filter((m) => m !== move);
      if (prev.length >= 4) return prev;
      return [...prev, move];
    });
  };

  const reorderSlot = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= 6) return;
    setDraftSlots((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Xây Team</h1>
          <div className={styles.loader} />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Xây Team</h1>
          <div className={styles.messageBox}>
            <p className={styles.messageTitle}>Đăng nhập để sử dụng Team Builder</p>
            <p className={styles.messageText}>
              Bạn cần đăng nhập để tạo và quản lý đội hình Pokémon.
            </p>
            <Link href="/auth/signin" className={styles.loginLink}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Xây Team</h1>
          <p className={styles.subtitle}>Tạo đội hình Pokémon của bạn</p>
          <div className={styles.messageBox}>
            <p className={styles.messageTitle}>Chưa có đội nào</p>
            <p className={styles.messageText}>
              Tạo đội đầu tiên để bắt đầu xây dựng đội hình.
            </p>
            <button onClick={handleCreateTeam} className={styles.emptyAction}>
              + Tạo đội
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Xây Team</h1>
        <p className={styles.subtitle}>Xây dựng đội hình Pokémon của bạn</p>

        <div className={styles.tabs}>
          {teams.map((team, i) => (
            <button
              key={team.id}
              onClick={() => switchTeam(i)}
              className={i === activeIdx ? styles.tabActive : styles.tab}
            >
              {team.name}
            </button>
          ))}
          {teams.length < 4 && (
            <button
              onClick={handleCreateTeam}
              className={styles.tabAdd}
              title="Thêm đội"
            >
              +
            </button>
          )}
        </div>

        <div className={styles.teamHeader}>
          <input
            className={styles.teamNameInput}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Tên đội"
          />
        </div>

        <div className={styles.slotGrid}>
          {draftSlots.map((slot, i) => {
            const cached = slot.pokemonId ? pokemonCache[slot.pokemonId] : null;
            const name = slot.pokemonId
              ? allPokemonList.find((p) => p.id === slot.pokemonId)?.name
              : null;
            return (
              <div
                key={i}
                className={styles.slot}
                onClick={() => openSlotEditor(i)}
              >
                <span className={styles.slotNumber}>#{i + 1}</span>

                {cached ? (
                  <div className={styles.slotSprite}>
                    <Image
                      src={cached.sprite}
                      alt=""
                      fill
                      sizes="80px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                ) : slot.pokemonId ? (
                  <div className={styles.slotSprite}>
                    <PokemonSprite pokemonId={slot.pokemonId} />
                  </div>
                ) : (
                  <div className={styles.slotEmpty}>?</div>
                )}

                {name ? (
                  <span className={styles.slotName}>{name}</span>
                ) : (
                  <span className={styles.slotEmptyLabel}>Trống</span>
                )}

                {slot.moves.length > 0 && (
                  <div className={styles.slotMoves}>
                    {slot.moves.map((m) => (
                      <span key={m} className={styles.slotMove}>
                        {m.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                )}

                {!slot.pokemonId && (
                  <span className={styles.slotReveal}>Nhấn để chọn</span>
                )}

                <div
                  className={styles.slotReorder}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    disabled={i === 0}
                    onClick={() => reorderSlot(i, -1)}
                  >
                    ▲
                  </button>
                  <button
                    disabled={i === 5}
                    onClick={() => reorderSlot(i, 1)}
                  >
                    ▼
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={handleSaveTeam}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu đội"}
          </button>
          <button className={styles.btnDanger} onClick={handleDeleteTeam}>
            Xóa đội
          </button>
        </div>

        {editingSlotIdx !== null && (
          <div
            className={styles.overlay}
            onClick={() => setEditingSlotIdx(null)}
          >
            <div
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={styles.modalTitle}>
                Slot #{editingSlotIdx + 1}
              </h2>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Pokémon</label>
                {modalPokemonId ? (
                  <div
                    className={styles.selectedPokemonInfo}
                    onClick={() => {
                      setModalPokemonId(null);
                      setModalPokemonSearch("");
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "2.5rem",
                        height: "2.5rem",
                      }}
                    >
                      <PokemonSprite pokemonId={modalPokemonId} />
                    </div>
                    <span>
                      {allPokemonList.find((p) => p.id === modalPokemonId)
                        ?.name || `#${modalPokemonId}`}
                    </span>
                    <span className={styles.changeLink}>Đổi</span>
                  </div>
                ) : (
                  <>
                    <input
                      className={styles.pokemonSearchInput}
                      placeholder="Tìm Pokémon..."
                      value={modalPokemonSearch}
                      onChange={(e) => setModalPokemonSearch(e.target.value)}
                      autoFocus
                    />
                    {modalPokemonSearch && filteredPokemon.length > 0 && (
                      <div className={styles.pokemonResults}>
                        {filteredPokemon.map((p) => (
                          <div
                            key={p.id}
                            className={styles.pokemonResult}
                            onClick={() => handleSelectPokemon(p.id)}
                          >
                            <div className={styles.pokemonResultSprite}>
                              <PokemonSprite pokemonId={p.id} />
                            </div>
                            <span className={styles.pokemonResultId}>
                              #{p.id.toString().padStart(3, "0")}
                            </span>
                            <span className={styles.pokemonResultName}>
                              {p.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {modalPokemonId && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ability</label>
                    <select
                      className={styles.formSelect}
                      value={modalAbility}
                      onChange={(e) => setModalAbility(e.target.value)}
                    >
                      <option value="">-- Chọn ability --</option>
                      {modalAbilities.map((a) => (
                        <option key={a} value={a}>
                          {a.replace(/-/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Item</label>
                    <select
                      className={styles.formSelect}
                      value={modalItem}
                      onChange={(e) => setModalItem(e.target.value)}
                    >
                      <option value="">-- Không có item --</option>
                      {itemsList.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name.replace(/-/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Moves (chọn tối đa 4)
                    </label>
                    <input
                      className={styles.moveSearchInput}
                      placeholder="Tìm move..."
                      value={modalMoveSearch}
                      onChange={(e) => setModalMoveSearch(e.target.value)}
                    />
                    {modalAllMoves.length > 0 && (
                      <div className={styles.moveList}>
                        {filteredMoves.map((move) => (
                          <div
                            key={move}
                            className={`${styles.moveItem} ${modalMoves.includes(move) ? styles.selected : ""}`}
                            onClick={() => toggleMove(move)}
                          >
                            <input
                              type="checkbox"
                              checked={modalMoves.includes(move)}
                              onChange={() => toggleMove(move)}
                            />
                            <span className={styles.moveItemName}>
                              {move.replace(/-/g, " ")}
                            </span>
                          </div>
                        ))}
                        {filteredMoves.length === 0 && (
                          <div
                            style={{
                              padding: "0.75rem",
                              color: "#9ca3af",
                              fontSize: "0.85rem",
                            }}
                          >
                            Không tìm thấy move
                          </div>
                        )}
                      </div>
                    )}
                    <p className={styles.moveCount}>
                      {modalMoves.length}/4 moves
                    </p>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nature</label>
                    <select
                      className={styles.formSelect}
                      value={modalNature}
                      onChange={(e) => setModalNature(e.target.value)}
                    >
                      <option value="">-- Chọn nature --</option>
                      {NATURES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className={styles.modalActions}>
                <button
                  className={styles.btnCancel}
                  onClick={() => setEditingSlotIdx(null)}
                >
                  Hủy
                </button>
                <button
                  className={styles.btnConfirm}
                  onClick={confirmSlot}
                  disabled={!modalPokemonId}
                >
                  Xong
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

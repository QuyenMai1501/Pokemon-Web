"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { getPokemonList, getPokemonDetail } from "@/lib/pokeApi";
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

interface MoveDetail {
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
}

interface ItemEntry {
  name: string;
  sprite: string;
  effect: string;
}

interface PokemonCacheEntry {
  abilityNames: string[];
  abilityUrls: string[];
  moveNames: string[];
  moveUrls: string[];
  sprite: string;
}

const NATURES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky",
];

const NATURE_DESCRIPTIONS: Record<string, string> = {
  Hardy: "—",
  Lonely: "Tấn công +, Phòng thủ -",
  Brave: "Tấn công +, Tốc độ -",
  Adamant: "Tấn công +, Sp. Tấn công -",
  Naughty: "Tấn công +, Sp. Phòng thủ -",
  Bold: "Phòng thủ +, Tấn công -",
  Docile: "—",
  Relaxed: "Phòng thủ +, Tốc độ -",
  Impish: "Phòng thủ +, Sp. Tấn công -",
  Lax: "Phòng thủ +, Sp. Phòng thủ -",
  Timid: "Tốc độ +, Tấn công -",
  Hasty: "Tốc độ +, Phòng thủ -",
  Serious: "—",
  Jolly: "Tốc độ +, Sp. Tấn công -",
  Naive: "Tốc độ +, Sp. Phòng thủ -",
  Modest: "Sp. Tấn công +, Tấn công -",
  Mild: "Sp. Tấn công +, Phòng thủ -",
  Quiet: "Sp. Tấn công +, Tốc độ -",
  Bashful: "—",
  Rash: "Sp. Tấn công +, Sp. Phòng thủ -",
  Calm: "Sp. Phòng thủ +, Tấn công -",
  Gentle: "Sp. Phòng thủ +, Phòng thủ -",
  Sassy: "Sp. Phòng thủ +, Tốc độ -",
  Careful: "Sp. Phòng thủ +, Sp. Tấn công -",
  Quirky: "—",
};

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
  const [modalMoves, setModalMoves] = useState<string[]>([]);
  const [modalMoveSearch, setModalMoveSearch] = useState("");
  const [modalNature, setModalNature] = useState("");

  const [allPokemonList, setAllPokemonList] = useState<PokemonEntry[]>([]);
  const [itemsList, setItemsList] = useState<ItemEntry[]>([]);
  const [pokemonCache, setPokemonCache] = useState<Record<number, PokemonCacheEntry>>({});

  const [moveDetails, setMoveDetails] = useState<Record<string, MoveDetail>>({});
  const [abilityEffects, setAbilityEffects] = useState<Record<string, string>>({});
  const [hoveredAbility, setHoveredAbility] = useState<string | null>(null);
  const [hoveredMove, setHoveredMove] = useState<string | null>(null);
  const [hoveredNature, setHoveredNature] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [itemPickerSlot, setItemPickerSlot] = useState<number | null>(null);
  const [itemPickerSearch, setItemPickerSearch] = useState("");

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
      setModalAbilities(c.abilityNames);
      setModalAllMoves(c.moveNames);
      return;
    }
    let cancelled = false;
    getPokemonDetail(modalPokemonId)
      .then(async (detail) => {
        if (cancelled) return;

        const abilities = detail.abilities.map((a: any) => ({ name: a.ability.name, url: a.ability.url }));
        const moveEntries = detail.moves.map((m: any) => ({ name: m.move.name, url: m.move.url }));
        moveEntries.sort((a: any, b: any) => a.name.localeCompare(b.name));

        const abilityNames = abilities.map((a: any) => a.name);
        const abilityUrls = abilities.map((a: any) => a.url);
        const moveNames = moveEntries.map((m: any) => m.name);
        const moveUrls = moveEntries.map((m: any) => m.url);

        setPokemonCache((prev) => ({
          ...prev,
          [modalPokemonId]: { abilityNames, abilityUrls, moveNames, moveUrls, sprite: detail.sprites.front_default },
        }));

        if (!cancelled) {
          setModalAbilities(abilityNames);
          setModalAllMoves(moveNames);

          const effects: Record<string, string> = {};
          const abilityResults = await Promise.allSettled(
            abilityUrls.map((url: string) =>
              fetch(url).then((r) => r.json()).then((data) => {
                const entry = data.effect_entries?.find((e: any) => e.language.name === "vi") ||
                  data.effect_entries?.find((e: any) => e.language.name === "en");
                return { name: data.name, effect: entry?.short_effect || "Không có mô tả." };
              }),
            ),
          );
          abilityResults.forEach((r) => {
            if (r.status === "fulfilled" && r.value) {
              effects[r.value.name] = r.value.effect;
            }
          });
          if (!cancelled) setAbilityEffects((prev) => ({ ...prev, ...effects }));

          const moveMap: Record<string, MoveDetail> = {};
          const moveResults = await Promise.allSettled(
            moveUrls.map((url: string) =>
              fetch(url).then((r) => r.json()).then((data) => ({
                name: data.name,
                type: data.type?.name || "normal",
                power: data.power,
                accuracy: data.accuracy,
                pp: data.pp,
              })),
            ),
          );
          moveResults.forEach((r) => {
            if (r.status === "fulfilled" && r.value) {
              const { name, ...rest } = r.value;
              moveMap[name] = rest;
            }
          });
          if (!cancelled) setMoveDetails((prev) => ({ ...prev, ...moveMap }));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [modalPokemonId]);

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

  const filteredPickerItems = useMemo(() => {
    if (!itemPickerSearch) return itemsList;
    const term = itemPickerSearch.toLowerCase();
    return itemsList.filter((item) => item.name.toLowerCase().includes(term));
  }, [itemPickerSearch, itemsList]);

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
        heldItem: next[editingSlotIdx].heldItem,
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

  const handleItemSelect = (itemName: string) => {
    if (itemPickerSlot === null) return;
    setDraftSlots((prev) => {
      const next = [...prev];
      next[itemPickerSlot] = { ...next[itemPickerSlot], heldItem: itemName };
      return next;
    });
    setItemPickerSlot(null);
    setItemPickerSearch("");
  };

  const handleRemoveItem = () => {
    if (itemPickerSlot === null) return;
    setDraftSlots((prev) => {
      const next = [...prev];
      next[itemPickerSlot] = { ...next[itemPickerSlot], heldItem: null };
      return next;
    });
    setItemPickerSlot(null);
    setItemPickerSearch("");
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
            const item = slot.heldItem ? itemsList.find((it) => it.name === slot.heldItem) : null;
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
                    {slot.moves.map((m) => {
                      const md = moveDetails[m];
                      return (
                        <span
                          key={m}
                          className={styles.slotMove}
                          style={md ? { backgroundColor: typeColors[md.type] + "22", color: typeColors[md.type], borderColor: typeColors[md.type] } : undefined}
                        >
                          {m.replace(/-/g, " ")}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className={styles.slotItemArea}
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemPickerSlot(i);
                    setItemPickerSearch("");
                  }}
                >
                  {item?.sprite ? (
                    <Image src={item.sprite} alt="" width={22} height={22} style={{ objectFit: "contain" }} />
                  ) : (
                    <span className={styles.slotItemPlus}>+</span>
                  )}
                </div>

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
                    <div className={styles.abilityList}>
                      {modalAbilities.map((a) => (
                        <div
                          key={a}
                          className={`${styles.abilityItem} ${modalAbility === a ? styles.abilitySelected : ""}`}
                          onClick={() => setModalAbility(a)}
                          onMouseEnter={(e) => {
                            setHoveredAbility(a);
                            if (abilityEffects[a]) {
                              const r = e.currentTarget.getBoundingClientRect();
                              setTooltip({ text: abilityEffects[a], x: r.right + 10, y: r.top + r.height / 2 });
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredAbility(null);
                            setTooltip(null);
                          }}
                        >
                          <span className={styles.abilityDot} />
                          <span className={styles.abilityName}>
                            {a.replace(/-/g, " ")}
                          </span>
                        </div>
                      ))}
                      {modalAbilities.length === 0 && (
                        <p className={styles.loadingText}>Đang tải...</p>
                      )}
                    </div>
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
                        {filteredMoves.map((move) => {
                          const md = moveDetails[move];
                          return (
                            <div
                              key={move}
                              className={`${styles.moveItem} ${modalMoves.includes(move) ? styles.selected : ""}`}
                              onClick={() => toggleMove(move)}
                              onMouseEnter={() => setHoveredMove(move)}
                              onMouseLeave={() => setHoveredMove(null)}
                            >
                              {md && (
                                <span
                                  className={styles.moveTypeBadge}
                                  style={{
                                    backgroundColor: typeColors[md.type] || "#6b7280",
                                    color: textColors[md.type] || "#fff",
                                  }}
                                >
                                  {md.type}
                                </span>
                              )}
                              <span className={styles.moveItemName}>
                                {move.replace(/-/g, " ")}
                              </span>
                              {hoveredMove === move && md && (
                                <span className={styles.moveTooltip}>
                                  Power: {md.power ?? "-"} | Acc: {md.accuracy != null ? `${md.accuracy}%` : "-"} | PP: {md.pp}
                                </span>
                              )}
                            </div>
                          );
                        })}
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
                    <div className={styles.natureGrid}>
                      {NATURES.map((n) => (
                        <div
                          key={n}
                          className={`${styles.natureItem} ${modalNature === n ? styles.natureSelected : ""}`}
                          onClick={() => setModalNature(modalNature === n ? "" : n)}
                          onMouseEnter={(e) => {
                            setHoveredNature(n);
                            const r = e.currentTarget.getBoundingClientRect();
                            setTooltip({ text: NATURE_DESCRIPTIONS[n], x: r.right + 10, y: r.top + r.height / 2 });
                          }}
                          onMouseLeave={() => {
                            setHoveredNature(null);
                            setTooltip(null);
                          }}
                        >
                          <span className={styles.natureDot} />
                          <span className={styles.natureName}>{n}</span>
                        </div>
                      ))}
                    </div>
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
            {tooltip && (
              <div
                className={styles.globalTooltip}
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                {tooltip.text}
              </div>
            )}
          </div>
        )}

        {itemPickerSlot !== null && (
          <div
            className={styles.overlay}
            onClick={() => { setItemPickerSlot(null); setItemPickerSearch(""); }}
          >
            <div
              className={styles.itemPicker}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={styles.itemPickerTitle}>Chọn vật phẩm</h3>
              <input
                className={styles.itemPickerInput}
                placeholder="Tìm vật phẩm..."
                value={itemPickerSearch}
                onChange={(e) => setItemPickerSearch(e.target.value)}
                autoFocus
              />
              <div className={styles.itemPickerGrid}>
                {filteredPickerItems.map((item) => (
                  <div
                    key={item.name}
                    className={styles.itemPickerItem}
                    onClick={() => handleItemSelect(item.name)}
                  >
                    <div className={styles.itemPickerSprite}>
                      {item.sprite ? (
                        <Image src={item.sprite} alt="" fill sizes="36px" style={{ objectFit: "contain" }} />
                      ) : (
                        <span>?</span>
                      )}
                    </div>
                    <span className={styles.itemPickerName}>
                      {item.name.replace(/-/g, " ")}
                    </span>
                  </div>
                ))}
                {filteredPickerItems.length === 0 && (
                  <p className={styles.itemPickerEmpty}>Không tìm thấy vật phẩm.</p>
                )}
              </div>
              <div className={styles.itemPickerActions}>
                <button
                  className={styles.btnDanger}
                  onClick={handleRemoveItem}
                >
                  Bỏ vật phẩm
                </button>
                <button
                  className={styles.btnCancel}
                  onClick={() => { setItemPickerSlot(null); setItemPickerSearch(""); }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export interface BattleMove {
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  currentPp: number;
  damageClass: "physical" | "special" | "status";
}

export interface BattlePokemon {
  pokemonId: number;
  name: string;
  sprite: string;
  types: string[];
  level: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  currentHp: number;
  maxHp: number;
  moves: BattleMove[];
}

export interface BattleState {
  id: string;
  userId: string;
  playerActive: number;
  playerTeam: BattlePokemon[];
  opponentActive: number;
  opponentTeam: BattlePokemon[];
  turn: number;
  log: string[];
  winner: "player" | "opponent" | null;
}

const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { fire: 0.5, water: 0.5, grass: 0.5, electric: 0.5, dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

function getTypeEffectiveness(moveType: string, defenderTypes: string[]): number {
  let multiplier = 1;
  for (const defType of defenderTypes) {
    const eff = TYPE_CHART[moveType]?.[defType];
    if (eff !== undefined) multiplier *= eff;
  }
  return multiplier;
}

const TYPE_EFFECT_LABELS: Record<string, string> = {
  "0": "không hiệu quả",
  "0.25": "rất ít hiệu quả",
  "0.5": "ít hiệu quả",
  "1": "",
  "2": "hiệu quả!",
  "4": "siêu hiệu quả!!",
};

export function calculateDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: BattleMove,
): { damage: number; effectiveness: string } {
  if (move.damageClass === "status" || !move.power) return { damage: 0, effectiveness: "" };

  const isSpecial = move.damageClass === "special";
  const attackStat = isSpecial ? attacker.stats.spAtk : attacker.stats.attack;
  const defenseStat = isSpecial ? defender.stats.spDef : defender.stats.defense;

  const base = Math.floor(Math.floor((2 * attacker.level / 5 + 2) * move.power * attackStat / defenseStat) / 50 + 2);

  const typeEff = getTypeEffectiveness(move.type, defender.types);
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const crit = Math.random() < 0.0625 ? 1.5 : 1;

  const damage = Math.max(1, Math.floor(base * typeEff * stab * crit));

  const effKey = String(typeEff);
  const effectiveness = TYPE_EFFECT_LABELS[effKey] || "";

  return { damage, effectiveness };
}

export function pickAiMove(pokemon: BattlePokemon): number {
  const usableMoves = pokemon.moves
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m.power > 0 && m.currentPp > 0);
  if (usableMoves.length === 0) {
    const anyMove = pokemon.moves.findIndex((m) => m.currentPp > 0);
    return anyMove >= 0 ? anyMove : 0;
  }
  return usableMoves[Math.floor(Math.random() * usableMoves.length)].i;
}

export function processTurn(state: BattleState, playerMoveIndex: number): BattleState {
  const newState: BattleState = JSON.parse(JSON.stringify(state));
  const turn = newState.turn + 1;
  newState.turn = turn;

  const playerPokemon = newState.playerTeam[newState.playerActive];
  const opponentPokemon = newState.opponentTeam[newState.opponentActive];

  if (!playerPokemon || !opponentPokemon) return newState;
  if (playerMoveIndex < 0 || playerMoveIndex >= playerPokemon.moves.length) return newState;

  const playerMove = playerPokemon.moves[playerMoveIndex];
  if (playerMove.currentPp <= 0) return newState;

  playerMove.currentPp--;

  const playerFirst = playerPokemon.stats.speed >= opponentPokemon.stats.speed;

  const log: string[] = [];
  log.push(`--- Lượt ${turn} ---`);

  const executeMove = (
    attacker: BattlePokemon,
    defender: BattlePokemon,
    move: BattleMove,
    attackerName: string,
    defenderName: string,
  ) => {
    const accCheck = move.accuracy != null ? Math.random() * 100 < move.accuracy : true;
    if (!accCheck) {
      log.push(`${attackerName} dùng ${move.name.replace(/-/g, " ")} nhưng trượt!`);
      return false;
    }

    const { damage, effectiveness } = calculateDamage(attacker, defender, move);

    if (damage <= 0) {
      log.push(`${attackerName} dùng ${move.name.replace(/-/g, " ")} — không có hiệu quả!`);
      return false;
    }

    defender.currentHp = Math.max(0, defender.currentHp - damage);
    const effMsg = effectiveness ? ` (${effectiveness})` : "";
    log.push(`${attackerName} dùng ${move.name.replace(/-/g, " ")}${effMsg}`);
    log.push(`Gây ${damage} sát thương!`);

    if (damage > 0 && Math.random() < 0.0625) {
      log.push("Đòn đánh trúng chí mạng!");
    }

    if (defender.currentHp <= 0) {
      log.push(`${defenderName} đã ngất!`);
      return true;
    }
    return false;
  };

  const getOrderedMoves = () => {
    if (playerFirst) {
      const aiMoveIndex = pickAiMove(opponentPokemon);
      const aiMove = opponentPokemon.moves[aiMoveIndex];
      aiMove.currentPp--;
      return [
        { attacker: playerPokemon, defender: opponentPokemon, move: playerMove, attackerName: playerPokemon.name, defenderName: opponentPokemon.name, isPlayer: true, aiMoveIndex },
        { attacker: opponentPokemon, defender: playerPokemon, move: aiMove, attackerName: opponentPokemon.name, defenderName: playerPokemon.name, isPlayer: false, aiMoveIndex },
      ];
    } else {
      const aiMoveIndex = pickAiMove(opponentPokemon);
      const aiMove = opponentPokemon.moves[aiMoveIndex];
      aiMove.currentPp--;
      return [
        { attacker: opponentPokemon, defender: playerPokemon, move: aiMove, attackerName: opponentPokemon.name, defenderName: playerPokemon.name, isPlayer: false, aiMoveIndex },
        { attacker: playerPokemon, defender: opponentPokemon, move: playerMove, attackerName: playerPokemon.name, defenderName: opponentPokemon.name, isPlayer: true, aiMoveIndex },
      ];
    }
  };

  const moves = getOrderedMoves();

  for (const m of moves) {
    const defender = m.isPlayer ? newState.opponentTeam[newState.opponentActive] : newState.playerTeam[newState.playerActive];
    const attacker = m.isPlayer ? newState.playerTeam[newState.playerActive] : newState.opponentTeam[newState.opponentActive];
    if (!defender || !attacker) break;
    if (defender.currentHp <= 0) break;

    executeMove(
      attacker,
      defender,
      m.move,
      m.attackerName,
      m.defenderName,
    );
  }

  const playerFainted = newState.playerTeam.every((p) => p.currentHp <= 0);
  const opponentFainted = newState.opponentTeam.every((p) => p.currentHp <= 0);

  if (opponentFainted) {
    newState.winner = "player";
    log.push("🎉 Chiến thắng! Đối thủ không còn Pokémon nào!");
  } else if (playerFainted) {
    newState.winner = "opponent";
    log.push("😵 Thua cuộc! Đội của bạn đã ngất hết!");
  } else {
    if (newState.opponentTeam[newState.opponentActive].currentHp <= 0) {
      const nextIdx = newState.opponentTeam.findIndex((p) => p.currentHp > 0);
      if (nextIdx >= 0) {
        newState.opponentActive = nextIdx;
        log.push(`Đối thủ gọi ${newState.opponentTeam[nextIdx].name}!`);
      }
    }
    if (newState.playerTeam[newState.playerActive].currentHp <= 0) {
      const nextIdx = newState.playerTeam.findIndex((p) => p.currentHp > 0);
      if (nextIdx >= 0) {
        newState.playerActive = nextIdx;
        log.push(`Bạn gọi ${newState.playerTeam[nextIdx].name}!`);
      }
    }
  }

  newState.log = [...state.log, ...log];
  return newState;
}

export async function fetchMoveDetail(moveName: string): Promise<BattleMove | null> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name,
      type: data.type?.name || "normal",
      power: data.power || 0,
      accuracy: data.accuracy ?? 100,
      pp: data.pp || 10,
      currentPp: data.pp || 10,
      damageClass: data.damage_class?.name || "status",
    };
  } catch {
    return null;
  }
}

export async function fetchPokemonBattleData(pokemonId: number) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  return res.json();
}

export function buildStats(baseStats: Record<string, number>, level: number) {
  const hp = Math.floor(baseStats.hp + level + 10);
  const calcStat = (base: number) => Math.floor(base + 5);
  return {
    hp,
    attack: calcStat(baseStats.attack),
    defense: calcStat(baseStats.defense),
    spAtk: calcStat(baseStats.spAtk),
    spDef: calcStat(baseStats.spDef),
    speed: calcStat(baseStats.speed),
  };
}

export const battleStates = new Map<string, BattleState>();

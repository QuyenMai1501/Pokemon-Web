import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { battleStates, fetchPokemonBattleData, fetchMoveDetail, buildStats, type BattleState, type BattlePokemon } from "@/lib/battle";

const AI_TEAM_POOL = 151;

async function buildPlayerTeam(pokemonInstances: any[]): Promise<BattlePokemon[]> {
  const team: BattlePokemon[] = [];

  for (const inst of pokemonInstances) {
    const data = await fetchPokemonBattleData(inst.pokemonId);
    if (!data) continue;

    const baseStats: Record<string, number> = {};
    for (const s of data.stats) {
      baseStats[s.stat.name] = s.base_stat;
    }

    const level = 50;
    const calcStats = buildStats(baseStats, level);

    const moveResults = await Promise.allSettled(
      (inst.moves as string[]).map((name: string) => fetchMoveDetail(name)),
    );
    const moves = moveResults
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    team.push({
      pokemonId: inst.pokemonId,
      name: data.name,
      sprite: data.sprites.other?.["official-artwork"]?.front_default || data.sprites.front_default,
      types: data.types.map((t: any) => t.type.name),
      level,
      stats: calcStats,
      currentHp: calcStats.hp,
      maxHp: calcStats.hp,
      moves,
    });
  }

  return team;
}

async function generateAiTeam(): Promise<BattlePokemon[]> {
  const listRes = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${AI_TEAM_POOL}&offset=0`, {
    next: { revalidate: 86400 },
  });
  const listData = await listRes.json();
  const pool: { name: string; url: string }[] = listData.results;

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  const team: BattlePokemon[] = [];

  for (const entry of selected) {
    const id = Number(entry.url.split("/").filter(Boolean).pop());
    const data = await fetchPokemonBattleData(id);
    if (!data) continue;

    const baseStats: Record<string, number> = {};
    for (const s of data.stats) {
      baseStats[s.stat.name] = s.base_stat;
    }

    const learnsetMoves = data.moves
      .filter((m: any) =>
        m.version_group_details.some(
          (v: any) =>
            v.move_learn_method.name === "level-up" &&
            v.level_learned_at <= 50,
        ),
      )
      .map((m: any) => m.move.name);

    const shuffledMoves = [...learnsetMoves].sort(() => Math.random() - 0.5);
    const chosen = shuffledMoves.slice(0, Math.min(4, shuffledMoves.length));

    const moveResults = await Promise.allSettled(chosen.map((name: string) => fetchMoveDetail(name)));
    const moves = moveResults
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    const level = 50;
    const calcStats = buildStats(baseStats, level);

    team.push({
      pokemonId: id,
      name: data.name,
      sprite: data.sprites.other?.["official-artwork"]?.front_default || data.sprites.front_default,
      types: data.types.map((t: any) => t.type.name),
      level,
      stats: calcStats,
      currentHp: calcStats.hp,
      maxHp: calcStats.hp,
      moves,
    });
  }

  return team;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await req.json();
  if (!teamId) {
    return NextResponse.json({ error: "Missing teamId" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { pokemon: { orderBy: { order: "asc" } } },
  });

  if (!team || team.userId !== session.user.id) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const playerTeam = await buildPlayerTeam(team.pokemon);
  if (playerTeam.length === 0) {
    return NextResponse.json({ error: "Team has no valid Pokemon" }, { status: 400 });
  }

  const opponentTeam = await generateAiTeam();

  const battleId = crypto.randomUUID();

  const initialState: BattleState = {
    id: battleId,
    userId: session.user.id,
    playerActive: 0,
    playerTeam,
    opponentActive: 0,
    opponentTeam,
    turn: 0,
    log: [`Trận đấu bắt đầu!`],
    winner: null,
  };

  battleStates.set(battleId, initialState);

  return NextResponse.json({ state: initialState });
}

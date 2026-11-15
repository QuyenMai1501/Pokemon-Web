import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const team = await prisma.team.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!team || team.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { name?: unknown; pokemon?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, pokemon } = body;

  if (!Array.isArray(pokemon) || pokemon.length > 6) {
    return NextResponse.json({ error: "pokemon must be an array of at most 6" }, { status: 400 });
  }

  for (const p of pokemon) {
    if (!p || typeof p !== "object") {
      return NextResponse.json({ error: "Invalid pokemon entry" }, { status: 400 });
    }
    const entry = p as Record<string, unknown>;
    if (typeof entry.pokemonId !== "number" || !Number.isInteger(entry.pokemonId) || entry.pokemonId < 1) {
      return NextResponse.json({ error: "pokemonId must be a positive integer" }, { status: 400 });
    }
    if (entry.moves !== undefined && !Array.isArray(entry.moves)) {
      return NextResponse.json({ error: "moves must be an array" }, { status: 400 });
    }
    if (Array.isArray(entry.moves) && entry.moves.some((m) => typeof m !== "string")) {
      return NextResponse.json({ error: "moves must be strings" }, { status: 400 });
    }
  }

  const teamName =
    typeof name === "string" && name.trim().length > 0
      ? name.trim().slice(0, 191)
      : "Đội mới";

  // Atomic: delete old instances + create new ones in a single nested update.
  // If anything fails, the whole operation rolls back (no partial data loss).
  const updated = await prisma.team.update({
    where: { id },
    data: {
      name: teamName,
      pokemon: {
        deleteMany: {},
        create: (pokemon as any[]).map((p, i) => ({
          pokemonId: p.pokemonId,
          nickname: typeof p.nickname === "string" ? p.nickname.slice(0, 191) : "",
          ability: typeof p.ability === "string" ? p.ability : "",
          heldItem: typeof p.heldItem === "string" ? p.heldItem : "",
          moves: Array.isArray(p.moves) ? p.moves : [],
          nature: typeof p.nature === "string" ? p.nature : "",
          ivs: {},
          evs: {},
          order: i,
        })),
      },
    },
    include: {
      pokemon: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json({ team: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const team = await prisma.team.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!team || team.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.team.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

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

  const { name, pokemon } = await req.json();

  await prisma.pokemonInstance.deleteMany({ where: { teamId: id } });

  const updated = await prisma.team.update({
    where: { id },
    data: {
      name,
      pokemon: {
        create: (pokemon as any[]).map((p, i) => ({
          pokemonId: p.pokemonId ?? 0,
          nickname: p.nickname ?? "",
          ability: p.ability ?? "",
          heldItem: p.heldItem ?? "",
          moves: p.moves ?? [],
          nature: p.nature ?? "",
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

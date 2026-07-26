import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    include: {
      pokemon: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json({ teams });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  const count = await prisma.team.count({
    where: { userId: session.user.id },
  });

  if (count >= 4) {
    return NextResponse.json({ error: "Tối đa 4 đội" }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: {
      name: name || "Đội mới",
      userId: session.user.id,
      pokemon: {
        create: Array.from({ length: 6 }, (_, i) => ({
          pokemonId: 0,
          ability: "",
          moves: [],
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

  return NextResponse.json({ team }, { status: 201 });
}

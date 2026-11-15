import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { battleStates, processTurn } from "@/lib/battle";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = battleStates.get(id);
  if (!state || state.userId !== session.user.id) {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }

  if (state.winner) {
    return NextResponse.json({ error: "Battle already ended" }, { status: 400 });
  }

  const { moveIndex } = await req.json();
  if (moveIndex == null || typeof moveIndex !== "number") {
    return NextResponse.json({ error: "Missing moveIndex" }, { status: 400 });
  }

  const newState = processTurn(state, moveIndex);
  battleStates.set(id, newState);

  return NextResponse.json({ state: newState });
}

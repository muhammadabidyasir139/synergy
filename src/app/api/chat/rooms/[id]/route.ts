import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getChatParticipant, findRoomForParticipant } from "@/lib/chat";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getChatParticipant();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const room = await findRoomForParticipant(id, me);
    if (!room) return NextResponse.json({ error: "Room tidak ditemukan" }, { status: 404 });

    await db.chatRoom.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getChatParticipant, findRoomForParticipant, counterpartRole } from "@/lib/chat";
import { publishChatEvent } from "@/lib/chat-events";

const MAX_MESSAGE_LENGTH = 2000;

/** Riwayat pesan sebuah room; sekaligus menandai pesan lawan sebagai terbaca. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getChatParticipant(request);
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const room = await findRoomForParticipant(id, me);
    if (!room) return NextResponse.json({ error: "Room tidak ditemukan" }, { status: 404 });

    const messages = await db.chatMessage.findMany({
      where: { roomId: id },
      orderBy: { createdAt: "asc" },
    });

    await db.chatMessage.updateMany({
      where: { roomId: id, senderRole: counterpartRole(me.role), readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({
      myRole: me.role,
      messages: messages.map((m) => ({
        id: m.id,
        senderRole: m.senderRole,
        content: m.content,
        createdAt: m.createdAt,
        mine: m.senderRole === me.role,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** Mengirim pesan baru ke room. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getChatParticipant(request);
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const room = await findRoomForParticipant(id, me);
    if (!room) return NextResponse.json({ error: "Room tidak ditemukan" }, { status: 404 });

    const { content } = (await request.json()) as { content?: unknown };
    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter.` },
        { status: 400 }
      );
    }

    const message = await db.chatMessage.create({
      data: { roomId: id, senderRole: me.role, content: content.trim() },
    });

    await db.chatRoom.update({
      where: { id },
      data: { lastMessageAt: message.createdAt },
    });

    publishChatEvent({
      roomId: id,
      investorProfileId: room.investorProfileId,
      umkmProfileId: room.umkmProfileId,
      message: {
        id: message.id,
        roomId: id,
        senderRole: message.senderRole,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      },
    });

    return NextResponse.json(
      {
        id: message.id,
        senderRole: message.senderRole,
        content: message.content,
        createdAt: message.createdAt,
        mine: true,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ChatSenderRole } from "@/generated/prisma";
import { getChatParticipant, roomScopeFor, counterpartRole } from "@/lib/chat";

/** Daftar room milik pengguna aktif, terbaru di atas, lengkap dengan jumlah belum dibaca. */
export async function GET(request: NextRequest) {
  try {
    const me = await getChatParticipant(request);
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rooms = await db.chatRoom.findMany({
      where: roomScopeFor(me),
      include: {
        investorProfile: { select: { id: true, fullName: true } },
        umkmProfile: { select: { id: true, businessName: true } },
        campaign: { select: { id: true, title: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    });

    const fromOther = counterpartRole(me.role);
    const unreadCounts = await db.chatMessage.groupBy({
      by: ["roomId"],
      where: {
        roomId: { in: rooms.map((r) => r.id) },
        senderRole: fromOther,
        readAt: null,
      },
      _count: { _all: true },
    });
    const unreadByRoom = new Map(unreadCounts.map((u) => [u.roomId, u._count._all]));

    return NextResponse.json(
      rooms.map((room) => {
        const last = room.messages[0];
        return {
          id: room.id,
          // Nama yang ditampilkan selalu lawan bicara, bukan diri sendiri.
          title:
            me.role === ChatSenderRole.INVESTOR
              ? room.umkmProfile.businessName
              : room.investorProfile.fullName,
          campaignTitle: room.campaign?.title ?? null,
          lastMessage: last ? last.content : null,
          lastMessageAt: room.lastMessageAt,
          unreadCount: unreadByRoom.get(room.id) ?? 0,
        };
      })
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * Membuka (atau membuat) room negosiasi.
 * Investor mengirim { campaignId } atau { umkmProfileId };
 * UMKM mengirim { investorProfileId }.
 */
export async function POST(request: NextRequest) {
  try {
    const me = await getChatParticipant(request);
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as {
      campaignId?: string;
      umkmProfileId?: string;
      investorProfileId?: string;
    };

    let investorProfileId: string;
    let umkmProfileId: string;
    let campaignId: string | null = null;

    if (me.role === ChatSenderRole.INVESTOR) {
      investorProfileId = me.profileId;

      if (body.campaignId) {
        const campaign = await db.campaign.findUnique({
          where: { id: body.campaignId },
          select: { id: true, umkmProfileId: true },
        });
        if (!campaign) {
          return NextResponse.json({ error: "Kampanye tidak ditemukan." }, { status: 404 });
        }
        campaignId = campaign.id;
        umkmProfileId = campaign.umkmProfileId;
      } else if (body.umkmProfileId) {
        umkmProfileId = body.umkmProfileId;
      } else {
        return NextResponse.json(
          { error: "campaignId atau umkmProfileId wajib diisi." },
          { status: 400 }
        );
      }
    } else {
      umkmProfileId = me.profileId;
      if (!body.investorProfileId) {
        return NextResponse.json({ error: "investorProfileId wajib diisi." }, { status: 400 });
      }
      investorProfileId = body.investorProfileId;

      // UMKM bebas menghubungi investor mana pun (sesuai permintaan user).

      // campaignId ikut disimpan agar room yang dibuka UMKM dan yang dibuka
      // investor dari halaman kampanye bermuara ke room yang sama, bukan dua
      // percakapan terpisah untuk pasangan yang sama.
      if (body.campaignId) {
        const campaign = await db.campaign.findUnique({
          where: { id: body.campaignId },
          select: { id: true, umkmProfileId: true },
        });
        if (!campaign || campaign.umkmProfileId !== me.profileId) {
          return NextResponse.json({ error: "Kampanye tidak ditemukan." }, { status: 404 });
        }
        campaignId = campaign.id;
      }
    }

    const counterpartExists =
      me.role === ChatSenderRole.INVESTOR
        ? await db.umkmProfile.findUnique({ where: { id: umkmProfileId }, select: { id: true } })
        : await db.investorProfile.findUnique({
            where: { id: investorProfileId },
            select: { id: true },
          });
    if (!counterpartExists) {
      return NextResponse.json({ error: "Lawan bicara tidak ditemukan." }, { status: 404 });
    }

    // Satu room per pasangan investor-UMKM, hiraukan campaignId yang mungkin berbeda.
    const existing = await db.chatRoom.findFirst({
      where: { investorProfileId, umkmProfileId },
      orderBy: { createdAt: "desc" }
    });
    if (existing) return NextResponse.json({ id: existing.id, created: false });

    const room = await db.chatRoom.create({
      data: { investorProfileId, umkmProfileId, campaignId },
    });
    return NextResponse.json({ id: room.id, created: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

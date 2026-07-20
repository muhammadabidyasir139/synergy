import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ChatSenderRole } from "@/generated/prisma";
import { getChatParticipant } from "@/lib/chat";

/**
 * Lawan bicara yang boleh diajak negosiasi, diturunkan dari relasi investasi
 * yang sudah ada — bukan daftar seluruh pengguna. UMKM melihat investornya,
 * investor melihat UMKM yang didanainya.
 */
export async function GET() {
  try {
    const me = await getChatParticipant();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (me.role === ChatSenderRole.UMKM) {
      const investments = await db.investment.findMany({
        where: { campaign: { umkmProfileId: me.profileId } },
        select: {
          investorProfile: { select: { id: true, fullName: true } },
          campaign: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // Satu investor bisa punya banyak investasi; tampilkan sekali saja.
      const seen = new Set<string>();
      const contacts = [];
      for (const inv of investments) {
        if (seen.has(inv.investorProfile.id)) continue;
        seen.add(inv.investorProfile.id);
        contacts.push({
          id: inv.investorProfile.id,
          name: inv.investorProfile.fullName,
          context: inv.campaign.title,
          campaignId: inv.campaign.id,
        });
      }
      return NextResponse.json({ myRole: me.role, contacts });
    }

    const investments = await db.investment.findMany({
      where: { investorProfileId: me.profileId },
      select: {
        campaign: {
          select: {
            id: true,
            title: true,
            umkmProfile: { select: { id: true, businessName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const seen = new Set<string>();
    const contacts = [];
    for (const inv of investments) {
      const umkm = inv.campaign.umkmProfile;
      if (seen.has(umkm.id)) continue;
      seen.add(umkm.id);
      contacts.push({
        id: umkm.id,
        name: umkm.businessName,
        context: inv.campaign.title,
        campaignId: inv.campaign.id,
      });
    }
    return NextResponse.json({ myRole: me.role, contacts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

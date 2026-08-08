import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ChatSenderRole } from "@/generated/prisma";
import { getChatParticipant } from "@/lib/chat";

/**
 * Lawan bicara yang boleh diajak negosiasi, diturunkan dari relasi investasi
 * yang sudah ada — bukan daftar seluruh pengguna. UMKM melihat investornya,
 * investor melihat UMKM yang didanainya.
 */
export async function GET(request: NextRequest) {
  try {
    const me = await getChatParticipant(request);
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (me.role === ChatSenderRole.UMKM) {
      const allInvestors = await db.investorProfile.findMany({
        select: { id: true, fullName: true, city: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });

      const contacts = allInvestors.map((inv) => ({
        id: inv.id,
        name: inv.fullName,
        context: inv.city || "Investor Terdaftar",
        campaignId: "",
      }));
      return NextResponse.json({ myRole: me.role, contacts });
    }

    const allUmkms = await db.umkmProfile.findMany({
      select: { id: true, businessName: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const contacts = allUmkms.map((umkm) => ({
      id: umkm.id,
      name: umkm.businessName,
      context: "UMKM Terdaftar",
      campaignId: "",
    }));
    return NextResponse.json({ myRole: me.role, contacts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

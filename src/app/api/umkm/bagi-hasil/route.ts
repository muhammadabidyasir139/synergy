import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "UMKM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const umkmProfile = await db.umkmProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!umkmProfile) {
      return NextResponse.json({ error: "UMKM Profile not found" }, { status: 404 });
    }

    // ProfitSharing related to UMKM's investments
    const profitSharings = await db.profitSharing.findMany({
      where: {
        investment: {
          campaign: {
            umkmProfileId: umkmProfile.id,
          },
        },
      },
      include: {
        investment: {
          include: {
            investorProfile: true,
          }
        },
        akad: true,
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(profitSharings);
  } catch (error) {
    console.error("[BAGI_HASIL_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "UMKM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const profitSharing = await db.profitSharing.update({
      where: { id },
      data: {
        status,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });

    return NextResponse.json(profitSharing);
  } catch (error) {
    console.error("[BAGI_HASIL_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

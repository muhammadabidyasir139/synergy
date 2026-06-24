import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { FraudStatus } from "@/generated/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const updated = await db.fraudAlert.update({
      where: { id },
      data: {
        status: FraudStatus.CONFIRMED,
        reviewedAt: new Date(),
        actionTaken: "Ditandai selesai oleh investor.",
      },
    });

    return NextResponse.json({ success: true, id: updated.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const records = await db.profitSharing.findMany({
      where: { investment: { investorProfileId } },
      include: {
        investment: { include: { campaign: { include: { umkmProfile: true } } } },
        akad: true,
      },
      orderBy: { periodStart: "desc" },
    });

    const totalReceived = records
      .filter((r) => r.status === "PAID")
      .reduce((s, r) => s + Number(r.investorShare), 0);
    const totalPending = records
      .filter((r) => r.status !== "PAID")
      .reduce((s, r) => s + Number(r.investorShare), 0);
    const nextPayment = records.find((r) => r.status === "PENDING");

    return NextResponse.json({
      totalReceived,
      totalPending,
      nextPaymentDate: nextPayment?.dueDate ?? null,
      records: records.map((r) => ({
        id: r.id,
        akadId: r.akadId,
        umkm: r.investment.campaign.umkmProfile.businessName,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        dueDate: r.dueDate,
        grossRevenue: Number(r.grossRevenue),
        investorShare: Number(r.investorShare),
        umkmShare: Number(r.umkmShare),
        platformFee: Number(r.platformFee),
        status: r.status,
        paidAt: r.paidAt,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

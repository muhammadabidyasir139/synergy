import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get UMKMs the investor has active investments in
    const investments = await db.investment.findMany({
      where: { investorProfileId, status: "ONGOING" },
      include: { campaign: { include: { umkmProfile: true } } },
    });

    const umkmList = investments.map((inv) => ({
      investmentId: inv.id,
      umkmProfileId: inv.campaign.umkmProfileId,
      businessName: inv.campaign.umkmProfile.businessName,
      city: inv.campaign.umkmProfile.city ?? "",
    }));

    const result = await Promise.all(
      umkmList.map(async (u) => {
        const businessData = await db.businessData.findMany({
          where: { umkmProfileId: u.umkmProfileId },
          orderBy: { reportDate: "asc" },
          take: 6,
        });

        const updates = await db.businessUpdate.findMany({
          where: { umkmProfileId: u.umkmProfileId },
          orderBy: { periodDate: "desc" },
          take: 3,
        });

        const targetAmount = investments.find((i) => i.campaign.umkmProfileId === u.umkmProfileId)?.campaign.targetAmount ?? 0;
        const collected = investments.find((i) => i.campaign.umkmProfileId === u.umkmProfileId)?.campaign.collectedAmount ?? 0;
        const targetProgress = Number(targetAmount) > 0
          ? Math.round((Number(collected) / Number(targetAmount)) * 100)
          : 0;

        return {
          investmentId: u.investmentId,
          umkmProfileId: u.umkmProfileId,
          businessName: u.businessName,
          city: u.city,
          targetProgress,
          revenueChart: businessData.map((d) => ({
            month: d.reportDate.toLocaleDateString("id-ID", { month: "short" }),
            revenue: Number(d.monthlyRevenue ?? 0) / 1_000_000,
          })),
          updates: updates.map((upd) => ({
            date: upd.periodDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
            title: upd.fundUsageSummary?.split(":")[0] ?? "Update UMKM",
            body: upd.fundUsageSummary?.split(":").slice(1).join(":").trim() ?? "",
            revenue: Number(upd.revenue),
          })),
        };
      })
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

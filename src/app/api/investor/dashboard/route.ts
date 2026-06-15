import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db.investorProfile.findUnique({
      where: { id: investorProfileId },
      include: { user: { include: { wallet: true } } },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const investments = await db.investment.findMany({
      where: { investorProfileId },
      include: {
        campaign: { include: { umkmProfile: true } },
        akad: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 6-month profit sharing chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const paidProfitSharings = await db.profitSharing.findMany({
      where: {
        investment: { investorProfileId },
        status: "PAID",
        periodStart: { gte: sixMonthsAgo },
      },
    });

    const chartMap: Record<string, number> = {};
    for (const ps of paidProfitSharings) {
      const key = ps.periodStart.toLocaleDateString("id-ID", { month: "short" });
      chartMap[key] = (chartMap[key] ?? 0) + Number(ps.investorShare);
    }

    const notifications = await db.notification.findMany({
      where: { userId: profile.userId, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const akadCount = await db.akad.count({
      where: { investment: { investorProfileId }, blockchainStatus: "CONFIRMED" },
    });

    const wallet = profile.user.wallet;

    return NextResponse.json({
      profile: {
        fullName: profile.fullName,
        totalInvested: Number(profile.totalInvested),
        totalProfit: Number(profile.totalProfit),
      },
      wallet: {
        balance: Number(wallet?.balance ?? 0),
        lockedBalance: Number(wallet?.lockedBalance ?? 0),
      },
      metrics: {
        umkmCount: investments.filter((i) => i.status !== "FAILED").length,
        akadBlockchain: akadCount,
      },
      investments: investments.map((inv) => ({
        id: inv.id,
        umkm: inv.campaign.umkmProfile.businessName,
        akad: inv.akadType,
        amount: Number(inv.amount),
        roi: inv.campaign.estimatedRoi,
        status: inv.status,
        dueDate: inv.akad?.endDate ?? null,
      })),
      chartData: Object.entries(chartMap).map(([month, profit]) => ({ month, profit })),
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

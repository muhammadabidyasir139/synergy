import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUmkmProfileId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const guard = await requireUmkmProfileId();
    if (guard.error) return guard.error;
    const umkmProfileId = guard.id;

    const profile = await db.umkmProfile.findUnique({
      where: { id: umkmProfileId },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const campaigns = await db.campaign.findMany({
      where: { umkmProfileId },
      select: { id: true },
    });
    const campaignIds = campaigns.map((c) => c.id);

    const [latestScore, akads, disbursedAgg, chartRaw, profitSharingAgg, notifications] = await Promise.all([
      db.creditScore.findFirst({
        where: { umkmProfileId },
        orderBy: { predictedAt: "desc" },
      }),
      db.akad.findMany({
        where: { campaignId: { in: campaignIds } },
        include: { investment: { include: { investorProfile: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.investment.aggregate({
        where: { campaignId: { in: campaignIds }, confirmedAt: { not: null } },
        _sum: { amount: true },
      }),
      db.businessData.findMany({
        where: { umkmProfileId },
        orderBy: { reportDate: "desc" },
        take: 6,
      }),
      db.profitSharing.aggregate({
        where: { akad: { campaignId: { in: campaignIds } }, status: "PAID" },
        _sum: { umkmShare: true },
      }),
      db.notification.findMany({
        where: { userId: profile.userId, isRead: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const activeAkads = akads.filter((a) => a.status === "ACTIVE");
    const confirmedBlockchain = akads.filter((a) => a.blockchainStatus === "CONFIRMED");

    const currentOmzet = Number(chartRaw[0]?.monthlyRevenue ?? 0);
    const prevOmzet = Number(chartRaw[1]?.monthlyRevenue ?? 0);
    const omzetChangePct = prevOmzet > 0 ? ((currentOmzet - prevOmzet) / prevOmzet) * 100 : 0;

    const chartData = chartRaw
      .slice()
      .reverse()
      .map((d) => ({
        month: d.reportDate.toLocaleDateString("id-ID", { month: "short" }),
        omzet: Number(d.monthlyRevenue ?? 0),
      }));

    // Skor kredit diambil dari engine AI (akad_analisis) agar konsisten dgn halaman Credit Scoring.
    // Fallback ke tabel credit_scores lama kalau engine tidak tersedia / belum ada analisis.
    let aiScore: number | null = latestScore ? Math.round(latestScore.score) : null;
    let aiRisk: string | null = latestScore?.riskLevel ?? null;
    try {
      const AI_BASE = process.env.AI_API_URL || "http://127.0.0.1:8000";
      const aiRes = await fetch(`${AI_BASE}/api/analisis/umkm/${umkmProfileId}`, { cache: "no-store" });
      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        const latest = aiJson.data?.[0];
        if (latest) {
          aiScore = Math.round(Number(latest.skor_kelayakan));
          aiRisk = aiScore >= 70 ? "LOW" : aiScore >= 50 ? "MEDIUM" : "HIGH";
        }
      }
    } catch {
      // engine AI tidak tersedia → pakai fallback di atas
    }

    return NextResponse.json({
      profile: {
        businessName: profile.businessName,
        ownerName: profile.ownerName,
      },
      metrics: {
        creditScore: aiScore,
        riskLevel: aiRisk,
        danaDiterima: Number(disbursedAgg._sum.amount ?? 0),
        akadAktif: activeAkads.length,
        akadTotal: akads.length,
        blockchainVerifiedPct: akads.length ? Math.round((confirmedBlockchain.length / akads.length) * 100) : 0,
        omzetBulanIni: currentOmzet,
        omzetChangePct: Math.round(omzetChangePct * 10) / 10,
        bagiHasilDibayar: Number(profitSharingAgg._sum.umkmShare ?? 0),
      },
      chartData,
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt,
      })),
      akads: akads.slice(0, 10).map((a) => ({
        id: a.id,
        akadType: a.akadType,
        investorName: a.investment?.investorProfile.fullName ?? "-",
        principalAmount: Number(a.principalAmount),
        nisbahUmkm: a.nisbahUmkm,
        nisbahInvestor: a.nisbahInvestor,
        endDate: a.endDate,
        status: a.status,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

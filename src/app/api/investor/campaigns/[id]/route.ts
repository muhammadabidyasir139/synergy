import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedMediaUrl } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await db.campaign.findUnique({
      where: { id },
      include: {
        umkmProfile: {
          include: {
            creditScores: { orderBy: { predictedAt: "desc" }, take: 1 },
            businessData: { orderBy: { reportDate: "desc" }, take: 6 },
            media: true,
            akadVariables: { orderBy: { id: "desc" }, take: 1 },
            monitoringReports: { orderBy: { tanggal: "desc" }, take: 6 },
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const { umkmProfile } = campaign;
    const latestScore = umkmProfile.creditScores[0];
    const keyFactors = latestScore?.insights
      ? ((latestScore.insights as Record<string, string[]>).key_factors ?? [])
      : [];
    const recommendedActions = latestScore?.recommendations
      ? ((latestScore.recommendations as Record<string, string[]>).actions ?? [])
      : [];
    const pct =
      Number(campaign.targetAmount) > 0
        ? Math.round((Number(campaign.collectedAmount) / Number(campaign.targetAmount)) * 100)
        : 0;

    const media = await Promise.all(
      umkmProfile.media.map(async (m) => ({
        type: m.type,
        url: await getSignedMediaUrl(m.url),
        caption: m.caption,
      }))
    );

    const financialReports = umkmProfile.businessData
      .slice()
      .reverse()
      .map((b) => ({
        date: b.reportDate,
        monthlyRevenue: b.monthlyRevenue ? Number(b.monthlyRevenue) : null,
        monthlyExpense: b.monthlyExpense ? Number(b.monthlyExpense) : null,
        dailyRevenue: b.dailyRevenue ? Number(b.dailyRevenue) : null,
        dailyExpense: b.dailyExpense ? Number(b.dailyExpense) : null,
      }));

    const financeVariable = umkmProfile.akadVariables[0];
    const financeProfile = financeVariable
      ? {
          asetLancar: Number(financeVariable.asetLancar),
          asetTidakLancar: Number(financeVariable.asetTidakLancar),
          totalHutangKas: Number(financeVariable.totalHutangKas),
          totalPendapatan: Number(financeVariable.totalPendapatan),
          totalBeban: Number(financeVariable.totalBeban),
          labaBersih: Number(financeVariable.labaBersih),
          rataRataArusKas: Number(financeVariable.rataRataArusKas),
        }
      : null;

    const omzetHistory = umkmProfile.monitoringReports
      .slice()
      .reverse()
      .map((r) => ({
        tanggal: r.tanggal,
        omzet: Number(r.omzet),
      }));

    return NextResponse.json({
      id: campaign.id,
      name: umkmProfile.businessName,
      category: umkmProfile.businessCategory,
      description: umkmProfile.businessDescription,
      city: umkmProfile.city ?? "",
      province: umkmProfile.province ?? "",
      establishedDate: umkmProfile.establishedDate,
      employeeCount: umkmProfile.employeeCount,
      monthlyRevenue: umkmProfile.monthlyRevenue ? Number(umkmProfile.monthlyRevenue) : null,
      website: umkmProfile.website,
      media,
      story: campaign.story,
      risk: latestScore?.riskLevel ?? "MEDIUM",
      aiScore: Math.round(latestScore?.score ?? 50),
      keyFactors,
      recommendedActions,
      targetAmount: Number(campaign.targetAmount),
      collectedAmount: Number(campaign.collectedAmount),
      collectedPct: pct,
      estimatedRoi: campaign.estimatedRoi,
      akadType: campaign.akadType,
      durationMonths: campaign.durationMonths,
      investorCount: campaign.investorCount,
      financialReports,
      financeProfile,
      omzetHistory,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

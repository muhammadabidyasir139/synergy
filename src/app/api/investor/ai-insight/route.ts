import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profile = (searchParams.get("profile") ?? "balanced").toLowerCase();

    const campaigns = await db.campaign.findMany({
      where: { status: "ACTIVE" },
      include: {
        umkmProfile: {
          include: { creditScores: { orderBy: { predictedAt: "desc" }, take: 1 } },
        },
      },
    });

    const withScores = campaigns
      .map((c) => {
        const cs = c.umkmProfile.creditScores[0];
        const riskLevel = cs?.riskLevel ?? "MEDIUM";
        const score = Math.round(cs?.score ?? 50);

        let label: string;
        if (score >= 85) label = "Recommended";
        else if (score >= 60) label = "Stable Growth";
        else label = "High Risk";

        const reason = cs?.insights
          ? ((cs.insights as Record<string, string[]>).key_factors ?? []).join(", ")
          : "Data AI tersedia setelah UMKM menjalani scoring.";

        const estimatedProfitMin = Math.round((Number(c.targetAmount) * (c.estimatedRoi / 100)) / 1_000_000);
        const estimatedProfitMax = Math.round(estimatedProfitMin * 1.2);

        return {
          id: c.id,
          name: c.umkmProfile.businessName,
          category: c.umkmProfile.businessCategory,
          label,
          aiScore: score,
          estimatedProfit: `Rp ${estimatedProfitMin}-${estimatedProfitMax} Jt / tahun`,
          roi: `${c.estimatedRoi}%`,
          reason,
          risk: riskLevel,
        };
      })
      .filter((c) => {
        if (profile === "conservative") return c.risk === "LOW";
        if (profile === "aggressive") return true;
        return c.risk !== "HIGH";
      })
      .sort((a, b) => b.aiScore - a.aiScore);

    return NextResponse.json(withScores);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

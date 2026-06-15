import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const risk = searchParams.get("risk") ?? "";

    const campaigns = await db.campaign.findMany({
      where: {
        status: "ACTIVE",
        umkmProfile: {
          businessName: search ? { contains: search } : undefined,
          businessCategory: category ? { equals: category } : undefined,
          city: search ? { contains: search } : undefined,
        },
      },
      include: {
        umkmProfile: {
          include: { creditScores: { orderBy: { predictedAt: "desc" }, take: 1 } },
        },
      },
    });

    const result = campaigns
      .map((c) => {
        const latest = c.umkmProfile.creditScores[0];
        const riskLevel = latest?.riskLevel ?? "MEDIUM";
        if (risk && risk !== "Semua" && riskLevel !== risk.toUpperCase()) return null;
        const pct = Number(c.targetAmount) > 0 ? Math.round((Number(c.collectedAmount) / Number(c.targetAmount)) * 100) : 0;
        return {
          id: c.id,
          name: c.umkmProfile.businessName,
          category: c.umkmProfile.businessCategory,
          city: c.umkmProfile.city ?? "",
          risk: riskLevel,
          aiScore: Math.round(latest?.score ?? 50),
          targetAmount: Number(c.targetAmount),
          collectedPct: pct,
          estimatedRoi: c.estimatedRoi,
          akadType: c.akadType,
          durationMonths: c.durationMonths,
          investorCount: c.investorCount,
        };
      })
      .filter(Boolean);

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

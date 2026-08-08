import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedMediaUrl } from "@/lib/s3";

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
          include: {
            creditScores: { orderBy: { predictedAt: "desc" }, take: 1 },
            media: true,
          },
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
          logoUrl: c.umkmProfile.media.find((m) => m.type === "LOGO")?.url ?? null,
          coverPhotoUrl: c.umkmProfile.media.find((m) => m.type === "GALLERY")?.url ?? null,
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
      .filter((c): c is NonNullable<typeof c> => c !== null);

    const signed = await Promise.all(
      result.map(async (c) => ({
        ...c,
        logoUrl: c.logoUrl ? await getSignedMediaUrl(c.logoUrl) : null,
        coverPhotoUrl: c.coverPhotoUrl ? await getSignedMediaUrl(c.coverPhotoUrl) : null,
      }))
    );

    return NextResponse.json(signed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error", stack: err instanceof Error ? err.stack : undefined }, { status: 500 });
  }
}

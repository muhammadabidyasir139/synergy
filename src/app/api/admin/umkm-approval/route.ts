import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "PENDING";

  const applications = await db.fundingApplication.findMany({
    where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
    include: {
      umkmProfile: {
        select: {
          businessName: true,
          businessCategory: true,
          creditScores: {
            orderBy: { predictedAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = applications.map((app) => {
    const latest = app.umkmProfile?.creditScores?.[0];
    return {
      id: app.id,
      name: app.umkmProfile?.businessName ?? "Unknown",
      category: app.umkmProfile?.businessCategory ?? "-",
      targetFunding: Number(app.requestedAmount),
      tenor: app.durationMonths,
      akadType: app.akadType,
      status: app.status,
      purpose: app.purpose,
      createdAt: app.createdAt,
      score: latest?.score ?? null,
      riskLevel: latest?.riskLevel ?? null,
      insights: latest?.insights ?? [],
    };
  });

  return Response.json(mapped);
}

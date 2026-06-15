import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get UMKM profile IDs from investor's investments
    const investments = await db.investment.findMany({
      where: { investorProfileId },
      include: { campaign: true },
    });
    const umkmProfileIds = [...new Set(investments.map((i) => i.campaign.umkmProfileId))];

    // Get fraud alerts whose metadata contains one of these umkmProfileIds
    const allAlerts = await db.fraudAlert.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Filter alerts that belong to this investor's UMKMs
    const relevant = allAlerts.filter((a) => {
      const meta = a.metadata as Record<string, string> | null;
      return meta && umkmProfileIds.includes(meta.umkmProfileId);
    });

    return NextResponse.json(
      relevant.map((a) => {
        const meta = a.metadata as Record<string, string> | null;
        return {
          id: a.id,
          umkm: meta?.umkmName ?? "UMKM",
          alertType: meta?.alertCategory ?? a.alertType,
          severity: a.severity,
          description: a.description,
          status: a.status === "DETECTED" ? "Active" : a.status === "CONFIRMED" ? "Resolved" : "Resolved",
          detectedAt: a.createdAt,
          recommendation: (a.actionTaken ?? ""),
        };
      })
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

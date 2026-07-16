import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "UMKM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const umkmProfile = await db.umkmProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!umkmProfile) {
      return NextResponse.json({ error: "UMKM Profile not found" }, { status: 404 });
    }

    const reports = await db.monitoringReport.findMany({
      where: { umkmProfileId: umkmProfile.id },
      orderBy: { tanggal: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("[MONITORING_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "UMKM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const umkmProfile = await db.umkmProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!umkmProfile) {
      return NextResponse.json({ error: "UMKM Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { tanggal, omzet, penggunaan, catatan } = body;

    const report = await db.monitoringReport.create({
      data: {
        umkmProfileId: umkmProfile.id,
        tanggal: new Date(tanggal),
        omzet,
        penggunaan,
        catatan,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("[MONITORING_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

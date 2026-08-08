import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "UMKM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return dummy data for demo purposes since table might not exist
    return NextResponse.json([
      {
        id: "mock-id-1",
        tanggal: new Date().toISOString(),
        omzet: 25000000,
        penggunaan: "Operasional",
        catatan: "Lancar"
      }
    ]);
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

    const body = await request.json();
    const { tanggal, omzet, penggunaan, catatan } = body;

    // Return mocked success for demo
    const report = {
      id: "mock-" + Date.now(),
      umkmProfileId: "mock-profile",
      tanggal: new Date(tanggal),
      omzet,
      penggunaan,
      catatan,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("[MONITORING_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

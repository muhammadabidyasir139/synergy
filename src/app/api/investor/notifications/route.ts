import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db.investorProfile.findUnique({ where: { id: investorProfileId } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const notifications = await db.notification.findMany({
      where: { userId: profile.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(
      notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET() {
  const notifications = await db.notification.findMany({
    where: { type: "BROADCAST" },
    include: {
      sender: {
        include: { adminProfile: { select: { fullName: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const mapped = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    target: (n.data as { target?: string })?.target ?? "Semua Pengguna",
    sentBy: n.sender?.adminProfile?.fullName ?? "Admin",
    createdAt: n.createdAt,
  }));

  return Response.json(mapped);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, message, target } = body as {
    title: string;
    message: string;
    target: "ALL" | "INVESTOR" | "UMKM" | "ADMIN";
  };

  const roleFilter =
    target === "ALL"
      ? undefined
      : ({ INVESTOR: "INVESTOR", UMKM: "UMKM", ADMIN: "ADMIN" } as const)[target];

  const users = await db.user.findMany({
    where: roleFilter ? { role: roleFilter } : undefined,
    select: { id: true },
  });

  await db.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: "BROADCAST" as const,
      title: title || "Notifikasi Admin",
      message,
      data: { target },
    })),
  });

  return Response.json({ success: true, sentTo: users.length });
}

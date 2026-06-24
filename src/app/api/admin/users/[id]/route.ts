import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { action, reason } = body as {
    action: "suspend" | "ban" | "reactivate";
    reason?: string;
  };

  const statusMap = {
    suspend: "SUSPENDED",
    ban: "BANNED",
    reactivate: "ACTIVE",
  } as const;

  const newStatus = statusMap[action];

  await db.user.update({
    where: { id },
    data: { status: newStatus },
  });

  await db.auditLog.create({
    data: {
      action: `USER_${action.toUpperCase()}`,
      entityType: "User",
      entityId: id,
      newData: { status: newStatus, reason },
    },
  });

  return Response.json({ success: true, status: newStatus });
}

import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { action, actionTaken } = body as {
    action: "confirm" | "ignore";
    actionTaken?: string;
  };

  const newStatus = action === "confirm" ? "CONFIRMED" : "IGNORED";

  await db.fraudAlert.update({
    where: { id },
    data: {
      status: newStatus,
      reviewedAt: new Date(),
      actionTaken: actionTaken ?? null,
    },
  });

  await db.auditLog.create({
    data: {
      action: `FRAUD_${action.toUpperCase()}`,
      entityType: "FraudAlert",
      entityId: id,
      newData: { status: newStatus, actionTaken },
    },
  });

  return Response.json({ success: true, status: newStatus });
}

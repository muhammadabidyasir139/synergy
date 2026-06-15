import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { action } = body as { action: "approve" | "reject" };

  const newStatus = action === "approve" ? "ACTIVE" : "CANCELLED";

  const updated = await db.akad.update({
    where: { id },
    data: {
      status: newStatus,
      approvedAt: action === "approve" ? new Date() : undefined,
      startDate: action === "approve" ? new Date() : undefined,
    },
  });

  if (action === "approve") {
    await db.campaign.update({
      where: { id: updated.campaignId },
      data: { status: "COMPLETED" },
    });
  }

  await db.auditLog.create({
    data: {
      action: action === "approve" ? "AKAD_APPROVED" : "AKAD_REJECTED",
      entityType: "Akad",
      entityId: id,
      newData: { status: newStatus },
    },
  });

  return Response.json({ success: true, status: newStatus });
}

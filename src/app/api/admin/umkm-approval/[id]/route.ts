import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { action, reason } = body as {
    action: "approve" | "reject";
    reason?: string;
  };

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

  const updated = await db.fundingApplication.update({
    where: { id },
    data: {
      status: newStatus,
      reviewedAt: new Date(),
      ...(action === "reject" && reason ? { rejectReason: reason } : {}),
    },
  });

  await db.auditLog.create({
    data: {
      action: action === "approve" ? "FUNDING_APPROVED" : "FUNDING_REJECTED",
      entityType: "FundingApplication",
      entityId: id,
      newData: { status: newStatus, reason },
    },
  });

  return Response.json({ success: true, status: newStatus, id: updated.id });
}

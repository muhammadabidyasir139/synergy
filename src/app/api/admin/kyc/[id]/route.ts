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

  const kycStatus = action === "approve" ? "APPROVED" : "REJECTED";
  const userStatus = action === "approve" ? "ACTIVE" : "PENDING_VERIFICATION";

  await db.user.update({
    where: { id },
    data: { kycStatus, status: userStatus },
  });

  await db.kycDocument.updateMany({
    where: { userId: id },
    data: {
      status: kycStatus,
      reviewedAt: new Date(),
      ...(action === "reject" && reason ? { rejectReason: reason } : {}),
    },
  });

  await db.auditLog.create({
    data: {
      action: action === "approve" ? "USER_KYC_APPROVED" : "USER_KYC_REJECTED",
      entityType: "User",
      entityId: id,
      newData: { kycStatus, reason },
    },
  });

  return Response.json({ success: true, kycStatus });
}

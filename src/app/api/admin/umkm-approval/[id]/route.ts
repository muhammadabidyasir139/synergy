import { db } from "@/lib/db";
import { NextRequest } from "next/server";

function estimateRoi(akadType: "MUSYARAKAH" | "MURABAHAH", riskLevel?: string) {
  const base = akadType === "MUSYARAKAH" ? 10 : 8;
  const adjustment = riskLevel === "LOW" ? 2 : riskLevel === "HIGH" ? -1 : 0;
  return base + adjustment;
}

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

  const application = await db.fundingApplication.findUnique({
    where: { id },
    include: {
      umkmProfile: {
        include: { creditScores: { orderBy: { predictedAt: "desc" }, take: 1 } },
      },
    },
  });
  if (!application) {
    return Response.json({ error: "Funding application not found" }, { status: 404 });
  }

  const updated = await db.$transaction(async (tx) => {
    const app = await tx.fundingApplication.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        ...(action === "reject" && reason ? { rejectReason: reason } : {}),
      },
    });

    if (action === "approve") {
      const riskLevel = application.umkmProfile.creditScores[0]?.riskLevel;
      await tx.campaign.create({
        data: {
          umkmProfileId: application.umkmProfileId,
          fundingApplicationId: app.id,
          title: `Pendanaan ${application.umkmProfile.businessName}`,
          story: application.purpose,
          targetAmount: application.requestedAmount,
          akadType: application.akadType,
          durationMonths: application.durationMonths,
          estimatedRoi: estimateRoi(application.akadType, riskLevel),
          status: "ACTIVE",
        },
      });
    }

    return app;
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

import { db } from "@/lib/db";

export async function GET() {
  const akads = await db.akad.findMany({
    where: { status: "PENDING" },
    include: {
      campaign: {
        include: {
          umkmProfile: { select: { businessName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = akads.map((a) => ({
    id: a.id,
    campaignId: a.campaignId,
    umkmName: a.campaign.umkmProfile.businessName,
    targetAmount: Number(a.campaign.targetAmount),
    collectedAmount: Number(a.campaign.collectedAmount),
    fundedPercentage:
      Number(a.campaign.targetAmount) > 0
        ? Math.round(
            (Number(a.campaign.collectedAmount) /
              Number(a.campaign.targetAmount)) *
              100
          )
        : 0,
    akadType: a.akadType,
    nisbahUmkm: a.nisbahUmkm,
    nisbahInvestor: a.nisbahInvestor,
    investorCount: a.campaign.investorCount,
    principalAmount: Number(a.principalAmount),
    durationMonths: a.durationMonths,
    status: a.status,
    blockchainStatus: a.blockchainStatus,
    createdAt: a.createdAt,
  }));

  return Response.json(mapped);
}

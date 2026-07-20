import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUmkmProfileId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const guard = await requireUmkmProfileId();
    if (guard.error) return guard.error;
    const umkmProfileId = guard.id;

    const campaigns = await db.campaign.findMany({
      where: { umkmProfileId },
      select: { id: true },
    });
    const campaignIds = campaigns.map((c) => c.id);

    const akads = await db.akad.findMany({
      where: { campaignId: { in: campaignIds } },
      include: {
        investment: { include: { investorProfile: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      akads.map((a) => ({
        id: a.id,
        investor: a.investment?.investorProfile.fullName ?? "-",
        akadType: a.akadType,
        amount: Number(a.principalAmount),
        nisbahInvestor: a.nisbahInvestor,
        nisbahUmkm: a.nisbahUmkm,
        status: a.status,
        blockchainHash: a.blockchainHash,
        contractAddress: a.contractAddress,
        blockchainStatus: a.blockchainStatus,
        startDate: a.startDate,
        endDate: a.endDate,
        umkmSigned: !!a.umkmSignedAt,
        investorSigned: !!a.investorSignedAt,
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

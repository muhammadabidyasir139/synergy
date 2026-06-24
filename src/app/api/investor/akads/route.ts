import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const akads = await db.akad.findMany({
      where: { investment: { investorProfileId } },
      include: {
        campaign: { include: { umkmProfile: true } },
        investment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      akads.map((a) => ({
        id: a.id,
        umkm: a.campaign.umkmProfile.businessName,
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

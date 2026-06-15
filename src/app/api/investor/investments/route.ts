import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { InvestmentStatus, TransactionType, TransactionStatus, AkadStatus } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const investments = await db.investment.findMany({
      where: { investorProfileId },
      include: {
        campaign: { include: { umkmProfile: true } },
        akad: true,
        profitSharings: { where: { status: "PAID" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      investments.map((inv) => ({
        id: inv.id,
        umkm: inv.campaign.umkmProfile.businessName,
        city: inv.campaign.umkmProfile.city ?? "",
        akad: inv.akadType,
        amount: Number(inv.amount),
        profitReceived: inv.profitSharings.reduce((s, p) => s + Number(p.investorShare), 0),
        roi: inv.campaign.estimatedRoi,
        status: inv.status,
        startDate: inv.confirmedAt ?? inv.createdAt,
        endDate: inv.akad?.endDate ?? null,
        risk: "LOW",
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { campaignId, akadType, amount } = await request.json();
    if (!campaignId || !akadType || !amount || amount < 1000000) {
      return NextResponse.json({ error: "Data investasi tidak valid." }, { status: 400 });
    }

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { umkmProfile: true },
    });
    if (!campaign || campaign.status !== "ACTIVE") {
      return NextResponse.json({ error: "Kampanye tidak tersedia." }, { status: 400 });
    }

    const profile = await db.investorProfile.findUnique({
      where: { id: investorProfileId },
      include: { user: { include: { wallet: true } } },
    });
    if (!profile?.user.wallet) return NextResponse.json({ error: "Wallet tidak ditemukan." }, { status: 404 });

    const wallet = profile.user.wallet;
    const available = Number(wallet.balance) - Number(wallet.lockedBalance);
    if (available < amount) {
      return NextResponse.json({ error: "Saldo tidak mencukupi." }, { status: 400 });
    }

    // Create investment in transaction
    const result = await db.$transaction(async (tx) => {
      const inv = await tx.investment.create({
        data: {
          investorProfileId,
          campaignId,
          akadType,
          amount,
          status: InvestmentStatus.ONGOING,
          confirmedAt: new Date(),
        },
      });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + campaign.durationMonths);

      const akad = await tx.akad.create({
        data: {
          campaignId,
          investmentId: inv.id,
          akadType,
          status: AkadStatus.PENDING,
          principalAmount: amount,
          nisbahInvestor: 40,
          nisbahUmkm: 60,
          platformFeeRate: 2.5,
          durationMonths: campaign.durationMonths,
          startDate,
          endDate,
          investorSignedAt: new Date(),
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { lockedBalance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.INVESTMENT,
          amount,
          balanceBefore: Number(wallet.balance),
          balanceAfter: Number(wallet.balance),
          status: TransactionStatus.COMPLETED,
          description: `Investasi – ${campaign.umkmProfile.businessName}`,
          relatedEntityId: inv.id,
          relatedEntityType: "Investment",
          processedAt: new Date(),
        },
      });

      await tx.campaign.update({
        where: { id: campaignId },
        data: {
          collectedAmount: { increment: amount },
          investorCount: { increment: 1 },
        },
      });

      await tx.investorProfile.update({
        where: { id: investorProfileId },
        data: { totalInvested: { increment: amount } },
      });

      return { inv, akad };
    });

    return NextResponse.json({
      success: true,
      investmentId: result.inv.id,
      akadId: result.akad.id,
      txHash: "0x" + Buffer.from(result.inv.id).toString("hex").slice(0, 16) + "...blockchain",
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

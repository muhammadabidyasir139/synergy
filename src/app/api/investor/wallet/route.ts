import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db.investorProfile.findUnique({
      where: { id: investorProfileId },
      include: {
        user: {
          include: {
            wallet: {
              include: {
                transactions: {
                  orderBy: { createdAt: "desc" },
                  take: 10,
                },
              },
            },
          },
        },
      },
    });

    if (!profile?.user.wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    const wallet = profile.user.wallet;

    return NextResponse.json({
      walletId: wallet.id,
      balance: Number(wallet.balance),
      lockedBalance: Number(wallet.lockedBalance),
      kycStatus: profile.user.kycStatus,
      transactions: wallet.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        description: t.description ?? t.type,
        amount: Number(t.amount),
        status: t.status,
        createdAt: t.createdAt,
        processedAt: t.processedAt,
        reference: t.reference,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

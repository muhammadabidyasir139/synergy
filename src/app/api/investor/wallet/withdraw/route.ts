import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TransactionType, TransactionStatus } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, bankAccount } = await request.json();
    if (!amount || amount < 10000) {
      return NextResponse.json({ error: "Minimal penarikan Rp 10.000." }, { status: 400 });
    }

    const profile = await db.investorProfile.findUnique({
      where: { id: investorProfileId },
      include: { user: { include: { wallet: true } } },
    });
    if (!profile?.user.wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    const wallet = profile.user.wallet;

    const available = Number(wallet.balance) - Number(wallet.lockedBalance);
    if (available < amount) {
      return NextResponse.json({ error: "Saldo tersedia tidak mencukupi." }, { status: 400 });
    }

    const result = await db.$transaction(async (tx) => {
      const txn = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.WITHDRAWAL,
          amount,
          balanceBefore: Number(wallet.balance),
          balanceAfter: Number(wallet.balance) - amount,
          status: TransactionStatus.COMPLETED,
          description: `Penarikan ke ${bankAccount ?? "Rekening Terdaftar"}`,
          processedAt: new Date(),
        },
      });
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });
      return { txn, newBalance: Number(updated.balance) };
    });

    return NextResponse.json({
      success: true,
      transactionId: result.txn.id,
      newBalance: result.newBalance,
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

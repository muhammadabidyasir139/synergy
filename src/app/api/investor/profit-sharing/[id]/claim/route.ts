import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TransactionType } from "@/generated/prisma";
import { requireInvestorProfileId } from "@/lib/auth-guard";
import { initiateOutboundPayment } from "@/lib/doku/payments";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireInvestorProfileId();
    if (guard.error) return guard.error;
    const investorProfileId = guard.id;

    const { id } = await params;
    const { bankCode, accountNumber, accountName } = await request.json();
    if (!bankCode || !accountNumber || !accountName) {
      return NextResponse.json({ error: "Detail rekening tujuan wajib diisi." }, { status: 400 });
    }

    const profitSharing = await db.profitSharing.findUnique({
      where: { id },
      include: {
        investment: { include: { investorProfile: { include: { user: { include: { wallet: true } } } } } },
      },
    });
    if (!profitSharing) return NextResponse.json({ error: "Bagi hasil tidak ditemukan." }, { status: 404 });
    if (profitSharing.investment.investorProfileId !== investorProfileId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (profitSharing.status !== "PENDING") {
      return NextResponse.json({ error: "Bagi hasil ini sudah diproses." }, { status: 400 });
    }

    const wallet = profitSharing.investment.investorProfile.user.wallet;
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    const balance = Number(wallet.balance);
    const amount = Number(profitSharing.investorShare);

    let result;
    try {
      result = await initiateOutboundPayment({
        walletId: wallet.id,
        amount,
        type: TransactionType.PROFIT_SHARING,
        description: `Bagi Hasil – periode ${profitSharing.periodStart.toISOString().slice(0, 10)}`,
        destination: { bankCode, accountNumber, accountName },
        invoicePrefix: "PS",
        relatedEntityId: profitSharing.id,
        relatedEntityType: "ProfitSharing",
        balanceBefore: balance,
        balanceAfter: balance,
      });
    } catch (dokuErr) {
      console.error("[DOKU profit-sharing claim]", dokuErr);
      return NextResponse.json({ error: "Gateway pencairan DOKU belum dikonfigurasi." }, { status: 502 });
    }

    if (!result.success && result.status === "FAILED") {
      return NextResponse.json({ error: result.error ?? "Klaim bagi hasil gagal." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      invoiceNumber: result.invoiceNumber,
      status: result.status,
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

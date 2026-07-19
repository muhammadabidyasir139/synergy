import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireInvestorProfileId } from "@/lib/auth-guard";
import { refreshDepositStatus } from "@/lib/doku/payments";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const guard = await requireInvestorProfileId();
    if (guard.error) return guard.error;
    const investorProfileId = guard.id;

    const { transactionId } = await params;

    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: { wallet: { include: { user: { include: { investorProfile: true } } } } },
    });
    if (!transaction || transaction.wallet.user.investorProfile?.id !== investorProfileId) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    const result = await refreshDepositStatus(transactionId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[DOKU deposit check-status]", err);
    return NextResponse.json({ error: "Gagal memeriksa status pembayaran." }, { status: 502 });
  }
}

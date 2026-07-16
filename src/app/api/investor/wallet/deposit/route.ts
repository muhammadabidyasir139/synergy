import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireInvestorProfileId } from "@/lib/auth-guard";
import { initiateInboundPayment } from "@/lib/doku/payments";
import { CreateCheckoutPaymentInput } from "@/lib/doku/client";

const VA_CHANNELS: Record<string, CreateCheckoutPaymentInput["channel"]> = {
  BCA: "VIRTUAL_ACCOUNT_BCA",
  MANDIRI: "VIRTUAL_ACCOUNT_MANDIRI",
  BNI: "VIRTUAL_ACCOUNT_BNI",
  BRI: "VIRTUAL_ACCOUNT_BRI",
};

export async function POST(request: NextRequest) {
  try {
    const guard = await requireInvestorProfileId();
    if (guard.error) return guard.error;
    const investorProfileId = guard.id;

    const { amount, paymentMethod } = await request.json();
    if (!amount || amount < 10000) {
      return NextResponse.json({ error: "Minimal deposit Rp 10.000." }, { status: 400 });
    }

    const channel = VA_CHANNELS[paymentMethod];
    if (!channel) {
      return NextResponse.json({ error: "Metode pembayaran tidak didukung." }, { status: 400 });
    }

    const profile = await db.investorProfile.findUnique({
      where: { id: investorProfileId },
      include: { user: { include: { wallet: true } } },
    });
    if (!profile?.user.wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    const wallet = profile.user.wallet;

    let result;
    try {
      result = await initiateInboundPayment({
        walletId: wallet.id,
        amount,
        description: `Deposit via Virtual Account ${paymentMethod}`,
        customer: { name: profile.fullName, email: profile.user.email ?? undefined },
        channel,
        invoicePrefix: "DEP",
      });
    } catch (dokuErr) {
      console.error("[DOKU deposit]", dokuErr);
      return NextResponse.json({ error: "Gateway pembayaran DOKU belum dikonfigurasi." }, { status: 502 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Gagal membuat tagihan pembayaran." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      invoiceNumber: result.invoiceNumber,
      paymentUrl: result.paymentUrl,
      virtualAccountNumber: result.virtualAccountNumber,
      expiredAt: result.expiredAt,
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

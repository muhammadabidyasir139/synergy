import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TransactionType } from "@/generated/prisma";
import { requireUmkmProfileId } from "@/lib/auth-guard";
import { initiateOutboundPayment } from "@/lib/doku/payments";
import { isDokuConfigured } from "@/lib/doku/config";

export async function POST(request: NextRequest) {
  try {
    const guard = await requireUmkmProfileId();
    if (guard.error) return guard.error;
    const umkmProfileId = guard.id;

    const { amount, bankCode, accountNumber, accountName } = await request.json();
    if (!amount || amount < 100000) {
      return NextResponse.json({ error: "Minimal penarikan Rp 100.000." }, { status: 400 });
    }
    if (!bankCode || !accountNumber || !accountName) {
      return NextResponse.json({ error: "Detail rekening tujuan wajib diisi." }, { status: 400 });
    }

    const profile = await db.umkmProfile.findUnique({
      where: { id: umkmProfileId },
      include: { user: { include: { wallet: true } } },
    });
    if (!profile?.user.wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    const wallet = profile.user.wallet;

    const available = Number(wallet.balance) - Number(wallet.lockedBalance);
    if (available < amount) {
      return NextResponse.json({ error: "Saldo tersedia tidak mencukupi." }, { status: 400 });
    }

    const balanceBefore = Number(wallet.balance);
    const balanceAfter = balanceBefore - amount;
    await db.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: amount } } });

    // Kalau kredensial DOKU asli belum diisi → selesaikan sebagai transfer tersimulasi
    // (saldo tetap terpotong, tercatat COMPLETED). Begitu DOKU dikonfigurasi, otomatis
    // pakai transfer beneran ke bank.
    if (!isDokuConfigured()) {
      const txn = await db.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.WITHDRAWAL,
          amount,
          balanceBefore,
          balanceAfter,
          status: "COMPLETED",
          description: `Penarikan ke ${bankCode} ${accountNumber} (${accountName})`,
          processedAt: new Date(),
        },
      });
      return NextResponse.json({
        success: true,
        transactionId: txn.id,
        status: "COMPLETED",
        simulated: true,
        newBalance: balanceAfter,
      }, { status: 201 });
    }

    let result;
    try {
      result = await initiateOutboundPayment({
        walletId: wallet.id,
        amount,
        type: TransactionType.WITHDRAWAL,
        description: `Penarikan ke ${bankCode} ${accountNumber}`,
        destination: { bankCode, accountNumber, accountName },
        invoicePrefix: "WD",
        balanceBefore,
        balanceAfter,
      });
    } catch (dokuErr) {
      console.error("[DOKU umkm withdraw]", dokuErr);
      await db.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount } } });
      return NextResponse.json({ error: "Gagal menghubungi gateway pencairan DOKU." }, { status: 502 });
    }

    if (!result.success && result.status === "FAILED") {
      // Transfer gagal → kembalikan saldo (fix: sebelumnya saldo terpotong tanpa refund).
      await db.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount } } });
      return NextResponse.json({
        error: result.error ?? "Pencairan dana gagal.",
        newBalance: balanceBefore,
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      invoiceNumber: result.invoiceNumber,
      status: result.status,
      newBalance: balanceAfter,
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

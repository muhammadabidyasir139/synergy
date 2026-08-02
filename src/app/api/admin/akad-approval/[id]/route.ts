import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { TransactionType } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth-guard";
import { initiateOutboundPayment } from "@/lib/doku/payments";
import { signAkadAndSync } from "@/lib/akad-signing";
import { updateAkadStatusOnChain } from "@/lib/fabric-gateway";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession();
  if (guard.error) return guard.error;

  const { id } = await params;
  const body = await req.json();
  const { action, bankDetails } = body as {
    action: "approve" | "reject";
    bankDetails?: { bankCode: string; accountNumber: string; accountName: string };
  };

  const newStatus = action === "approve" ? "ACTIVE" : "CANCELLED";

  // Record the decision on-chain before touching the database or moving money.
  // The ledger only activates an akad once investor + umkm + admin have all
  // signed, so a failure here means we must not disburse.
  if (action === "approve") {
    const signed = await signAkadAndSync(id, "admin", guard.id);
    if (!signed.ok) {
      return NextResponse.json(
        { error: "Gagal mencatat persetujuan ke blockchain.", detail: signed.error },
        { status: 502 }
      );
    }
    if (signed.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "Persetujuan admin tercatat, tetapi akad belum aktif di blockchain — tanda tangan UMKM atau investor masih kurang. Pencairan dana dibatalkan.",
          blockchainStatus: signed.blockchainStatus,
        },
        { status: 409 }
      );
    }
  } else {
    const cancelled = await updateAkadStatusOnChain(id, "CANCELLED", guard.id);
    if (!cancelled.ok) {
      return NextResponse.json(
        { error: "Gagal mencatat pembatalan ke blockchain.", detail: cancelled.error },
        { status: 502 }
      );
    }
  }

  const updated = await db.akad.update({
    where: { id },
    data: {
      status: newStatus,
      approvedAt: action === "approve" ? new Date() : undefined,
      startDate: action === "approve" ? new Date() : undefined,
    },
  });

  if (action === "approve") {
    await db.campaign.update({
      where: { id: updated.campaignId },
      data: { status: "COMPLETED" },
    });
  }

  await db.auditLog.create({
    data: {
      action: action === "approve" ? "AKAD_APPROVED" : "AKAD_REJECTED",
      entityType: "Akad",
      entityId: id,
      newData: { status: newStatus },
    },
  });

  // Dana akad masuk ke SALDO WALLET UMKM (bisa ditarik lewat menu Withdraw).
  // Idempotent: cuma kredit sekali per akad.
  if (action === "approve") {
    const cmp = await db.campaign.findUnique({
      where: { id: updated.campaignId },
      include: { umkmProfile: { include: { user: { include: { wallet: true } } } } },
    });
    const w = cmp?.umkmProfile.user.wallet;
    if (w) {
      const already = await db.transaction.findFirst({
        where: { walletId: w.id, relatedEntityId: updated.id, type: TransactionType.DISBURSEMENT, status: "COMPLETED" },
      });
      if (!already) {
        const before = Number(w.balance);
        const amount = Number(updated.principalAmount);
        const after = before + amount;
        await db.$transaction([
          db.wallet.update({ where: { id: w.id }, data: { balance: after } }),
          db.transaction.create({
            data: {
              walletId: w.id,
              type: TransactionType.DISBURSEMENT,
              amount,
              balanceBefore: before,
              balanceAfter: after,
              status: "COMPLETED",
              description: `Dana akad masuk – ${cmp?.umkmProfile.businessName ?? ""}`,
              relatedEntityId: updated.id,
              relatedEntityType: "Akad",
              processedAt: new Date(),
            },
          }),
        ]);
      }
    }
  }

  let disbursement = null;
  if (action === "approve") {
    if (!bankDetails?.bankCode || !bankDetails?.accountNumber || !bankDetails?.accountName) {
      return NextResponse.json({
        success: true,
        status: newStatus,
        disbursementError: "Akad disetujui, tetapi detail rekening UMKM tidak diberikan — pencairan dana belum dilakukan.",
      });
    }

    const campaign = await db.campaign.findUnique({
      where: { id: updated.campaignId },
      include: { umkmProfile: { include: { user: { include: { wallet: true } } } } },
    });
    const umkmWallet = campaign?.umkmProfile.user.wallet;

    if (umkmWallet) {
      const balance = Number(umkmWallet.balance);
      try {
        disbursement = await initiateOutboundPayment({
          walletId: umkmWallet.id,
          amount: Number(updated.principalAmount),
          type: TransactionType.DISBURSEMENT,
          description: `Pencairan Dana Kampanye – ${campaign?.umkmProfile.businessName ?? ""}`,
          destination: bankDetails,
          invoicePrefix: "DSB",
          relatedEntityId: updated.id,
          relatedEntityType: "Akad",
          balanceBefore: balance,
          balanceAfter: balance,
        });
      } catch (dokuErr) {
        console.error("[DOKU umkm disbursement]", dokuErr);
        return NextResponse.json({
          success: true,
          status: newStatus,
          disbursementError: "Akad disetujui, tetapi gateway pencairan DOKU belum dikonfigurasi.",
        });
      }
    }
  }

  return NextResponse.json({ success: true, status: newStatus, disbursement });
}

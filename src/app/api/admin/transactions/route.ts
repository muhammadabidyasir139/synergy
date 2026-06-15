import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const transactions = await db.transaction.findMany({
    where: status && status !== "All" ? { status: status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "FLAGGED" | "BLOCKED" } : undefined,
    include: {
      wallet: {
        include: {
          user: {
            select: {
              email: true,
              phoneNumber: true,
              role: true,
              umkmProfile: { select: { businessName: true } },
              investorProfile: { select: { fullName: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const mapped = transactions.map((tx) => {
    const user = tx.wallet.user;
    const userName =
      user.role === "UMKM"
        ? user.umkmProfile?.businessName
        : user.investorProfile?.fullName ?? user.email ?? user.phoneNumber;

    return {
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      balanceBefore: Number(tx.balanceBefore),
      balanceAfter: Number(tx.balanceAfter),
      status: tx.status,
      isFlagged: tx.isFlagged,
      flagReason: tx.flagReason,
      description: tx.description,
      reference: tx.reference,
      userName,
      userRole: user.role,
      createdAt: tx.createdAt,
      processedAt: tx.processedAt,
    };
  });

  return Response.json(mapped);
}

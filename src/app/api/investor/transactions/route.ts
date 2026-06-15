import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");

    const profile = await db.investorProfile.findUnique({
      where: { id: investorProfileId },
      include: { user: { include: { wallet: true } } },
    });
    if (!profile?.user.wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    const transactions = await db.transaction.findMany({
      where: {
        walletId: profile.user.wallet.id,
        type: typeFilter ? (typeFilter as never) : undefined,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      transactions.map((t) => ({
        id: t.id,
        type: t.type,
        description: t.description ?? t.type,
        amount: Number(t.amount),
        status: t.status,
        createdAt: t.createdAt,
        reference: t.reference ?? t.relatedEntityId ?? "",
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

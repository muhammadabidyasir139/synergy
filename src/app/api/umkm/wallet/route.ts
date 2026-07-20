import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUmkmProfileId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const guard = await requireUmkmProfileId();
    if (guard.error) return guard.error;
    const umkmProfileId = guard.id;

    const profile = await db.umkmProfile.findUnique({
      where: { id: umkmProfileId },
      include: {
        user: {
          include: {
            wallet: {
              include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
            },
          },
        },
      },
    });
    if (!profile?.user.wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    const wallet = profile.user.wallet;

    const campaigns = await db.campaign.findMany({
      where: { umkmProfileId },
      select: { id: true },
    });
    const campaignIds = campaigns.map((c) => c.id);

    const [akads, profitSharings] = await Promise.all([
      db.akad.findMany({
        where: { campaignId: { in: campaignIds } },
        orderBy: { createdAt: "desc" },
      }),
      db.profitSharing.findMany({
        where: { akad: { campaignId: { in: campaignIds } } },
        include: { investment: { include: { investorProfile: true } } },
        orderBy: { dueDate: "desc" },
      }),
    ]);

    const disbursedAkads = akads.filter((a) => a.status === "ACTIVE" || a.status === "COMPLETED");
    const paidProfitSharings = profitSharings.filter((p) => p.status === "PAID");
    const completedWithdrawals = wallet.transactions.filter((t) => t.type === "WITHDRAWAL" && t.status === "COMPLETED");

    const danaDiterima = disbursedAkads.reduce((sum, a) => sum + Number(a.principalAmount), 0);
    const bagiHasilDibayar = paidProfitSharings.reduce((sum, p) => sum + Number(p.investorShare), 0);
    const totalWithdraw = completedWithdrawals.reduce((sum, t) => sum + Number(t.amount), 0);

    type HistoryItem = {
      id: string;
      tanggal: string;
      tipe: "Deposit" | "Withdraw" | "Dana Akad" | "Bagi Hasil";
      jumlah: number;
      status: "Selesai" | "Pending";
      ket: string;
      sortDate: Date;
    };

    const history: HistoryItem[] = [];

    for (const a of akads) {
      const date = a.approvedAt ?? a.startDate ?? a.createdAt;
      history.push({
        id: `AKD-${a.id.slice(-6).toUpperCase()}`,
        tanggal: date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        tipe: "Dana Akad",
        jumlah: Number(a.principalAmount),
        status: a.status === "ACTIVE" || a.status === "COMPLETED" ? "Selesai" : "Pending",
        ket: `Dana investasi akad ${a.akadType}`,
        sortDate: date,
      });
    }

    for (const p of profitSharings) {
      const date = p.paidAt ?? p.dueDate;
      history.push({
        id: `BH-${p.id.slice(-6).toUpperCase()}`,
        tanggal: date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        tipe: "Bagi Hasil",
        jumlah: -Number(p.investorShare),
        status: p.status === "PAID" ? "Selesai" : "Pending",
        ket: `Bagi hasil periode ${p.periodStart.toLocaleDateString("id-ID", { month: "short", year: "numeric" })} ke ${p.investment.investorProfile.fullName}`,
        sortDate: date,
      });
    }

    for (const t of wallet.transactions) {
      if (t.type !== "WITHDRAWAL" && t.type !== "DEPOSIT") continue;
      history.push({
        id: `WLT-${t.id.slice(-6).toUpperCase()}`,
        tanggal: t.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        tipe: t.type === "WITHDRAWAL" ? "Withdraw" : "Deposit",
        jumlah: t.type === "WITHDRAWAL" ? -Number(t.amount) : Number(t.amount),
        status: t.status === "COMPLETED" ? "Selesai" : "Pending",
        ket: t.description ?? t.type,
        sortDate: t.createdAt,
      });
    }

    history.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

    return NextResponse.json({
      walletId: wallet.id,
      balance: Number(wallet.balance),
      lockedBalance: Number(wallet.lockedBalance),
      kycStatus: profile.user.kycStatus,
      stats: {
        danaDiterima,
        akadAktif: akads.filter((a) => a.status === "ACTIVE").length,
        bagiHasilDibayar,
        profitSharingLunasCount: paidProfitSharings.length,
        totalWithdraw,
      },
      history: history.slice(0, 15).map((h) => ({
        id: h.id,
        tanggal: h.tanggal,
        tipe: h.tipe,
        jumlah: h.jumlah,
        status: h.status,
        ket: h.ket,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

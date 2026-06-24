import { db } from "@/lib/db";

export async function GET() {
  const totalUmkm = await db.user.count({ where: { role: "UMKM" } });
  const totalInvestor = await db.user.count({ where: { role: "INVESTOR" } });
  const totalTransactions = await db.transaction.count();
  const pendingKyc = await db.user.count({
    where: { kycStatus: "PENDING", role: { in: ["UMKM", "INVESTOR"] } },
  });
  const activeAkads = await db.akad.count({ where: { status: "ACTIVE" } });
  const fraudAlerts = await db.fraudAlert.count({ where: { status: "DETECTED" } });
  const fundingData = await db.campaign.aggregate({
    _sum: { targetAmount: true, collectedAmount: true },
  });

  const recentUsers = await db.user.findMany({
    where: { role: { in: ["UMKM", "INVESTOR"] } },
    include: {
      umkmProfile: { select: { businessName: true } },
      investorProfile: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentFraud = await db.fraudAlert.findMany({
    where: { status: "DETECTED" },
    include: {
      transaction: {
        include: {
          wallet: {
            include: {
              user: {
                select: {
                  role: true,
                  umkmProfile: { select: { businessName: true } },
                  investorProfile: { select: { fullName: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return Response.json({
    totalUmkm,
    totalInvestor,
    totalTransactions,
    pendingKyc,
    activeAkads,
    fraudAlerts,
    totalFundingTarget: Number(fundingData._sum.targetAmount ?? 0),
    totalFundingCollected: Number(fundingData._sum.collectedAmount ?? 0),
    recentUsers: recentUsers.map((u) => ({
      id: u.id,
      name:
        u.role === "UMKM"
          ? u.umkmProfile?.businessName
          : u.investorProfile?.fullName ?? u.email ?? u.phoneNumber,
      role: u.role,
      status: u.status,
      kycStatus: u.kycStatus,
      createdAt: u.createdAt,
    })),
    recentFraud: recentFraud.map((f) => {
      const user = f.transaction?.wallet.user;
      return {
        id: f.id,
        alertType: f.alertType,
        severity: f.severity,
        status: f.status,
        userName:
          user?.role === "UMKM"
            ? user.umkmProfile?.businessName
            : user?.investorProfile?.fullName ?? "Unknown",
        createdAt: f.createdAt,
      };
    }),
  });
}

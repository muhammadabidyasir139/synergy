import { db } from "@/lib/db";

export async function GET() {
  const alerts = await db.fraudAlert.findMany({
    include: {
      transaction: {
        include: {
          wallet: {
            include: {
              user: {
                select: {
                  email: true,
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
    take: 50,
  });

  const mapped = alerts.map((a) => {
    const user = a.transaction?.wallet.user;
    const userName =
      user?.role === "UMKM"
        ? user.umkmProfile?.businessName
        : user?.investorProfile?.fullName ?? user?.email ?? "Unknown";

    return {
      id: a.id,
      alertType: a.alertType,
      severity: a.severity,
      description: a.description,
      status: a.status,
      userName,
      transactionId: a.transactionId,
      reviewedAt: a.reviewedAt,
      actionTaken: a.actionTaken,
      createdAt: a.createdAt,
    };
  });

  return Response.json(mapped);
}

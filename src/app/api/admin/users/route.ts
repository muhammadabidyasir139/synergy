import { db } from "@/lib/db";

export async function GET() {
  const users = await db.user.findMany({
    where: { role: { in: ["UMKM", "INVESTOR"] } },
    include: {
      umkmProfile: { select: { businessName: true } },
      investorProfile: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = users.map((u) => ({
    id: u.id,
    name:
      u.role === "UMKM"
        ? u.umkmProfile?.businessName ?? u.email ?? u.phoneNumber
        : u.investorProfile?.fullName ?? u.email ?? u.phoneNumber,
    role: u.role,
    status: u.status,
    kycStatus: u.kycStatus,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  }));

  return Response.json(mapped);
}

import { db } from "@/lib/db";
import { getSignedMediaUrl } from "@/lib/s3";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "PENDING";

  const users = await db.user.findMany({
    where: {
      kycStatus: status as "PENDING" | "APPROVED" | "REJECTED",
      role: { in: ["UMKM", "INVESTOR"] },
    },
    include: {
      umkmProfile: { select: { businessName: true, ownerName: true } },
      investorProfile: { select: { fullName: true } },
      kycDocuments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = await Promise.all(
    users.map(async (u) => ({
      id: u.id,
      name:
        u.role === "UMKM"
          ? u.umkmProfile?.businessName ?? u.email ?? u.phoneNumber
          : u.investorProfile?.fullName ?? u.email ?? u.phoneNumber,
      role: u.role,
      status: u.status,
      kycStatus: u.kycStatus,
      registrationDate: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      documents: await Promise.all(
        u.kycDocuments.map(async (d) => ({
          id: d.id,
          type: d.documentType,
          url: await getSignedMediaUrl(d.documentUrl),
          status: d.status,
        }))
      ),
    }))
  );

  return Response.json(mapped);
}

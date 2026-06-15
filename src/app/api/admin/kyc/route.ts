import { db } from "@/lib/db";
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

  const mapped = users.map((u) => ({
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
    documents: u.kycDocuments.map((d) => ({
      id: d.id,
      type: d.documentType,
      url: d.documentUrl,
      status: d.status,
    })),
  }));

  return Response.json(mapped);
}

import { db } from "@/lib/db";

export async function GET() {
  const users = await db.user.findMany({
    where: { role: { in: ["ADMIN", "UMKM", "INVESTOR"] } },
    include: {
      umkmProfile: { select: { businessName: true, ownerName: true } },
      investorProfile: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = users.map((u) => ({
    id: u.id,
    email: u.email,
    phoneNumber: u.phoneNumber,
    name:
      u.role === "ADMIN"
        ? "Administrator Synergy"
        : u.role === "UMKM"
        ? u.umkmProfile?.businessName ?? u.umkmProfile?.ownerName ?? u.email ?? u.phoneNumber ?? "UMKM User"
        : u.investorProfile?.fullName ?? u.email ?? u.phoneNumber ?? "Investor User",
    role: u.role,
    status: u.status,
    kycStatus: u.kycStatus,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  }));

  return Response.json(mapped);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phoneNumber, password, role } = body;

    if (!role || !["ADMIN", "INVESTOR", "UMKM"].includes(role)) {
      return Response.json({ error: "Role tidak valid." }, { status: 400 });
    }

    if (!email && !phoneNumber) {
      return Response.json({ error: "Email atau Nomor HP wajib diisi." }, { status: 400 });
    }

    const newUser = await db.user.create({
      data: {
        email: email || null,
        phoneNumber: phoneNumber || null,
        passwordHash: password ? `hashed_${password}` : "hashed_default_pass",
        role: role as "ADMIN" | "INVESTOR" | "UMKM",
        status: "ACTIVE",
        kycStatus: role === "ADMIN" ? "APPROVED" : "APPROVED",
        ...(role === "UMKM"
          ? {
              umkmProfile: {
                create: {
                  businessName: name || "Usaha Baru",
                  ownerName: name || "Pemilik Usaha",
                  businessCategory: "Lainnya",
                },
              },
            }
          : role === "INVESTOR"
          ? {
              investorProfile: {
                create: {
                  fullName: name || "Investor Baru",
                },
              },
            }
          : {}),
      },
    });

    await db.auditLog.create({
      data: {
        action: "ADMIN_CREATE_USER",
        entityType: "User",
        entityId: newUser.id,
        newData: { role, email, phoneNumber, name },
      },
    });

    return Response.json({ success: true, user: newUser }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message || "Gagal membuat pengguna" }, { status: 500 });
  }
}

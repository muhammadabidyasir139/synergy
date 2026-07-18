import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";

const DEFAULT_ADMIN_EMAIL = "admin@synergy.id";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function hashPassword(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const { username, password } = rawBody ? JSON.parse(rawBody) : {};

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(DEFAULT_ADMIN_PASSWORD);

    // Ensure Admin user exists in MariaDB/MySQL
    await db.user.upsert({
      where: { email: DEFAULT_ADMIN_EMAIL },
      update: {
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        kycStatus: "APPROVED",
        isEmailVerified: true,
        isPhoneVerified: true,
        adminProfile: {
          upsert: {
            update: { fullName: "Super Admin" },
            create: {
              fullName: "Super Admin",
              isSuperAdmin: true,
              department: "System",
            },
          },
        },
      },
      create: {
        email: DEFAULT_ADMIN_EMAIL,
        phoneNumber: "08000000000",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        kycStatus: "APPROVED",
        isEmailVerified: true,
        isPhoneVerified: true,
        adminProfile: {
          create: {
            fullName: "Super Admin",
            isSuperAdmin: true,
            department: "System",
          },
        },
        wallet: {
          create: {},
        },
      },
    });

    const user = await db.user.findUnique({
      where: { email: DEFAULT_ADMIN_EMAIL },
      include: {
        adminProfile: true,
      },
    });

    if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Akun admin tidak ditemukan atau tidak aktif." },
        { status: 401 }
      );
    }

    const suppliedHash = hashPassword(password);
    if (user.passwordHash !== suppliedHash) {
      return NextResponse.json(
        { error: "Username atau Password Admin salah!" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: "admin",
        role: user.role,
        fullName: user.adminProfile?.fullName ?? "Super Admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Gagal memvalidasi login admin." },
      { status: 500 }
    );
  }
}

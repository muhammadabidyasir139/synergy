import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";

const DEFAULT_ADMIN_EMAIL = "admin@synergy.id";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const DEFAULT_ADMIN_SECURITY_KEY = process.env.ADMIN_SECURITY_KEY || "999999";

function hashPassword(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const { username, password, securityKey } = rawBody ? JSON.parse(rawBody) : {};

    if (!username || !password || !securityKey) {
      return NextResponse.json(
        { error: "Username, password, dan security key wajib diisi." },
        { status: 400 }
      );
    }

    if (securityKey !== DEFAULT_ADMIN_SECURITY_KEY) {
      return NextResponse.json(
        { error: "Security Key (MFA) salah! Hubungi Super Admin." },
        { status: 401 }
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
            fullName: "Super Admin Taufan",
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

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "synergy2026!";
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

    const adminUsername = (username || DEFAULT_ADMIN_USERNAME).trim().toLowerCase();
    const passwordHash = hashPassword(DEFAULT_ADMIN_PASSWORD);

    await prisma.user.upsert({
      where: { username: adminUsername },
      update: {
        fullName: "Super Admin",
        email: `${adminUsername}@synergy.local`,
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
      create: {
        username: adminUsername,
        fullName: "Super Admin",
        email: `${adminUsername}@synergy.local`,
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { username: adminUsername },
    });

    if (!user || user.role !== "ADMIN" || !user.isActive) {
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
        username: user.username,
        role: user.role,
        fullName: user.fullName,
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

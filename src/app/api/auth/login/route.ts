import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/HP dan kata sandi wajib diisi." }, { status: 400 });
    }

    // Accept email or phone number
    const isEmail = identifier.includes("@");
    const user = isEmail
      ? await db.user.findFirst({ 
          where: { email: identifier },
          include: { investorProfile: true, umkmProfile: true }
        })
      : await db.user.findFirst({
          where: { phoneNumber: identifier.replace(/\D/g, "").replace(/^62/, "0") },
          include: { investorProfile: true, umkmProfile: true }
        });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Akun tidak ditemukan atau login via provider." }, { status: 401 });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ error: "Kata sandi salah." }, { status: 401 });
    }

    const token = await createSessionToken({ userId: user.id, role: user.role as "INVESTOR" | "UMKM" | "ADMIN" });

    const sessionData = {
      userId: user.id,
      fullName: user.investorProfile?.fullName || user.umkmProfile?.ownerName || "Pengguna",
      investorProfileId: user.investorProfile?.id,
      umkmProfileId: user.umkmProfile?.id
    };

    const res = NextResponse.json({ success: true, role: user.role, session: sessionData }, { status: 200 });
    const opts = sessionCookieOptions(token);
    res.cookies.set(opts);

    return res;
  } catch (err) {
    console.error("[LOGIN]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

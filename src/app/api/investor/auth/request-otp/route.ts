import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OtpPurpose, Role } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    if (!phone) return NextResponse.json({ error: "Nomor HP wajib diisi." }, { status: 400 });

    const normalised = phone.replace(/\D/g, "").replace(/^62/, "0");

    const user = await db.user.findUnique({ where: { phoneNumber: normalised } });
    if (!user || user.role !== Role.INVESTOR) {
      return NextResponse.json({ error: "Nomor HP tidak terdaftar sebagai investor." }, { status: 404 });
    }

    // Invalidate old unused OTPs
    await db.otpVerification.updateMany({
      where: { userId: user.id, isUsed: false, purpose: OtpPurpose.LOGIN },
      data: { isUsed: true },
    });

    // For demo: always create OTP "123456"
    const otp = process.env.NODE_ENV === "production"
      ? String(Math.floor(100000 + Math.random() * 900000))
      : "123456";

    await db.otpVerification.create({
      data: {
        userId: user.id,
        otp,
        purpose: OtpPurpose.LOGIN,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // In production, send SMS here
    console.log(`OTP for ${normalised}: ${otp}`);

    return NextResponse.json({ success: true, message: "OTP telah dikirim." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
